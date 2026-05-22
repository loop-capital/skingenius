// GetUpLook Integration for SKINgenius
// Professional service referrals — contextual, goal-based, never pushy

// =========================
// CONFIGURATION
// =========================

const GETUPLOOK_CONFIG = {
  baseUrl: process.env.GETUPLOOK_API_URL || 'https://backend-rho-two-33.vercel.app',
  apiKey: process.env.GETUPLOOK_API_KEY,
  enabled: true,
  
  // Referral settings
  maxProviders: 3, // Show max 3 providers
  minRating: 4.0, // Only show 4+ star providers
  maxDistance: 25, // miles
  
  // Timing settings
  firstReferralWeek: 4, // First mention at week 4
  followUpWeeks: [8, 12, 16], // Follow-up mentions
  
  // Goal-matching
  goalToServices: {
    'reduce acne': ['acne-treatment', 'chemical-peel', 'led-therapy'],
    'prevent aging': ['botox', 'microneedling', 'laser-resurfacing', 'facial'],
    'even skin tone': ['chemical-peel', 'laser-therapy', 'microdermabrasion'],
    'reduce wrinkles': ['botox', 'fillers', 'laser-resurfacing', 'microneedling'],
    'firm skin': ['ultherapy', 'thermage', 'radio-frequency', 'microneedling'],
    'reduce pores': ['chemical-peel', 'laser-therapy', 'microneedling'],
    'brighten complexion': ['facial', 'chemical-peel', 'hydrafacial'],
    'reduce redness': ['rosacea-treatment', 'led-therapy', 'laser-therapy'],
    'clear dark spots': ['chemical-peel', 'laser-therapy', 'microdermabrasion'],
    'improve texture': ['chemical-peel', 'microneedling', 'microdermabrasion'],
    'hydrate skin': ['facial', 'hydrafacial', 'oxygen-facial'],
    'reduce under-eye bags': ['fillers', 'laser-therapy', 'radio-frequency'],
    'tighten jawline': ['ultherapy', 'thermage', 'thread-lift'],
    'body contouring': ['coolsculpting', 'emsculpt', 'radio-frequency-body'],
    'reduce cellulite': ['cellulite-treatment', 'radio-frequency-body', 'emsculpt']
  },
  
  // Service descriptions
  serviceDescriptions: {
    'acne-treatment': {
      name: 'Professional Acne Treatment',
      description: 'Medical-grade extractions, LED therapy, and targeted treatments for active acne',
      timeline: 'See improvement in 2-4 weeks vs 6-8 weeks at home',
      frequency: 'Every 2-4 weeks initially',
      priceRange: '$75-200 per session',
      evidence: 'A (Multiple RCTs show faster clearance than at-home alone)'
    },
    'chemical-peel': {
      name: 'Chemical Peel',
      description: 'Professional-strength acids (glycolic, salicylic, TCA) for exfoliation and renewal',
      timeline: 'Visible improvement in 1-2 sessions vs 3-6 months at home',
      frequency: 'Every 4-6 weeks',
      priceRange: '$100-300 per session',
      evidence: 'A (Proven for acne, pigmentation, aging)'
    },
    'led-therapy': {
      name: 'LED Light Therapy',
      description: 'Red/blue light to reduce inflammation and kill acne bacteria',
      timeline: 'Cumulative improvement over 4-8 sessions',
      frequency: '2-3x per week for 4-6 weeks',
      priceRange: '$50-150 per session',
      evidence: 'B (Good evidence for acne and anti-aging)'
    },
    'botox': {
      name: 'Botox / Neuromodulators',
      description: 'Relaxes muscles to smooth dynamic wrinkles (forehead, crow\'s feet)',
      timeline: 'Results in 3-7 days, lasts 3-4 months',
      frequency: 'Every 3-4 months',
      priceRange: '$300-600 per area',
      evidence: 'A+ (Gold standard for dynamic wrinkles)'
    },
    'fillers': {
      name: 'Dermal Fillers',
      description: 'Hyaluronic acid injections to restore volume (cheeks, lips, under-eyes)',
      timeline: 'Immediate results, lasts 6-18 months',
      frequency: 'Every 6-18 months',
      priceRange: '$500-1,500 per syringe',
      evidence: 'A (Proven for volume loss)'
    },
    'microneedling': {
      name: 'Microneedling',
      description: 'Collagen induction therapy using tiny needles to stimulate skin repair',
      timeline: 'Visible improvement after 3 sessions (vs 6+ months at home)',
      frequency: 'Every 4-6 weeks, series of 3-6',
      priceRange: '$200-500 per session',
      evidence: 'A (Strong evidence for scars, wrinkles, texture)'
    },
    'laser-resurfacing': {
      name: 'Laser Resurfacing',
      description: 'Fractional or ablative lasers for deep renewal and collagen stimulation',
      timeline: 'Dramatic results after 1-3 sessions',
      frequency: '1-3 sessions, then annual maintenance',
      priceRange: '$500-2,500 per session',
      evidence: 'A (Gold standard for deep wrinkles and scars)'
    },
    'hydrafacial': {
      name: 'HydraFacial',
      description: 'Deep cleansing, extraction, and hydration in one treatment',
      timeline: 'Immediate glow, cumulative benefits',
      frequency: 'Monthly for maintenance',
      priceRange: '$150-300 per session',
      evidence: 'B (Popular, good for maintenance)'
    },
    'ultherapy': {
      name: 'Ultherapy',
      description: 'Ultrasound-based skin tightening for lifting and firming',
      timeline: 'Results build over 2-3 months',
      frequency: 'Once per year',
      priceRange: '$2,000-4,000 per treatment',
      evidence: 'B (Good evidence for skin lifting)'
    },
    'thermage': {
      name: 'Thermage',
      description: 'Radiofrequency treatment for skin tightening and contouring',
      timeline: 'Results build over 2-6 months',
      frequency: 'Once per year',
      priceRange: '$2,000-4,000 per treatment',
      evidence: 'B (Good evidence for skin tightening)'
    },
    'thread-lift': {
      name: 'Thread Lift',
      description: 'Dissolvable threads lift and tighten sagging skin',
      timeline: 'Immediate lift, collagen builds over 3-6 months',
      frequency: 'Every 1-2 years',
      priceRange: '$1,500-4,500',
      evidence: 'B (Moderate evidence for lifting)'
    },
    'coolsculpting': {
      name: 'CoolSculpting',
      description: 'Cryolipolysis freezes and eliminates fat cells non-surgically',
      timeline: 'Results visible in 1-3 months',
      frequency: '1-2 sessions per area',
      priceRange: '$600-1,200 per area',
      evidence: 'A (FDA-cleared, strong evidence)'
    },
    'emsculpt': {
      name: 'EMSCULPT',
      description: 'High-intensity electromagnetic muscle stimulation for toning',
      timeline: 'Visible results after 4 sessions',
      frequency: '4 sessions over 2 weeks',
      priceRange: '$750-1,000 per session',
      evidence: 'B (Good evidence for muscle toning)'
    },
    'facial': {
      name: 'Professional Facial',
      description: 'Customized treatment with professional products and techniques',
      timeline: 'Immediate glow and hydration',
      frequency: 'Monthly',
      priceRange: '$75-200 per session',
      evidence: 'B (Maintenance and relaxation)'
    },
    'microdermabrasion': {
      name: 'Microdermabrasion',
      description: 'Mechanical exfoliation for smoother, brighter skin',
      timeline: 'Immediate smoothness, cumulative benefits',
      frequency: 'Every 2-4 weeks',
      priceRange: '$75-200 per session',
      evidence: 'B (Good for texture and tone)'
    },
    'rosacea-treatment': {
      name: 'Rosacea Treatment',
      description: 'Medical-grade treatments for redness and inflammation',
      timeline: 'Improvement after 2-4 sessions',
      frequency: 'Every 2-4 weeks initially',
      priceRange: '$100-300 per session',
      evidence: 'A (Proven for rosacea)'
    },
    'radio-frequency': {
      name: 'Radio Frequency Skin Tightening',
      description: 'Heat-based collagen stimulation for firmer skin',
      timeline: 'Results build over 3-6 months',
      frequency: 'Series of 4-6, then maintenance',
      priceRange: '$200-500 per session',
      evidence: 'B (Good evidence for tightening)'
    },
    'radio-frequency-body': {
      name: 'Radio Frequency Body Treatment',
      description: 'Skin tightening and cellulite reduction for body',
      timeline: 'Results after 4-8 sessions',
      frequency: 'Weekly for 4-8 weeks',
      priceRange: '$200-400 per session',
      evidence: 'C+ (Moderate evidence)'
    },
    'oxygen-facial': {
      name: 'Oxygen Facial',
      description: 'Pressurized oxygen infusion for hydration and radiance',
      timeline: 'Immediate glow',
      frequency: 'Monthly or before events',
      priceRange: '$150-300 per session',
      evidence: 'C (Limited evidence, popular for events)'
    },
    'cellulite-treatment': {
      name: 'Cellulite Treatment',
      description: 'Combination of massage, RF, and vacuum for cellulite reduction',
      timeline: 'Results after 6-12 sessions',
      frequency: '2-3x per week',
      priceRange: '$100-250 per session',
      evidence: 'C (Limited long-term evidence)'
    }
  }
};

