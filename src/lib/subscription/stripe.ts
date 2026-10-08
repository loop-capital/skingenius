import Stripe from "stripe";

// Lazy initialization: the Stripe client is only created on first use,
// not at module import time. This prevents build-time failures when
// STRIPE_SECRET_KEY is not set (e.g. Vercel static page data collection).
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_, prop, receiver) {
    const client = getStripeClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function getStripePriceId(): string {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("Missing NEXT_PUBLIC_STRIPE_PRICE_ID environment variable");
  }
  return priceId;
}

export function getOrigin(): string {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!origin) {
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL or VERCEL_URL environment variable"
    );
  }
  return origin;
}
