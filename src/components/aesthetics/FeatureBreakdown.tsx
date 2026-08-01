"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FacialMetrics, AestheticScores } from "@/types/facial-aesthetics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeatureBreakdownProps {
  metrics: FacialMetrics;
  scores: AestheticScores;
  className?: string;
}

type FeatureKey = "brow" | "eyes" | "nose" | "lips" | "jaw" | "skin";

const FEATURE_CONFIG: Record<
  FeatureKey,
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    scoreKey: keyof AestheticScores;
  }
> = {
  brow: {
    label: "Brow",
    icon: "✦",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    scoreKey: "brow_score",
  },
  eyes: {
    label: "Eyes",
    icon: "◉",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    scoreKey: "eye_score",
  },
  nose: {
    label: "Nose",
    icon: "△",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    scoreKey: "nose_score",
  },
  lips: {
    label: "Lips",
    icon: "⌣",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    scoreKey: "lip_score",
  },
  jaw: {
    label: "Jaw",
    icon: "◊",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    scoreKey: "jaw_score",
  },
  skin: {
    label: "Skin",
    icon: "◎",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    scoreKey: "skin_quality",
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function FeatureCard({
  feature,
  metrics,
  score,
}: {
  feature: FeatureKey;
  metrics: FacialMetrics;
  score: number;
}): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const config = FEATURE_CONFIG[feature];
  const clamped = Math.max(0, Math.min(100, score));

  // Extract raw metrics for this feature
  const rawMetrics = metrics.features[feature];
  const metricEntries = rawMetrics
    ? Object.entries(
        rawMetrics as unknown as Record<string, string | number>,
      ).map(([k, v]) => ({
        key: k,
        value: typeof v === "number" ? v : null,
      }))
    : [];

  const numericEntries = metricEntries.filter(
    (e): e is { key: string; value: number } => typeof e.value === "number",
  );

  // Suggest improvements based on low metrics
  const lowMetrics = numericEntries.filter((e) => e.value < 40).slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200 bg-white transition-all duration-300",
        expanded && "shadow-md",
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg",
              config.bgColor,
              config.color,
            )}
          >
            {config.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800">
              {config.label}
            </p>
            <p className="text-xs text-stone-500">
              {numericEntries.length} metrics measured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                getScoreColor(clamped),
              )}
            >
              {Math.round(clamped)}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100">
              <div
                className={cn("h-full rounded-full", getScoreBg(clamped))}
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-stone-400 transition-transform duration-300">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Individual Metrics */}
          <div className="grid grid-cols-2 gap-2">
            {numericEntries.map((entry) => {
              const normalized =
                entry.value > 1
                  ? Math.max(0, Math.min(100, entry.value))
                  : Math.max(0, Math.min(100, entry.value * 100));
              return (
                <div key={entry.key} className="space-y-1">
                  <p className="text-[11px] font-medium text-stone-500 capitalize">
                    {entry.key.replace(/_/g, " ")}
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        getScoreBg(normalized),
                      )}
                      style={{ width: `${normalized}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 tabular-nums">
                    {entry.value > 1
                      ? entry.value.toFixed(1)
                      : entry.value.toFixed(3)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Improvement Suggestions */}
          {lowMetrics.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-stone-700">
                Top Improvements
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lowMetrics.map((m) => (
                  <Badge
                    key={m.key}
                    variant="outline"
                    className="bg-stone-50 text-[10px] text-stone-600 border-stone-200"
                  >
                    {m.key.replace(/_/g, " ")}: improve to above 60
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FeatureBreakdown({
  metrics,
  scores,
  className,
}: FeatureBreakdownProps): React.ReactElement {
  const features: FeatureKey[] = [
    "brow",
    "eyes",
    "nose",
    "lips",
    "jaw",
    "skin",
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-stone-800">
        Feature Breakdown
      </h3>
      <div className="space-y-2">
        {features.map((feature) => {
          const score = scores[FEATURE_CONFIG[feature].scoreKey];
          return (
            <FeatureCard
              key={feature}
              feature={feature}
              metrics={metrics}
              score={typeof score === "number" ? score : 0}
            />
          );
        })}
      </div>
    </div>
  );
}
