# MANA Labs Integration Spec — Basys Health

> **Date:** 2026-05-20
> **Decision:** Integrate MANA Labs capabilities INTO Basys Health (NOT a separate app)
> **Author:** Che 🧬

---

## TL;DR

MANA Labs has built food intelligence (barcode scanning, EAT SCORE, ingredient safety, nutrition tracking). We adapt their patterns for **skin intelligence** — scanning skincare products, scoring ingredient safety, and correlating nutrition with skin health outcomes.

**The magic nobody else has:** Connecting what you put ON your skin + what you put IN your body → one unified Skin Health Score.

---

## What MANA Labs Does Well (and what we adapt)

| MANA Feature | MANA's Version | Our Adaptation | Status |
|---|---|---|---|
| Barcode/product scanner | Food products via 4-tier pipeline (OpenFoodFacts → USDA → Exa → Gemini) | **Skincare product scanner** via INCIDecoder → EWG → INCI → Gemini | 🆕 Build |
| EAT SCORE (0-100) | Calibrated to body weight, age, activity | **SKIN SCORE** — calibrated to skin type, conditions, Fitzpatrick type | 🆕 Build |
| Ingredient safety scoring | Additive dose, sodium load, re-weighted per user | **Ingredient safety** — comedogenicity, irritation potential, pregnancy safety, medication interactions | Partial (schema exists) |
| Daily intake tracking | Calories, macros, micronutrients | **Skin routine compliance** + **nutrition tracking** (skin-relevant nutrients only) | 🆕 Build |
| Calendar/trend view | Historical meal scores | **Skin Health Timeline** — photos + scores + nutrition over time | 🆕 Build |
| "How you may feel" predictions | Based on food choices | **"How your skin may respond"** — predicted outcomes from routine/nutrition changes | 🆕 Build |
| 4-tier data pipeline | OpenFoodFacts → USDA → Exa → Gemini | **Skincare pipeline:** INCIDecoder → EWG Skin Deep → CosIng (EU) → Gemini fallback | 🆕 Build |

---

## Architecture: One App, Three Intelligence Layers

```
┌─────────────────────────────────────────────────────┐
│                  BASYS HEALTH                        │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   SKIN       │  │  PRODUCT      │  │  NUTRITION  │ │
│  │  INTELLIGENCE│  │  INTELLIGENCE │  │  INTELLIGENCE│ │
│  │              │  │              │  │             │ │
│  │ Face scan    │  │ Barcode scan │  │ Food scan   │ │
│  │ Conditions   │  │ Ingredients  │  │ Macros      │ │
│  │ Severity     │  │ Safety score │  │ Micros      │ │
│  │ Fitzpatrick  │  │ Compatibility│  │ EAT SCORE   │ │
│  │ Skin type    │  │ Routine fit  │  │ Skin-nutri  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                  │        │
│         └────────┬────────┴────────┬─────────┘        │
│                  │                 │                   │
│          ┌───────▼─────────────────▼──────┐           │
│          │     UNIFIED SKIN SCORE         │           │
│          │     (0-100, personalized)       │           │
│          │                                 │           │
│          │  Surface health (40%)           │           │
│          │  Product safety (30%)           │           │
│          │  Nutritional support (20%)      │           │
│          │  Lifestyle factors (10%)        │           │
│          └─────────────────────────────────┘           │
│                                                       │
│  ┌──────────────────────────────────────────────┐     │
│  │  CORRELATION ENGINE                          │     │
│  │  "Your omega-3 intake ↑30% → redness ↓15%"  │     │
│  │  "This moisturizer fits your routine score: 94"│   │
│  │  "Vitamin D deficiency detected → supplement" │    │
│  └──────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────┘
```

---

## Database Changes (New Tables)

### Product Scanner Tables

