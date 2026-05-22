/**
 * Compatibility Engine
 * Checks ingredient interactions, sequencing rules, pH conflicts,
 * and pregnancy safety for skincare routines.
 */

import { ScannedIngredient } from "./pipeline";

export interface CompatibilityConflict {
  type: "interaction" | "ph_conflict" | "sequencing" | "pregnancy" | "sensitivity" | "synergy";
  severity: "critical" | "warning" | "info";
  ingredients: string[];
  message: string;
  suggestion?: string;
}

export interface CompatibilityResult {
  compatible: boolean; // true if no critical conflicts
  score: number; // 0-100 compatibility fit
  conflicts: CompatibilityConflict[];
  warnings: CompatibilityConflict[];
  synergies: CompatibilityConflict[];
}

/**
 * Check a product's ingredients against a user's existing routine.
 *
 * @param productIngredients — ingredients of the new product
 * @param routineIngredients — flattened ingredients from all routine steps
 * @param userContext — optional user constraints (pregnant, sensitive, etc.)
 */
export function checkCompatibility(
  productIngredients: ScannedIngredient[],
  routineIngredients: ScannedIngredient[],
  userContext?: {
    pregnant?: boolean;
    breastfeeding?: boolean;
    sensitive?: boolean;
    skinType?: string;
  }
): CompatibilityResult {
  const all = [...routineIngredients, ...productIngredients];
  const conflicts: CompatibilityConflict[] = [];
  const synergies: CompatibilityConflict[] = [];

  const names = (ings: ScannedIngredient[]) =>
    ings.map((i) => i.name.toLowerCase());
  const allNames = names(all);
  const productNames = names(productIngredients);

  // --- Critical Interactions ------------------------------------------
  if (has(productNames, ["retinol", "tretinoin", "adapalene", "tazarotene"]) &&
      has(productNames, ["aha", "glycolic acid", "lactic acid", "mandelic acid", "salicylic acid", "bha"])) {
    conflicts.push({
      type: "interaction",
      severity: "critical",
      ingredients: ["retinoid", "acid"],
      message: "Retinoids + acids on the same night cause severe irritation and barrier damage.",
      suggestion: "Use retinoids and acids on alternate nights.",
    });
  }

  if (has(allNames, ["benzoyl peroxide", "bpo"]) && has(allNames, ["tretinoin", "retinoic acid"])) {
    conflicts.push({
      type: "interaction",
      severity: "critical",
      ingredients: ["benzoyl peroxide", "tretinoin"],
      message: "Benzoyl peroxide degrades tretinoin when used together.",
      suggestion: "Apply tretinoin at night and benzoyl peroxide in the morning, or alternate days.",
    });
  }

  if (has(allNames, ["vitamin c", "l-ascorbic acid", "ascorbic acid"]) &&
      has(allNames, ["niacinamide"])) {
    conflicts.push({
      type: "ph_conflict",
      severity: "warning",
      ingredients: ["vitamin c", "niacinamide"],
      message: "Vitamin C (L-Ascorbic Acid, pH ~3.5) and Niacinamide (pH ~6) have conflicting pH ranges.",
      suggestion: "Apply them 15+ minutes apart, or use a Vitamin C derivative (e.g., Ascorbyl Glucoside) which is pH-compatible.",
    });
  }

  // --- Sequencing Warnings ----------------------------------------------
  if (has(productNames, ["retinoid", "retinol", "tretinoin"]) && has(productNames, ["peptide"])) {
    conflicts.push({
      type: "sequencing",
      severity: "warning",
      ingredients: ["retinoid", "peptide"],
      message: "Peptides may degrade in very low pH environments. Retinoids are optimally used at low pH.",
      suggestion: "Apply peptides first, wait 15 min, then apply retinoid.",
    });
  }

  // --- Pregnancy Safety ------------------------------------------------
  if (userContext?.pregnant || userContext?.breastfeeding) {
    const unsafe = productIngredients.filter(
      (ing) => ing.pregnancySafe === false
    );
    for (const ing of unsafe) {
      conflicts.push({
        type: "pregnancy",
        severity: "critical",
        ingredients: [ing.name],
        message: `${ing.name} is contraindicated during pregnancy / breastfeeding.`,
        suggestion: "Remove this product from your routine while pregnant or breastfeeding.",
      });
    }
  }

  // --- Synergies / Boosts -----------------------------------------------
  if (has(allNames, ["vitamin c", "ascorbic acid", "l-ascorbic acid"]) &&
      has(allNames, ["vitamin e", "tocopherol"]) &&
      has(allNames, ["ferulic acid"])) {
    synergies.push({
      type: "synergy",
      severity: "info",
      ingredients: ["vitamin c", "vitamin e", "ferulic acid"],
      message: "CEF serum combination — Vitamin C + E + Ferulic acid is clinically synergistic and improves photoprotection.",
    });
  }

  if (has(allNames, ["niacinamide"]) && has(allNames, ["hyaluronic acid", "sodium hyaluronate"])) {
    synergies.push({
      type: "synergy",
      severity: "info",
      ingredients: ["niacinamide", "hyaluronic acid"],
      message: "Niacinamide + Hyaluronic Acid work well together for barrier support and hydration.",
    });
  }

  if (has(allNames, ["azelaic acid"]) && has(allNames, ["niacinamide"])) {
    synergies.push({
      type: "synergy",
      severity: "info",
      ingredients: ["azelaic acid", "niacinamide"],
      message: "Azelaic Acid + Niacinamide are complementary for redness, post-inflammatory hyperpigmentation, and acne.",
    });
  }

  // --- Sensitivity guardrails ------------------------------------------
  if (userContext?.sensitive) {
    const irritants = productIngredients.filter(
      (ing) => ing.irritationPotential === "high" || ing.irritationPotential === "moderate"
    );
    if (irritants.length > 0) {
      conflicts.push({
        type: "sensitivity",
        severity: "warning",
        ingredients: irritants.map((i) => i.name),
        message: `This product contains ${irritants.length} potentially irritating ingredient(s) for sensitive skin.`,
        suggestion: "Consider a patch test before full-face use.",
      });
    }
  }

  // --- Score -----------------------------------------------------------
  const criticalCount = conflicts.filter((c) => c.severity === "critical").length;
  const warningCount = conflicts.filter((c) => c.severity === "warning").length;
  const synergyBoost = synergies.length * 5;

  let score = 100;
  score -= criticalCount * 30;
  score -= warningCount * 10;
  score += synergyBoost;
  score = Math.max(0, Math.min(100, score));

  return {
    compatible: criticalCount === 0,
    score,
    conflicts,
    warnings: conflicts.filter((c) => c.severity === "warning" || c.severity === "info"),
    synergies,
  };
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function has(names: string[], targets: string[]): boolean {
  const set = new Set(names);
  return targets.some((t) =>
    Array.from(set).some((n) => n.includes(t.toLowerCase()))
  );
}
