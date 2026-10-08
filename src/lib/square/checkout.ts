import { SquareClient, SquareEnvironment } from "square";

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const environment = (process.env.SQUARE_ENVIRONMENT ?? "sandbox") as "sandbox" | "production";

export function getSquareClient(): SquareClient {
  if (!accessToken) {
    throw new Error("SQUARE_ACCESS_TOKEN is not configured");
  }

  return new SquareClient({
    token: accessToken,
    environment: environment === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

export interface CreateSquareCheckoutInput {
  appointmentId: string;
  serviceName: string;
  serviceDescription?: string;
  depositAmountCents: bigint;
  currency?: string;
  redirectUrl: string;
  locationId?: string;
}

export interface CreateSquareCheckoutResult {
  checkoutId: string;
  url: string;
  orderId?: string;
}

export async function createSquareCheckout(
  input: CreateSquareCheckoutInput
): Promise<CreateSquareCheckoutResult> {
  const client = getSquareClient();
  const currency = input.currency ?? "USD";

  const response = await client.checkout.paymentLinks.create({
    idempotencyKey: crypto.randomUUID(),
    order: {
      locationId: input.locationId ?? "MAIN",
      referenceId: input.appointmentId,

      lineItems: [
        {
          name: `${input.serviceName} — Deposit`,

          quantity: "1",
          basePriceMoney: {
            amount: input.depositAmountCents,
            currency: input.currency as "USD",
          },
        },
      ],
    },
    checkoutOptions: {
      redirectUrl: input.redirectUrl,
    },
    description: `Deposit for ${input.serviceName}`,
  });

  const paymentLink = response.paymentLink;
  if (!paymentLink?.id || !paymentLink.url) {
    throw new Error("Square payment link missing id or url");
  }

  return {
    checkoutId: paymentLink.id,
    url: paymentLink.url,
    orderId: paymentLink.orderId ?? undefined,
  };
}

export function getSquareLocationId(): string | undefined {
  return process.env.SQUARE_LOCATION_ID;
}
