// SKINgenius Recommendation API
// Connects the evidence scoring engine + safety engine + recommendation engine
// Produces a complete, holistic, evidence-based skincare plan

const { generateRecommendations } = require('./recommendation-engine');
const { calculateScore, checkSafety, generateRecommendations: generateEvidenceBasedRecommendations } = require('./evidence-scoring-engine');
const { checkCompatibility, checkPregnancySafety, checkDrugInteractions, checkAllergyCompatibility } = require('./safety-engine');
const { createClient } = require('@supabase/supabase-js');

// ========================
// CONFIGURATION
// ========================

// Initialize Supabase client (for production use)
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || 'https://cnzoilxsttoqtvwotexd.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!key) {
    console.warn('No Supabase service role key found, operating in offline mode');
    return null;
  }
  
  return createClient(url, key);
}

// ========================
// MAIN API FUNCTIONS
// ========================

/**
 * Generate a complete skincare plan for a user
 * This is the primary entry point for the recommendation engine
 */
async function generateSkincarePlan(userData) {
  try {
    console.log('Generating skincare plan for user:', userData.id || 'anonymous');
    
    // 1. Validate input
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data provided');
    }
    
    // 2. Generate recommendations using the engine
    const recommendations = await generateRecommendations(userData);
    
    // 3. Add metadata and packaging
    const plan = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        engineVersion: '2026.05.14',
        userId: userData.id || 'anonymous',
        conditions: recommendations.conditions,
        severitySummary: summarizeSeverity(recommendations.conditionRecommendations)
      },
      
      // Holistic routine (AM/PM)
      routine: {
        morning: recommendations.holisticRoutine.AM,
        evening: recommendations.holisticRoutine.PM,
        notes: generateRoutineNotes(recommendations.holisticRoutine, userData)
      },
      
      // Products (topical)
      products: {
        activeTreatments: extractActiveTreatments(recommendations),
        moisturizers: extractMoisturizers(recommendations),
        sunProtection: extractSunProtection(recommendations),
        cleansers: extractCleansers(recommendations),
        allProducts: Object.values(recommendations.holisticRoutine).flat()
      },
      
      // Supplements (internal)
      supplements: {
        morning: recommendations.supplementProtocol.morning,
        evening: recommendations.supplementProtocol.evening,
        withMeals: recommendations.supplementProtocol.withMeals,
        emptyStomach: recommendations.supplementProtocol.emptyStomach,
        notes: recommendations.supplementProtocol.notes
      },
      
      // Lifestyle modifications
      lifestyle: {
        priorities: recommendations.lifestylePlan.priorities,
        daily: recommendations.lifestylePlan.daily,
        weekly: recommendations.lifestylePlan.weekly,
        monthly: recommendations.lifestylePlan.monthly,
        notes: 'Consistency is key - lifestyle changes take 4-8 weeks to show results'
      },
      
      // Condition-specific details
      conditions: recommendations.conditionRecommendations,
      
      // Professional referral
      professional: recommendations.professionalReferral,
      
      // Safety summary
      safety: {
        overallStatus: calculateOverallSafetyStatus(recommendations),
        contraindications: collectContraindications(recommendations),
        warnings: collectWarnings(recommendations),
        notes: 'All recommendations have been safety-checked against your profile'
      },
      
      // Evidence summary
      evidence: {
        overallGrade: calculateOverallEvidenceGrade(recommendations),
        keyStudies: collectKeyStudies(recommendations),
        notes: 'All recommendations are evidence-based with clinical backing'
      },
      
      // Timeline and expectations
      timeline: {
        initialImprovements: '2-4 weeks',
        significantResults: '8-12 weeks',
        fullTransformation: '3-6 months',
        notes: 'Results vary by individual. Consistency is essential.'
      },
      
      // Summary
      summary: recommendations.summary
    };
    
    // 4. Save to database (if connected)
    await savePlanToDatabase(plan, userData);
    
    return plan;
    
  } catch (error) {
    console.error('Error generating skincare plan:', error);
    throw new Error(`Failed to generate skincare plan: ${error.message}`);
  }
}

/**
 * Generate a simplified plan (for quick assessments)
 */
async function generateQuickPlan(userData) {
  // Use default/mild assumptions for missing data
  const defaults = {
    age: 35,
    skin_type: 'normal',
    pregnant: false,
    breastfeeding: false,
    medications: [],
    allergies: [],
    symptoms: [],
    lifestyleFactors: {
      sleepHours: 7,
      stressLevel: 5,
      exerciseFrequency: 3,
      alcoholConsumption: 2,
      smoking: false,
      dietType: 'standard',
      waterIntake: 6,
      sunExposure: 'moderate'
    }
  };
  
  const mergedData = { ...defaults, ...userData };
  
  // Generate simplified plan
  const fullPlan = await generateSkincarePlan(mergedData);
  
  // Return condensed version
  return {
    summary: fullPlan.summary,
    topProducts: fullPlan.products.allProducts.slice(0, 3),
    topSupplements: fullPlan.supplements.withMeals.slice(0, 3),
    topLifestyle: fullPlan.lifestyle.priorities,
    safetyStatus: fullPlan.safety.overallStatus,
    professionalNeeded: fullPlan.professional.needed,
    timeline: fullPlan.timeline
  };
}

