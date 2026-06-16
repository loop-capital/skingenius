"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

interface OralProtocol {
  name?: string;
  type?: string;
  instructions?: string;
  frequency?: string;
  skin_connection?: string;
}

interface OralMicrobiomeData {
  connection_explanation?: string;
  oral_health_score?: number;
  protocols?: OralProtocol[];
  products_to_avoid?: string[];
  recommended_products?: string[];
  risk_factors?: string[];
}

interface OralMicrobiomeCardProps {
  protocol: OralMicrobiomeData | Record<string, unknown>;
}

export function OralMicrobiomeCard({ protocol }: OralMicrobiomeCardProps) {
  const p = protocol as OralMicrobiomeData;
  const protocols = p.protocols ?? [];
  const avoidProducts = p.products_to_avoid ?? [];
  const recProducts = p.recommended_products ?? [];
  const riskFactors = p.risk_factors ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smile className="h-5 w-5 text-teal-500" />
            Oral-Skin Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {p.connection_explanation && (
            <p className="text-sm text-muted-foreground">
              {p.connection_explanation}
            </p>
          )}

          {p.oral_health_score !== undefined && (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 text-lg font-bold">
                {p.oral_health_score}
              </div>
              <div>
                <p className="text-sm font-medium">Oral Health Score</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>
          )}

          {riskFactors.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Risk Factors
              </p>
              <div className="flex flex-wrap gap-1.5">
                {riskFactors.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Protocols */}
      {protocols.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              Oral Health Protocols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {protocols.map((proto, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {proto.name ?? "Protocol"}
                      </p>
                      {proto.type && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {proto.type}
                        </p>
                      )}
                    </div>
                    {proto.frequency && (
                      <Badge variant="outline" className="text-xs">
                        {proto.frequency}
                      </Badge>
                    )}
                  </div>
                  {proto.instructions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {proto.instructions}
                    </p>
                  )}
                  {proto.skin_connection && (
                    <div className="mt-2 rounded-md bg-teal-50 p-2 dark:bg-teal-950/20">
                      <p className="text-xs text-teal-700 dark:text-teal-400">
                        <ArrowRight className="inline h-3 w-3 mr-1" />
                        Skin link: {proto.skin_connection}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      <div className="grid gap-4 sm:grid-cols-2">
        {avoidProducts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">
                Avoid
              </h4>
              <ul className="space-y-1">
                {avoidProducts.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    • {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {recProducts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
                Recommended
              </h4>
              <ul className="space-y-1">
                {recProducts.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    • {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
