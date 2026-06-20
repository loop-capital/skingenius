-- ============================================================
-- SKINgenius — WELLNESS PLAN SCHEMA (Phase 1 MVP)
-- 14 new tables + lifestyle_responses extensions
-- Idempotent. Safe to re-run. ORDER MATTERS.
-- Pattern follows FIXED-SETUP.sql
-- ============================================================

-- ============================================================
-- STEP 1: lifestyle_responses extensions
-- ============================================================

ALTER TABLE public.lifestyle_responses
  ADD COLUMN IF NOT EXISTS exercise_frequency TEXT,
  ADD COLUMN IF NOT EXISTS exercise_type TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sauna_frequency TEXT,
  ADD COLUMN IF NOT EXISTS cold_exposure BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS red_light_therapy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gut_health_symptoms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hormonal_status TEXT CHECK (hormonal_status IN ('premenopausal','perimenopausal','menopausal','trt','none')),
  ADD COLUMN IF NOT EXISTS wearable_device TEXT,
  ADD COLUMN IF NOT EXISTS indoor_air_quality TEXT CHECK (indoor_air_quality IN ('good','moderate','poor')),
  ADD COLUMN IF NOT EXISTS water_source TEXT CHECK (water_source IN ('tap','filtered','reverse_osmosis','spring')),
  ADD COLUMN IF NOT EXISTS smoking_status TEXT CHECK (smoking_status IN ('never','former','current','social')),
  ADD COLUMN IF NOT EXISTS smoking_years NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS alcohol_frequency TEXT CHECK (alcohol_frequency IN ('never','rare','weekly','daily','heavy_daily')),
  ADD COLUMN IF NOT EXISTS alcohol_type TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS alcohol_drinks_per_week NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS oral_health TEXT CHECK (oral_health IN ('good','fair','poor')),
  ADD COLUMN IF NOT EXISTS oral_symptoms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS current_medications TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recent_procedures TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS procedure_timeline TEXT,
  ADD COLUMN IF NOT EXISTS climate TEXT CHECK (climate IN ('tropical','arid','temperate','continental','polar')),
  ADD COLUMN IF NOT EXISTS season TEXT CHECK (season IN ('spring','summer','fall','winter')),
  ADD COLUMN IF NOT EXISTS altitude TEXT CHECK (altitude IN ('low','moderate','high')),
  ADD COLUMN IF NOT EXISTS humidity_level TEXT CHECK (humidity_level IN ('very_dry','dry','moderate','humid','very_humid')),
  ADD COLUMN IF NOT EXISTS psychoderm_screening JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS morning_sun_exposure TEXT CHECK (morning_sun_exposure IN ('never','rare','sometimes','daily')),
  ADD COLUMN IF NOT EXISTS morning_sun_minutes NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS peak_sun_exposure TEXT CHECK (peak_sun_exposure IN ('minimal','moderate','frequent','occupational')),
  ADD COLUMN IF NOT EXISTS sunscreen_habit TEXT CHECK (sunscreen_habit IN ('never','face_only','daily_face','full_body','reapply_2h')),
  ADD COLUMN IF NOT EXISTS sun_exposure_body_areas TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS outdoor_activity_time TEXT,
  ADD COLUMN IF NOT EXISTS vitamin_d_supplement BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vitamin_d_level NUMERIC(6,2);

-- ============================================================
-- STEP 2: New wellness plan tables
-- ============================================================

