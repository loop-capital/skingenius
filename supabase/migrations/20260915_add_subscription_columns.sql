-- Add Pro tier subscription columns to profiles table
-- Project: cnzoilxsttoqtvwotexd.supabase.co

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'pro_canceling')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT
    CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'incomplete', 'past_due', 'unpaid', 'paused')),
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- Index for webhook lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id);

-- Index for subscription tier queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier
  ON public.profiles(subscription_tier);
