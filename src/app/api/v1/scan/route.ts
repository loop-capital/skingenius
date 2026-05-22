/**
 * POST /api/v1/scan
 *
 * Pipeline:
 *  1. Authenticate user (or warn in dev)
 *  2. Validate JSON body
 *  3. Strip EXIF metadata
 *  4. Quality gate (format, dimensions, face heuristic)
 *  5. Mock vision classification
 *  6. Persist to scan_results (service-role client for RLS bypass)
 *  7. Return spec-matching response
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { stripExif } from "@/lib/scan/exif";
import { runQualityGate } from "@/lib/scan/qualityGate";
import { mockClassify } from "@/lib/scan/mockClassifier";
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
  // In a real app, parse the Supabase auth cookie / JWT.
  // For dev testing we fall back to a deterministic dummy UUID
  // based on a test header so curl still works.
  const testUser = req.headers.get("x-test-user-id");
  if (testUser) return testUser;

  // Attempt to read the sb-access-token cookie and decode it
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

  // ── 2. Parse & Validate ──────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const { image, capture_method, skin_tone } = body as Partial<V1ScanRequest>;

  if (!image || typeof image !== "string") {
    return apiError("Missing or invalid field: image (base64 string required)");
  }
  if (!capture_method || !["camera", "gallery"].includes(capture_method)) {
    return apiError("Missing or invalid field: capture_method (camera | gallery)");
  }
  if (typeof skin_tone !== "number" || skin_tone < 1 || skin_tone > 6) {
    return apiError("Missing or invalid field: skin_tone (integer 1–6)");
  }

  // ── 3. EXIF Strip ──────────────────────────────────────────
  const strippedImage = stripExif(image);

  // ── 4. Quality Gate ──────────────────────────────────────
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

  // ── 5. Mock Vision Classification ─────────────────────────
  const { conditions, skinZones } = await mockClassify(strippedImage, skin_tone);

  // ── 6. Persist to Supabase ─────────────────────────────────
  const supabase = createServiceClient();

  const photoId = crypto.randomUUID();

  // Build the row exactly matching schema-additions.sql scan_results table
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    photo_id: photoId,
    capture_method,
    skin_tone,
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
    created_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("scan_results").insert(row);

  if (insertError) {
    console.error("[scan] Supabase insert error:", insertError);
    // Graceful degradation: return the analysis even if persistence fails
    // (common in dev before schema is applied)
  }

  // ── 7. Response ────────────────────────────────────────────
  const responseData: V1ScanResponseData = {
    scan_id: row.id,
    timestamp: row.created_at,
    quality_assessment: gate.details,
    conditions,
    skin_zones: skinZones,
    metadata: {
      ...row.metadata,
      storage_failed: insertError ? true : undefined,
      storage_error: insertError ? insertError.message : undefined,
    },
  };

  return NextResponse.json(
    { data: responseData } as V1ScanResponse,
    { status: 200 }
  );
}
