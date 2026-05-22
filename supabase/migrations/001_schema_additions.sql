
-- ============================================
-- SKINgenius Schema Additions v1.1
-- Root-Cause Layer + Recommendation Engine + Basys Health Integration
-- ============================================

-- ============================================
-- REFERENCE TABLES (seeded from knowledge graph)
-- ============================================

-- Root causes (internal health factors)
CREATE TABLE IF NOT EXISTS public.root_causes (
  id TEXT PRIMARY KEY, -- e.g., "gut_dysbiosis"
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  body_system TEXT NOT NULL CHECK (body_system IN ('gut', 'hormonal', 'immune', 'metabolic', 'nervous')),
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  intervention_tier TEXT NOT NULL DEFAULT 'supplement' CHECK (intervention_tier IN ('product', 'supplement', 'basys')),
  requires_lab_diagnosis BOOLEAN DEFAULT FALSE,
  common_tests TEXT[] DEFAULT '{}', -- e.g., ["SIBO breath test", "stool analysis"]
  basys_specialty_param TEXT, -- e.g., "gastroenterology", "endocrinology"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biological mechanisms/pathways
CREATE TABLE IF NOT EXISTS public.mechanisms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('inflammatory', 'hormonal', 'metabolic', 'structural', 'immune')),
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications that affect skin (reference data)
CREATE TABLE IF NOT EXISTS public.medications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  drug_class TEXT NOT NULL,
  skin_effects TEXT[] DEFAULT '{}',
  interactions TEXT[] DEFAULT '{}', -- ingredient/supplement IDs
  pregnancy_category TEXT,
  photosensitivity BOOLEAN DEFAULT FALSE,
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplements (reference data with dosing)
CREATE TABLE IF NOT EXISTS public.supplements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  benefits TEXT[] DEFAULT '{}',
  concerns_treated TEXT[] DEFAULT '{}', -- condition slugs
  interactions TEXT[] DEFAULT '{}', -- medication/ingredient IDs
  pregnancy_safe TEXT, -- "safe", "contraindicated", "caution", "not_recommended"
  root_causes_targeted TEXT[] DEFAULT '{}', -- root cause IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATIONSHIP TABLES (knowledge graph edges)
-- ============================================

