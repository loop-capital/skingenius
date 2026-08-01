"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AestheticScores, FacialMetrics } from "@/types/facial-aesthetics";
import type { AestheticProtocol as AestheticProtocolType } from "@/types/facial-aesthetics";
import { AestheticScoreCard } from "./AestheticScoreCard";
import { FeatureBreakdown } from "./FeatureBreakdown";
import { AestheticProtocol } from "./AestheticProtocol";
import { Button } from "@/components/ui/button";

type TabKey = "overview" | "features" | "protocol";

interface AestheticsTabProps {
  analysisId: string;
  scores: AestheticScores;
  metrics: FacialMetrics;
  protocol?: AestheticProtocolType | null;
  loading?: boolean;
  error?: string | null;
  onGenerateProtocol?: () => void;
  className?: string;
}

export function AestheticsTab({
  analysisId,
  scores,
  metrics,
  protocol,
  loading = false,
  error = null,
  onGenerateProtocol,
  className,
}: AestheticsTabProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (loading) {
    return (
      <div
        className={cn(
          "space-y-4 rounded-xl border border-stone-200 bg-white p-6",
          className,
        )}
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-500" />
            <p className="text-sm text-stone-500">
              Analyzing facial aesthetics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "space-y-4 rounded-xl border border-red-200 bg-red-50 p-6",
          className,
        )}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-700">Analysis Error</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
        {(
          [
            { key: "overview" as TabKey, label: "Overview" },
            { key: "features" as TabKey, label: "Features" },
            { key: "protocol" as TabKey, label: "Protocol" },
          ] as { key: TabKey; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              activeTab === tab.key
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <AestheticScoreCard scores={scores} />
            <FeatureBreakdown metrics={metrics} scores={scores} />
          </div>
        )}

        {activeTab === "features" && (
          <FeatureBreakdown metrics={metrics} scores={scores} />
        )}

        {activeTab === "protocol" && (
          <>
            {protocol ? (
              <AestheticProtocol protocol={protocol} />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center">
                <p className="text-sm font-medium text-stone-700">
                  No protocol generated yet
                </p>
                <p className="text-xs text-stone-500">
                  Generate a personalized protocol based on your analysis.
                </p>
                <Button
                  size="sm"
                  className="mt-1 bg-stone-800 hover:bg-stone-700"
                  onClick={onGenerateProtocol}
                  disabled={!onGenerateProtocol}
                >
                  Generate Protocol
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
