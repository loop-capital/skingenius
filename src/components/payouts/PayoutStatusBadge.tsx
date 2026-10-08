"use client";

import { cn } from "@/lib/utils";
import type { PayoutStatus } from "@/lib/payouts/types";

interface PayoutStatusBadgeProps {
  status: PayoutStatus;
}

const statusMap: Record<
  PayoutStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-100",
  },
  processing: {
    label: "Processing",
    classes: "bg-blue-50 text-blue-700 border-blue-100",
  },
  paid: {
    label: "Paid",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  failed: {
    label: "Failed",
    classes: "bg-red-50 text-red-700 border-red-100",
  },
};

export function PayoutStatusBadge({ status }: PayoutStatusBadgeProps) {
  const { label, classes } = statusMap[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        classes
      )}
    >
      {label}
    </span>
  );
}
