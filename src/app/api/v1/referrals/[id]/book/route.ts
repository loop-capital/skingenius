import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      service_id,
      appointment_date,
      appointment_time,
      notes,
      timezone = "America/New_York",
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Referral id is required" },
        { status: 400 }
      );
    }

    if (!service_id || !appointment_date || !appointment_time) {
      return NextResponse.json(
        {
          error:
            "service_id, appointment_date, and appointment_time are required",
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

    const { data: referral, error: refErr } = await supabase
      .from("referrals")
      .select("*")
      .eq("id", id)
      .single();

    if (refErr) {
      return NextResponse.json(
        {
          error: "Referral lookup failed",
          details: refErr.message,
          code: refErr.code,
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

    if (referral.status === "booked") {
      return NextResponse.json(
        { error: "Referral has already been converted to a booking" },
        { status: 409 }
      );
    }

    const { data: appointment, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        referral_id: id,
        provider_id: referral.provider_id,
        external_user_id: referral.external_user_id,
        service_id,
        appointment_date,
        appointment_time,
        timezone,
        notes: notes || `Booked from referral ${id}`,
        status: "scheduled",
      })
      .select()
      .single();

    if (apptErr) {
      return NextResponse.json(
        {
          error: "Appointment creation failed",
          details: apptErr.message,
          code: apptErr.code,
        },
        { status: 500 }
      );
    }

    const { data: updatedReferral, error: updErr } = await supabase
      .from("referrals")
      .update({
        status: "booked",
        booked_appointment_id: appointment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updErr) {
      return NextResponse.json(
        {
          error: "Referral booking update failed",
          details: updErr.message,
          code: updErr.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      referral: updatedReferral,
      appointment,
      message: "Referral converted to booking successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", message: e.message },
      { status: 500 }
    );
  }
}
