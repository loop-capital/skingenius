/**
 * Severity badge variants and color mapping
 * mild=amber, moderate=orange, severe=red
 */
export type SeverityLevel = "mild" | "moderate" | "severe";

export const SEVERITY_CONFIG: Record<
  SeverityLevel,
  {
    label: string;
    className: string;
    dotClassName: string;
    barColor: string;
  }
> = {
  mild: {
    label: "Mild",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
    dotClassName: "bg-amber-500",
    barColor: "bg-amber-500",
  },
  moderate: {
    label: "Moderate",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
    dotClassName: "bg-orange-500",
    barColor: "bg-orange-500",
  },
  severe: {
    label: "Severe",
    className:
      "bg-red-50 text-red-700 border-red-200",
    dotClassName: "bg-red-500",
    barColor: "bg-red-500",
  },
};

/**
 * Evidence badge mapping
 */
export type EvidenceLevel = "A" | "B" | "C" | "D";

export const EVIDENCE_CONFIG: Record<
  EvidenceLevel,
  { label: string; className: string }
> = {
  A: {
    label: "Strong Evidence",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  B: {
    label: "Good Evidence",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  C: {
    label: "Moderate Evidence",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  D: {
    label: "Limited Evidence",
    className: "bg-stone-50 text-stone-600 border-stone-200",
  },
};

/**
 * Skin zone path definitions for SVG face map
 */
export interface ZonePath {
  zone: string;
  path: string;
  labelX: number;
  labelY: number;
}

export const FACE_ZONE_PATHS: ZonePath[] = [
  {
    zone: "forehead",
    path:
      "M70 20 C70 8, 130 8, 130 20 C130 32, 120 45, 100 45 C80 45, 70 32, 70 20 Z",
    labelX: 100,
    labelY: 28,
  },
  {
    zone: "t-zone",
    path:
      "M92 45 L108 45 L110 80 L90 80 Z",
    labelX: 100,
    labelY: 65,
  },
  {
    zone: "under-eye",
    path:
      "M68 48 C68 40, 88 40, 92 48 C92 56, 88 62, 80 62 C72 62, 68 56, 68 48 Z",
    labelX: 80,
    labelY: 52,
  },
  {
    zone: "under-eye",
    path:
      "M108 48 C108 40, 128 40, 132 48 C132 56, 128 62, 120 62 C112 62, 108 56, 108 48 Z",
    labelX: 120,
    labelY: 52,
  },
  {
    zone: "cheeks",
    path:
      "M58 58 C58 48, 78 48, 82 58 C86 68, 78 78, 68 82 C58 86, 52 78, 52 68 C52 62, 54 58, 58 58 Z",
    labelX: 66,
    labelY: 66,
  },
  {
    zone: "cheeks",
    path:
      "M118 58 C118 48, 138 48, 142 58 C146 68, 138 78, 128 82 C118 86, 112 78, 112 68 C112 62, 114 58, 118 58 Z",
    labelX: 134,
    labelY: 66,
  },
  {
    zone: "jawline",
    path:
      "M58 80 C58 90, 80 105, 100 105 C120 105, 142 90, 142 80 L142 70 C142 80, 120 95, 100 95 C80 95, 58 80, 58 70 Z",
    labelX: 100,
    labelY: 92,
  },
  {
    zone: "chin",
    path:
      "M85 95 L115 95 L110 115 L90 115 Z",
    labelX: 100,
    labelY: 105,
  },
];

export const ZONE_ORDER = [
  "forehead",
  "t-zone",
  "under-eye",
  "cheeks",
  "jawline",
  "chin",
];
