// Recommendation Engine for SKINgenius
// Generates personalized, holistic, evidence-based, safe skincare recommendations

const { createClient } = require('@supabase/supabase-js');
const evidenceScoringEngine = require('./evidence-scoring-engine');
const safetyEngine = require('./safety-engine');
const getUpLookIntegration = require('./getuplook-integration');

// ========================
// CONFIGURATION
// ========================

// Conditions we support (from condition-root-cause-mapping.md)
const SUPPORTED_CONDITIONS = [
  'acne',
  'photoaging',
  'hyperpigmentation',
  'rosacea',
  'eczema',
  'dry-skin',
  'sensitive-skin',
  'oily-skin',
  'dark-circles',
  'texture-irregularities'
];

// Severity thresholds (from condition-root-cause-mapping.md)
const SEVERITY_THRESHOLDS = {
  MILD: 3,
  MODERATE: 6,
  SEVERE: 8,
  VERY_SEVERE: 10
};

// Recommendation limits
const MAX_PRODUCT_RECOMMENDATIONS = 5;
const MAX_SUPPLEMENT_RECOMMENDATIONS = 5;
const MAX_LIFESTYLE_RECOMMENDATIONS = 7;

// ========================
// MAIN FUNCTION
// ========================

/**
 * Generate holistic recommendations for a user
 * @param {Object} userData - User's profile from questionnaire + photo analysis
 * @returns {Object} Complete recommendation package
 */
async function generateRecommendations(userData) {
  try {
    // 1. Validate and normalize input
    const userProfile = normalizeUserProfile(userData);
    
    // 2. Identify user's conditions from photo analysis + symptoms
    const conditions = await identifyUserConditions(userProfile);
    
    // 3. For each condition, get holistic recommendations
    const conditionRecommendations = {};
    for (const condition of conditions) {
      conditionRecommendations[condition] = await getConditionRecommendations(
        condition,
        userProfile
      );
    }
    
    // 4. Build holistic routine (AM/PM)
    const holisticRoutine = buildHolisticRoutine(
      conditionRecommendations,
      userProfile
    );
    
    // 5. Generate lifestyle plan
    const lifestylePlan = generateLifestylePlan(
      conditionRecommendations,
      userProfile
    );
    
    // 6. Generate supplement protocol
    const supplementProtocol = generateSupplementProtocol(
      conditionRecommendations,
      userProfile
    );
    
    // 7. Determine if professional referral needed
    const professionalReferral = assessNeedForProfessionalReferral(
      conditions,
      userProfile
    );
    
    // 8. Generate GetUpLook professional service recommendations
    const professionalServices = getUpLookIntegration.generateProfessionalRecommendations(
      userProfile,
      conditionRecommendations,
      0 // Week 0 = initial assessment
    );
    
    // 9. Build complete response
    return {
      userId: userProfile.id,
      timestamp: new Date().toISOString(),
      conditions: conditions,
      conditionRecommendations: conditionRecommendations,
      holisticRoutine: holisticRoutine,
      lifestylePlan: lifestylePlan,
      supplementProtocol: supplementProtocol,
      professionalReferral: professionalReferral,
      professionalServices: professionalServices,
      summary: generateSummary(
        conditionRecommendations,
        holisticRoutine,
        lifestylePlan,
        supplementProtocol,
        professionalReferral,
        professionalServices
      )
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}

// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Normalize and validate user profile data
 */
function normalizeUserProfile(rawData) {
  return {
    id: rawData.id || `temp_${Date.now()}`,
    age: rawData.age || 0,
    skinType: normalizeSkinType(rawData.skin_type),
    pregnant: !!rawData.pregnant,
    breastfeeding: !!rawData.breastfeeding,
    menstruating: rawData.menstruating !== undefined ? !!rawData.menstruating : true,
    menopausal: !!rawData.menopausal,
    medications: Array.isArray(rawData.medications) ? rawData.medications : [],
    allergies: Array.isArray(rawData.allergies) ? rawData.allergies : [],
    currentProducts: Array.isArray(rawData.current_products) ? rawData.current_products : [],
    symptoms: Array.isArray(rawData.symptoms) ? rawData.symptoms : [],
    lifestyleFactors: {
      sleepHours: rawData.sleep_hours || 7,
      stressLevel: rawData.stress_level || 5, // 1-10 scale
      exerciseFrequency: rawData.exercise_frequency || 3, // times per week
      alcoholConsumption: rawData.alcohol_consumption || 2, // drinks per week
      smoking: !!rawData.smoking,
      dietType: rawData.diet_type || 'standard',
      waterIntake: rawData.water_intake || 5, // glasses per day
      sunExposure: rawData.sun_exposure || 'moderate' // low/moderate/high
    },
    // From photo analysis (if available)
    photoAnalysis: rawData.photo_analysis || {},
    // Biomarkers (if available from Basys Health API)
    biomarkers: rawData.biomarkers || {}
  };
}

/**
 * Normalize skin type to standard values
 */
function normalizeSkinType(input) {
  if (!input) return 'normal';
  const map = {
    'oily': 'oily',
    'dry': 'dry',
    'combination': 'combination',
    'normal': 'normal',
    'sensitive': 'sensitive',
    'acne-prone': 'oily', // Treat as oily for product selection
    'mature': 'normal', // Age handled separately
    'redness-prone': 'sensitive'
  };
  return map[input.toLowerCase().trim()] || 'normal';
}

/**
 * Identify user's conditions from symptoms + photo analysis
 * In production, this would use AI vision + symptom matching
 */
async function identifyUserConditions(userProfile) {
  const conditions = [];
  
  // Check symptoms
  const symptomMap = {
    'breakouts': 'acne',
    'pimples': 'acne',
    'blackheads': 'acne',
    'whiteheads': 'acne',
    'wrinkles': 'photoaging',
    'fine lines': 'photoaging',
    'sun spots': 'hyperpigmentation',
    'dark spots': 'hyperpigmentation',
    'melasma': 'hyperpigmentation',
    'redness': 'rosacea',
    'flushing': 'rosacea',
    'visible vessels': 'rosacea',
    'itching': 'eczema',
    'dry patches': 'eczema',
    'flaking': 'eczema',
    'tightness': 'dry-skin',
    'rough texture': 'texture-irregularities',
    'bumpy skin': 'texture-irregularities',
    'dark circles': 'dark-circles',
    'puffiness': 'dark-circles',
    'large pores': 'oily-skin',
    'shiny appearance': 'oily-skin',
    'sensitive to products': 'sensitive-skin',
    'stinging': 'sensitive-skin',
    'burning': 'sensitive-skin'
  };
  
  for (const symptom of userProfile.symptoms) {
    const condition = symptomMap[symptom.toLowerCase()];
    if (condition && !conditions.includes(condition)) {
      conditions.push(condition);
    }
  }
  
  // Check photo analysis (if available)
  if (userProfile.photoAnalysis && userProfile.photoAnalysis.detectedConditions) {
    for (const condition of userProfile.photoAnalysis.detectedConditions) {
      if (SUPPORTED_CONDITIONS.includes(condition) && !conditions.includes(condition)) {
        conditions.push(condition);
      }
    }
  }
  
  // If no conditions detected but user has skin concerns, default to general assessment
  if (conditions.length === 0 && userProfile.symptoms.length > 0) {
    conditions.push('general-skincare');
  }
  
  return conditions;
}

/**
 * Get holistic recommendations for a specific condition
 */
async function getConditionRecommendations(condition, userProfile) {
  // 1. Get evidence-scored ingredients for this condition
  const scoredIngredients = await getScoredIngredientsForCondition(condition);
  
  // 2. Filter by safety (check against user profile)
  const safeIngredients = [];
  for (const ingredientData of scoredIngredients) {
    const safetyCheck = safetyEngine.checkSafety(
      ingredientData.ingredient,
      userProfile
    );
    
    if (safetyCheck.status === 'GREEN' || safetyCheck.status === 'YELLOW') {
      safeIngredients.push({
        ...ingredientData,
        safetyStatus: safetyCheck.status,
        safetyReason: safetyCheck.reason
      });
    }
  }
  
  // 3. Sort by evidence score (highest first)
  safeIngredients.sort((a, b) => b.score.totalScore - a.score.totalScore);
  
  // 4. Build category-specific recommendations
  return {
    condition: condition,
    severity: assessConditionSeverity(condition, userProfile),
    rootCauses: await getRootCausesForCondition(condition, userProfile),
    products: buildProductRecommendations(safeIngredients, userProfile, condition),
    supplements: buildSupplementRecommendations(safeIngredients, userProfile, condition),
    lifestyle: buildLifestyleRecommendations(condition, userProfile),
    professional: assessProfessionalNeed(condition, userProfile),
    evidenceSummary: generateEvidenceSummary(safeIngredients.slice(0, 3))
  };
}

/**
 * Get evidence-scored ingredients for a condition from local files or database
 */
async function getScoredIngredientsForCondition(condition) {
  try {
    // Try to load from local JSON files first
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(
      process.cwd(),
      'skincare-research',
      'data',
      'evidence-scores',
      `${condition.replace(/\s+/g, '-').toLowerCase()}-scores.json`
    );
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data.map(item => ({
        ingredient: {
          name: item.ingredient,
          inci_name: item.INCI_name || item.ingredient,
          concentration_range: item.concentration_range,
          mechanism_of_action: item.mechanism_of_action,
          safety_flags: extractSafetyFlagsFromItem(item),
          primary_studies: item.primary_studies || []
        },
        score: {
          totalScore: item.total_score,
          grade: item.grade,
          evidenceLevel: item.evidence_level,
          evidenceLevelLabel: item.evidence_level_label,
          concentrationEfficacy: item.concentration_efficacy,
          safetyMargin: item.safety_margin,
          mechanismMatch: item.mechanism_match,
          clinicalOutcomes: item.clinical_outcomes,
          breakdown: {
            evidence: {
              score: item.evidence_level_score || 0,
              weighted: item.evidence_level_score || 0
            },
            concentration: {
              score: item.concentration_efficacy,
              weighted: item.concentration_efficacy * 0.20
            },
            safety: {
              score: item.safety_margin,
              weighted: item.safety_margin * 0.20
            },
            mechanism: {
              score: item.mechanism_match,
              weighted: item.mechanism_match * 0.15
            },
            outcomes: {
              score: item.clinical_outcomes,
              weighted: item.clinical_outcomes * 0.05
            }
          }
        }
      }));
    }
  } catch (error) {
    console.warn(`Could not load scored ingredients for ${condition}:`, error.message);
  }
  
  // Fallback: return empty array (will be populated later)
  return [];
}

/**
 * Extract safety flags from scored ingredient item
 */
function extractSafetyFlagsFromItem(item) {
  // Extract what we can from the scoring data
  const flags = {};
  
  // Pregnancy/breastfeeding from safety margin (if low due to pregnancy risk)
  if (item.safety_margin <= 4) {
    flags.pregnancy_contraindicated = true;
    flags.breastfeeding_caution = true;
  }
  
  // Mechanism hints for allergies
  if (item.mechanism_of_action && 
      item.mechanism_of_action.toLowerCase().includes('fragrance')) {
    flags.common_allergens = ['fragrance'];
  }
  
  return flags;
}

/**
 * Assess severity of a condition for this user
 */
function assessConditionSeverity(condition, userProfile) {
  // Simple heuristic based on symptoms and age
  let severity = 5; // Default moderate
  
  // Adjust based on symptom count for this condition
  const conditionSymptoms = {
    acne: ['breakouts', 'pimples', 'blackheads', 'whiteheads', 'cysts'],
    photoaging: ['wrinkles', 'fine lines', 'sun damage', 'loss of elasticity'],
    hyperpigmentation: ['dark spots', 'sun spots', 'melasma', 'uneven tone'],
    rosacea: ['redness', 'flushing', 'visible vessels', 'bumps'],
    eczema: ['itching', 'dry patches', 'flaking', 'redness', 'scaling'],
    'dry-skin': ['tightness', 'flaking', 'rough texture', 'itching'],
    'sensitive-skin': ['stinging', 'burning', 'redness', 'itching', 'rash'],
    'oily-skin': ['shiny appearance', 'large pores', 'breakouts', 'blackheads'],
    'dark-circles': ['dark circles', 'puffiness', 'shadows under eyes'],
    'texture-irregularities': ['rough texture', 'bumpy skin', 'uneven texture', 'keratosis pilaris']
  };
  
  const symptoms = conditionSymptoms[condition] || [];
  let symptomCount = 0;
  for (const symptom of symptoms) {
    if (userProfile.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))) {
      symptomCount++;
    }
  }
  
  // More symptoms = higher severity (capped at 10)
  severity = Math.min(10, 3 + (symptomCount * 2));
  
  // Adjust for age (older skin may show more photoaging)
  if (condition === 'photoaging' && userProfile.age > 40) {
    severity = Math.min(10, severity + 2);
  }
  
  // Adjust for lifestyle factors
  if (userProfile.lifestyleFactors.stressLevel > 7) {
    // Stress worsens almost all conditions
    severity = Math.min(10, severity + 1);
  }
  
  if (userProfile.lifestyleFactors.sleepHours < 6) {
    // Poor sleep worsens inflammation
    severity = Math.min(10, severity + 1);
  }
  
  return severity;
}

