"use client";

import { LifestyleResponses, LifestyleRecommendation } from "@/types/lifestyle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateLifestyleScore,
  generateRecommendations,
  LifestyleScore,
} from "@/lib/lifestyle";
import { Progress } from "@/components/ui/progress";
import { Moon, Brain, Cookie, Sun, ArrowUp, CheckCircle } from "lucide-react";

interface ReviewStepProps {
  data: LifestyleResponses;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const categoryIcons = {
  sleep: Moon,
  stress: Brain,
  diet: Cookie,
  uv: Sun,
};

const categoryColors = {
  sleep: "text-indigo-600",
  stress: "text-rose-600",
  diet: "text-emerald-600",
  uv: "text-amber-600",
};

const categoryBgColors = {
  sleep: "bg-indigo-50",
  stress: "bg-rose-50",
  diet: "bg-emerald-50",
  uv: "bg-amber-50",
};

const priorityColors = {
  high: "text-rose-600 bg-rose-50 border-rose-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-stone-600 bg-stone-50 border-stone-200",
};

export function ReviewStep({ data, onSubmit, isSubmitting }: ReviewStepProps) {
  const score: LifestyleScore = calculateLifestyleScore(data);
  const recommendations: LifestyleRecommendation[] = generateRecommendations(data);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Review &amp; Results</h2>
        <p className="text-stone-500 mt-1">
          Here&apos;s how your lifestyle factors into your skin health.
        </p>
      </div>

      {/* Overall Score */}
      <Card className="border-stone-100 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-stone-500 mb-2">Lifestyle Score</p>
            <div className="text-5xl font-bold text-emerald-700 mb-2">
              {score.overall}
            </div>
            <p className="text-sm text-stone-500">out of 100</p>
          </div>

          <div className="mt-6 space-y-4">
            {([
              { key: "sleep", label: "Sleep", value: score.sleep },
              { key: "stress", label: "Stress", value: score.stress },
              { key: "diet", label: "Diet", value: score.diet },
              { key: "uv", label: "UV Protection", value: score.uv },
            ] as const).map((item) => {
              const Icon = categoryIcons[item.key];
              const colorClass = categoryColors[item.key];
              const bgClass = categoryBgColors[item.key];
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                      </div>
                      <span className="text-sm font-medium text-stone-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">
                      {item.value}/25
                    </span>
                  </div>
                  <Progress value={(item.value / 25) * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-emerald-600" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${priorityColors[rec.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    rec.priority === "high"
                      ? "bg-rose-200 text-rose-700"
                      : rec.priority === "medium"
                      ? "bg-amber-200 text-amber-700"
                      : "bg-stone-200 text-stone-700"
                  }`}>
                    {(() => {
                      const Icon = categoryIcons[rec.category];
                      return <Icon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{rec.title}</p>
                    <p className="text-xs mt-1 opacity-80">{rec.description}</p>
                    <span className={`inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : rec.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-stone-100 text-stone-600"
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-emerald-700 text-white text-base font-semibold rounded-2xl hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Save &amp; Get Recommendations
          </>
        )}
      </button>
    </div>
  );
}
