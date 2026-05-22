/**
 * Pregnancy & Breastfeeding Safety Flags
 * Ingredient-level safety classification for pregnancy and lactation.
 */

export type PregnancySafety =
  | "safe"
  | "caution"
  | "avoid"
  | "insufficient_data";

export interface PregnancyRule {
  ingredientPattern: string; // lowercase partial match
  pregnancy: PregnancySafety;
  breastfeeding: PregnancySafety;
  reason: string;
  // Trimester-specific override
  trimester1?: PregnancySafety;
  trimester2_3?: PregnancySafety;
}

export const PREGNANCY_RULES: PregnancyRule[] = [
  // --- Retinoids — systemic absorption, teratogenic ---
  {
    ingredientPattern: "tretinoin",
    pregnancy: "avoid",
    breastfeeding: "caution",
    reason: "Topical tretinoin has minimal systemic absorption, but theoretical teratogenic risk. Many dermatologists advise avoidance in pregnancy.",
  },
  {
    ingredientPattern: "adapalene",
    pregnancy: "avoid",
    breastfeeding: "caution",
    reason: "Category C; limited human data. Avoid in pregnancy.",
  },
  {
    ingredientPattern: "tazarotene",
    pregnancy: "avoid",
    breastfeeding: "avoid",
    reason: "Category X; significant teratogenic risk in animal studies.",
  },
  {
    ingredientPattern: "isotretinoin",
    pregnancy: "avoid",
    breastfeeding: "avoid",
    reason: "Category X; known teratogen. Absolute contraindication.",
  },
  {
    ingredientPattern: "retinol",
    pregnancy: "caution",
    breastfeeding: "safe",
    reason: "OTC retinol has lower conversion to retinoic acid. Generally considered low risk in small amounts, but many experts recommend caution in first trimester.",
    trimester1: "avoid",
    trimester2_3: "caution",
  },
  {
    ingredientPattern: "retinyl palmitate",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Ester form with very low conversion to active retinoic acid. Considered safe in cosmetic concentrations.",
  },

  // --- Hydroxy Acids ---
  {
    ingredientPattern: "salicylic acid",
    pregnancy: "caution",
    breastfeeding: "safe",
    reason: "High-dose oral salicylates (aspirin) are teratogenic. Topical use in cosmetic concentrations is generally considered low risk, but avoid high-concentration peels.",
    trimester1: "avoid",
    trimester2_3: "caution",
  },
  {
    ingredientPattern: "glycolic acid",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "AHA with minimal systemic absorption at cosmetic concentrations. Safe for topical use.",
  },
  {
    ingredientPattern: "lactic acid",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Naturally occurring AHA. Safe at cosmetic concentrations.",
  },
  {
    ingredientPattern: "mandelic acid",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Larger molecular weight AHA with slower penetration. Considered safe.",
  },

  // --- Vitamin C ---
  {
    ingredientPattern: "ascorbic acid",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Vitamin C is essential in pregnancy and safe topically.",
  },
  {
    ingredientPattern: "vitamin c",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Safe antioxidant. Beneficial for preventing melasma in pregnancy.",
  },

  // --- Niacinamide ---
  {
    ingredientPattern: "niacinamide",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Vitamin B3. Safe and beneficial for barrier support, acne, and hyperpigmentation during pregnancy.",
  },

  // --- Hydroquinone ---
  {
    ingredientPattern: "hydroquinone",
    pregnancy: "avoid",
    breastfeeding: "avoid",
    reason: "High systemic absorption (35-45%). Associated with ochronosis and theoretical fetal risk. Use azelaic acid or vitamin C as alternatives.",
  },

  // --- Benzoyl Peroxide ---
  {
    ingredientPattern: "benzoyl peroxide",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Metabolized to benzoic acid in skin. Minimal systemic absorption. Safe for acne in pregnancy.",
  },

  // --- Azelaic Acid ---
  {
    ingredientPattern: "azelaic acid",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Category B. Safe and effective for acne and melasma in pregnancy.",
  },

  // --- Chemical Sunscreens ---
  {
    ingredientPattern: "oxybenzone",
    pregnancy: "caution",
    breastfeeding: "caution",
    reason: "Potential endocrine disruption and systemic absorption detected in studies. Prefer mineral sunscreens (zinc oxide, titanium dioxide) during pregnancy.",
  },
  {
    ingredientPattern: "avobenzone",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Generally considered safe, but prefer mineral filters if concerned.",
  },
  {
    ingredientPattern: "octinoxate",
    pregnancy: "caution",
    breastfeeding: "caution",
    reason: "Some endocrine disruption concerns in animal studies. Use mineral sunscreens as alternative.",
  },

  // --- Mineral Sunscreens ---
  {
    ingredientPattern: "zinc oxide",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Physical UV filter. Safe in pregnancy and breastfeeding.",
  },
  {
    ingredientPattern: "titanium dioxide",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Physical UV filter. Safe in pregnancy and breastfeeding.",
  },

  // --- Essential Oils / Fragrance ---
  {
    ingredientPattern: "essential oil",
    pregnancy: "caution",
    breastfeeding: "caution",
    reason: "Variable safety profiles. Some essential oils are contraindicated in pregnancy. Prefer fragrance-free products.",
  },
  {
    ingredientPattern: "tea tree oil",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Generally safe in cosmetic dilutions. Avoid undiluted use.",
  },

  // --- Peptides ---
  {
    ingredientPattern: "peptide",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Topical peptides have negligible systemic absorption. Safe.",
  },

  // --- Ceramides ---
  {
    ingredientPattern: "ceramide",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Barrier-supporting lipids. Safe in all stages.",
  },

  // --- Hyaluronic Acid ---
  {
    ingredientPattern: "hyaluronic acid",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Naturally occurring in body. Very safe.",
  },

  // --- Sulfur ---
  {
    ingredientPattern: "sulfur",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Category C orally, but topical use in acne products is generally considered safe.",
  },

  // --- Clindamycin (prescription topical) ---
  {
    ingredientPattern: "clindamycin",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Category B. Safe topical antibiotic for pregnancy acne.",
  },

  // --- Erythromycin (prescription topical) ---
  {
    ingredientPattern: "erythromycin",
    pregnancy: "safe",
    breastfeeding: "safe",
    reason: "Category B. Safe topical antibiotic.",
  },
];

