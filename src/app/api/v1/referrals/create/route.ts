import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";
const GETUPLOOK_KEY = ***

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
        { error: "GETUPLOOK_ANON_KEY not configured" },
        { status: 500 },
      );
    }

    const supabase = createClient(GETUPLOOK_URL, GETUPLOOK_KEY);

    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .insert({
        external_scan_id: scan_id,
        external_user_id: body.user_id || "00000000-0000-0000-0000-000000000000",
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
        {
          error: "Referral insert failed",
          details: referralError.message,
          code: referralError.code,
        },
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
