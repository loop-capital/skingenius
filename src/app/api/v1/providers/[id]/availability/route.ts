import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  fetchBusyTimes,
  generateAvailableSlots,
  getOrCreateProviderCalendarSettings,
  getValidAccessToken,
} from "@/lib/provider/google-calendar";
import { getProviderWithServices } from "@/lib/booking/providers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;
    const provider = await getProviderWithServices(providerId);

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found or not bookable" },
        { status: 404 }
      );
    }

    const days = Math.min(
      parseInt(req.nextUrl.searchParams.get("days") || "14", 10),
      30
    );
    const serviceId = req.nextUrl.searchParams.get("service_id") || undefined;

    const settings = await getOrCreateProviderCalendarSettings(providerId);

    let appointmentMinutes = settings.default_appointment_minutes;
    if (serviceId && settings.service_durations?.[serviceId]) {
      appointmentMinutes = settings.service_durations[serviceId];
    } else if (provider.services.length > 0) {
      const firstService = provider.services[0];
      appointmentMinutes = firstService.duration_minutes;
    }

    const now = new Date();
    now.setMilliseconds(0);
    const timeMin = now.toISOString();
    const timeMax = new Date(
      now.getTime() + days * 24 * 60 * 60 * 1000
    ).toISOString();

    const serviceClient = createServiceClient();
    const { data: existingAppointments } = await serviceClient
      .from("appointments")
      .select("scheduled_start, scheduled_end")
      .eq("provider_id", providerId)
      .gte("scheduled_start", timeMin)
      .lte("scheduled_start", timeMax)
      .not("status", "in", '("cancelled")');

    let busyTimes: { start: string; end: string }[] = [];
    const accessToken = await getValidAccessToken(providerId);
    if (accessToken) {
      try {
        busyTimes = await fetchBusyTimes(accessToken, "primary", timeMin, timeMax);
      } catch (e) {
        console.error("Google Calendar busy fetch failed", e);
      }
    }

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
      slots,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Availability fetch failed", message: e.message },
      { status: 500 }
    );
  }
}
