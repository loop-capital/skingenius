"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClinicalCheckoutForm } from "@/components/scan/ClinicalCheckoutForm";
import { FlaggedFinding } from "@/types/clinical";

function ClinicalReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scan_id") ?? "";

  const [findings, setFindings] = useState<FlaggedFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) {
      setError("No scan selected.");
      setLoading(false);
      return;
    }

    // Load scan conditions from the local scan context / session.
    // For the prototype we read the last analysis stored in sessionStorage.
    try {
      const raw = sessionStorage.getItem("skingenius_last_analysis");
      if (raw) {
        const parsed = JSON.parse(raw);
        const conditions = (parsed.conditions ?? []).filter(
          (c: FlaggedFinding) => c.severity === "severe" || c.severity === "moderate",
        );
        setFindings(conditions);
      } else {
        setFindings([]);
      }
    } catch {
      setFindings([]);
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.push("/scan/results")}
          className="flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-900 tracking-tight">
            SKINgenius
          </span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
          Clinical review
        </h1>
        <p className="text-stone-600 leading-relaxed">
          This scan shows something that needs clinical attention. Get a board-certified dermatologist to review your results and photos.
        </p>
      </header>

      <main className="flex-1 px-6 pb-8 space-y-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading scan summary…</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            {findings.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Flagged findings
                </p>
                <div className="flex flex-wrap gap-2">
                  {findings.map((f, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        f.severity === "severe"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {f.name} · {f.severity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ClinicalCheckoutForm scanId={scanId} />
          </>
        )}
      </main>

      <footer className="px-6 pb-8 pt-4 border-t border-stone-100">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-1 text-xs text-stone-400">
          <Shield className="w-3.5 h-3.5" />
          HIPAA-compliant workflow. Your photos and data are only shared with the reviewing dermatologist.
        </div>
      </footer>
    </div>
  );
}

export default function ClinicalReviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500">Loading…</div>}>
      <ClinicalReviewPageContent />
    </Suspense>
  );
}
