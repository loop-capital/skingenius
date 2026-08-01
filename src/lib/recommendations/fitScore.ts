/**
 * fitScore.ts — SKINgenius Fit Score Algorithm
 *
 * Calculates a 0–100 fitness score for each product based on:
 *   1. Ingredient-condition effectiveness (from condition_connections)
 *   2. Evidence level weighting (A=1.0, B=0.75, C=0.5, D=0.25)
 *   3. Skin type compatibility
 *   4. Price tier preference
 *   5. Brand preference
 *
 * The algorithm is documented in API-ARCHITECTURE.md.
 */

import {
  ConditionWithConfidence,
  UserProfile,
  Product,
  RecommendationResult,
  EnrichedIngredient,
} from "./types";

// ─── Evidence level weights ─────────────────────────────────────

const EVIDENCE_WEIGHTS: Record<string, number> = {
  A: 1.0,
  "A-": 0.9,
  "B+": 0.85,
  B: 0.75,
  "B-": 0.65,
  "C+": 0.55,
  C: 0.5,
  "C-": 0.4,
  D: 0.25,
  strong: 1.0,
  moderate: 0.75,
  emerging: 0.5,
  limited: 0.25,
};

function getEvidenceWeight(level: string | null | undefined): number {
  if (!level) return 0.5; // default moderate
  return EVIDENCE_WEIGHTS[level] ?? 0.5;
}

// ─── Price tier mapping ────────────────────────────────────────

const PRICE_TIERS = ["$", "$$", "$$$", "$$$$"];

function priceTierIndex(tier: string): number {
  const idx = PRICE_TIERS.indexOf(tier);
  return idx === -1 ? 1 : idx; // default to $$
}

// ─── Find matching ingredients ──────────────────────────────────

interface MatchedIngredient {
  ingredient_id: string;
  name: string;
  effectiveness: number;
  evidence_level: "A" | "B" | "C" | "D";
  condition_id: string;
}

/**
 * Match ingredients from the enriched list against the product's
 * ingredient IDs and names, using condition_connections for effectiveness data.
 * Falls back to name-based matching when IDs don't align.
 */
