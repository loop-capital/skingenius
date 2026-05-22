"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RoutineStepCategory, StepFrequency } from "@/types/api";
import {
  GripVertical,
  Trash2,
  Droplets,
  Leaf,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Eye,
  FlaskConical,
  CircleHelp,
  Clock,
} from "lucide-react";

export interface RoutineStepItem {
  id: string;
  step_order: number;
  product_name: string;
  product_id: string | null;
  category: RoutineStepCategory;
  instructions: string | null;
  frequency: StepFrequency;
}

interface RoutineStepProps {
  step: RoutineStepItem;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
  className?: string;
}

function CategoryIcon({ category }: { category: RoutineStepCategory }) {
  const map: Record<string, React.ReactNode> = {
    cleanser: <Droplets className="size-4" />,
    toner: <Leaf className="size-4" />,
    serum: <FlaskConical className="size-4" />,
    moisturizer: <Shield className="size-4" />,
    sunscreen: <Sun className="size-4" />,
    treatment: <Sparkles className="size-4" />,
    eye_cream: <Eye className="size-4" />,
    mask: <Moon className="size-4" />,
    oil: <Droplets className="size-4" />,
    other: <CircleHelp className="size-4" />,
  };
  return <>{map[category] ?? <CircleHelp className="size-4" />}</>;
}

function CategoryLabel({ category }: { category: RoutineStepCategory }) {
  return (
    <span className="capitalize text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
      {category.replace("_", " ")}
    </span>
  );
}

function FrequencyBadge({ frequency }: { frequency: StepFrequency }) {
  if (!frequency) return null;
  const labels: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    as_needed: "As needed",
  };
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
      <Clock className="size-3" />
      {labels[frequency] ?? frequency}
    </span>
  );
}

export function RoutineStepCard({
  step,
  isDragging,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  className,
}: RoutineStepProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, step.id)}
      onDragOver={(e) => onDragOver?.(e)}
      onDrop={(e) => onDrop?.(e, step.id)}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border bg-white p-3 transition-all",
        isDragging
          ? "border-emerald-300 bg-emerald-50 shadow-md opacity-90"
          : "border-stone-200 hover:border-stone-300 hover:shadow-sm",
        className
      )}
    >
      {/* Drag handle */}
      <div className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 transition-colors">
        <GripVertical className="size-5" />
      </div>

      {/* Order number */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
        {step.step_order}
      </div>

      {/* Category icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
        <CategoryIcon category={step.category} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CategoryLabel category={step.category} />
          <FrequencyBadge frequency={step.frequency} />
        </div>
        <p className="text-sm font-semibold text-stone-900 truncate">
          {step.product_name}
        </p>
        {step.instructions && (
          <p className="text-xs text-stone-500 truncate">{step.instructions}</p>
        )}
      </div>

      {/* Delete */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-red-600 h-8 w-8"
          onClick={() => onDelete(step.id)}
          aria-label={`Remove ${step.product_name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
