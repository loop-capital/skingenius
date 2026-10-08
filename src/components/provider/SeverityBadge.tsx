"use client";

import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "mild" | "moderate" | "severe" | "urgent";
  className?: string;
}

const severityStyles = {
  mild: "bg-emerald-50 text-emerald-700 border-emerald-100",
  moderate: "bg-amber-50 text-amber-700 border-amber-100",
  severe: "bg-red-50 text-red-700 border-red-100",
  urgent: "bg-red-700 text-white border-red-700",
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-semibold",
        severityStyles[severity],
        className
      )}
    >
      {label}
    </span>
  );
}