/**
 * Get root causes for a condition based on user profile
 */
async function getRootCausesForCondition(condition, userProfile) {
  // This would ideally query a root cause mapping database
  // For now, return based on condition knowledge
  
  const rootCauseMap = {
    acne: [
      'gut-dysbiosis',
      'insulin-resistance',
      'hormonal-imbalance',
      'inflammation'
    ],
    photoaging: [
      'uv-damage',
      'oxidative-stress',
      'glycation',
      'collagen-degradation',
      'hormonal-decline'
    ],
    hyperpigmentation: [
      'uv-exposure',
      'hormonal-changes',
      'inflammation',
      'oxidative-stress'
    ],
    rosacea: [
      'neurovascular-dysregulation',
      'demodex-overgrowth',
      'barrier-dysfunction',
      'gut-dysbiosis',
      'inflammation'
    ],
    eczema: [
      'barrier-dysfunction',
      'immune-dysregulation',
      'microbiome-imbalance',
      'allergic-sensitization'
    ],
    'dry-skin': [
      'barrier-dysfunction',
      'low-humidity',
      'aging',
      'harsh-skincare',
      'dehydration',
      'thyroid-dysfunction'
    ],
    'sensitive-skin': [
      'barrier-dysfunction',
      'nerve-hypersensitivity',
      'microbiome-imbalance',
      'inflammation'
    ],
    'oily-skin': [
      'androgen-stimulation',
      'genetics',
      'insulin-resistance',
      'dehydration'
    ],
    'dark-circles': [
      'genetics',
      'vascular-congestion',
      'volume-loss',
      'allergies',
      'sleep-deprivation',
      'aging'
    ],
    'texture-irregularities': [
      'slow-cell-turnover',
      'sun-damage',
      'keratin-buildup',
      'barrier-dysfunction',
      'dehydration'
    ]
  };
  
  const rootCauses = rootCauseMap[condition] || [];
  
  // Filter by what we can assess from user profile
  const assessableRoots = [];
  for (const root of rootCauses) {
    if (canAssessRootCause(root, userProfile)) {
      assessableRoots.push(root);
    }
  }
  
  return assessableRoots;
}

