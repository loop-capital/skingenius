/**
 * intake-contract.ts — THE intake contract for SKINgenius.
 *
 * Sienna's rule: v1 quiz UI and v2 mascot write to THIS schema.
 * Build the contract once, swap the interface later.
 *
 * Any intake surface (tap-through quiz, conversational mascot, future voice)
 * MUST produce a valid IntakeProfile. The engine consumes only this shape.
 *
 * Version: 1.0.0
 */

// ─── Demographics ────────────────────────────────────────────────────────────

export type AgeRange = "under_25" | "25_34" | "35_44" | "45_60" | "over_60";
export type GenderIdentity = "female" | "male" | "nonbinary" | "prefer_not_to_say";

export interface Demographics {
  age_range: AgeRange;
  gender: GenderIdentity;
}

// ─── Skin profile ────────────────────────────────────────────────────────────

export type SkinType = "dry" | "normal" | "oily" | "combination" | "sensitive";

export interface SkinProfile {
  skin_type: SkinType;
  /** Fitzpatrick scale 1-6 */
  fitzpatrick: number;
  /** Self-reported sensitivity */
  is_sensitive: boolean;
  /** Known allergies (ingredient names) */
  allergies: string[];
  /** Currently pregnant or breastfeeding */
  is_pregnant: boolean;
}

// ─── Concerns ────────────────────────────────────────────────────────────────

/** Must match the condition taxonomy used by the vision model. */
export type SkinConcern =
  | "acne"
  | "hyperpigmentation"
  | "melasma"
  | "dryness"
  | "oily_skin"
  | "fine_lines"
  | "wrinkles"
  | "uneven_texture"
  | "enlarged_pores"
  | "redness"
  | "rosacea"
  | "dark_circles"
  | "puffiness"
  | "sun_damage"
  | "age_spots"
  | "uneven_skin_tone"
  | "dullness"
  | "blackheads"
  | "whiteheads"
  | "scarring"
  | "sensitivity"
  | "eczema"
  | "psoriasis"
  | "dark_circles_eyes"
  | "sagging_skin";

export type FaceZone =
  | "forehead"
  | "between_eyebrows"
  | "eyes"
  | "nose"
  | "cheeks"
  | "mouth"
  | "chin"
  | "jawline"
  | "neck"
  | "whole_face";

// ─── Current routine ─────────────────────────────────────────────────────────

export type ProductCategory =
  | "cleanser"
  | "makeup_remover"
  | "toner"
  | "moisturizer"
  | "eye_treatment"
  | "face_treatment"
  | "spf"
  | "exfoliator"
  | "serum"
  | "mask"
  | "oil";

export interface CurrentRoutine {
  has_routine: boolean;
  routine_frequency: "morning_and_evening" | "morning_only" | "evening_only" | "none";
  products_used: ProductCategory[];
  /** Minutes per day spent on skincare */
  time_investment_minutes: number;
}

// ─── Ingredient awareness ────────────────────────────────────────────────────

export interface IngredientPreferences {
  uses_acids: boolean;
  uses_retinol: boolean;
  uses_vitamin_c: boolean;
  uses_antioxidants: boolean;
  avoids_sulfates: boolean;
  interested_in_kbeauty: boolean;
  interested_in_exosomes: boolean;
}

// ─── Lifestyle (reuses existing shapes) ──────────────────────────────────────

export interface LifestyleIntake {
  sleep_hours: number; // 0-12
  sleep_quality: "good" | "ok" | "poor";
  water_glasses: number; // per day
  stress_level: "low" | "moderate" | "high" | "constant";
  sunscreen_use: "always" | "sometimes" | "rarely" | "never";
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export type SkincareGoal =
  | "reduce_acne"
  | "reduce_redness_sensitivity"
  | "find_routine"
  | "learn_ingredients"
  | "save_money"
  | "prevent_aging"
  | "improve_texture"
  | "even_tone"
  | "boost_confidence";

export interface Goals {
  primary_goals: SkincareGoal[];
  /** Free-text aspiration, e.g. "confidently makeup-free" */
  aspiration?: string;
  /** Upcoming event driving urgency */
  upcoming_event?: string;
}

// ─── THE CONTRACT ────────────────────────────────────────────────────────────

/**
 * Complete intake profile. Every intake surface produces this.
 * Partial profiles are allowed during progressive intake (fields optional
 * until the profile is marked complete).
 */
export interface IntakeProfile {
  /** Schema version for forward compatibility */
  version: "1.0.0";
  user_id: string;
  /** Which surface collected this (quiz_ui | mascot_chat | mascot_voice) */
  source: "quiz_ui" | "mascot_chat" | "mascot_voice";
  completed: boolean;
  completed_at?: string;

  demographics?: Demographics;
  skin_profile?: SkinProfile;
  concerns?: SkinConcern[];
  target_zones?: FaceZone[];
  current_routine?: CurrentRoutine;
  ingredient_preferences?: IngredientPreferences;
  lifestyle?: LifestyleIntake;
  goals?: Goals;

  created_at: string;
  updated_at: string;
}

/** Minimum fields for a usable (if incomplete) profile. */
export type PartialIntakeProfile = Partial<IntakeProfile> &
  Pick<IntakeProfile, "version" | "user_id" | "source" | "created_at" | "updated_at">;