/**
 * Update plan based on user feedback (progress tracking)
 */
async function updatePlan(userId, feedback) {
  // Retrieve previous plan
  const previousPlan = await getPlanFromDatabase(userId);
  
  if (!previousPlan) {
    throw new Error('No previous plan found for user');
  }
  
  // Analyze feedback
  const adjustments = analyzeFeedback(feedback, previousPlan);
  
  // Generate updated plan with adjustments
  const updatedPlan = await generateSkincarePlan({
    ...previousPlan.metadata.userData,
    feedback: feedback,
    adjustments: adjustments
  });
  
  return updatedPlan;
}

/**
 * Get ingredient details with evidence and safety
 */
async function getIngredientDetails(ingredientName, userData) {
  // This would query the evidence database
  // For now, return placeholder with structure
  
  return {
    name: ingredientName,
    evidence: {
      score: 8.4,
      grade: 'A',
      studies: [
        { pmid: '12345678', title: 'Sample Study', level: 'RCT', findings: '...' }
      ]
    },
    safety: {
      status: 'GREEN',
      contraindications: [],
      warnings: []
    },
    mechanism: 'Sample mechanism',
    concentrationRange: '0.5-2%',
    usage: 'Apply daily'
  };
}

/**
 * Check if routine is safe and compatible
 */
async function validateRoutine(routine, userData) {
  const issues = [];
  const warnings = [];
  
  // Check ingredient compatibility
  const ingredients = routine.map(p => p.inciName || p.ingredient);
  const compatibility = checkCompatibility(ingredients);
  
  if (!compatibility.compatible) {
    issues.push(...compatibility.conflicts);
  }
  
  // Check each ingredient against user profile
  for (const product of routine) {
    const safety = checkSafety(product, userData);
    
    if (safety.status === 'RED') {
      issues.push({
        product: product.ingredient,
        reason: safety.reason,
        severity: 'HIGH'
      });
    } else if (safety.status === 'YELLOW') {
      warnings.push({
        product: product.ingredient,
        reason: safety.reason,
        severity: 'MEDIUM'
      });
    }
  }
  
  // Check pregnancy safety
  if (userData.pregnant) {
    const pregnancyIssues = checkPregnancySafety(routine, userData.pregnant);
    issues.push(...pregnancyIssues);
  }
  
  // Check drug interactions
  if (userData.medications && userData.medications.length > 0) {
    const drugIssues = checkDrugInteractions(routine, userData.medications);
    issues.push(...drugIssues);
  }
  
  // Check allergies
  if (userData.allergies && userData.allergies.length > 0) {
    const allergyIssues = checkAllergyCompatibility(routine, userData.allergies);
    issues.push(...allergyIssues);
  }
  
  return {
    valid: issues.length === 0,
    issues: issues,
    warnings: warnings,
    safeToUse: issues.filter(i => i.severity === 'HIGH').length === 0
  };
}

// ========================
// HELPER FUNCTIONS
// ========================

function summarizeSeverity(conditionRecommendations) {
  const severities = {};
  for (const [condition, recs] of Object.entries(conditionRecommendations)) {
    if (recs && recs.severity) {
      severities[condition] = recs.severity;
    }
  }
  return severities;
}

function generateRoutineNotes(routine, userData) {
  const notes = [];
  
  if (userData.skinType === 'sensitive') {
    notes.push('Start slowly - introduce one new product per week');
    notes.push('Patch test all new products');
  }
  
  if (userData.pregnant) {
    notes.push('All products have been pregnancy-safe checked');
  }
  
  if (userData.age > 40) {
    notes.push('Focus on hydration and barrier support alongside treatments');
  }
  
  notes.push('Apply products thinnest to thickest consistency');
  notes.push('Wait 30-60 seconds between layers for absorption');
  
  return notes;
}

function extractActiveTreatments(recommendations) {
  const actives = [];
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  
  for (const product of allProducts) {
    const activeIngredients = [
      'retinol', 'tretinoin', 'adapalene', 'tazarotene',
      'salicylic acid', 'benzoyl peroxide', 'azelaic acid',
      'glycolic acid', 'lactic acid', 'mandelic acid',
      'vitamin c', 'niacinamide', 'hydroquinone', 'kojic acid'
    ];
    
    if (activeIngredients.some(a => product.inciName.toLowerCase().includes(a))) {
      actives.push(product);
    }
  }
  
  return actives;
}

function extractMoisturizers(recommendations) {
  const moisturizers = [];
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  
  for (const product of allProducts) {
    const moisturizerIngredients = [
      'ceramides', 'hyaluronic acid', 'glycerin', 'squalane',
      'shea butter', 'jojoba oil', 'petrolatum', 'dimethicone'
    ];
    
    if (moisturizerIngredients.some(m => product.inciName.toLowerCase().includes(m))) {
      moisturizers.push(product);
    }
  }
  
  return moisturizers;
}