/**
 * Check if we can assess a root cause from user profile
 */
function canAssessRootCause(rootCause, userProfile) {
  const assessable = {
    'gut-dysbiosis': userProfile.lifestyleFactors.dietType !== 'standard' || 
                    userProfile.symptoms.includes('bloating') ||
                    userProfile.symptoms.includes('irregular bowel movements'),
    'insulin-resistance': userProfile.age > 40 ||
                         userProfile.lifestyleFactors.dietType === 'high-sugar' ||
                         userProfile.symptoms.includes('weight gain midsection'),
    'hormonal-imbalance': userProfile.age > 35 ||
                         userProfile.menstruating === false ||
                         userProfile.pregnant ||
                         userProfile.breastfeeding,
    'inflammation': userProfile.lifestyleFactors.stressLevel > 6 ||
                   userProfile.smoking ||
                   userProfile.lifestyleFactors.alcoholConsumption > 7,
    'uv-damage': userProfile.lifestyleFactors.sunExposure === 'high' ||
                userProfile.age > 30,
    'oxidative-stress': userProfile.lifestyleFactors.smoking ||
                       userProfile.lifestyleFactors.alcoholConsumption > 5 ||
                       userProfile.dietType === 'low-antioxidant',
    'glycation': userProfile.lifestyleFactors.dietType === 'high-sugar' ||
                userProfile.lifestyleFactors.alcoholConsumption > 7,
    'collagen-degradation': userProfile.age > 35 ||
                           userProfile.lifestyleFactors.sunExposure === 'high',
    'hormonal-decline': userProfile.age > 40 ||
                       userProfile.menopausal,
    'barrier-dysfunction': userProfile.symptoms.includes('tightness') ||
                          userProfile.symptoms.includes('itching') ||
                          userProfile.symptoms.includes('burning') ||
                          userProfile.skinType === 'dry' ||
                          userProfile.skinType === 'sensitive',
    'demodex-overgrowth': userProfile.age > 40 ||
                         userProfile.symptoms.includes('redness') &&
                         userProfile.symptoms.includes('bumps'),
    'neurovascular-dysregulation': userProfile.symptoms.includes('flushing') ||
                                  userProfile.lifestyleFactors.alcoholConsumption > 7,
    'immune-dysregulation': userProfile.symptoms.includes('chronic') ||
                           userProfile.allergies.length > 0,
    'microbiome-imbalance': userProfile.lifestyleFactors.dietType === 'processed-foods' ||
                           userProfile.symptoms.includes('bloating') ||
                           userProfile.symptoms.includes('irregular bowel movements'),
    'allergic-sensitization': userProfile.allergies.length > 0,
    'low-humidity': userProfile.lifestyleFactors.sunExposure === 'low', // Placeholder
    'aging': userProfile.age > 30,
    'harsh-skincare': userProfile.currentProducts.some(p => 
                     p.includes('exfoliant') || p.includes('retinol') || p.includes('acid')),
    'dehydration': userProfile.lifestyleFactors.waterIntake < 4,
    'thyroid-dysfunction': userProfile.symptoms.includes('fatigue') ||
                          userProfile.symptoms.includes('weight gain') ||
                          userProfile.symptoms.includes('hair loss'),
    'androgen-stimulation': userProfile.symptoms.includes('jawline acne') ||
                           userProfile.symptoms.includes('hirsutism') ||
                           userProfile.age < 25,
    'genetics': true // Always a factor, but we can't change it
  };
  
  return assessable[rootCause] || false;
}

/**
 * Build product (topical) recommendations
 */
function buildProductRecommendations(scoredIngredients, userProfile, condition) {
  const products = [];
  
  // Take top scoring ingredients that are safe
  const candidates = scoredIngredients.slice(0, 10); // Top 10 to choose from
  
  for (const { ingredient, score } of candidates) {
    // Check if ingredient is appropriate for this condition's routine
    if (isAppropriateForCondition(ingredient, condition, userProfile)) {
      products.push({
        ingredient: ingredient.name,
        inciName: ingredient.inci_name,
        concentration: ingredient.concentration_range,
        mechanism: ingredient.mechanism_of_action,
        evidenceScore: score.totalScore,
        evidenceGrade: score.grade,
        safetyStatus: score.safetyStatus || 'GREEN',
        safetyNotes: score.safetyReason || '',
        primaryStudies: ingredient.primary_studies.map(s => ({
          pmid: s.pmid,
          title: s.title,
          level: s.level,
          findings: s.findings
        })),
        usageNotes: getUsageNotes(ingredient, condition, userProfile),
        timeOfDay: getTimeOfDay(ingredient, condition),
        layeringOrder: getLayeringOrder(ingredient, condition)
      });
      
      if (products.length >= MAX_PRODUCT_RECOMMENDATIONS) break;
    }
  }
  
  return products;
}

/**
 * Check if ingredient is appropriate for condition
 */
function isAppropriateForCondition(ingredient, condition, userProfile) {
  // Some ingredients are condition-specific
  const conditionSpecific = {
    acne: ['salicylic acid', 'benzoyl peroxide', 'retinol', 'niacinamide', 'azelaic acid'],
    photoaging: ['retinol', 'vitamin c', 'niacinamide', 'peptides', 'glycolic acid'],
    hyperpigmentation: ['hydroquinone', 'vitamin c', 'niacinamide', 'azelaic acid', 'kojic acid'],
    rosacea: ['azelaic acid', 'metronidazole', 'ivermectin', 'niacinamide', 'sulfur'],
    eczema: ['ceramides', 'colloidal oatmeal', 'niacinamide', 'glycerin', 'hyaluronic acid'],
    'dry-skin': ['ceramides', 'hyaluronic acid', 'glycerin', 'squalane', 'urea'],
    'sensitive-skin': ['niacinamide', 'ceramides', 'centella asiatica', 'allantoin', 'bisabolol'],
    'oily-skin': ['niacinamide', 'salicylic acid', 'retinol', 'zinc', 'green tea extract'],
    'dark-circles': ['vitamin c', 'vitamin k', 'caffeine', 'retinol', 'peptides'],
    'texture-irregularities': ['glycolic acid', 'salicylic acid', 'retinol', 'urea', 'lactic acid']
  };
  
  const appropriateList = conditionSpecific[condition] || [];
  if (appropriateList.length === 0) return true; // No restriction
  
  const ingredientName = ingredient.name.toLowerCase();
  return appropriateList.some(ing => ingredientName.includes(ing.toLowerCase()));
}

/**
 * Get usage notes for ingredient
 */
function getUsageNotes(ingredient, condition, userProfile) {
  const notes = [];
  
  // Pregnancy warnings
  if (userProfile.pregnant && 
      (ingredient.safety_flags?.pregnancy_contraindicated || 
       ingredient.safety_flags?.pregnancy_caution)) {
    notes.push(userProfile.pregnant ? 
              'CONSULT DOCTOR: May not be safe during pregnancy' : 
              'Use caution if pregnant or planning pregnancy');
  }
  
  // Sensitivity warnings
  if (userProfile.skinType === 'sensitive' && 
      ingredient.safety_flags?.skin_type_warnings?.sensitive) {
    notes.push('Start with lowest concentration, use every 2-3 nights');
  }
  
  // Concentration-specific notes
  if (ingredient.concentration_range) {
    notes.push(`Typical effective range: ${ingredient.concentration_range}`);
  }
  
  // Time of day notes
  if (ingredient.safety_flags?.photosensitivity) {
    notes.push('Use at night only, or use with strict SPF 30+ during day');
  }
  
  return notes.join('; ');
}

