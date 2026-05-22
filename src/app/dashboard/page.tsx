"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  RefreshCw,
  ChevronRight,
  Calendar,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConditionsGrid } from "@/components/scan/ConditionsGrid";
import { SkinZoneMap } from "@/components/scan/SkinZoneMap";
import { RootCauseCard } from "@/components/scan/RootCauseCard";
import { RecommendationCard } from "@/components/scan/RecommendationCard";
import type { V1DetectedCondition, V1SkinZone } from "@/types/api";
import type { RecommendationResult } from "@/lib/recommendations/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
//  Mock data — replace with real scan fetch in production
/* ------------------------------------------------------------------ */

const MOCK_SCAN_DATE = "2025-05-22";
const MOCK_SKIN_SCORE = 68;
const MOCK_FITZPATRICK = 3;

const MOCK_CONDITIONS: V1DetectedCondition[] = [
  {
    condition_id: "acne-vulgaris",
    name: "Acne Vulgaris",
    confidence: 0.92,
    severity: "moderate",
    features: ["papules", "pustules", "comedones"],
    zone: "t-zone",
  },
  {
    condition_id: "post-inflammatory-hyperpigmentation",
    name: "Post-Inflammatory Hyperpigmentation",
    confidence: 0.87,
    severity: "mild",
    features: ["dark spots", "macules"],
    zone: "cheeks",
  },
  {
    condition_id: "seborrheic-dermatitis",
    name: "Seborrheic Dermatitis",
    confidence: 0.74,
    severity: "mild",
    features: ["erythema", "scaling"],
    zone: "forehead",
  },
  {
    condition_id: "periorbital-darkening",
    name: "Periorbital Darkening",
    confidence: 0.81,
    severity: "moderate",
    features: ["hyperpigmentation", "vascular"],
    zone: "under-eye",
  },
];

const MOCK_ZONES: V1SkinZone[] = [
  {
    zone: "forehead",
    primary_concern: "Seborrheic Dermatitis",
    description: "Mild scaling with erythema across the brow and upper forehead.",
    severity: "mild",
    confidence: 0.74,
  },
  {
    zone: "t-zone",
    primary_concern: "Acne Vulgaris",
    description:
      "Moderate comedonal and inflammatory acne concentrated on the nose and medial cheeks.",
    severity: "moderate",
    confidence: 0.92,
  },
  {
    zone: "under-eye",
    primary_concern: "Periorbital Darkening",
    description:
      "Visible melanin and vascular component contributing to dark circles.",
    severity: "moderate",
    confidence: 0.81,
  },
  {
    zone: "cheeks",
    primary_concern: "Post-Inflammatory Hyperpigmentation",
    description:
      "Scattered hyperpigmented macules following prior inflammatory lesions.",
    severity: "mild",
    confidence: 0.87,
  },
  {
    zone: "jawline",
    primary_concern: "None significant",
    description: "No significant findings detected in this zone.",
    severity: "mild",
    confidence: 0.95,
  },
  {
    zone: "chin",
    primary_concern: "None significant",
    description: "Clear skin with minimal textural irregularity.",
    severity: "mild",
    confidence: 0.93,
  },
];

const MOCK_ROOT_CAUSES: {
  category: string;
  score: number;
  description: string;
}[] = [
  {
    category: "Barrier Dysfunction",
    score: 62,
    description:
      "Transepidermal water loss (TEWL) elevated; compromised lipid matrix.",
  },
  {
    category: "Microbiome Imbalance",
    score: 55,
    description:
      "C. acnes overgrowth relative to commensal strains in T-zone.",
  },
  {
    category: "Inflammation",
    score: 48,
    description: "Elevated IL-1α and TNF-α markers detected.",
  },
  {
    category: "UV Damage",
    score: 34,
    description: "Cumulative photo-damage contributing to PIH persistence.",
  },
  {
    category: "Hormonal Influence",
    score: 28,
    description: "Androgen-driven sebaceous activity in lower face.",
  },
];

