"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Sparkles, ArrowRight } from "lucide-react";

interface TriadProtocol {
  system?: string;
  status?: string;
  interventions?: string[];
  foods?: string[];
  supplements?: string[];
}

interface GutBrainSkinData {
  explanation?: string;
  gut_status?: string;
  brain_status?: string;
  skin_status?: string;
  protocols?: TriadProtocol[];
  connection_map?: Array<{ from?: string; to?: string; mechanism?: string }>;
  recommendations?: string[];
}

interface GutBrainSkinTriadProps {
  protocol: GutBrainSkinData | Record<string, unknown>;
}

export function GutBrainSkinTriad({ protocol }: GutBrainSkinTriadProps) {
  const p = protocol as GutBrainSkinData;
  const protocols = p.protocols ?? [];
  const connections = p.connection_map ?? [];
  const recommendations = p.recommendations ?? [];

  return (
    <div className="space-y-4">
      {/* Triad Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Gut-Brain-Skin Axis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {p.explanation && (
            <p className="text-sm text-muted-foreground">{p.explanation}</p>
          )}

          {/* Triangle Visualization */}
          <div className="relative flex justify-center py-4">
            <svg viewBox="0 0 200 180" className="w-48 h-44">
              {/* Triangle lines */}
              <line
                x1="100"
                y1="20"
                x2="30"
                y2="160"
                stroke="currentColor"
                strokeWidth="2"
                className="text-violet-200 dark:text-violet-900"
              />
              <line
                x1="100"
                y1="20"
                x2="170"
                y2="160"
                stroke="currentColor"
                strokeWidth="2"
                className="text-violet-200 dark:text-violet-900"
              />
              <line
                x1="30"
                y1="160"
                x2="170"
                y2="160"
                stroke="currentColor"
                strokeWidth="2"
                className="text-violet-200 dark:text-violet-900"
              />

              {/* Gut (top) */}
              <circle
                cx="100"
                cy="20"
                r="18"
                fill="rgb(220 252 231)"
                stroke="rgb(34 197 94)"
                strokeWidth="1.5"
              />
              <text
                x="100"
                y="25"
                textAnchor="middle"
                className="text-[10px] font-medium fill-green-700"
              >
                Gut
              </text>

              {/* Brain (bottom-left) */}
              <circle
                cx="30"
                cy="160"
                r="18"
                fill="rgb(243 232 255)"
                stroke="rgb(168 85 247)"
                strokeWidth="1.5"
              />
              <text
                x="30"
                y="165"
                textAnchor="middle"
                className="text-[10px] font-medium fill-purple-700"
              >
                Brain
              </text>

              {/* Skin (bottom-right) */}
              <circle
                cx="170"
                cy="160"
                r="18"
                fill="rgb(255 228 230)"
                stroke="rgb(244 63 94)"
                strokeWidth="1.5"
              />
              <text
                x="170"
                y="165"
                textAnchor="middle"
                className="text-[10px] font-medium fill-rose-700 dark:fill-rose-400"
              >
                Skin
              </text>
            </svg>
          </div>

          {/* Status Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {p.gut_status && (
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/20">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                  Gut
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {p.gut_status}
                </Badge>
              </div>
            )}
            {p.brain_status && (
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/20">
                <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                  Brain
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {p.brain_status}
                </Badge>
              </div>
            )}
            {p.skin_status && (
              <div className="rounded-lg bg-rose-50 p-2 dark:bg-rose-950/20">
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                  Skin
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {p.skin_status}
                </Badge>
              </div>
            )}
          </div>

          {/* Connection Map */}
          {connections.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Connections:
              </p>
              <div className="space-y-1.5">
                {connections.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="font-medium">{c.from}</span>
                    <ArrowRight className="h-3 w-3 text-violet-400" />
                    <span className="font-medium">{c.to}</span>
                    {c.mechanism && <span>— {c.mechanism}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Protocols */}
      {protocols.map((proto, i) => {
        const systemIcons: Record<string, React.ReactNode> = {
          gut: <Sparkles className="h-4 w-4 text-green-500" />,
          brain: <Brain className="h-4 w-4 text-purple-500" />,
          skin: <Heart className="h-4 w-4 text-rose-500" />,
        };

        return (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {systemIcons[(proto.system ?? "").toLowerCase()] ?? (
                  <Sparkles className="h-4 w-4 text-violet-500" />
                )}
                <span className="capitalize">{proto.system ?? "System"}</span>
                {proto.status && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {proto.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proto.interventions && proto.interventions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Interventions:
                  </p>
                  <ul className="space-y-1">
                    {proto.interventions.map((int, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                        {int}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {proto.foods && proto.foods.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Key Foods:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {proto.foods.map((f, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {proto.supplements && proto.supplements.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Supplements:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {proto.supplements.map((s, j) => (
                      <Badge key={j} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-2">
              Triad Recommendations
            </h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
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
