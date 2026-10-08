export type SubscriptionTier = "free" | "pro" | "pro_canceling";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "incomplete"
  | "past_due"
  | "unpaid"
  | "paused"
  | null;

export const TIER_LIMITS = {
  free: {
    maxScansPerMonth: 4,
    showAds: true,
    maxConditions: 5,
    providerReferrals: false,
    label: "Free",
  },
  pro: {
    maxScansPerMonth: Number.POSITIVE_INFINITY,
    showAds: false,
    maxConditions: 25,
    providerReferrals: true,
    label: "Pro",
  },
  pro_canceling: {
    maxScansPerMonth: Number.POSITIVE_INFINITY,
    showAds: false,
    maxConditions: 25,
    providerReferrals: true,
    label: "Pro (canceling at period end)",
  },
} as const;

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
}

export function isPro(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "pro_canceling";
}

export function canRefer(tier: SubscriptionTier): boolean {
  return isPro(tier);
}

export function canShowAds(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].showAds;
}

export function maxConditions(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier].maxConditions;
}

export function maxScansPerMonth(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier].maxScansPerMonth;
}

export function canScan(
  tier: SubscriptionTier,
  scansThisMonth: number
): boolean {
  const limit = maxScansPerMonth(tier);
  if (!Number.isFinite(limit)) return true;
  return scansThisMonth < limit;
}
