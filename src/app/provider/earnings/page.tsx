"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Clock, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/provider/StatCard";
import { PayoutStatusBadge } from "@/components/payouts/PayoutStatusBadge";
import { fetchPayouts, createPayout } from "@/lib/payouts/client";
import { mockAppointments } from "@/lib/provider/mock-data";
import { formatCurrency } from "@/lib/payouts/calculate";
import type { Payout, PayoutSummary } from "@/lib/payouts/types";
import type { Appointment } from "@/lib/provider/mock-data";

const MOCK_PROVIDER_ID = "prov-1";

export default function ProviderEarningsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const completedAppointments = useMemo(
    () => mockAppointments.filter((a) => a.status === "completed"),
    []
  );

  const pendingAppointments = useMemo(() => {
    const paidAppointmentIds = new Set(payouts.map((p) => p.appointmentId));
    return mockAppointments.filter(
      (a) => a.status === "confirmed" || a.status === "scheduled"
    );
  }, [payouts]);

  async function loadPayouts() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPayouts(MOCK_PROVIDER_ID);
      setPayouts(data.payouts);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load earnings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayouts();
  }, []);

  async function handleCreatePayout(appointment: Appointment) {
    setProcessingIds((prev) => new Set(prev).add(appointment.id));
    try {
      await createPayout({
        appointmentId: appointment.id,
        serviceTotal: appointment.price,
        depositAmount: appointment.deposit,
        serviceName: appointment.service,
        userName: appointment.userName,
      });
      await loadPayouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payout");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(appointment.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Earnings</h1>
        <p className="text-stone-500 mt-1">Payout history, fees, and upcoming earnings</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="This Month"
          value={formatCurrency(summary?.totalEarningsThisMonth || 0)}
          trend="Net provider earnings"
          icon={Wallet}
          tone="accent"
        />
        <StatCard
          label="Platform Fees"
          value={formatCurrency(summary?.totalPlatformFeesThisMonth || 0)}
          trend="15% of service total"
          icon={DollarSign}
          tone="default"
        />
        <StatCard
          label="Pending"
          value={formatCurrency(summary?.totalPendingAmount || 0)}
          trend={`${summary?.pendingPayouts || 0} awaiting payout`}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Paid"
          value={String(summary?.paidPayouts || 0)}
          trend="Completed payouts"
          icon={ArrowDownLeft}
          tone="default"
        />
      </div>

      <Card className="border-[#E7E5E4]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-stone-900">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-stone-500 py-8 text-center">Loading payouts...</p>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-stone-500 py-8 text-center">No payouts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E7E5E4] text-stone-500 text-left">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Service</th>
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium">Service Total</th>
                    <th className="pb-2 font-medium">Fee (15%)</th>
                    <th className="pb-2 font-medium">Net</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {payouts
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    .map((payout) => (
                      <tr key={payout.id} className="text-stone-900">
                        <td className="py-3">
                          {new Date(payout.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3">{payout.serviceName}</td>
                        <td className="py-3 text-stone-600">{payout.userName}</td>
                        <td className="py-3">{formatCurrency(payout.serviceTotal)}</td>
                        <td className="py-3 text-stone-600">{formatCurrency(payout.platformFee)}</td>
                        <td className="py-3 font-medium">{formatCurrency(payout.netAmount)}</td>
                        <td className="py-3">
                          <PayoutStatusBadge status={payout.status} />
                        </td>
                        <td className="py-3 text-stone-500 font-mono text-xs">
                          {payout.transactionId || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#E7E5E4]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-stone-900">Upcoming Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAppointments.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 text-center">No upcoming appointments.</p>
          ) : (
            <div className="space-y-3">
              {pendingAppointments.map((apt) => {
                const fee = apt.price * 0.15;
                const net = apt.deposit - fee;
                const isProcessing = processingIds.has(apt.id);

                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#E7E5E4] flex items-center justify-center text-stone-700">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{apt.service}</p>
                        <p className="text-xs text-stone-500">
                          {apt.userName} · {new Date(apt.scheduledStart).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-stone-900">{formatCurrency(net)}</p>
                        <p className="text-xs text-stone-500">
                          {formatCurrency(apt.deposit)} deposit − {formatCurrency(fee)} fee
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                        onClick={() => handleCreatePayout(apt)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Payout"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#E7E5E4]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-stone-900">Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-600 leading-relaxed">
            SKINgenius charges a 15% platform fee on the full service total. The provider receives
            the client deposit minus that fee. If the deposit is smaller than the fee, the provider
            payout may be negative until the balance is collected.
          </p>
          <div className="mt-4 rounded-xl bg-stone-50 border border-[#E7E5E4]/60 p-4 text-sm">
            <p className="font-medium text-stone-900">Example</p>
            <p className="text-stone-600 mt-1">
              $150 service × 15% = $22.50 fee. $30 deposit − $22.50 fee = $7.50 provider payout.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
