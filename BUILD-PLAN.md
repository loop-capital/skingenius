# SKINgenius Complete Build Plan

## Vision
Build the most comprehensive skin health intelligence platform that connects:
- **Surface symptoms** (what you see in the mirror)
- **Internal health** (gut, hormones, nutrition, lifestyle)
- **Evidence-based treatments** (products, supplements, lifestyle, professional)
- **Safety-first recommendations** (pregnancy, medications, allergies, contraindications)

## Core Principle
**Skin is a mirror of internal health.** We don't just treat symptoms — we identify and address root causes.

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Research the Holistic Model

#### Gut-Skin Axis
- [ ] Gut microbiome composition → skin inflammation
- [ ] Leaky gut → systemic inflammation → acne, eczema, rosacea
- [ ] SIBO (Small Intestinal Bacterial Overgrowth) → rosacea
- [ ] Probiotics/prebiotics/postbiotics for skin
- [ ] C. acnes strain specificity (phylotype IA1 inflammatory vs protective)
- [ ] S. aureus overgrowth → atopic dermatitis
- [ ] S. epidermidis → protective skin bacterium
- [ ] Demodex mites → 80-100% rosacea patients
- [ ] Malassezia overgrowth → seborrheic dermatitis
- [ ] Bacteriophage therapy for S. aureus

#### Hormone-Skin Connection
- [ ] Cortisol as master disruptor → accelerated aging
- [ ] Estrogen decline → collagen loss, dryness, thinning
- [ ] Testosterone/androgens → sebum production, acne
- [ ] Insulin resistance → AGEs, glycation, inflammation
- [ ] Thyroid dysfunction → dry skin, hair loss
- [ ] Perimenopause/menopause skin changes
- [ ] PCOS → hormonal acne
- [ ] DHEA-S → skin aging

#### Nutrition-Skin
- [ ] Zinc deficiency → acne, wound healing
- [ ] Vitamin D → barrier function, immune regulation
- [ ] Omega-3 (EPA/DHA) → anti-inflammatory
- [ ] Vitamin C → collagen synthesis, antioxidant
- [ ] Vitamin E → membrane protection
- [ ] Vitamin A → cell turnover, retinoid function
- [ ] B vitamins → barrier function, energy metabolism
- [ ] Selenium → antioxidant defense
- [ ] Copper → collagen cross-linking
- [ ] Iron → oxygen delivery, but excess = oxidative stress
- [ ] Glycation → AGEs → collagen crosslinking
- [ ] Sugar → insulin spikes → inflammation
- [ ] Dairy → IGF-1 → acne
- [ ] Gluten → zonulin → leaky gut
- [ ] Alcohol → dehydration, inflammation, nutrient depletion
- [ ] Caffeine → cortisol, dehydration
- [ ] Water intake → hydration, toxin elimination

#### Lifestyle-Skin
- [ ] Sleep quality → growth hormone, cortisol, repair
- [ ] Sleep deprivation → dark circles, dullness, accelerated aging
- [ ] Chronic stress → cortisol, inflammation, barrier disruption
- [ ] Exercise → circulation, detoxification, stress reduction
- [ ] Smoking → vasoconstriction, collagen breakdown, free radicals
- [ ] UV exposure → photoaging, DNA damage, immunosuppression
- [ ] Blue light → oxidative stress, pigmentation
- [ ] Pollution → particulate matter, free radicals, barrier disruption
- [ ] EMF radiation → oxidative stress (emerging)

#### Medication-Skin Interactions
- [ ] Retinoids (isotretinoin) → dry skin, photosensitivity, teratogenic
- [ ] Antibiotics → microbiome disruption, resistance
- [ ] Oral contraceptives → hormonal changes, melasma
- [ ] Statins → CoQ10 depletion, mitochondrial dysfunction
- [ ] SSRIs → sweating, photosensitivity
- [ ] NSAIDs → leaky gut, inflammation
- [ ] Steroids → skin thinning, barrier disruption
- [ ] Chemotherapy → severe dryness, pigmentation changes
- [ ] Immunosuppressants → infection risk, skin cancer
- [ ] Blood thinners → bruising, bleeding

### 1.2 Build the Knowledge Graph

