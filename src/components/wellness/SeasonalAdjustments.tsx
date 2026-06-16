"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudSun, Snowflake, Sun, Leaf, Droplets, Wind } from "lucide-react";

interface SeasonAdjustment {
  season?: string;
  climate?: string;
  adjustments?: string[];
  products?: string[];
  precautions?: string[];
}

interface SeasonalData {
  current_season?: string;
  current_climate?: string;
  adjustments?: SeasonAdjustment[];
  humidity_notes?: string;
  temperature_notes?: string;
}

interface SeasonalAdjustmentsProps {
  adjustments: SeasonalData | Record<string, unknown>;
}

const seasonIcons: Record<string, React.ReactNode> = {
  spring: <Leaf className="h-5 w-5 text-green-500" />,
  summer: <Sun className="h-5 w-5 text-yellow-500" />,
  fall: <Leaf className="h-5 w-5 text-orange-500" />,
  autumn: <Leaf className="h-5 w-5 text-orange-500" />,
  winter: <Snowflake className="h-5 w-5 text-blue-500" />,
};

export function SeasonalAdjustments({ adjustments }: SeasonalAdjustmentsProps) {
  const s = adjustments as SeasonalData;
  const adjList = s.adjustments ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CloudSun className="h-5 w-5 text-sky-500" />
            Seasonal Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            {seasonIcons[(s.current_season ?? "").toLowerCase()] ?? (
              <CloudSun className="h-5 w-5 text-sky-500" />
            )}
            <div>
              <p className="font-medium capitalize">
                {s.current_season ?? "Current"}
              </p>
              {s.current_climate && (
                <p className="text-xs text-muted-foreground">
                  {s.current_climate}
                </p>
              )}
            </div>
          </div>

          {s.humidity_notes && (
            <div className="flex items-start gap-2 rounded-lg bg-sky-50 p-3 dark:bg-sky-950/20">
              <Droplets className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
              <p className="text-xs text-sky-700 dark:text-sky-400">
                {s.humidity_notes}
              </p>
            </div>
          )}

          {s.temperature_notes && (
            <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
              <Wind className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-400">
                {s.temperature_notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Season Cards */}
      {adjList.map((adj, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {seasonIcons[(adj.season ?? "").toLowerCase()] ?? (
                <CloudSun className="h-4 w-4 text-sky-500" />
              )}
              <span className="capitalize">{adj.season ?? "Season"}</span>
              {adj.climate && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {adj.climate}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {adj.adjustments && adj.adjustments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Adjustments:
                </p>
                <ul className="space-y-1">
                  {adj.adjustments.map((a, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {adj.products && adj.products.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Products:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {adj.products.map((p, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {adj.precautions && adj.precautions.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                  Precautions:
                </p>
                <ul className="space-y-0.5">
                  {adj.precautions.map((p, j) => (
                    <li
                      key={j}
                      className="text-xs text-amber-600 dark:text-amber-500"
                    >
                      • {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {adjList.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CloudSun className="h-8 w-8 mx-auto mb-2 text-sky-500" />
            <p className="text-sm text-muted-foreground">
              No seasonal adjustments configured yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
