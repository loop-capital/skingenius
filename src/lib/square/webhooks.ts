import { WebhooksHelper } from "square-legacy";

const signatureKey = process.env.SQUARE_WEBHOOK_SECRET;
const notificationUrl = process.env.SQUARE_WEBHOOK_URL;

export interface SquareWebhookPayload {
  type: string;
  event_id: string;
  created_at: string;
  data: {
    type: string;
    id: string;
    object?: Record<string, unknown>;
  };
}

export function verifySquareWebhook(
  body: string,
  signatureHeader: string | null
): boolean {
  if (!signatureKey || !notificationUrl) {
    throw new Error("Square webhook credentials are not configured");
  }

  if (!signatureHeader) {
    return false;
  }

  return WebhooksHelper.isValidWebhookEventSignature(
    body,
    signatureHeader,
    signatureKey,
    notificationUrl
  );
}

export function parseSquareWebhook(body: string): SquareWebhookPayload {
  try {
    return JSON.parse(body) as SquareWebhookPayload;
  } catch {
    throw new Error("Invalid Square webhook JSON body");
  }
}

export function isPaymentWebhook(payload: SquareWebhookPayload): boolean {
  return payload.type === "payment.created" || payload.type === "payment.updated";
}

export function extractAppointmentIdFromPayment(
  paymentObject: Record<string, unknown> | undefined
): string | null {
  if (!paymentObject) return null;

  const referenceId =
    (paymentObject.referenceId as string) ??
    (paymentObject.orderId as string) ??
    null;

  const note = paymentObject.note as string | undefined;
  if (note) {
    const match = note.match(/Appointment deposit for (.+?)(?:\s*—|$)/);
    if (match?.[1]) return match[1];
  }

  return referenceId;
}
