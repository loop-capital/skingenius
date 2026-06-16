"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface GlycationFactor {
  name: string;
  value: string;
  points: number;
}

interface GlycationScoreProps {
  score: Record<string, unknown>;
}

export function GlycationScore({ score }: GlycationScoreProps) {
  const numericScore = (score.score as number) ?? 50;
  const riskLevel = (score.risk_level as string) ?? "MODERATE";
  const factors = (score.factors as GlycationFactor[]) ?? [];
  const interventions = (score.interventions as string[]) ?? [];

  const riskColor =
    riskLevel === "HIGH"
      ? "text-destructive"
      : riskLevel === "MODERATE"
        ? "text-amber-600"
        : "text-green-600";

  const riskBg =
    riskLevel === "HIGH"
      ? "bg-destructive/10"
      : riskLevel === "MODERATE"
        ? "bg-amber-500/10"
        : "bg-green-500/10";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Glycation Score
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score visualization */}
        <div className={`rounded-lg p-4 ${riskBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Your estimated glycation risk
              </p>
              <p className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{numericScore}</p>
              <p className="text-xs text-muted-foreground">/ 100</p>
            </div>
          </div>
          <Progress value={numericScore} className="mt-3 h-3" />
        </div>

        {/* Contributing factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Contributing Factors</p>
          <div className="space-y-2">
            {factors.map((factor, i) => (
              <FactorRow key={i} factor={factor} />
            ))}
            {factors.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Complete your lifestyle questionnaire for a personalized score.
              </p>
            )}
          </div>
        </div>

        {/* Interventions */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            Your plan targets this with:
          </p>
          <ul className="space-y-1">
            {interventions.map((intervention, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                {intervention}
              </li>
            ))}
          </ul>
        </div>

        {numericScore > 60 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Consider adding a CGM for real-time glucose data to refine your
              glycation risk assessment and plan adjustments.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FactorRow({ factor }: { factor: GlycationFactor }) {
  const isPositive = factor.points > 0;

  return (
    <div className="flex items-center justify-between rounded-lg border p-2.5">
      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-red-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-green-500" />
        )}
        <span className="text-sm">{factor.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{factor.value}</span>
        <Badge
          variant={isPositive ? "destructive" : "secondary"}
          className="text-xs"
        >
          {isPositive ? "+" : ""}
          {factor.points}
        </Badge>
      </div>
    </div>
  );
}
