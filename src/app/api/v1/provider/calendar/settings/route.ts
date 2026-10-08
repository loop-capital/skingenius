import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getOrCreateProviderCalendarSettings,
  type BusinessHours,
} from "@/lib/provider/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [settingsResult, tokenResult] = await Promise.all([
      getOrCreateProviderCalendarSettings(user.id),
      supabase
        .from("provider_calendar_tokens")
        .select("connected, scope, updated_at")
        .eq("provider_id", user.id)
        .single(),
    ]);

    return NextResponse.json({
      success: true,
      connected: tokenResult.data?.connected || false,
      settings: {
        business_hours: settingsResult.business_hours,
        buffer_minutes: settingsResult.buffer_minutes,
        default_appointment_minutes: settingsResult.default_appointment_minutes,
        service_durations: settingsResult.service_durations,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to load settings", message: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updates: {
      business_hours?: BusinessHours;
      buffer_minutes?: number;
      default_appointment_minutes?: number;
      service_durations?: Record<string, number>;
      updated_at?: string;
    } = {};

    if (body.business_hours) updates.business_hours = body.business_hours;
    if (typeof body.buffer_minutes === "number") {
      updates.buffer_minutes = Math.max(0, Math.min(120, body.buffer_minutes));
    }
    if (typeof body.default_appointment_minutes === "number") {
      updates.default_appointment_minutes = Math.max(
        5,
        body.default_appointment_minutes
      );
    }
    if (body.service_durations) updates.service_durations = body.service_durations;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("provider_calendar_settings")
      .update(updates)
      .eq("provider_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save settings", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to save settings", message: e.message },
      { status: 500 }
    );
  }
}
