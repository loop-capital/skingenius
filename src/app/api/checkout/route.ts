import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getOrigin, getStripePriceId, stripe } from "@/lib/subscription/stripe";
import {
  createSquareCheckout,
  getSquareLocationId,
} from "@/lib/square/checkout";
import {
  calculateDepositAmount,
  calculatePlatformFee,
  calculatePayoutAmount,
  dollarsToCents,
} from "@/lib/square/deposits";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

interface AppointmentCheckoutPayload {
  service_id: string;
  provider_id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  referral_id?: string;
  platform?: "skingenius" | "getuplook";
}

function isValidAppointmentPayload(payload: unknown): payload is AppointmentCheckoutPayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;

  const validString = (value: unknown): value is string => typeof value === "string" && value.length > 0;
  const validUuid = (value: unknown): value is string => validString(value) && UUID_RE.test(value);
  const validOptionalUuid = (value: unknown) =>
    value === undefined || (validString(value) && UUID_RE.test(value));

  return (
    validUuid(p.service_id) &&
    validUuid(p.provider_id) &&
    validUuid(p.user_id) &&
    validString(p.appointment_date) &&
    DATE_RE.test(p.appointment_date) &&
    validString(p.appointment_time) &&
    TIME_RE.test(p.appointment_time) &&
    validOptionalUuid(p.referral_id) &&
    (p.platform === undefined || ["skingenius", "getuplook"].includes(p.platform as string))
  );
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));

  if (isValidAppointmentPayload(payload)) {
    return handleAppointmentCheckout(payload);
  }

  return handleSubscriptionCheckout();
}

async function handleAppointmentCheckout(payload: AppointmentCheckoutPayload) {
  const {
    service_id,
    provider_id,
    user_id,
    appointment_date,
    appointment_time,
    referral_id,
    platform = "skingenius",
  } = payload;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.id !== user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceAdmin = createServiceClient();

  const { data: service, error: serviceError } = await serviceAdmin
    .from("services")
    .select("id, provider_id, name, description, price, duration_minutes")
    .eq("id", service_id)
    .eq("provider_id", provider_id)
    .single();

  if (serviceError || !service) {
    return NextResponse.json(
      { error: "Service not found" },
      { status: 404 }
    );
  }

  const { data: profile, error: profileError } = await serviceAdmin
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", user_id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 }
    );
  }

  const servicePrice = Number(service.price);
  const depositAmount = calculateDepositAmount(servicePrice);
  const platformFee = calculatePlatformFee(servicePrice);
  const payoutAmount = calculatePayoutAmount(depositAmount, platformFee);

  const startDateTime = new Date(`${appointment_date}T${appointment_time}:00`);
  if (Number.isNaN(startDateTime.getTime())) {
    return NextResponse.json(
      { error: "Invalid appointment date or time" },
      { status: 400 }
    );
  }

  const endDateTime = new Date(
    startDateTime.getTime() + (service.duration_minutes ?? 60) * 60_000
  );

  const { data: appointment, error: insertError } = await serviceAdmin
    .from("appointments")
    .insert({
      provider_id,
      user_id,
      user_name: profile.full_name ?? "Unknown",
      service: service.name,
      service_id: service.id,
      service_price: servicePrice,
      deposit_amount: depositAmount,
      deposit_status: "pending_payment",
      platform_fee: platformFee,
      payout_amount: payoutAmount,
      platform,
      referral_id: referral_id ?? null,
      scheduled_start: startDateTime.toISOString(),
      scheduled_end: endDateTime.toISOString(),
      status: "pending_payment",
      notes: `Deposit: $${depositAmount.toFixed(2)} via Square`,
    })
    .select("id")
    .single();

  if (insertError || !appointment) {
    return NextResponse.json(
      { error: "Failed to create appointment", detail: insertError?.message },
      { status: 500 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = `${origin}/book/confirm?appointment_id=${appointment.id}`;

  try {
    const checkout = await createSquareCheckout({
      appointmentId: appointment.id,
      serviceName: service.name,
      serviceDescription: service.description ?? undefined,
      depositAmountCents: dollarsToCents(depositAmount),
      redirectUrl,
      locationId: getSquareLocationId(),
    });

    await serviceAdmin
      .from("appointments")
      .update({ square_checkout_id: checkout.checkoutId })
      .eq("id", appointment.id);

    return NextResponse.json({ url: checkout.url, appointment_id: appointment.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await serviceAdmin
      .from("appointments")
      .update({ deposit_status: "pending", status: "pending" })
      .eq("id", appointment.id);

    return NextResponse.json(
      { error: "Square checkout creation failed", detail: message },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCheckout() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, stripe_customer_id, subscription_tier")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to load profile", detail: profileError.message },
      { status: 500 }
    );
  }

  if (profile.subscription_tier !== "free") {
    return NextResponse.json(
      { error: "Already subscribed" },
      { status: 400 }
    );
  }

  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile.email,
      name: profile.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = getOrigin();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: getStripePriceId(),
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `${origin}/account/subscription?success=true`,
    cancel_url: `${origin}/account/subscription?canceled=true`,
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
