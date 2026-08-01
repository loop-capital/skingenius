"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProtocolStep } from "@/types/facial-aesthetics";

interface ImprovementCardProps {
  step: ProtocolStep;
  className?: string;
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "skincare":
      return "🧴";
    case "topical":
      return "🧴";
    case "supplement":
      return "💊";
    case "peptide":
      return "🧬";
    case "device":
      return "🔧";
    case "procedure":
      return "🏥";
    case "injectable":
      return "💉";
    case "lifestyle":
      return "🌿";
    default:
      return "✨";
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "skincare":
    case "topical":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "supplement":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "peptide":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "device":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "procedure":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "injectable":
      return "bg-red-50 text-red-700 border-red-200";
    case "lifestyle":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-stone-50 text-stone-700 border-stone-200";
  }
}

function getInvasivenessColor(level: string): string {
  switch (level) {
    case "none":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "minimal":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "moderate":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "significant":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-stone-50 text-stone-700 border-stone-200";
  }
}

function inferInvasiveness(category: string): string {
  switch (category) {
    case "lifestyle":
    case "skincare":
    case "supplement":
    case "topical":
      return "none";
    case "device":
      return "minimal";
    case "peptide":
      return "moderate";
    case "procedure":
    case "injectable":
      return "significant";
    default:
      return "none";
  }
}

function getEvidenceLabel(level: string): { label: string; color: string } {
  switch (level) {
    case "A":
      return { label: "Strong", color: "bg-emerald-100 text-emerald-700" };
    case "B":
      return { label: "Moderate", color: "bg-blue-100 text-blue-700" };
    case "C":
      return { label: "Limited", color: "bg-yellow-100 text-yellow-700" };
    case "D":
      return { label: "Weak", color: "bg-stone-100 text-stone-600" };
    default:
      return { label: "Unknown", color: "bg-stone-100 text-stone-600" };
  }
}

export function ImprovementCard({
  step,
  className,
}: ImprovementCardProps): React.ReactElement {
  const invasiveness = inferInvasiveness(step.category);
  const evidence = getEvidenceLabel(step.evidence_level);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 transition-all hover:shadow-sm",
        className,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-base",
          getCategoryColor(step.category),
        )}
      >
        {getCategoryIcon(step.category)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-stone-800 truncate">
            {step.action}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
              evidence.color,
            )}
          >
            {evidence.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          <span className="capitalize">{step.target_feature}</span>
          <span>·</span>
          <span>{step.timeline}</span>
          {step.cost_estimate && (
            <>
              <span>·</span>
              <span>{step.cost_estimate}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
              getInvasivenessColor(invasiveness),
            )}
          >
            {invasiveness}
          </span>

          {step.projected_improvement > 0 && (
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-600">
              +{step.projected_improvement} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
