"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ReferralRow } from "@/components/provider/ReferralRow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockReferrals, type ReferralStatus } from "@/lib/provider/mock-data";

const FILTERS: { value: ReferralStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
];

export default function ProviderReferralsPage() {
  const [filter, setFilter] = useState<ReferralStatus | "all">("all");
  const [referrals, setReferrals] = useState(mockReferrals);

  const filtered = useMemo(() => {
    if (filter === "all") return referrals;
    return referrals.filter((r) => r.status === filter);
  }, [referrals, filter]);

  const counts = useMemo(() => {
    const total = referrals.length;
    const byStatus = (status: ReferralStatus) => referrals.filter((r) => r.status === status).length;
    return {
      all: total,
      new: byStatus("new"),
      accepted: byStatus("accepted"),
      scheduled: byStatus("scheduled"),
      completed: byStatus("completed"),
    };
  }, [referrals]);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Referrals</h1>
          <p className="text-stone-500 mt-1">Review and manage incoming SKINgenius referrals.</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as ReferralStatus | "all")}>
        <TabsList className="bg-stone-100 p-1 rounded-xl h-auto flex-wrap">
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f.value}
              value={f.value}
              className="rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
            >
              {f.label}
              <span className="ml-1.5 text-xs text-stone-400">{counts[f.value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7E5E4] bg-white p-12 text-center">
          <SlidersHorizontal className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-900 font-medium">No referrals in this filter.</p>
          <p className="text-sm text-stone-500 mt-1">Try selecting a different status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((referral) => (
            <ReferralRow
              key={referral.id}
              referral={referral}
              showActions={referral.status === "new"}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
