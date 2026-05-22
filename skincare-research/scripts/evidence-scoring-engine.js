// Evidence Scoring Engine for SKINgenius
// Scores ingredient-condition pairs by evidence quality

const { createClient } = require('@supabase/supabase-js');

// Evidence levels
const EVIDENCE_LEVELS = {
  META_ANALYSIS: { level: 1, score: 10, label: 'Meta-Analysis/Systematic Review' },
  RCT: { level: 2, score: 8, label: 'Randomized Controlled Trial' },
  CLINICAL_STUDY: { level: 3, score: 6, label: 'Clinical Study' },
  MECHANISTIC: { level: 4, score: 4, label: 'Mechanistic/In Vitro' },
  ANECDOTAL: { level: 5, score: 2, label: 'Anecdotal/Traditional' }
};

// Grade thresholds
const GRADES = [
  { min: 9.0, grade: 'A+', recommendation: 'Gold standard, first-line' },
  { min: 8.0, grade: 'A', recommendation: 'Strong evidence, recommend confidently' },
  { min: 7.0, grade: 'B+', recommendation: 'Good evidence, recommend' },
  { min: 6.0, grade: 'B', recommendation: 'Moderate evidence, consider' },
  { min: 5.0, grade: 'C+', recommendation: 'Limited evidence, may help' },
  { min: 4.0, grade: 'C', recommendation: 'Weak evidence, adjunct only' },
  { min: 2.0, grade: 'D', recommendation: 'Minimal evidence, do not rely on' },
  { min: 0, grade: 'F', recommendation: 'No evidence or potentially harmful' }
];

/**
 * Calculate evidence score for an ingredient-condition pair
 * @param {Object} params - Scoring parameters
 * @param {number} params.evidenceLevel - 1-5 (meta-analysis to anecdotal)
 * @param {number} params.concentrationEfficacy - 2-10
 * @param {number} params.safetyMargin - 2-10
 * @param {number} params.mechanismMatch - 2-10
 * @param {number} params.clinicalOutcomes - 2-10
 * @returns {Object} { totalScore, grade, recommendation, breakdown }
 */
function calculateScore({ evidenceLevel, concentrationEfficacy, safetyMargin, mechanismMatch, clinicalOutcomes }) {
  const evidenceScore = 12 - (evidenceLevel * 2); // Level 1=10, 2=8, 3=6, 4=4, 5=2
  
  const weights = {
    evidence: 0.40,
    concentration: 0.20,
    safety: 0.20,
    mechanism: 0.15,
    outcomes: 0.05
  };
  
  const totalScore = (
    evidenceScore * weights.evidence +
    concentrationEfficacy * weights.concentration +
    safetyMargin * weights.safety +
    mechanismMatch * weights.mechanism +
    clinicalOutcomes * weights.outcomes
  );
  
  const gradeInfo = GRADES.find(g => totalScore >= g.min);
  
  return {
    totalScore: Math.round(totalScore * 10) / 10,
    grade: gradeInfo.grade,
    recommendation: gradeInfo.recommendation,
    breakdown: {
      evidence: { score: evidenceScore, weighted: evidenceScore * weights.evidence, weight: weights.evidence },
      concentration: { score: concentrationEfficacy, weighted: concentrationEfficacy * weights.concentration, weight: weights.concentration },
      safety: { score: safetyMargin, weighted: safetyMargin * weights.safety, weight: weights.safety },
      mechanism: { score: mechanismMatch, weighted: mechanismMatch * weights.mechanism, weight: weights.mechanism },
      outcomes: { score: clinicalOutcomes, weighted: clinicalOutcomes * weights.outcomes, weight: weights.outcomes }
    }
  };
}

/**
 * Check safety flags for an ingredient against user profile
 * @param {Object} ingredient - Ingredient with safety_flags
 * @param {Object} userProfile - User's health profile
 * @returns {Object} { status: 'GREEN'|'YELLOW'|'RED', reason: string, contraindications: [] }
 */
