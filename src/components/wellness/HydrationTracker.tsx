"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus } from "lucide-react";

interface HydrationData {
  daily_target_ml?: number;
  daily_target_oz?: number;
  current_intake_ml?: number;
  glass_size_ml?: number;
  recommendations?: string[];
  factors?: string[];
}

interface HydrationTrackerProps {
  protocol: HydrationData | Record<string, unknown>;
}

export function HydrationTracker({ protocol }: HydrationTrackerProps) {
  const p = protocol as HydrationData;
  const targetMl = p.daily_target_ml ?? 2500;
  const glassSize = p.glass_size_ml ?? 250;
  const [intake, setIntake] = React.useState(p.current_intake_ml ?? 0);
  const recommendations = p.recommendations ?? [];
  const factors = p.factors ?? [];

  const progress = Math.min(100, Math.round((intake / targetMl) * 100));
  const glassesTotal = Math.ceil(targetMl / glassSize);
  const glassesCurrent = Math.floor(intake / glassSize);

  function addWater() {
    setIntake((prev) => Math.min(targetMl * 1.5, prev + glassSize));
  }

  function removeWater() {
    setIntake((prev) => Math.max(0, prev - glassSize));
  }

  // SVG progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Droplets className="h-5 w-5 text-blue-500" />
            Hydration Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Ring */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <svg width="180" height="180" className="-rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-blue-100 dark:text-blue-950"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="text-blue-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{progress}%</span>
                <span className="text-xs text-muted-foreground">
                  {intake} / {targetMl} ml
                </span>
              </div>
            </div>
          </div>

          {/* Glass Counter */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={removeWater}
              disabled={intake <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-2xl font-bold">{glassesCurrent}</p>
              <p className="text-xs text-muted-foreground">
                of {glassesTotal} glasses ({glassSize}ml each)
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={addWater}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Factors */}
          {factors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Factors affecting your target:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {factors.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-2">Hydration Tips</h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