Create interconnected data model:
```
Condition → Root Cause → Mechanism → Treatment Pathway
   ↓            ↓            ↓              ↓
Acne      Gut dysbiosis    Inflammation   Probiotics
          Insulin resist.   Androgens      Low GI diet
          Hormonal          Sebum          Zinc
          Stress            C. acnes       Retinoids
```

---

## Phase 2: Evidence Database (Week 2-3)

### 2.1 Ingredient Evidence Matrix

For each of 169 ingredients:
- [ ] INCI name standardization
- [ ] Mechanism of action
- [ ] Conditions treated (with evidence level)
- [ ] Effective concentration ranges
- [ ] pH requirements
- [ ] Formulation compatibility
- [ ] Stability concerns
- [ ] Time to results
- [ ] PubMed citations (minimum 3)
- [ ] Evidence grading (A/B/C/D)

### 2.2 Safety Database

For each ingredient:
- [ ] Pregnancy safety (safe / avoid / limited data)
- [ ] Breastfeeding safety
- [ ] Medication interactions
- [ ] Known allergies
- [ ] Skin type contraindications
- [ ] Concentration limits
- [ ] Patch test recommendations
- [ ] Photosensitivity
- [ ] Comedogenicity rating

### 2.3 Condition Profiles

For each skin condition:
- [ ] Clinical definition
- [ ] Grading scales (mild/moderate/severe)
- [ ] Root causes (with evidence)
- [ ] Contributing factors
- [ ] Treatment pathways (topical / oral / lifestyle / professional)
- [ ] When to see dermatologist
- [ ] Red flags (urgent referral)
- [ ] Common misconceptions

---

## Phase 3: Recommendation Engine (Week 3-4)

### 3.1 Algorithm Logic

```python
def recommend(user_profile, skin_analysis):
    # Extract conditions from AI analysis
    conditions = skin_analysis.conditions
    
    # Get user safety constraints
    constraints = {
        'pregnant': user_profile.pregnant,
        'breastfeeding': user_profile.breastfeeding,
        'medications': user_profile.medications,
        'allergies': user_profile.allergies,
        'skin_type': user_profile.skin_type,
        'sensitivities': user_profile.sensitivities,
        'budget': user_profile.budget,
        'lifestyle': user_profile.lifestyle  # sleep, stress, diet, exercise
    }
    
    # Identify root causes
    root_causes = analyze_root_causes(conditions, constraints)
    
    # Generate holistic recommendations
    recommendations = {
        'topical': [],      # Products
        'supplements': [],  # Internal support
        'lifestyle': [],    # Behavioral changes
        'professional': [], # When to see provider
        'urgent': []        # Red flags
    }
    
    for condition in conditions:
        # Get evidence-based treatments
        treatments = get_treatments(condition, constraints)
        
        # Rank by evidence + safety + user fit
        ranked = rank_treatments(treatments, constraints)
        
        # Add to appropriate category
        recommendations.topical.extend(ranked.topical)
        recommendations.supplements.extend(ranked.supplements)
        recommendations.lifestyle.extend(ranked.lifestyle)
        
        # Check for red flags
        if condition.severity == 'severe' or condition.urgent:
            recommendations.urgent.append(condition)
            recommendations.professional.extend(get_referral_path(condition))
    
    return recommendations
```

### 3.2 Safety Filters

```python
def safety_filter(product, user_profile):
    # Check pregnancy
    if user_profile.pregnant:
        if any(ing.safe_pregnancy == False for ing in product.ingredients):
            return False, "Contains ingredients contraindicated in pregnancy"
    
    # Check breastfeeding
    if user_profile.breastfeeding:
        if any(ing.safe_breastfeeding == False for ing in product.ingredients):
            return False, "Contains ingredients contraindicated while breastfeeding"
    
    # Check medication interactions
    for med in user_profile.medications:
        for ing in product.ingredients:
            if med in ing.interactions:
                return False, f"May interact with {med}"
    
    # Check allergies
    for allergy in user_profile.allergies:
        for ing in product.ingredients:
            if allergy in ing.allergies:
                return False, f"Contains potential allergen: {allergy}"
    
    # Check skin type compatibility
    if product.skin_types and user_profile.skin_type not in product.skin_types:
        return False, f"Not recommended for {user_profile.skin_type} skin"
    
    return True, "Safe"
```