function checkSafety(ingredient, userProfile) {
  const flags = ingredient.safety_flags || {};
  const contraindications = [];
  
  // Pregnancy check
  if (userProfile.pregnant && flags.pregnancy_contraindicated) {
    contraindications.push('Contraindicated during pregnancy');
  }
  if (userProfile.pregnant && flags.pregnancy_caution) {
    contraindications.push('Use caution during pregnancy');
  }
  
  // Breastfeeding check
  if (userProfile.breastfeeding && flags.breastfeeding_contraindicated) {
    contraindications.push('Contraindicated while breastfeeding');
  }
  
  // Medication interactions
  if (userProfile.medications && flags.drug_interactions) {
    const interactions = flags.drug_interactions.filter(drug => 
      userProfile.medications.includes(drug)
    );
    if (interactions.length > 0) {
      contraindications.push(`Interacts with: ${interactions.join(', ')}`);
    }
  }
  
  // Allergy check
  if (userProfile.allergies && flags.common_allergens) {
    const allergens = flags.common_allergens.filter(allergen =>
      userProfile.allergies.includes(allergen)
    );
    if (allergens.length > 0) {
      contraindications.push(`Contains allergens: ${allergens.join(', ')}`);
    }
  }
  
  // Skin type check
  if (userProfile.skin_type && flags.avoid_for_skin_types) {
    if (flags.avoid_for_skin_types.includes(userProfile.skin_type)) {
      contraindications.push(`May not be suitable for ${userProfile.skin_type} skin`);
    }
  }
  
  // Determine status
  let status = 'GREEN';
  let reason = 'No known contraindications';
  
  if (contraindications.some(c => c.includes('Contraindicated'))) {
    status = 'RED';
    reason = contraindications.find(c => c.includes('Contraindicated'));
  } else if (contraindications.length > 0) {
    status = 'YELLOW';
    reason = contraindications.join('; ');
  }
  
  return { status, reason, contraindications };
}

/**
 * Generate recommendation for a user based on their condition and profile
 * @param {string} conditionSlug - e.g., 'acne', 'photoaging'
 * @param {Object} userProfile - User's health profile
 * @param {Array} scoredIngredients - Array of { ingredient, score } objects
 * @returns {Object} { recommendations: [], contraindications: [], notes: string }
 */
function generateRecommendations(conditionSlug, userProfile, scoredIngredients) {
  const recommendations = [];
  const contraindications = [];
  
  // Sort by total score descending
  const sorted = scoredIngredients.sort((a, b) => b.score.totalScore - a.score.totalScore);
  
  for (const { ingredient, score } of sorted) {
    const safety = checkSafety(ingredient, userProfile);
    
    if (safety.status === 'RED') {
      contraindications.push({
        ingredient: ingredient.name,
        reason: safety.reason,
        score: score.totalScore
      });
      continue;
    }
    
    recommendations.push({
      ingredient: ingredient.name,
      score: score.totalScore,
      grade: score.grade,
      evidenceLevel: EVIDENCE_LEVELS[Object.keys(EVIDENCE_LEVELS).find(k => EVIDENCE_LEVELS[k].score === score.breakdown.evidence.score)]?.label,
      safetyStatus: safety.status,
      safetyNotes: safety.reason,
      recommendation: score.recommendation,
      concentrationRange: ingredient.concentration_range,
      mechanism: ingredient.mechanism_of_action,
      studies: ingredient.primary_studies || []
    });
  }
  
  // Take top 5
  const topRecommendations = recommendations.slice(0, 5);
  
  return {
    condition: conditionSlug,
    userProfile: {
      skinType: userProfile.skin_type,
      pregnant: userProfile.pregnant,
      breastfeeding: userProfile.breastfeeding,
      medications: userProfile.medications,
      allergies: userProfile.allergies
    },
    recommendations: topRecommendations,
    contraindications,
    notes: `Based on ${scoredIngredients.length} ingredients with evidence for ${conditionSlug}. Top recommendation: ${topRecommendations[0]?.ingredient || 'None suitable'}.`
  };
}

// Example usage
if (require.main === module) {
  // Test with retinol for photoaging
  const retinolScore = calculateScore({
    evidenceLevel: 2, // Multiple RCTs
    concentrationEfficacy: 10, // 0.3-1% proven effective
    safetyMargin: 6, // Irritation common
    mechanismMatch: 10, // Direct collagen synthesis
    clinicalOutcomes: 10 // Significant wrinkle reduction
  });
  
  console.log('Retinol for Photoaging:', retinolScore);
  
  // Test safety check
  const retinol = {
    name: 'Retinol',
    safety_flags: {
      pregnancy_contraindicated: true,
      breastfeeding_caution: true,
      drug_interactions: ['isotretinoin', 'tretinoin'],
      common_allergens: [],
      avoid_for_skin_types: ['sensitive']
    },
    concentration_range: '0.3-1%',
    mechanism_of_action: 'Stimulates collagen synthesis, increases cell turnover'
  };
  
  const pregnantUser = {
    skin_type: 'normal',
    pregnant: true,
    breastfeeding: false,
    medications: [],
    allergies: []
  };
  
  console.log('Safety for pregnant user:', checkSafety(retinol, pregnantUser));
}

module.exports = {
  calculateScore,
  checkSafety,
  generateRecommendations,
  EVIDENCE_LEVELS,
  GRADES
};
