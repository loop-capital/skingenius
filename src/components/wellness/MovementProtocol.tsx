"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Timer, TrendingUp, Dumbbell } from "lucide-react";

interface Exercise {
  name?: string;
  type?: string;
  duration_minutes?: number;
  frequency?: string;
  skin_benefit?: string;
  intensity?: string;
}

interface MovementProtocolData {
  current_frequency?: string;
  recommendations?: string[];
  exercises?: Exercise[];
  weekly_goal_minutes?: number;
  current_minutes?: number;
  skin_goals?: string[];
}

interface MovementProtocolProps {
  protocol: MovementProtocolData | Record<string, unknown>;
}

const intensityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  moderate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function MovementProtocol({ protocol }: MovementProtocolProps) {
  const p = protocol as MovementProtocolData;
  const exercises = p.exercises ?? [];
  const recommendations = p.recommendations ?? [];
  const weeklyGoal = p.weekly_goal_minutes ?? 150;
  const currentMinutes = p.current_minutes ?? 0;
  const progress = Math.min(
    100,
    Math.round((currentMinutes / weeklyGoal) * 100),
  );
  const skinGoals = p.skin_goals ?? [];

  return (
    <div className="space-y-4">
      {/* Weekly Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-emerald-500" />
            Movement Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This week</span>
            <span className="font-medium">
              {currentMinutes} / {weeklyGoal} min
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Frequency:{" "}
              <span className="font-medium capitalize">
                {p.current_frequency ?? "Not set"}
              </span>
            </p>
            {skinGoals.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-end">
                {skinGoals.map((g, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Recommendations */}
      {exercises.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="h-4 w-4 text-emerald-500" />
              Recommended Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {ex.name ?? "Exercise"}
                      </p>
                      {ex.type && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {String(ex.type).replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                    {ex.intensity && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${intensityColors[ex.intensity.toLowerCase()] ?? ""}`}
                      >
                        {ex.intensity}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {ex.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {ex.duration_minutes} min
                      </span>
                    )}
                    {ex.frequency && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {ex.frequency}
                      </span>
                    )}
                  </div>
                  {ex.skin_benefit && (
                    <div className="mt-2 rounded-md bg-emerald-50 p-2 dark:bg-emerald-950/20">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        Skin benefit: {ex.skin_benefit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-2">Guidelines</h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
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