```sql
-- Scanned skincare products (like MANA's food product lookup)
CREATE TABLE IF NOT EXISTS public.scanned_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  barcode TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT CHECK (category IN ('cleanser', 'moisturizer', 'serum', 'sunscreen', 'treatment', 'mask', 'toner', 'exfoliant', 'eye_care', 'body_care', 'other')),
  ingredients_raw TEXT, -- Full INCI list as scanned
  photo_url TEXT,
  data_source TEXT CHECK (data_source IN ('incidecoder', 'ewg', 'cosing', 'gemini', 'manual')),
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual ingredient analysis from scanned product
CREATE TABLE IF NOT EXISTS public.product_ingredient_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_product_id UUID REFERENCES public.scanned_products(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id),
  ingredient_name TEXT NOT NULL,
  function TEXT, -- emollient, humectant, preservative, active, fragrance, etc.
  safety_rating TEXT CHECK (safety_rating IN ('safe', 'low_concern', 'moderate_concern', 'high_concern', 'avoid')),
  comedogenic_rating INTEGER CHECK (comedogenic_rating >= 0 AND comedogenic_rating <= 5),
  irritation_potential TEXT CHECK (irritation_potential IN ('none', 'low', 'moderate', 'high')),
  pregnancy_safe BOOLEAN DEFAULT TRUE,
  evidence_level TEXT CHECK (evidence_level IN ('strong', 'moderate', 'limited', 'insufficient')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product-to-skin-condition compatibility
CREATE TABLE IF NOT EXISTS public.product_condition_fit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_product_id UUID REFERENCES public.scanned_products(id) ON DELETE CASCADE NOT NULL,
  condition_id UUID REFERENCES public.skin_conditions(id) NOT NULL,
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  reasoning TEXT, -- "Contains niacinamide (evidence A for acne); no irritating fragrances"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nutrition-Skin Tables

```sql
-- Daily skin nutrition log (opt-in, skin-relevant nutrients only)
CREATE TABLE IF NOT EXISTS public.skin_nutrition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Skin-relevant micronutrients (mg/mcg, simplified)
  vitamin_a_mcg INTEGER,
  vitamin_c_mg INTEGER,
  vitamin_d_iu INTEGER,
  vitamin_e_mg INTEGER,
  zinc_mg DECIMAL(4,1),
  omega_3_mg INTEGER,
  selenium_mcg INTEGER,
  biotin_mcg INTEGER,
  -- Hydration
  water_ml INTEGER,
  -- Dietary flags
  sugar_high BOOLEAN DEFAULT FALSE, -- Simple flag vs detailed tracking
  dairy_consumed BOOLEAN DEFAULT FALSE,
  alcohol_units DECIMAL(3,1) DEFAULT 0,
  -- Optional EAT-style score
  nutrition_score INTEGER CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Scanned food items (optional deeper tracking)
CREATE TABLE IF NOT EXISTS public.scanned_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  barcode TEXT,
  food_name TEXT NOT NULL,
  brand TEXT,
  data_source TEXT CHECK (data_source IN ('openfoodfacts', 'usda', 'exa', 'gemini', 'manual')),
  calories INTEGER,
  protein_g DECIMAL(5,1),
  fat_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  sugar_g DECIMAL(5,1),
  sodium_mg INTEGER,
  -- Skin-relevant highlights
  vitamin_c_mg DECIMAL(5,1),
  vitamin_a_mcg INTEGER,
  omega_3_mg INTEGER,
  zinc_mg DECIMAL(4,1),
  -- User's portion
  portion_multiplier DECIMAL(3,2) DEFAULT 1.0,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  eaten_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Unified Skin Score Table

```sql
-- Daily Skin Health Score (computed, cached)
CREATE TABLE IF NOT EXISTS public.skin_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Component scores (each 0-100)
  surface_score INTEGER, -- From latest photo analysis
  product_safety_score INTEGER, -- Avg of products in routine
  nutrition_score INTEGER, -- From nutrition log
  lifestyle_score INTEGER, -- Sleep, stress, exercise (future)
  -- Computed total
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  -- Insights
  top_positive TEXT, -- "Omega-3 intake improved inflammation markers"
  top_negative TEXT, -- "High sugar intake correlated with breakout risk"
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);
```

