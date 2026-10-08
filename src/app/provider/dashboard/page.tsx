"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, DollarSign, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/provider/StatCard";
import { ReferralRow } from "@/components/provider/ReferralRow";
import { StatusBadge } from "@/components/provider/StatusBadge";
import {
  mockReferrals,
  mockAppointments,
  formatCurrency,
  formatTime,
} from "@/lib/provider/mock-data";

export default function ProviderDashboardPage() {
  const [referrals, setReferrals] = useState(mockReferrals);

  const today = useMemo(() => new Date(), []);
  const todaysAppointments = useMemo(
    () =>
      mockAppointments.filter((apt) => {
        const d = new Date(apt.scheduledStart);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      }),
    [today]
  );

  const pendingReferrals = useMemo(
    () => referrals.filter((r) => r.status === "new"),
    [referrals]
  );

  const todaysRevenue = useMemo(
    () =>
      todaysAppointments
        .filter((a) => a.status === "completed")
        .reduce((sum, a) => sum + a.price, 0),
    [todaysAppointments]
  );

  const handleAccept = (id: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "accepted" as const } : r))
    );
  };

  const handleDecline = (id: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "declined" as const } : r))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-500 mt-1">
          Today&apos;s overview for PLEIJ Salon + Spa
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Upcoming Today"
          value={String(todaysAppointments.filter((a) => a.status !== "completed").length)}
          icon={Calendar}
          tone="accent"
        />
        <StatCard
          label="Pending Referrals"
          value={String(pendingReferrals.length)}
          icon={Users}
          tone={pendingReferrals.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Revenue Today"
          value={formatCurrency(todaysRevenue)}
          trend={`${todaysAppointments.filter((a) => a.status === "completed").length} completed`}
          icon={DollarSign}
          tone="default"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-[#E7E5E4]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-stone-900">
                Today&apos;s Appointments
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-emerald-700 hover:bg-emerald-50">
                <Link href="/provider/calendar">
                  View calendar
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length === 0 ? (
              <p className="text-sm text-stone-500 py-6 text-center">
                No appointments scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todaysAppointments
                  .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#E7E5E4] flex flex-col items-center justify-center text-stone-700">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{apt.service}</p>
                          <p className="text-xs text-stone-500">
                            {formatTime(apt.scheduledStart)} · {apt.userName}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E7E5E4]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-stone-900">
                Incoming Referrals
                {pendingReferrals.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    {pendingReferrals.length}
                  </span>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-emerald-700 hover:bg-emerald-50">
                <Link href="/provider/referrals">
                  See all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingReferrals.length === 0 ? (
              <p className="text-sm text-stone-500 py-6 text-center">
                No new referrals to review.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingReferrals.slice(0, 3).map((referral) => (
                  <ReferralRow
                    key={referral.id}
                    referral={referral}
                    showActions
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
