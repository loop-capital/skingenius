"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Shield,
  Camera,
  Loader2,
  ShoppingBag,
  ExternalLink,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  V1ScanResponseData,
  V1DetectedCondition,
} from "@/types/api";
import { sampleScanResponse } from "@/lib/scan/sampleScanData";
import { RecommendationCard } from "@/components/scan/RecommendationCard";
import { ClinicalReviewPrompt } from "@/components/scan/ClinicalReviewPrompt";
import type { RecommendationResult } from "@/lib/recommendations/types";
import type { FlaggedFinding } from "@/types/clinical";

// -----------------------------------------------------------------------------
// HARDCODED SAMPLE DATA
// -----------------------------------------------------------------------------
// Replace the useState default below with a real fetch when the API is ready:
//
// const [data, setData] = useState<V1ScanResponseData | null>(null);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState<string | null>(null);
//
// useEffect(() => {
//   fetch("/api/v1/scan", { method: "POST", body: formData })
//     .then((r) => r.json())
//     .then((json) => {
//       if (json.error) throw new Error(json.error);
//       setData(json.data);
//     })
//     .catch((e) => setError(e.message))
//     .finally(() => setLoading(false));
// }, []);
// -----------------------------------------------------------------------------

function confidencePercent(c: number): string {
  return `${Math.round(c * 100)}%`;
}

function severityColor(severity: string): string {
  switch (severity) {
    case "mild":
      return "bg-[#E8FAF0] text-[#1FA856]";
    case "moderate":
      return "bg-[#FFF5E6] text-[#B87A1A]";
    case "severe":
      return "bg-[#FDE8EB] text-[#C41D3A]";
    default:
      return "bg-stone-100 text-stone-800";
  }
}

function severityBorder(severity: string): string {
  switch (severity) {
    case "mild":
      return "border-[#5EEAA0]/30";
    case "moderate":
      return "border-[#F5A623]/30";
    case "severe":
      return "border-[#E74C5E]/30";
    default:
      return "border-stone-200";
  }
}

function scoreTint(score: number): string {
  if (score >= 80) return "text-[#1FA856]";
  if (score >= 60) return "text-[#B87A1A]";
  return "text-[#C41D3A]";
}

function scoreBgTint(score: number): string {
  if (score >= 80) return "bg-[#E8FAF0]";
  if (score >= 60) return "bg-[#FFF5E6]";
  return "bg-[#FDE8EB]";
}

function providerReferralEligible(data: V1ScanResponseData | null): boolean {
  if (!data) return false;
  if (data.provider_referral_eligible) return true;
  return (data.conditions ?? []).some((c) => c.severity === "severe" || c.severity === "moderate");
}

