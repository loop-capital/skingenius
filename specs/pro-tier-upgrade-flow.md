# Spec: Pro Tier Upgrade Flow

## Goal
Build the complete Pro tier upgrade flow for SKINgenius.

## Decisions (autonomous, documented)
- Data model: extend `public.profiles` with subscription columns (matches the request's mention of `subscription_tier in profiles table`).
- Stripe keys: use environment variables (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`) with a setup doc; no live keys provided.
- Trial: 7-day free trial configured on the Stripe Price object itself (standard Stripe pattern). Code passes `trial_period_days` only as fallback if needed.

## Scope
1. Database schema additions for subscription state.
2. Stripe Checkout session creation + webhook to sync subscription state.
3. Paywall modal triggered from free-user actions.
4. `/account/subscription` management page.
5. Tier-gating helpers and scan-limit enforcement.

## Files to create / modify
- `supabase/migrations/20260915_add_subscription_columns.sql`
- `src/lib/subscription/tier.ts` — tier constants + helpers
- `src/lib/subscription/stripe.ts` — Stripe client singleton
- `src/app/api/checkout/route.ts` — POST creates Stripe Checkout session
- `src/app/api/webhooks/stripe/route.ts` — POST handles `checkout.session.completed` and `customer.subscription.deleted/updated`
- `src/components/subscription/ProPaywall.tsx` — modal UI
- `src/hooks/use-subscription.ts` — fetch and expose current tier
- `src/app/account/subscription/page.tsx` — subscription management page
- `src/app/dashboard/page.tsx` — wire paywall into Rescan + locked actions
- `.env.local` — add placeholders (already has Supabase)
- `docs/STRIPE_SETUP.md` — setup instructions

## Tier Limits
| Feature | Free | Pro |
|---------|------|-----|
| Scans/month | 4 | unlimited |
| Ads | yes | no |
| Conditions shown | 5 | 25 |
| Provider referrals | no | yes |

## Success Criteria
- `npm run build` passes.
- Paywall modal renders with feature comparison, price, trial CTA, dismiss.
- Checkout route creates a Stripe session URL.
- Webhook route updates `subscription_tier` in profiles.
- Subscription page displays plan and provides cancel/update payment placeholders.
- Tier helpers can check `isPro`, `canScan`, `canRefer`.