/**
 * Get recommended time of day for ingredient
 */
function getTimeOfDay(ingredient, condition) {
  const nightOnly = [
    'retinol',
    'tretinoin',
    'adapalene',
    'tazarotene',
    'isotretinoin',
    'benzoyl peroxide', // Can oxidize in sunlight
    'hydroquinone' // Can cause ochronosis with sun
  ];
  
  const ingredientName = ingredient.name.toLowerCase();
  if (nightOnly.some(ing => ingredientName.includes(ing))) {
    return 'PM';
  }
  
  // Vitamin C is best in AM (antioxidant protection)
  if (ingredientName.includes('vitamin c') || 
      ingredientName.includes('l-ascorbic acid')) {
    return 'AM';
  }
  
  // Most others can be either, default to PM for actives
  const actives = ['retinol', 'acid', 'peel', 'exfoliant'];
  if (actives.some(a => ingredientName.includes(a))) {
    return 'PM';
  }
  
  return 'AM/PM';
}

/**
 * Get layering order (1=first, higher numbers=later)
 */
function getLayeringOrder(ingredient, condition) {
  // General rules:
  // 1. Cleansers
  // 2. Toners
  // 3. Serums (thinnest to thickest)
  // 4. Treatments
  // 5. Moisturizers
  // 6. Oils
  // 7. Sunscreen (AM only)
  
  const ingredientName = ingredient.name.toLowerCase();
  
  // Cleansers
  if (ingredientName.includes('cleanser') || 
      ingredientName.includes('wash')) {
    return 1;
  }
  
  // Toners
  if (ingredientName.includes('toner') || 
      ingredientName.includes('mist')) {
    return 2;
  }
  
  // Serums & Treatments (thin consistency)
  if (ingredientName.includes('serum') || 
      ingredientName.includes('essence') ||
      ingredient.mechanism_of_action?.includes('penetration')) {
    return 3;
  }
  
  // Actives that go before moisturizer
  const activesBeforeMoist = [
    'retinol', 'vitamin c', 'niacinamide', 'azelaic acid',
    'salicylic acid', 'glycolic acid', 'lactic acid',
    'benzoyl peroxide', 'hydroquinone', 'kojic acid'
  ];
  if (activesBeforeMoist.some(a => ingredientName.includes(a))) {
    return 4;
  }
  
  // Moisturizers & barriers
  const moisturizers = [
    'ceramides', 'hyaluronic acid', 'glycerin', 'squalane',
    'petrolatum', 'dimethicone', 'shea butter', 'jojoba oil'
  ];
  if (moisturizers.some(m => ingredientName.includes(m))) {
    return 5;
  }
  
  // Facial oils
  if (ingredientName.includes('oil') && 
      !ingredientName.includes('essential oil')) {
    return 6;
  }
  
  // Sunscreen (AM only)
  if (ingredientName.includes('zinc oxide') || 
      ingredientName.includes('titanium dioxide') ||
      ingredientName.includes('avobenzone') ||
      ingredientName.includes('octinoxate')) {
    return 7;
  }
  
  // Default middle
  return 4;
}

/**
 * Build supplement recommendations
 */
function buildSupplementRecommendations(scoredIngredients, userProfile, condition) {
  // Map of ingredients that work better internally
  const internalIngredients = {
    'zinc': { dose: '25-30mg', form: 'zinc picolinate', timing: 'with food' },
    'omega-3': { dose: '2g EPA+DHA', form: 'fish oil or algae oil', timing: 'with meals' },
    'vitamin c': { dose: '500-1000mg', form: 'ascorbic acid or sodium ascorbate', timing: 'divided doses' },
    'vitamin e': { dose: '400 IU', form: 'mixed tocopherols', timing: 'with fat' },
    'collagen peptides': { dose: '10g', form: 'hydrolyzed collagen', timing: 'empty stomach' },
    'probiotics': { dose: '10-50 billion CFU', form: 'multi-strain', timing: 'empty stomach' },
    'polypodium leucotomos': { dose: '240mg', form: 'standardized extract', timing: 'morning' },
    'glutathione': { dose: '250-500mg', form: 'reduced or liposomal', timing: 'empty stomach' },
    'pycnogenol': { dose: '100mg', form: 'standardized extract', timing: 'with food' },
    'coq10': { dose: '100-200mg', form: 'ubiquinol', timing: 'with fat' },
    'berberine': { dose: '500mg 2x/day', form: 'berberine HCl', timing: 'before meals' },
    'dim': { dose: '100-200mg', form: 'diindolylmethane', timing: 'with food' },
    'resveratrol': { dose: '150-300mg', form: 'trans-resveratrol', timing: 'with food' },
    'curcumin': { dose: '500-1000mg', form: 'with piperine', timing: 'with meals' },
    'glutamine': { dose: '5g', form: 'L-glutamine', timing: 'empty stomach' }
  };
  
  const supplements = [];
  
  // Add condition-specific supplements
  const conditionSupplements = {
    acne: ['zinc', 'omega-3', 'probiotics', 'berberine', 'dim'],
    photoaging: ['collagen peptides', 'vitamin c', 'vitamin e', 'coq10', 'polypodium leucotomos'],
    hyperpigmentation: ['vitamin c', 'glutathione', 'polypodium leucotomos', 'pycnogenol'],
    rosacea: ['zinc', 'omega-3', 'probiotics', 'glutamine'],
    eczema: ['omega-3', 'vitamin d', 'probiotics', 'glutamine'],
    'dry-skin': ['omega-3', 'hyaluronic acid', 'vitamin e', 'ceramides (oral)'],
    'sensitive-skin': ['omega-3', 'probiotics', 'glutamine', 'vitamin d'],
    'oily-skin': ['zinc', 'omega-3', 'berberine', 'dim'],
    'dark-circles': ['vitamin k', 'iron (if deficient)', 'vitamin c', 'collagen peptides'],
    'texture-irregularities': ['vitamin a', 'omega-3', 'zinc', 'probiotics']
  };
  
  const supplementList = conditionSupplements[condition] || [];
  
  for (const key of supplementList) {
    if (internalIngredients[key]) {
      supplements.push({
        name: key.replace(/-/g, ' '),
        form: internalIngredients[key].form,
        dose: internalIngredients[key].dose,
        timing: internalIngredients[key].timing,
        purpose: getSupplementPurpose(key, condition),
        evidence: getSupplementEvidence(key),
        precautions: getSupplementPrecautions(key, userProfile)
      });
    }
  }
  
  // Add foundational supplements everyone might need
  const foundational = ['omega-3', 'vitamin d', 'probiotics'];
  for (const key of foundational) {
    if (!supplements.some(s => s.name.includes(key.replace(/-/g, ' '))) && 
        internalIngredients[key]) {
      supplements.push({
        name: key.replace(/-/g, ' '),
        form: internalIngredients[key].form,
        dose: internalIngredients[key].dose,
        timing: internalIngredients[key].timing,
        purpose: 'Foundational support',
        evidence: getSupplementEvidence(key),
        precautions: getSupplementPrecautions(key, userProfile)
      });
    }
    
    if (supplements.length >= MAX_SUPPLEMENT_RECOMMENDATIONS) break;
  }
  
  return supplements;
}

