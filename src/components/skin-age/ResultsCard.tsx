"use client";

import { useMemo } from "react";
import { Droplets, Sun, Moon, Utensils, FlaskConical, Heart, ArrowDown, ArrowUp, Minus, ScanLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkinAgeResult } from "@/types/skin-age";

interface ResultsCardProps {
  result: SkinAgeResult;
  onShare: () => void;
  onRetake: () => void;
}

const CATEGORY_ICONS: Record<string, typeof Droplets> = {
  hydration: Droplets,
  sun_protection: Sun,
  sleep: Moon,
  diet: Utensils,
  skincare: FlaskConical,
  lifestyle: Heart,
};

const CATEGORY_LABELS: Record<string, string> = {
  hydration: "Hydration",
  sun_protection: "Sun Protection",
  sleep: "Sleep",
  diet: "Diet",
  skincare: "Skincare",
  lifestyle: "Lifestyle",
};

export default function ResultsCard({ result, onShare, onRetake }: ResultsCardProps) {
  const { estimatedAge, estimatedAgeRange, actualAge, ageGap, factors, skinAgeScore, tips, disclaimer } = result;

  const gapIcon = useMemo(() => {
    if (ageGap < 0) return <ArrowDown className="w-4 h-4 text-emerald-600" />;
    if (ageGap > 0) return <ArrowUp className="w-4 h-4 text-amber-600" />;
    return <Minus className="w-4 h-4 text-stone-400" />;
  }, [ageGap]);

  const gapColor = useMemo(() => {
    if (ageGap < 0) return "text-emerald-600 bg-emerald-50";
    if (ageGap > 0) return "text-amber-700 bg-amber-50";
    return "text-stone-500 bg-stone-100";
  }, [ageGap]);

  const factorEntries = useMemo(
    () =>
      (Object.entries(factors) as [keyof typeof factors, number][]).map(([key, score]) => ({
        key,
        score,
        label:
          key === "wrinkles"
            ? "Wrinkles"
            : key === "texture"
            ? "Texture"
            : key === "pigmentation"
            ? "Pigmentation"
            : key === "pores"
            ? "Pore Size"
            : key === "elasticity"
            ? "Elasticity"
            : "Hydration",
      })),
    [factors]
  );

  // Determine if we should show precise age or range
  // If estimatedAgeRange is present and no pro indication, show range
  const showRange = estimatedAgeRange !== undefined;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Age headline */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
          Your Skin Age
        </p>
        <div className="flex items-baseline justify-center gap-2">
          {showRange ? (
            <span className="text-4xl font-bold text-[var(--color-ink)] tracking-tight">
              {estimatedAgeRange}
            </span>
          ) : (
            <>
              <span className="text-6xl font-bold text-[var(--color-ink)] tracking-tight">
                {estimatedAge}
              </span>
              <span className="text-lg text-[var(--color-ink-muted)]"> years</span>
            </>
          )}
        </div>

        {actualAge !== undefined && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${gapColor}`}>
            {gapIcon}
            {ageGap === 0
              ? `Same as your actual age (${actualAge})`
              : ageGap < 0
              ? `Looks ~${Math.abs(ageGap)} years younger than ${actualAge}`
              : `Looks ~${ageGap} years older than ${actualAge}`}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Directional estimate:</span>{" "}
            {disclaimer}
          </p>
        </div>
      )}

      {/* Funnel CTA: redirect to full scan */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <ScanLine className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-900">Want a detailed analysis?</p>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              Get your full skin condition scan — personalized product recommendations and a tailored routine.
            </p>
          </div>
        </div>
        <a
          href="/scan"
          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          See What's Causing It
        </a>
      </div>

      {/* Overall score */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-hairline)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-ink)]">Skin Health Score</span>
          <span className="text-lg font-bold text-[var(--color-primary)]">{skinAgeScore}/100</span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-1000 ease-out"
            style={{ width: `${skinAgeScore}%` }}
          />
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-hairline)] p-5 space-y-4">
        <p className="text-sm font-semibold text-[var(--color-ink)]">Factor Breakdown</p>
        <div className="space-y-3">
          {factorEntries.map(({ key, score, label }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-ink-secondary)]">{label}</span>
                <span className="font-medium text-[var(--color-ink)]">{score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all duration-1000 ease-out
                    ${score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-500" : "bg-rose-500"}
                  `}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-hairline)] p-5 space-y-4">
        <p className="text-sm font-semibold text-[var(--color-ink)]">Top Recommendations</p>
        <div className="space-y-3">
          {tips.map((tip, idx) => {
            const Icon = CATEGORY_ICONS[tip.category] ?? Heart;
            return (
              <div
                key={`${tip.category}-${tip.title}-${idx}`}
                className="flex gap-3 p-3 rounded-xl bg-[var(--color-surface-muted)]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)]">{tip.title}</p>
                  <p className="text-xs text-[var(--color-ink-secondary)] mt-0.5 leading-relaxed">
                    {tip.description}
                  </p>
                  <span
                    className={`
                      inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded
                      ${
                        tip.priority === "high"
                          ? "bg-rose-100 text-rose-700"
                          : tip.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-stone-100 text-stone-600"
                      }
                    `}
                  >
                    {CATEGORY_LABELS[tip.category] ?? tip.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onShare}
          className="flex-1 h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium"
        >
          Share Results
        </Button>
        <Button
          variant="outline"
          onClick={onRetake}
          className="flex-1 h-12 rounded-xl border-[var(--color-hairline)] text-[var(--color-ink-secondary)]"
        >
          Scan Again
        </Button>
      </div>
    </div>
  );
}
