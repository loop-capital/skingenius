# Skin Wellness Plan — Feature Specification

> **Status:** Design — ready for build
> **Created:** 2026-06-13
> **Author:** Che (orchestrator) + Jason (product)
> **Depends on:** Existing SKINgenius architecture (Supabase, Next.js, lifestyle questionnaire, supplements table, root causes/mechanisms chains)

---

## 1. Problem Statement

No app connects skin analysis to a comprehensive, personalized wellness protocol. Dermatology apps recommend topicals. Longevity apps sell supplements. Wellness apps track diet. Users cobble together advice from podcasts, Reddit, and TikTok — with no personalization and no evidence grading.

**SKINgenius opportunity:** Become the operating system for skin health — connecting skin analysis results to diet, supplements, peptides, sleep, exercise, environment, and biomarkers into one personalized, evidence-graded protocol.

---

## 2. User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKIN WELLNESS PLAN FLOW                       │
│                                                                  │
│  Skin Scan ──→ Conditions ──→ Root Causes ──→ Mechanisms        │
│       │              │              │              │              │
│       ▼              ▼              ▼              ▼              │
│  Lifestyle Q ──→ Diet Score   Metabolic     Inflammatory         │
│  (existing)      Sleep Score   Risk Score    Risk Score          │
│                  Stress Score                                      │
│                  UV Score                                          │
│       │                                                           │
│       ▼                                                           │
│  ┌─────────────────────────────────────┐                         │
│  │     PERSONALIZED WELLNESS PLAN      │                         │
│  │                                     │                         │
│  │  🎯 Primary Goals (from analysis)   │                         │
│  │  🍽️  Diet Protocol                  │                         │
│  │  💊 Supplement Stack                │                         │
│  │  🧬 Peptide Protocol                │                         │
│  │  💧 Hydration Target                │                         │
│  │  😴 Sleep Optimization              │                         │
│  │  🔥 Mitochondrial Support           │                         │
│  │  🏋️ Movement Protocol               │                         │
│  │  🧘 Stress Management               │                         │
│  │  🌍 Environmental Defense           │                         │
│  │  💡 Light Therapy                   │                         │
│  │  📊 Progress Tracking               │                         │
│  └─────────────────────────────────────┘                         │
│       │                                                           │
│       ▼                                                           │
│  Daily Protocol View ──→ Weekly Check-in ──→ Plan Adjustment     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 New Table: `peptides`

Separate from supplements — different regulatory status, different dosing paradigms, different risk profiles.

```sql
CREATE TABLE IF NOT EXISTS public.peptides (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',           -- e.g. ["GHK-Cu", "Copper Tripeptide-1"]
  administration_route TEXT NOT NULL CHECK (administration_route IN ('topical', 'injectable', 'oral', 'nasal')),
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  -- Tier 1: Topical, well-established, cosmetic-grade
  -- Tier 2: Injectable, widely used, not FDA-approved for these uses
  -- Tier 3: Research/experimental, educational only

  regulatory_status TEXT NOT NULL DEFAULT 'not_fda_approved',
  -- 'fda_approved' | 'cosmetic_grade' | 'not_fda_approved' | 'research_only'

  dosage TEXT,
  frequency TEXT,                        -- e.g. "daily", "2x/week", "as needed"
  cycle_protocol TEXT,                   -- e.g. "5 days on, 2 off" or "8 weeks on, 4 off"

  skin_benefits TEXT[] DEFAULT '{}',     -- ["collagen synthesis", "anti-inflammatory"]
  longevity_benefits TEXT[] DEFAULT '{}', -- ["telomere maintenance", "senescence reduction"]
  mechanisms_of_action TEXT[] DEFAULT '{}', -- ["AMPK activation", "Nrf2 pathway"]

  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  evidence_notes TEXT,                   -- Context on evidence quality
  key_studies TEXT[] DEFAULT '{}',       -- PubMed IDs or citations

  interactions TEXT[] DEFAULT '{}',      -- Drug/supplement interactions
  contraindications TEXT[] DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  pregnancy_safe TEXT DEFAULT 'unknown',

  conditions_treated TEXT[] DEFAULT '{}', -- Maps to skin_conditions.slug
  root_causes_targeted TEXT[] DEFAULT '{}',
  mechanisms_targeted TEXT[] DEFAULT '{}',

  sourcing_notes TEXT,                   -- "compounding pharmacy", "research vendor", "OTC"
  estimated_cost_monthly NUMERIC(8,2),   -- Monthly cost estimate

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 New Table: `wellness_plans`

```sql
CREATE TABLE IF NOT EXISTS public.wellness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'auto' CHECK (plan_type IN ('auto', 'custom', 'provider')),

  -- Source data snapshots
  skin_conditions TEXT[] DEFAULT '{}',    -- From latest skin analysis
  root_causes TEXT[] DEFAULT '{}',        -- Mapped from conditions
  metabolic_risks TEXT[] DEFAULT '{}',    -- Glycation, insulin resistance markers
  lifestyle_scores JSONB DEFAULT '{}',    -- {diet: 6, sleep: 4, stress: 7, uv: 3}

  -- Optional biomarker inputs
  hba1c NUMERIC(4,2),                    -- Glycation risk
  vitamin_d_ng_ml NUMERIC(6,2),
  omega3_index NUMERIC(4,2),
  crp NUMERIC(6,3),                      -- Inflammation
  fasting_glucose NUMERIC(5,1),
  hscrp NUMERIC(6,3),
  cortisol NUMERIC(5,2),

  -- Plan sections (generated JSON)
  diet_protocol JSONB DEFAULT '{}',
  supplement_stack JSONB DEFAULT '[]',
  peptide_protocol JSONB DEFAULT '[]',
  hydration_target JSONB DEFAULT '{}',
  sleep_protocol JSONB DEFAULT '{}',
  mitochondrial_support JSONB DEFAULT '{}',
  glycation_score JSONB DEFAULT '{}',
  movement_protocol JSONB DEFAULT '{}',
  stress_protocol JSONB DEFAULT '{}',
  environmental_defense JSONB DEFAULT '{}',
  light_therapy JSONB DEFAULT '{}',
  gut_skin_protocol JSONB DEFAULT '{}',
  hormonal_protocol JSONB DEFAULT '{}',
  psychoderm_protocol JSONB DEFAULT '{}',
  post_procedure_protocol JSONB DEFAULT '{}',
  fitzpatrick_adjustments JSONB DEFAULT '[]',
  medication_adjustments JSONB DEFAULT '[]',
  oral_microbiome_protocol JSONB DEFAULT '{}',
  seasonal_adjustments JSONB DEFAULT '[]',
  gut_brain_skin_protocol JSONB DEFAULT '{}',
  smoking_alcohol_protocol JSONB DEFAULT '{}',
  sun_exposure_protocol JSONB DEFAULT '{}',
  detox_support JSONB DEFAULT '{}',

  -- Metadata
  active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  notes TEXT,
  provider_id UUID,                      -- If created/reviewed by a provider
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 New Table: `wellness_plan_items`

Individual actionable items within a plan (for daily protocol tracking).

