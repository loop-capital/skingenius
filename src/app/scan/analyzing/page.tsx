"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScan } from "@/lib/scan/ScanContext";

const PHASES = [
  { key: "quality_check", label: "Quality Check" },
  { key: "classification", label: "AI Analysis" },
  { key: "root_causes", label: "Root Causes" },
] as const;

const TIMEOUT_MS = 30000;

export default function ScanAnalyzingPage() {
  const router = useRouter();
  const { state, dispatch } = useScan();

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const startProcessing = useCallback(async () => {
    const imageData = state.capturedImageData;
    const skinTone = state.skinTone;

    if (!imageData || !skinTone) {
      router.replace("/scan");
      return;
    }

    const timeoutId = setTimeout(() => {
      setTimedOut(true);
    }, TIMEOUT_MS);

    try {
      dispatch({ type: "SET_STEP", step: "processing" });

      // Phase 1: Quality Check (0-33%)
      dispatch({ type: "SET_PROCESSING_PHASE", phase: "quality_check", progress: 0 });
      await simulatePhaseProgress(0, 1000);

      dispatch({ type: "SET_PROCESSING_PHASE", phase: "quality_check", progress: 50 });
      await simulatePhaseProgress(50, 800);

      dispatch({ type: "SET_PROCESSING_PHASE", phase: "quality_check", progress: 100 });
      setPhaseIndex(1);

      // Phase 2: Classification (33-66%)
      dispatch({ type: "SET_PROCESSING_PHASE", phase: "classification", progress: 0 });
      await simulatePhaseProgress(0, 1500);

      dispatch({ type: "SET_PROCESSING_PHASE", phase: "classification", progress: 60 });
      await simulatePhaseProgress(60, 1000);

      dispatch({ type: "SET_PROCESSING_PHASE", phase: "classification", progress: 100 });
      setPhaseIndex(2);

      // Phase 3: Root Causes (66-100%)
      dispatch({ type: "SET_PROCESSING_PHASE", phase: "root_causes", progress: 0 });
      await simulatePhaseProgress(0, 800);

      dispatch({ type: "SET_PROCESSING_PHASE", phase: "root_causes", progress: 100 });

      // Navigate to results
      router.push("/scan/results");
    } catch {
      dispatch({
        type: "SET_ERROR",
        error: "Analysis failed. Please try again.",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }, [dispatch, router, state.capturedImageData, state.skinTone]);

  useEffect(() => {
    startProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate local progress bar for current phase
  useEffect(() => {
    if (timedOut) return;
    const currentPhase = PHASES[phaseIndex];
    if (!currentPhase) return;

    const phase = state.processingPhase;
    const progress = state.processingProgress;

    let startTime: number | null = null;
    let animFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 400; // ms for smooth bar
      const pct = Math.min((elapsed / duration) * 100, 100);
      setPhaseProgress(pct);
      if (pct < 100) {
        animFrame = requestAnimationFrame(animate);
      }
    };

    setPhaseProgress(0);
    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
  }, [phaseIndex, state.processingPhase, state.processingProgress, timedOut]);

  // Overall progress: each phase = 33.33%
  const overallProgress = Math.min(
    (phaseIndex * 33.33) + (phaseProgress / 100) * 33.33,
    100
  );

  if (timedOut) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-8 pb-8 items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Analysis Timed Out</h2>
        <p className="text-stone-600 mb-8 max-w-xs">
          The analysis is taking longer than expected. This may be due to a slow connection or a large image.
        </p>
        <div className="space-y-3 w-full max-w-sm">
          <Button
            onClick={() => {
              setTimedOut(false);
              setPhaseIndex(0);
              setPhaseProgress(0);
              startProcessing();
            }}
            className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/scan")}
            className="w-full py-6 text-base font-semibold rounded-2xl border-stone-300"
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 pt-8 pb-8 items-center justify-center"
    >
      {/* Animated Scanning Overlay */}
      <div className="relative w-48 h-48 mb-8"
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
        <div
          className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"
          style={{ animationDuration: "2s" }}
        />

        {/* Inner pulse */}
        <div className="absolute inset-4 rounded-full bg-emerald-50 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 animate-pulse flex items-center justify-center"
          >
            <span className="text-2xl font-bold text-emerald-700">
              {Math.round(overallProgress)}%
            </span>
          </div>
        </div>

      {/* Scanning line */}
      <div
        className="absolute left-0 right-0 h-px bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-scan-line"
        style={{ top: "50%" }}
      />
      </div>

      <h2 className="text-2xl font-bold text-stone-900 mb-2">
        Analyzing Your Skin
      </h2>
      <p className="text-stone-600 mb-8 text-center max-w-xs"
      >
        Our AI is examining texture, tone, and condition patterns across 7 facial zones.
      </p>

      {/* Phase indicators */}
      <div className="w-full max-w-sm space-y-4"
      >
        {PHASES.map((phase, index) => {
          const isComplete = index < phaseIndex;
          const isActive = index === phaseIndex;
          const isPending = index > phaseIndex;

          return (
            <div key={phase.key} className="flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isActive
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-600"
                    : "bg-stone-100 text-stone-400 border-2 border-stone-200"
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1"
              >
                <p
                  className={`text-sm font-semibold ${
                    isActive ? "text-emerald-700" : isComplete ? "text-stone-900" : "text-stone-400"
                  }`}
                >
                  {phase.label}
                </p>
                {isActive && (
                  <div className="mt-1 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function simulatePhaseProgress(_startPct: number, durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