// =========================
// MAIN FUNCTIONS
// =========================

/**
 * Generate professional service recommendations based on user goals
 * This is the primary function called by the recommendation engine
 */
function generateProfessionalRecommendations(userProfile, conditionRecommendations, weekNumber = 0) {
  // Check if user is open to professional treatments
  if (userProfile.openToProfessional === false) {
    return {
      show: false,
      reason: 'User prefers at-home care only',
      services: []
    };
  }
  
  // Get user's skin goals
  const skinGoals = userProfile.skinGoals || [];
  if (skinGoals.length === 0) {
    // If no goals set, use conditions as fallback
    const conditions = Object.keys(conditionRecommendations);
    skinGoals.push(...conditions.map(c => conditionToGoal(c)));
  }
  
  // Map goals to services
  const recommendedServices = [];
  for (const goal of skinGoals) {
    const services = GETUPLOOK_CONFIG.goalToServices[goal.toLowerCase()] || [];
    for (const serviceSlug of services) {
      const service = GETUPLOOK_CONFIG.serviceDescriptions[serviceSlug];
      if (service) {
        recommendedServices.push({
          slug: serviceSlug,
          ...service,
          matchedGoal: goal
        });
      }
    }
  }
  
  // Remove duplicates (same service might match multiple goals)
  const uniqueServices = [];
  const seen = new Set();
  for (const service of recommendedServices) {
    if (!seen.has(service.slug)) {
      seen.add(service.slug);
      uniqueServices.push(service);
    }
  }
  
  // Rank by evidence (highest first)
  uniqueServices.sort((a, b) => {
    const gradeMap = { 'A+': 10, 'A': 9, 'B': 7, 'C+': 6, 'C': 5, 'D': 3 };
    return (gradeMap[b.evidence?.charAt(0)] || 0) - (gradeMap[a.evidence?.charAt(0)] || 0);
  });
  
  // Take top recommendations (limit to avoid overwhelming)
  const topServices = uniqueServices.slice(0, GETUPLOOK_CONFIG.maxProviders);
  
  // Determine when/how to show
  const showRecommendation = shouldShowRecommendation(userProfile, weekNumber, topServices);
  
  return {
    show: showRecommendation.show,
    timing: showRecommendation.timing,
    reason: showRecommendation.reason,
    services: topServices,
    note: generateReferralNote(userProfile, topServices, weekNumber)
  };
}