---

## API Routes

### Product Scanner

```
POST /api/scan/product
  Body: { barcode?: string, productName?: string, imageUrl?: string }
  Returns: { product, ingredients[], safetyScore, conditionFit[] }
  Pipeline: INCIDecoder → EWG → CosIng → Gemini fallback

POST /api/products/check-routine
  Body: { productId, routineIds[] }
  Returns: { compatible: boolean, conflicts[], warnings[], score }
  Checks: ingredient interactions, pH conflicts, AM/PM rules
```

### Nutrition-Skin

```
POST /api/nutrition/log
  Body: { vitaminC?: number, zinc?: number, omega3?: number, water?: number, ... }
  Returns: { nutritionScore, suggestions[] }

POST /api/nutrition/scan-food
  Body: { barcode?: string, foodName?: string, portion?: number }
  Returns: { food, nutrients, skinRelevance[], eatScore }
  Pipeline: OpenFoodFacts → USDA → Gemini

GET /api/nutrition/correlation
  Query: { userId, days?: 30 }
  Returns: { correlations[], insights[] }
  Example: { nutrient: "omega-3", skinMetric: "redness", direction: "negative", strength: 0.72, insight: "Higher omega-3 intake correlated with 15% less redness" }
```

### Unified Score

```
GET /api/skin-score
  Query: { userId, date?: string }
  Returns: { total, components{}, trend, insights[] }

GET /api/skin-score/history
  Query: { userId, days?: 30 }
  Returns: { scores[], trend, milestones[] }
```

---

## 4-Tier Product Scanner Pipeline

```
User scans barcode/photo
│
├─ Tier 0: Local cache check
│  └─ Known product? → Return cached result (< 50ms)
│
├─ Tier 1: INCIDecoder lookup (free)
│  ├─ Match by product name or INCI list
│  ├─ Returns: full ingredient list + functions + safety ratings
│  └─ Volume: ~60% of scans resolved here
│
├─ Tier 2: EWG Skin Deep API (free tier)
│  ├─ Hazard score (1-10), ingredient concerns
│  ├─ Volume: ~25% of scans
│  └─ Supplement: CosIng (EU) for EU-specific regulations
│
├─ Tier 3: Gemini analysis (free via Ollama)
│  ├─ Photo of ingredient list → OCR → analysis
│  ├─ Score ingredients not in databases
│  ├─ Volume: ~10% of scans
│  └─ Prompt: clinical ingredient analysis template
│
└─ Tier 4: Manual review queue
   └─ Unknown products → user contributes → community database grows
```

### Cost per 1000 scans:
- Tier 0 (cache): 400 × $0 = $0
- Tier 1 (INCIDecoder): 350 × $0 = $0
- Tier 2 (EWG): 150 × $0 = $0
- Tier 3 (Gemini): 80 × $0 = $0
- Tier 4 (manual): 20 × $0 = $0 (community contribution)
- **Total: $0 per 1000 scans** (all free-tier sources)

---

## UI Components to Build