/**
 * Get supplement purpose
 */
function getSupplementPurpose(key, condition) {
  const purposes = {
    'zinc': 'Anti-inflammatory, hormone regulation, skin healing',
    'omega-3': 'Reduce inflammation, support membrane health',
    'vitamin c': 'Collagen synthesis, antioxidant, brightening',
    'vitamin e': 'Antioxidant, membrane protection, healing',
    'collagen peptides': 'Skin elasticity, hydration, wrinkle reduction',
    'probiotics': 'Gut-skin axis, immune modulation, inflammation reduction',
    'polypodium leucotomos': 'Oral photoprotection, antioxidant',
    'glutathione': 'Master antioxidant, detoxification, melanin regulation',
    'pycnogenol': 'Antioxidant, anti-inflammatory, vascular support',
    'coq10': 'Mitochondrial energy, antioxidant, collagen support',
    'berberine': 'Insulin sensitivity, anti-inflammatory, gut health',
    'dim': 'Estrogen metabolism, hormonal balance',
    'resveratrol': 'Antioxidant, sirtuin activation, longevity',
    'curcumin': 'Potent anti-inflammatory, antioxidant',
    'glutamine': 'Gut healing, immune support, tissue repair',
    'vitamin d': 'Immune regulation, barrier function, cell turnover',
    'vitamin k': 'Vascular health, dark circle reduction',
    'hyaluronic acid': 'Internal hydration, joint and skin support',
    'oral ceramides': 'Barrier function from within',
    'vitamin a': 'Cell turnover, collagen support (not during pregnancy)'
  };
  
  return purposes[key] || 'General skin health support';
}

/**
 * Get supplement evidence level
 */
function getSupplementEvidence(key) {
  const evidence = {
    'zinc': 'B (Multiple RCTs for acne, inflammation)',
    'omega-3': 'B (Strong evidence for inflammation, skin health)',
    'vitamin c': 'B (Collagen synthesis, antioxidant well-established)',
    'vitamin e': 'B (Antioxidant, membrane protection)',
    'collagen peptides': 'B (Skin elasticity, hydration RCTs)',
    'probiotics': 'B (Gut-skin axis, multiple condition RCTs)',
    'polypodium leucotomos': 'B (Oral photoprotection, RCT evidence)',
    'glutathione': 'C+ (Limited but promising for skin)',
    'pycnogenol': 'B (Antioxidant, vascular, skin RCTs)',
    'coq10': 'B (Mitochondrial, antioxidant, skin RCTs)',
    'berberine': 'B (Insulin resistance, multiple RCTs)',
    'dim': 'C+ (Estrogen metabolism, limited skin studies)',
    'resveratrol': 'B (Antioxidant, sirtuin, multiple RCTs)',
    'curcumin': 'A (Potent anti-inflammatory, numerous RCTs)',
    'glutamine': 'B (Gut healing, immune support)',
    'vitamin d': 'B (Immune regulation, barrier function)',
    'vitamin k': 'C (Vascular evidence, limited skin)',
    'hyaluronic acid': 'B (Joint and skin hydration)',
    'oral ceramides': 'B (Barrier function improvement)',
    'vitamin a': 'A (Cell turnover, collagen - avoid pregnancy)'
  };
  
  return evidence[key] || 'Limited evidence';
}

/**
 * Get supplement precautions
 */
function getSupplementPrecautions(key, userProfile) {
  const precautions = {
    'zinc': userProfile.pregnant ? 'Do not exceed 40mg/day' : 'Take with food to avoid nausea',
    'omega-3': userProfile.medications.includes('warfarin') ? 'Consult doctor (may increase bleeding risk)' : 'Burpless formula if fishy aftertaste',
    'vitamin c': 'Divide doses >1000mg to avoid digestive upset',
    'vitamin e': userProfile.medications.includes('warfarin') ? 'Consult doctor (may increase bleeding risk)' : 'Choose mixed tocopherols',
    'collagen peptides': 'Generally well tolerated',
    'probiotics': 'Start with lower dose if sensitive stomach',
    'polypodium leucotomos': 'Generally well tolerated',
    'glutathione': 'Limited long-term safety data',
    'pycnogenol': 'Generally well tolerated',
    'coq10': 'Generally well tolerated',
    'berberine': 'May cause digestive upset, start low',
    'dim': 'May affect hormone-sensitive conditions, consult doctor',
    'resveratrol': 'May interact with blood thinners, consult doctor',
    'curcumin': 'May interact with blood thinners, choose with piperine for absorption',
    'glutamine': 'Generally well tolerated',
    'vitamin d': 'Monitor levels if taking >4000 IU long-term',
    'vitamin k': userProfile.medications.includes('warfarin') ? 'CONTRAINDICATED - consult doctor' : 'Generally well tolerated',
    'hyaluronic acid': 'Generally well tolerated',
    'oral ceramides': 'Generally well tolerated',
    'vitamin a': userProfile.pregnant ? 'CONTRAINDICATED - can cause birth defects' : 'Generally well tolerated'
  };
  
  return precautions[key] || 'Consult doctor before starting any new supplement';
}

/**
 * Build lifestyle recommendations
 */
