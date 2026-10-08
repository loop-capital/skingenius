import { NextRequest, NextResponse } from "next/server";
import { calculatePayout } from "@/lib/payouts/calculate";
import { listPayouts, addPayout, getPayoutByAppointment, updatePayoutStatus } from "@/lib/payouts/store";
import { sendSquarePayout } from "@/lib/payouts/square-mock";
import type { Payout, CreatePayoutRequest } from "@/lib/payouts/types";

// TODO: Replace with real auth once provider auth is wired.
const MOCK_PROVIDER_ID = "prov-1";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET /api/payouts?providerId=...
 *
 * List payouts for the authenticated provider.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const providerId = searchParams.get("providerId") || MOCK_PROVIDER_ID;

  const payouts = listPayouts(providerId);

  const totalEarningsThisMonth = payouts
    .filter((p) => p.status === "paid" && isThisMonth(p.paidAt || p.createdAt))
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalPlatformFeesThisMonth = payouts
    .filter((p) => p.status === "paid" && isThisMonth(p.paidAt || p.createdAt))
    .reduce((sum, p) => sum + p.platformFee, 0);

  const pendingPayouts = payouts.filter((p) => p.status === "pending").length;
  const processingPayouts = payouts.filter((p) => p.status === "processing").length;
  const paidPayouts = payouts.filter((p) => p.status === "paid").length;
  const failedPayouts = payouts.filter((p) => p.status === "failed").length;
  const totalPendingAmount = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.netAmount, 0);

  return jsonResponse({
    payouts,
    summary: {
      totalEarningsThisMonth,
      totalPlatformFeesThisMonth,
      pendingPayouts,
      processingPayouts,
      paidPayouts,
      failedPayouts,
      totalPendingAmount,
    },
  });
}

/**
 * POST /api/payouts
 *
 * Create a payout for a completed appointment.
 */
export async function POST(request: NextRequest) {
  let body: CreatePayoutRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const { appointmentId, serviceTotal, depositAmount, serviceName, userName } = body;

  if (!appointmentId || serviceTotal == null || depositAmount == null || !serviceName || !userName) {
    return errorResponse(
      "appointmentId, serviceTotal, depositAmount, serviceName, and userName are required"
    );
  }

  if (typeof serviceTotal !== "number" || typeof depositAmount !== "number") {
    return errorResponse("serviceTotal and depositAmount must be numbers");
  }

  const existing = getPayoutByAppointment(appointmentId);
  if (existing) {
    return errorResponse("Payout already exists for this appointment", 409);
  }

  let calculation;
  try {
    calculation = calculatePayout(serviceTotal, depositAmount);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Invalid payout calculation");
  }

  const payout: Payout = {
    id: generateId("payout"),
    providerId: MOCK_PROVIDER_ID,
    appointmentId,
    serviceName,
    userName,
    serviceTotal: calculation.serviceTotal,
    depositAmount: calculation.depositAmount,
    platformFee: calculation.platformFee,
    netAmount: calculation.providerReceives,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  addPayout(payout);

  // Transition to processing and mock Square payout.
  updatePayoutStatus(payout.id, "processing", { method: "square_mock" });

  const squareResult = await sendSquarePayout(payout);

  if (squareResult.success) {
    updatePayoutStatus(payout.id, "paid", {
      paidAt: new Date().toISOString(),
      transactionId: squareResult.transactionId,
    });
  } else {
    updatePayoutStatus(payout.id, "failed", {
      failureReason: squareResult.errorMessage || "Mock Square payout failed",
    });
  }

  const finalPayout = getPayoutByAppointment(appointmentId)!;

  return jsonResponse(
    {
      payout: finalPayout,
      calculation,
    },
    201
  );
}

function isThisMonth(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