-- 2.1 peptides
CREATE TABLE IF NOT EXISTS public.peptides (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  administration_route TEXT NOT NULL CHECK (administration_route IN ('topical','injectable','oral','nasal')),
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  regulatory_status TEXT NOT NULL DEFAULT 'not_fda_approved' CHECK (regulatory_status IN ('fda_approved','cosmetic_grade','not_fda_approved','research_only')),
  dosage TEXT,
  frequency TEXT,
  cycle_protocol TEXT,
  skin_benefits TEXT[] DEFAULT '{}',
  longevity_benefits TEXT[] DEFAULT '{}',
  mechanisms_of_action TEXT[] DEFAULT '{}',
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  evidence_notes TEXT,
  key_studies TEXT[] DEFAULT '{}',
  interactions TEXT[] DEFAULT '{}',
  contraindications TEXT[] DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  pregnancy_safe TEXT DEFAULT 'unknown',
  conditions_treated TEXT[] DEFAULT '{}',
  root_causes_targeted TEXT[] DEFAULT '{}',
  mechanisms_targeted TEXT[] DEFAULT '{}',
  sourcing_notes TEXT,
  estimated_cost_monthly NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 wellness_plans
CREATE TABLE IF NOT EXISTS public.wellness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'auto' CHECK (plan_type IN ('auto','custom','provider')),
  skin_conditions TEXT[] DEFAULT '{}',
  root_causes TEXT[] DEFAULT '{}',
  metabolic_risks TEXT[] DEFAULT '{}',
  lifestyle_scores JSONB DEFAULT '{}',
  hba1c NUMERIC(4,2),
  vitamin_d_ng_ml NUMERIC(6,2),
  omega3_index NUMERIC(4,2),
  crp NUMERIC(6,3),
  fasting_glucose NUMERIC(5,1),
  hscrp NUMERIC(6,3),
  cortisol NUMERIC(5,2),
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
  active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  notes TEXT,
  provider_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 wellness_plan_items
CREATE TABLE IF NOT EXISTS public.wellness_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.wellness_plans(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'diet','supplement','peptide','hydration','sleep',
    'exercise','stress','environment','light_therapy',
    'gut_health','hormonal','detox','mitochondrial',
    'psychoderm','post_procedure','oral_microbiome',
    'medication_adjustment','seasonal','gut_brain_skin',
    'smoking_alcohol','fitzpatrick','sun_exposure'
  )),
  item_type TEXT NOT NULL CHECK (item_type IN ('daily','weekly','as_needed','one_time')),
  title TEXT NOT NULL,
  description TEXT,
  dosage TEXT,
  timing TEXT,
  frequency TEXT,
  supplement_id TEXT REFERENCES public.supplements(id),
  peptide_id TEXT REFERENCES public.peptides(id),
  condition_slug TEXT REFERENCES public.skin_conditions(slug),
  root_cause_id TEXT REFERENCES public.root_causes(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  user_notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 diet_protocols
CREATE TABLE IF NOT EXISTS public.diet_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'low_glycemic','anti_inflammatory','elimination','ketogenic',
    'mediterranean','autoimmune','gut_healing','hormone_balancing'
  )),
  foods_include TEXT[] DEFAULT '{}',
  foods_avoid TEXT[] DEFAULT '{}',
  food_groups_include TEXT[] DEFAULT '{}',
  food_groups_avoid TEXT[] DEFAULT '{}',
  target_mechanisms TEXT[] DEFAULT '{}',
  target_root_causes TEXT[] DEFAULT '{}',
  target_conditions TEXT[] DEFAULT '{}',
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy','moderate','challenging')),
  meal_examples JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 supplement_protocols
CREATE TABLE IF NOT EXISTS public.supplement_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id TEXT REFERENCES public.supplements(id) NOT NULL,
  timing TEXT,
  cycling TEXT,
  duration_weeks INTEGER,
  stack_with TEXT[] DEFAULT '{}',
  avoid_with TEXT[] DEFAULT '{}',
  condition_slug TEXT REFERENCES public.skin_conditions(slug),
  adjusted_dosage TEXT,
  rationale TEXT,
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 psychoderm_protocols
CREATE TABLE IF NOT EXISTS public.psychoderm_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'mindfulness','cbt','biofeedback','breathwork',
    'meditation','journaling','therapy_referral','adaptogen'
  )),
  conditions_treated TEXT[] DEFAULT '{}',
  stress_triggers TEXT[] DEFAULT '{}',
  duration_minutes INTEGER,
  frequency TEXT,
  instructions TEXT,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  dosage TEXT,
  interactions TEXT[] DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 post_procedure_protocols
