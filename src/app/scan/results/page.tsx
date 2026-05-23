"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Shield,
  Camera,
  Brain,
  ScanFace,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScan } from "@/lib/scan/ScanContext";
import {
  runOnDeviceScan,
  PipelineProgress,
  PipelineConfig,
} from "@/lib/scan/onDevicePipeline";
import {
  V1ScanResponse,
  V1DetectedCondition,
  V1SkinZone,
  V1QualityAssessment,
} from "@/types/api";

function confidencePercent(c: number): string {
  return `${Math.round(c * 100)}%`;
}

function severityColor(severity: string): string {
  switch (severity) {
    case "mild":
      return "bg-green-100 text-green-800";
    case "moderate":
      return "bg-amber-100 text-amber-800";
    case "severe":
      return "bg-red-100 text-red-800";
    default:
      return "bg-stone-100 text-stone-800";
  }
}

function severityBorder(severity: string): string {
  switch (severity) {
    case "mild":
      return "border-green-200";
    case "moderate":
      return "border-amber-200";
    case "severe":
      return "border-red-200";
    default:
      return "border-stone-200";
  }
}

function phaseIcon(phase: PipelineProgress["phase"]) {
  switch (phase) {
    case "face_detection":
      return <ScanFace className="w-4 h-4" />;
    case "quality_assessment":
      return <Camera className="w-4 h-4" />;
    case "skin_tone_estimation":
      return <Sun className="w-4 h-4" />;
    case "condition_detection":
      return <Brain className="w-4 h-4" />;
    case "complete":
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

function phaseLabel(phase: PipelineProgress["phase"]) {
  switch (phase) {
    case "face_detection":
      return "Detecting face...";
    case "quality_assessment":
      return "Analyzing image quality...";
    case "skin_tone_estimation":
      return "Estimating skin tone...";
    case "condition_detection":
      return "Identifying conditions...";
    case "complete":
      return "Analysis complete";
    default:
      return "Processing...";
  }
}

export default function ScanResultsPage() {
  const router = useRouter();
  const { state, dispatch } = useScan();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<V1ScanResponse["data"] | null>(null);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);

  const runAnalysis = useCallback(async () => {
    const imageData = state.capturedImageData;
    const skinTone = state.skinTone;

    if (!imageData) {
      router.replace("/scan");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build base64 data URL if needed
      const imageInput = imageData.startsWith("data:")
        ? imageData
        : `data:image/jpeg;base64,${imageData}`;

      const config: PipelineConfig = {
        userSkinTone: skinTone,
        captureMethod: state.uploadedImageUri ? "gallery" : "camera",
        useGemma: false,
      };

      const result = await runOnDeviceScan(imageInput, config, (p) => {
        setProgress(p);
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "On-device analysis failed");
      }

      // Persist results to server (image stays on device)
      const persistRes = await fetch("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_results: result.data,
          capture_method: config.captureMethod,
          skin_tone: result.data.metadata.skin_tone,
        }),
      });

      const json: V1ScanResponse = await persistRes.json();

      if (!persistRes.ok || json.error) {
        // Still show results even if persistence fails
        console.warn("Persistence failed:", json.error);
      }

      // Use server scan_id if available, otherwise generate local
      const finalData = {
        ...result.data,
        scan_id: json.data?.scan_id ?? result.data.scan_id ?? crypto.randomUUID(),
      };

      setData(finalData);
      dispatch({
        type: "SET_RESULTS",
        analysisId: finalData.scan_id ?? "",
        conditions:
          finalData.conditions?.map((c) => ({
            name: c.name,
            confidence: c.confidence,
            severity: c.severity,
            features: c.features,
            zone: c.zone,
          })) ?? [],
        zones:
          finalData.skin_zones?.map((z) => ({
            zone: z.zone,
            primaryConcern: z.primary_concern,
            description: z.description,
            severity: z.severity,
          })) ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze scan");
    } finally {
      setLoading(false);
    }
  }, [dispatch, router, state.capturedImageData, state.skinTone, state.uploadedImageUri]);

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanAgain = useCallback(() => {
    dispatch({ type: "RESET" });
    router.push("/scan");
  }, [dispatch, router]);

  // Loading / analysing state
  if (loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-8 pb-8 items-center justify-center text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-emerald-50 flex items-center justify-center">
            {progress ? phaseIcon(progress.phase) : <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />}
          </div>
        </div>
        <p className="text-stone-900 font-semibold text-lg mb-1">
          {progress ? phaseLabel(progress.phase) : "Analysing your skin..."}
        </p>
        <p className="text-stone-500 text-sm">
          {progress?.message ?? "Running on-device AI analysis"}
        </p>

        {/* Phase indicators */}
        <div className="w-full max-w-xs mt-8 space-y-3">
          {(
            [
              "face_detection",
              "quality_assessment",
              "skin_tone_estimation",
              "condition_detection",
            ] as const
          ).map((phase) => {
            const isActive = progress?.phase === phase;
            const isComplete =
              progress &&
              [
                "quality_assessment",
                "skin_tone_estimation",
                "condition_detection",
                "complete",
              ].includes(progress.phase) &&
              [
                "face_detection",
                "quality_assessment",
                "skin_tone_estimation",
                "condition_detection",
              ].indexOf(progress.phase) >
                [
                  "face_detection",
                  "quality_assessment",
                  "skin_tone_estimation",
                  "condition_detection",
                ].indexOf(phase);

            return (
              <div key={phase} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : isActive
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-600"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    phaseIcon(phase)
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isActive
                      ? "font-semibold text-emerald-700"
                      : isComplete
                      ? "text-stone-700"
                      : "text-stone-400"
                  }`}
                >
                  {phaseLabel(phase)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-8 pb-8">
        <header className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-stone-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Alert variant="destructive" className="max-w-sm mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="space-y-3 w-full max-w-sm">
            <Button
              onClick={runAnalysis}
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
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-8 pb-8 items-center justify-center text-center">
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

  const qa = data.quality_assessment as V1QualityAssessment | undefined;
  const conditions = data.conditions ?? [];
  const zones = data.skin_zones ?? [];

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
          {new Date(data.timestamp).toLocaleDateString()}
        </p>
        {data.metadata?.auto_detected_skin_tone && (
          <p className="text-xs text-emerald-600 mt-1">
            Auto-detected Fitzpatrick type {data.metadata.auto_detected_skin_tone.type} (confidence:{" "}
            {Math.round(data.metadata.auto_detected_skin_tone.confidence * 100)}%)
          </p>
        )}
      </header>

      <main className="flex-1 px-6 pb-8 space-y-6">
        {/* Quality Assessment */}
        {qa && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Image Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Format</span>
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    qa.is_valid_format
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {qa.is_valid_format ? "Valid" : "Invalid"}
                </span>
              </div>
              {qa.width && qa.height && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Dimensions</span>
                  <span className="text-sm font-medium text-stone-900">
                    {qa.width} × {qa.height}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Face Detected</span>
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    qa.face_detected
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {qa.face_detected ? "Yes" : "No"}
                </span>
              </div>
              {qa.blur_score != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Blur Score</span>
                  <span className="text-sm font-medium text-stone-900">
                    {qa.blur_score.toFixed(1)}
                  </span>
                </div>
              )}
              {qa.lighting_score != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Lighting Score</span>
                  <span className="text-sm font-medium text-stone-900">
                    {qa.lighting_score.toFixed(1)}
                  </span>
                </div>
              )}
              {data.metadata?.warnings && data.metadata.warnings.length > 0 && (
                <div className="mt-2 pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Warnings
                  </p>
                  <ul className="space-y-1">
                    {data.metadata.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-700">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detected Conditions */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
            Detected Conditions
          </h2>
          {conditions.length === 0 ? (
            <p className="text-stone-500 text-sm">
              No conditions detected in this scan.
            </p>
          ) : (
            <div className="space-y-3">
              {conditions.map((c: V1DetectedCondition, i: number) => (
                <Card
                  key={`${c.condition_id}-${i}`}
                  className={`border ${severityBorder(c.severity)}`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-stone-900">
                          {c.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Zone: {c.zone}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {confidencePercent(c.confidence)} confidence
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor(
                            c.severity
                          )}`}
                        >
                          {c.severity.charAt(0).toUpperCase() +
                            c.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                    {c.features.length > 0 && (
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Skin Zones */}
        {zones.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Skin Zones
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {zones.map((z: V1SkinZone, i: number) => (
                <Card key={`${z.zone}-${i}`} className="border-stone-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-stone-900 capitalize">
                        {z.zone.replace(/-/g, " ")}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor(
                          z.severity
                        )}`}
                      >
                        {z.severity.charAt(0).toUpperCase() +
                          z.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mb-1">
                      {z.primary_concern}
                    </p>
                    <p className="text-xs text-stone-500">{z.description}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-stone-400">Confidence:</span>
                      <span className="text-xs font-medium text-emerald-700">
                        {confidencePercent(z.confidence)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 text-sm">
            Medical Disclaimer
          </AlertTitle>
          <AlertDescription className="text-amber-700 text-xs">
            This analysis is for informational purposes only and does not
            constitute a medical diagnosis. If you have concerns about your
            skin health, please consult a board-certified dermatologist.
          </AlertDescription>
        </Alert>
      </main>

      {/* Footer CTAs */}
      <footer className="px-6 pb-8 pt-4 bg-white border-t border-stone-100 space-y-3">
        <Button
          onClick={() => router.push("/recommendations")}
          className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Get Recommendations
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

        <div className="flex items-center justify-center gap-1 text-xs text-stone-400">
          <Shield className="w-3 h-3" />
          Photos are never stored on our servers
        </div>
      </footer>
    </div>
  );
}