```sql
CREATE TABLE IF NOT EXISTS public.wellness_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.wellness_plans(id) NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'diet', 'supplement', 'peptide', 'hydration', 'sleep',
    'exercise', 'stress', 'environment', 'light_therapy',
    'gut_health', 'hormonal', 'detox', 'mitochondrial',
    'psychoderm', 'post_procedure', 'oral_microbiome',
    'medication_adjustment', 'seasonal', 'gut_brain_skin',
    'smoking_alcohol', 'fitzpatrick', 'sun_exposure'
  )),
  item_type TEXT NOT NULL CHECK (item_type IN ('daily', 'weekly', 'as_needed', 'one_time')),

  title TEXT NOT NULL,
  description TEXT,
  dosage TEXT,                           -- For supplements/peptides
  timing TEXT,                           -- "morning", "evening", "with meals", "before bed"
  frequency TEXT,                        -- "daily", "3x/week", "as needed"

  -- Link to source data
  supplement_id TEXT REFERENCES public.supplements(id),
  peptide_id TEXT REFERENCES public.peptides(id),
  condition_slug TEXT REFERENCES public.skin_conditions(slug),
  root_cause_id TEXT REFERENCES public.root_causes(id),

  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),

  -- User interaction
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  user_notes TEXT,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 New Table: `diet_protocols`

Structured diet recommendations mapped to conditions and mechanisms.

```sql
CREATE TABLE IF NOT EXISTS public.diet_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Low Glycemic Anti-Inflammatory"
  description TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'low_glycemic', 'anti_inflammatory', 'elimination', 'ketogenic',
    'mediterranean', 'autoimmune', 'gut_healing', 'hormone_balancing'
  )),

  -- Rules
  foods_include TEXT[] DEFAULT '{}',     -- Specific foods to eat
  foods_avoid TEXT[] DEFAULT '{}',       -- Specific foods to avoid
  food_groups_include TEXT[] DEFAULT '{}', -- Categories
  food_groups_avoid TEXT[] DEFAULT '{}',

  -- Mechanisms
  target_mechanisms TEXT[] DEFAULT '{}', -- ["glycation", "inflammation", "oxidative_stress"]
  target_root_causes TEXT[] DEFAULT '{}',
  target_conditions TEXT[] DEFAULT '{}',

  -- Evidence
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,

  -- Practical
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  meal_examples JSONB DEFAULT '{}',      -- Sample meals per daypart

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 New Table: `supplement_protocols`

Extends the existing supplements table with protocol-specific data (timing, cycling, stacking).

```sql
CREATE TABLE IF NOT EXISTS public.supplement_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id TEXT REFERENCES public.supplements(id) NOT NULL,

  -- Protocol details
  timing TEXT,                           -- "morning", "evening", "with meals", "empty stomach"
  cycling TEXT,                          -- "continuous", "5/2", "8/4", "seasonal"
  duration_weeks INTEGER,                -- Recommended duration
  stack_with TEXT[] DEFAULT '{}',        -- Supplement IDs that synergize
  avoid_with TEXT[] DEFAULT '{}',        -- Supplement IDs that conflict

  -- Condition-specific dosing
  condition_slug TEXT REFERENCES public.skin_conditions(slug),
  adjusted_dosage TEXT,                  -- Condition-specific dosage override
  rationale TEXT,                        -- Why this dose for this condition

  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.6 Modify Existing: `lifestyle_responses` (extend)

Add fields for expanded lifestyle data needed for wellness plan generation.

```sql
-- New columns to add to lifestyle_responses or new table
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS exercise_frequency TEXT;
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS exercise_type TEXT[];
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS sauna_frequency TEXT;
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS cold_exposure BOOLEAN DEFAULT FALSE;
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS red_light_therapy BOOLEAN DEFAULT FALSE;
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS gut_health_symptoms TEXT[];
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS hormonal_status TEXT; -- "premenopausal", "perimenopausal", "menopausal", "trt", "none"
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS wearable_device TEXT; -- "oura", "apple_watch", "whoop", "none"
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS indoor_air_quality TEXT; -- "good", "moderate", "poor"
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS water_source TEXT; -- "tap", "filtered", "reverse_osmosis", "spring"

