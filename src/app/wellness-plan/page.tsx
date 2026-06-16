import { Metadata } from "next";
import { Suspense } from "react";
import { WellnessPlanPage } from "@/components/wellness/WellnessPlanPage";

export const metadata: Metadata = {
  title: "Your Wellness Plan | SKINgenius",
  description: "Personalized wellness plan for your skin health",
};

export default function Page() {
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <WellnessPlanPage />
    </Suspense>
  );
}

function PlanSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