function buildLifestyleRecommendations(condition, userProfile) {
  const recommendations = [];
  
  // Universal recommendations
  recommendations.push({
    category: 'sleep',
    recommendation: 'Aim for 7-9 hours of quality sleep per night',
    reason: 'Sleep is when skin repairs and regenerates',
    evidence: 'A (Multiple studies show sleep deprivation worsens all skin conditions)',
    action: 'Set consistent bedtime, avoid screens 1 hour before bed, keep room cool and dark'
  });
  
  recommendations.push({
    category: 'hydration',
    recommendation: 'Drink adequate water throughout the day',
    reason: 'Hydration supports skin barrier function and detoxification',
    evidence: 'B (Hydration is fundamental for skin health)',
    action: 'Drink water when thirsty, monitor urine color (light yellow), herbal teas count'
  });
  
  // Condition-specific recommendations
  const conditionLifestyle = {
    acne: [
      {
        category: 'diet',
        recommendation: 'Follow a low-glycemic, dairy-free trial for 4 weeks',
        reason: 'High glycemic foods and dairy can increase insulin and IGF-1, worsening acne',
        evidence: 'B (Multiple studies show diet-acne connection)',
        action: 'Eliminate white bread, pasta, sugar, milk, cheese. Eat vegetables, lean protein, healthy fats'
      },
      {
        category: 'stress',
        recommendation: 'Practice stress reduction techniques daily',
        reason: 'Stress increases cortisol, which increases sebum production and inflammation',
        evidence: 'B (Stress management improves acne in multiple studies)',
        action: 'Try meditation, deep breathing, yoga, or walking in nature for 10-20 minutes daily'
      }
    ],
    photoaging: [
      {
        category: 'sun-protection',
        recommendation: 'Use broad-spectrum SPF 30+ daily, reapply every 2 hours',
        reason: 'UV exposure is the #1 cause of premature aging (80% of visible aging)',
        evidence: 'A (Decades of research show UV causes photoaging)',
        action: 'Use mineral sunscreen (zinc oxide/titanium dioxide), wear hat and sunglasses, seek shade'
      },
      {
        category: 'smoking',
        recommendation: 'If you smoke, quit. If you don\'t, don\'t start.',
        reason: 'Smoking accelerates skin aging by approximately 10 years',
        evidence: 'A (Smoking causes oxidative stress and breaks down collagen)',
        action: 'Seek support if needed - quitting is the single best thing for your skin'
      },
      {
        category: 'diet',
        recommendation: 'Eat an antioxidant-rich, low-sugar diet',
        reason: 'Sugar causes glycation which damages collagen and elastin',
        evidence: 'B (Antioxidants protect, sugar accelerates aging)',
        action: 'Eat colorful vegetables, berries, nuts, seeds. Limit sugar, refined carbs, processed foods'
      }
    ],
    hyperpigmentation: [
      {
        category: 'sun-protection',
        recommendation: 'Strict sun protection is NON-NEGOTIABLE for treating hyperpigmentation',
        reason: 'UV exposure stimulates melanocytes, worsening all types of hyperpigmentation',
        evidence: 'A (Melasma and PIH will not improve without strict sun protection)',
        action: 'SPF 30+ daily, reapply, wear wide-brimmed hat, avoid peak sun (10am-4pm)'
      },
      {
        category: 'heat-avoidance',
        recommendation: 'Avoid excessive heat (saunas, hot yoga, hot showers) if you have melasma',
        reason: 'Heat can worsen melasma through vasodilation and inflammation',
        evidence: 'B (Heat is a known melasma trigger)',
        action: 'Use lukewarm water, avoid saunas and steam rooms, exercise in cool environments'
      }
    ],
    rosacea: [
      {
        category: 'trigger-avoidance',
        recommendation: 'Identify and avoid your personal rosacea triggers',
        reason: 'Rosacea is triggered by flushing - knowing your triggers prevents flare-ups',
        evidence: 'B (Trigger identification and avoidance is first-line management)',
        action: 'Keep a flare diary for 2 weeks. Common triggers: alcohol, spicy food, hot drinks, stress, temperature extremes'
      },
      {
        category: 'alcohol',
        recommendation: 'Limit or avoid alcohol, especially red wine and hard liquor',
        reason: 'Alcohol causes vasodilation which triggers flushing in rosacea',
        evidence: 'B (Alcohol is a well-documented rosacea trigger)',
        action: 'Try eliminating alcohol for 4 weeks to see if it improves your rosacea'
      },
      {
        category: 'stress',
        recommendation: 'Manage stress through relaxation techniques',
        reason: 'Stress triggers flushing via the neurovascular system',
        evidence: 'B (Stress management reduces rosacea flare frequency)',
        action: 'Practice deep breathing, meditation, or progressive muscle relaxation daily'
      }
    ],
    eczema: [
      {
        category: 'bathing',
        recommendation: 'Take lukewarm (not hot) showers, limit to 10 minutes',
        reason: 'Hot water strips natural oils and worsens barrier dysfunction',
        evidence: 'A (Hot water is a known eczema trigger)',
        action: 'Use lukewarm water, gentle cleanser, pat dry (don\'t rub), moisturize immediately'
      },
      {
        category: 'irritants',
        recommendation: 'Use fragrance-free, dye-free everything that touches your skin',
        reason: 'Fragrance and dyes are common irritants that worsen eczema',
        evidence: 'A (Fragrance is a top allergen in eczema patients)',
        action: 'Choose products labeled \"fragrance-free\" (not \"unscented\"), avoid essential oils'
      },
      {
        category: 'stress',
        recommendation: 'Manage stress - it\'s a major eczema trigger',
        reason: 'Stress increases inflammation and worsens barrier function',
        evidence: 'B (Stress management is part of standard eczema care)',
        action: 'Try stress reduction techniques: meditation, yoga, tai chi, or counseling'
      }
    ],
    'dry-skin': [
      {
        category: 'humidity',
        recommendation: 'Use a humidifier in bedroom, especially in winter',
        reason: 'Low humidity increases transepidermal water loss (TEWL)',
        evidence: 'B (Humidifiers improve skin hydration in dry climates)',
        action: 'Keep bedroom at 40-60% humidity, clean humidifier regularly to prevent mold'
      },
      {
        category: 'bathing',
        recommendation: 'Limit showers to 5-10 minutes, use lukewarm water',
        reason: 'Long, hot showers strip skin\'s natural oils',
        evidence: 'A (Long showers worsen dry skin)',
        action: 'Keep showers short and lukewarm, apply moisturizer to damp skin within 3 minutes'
      },
      {
        category: 'fabrics',
        recommendation: 'Wear soft, breathable fabrics like cotton and silk',
        reason: 'Rough fabrics like wool can irritate dry, sensitive skin',
        evidence: 'B (Fabric choice affects skin comfort and barrier function)',
        action: 'Choose cotton, silk, bamboo. Avoid wool, polyester, and rough textures'
      }
    ],
    'sensitive-skin': [
      {
        category: 'product-simplicity',
        recommendation: 'Use minimal-ingredient products (5 ingredients or less)',
        reason: 'Fewer ingredients = lower risk of irritation or reaction',
        evidence: 'B (Simplified routines reduce irritation in sensitive skin)',
        action: 'Choose products with short ingredient lists, avoid fragrance, essential oils, alcohol'
      },
      {
        category: 'patch-testing',
        recommendation: 'Patch test new products behind ear or on inner arm for 48 hours',
        reason: 'Prevents widespread reactions from new products',
        evidence: 'A (Patch testing is standard for sensitive skin)',
        action: 'Apply small amount, wait 48 hours, check for redness, itching, or swelling'
      },
      {
        category: 'environmental',
        recommendation: 'Protect skin from extreme temperatures and wind',
        reason: 'Environmental stressors can trigger sensitive skin reactions',
        evidence: 'B (Wind, cold, heat can worsen sensitive skin)',
        action: 'Use scarf in wind, moisturize in dry climates, avoid prolonged sun exposure'
      }
    ],
    'oily-skin': [
      {
        category: 'cleansing',
        recommendation: 'Cleanse no more than twice daily - over-cleansing causes rebound oil production',
        reason: 'Stripping skin of oil signals it to produce more oil',
        evidence: 'B (Over-cleansing worsens oily skin and acne)',
        action: 'Cleanse morning and night, or just at night if not wearing makeup or sunscreen'
      },
      {
        category: 'diet',
        recommendation: 'Consider reducing dairy and high-glycemic foods',
        reason: 'Dairy and high-glycemic foods can increase IGF-1 and sebum production',
        evidence: 'B (Diet-acne connection applies to oily skin too)',
        action: 'Try eliminating milk, cheese, white bread, sugar for 4 weeks and observe changes'
      },
      {
        category: 'stress',
        recommendation: 'Manage stress - cortisol increases sebum production',
        reason: 'Stress hormones stimulate sebaceous glands to produce more oil',
        evidence: 'B (Stress management helps oily skin and acne)',
        action: 'Practice stress reduction techniques daily'
      }
    ],
    'dark-circles': [
      {
        category: 'sleep-position',
        recommendation: 'Sleep with head slightly elevated to reduce fluid pooling',
        reason: 'Fluid pooling under eyes contributes to dark circles and puffiness',
        evidence: 'B (Elevation reduces venous pooling)',
        action: 'Use an extra pillow or wedge pillow to elevate head 10-15 degrees'
      },
      {
        category: 'allergies',
        recommendation: 'If you have allergies, manage them effectively',
        reason: 'Allergic shiners (dark circles from allergies) respond to allergy treatment',
        evidence: 'B (Allergic rhinitis causes venous pooling under eyes)',
        action: 'Identify and avoid allergens, consider antihistamines if appropriate'
      },
      {
        category: 'hydration',
        recommendation: 'Stay well hydrated - dehydration makes dark circles more noticeable',
        reason: 'Dehydration causes skin to look dull and sunken',
        evidence: 'B (Hydration improves skin turgor and appearance)',
        action: 'Drink water consistently throughout the day'
      }
    ],
    'texture-irregularities': [
      {
        category: 'exfoliation',
        recommendation: 'Exfoliate 1-2 times per week (not daily!)',
        reason: 'Over-exfoliation damages barrier, under-exfoliation leaves skin rough',
        evidence: 'B (Regular exfoliation improves texture without damaging barrier)',
        action: 'Choose gentle chemical exfoliants (AHAs/BHAs) or very fine physical scrubs'
      },
      {
        category: 'hydration',
        recommendation: 'Keep skin well hydrated - dehydration worsens texture',
        reason: 'Dehydrated skin looks and feels rougher',
        evidence: 'B (Hydration plumps skin and improves texture)',
        action: 'Use humectants (glycerin, hyaluronic acid) and drink adequate water'
      },
      {
        category: 'sun-protection',
        recommendation: 'Protect skin from sun to prevent further damage',
        reason: 'Sun exposure causes rough texture through solar elastosis',
        evidence: 'A (Sun protection prevents worsening of texture issues)',
        action: 'Use SPF 30+ daily, reapply as needed'
      }
    ]
  };
  
  const conditionList = conditionLifestyle[condition] || [];
  recommendations.push(...conditionList);
  
  // Limit total recommendations
  return recommendations.slice(0, MAX_LIFESTYLE_RECOMMENDATIONS);
}