export default function ScanResultsPage() {
  const router = useRouter();

  const [data, setData] = useState<V1ScanResponseData | null>(() => {
    if (typeof window === "undefined") return sampleScanResponse;
    try {
      const saved = sessionStorage.getItem("skingenius_last_analysis");
      return saved ? (JSON.parse(saved) as V1ScanResponseData) : sampleScanResponse;
    } catch {
      return sampleScanResponse;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recFetched, setRecFetched] = useState(false);

  // Simulate async recommendation fetch for realistic loading/error states.
  useEffect(() => {
    if (!data || recFetched) return;

    const conditions = data.conditions ?? [];
    if (conditions.length === 0) {
      setRecFetched(true);
      return;
    }

    setRecLoading(true);
    setRecError(null);

    fetch("/api/v1/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conditions: conditions.map((c: V1DetectedCondition) => ({
          id: c.condition_id ?? c.id ?? c.name.toLowerCase().replace(/\s+/g, "_"),
          confidence: c.confidence,
          severity: c.severity,
        })),
        skin_type: "normal",
        fitzpatrick: data.fitzpatrick_type ?? "IV",
        is_pregnant: false,
        allergies: [],
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.data?.recommendations) {
          throw new Error(json.error || "Failed to fetch recommendations");
        }
        setRecommendations(json.data.recommendations as RecommendationResult[]);
      })
      .catch((err) => {
        console.error("Recommendations error:", err);
        setRecError(err instanceof Error ? err.message : "Failed to load recommendations");
      })
      .finally(() => {
        setRecLoading(false);
        setRecFetched(true);
      });
  }, [data, recFetched]);

  const handleRetry = () => {
    // In a real implementation this would refetch /api/v1/scan.
    // For the sample-data page we reset from the static object.
    setError(null);
    setData(sampleScanResponse);
  };

  // Persist latest analysis for downstream escalation flows.
  useEffect(() => {
    if (!data) return;
    try {
      sessionStorage.setItem(
        "skingenius_last_analysis",
        JSON.stringify({
          scan_id: data.scan_id,
          timestamp: data.timestamp,
          conditions: data.conditions,
          skin_zones: data.skin_zones,
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, [data]);

  const handleScanAgain = () => {
    router.push("/scan");
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-24 pb-8 items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-stone-900 font-semibold">Loading your skin analysis...</p>
        <p className="text-stone-500 text-sm mt-1">Retrieving scan results</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-24 pb-8">
        <Alert variant="destructive" className="max-w-sm mx-auto mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load results</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="space-y-3 w-full max-w-sm mx-auto">
          <Button
            onClick={handleRetry}
            className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={handleScanAgain}
            className="w-full py-6 text-base font-semibold rounded-2xl border-stone-300"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-24 pb-8 items-center justify-center text-center">
        <p className="text-stone-600 mb-6">No results available.</p>
        <Button
          onClick={handleScanAgain}
          className="py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Camera className="w-4 h-4 mr-2" />
          Scan Again
        </Button>
      </div>
    );
  }

  const conditions = data.conditions ?? [];
  const primary = conditions.find(
    (c) =>
      c.id === data.primary_concern ||
      c.condition_id === data.primary_concern ||
      c.name.toLowerCase() === (data.primary_concern ?? "").toLowerCase()
  ) ?? conditions[0];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-900">SKINgenius</span>
        </div>

        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
          Your Skin Analysis
        </h1>
        <p className="text-stone-600 text-sm">
          Scan ID: {data.scan_id?.slice(0, 8) ?? "—"} ·{" "}
          {new Date(data.timestamp ?? Date.now()).toLocaleDateString()}
        </p>
      </header>

      <main className="flex-1 px-6 pb-8 space-y-6">
        {/* Urgent banner */}
        {data.urgent_flag && (
          <div className="rounded-xl bg-[#B91C1C] text-white px-4 py-3 animate-pulse shadow-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Urgent — See a dermatologist</p>
                <p className="text-xs text-white/90 mt-0.5">
                  This scan flagged a condition that should be evaluated by a board-certified
                  dermatologist promptly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overall score + Fitzpatrick */}
        <section>
          <Card className="border-stone-200 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Overall Skin Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold tracking-tighter ${scoreTint(data.overall_score ?? 0)}`}>
                      {data.overall_score ?? 0}
                    </span>
                    <span className="text-sm text-stone-500">/ 100</span>
                  </div>
                  <Progress
                    value={data.overall_score ?? 0}
                    className={`h-3 mt-3 rounded-full ${scoreBgTint(data.overall_score ?? 0)}`}
                  />
                </div>
                <div className="text-center">
                  <Badge
                    variant="outline"
                    className="border-[#0A2647] text-[#0A2647] bg-[#F0F2F5] px-3 py-1 text-sm font-semibold"
                  >
                    Fitzpatrick {data.fitzpatrick_type ?? "—"}
                  </Badge>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-2 font-semibold">
                    {data.model}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Scan counter */}
        <section>
          <Card className="border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-stone-700">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium">
                    You&apos;ve used {data.scan_count_this_month ?? 0} of{" "}
                    {(data.scan_count_this_month ?? 0) + (data.scans_remaining ?? 0)} scans this month
                  </span>
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  {data.scans_remaining ?? 0} remaining
                </span>
              </div>
              <Progress
                value={
                  ((data.scan_count_this_month ?? 0) /
                    ((data.scan_count_this_month ?? 0) + (data.scans_remaining ?? 0) || 1)) *
                  100
                }
                className="h-2 mt-3 rounded-full bg-stone-100"
              />
            </CardContent>
          </Card>
        </section>

        {/* Primary concern */}
        {primary && (
          <section>
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Primary Concern
            </h2>
            <Card className={`border ${severityBorder(primary.severity)}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">{primary.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {primary.affected_areas?.join(", ") ?? primary.zone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`${severityColor(primary.severity)} border-0`}>
                      {primary.severity.charAt(0).toUpperCase() + primary.severity.slice(1)}
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-700">
                      {confidencePercent(primary.confidence)} confidence
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-stone-300 text-sm"
                  onClick={() => router.push(`/scan/results/${primary.id ?? primary.condition_id ?? "acne"}`)}
                >
                  View details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Detected conditions */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
            Detected Conditions
          </h2>
          {conditions.length === 0 ? (
            <p className="text-stone-500 text-sm">No conditions detected in this scan.</p>
          ) : (
            <div className="space-y-3">
              {conditions.map((c: V1DetectedCondition, i: number) => {
                const href = `/scan/results/${c.id ?? c.condition_id ?? c.name.toLowerCase().replace(/\s+/g, "_")}`;
                return (
                  <Card
                    key={`${c.id ?? c.condition_id}-${i}`}
                    className={`border ${severityBorder(c.severity)}`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-stone-900">{c.name}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Affected: {c.affected_areas?.join(", ") ?? c.zone}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`${severityColor(c.severity)} border-0`}>
                            {c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}
                          </Badge>
                          <span className="text-xs font-semibold text-emerald-700">
                            {confidencePercent(c.confidence)} confidence
                          </span>
                        </div>
                      </div>
                      {c.features && c.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {c.features.map((f, j) => (
                            <span
                              key={j}
                              className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full text-emerald-700 hover:bg-emerald-50 text-sm justify-between"
                        onClick={() => router.push(href)}
                      >
                        Learn more about {c.name.toLowerCase()}
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
            Recommended for You
          </h2>

          {recLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm text-stone-600 font-medium">
                Finding products for your skin...
              </p>
            </div>
          )}

          {recError && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not load recommendations</AlertTitle>
              <AlertDescription className="text-xs">{recError}</AlertDescription>
            </Alert>
          )}

          {!recLoading && !recError && recFetched && recommendations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-stone-500 mb-3">
                No personalized recommendations found for your detected conditions.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/products")}
                className="rounded-xl border-stone-300 text-sm"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse All Products
              </Button>
            </div>
          )}

          {!recLoading && recommendations.length > 0 && (
            <div className="space-y-3">
              {recommendations.map((rec: RecommendationResult) => (
                <RecommendationCard key={rec.product_id} recommendation={rec} />
              ))}
            </div>
          )}
        </section>

        {/* Clinical Escalation Prompt */}
        {providerReferralEligible(data) && (
          <ClinicalReviewPrompt
            scanId={data.scan_id ?? ""}
            findings={conditions.map(
              (c: V1DetectedCondition): FlaggedFinding => ({
                condition_id: c.condition_id,
                name: c.name,
                severity: c.severity,
                confidence: c.confidence,
                zone: c.zone,
                features: c.features ?? [],
              }),
            )}
          />
        )}

        {/* Safety flags */}
        {conditions.some((c) => c.severity === "severe") && (
          <Alert className="bg-[#FDE8EB] border-[#E74C5E]/30">
            <AlertCircle className="h-4 w-4 text-[#C41D3A]" />
            <AlertTitle className="text-[#C41D3A] text-sm">Severe Condition Detected</AlertTitle>
            <AlertDescription className="text-[#C41D3A]/80 text-xs">
              One or more severe conditions were detected. We strongly recommend consulting a
              board-certified dermatologist for professional evaluation and treatment.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-[#FFF5E6] border-[#F5A623]/30">
          <AlertCircle className="h-4 w-4 text-[#B87A1A]" />
          <AlertTitle className="text-[#B87A1A] text-sm">Medical Disclaimer</AlertTitle>
          <AlertDescription className="text-[#B87A1A]/80 text-xs">
            This analysis is for informational purposes only and does not constitute a medical
            diagnosis. If you have concerns about your skin health, please consult a
            board-certified dermatologist.
          </AlertDescription>
        </Alert>
      </main>

      {/* Footer CTAs */}
      <footer className="px-6 pb-24 pt-4 bg-white border-t border-stone-100 space-y-3">
        {providerReferralEligible(data) && (
          <div className="rounded-2xl border-2 border-[#E74C5E]/30 bg-[#FDE8EB] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Stethoscope className="w-4 h-4 text-[#C41D3A]" />
              <span className="text-sm font-semibold text-[#C41D3A]">Book with a Pro</span>
            </div>
            <p className="text-xs text-[#C41D3A]/80 mb-3">
              Connect with a board-certified dermatologist for a personalized treatment plan.
            </p>
            <Button className="py-3 text-sm font-semibold rounded-xl bg-[#E74C5E] hover:bg-[#C41D3A] text-white w-full">
              Find a Dermatologist
            </Button>
          </div>
        )}

        <Button
          onClick={() => router.push("/products")}
          className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          View Product Recommendations
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          onClick={handleScanAgain}
          className="w-full py-6 text-base font-semibold rounded-2xl border-stone-300 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Scan Again
        </Button>

        {/* Ad placeholder — free tier */}
        {data.tier === "free" && (
          <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Advertisement
            </p>
            <p className="text-sm text-stone-600">
              Free-tier interstitial ad slot — placeholder for ad network integration.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-1 text-xs text-stone-400">
          <Shield className="w-3 h-3" />
          Photos are never stored on our servers
        </div>
      </footer>
    </div>
  );
}
