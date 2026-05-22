"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./ProductCard";
import {
  mockProducts,
  categoryOptions,
  priceTierOptions,
  sortOptions,
} from "@/lib/mock/products";
import type { MockProduct } from "@/lib/mock/products";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Scan,
  X,
} from "lucide-react";

interface ProductGridProps {
  className?: string;
  onAddToRoutine?: (product: MockProduct) => void;
}

export function ProductGrid({ className, onAddToRoutine }: ProductGridProps) {
  const [query, setQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedPrice, setSelectedPrice] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("fit_desc");
  const [showFilters, setShowFilters] = React.useState(false);

  const filtered = React.useMemo(() => {
    let list = [...mockProducts];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.key_actives.some((a) => a.ingredient.toLowerCase().includes(q)) ||
          p.conditions_addressed.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedPrice !== "all") {
      list = list.filter((p) => p.price_tier === selectedPrice);
    }

    switch (sortBy) {
      case "fit_desc":
        list.sort((a, b) => b.fit_score - a.fit_score);
        break;
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "evidence_desc": {
        const evMap: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
        list.sort((a, b) => (evMap[b.evidence_level] ?? 0) - (evMap[a.evidence_level] ?? 0));
        break;
      }
    }

    return list;
  }, [query, selectedCategory, selectedPrice, sortBy]);

  const hasActiveFilters = selectedCategory !== "all" || selectedPrice !== "all";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Search + actions row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <Input
            placeholder="Search products, ingredients, conditions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white border-stone-200"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              type="button"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "border-stone-200",
              showFilters && "bg-stone-100 text-stone-800"
            )}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="size-4 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {(selectedCategory !== "all" ? 1 : 0) + (selectedPrice !== "all" ? 1 : 0)}
              </span>
            )}
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="border-stone-200"
              onClick={() => {
                // cycle sort
                const idx = sortOptions.findIndex((o) => o.value === sortBy);
                const next = sortOptions[(idx + 1) % sortOptions.length];
                setSortBy(next.value);
              }}
            >
              <ArrowUpDown className="size-4 mr-1.5" />
              {sortOptions.find((o) => o.value === sortBy)?.label}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter sidebar / chips */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
              Category
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedCategory(opt.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedCategory === opt.value
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                  )}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
              Price Tier
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {priceTierOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedPrice(opt.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedPrice === opt.value
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                  )}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="col-span-full flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedPrice("all");
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                type="button"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-stone-500">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToRoutine={onAddToRoutine}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-full bg-stone-100 p-4">
            <Search className="size-6 text-stone-400" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-stone-800">No products found</p>
            <p className="text-sm text-stone-500 max-w-xs">
              Try adjusting your filters or search terms.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-stone-200"
            onClick={() => {
              setQuery("");
              setSelectedCategory("all");
              setSelectedPrice("all");
            }}
          >
            Reset filters
          </Button>
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-emerald-900">Want truly personalized picks?</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Scan your skin and we’ll match products to your exact profile.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
        >
          <Scan className="size-4 mr-1.5" />
          Scan Now
        </Button>
      </div>
    </div>
  );
}
