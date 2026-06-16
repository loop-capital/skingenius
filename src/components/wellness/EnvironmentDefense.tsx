"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Sun, Droplets, Wind } from "lucide-react";

interface EnvironmentDefenseData {
  recommendations?: string[];
}

interface LightTherapyData {
  morning_light?: string;
  evening_light?: string;
}

interface SunExposureData {
  recommended_protocols?: Array<{
    name?: string;
    time_window?: string;
    duration_minutes?: number;
  }>;
}

interface EnvironmentDefenseProps {
  environment: EnvironmentDefenseData | Record<string, unknown>;
  light: LightTherapyData | Record<string, unknown>;
  sun: SunExposureData | Record<string, unknown>;
}

export function EnvironmentDefense({
  environment,
  light,
  sun,
}: EnvironmentDefenseProps) {
  const envRecs =
    ((environment as EnvironmentDefenseData).recommendations as string[]) ?? [];
  const lightData = light as LightTherapyData;
  const sunProtocols =
    ((sun as SunExposureData).recommended_protocols as Array<
      Record<string, unknown>
    >) ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" /> Environmental Defense
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {envRecs.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sun className="h-5 w-5" /> Light &amp; Sun Protocol
          </h3>
          {lightData.morning_light && (
            <p className="text-sm text-muted-foreground">
              {lightData.morning_light}
            </p>
          )}
          {lightData.evening_light && (
            <p className="text-sm text-muted-foreground">
              {lightData.evening_light}
            </p>
          )}
          {sunProtocols.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-sm">Sun Exposure Protocols:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                {sunProtocols.map((p, i) => (
                  <li key={i}>
                    {p.name as string} — {p.time_window as string},{" "}
                    {p.duration_minutes as number} min
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
