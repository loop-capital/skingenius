/**
 * POST /api/v1/facial-analysis/protocol/generate
 *
 * Generates or regenerates a protocol for an existing analysis.
 * Accepts: { analysis_id, budget?, invasiveness_tolerance?, preferences? }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { generateProtocol } from "@/lib/facial-aesthetics";
import type {
  ProtocolPreferences,
  LifestyleScores,
  AestheticScores,
  FacialMetrics,
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

// ─── POST /api/v1/facial-analysis/protocol/generate ─────────

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

  const {
    analysis_id,
    budget,
    invasiveness_tolerance,
    preferences,
    conditions,
    lifestyle_scores,
  } = body as {
    analysis_id?: string;
    budget?: "low" | "medium" | "high";
    invasiveness_tolerance?: number; // 0-3
    preferences?: ProtocolPreferences;
    conditions?: {
      id: string;
      name: string;
      severity: "mild" | "moderate" | "severe";
    }[];
    lifestyle_scores?: LifestyleScores;
  };

  if (!analysis_id || typeof analysis_id !== "string") {
    return apiError("Missing or invalid field: analysis_id");
  }

  // ── Fetch analysis ─────────────────────────────────────────
  const supabase = createServiceClient();

  const { data: analysis, error: analysisError } = await supabase
    .from("facial_analyses")
    .select("id,user_id,metrics,scores")
    .eq("id", analysis_id)
    .eq("user_id", userId)
    .single();

  if (analysisError || !analysis) {
    if (analysisError?.code === "PGRST116") {
      return apiError("Analysis not found", 404);
    }
    console.error("[protocol/generate] DB error:", analysisError);
    return apiError("Failed to retrieve analysis", 500, analysisError?.message);
  }

  // Parse JSONB
  const metrics: FacialMetrics =
    typeof analysis.metrics === "string"
      ? JSON.parse(analysis.metrics)
      : (analysis.metrics as FacialMetrics);
  const scores: AestheticScores =
    typeof analysis.scores === "string"
      ? JSON.parse(analysis.scores)
      : (analysis.scores as AestheticScores);

  // ── Build preferences ────────────────────────────────────
  const budgetMap: Record<
    "low" | "medium" | "high",
    ProtocolPreferences["budget"]
  > = {
    low: "minimal",
    medium: "moderate",
    high: "unlimited",
  };

  const invasivenessMap: Record<number, ProtocolPreferences["invasiveness"]> = {
    0: "topical_only",
    1: "non_invasive",
    2: "minimally_invasive",
    3: "open",
  };

  const prefs: ProtocolPreferences = {
    budget: budgetMap[budget ?? "medium"],
    invasiveness:
      invasivenessMap[invasiveness_tolerance ?? 2] ?? "non_invasive",
    ...(preferences ?? {}),
  };

  const lifestyle: LifestyleScores = lifestyle_scores ?? {
    overall: 50,
    sleep: 50,
    hydration: 50,
    nutrition: 50,
    stress: 50,
    exercise: 50,
  };

  const detectedConditions = conditions ?? [];

  // ── Generate protocol ──────────────────────────────────────
  const protocolData = generateProtocol(
    scores,
    metrics,
    detectedConditions.map((c) => ({
      id: c.id,
      name: c.name,
      severity: c.severity,
    })),
    lifestyle,
    prefs,
  );

  // ── Store protocol ─────────────────────────────────────────
  const { data: protocolInserted, error: protocolError } = await supabase
    .from("aesthetic_protocols")
    .insert({
      user_id: userId,
      analysis_id,
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
    console.error("[protocol/generate] Protocol insert error:", protocolError);
    return apiError("Failed to store protocol", 500, protocolError.message);
  }

  return NextResponse.json(
    {
      protocol_id: protocolInserted.id,
      analysis_id,
      protocol: {
        ...protocolData,
        id: protocolInserted.id,
      },
    },
    { status: 201 },
  );
}
