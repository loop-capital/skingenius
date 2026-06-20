// ───────────────────────────────────────────────────────────────
// Skin Age Estimator Types
// ───────────────────────────────────────────────────────────────

export type AgeEstimateTier = "free" | "pro";

export type AnalysisStep =
  | "upload"
  | "scanning"
  | "analyzing"
  | "calculating"
  | "results";

export interface SkinAgeFactors {
  wrinkles: number;      // 0-100
  texture: number;         // 0-100
  pigmentation: number;    // 0-100
  pores: number;         // 0-100
  elasticity: number;      // 0-100
  hydration: number;       // 0-100
}

export interface SkinAgeResult {
  estimatedAge: number;
  estimatedAgeRange?: string; // "early 30s", "mid 40s", etc. (free tier)
  actualAge?: number;
  ageGap: number;          // negative = younger, positive = older
  factors: SkinAgeFactors;
  skinAgeScore: number;      // 0-100 overall
  tips: SkinAgeTip[];
  disclaimer?: string;       // "This is a directional estimate, not a medical diagnosis."
  improvements?: SkinAgeImprovement[]; // Personalized improvement suggestions
  beforeAfter?: BeforeAfterPotential; // What skin could look like with routine
}

export interface SkinAgeImprovement {
  area: string;              // e.g. "wrinkles", "hydration"
  currentScore: number;      // 0-100
  potentialScore: number;    // 0-100 after routine
  timeframe: string;         // e.g. "4-6 weeks"
  keyProduct: string;        // e.g. "Retinol 0.25%"
}

export interface BeforeAfterPotential {
  currentAge: number;
  potentialAge: number;      // age skin could look with routine
  potentialAgeRange?: string; // free tier range
  improvementText: string;   // e.g. "Your skin could look 3 years younger"
  confidence: number;        // 0-100
}

export interface SkinAgeTip {
  category: "hydration" | "sun_protection" | "sleep" | "diet" | "skincare" | "lifestyle";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface AgeEstimateRequest {
  imageBase64: string;
  actualAge?: number;
  gender?: "male" | "female" | "non_binary" | "prefer_not_say";
  tier: AgeEstimateTier;
}

export interface AgeEstimateResponse {
  data?: SkinAgeResult;
  error?: string;
  detail?: string;
  disclaimer?: string;
}

export interface ShareCardData {
  estimatedAge: number;
  actualAge?: number;
  ageGap: number;
  skinAgeScore: number;
  topTip: string;
  qrUrl: string;
  generatedAt: string;
}
