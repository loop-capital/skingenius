/**
 * Ingredient Interactions & Sequencing Rules
 * Defines known incompatible combinations and proper sequencing guidelines.
 */

export interface InteractionRule {
  id: string;
  type: "incompatible" | "synergistic" | "sequencing" | "ph_dependent";
  ingredients: string[]; // ingredient name patterns (lowercase, partial match)
  severity: "critical" | "warning" | "info";
  message: string;
  suggestion?: string;
  // Optional: pH constraints
  phRange?: [number, number];
  // Optional: time-of-day guidance
  timeOfDay?: "am" | "pm" | "either" | "alternate";
}

export const INTERACTION_RULES: InteractionRule[] = [
  // --- Incompatible Combinations ---
  {
    id: "retinol-aha-bha",
    type: "incompatible",
    ingredients: ["retinol", "tretinoin", "adapalene", "tazarotene", "aha", "glycolic acid", "lactic acid", "salicylic acid", "bha"],
    severity: "critical",
    message: "Retinoids + acids on the same night cause severe irritation and barrier compromise.",
    suggestion: "Use retinoids and acids on alternate nights. If tolerating well, acids AM / retinoid PM.",
    timeOfDay: "alternate",
  },
  {
    id: "benzoyl-peroxide-tretinoin",
    type: "incompatible",
    ingredients: ["benzoyl peroxide", "bpo", "tretinoin", "retinoic acid"],
    severity: "critical",
    message: "Benzoyl peroxide oxidizes and degrades tretinoin, reducing efficacy of both.",
    suggestion: "Apply tretinoin PM and benzoyl peroxide AM, or use on alternate days.",
    timeOfDay: "alternate",
  },
  {
    id: "vitamin-c-niacinamide",
    type: "ph_dependent",
    ingredients: ["l-ascorbic acid", "ascorbic acid", "niacinamide"],
    severity: "warning",
    message: "Pure L-Ascorbic Acid (pH ~3.5) and Niacinamide (optimal pH ~6) have conflicting pH ranges.",
    suggestion: "Wait 15+ minutes between layers, or switch to a pH-neutral Vitamin C derivative (Ascorbyl Glucoside, Magnesium Ascorbyl Phosphate).",
    phRange: [3.0, 3.5],
  },
  {
    id: "copper-peptide-acid",
    type: "incompatible",
    ingredients: ["copper peptide", "copper tripeptide", "aha", "glycolic acid", "lactic acid", "salicylic acid", "bha", "vitamin c", "ascorbic acid"],
    severity: "warning",
    message: "Acids can destabilize copper peptides and reduce their efficacy.",
    suggestion: "Use copper peptides on nights you skip acids and Vitamin C.",
    timeOfDay: "alternate",
  },
  {
    id: "aha-retinoid-vitamin-c",
    type: "incompatible",
    ingredients: ["aha", "glycolic acid", "lactic acid", "retinoid", "retinol", "tretinoin", "vitamin c", "ascorbic acid"],
    severity: "critical",
    message: "Using AHA + retinoid + Vitamin C together is a recipe for barrier damage and sensitization.",
    suggestion: "Max 2 active ingredients per routine. Rotate: Acids AM, Retinoid PM, Vitamin C on off-nights if needed.",
    timeOfDay: "alternate",
  },

  // --- Synergistic Combinations ---
  {
    id: "cef-synergy",
    type: "synergistic",
    ingredients: ["vitamin c", "ascorbic acid", "vitamin e", "tocopherol", "ferulic acid"],
    severity: "info",
    message: "Vitamin C + E + Ferulic Acid is the gold-standard antioxidant combination, doubling photoprotection.",
    suggestion: "Use in the morning under sunscreen for maximum UV protection.",
    timeOfDay: "am",
  },
  {
    id: "niacinamide-hyaluronic-acid",
    type: "synergistic",
    ingredients: ["niacinamide", "hyaluronic acid", "sodium hyaluronate"],
    severity: "info",
    message: "Niacinamide + Hyaluronic Acid support barrier function and hydration without conflict.",
    suggestion: "Safe to layer together. Apply thinnest to thickest.",
  },
  {
    id: "azelaic-niacinamide",
    type: "synergistic",
    ingredients: ["azelaic acid", "niacinamide"],
    severity: "info",
    message: "Azelaic Acid + Niacinamide complement each other for redness, PIH, and acne-prone skin.",
    suggestion: "Can be used together AM or PM. Azelaic first, Niacinamide second.",
  },
  {
    id: "retinol-peptide-buffer",
    type: "synergistic",
    ingredients: ["retinol", "peptide", "ceramide", "niacinamide"],
    severity: "info",
    message: "Peptides, ceramides, and niacinamide buffer retinol irritation while supporting collagen.",
    suggestion: "Apply retinol first, wait 20 min, then follow with peptide/ceramide moisturizer.",
    timeOfDay: "pm",
  },

  // --- Sequencing Rules ---
  {
    id: "order-low-ph-first",
    type: "sequencing",
    ingredients: ["aha", "glycolic acid", "lactic acid", "bha", "salicylic acid", "vitamin c", "ascorbic acid"],
    severity: "info",
    message: "Low-pH active ingredients should be applied first, directly after cleansing.",
    suggestion: "Cleanse → Low-pH active → Wait 15-20 min → Hydrator → Moisturizer → SPF (AM).",
    phRange: [2.5, 4.0],
    timeOfDay: "either",
  },
  {
    id: "retinoid-pm-only",
    type: "sequencing",
    ingredients: ["retinol", "tretinoin", "adapalene", "tazarotene"],
    severity: "warning",
    message: "Retinoids are photosensitizing and should only be used at night.",
    suggestion: "Apply retinoids in your PM routine. Never skip sunscreen the next morning.",
    timeOfDay: "pm",
  },
  {
    id: "vitamin-c-am-preference",
    type: "sequencing",
    ingredients: ["l-ascorbic acid", "ascorbic acid"],
    severity: "info",
    message: "Vitamin C is best used in the morning for antioxidant photoprotection.",
    suggestion: "Apply Vitamin C in AM routine, before moisturizer and sunscreen.",
    timeOfDay: "am",
  },

  // --- Additional Cautions ---
  {
    id: "exfoliation-overload",
    type: "incompatible",
    ingredients: ["aha", "bha", "pha", "retinol", "tretinoin", "enzyme", "physical scrub"],
    severity: "warning",
    message: "Using multiple exfoliants simultaneously leads to over-exfoliation, barrier damage, and retinoid dermatitis.",
    suggestion: "Limit to ONE exfoliant per routine. Rotate types, never stack.",
    timeOfDay: "alternate",
  },
  {
    id: "fragrance-sensitive",
    type: "incompatible",
    ingredients: ["fragrance", "parfum", "essential oil", "eugenol", "linalool", "limonene", "citronellol"],
    severity: "warning",
    message: "Fragrance and essential oils are common sensitizers, especially for rosacea or eczema-prone skin.",
    suggestion: "Patch test new fragranced products. Consider fragrance-free alternatives for sensitive skin.",
  },
];

/**
 * Check a list of ingredients against all interaction rules.
 */
export function checkRules(ingredientNames: string[]): InteractionRule[] {
  const normalized = ingredientNames.map((n) => n.toLowerCase());
  return INTERACTION_RULES.filter((rule) => {
    return rule.ingredients.some((pattern) => normalized.some((n) => n.includes(pattern)));
  });
}