### 3.3 Compatibility Engine

```python
def check_compatibility(routine):
    warnings = []
    
    # Don't combine: Retinoids + AHA/BHA same night
    if has_retinoid(routine.pm) and has_acid(routine.pm):
        warnings.append("Use retinoids and acids on alternate nights to avoid irritation")
    
    # Don't combine: Vitamin C + Niacinamide (at same time, pH conflict)
    if has_vitamin_c(routine.am) and has_niacinamide(routine.am):
        warnings.append("Apply Vitamin C and Niacinamide 15+ minutes apart")
    
    # Don't combine: Benzoyl Peroxide + Tretinoin (degrades tretinoin)
    if has_benzoyl_peroxide(routine) and has_tretinoin(routine):
        warnings.append("Benzoyl Peroxide degrades Tretinoin. Use at different times.")
    
    # Do combine: Vitamin C + Vitamin E + Ferulic Acid (synergistic)
    if has_vitamin_c(routine) and has_vitamin_e(routine) and has_ferulic(routine):
        routine.boost_score += 2  # Higher evidence score
    
    # Sequencing rules
    routine.am = sort_by_ph(routine.am)  # Low pH first
    routine.pm = sort_by_texture(routine.pm)  # Light to heavy
    
    return routine, warnings
```

---

## Phase 4: Content Engine (Week 4-5)

### 4.1 Article Templates

For each condition/ingredient/topic:
- [ ] What it is (plain English)
- [ ] How it works (mechanism)
- [ ] Evidence level (with citations)
- [ ] Who it's for
- [ ] Who should avoid it
- [ ] How to use it
- [ ] What to expect (timeline)
- [ ] Common mistakes
- [ ] Myths debunked
- [ ] Related topics

### 4.2 Personalized Content Feed

Based on user's:
- Skin conditions
- Age group
- Lifestyle factors
- Search history
- Engagement patterns

---

## Phase 5: Professional Referral (Week 5-6)

### 5.1 Severity Assessment

```python
def assess_severity(condition, metrics):
    if condition.name == 'acne':
        if metrics.nodules > 5 or metrics.cysts > 3:
            return 'severe', 'See dermatologist - may need oral medication'
        elif metrics.inflammatory > 20:
            return 'moderate', 'Consider dermatologist if not improving in 8 weeks'
        else:
            return 'mild', 'OTC treatment appropriate'
    
    if condition.name == 'melanoma_risk':
        if metrics.asymmetry > 0.7 or metrics.border_irregularity > 0.7:
            return 'urgent', 'URGENT: See dermatologist within 48 hours'
    
    # ... etc
```

### 5.2 Provider Directory

- [ ] Dermatologists (board-certified)
- [ ] Medical spas (verified)
- [ ] Estheticians (licensed)
- [ ] Specialties (acne, aging, skin of color, etc.)
- [ ] Treatment offerings
- [ ] Pricing transparency
- [ ] Reviews
- [ ] Booking integration

---

## Phase 6: Data Integration (Week 6-8)

### 6.1 Wearable/Biomarker Integration

- [ ] Sleep data (Oura, Apple Watch)
- [ ] Stress (HRV, cortisol patterns)
- [ ] Nutrition (food logging, glucose)
- [ ] Gut health (microbiome testing)
- [ ] Hormone panels (DUTCH test, blood work)
- [ ] UV exposure
- [ ] Environmental (pollution, weather)

### 6.2 Basys Health Integration

- [ ] Biomarker correlation (inflammation markers, nutrient levels)
- [ ] Treatment efficacy tracking
- [ ] Personalized dosage optimization
- [ ] Long-term health outcomes

---

## Research Sources

