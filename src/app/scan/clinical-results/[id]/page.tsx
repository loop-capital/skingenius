import { notFound } from "next/navigation";
import { Sparkles, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReviewResultCard } from "@/components/clinical/ReviewResultCard";
import { getClinicalReviewById } from "@/lib/clinical/reviews";

export default async function ClinicalResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await getClinicalReviewById(id);

  if (!review) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-6 pt-8 pb-4">
        <Link
          href="/scan/results"
          className="inline-flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-900 tracking-tight">
            SKINgenius
          </span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
          Your clinical results
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Dermatologist-reviewed diagnosis, treatment plan, and next steps.
        </p>
      </header>

      <main className="flex-1 px-6 pb-8 max-w-2xl mx-auto w-full">
        <ReviewResultCard review={review} />
      </main>

      <footer className="px-6 pb-8 pt-4 border-t border-stone-100">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-1 text-xs text-stone-400">
          <Shield className="w-3.5 h-3.5" />
          This review is for informational purposes and does not replace an in-person visit.
        </div>
      </footer>
    </div>
  );
}
