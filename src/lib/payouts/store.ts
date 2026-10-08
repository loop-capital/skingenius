import type { Payout, PayoutStatus } from "./types";

// In-memory store for mock payouts. Replace with Supabase/Drizzle later.
const payouts: Payout[] = [];

export function listPayouts(providerId?: string): Payout[] {
  if (!providerId) return [...payouts];
  return payouts.filter((p) => p.providerId === providerId);
}

export function getPayout(id: string): Payout | undefined {
  return payouts.find((p) => p.id === id);
}

export function getPayoutByAppointment(appointmentId: string): Payout | undefined {
  return payouts.find((p) => p.appointmentId === appointmentId);
}

export function addPayout(payout: Payout): void {
  payouts.push(payout);
}

export function updatePayoutStatus(
  id: string,
  status: PayoutStatus,
  updates: Partial<Payout> = {}
): Payout | undefined {
  const idx = payouts.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;

  payouts[idx] = {
    ...payouts[idx],
    status,
    ...updates,
  };

  return payouts[idx];
}

export function clearPayouts(): void {
  payouts.length = 0;
}
