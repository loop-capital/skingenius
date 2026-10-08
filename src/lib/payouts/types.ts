import type { PayoutCalculation } from "./calculate";

export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export interface Payout {
  id: string;
  providerId: string;
  appointmentId: string;
  serviceName: string;
  userName: string;
  serviceTotal: number;
  depositAmount: number;
  platformFee: number;
  netAmount: number;
  status: PayoutStatus;
  createdAt: string;
  paidAt?: string;
  method?: string;
  transactionId?: string;
  failureReason?: string;
}

export interface PayoutSummary {
  totalEarningsThisMonth: number;
  totalPlatformFeesThisMonth: number;
  pendingPayouts: number;
  processingPayouts: number;
  paidPayouts: number;
  failedPayouts: number;
  totalPendingAmount: number;
}

export interface CreatePayoutRequest {
  appointmentId: string;
  serviceTotal: number;
  depositAmount: number;
  serviceName: string;
  userName: string;
}

export interface CreatePayoutResponse {
  payout: Payout;
  calculation: PayoutCalculation;
}
