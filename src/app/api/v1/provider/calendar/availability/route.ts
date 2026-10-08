import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  createServiceClient,
} from "@/utils/supabase/service";
import {
  fetchBusyTimes,
  generateAvailableSlots,
  getOrCreateProviderCalendarSettings,
  getValidAccessToken,
} from "@/lib/provider/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerId = user.id;
    const days = Math.min(
      parseInt(req.nextUrl.searchParams.get("days") || "14", 10),
      30
    );

    const accessToken = await getValidAccessToken(providerId);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    const settings = await getOrCreateProviderCalendarSettings(providerId);
    const service = req.nextUrl.searchParams.get("service") || undefined;
    const appointmentMinutes =
      (service ? settings.service_durations?.[service] : undefined) ||
      settings.default_appointment_minutes;

    const now = new Date();
    now.setMilliseconds(0);
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const calendarId =
      req.nextUrl.searchParams.get("calendarId") || "primary";

    const busyTimes = await fetchBusyTimes(accessToken, calendarId, timeMin, timeMax);

    const serviceClient = createServiceClient();
    const { data: existingAppointments } = await serviceClient
      .from("appointments")
      .select("scheduled_start, scheduled_end")
      .eq("provider_id", providerId)
      .gte("scheduled_start", timeMin)
      .lte("scheduled_start", timeMax)
      .not("status", "in", '("cancelled")');

    const slots = generateAvailableSlots(
      settings.business_hours,
      busyTimes,
      existingAppointments || [],
      settings.buffer_minutes,
      appointmentMinutes,
      days
    );

    return NextResponse.json({
      success: true,
      provider_id: providerId,
      days,
      appointment_minutes: appointmentMinutes,
      buffer_minutes: settings.buffer_minutes,
      calendar_id: calendarId,
      slots,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Availability fetch failed", message: e.message },
      { status: 500 }
    );
  }
}