/**
 * Determine if/when to show professional recommendations
 */
function shouldShowRecommendation(userProfile, weekNumber, services) {
  // First visit — always ask about goals and openness
  if (weekNumber === 0) {
    return {
      show: true,
      timing: 'onboarding',
      reason: 'Initial goal assessment'
    };
  }
  
  // User said "no" to professional treatments
  if (userProfile.openToProfessional === false) {
    return {
      show: false,
      timing: 'never',
      reason: 'User prefers at-home care'
    };
  }
  
  // User said "maybe" — gentle nudge at check-ins
  if (userProfile.openToProfessional === 'maybe') {
    const nudgeWeeks = [4, 8, 12];
    if (nudgeWeeks.includes(weekNumber)) {
      return {
        show: true,
        timing: 'check_in',
        reason: `Week ${weekNumber} progress check — professional boost available`
      };
    }
    return {
      show: false,
      timing: 'later',
      reason: 'Not a nudge week'
    };
  }
  
  // User said "yes" — show at optimal times
  const showWeeks = [GETUPLOOK_CONFIG.firstReferralWeek, ...GETUPLOOK_CONFIG.followUpWeeks];
  if (showWeeks.includes(weekNumber)) {
    return {
      show: true,
      timing: 'recommendation',
      reason: `Week ${weekNumber} — optimal time for professional treatment`
    };
  }
  
  // High severity — always show
  const maxSeverity = Math.max(...Object.values(userProfile.conditionSeverities || {}));
  if (maxSeverity >= 8) {
    return {
      show: true,
      timing: 'urgent',
      reason: 'High severity condition — professional care strongly recommended'
    };
  }
  
  return {
    show: false,
    timing: 'later',
    reason: 'Not optimal timing'
  };
}

