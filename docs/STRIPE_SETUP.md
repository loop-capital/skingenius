# Stripe Setup for SKINgenius Pro

## Required environment variables

Add these to `.env.local` (and to your Vercel project environment variables):

```bash
# Stripe secret key — find at https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...

# Stripe Price ID for the $4.99/month Pro plan
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Stripe webhook secret — shown when you create a webhook endpoint
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: your production domain
NEXT_PUBLIC_APP_URL=https://skingenius.example.com
```

## Stripe Price configuration

Create a recurring Price in Stripe Dashboard:

- Product: "SKINgenius Pro"
- Price: $4.99 USD / month
- Free trial: 7 days (set on the Price object)
- Copy the Price ID (`price_...`) into `NEXT_PUBLIC_STRIPE_PRICE_ID`

## Webhook endpoint

Register this endpoint in Stripe Dashboard:

```
https://<your-domain>/api/webhooks/stripe
```

Events to send:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

For local development, use the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Database

Apply the migration in `supabase/migrations/20260915_add_subscription_columns.sql` to add subscription columns to `profiles`.

## Notes

- The webhook handler updates `subscription_tier`, `subscription_status`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, and `trial_end`. The `subscription_current_period_start/end` columns are reserved for future use because the installed Stripe SDK type does not expose those fields directly in this version.
- For local webhook testing, use the Stripe CLI and point it at `localhost:3000/api/webhooks/stripe`.
