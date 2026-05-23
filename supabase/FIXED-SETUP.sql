-- SKINgenius — EXTENDED SETUP (run after your existing 11 tables)
-- Idempotent. Safe to re-run. ORDER MATTERS.
-- ============================================

create extension if not exists pgcrypto;

-- ============================================
-- STEP 1: skin_conditions seeds (FK targets)
-- ============================================

INSERT INTO public.skin_conditions (name, slug, category, description) VALUES
('Acne Vulgaris','acne-vulgaris','acne','Common acne'),
('Hormonal Acne','hormonal-acne','acne','Hormonal acne'),
('Acne Mechanica','acne-mechanica','acne','Friction acne'),
('Steroid Acne','steroid-acne','acne','Steroid-induced acne'),
('Fungal Acne','fungal-acne','acne','Yeast-driven breakouts'),
('Excess Sebum & Enlarged Pores','excess-sebum-enlarged-pores','acne','Overproduction of sebum'),
('Rosacea','rosacea','redness','Chronic facial redness'),
('Perioral Dermatitis','perioral-dermatitis','redness','Red rash around mouth'),
('Psoriasis','psoriasis','other','Autoimmune scaly patches'),
('Atopic Dermatitis','atopic-dermatitis','sensitivity','Dry itchy patches'),
('Contact Dermatitis','contact-dermatitis','sensitivity','Irritant/allergen reaction'),
('Seborrheic Dermatitis','seborrheic-dermatitis','other','Flaky oily skin'),
('Melasma','melasma','pigmentation','Brown patches from sun/hormones'),
('Post-Inflammatory Hyperpigmentation','post-inflammatory-hyperpigmentation','pigmentation','Dark spots after inflammation'),
('Solar Lentigines','solar-lentigines','pigmentation','Age spots'),
('Vitiligo','vitiligo','pigmentation','Loss of skin pigment'),
('Actinic Keratosis','actinic-keratosis','sun_damage','Precancerous sun spots'),
('Seborrheic Keratosis','seborrheic-keratosis','other','Benign skin growth'),
('Folliculitis','folliculitis','acne','Inflamed hair follicles'),
('Keratosis Pilaris','keratosis-pilaris','texture','Keratin bumps'),
('Cold Sore (HSV-1)','cold-sore','other','Viral blister outbreak'),
('Razor Bumps','razor-bumps','other','Ingrown hair bumps'),
('Tinea Versicolor','tinea-versicolor','other','Yeast patches'),
('Barrier Dysfunction','barrier-dysfunction','sensitivity','Compromised skin barrier'),
('Xerosis','xerosis','hydration','Abnormally dry skin'),
('Skin Cancer (Melanoma)','skin-cancer-melanoma','sun_damage','Malignant melanoma')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, description = EXCLUDED.description;

-- ============================================
-- STEP 2: Reference tables (no FKs to skin_conditions)
-- ============================================

CREATE TABLE IF NOT EXISTS public.root_causes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  body_system TEXT NOT NULL CHECK (body_system IN ('gut','hormonal','immune','metabolic','nervous')),
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  intervention_tier TEXT NOT NULL DEFAULT 'supplement' CHECK (intervention_tier IN ('product','supplement','basys')),
  requires_lab_diagnosis BOOLEAN DEFAULT FALSE,
  common_tests TEXT[] DEFAULT '{}',
  basys_specialty_param TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mechanisms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('inflammatory','hormonal','metabolic','structural','immune')),
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  benefits TEXT[] DEFAULT '{}',
  concerns_treated TEXT[] DEFAULT '{}',
  interactions TEXT[] DEFAULT '{}',
  pregnancy_safe TEXT,
  root_causes_targeted TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  drug_class TEXT NOT NULL,
  skin_effects TEXT[] DEFAULT '{}',
  interactions TEXT[] DEFAULT '{}',
  pregnancy_category TEXT,
  photosensitivity BOOLEAN DEFAULT FALSE,
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: FK tables (reference skin_conditions.slug)
-- ============================================

