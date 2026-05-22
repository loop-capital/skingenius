import { cn } from "@/lib/utils";
import type { RecommendationResult } from "@/lib/recommendations/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EVIDENCE_CONFIG } from "./scan-config";

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  className?: string;
}

/**
 * Product recommendation card.
 * Shows name/brand, fit score, evidence badge,
 * key actives, pregnancy safety, price tier, reasoning,
 * and condition tags.
 */
export function RecommendationCard({
  recommendation,
  className,
}: RecommendationCardProps): React.ReactElement {
  const evidenceCfg =
    EVIDENCE_CONFIG[recommendation.evidence_level] ??
    EVIDENCE_CONFIG.D;

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-snug tracking-tight text-stone-800">
              {recommendation.name}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-stone-500">
              {recommendation.brand}
            </CardDescription>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                evidenceCfg.className
              )}
            >
              {evidenceCfg.label}
            </Badge>
            {recommendation.pregnancy_safe && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-emerald-700 border-emerald-200 bg-emerald-50"
              >
                Pregnancy Safe
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fit score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Fit Score</span>
            <span className="font-semibold text-emerald-700">
              {recommendation.fit_score}%
            </span>
          </div>
          <Progress
            value={recommendation.fit_score}
            className="h-2"
          />
        </div>

        {/* Key actives */}
        {recommendation.key_actives &&
          recommendation.key_actives.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-stone-600">
                Key Actives
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {recommendation.key_actives.map((active) => (
                  <li
                    key={active.ingredient}
                    className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
                  >
                    {active.ingredient}
                    {active.concentration && (
                      <span className="ml-0.5 text-emerald-500">
                        · {active.concentration}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Price + category row */}
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-600">
            {recommendation.price_tier}
          </span>
          <span className="capitalize">{recommendation.category}</span>
        </div>

        {/* Reasoning */}
        {recommendation.reasoning && (
          <p className="text-xs leading-relaxed text-stone-600">
            {recommendation.reasoning}
          </p>
        )}

        {/* Condition tags */}
        {recommendation.conditions_addressed &&
          recommendation.conditions_addressed.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recommendation.conditions_addressed.map((cond) => (
                <span
                  key={cond}
                  className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"
                >
                  {cond}
                </span>
              ))}
            </div>
          )}
      </CardContent>

      {/* Contraindications footer */}
      {recommendation.contraindications &&
        recommendation.contraindications.length > 0 && (
          <CardFooter className="border-t border-stone-100 bg-red-50/50 px-4 py-2.5">
            <p className="text-[11px] text-red-700">
              <span className="font-semibold">Note:</span>{" "}
              {recommendation.contraindications.join(", ")}
            </p>
          </CardFooter>
        )}
    </Card>
  );
}
