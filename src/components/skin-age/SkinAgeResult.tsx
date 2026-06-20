"use client";

import { useMemo, useState } from "react";
import { Droplets, Sun, Moon, Utensils, FlaskConical, Heart, ArrowDown, ArrowUp, Minus, ScanLine, Sparkles, ChevronRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "./AnimatedCounter";
import type { SkinAgeResult as SkinAgeResultType } from "@/types/skin-age";

interface ResultsCardProps {
  result: SkinAgeResultType;
  actualAge?: number;
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

export default function SkinAgeResult({ result, onShare, onRetake }: ResultsCardProps) {
  const { estimatedAge, estimatedAgeRange, actualAge, ageGap, factors, skinAgeScore, tips, disclaimer } = result;
  const [showFactors, setShowFactors] = useState(false);

  const gapIcon = useMemo(() => {
    if (ageGap < 0) return <ArrowDown className="w-4 h-4 text-emerald-600" />;
    if (ageGap > 0) return <ArrowUp className="w-4 h-4 text-amber-600" />;
    return <Minus className="w-4 h-4 text-stone-400" />;
  }, [ageGap]);

  const gapColor = useMemo(() => {
    if (ageGap < 0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (ageGap > 0) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-stone-500 bg-stone-100 border-stone-200";
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
  const showRange = estimatedAgeRange !== undefined;

  // Calculate improvement potential (5 years younger if positive gap, or default 3)
  const improvementPotential = ageGap > 0 ? Math.max(3, ageGap - 2) : 3;
  const targetAge = Math.max(18, estimatedAge - improvementPotential);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Age headline with animated counter */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">
          Your Skin Age
        </p>
        <div className="flex items-baseline justify-center gap-2">
          {showRange ? (
            <span className="text-4xl font-bold text-stone-900 tracking-tight">
              {estimatedAgeRange}
            </span>
          ) : (
            <>
              <AnimatedCounter
                value={estimatedAge}
                duration={1200}
                className="text-6xl font-bold text-stone-900 tracking-tight"
              />
              <span className="text-lg text-stone-500"> years</span>
            </>
          )}
        </div>

        {/* Age gap badge */}
        {actualAge !== undefined && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${gapColor}`}>
            {gapIcon}
            {ageGap === 0
              ? `Same as your actual age (${actualAge})`
              : ageGap < 0
              ? `Looks ~${Math.abs(ageGap)} years younger than ${actualAge}`
              : `Looks ~${ageGap} years older than ${actualAge}`}
          </div>
        )}

        {/* Improvement potential */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">
              With a personalized routine, your skin could look{" "}
              <span className="font-bold">{targetAge}</span>
            </span>
          </div>
        </div>
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

      {/* Overall score */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-stone-900">Skin Health Score</span>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter value={skinAgeScore} duration={1000} className="text-lg font-bold text-emerald-700" />
            <span className="text-sm text-stone-500">/100</span>
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-1000 ease-out"
            style={{ width: `${skinAgeScore}%` }}
          />
        </div>
      </div>

      {/* Factor breakdown — collapsible */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <button
          onClick={() => setShowFactors(!showFactors)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <span className="text-sm font-semibold text-stone-900">Factor Breakdown</span>
          <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${showFactors ? "rotate-90" : ""}`} />
        </button>
        {showFactors && (
          <div className="px-5 pb-5 space-y-3">
            {factorEntries.map(({ key, score, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{label}</span>
                  <span className="font-medium text-stone-900">{score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
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
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-4">
        <p className="text-sm font-semibold text-stone-900">Top Recommendations</p>
        <div className="space-y-3">
          {tips.map((tip, idx) => {
            const Icon = CATEGORY_ICONS[tip.category] ?? Heart;
            return (
              <div
                key={`${tip.category}-${tip.title}-${idx}`}
                className="flex gap-3 p-3 rounded-xl bg-stone-50"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900">{tip.title}</p>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
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
          See What&apos;s Causing It
        </a>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onShare}
          className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
        >
          Share Results
        </Button>
        <Button
          variant="outline"
          onClick={onRetake}
          className="flex-1 h-12 rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          Scan Again
        </Button>
      </div>
    </div>
  );
}
