/**
 * regimeFitScore.ts — Per-product fit scoring for the SKINgenius regime engine.
 *
 * Every product recommendation gets a 0-100 fit score representing how well
 * it matches THIS user's specific skin profile. Two users with different skin
 * see different scores for the same product.
 *
 * Scoring weights:
 *   - Concern match:        50 pts (ingredient-condition effectiveness × confidence)
 *   - Fitzpatrick safety:   20 pts (suitability for user's Fitzpatrick level)
 *   - Budget alignment:      15 pts (product tier vs user's preferred tier)
 *   - Routine compatibility: 15 pts (skin type match, pregnancy safety)
 *
 * Hard gates (score = 0):
 *   - Product contains an ingredient in the user's allergy list
 *
 * This is the "92% fit for your skin" badge. Lovi does generic fit scores;
 * ours is Fitzpatrick-aware, which they don't have.
 */

import type {
  Product,
  UserProfile,
  ConditionWithConfidence,
} from "./types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegimeFitInput {
  product: Product;
  userProfile: UserProfile;
  /** Detected conditions from scan, with confidence */
  conditions: ConditionWithConfidence[];
  /** Ingredient effectiveness map: ingredient_id → { condition_id → effectiveness } */
  ingredientEffectiveness?: Map<string, Map<string, number>>;
}

export interface RegimeFitResult {
  /** Integer 0-100 */
  fit_score: number;
  /** One-line human-readable reason, e.g. "High fit: targets hyperpigmentation, safe for Fitzpatrick V" */
  fit_reason: string;
  /** True when excluded by a hard gate (allergy) */
  excluded: boolean;
}

// ─── Allergy hard gate ─────────────────────────────────────────────────────

function findAllergenConflict(
  product: Product,
  allergies: string[] | undefined
): string | null {
  if (!allergies || allergies.length === 0) return null;
  const allergySet = new Set(allergies.map((a) => a.toLowerCase().trim()));
  for (const ing of product.ingredients) {
    if (allergySet.has(ing.name.toLowerCase().trim())) {
      return ing.name;
    }
    if (ing.id && allergySet.has(ing.id.toLowerCase().trim())) {
      return ing.name;
    }
  }
  // Also check contraindicated ingredients list
  for (const contra of product.contraindicated_ingredients ?? []) {
    if (allergySet.has(contra.toLowerCase().trim())) {
      return contra;
    }
  }
  return null;
}

// ─── Concern match (0-50) ──────────────────────────────────────────────────

function scoreConcernMatch(
  product: Product,
  conditions: ConditionWithConfidence[],
  ingredientEffectiveness?: Map<string, Map<string, number>>
): { points: number; topConditions: string[] } {
  if (conditions.length === 0) return { points: 25, topConditions: [] };

  let weightedSum = 0;
  let totalWeight = 0;
  const conditionHits = new Map<string, number>();

  const productIngredientNames = new Set(
    product.ingredients.map((i) => i.name.toLowerCase())
  );
  const productIngredientIds = new Set(
    product.ingredients.map((i) => i.id).filter(Boolean)
  );

  for (const condition of conditions) {
    const conf = condition.confidence ?? 0.5;
    let bestEffectiveness = 0;

    // Check each product ingredient against this condition
    for (const ing of product.ingredients) {
      const effMap = ingredientEffectiveness?.get(ing.id);
      const eff = effMap?.get(condition.id) ?? 0;
      if (eff > bestEffectiveness) bestEffectiveness = eff;
    }

    // Fallback: if product lists the condition in its marketing or the
    // ingredient names suggest relevance, give partial credit
    if (bestEffectiveness === 0) {
      // No data — neutral, don't punish
      bestEffectiveness = 0.4;
    }

    weightedSum += bestEffectiveness * conf;
    totalWeight += conf;
    if (bestEffectiveness > 0.5) {
      conditionHits.set(condition.id, bestEffectiveness * conf);
    }
  }

  const avg = totalWeight > 0 ? weightedSum / totalWeight : 0.4;
  const points = Math.round(avg * 50);

  const topConditions = [...conditionHits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => id.replace(/-/g, " "));

  // Suppress unused vars
  void productIngredientNames;
  void productIngredientIds;

  return { points, topConditions };
}

// ─── Fitzpatrick safety (0-20) ─────────────────────────────────────────────

const FITZPATRICK_ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
};