CREATE TABLE IF NOT EXISTS public.post_procedure_protocols (
  id TEXT PRIMARY KEY,
  procedure_type TEXT NOT NULL CHECK (procedure_type IN (
    'microneedling','chemical_peel','laser_fraxel','laser_ipl',
    'botox','filler','prp','rf_microneedling','hifu',
    'dermaplaning','microdermabrasion','thread_lift'
  )),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pre_protocol JSONB DEFAULT '{}',
  post_protocol JSONB DEFAULT '{}',
  supplements_to_avoid TEXT[] DEFAULT '{}',
  supplements_to_add TEXT[] DEFAULT '{}',
  actives_to_avoid TEXT[] DEFAULT '{}',
  actives_to_resume_timing TEXT,
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 fitzpatrick_adjustments
CREATE TABLE IF NOT EXISTS public.fitzpatrick_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fitzpatrick_type INTEGER NOT NULL CHECK (fitzpatrick_type BETWEEN 1 AND 6),
  category TEXT NOT NULL CHECK (category IN (
    'uv_protection','actives','procedures','supplements',
    'peptides','diet','light_therapy'
  )),
  adjustment_type TEXT NOT NULL,
  target TEXT NOT NULL,
  value TEXT NOT NULL,
  rationale TEXT NOT NULL,
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 medication_skin_effects
CREATE TABLE IF NOT EXISTS public.medication_skin_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name TEXT NOT NULL,
  drug_class TEXT NOT NULL,
  skin_effects TEXT[] DEFAULT '{}',
  skin_conditions_triggered TEXT[] DEFAULT '{}',
  nutrients_depleted TEXT[] DEFAULT '{}',
  supplements_to_add TEXT[] DEFAULT '{}',
  supplements_to_avoid TEXT[] DEFAULT '{}',
  plan_modifications JSONB DEFAULT '{}',
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 oral_microbiome_protocols
CREATE TABLE IF NOT EXISTS public.oral_microbiome_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'probiotic','hygiene','supplement','lifestyle'
  )),
  target_conditions TEXT[] DEFAULT '{}',
  instructions TEXT NOT NULL,
  oral_probiotic_strains TEXT[] DEFAULT '{}',
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 seasonal_adjustments
CREATE TABLE IF NOT EXISTS public.seasonal_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL CHECK (season IN ('spring','summer','fall','winter')),
  climate TEXT NOT NULL CHECK (climate IN ('tropical','arid','temperate','continental','polar')),
  category TEXT NOT NULL CHECK (category IN (
    'hydration','actives','supplements','uv_defense',
    'diet','skincare_routine','environmental'
  )),
  adjustment TEXT NOT NULL,
  rationale TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high','medium','low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 gut_brain_skin_protocols