### 1. Product Scanner Screen
- Camera viewfinder with barcode detection
- Manual product name search fallback
- Results: safety ring score (like MANA's EAT SCORE ring), ingredient breakdown, condition fit cards

### 2. Skin Nutrition Log (Opt-in Module)
- Quick-add: water, supplements (Vitamin C, D, Zinc, Omega-3)
- Dietary flags: sugar, dairy, alcohol (toggle buttons, not detailed calorie tracking)
- Daily nutrition score ring
- Correlation insights: "Your skin was clearest on days you logged 2L+ water"

### 3. Unified Skin Score Dashboard
- Large score ring (0-100) with color coding
- 4 component mini-rings: Surface | Products | Nutrition | Lifestyle
- Trend sparkline (30-day)
- Top insight card
- "What changed" comparison to previous week

### 4. Product Compatibility Checker
- Add product to routine → instant compatibility check
- Warning cards: "This contains retinol — alternate nights with your AHA serum"
- Boost cards: "This pairs well with your Vitamin C serum (synergistic)"

### 5. Nutrition-Skin Correlation View
- Scatter plot or heatmap: nutrient intake vs skin metrics over time
- Insight cards: actionable patterns
- "Try this" suggestions based on detected deficiencies

---

## Why NOT a Separate App

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **Separate MANA-like app** | Clean separation, independent | User won't download it, no cross-signal data, split user base | ❌ |
| **Deep link to MANA** | No build work | No data ownership, MANA could shut down, bad UX | ❌ |
| **Integrate into Basys Health** | One app, cross-signal magic, data ownership, full control | More features to build | ✅ |

**The competitive advantage is the integration.** No other app connects:
- What you see (skin scan) → What you put on skin (product scan) → What you put in body (nutrition)

---

## Implementation Phases

### Phase 1: Product Scanner (Weeks 1-2)
- [ ] Build INCIDecoder scraper/API integration
- [ ] Build EWG Skin Deep lookup
- [ ] Build barcode scanner UI (expo-camera)
- [ ] Build product results screen (safety ring + ingredient list)
- [ ] Seed ingredient database with safety ratings from research batches
- **Deliverable:** Scan any skincare product → get safety score + ingredient breakdown

### Phase 2: Routine Compatibility (Week 3)
- [ ] Build compatibility engine (ingredient interaction rules from BUILD-PLAN.md Phase 3.3)
- [ ] Build "Add to Routine" flow with instant compatibility check
- [ ] Build warning/boost cards
- **Deliverable:** Add scanned product to routine → see if it fits

### Phase 3: Nutrition Module (Week 4-5)
- [ ] Build lightweight nutrition log (skin-relevant nutrients only)
- [ ] Build food scanner (adapt MANA's 4-tier pipeline for OpenFoodFacts + USDA)
- [ ] Build daily nutrition score
- **Deliverable:** Log skin-relevant nutrition → see daily score

### Phase 4: Unified Score + Correlations (Week 6-7)
- [ ] Build Skin Health Score computation engine
- [ ] Build correlation engine (nutrition ↔ skin metrics)
- [ ] Build Skin Score dashboard UI
- [ ] Build trend visualization
- **Deliverable:** One score that connects everything

### Phase 5: Insights Engine (Week 8+)
- [ ] "How your skin may respond" predictions
- [ ] Personalized supplement recommendations
- [ ] Provider referral triggers based on score trends
- **Deliverable:** Proactive skin health intelligence

---

## Competitive Positioning

| Competitor | What They Do | What They Miss | Our Advantage |
|---|---|---|---|
| **Lovi.care** | Skin scan → product recommendations | No nutrition, no product scanner | We connect all 3 |
| **MANA Labs** | Food → nutrition score | No skin context, no product scanning | We specialize for skin |
| **Skincare by BEAUTYSTAT** | Product reviews + ratings | No personalization, no AI scan | We personalize per user |
| **Curology** | Prescription skincare | No nutrition, limited product range | We're holistic + OTC |
| **Basys Health (current)** | Skin scan + conditions | Missing product + nutrition layers | We're building it |

**After integration, Basys Health = the only app that connects what you see, what you put on your skin, and what you put in your body.**

---

## References

- MANA Labs: https://manaalabs.com
- MANA About: https://manaalabs.com/about.html
- INCIDecoder: https://incidecoder.com
- EWG Skin Deep: https://www.ewg.org/skindeep/
- CosIng (EU): https://ec.europa.eu/growth/sectors/cosmetics/cosing_en
- OpenFoodFacts: https://world.openfoodfacts.org
- USDA FoodData Central: https://fdc.nal.usda.gov

---

*Spec created by Che 🧬 — 2026-05-20*
*Next: Review with Jason → Assign to SKINgenius team → Begin Phase 1*
