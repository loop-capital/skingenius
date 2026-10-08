"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  type SubscriptionTier,
  type SubscriptionStatus,
  type UserSubscription,
  isPro,
  canScan,
  canRefer,
  maxConditions,
} from "@/lib/subscription";

export interface SubscriptionState extends UserSubscription {
  isLoading: boolean;
  error: string | null;
  isPro: boolean;
  canScan: (scansThisMonth: number) => boolean;
  canRefer: boolean;
  maxConditions: number;
}

const DEFAULT: UserSubscription = {
  tier: "free",
  status: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  trialEnd: null,
};

export function useSubscription(): SubscriptionState {
  const supabase = createClient();
  const [subscription, setSubscription] = useState<UserSubscription>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(DEFAULT);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select(
          "subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, stripe_price_id, subscription_current_period_start, subscription_current_period_end, trial_end"
        )
        .eq("id", user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setSubscription(DEFAULT);
      } else if (data) {
        setSubscription({
          tier: (data.subscription_tier as SubscriptionTier) ?? "free",
          status: (data.subscription_status as SubscriptionStatus) ?? null,
          stripeCustomerId: data.stripe_customer_id ?? null,
          stripeSubscriptionId: data.stripe_subscription_id ?? null,
          stripePriceId: data.stripe_price_id ?? null,
          currentPeriodStart:
            data.subscription_current_period_start ?? null,
          currentPeriodEnd: data.subscription_current_period_end ?? null,
          trialEnd: data.trial_end ?? null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubscription(DEFAULT);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...subscription,
    isLoading,
    error,
    isPro: isPro(subscription.tier),
    canScan: (scansThisMonth: number) => canScan(subscription.tier, scansThisMonth),
    canRefer: canRefer(subscription.tier),
    maxConditions: maxConditions(subscription.tier),
  };
}