/**
 * Assess if user needs professional referral
 */
function assessNeedForProfessionalReferral(conditions, userProfile) {
  const referrals = [];
  
  for (const condition of conditions) {
    const referral = assessProfessionalNeed(condition, userProfile);
    if (referral.needed) {
      referrals.push(referral);
    }
  }
  
  return {
    needed: referrals.length > 0,
    referrals: referrals,
    summary: referrals.length > 0 
      ? `Consider seeing a dermatologist for: ${referrals.map(r => r.condition).join(', ')}`
      : 'No urgent dermatologist referral needed based on current assessment'
  };
}

/**
 * Assess professional need for specific condition
 */
function assessProfessionalNeed(condition, userProfile) {
  // Severity-based thresholds from condition-root-cause-mapping.md
  const severity = assessConditionSeverity(condition, userProfile);
  
  const conditionSpecific = {
    acne: {
      severe: severity >= 7, // Moderate-severe or worse
      reasons: [
        'Cystic or nodular acne',
        'Scarring occurring or likely',
        'No improvement after 12 weeks of consistent treatment',
        'Sudden onset in adulthood (possible hormonal disorder)',
        'Acne + hirsutism + irregular periods (possible PCOS)'
      ]
    },
    photoaging: {
      severe: severity >= 7,
      reasons: [
        'Deep wrinkles with significant volume loss',
        'Precancerous lesions (actinic keratosis)',
        'Rapid onset of aging changes (possible other cause)',
        'Significant sun damage with DNA damage concerns'
      ]
    },
    hyperpigmentation: {
      severe: severity >= 7,
      reasons: [
        'Rapidly changing or irregular borders',
        'Blue-gray color (suggests dermal melasma)',
        'Associated with systemic symptoms (liver disease, etc.)',
        'No improvement after 3 months of consistent treatment'
      ]
    },
    rosacea: {
      severe: severity >= 6, // Lower threshold for rosacea
      reasons: [
        'Eye involvement (ocular rosacea - needs ophthalmologist)',
        'Rhinophyma (nose thickening - needs surgical intervention)',
        'No improvement after 8 weeks of consistent treatment',
        'Severe flushing affecting quality of life or work'
      ]
    },
    eczema: {
      severe: severity >= 7,
      reasons: [
        'Widespread (>20% body surface area)',
        'Significant sleep disruption from itching',
        'Signs of infection (weeping, crusting, pus)',
        'No response to potent topical steroids',
        'Eczema herpeticum (medical emergency - HSV infection)'
      ]
    },
    'dry-skin': {
      severe: severity >= 8, // Higher threshold for dry skin
      reasons: [
        'Cracking or fissuring of skin',
        'Signs of secondary infection',
        'Associated with systemic symptoms (thyroid disorder, malnutrition)',
        'No improvement with intensive moisturization'
      ]
    },
    'sensitive-skin': {
      severe: severity >= 7,
      reasons: [
        'Persistent burning or pain with product use',
        'Reaction to nearly all products tried',
        'Associated with diagnosed rosacea or eczema',
        'Significantly impacts quality of life or social functioning'
      ]
    },
    'oily-skin': {
      severe: severity >= 8, // Higher threshold for oily skin alone
      reasons: [
        'Sudden onset of severe oiliness (possible hormonal disorder)',
        'Very severe oiliness with associated acne or seborrheic dermatitis',
        'Associated with hirsutism, jawline acne, irregular periods (PCOS)',
        'No improvement after 3 months of consistent treatment'
      ]
    },
    'dark-circles': {
      severe: severity >= 7,
      reasons: [
        'Sudden onset of severe dark circles (possible anemia, liver, kidney issue)',
        'Associated with swelling, pain, or vision changes',
        'Significant volume loss in tear trough area',
        'No improvement after 3 months of consistent treatment'
      ]
    },
    'texture-irregularities': {
      severe: severity >= 8,
      reasons: [
        'Severe keratosis pilaris covering large areas',
        'Associated with other skin conditions (eczema, ichthyosis)',
        'Significant discomfort or pain',
        'No improvement after 3 months of consistent treatment'
      ]
    }
  };
  
  const config = conditionSpecific[condition] || {
    severe: severity >= 8,
    reasons: ['Condition severely impacting quality of life']
  };
  
  // Check if any severe reason applies (simplified - in production would check symptoms)
  const severe = severity >= config.severe;
  
  return {
    condition: condition,
    needed: severe,
    severity: severity,
    threshold: config.severe,
    reasons: severe ? config.reasons : [],
    urgency: severe ? 'HIGH' : 'LOW',
    recommendation: severe 
      ? `Consider seeing a dermatologist for ${condition} evaluation and treatment`
      : `${condition} can likely be managed with consistent holistic care`
  };
}

/**
 * Build holistic routine (AM/PM) from recommendations
 */
function buildHolisticRoutine(conditionRecommendations, userProfile) {
  const routine = {
    AM: [],
    PM: []
  };
  
  // Collect all product recommendations
  const allProducts = [];
  for (const condition of Object.keys(conditionRecommendations)) {
    const recs = conditionRecommendations[condition];
    if (recs && recs.products) {
      allProducts.push(...recs.products);
    }
  }
  
  // Remove duplicates (same ingredient might be recommended for multiple conditions)
  const uniqueProducts = [];
  const seenIngredients = new Set();
  for (const product of allProducts) {
    const key = product.inciName.toLowerCase();
    if (!seenIngredients.has(key)) {
      seenIngredients.add(key);
      uniqueProducts.push(product);
    }
  }
  
  // Sort by layering order
  uniqueProducts.sort((a, b) => a.layeringOrder - b.layeringOrder);
  
  // Assign to AM/PM based on time of day
  for (const product of uniqueProducts) {
    if (product.timeOfDay === 'AM' || product.timeOfDay === 'AM/PM') {
      routine.AM.push(product);
    }
    if (product.timeOfDay === 'PM' || product.timeOfDay === 'AM/PM') {
      routine.PM.push(product);
    }
  }
  
  // Add sunscreen to AM if not already present
  const hasSunscreen = routine.AM.some(p => 
    p.inciName.toLowerCase().includes('zinc oxide') || 
    p.inciName.toLowerCase().includes('titanium dioxide')
  );
  
  if (!hasSunscreen) {
    routine.AM.push({
      ingredient: 'Sunscreen',
      inciName: 'Zinc Oxide and/or Titanium Dioxide',
      concentration: 'SPF 30+',
      mechanism: 'Physical UV protection',
      evidenceScore: 10,
      evidenceGrade: 'A+',
      safetyStatus: 'GREEN',
      safetyNotes: 'Essential for preventing photoaging and hyperpigmentation',
      primaryStudies: [],
      usageNotes: 'Reapply every 2 hours when outdoors',
      timeOfDay: 'AM',
      layeringOrder: 99 // Last step
    });
  }
  
  // Sort AM/PM by layering order
  routine.AM.sort((a, b) => a.layeringOrder - b.layeringOrder);
  routine.PM.sort((a, b) => a.layeringOrder - b.layeringOrder);
  
  return routine;
}

