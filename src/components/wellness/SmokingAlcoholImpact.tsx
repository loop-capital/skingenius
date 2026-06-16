"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Cigarette,
  Wine,
  TrendingDown,
  AlertTriangle,
  Heart,
} from "lucide-react";

interface ImpactFactor {
  factor?: string;
  impact_level?: number;
  description?: string;
  reversible?: boolean;
}

interface ReductionStep {
  week?: number;
  action?: string;
  target?: string;
}

interface SmokingAlcoholData {
  smoking_status?: string;
  alcohol_status?: string;
  smoking_impact?: ImpactFactor[];
  alcohol_impact?: ImpactFactor[];
  skin_impact_score?: number;
  reduction_plan?: ReductionStep[];
  benefits_timeline?: Array<{ timeframe?: string; benefit?: string }>;
  recommendations?: string[];
}

interface SmokingAlcoholImpactProps {
  protocol: SmokingAlcoholData | Record<string, unknown>;
}

export function SmokingAlcoholImpact({ protocol }: SmokingAlcoholImpactProps) {
  const p = protocol as SmokingAlcoholData;
  const smokingImpact = p.smoking_impact ?? [];
  const alcoholImpact = p.alcohol_impact ?? [];
  const reductionPlan = p.reduction_plan ?? [];
  const benefitsTimeline = p.benefits_timeline ?? [];
  const recommendations = p.recommendations ?? [];

  const hasSmoking =
    (p.smoking_status ?? "").toLowerCase() !== "none" && p.smoking_status;
  const hasAlcohol =
    (p.alcohol_status ?? "").toLowerCase() !== "none" && p.alcohol_status;

  if (
    !hasSmoking &&
    !hasAlcohol &&
    smokingImpact.length === 0 &&
    alcoholImpact.length === 0
  ) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Heart className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-muted-foreground">
            No smoking or alcohol impact detected. Great lifestyle choices for
            your skin!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Impact Score */}
      {p.skin_impact_score !== undefined && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Lifestyle Impact on Skin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Skin impact score</span>
              <span className="font-medium text-red-600">
                {p.skin_impact_score}/100
              </span>
            </div>
            <Progress
              value={100 - (p.skin_impact_score ?? 0)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground text-center">
              Higher = more negative impact. Reducing habits improves this
              score.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Smoking Impact */}
      {hasSmoking && smokingImpact.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cigarette className="h-4 w-4 text-orange-500" />
              Smoking Impact
              <Badge variant="outline" className="text-xs ml-auto capitalize">
                {p.smoking_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smokingImpact.map((imp, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">
                      {imp.factor ?? "Impact"}
                    </p>
                    {imp.impact_level !== undefined && (
                      <Badge
                        variant={
                          imp.impact_level > 7 ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {imp.impact_level}/10
                      </Badge>
                    )}
                  </div>
                  {imp.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {imp.description}
                    </p>
                  )}
                  {imp.reversible !== undefined && (
                    <p className="text-xs mt-1">
                      {imp.reversible ? (
                        <span className="text-green-600">
                          ✓ Reversible with cessation
                        </span>
                      ) : (
                        <span className="text-red-600">✗ Permanent damage</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alcohol Impact */}
      {hasAlcohol && alcoholImpact.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wine className="h-4 w-4 text-purple-500" />
              Alcohol Impact
              <Badge variant="outline" className="text-xs ml-auto capitalize">
                {p.alcohol_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alcoholImpact.map((imp, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">
                      {imp.factor ?? "Impact"}
                    </p>
                    {imp.impact_level !== undefined && (
                      <Badge
                        variant={
                          imp.impact_level > 7 ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {imp.impact_level}/10
                      </Badge>
                    )}
                  </div>
                  {imp.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {imp.description}
                    </p>
                  )}
                  {imp.reversible !== undefined && (
                    <p className="text-xs mt-1">
                      {imp.reversible ? (
                        <span className="text-green-600">
                          ✓ Reversible with reduction
                        </span>
                      ) : (
                        <span className="text-red-600">✗ Long-term effect</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reduction Plan */}
      {reductionPlan.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Reduction Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reductionPlan.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-xs font-bold">
                    W{step.week ?? i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.action}</p>
                    {step.target && (
                      <p className="text-xs text-muted-foreground">
                        Target: {step.target}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Timeline */}
      {benefitsTimeline.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-rose-500" />
              Recovery Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {benefitsTimeline.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  <div>
                    <p className="text-xs font-medium text-green-600">
                      {b.timeframe}
                    </p>
                    <p className="text-sm text-muted-foreground">{b.benefit}</p>
                  </div>
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
            <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
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