function findMatchingIngredients(
  product: Product,
  conditions: ConditionWithConfidence[],
  enrichedIngredients: EnrichedIngredient[],
): MatchedIngredient[] {
  const matches: MatchedIngredient[] = [];

  // Build lookup sets: IDs and names from the product
  const productIngredientIds = new Set(
    product.ingredients.map((ing) => ing.id).filter(Boolean),
  );
  const productIngredientNames = new Set(
    product.ingredients.map((ing) => ing.name.toLowerCase()),
  );

  for (const ingredient of enrichedIngredients) {
    // Check if this ingredient is in the product (by ID or by name)
    const matchById = productIngredientIds.has(ingredient.id);
    const matchByName = productIngredientNames.has(
      ingredient.name.toLowerCase(),
    );

    if (!matchById && !matchByName) continue;

    // Check each condition connection
    for (const conn of ingredient.condition_connections) {
      // Only include connections for the user's conditions
      const userCondition = conditions.find((c) => c.id === conn.condition_id);
      if (!userCondition) continue;

      const normalizedLevel = normalizeEvidenceLevel(conn.evidence_level);

      matches.push({
        ingredient_id: ingredient.id,
        name: ingredient.name,
        effectiveness: conn.effectiveness,
        evidence_level: normalizedLevel,
        condition_id: conn.condition_id,
      });
    }

    // If no condition_connections but ingredient is in the product,
    // create synthetic matches based on the ingredient's own evidence
    if (
      ingredient.condition_connections.length === 0 &&
      (matchById || matchByName)
    ) {
      for (const condition of conditions) {
        matches.push({
          ingredient_id: ingredient.id,
          name: ingredient.name,
          effectiveness: 0.6, // moderate default
          evidence_level: normalizeEvidenceLevel(
            ingredient.evidence_level ?? "emerging",
          ),
          condition_id: condition.id,
        });
      }
    }
  }

  // Deduplicate by ingredient_id + condition_id
  const seen = new Set<string>();
  return matches.filter((m) => {
    const key = `${m.ingredient_id}:${m.condition_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeEvidenceLevel(
  level: string | null | undefined,
): "A" | "B" | "C" | "D" {
  if (!level) return "C";
  const lower = level.toLowerCase();
  if (lower === "strong" || lower === "a" || lower.startsWith("a")) return "A";
  if (lower === "moderate" || lower === "b" || lower.startsWith("b"))
    return "B";
  if (lower === "emerging" || lower === "c" || lower.startsWith("c"))
    return "C";
  if (lower === "limited" || lower === "d" || lower.startsWith("d")) return "D";
  return "C";
}

// ─── Factor calculations ─────────────────────────────────────────

function calculatePriceFactor(
  productPriceTier: string,
  userPreferredPriceTier: string | undefined,
): number {
  if (!userPreferredPriceTier) return 1.0;

  const productIndex = priceTierIndex(productPriceTier);
  const userIndex = priceTierIndex(userPreferredPriceTier);

  if (productIndex <= userIndex) return 1.0;
  if (productIndex === userIndex + 1) return 0.8;
  return 0.5;
}

function calculateBrandFactor(
  productBrand: string,
  preferredBrands: string[] | undefined,
): number {
  if (!preferredBrands || preferredBrands.length === 0) return 1.0;

  const isPreferred = preferredBrands.some(
    (brand) => brand.toLowerCase() === productBrand.toLowerCase(),
  );
  return isPreferred ? 1.2 : 1.0;
}

function calculateSkinTypeFactor(
  suitableForSkinTypes: string[],
  userSkinType: string,
): number {
  if (suitableForSkinTypes.includes(userSkinType)) return 1.0;

  const acceptableTypes: Record<string, string[]> = {
    oily: ["normal", "combination"],
    dry: ["normal", "sensitive"],
    combination: ["normal", "oily", "dry"],
    sensitive: ["normal"],
    normal: ["oily", "dry", "combination", "sensitive"],
  };

  const acceptable = acceptableTypes[userSkinType] || [];
  if (acceptable.some((type) => suitableForSkinTypes.includes(type))) {
    return 0.7;
  }

  return 0.3;
}

function calculateFormulationFactor(_product: Product): number {
  // Simplified — in production, check pH and texture compatibility
  return 1.0;
}

// ─── Reasoning generation ────────────────────────────────────────

function generateReasoning(
  matchedIngredients: MatchedIngredient[],
  conditions: ConditionWithConfidence[],
  _userProfile: UserProfile,
  factors: {
    priceFactor: number;
    brandFactor: number;
    skinTypeFactor: number;
    formulationFactor: number;
  },
): string {
  const conditionNames = conditions
    .map((c) => c.id.replace(/-/g, " "))
    .join(", ");

  const ingredientNames = [
    ...new Set(matchedIngredients.map((i) => i.name)),
  ].join(", ");

  if (matchedIngredients.length === 0) {
    return `May help with ${conditionNames}.`;
  }

  let reasoning = `Recommended for ${conditionNames} — contains ${ingredientNames}.`;

  const factorNotes: string[] = [];

  if (factors.priceFactor < 1.0) {
    factorNotes.push(`price fit ${(factors.priceFactor * 100).toFixed(0)}%`);
  }
  if (factors.skinTypeFactor < 1.0) {
    factorNotes.push(
      `skin type match ${(factors.skinTypeFactor * 100).toFixed(0)}%`,
    );
  }
  if (factors.brandFactor > 1.0) {
    factorNotes.push("preferred brand");
  }

  if (factorNotes.length > 0) {
    reasoning += ` Adjustments: ${factorNotes.join(", ")}.`;
  }

  return reasoning;
}

function getDominantEvidenceLevel(
  matches: MatchedIngredient[],
): "A" | "B" | "C" | "D" {
  if (matches.length === 0) return "D";

  const counts: Record<"A" | "B" | "C" | "D", number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  };

  matches.forEach((m) => {
    counts[m.evidence_level]++;
  });

  return (Object.entries(counts) as [string, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a,
  )[0] as "A" | "B" | "C" | "D";
}

// ─── Main: calculateFitScore ─────────────────────────────────────

export interface FitScoreInput {
  product: Product;
  conditions: ConditionWithConfidence[];
  userProfile: UserProfile;
  enrichedIngredients: EnrichedIngredient[];
}

/**
 * Calculate fitness score for a product.
 *
 * @param product Product from the catalog
 * @param conditions User's detected conditions
 * @param userProfile User profile (skin type, allergies, etc.)
 * @param enrichedIngredients Ingredients with condition connections
 * @returns RecommendationResult with fit_score, reasoning, etc.
 */
export function calculateFitScore(
  product: Product,
  conditions: ConditionWithConfidence[],
  userProfile: UserProfile,
  enrichedIngredients: EnrichedIngredient[] = [],
): RecommendationResult {
  // Find matching ingredients in this product
  const matchedIngredients = findMatchingIngredients(
    product,
    conditions,
    enrichedIngredients,
  );

  // Base score from ingredient-condition effectiveness
  let baseScore = 0;
  let totalWeight = 0;

  for (const match of matchedIngredients) {
    const conditionConfidence =
      conditions.find((c) => c.id === match.condition_id)?.confidence ?? 0.5;
    const evidenceWeight = getEvidenceWeight(match.evidence_level);
    const weightedEffectiveness =
      match.effectiveness * evidenceWeight * conditionConfidence;

    baseScore += weightedEffectiveness;
    totalWeight += evidenceWeight * conditionConfidence;
  }

  // Normalize base score to 0–60 range
  const normalizedBase =
    totalWeight > 0 ? Math.min(baseScore / totalWeight, 1) * 60 : 0;

  // Apply multipliers
  const priceFactor = calculatePriceFactor(
    product.price_tier,
    userProfile.preferred_price_tier,
  );
  const brandFactor = calculateBrandFactor(
    product.brand,
    userProfile.preferred_brands,
  );
  const skinTypeFactor = calculateSkinTypeFactor(
    product.suitable_for_skin_types,
    userProfile.skin_type,
  );
  const formulationFactor = calculateFormulationFactor(product);

  // Final score
  let finalScore =
    normalizedBase *
    priceFactor *
    brandFactor *
    skinTypeFactor *
    formulationFactor;

  // Clamp 0–100
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  // Conditions addressed
  const conditionsAddressed = [
    ...new Set(matchedIngredients.map((m) => m.condition_id)),
  ];

  // Contraindications from product
  const contraindications: string[] = [];
  if (!product.pregnancy_safe && userProfile.is_pregnant) {
    contraindications.push("Not recommended during pregnancy");
  }
  if (product.contraindicated_ingredients?.length) {
    contraindications.push(...product.contraindicated_ingredients);
  }

  return {
    product_id: product.id,
    name: product.name,
    brand: product.brand,
    fit_score: finalScore,
    evidence_level: getDominantEvidenceLevel(matchedIngredients),
    pregnancy_safe: product.pregnancy_safe,
    reasoning: generateReasoning(matchedIngredients, conditions, userProfile, {
      priceFactor,
      brandFactor,
      skinTypeFactor,
      formulationFactor,
    }),
    key_actives: [
      ...new Map(matchedIngredients.map((m) => [m.ingredient_id, m])).values(),
    ].map((m) => ({
      ingredient: m.name,
      effectiveness: m.effectiveness,
    })),
    conditions_addressed: conditionsAddressed,
    contraindications,
    price_tier: product.price_tier,
    category: product.category,
  };
}
