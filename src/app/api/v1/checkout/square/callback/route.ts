import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getProviderWithServices } from "@/lib/booking/providers";
import { retrieveOrder } from "@/lib/booking/square";
import { createCalendarEvent, getValidAccessToken } from "@/lib/provider/google-calendar";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const orderId = search.get("orderId");
  const providerId = search.get("provider_id");
  const serviceId = search.get("service_id");
  const slotStart = search.get("slot_start");
  const slotEnd = search.get("slot_end");
  const referralId = search.get("referral_id") || null;

  if (!orderId || !providerId || !serviceId || !slotStart || !slotEnd) {
    return NextResponse.json({ error: "Missing callback parameters" }, { status: 400 });
  }

  try {
    const order = await retrieveOrder(orderId);
    const paid = order?.state === "COMPLETED" || order?.state === "OPEN";

    if (!paid) {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const provider = await getProviderWithServices(providerId);
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const service = provider.services.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const displayName = user?.user_metadata?.full_name || user?.email || "SKINgenius Guest";
    const startDate = new Date(slotStart);
    const endDate = new Date(slotEnd);

    const serviceClient = createServiceClient();
    const { data: appointment, error: insertError } = await serviceClient
      .from("appointments")
      .insert({
        provider_id: providerId,
        user_id: user?.id || null,
        user_name: displayName,
        service_id: serviceId,
        service: service.name,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        status: "pending",
        platform: "skingenius",
        referral_id: referralId,
        deposit_amount: service.price * 0.2,
        square_payment_id: orderId,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create appointment", detail: insertError.message },
        { status: 500 }
      );
    }

    const accessToken = await getValidAccessToken(providerId);
    let googleEventId: string | null = null;

    if (accessToken) {
      try {
        googleEventId = await createCalendarEvent(accessToken, "primary", {
          summary: `SKINgenius Appointment — ${service.name}`,
          description: [
            `Client: ${displayName}`,
            `Service: ${service.name}`,
            `Deposit: $${(service.price * 0.2).toFixed(2)}`,
            `Booked via SKINgenius`,
          ].join("\n"),
          start: { dateTime: startDate.toISOString(), timeZone: "America/New_York" },
          end: { dateTime: endDate.toISOString(), timeZone: "America/New_York" },
        });

        await serviceClient
          .from("appointments")
          .update({ google_event_id: googleEventId })
          .eq("id", appointment.id);
      } catch (syncErr: any) {
        console.error("Google Calendar sync failed", syncErr);
      }
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const redirectUrl = `${origin}/book/confirmation?appointment_id=${appointment.id}`;
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Payment verification failed", detail: message },
      { status: 500 }
    );
  }
}
