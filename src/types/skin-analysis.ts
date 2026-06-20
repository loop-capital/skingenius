// ───────────────────────────────────────────────────────────────
// Skin Analysis Types — Hybrid Model (Gemma 2B Free / GPT-4o Pro)
// ───────────────────────────────────────────────────────────────

/**
 * Skin condition detected by AI analysis
 */
export interface DetectedSkinCondition {
  /** Condition slug (e.g., "acne-vulgaris") */
  condition_id: string;
  /** Human-readable name (e.g., "Acne Vulgaris") */
  name: string;
  /** Detection confidence 0.0–1.0 */
  confidence: number;
  /** Severity assessment */
  severity: "mild" | "moderate" | "severe";
  /** Observable features (e.g., "cystic", "comedonal", "erythema") */
  features: string[];
  /** Facial zone where detected */
  zone: string;
}

/**
 * Facial zone analysis result
 */
export interface SkinZoneAnalysis {
  /** Zone name (e.g., "T-Zone", "Cheeks", "Forehead") */
  zone: string;
  /** Primary concern in this zone */
  primary_concern: string;
  /** Brief description of findings */
  description: string;
  /** Severity in this zone */
  severity: "mild" | "moderate" | "severe";
}

/**
 * Recommended ingredient for a detected condition
 */
export interface RecommendedIngredient {
  /** Ingredient ID */
  ingredient_id: string;
  /** Ingredient name */
  name: string;
  /** Why this ingredient helps */
  reasoning: string;
  /** Evidence quality (A=strong, B=moderate, C=limited) */
  evidence_level: "A" | "B" | "C" | "D";
  /** Estimated effectiveness 0.0–1.0 */
  effectiveness: number;
}

/**
 * Product suggestion based on analysis
 */
export interface ProductSuggestion {
  /** Product ID */
  product_id: string;
  /** Product name */
  name: string;
  /** Brand name */
  brand: string;
  /** Product category */
  category: string;
  /** Why this product is recommended */
  reasoning: string;
  /** Match score 0–100 */
  fit_score: number;
  /** Key active ingredients in this product */
  key_actives: Array<{
    ingredient: string;
    concentration?: string;
  }>;
  /** Price tier ($, $$, $$$, etc.) */
  price_tier: string;
  /** Purchase URL if available */
  url?: string;
}

/**
 * Complete skin analysis result
 */
export interface SkinAnalysisResult {
  /** Unique analysis ID */
  analysis_id: string;
  /** User ID (if authenticated) */
  user_id?: string;
  /** Timestamp of analysis */
  timestamp: string;
  /** AI model used */
  model: "gemma-2b" | "gpt-4o-vision";
  /** User's subscription tier */
  tier: "free" | "pro";
  /** Detected conditions */
  conditions: DetectedSkinCondition[];
  /** Zone-by-zone analysis */
  zones: SkinZoneAnalysis[];
  /** Overall skin health score 0–100 */
  skin_score: number;
  /** Recommended ingredients */
  recommended_ingredients: RecommendedIngredient[];
  /** Suggested products */
  product_suggestions: ProductSuggestion[];
  /** Urgent flag for conditions requiring dermatologist */
  urgent_flag: boolean;
  /** Warnings or notes */
  warnings: string[];
  /** Analysis metadata */
  metadata: {
    /** Processing time in ms */
    processing_time_ms: number;
    /** Photo quality score 0–100 */
    photo_quality_score?: number;
    /** Whether face was detected */
    face_detected: boolean;
    /** Whether analysis used vision (true) or text-only (false) */
    vision_analysis: boolean;
  };
}

/**
 * Request body for /api/v1/skin/analyze
 */
export interface SkinAnalyzeRequest {
  /** Optional: user-provided Fitzpatrick skin type 1–6 */
  skin_tone?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Optional: user ID for authenticated requests */
  user_id?: string;
}

/**
 * API Response wrapper
 */
export interface SkinAnalyzeResponse {
  /** Success flag */
  success: boolean;
  /** Analysis result (if success) */
  data?: SkinAnalysisResult;
  /** Error message (if failed) */
  error?: string;
  /** Error details */
  detail?: string;
}

/**
 * Rate limit info attached to responses
 */
export interface RateLimitInfo {
  /** Max requests allowed */
  limit: number;
  /** Requests remaining */
  remaining: number;
  /** Unix timestamp when limit resets */
  reset_at: number;
}

/**
 * Error codes for skin analysis
 */
export type SkinAnalysisErrorCode =
  | "INVALID_IMAGE"
  | "NO_FACE_DETECTED"
  | "IMAGE_TOO_SMALL"
  | "RATE_LIMITED"
  | "MODEL_UNAVAILABLE"
  | "ANALYSIS_FAILED"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";
