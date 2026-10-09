import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Referral id is required" },
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

    const { data: referral, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Referral lookup failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referral,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", message: e.message },
      { status: 500 }
    );
  }
}