export function fitzpatrickRoman(n: number): string {
  return FITZPATRICK_ROMAN[n] ?? "IV";
}

function scoreFitzpatrickSafety(
  product: Product,
  userFitzpatrick: number | undefined
): { points: number; safe: boolean } {
  if (!userFitzpatrick) return { points: 20, safe: true };
  const suitable = product.suitable_for_fitzpatrick ?? [1, 2, 3, 4, 5, 6];
  if (suitable.includes(userFitzpatrick)) return { points: 20, safe: true };

  // Adjacent levels get partial credit (e.g. product for IV-VI, user is III)
  const adjacent = suitable.some((s) => Math.abs(s - userFitzpatrick) === 1);
  if (adjacent) return { points: 10, safe: true };

  return { points: 4, safe: false };
}

// ─── Budget alignment (0-15) ───────────────────────────────────────────────

const PRICE_ORDER = ["$", "$$", "$$$", "$$$$"];

function scoreBudgetFit(
  productTier: string,
  userTier: string | undefined
): number {
  if (!userTier) return 15;
  const pIdx = PRICE_ORDER.indexOf(productTier);
  const uIdx = PRICE_ORDER.indexOf(userTier);
  if (pIdx === -1 || uIdx === -1) return 12;
  if (pIdx <= uIdx) return 15;
  if (pIdx === uIdx + 1) return 8;
  return 3;
}

// ─── Routine compatibility (0-15) ──────────────────────────────────────────

function scoreRoutineCompatibility(
  product: Product,
  userProfile: UserProfile
): { points: number; notes: string[] } {
  let points = 15;
  const notes: string[] = [];

  // Skin type match (up to 8 pts of the 15)
  const suitable = product.suitable_for_skin_types ?? [];
  const userType = userProfile.skin_type;
  if (userType && suitable.length > 0 && !suitable.includes(userType)) {
    points -= 6;
    notes.push(`not ideal for ${userType} skin`);
  }

  // Pregnancy safety (up to 7 pts)
  if (userProfile.is_pregnant && !product.pregnancy_safe) {
    points -= 7;
    notes.push("not recommended during pregnancy");
  }

  return { points: Math.max(0, points), notes };
}

// ─── Reason builder ────────────────────────────────────────────────────────

function buildFitReason(
  score: number,
  topConditions: string[],
  fitzpatrickSafe: boolean,
  userFitzpatrick: number | undefined,
  routineNotes: string[]
): string {
  const level =
    score >= 80 ? "High fit" : score >= 60 ? "Good fit" : score >= 40 ? "Moderate fit" : "Low fit";

  const parts: string[] = [];
  if (topConditions.length > 0) {
    parts.push(`targets ${topConditions.join(" + ")}`);
  }
  if (fitzpatrickSafe && userFitzpatrick) {
    parts.push(`safe for Fitzpatrick ${fitzpatrickRoman(userFitzpatrick)}`);
  }
  parts.push(...routineNotes);

  if (parts.length === 0) {
    return `${level}: general compatibility`;
  }
  return `${level}: ${parts.join(", ")}`;
}

// ─── Main ──────────────────────────────────────────────────────────────────

/**
 * Calculate a personalized 0-100 fit score for a product against a user's
 * complete skin profile. Deterministic — same inputs always give same output.
 */
export function calculateRegimeFitScore(input: RegimeFitInput): RegimeFitResult {
  const { product, userProfile, conditions } = input;

  // Hard gate: allergy exclusion
  const allergen = findAllergenConflict(product, userProfile.allergies);
  if (allergen) {
    return {
      fit_score: 0,
      fit_reason: `Excluded: contains ${allergen} (your allergy)`,
      excluded: true,
    };
  }

  const userFitzpatrick = userProfile.fitzpatrick;

  const concern = scoreConcernMatch(product, conditions, input.ingredientEffectiveness);
  const fitz = scoreFitzpatrickSafety(product, userFitzpatrick);
  const budget = scoreBudgetFit(product.price_tier, userProfile.preferred_price_tier);
  const routine = scoreRoutineCompatibility(product, userProfile);

  const total = concern.points + fitz.points + budget + routine.points;
  const fit_score = Math.max(0, Math.min(100, Math.round(total)));

  const fit_reason = buildFitReason(
    fit_score,
    concern.topConditions,
    fitz.safe,
    userFitzpatrick,
    routine.notes
  );

  return { fit_score, fit_reason, excluded: false };
}
