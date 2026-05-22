/**
 * Ingredient Scorer
 * Computes a 0-100 safety score from aggregated ingredient data.
 * Higher = safer / more suitable.
 */

import { ScannedIngredient } from "./pipeline";

export interface ScoreBreakdown {
  overall: number; // 0-100
  safety: number; // from safety ratings / hazard scores
  comedogenicity: number; // from comedogenic ratings
  irritation: number; // from irritation potential
  pregnancy: number; // penalty if unsafe
  euCompliance: number; // bonus/penalty for EU regulatory status
  details: string[]; // human-readable score notes
}

/**
 * Compute a comprehensive 0-100 safety score with breakdown.
 */
export function scoreIngredients(ingredients: ScannedIngredient[]): ScoreBreakdown {
  if (ingredients.length === 0) {
    return {
      overall: 0,
      safety: 0,
      comedogenicity: 0,
      irritation: 0,
      pregnancy: 0,
      euCompliance: 0,
      details: ["No ingredients found — unable to score."],
    };
  }

  let safetySum = 0;
  let comedogenicSum = 0;
  let irritationSum = 0;
  let pregnancySum = 0;
  let euSum = 0;
  const details: string[] = [];

  for (const ing of ingredients) {
    // --- Safety sub-score (0-100) ----------------------------------------
    let s = 50;
    if (ing.safetyRating) {
      s = safetyRatingScore(ing.safetyRating);
    } else if (ing.hazardScore !== undefined) {
      s = Math.max(0, (10 - ing.hazardScore) * 10);
    }
    safetySum += s;

    // --- Comedogenicity sub-score (0-100) ---------------------------------
    let c = 100;
    if (ing.comedogenicRating !== undefined) {
      c = Math.max(0, 100 - ing.comedogenicRating * 20);
      if (ing.comedogenicRating >= 4) {
        details.push(`${ing.name}: highly comedogenic (${ing.comedogenicRating}/5)`);
      }
    }
    comedogenicSum += c;

    // --- Irritation sub-score (0-100) -------------------------------------
    let i = 100;
    if (ing.irritationPotential) {
      i = irritationScore(ing.irritationPotential);
      if (ing.irritationPotential === "high") {
        details.push(`${ing.name}: high irritation potential`);
      }
    }
    irritationSum += i;

    // --- Pregnancy sub-score (0-100) --------------------------------------
    let p = 100;
    if (ing.pregnancySafe === false) {
      p = 0;
      details.push(`${ing.name}: avoid during pregnancy`);
    } else if (ing.pregnancySafe === true) {
      p = 100;
    } else {
      p = 70; // unknown = slight penalty
    }
    pregnancySum += p;

    // --- EU Compliance sub-score (0-100) ----------------------------------
    let e = 100;
    if (ing.euStatus) {
      if (ing.euStatus.bannedInEu) {
        e = 0;
        details.push(`${ing.name}: banned in EU`);
      } else if (ing.euStatus.restrictedInEu) {
        e = 40;
        details.push(`${ing.name}: restricted in EU`);
      }
    }
    euSum += e;
  }

  const n = ingredients.length;
  const safety = Math.round(safetySum / n);
  const comedogenicity = Math.round(comedogenicSum / n);
  const irritation = Math.round(irritationSum / n);
  const pregnancy = Math.round(pregnancySum / n);
  const euCompliance = Math.round(euSum / n);

  // Weighted overall
  const overall = Math.round(
    safety * 0.35 +
    comedogenicity * 0.25 +
    irritation * 0.20 +
    pregnancy * 0.15 +
    euCompliance * 0.05
  );

  if (details.length === 0) {
    details.push("No major concerns detected.");
  }

  return {
    overall,
    safety,
    comedogenicity,
    irritation,
    pregnancy,
    euCompliance,
    details,
  };
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function safetyRatingScore(rating: ScannedIngredient["safetyRating"]): number {
  switch (rating) {
    case "safe":
      return 100;
    case "low_concern":
      return 80;
    case "moderate_concern":
      return 50;
    case "high_concern":
      return 20;
    case "avoid":
      return 0;
    default:
      return 50;
  }
}

function irritationScore(potential: ScannedIngredient["irritationPotential"]): number {
  switch (potential) {
    case "none":
      return 100;
    case "low":
      return 80;
    case "moderate":
      return 50;
    case "high":
      return 20;
    default:
      return 70;
  }
}
