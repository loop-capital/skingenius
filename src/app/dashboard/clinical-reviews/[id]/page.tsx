import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { ReviewCaseDetail } from "@/components/clinical/ReviewCaseDetail";
import { getClinicalReviewById } from "@/lib/clinical/reviews";
import { notFound } from "next/navigation";

export default async function ClinicalReviewDetailPage({
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
    <div className="min-h-[100dvh] px-6 py-8 max-w-6xl mx-auto">
      <header className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">SKINgenius Clinical Reviews</h1>
          <p className="text-xs text-stone-500">Internal dermatologist dashboard</p>
        </div>
      </header>

      <Suspense fallback={<div className="text-center py-12 text-stone-500">Loading case…</div>}>
        <ReviewCaseDetail review={review} />
      </Suspense>
    </div>
  );
}
