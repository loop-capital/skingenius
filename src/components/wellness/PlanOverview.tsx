"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface PlanOverviewProps {
  goals: Array<{ goal: string; from: string }>;
}

export function PlanOverview({ goals }: PlanOverviewProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Primary Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Based on your skin scan, lifestyle, and biomarkers
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {goals.map((g, i) => (
            <GoalCard key={i} goal={g} index={i} />
          ))}
        </div>

        {goals.length > 0 && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan Completeness</span>
              <span className="font-medium">
                {Math.min(goals.length * 25, 100)}%
              </span>
            </div>
            <Progress
              value={Math.min(goals.length * 25, 100)}
              className="mt-2 h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalCard({
  goal,
  index,
}: {
  goal: { goal: string; from: string };
  index: number;
}) {
  const icons = [TrendingUp, TrendingDown, AlertTriangle, Target];
  const Icon = icons[index % icons.length];

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{goal.goal}</p>
        <Badge variant="secondary" className="text-xs">
          {goal.from}
        </Badge>
      </div>
    </div>
  );
}