-- NEW: Smoking, alcohol, oral health, medications, climate
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS smoking_status TEXT CHECK (smoking_status IN ('never', 'former', 'current', 'social'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS smoking_years NUMERIC(4,1);  -- years of smoking history
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS alcohol_frequency TEXT CHECK (alcohol_frequency IN ('never', 'rare', 'weekly', 'daily', 'heavy_daily'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS alcohol_type TEXT[];  -- ["wine", "beer", "spirits", "cocktails"]
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS alcohol_drinks_per_week NUMERIC(4,1);
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS oral_health TEXT;  -- "good", "fair", "poor"
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS oral_symptoms TEXT[];  -- ["bleeding_gums", "dry_mouth", "bad_breath", "none"]
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS current_medications TEXT[];  -- medication IDs or names
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS recent_procedures TEXT[];  -- ["microneedling", "chemical_peel", "laser", "botox", "filler", "none"]
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS procedure_timeline TEXT;  -- "past_month", "past_3_months", "past_year", "none"
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS climate TEXT CHECK (climate IN ('tropical', 'arid', 'temperate', 'continental', 'polar'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS altitude TEXT CHECK (altitude IN ('low', 'moderate', 'high'));  -- affects UV exposure
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS humidity_level TEXT CHECK (humidity_level IN ('very_dry', 'dry', 'moderate', 'humid', 'very_humid'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS psychoderm_screening JSONB DEFAULT '{}';  -- stress-skin connection scores

-- NEW: Sun exposure habits
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS morning_sun_exposure TEXT CHECK (morning_sun_exposure IN ('never', 'rare', 'sometimes', 'daily'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS morning_sun_minutes NUMERIC(4,1);
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS peak_sun_exposure TEXT CHECK (peak_sun_exposure IN ('minimal', 'moderate', 'frequent', 'occupational'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS sunscreen_habit TEXT CHECK (sunscreen_habit IN ('never', 'face_only', 'daily_face', 'full_body', 'reapply_2h'));
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS sun_exposure_body_areas TEXT[];  -- ["arms", "legs", "chest", "back", "none"]
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS outdoor_activity_time TEXT;  -- "early_morning", "midday", "afternoon", "evening", "varies"
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS vitamin_d_supplement BOOLEAN DEFAULT FALSE;
ALTER TABLE public.lifestyle_responses ADD COLUMN IF NOT EXISTS vitamin_d_level NUMERIC(6,2);  -- ng/mL if tested
```

### 3.7 New Table: `psychoderm_protocols`

Psychodermatology interventions — stress-skin connection protocols.

```sql
CREATE TABLE IF NOT EXISTS public.psychoderm_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'mindfulness', 'cbt', 'biofeedback', 'breathwork',
    'meditation', 'journaling', 'therapy_referral', 'adaptogen'
  )),
  -- Target conditions
  conditions_treated TEXT[] DEFAULT '{}',  -- skin_conditions.slug
  stress_triggers TEXT[] DEFAULT '{}',     -- "work", "relationships", "health"
  -- Protocol details
  duration_minutes INTEGER,               -- daily recommended duration
  frequency TEXT,                          -- "daily", "2x/week", "as_needed"
  instructions TEXT,                       -- step-by-step protocol
  -- Evidence
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  -- Adaptogen-specific fields (if protocol_type = 'adaptogen')
  dosage TEXT,
  interactions TEXT[] DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.8 New Table: `post_procedure_protocols`

Recovery protocols for aesthetic procedures.

```sql
CREATE TABLE IF NOT EXISTS public.post_procedure_protocols (
  id TEXT PRIMARY KEY,
  procedure_type TEXT NOT NULL CHECK (procedure_type IN (
    'microneedling', 'chemical_peel', 'laser_fraxel', 'laser_ipl',
    'botox', 'filler', 'prp', 'rf_microneedling', 'hifu',
    'dermaplaning', 'microdermabrasion', 'thread_lift'
  )),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Pre-procedure protocol
  pre_protocol JSONB DEFAULT '{}',        -- {"avoid": [...], "supplement": [...], "timing": "72h before"}
  -- Post-procedure protocol
  post_protocol JSONB DEFAULT '{}',       -- {"immediate": [...], "day_1_3": [...], "day_4_7": [...], "week_2_plus": [...]}
  -- Supplement modifications
  supplements_to_avoid TEXT[] DEFAULT '{}', -- blood thinners, retinoids, etc.
  supplements_to_add TEXT[] DEFAULT '{}',   -- arnica, bromelain, vitamin K
  -- Skincare modifications
  actives_to_avoid TEXT[] DEFAULT '{}',     -- retinol, AHA, vitamin C
  actives_to_resume_timing TEXT,            -- "7 days", "14 days"
  -- Evidence
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.9 New Table: `fitzpatrick_adjustments`

Recommendation modifications based on Fitzpatrick skin type.

```sql
CREATE TABLE IF NOT EXISTS public.fitzpatrick_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fitzpatrick_type INTEGER NOT NULL CHECK (fitzpatrick_type BETWEEN 1 AND 6),
  category TEXT NOT NULL CHECK (category IN (
    'uv_protection', 'actives', 'procedures', 'supplements',
    'peptides', 'diet', 'light_therapy'
  )),
  adjustment_type TEXT NOT NULL,          -- "increase", "decrease", "avoid", "prefer", "add"
  target TEXT NOT NULL,                   -- what's being adjusted (e.g., "spf_level", "retinol_concentration")
  value TEXT NOT NULL,                    -- the adjusted value or recommendation
  rationale TEXT NOT NULL,
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.10 New Table: `medication_skin_effects`

Maps common medications to their skin effects and supplement interaction requirements.

```sql
CREATE TABLE IF NOT EXISTS public.medication_skin_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name TEXT NOT NULL,
  drug_class TEXT NOT NULL,              -- "ssri", "birth_control", "statin", "isotretinoin", "metformin", etc.
  -- Skin effects
  skin_effects TEXT[] DEFAULT '{}',      -- ["dryness", "photosensitivity", "melasma", "bruising"]
  skin_conditions_triggered TEXT[] DEFAULT '{}',  -- conditions this med can cause/worsen
  -- Supplement interactions
  nutrients_depleted TEXT[] DEFAULT '{}', -- ["coq10", "b12", "zinc", "folate"]
  supplements_to_add TEXT[] DEFAULT '{}', -- compensate for depletion
  supplements_to_avoid TEXT[] DEFAULT '{}', -- contraindicated with this med
  -- Wellness plan modifications
  plan_modifications JSONB DEFAULT '{}',  -- dietary, topical, lifestyle adjustments
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.11 New Table: `oral_microbiome_protocols`

Oral health protocols that impact skin (rosacea, perioral dermatitis, systemic inflammation).

```sql
CREATE TABLE IF NOT EXISTS public.oral_microbiome_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'probiotic', 'hygiene', 'supplement', 'lifestyle'
  )),
  target_conditions TEXT[] DEFAULT '{}',  -- skin conditions this helps
  instructions TEXT NOT NULL,
  oral_probiotic_strains TEXT[] DEFAULT '{}',  -- specific strains
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.12 New Table: `seasonal_adjustments`

Season- and climate-based plan modifications.

```sql
CREATE TABLE IF NOT EXISTS public.seasonal_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  climate TEXT NOT NULL CHECK (climate IN ('tropical', 'arid', 'temperate', 'continental', 'polar')),
  category TEXT NOT NULL CHECK (category IN (
    'hydration', 'actives', 'supplements', 'uv_defense',
    'diet', 'skincare_routine', 'environmental'
  )),
  adjustment TEXT NOT NULL,
  rationale TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.13 New Table: `gut_brain_skin_protocols`

Integrated gut-brain-skin axis protocols addressing the stress → dysbiosis → skin disease triad.

```sql
CREATE TABLE IF NOT EXISTS public.gut_brain_skin_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Which axis components this protocol addresses
  targets_gut BOOLEAN DEFAULT FALSE,
  targets_brain BOOLEAN DEFAULT FALSE,
  targets_skin BOOLEAN DEFAULT FALSE,
  -- Protocol details
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'probiotic', 'prebiotic', 'adaptogen', 'amino_acid',
    'lifestyle', 'supplement', 'combined'
  )),
  intervention_details JSONB DEFAULT '{}',
  -- The mechanism chain
  mechanism_chain TEXT,                  -- e.g., "stress → cortisol → gut permeability → LPS → inflammation → acne"
  conditions_treated TEXT[] DEFAULT '{}',
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.14 New Table: `sun_exposure_protocols`

Strategic sun exposure protocols — the nuanced approach (not just "avoid sun").

```sql
CREATE TABLE IF NOT EXISTS public.sun_exposure_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Timing
  time_window TEXT NOT NULL,            -- "6-8 AM", "8-10 AM", "4-6 PM"
  duration_minutes_min INTEGER NOT NULL, -- minimum effective exposure
  duration_minutes_max INTEGER NOT NULL, -- maximum safe exposure
  -- Exposure details
  body_areas_exposed TEXT[] DEFAULT '{}', -- ["arms", "legs", "chest", "back"]
  face_protection TEXT NOT NULL,         -- "none", "spf_30", "spf_50", "hat_only"
  sunscreen_on_body TEXT NOT NULL,       -- "none", "spf_15", "spf_30"
  sunglasses BOOLEAN DEFAULT FALSE,      -- FALSE = needed for circadian benefit
  -- Benefits
  d3_synthesis TEXT,                     -- "minimal", "low", "moderate", "high", "maximum"
  circadian_benefit TEXT,                -- "minimal", "low", "moderate", "high", "maximum"
  melatonin_impact TEXT,                 -- how this affects nighttime melatonin
  mitochondrial_benefit TEXT,            -- red/NIR exposure benefit
  nitric_oxide TEXT,                     -- NO release benefit
  serotonin_impact TEXT,                 -- mood/skin benefit
  -- Risk
  uv_risk TEXT NOT NULL CHECK (uv_risk IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
  photoaging_risk TEXT,
  cancer_risk TEXT,
  -- Fitzpatrick-specific durations
  fitzpatrick_duration JSONB DEFAULT '{}', -- {"I": 10, "II": 12, "III": 15, "IV": 20, "V": 25, "VI": 30}
  -- Conditions
  beneficial_for TEXT[] DEFAULT '{}',    -- conditions this helps
  contraindicated_for TEXT[] DEFAULT '{}', -- conditions where to avoid
  -- Evidence
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Seed Data

### 4.1 Peptides (30 entries)

#### Tier 1 — Topical, Well-Established

| ID | Name | Route | Evidence | Key Benefits |
|----|------|-------|----------|-------------|
| `ghk-cu` | GHK-Cu (Copper Tripeptide-1) | topical | A | Collagen synthesis, wound healing, anti-inflammatory, skin remodeling, antioxidant |
| `matrixyl` | Palmitoyl Pentapeptide-4 | topical | A | Collagen I/III stimulation, wrinkle reduction |
| `argireline` | Acetyl Hexapeptide-3 | topical | B | Mild muscle relaxation, expression line reduction |
| `snap-8` | Acetyl Octapeptide-3 | topical | B | Enhanced version of argireline, deeper wrinkle targeting |
| `pal-ghk` | Palmitoyl Tripeptide-1 | topical | B | Collagen stimulation, skin repair |
| `acetyl-tetrapeptide-5` | Acetyl Tetrapeptide-5 | topical | B | Anti-edema, dark circle reduction, barrier support |
| `pal-kttks` | Palmitoyl Tetrapeptide-7 | topical | B | Anti-inflammatory, reduces IL-6, skin firmness |
| `copper-peptide-complex` | Copper Peptide Complex | topical | A | Broad skin regeneration, anti-aging |

#### Tier 2 — Injectable, Widely Used (Not FDA-Approved for These Uses)

| ID | Name | Route | Evidence | Key Benefits |
|----|------|-------|----------|-------------|
| `bpc-157` | BPC-157 | injectable | B | Tissue repair, gut-skin axis, anti-inflammatory, wound healing |
| `tb-500` | TB-500 (Thymosin Beta-4) | injectable | B | Wound healing, tissue repair, anti-inflammatory, cell migration |
| `ghk-cu-inj` | GHK-Cu (Injectable) | injectable | B | Systemic anti-inflammatory, tissue remodeling, collagen |
| `cjc-1295` | CJC-1295 (with DAC) | injectable | B | GH secretion → collagen, skin thickness, hair growth |
| `ipamorelin` | Ipamorelin | injectable | B | GH release, collagen synthesis, sleep quality |
| `epithalon` | Epithalon (Epitalon) | injectable | C | Telomerase activation, anti-aging, cellular longevity |
| `melanotan-ii` | Melanotan II | injectable | C | Melanogenesis, UV protection (controversial, significant side effects) |
| `pt-141` | Bremelanotide (PT-141) | injectable | B | Melanocortin activation, skin pigmentation |
| `sermorelin` | Soremorelin | injectable | B | GH secretagogue, collagen, skin thickness |
| `aod-9604` | AOD-9604 | injectable | C | Fat metabolism, body composition, potential skin benefits |

#### Tier 3 — Research/Experimental

| ID | Name | Route | Evidence | Key Benefits |
|----|------|-------|----------|-------------|
| `foxo4-dri` | FOXO4-DRI | injectable | D | Senolytic — clears senescent cells, rejuvenation |
| `humanin` | Humanin | injectable | D | Mitochondrial protection, anti-apoptotic, cytoprotective |
| `selank` | Selank | nasal | C | Neuropeptide, stress/anxiety reduction, immune modulation |
| `semax` | Semax | nasal | C | Neuroprotective, BDNF-like activity, cognitive + anti-inflammatory |
| `dihexa` | Dihexa | oral/nasal | D | HGF mimetic, tissue repair, wound healing |
| `larazotide` | Larazotide Acetate | oral | B | Gut barrier integrity (tight junctions), gut-skin axis |
| `kpv` | Alpha-MSH KPV | oral/topical | C | Anti-inflammatory, melanocortin-derived, gut healing |
| `thymosin-alpha-1` | Thymosin Alpha-1 | injectable | B | Immune modulation, thymic function, anti-inflammatory |
| `ll-37` | LL-37 (Cathelicidin) | topical | C | Antimicrobial peptide, wound healing, skin barrier |
| `adipotide` | Adipotide | injectable | D | Fat reduction, body composition (research only) |

### 4.2 Diet Protocols (8 entries)

| ID | Name | Type | Mechanisms Targeted |
|----|------|------|-------------------|
| `low-gi-anti-inflammatory` | Low Glycemic Anti-Inflammatory | low_glycemic + anti_inflammatory | glycation, inflammation, oxidative_stress |
| `elimination-dairy-free` | Dairy-Free Elimination | elimination | hormonal, inflammatory, igf-1 |
| `elimination-gluten-free` | Gluten-Free Elimination | elimination | gut_permeability, inflammatory |
| `autoimmune-protocol` | Autoimmune Protocol (AIP) | autoimmune | immune_dysregulation, gut_permeability, inflammatory |
| `gut-healing-protocol` | Gut Healing Protocol | gut_healing | dysbiosis, gut_permeability, sibo |
| `hormone-balancing` | Hormone Balancing Diet | hormone_balancing | estrogen_dominance, insulin_resistance |
| `mediterranean-skin` | Mediterranean for Skin | mediterranean | oxidative_stress, inflammatory, cardiovascular |
| `ketogenic-metabolic` | Therapeutic Ketogenic | ketogenic | insulin_resistance, mitochondrial_dysfunction, neuroinflammation |

### 4.3 Supplement Protocols (expanded from 30 to 50+)

Add these to existing supplements table:

| ID | Name | Dosage | Evidence | Key Mechanisms |
|----|------|--------|----------|---------------|
| `berberine` | Berberine | 500mg 2-3x/day | A | AMPK activation, anti-glycation, anti-inflammatory, gut microbiome |
| `vitamin-d3` | Vitamin D3 | 2000-5000 IU/day | A | Barrier repair, immune modulation, anti-inflammatory |
| `dha-epa` | DHA + EPA (Omega-3) | 2-3g combined/day | A | Anti-inflammatory, cell membrane integrity, resolution of inflammation |
| `coq10` | CoQ10 (Ubiquinol) | 100-200mg/day | A | Mitochondrial support, antioxidant, energy production |
| `pqq` | PQQ (Pyrroloquinoline Quinone) | 10-20mg/day | B | Mitochondrial biogenesis, neuroprotection |
| `nmn` | NMN (Nicotinamide Mononucleotide) | 250-500mg/day | B | NAD+ precursor, cellular repair, sirtuin activation |
| `nr` | NR (Nicotinamide Riboside) | 300mg/day | B | NAD+ precursor, mitochondrial function |
| `glutathione` | Glutathione (Liposomal) | 250-500mg/day | A | Master antioxidant, detoxification, skin brightening |
| `nac` | N-Acetyl Cysteine | 600mg 2x/day | A | Glutathione precursor, mucolytic, antioxidant |
| `collagen-peptides` | Collagen Peptides (Type I/III) | 10-15g/day | A | Structural support, skin elasticity, hydration |
| `ashwagandha` | Ashwagandha (KSM-66) | 300-600mg/day | A | Cortisol reduction, stress adaptation, anti-inflammatory |
| `rhodiola` | Rhodiola Rosea | 200-400mg/day | B | Stress adaptation, fatigue reduction, cognitive |
| `curcumin` | Curcumin (Bioavailable) | 500-1000mg/day | A | Anti-inflammatory (NF-κB), antioxidant |
| `resveratrol` | Resveratrol (Trans-) | 250-500mg/day | B | Sirtuin activation, antioxidant, anti-inflammatory |
| `sulforaphane` | Sulforaphane | 10-30mg/day | A | Nrf2 activation, detoxification, antioxidant defense |
| `lactobacillus-rhamnosus` | L. Rhamnosus GG | 10-20B CFU/day | A | Gut-skin axis, acne/rosacea support |
| `saccharomyces-boulardii` | S. Boulardii | 250-500mg/day | A | Gut barrier, anti-inflammatory, C. diff prevention |
| `l-glutamine` | L-Glutamine | 5-10g/day | B | Gut barrier repair, intestinal permeability |
| `zinc` | Zinc (Picolinate) | 15-30mg/day | A | Immune function, wound healing, anti-inflammatory |
| `selenium` | Selenium (Selenomethionine) | 100-200mcg/day | B | Thyroid support, antioxidant (glutathione peroxidase) |
| `magnesium` | Magnesium (Glycinate/Threonate) | 200-400mg/day | A | Sleep, stress, 300+ enzymatic reactions |
| `probiotics-multi` | Multi-Strain Probiotic | 25-50B CFU/day | A | Gut-skin axis, immune modulation |
| `quercetin` | Quercetin | 500mg 2x/day | B | Senolytic, anti-inflammatory, mast cell stabilizer |
| `fisetin` | Fisetin | 100-500mg/day | B | Senolytic, anti-inflammatory, neuroprotective |

### 4.4 Psychodermatology Protocols (12 entries)

| ID | Name | Type | Evidence | Key Benefit |
|----|------|------|----------|-------------|
| `mbsr-skin` | Mindfulness-Based Stress Reduction (MBSR) | mindfulness | A | Reduces inflammatory markers, improves eczema/psoriasis flares |
| `cbt-acne` | CBT for Acne-Related Anxiety | cbt | A | Breaks stress-acne-anxiety cycle, reduces picking behaviors |
| `breathwork-478` | 4-7-8 Breathing Protocol | breathwork | B | Activates parasympathetic, reduces cortisol in 5 minutes |
| `box-breathing` | Box Breathing (Navy SEAL) | breathwork | B | Acute stress reduction, autonomic regulation |
| `body-scan` | Body Scan Meditation | meditation | B | Reduces muscle tension, improves sleep quality |
| `journaling-pm` | Evening Stress Journaling | journaling | B | Cognitive offloading, reduces rumination-related skin flares |
| `biofeedback-hrv` | HRV Biofeedback | biofeedback | A | Direct autonomic nervous system training, measurable stress reduction |
| `ashwagandha-psych` | Ashwagandha (KSM-66) for Stress-Skin | adaptogen | A | 300-600mg/day, reduces cortisol 28%, improves stress-mediated acne/eczema |
| `rhodiola-psych` | Rhodiola Rosea for Fatigue-Skin | adaptogen | B | 200-400mg/day, reduces fatigue-related skin dullness, HPA axis support |
| `l-theanine-psych` | L-Theanine for Anxiety-Skin | supplement | B | 200-400mg/day, promotes alpha brain waves, reduces stress without sedation |
| `magnesium-glycinate` | Magnesium Glycinate for Stress | supplement | A | 400mg before bed, calms nervous system, improves sleep-mediated repair |
| `therapy-referral` | Dermatologist + Therapist Referral | therapy_referral | A | For severe psychoderm conditions (dermatillomania, trichotillomania, severe anxiety) |

### 4.5 Post-Procedure Protocols (10 entries)

| ID | Procedure | Pre-Protocol | Post-Protocol (Key Points) |
|----|-----------|-------------|--------------------------|
| `post-microneedling` | Microneedling | Stop retinol 72h, no blood thinners 7d, no alcohol 48h | Hyaluronic acid + peptides day 1-3, resume actives day 7, SPF 50+ always |
| `post-chemical-peel` | Chemical Peel | Stop retinol 5-7d, no waxing 14d | Gentle cleanser only 48h, no picking, resume actives per peel depth (superficial=3d, medium=7d, deep=14d) |
| `post-laser-fraxel` | Fractal Laser | Stop retinol 14d, no sun exposure 30d | Cooling + barrier repair 7d, no actives 14d, aggressive SPF 60d |
| `post-laser-ipl` | IPL | No sun exposure 30d, no self-tanner 14d | Gentle care 48h, pigment may darken before flaking, SPF 50+ |
| `post-botox` | Botox/Dysport | No alcohol 48h, no blood thinners 7d | No lying flat 4h, no exercise 24h, no rubbing area 24h |
| `post-filler` | Dermal Filler | No alcohol 48h, no blood thinners 7d, Arnica 3d prior | Ice 10min on/off day 1, no exercise 24h, no dental work 2w, sleep elevated |
| `post-prp` | PRP (Vampire Facial) | No blood thinners 7d, no alcohol 48h | No makeup 24h, gentle care 48h, resume actives day 5-7 |
| `post-rf-microneedling` | RF Microneedling | Stop retinol 72h, no sun exposure 14d | Barrier repair 5d, no actives 7d, SPF 50+, possible swelling 48h |
| `post-hifu` | HIFU | No fillers in area 6mo | May be sore 48h, no NSAIDs, gradual improvement over 3-6 months |
| `post-thread-lift` | Thread Lift | No blood thinners 7d, no alcohol 48h | Sleep on back 7d, no wide mouth opening 2w, no dental work 2w |

### 4.6 Fitzpatrick Adjustments (30 entries, 5 per type)

| Type | UV Protection | Actives | Procedures | Supplements | Light Therapy |
|------|-------------|---------|------------|-------------|---------------|
| **I** (Always burns) | SPF 50+ daily, reapply 2h, avoid peak sun | Start low retinol (0.025%), gradual AHA introduction | Conservative laser settings, patch test everything | Extra vitamin D (5000 IU — low synthesis from avoidance) | Red light fine, UV caution |
| **II** (Usually burns) | SPF 50 daily, reapply 2h | Low-medium retinol (0.025-0.05%) | Standard settings, monitor for erythema | Vitamin D 4000 IU | Red light fine, UV caution |
| **III** (Sometimes burns) | SPF 30-50 daily | Medium retinol (0.05%), standard AHA | Standard settings | Vitamin D 3000 IU | Red light fine |
| **IV** (Rarely burns) | SPF 30 daily, focus on hyperpigmentation | Medium retinol (0.05-0.1%), watch for PIH | Careful with aggressive lasers, PIH risk | Vitamin D 2000-3000 IU | Red light fine |
| **V** (Very rarely burns) | SPF 30 daily, PIH prevention primary | Lower retinol start, mandelic > glycolic acid | Conservative laser, avoid aggressive fractional | Vitamin D 2000 IU | Red light fine |
| **VI** (Never burns) | SPF 30 daily, PIH/keloid awareness | Mandelic acid preferred, caution with all actives | Minimal laser, prefer chemical over light-based | Vitamin D 2000 IU | Red light fine |

### 4.7 Medication Skin Effects (15 entries)

| Drug Class | Example Meds | Skin Effects | Nutrients Depleted | Supplements to Add |
|-----------|-------------|-------------|-------------------|-------------------|
| **SSRI/SNRI** | Sertraline, Fluoxetine, Venlafaxine | Dryness, photosensitivity, bruising, sweating | Melatonin, CoQ10, B vitamins | CoQ10 200mg, B-complex, extra hydration |
| **Oral Contraceptives** | Ethinyl estradiol combos | Melasma, hyperpigmentation, increased clotting risk | B6, B12, folate, zinc, magnesium | B-complex, folate 800mcg, zinc 15mg |
| **Statins** | Atorvastatin, Rosuvastatin | Dryness, CoQ10 depletion → fatigue | CoQ10 (significant), vitamin D | CoQ10 200-300mg (critical), vitamin D 4000 IU |
| **Isotretinoin** | Accutane | Extreme dryness, chapped lips, sun sensitivity, joint pain | — | Omega-3 3g, vitamin E 400IU, glucosamine |
| **Metformin** | Glucophage | B12 depletion → pale/yellow skin, dryness | B12 (significant), folate, CoQ10 | B12 1000mcg sublingual, folate |
| **Antihistamines** | Cetirizine, Loratadine | Dryness (reduced histamine = reduced secretions) | — | Extra hydration, omega-3 |
| **Beta-Blockers** | Metoprolol, Atenolol | Psoriasis flares, cold extremities, hair loss | CoQ10 | CoQ10 200mg |
| **Corticosteroids** | Prednisone | Thinning skin, easy bruising, delayed wound healing, stretch marks | Calcium, vitamin D, potassium | Calcium 1000mg, vitamin D 5000 IU, potassium-rich foods |
| **Diuretics** | Furosemide, HCTZ | Dehydration, electrolyte imbalance → dull skin | Potassium, magnesium, sodium | Magnesium 400mg, potassium-rich foods |
| **NSAIDs** | Ibuprofen, Naproxen | GI permeability → systemic inflammation → skin flares | Folate, iron | Probiotics, L-glutamine 5g |
| **Thyroid Meds** | Levothyroxine | Dose-dependent: hyperthyroid = oily/sweaty; hypo = dry/pale | Calcium, iron | Take separately from thyroid med by 4h |
| **ACE Inhibitors** | Lisinopril | Cough → throat dryness, rare angioedema | Zinc | Zinc 15mg if chronic use |
| **Antibiotics** | Doxycycline, Minocycline | Photosensitivity, yeast overgrowth, gut disruption | B vitamins, probiotics | Probiotic 50B+ CFU (take 2h apart), B-complex |
| **GLP-1 Agonists** | Semaglutide, Tirzepatide | "Ozempic face" (volume loss), GI symptoms, dryness | B12, protein deficiency risk | B12 1000mcg, collagen 15g, protein focus |
| **Retinoids (systemic)** | Acitretin | Similar to isotretinoin but milder | — | Omega-3, vitamin E |

### 4.8 Oral Microbiome Protocols (6 entries)

| ID | Name | Type | Key Benefit |
|----|------|------|-------------|
| `oral-probiotic-lozenges` | Oral Probiotic Lozenges (L. reuteri, S. salivarius K12) | probiotic | Reduces oral inflammation → less rosacea/perioral dermatitis flares |
| `tongue-scraping` | Daily Tongue Scraping | hygiene | Removes bacterial biofilm, reduces systemic inflammatory load |
| `sls-free-toothpaste` | SLS-Free Toothpaste | hygiene | Reduces perioral irritation and mouth ulcers |
| `oil-pulling` | Oil Pulling (Coconut Oil, 10-15min) | lifestyle | Reduces oral bacteria load, anecdotal skin improvement |
| `oral-zinc` | Zinc for Oral Health | supplement | 15mg/day, immune function, wound healing, reduces oral bacteria |
| `oral-collagen` | Collagen for Gum Health | supplement | 10g/day, strengthens gum tissue, reduces inflammation |

### 4.9 Seasonal Adjustments (16 entries, 4 per season)

| Season | Hydration | Actives | UV Defense | Supplements |
|--------|-----------|---------|------------|-------------|
| **Summer** | +20% water target, electrolytes | Reduce retinol strength, increase AHA (sweat/exfoliation) | SPF 50+, reapply 2h, hat/sunglasses, avoid peak sun | Extra antioxidants (vitamin C, astaxanthin) |
| **Fall** | Return to baseline, transition moisture | Resume higher retinol, add vitamin C serum | Maintain SPF 30-50 | Shift to immune support (zinc, D3) |
| **Winter** | +30% target (dry air + heating), humidifier | Reduce AHA frequency, richer moisturizer, hyaluronic acid | SPF 30 (UV still present, especially at altitude) | Extra omega-3 (barrier support), vitamin D 5000 IU |
| **Spring** | +10% target, allergen awareness | Gradual retinol increase, add niacinamide | SPF 30-50, reapply as outdoor activity increases | Quercetin (antihistamine), probiotics (allergy-gut-skin) |

### 4.10 Gut-Brain-Skin Protocols (8 entries)

| ID | Name | Axes | Type | Mechanism Chain | Evidence |
|----|------|------|------|----------------|----------|
| `gbs-psychobiotic` | Psychobiotic Stack (L. rhamnosus + B. longum) | gut+brain+skin | probiotic | Stress → vagal tone ↓ → gut dysbiosis → LPS ↑ → inflammation → acne/eczema | A |
| `gbs-lglutamine-gut` | L-Glutamine Gut Repair | gut+skin | supplement | Stress → intestinal permeability → endotoxemia → systemic inflammation → skin | B |
| `gbs-ashwagandha-triad` | Ashwagandha (Gut-Brain-Skin) | brain+gut+skin | adaptogen | Cortisol ↓ → gut motility normalized → microbiome diversity ↑ → skin inflammation ↓ | A |
| `gbs-zinc-carnosine` | Zinc Carnosine (Gut Barrier) | gut+skin | supplement | Repairs tight junctions, reduces permeability, anti-inflammatory at gut level | B |
| `gbs-omega3-resolution` | Omega-3 Resolution Protocol (3g) | gut+brain+skin | supplement | EPA/DHA → specialized pro-resolving mediators → inflammation resolution at all 3 sites | A |
| `gbs-berberine-metabolic` | Berberine Metabolic Reset | gut+skin | supplement | AMPK activation → gut motility ↑ → SIBO reduction → skin clarity | A |
| `gbs-mindful-eating` | Mindful Eating Protocol | brain+gut | lifestyle | Vagal activation → improved digestion → nutrient absorption → skin nourishment | B |
| `gbs-combined-reset` | 21-Day Gut-Brain-Skin Reset | gut+brain+skin | combined | Full protocol: elimination diet + psychobiotic + adaptogen + sleep optimization | B |

### 4.11 Sun Exposure Protocols (6 entries)

| ID | Name | Time Window | Duration | Fitzpatrick Adjustments | UV Risk | Key Benefits | Evidence |
|----|------|-------------|----------|------------------------|---------|-------------|----------|
| `am-circadian-reset` | Morning Circadian Reset | 6-8 AM | 10-20 min | I: 10min, II: 12min, III: 15min, IV: 20min, V: 25min, VI: 30min | Very Low | Circadian rhythm setting, melatonin cascade, serotonin, red/NIR mitochondrial | A |
| `am-d3-synthesis` | Morning D3 Synthesis Window | 8-10 AM | 15-30 min | I: 15min, II: 15min, III: 20min, IV: 25min, V: 30min, VI: 30min | Low | Vitamin D3 production, NO release, circadian benefit, moderate UVB | A |
| `midday-d3-boost` | Midday D3 Boost (Controlled) | 10 AM-2 PM | 5-15 min | I: 5min, II: 8min, III: 10min, IV: 12min, V: 15min, VI: 15min | Moderate-High | Maximum D3 synthesis in shortest time, requires caution | A |
| `pm-red-nir` | Afternoon Red/NIR Exposure | 4-6 PM | 15-30 min | I-III: 15min, IV-VI: 25min | Low | Red/near-infrared mitochondrial support, NO release, low UV risk | B |
| `body-d3-protocol` | Body D3 Protocol (Face Protected) | 8-10 AM | 15-20 min | I: 15min, II: 15min, III: 20min, IV: 20min, V: 25min, VI: 25min | Low | D3 synthesis via arms/legs/back, face always protected with SPF | A |
| `weekend-extended` | Weekend Extended Exposure | 7-9 AM | 30-45 min | I: 30min, II: 30min, III: 35min, IV: 40min, V: 45min, VI: 45min | Low | Cumulative D3, circadian reset, mood, social outdoor activity | B |

---

## 5. API Endpoints

### 5.1 Generate Wellness Plan

```
POST /api/v1/wellness-plan/generate

Body: {
  user_id: string,
  include_biomarkers?: {
    hba1c?: number,
    vitamin_d_ng_ml?: number,
    omega3_index?: number,
    crp?: number,
    fasting_glucose?: number,
  },
  preferences?: {
    peptide_comfort_level?: "none" | "topical_only" | "open_to_injectable",
    budget?: "basic" | "moderate" | "unlimited",
    dietary_restrictions?: string[],
    current_supplements?: string[],
  }
}

Response: {
  plan_id: string,
  primary_goals: Goal[],
  diet_protocol: DietProtocol,
  supplement_stack: SupplementItem[],
  peptide_protocol: PeptideItem[],
  hydration_target: HydrationTarget,
  sleep_protocol: SleepProtocol,
  mitochondrial_support: MitochondrialSupport,
  glycation_score: GlycationScore,
  movement_protocol: MovementProtocol,
  stress_protocol: StressProtocol,
  environmental_defense: EnvironmentalDefense,
  light_therapy: LightTherapyProtocol,
  gut_skin_protocol: GutSkinProtocol,
  hormonal_protocol?: HormonalProtocol,
  psychoderm_protocol: PsychodermProtocol,       // NEW
  post_procedure_protocol?: PostProcedureProtocol, // NEW (if recent procedures)
  fitzpatrick_adjustments: FitzpatrickAdjustment[], // NEW
  medication_adjustments: MedicationAdjustment[],   // NEW (if medications listed)
  oral_microbiome_protocol: OralMicrobiomeProtocol, // NEW
  seasonal_adjustments: SeasonalAdjustment[],       // NEW
  gut_brain_skin_protocol: GutBrainSkinProtocol,    // NEW
  smoking_alcohol_protocol?: SmokingAlcoholProtocol, // NEW (if applicable)
  sun_exposure_protocol: SunExposureProtocol,        // NEW — strategic sun exposure by Fitzpatrick + time of day
  disclaimer: string,
  provider_recommendations: ProviderRecommendation[],
}
```

### 5.2 Get Active Plan

```
GET /api/v1/wellness-plan/active

Response: { plan: WellnessPlan, items: WellnessPlanItem[] }
```

### 5.3 Update Plan Item

```
PATCH /api/v1/wellness-plan/items/:itemId

Body: {
  completed_at?: string,
  skipped?: boolean,
  skip_reason?: string,
  user_notes?: string,
}
```

### 5.4 Get Daily Protocol

```
GET /api/v1/wellness-plan/daily

Response: {
  morning: WellnessPlanItem[],
  midday: WellnessPlanItem[],
  evening: WellnessPlanItem[],
  before_bed: WellnessPlanItem[],
  as_needed: WellnessPlanItem[],
}
```

### 5.5 Weekly Check-in

```
POST /api/v1/wellness-plan/checkin

Body: {
  plan_id: string,
  adherence_score: number,        -- 0-100
  energy_level: number,           -- 1-10
  skin_improvement: number,       -- 1-10
  side_effects?: string[],
  notes?: string,
}

Response: {
  checkin_id: string,
  adjustments: PlanAdjustment[],  -- Suggested changes based on adherence/results
  streak_days: number,
}
```

---

## 6. Plan Generation Algorithm

### 6.1 Input Processing

```
INPUTS:
├── Skin Analysis Results
│   ├── conditions[] (from photo analysis)
│   ├── severity per condition
│   ├── zones affected
│   └── fitzpatrick_type (1-6)
├── Lifestyle Questionnaire
│   ├── diet score (sugar, dairy, processed food)
│   ├── sleep score (hours, quality, consistency)
│   ├── stress score (level, triggers, management)
│   ├── UV score (exposure, sunscreen, tanning)
│   ├── water intake
│   ├── exercise frequency + type
│   ├── gut health symptoms
│   ├── hormonal status
│   ├── smoking status + history
│   ├── alcohol frequency + type + amount
│   ├── oral health status
│   ├── current medications[]
│   ├── recent procedures[] + timeline
│   ├── climate + season + altitude + humidity
│   └── psychoderm screening (stress-skin connection scores)
├── Biomarkers (optional)
│   ├── HbA1c → glycation risk
│   ├── Vitamin D → supplementation need
│   ├── Omega-3 Index → anti-inflammatory capacity
│   ├── CRP/hsCRP → systemic inflammation
│   └── Fasting glucose → metabolic health
├── User Preferences
│   ├── Peptide comfort level
│   ├── Budget
│   └── Dietary restrictions
└── Modifiers
    ├── Fitzpatrick type → UV, actives, procedure adjustments
    ├── Season + climate → hydration, actives, UV protocol
    ├── Medications → nutrient depletions, contraindications
    ├── Smoking → accelerated protocol (oxidative stress, collagen)
    ├── Alcohol → gut barrier, inflammation, nutrient depletion
    └── Recent procedures → post-procedure recovery overlay
```

### 6.2 Condition → Root Cause → Mechanism Mapping

```
Example: User has acne + premature aging

ACNE:
  → Root Causes: hormonal_imbalance, gut_dysbiosis, insulin_resistance
  → Mechanisms: inflammatory, hormonal (androgen excess), metabolic

PREMATURE AGING:
  → Root Causes: glycation, oxidative_stress, uv_damage
  → Mechanisms: metabolic (AGE formation), structural (collagen degradation)

COMBINED PROTOCOL:
  Diet: Low GI Anti-Inflammatory (targets glycation + insulin + inflammation)
  Supplements: Berberine (AMPK, anti-glycation) + Zinc (immune, wound healing)
              + Probiotics (gut-skin axis) + Collagen (structural)
  Peptides: GHK-Cu topical (collagen + anti-inflammatory)
  Sleep: Prioritize 7-9h (collagen synthesis peaks during deep sleep)
  Stress: Ashwagandha (cortisol → acne trigger)
```

### 6.3 Scoring & Prioritization

Each protocol item gets a **Relevance Score** (0-100):

```
Score = (condition_match × 0.4) + (root_cause_match × 0.3) +
        (mechanism_match × 0.2) + (evidence_level × 0.1)

Where:
- condition_match: does this item directly address a detected condition?
- root_cause_match: does this item target an identified root cause?
- mechanism_match: does this item modulate a relevant mechanism?
- evidence_level: A=10, B=7, C=4, D=2

Items below threshold (score < 30) are excluded.
Top items per category are included in the plan.
```

---

## 7. UI Components

### 7.1 Wellness Plan Page (`/wellness-plan`)

**Layout:** Tabbed interface with overview + individual sections.

```
┌─────────────────────────────────────────────────────────────┐
│  Your Skin Wellness Plan                    [Customize] [Share] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ 🎯 PRIMARY GOALS                              │           │
│  │                                               │           │
│  │ 1. Reduce glycation damage (acne + aging)     │           │
│  │ 2. Lower systemic inflammation (rosacea)      │           │
│  │ 3. Support collagen synthesis (aging)         │           │
│  │ 4. Optimize gut-skin axis (acne + eczema)     │           │
│  │                                               │           │
│  │ Based on: Skin scan + lifestyle + biomarkers  │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  [Diet] [Supplements] [Peptides] [Sleep] [Movement] [More]  │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ 🍽️ DIET PROTOCOL                              │           │
│  │ Low Glycemic Anti-Inflammatory                │           │
│  │                                               │           │
│  │ ✅ EAT: Leafy greens, fatty fish, berries,    │           │
│  │    olive oil, nuts, seeds, avocado, sweet      │           │
│  │    potatoes, quinoa, legumes                   │           │
│  │                                               │           │
│  │ ❌ AVOID: White bread, pasta, rice, sugar,     │           │
│  │    processed snacks, fried foods, soda,        │           │
│  │    high-glycemic fruits (watermelon, pineapple)│           │
│  │                                               │           │
│  │ WHY: Low GI diet reduces AGE formation by     │           │
│  │ ~30%. Glycation cross-links collagen →         │           │
│  │ stiffness, wrinkles, loss of elasticity.       │           │
│  │                                               │           │
│  │ [View Sample Meals] [Full Food List]          │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ 💊 SUPPLEMENT STACK                           │           │
│  │                                               │           │
│  │ MORNING          │ EVENING         │ WITH MEALS│           │
│  │ Berberine 500mg  │ CoQ10 200mg     │ DHA/EPA   │           │
│  │ Vitamin D3 4000IU│ Magnesium 400mg │ 2g        │           │
│  │ NMN 250mg        │ NAC 600mg       │           │           │
│  │                  │                 │           │           │
│  │ [View All 8] [Customize] [Check Interactions] │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ 🧬 PEPTIDE PROTOCOL                           │           │
│  │                                               │           │
│  │ TOPICAL (Tier 1 — Well-Established)           │           │
│  │ • GHK-Cu serum — 1-2% concentration, PM      │           │
│  │   Collagen synthesis + anti-inflammatory      │           │
│  │   Evidence: A | Cost: ~$30/mo                 │           │
│  │                                               │           │
│  │ ADVANCED (Tier 2 — Consult Provider)          │           │
│  │ • BPC-157 — 250mcg 2x/day, subcutaneous      │           │
│  │   Tissue repair + gut-skin axis               │           │
│  │   Evidence: B | ⚠️ Not FDA-approved          │           │
│  │   [Find a Peptide Clinic Near You]            │           │
│  │                                               │           │
│  │ [View All] [Customize Stack]                  │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ 📊 GLYCATION SCORE                            │           │
│  │                                               │           │
│  │ Your estimated glycation risk: MODERATE       │           │
│  │ ████████████░░░░░░░░ 60/100                   │           │
│  │                                               │           │
│  │ Factors:                                      │           │
│  │ • Diet sugar: HIGH (+20)                      │           │
│  │ • HbA1c: not provided (+15 for estimated)     │           │
│  │ • Age-related: 28 (+10)                       │           │
│  │ • UV exposure: MODERATE (+15)                 │           │
│  │                                               │           │
│  │ Your plan targets this with:                  │           │
│  │ • Low GI diet (-30% AGE formation)            │           │
│  │ • Berberine (AMPK activation, glucose control)│           │
│  │ • Vitamin D (barrier repair, anti-inflammatory)│           │
│  │                                               │           │
│  │ [Connect CGM for Real-Time Data]              │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Daily Protocol View (`/wellness-plan/daily`)

**Mobile-first.** Shows today's protocol organized by time of day.

```
┌─────────────────────────────────┐
│  Today's Protocol     June 13   │
│  Streak: 🔥 7 days              │
├─────────────────────────────────┤
│                                 │
│  ☀️ MORNING                     │
│  ☐ Berberine 500mg (before bfast)│
│  ☐ Vitamin D3 4000IU (w/ food) │
│  ☐ NMN 250mg (empty stomach)   │
│  ☐ Collagen 10g (in coffee)    │
│  ☐ 16oz water                  │
│                                 │
│  🌤️ MIDDAY                      │
│  ☐ Berberine 500mg (before lunch)│
│  ☐ DHA/EPA 1g (with food)      │
│  ☐ 16oz water                  │
│  ☐ 10min walk (circulation)    │
│                                 │
│  🌙 EVENING                     │
│  ☐ Berberine 500mg (before dinner)│
│  ☐ CoQ10 200mg (with food)     │
│  ☐ NAC 600mg                   │
│  ☐ Magnesium 400mg             │
│  ☐ GHK-Cu serum (topical)      │
│                                 │
│  😴 BEFORE BED                  │
│  ☐ Dim lights (circadian)      │
│  ☐ No screens 30min before bed │
│  ☐ Room temp 65-68°F           │
│                                 │
│  [Mark All Complete] [Notes]    │
└─────────────────────────────────┘
```

### 7.3 Components to Build

| Component | Path | Description |
|-----------|------|-------------|
| `WellnessPlanOverview` | `/components/wellness/PlanOverview.tsx` | Goals + summary cards |
| `DietProtocolCard` | `/components/wellness/DietProtocolCard.tsx` | Include/avoid foods + rationale |
| `SupplementStack` | `/components/wellness/SupplementStack.tsx` | Timed supplement list with interactions |
| `PeptideProtocol` | `/components/wellness/PeptideProtocol.tsx` | Tiered peptide display with disclaimers |
| `HydrationTracker` | `/components/wellness/HydrationTracker.tsx` | Daily water target + tracker |
| `SleepProtocol` | `/components/wellness/SleepProtocol.tsx` | Sleep optimization checklist |
| `GlycationScore` | `/components/wellness/GlycationScore.tsx` | Visual score + contributing factors |
| `MovementProtocol` | `/components/wellness/MovementProtocol.tsx` | Exercise recommendations by skin goal |
| `DailyProtocolView` | `/components/wellness/DailyProtocol.tsx` | Time-of-day protocol with checkboxes |
| `WeeklyCheckin` | `/components/wellness/WeeklyCheckin.tsx` | Adherence + adjustment flow |
| `PlanCustomizer` | `/components/wellness/PlanCustomizer.tsx` | Edit/add/remove items |
| `ProviderRecommendations` | `/components/wellness/ProviderRecs.tsx` | When to escalate, find a provider |
| `PsychodermProtocol` | `/components/wellness/PsychodermProtocol.tsx` | Stress-skin interventions, breathwork, mindfulness, adaptogens |
| `PostProcedureCard` | `/components/wellness/PostProcedureCard.tsx` | Procedure recovery timeline + pre/post protocol |
| `FitzpatrickAdjustments` | `/components/wellness/FitzpatrickAdjustments.tsx` | Skin type-specific modifications |
| `MedicationInteractions` | `/components/wellness/MedicationInteractions.tsx` | Medication → nutrient depletion + plan adjustments |
| `OralMicrobiomeCard` | `/components/wellness/OralMicrobiomeCard.tsx` | Oral health → skin connection + protocols |
| `SeasonalAdjustments` | `/components/wellness/SeasonalAdjustments.tsx` | Season/climate-based plan modifications |
| `GutBrainSkinTriad` | `/components/wellness/GutBrainSkinTriad.tsx` | Integrated gut-brain-skin visualization + protocol |
| `SmokingAlcoholImpact` | `/components/wellness/SmokingAlcoholImpact.tsx` | Impact visualization + cessation/reduction protocol |
| `SunExposureProtocol` | `/components/wellness/SunExposureProtocol.tsx` | Strategic sun exposure by time of day + Fitzpatrick, circadian/D3/mitochondrial benefits, risk/benefit visualization |
| `PlanTabs` | `/components/wellness/PlanTabs.tsx` | Tabbed navigation: [Diet] [Supplements] [Peptides] [Sleep] [Movement] [Stress] [Environment] [Recovery] [More] |

---

## 8. Disclaimers & Compliance

### 8.1 Tier-Based Disclaimers

**Tier 1 (Topical peptides, supplements, diet):**
> "These recommendations are based on published research and are intended for informational purposes. They are not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before starting any new supplement regimen."

**Tier 2 (Injectable peptides, advanced protocols):**
> "⚠️ These peptides are not FDA-approved for the uses described. They are widely used in clinical and longevity settings but remain in a regulatory gray area. SKINgenius provides this information for educational purposes only. Consult a licensed healthcare provider, ideally one experienced in peptide therapy, before use."

**Tier 3 (Research peptides):**
> "🔬 These compounds are classified as research peptides. They are not approved for human use by the FDA. This information is provided for educational and research purposes only. Do not use without supervision of a qualified healthcare professional."

### 8.2 Global Disclaimer (Plan-Level)

> "This wellness plan is generated by AI based on your skin analysis, lifestyle data, and published research. It is not medical advice. Always consult a qualified healthcare provider before making changes to your diet, supplement, or medication regimen. SKINgenius does not sell peptides or supplements — we provide information to help you make informed decisions with your healthcare team."

---

## 9. Integration Points

### 9.1 Existing Systems

| System | Integration |
|--------|------------|
| **Skin Analysis** | Conditions → root causes → plan generation trigger |
| **Lifestyle Questionnaire** | Existing data feeds into plan; extended fields for new inputs |
| **Supplements Table** | Referenced by supplement stack; extended with protocols |
| **Root Causes / Mechanisms** | Drive condition-to-intervention mapping |
| **User Profile** | Hormonal status, age, Fitzpatrick type influence plan |
| **Photo Journal** | Progress photos tied to plan start date for before/after |

### 9.2 Future Integrations

| System | Integration |
|--------|------------|
| **Wearables** | Oura/Apple Watch/Whoop → sleep, HRV, activity → plan adjustment |
| **CGM** | Dexcom/Libre → real-time glucose → glycation score |
| **Lab Results** | Manual entry or API → biomarker refinement |
| **Telehealth** | Provider referral for Tier 2+ peptides |
| **E-commerce** | Affiliate links for supplements/peptides (revenue stream) |

---

## 10. Revenue Implications

| Tier | Feature | Pricing |
|------|---------|---------|
| **Free** | Basic plan (diet + sleep + hydration + top 3 supplements) | $0 |
| **Pro** | Full plan (all supplements + peptides + protocols + tracking) | $9.99/mo |
| **Pro+** | + Biomarker integration + wearable sync + weekly adjustments | $19.99/mo |
| **Provider** | White-label plans for clinics, custom protocols, patient management | $99/mo |

**Affiliate Revenue:** Supplement/peptide recommendations can include affiliate links to vetted vendors (estimated 10-20% commission on $50-200/mo per user).

---

## 11. Build Phases

### Phase 1 — MVP (2 weeks)
- [ ] Database schema (all 13 tables)
- [ ] Seed data (30 peptides, 8 diet protocols, 24 supplement protocols, 12 psychoderm protocols, 10 post-procedure protocols, 15 medication effects, 6 oral microbiome, 8 gut-brain-skin, Fitzpatrick adjustments, seasonal adjustments)
- [ ] Plan generation API (`POST /api/v1/wellness-plan/generate`) with all 8 new factors
- [ ] Basic plan overview UI (goals + diet + supplement stack)
- [ ] Daily protocol view (mobile-first)

### Phase 2 — Full Plan UI (1 week)
- [ ] Peptide protocol section with tiered display
- [ ] Glycation score visualization
- [ ] Sleep + movement + stress protocol cards
- [ ] Environmental defense section
- [ ] Psychodermatology protocol card (stress-skin interventions)
- [ ] Post-procedure recovery card (if applicable)
- [ ] Medication interaction warnings
- [ ] Plan customization (add/remove items)

### Phase 3 — Tracking & Engagement (1 week)
- [ ] Daily protocol checkboxes (mark items complete)
- [ ] Weekly check-in flow
- [ ] Progress tracking (streaks, adherence %)
- [ ] Photo comparison tied to plan start

### Phase 4 — Advanced (2 weeks)
- [ ] Biomarker input flow (manual entry)
- [ ] Wearable integration (Oura, Apple HealthKit)
- [ ] Dynamic plan adjustments based on adherence + results
- [ ] Provider referral network
- [ ] Affiliate link integration
- [ ] Seasonal auto-adjustments (location + season detection)
- [ ] Gut-brain-skin triad visualization
- [ ] Fitzpatrick-specific plan overlays

---

## 12. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Plan generation rate | 60% of scan users generate a plan | Analytics |
| Daily protocol adherence | 70%+ items completed daily | Tracking data |
| 30-day retention | 40% still using plan after 30 days | Cohort analysis |
| Pro conversion | 15% of free plan users upgrade | Revenue |
| NPS | 50+ (skin improvement perceived) | Survey |
| Provider referrals | 10% of Tier 2+ users seek provider | Click tracking |

---

## 13. Open Questions

1. **Peptide sourcing:** Do we link to specific vendors (compounding pharmacies, research vendors)? Or keep it educational only?
2. **Provider network:** Build our own? Partner with existing telehealth? Or just link to directories?
3. **CGM integration:** How do we handle real-time glucose data? Privacy implications?
4. **Regulatory review:** Should we have a medical advisor review all peptide/supplement recommendations before launch?
5. **Gamification:** Streaks, badges, milestones — how deep do we go?
6. **Smoking/alcohol sensitivity:** How do we handle sensitive lifestyle questions without alienating users? Opt-in vs. required?
7. **Medication accuracy:** How do we verify medication list? Free text vs. searchable database? Risk of incorrect entries?
8. **Post-procedure timing:** How precise do we need to be? User-reported dates vs. provider-confirmed?
9. **Psychoderm referrals:** Do we partner with therapists specializing in psychodermatology? Build a directory?
10. **Seasonal automation:** Auto-detect season from location + date? Or let user override?
11. **Fitzpatrick accuracy:** Self-reported vs. AI-detected from scan? Risk of misclassification?
12. **Oral microbiome credibility:** This is emerging science — how much weight do we give it? Include with caveats or defer?
13. **Gut-brain-skin triad complexity:** This is the most scientifically complex protocol — how do we simplify for users without losing accuracy?

---

*This spec lives at `skingenius/specs/WELLNESS-PLAN-SPEC.md`. Update as decisions are made.*
