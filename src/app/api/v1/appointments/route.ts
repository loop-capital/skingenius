import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getProviderWithServices } from "@/lib/booking/providers";
import { retrieveOrder } from "@/lib/booking/square";
import {
  createCalendarEvent,
  getOrCreateProviderCalendarSettings,
  getValidAccessToken,
} from "@/lib/provider/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      provider_id,
      service_id,
      service,
      scheduled_start,
      scheduled_end,
      notes,
      user_name,
      timezone = "America/New_York",
      referral_id,
      platform = "skingenius",
      square_payment_id,
      deposit_amount,
    } = body;

    if (!provider_id || !scheduled_start || !scheduled_end) {
      return NextResponse.json(
        { error: "Missing required fields: provider_id, scheduled_start, scheduled_end" },
        { status: 400 }
      );
    }

    let serviceName = service;
    let serviceId = service_id;

    if (serviceId && !serviceName) {
      const provider = await getProviderWithServices(provider_id);
      const found = provider?.services.find((s) => s.id === serviceId);
      serviceName = found?.name || "";
    }

    if (!serviceName) {
      return NextResponse.json(
        { error: "Missing service name or service_id" },
        { status: 400 }
      );
    }

    // If a Square payment id is provided, verify it was paid before booking.
    if (square_payment_id) {
      try {
        const order = await retrieveOrder(square_payment_id);
        if (!order || !(order.state === "COMPLETED" || order.state === "OPEN")) {
          return NextResponse.json(
            { error: "Deposit payment not verified" },
            { status: 402 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Could not verify deposit payment" },
          { status: 502 }
        );
      }
    }

    const settings = await getOrCreateProviderCalendarSettings(provider_id);
    const durationMinutes =
      settings.service_durations?.[serviceName] ||
      settings.default_appointment_minutes;
    const startDate = new Date(scheduled_start);
    const endDate = new Date(
      scheduled_end || startDate.getTime() + durationMinutes * 60_000
    );

    const displayName = user_name || user?.user_metadata?.full_name || "SKINgenius User";

    const serviceClient = createServiceClient();
    const { data: appointment, error: insertError } = await serviceClient
      .from("appointments")
      .insert({
        provider_id,
        user_id: user?.id || null,
        user_name: displayName,
        service_id: serviceId || null,
        service: serviceName,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        notes: notes || null,
        status: square_payment_id ? "pending" : "confirmed",
        referral_id: referral_id || null,
        platform: platform === "getuplook" ? "getuplook" : "skingenius",
        deposit_amount: deposit_amount || null,
        square_payment_id: square_payment_id || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to book appointment", details: insertError.message },
        { status: 500 }
      );
    }

    const accessToken = await getValidAccessToken(provider_id);
    let googleEventId: string | null = null;

    if (accessToken) {
      try {
        googleEventId = await createCalendarEvent(
          accessToken,
          "primary",
          {
            summary: `SKINgenius Appointment — ${serviceName}`,
            description: [
              `Client: ${displayName}`,
              `Service: ${serviceName}`,
              notes ? `Notes: ${notes}` : "",
              `Platform: ${platform || "skingenius"}`,
              `Booked via SKINgenius`,
            ]
              .filter(Boolean)
              .join("\n"),
            start: { dateTime: startDate.toISOString(), timeZone: timezone },
            end: { dateTime: endDate.toISOString(), timeZone: timezone },
          }
        );

        await serviceClient
          .from("appointments")
          .update({ google_event_id: googleEventId })
          .eq("id", appointment.id);
      } catch (syncErr: any) {
        console.error("Google Calendar sync failed", syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      appointment: {
        ...appointment,
        google_event_id: googleEventId,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Booking failed", message: e.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = req.nextUrl.searchParams.get("id");
    const serviceClient = createServiceClient();

    if (appointmentId) {
      const { data: appointment, error } = await serviceClient
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .or(`user_id.eq.${user.id},provider_id.eq.${user.id}`)
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed to load appointment", detail: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, appointment });
    }

    const { data: appointments, error } = await serviceClient
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_start", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to load appointments", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, appointments: appointments || [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Appointments fetch failed", message: e.message },
      { status: 500 }
    );
  }
}