/**
 * Check a single ingredient against pregnancy rules.
 */
export function checkPregnancy(
  ingredientName: string,
  options?: { trimester?: 1 | 2 | 3; breastfeeding?: boolean }
): PregnancyRule | null {
  const normalized = ingredientName.toLowerCase();
  const rule = PREGNANCY_RULES.find((r) => normalized.includes(r.ingredientPattern));
  if (!rule) return null;

  // Apply trimester-specific override if present
  if (options?.trimester === 1 && rule.trimester1) {
    return { ...rule, pregnancy: rule.trimester1 };
  }
  if (
    (options?.trimester === 2 || options?.trimester === 3) &&
    rule.trimester2_3
  ) {
    return { ...rule, pregnancy: rule.trimester2_3 };
  }

  return rule;
}

/**
 * Check multiple ingredients and return all pregnancy concerns.
 */
export function checkPregnancyForList(
  ingredientNames: string[],
  options?: { trimester?: 1 | 2 | 3; breastfeeding?: boolean }
): Array<{ ingredient: string; rule: PregnancyRule }> {
  const concerns: Array<{ ingredient: string; rule: PregnancyRule }> = [];
  for (const name of ingredientNames) {
    const rule = checkPregnancy(name, options);
    if (rule && (rule.pregnancy === "avoid" || rule.pregnancy === "caution")) {
      concerns.push({ ingredient: name, rule });
    }
  }
  return concerns;
}
