# SKINgenius Recommendation Engine v1.1

## Design: Root Cause → Recommendation Pipeline

### Core Principle
SKINgenius doesn't just treat symptoms — it identifies root causes and recommends the appropriate intervention tier:

```
User Input → Root Cause Detection → Intervention Tier → Output
     ↓              ↓                    ↓              ↓
  Photo/    Gut? Hormone?         Tier 1: Product   Product
  Quiz      Inflammation?         Tier 2: Supplement  + Dosage
  Labs      Medication?         Tier 3: Basys Health  Deep-link
            Lifestyle?
```

### Intervention Tiers

| Tier | Type | Example | Who Delivers |
|------|------|---------|--------------|
| 1 | **Skincare Product** | Probiotic cleanser for acne | SKINgenius app |
| 2 | **Supplement** | Zinc 30mg + Omega-3 2g for hormonal acne | SKINgenius app |
| 3 | **Basys Health Referral** | SIBO testing, hormone panels, gut workup | Basys Health platform |

> **Note:** SKINgenius does NOT maintain a practitioner directory. All practitioner referrals are delegated to Basys Health via deep-link integration.

### Root Cause → Tier Mapping

| Root Cause | Tier 1 (Product) | Tier 2 (Supplement) | Tier 3 (Basys Referral) |
|------------|------------------|---------------------|-------------------|
| **Gut Dysbiosis** | Probiotic skincare, gentle cleansers | Multi-strain probiotics (25-50B CFU), prebiotics (inulin/FOS) | **Basys GI specialist** — SIBO breath test, stool analysis |
| **Leaky Gut** | Barrier-repair moisturizers (ceramides) | L-glutamine, zinc carnosine, collagen | **Basys functional medicine** — zonulin testing, intestinal permeability |
| **SIBO** | N/A — requires diagnosis first | N/A — requires prescription | **Basys gastroenterology** — hydrogen/methane breath test, rifaximin |
| **Insulin Resistance** | Niacinamide, anti-glycation serums | Berberine 500mg, chromium, alpha-lipoic acid, inositol | **Basys endocrinology** — HbA1c, fasting insulin, OGTT |
| **Cortisol Excess** | Adaptogenic skincare | Ashwagandha 300-600mg, phosphatidylserine, magnesium glycinate | **Basys integrative medicine** — cortisol awakening response, DUTCH test |
| **Estrogen Deficiency** | Phytoestrogen serums, HA boosters | Maca, black cohosh, evening primrose oil | **Basys gynecology** — serum estradiol, DUTCH test |
| **Androgen Excess** | Anti-androgenic topicals | Saw palmetto 320mg, spearmint tea, zinc, DIM | **Basys endocrinology** — testosterone, DHEA-S, SHBG, PCOS panel |
| **Thyroid Dysfunction** | N/A — requires diagnosis | Selenium 200mcg, zinc, vitamin D | **Basys endocrinology** — TSH, free T3/T4, reverse T3, antibodies |
| **Chronic Inflammation** | Anti-inflammatory skincare | Omega-3 (2-3g EPA+DHA), curcumin, quercetin | **Basys integrative medicine** — CRP, ESR, cytokine panel |
| **Nutrient Deficiency** | Targeted ingredient products | Zinc, vitamin D, iron, B12, omega-3 (based on labs) | **Basys functional medicine** — comprehensive micronutrient panel |
| **Microbiome Imbalance** | Microbiome-friendly skincare | Probiotics (strain-specific), prebiotics | **Basys dermatology/functional medicine** — skin microbiome testing |
| **Oxidative Stress** | Antioxidant serums (vitamin C, niacinamide) | NAC 600-1200mg, vitamin C 1g, vitamin E 400 IU | **Basys integrative medicine** — oxidative stress panel |
| **Colostrum Protocol** | Barrier-repair moisturizers | Colostrum 2-4g + probiotics + zinc | **Basys functional medicine** — if no improvement after 8-12 weeks |

### Recommendation Logic Flow

```javascript
// Pseudo-code for recommendation generation

function generateRecommendations(userProfile, detectedConditions, rootCauses) {
  const recommendations = [];
  
  for (const rootCause of rootCauses) {
    const tier = determineInterventionTier(rootCause, userProfile);
    
    switch(tier) {
      case 'product':
        recommendations.push(...findProductsForRootCause(rootCause, userProfile.skin_type));
        break;
      case 'supplement':
        recommendations.push(...findSupplementsForRootCause(rootCause, userProfile.medications, userProfile.pregnancy_status));
        break;
      case 'practitioner':
        recommendations.push(generatePractitionerReferral(rootCause, userProfile.location));
        break;
      case 'basys':
        recommendations.push(generateBasysReferral(rootCause, userProfile));
        break;
    }
  }
  
  // Always include product recommendations for surface symptoms
  for (const condition of detectedConditions) {
    recommendations.push(...findProductsForCondition(condition, userProfile));
  }
  
  return deduplicateAndRank(recommendations);
}

function determineInterventionTier(rootCause, userProfile) {
  // If user wants deep workup or root cause requires diagnosis → Basys referral
  if (userProfile.prefersDeepWorkup) return 'basys';
  
  // If root cause requires lab testing → Basys referral (not internal practitioner)
  if (['sibo', 'thyroid_dysfunction', 'insulin_resistance', 'estrogen_deficiency', 'androgen_excess'].includes(rootCause.id)) {
    return 'basys';
  }
  
  // If user has confirmed diagnosis or medication interaction → supplement with flag
  if (userProfile.hasConfirmedDiagnosis(rootCause) || 
      userProfile.medications.some(med => interactsWithRootCause(med, rootCause))) {
    return 'supplement'; // with safety flag
  }
  
  // Otherwise: supplement for internal, product for surface
  return rootCause.requiresInternalIntervention ? 'supplement' : 'product';
}
```

