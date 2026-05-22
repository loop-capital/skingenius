"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ConditionCard } from "./ConditionCard";
import type { V1DetectedCondition } from "@/types/api";
import { type SeverityLevel, SEVERITY_CONFIG } from "./scan-config";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ConditionsGridProps {
  conditions: V1DetectedCondition[];
  className?: string;
}

type SortMode = "confidence" | "severity";
type FilterMode = "all" | SeverityLevel;

const SEVERITY_RANK: Record<SeverityLevel, number> = {
  severe: 3,
  moderate: 2,
  mild: 1,
};

/**
 * Responsive grid of condition cards.
 * Supports sorting by confidence / severity and filtering by severity tab.
 */
export function ConditionsGrid({
  conditions,
  className,
}: ConditionsGridProps): React.ReactElement {
  const [sort, setSort] = useState<SortMode>("confidence");
  const [filter, setFilter] = useState<FilterMode>("all");

  const filteredAndSorted = useMemo(() => {
    let out = [...conditions];

    if (filter !== "all") {
      out = out.filter((c) => c.severity === filter);
    }

    out.sort((a, b) => {
      if (sort === "confidence") {
        return b.confidence - a.confidence;
      }
      return (
        (SEVERITY_RANK[b.severity as SeverityLevel] ?? 0) -
        (SEVERITY_RANK[a.severity as SeverityLevel] ?? 0)
      );
    });

    return out;
  }, [conditions, sort, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: conditions.length };
    (Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).forEach((s) => {
      c[s] = conditions.filter((x) => x.severity === s).length;
    });
    return c;
  }, [conditions]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-stone-800">
          Detected Conditions
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="confidence">Confidence</option>
            <option value="severity">Severity</option>
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as FilterMode)}
      >
        <TabsList className="h-8 w-full bg-stone-100 p-1 sm:w-auto">
          {(
            [
              { key: "all", label: "All" },
              { key: "mild", label: "Mild" },
              { key: "moderate", label: "Moderate" },
              { key: "severe", label: "Severe" },
            ] as { key: FilterMode; label: string }[]
          ).map(({ key, label }) => (
            <TabsTrigger
              key={key}
              value={key}
              className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              {label}
              <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-stone-200 px-1 text-[10px] font-medium text-stone-600">
                {counts[key] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {filteredAndSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 py-12 text-center">
              <p className="text-sm text-stone-500">
                No conditions match this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAndSorted.map((condition) => (
                <ConditionCard
                  key={condition.condition_id}
                  condition={condition}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
