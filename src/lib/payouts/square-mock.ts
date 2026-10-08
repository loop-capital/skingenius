import type { Payout } from "./types";

export interface SquareMockPayoutResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

/**
 * Mock Square Payouts API integration.
 *
 * Logs the payout request to the console and returns a mock transaction ID.
 * Replace this with a real Square API call when credentials are available.
 */
export async function sendSquarePayout(payout: Payout): Promise<SquareMockPayoutResult> {
  const payload = {
    payoutId: payout.id,
    providerId: payout.providerId,
    amount: payout.netAmount,
    currency: "USD",
    destination: "provider-linked-bank-account",
    reference: `appointment:${payout.appointmentId}`,
  };

  // Simulate network latency.
  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log("[Square Payout Mock] Would send payout:", JSON.stringify(payload, null, 2));

  return {
    success: true,
    transactionId: `sq-mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}
