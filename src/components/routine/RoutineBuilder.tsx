"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoutineStepCard, type RoutineStepItem } from "./RoutineStep";
import type { RoutineStepCategory, StepFrequency } from "@/types/api";
import {
  Plus,
  Sunrise,
  Moon,
  Save,
  RotateCcw,
  Check,
} from "lucide-react";

// Extended category list matching RoutineStepCategory
type ExtendedCategory =
  | "cleanser"
  | "toner"
  | "serum"
  | "moisturizer"
  | "sunscreen"
  | "treatment"
  | "eye_cream"
  | "mask"
  | "oil"
  | "other";

type RoutineTime = "am" | "pm";

interface RoutineBuilderProps {
  className?: string;
}

const categoryDefaults: Record<ExtendedCategory, string> = {
  cleanser: "Cleanser",
  toner: "Toner/Essence",
  serum: "Serum",
  moisturizer: "Moisturizer",
  sunscreen: "Sunscreen",
  treatment: "Spot Treatment",
  eye_cream: "Eye Cream",
  mask: "Face Mask",
  oil: "Face Oil",
  other: "Other",
};

function defaultInstructions(category: ExtendedCategory, time: RoutineTime): string {
  const map: Record<ExtendedCategory, Record<RoutineTime, string>> = {
    cleanser: { am: "Massage gently, rinse thoroughly", pm: "Double cleanse if wearing makeup/SPF" },
    toner: { am: "Pat in with palms or cotton pad", pm: "Pat in with palms or cotton pad" },
    serum: { am: "Apply 2–3 drops to face and neck", pm: "Apply 2–3 drops to face and neck" },
    moisturizer: { am: "Apply evenly after serums", pm: "Apply evenly as final step" },
    sunscreen: { am: "Apply ¼ tsp to face, reapply every 2h", pm: "" },
    treatment: { am: "Spot apply to affected areas", pm: "Spot apply to affected areas" },
    eye_cream: { am: "Tap gently around orbital bone", pm: "Tap gently around orbital bone" },
    mask: { am: "Leave on 10–15 min, rinse", pm: "Leave on 10–15 min, rinse" },
    oil: { am: "Press 2–3 drops into skin", pm: "Press 2–3 drops into skin as last step" },
    other: { am: "Follow product directions", pm: "Follow product directions" },
  };
  return map[category]?.[time] ?? "";
}

function makeStep(
  order: number,
  category: ExtendedCategory,
  productName: string,
  time: RoutineTime,
  freq: StepFrequency = "daily"
): RoutineStepItem {
  return {
    id: `${time}-${order}-${Date.now()}`,
    step_order: order,
    product_name: productName,
    product_id: null,
    category,
    instructions: defaultInstructions(category, time),
    frequency: freq,
  };
}

