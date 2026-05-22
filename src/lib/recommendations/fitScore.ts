import { 
  ConditionWithConfidence, 
  UserProfile, 
  Product, 
  RecommendationResult,
  IngredientMatch 
} from './types';

/**
 * Evidence level weights as specified in API-ARCHITECTURE.md
 * A=1.0, B=0.75, C=0.5, D=0.25
 */
const EVIDENCE_WEIGHTS = {
  A: 1.0,
  B: 0.75,
  C: 0.5,
  D: 0.25
};

/**
 * Calculate fitness score for a product based on conditions and user profile
 * Implements the algorithm from API-ARCHITECTURE.md
 */
export function calculateFitScore(
  product: Product,
  conditions: ConditionWithConfidence[],
  userProfile: UserProfile
): RecommendationResult {
  // Step 1: Find ingredients in product that address the user's conditions
  const matchedIngredients = findMatchingIngredients(product, conditions);
  
  // Step 2: Calculate base score from ingredient-condition effectiveness
  let baseScore = 0;
  let totalEffectiveness = 0;
  
  matchedIngredients.forEach(match => {
    // Base effectiveness from knowledge graph
    const effectiveness = match.effectiveness;
    
    // Evidence level bonus
    const evidenceWeight = EVIDENCE_WEIGHTS[match.evidence_level];
    
    // Weighted contribution to score
    const weightedEffectiveness = effectiveness * evidenceWeight;
    baseScore += weightedEffectiveness;
    totalEffectiveness += effectiveness;
  });
  
  // Normalize base score (0-60 range as per algorithm)
  const normalizedBase = Math.min(baseScore / Math.max(totalEffectiveness, 1), 1) * 60;
  
  // Step 3: Apply multipliers from API-ARCHITECTURE.md
  
  // Price factor
  const priceFactor = calculatePriceFactor(
    product.price_tier, 
    userProfile.preferred_price_tier
  );
  
  // Brand preference factor
  const brandFactor = calculateBrandFactor(
    product.brand, 
    userProfile.preferred_brands
  );
  
  // Skin type match factor
  const skinTypeFactor = calculateSkinTypeFactor(
    product.suitable_for_skin_types, 
    userProfile.skin_type
  );
  
  // Formulation factor (pH/texture suitability)
  const formulationFactor = calculateFormulationFactor(product);
  
  // Calculate final score
  let finalScore = normalizedBase * priceFactor * brandFactor * skinTypeFactor * formulationFactor;
  
  // Clamp to 0-100 range
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // Generate reasoning
  const reasoning = generateReasoning(
    matchedIngredients,
    conditions,
    userProfile,
    {
      priceFactor,
      brandFactor,
      skinTypeFactor,
      formulationFactor
    }
  );
  
  return {
    product_id: product.id,
    name: product.name,
    brand: product.brand,
    fit_score: Math.round(finalScore),
    evidence_level: getDominantEvidenceLevel(matchedIngredients),
    pregnancy_safe: product.pregnancy_safe,
    reasoning,
    key_actives: matchedIngredients.map(match => ({
      ingredient: match.name,
      effectiveness: match.effectiveness
    })),
    conditions_addressed: [...new Set(matchedConditions(matchedIngredients, conditions))],
    contraindications: [],
    price_tier: product.price_tier,
    category: product.category
  };
}

/**
 * Find ingredients in the product that address the user's conditions
 */
function findMatchingIngredients(
  product: Product,
  conditions: ConditionWithConfidence[]
): Array<{
  ingredient_id: string;
  name: string;
  effectiveness: number;
  evidence_level: 'A' | 'B' | 'C' | 'D';
}> {
  // In a real implementation, this would join product ingredients with 
  // condition connections from the database
  // For now, we'll return a mock structure
  return [];
}

/**
 * Calculate price factor based on user's price preference
 */
function calculatePriceFactor(
  productPriceTier: string,
  userPreferredPriceTier: string | undefined
): number {
  if (!userPreferredPriceTier) return 1.0;
  
  const priceTiers = ['$', '$$', '$$$', '$$$$'];
  const productIndex = priceTiers.indexOf(productPriceTier);
  const userIndex = priceTiers.indexOf(userPreferredPriceTier);
  
  if (productIndex === -1 || userIndex === -1) return 1.0;
  
  if (productIndex <= userIndex) return 1.0;
  if (productIndex === userIndex + 1) return 0.8;
  return 0.5;
}