CREATE TABLE IF NOT EXISTS public.cause_condition_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_cause_id TEXT REFERENCES public.root_causes(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('causes','aggravates')),
  mechanism_summary TEXT,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  UNIQUE(root_cause_id, condition_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mechanism_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_cause_id TEXT REFERENCES public.root_causes(id) NOT NULL,
  mechanism_id TEXT REFERENCES public.mechanisms(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  description TEXT NOT NULL,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  UNIQUE(root_cause_id, mechanism_id, condition_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medication_condition_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id TEXT REFERENCES public.medications(id) NOT NULL,
  condition_id TEXT REFERENCES public.skin_conditions(slug) NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('improves','worsens','interacts_with','contraindicated_with')),
  effect_description TEXT,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A','B','C','D')),
  citation TEXT,
  UNIQUE(medication_id, condition_id, relationship),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_root_cause_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  root_cause_id TEXT REFERENCES public.root_causes(id) NOT NULL,
  mechanism_id TEXT REFERENCES public.mechanisms(id),
  efficacy_score DECIMAL(3,2) CHECK (efficacy_score >= 0 AND efficacy_score <= 1),
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  notes TEXT,
  UNIQUE(product_id, root_cause_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: User data tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_health_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  prefers_deep_workup BOOLEAN DEFAULT FALSE,
  prefers_product_only BOOLEAN DEFAULT FALSE,
  pregnancy_status TEXT CHECK (pregnancy_status IN ('not_pregnant','pregnant','planning','breastfeeding','unsure')),
  max_intervention_tier TEXT DEFAULT 'supplement' CHECK (max_intervention_tier IN ('product','supplement','basys')),
  has_primary_care_physician BOOLEAN,
  insurance_provider TEXT,
  location_city TEXT,
  location_state TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('gut_health','hormone_health','inflammation','nutrient_status','lifestyle','comprehensive')),
  answers JSONB NOT NULL DEFAULT '{}',
  detected_root_causes TEXT[] DEFAULT '{}',
  detected_mechanisms TEXT[] DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  severity TEXT CHECK (severity IN ('mild','moderate','severe')),
  requires_practitioner BOOLEAN DEFAULT FALSE,
  practitioner_specialty_recommended TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('product','supplement','routine_step','basys_referral','lifestyle','lab_test')),
  product_id UUID REFERENCES public.products(id),
  supplement_id TEXT REFERENCES public.supplements(id),
  practitioner_type TEXT,
  referral_reason TEXT,
  test_name TEXT,
  test_description TEXT,
  target_condition_id TEXT REFERENCES public.skin_conditions(slug),
  target_root_cause_id TEXT REFERENCES public.root_causes(id),
  target_mechanism_id TEXT REFERENCES public.mechanisms(id),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  safety_notes TEXT,
  contraindications TEXT[] DEFAULT '{}',
  is_accepted BOOLEAN,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_reason TEXT,
  clicked_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.basys_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  root_cause_id TEXT REFERENCES public.root_causes(id),
  condition_id TEXT REFERENCES public.skin_conditions(slug),
  basys_specialty_param TEXT,
  basys_referral_url TEXT,
  pre_populated_context JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','clicked','booked','completed','cancelled')),
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine','urgent')),
  basys_referral_id TEXT,
  symptoms_summary TEXT,
  recommended_tests TEXT[] DEFAULT '{}',
  skingenius_assessment_id UUID REFERENCES public.user_health_assessments(id),
  basys_callback_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- STEP 5: Pro tier tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro','enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','trial')),
  max_clients INTEGER NOT NULL DEFAULT 50,
  monthly_price DECIMAL(10,2),
  billing_cycle_start DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_pro_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','declined','revoked')),
  shared_scans BOOLEAN DEFAULT TRUE,
  shared_products BOOLEAN DEFAULT TRUE,
  shared_routines BOOLEAN DEFAULT TRUE,
  shared_conditions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pro_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','clicked','signed_up')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 6: Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cause_condition_root ON public.cause_condition_links(root_cause_id);
CREATE INDEX IF NOT EXISTS idx_cause_condition_condition ON public.cause_condition_links(condition_id);
CREATE INDEX IF NOT EXISTS idx_mechanism_chain_root ON public.mechanism_chains(root_cause_id);
CREATE INDEX IF NOT EXISTS idx_mechanism_chain_condition ON public.mechanism_chains(condition_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_user ON public.user_health_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_condition ON public.recommendations(target_condition_id);
CREATE INDEX IF NOT EXISTS idx_product_root_cause_product ON public.product_root_cause_links(product_id);

-- ============================================
-- STEP 7: RLS
-- ============================================

ALTER TABLE public.root_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cause_condition_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanism_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_condition_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basys_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basys_referral_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_root_cause_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pro_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_queue ENABLE ROW LEVEL SECURITY;

-- Read-only reference tables
CREATE POLICY "Anyone can view root_causes" ON public.root_causes FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanisms" ON public.mechanisms FOR SELECT USING (true);
CREATE POLICY "Anyone can view supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Anyone can view medications" ON public.medications FOR SELECT USING (true);
CREATE POLICY "Anyone can view cause_condition_links" ON public.cause_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanism_chains" ON public.mechanism_chains FOR SELECT USING (true);
CREATE POLICY "Anyone can view medication_condition_links" ON public.medication_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_root_cause_links" ON public.product_root_cause_links FOR SELECT USING (true);

-- User-scoped tables
CREATE POLICY "Users can view own health assessments" ON public.user_health_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health assessments" ON public.user_health_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own preferences" ON public.user_health_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_health_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referrals" ON public.basys_referrals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON public.basys_referrals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referral intents" ON public.basys_referral_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referral intents" ON public.basys_referral_intents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own pro subscription" ON public.pro_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own client relationships" ON public.client_pro_relationships FOR SELECT USING (auth.uid() = pro_id OR auth.uid() = client_id);
CREATE POLICY "Users can view own pro messages" ON public.pro_messages FOR SELECT USING (auth.uid() = pro_id OR auth.uid() = client_id);
CREATE POLICY "Users can insert own pro messages" ON public.pro_messages FOR INSERT WITH CHECK (auth.uid() = pro_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('skin-photos', 'skin-photos', false) ON CONFLICT DO NOTHING;
