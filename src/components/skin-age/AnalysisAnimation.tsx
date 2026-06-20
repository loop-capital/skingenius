"use client";

import { useEffect, useState } from "react";
import { Scan, Brain, Calculator, Sparkles } from "lucide-react";
import { AnalysisStep } from "@/types/skin-age";

interface AnalysisAnimationProps {
  step: AnalysisStep;
}

const STEPS: { key: AnalysisStep; label: string; icon: typeof Scan }[] = [
  { key: "upload", label: "Uploading photo...", icon: Scan },
  { key: "scanning", label: "Scanning facial features...", icon: Scan },
  { key: "analyzing", label: "Analyzing skin markers...", icon: Brain },
  { key: "calculating", label: "Calculating skin age...", icon: Calculator },
  { key: "results", label: "Results ready!", icon: Sparkles },
];

function stepIndex(step: AnalysisStep): number {
  return STEPS.findIndex((s) => s.key === step);
}

export default function AnalysisAnimation({ step }: AnalysisAnimationProps) {
  const [dots, setDots] = useState("");
  const currentIdx = stepIndex(step);

  useEffect(() => {
    if (step === "results") return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Scanner visual */}
      <div className="relative w-48 h-48 rounded-2xl bg-[var(--color-surface-muted)] border border-[var(--color-hairline)] overflow-hidden flex items-center justify-center">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-ink) 1px, transparent 1px), linear-gradient(to bottom, var(--color-ink) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Face placeholder circle */}
        <div className="relative w-24 h-24 rounded-full border-2 border-[var(--color-primary)]/30 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-[var(--color-primary)]/20" />
        </div>

        {/* Scanning line */}
        {step !== "results" && (
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent animate-scan-line" />
        )}

        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[var(--color-primary)]" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[var(--color-primary)]" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[var(--color-primary)]" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[var(--color-primary)]" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500
                  ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white scale-110 shadow-lg"
                      : isDone
                      ? "bg-[var(--color-primary-100)] text-[var(--color-primary)]"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`
                    w-6 h-0.5 rounded-full transition-colors duration-500
                    ${isDone ? "bg-[var(--color-primary)]" : "bg-[var(--color-hairline)]"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <p className="text-sm font-medium text-[var(--color-ink-secondary)]">
        {STEPS[currentIdx]?.label}
        {step !== "results" && <span className="inline-block w-6">{dots}</span>}
      </p>
    </div>
  );
}
