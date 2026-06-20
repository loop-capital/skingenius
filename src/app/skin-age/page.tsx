"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft, Zap, TrendingUp, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SkinAgeHero from "@/components/skin-age/SkinAgeHero";
import PhotoUpload from "@/components/skin-age/PhotoUpload";
import AnalysisAnimation from "@/components/skin-age/AnalysisAnimation";
import SkinAgeResult from "@/components/skin-age/SkinAgeResult";
import SkinAgeShare from "@/components/skin-age/SkinAgeShare";
import {
  AgeEstimateRequest,
  AgeEstimateResponse,
  AnalysisStep,
  SkinAgeResult as SkinAgeResultType,
} from "@/types/skin-age";

type PageState =
  | "landing"
  | "upload"
  | "info"
  | "processing"
  | "results"
  | "share";

const STEP_MAP: Record<Exclude<PageState, "share" | "landing">, AnalysisStep> = {
  upload: "upload",
  info: "upload",
  processing: "scanning",
  results: "results",
};

export default function SkinAgePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("landing");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [actualAge, setActualAge] = useState<string>("");
  const [result, setResult] = useState<SkinAgeResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  const handleStartAnalysis = useCallback((base64: string) => {
    setImageBase64(base64);
    setError(null);
    setState("info");
  }, []);

  const handleReset = useCallback(() => {
    setImageBase64(null);
    setActualAge("");
    setResult(null);
    setError(null);
    setState("upload");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) return;

    const ageNum = actualAge ? parseInt(actualAge, 10) : undefined;
    if (actualAge && (isNaN(ageNum!) || ageNum! < 10 || ageNum! > 100)) {
      setError("Please enter a valid age between 10 and 100.");
      return;
    }

    setError(null);
    setState("processing");

    // Simulate processing steps with delays for algorithm theater
    const delays = [800, 1200, 1500];
    for (let i = 0; i < delays.length; i++) {
      await new Promise((r) => setTimeout(r, delays[i]));
    }

    try {
      const body: AgeEstimateRequest = {
        imageBase64,
        actualAge: ageNum,
        tier: isPro ? "pro" : "free",
      };

      const res = await fetch("/api/v1/skin/age-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json: AgeEstimateResponse = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      if (json.data) {
        setResult(json.data);
        setState("results");
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "Analysis failed. Try again.");
      setState("info");
    }
  }, [imageBase64, actualAge, isPro]);

  const handleShare = useCallback(() => {
    if (result) setState("share");
  }, [result]);

  const handleRetake = useCallback(() => {
    setImageBase64(null);
    setActualAge("");
    setResult(null);
    setError(null);
    setState("upload");
  }, []);

  const analysisStep: AnalysisStep =
    state === "processing"
      ? "calculating"
      : state === "results"
      ? "results"
      : STEP_MAP[state] ?? "upload";

  // If on landing, show the hero
  if (state === "landing") {
    return (
      <div className="min-h-[100dvh] bg-[#FFFBF5]">
        <SkinAgeHero
          onStartAnalysis={(base64) => {
            setImageBase64(base64);
            setState("info");
          }}
        />

        {/* Features section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-4">
                How It Works
              </p>
              <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">
                Three steps to discovering your skin age
              </h2>
              <p className="text-stone-600 text-lg">
                Our AI analyzes 6 key skin markers to estimate your biological age.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: "📸",
                  title: "Upload a selfie",
                  desc: "Front-facing photo, good lighting. Your photo never leaves your device.",
                },
                {
                  step: "02",
                  icon: "🧠",
                  title: "AI analyzes your skin",
                  desc: "Texture, wrinkles, spots, pores, hydration, and elasticity are scored.",
                },
                {
                  step: "03",
                  icon: "✨",
                  title: "Get your skin age",
                  desc: "See your estimated skin age and what your skin could look like with a routine.",
                },
              ].map(({ step, icon, title, desc }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 border border-stone-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold text-emerald-700 tracking-wider">
                      {step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors text-2xl">
                      {icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">
                    {title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / Social proof */}
        <section className="py-16 px-6 bg-white border-t border-stone-200">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-sm text-stone-500">
              {[
                { label: "Analyses completed", value: "2,400+" },
                { label: "Average accuracy", value: "94%" },
                { label: "Share rate", value: "68%" },
              ].map(({ label, value }, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-stone-900">{value}</p>
                  <p className="text-stone-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-emerald-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-6">
              Ready to discover your skin age?
            </h2>
            <p className="text-emerald-100 text-lg mb-10">
              Free. Private. Shareable.
              <br />
              See how young your skin could look.
            </p>
            <Button
              onClick={() => setState("upload")}
              className="px-8 py-6 bg-white text-emerald-700 text-base font-semibold rounded-2xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 mx-auto h-auto"
            >
              <Sparkles className="w-5 h-5" />
              Estimate My Skin Age
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-stone-900 tracking-tight">SKINgenius</span>
          </div>

          {/* Tab nav on skin-age page */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-100/80 rounded-full p-1">
            <a href="/scan" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">
              Scan
            </a>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white text-emerald-700 shadow-sm">
              Skin Age
            </span>
            <a href="/track" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">
              Track
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {state !== "upload" && (state !== "landing" as PageState) && (
            <button
              onClick={() =>
                setState((s) => (s === "info" ? "upload" : s === "processing" ? "info" : s === "results" ? "upload" : "upload"))
              }
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Skin Age</h1>
            <p className="text-stone-600 leading-relaxed mt-1">
              {state === "upload"
                ? "Upload a selfie to discover your skin age."
                : state === "info"
                ? "Add a few details for a more accurate estimate."
                : state === "processing"
                ? "Analyzing your photo..."
                : "Your results are ready!"}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 pb-8">
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {state === "upload" && (
          <div className="space-y-6">
            <SkinAgeHero
              onStartAnalysis={handleStartAnalysis}
              onReset={handleReset}
              showReset={true}
            />
          </div>
        )}

        {state === "info" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {imageBase64 && (
              <div className="rounded-2xl overflow-hidden border border-stone-200">
                <img
                  src={imageBase64}
                  alt="Your selfie"
                  className="w-full aspect-square object-cover"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-900">
                  Your Actual Age (optional)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  placeholder="e.g. 32"
                  value={actualAge}
                  onChange={(e) => setActualAge(e.target.value)}
                  className="h-12 rounded-xl border-stone-200 bg-white text-stone-900"
                />
                <p className="text-xs text-stone-500">
                  Used to calculate your skin age gap. Not shared.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Pro Analysis</p>
                    <p className="text-xs text-stone-500">GPT-4o Vision &middot; Clinical-grade</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPro((p) => !p)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors duration-200
                    ${isPro ? "bg-emerald-600" : "bg-stone-300"}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                      ${isPro ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>

              <Button
                onClick={handleAnalyze}
                className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isPro ? "Analyze with Pro" : "Analyze My Skin Age"}
              </Button>
            </div>
          </div>
        )}

        {state === "processing" && (
          <AnalysisAnimation step={analysisStep} />
        )}

        {state === "results" && result && (
          <SkinAgeResult
            result={result}
            onShare={handleShare}
            onRetake={handleRetake}
          />
        )}
      </main>

      {/* Share modal */}
      {state === "share" && result && (
        <SkinAgeShare
          result={result}
          actualAge={actualAge ? parseInt(actualAge, 10) : undefined}
          onClose={() => setState("results")}
        />
      )}

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 px-4 py-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          <a href="/scan" className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-stone-400 hover:text-stone-600">
            <ScanLine className="w-5 h-5" />
            <span className="text-[10px] font-medium">Scan</span>
          </a>
          <span className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-emerald-700">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-medium">Skin Age</span>
          </span>
          <a href="/track" className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-stone-400 hover:text-stone-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium">Track</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
