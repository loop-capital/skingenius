"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

interface Medication {
  name?: string;
  category?: string;
  nutrient_depletions?: string[];
  skin_impact?: string;
  plan_adjustments?: string[];
  severity?: string;
}

interface MedicationData {
  medications?: Medication[];
  general_warnings?: string[];
  nutrient_replenishment?: Array<{
    nutrient?: string;
    supplement?: string;
    dosage?: string;
  }>;
}

interface MedicationInteractionsProps {
  medications: MedicationData | Record<string, unknown>;
}

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  moderate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export function MedicationInteractions({
  medications,
}: MedicationInteractionsProps) {
  const m = medications as MedicationData;
  const meds = m.medications ?? [];
  const warnings = m.general_warnings ?? [];
  const replenishment = m.nutrient_replenishment ?? [];

  if (meds.length === 0 && warnings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-muted-foreground">
            No medication interactions detected. Your plan is clear.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Important Warnings
                </p>
                <ul className="mt-1 space-y-1">
                  {warnings.map((w, i) => (
                    <li
                      key={i}
                      className="text-xs text-amber-600 dark:text-amber-500"
                    >
                      • {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      {meds.map((med, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4 text-rose-500" />
                {med.name ?? "Medication"}
              </CardTitle>
              {med.severity && (
                <Badge
                  variant="outline"
                  className={`text-xs ${severityColors[med.severity.toLowerCase()] ?? ""}`}
                >
                  {med.severity} risk
                </Badge>
              )}
            </div>
            {med.category && (
              <p className="text-xs text-muted-foreground">{med.category}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Nutrient Depletions */}
            {med.nutrient_depletions && med.nutrient_depletions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  May deplete:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {med.nutrient_depletions.map((n, j) => (
                    <Badge key={j} variant="destructive" className="text-xs">
                      {n}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skin Impact */}
            {med.skin_impact && (
              <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/20">
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  <ArrowRight className="inline h-3 w-3 mr-1" />
                  Skin impact: {med.skin_impact}
                </p>
              </div>
            )}

            {/* Plan Adjustments */}
            {med.plan_adjustments && med.plan_adjustments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Plan adjustments:
                </p>
                <ul className="space-y-1">
                  {med.plan_adjustments.map((a, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Nutrient Replenishment */}
      {replenishment.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Recommended Replenishment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {replenishment.map((nr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {nr.nutrient ?? "Nutrient"}
                    </p>
                    {nr.supplement && (
                      <p className="text-xs text-muted-foreground">
                        {nr.supplement}
                      </p>
                    )}
                  </div>
                  {nr.dosage && (
                    <Badge variant="outline" className="text-xs">
                      {nr.dosage}
                    </Badge>
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
