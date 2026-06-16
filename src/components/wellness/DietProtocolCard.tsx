"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, ChevronUp, Utensils } from "lucide-react";

interface DietProtocol {
  id?: string;
  name?: string;
  type?: string;
  foods_include?: string[];
  foods_avoid?: string[];
  evidence_level?: string;
  description?: string;
}

interface DietProtocolCardProps {
  protocol: DietProtocol | Record<string, unknown>;
}

export function DietProtocolCard({ protocol }: DietProtocolCardProps) {
  const [showMeals, setShowMeals] = React.useState(false);

  const p = protocol as DietProtocol;
  const foodsInclude = p.foods_include ?? [];
  const foodsAvoid = p.foods_avoid ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-primary" />
            {p.name ?? "Diet Protocol"}
          </CardTitle>
          {p.evidence_level && (
            <Badge variant="outline" className="text-xs">
              Evidence: {p.evidence_level}
            </Badge>
          )}
        </div>
        {p.type && (
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {String(p.type).replace(/_/g, " ")}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {p.description && (
          <p className="text-sm text-muted-foreground">{p.description}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Foods to include */}
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/20">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" /> Eat More
            </h4>
            <ul className="space-y-1">
              {foodsInclude.slice(0, 8).map((food, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {food}
                </li>
              ))}
            </ul>
          </div>

          {/* Foods to avoid */}
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
              <X className="h-4 w-4" /> Limit / Avoid
            </h4>
            <ul className="space-y-1">
              {foodsAvoid.slice(0, 8).map((food, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {food}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMeals(!showMeals)}
          className="w-full"
        >
          {showMeals ? (
            <>
              Hide sample meals <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              View sample meals <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>

        {showMeals && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">Sample Day</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Breakfast:</span>{" "}
                Vegetable omelet with avocado, or steel-cut oats with berries
              </p>
              <p>
                <span className="font-medium text-foreground">Lunch:</span>{" "}
                Grilled salmon salad with olive oil, or quinoa bowl with roasted
                vegetables
              </p>
              <p>
                <span className="font-medium text-foreground">Dinner:</span>{" "}
                Herb-crusted chicken with sweet potato, or lentil curry
              </p>
              <p>
                <span className="font-medium text-foreground">Snacks:</span>{" "}
                Handful of walnuts, carrot sticks with hummus, green apple with
                almond butter
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