/**
 * Generate contextual note for referral
 */
function generateReferralNote(userProfile, services, weekNumber) {
  if (weekNumber === 0) {
    return 'Based on your skin goals, here are professional treatments that can accelerate your results.';
  }
  
  if (weekNumber <= 4) {
    return 'You\'re building a great foundation with your at-home routine. Professional treatments can help you reach your goals faster.';
  }
  
  if (weekNumber <= 8) {
    return 'Your at-home routine is working well. A professional treatment could help you break through to the next level.';
  }
  
  if (weekNumber <= 12) {
    return 'Consider a professional treatment to maintain momentum and address deeper concerns.';
  }
  
  return 'Regular professional treatments can help maintain and enhance your results long-term.';
}

/**
 * Get local providers from GetUpLook API
 */
async function getLocalProviders(serviceSlugs, userLocation, options = {}) {
  try {
    const params = new URLSearchParams({
      services: serviceSlugs.join(','),
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: options.radius || GETUPLOOK_CONFIG.maxDistance,
      min_rating: options.minRating || GETUPLOOK_CONFIG.minRating,
      limit: options.limit || GETUPLOOK_CONFIG.maxProviders
    });
    
    const response = await fetch(`${GETUPLOOK_CONFIG.baseUrl}/api/providers/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${GETUPLOOK_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GetUpLook API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.providers || [];
    
  } catch (error) {
    console.error('Error fetching providers:', error);
    // Return fallback data for development
    return generateFallbackProviders(serviceSlugs);
  }
}

/**
 * Generate fallback provider data (for development/testing)
 */
function generateFallbackProviders(serviceSlugs) {
  return [
    {
      id: 'demo_provider_1',
      name: 'Dr. Sarah Chen, MD',
      business_name: 'Radiance Dermatology',
      photo_url: '/providers/sarah-chen.jpg',
      rating: 4.9,
      review_count: 127,
      distance_miles: 2.3,
      address: { street: '123 Main St', city: 'Brooklyn', state: 'NY', zip: '11201' },
      phone: '(555) 123-4567',
      services: serviceSlugs.map(s => ({ id: s, name: GETUPLOOK_CONFIG.serviceDescriptions[s]?.name || s })),
      specialties: ['Acne', 'Anti-aging', 'Pigmentation'],
      next_availability: '2026-05-20T10:00:00Z',
      verified: true
    },
    {
      id: 'demo_provider_2',
      name: 'Emma Rodriguez, LE',
      business_name: 'Glow Med Spa',
      photo_url: '/providers/emma-rodriguez.jpg',
      rating: 4.7,
      review_count: 89,
      distance_miles: 4.1,
      address: { street: '456 Oak Ave', city: 'Brooklyn', state: 'NY', zip: '11215' },
      phone: '(555) 234-5678',
      services: serviceSlugs.map(s => ({ id: s, name: GETUPLOOK_CONFIG.serviceDescriptions[s]?.name || s })),
      specialties: ['Facials', 'Chemical Peels', 'Microneedling'],
      next_availability: '2026-05-18T14:00:00Z',
      verified: true
    },
    {
      id: 'demo_provider_3',
      name: 'Dr. Michael Park, DO',
      business_name: 'Park Aesthetics',
      photo_url: '/providers/michael-park.jpg',
      rating: 4.8,
      review_count: 203,
      distance_miles: 5.7,
      address: { street: '789 Pine St', city: 'Manhattan', state: 'NY', zip: '10001' },
      phone: '(555) 345-6789',
      services: serviceSlugs.map(s => ({ id: s, name: GETUPLOOK_CONFIG.serviceDescriptions[s]?.name || s })),
      specialties: ['Botox', 'Fillers', 'Laser Treatments'],
      next_availability: '2026-05-19T11:00:00Z',
      verified: true
    }
  ];
}

/**
 * Get provider details
 */
async function getProviderDetails(providerId) {
  try {
    const response = await fetch(`${GETUPLOOK_CONFIG.baseUrl}/api/providers/${providerId}`, {
      headers: {
        'Authorization': `Bearer ${GETUPLOOK_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GetUpLook API error: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error fetching provider details:', error);
    return null;
  }
}

/**
 * Track referral event
 */
async function trackReferralEvent(userId, event, data) {
  try {
    await fetch(`${GETUPLOOK_CONFIG.baseUrl}/api/referrals/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GETUPLOOK_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        event,
        data,
        timestamp: new Date().toISOString(),
        source: 'skingenius'
      })
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
  }
}

// =========================
// HELPER FUNCTIONS
// =========================

function conditionToGoal(condition) {
  const map = {
    acne: 'reduce acne',
    photoaging: 'prevent aging',
    hyperpigmentation: 'even skin tone',
    rosacea: 'reduce redness',
    eczema: 'reduce redness',
    'dry-skin': 'hydrate skin',
    'sensitive-skin': 'reduce redness',
    'oily-skin': 'reduce pores',
    'dark-circles': 'reduce under-eye bags',
    'texture-irregularities': 'improve texture'
  };
  return map[condition] || 'improve skin health';
}

// =========================
// EXPORTS
// =========================

module.exports = {
  generateProfessionalRecommendations,
  getLocalProviders,
  getProviderDetails,
  trackReferralEvent,
  GETUPLOOK_CONFIG
};

// Test if run directly
if (require.main === module) {
  const testUser = {
    id: 'test_user',
    skinGoals: ['reduce acne', 'even skin tone'],
    openToProfessional: true,
    conditionSeverities: { acne: 6, hyperpigmentation: 5 },
    location: { lat: 40.7128, lng: -74.0060 }
  };
  
  const recs = generateProfessionalRecommendations(testUser, {}, 4);
  console.log('Professional Recommendations:');
  console.log(JSON.stringify(recs, null, 2));
}
