"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { V1SkinZone } from "@/types/api";
import {
  FACE_ZONE_PATHS,
  type SeverityLevel,
  SEVERITY_CONFIG,
} from "./scan-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkinZoneMapProps {
  zones: V1SkinZone[];
  className?: string;
}

/**
 * Derive fill color for a zone based on its severity.
 */
function zoneFillColor(severity: string): string {
  switch (severity) {
    case "severe":
      return "rgba(239,68,68,0.55)";   // red-500
    case "moderate":
      return "rgba(249,115,22,0.50)";  // orange-500
    case "mild":
      return "rgba(245,158,11,0.45)";  // amber-500
    default:
      return "rgba(167,139,250,0.25)"; // faint fallback
  }
}

/**
 * SVG face outline divided into zones.
 * Colored by severity, hover / tap shows tooltip details.
 */
export function SkinZoneMap({
  zones,
  className,
}: SkinZoneMapProps): React.ReactElement {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const zoneLookup = useCallback(
    (zoneName: string): V1SkinZone | undefined =>
      zones.find(
        (z) => z.zone.toLowerCase() === zoneName.toLowerCase()
      ),
    [zones]
  );

  const getZoneData = (zoneName: string): V1SkinZone | undefined => {
    // Some paths share a zone name (e.g. cheeks, under-eye)
    return zoneLookup(zoneName);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-xl border border-stone-200 bg-white p-6",
          className
        )}
      >
        <h3 className="text-sm font-semibold text-stone-700">
          Skin Zone Map
        </h3>

        <div className="relative">
          <svg
            viewBox="0 0 200 130"
            className="h-auto w-full max-w-[280px]"
            role="img"
            aria-label="Skin zone map"
          >
            {/* Face outline */}
            <path
              d="M60 30 C60 10, 140 10, 140 30 C145 50, 150 70, 145 90 C140 110, 120 125, 100 125 C80 125, 60 110, 55 90 C50 70, 55 50, 60 30 Z"
              fill="none"
              stroke="#D6D3D1"
              strokeWidth="1.5"
            />
            {/* Eyes hint */}
            <ellipse cx="82" cy="52" rx="6" ry="3" fill="#E7E5E4" />
            <ellipse cx="118" cy="52" rx="6" ry="3" fill="#E7E5E4" />
            {/* Nose hint */}
            <path
              d="M100 52 L96 78 L104 78 Z"
              fill="none"
              stroke="#D6D3D1"
              strokeWidth="1"
            />
            {/* Mouth hint */}
            <path
              d="M88 98 Q100 104, 112 98"
              fill="none"
              stroke="#D6D3D1"
              strokeWidth="1"
            />

            {/* Zone overlays */}
            {FACE_ZONE_PATHS.map((zp, idx) => {
              const data = getZoneData(zp.zone);
              const isActive = activeZone === `${zp.zone}-${idx}`;
              const fill = data
                ? zoneFillColor(data.severity)
                : "rgba(0,0,0,0)";
              const stroke = data
                ? SEVERITY_CONFIG[data.severity as SeverityLevel]?.dotClassName.replace("bg-", "stroke-") ?? "#A8A29E"
                : "#A8A29E";

              return (
                <Tooltip key={`${zp.zone}-${idx}`}>
                  <TooltipTrigger asChild>
                    <path
                      d={zp.path}
                      fill={fill}
                      stroke={isActive ? "#059669" : stroke.replace("stroke-", "#") || "#A8A29E"}
                      strokeWidth={isActive ? 2 : 1}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setActiveZone(`${zp.zone}-${idx}`)}
                      onMouseLeave={() => setActiveZone(null)}
                      onFocus={() => setActiveZone(`${zp.zone}-${idx}`)}
                      onBlur={() => setActiveZone(null)}
                      tabIndex={0}
                    />
                  </TooltipTrigger>
                  {data && (
                    <TooltipContent
                      side="right"
                      sideOffset={8}
                      className="max-w-[220px] rounded-lg border border-stone-200 bg-white p-3 shadow-lg"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold capitalize text-stone-800">
                          {data.zone}
                        </p>
                        <p className="text-xs text-stone-500">
                          {data.description}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={cn(
                              "inline-block h-2 w-2 rounded-full",
                              SEVERITY_CONFIG[data.severity as SeverityLevel]
                                ?.dotClassName ?? "bg-stone-300"
                            )}
                          />
                          <span className="text-xs font-medium capitalize text-stone-700">
                            {data.severity}
                          </span>
                          <span className="text-xs text-stone-400">
                            · {Math.round(data.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-xs text-stone-600">
                          Primary: {data.primary_concern}
                        </p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(
            [
              { key: "mild", label: "Mild" },
              { key: "moderate", label: "Moderate" },
              { key: "severe", label: "Severe" },
            ] as { key: SeverityLevel; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  SEVERITY_CONFIG[key].dotClassName
                )}
              />
              <span className="text-xs text-stone-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