/**
 * Generate lifestyle plan from recommendations
 */
function generateLifestylePlan(conditionRecommendations, userProfile) {
  const lifestylePlan = {
    priorities: [],
    daily: [],
    weekly: [],
    monthly: []
  };
  
  // Collect all lifestyle recommendations
  const allLifestyle = [];
  for (const condition of Object.keys(conditionRecommendations)) {
    const recs = conditionRecommendations[condition];
    if (recs && recs.lifestyle) {
      allLifestyle.push(...recs.lifestyle);
    }
  }
  
  // Deduplicate by category/recommendation similarity
  const seen = new Set();
  const uniqueLifestyle = [];
  for (const item of allLifestyle) {
    const key = `${item.category}:${item.recommendation.substring(0, 50)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLifestyle.push(item);
    }
  }
  
  // Categorize by frequency
  for (const item of uniqueLifestyle) {
    const freq = item.action.toLowerCase();
    if (freq.includes('daily') || freq.includes('every day') || 
        freq.includes('each morning') || freq.includes('each night')) {
      lifestylePlan.daily.push(item);
    } else if (freq.includes('weekly') || freq.includes('each week') || 
               freq.includes('once a week') || freq.includes('times per week')) {
      lifestylePlan.weekly.push(item);
    } else if (freq.includes('monthly') || freq.includes('each month')) {
      lifestylePlan.monthly.push(item);
    } else {
      // Default to daily if unclear
      lifestylePlan.daily.push(item);
    }
  }
  
  // Add priorities (top 3 most impactful)
  lifestylePlan.priorities = uniqueLifestyle.slice(0, 3);
  
  return lifestylePlan;
}

/**
 * Generate supplement protocol
 */
function generateSupplementProtocol(conditionRecommendations, userProfile) {
  const protocol = {
    morning: [],
    evening: [],
    withMeals: [],
    emptyStomach: [],
    notes: 'Take supplements consistently for at least 8-12 weeks to see effects'
  };
  
  // Collect all supplement recommendations
  const allSupplements = [];
  for (const condition of Object.keys(conditionRecommendations)) {
    const recs = conditionRecommendations[condition];
    if (recs && recs.supplements) {
      allSupplements.push(...recs.supplements);
    }
  }
  
  // Deduplicate
  const seen = new Set();
  const uniqueSupplements = [];
  for (const supp of allSupplements) {
    const key = supp.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSupplements.push(supp);
    }
  }
  
  // Assign by timing
  for (const supp of uniqueSupplements) {
    const timing = supp.timing.toLowerCase();
    if (timing.includes('morning') || timing.includes('am') || 
        timing.includes('breakfast') || timing.includes('empty stomach' && !timing.includes('evening'))) {
      protocol.morning.push(supp);
    }
    if (timing.includes('evening') || timing.includes('pm') || 
        timing.includes('bedtime') || timing.includes('before bed')) {
      protocol.evening.push(supp);
    }
    if (timing.includes('meal') || timing.includes('food') || 
        timing.includes('with')) {
      protocol.withMeals.push(supp);
    }
    if (timing.includes('empty stomach') || 
        timing.includes('fasted') || 
        timing.includes('before meals')) {
      protocol.emptyStomach.push(supp);
    }
    
    // Default fallback
    if (protocol.morning.length === 0 && protocol.evening.length === 0 && 
        protocol.withMeals.length === 0 && protocol.emptyStomach.length === 0) {
      protocol.withMeals.push(supp); // Default
    }
  }
  
  return protocol;
}

/**
 * Generate evidence summary for top ingredients
 */
function generateEvidenceSummary(topIngredients) {
  if (!topIngredients || topIngredients.length === 0) {
    return 'No high-evidence ingredients found for this condition.';
  }
  
  const grades = {};
  topIngredients.forEach(ing => {
    const grade = ing.score.grade;
    grades[grade] = (grades[grade] || 0) + 1;
  });
  
  const summary = [];
  if (grades['A+'] || grades['A']) {
    summary.push(`Strong evidence (A/A+) for ${Object.keys(grades).length} key ingredients`);
  }
  if (grades['B+'] || grades['B']) {
    summary.push(`Good evidence (B/B+) for ${grades['B+'] || 0 + grades['B'] || 0} ingredients`);
  }
  if (grades['C+'] || grades['C']) {
    summary.push(`Limited evidence (C/C+) for ${grades['C+'] || 0 + grades['C'] || 0} ingredients`);
  }
  
  return summary.join('. ');
}

/**
 * Generate overall summary
 */
function generateSummary(conditionRecommendations, holisticRoutine, lifestylePlan, supplementProtocol, professionalReferral, professionalServices) {
  const conditionCount = Object.keys(conditionRecommendations).length;
  const totalProducts = Object.values(holisticRoutine).flat().length;
  const totalLifestyle = lifestylePlan.daily.length + lifestylePlan.weekly.length + lifestylePlan.monthly.length;
  const totalSupplements = Object.values(supplementProtocol).flat().length;
  
  let summary = `Holistic skincare plan for ${conditionCount} condition(s): `;
  summary += `${totalProducts} topical products, ${totalSupplements} supplements, `;
  summary += `${totalLifestyle} lifestyle modifications. `;
  
  if (professionalReferral.needed) {
    summary += `Professional dermatologist referral recommended for: `;
    summary += `${professionalReferral.referrals.map(r => r.condition).join(', ')}. `;
  }
  
  if (professionalServices && professionalServices.show && professionalServices.services.length > 0) {
    summary += `Consider professional treatments: ${professionalServices.services.map(s => s.name).join(', ')}. `;
  }
  
  summary += `Expected timeline for initial improvements: 4-8 weeks.`;
  
  return summary;
}

// ========================
// EXPORTS
// ========================

module.exports = {
  generateRecommendations,
  normalizeUserProfile,
  assessConditionSeverity,
  assessNeedForProfessionalReferral,
  buildHolisticRoutine,
  generateLifestylePlan,
  generateSupplementProtocol
};

// For testing
if (require.main === module) {
  // Test with sample user data
  const testUser = {
    id: 'test_001',
    age: 42,
    skin_type: 'combination',
    symptoms: ['breakouts', 'wrinkles', 'dark spots'],
    lifestyleFactors: {
      sleepHours: 6,
      stressLevel: 8,
      exerciseFrequency: 2,
      alcoholConsumption: 5,
      dietType: 'standard'
    }
  };
  
  console.log('Testing recommendation engine...');
  // generateRecommendations(testUser).then(rec => console.log(JSON.stringify(rec, null, 2))).catch(console.error);
}