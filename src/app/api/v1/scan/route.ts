/**
 * POST /api/v1/scan
 *
 * Updated endpoint: accepts on-device analysis results directly,
 * skipping server-side image processing. Image field is now optional.
 * Still persists to scan_results table.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  V1ScanRequest,
  V1ScanResponse,
  V1ScanResponseData,
} from "@/types/api";

// ─── Helpers ──────────────────────────────────────────────────

function apiError(
  message: string,
  status: number = 400,
  detail?: string
): NextResponse {
  return NextResponse.json(
    { error: message, ...(detail ? { detail } : {}) } as V1ScanResponse,
    { status }
  );
}

function tryGetUserId(req: NextRequest): string | null {
  const testUser = req.headers.get("x-test-user-id");
  if (testUser) return testUser;

  try {
    const cookie = req.cookies.get("sb-access-token")?.value;
    if (cookie) {
      const payload = JSON.parse(
        Buffer.from(cookie.split(".")[1], "base64").toString("utf8")
      );
      if (payload?.sub) return payload.sub as string;
    }
  } catch {
    // ignore
  }

  return null;
}

// ─── Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let userId = tryGetUserId(req);

  // ── 1. Auth ────────────────────────────────────────────────
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[scan] No authenticated user; using dev dummy UUID.");
      userId = "00000000-0000-0000-0000-000000000000";
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  // ── 2. Parse body ──────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const {
    image,
    capture_method,
    skin_tone,
    analysis_results,
  } = body as Partial<V1ScanRequest & { analysis_results?: V1ScanResponseData }>;

  // ── 3. Handle on-device vs legacy mode ─────────────────────
  let responseData: V1ScanResponseData;

  if (analysis_results) {
    // ── On-device mode: results computed client-side ──────────
    if (!capture_method || !["camera", "gallery"].includes(capture_method)) {
      return apiError("Missing or invalid field: capture_method (camera | gallery)");
    }
    if (
      typeof skin_tone !== "number" ||
      skin_tone < 1 ||
      skin_tone > 6
    ) {
      return apiError("Missing or invalid field: skin_tone (integer 1–6)");
    }

    responseData = {
      ...analysis_results,
      scan_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metadata: {
        ...analysis_results.metadata,
        capture_method,
        skin_tone,
        processed: true,
        model_version: analysis_results.metadata?.model_version ?? "v1-ondevice",
      },
    };
  } else {
    // ── Legacy mode: raw image uploaded, process server-side ─
    // (kept for backwards compatibility / testing)
    if (!image || typeof image !== "string") {
      return apiError(
        "Missing fields. Provide either 'analysis_results' (on-device) or 'image' (legacy)."
      );
    }
    if (!capture_method || !["camera", "gallery"].includes(capture_method)) {
      return apiError("Missing or invalid field: capture_method (camera | gallery)");
    }
    if (
      typeof skin_tone !== "number" ||
      skin_tone < 1 ||
      skin_tone > 6
    ) {
      return apiError("Missing or invalid field: skin_tone (integer 1–6)");
    }

    // Strip EXIF and run quality gate (server-side for legacy)
    const { stripExif } = await import("@/lib/scan/exif");
    const { runQualityGate } = await import("@/lib/scan/qualityGate");
    const { mockClassify } = await import("@/lib/scan/mockClassifier");

    const strippedImage = stripExif(image);
    const gate = runQualityGate(strippedImage);

    if (!gate.passed) {
      return NextResponse.json(
        {
          error: "Image failed quality gate",
          data: {
            scan_id: null,
            timestamp: new Date().toISOString(),
            quality_assessment: gate.details,
            conditions: [],
            skin_zones: [],
            metadata: {
              capture_method,
              skin_tone,
              processed: false,
              model_version: "v1-mock",
            },
          },
        } as V1ScanResponse,
        { status: 422 }
      );
    }

    const { conditions, skinZones } = await mockClassify(strippedImage, skin_tone);

    responseData = {
      scan_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      quality_assessment: gate.details,
      conditions,
      skin_zones: skinZones,
      metadata: {
        capture_method,
        skin_tone,
        processed: true,
        model_version: "v1-mock",
        warnings: gate.warnings,
      },
    };
  }

  // ── 4. Persist to Supabase ─────────────────────────────────
  const supabase = createServiceClient();

  const row = {
    id: responseData.scan_id ?? crypto.randomUUID(),
    user_id: userId,
    photo_id: crypto.randomUUID(),
    capture_method: responseData.metadata.capture_method ?? capture_method,
    skin_tone: responseData.metadata.skin_tone ?? skin_tone,
    quality_assessment: responseData.quality_assessment,
    conditions: responseData.conditions,
    skin_zones: responseData.skin_zones,
    metadata: responseData.metadata,
    created_at: responseData.timestamp,
  };

  const { error: insertError } = await supabase.from("scan_results").insert(row);

  if (insertError) {
    console.error("[scan] Supabase insert error:", insertError);
  }

  // ── 5. Response ────────────────────────────────────────────
  const finalResponse: V1ScanResponseData = {
    ...responseData,
    metadata: {
      ...responseData.metadata,
      storage_failed: insertError ? true : undefined,
      storage_error: insertError ? insertError.message : undefined,
    },
  };

  return NextResponse.json(
    { data: finalResponse } as V1ScanResponse,
    { status: 200 }
  );
}
