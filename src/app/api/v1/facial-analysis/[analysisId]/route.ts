/**
 * GET /api/v1/facial-analysis/[analysisId]
 *
 * Retrieves a stored facial analysis by ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

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

// ─── GET /api/v1/facial-analysis/[analysisId] ───────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> },
): Promise<NextResponse> {
  let userId = tryGetUserId(req);

  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      userId = "00000000-0000-0000-0000-000000000000";
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  const { analysisId } = await params;

  if (!analysisId || typeof analysisId !== "string") {
    return apiError("Missing or invalid analysisId");
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("facial_analyses")
    .select(
      "id,user_id,skin_analysis_id,landmarks,metrics,scores,ethnicity,age_at_scan,gender,model_used,on_device,processing_time_ms,created_at",
    )
    .eq("id", analysisId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") {
      return apiError("Analysis not found", 404);
    }
    console.error("[facial-analysis/get] DB error:", error);
    return apiError("Failed to retrieve analysis", 500, error?.message);
  }

  // Parse JSONB fields back to objects
  const responseData = {
    ...data,
    landmarks:
      typeof data.landmarks === "string"
        ? JSON.parse(data.landmarks)
        : data.landmarks,
    metrics:
      typeof data.metrics === "string"
        ? JSON.parse(data.metrics)
        : data.metrics,
    scores:
      typeof data.scores === "string" ? JSON.parse(data.scores) : data.scores,
  };

  return NextResponse.json({ data: responseData }, { status: 200 });
}
