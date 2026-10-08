import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ provider_id: string }> }) {
  try {
    const { provider_id } = await params;

    if (!provider_id) {
      return NextResponse.json(
        { error: "provider_id is required" },
        { status: 400 }
      );
    }

    const key = process.env.GETUPLOOK_ANON_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "GETUPLOOK_ANON_KEY not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(GETUPLOOK_URL, key);

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("provider_id", provider_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: "Provider referrals fetch failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provider_id,
      referrals: referrals || [],
      total: referrals?.length || 0,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", message: e.message },
      { status: 500 }
    );
  }
}
