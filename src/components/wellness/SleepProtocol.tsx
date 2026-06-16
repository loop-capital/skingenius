"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Moon,
  Clock,
  Thermometer,
  Smartphone,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface CircadianTip {
  time?: string;
  action?: string;
  reason?: string;
}

interface SleepProtocolData {
  target_hours?: number;
  current_hours?: number;
  recommendations?: string[];
  circadian_tips?: CircadianTip[];
  sleep_hygiene?: string[];
  environment?: {
    temperature?: string;
    darkness?: string;
    noise?: string;
  };
}

interface SleepProtocolProps {
  protocol: SleepProtocolData | Record<string, unknown>;
}

export function SleepProtocol({ protocol }: SleepProtocolProps) {
  const [checkedItems, setCheckedItems] = React.useState<Set<number>>(
    new Set(),
  );
  const p = protocol as SleepProtocolData;

  const targetHours = p.target_hours ?? 8;
  const currentHours = p.current_hours ?? 0;
  const sleepScore = Math.min(
    100,
    Math.round((currentHours / targetHours) * 100),
  );
  const recommendations = p.recommendations ?? [];
  const circadianTips = p.circadian_tips ?? [];
  const sleepHygiene = p.sleep_hygiene ?? [];
  const environment = p.environment ?? {};

  function toggleItem(index: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Sleep Score Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-indigo-500" />
            Sleep Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-2xl font-bold">{targetHours}h</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-2xl font-bold">{currentHours}h</p>
            </div>
          </div>
          <Progress value={sleepScore} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {sleepScore}% of target sleep duration
          </p>
        </CardContent>
      </Card>

      {/* Circadian Recommendations */}
      {circadianTips.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-amber-500" />
              Circadian Rhythm Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {circadianTips.map((tip, i) => (
                <div key={i} className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    {tip.time && (
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {tip.time}
                      </p>
                    )}
                    <p className="text-sm font-medium">{tip.action}</p>
                    {tip.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tip.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sleep Hygiene Checklist */}
      {sleepHygiene.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Sleep Hygiene Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sleepHygiene.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleItem(i)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  {checkedItems.has(i) ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={`text-sm ${
                      checkedItems.has(i)
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {item}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {checkedItems.size}/{sleepHygiene.length} completed today
            </p>
          </CardContent>
        </Card>
      )}

      {/* Environment */}
      {(environment.temperature ||
        environment.darkness ||
        environment.noise) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="h-4 w-4 text-blue-500" />
              Sleep Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {environment.temperature && (
                <div className="rounded-lg border p-3 text-center">
                  <Thermometer className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="text-sm font-medium">
                    {environment.temperature}
                  </p>
                </div>
              )}
              {environment.darkness && (
                <div className="rounded-lg border p-3 text-center">
                  <Moon className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
                  <p className="text-xs text-muted-foreground">Darkness</p>
                  <p className="text-sm font-medium">{environment.darkness}</p>
                </div>
              )}
              {environment.noise && (
                <div className="rounded-lg border p-3 text-center">
                  <Smartphone className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Noise</p>
                  <p className="text-sm font-medium">{environment.noise}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
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
