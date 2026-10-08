import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
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
