/**
 * POST /api/v1/scan/aesthetics
 *
 * Links a facial aesthetic analysis to an existing scan.
 * Accepts: { scan_id, landmarks: Vector3[], ethnicity?, age?, gender? }
 * Returns: full aesthetic analysis (computes on-the-fly, then stores).
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  computeAllMetrics,
  computeAestheticScores,
  generateProtocol,
} from "@/lib/facial-aesthetics";
import type {
  Vector3,
  ProtocolPreferences,
  LifestyleScores,
  FacialMetrics,
  AestheticScores,
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

// ─── POST /api/v1/scan/aesthetics ───────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let userId = tryGetUserId(req);

  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      userId = "00000000-0000-0000-0000-000000000000";
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  // ── Parse body ───────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const { scan_id, landmarks, ethnicity, age, gender } = body as {
    scan_id?: string;
    landmarks?: Vector3[];
    ethnicity?: string;
    age?: number;
    gender?: string;
  };

  if (!scan_id || typeof scan_id !== "string") {
    return apiError("Missing or invalid field: scan_id");
  }
  if (!Array.isArray(landmarks) || landmarks.length < 3) {
    return apiError(
      "Missing or invalid field: landmarks (must be array of Vector3 with at least 3 points)",
    );
  }

  // ── Verify scan exists ────────────────────────────────────
  const supabase = createServiceClient();

  const { data: scan, error: scanError } = await supabase
    .from("skin_analyses")
    .select("id")
    .eq("id", scan_id)
    .single();

  if (scanError || !scan) {
    if (scanError?.code === "PGRST116") {
      return apiError("Scan not found", 404);
    }
    console.error("[scan/aesthetics] DB error:", scanError);
    return apiError("Failed to verify scan", 500, scanError?.message);
  }

  // ── Compute analysis ──────────────────────────────────────
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
    console.error("[scan/aesthetics] Computation error:", err);
    return apiError("Analysis computation failed", 500, String(err));
  }
  const processingTimeMs = Math.round(performance.now() - startTime);

  // ── Store facial analysis linked to scan ─────────────────
  const { data: inserted, error: insertError } = await supabase
    .from("facial_analyses")
    .insert({
      user_id: userId,
      skin_analysis_id: scan_id,
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
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[scan/aesthetics] DB insert error:", insertError);
    return apiError("Failed to store analysis", 500, insertError?.message);
  }

  const analysisId = inserted.id;

  // ── Generate default protocol ────────────────────────────
  const defaultPrefs: ProtocolPreferences = {
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

  const protocolData = generateProtocol(
    scores,
    metrics,
    [],
    defaultLifestyle,
    defaultPrefs,
  );

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
    console.error("[scan/aesthetics] Protocol insert error:", protocolError);
  }

  return NextResponse.json(
    {
      analysis_id: analysisId,
      protocol_id: protocolInserted?.id ?? null,
      scan_id,
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
