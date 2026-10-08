import type { Payout, PayoutSummary } from "./types";

export interface PayoutsApiResponse {
  payouts: Payout[];
  summary: PayoutSummary;
}

export async function fetchPayouts(providerId?: string): Promise<PayoutsApiResponse> {
  const url = new URL("/api/payouts", window.location.origin);
  if (providerId) {
    url.searchParams.set("providerId", providerId);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch payouts: ${response.status}`);
  }

  return response.json();
}

export interface CreatePayoutInput {
  appointmentId: string;
  serviceTotal: number;
  depositAmount: number;
  serviceName: string;
  userName: string;
}

export async function createPayout(input: CreatePayoutInput): Promise<Payout> {
  const response = await fetch("/api/payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Failed to create payout: ${response.status}`);
  }

  const data = await response.json();
  return data.payout;
}
