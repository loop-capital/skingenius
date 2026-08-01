/**
 * POST /api/v1/facial-analysis/analyze
 *
 * Accepts facial landmarks, computes metrics + scores,
 * generates protocol, stores in facial_analyses table.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  computeAllMetrics,
  computeAestheticScores,
  generateProtocol,
} from "@/lib/facial-aesthetics";
import type { Vector3 } from "@/types/facial-aesthetics";
import type { AestheticScores, FacialMetrics } from "@/types/facial-aesthetics";
import type {
  ProtocolPreferences,
  LifestyleScores,
} from "@/types/facial-aesthetics";

// ─── Helpers ────────────────────────────────────────────────

function apiError(
  message: string,
  status: number = 400,
  detail?: string,
): NextResponse {
  return NextResponse.json(
    { error: message, ...(detail ? { detail } : {}) },
    { status },
  );
}

function tryGetUserId(req: NextRequest): string | null {
  const testUser = req.headers.get("x-test-user-id");
  if (testUser) return testUser;

  try {
    const cookie = req.cookies.get("sb-access-token")?.value;
    if (cookie) {
      const payload = JSON.parse(
        Buffer.from(cookie.split(".")[1], "base64").toString("utf8"),
      );
      if (payload?.sub) return payload.sub as string;
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── POST /api/v1/facial-analysis/analyze ───────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let userId = tryGetUserId(req);

  // ── 1. Auth ──────────────────────────────────────────────
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[facial-analysis/analyze] No authenticated user; using dev dummy UUID.",
      );
      userId = "00000000-0000-0000-0000-000000000000";
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  // ── 2. Parse body ────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const {
    landmarks,
    skin_tone,
    ethnicity,
    photo_url,
    skin_analysis_id,
    age,
    gender,
    conditions,
    preferences,
  } = body as {
    landmarks?: Vector3[];
    skin_tone?: number;
    ethnicity?: string;
    photo_url?: string;
    skin_analysis_id?: string;
    age?: number;
    gender?: string;
    conditions?: {
      id: string;
      name: string;
      severity: "mild" | "moderate" | "severe";
    }[];
    preferences?: ProtocolPreferences;
  };

  // ── 3. Validation ────────────────────────────────────────
  if (!Array.isArray(landmarks) || landmarks.length < 3) {
    return apiError(
      "Missing or invalid field: landmarks (must be array of Vector3 with at least 3 points)",
    );
  }
  if (
    typeof skin_tone !== "number" ||
    !Number.isFinite(skin_tone) ||
    skin_tone < 1 ||
    skin_tone > 6
  ) {
    return apiError("Missing or invalid field: skin_tone (integer 1–6)");
  }

  // ── 4. Compute metrics & scores ─────────────────────────
  const startTime = performance.now();
  let metrics: FacialMetrics;
  let scores: AestheticScores;
  try {
    metrics = computeAllMetrics(landmarks, {
      textureScore: 50,
      poreScore: 50,
      pigmentationScore: 50,
      vascularityScore: 50,
      oilinessScore: 50,
      elasticityScore: 50,
    });
    scores = computeAestheticScores(metrics, ethnicity, age, gender);
  } catch (err) {
    console.error("[facial-analysis/analyze] Computation error:", err);
    return apiError("Analysis computation failed", 500, String(err));
  }
  const processingTimeMs = Math.round(performance.now() - startTime);

  // ── 5. Store in facial_analyses table ─────────────────────
  const supabase = createServiceClient();

  const insertPayload = {
    user_id: userId,
    skin_analysis_id: skin_analysis_id ?? null,
    landmarks: JSON.stringify(landmarks),
    metrics: JSON.stringify(metrics),
    scores: JSON.stringify(scores),
    ethnicity: ethnicity ?? null,
    age_at_scan: age ?? null,
    gender:
      (gender as "male" | "female" | "non_binary" | "prefer_not_say") ?? null,
    model_used: "gemma-4-vision",
    on_device: true,
    processing_time_ms: processingTimeMs,
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error: insertError } = await supabase
    .from("facial_analyses")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[facial-analysis/analyze] DB insert error:", insertError);
    return apiError("Failed to store analysis", 500, insertError?.message);
  }

  const analysisId = inserted.id;

  // ── 6. Generate protocol (optional, async-friendly) ───────
  const defaultPrefs: ProtocolPreferences = preferences ?? {
    budget: "moderate",
    invasiveness: "non_invasive",
  };

  const defaultLifestyle: LifestyleScores = {
    overall: 50,
    sleep: 50,
    hydration: 50,
    nutrition: 50,
    stress: 50,
    exercise: 50,
  };

  const detectedConditions = conditions ?? [];

  const protocolData = generateProtocol(
    scores,
    metrics,
    detectedConditions.map((c) => ({
      id: c.id,
      name: c.name,
      severity: c.severity,
    })),
    defaultLifestyle,
    defaultPrefs,
  );

  // Store protocol
  const { data: protocolInserted, error: protocolError } = await supabase
    .from("aesthetic_protocols")
    .insert({
      user_id: userId,
      analysis_id: analysisId,
      phases: JSON.stringify(protocolData.phases),
      budget_preference: protocolData.budget_preference,
      invasive_comfort: protocolData.invasive_comfort,
      status: protocolData.status,
      started_at: protocolData.started_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (protocolError) {
    console.error(
      "[facial-analysis/analyze] Protocol insert error:",
      protocolError,
    );
    // Non-fatal: return analysis even if protocol storage fails
  }

  // ── 7. Return full result ────────────────────────────────
  return NextResponse.json(
    {
      analysis_id: analysisId,
      protocol_id: protocolInserted?.id ?? null,
      scores,
      metrics,
      protocol: {
        ...protocolData,
        id: protocolInserted?.id ?? null,
      },
      processing_time_ms: processingTimeMs,
    },
    { status: 201 },
  );
}
