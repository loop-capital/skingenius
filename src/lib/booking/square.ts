import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";

export const DEPOSIT_PERCENT = 20;

export interface SquareConfig {
  environment: SquareEnvironment;
  accessToken: string;
  applicationId: string;
}

export function getSquareConfig(): SquareConfig {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const applicationId = process.env.SQUARE_APPLICATION_ID;
  const environment =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  if (!accessToken || !applicationId) {
    throw new Error("Missing Square credentials");
  }

  return { accessToken, applicationId, environment };
}

export function getSquareClient(): SquareClient {
  const { accessToken, environment } = getSquareConfig();
  return new SquareClient({
    token: accessToken,
    environment,
  });
}

export function calculateDeposit(amountCents: number): number {
  return Math.ceil((amountCents * DEPOSIT_PERCENT) / 100);
}

export interface CreateDepositCheckoutInput {
  origin: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  servicePriceCents: number;
  slotStart: string;
  slotEnd: string;
  userId?: string | null;
  userName?: string | null;
  referralId?: string | null;
}

export interface CreateDepositCheckoutResult {
  checkoutUrl: string;
  orderId: string;
  depositAmountCents: number;
}

export async function createDepositCheckout(
  input: CreateDepositCheckoutInput
): Promise<CreateDepositCheckoutResult> {
  const client = getSquareClient();
  const depositAmountCents = calculateDeposit(input.servicePriceCents);
  const idempotencyKey = randomUUID();
  const orderId = randomUUID();

  const successUrl = `${input.origin}/book/confirmation?provider_id=${encodeURIComponent(
    input.providerId
  )}&service_id=${encodeURIComponent(input.serviceId)}&slot_start=${encodeURIComponent(
    input.slotStart
  )}&slot_end=${encodeURIComponent(input.slotEnd)}&order_id=${encodeURIComponent(
    orderId
  )}${input.referralId ? `&referral_id=${encodeURIComponent(input.referralId)}` : ""}`;

  const response = await client.checkout.paymentLinks.create({
    idempotencyKey,
    quickPay: {
      name: `Deposit — ${input.serviceName} with ${input.providerName}`,
      priceMoney: {
        amount: BigInt(depositAmountCents),
        currency: "USD",
      },
      locationId: process.env.SQUARE_LOCATION_ID,
    },
    description: `SKINgenius deposit for ${input.serviceName}`,
    checkoutOptions: {
      redirectUrl: successUrl,
      askForShippingAddress: false,
    },
  });

  if (!response.paymentLink?.url) {
    throw new Error("Square did not return a payment link");
  }

  return {
    checkoutUrl: response.paymentLink.url,
    orderId,
    depositAmountCents,
  };
}

export async function retrieveOrder(orderId: string) {
  const client = getSquareClient();
  const response = await client.orders.get({ orderId });
  return response.order || null;
}
