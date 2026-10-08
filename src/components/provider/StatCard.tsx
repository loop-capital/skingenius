"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
  tone?: "default" | "accent" | "warning" | "error";
}

const toneMap = {
  default: "bg-white border-[#E7E5E4] text-stone-900",
  accent: "bg-emerald-50 border-emerald-100 text-emerald-700",
  warning: "bg-amber-50 border-amber-100 text-amber-700",
  error: "bg-red-50 border-red-100 text-red-700",
};

export function StatCard({ label, value, trend, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl border p-5", toneMap[tone])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && <p className="text-xs mt-1 opacity-75">{trend}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tone === "default" ? "bg-stone-100" : "bg-white/60")}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
