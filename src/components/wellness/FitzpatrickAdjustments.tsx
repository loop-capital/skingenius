"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Shield, AlertTriangle, Palette } from "lucide-react";

interface Adjustment {
  category?: string;
  adjustment?: string;
  reason?: string;
  priority?: string;
}

interface FitzpatrickData {
  fitzpatrick_type?: number;
  type_name?: string;
  characteristics?: string[];
  adjustments?: Adjustment[];
  uv_sensitivity?: string;
  vitamin_d_notes?: string;
  pigmentation_risk?: string;
}

interface FitzpatrickAdjustmentsProps {
  adjustments: FitzpatrickData | Record<string, unknown>;
}

const typeColors: Record<number, string> = {
  1: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
  2: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900",
  3: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  4: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900",
  5: "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-950 dark:text-lime-400 dark:border-lime-900",
  6: "bg-stone-200 text-stone-700 border-stone-300 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export function FitzpatrickAdjustments({
  adjustments,
}: FitzpatrickAdjustmentsProps) {
  const f = adjustments as FitzpatrickData;
  const type = f.fitzpatrick_type ?? 3;
  const adjList = f.adjustments ?? [];
  const characteristics = f.characteristics ?? [];

  return (
    <div className="space-y-4">
      {/* Skin Type Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-amber-500" />
            Fitzpatrick Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-bold ${
                typeColors[type] ?? typeColors[3]
              }`}
            >
              {type}
            </div>
            <div>
              <p className="font-semibold">{f.type_name ?? `Type ${type}`}</p>
              {f.uv_sensitivity && (
                <p className="text-xs text-muted-foreground">
                  UV Sensitivity: {f.uv_sensitivity}
                </p>
              )}
            </div>
          </div>

          {characteristics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {characteristics.map((c, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          {f.pigmentation_risk && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Pigmentation risk: {f.pigmentation_risk}
              </p>
            </div>
          )}

          {f.vitamin_d_notes && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <Sun className="inline h-3.5 w-3.5 mr-1" />
                Vitamin D: {f.vitamin_d_notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjustments */}
      {adjList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-amber-500" />
              Plan Modifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adjList.map((adj, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">
                      {adj.category ?? "Adjustment"}
                    </p>
                    {adj.priority && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${priorityColors[adj.priority.toLowerCase()] ?? ""}`}
                      >
                        {adj.priority}
                      </Badge>
                    )}
                  </div>
                  {adj.adjustment && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {adj.adjustment}
                    </p>
                  )}
                  {adj.reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {adj.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
