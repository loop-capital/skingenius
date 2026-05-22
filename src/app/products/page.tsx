import { ProductGrid } from "@/components/products/ProductGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — SKINgenius",
  description:
    "Browse evidence-based skincare products matched to your skin profile.",
};

export default function ProductsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Recommended Products
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Evidence-based picks ranked by fit to your skin profile.
          </p>
        </div>

        <ProductGrid />
      </div>
    </main>
  );
}
