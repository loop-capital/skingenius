import { RoutineBuilder } from "@/components/routine/RoutineBuilder";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Routine — SKINgenius",
  description:
    "Build and manage your personalized AM/PM skincare routine.",
};

export default function RoutinePage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-emerald-700 transition-colors mb-1"
            >
              <ArrowLeft className="size-3.5" />
              Back to products
            </Link>
            <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
              My Routine
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Customize your AM and PM steps. Drag to reorder.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-stone-200 shrink-0 self-start"
            asChild
          >
            <Link href="/products">
              <Sparkles className="size-4 mr-1.5" />
              Browse Products
            </Link>
          </Button>
        </div>

        <RoutineBuilder />
      </div>
    </main>
  );
}
