"use client";

import { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  ScanFace,
  Sun,
  Brain,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  runOnDeviceScan,
  PipelineProgress,
  PipelineConfig,
  isOnDeviceSupported,
} from "@/lib/scan/onDevicePipeline";
import {
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

export default function ScanDemoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const [result, setResult] = useState<{
    data: import("@/types/api").V1ScanResponseData;
    phases: PipelineProgress[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const supported = typeof window !== "undefined" ? isOnDeviceSupported() : false;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setResult(null);
      setCameraError(null);

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setSelectedImage(null);
    setResult(null);
    setError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setCameraError(
        err instanceof Error ? err.message : "Could not access camera"
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const takePhoto = useCallback(async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    stopCamera();
    setSelectedImage(dataUrl);
  }, [stopCamera]);

  const runAnalysis = useCallback(async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const config: PipelineConfig = {
        userSkinTone: null, // Auto-detect
        captureMethod: cameraActive ? "camera" : "gallery",
        useGemma: false,
      };

      const pipelineResult = await runOnDeviceScan(selectedImage, config, (p) => {
        setProgress(p);
      });

      if (!pipelineResult.success || !pipelineResult.data) {
        throw new Error(pipelineResult.error || "Pipeline failed");
      }

      setResult({
        data: pipelineResult.data,
        phases: pipelineResult.phases,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
      setProgress(null);
    }
  }, [selectedImage, cameraActive]);

  const reset = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setProgress(null);
    stopCamera();
  }, [stopCamera]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-900">SKINgenius</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          On-Device Scan Demo
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Test the client-side MediaPipe + skin analysis pipeline in your browser.
        </p>
        {!supported && (
          <Alert className="mt-3 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 text-sm">Limited Support</AlertTitle>
            <AlertDescription className="text-amber-700 text-xs">
              WebGL or camera access not available. The pipeline may not run correctly.
            </AlertDescription>
          </Alert>
        )}
      </header>

      <main className="flex-1 px-6 py-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Step 1: Image Source */}
        {!selectedImage && !cameraActive && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-emerald-600" />
                Step 1: Choose an Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-semibold text-stone-900">Camera</span>
                    <span className="block text-xs text-stone-500 mt-0.5">Take a photo</span>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-stone-600" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-semibold text-stone-900">Upload</span>
                    <span className="block text-xs text-stone-500 mt-0.5">Select from device</span>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              {cameraError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Camera Error</AlertTitle>
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Camera View */}
        {cameraActive && (
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200 shadow-lg aspect-[3/4] max-w-sm mx-auto bg-stone-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 rounded-full border-2 border-white/40">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-tl" />
                  <div className="absolute -top-2 right-1/2 translate-x-1/2 w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-tr" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-bl" />
                  <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-br" />
                </div>
                <p className="absolute bottom-8 left-0 right-0 text-center text-white/70 text-sm font-medium">
                  Position your face within the oval
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={takePhoto}
                className="py-5 px-8 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={stopCamera}
                className="py-5 px-6 text-base font-semibold rounded-2xl border-stone-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage && !analyzing && !result && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Step 2: Review Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-stone-200 shadow-lg">
                <img
                  src={selectedImage}
                  alt="Selected skin photo"
                  className="w-full object-contain bg-stone-100"
                />
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={runAnalysis}
                  className="py-5 px-8 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Run On-Device Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="py-5 px-6 text-base font-semibold rounded-2xl border-stone-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysing State */}
        {analyzing && (
          <Card className="border-stone-200">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
                <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full bg-emerald-50 flex items-center justify-center">
                  {progress?.phase === "face_detection" && (
                    <ScanFace className="w-6 h-6 text-emerald-600 animate-pulse" />
                  )}
                  {progress?.phase === "quality_assessment" && (
                    <Sun className="w-6 h-6 text-emerald-600 animate-pulse" />
                  )}
                  {progress?.phase === "skin_tone_estimation" && (
                    <Sun className="w-6 h-6 text-emerald-600 animate-pulse" />
                  )}
                  {progress?.phase === "condition_detection" && (
                    <Brain className="w-6 h-6 text-emerald-600 animate-pulse" />
                  )}
                </div>
              </div>
              <p className="text-stone-900 font-semibold text-lg mb-1">
                {progress?.phase === "face_detection" && "Detecting face..."}
                {progress?.phase === "quality_assessment" && "Analysing image quality..."}
                {progress?.phase === "skin_tone_estimation" && "Estimating skin tone..."}
                {progress?.phase === "condition_detection" && "Identifying conditions..."}
              </p>
              <p className="text-stone-500 text-sm">{progress?.message}</p>

              {/* Phase indicators */}
              <div className="w-full max-w-xs mt-6 space-y-2">
                {[
                  { key: "face_detection", label: "Face Detection" },
                  { key: "quality_assessment", label: "Quality Check" },
                  { key: "skin_tone_estimation", label: "Skin Tone" },
                  { key: "condition_detection", label: "Conditions" },
                ].map((phase) => {
                  const isActive = progress?.phase === phase.key;
                  return (
                    <div key={phase.key} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isActive ? "bg-emerald-600 animate-pulse" : "bg-stone-300"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          isActive ? "font-medium text-emerald-700" : "text-stone-400"
                        }`}
                      >
                        {phase.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Analysis Complete</h2>
                  <p className="text-sm text-stone-600">
                    On-device pipeline finished in {result.phases.length} phases
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quality */}
            {result.data.quality_assessment && (
              <Card className="border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quality Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <QualityRow
                    label="Format"
                    value={result.data.quality_assessment.is_valid_format ? "Valid" : "Invalid"}
                    good={result.data.quality_assessment.is_valid_format}
                  />
                  <QualityRow
                    label="Dimensions"
                    value={`${result.data.quality_assessment.width} × ${result.data.quality_assessment.height}`}
                  />
                  <QualityRow
                    label="Face Detected"
                    value={result.data.quality_assessment.face_detected ? "Yes" : "No"}
                    good={result.data.quality_assessment.face_detected}
                  />
                  <QualityRow
                    label="Blur Score"
                    value={result.data.quality_assessment.blur_score?.toFixed(1) ?? "N/A"}
                  />
                  <QualityRow
                    label="Lighting Score"
                    value={result.data.quality_assessment.lighting_score?.toFixed(1) ?? "N/A"}
                  />
                  {result.data.metadata?.auto_detected_skin_tone && (
                    <QualityRow
                      label="Auto Skin Tone"
                      value={`Type ${result.data.metadata.auto_detected_skin_tone.type} (${Math.round(
                        result.data.metadata.auto_detected_skin_tone.confidence * 100
                      )}% confidence)`}
                      good
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Conditions */}
            <section>
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Detected Conditions
              </h2>
              {result.data.conditions.length === 0 ? (
                <p className="text-stone-500 text-sm">No conditions detected.</p>
              ) : (
                <div className="space-y-3">
                  {result.data.conditions.map((c: V1DetectedCondition, i: number) => (
                    <Card key={`${c.condition_id}-${i}`} className={`border ${severityBorder(c.severity)}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-stone-900">{c.name}</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Zone: {c.zone}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {confidencePercent(c.confidence)} confidence
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor(c.severity)}`}>
                              {c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                        {c.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {c.features.map((f, j) => (
                              <span key={j} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
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

            {/* Zones */}
            {result.data.skin_zones.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
                  Skin Zones
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.data.skin_zones.map((z: V1SkinZone, i: number) => (
                    <Card key={`${z.zone}-${i}`} className="border-stone-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-stone-900 capitalize">
                            {z.zone.replace(/-/g, " ")}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor(z.severity)}`}>
                            {z.severity.charAt(0).toUpperCase() + z.severity.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mb-1">{z.primary_concern}</p>
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

            {/* Pipeline Phases Log */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-stone-500" />
                  Pipeline Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.phases.map((phase, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-stone-700 capitalize">
                        {phase.phase.replace(/_/g, " ")}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500">{phase.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pb-8">
              <Button
                onClick={reset}
                className="flex-1 py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Run Another Scan
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function QualityRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-600">{label}</span>
      <span
        className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
          good === undefined
            ? "text-stone-900"
            : good
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
