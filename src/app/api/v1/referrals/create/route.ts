import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";
const GETUPLOOK_KEY = ***

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

    if (!GETUPLOOK_KEY) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const getupDb = createClient(GETUPLOOK_URL, GETUPLOOK_KEY);

    const { data: referral, error: referralError } = await getupDb
      .from("referrals")
      .insert({
        external_scan_id: scan_id,
        external_user_id: user.id,
        provider_id,
        skin_conditions: conditions,
        confidence_scores,
        scan_metadata,
        recommended_service_ids,
        match_score,
        notes,
        status: "sent",
      })
      .select()
      .single();

    if (referralError) {
      return NextResponse.json(
        { error: "Referral insert failed", details: referralError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      referral_id: referral.id,
      status: referral.status,
      message: "Scan shared with provider successfully",
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      { error: "Server error", message: err.message },
      { status: 500 },
    );
  }
}