export function RoutineBuilder({ className }: RoutineBuilderProps) {
  const [activeTab, setActiveTab] = React.useState<RoutineTime>("am");
  const [amSteps, setAmSteps] = React.useState<RoutineStepItem[]>([
    makeStep(1, "cleanser", "Salicylic Acid Cleanser", "am"),
    makeStep(2, "serum", "Vitamin C Suspension 23%", "am"),
    makeStep(3, "moisturizer", "Barrier Repair Moisturizer", "am"),
    makeStep(4, "sunscreen", "UV Clear Broad-Spectrum SPF 46", "am"),
  ]);
  const [pmSteps, setPmSteps] = React.useState<RoutineStepItem[]>([
    makeStep(1, "cleanser", "Salicylic Acid Cleanser", "pm"),
    makeStep(2, "toner", "Glycolic Acid Toner", "pm", "weekly"),
    makeStep(3, "serum", "Retinol 0.3% Serum", "pm"),
    makeStep(4, "eye_cream", "Caffeine Solution 5% + EGCG", "pm"),
    makeStep(5, "moisturizer", "Barrier Repair Moisturizer", "pm"),
  ]);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const steps = activeTab === "am" ? amSteps : pmSteps;
  const setSteps = activeTab === "am" ? setAmSteps : setPmSteps;

  const handleReorder = (dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    setSteps((prev) => {
      const fromIndex = prev.findIndex((s) => s.id === dragId);
      const toIndex = prev.findIndex((s) => s.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((s, i) => ({ ...s, step_order: i + 1 }));
    });
  };

  const handleDelete = (id: string) => {
    setSteps((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return next.map((s, i) => ({ ...s, step_order: i + 1 }));
    });
  };

  const handleAdd = (category: ExtendedCategory) => {
    setSteps((prev) => {
      const order = prev.length + 1;
      const newStep = makeStep(order, category, categoryDefaults[category], activeTab);
      return [...prev, newStep];
    });
  };

  const handleReset = () => {
    if (activeTab === "am") {
      setAmSteps([
        makeStep(1, "cleanser", "Salicylic Acid Cleanser", "am"),
        makeStep(2, "serum", "Vitamin C Suspension 23%", "am"),
        makeStep(3, "moisturizer", "Barrier Repair Moisturizer", "am"),
        makeStep(4, "sunscreen", "UV Clear Broad-Spectrum SPF 46", "am"),
      ]);
    } else {
      setPmSteps([
        makeStep(1, "cleanser", "Salicylic Acid Cleanser", "pm"),
        makeStep(2, "toner", "Glycolic Acid Toner", "pm", "weekly"),
        makeStep(3, "serum", "Retinol 0.3% Serum", "pm"),
        makeStep(4, "eye_cream", "Caffeine Solution 5% + EGCG", "pm"),
        makeStep(5, "moisturizer", "Barrier Repair Moisturizer", "pm"),
      ]);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const categories: ExtendedCategory[] = [
    "cleanser",
    "toner",
    "serum",
    "moisturizer",
    "sunscreen",
    "treatment",
    "eye_cream",
    "mask",
    "oil",
    "other",
  ];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Tabs */}
      <div className="flex rounded-lg bg-stone-100 p-1">
        <button
          onClick={() => setActiveTab("am")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
            activeTab === "am"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
          type="button"
        >
          <Sunrise className="size-4" />
          AM Routine
          <span className="ml-1 text-xs text-stone-400">({amSteps.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("pm")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
            activeTab === "pm"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
          type="button"
        >
          <Moon className="size-4" />
          PM Routine
          <span className="ml-1 text-xs text-stone-400">({pmSteps.length})</span>
        </button>
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-2">
        {steps.length > 0 ? (
          steps.map((step) => (
            <RoutineStepCard
              key={step.id}
              step={step}
              isDragging={draggedId === step.id}
              onDelete={handleDelete}
              onDragStart={(e, id) => {
                setDraggedId(id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e, targetId) => {
                e.preventDefault();
                if (draggedId) {
                  handleReorder(draggedId, targetId);
                }
                setDraggedId(null);
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 py-10 text-center">
            <div className="rounded-full bg-stone-100 p-3">
              <Sunrise className={cn("size-5", activeTab === "pm" && "hidden")} />
              <Moon className={cn("size-5", activeTab === "am" && "hidden")} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-stone-700">
                Your {activeTab.toUpperCase()} routine is empty
              </p>
              <p className="text-xs text-stone-500 max-w-[16rem]">
                Add steps below or browse products to build your personalized routine.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add step */}
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
          Add a step
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="outline"
              size="sm"
              className="text-xs border-stone-200 bg-white hover:bg-stone-100"
              onClick={() => handleAdd(cat)}
            >
              <Plus className="size-3 mr-1" />
              {categoryDefaults[cat]}
            </Button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          className={cn(
            "flex-1 text-white transition-colors",
            saved ? "bg-emerald-600" : "bg-emerald-700 hover:bg-emerald-800"
          )}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <>
              <Check className="size-4 mr-1.5" />
              Saved
            </>
          ) : (
            <>
              <Save className="size-4 mr-1.5" />
              Save Routine
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="border-stone-200"
          onClick={handleReset}
        >
          <RotateCcw className="size-4 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