/**
 * Calculate brand preference factor
 */
function calculateBrandFactor(
  productBrand: string,
  preferredBrands: string[] | undefined
): number {
  if (!preferredBrands || preferredBrands.length === 0) return 1.0;
  
  const isPreferred = preferredBrands.some(brand => 
    brand.toLowerCase() === productBrand.toLowerCase()
  );
  
  return isPreferred ? 1.2 : 1.0;
}

/**
 * Calculate skin type match factor
 */
function calculateSkinTypeFactor(
  suitableForSkinTypes: string[],
  userSkinType: string
): number {
  if (suitableForSkinTypes.includes(userSkinType)) return 1.0;
  
  // Check if it's at least acceptable
  const acceptableTypes = {
    oily: ['normal', 'combination'],
    dry: ['normal', 'sensitive'],
    combination: ['normal', 'oily', 'dry'],
    sensitive: ['normal'],
    normal: ['oily', 'dry', 'combination', 'sensitive']
  };
  
  const acceptable = acceptableTypes[userSkinType] || [];
  if (acceptable.some(type => suitableForSkinTypes.includes(type))) {
    return 0.7;
  }
  
  return 0.3;
}

/**
 * Calculate formulation factor (pH/texture suitability)
 * Simplified implementation - in reality would check pH and texture compatibility
 */
function calculateFormulationFactor(product: Product): number {
  // For now, assume all products have reasonable formulation
  // In a real implementation, this would check:
  // - pH appropriateness for skin type
  // - Texture suitability (e.g., gel for oily, cream for dry)
  return 1.0;
}

/**
 * Get the dominant evidence level among matched ingredients
 */
function getDominantEvidenceLevel(
  matches: Array<{
    evidence_level: 'A' | 'B' | 'C' | 'D';
  }>
): 'A' | 'B' | 'C' | 'D' {
  if (matches.length === 0) return 'D';
  
  // Count occurrences of each evidence level
  const counts: Record<'A' | 'B' | 'C' | 'D', number> = {
    A: 0, B: 0, C: 0, D: 0
  };
  
  matches.forEach(match => {
    counts[match.evidence_level]++;
  });
  
  // Return the most frequent evidence level
  return Object.entries(counts).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0] as 'A' | 'B' | 'C' | 'D';
}

/**
 * Get conditions addressed by matched ingredients
 */
function matchedConditions(
  matches: Array<{
    ingredient_id: string;
    name: string;
  }>,
  conditions: ConditionWithConfidence[]
): string[] {
  // In a real implementation, this would look up which conditions 
  // each ingredient addresses
  return conditions.map(c => c.id);
}

/**
 * Generate human-readable reasoning for the recommendation
 */
function generateReasoning(
  matchedIngredients: any[],
  conditions: ConditionWithConfidence[],
  userProfile: UserProfile,
  factors: {
    priceFactor: number;
    brandFactor: number;
    skinTypeFactor: number;
    formulationFactor: number;
  }
): string {
  const conditionNames = conditions.map(c => c.id).join(', ');
  const ingredientNames = matchedIngredients
    .map(i => i.name)
    .filter((name, index, self) => self.indexOf(name) === index)
    .join(', ');
  
  let reasoning = `Recommended for ${conditionNames} due to ${ingredientNames}.`;
  
  // Add factor explanations
  const factorExplanations = [];
  
  if (factors.priceFactor !== 1.0) {
    factorExplanations.push(`price suitability: ${(factors.priceFactor * 100).toFixed(0)}%`);
  }
  
  if (factors.brandFactor !== 1.0) {
    factorExplanations.push(`brand preference: ${(factors.brandFactor * 100).toFixed(0)}%`);
  }
  
  if (factors.skinTypeFactor !== 1.0) {
    factorExplanations.push(`skin type compatibility: ${(factors.skinTypeFactor * 100).toFixed(0)}%`);
  }
  
  if (factors.formulationFactor !== 1.0) {
    factorExplanations.push(`formulation suitability: ${(factors.formulationFactor * 100).toFixed(0)}%`);
  }
  
  if (factorExplanations.length > 0) {
    reasoning += ` Adjustments: ${factorExplanations.join(', ')}.`;
  }
  
  return reasoning;
}