const MOCK_RECOMMENDATIONS: RecommendationResult[] = [
  {
    product_id: "prod-001",
    name: "Barrier Repair Moisturizer",
    brand: "SKINgenius Labs",
    fit_score: 96,
    evidence_level: "A",
    pregnancy_safe: true,
    reasoning:
      "Ceramide-dominant formula with cholesterol and fatty acids in a 3:1:1 ratio. Directly addresses barrier dysfunction root cause.",
    key_actives: [
      { ingredient: "Ceramide NP", concentration: "2%", effectiveness: 0.94 },
      { ingredient: "Cholesterol", effectiveness: 0.88 },
      { ingredient: "Niacinamide", concentration: "4%", effectiveness: 0.91 },
    ],
    conditions_addressed: [
      "Acne Vulgaris",
      "Seborrheic Dermatitis",
      "Barrier Dysfunction",
    ],
    contraindications: [],
    price_tier: "$$",
    category: "moisturizer",
  },
  {
    product_id: "prod-002",
    name: "Azelaic Acid 15% Gel",
    brand: "SKINgenius Labs",
    fit_score: 91,
    evidence_level: "A",
    pregnancy_safe: true,
    reasoning:
      "Azelaic acid normalizes keratinization, reduces C. acnes, and inhibits tyrosinase for PIH. Safe in pregnancy.",
    key_actives: [
      { ingredient: "Azelaic Acid", concentration: "15%", effectiveness: 0.92 },
    ],
    conditions_addressed: [
      "Acne Vulgaris",
      "Post-Inflammatory Hyperpigmentation",
      "Rosacea",
    ],
    contraindications: [],
    price_tier: "$$",
    category: "treatment",
  },
  {
    product_id: "prod-003",
    name: "Retinol 0.3% Serum",
    brand: "SKINgenius Labs",
    fit_score: 78,
    evidence_level: "A",
    pregnancy_safe: false,
    reasoning:
      "Retinoid accelerates cell turnover, reduces comedones, and fades PIH over 12+ weeks. Not safe during pregnancy.",
    key_actives: [
      { ingredient: "Retinol", concentration: "0.3%", effectiveness: 0.89 },
      { ingredient: "Squalane", effectiveness: 0.72 },
    ],
    conditions_addressed: [
      "Acne Vulgaris",
      "Post-Inflammatory Hyperpigmentation",
      "Photoaging",
    ],
    contraindications: ["Avoid if pregnant or planning pregnancy"],
    price_tier: "$$$",
    category: "serum",
  },
];

/* ------------------------------------------------------------------ */
//  Helpers
/* ------------------------------------------------------------------ */

function fitzpatrickLabel(type: number): string {
  const labels: Record<number, string> = {
    1: "Type I — Very fair, always burns",
    2: "Type II — Fair, usually burns",
    3: "Type III — Medium, sometimes burns",
    4: "Type IV — Olive, rarely burns",
    5: "Type V — Brown, very rarely burns",
    6: "Type VI — Dark brown/black, never burns",
  };
  return labels[type] ?? `Type ${type}`;
}

function scoreRingClass(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

/* ------------------------------------------------------------------ */
//  Page
/* ------------------------------------------------------------------ */

export default function DashboardPage(): React.ReactElement {
  const router = useRouter();
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "shared"
  >("idle");

  const handleShare = useCallback(() => {
    setShareState("sharing");
    // Simulate esthetician share flow
    setTimeout(() => setShareState("shared"), 1200);
    setTimeout(() => setShareState("idle"), 3500);
  }, []);

  const handleRescan = useCallback(() => {
    router.push("/scan");
  }, [router]);

  const urgentConditions = useMemo(
    () => MOCK_CONDITIONS.filter((c) => c.severity === "severe"),
    []
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* ── Top summary banner ── */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Scan Results
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {MOCK_SCAN_DATE}
                </span>
                <span className="hidden sm:inline">·</span>
                <span>{fitzpatrickLabel(MOCK_FITZPATRICK)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Skin Score ring */}
              <div className="flex flex-col items-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">
                  Skin Score
                </span>
                <span
                  className={cn(
                    "text-2xl font-extrabold tabular-nums",
                    scoreRingClass(MOCK_SKIN_SCORE)
                  )}
                >
                  {MOCK_SKIN_SCORE}
                </span>
                <span className="text-[10px] text-stone-400">/ 100</span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  disabled={shareState !== "idle"}
                  className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  {shareState === "shared" ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Shared
                    </>
                  ) : shareState === "sharing" ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Sharing…
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      Share with Esthetician
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={handleRescan}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Rescan
                </Button>
              </div>
            </div>
          </div>

          {/* Urgent flag */}
          {urgentConditions.length > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">Urgent conditions detected</p>
                <p className="text-red-700">
                  We recommend consulting a dermatologist for a professional
                  evaluation.
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Section: Conditions + Zone Map */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ConditionsGrid conditions={MOCK_CONDITIONS} />
            </div>
            <div className="lg:col-span-1">
              <SkinZoneMap zones={MOCK_ZONES} className="h-full" />
            </div>
          </section>

          {/* Section: Root Causes */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-800">
                Root Causes
              </h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                AI-driven
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_ROOT_CAUSES.map((cause) => (
                <RootCauseCard
                  key={cause.category}
                  category={cause.category}
                  score={cause.score}
                  description={cause.description}
                />
              ))}
            </div>
          </section>

          {/* Section: Recommendations */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-stone-800">
                  Recommended Products
                </h2>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                  Evidence-ranked
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-700">
                View all
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {MOCK_RECOMMENDATIONS.map((rec) => (
                <RecommendationCard
                  key={rec.product_id}
                  recommendation={rec}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