CREATE TABLE IF NOT EXISTS public.gut_brain_skin_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  targets_gut BOOLEAN DEFAULT FALSE,
  targets_brain BOOLEAN DEFAULT FALSE,
  targets_skin BOOLEAN DEFAULT FALSE,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'probiotic','prebiotic','adaptogen','amino_acid',
    'lifestyle','supplement','combined'
  )),
  intervention_details JSONB DEFAULT '{}',
  mechanism_chain TEXT,
  conditions_treated TEXT[] DEFAULT '{}',
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 sun_exposure_protocols
CREATE TABLE IF NOT EXISTS public.sun_exposure_protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  time_window TEXT NOT NULL,
  duration_minutes_min INTEGER NOT NULL,
  duration_minutes_max INTEGER NOT NULL,
  body_areas_exposed TEXT[] DEFAULT '{}',
  face_protection TEXT NOT NULL,
  sunscreen_on_body TEXT NOT NULL,
  sunglasses BOOLEAN DEFAULT FALSE,
  d3_synthesis TEXT,
  circadian_benefit TEXT,
  melatonin_impact TEXT,
  mitochondrial_benefit TEXT,
  nitric_oxide TEXT,
  serotonin_impact TEXT,
  uv_risk TEXT NOT NULL CHECK (uv_risk IN ('very_low','low','moderate','high','very_high')),
  photoaging_risk TEXT,
  cancer_risk TEXT,
  fitzpatrick_duration JSONB DEFAULT '{}',
  beneficial_for TEXT[] DEFAULT '{}',
  contraindicated_for TEXT[] DEFAULT '{}',
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 3: Indexes for common query patterns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_peptides_conditions ON public.peptides USING GIN (conditions_treated);
CREATE INDEX IF NOT EXISTS idx_peptides_tier ON public.peptides(tier);
CREATE INDEX IF NOT EXISTS idx_peptides_evidence ON public.peptides(evidence_level);
CREATE INDEX IF NOT EXISTS idx_wellness_plans_user ON public.wellness_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_plans_active ON public.wellness_plans(user_id, active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_plan_items_plan_id ON public.wellness_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_category ON public.wellness_plan_items(plan_id, category);
CREATE INDEX IF NOT EXISTS idx_diet_protocols_mechanisms ON public.diet_protocols USING GIN (target_mechanisms);
CREATE INDEX IF NOT EXISTS idx_diet_protocols_conditions ON public.diet_protocols USING GIN (target_conditions);
CREATE INDEX IF NOT EXISTS idx_supplement_protocols_supplement ON public.supplement_protocols(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_protocols_condition ON public.supplement_protocols(condition_slug);
CREATE INDEX IF NOT EXISTS idx_psychoderm_conditions ON public.psychoderm_protocols USING GIN (conditions_treated);
CREATE INDEX IF NOT EXISTS idx_post_procedure_type ON public.post_procedure_protocols(procedure_type);
CREATE INDEX IF NOT EXISTS idx_fitzpatrick_type ON public.fitzpatrick_adjustments(fitzpatrick_type);
CREATE INDEX IF NOT EXISTS idx_medication_effects_name ON public.medication_skin_effects(medication_name);
CREATE INDEX IF NOT EXISTS idx_medication_effects_class ON public.medication_skin_effects(drug_class);
CREATE INDEX IF NOT EXISTS idx_seasonal_season_climate ON public.seasonal_adjustments(season, climate);
CREATE INDEX IF NOT EXISTS idx_gut_brain_conditions ON public.gut_brain_skin_protocols USING GIN (conditions_treated);
CREATE INDEX IF NOT EXISTS idx_sun_exposure_risk ON public.sun_exposure_protocols(uv_risk);
CREATE INDEX IF NOT EXISTS idx_sun_exposure_beneficial ON public.sun_exposure_protocols USING GIN (beneficial_for);

-- ============================================================
-- STEP 4: RLS Policies
-- ============================================================

ALTER TABLE public.peptides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychoderm_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_procedure_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitzpatrick_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_skin_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oral_microbiome_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gut_brain_skin_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sun_exposure_protocols ENABLE ROW LEVEL SECURITY;

-- Reference tables: public read
CREATE POLICY "Anyone can view peptides" ON public.peptides FOR SELECT USING (true);
CREATE POLICY "Anyone can view diet_protocols" ON public.diet_protocols FOR SELECT USING (true);
CREATE POLICY "Anyone can view supplement_protocols" ON public.supplement_protocols FOR SELECT USING (true);
CREATE POLICY "Anyone can view psychoderm_protocols" ON public.psychoderm_protocols FOR SELECT USING (true);
CREATE POLICY "Anyone can view post_procedure_protocols" ON public.post_procedure_protocols FOR SELECT USING (true);
CREATE POLICY "Anyone can view fitzpatrick_adjustments" ON public.fitzpatrick_adjustments FOR SELECT USING (true);
CREATE POLICY "Anyone can view medication_skin_effects" ON public.medication_skin_effects FOR SELECT USING (true);
CREATE POLICY "Anyone can view oral_microbiome_protocols" ON public.oral_microbiome_protocols FOR SELECT USING (true);
CREATE POLICY "Anyone can view seasonal_adjustments" ON public.seasonal_adjustments FOR SELECT USING (true);
CREATE POLICY "Anyone can view gut_brain_skin_protocols" ON public.gut_brain_skin_protocols FOR SELECT USING (true);
CREATE POLICY "Anyone can view sun_exposure_protocols" ON public.sun_exposure_protocols FOR SELECT USING (true);

-- User-scoped tables
CREATE POLICY "Users can view own wellness_plans" ON public.wellness_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellness_plans" ON public.wellness_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wellness_plans" ON public.wellness_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own plan items" ON public.wellness_plan_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.wellness_plans WHERE id = wellness_plan_items.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own plan items" ON public.wellness_plan_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.wellness_plans WHERE id = wellness_plan_items.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own plan items" ON public.wellness_plan_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.wellness_plans WHERE id = wellness_plan_items.plan_id AND user_id = auth.uid()));
