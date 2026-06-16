"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Wind, Leaf, Heart, Timer } from "lucide-react";

interface BreathworkExercise {
  name?: string;
  technique?: string;
  duration_minutes?: number;
  instructions?: string;
}

interface Adaptogen {
  name?: string;
  dosage?: string;
  mechanism?: string;
  evidence_level?: string;
  timing?: string;
}

interface MindfulnessPractice {
  name?: string;
  type?: string;
  duration_minutes?: string;
  instructions?: string;
}

interface PsychodermData {
  current_stress_level?: string;
  skin_stress_markers?: string[];
  breathwork?: BreathworkExercise[];
  mindfulness?: MindfulnessPractice[];
  adaptogens?: Adaptogen[];
  daily_practices?: Array<{
    name?: string;
    instructions?: string;
    duration?: string;
  }>;
  recommendations?: string[];
}

interface PsychodermProtocolProps {
  protocol: PsychodermData | Record<string, unknown>;
}

export function PsychodermProtocol({ protocol }: PsychodermProtocolProps) {
  const p = protocol as PsychodermData;
  const breathwork = p.breathwork ?? [];
  const mindfulness = p.mindfulness ?? [];
  const adaptogens = p.adaptogens ?? [];
  const dailyPractices = p.daily_practices ?? [];
  const stressMarkers = p.skin_stress_markers ?? [];
  const recommendations = p.recommendations ?? [];

  return (
    <div className="space-y-4">
      {/* Stress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-500" />
            Psychodermatology Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {p.current_stress_level && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Stress level:
              </span>
              <Badge variant="outline" className="capitalize">
                {p.current_stress_level}
              </Badge>
            </div>
          )}
          {stressMarkers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Skin stress markers:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stressMarkers.map((m, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breathwork */}
      {breathwork.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wind className="h-4 w-4 text-sky-500" />
              Breathwork Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breathwork.map((ex, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">
                      {ex.name ?? "Breathwork"}
                    </p>
                    {ex.duration_minutes && (
                      <Badge variant="outline" className="text-xs">
                        <Timer className="h-3 w-3 mr-1" />
                        {ex.duration_minutes} min
                      </Badge>
                    )}
                  </div>
                  {ex.technique && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {ex.technique}
                    </p>
                  )}
                  {ex.instructions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {ex.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mindfulness */}
      {mindfulness.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-rose-500" />
              Mindfulness Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mindfulness.map((m, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {m.name ?? "Practice"}
                      </p>
                      {m.type && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {m.type}
                        </p>
                      )}
                    </div>
                    {m.duration_minutes && (
                      <Badge variant="outline" className="text-xs">
                        {m.duration_minutes}
                      </Badge>
                    )}
                  </div>
                  {m.instructions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {m.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptogens */}
      {adaptogens.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="h-4 w-4 text-green-500" />
              Adaptogenic Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adaptogens.map((a, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">
                      {a.name ?? "Adaptogen"}
                    </p>
                    {a.evidence_level && (
                      <Badge variant="outline" className="text-xs">
                        {a.evidence_level}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {a.dosage && <span>Dosage: {a.dosage}</span>}
                    {a.timing && <span>• Timing: {a.timing}</span>}
                  </div>
                  {a.mechanism && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {a.mechanism}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Practices */}
      {dailyPractices.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-3">
              Daily Stress-Skin Practices
            </h4>
            <div className="space-y-2">
              {dailyPractices.map((dp, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20"
                >
                  <p className="text-sm font-medium">{dp.name}</p>
                  {dp.instructions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {dp.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-2">
              Additional Recommendations
            </h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
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
