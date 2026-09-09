import { NextRequest, NextResponse } from "next/server";
import { createReferral } from "@/lib/getuplook";
import { createServiceClient } from "@/utils/supabase/service";

interface CreateReferralRequest {
  scan_id: string;
  provider_id: string;
  conditions: string[];
  confidence_scores?: Record<string, number>;
  scan_metadata?: Record<string, unknown>;
  recommended_service_ids?: string[];
  match_score?: number;
  notes?: string;
}

// POST /api/v1/referrals/create
export async function POST(req: NextRequest) {
  try {
    // Get user from auth (Supabase cookie)
    const supabase = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateReferralRequest = await req.json();
    const {
      scan_id,
      provider_id,
      conditions,
      confidence_scores = {},
      scan_metadata = {},
      recommended_service_ids = [],
      match_score,
      notes,
    } = body;

    if (!scan_id || !provider_id || !conditions?.length) {
      return NextResponse.json(
        { error: "scan_id, provider_id, and conditions are required" },
        { status: 400 },
      );
    }

    // Create referral in GetUpLook
    const referral = await createReferral({
      scanId: scan_id,
      userId: user.id,
      providerId: provider_id,
      conditions,
      confidenceScores: confidence_scores,
      scanMetadata: scan_metadata,
      recommendedServiceIds: recommended_service_ids,
      matchScore: match_score,
      notes,
    });

    return NextResponse.json({
      success: true,
      referral_id: referral.id,
      status: referral.status,
      message: "Scan shared with provider successfully",
    });
  } catch (error) {
    console.error("Create referral error:", error);
    return NextResponse.json(
      {
        error: "Failed to create referral",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