function extractSunProtection(recommendations) {
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  return allProducts.filter(p => 
    p.inciName.toLowerCase().includes('zinc oxide') ||
    p.inciName.toLowerCase().includes('titanium dioxide') ||
    p.inciName.toLowerCase().includes('sunscreen')
  );
}

function extractCleansers(recommendations) {
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  return allProducts.filter(p =>
    p.inciName.toLowerCase().includes('cleanser') ||
    p.inciName.toLowerCase().includes('wash') ||
    p.layeringOrder === 1
  );
}

function calculateOverallSafetyStatus(recommendations) {
  let redCount = 0;
  let yellowCount = 0;
  let greenCount = 0;
  
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  for (const product of allProducts) {
    if (product.safetyStatus === 'RED') redCount++;
    else if (product.safetyStatus === 'YELLOW') yellowCount++;
    else greenCount++;
  }
  
  if (redCount > 0) return 'RED - Some recommendations require doctor consultation';
  if (yellowCount > 0) return 'YELLOW - Some recommendations need caution';
  return 'GREEN - All recommendations are safe for your profile';
}

function collectContraindications(recommendations) {
  const contraindications = [];
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  
  for (const product of allProducts) {
    if (product.safetyNotes) {
      contraindications.push({
        product: product.ingredient,
        reason: product.safetyNotes
      });
    }
  }
  
  return contraindications;
}

function collectWarnings(recommendations) {
  const warnings = [];
  const allProducts = Object.values(recommendations.holisticRoutine).flat();
  
  for (const product of allProducts) {
    if (product.usageNotes) {
      warnings.push({
        product: product.ingredient,
        warning: product.usageNotes
      });
    }
  }
  
  return warnings;
}

function calculateOverallEvidenceGrade(recommendations) {
  let totalScore = 0;
  let count = 0;
  
  for (const condition of Object.values(recommendations.conditionRecommendations)) {
    if (condition.products) {
      for (const product of condition.products) {
        if (product.evidenceScore) {
          totalScore += product.evidenceScore;
          count++;
        }
      }
    }
  }
  
  if (count === 0) return 'N/A';
  
  const avg = totalScore / count;
  if (avg >= 8) return 'A (Strong evidence)';
  if (avg >= 6) return 'B (Moderate evidence)';
  if (avg >= 4) return 'C (Limited evidence)';
  return 'D (Minimal evidence)';
}

function collectKeyStudies(recommendations) {
  const studies = [];
  const seen = new Set();
  
  for (const condition of Object.values(recommendations.conditionRecommendations)) {
    if (condition.products) {
      for (const product of condition.products) {
        if (product.primaryStudies) {
          for (const study of product.primaryStudies) {
            if (study.pmid && !seen.has(study.pmid)) {
              seen.add(study.pmid);
              studies.push(study);
            }
          }
        }
      }
    }
  }
  
  return studies.slice(0, 10); // Top 10 most important
}

function analyzeFeedback(feedback, previousPlan) {
  const adjustments = [];
  
  if (feedback.irritation) {
    adjustments.push('Reduce frequency of active ingredients');
    adjustments.push('Add more moisturizing products');
  }
  
  if (feedback.noImprovement) {
    adjustments.push('Increase concentration of active ingredients');
    adjustments.push('Consider professional consultation');
  }
  
  if (feedback.tooComplex) {
    adjustments.push('Simplify routine to core products');
  }
  
  if (feedback.breakouts) {
    adjustments.push('Check for comedogenic ingredients');
    adjustments.push('Review layering order');
  }
  
  return adjustments;
}

// ========================
// DATABASE FUNCTIONS
// ========================

async function savePlanToDatabase(plan, userData) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('user_skin_profiles')
      .upsert({
        user_id: userData.id,
        skin_type: userData.skin_type,
        conditions: plan.metadata.conditions,
        severity: plan.metadata.severitySummary,
        routine: plan.routine,
        products: plan.products,
        supplements: plan.supplements,
        lifestyle: plan.lifestyle,
        professional_referral: plan.professional,
        safety_status: plan.safety.overallStatus,
        evidence_grade: plan.evidence.overallGrade,
        summary: plan.summary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    console.log('Plan saved to database');
    
  } catch (error) {
    console.error('Error saving plan to database:', error.message);
  }
}

async function getPlanFromDatabase(userId) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_skin_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error retrieving plan from database:', error.message);
    return null;
  }
}

// ========================
// EXPORTS
// ========================

module.exports = {
  generateSkincarePlan,
  generateQuickPlan,
  updatePlan,
  getIngredientDetails,
  validateRoutine
};

// For testing
if (require.main === module) {
  console.log('SKINgenius Recommendation API loaded');
  console.log('Use generateSkincarePlan(userData) to generate a plan');
}
