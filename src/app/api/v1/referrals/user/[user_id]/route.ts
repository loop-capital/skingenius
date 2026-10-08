import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    const { user_id } = await params;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
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
      .eq("external_user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: "User referrals fetch failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id,
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
