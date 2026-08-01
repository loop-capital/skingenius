"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { AestheticScores } from "@/types/facial-aesthetics";

interface AestheticScoreCardProps {
  scores: AestheticScores;
  className?: string;
}

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

function getScoreRing(score: number): string {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-blue-500";
  if (score >= 40) return "stroke-yellow-500";
  return "stroke-red-500";
}

function getScoreTrack(): string {
  return "stroke-stone-100";
}

function CircularProgress({
  score,
  size = 120,
  strokeWidth = 8,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}): React.ReactElement {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(clampedScore);
    }, 150);
    return () => clearTimeout(timeout);
  }, [clampedScore]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-label={`${label ?? "Score"}: ${Math.round(score)}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={getScoreTrack()}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn(
              "transition-all duration-1000 ease-out",
              getScoreRing(score),
            )}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              getScoreColor(score),
            )}
          >
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-stone-600">{label}</span>
      )}
    </div>
  );
}

function CategoryBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: string;
}): React.ReactElement {
  const clamped = Math.max(0, Math.min(100, score));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(clamped), 200);
    return () => clearTimeout(timeout);
  }, [clamped]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-stone-600">
          <span className="text-sm">{icon}</span>
          <span className="font-medium">{label}</span>
        </span>
        <span
          className={cn("font-semibold tabular-nums", getScoreColor(clamped))}
        >
          {Math.round(clamped)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getScoreBg(clamped),
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function AestheticScoreCard({
  scores,
  className,
}: AestheticScoreCardProps): React.ReactElement {
  const categories = [
    { label: "Symmetry", score: scores.symmetry, icon: "◈" },
    { label: "Proportions", score: scores.proportions, icon: "⌖" },
    { label: "Feature Harmony", score: scores.feature_balance, icon: "✦" },
    { label: "Skin Quality", score: scores.skin_quality, icon: "◉" },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Overall Score */}
        <div className="flex flex-col items-center gap-1">
          <CircularProgress
            score={scores.overall}
            label="Overall"
            size={140}
            strokeWidth={10}
          />
          <p className="text-sm font-medium text-stone-700">
            {scores.overall >= 80
              ? "Excellent"
              : scores.overall >= 60
                ? "Good"
                : scores.overall >= 40
                  ? "Fair"
                  : "Needs Attention"}
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="flex-1 space-y-3 w-full">
          {categories.map((cat) => (
            <CategoryBar
              key={cat.label}
              label={cat.label}
              score={cat.score}
              icon={cat.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
