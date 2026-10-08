import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  verifySquareWebhook,
  parseSquareWebhook,
} from "@/lib/square/webhooks";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");

  try {
    const isValid = verifySquareWebhook(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Webhook verification failed", detail: message }, { status: 500 });
  }

  const payload = parseSquareWebhook(body);
  const eventType = payload.type || "";

  // Handle payment webhooks (deposits)
  if (eventType.startsWith("payment.")) {
    return handlePaymentWebhook(payload);
  }

  // Handle order webhooks
  if (eventType.startsWith("order.")) {
    return handleOrderWebhook(payload);
  }

  // Handle customer webhooks
  if (eventType.startsWith("customer.")) {
    return handleCustomerWebhook(payload);
  }

  // Handle inventory webhooks
  if (eventType.startsWith("inventory.count.")) {
    return handleInventoryWebhook(payload);
  }

  // Acknowledge unhandled events
  return NextResponse.json({ received: true, handled: false, eventType });
}

async function handlePaymentWebhook(payload: any) {
  const payment = payload.data?.object?.payment || payload.data?.object;
  if (!payment) {
    return NextResponse.json({ received: true, handled: false });
  }

  const appointmentId = extractAppointmentId(payment);
  if (!appointmentId) {
    return NextResponse.json({ received: true, handled: false, reason: "no appointment reference" });
  }

  const squarePaymentId = payment.id as string | undefined;
  const status = payment.status as string | undefined;

  if (status !== "COMPLETED") {
    return NextResponse.json({ received: true, handled: false, reason: "payment not completed" });
  }

  const serviceAdmin = createServiceClient();

  const { data: appointment, error: fetchError } = await serviceAdmin
    .from("appointments")
    .select("id, deposit_status, service_price, deposit_amount")
    .eq("id", appointmentId)
    .single();

  if (fetchError || !appointment) {
    return NextResponse.json({ received: true, handled: false, reason: "appointment not found" });
  }

  if (appointment.deposit_status === "paid") {
    return NextResponse.json({ received: true, handled: false, reason: "already paid" });
  }

  const { error: updateError } = await serviceAdmin
    .from("appointments")
    .update({
      deposit_status: "paid",
      status: "confirmed",
      square_payment_id: squarePaymentId ?? null,
    })
    .eq("id", appointmentId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update appointment", detail: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, handled: true, appointment_id: appointmentId });
}

async function handleOrderWebhook(payload: any) {
  const order = payload.data?.object?.order || payload.data?.object;
  if (!order) {
    return NextResponse.json({ received: true, handled: false });
  }

  return NextResponse.json({ received: true, handled: true, eventType: "order.updated", orderId: order.id });
}

async function handleCustomerWebhook(payload: any) {
  const customer = payload.data?.object?.customer || payload.data?.object;
  if (!customer) {
    return NextResponse.json({ received: true, handled: false });
  }

  return NextResponse.json({ received: true, handled: true, eventType: "customer.created", customerId: customer.id });
}

async function handleInventoryWebhook(payload: any) {
  const inventory = payload.data?.object?.inventory_count || payload.data?.object;
  if (!inventory) {
    return NextResponse.json({ received: true, handled: false });
  }

  return NextResponse.json({ received: true, handled: true, eventType: "inventory.count.updated" });
}

function extractAppointmentId(payment: Record<string, unknown>): string | null {
  const orderId = payment.orderId as string | undefined;
  const referenceId = payment.referenceId as string | undefined;
  const note = payment.note as string | undefined;

  if (orderId && isUuidLike(orderId)) return orderId;
  if (referenceId && isUuidLike(referenceId)) return referenceId;

  if (note) {
    const match = note.match(/Appointment deposit for (.+?)(?:\s*—|$)/);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
