"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

interface RootCauseCardProps {
  category: string;
  score: number; // 0–100
  description?: string;
  className?: string;
}

/**
 * Color-code a score 0–100.
 */
function scoreColorClass(score: number): string {
  if (score >= 70) return "bg-red-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-amber-500";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "High Impact";
  if (score >= 40) return "Moderate Impact";
  return "Low Impact";
}

/**
 * Animated score bar for a root-cause category.
 */
export function RootCauseCard({
  category,
  score,
  description,
  className,
}: RootCauseCardProps): React.ReactElement {
  const [displayedScore, setDisplayedScore] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 800;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(score * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const barColor = scoreColorClass(score);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-stone-800">{category}</h4>
          <span className="shrink-0 text-xs font-medium text-stone-500">
            {scoreLabel(score)}
          </span>
        </div>

        {description && (
          <p className="mt-1 text-xs text-stone-500 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Score</span>
            <span className="text-sm font-bold text-stone-800">
              {displayedScore}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              ref={barRef}
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                barColor
              )}
              style={{ width: `${displayedScore}%` }}
              aria-valuenow={displayedScore}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
