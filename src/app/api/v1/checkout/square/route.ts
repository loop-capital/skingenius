import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getProviderWithServices } from "@/lib/booking/providers";
import {
  createDepositCheckout,
  getSquareConfig,
} from "@/lib/booking/square";

function getOrigin(req: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000"
  );
}

export async function POST(req: NextRequest) {
  try {
    getSquareConfig();
  } catch {
    return NextResponse.json(
      { error: "Square is not configured" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      provider_id,
      service_id,
      slot_start,
      slot_end,
      referral_id,
    } = body;

    if (!provider_id || !service_id || !slot_start || !slot_end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const provider = await getProviderWithServices(provider_id);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found or not bookable" },
        { status: 404 }
      );
    }

    const service = provider.services.find((s) => s.id === service_id);
    if (!service) {
      return NextResponse.json(
        { error: "Service not found for provider" },
        { status: 404 }
      );
    }

    const origin = getOrigin(req);
    const checkout = await createDepositCheckout({
      origin,
      providerId: provider_id,
      providerName: provider.business_name,
      serviceId: service_id,
      serviceName: service.name,
      servicePriceCents: Math.round(service.price * 100),
      slotStart: slot_start,
      slotEnd: slot_end,
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email || undefined,
      referralId: referral_id,
    });

    return NextResponse.json({
      success: true,
      checkout_url: checkout.checkoutUrl,
      order_id: checkout.orderId,
      deposit_amount_cents: checkout.depositAmountCents,
      deposit_percent: 20,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Checkout creation failed", detail: message },
      { status: 500 }
    );
  }
}
