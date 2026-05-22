// Minimal safety engine stub for testing
// Will be replaced by full safety engine when sub-agent completes

/**
 * Check safety of ingredient against user profile
 * Stub version - simplified for testing
 */
function checkSafety(ingredient, userProfile) {
  // Check pregnancy
  if (userProfile.pregnant && isRetinoid(ingredient)) {
    return { status: 'RED', reason: 'Contraindicated during pregnancy', contraindications: ['Retinoids can cause birth defects'] };
  }
  
  // Check breastfeeding
  if (userProfile.breastfeeding && isRetinoid(ingredient)) {
    return { status: 'YELLOW', reason: 'Use caution while breastfeeding', contraindications: [] };
  }
  
  // Check allergies
  if (userProfile.allergies && userProfile.allergies.length > 0) {
    const ingredientName = ingredient.name || ingredient;
    for (const allergy of userProfile.allergies) {
      if (ingredientName.toLowerCase().includes(allergy.toLowerCase())) {
        return { status: 'RED', reason: `Contains known allergen: ${allergy}`, contraindications: [allergy] };
      }
    }
  }
  
  // Check medications
  if (userProfile.medications && userProfile.medications.includes('warfarin')) {
    const ingredientName = (ingredient.name || ingredient).toLowerCase();
    if (ingredientName.includes('vitamin e') || ingredientName.includes('fish oil')) {
      return { status: 'YELLOW', reason: 'May increase bleeding risk with warfarin', contraindications: ['Potential interaction with warfarin'] };
    }
  }
  
  return { status: 'GREEN', reason: 'No known contraindications', contraindications: [] };
}

/**
 * Check compatibility of multiple ingredients
 * Stub - basic incompatibility checking
 */
function checkCompatibility(ingredients) {
  const conflicts = [];
  const ingredientNames = ingredients.map(i => typeof i === 'string' ? i.toLowerCase() : (i.name || '').toLowerCase());
  
  // Retinol + Benzoyl Peroxide
  if (hasIngredient(ingredientNames, 'retinol') && hasIngredient(ingredientNames, 'benzoyl peroxide')) {
    conflicts.push('Retinol and Benzoyl Peroxide can destabilize each other');
  }
  
  // Vitamin C + Retinol
  if (hasIngredient(ingredientNames, 'vitamin c') && hasIngredient(ingredientNames, 'retinol')) {
    conflicts.push('Vitamin C and Retinol can cause irritation when used together');
  }
  
  return {
    compatible: conflicts.length === 0,
    conflicts: conflicts
  };
}

/**
 * Check pregnancy safety
 */
function checkPregnancySafety(ingredient, trimester) {
  if (isRetinoid(ingredient)) {
    return { safe: false, notes: 'CONTRAINDICATED: Vitamin A derivatives are teratogenic' };
  }
  return { safe: true, notes: 'No known pregnancy contraindications' };
}

/**
 * Check drug interactions
 */
function checkDrugInteractions(ingredient, medications) {
  const interactions = [];
  const severity = 'MILD';
  
  if (medications.includes('warfarin') && isVitaminE(ingredient)) {
    interactions.push('Vitamin E may increase bleeding risk with warfarin');
  }
  
  return { interactions, severity };
}

/**
 * Check allergy compatibility
 */
function checkAllergyCompatibility(ingredient, allergies) {
  const allergenMatches = [];
  const ingredientName = (ingredient.name || ingredient).toLowerCase();
  
  for (const allergy of allergies) {
    if (ingredientName.includes(allergy.toLowerCase())) {
      allergenMatches.push(allergy);
    }
  }
  
  return {
    safe: allergenMatches.length === 0,
    allergenMatches
  };
}

// =========================
// HELPER FUNCTIONS
// =========================

function isRetinoid(ingredient) {
  const name = (ingredient.name || ingredient).toLowerCase();
  return name.includes('retinol') || 
         name.includes('tretinoin') || 
         name.includes('adapalene') ||
         name.includes('tazarotene') ||
         name.includes('isotretinoin');
}

function isVitaminE(ingredient) {
  const name = (ingredient.name || ingredient).toLowerCase();
  return name.includes('vitamin e') || name.includes('tocopherol');
}

function hasIngredient(ingredients, target) {
  return ingredients.some(i => i.includes(target.toLowerCase()));
}

// =========================
// EXPORTS
// =========================

module.exports = {
  checkSafety,
  checkCompatibility,
  checkPregnancySafety,
  checkDrugInteractions,
  checkAllergyCompatibility
};
