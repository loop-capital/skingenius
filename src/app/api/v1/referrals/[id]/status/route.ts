import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";

const VALID_STATUSES = ["sent", "accepted", "declined", "completed", "cancelled", "booked"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, declined_reason } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Referral id is required" },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
        },
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

    const update: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) update.notes = notes;
    if (declined_reason !== undefined) update.declined_reason = declined_reason;

    const { data: referral, error } = await supabase
      .from("referrals")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Referral status update failed",
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
      message: `Referral status updated to ${status}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", message: e.message },
      { status: 500 }
    );
  }
}
