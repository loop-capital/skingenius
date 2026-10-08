export interface PayoutCalculation {
  serviceTotal: number;
  depositAmount: number;
  platformFeeRate: number;
  platformFee: number;
  providerReceives: number;
}

const DEFAULT_PLATFORM_FEE_RATE = 0.15;

/**
 * Calculate the provider payout for a completed appointment.
 *
 * Platform fee is 15% of the full service total.
 * Provider receives the deposit minus the platform fee.
 */
export function calculatePayout(
  serviceTotal: number,
  depositAmount: number,
  platformFeeRate: number = DEFAULT_PLATFORM_FEE_RATE
): PayoutCalculation {
  if (serviceTotal < 0) {
    throw new Error("serviceTotal must be non-negative");
  }
  if (depositAmount < 0) {
    throw new Error("depositAmount must be non-negative");
  }
  if (platformFeeRate < 0 || platformFeeRate > 1) {
    throw new Error("platformFeeRate must be between 0 and 1");
  }

  const platformFee = serviceTotal * platformFeeRate;
  const providerReceives = depositAmount - platformFee;

  return {
    serviceTotal,
    depositAmount,
    platformFeeRate,
    platformFee,
    providerReceives,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