### Books to Review
1. [x] *Clean: The New Science of Skin* (Hamblin, 2020)
2. [x] *The Beauty Molecule* (Perricone, 2010)
3. [x] *The Hormone Reset Diet* (Gottfried, 2017)
4. [ ] *The Beauty of Dirty Skin* (Bowe, 2018) - Gut-skin axis
5. [ ] *Skin Deep* (Waldman, 2019) - Toxic exposures
6. [ ] *The Clear Skin Diet* (Logan & Treloar, 2017)
7. [ ] *The Mind-Gut Connection* (Mayer, 2016)
8. [ ] *The Perricone Prescription* (Perricone, 2002)
9. [ ] *Younger* (Lancer, 2014) - Dr. Lancer's method
10. [ ] *The Skincare Bible* (Mahto, 2018) - Evidence-based
11. [ ] *Glow* (Nadolsky, 2020) - Nutrition for skin
12. [ ] *The Microbiome Solution* (Chutkan, 2015)
13. [ ] *Brain Maker* (Perlmutter, 2015) - Gut-brain connection

### Research Papers/Databases
- [ ] PubMed systematic reviews on skin-gut axis
- [ ] NIH Human Microbiome Project
- [ ] American Academy of Dermatology guidelines
- [ ] European Dermatology Forum guidelines
- [ ] CosIng (EU cosmetic ingredient database)
- [ ] INCIDecoder ingredient database
- [ ] Paula's Choice ingredient dictionary

### Clinical Guidelines
- [ ] AAD acne guidelines (2024)
- [ ] AAD rosacea guidelines
- [ ] AAD atopic dermatitis guidelines
- [ ] AAD psoriasis guidelines
- [ ] AAD skin cancer screening guidelines

---

## Success Metrics

### Research Quality
- [ ] 169 ingredients fully researched with PubMed citations
- [ ] 50+ skin conditions profiled with grading scales
- [ ] 20+ root cause pathways mapped
- [ ] 100+ evidence-based articles written

### Technical
- [ ] Recommendation engine accuracy > 80%
- [ ] Safety filter false negative rate < 1%
- [ ] API response time < 200ms
- [ ] Content personalization relevance > 70%

### User Impact
- [ ] Assessment completion rate > 60%
- [ ] Routine creation rate > 50%
- [ ] 2-week retention > 40%
- [ ] Professional referral appropriateness > 90%

---

## Team Assignments

> **Spawn reference:** Use the `agentId` column exactly when calling `sessions_spawn`.

| Name | agentId | Responsibilities |
|------|---------|-----------------|
| Nova | `skingenius-ceo` | Overall coordination, priority decisions, stakeholder communication |
| Dermis | `skingenius-architect` | Database schema, API architecture, data model design |
| Sage | `skingenius-research` | Book research, evidence compilation, clinical guidelines, content quality |
| Core | `skingenius-data` | Database population, data normalization, ETL pipelines, analytics |
| Lens | `skingenius-ai` | Skin analysis model, condition detection accuracy, metric scoring |
| Aura | `skingenius-design` | User flow design, results visualization, content layout, mobile UI |
| Pixel | `skingenius-dev` | Frontend, backend API, database integration, testing |
| Guard | `skingenius-syntax` | Code audits, security reviews, pre-PR checks |
| Pulse | `skingenius-meta` | Progress reports, sprint planning, TASKS.md updates |
| Forge | `skingenius-devops` | Infrastructure, CI/CD, monitoring, security |

---

## Phase 7: Image Processing Pipeline (Week 8+)

### 7.1 Tiered Vision Architecture

```
Upload → EXIF strip (Tier 0, server-side)
       → Kimi K2.6 quality gate (Tier 1, free)
         ├─ REJECT: blurry / no face / poor lighting / non-skin / inappropriate
         └─ PASS ↓
       → MiMo Omni condition classification (Tier 2)
         ├─ HIGH confidence (≥70%) → return result
         └─ LOW confidence (<70%) ↓
       → GPT-4V / Claude Vision (Tier 3, premium fallback)
```

### 7.2 Tier 0 — EXIF Strip (Server-Side)
- Remove geolocation, timestamps, device info before any model sees the image
- Privacy-first: SKINgenius handles sensitive health data
- Happens before image leaves our server

### 7.3 Tier 1 — Upload Quality Check (Kimi K2.6)
- **Model:** `ollama/kimi-k2.6:cloud` (free, fast, confirmed image input support)
- **Volume:** 80% of all images processed here
- **Checks:**
  - Blur detection (Laplacian variance fallback if model unsure)
  - Lighting assessment (underexposed / overexposed / uneven)
  - Face detection (is there a visible face/skin area?)
  - Non-skin rejection (food, pets, objects, unrelated photos)
  - Inappropriate content flag
