// ───────────────────────────────────────────────────────────────
// SKINgenius API Types
// ───────────────────────────────────────────────────────────────

// ─── User Profile ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  birth_date: string | null;
  gender: "male" | "female" | "non_binary" | "prefer_not_say" | null;
  location: string | null;
  skin_concerns: string[] | null;
  allergies: string[] | null;
  current_medications: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  display_name?: string | null;
  birth_date?: string | null;
  gender?: "male" | "female" | "non_binary" | "prefer_not_say" | null;
  location?: string | null;
  skin_concerns?: string[] | null;
  allergies?: string[] | null;
  current_medications?: string[] | null;
}

// ─── Skin Type Assessment ─────────────────────────────────────

export interface SkinTypeAssessment {
  id: string;
  user_id: string;
  skin_type: "oily" | "dry" | "combination" | "normal" | "sensitive" | null;
  oiliness: number | null; // 1–10
  hydration: number | null; // 1–10
  sensitivity: number | null; // 1–10
  pore_size: "small" | "medium" | "large" | null;
  acne_frequency: "rare" | "occasional" | "frequent" | "severe" | null;
  completed_at: string;
}

// ─── Skin Analysis (legacy /api/analyses) ─────────────────────

export interface DetectedCondition {
  condition: string;
  confidence: number; // 0–1
  severity: "mild" | "moderate" | "severe" | null;
}

export interface SkinAnalysis {
  id: string;
  user_id: string;
  image_url: string | null;
  conditions: DetectedCondition[];
  skin_score: number | null; // 0–100
  notes: string | null;
  urgent_flag: boolean;
  created_at: string;
}

export interface SkinAnalysisInput {
  image_url?: string | null;
  conditions: DetectedCondition[];
  skin_score?: number | null;
  notes?: string | null;
  urgent_flag?: boolean;
}

export interface PaginatedAnalyses {
  data: SkinAnalysis[];
  count: number | null;
  limit: number;
  offset: number;
}

// ─── Routine ──────────────────────────────────────────────────

export type RoutineTimeOfDay = "am" | "pm" | "both" | null;

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  time_of_day: RoutineTimeOfDay;
  created_at: string;
  updated_at: string;
}

export interface RoutineInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
  time_of_day?: RoutineTimeOfDay;
}

export type RoutineStepCategory =
  | "cleanser"
  | "toner"
  | "serum"
  | "moisturizer"
  | "sunscreen"
  | "treatment"
  | "eye_cream"
  | "mask"
  | "oil"
  | "other";

export type StepFrequency = "daily" | "weekly" | "as_needed" | null;

export interface RoutineStep {
  id: string;
  routine_id: string;
  step_order: number;
  product_name: string;
  product_id: string | null;
  category: RoutineStepCategory;
  instructions: string | null;
  frequency: StepFrequency;
  created_at: string;
}

// ─── Ingredient ───────────────────────────────────────────────

export type IngredientCategory =
  | "active"
  | "emollient"
  | "surfactant"
  | "preservative"
  | "antioxidant"
  | "exfoliant"
  | "humectant"
  | "peptide"
  | "vitamin"
  | "botanical"
  | "other";

export type SafetyRating = "A" | "B" | "C" | "D";

export interface Ingredient {
  id: string;
  inci_name: string;
  common_names: string[] | null;
  category: IngredientCategory;
  functions: string[] | null;
  evidence_score: number | null; // 0–100
  safety_rating: SafetyRating | null;
  description: string | null;
  mechanism: string | null;
  common_concentration: string | null;
  contraindications: string[] | null;
  related_ingredient_ids: string[] | null;
  created_at: string;
}

export interface PaginatedIngredients {
  data: Ingredient[];
  count: number | null;
  limit: number;
  offset: number;
}

export interface IngredientSearchResult {
  data: Ingredient[];
  query: string;
  limit: number;
}

// ─── API Error ──────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message?: string;
  detail?: string;
  path?: string;
}

// ─── API Root ─────────────────────────────────────────────────

export interface ApiRoot {
  name: string;
  version: string;
  endpoints: Record<string, string[]>;
}

// ─── V1 Scan Endpoint Types ───────────────────────────────────

export interface V1ScanRequest {
  image: string; // base64 JPEG/PNG
  capture_method: "camera" | "gallery";
  skin_tone: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface V1DetectedCondition {
  condition_id: string;
  name: string;
  confidence: number; // 0–1
  severity: "mild" | "moderate" | "severe";
  features: string[];
  zone: string;
}

export interface V1SkinZone {
  zone: string;
  primary_concern: string;
  description: string;
  severity: "mild" | "moderate" | "severe";
  confidence: number;
}

export interface V1QualityAssessment {
  is_valid_format: boolean;
  width: number | null;
  height: number | null;
  aspect_ratio: number | null;
  file_size_bytes: number;
  face_detected: boolean;
  blur_score: number | null;
  lighting_score: number | null;
}

export interface V1ScanMetadata {
  capture_method: string;
  skin_tone: number;
  processed: boolean;
  model_version: string;
  warnings?: string[];
  storage_failed?: boolean;
  storage_error?: string;
  auto_detected_skin_tone?: {
    type: number;
    confidence: number;
  };
}

export interface V1ScanResponseData {
  scan_id: string | null;
  timestamp: string;
  quality_assessment: V1QualityAssessment;
  conditions: V1DetectedCondition[];
  skin_zones: V1SkinZone[];
  metadata: V1ScanMetadata;
}

export interface V1ScanResponse {
  data?: V1ScanResponseData;
  error?: string;
  detail?: string;
}
