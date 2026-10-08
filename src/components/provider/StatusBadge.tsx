"use client";

import { cn } from "@/lib/utils";

type ReferralStatus = "new" | "accepted" | "scheduled" | "completed" | "declined";
type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "no_show" | "cancelled";

interface StatusBadgeProps {
  status: ReferralStatus | AppointmentStatus | string;
  className?: string;
}

const referralStyles: Record<string, string> = {
  new: "bg-emerald-50 text-emerald-700 border-emerald-100",
  accepted: "bg-blue-50 text-blue-700 border-blue-100",
  scheduled: "bg-amber-50 text-amber-700 border-amber-100",
  completed: "bg-stone-100 text-stone-600 border-stone-200",
  declined: "bg-red-50 text-red-700 border-red-100",
};

const appointmentStyles: Record<string, string> = {
  scheduled: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  no_show: "bg-red-50 text-red-700 border-red-100",
  cancelled: "bg-stone-100 text-stone-500 border-stone-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace("-", "_");
  const style = referralStyles[normalized] || appointmentStyles[normalized] || "bg-stone-100 text-stone-600 border-stone-200";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold", style, className)}>
      {label}
    </span>
  );
}