- **Output:** `{ pass: boolean, qualityScore: 0-100, issues: string[], suggestion: string }`
- **Action:** Reject + suggestion (“try better lighting”, “move closer”, etc.) or pass to Tier 2

### 7.4 Tier 2 — Condition Classification (MiMo Omni)
- **Model:** `xiaomi/mimo-v2-omni` (multimodal, clinical reasoning)
- **Volume:** ~18% of uploads (those passing Tier 1)
- **Classification:**
  - Primary condition (acne, rosacea, melasma, eczema, psoriasis, etc.)
  - Severity grade (mild / moderate / severe)
  - Secondary features (scarring, hyperpigmentation, erythema, etc.)
  - Fitzpatrick skin type estimate
- **Confidence threshold:** ≥70% → return result; <70% → escalate to Tier 3
- **Output:** `{ conditions: [{name, confidence, severity, features}], skinTypeEstimate, notes }`

### 7.5 Tier 3 — Premium Fallback (GPT-4V / Claude Vision)
- **Volume:** ~2% of uploads (edge cases only)
- **Trigger:** MiMo Omni confidence < 70% on primary condition
- **Use cases:** Multi-condition presentations, rare dermatological conditions, ambiguous cases
- **Output:** Same format as Tier 2, plus differential reasoning and recommended follow-up
- **Cost:** ~$0.01-0.03 per image — acceptable at 2% volume

### 7.6 API Route Specs

```
POST /api/analysis/upload
  → Accepts: multipart image (max 10MB)
  → Returns: { uploadId, qualityScore, issues[] } or rejection + suggestion
  → Internally: EXIF strip → Kimi quality check → store in Supabase Storage

POST /api/analysis/classify
  → Accepts: { uploadId }
  → Returns: { conditions[], skinTypeEstimate, confidence, tier }
  → Internally: MiMo Omni → (if low confidence) → Premium fallback

GET /api/analysis/:id
  → Returns: full analysis result + recommendations
  → Recommendations generated from condition + knowledge graph
```

### 7.7 Cost Projection (per 1000 uploads)
- Tier 1 (Kimi): 800 images × $0 = $0
- Tier 2 (MiMo Omni): 180 images × ~$0.005 = $0.90
- Tier 3 (Premium): 20 images × ~$0.02 = $0.40
- **Total: ~$1.30 per 1000 uploads**

---

## Current Status (as of 2026-05-15)
- [x] 236 products in database
- [x] 30 ingredients researched (Batch 1)
- [x] 20 more ingredients researched (Batch 2)
- [x] 14 skin conditions seeded
- [x] 16 research reports complete (1.3 MB total)
- [x] Knowledge graph v1.1 built (root causes, mechanisms, medications, relationships)
- [x] Recommendation engine designed (4 intervention tiers)
- [x] Schema additions (14 new tables for root causes, assessments, recommendations)
- [x] WelcomeScreen hero image updated (Kora/Basys Health)
- [x] MenoScale feature (20-question menopause assessment)
- [x] Basic safety flags (pregnancy, allergies)
- [ ] 139 ingredients still need research
- [ ] Seed Supabase from knowledge graph JSON
- [ ] Build API routes (/api/recommendations, /api/root-causes)
- [ ] Build UI components (root cause cards, supplement protocols, practitioner CTAs)
- [ ] Image processing pipeline (Tier 0-3)
- [ ] Professional referral logic
- [ ] Content engine

## Next Actions
1. **Image Pipeline** — Implement EXIF strip + Kimi quality gate + MiMo Omni classification
2. **Pixel** (`skingenius-dev`): Seed Supabase from knowledge graph JSON
3. **Aura** (`skingenius-design`): Build root cause cards, supplement protocol cards, practitioner referral CTAs
4. **Pixel** (`skingenius-dev`): Build API routes (/api/recommendations, /api/root-causes)
5. **Sage** (`skingenius-research`): Continue ingredient research (Batches 3+)
6. **SKINgenius** (me): Coordinate, review, final architecture decisions

---

*Last updated: 2026-05-15*
*Status: Phase 1 complete, Phase 2+ in progress*