-- Root cause → condition links
CREATE TABLE IF NOT EXISTS public.cause_condition_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_cause_id TEXT REFERENCES public.root_causes(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('causes', 'aggravates')),
  mechanism_summary TEXT,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  UNIQUE(root_cause_id, condition_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mechanism chains: root_cause → mechanism → condition
CREATE TABLE IF NOT EXISTS public.mechanism_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_cause_id TEXT REFERENCES public.root_causes(id) NOT NULL,
  mechanism_id TEXT REFERENCES public.mechanisms(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  description TEXT NOT NULL,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  UNIQUE(root_cause_id, mechanism_id, condition_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication → condition effects
CREATE TABLE IF NOT EXISTS public.medication_condition_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id TEXT REFERENCES public.medications(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('improves', 'worsens', 'interacts_with', 'contraindicated_with')),
  effect_description TEXT,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  UNIQUE(medication_id, condition_id, relationship),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hormone → condition links
CREATE TABLE IF NOT EXISTS public.hormone_condition_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hormone_id TEXT REFERENCES public.hormones(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('excess', 'deficiency', 'either')),
  mechanism TEXT,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  UNIQUE(hormone_id, condition_id, direction),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER HEALTH ASSESSMENTS
-- ============================================

-- Root cause assessment quiz results
CREATE TABLE IF NOT EXISTS public.user_health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('gut_health', 'hormone_health', 'inflammation', 'nutrient_status', 'lifestyle', 'comprehensive')),
  answers JSONB NOT NULL DEFAULT '{}', -- quiz responses
  detected_root_causes TEXT[] DEFAULT '{}', -- inferred root cause IDs
  detected_mechanisms TEXT[] DEFAULT '{}', -- inferred mechanism IDs
  confidence_scores JSONB DEFAULT '{}', -- { root_cause_id: 0.0-1.0 }
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  requires_practitioner BOOLEAN DEFAULT FALSE,
  practitioner_specialty_recommended TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-reported medications (for interaction checking)
CREATE TABLE IF NOT EXISTS public.user_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  medication_id TEXT REFERENCES public.medications(id),
  custom_medication_name TEXT, -- for meds not in our database
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-reported supplements they're taking
CREATE TABLE IF NOT EXISTS public.user_supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplement_id TEXT REFERENCES public.supplements(id),
  custom_supplement_name TEXT,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RECOMMENDATIONS
-- ============================================

-- Generated recommendations for users
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('product', 'supplement', 'routine_step', 'basys_referral', 'lifestyle', 'lab_test')),
  -- For product/supplement recommendations
  product_id UUID REFERENCES public.products(id),
  supplement_id TEXT REFERENCES public.supplements(id),
  -- For practitioner/basys referrals
  practitioner_type TEXT,
  referral_reason TEXT,
  -- For lab test recommendations
  test_name TEXT,
  test_description TEXT,
  -- Targeting
  target_condition_id TEXT REFERENCES public.skin_conditions(slug),
  target_root_cause_id TEXT REFERENCES public.root_causes(id),
  target_mechanism_id TEXT REFERENCES public.mechanisms(id),
  -- Metadata
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  safety_notes TEXT,
  contraindications TEXT[] DEFAULT '{}',
  -- Tracking
  is_accepted BOOLEAN,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_reason TEXT,
  clicked_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================
-- BASYS HEALTH REFERRALS (Phase 1: tracking only, Phase 2: deep links)
-- ============================================

-- Basys Health referral records (SKINgenius never stores practitioner data directly)
CREATE TABLE IF NOT EXISTS public.basys_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  root_cause_id TEXT REFERENCES public.root_causes(id),
  condition_id TEXT REFERENCES public.skin_conditions(slug),
  -- Basys Health context
  basys_specialty_param TEXT, -- e.g., "gastroenterology", "endocrinology"
  basys_referral_url TEXT,
  pre_populated_context JSONB, -- { symptoms: [...], recommended_tests: [...], severity: "moderate" }
  -- Status tracking (updated via Basys callback webhook)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'clicked', 'booked', 'completed', 'cancelled')),
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent')),
  basys_referral_id TEXT, -- ID returned by Basys after booking
  -- Context passed to Basys
  symptoms_summary TEXT,
  recommended_tests TEXT[] DEFAULT '{}',
  skingenius_assessment_id UUID REFERENCES public.user_health_assessments(id),
  -- Callback data (from Basys webhook)
  basys_callback_data JSONB,
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basys Health referral links (tracking only)
CREATE TABLE IF NOT EXISTS public.basys_referral_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  root_cause_id TEXT REFERENCES public.root_causes(id),
  condition_id TEXT REFERENCES public.skin_conditions(slug),
  clicked_at TIMESTAMPTZ,
  basys_landing_url TEXT,
  utm_source TEXT DEFAULT 'skingenius',
  utm_medium TEXT,
  utm_campaign TEXT,
  converted_to_booking BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT-ROOT-CAUSE MAPPING
-- ============================================

