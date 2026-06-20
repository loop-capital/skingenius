"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LifestyleResponses,
  LifestyleStep,
  SleepData,
  StressData,
  DietData,
  UVData,
} from "@/types/lifestyle";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  mergeWithDefaults,
} from "@/lib/lifestyle";
import { SleepStep } from "@/components/lifestyle/SleepStep";
import { StressStep } from "@/components/lifestyle/StressStep";
import { DietStep } from "@/components/lifestyle/DietStep";
import { UVStep } from "@/components/lifestyle/UVStep";
import { ReviewStep } from "@/components/lifestyle/ReviewStep";
import { Progress } from "@/components/ui/progress";
import { Moon, Brain, Cookie, Sun, CheckCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const STEPS: { key: LifestyleStep; label: string; icon: React.ElementType }[] = [
  { key: "sleep", label: "Sleep", icon: Moon },
  { key: "stress", label: "Stress", icon: Brain },
  { key: "diet", label: "Diet", icon: Cookie },
  { key: "uv", label: "UV", icon: Sun },
  { key: "review", label: "Review", icon: CheckCircle },
];

export default function LifestyleQuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [responses, setResponses] = useState<LifestyleResponses>(() =>
    mergeWithDefaults(loadDraft())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    saveDraft(responses);
  }, [responses]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateSleep = useCallback((sleep: SleepData) => {
    setResponses((prev) => ({ ...prev, sleep }));
  }, []);

  const updateStress = useCallback((stress: StressData) => {
    setResponses((prev) => ({ ...prev, stress }));
  }, []);

  const updateDiet = useCallback((diet: DietData) => {
    setResponses((prev) => ({ ...prev, diet }));
  }, []);

  const updateUV = useCallback((uv: UVData) => {
    setResponses((prev) => ({ ...prev, uv }));
  }, []);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/v1/lifestyle/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responses),
      });

      const result = await res.json().catch(() => ({ error: "Invalid response" }));

      if (!res.ok) {
        throw new Error(result.error || `HTTP ${res.status}`);
      }

      clearDraft();
      // Optionally redirect to dashboard or results page
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  const stepKey = STEPS[currentStep].key;

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              Cancel
            </button>
            <span className="text-sm font-medium text-stone-600">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          <Progress value={progress} className="h-1.5 mb-3" />

          {/* Stepper dots */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isCompleted = i < currentStep;
              return (
                <button
                  key={step.key}
                  onClick={() => isCompleted && setCurrentStep(i)}
                  disabled={!isCompleted && !isActive}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive
                      ? "opacity-100"
                      : isCompleted
                      ? "opacity-100 cursor-pointer"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-md"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-emerald-700" : "text-stone-400"}`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          {currentStep > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {stepKey === "sleep" && (
          <SleepStep data={responses.sleep} onChange={updateSleep} />
        )}
        {stepKey === "stress" && (
          <StressStep data={responses.stress} onChange={updateStress} />
        )}
        {stepKey === "diet" && (
          <DietStep data={responses.diet} onChange={updateDiet} />
        )}
        {stepKey === "uv" && (
          <UVStep data={responses.uv} onChange={updateUV} />
        )}
        {stepKey === "review" && (
          <ReviewStep
            data={responses}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Error */}
        {submitError && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <p className="text-sm text-rose-700">{submitError}</p>
          </div>
        )}

        {/* Next button */}
        {stepKey !== "review" && (
          <div className="mt-8">
            <button
              onClick={goNext}
              className="w-full py-4 px-6 bg-emerald-700 text-white text-base font-semibold rounded-2xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
