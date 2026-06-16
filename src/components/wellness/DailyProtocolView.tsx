"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sun,
  CloudSun,
  Moon,
  Bed,
  Check,
  Clock,
  Flame,
  Droplets,
} from "lucide-react";

interface PlanItem {
  id: string;
  title: string;
  description?: string;
  dosage?: string;
  timing?: string;
  category?: string;
  priority?: string;
}

interface DailyProtocolViewProps {
  plan: Record<string, unknown>;
}

export function DailyProtocolView({ plan }: DailyProtocolViewProps) {
  const [completedItems, setCompletedItems] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [streak, setStreak] = React.useState(7);

  // Build items from plan data
  const allItems = React.useMemo(() => {
    const items: PlanItem[] = [];

    // Supplements
    const supplements =
      (plan.supplement_stack as Array<Record<string, unknown>>) ?? [];
    supplements.forEach((sup) => {
      items.push({
        id: `sup-${sup.id}`,
        title: sup.name as string,
        description: sup.dosage as string,
        timing: sup.timing as string,
        category: "supplement",
        priority: "high",
      });
    });

    // Peptides
    const peptides =
      (plan.peptide_protocol as Array<Record<string, unknown>>) ?? [];
    peptides
      .filter((p) => (p.route as string) === "topical")
      .forEach((pep) => {
        items.push({
          id: `pep-${pep.id}`,
          title: pep.name as string,
          description: `Apply ${pep.dosage as string}`,
          timing: "evening",
          category: "peptide",
          priority: "medium",
        });
      });

    // Hydration
    const hydration = plan.hydration_target as Record<string, unknown>;
    if (hydration) {
      items.push({
        id: "hydration",
        title: "Hydration Target",
        description: `${hydration.glasses as number} glasses (${hydration.daily_oz as number} oz)`,
        timing: "throughout_day",
        category: "hydration",
        priority: "high",
      });
    }

    // Sleep
    items.push({
      id: "sleep",
      title: "Sleep Optimization",
      description: "7-9 hours with consistent bedtime",
      timing: "before_bed",
      category: "sleep",
      priority: "high",
    });

    // Movement
    items.push({
      id: "movement",
      title: "Movement Protocol",
      description: "30 minutes moderate activity",
      timing: "morning_or_afternoon",
      category: "exercise",
      priority: "medium",
    });

    // Stress practice
    const stressPractices =
      ((plan.stress_protocol as Record<string, unknown>)
        ?.daily_practices as Array<Record<string, unknown>>) ?? [];
    if (stressPractices[0]) {
      items.push({
        id: "stress",
        title: stressPractices[0].name as string,
        description: `${stressPractices[0].duration_minutes as number} min ${stressPractices[0].type as string}`,
        timing: "morning_or_evening",
        category: "stress",
        priority: "medium",
      });
    }

    return items;
  }, [plan]);

  const morningItems = allItems.filter(
    (i) =>
      i.timing === "morning" ||
      i.timing === "morning_or_afternoon" ||
      i.timing === "throughout_day",
  );
  const middayItems = allItems.filter((i) => i.timing === "with_meals");
  const eveningItems = allItems.filter(
    (i) => i.timing === "evening" || i.timing === "morning_or_evening",
  );
  const beforeBedItems = allItems.filter((i) => i.timing === "before_bed");

  const completedCount = completedItems.size;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  function toggleItem(id: string) {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function markAllComplete() {
    setCompletedItems(new Set(allItems.map((i) => i.id)));
    setStreak((s) => s + 1);
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today&apos;s Protocol</CardTitle>
              <p className="text-sm text-muted-foreground">{today}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
              <Flame className="h-4 w-4" />
              <span>{streak} day streak</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedCount}/{totalCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={markAllComplete}
            className="w-full"
            disabled={completedCount === totalCount}
          >
            Mark All Complete
          </Button>
        </CardContent>
      </Card>

      <TimeSection
        title="Morning"
        icon={<Sun className="h-5 w-5 text-amber-500" />}
        items={morningItems}
        completed={completedItems}
        onToggle={toggleItem}
      />

      {middayItems.length > 0 && (
        <TimeSection
          title="Midday"
          icon={<CloudSun className="h-5 w-5 text-sky-500" />}
          items={middayItems}
          completed={completedItems}
          onToggle={toggleItem}
        />
      )}

      <TimeSection
        title="Evening"
        icon={<Moon className="h-5 w-5 text-indigo-500" />}
        items={eveningItems}
        completed={completedItems}
        onToggle={toggleItem}
      />

      <TimeSection
        title="Before Bed"
        icon={<Bed className="h-5 w-5 text-violet-500" />}
        items={beforeBedItems}
        completed={completedItems}
        onToggle={toggleItem}
      />
    </div>
  );
}

function TimeSection({
  title,
  icon,
  items,
  completed,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  items: PlanItem[];
  completed: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <ProtocolItemRow
            key={item.id}
            item={item}
            isComplete={completed.has(item.id)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ProtocolItemRow({
  item,
  isComplete,
  onToggle,
}: {
  item: PlanItem;
  isComplete: boolean;
  onToggle: () => void;
}) {
  const categoryIcons: Record<string, React.ReactNode> = {
    supplement: <Pill className="h-4 w-4" />,
    peptide: <Droplets className="h-4 w-4" />,
    hydration: <Droplets className="h-4 w-4 text-blue-500" />,
    sleep: <Bed className="h-4 w-4" />,
    exercise: <Activity className="h-4 w-4" />,
    stress: <Brain className="h-4 w-4" />,
  };

  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
        isComplete ? "bg-muted/30 opacity-60" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
          isComplete
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        }`}
      >
        {isComplete && <Check className="h-3.5 w-3.5" />}
      </div>

      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          {categoryIcons[item.category ?? ""] ?? <Clock className="h-4 w-4" />}
          <span
            className={`text-sm font-medium ${isComplete ? "line-through" : ""}`}
          >
            {item.title}
          </span>
          {item.priority === "high" && (
            <Badge variant="outline" className="text-xs">
              High
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
    </button>
  );
}

// Icon placeholders for categories not in lucide-react import above
function Pill({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function Brain({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z" />
    </svg>
  );
}
