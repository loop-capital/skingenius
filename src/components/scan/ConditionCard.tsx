import { cn } from "@/lib/utils";
import {
  type SeverityLevel,
  SEVERITY_CONFIG,
} from "./scan-config";
import type { V1DetectedCondition } from "@/types/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ConditionCardProps {
  condition: V1DetectedCondition;
  className?: string;
}

/**
 * Single condition result card.
 * Displays name, confidence %, severity badge,
 * feature list, and zone indicator.
 */
export function ConditionCard({
  condition,
  className,
}: ConditionCardProps): React.ReactElement {
  const severityConfig =
    SEVERITY_CONFIG[condition.severity as SeverityLevel] ??
    SEVERITY_CONFIG.mild;
  const confidencePct = Math.round(condition.confidence * 100);

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Top accent bar colored by severity */}
      <div
        className={cn(
          "h-1.5 w-full transition-all duration-300",
          severityConfig.barColor
        )}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-snug tracking-tight text-stone-800">
              {condition.name}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-stone-500">
              Detected in <span className="font-medium capitalize">{condition.zone}</span>
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-xs font-medium capitalize",
              severityConfig.className
            )}
          >
            <span
              className={cn(
                "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                severityConfig.dotClassName
              )}
            />
            {severityConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Confidence bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Confidence</span>
            <span className="font-semibold text-stone-700">{confidencePct}%</span>
          </div>
          <Progress
            value={confidencePct}
            className="h-2"
          />
        </div>

        {/* Features list */}
        {condition.features && condition.features.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-stone-600">
              Detected features
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {condition.features.map((feature) => (
                <li
                  key={feature}
                  className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
