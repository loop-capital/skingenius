"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Syringe, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Procedure {
  name?: string;
  date?: string;
  recovery_days?: number;
  current_day?: number;
  pre_protocol?: string[];
  post_protocol?: string[];
  restrictions?: string[];
  healing_milestones?: Array<{ day?: number; milestone?: string }>;
}

interface PostProcedureData {
  recent_procedures?: Procedure[];
  general_guidelines?: string[];
}

interface PostProcedureCardProps {
  protocol: PostProcedureData | Record<string, unknown>;
}

export function PostProcedureCard({ protocol }: PostProcedureCardProps) {
  const p = protocol as PostProcedureData;
  const procedures = p.recent_procedures ?? [];
  const guidelines = p.general_guidelines ?? [];

  if (procedures.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-muted-foreground">
            No recent procedures. This section will activate when you log a
            procedure.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {procedures.map((proc, i) => {
        const recoveryDays = proc.recovery_days ?? 14;
        const currentDay = proc.current_day ?? 0;
        const progress = Math.min(
          100,
          Math.round((currentDay / recoveryDays) * 100),
        );
        const milestones = proc.healing_milestones ?? [];

        return (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Syringe className="h-5 w-5 text-rose-500" />
                  {proc.name ?? "Procedure"}
                </CardTitle>
                <Badge variant={progress >= 100 ? "default" : "outline"}>
                  Day {currentDay}/{recoveryDays}
                </Badge>
              </div>
              {proc.date && (
                <p className="text-xs text-muted-foreground">
                  Performed: {new Date(proc.date).toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recovery Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    Recovery progress
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Healing Milestones */}
              {milestones.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Healing Timeline</p>
                  <div className="space-y-2">
                    {milestones.map((m, j) => {
                      const milestoneDay = m.day ?? 0;
                      const isReached = currentDay >= milestoneDay;
                      return (
                        <div
                          key={j}
                          className={`flex items-center gap-3 rounded-lg p-2 ${
                            isReached
                              ? "bg-green-50 dark:bg-green-950/20"
                              : "bg-muted/50"
                          }`}
                        >
                          {isReached ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-xs font-medium">
                              Day {milestoneDay}
                            </p>
                            <p className="text-sm">{m.milestone}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pre-Protocol */}
              {proc.pre_protocol && proc.pre_protocol.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">
                    Pre-Procedure Protocol
                  </p>
                  <ul className="space-y-1">
                    {proc.pre_protocol.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Post-Protocol */}
              {proc.post_protocol && proc.post_protocol.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">
                    Post-Procedure Care
                  </p>
                  <ul className="space-y-1">
                    {proc.post_protocol.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Restrictions */}
              {proc.restrictions && proc.restrictions.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Restrictions
                  </p>
                  <ul className="space-y-1">
                    {proc.restrictions.map((r, j) => (
                      <li
                        key={j}
                        className="text-xs text-amber-600 dark:text-amber-500"
                      >
                        • {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* General Guidelines */}
      {guidelines.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold mb-2">
              General Recovery Guidelines
            </h4>
            <ul className="space-y-1.5">
              {guidelines.map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  {g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
