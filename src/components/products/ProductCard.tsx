"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Baby,
  AlertTriangle,
  Droplets,
  Sparkles,
  Leaf,
} from "lucide-react";
import type { MockProduct } from "@/lib/mock/products";

interface ProductCardProps {
  product: MockProduct;
  onAddToRoutine?: (product: MockProduct) => void;
  className?: string;
}

function EvidenceBadge({ level }: { level: "A" | "B" | "C" | "D" }) {
  const map = {
    A: {
      text: "A",
      bg: "bg-emerald-100 text-emerald-800",
      label: "Strong evidence",
      icon: Leaf,
    },
    B: {
      text: "B",
      bg: "bg-sky-100 text-sky-800",
      label: "Moderate evidence",
      icon: Droplets,
    },
    C: {
      text: "C",
      bg: "bg-amber-100 text-amber-800",
      label: "Limited evidence",
      icon: AlertTriangle,
    },
    D: {
      text: "D",
      bg: "bg-stone-200 text-stone-600",
      label: "Weak / anecdotal",
      icon: Sparkles,
    },
  };
  const cfg = map[level] ?? map.D;
  const Icon = cfg.icon;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              cfg.bg
            )}
          >
            <Icon className="size-3" />
            {cfg.text}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{cfg.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FitScoreBar({ score }: { score: number }) {
  let color = "bg-emerald-500";
  if (score < 70) color = "bg-amber-500";
  if (score < 50) color = "bg-red-500";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
        <span>Fit Score</span>
        <span className="font-semibold text-stone-700">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ProductCard({ product, onAddToRoutine, className }: ProductCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const topActives = product.key_actives.slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col",
        className
      )}
    >
      {/* Image placeholder */}
      <div className="relative h-40 w-full rounded-t-xl bg-stone-100 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-2 text-stone-400">
          <Droplets className="size-8" />
          <span className="text-xs">{product.category.replace("_", " ")}</span>
        </div>
        <div className="absolute top-3 right-3">
          <EvidenceBadge level={product.evidence_level} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="text-sm font-semibold text-stone-900 leading-snug mt-0.5">
            {product.name}
          </h3>
        </div>

        <FitScoreBar score={product.fit_score} />

        {/* Price & Size */}
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <span className="font-semibold text-stone-900">
            ${product.price} {product.currency}
          </span>
          <span className="text-stone-400">·</span>
          <span>{product.size}</span>
          <span className="text-stone-400">·</span>
          <span className="text-xs text-stone-500">{product.price_tier}</span>
        </div>

        {/* Active ingredients */}
        <div className="flex flex-wrap gap-1.5">
          {topActives.map((a) => (
            <span
              key={a.ingredient}
              className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
            >
              {a.ingredient}
              {a.concentration ? ` ${a.concentration}` : ""}
            </span>
          ))}
        </div>

        {/* Condition tags */}
        <div className="flex flex-wrap gap-1.5">
          {product.conditions_addressed.slice(0, 4).map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 capitalize"
            >
              {c.replace("_", " ")}
            </span>
          ))}
          {product.conditions_addressed.length > 4 && (
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
              +{product.conditions_addressed.length - 4}
            </span>
          )}
        </div>

        {/* Pregnancy safety */}
        <div className="flex items-center gap-1.5 text-xs">
          {product.pregnancy_safe ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <Baby className="size-3.5" />
              Pregnancy-safe
            </span>
          ) : (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-red-600 cursor-help">
                    <AlertTriangle className="size-3.5" />
                    Not pregnancy-safe
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Contains ingredients contraindicated in pregnancy</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Expandable reasoning */}
        <div className="border-t border-stone-100 pt-2 mt-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            type="button"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3.5" /> Hide reasoning
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" /> Why we recommend this
              </>
            )}
          </button>
          {expanded && (
            <p className="text-xs text-stone-600 mt-2 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
              {product.reasoning}
            </p>
          )}
        </div>

        {/* Add to Routine */}
        <div className="mt-auto pt-2">
          <Button
            size="sm"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={() => onAddToRoutine?.(product)}
          >
            Add to Routine
          </Button>
        </div>
      </div>
    </div>
  );
}