-- Products that target specific root causes (not just conditions)
CREATE TABLE IF NOT EXISTS public.product_root_cause_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  root_cause_id TEXT REFERENCES public.root_causes(id) NOT NULL,
  mechanism_id TEXT REFERENCES public.mechanisms(id),
  efficacy_score DECIMAL(3,2) CHECK (efficacy_score >= 0 AND efficacy_score <= 1),
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  notes TEXT,
  UNIQUE(product_id, root_cause_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PREFERENCES & SETTINGS
-- ============================================

-- User preference for intervention tiers
CREATE TABLE IF NOT EXISTS public.user_health_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  prefers_deep_workup BOOLEAN DEFAULT FALSE, -- opt into Basys referrals
  prefers_product_only BOOLEAN DEFAULT FALSE, -- skip supplement/practitioner recs
  pregnancy_status TEXT CHECK (pregnancy_status IN ('not_pregnant', 'pregnant', 'planning', 'breastfeeding', 'unsure')),
  max_intervention_tier TEXT DEFAULT 'supplement' CHECK (max_intervention_tier IN ('product', 'supplement', 'basys')),
  has_primary_care_physician BOOLEAN,
  insurance_provider TEXT,
  location_city TEXT,
  location_state TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cause_condition_root ON public.cause_condition_links(root_cause_id);
CREATE INDEX IF NOT EXISTS idx_cause_condition_condition ON public.cause_condition_links(condition_id);
CREATE INDEX IF NOT EXISTS idx_mechanism_chain_root ON public.mechanism_chains(root_cause_id);
CREATE INDEX IF NOT EXISTS idx_mechanism_chain_condition ON public.mechanism_chains(condition_id);
CREATE INDEX IF NOT EXISTS idx_medication_condition_med ON public.medication_condition_links(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_condition_cond ON public.medication_condition_links(condition_id);
CREATE INDEX IF NOT EXISTS idx_hormone_condition_hormone ON public.hormone_condition_links(hormone_id);
CREATE INDEX IF NOT EXISTS idx_hormone_condition_condition ON public.hormone_condition_links(condition_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_user ON public.user_health_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_type ON public.user_health_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_user_medications_user ON public.user_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_medications_active ON public.user_medications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_supplements_user ON public.user_supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON public.recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_condition ON public.recommendations(target_condition_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_root_cause ON public.recommendations(target_root_cause_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_referrals_user ON public.practitioner_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_referrals_status ON public.practitioner_referrals(status);
CREATE INDEX IF NOT EXISTS idx_basys_intents_user ON public.basys_referral_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_product_root_cause_product ON public.product_root_cause_links(product_id);
CREATE INDEX IF NOT EXISTS idx_product_root_cause_root ON public.product_root_cause_links(root_cause_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Reference tables: public read
ALTER TABLE public.root_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cause_condition_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanism_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_condition_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hormone_condition_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view root_causes" ON public.root_causes FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanisms" ON public.mechanisms FOR SELECT USING (true);
CREATE POLICY "Anyone can view medications" ON public.medications FOR SELECT USING (true);
CREATE POLICY "Anyone can view supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Anyone can view cause_condition_links" ON public.cause_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanism_chains" ON public.mechanism_chains FOR SELECT USING (true);
CREATE POLICY "Anyone can view medication_condition_links" ON public.medication_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view hormone_condition_links" ON public.hormone_condition_links FOR SELECT USING (true);

-- User data: own records only
ALTER TABLE public.user_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basys_referral_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_root_cause_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health assessments" ON public.user_health_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health assessments" ON public.user_health_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own medications" ON public.user_medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own medications" ON public.user_medications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own supplements" ON public.user_supplements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own supplements" ON public.user_supplements FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.recommendations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals" ON public.practitioner_referrals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referrals" ON public.practitioner_referrals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own basys intents" ON public.basys_referral_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own basys intents" ON public.basys_referral_intents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON public.user_health_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_health_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view product_root_cause_links" ON public.product_root_cause_links FOR SELECT USING (true);

-- ============================================
-- PRO TIER: Esthetician/Professional Integration
-- ============================================

-- Professional (esthetician) subscriptions
CREATE TABLE IF NOT EXISTS public.pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  billing_provider TEXT DEFAULT 'square',
  billing_subscription_id TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 2900,
  max_clients INTEGER DEFAULT 50,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client-Pro relationships
CREATE TABLE IF NOT EXISTS public.client_pro_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  pro_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'expired')),
  invited_by TEXT CHECK (invited_by IN ('client', 'pro')),
  invite_code TEXT,
  share_scans BOOLEAN DEFAULT TRUE,
  share_products BOOLEAN DEFAULT TRUE,
  share_routines BOOLEAN DEFAULT TRUE,
  share_conditions BOOLEAN DEFAULT TRUE,
  share_supplements BOOLEAN DEFAULT FALSE,
  share_health_profile BOOLEAN DEFAULT FALSE,
  pro_can_message BOOLEAN DEFAULT TRUE,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, pro_id)
);

-- Pro check-in messages
CREATE TABLE IF NOT EXISTS public.pro_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES public.profiles(id),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  relationship_id UUID NOT NULL REFERENCES public.client_pro_relationships(id),
  message_type TEXT NOT NULL CHECK (message_type IN ('check_in', 'routine_update', 'product_suggestion', 'general')),
  body TEXT NOT NULL,
  includes_scan_request BOOLEAN DEFAULT FALSE,
  scan_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral queue
CREATE TABLE IF NOT EXISTS public.referral_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  condition_ids TEXT[] DEFAULT '{}',
  fitzpatrick_type INTEGER CHECK (fitzpatrick_type BETWEEN 1 AND 6),
  location_zip TEXT,
  location_radius_miles INTEGER DEFAULT 25,
  preferred_service_types TEXT[] DEFAULT '{}',
  matched_pro_id UUID REFERENCES public.profiles(id),
  match_score FLOAT,
  status TEXT NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'contacted', 'booked', 'completed', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pro_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros manage own subscription" ON public.pro_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Clients view own relationships" ON public.client_pro_relationships FOR SELECT USING (auth.uid() = client_id OR auth.uid() = pro_id);
CREATE POLICY "Clients manage own sharing" ON public.client_pro_relationships FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Pros view own clients" ON public.client_pro_relationships FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Pros send messages" ON public.pro_messages FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "Clients read own messages" ON public.pro_messages FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Pros read own messages" ON public.pro_messages FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Users manage own referrals" ON public.referral_queue FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Pros view matched referrals" ON public.referral_queue FOR SELECT USING (auth.uid() = matched_pro_id);