### Basys Health Referral Logic

All practitioner interactions are delegated to Basys Health. SKINgenius does not store practitioner data, schedules, or billing info.

| When to Refer | Basys Specialty | Pre-populated Context |
|---------------|-----------------|----------------------|
| SIBO suspected | `gastroenterology` | Suspected SIBO → request breath test |
| Insulin resistance | `endocrinology` | Metabolic screening needed |
| Thyroid dysfunction | `endocrinology` | Thyroid panel + antibody testing |
| Estrogen deficiency | `gynecology` | Hormone evaluation for skin symptoms |
| Androgen excess | `endocrinology` | PCOS / androgen screening |
| Severe acne / rosacea | `dermatology` | Isotretinoin or prescription therapy |
| Suspected autoimmune | `rheumatology` | Autoimmune screening + referral |
| No improvement after supplements (8-12 weeks) | `functional_medicine` | Escalation from supplement protocol |

### Basys Health Integration

**Phase 1 (Now):** Static referral links
- "Find a gut health specialist" → links to Basys Health landing page
- Store `basys_referral_intent` in user profile for analytics

**Phase 2 (Basys MVP):** Deep links with context
- Pass root cause + user symptoms to Basys via URL params
- Pre-populate Basys intake form with SKINgenius data
- Track referral → booking conversion

**Phase 3 (Full Integration):** Bidirectional sync
- Basys lab results → updated SKINgenius recommendations
- Basys practitioner notes → updated skin profile
- SKINgenius pre-populates Basys booking flow

> **Note:** SKINgenius never stores practitioner data, schedules appointments, or handles billing. All practitioner interactions are delegated to Basys Health.

### Database Schema (see schema-additions.sql)

New tables needed:
- `root_causes` — reference data (with `basys_specialty_param` for referrals)
- `mechanisms` — reference data
- `medications` — reference data
- `supplements` — reference data (includes colostrum)
- `cause_condition_links` — many-to-many
- `mechanism_chains` — root_cause → mechanism → condition
- `medication_condition_links` — medication → condition
- `hormone_condition_links` — hormone → condition
- `basys_referrals` — Basys Health referral tracking (not practitioner data)
- `basys_referral_intents` — analytics only
- `user_health_assessments` — quiz/lab data
- `recommendations` — generated recommendations with type

### API Endpoints Needed

```
POST /api/recommendations
  Body: { userId, detectedConditions[], rootCauses[], userProfile }
  Response: { recommendations[], supplementProtocol[], basysReferrals[] }

GET /api/root-causes/:conditionId
  Response: { rootCauses[], mechanisms[], supplements[], basysSpecialties[] }

POST /api/basys-referral
  Body: { userId, rootCause, symptoms[], urgency }
  Response: { referralUrl, basysReferralId? }

// NO practitioner directory endpoints — all delegated to Basys Health
```

### Safety Rules

1. **Never diagnose** — always use "may be associated with" language
2. **Flag contradictions** — if user is on medication that interacts with supplement, flag it
3. **Pregnancy screening** — all recommendations check pregnancy status first
4. **Red flag routing** — if symptoms suggest serious condition (melanoma, autoimmune), route to MD immediately
5. **Lab before supplement** — for root causes requiring diagnosis (SIBO, thyroid), generate Basys referral before recommending supplements

### Colostrum Protocol Integration

**When to recommend colostrum:**
- User reports gut issues + skin problems (bloating, IBS, food sensitivities)
- Root cause is `leaky_gut`, `gut_dysbiosis`, or `chronic_inflammation`
- No contraindications: dairy allergy, vegan, immunocompromised

**Protocol:**
- Dose: 2-4g daily, morning empty stomach
- Pair with: probiotics, zinc, L-glutamine
- Evidence: Grade C — include disclaimer about limited skin-specific research
- Duration: 8-12 weeks before reassessment
- Escalation: If no improvement → Basys referral (`specialty=functional_medicine`)

---
*Document version: 1.1 | Last updated: 2026-05-15*
