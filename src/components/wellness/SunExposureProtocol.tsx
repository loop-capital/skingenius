"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Clock, Shield, AlertTriangle, Zap } from "lucide-react";

interface TimeWindow {
  time?: string;
  uv_index?: string;
  duration_minutes?: number;
  activity?: string;
  benefit?: string;
  risk_level?: string;
}

interface SunProtocolData {
  fitzpatrick_type?: number;
  recommended_protocols?: TimeWindow[];
  vitamin_d_target?: string;
  spf_recommendation?: string;
  peak_avoidance?: string;
  circadian_benefits?: string[];
  mitochondrial_benefits?: string[];
  risk_factors?: string[];
  recommendations?: string[];
}

interface SunExposureProtocolProps {
  protocol: SunProtocolData | Record<string, unknown>;
}

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  moderate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function SunExposureProtocol({ protocol }: SunExposureProtocolProps) {
  const p = protocol as SunProtocolData;
  const protocols = p.recommended_protocols ?? [];
  const circadianBenefits = p.circadian_benefits ?? [];
  const mitoBenefits = p.mitochondrial_benefits ?? [];
  const riskFactors = p.risk_factors ?? [];
  const recommendations = p.recommendations ?? [];

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sun className="h-5 w-5 text-yellow-500" />
            Sun Exposure Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {p.fitzpatrick_type !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Fitzpatrick Type:
              </span>
              <Badge variant="outline">{p.fitzpatrick_type}</Badge>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {p.spf_recommendation && (
              <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                  <Shield className="inline h-3.5 w-3.5 mr-1" />
                  SPF Recommendation
                </p>
                <p className="text-sm mt-1">{p.spf_recommendation}</p>
              </div>
            )}
            {p.vitamin_d_target && (
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  <Zap className="inline h-3.5 w-3.5 mr-1" />
                  Vitamin D Target
                </p>
                <p className="text-sm mt-1">{p.vitamin_d_target}</p>
              </div>
            )}
          </div>

          {p.peak_avoidance && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
              <p className="text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Peak avoidance: {p.peak_avoidance}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Windows */}
      {protocols.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-amber-500" />
              Strategic Time Windows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {protocols.map((tw, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {tw.time ?? "Time window"}
                      </p>
                      {tw.activity && (
                        <p className="text-xs text-muted-foreground">
                          {tw.activity}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {tw.uv_index && (
                        <Badge variant="outline" className="text-xs">
                          UV {tw.uv_index}
                        </Badge>
                      )}
                      {tw.risk_level && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${riskColors[tw.risk_level.toLowerCase()] ?? ""}`}
                        >
                          {tw.risk_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {tw.duration_minutes && (
                      <span>Duration: {tw.duration_minutes} min</span>
                    )}
                  </div>
                  {tw.benefit && (
                    <div className="mt-2 rounded-md bg-yellow-50 p-2 dark:bg-yellow-950/20">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        <Sun className="inline h-3 w-3 mr-1" />
                        {tw.benefit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <div className="grid gap-4 sm:grid-cols-2">
        {circadianBenefits.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-500" />
                Circadian Benefits
              </h4>
              <ul className="space-y-1">
                {circadianBenefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {mitoBenefits.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Mitochondrial Benefits
              </h4>
              <ul className="space-y-1">
                {mitoBenefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Risk Factors
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {riskFactors.map((r, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {r}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
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
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
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
