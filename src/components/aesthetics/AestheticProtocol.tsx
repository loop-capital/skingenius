"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  AestheticProtocol,
  ProtocolStep,
} from "@/types/facial-aesthetics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImprovementCard } from "./ImprovementCard";

interface AestheticProtocolProps {
  protocol: AestheticProtocol;
  className?: string;
}

type BudgetFilter = "all" | "low" | "medium" | "high";
type InvasivenessFilter =
  | "all"
  | "none"
  | "minimal"
  | "moderate"
  | "significant";

function getPhaseColor(phase: number): string {
  switch (phase) {
    case 1:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case 2:
      return "bg-sky-50 text-sky-700 border-sky-200";
    case 3:
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-stone-50 text-stone-700 border-stone-200";
  }
}

function getPhaseLabel(phase: number): string {
  switch (phase) {
    case 1:
      return "Foundation";
    case 2:
      return "Enhancement";
    case 3:
      return "Maintenance";
    default:
      return "Phase";
  }
}

function getPhaseDuration(phase: number): string {
  switch (phase) {
    case 1:
      return "Weeks 1-4";
    case 2:
      return "Months 2-3";
    case 3:
      return "Month 4+";
    default:
      return "";
  }
}

function formatBudget(value: BudgetFilter): string {
  switch (value) {
    case "low":
      return "$";
    case "medium":
      return "$$";
    case "high":
      return "$$$";
    default:
      return "All";
  }
}

function formatInvasiveness(value: InvasivenessFilter): string {
  switch (value) {
    case "none":
      return "Non-Invasive";
    case "minimal":
      return "Minimal";
    case "moderate":
      return "Moderate";
    case "significant":
      return "Significant";
    default:
      return "All";
  }
}

function filterSteps(
  steps: ProtocolStep[],
  budget: BudgetFilter,
  invasiveness: InvasivenessFilter,
): ProtocolStep[] {
  return steps.filter((step) => {
    // Budget filter
    if (budget !== "all") {
      const max = step.cost_max;
      if (budget === "low" && max > 100) return false;
      if (budget === "medium" && (max > 500 || max <= 100)) return false;
      if (budget === "high" && max <= 500) return false;
    }

    // Invasiveness filter
    if (invasiveness !== "all") {
      const stepInvasiveness = inferInvasiveness(step.category);
      const allowed = new Set<string>();
      if (invasiveness === "none") {
        allowed.add("none");
      } else if (invasiveness === "minimal") {
        allowed.add("none");
        allowed.add("minimal");
      } else if (invasiveness === "moderate") {
        allowed.add("none");
        allowed.add("minimal");
        allowed.add("moderate");
      } else {
        allowed.add("none");
        allowed.add("minimal");
        allowed.add("moderate");
        allowed.add("significant");
      }
      if (!allowed.has(stepInvasiveness)) return false;
    }

    return true;
  });
}

function inferInvasiveness(category: string): InvasivenessFilter {
  switch (category) {
    case "lifestyle":
    case "skincare":
    case "supplement":
      return "none";
    case "device":
      return "minimal";
    case "peptide":
      return "moderate";
    case "procedure":
    case "injectable":
      return "significant";
    default:
      return "none";
  }
}

export function AestheticProtocol({
  protocol,
  className,
}: AestheticProtocolProps): React.ReactElement {
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>("all");
  const [invasivenessFilter, setInvasivenessFilter] =
    useState<InvasivenessFilter>("all");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-stone-800">
          Your Aesthetic Protocol
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500">Budget:</span>
          {(["all", "low", "medium", "high"] as BudgetFilter[]).map((b) => (
            <Button
              key={b}
              variant={budgetFilter === b ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 px-2 text-[11px]",
                budgetFilter === b
                  ? "bg-stone-800 text-white hover:bg-stone-700"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
              )}
              onClick={() => setBudgetFilter(b)}
            >
              {formatBudget(b)}
            </Button>
          ))}

          <div className="w-px h-5 bg-stone-200 mx-1" />

          <span className="text-xs text-stone-500">Invasiveness:</span>
          {(["all", "none", "minimal", "moderate"] as InvasivenessFilter[]).map(
            (i) => (
              <Button
                key={i}
                variant={invasivenessFilter === i ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 px-2 text-[11px]",
                  invasivenessFilter === i
                    ? "bg-stone-800 text-white hover:bg-stone-700"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
                )}
                onClick={() => setInvasivenessFilter(i)}
              >
                {formatInvasiveness(i)}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="space-y-4">
        {protocol.phases.map((phase) => {
          const filtered = filterSteps(
            phase.steps,
            budgetFilter,
            invasivenessFilter,
          );

          return (
            <div
              key={phase.phase}
              className={cn(
                "rounded-xl border p-4 transition-all",
                getPhaseColor(phase.phase),
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80">
                    Phase {phase.phase}
                  </span>
                  <span className="text-sm font-semibold">
                    {getPhaseLabel(phase.phase)}
                  </span>
                </div>
                <span className="text-xs font-medium opacity-80">
                  {getPhaseDuration(phase.phase)}
                </span>
              </div>

              {/* Goals */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {phase.goals.map((goal) => (
                  <Badge
                    key={goal}
                    variant="outline"
                    className="bg-white/60 text-[10px] border-white/40"
                  >
                    {goal}
                  </Badge>
                ))}
              </div>

              {/* Steps */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {filtered.map((step, idx) => (
                    <ImprovementCard
                      key={`${phase.phase}-${idx}`}
                      step={step}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 py-2">
                  No steps match your current filters for this phase.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
