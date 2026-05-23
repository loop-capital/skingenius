-- ============================================
-- SKINgenius Complete Schema + Seed Script
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- REFERENCE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.root_causes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  body_system TEXT NOT NULL CHECK (body_system IN ('gut', 'hormonal', 'immune', 'metabolic', 'nervous')),
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  intervention_tier TEXT NOT NULL DEFAULT 'supplement' CHECK (intervention_tier IN ('product', 'supplement', 'basys')),
  requires_lab_diagnosis BOOLEAN DEFAULT FALSE,
  common_tests TEXT[] DEFAULT '{}',
  basys_specialty_param TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mechanisms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('inflammatory', 'hormonal', 'metabolic', 'structural', 'immune')),
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
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
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATIONSHIP TABLES
-- ============================================

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

-- ============================================
-- USER TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_health_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  prefers_deep_workup BOOLEAN DEFAULT FALSE,
  prefers_product_only BOOLEAN DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS public.user_health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('gut_health', 'hormone_health', 'inflammation', 'nutrient_status', 'lifestyle', 'comprehensive')),
  answers JSONB NOT NULL DEFAULT '{}',
  detected_root_causes TEXT[] DEFAULT '{}',
  detected_mechanisms TEXT[] DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  requires_practitioner BOOLEAN DEFAULT FALSE,
  practitioner_specialty_recommended TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('product', 'supplement', 'routine_step', 'basys_referral', 'lifestyle', 'lab_test')),
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
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'clicked', 'booked', 'completed', 'cancelled')),
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent')),
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
-- INDEXES
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
-- ROW LEVEL SECURITY
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

CREATE POLICY "Anyone can view root_causes" ON public.root_causes FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanisms" ON public.mechanisms FOR SELECT USING (true);
CREATE POLICY "Anyone can view supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Anyone can view medications" ON public.medications FOR SELECT USING (true);
CREATE POLICY "Anyone can view cause_condition_links" ON public.cause_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanism_chains" ON public.mechanism_chains FOR SELECT USING (true);
CREATE POLICY "Anyone can view medication_condition_links" ON public.medication_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_root_cause_links" ON public.product_root_cause_links FOR SELECT USING (true);

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

-- ============================================
-- SEED DATA: ROOT CAUSES
-- ============================================

INSERT INTO public.root_causes (id, name, description, body_system, evidence_level) VALUES
  ('follicular_hyperkeratinization', 'Follicular hyperkeratinization', 'Abnormal desquamation of keratinocytes leading to microcomedone formation', 'immune', 'A'),
  ('increased_sebum_production', 'Increased sebum production', 'Androgen-driven sebaceous gland hyperplasia; DHT is primary mediator', 'hormonal', 'A'),
  ('c._acnes_colonization', 'C. acnes colonization', 'IA1 phylotype triggers inflammatory cascade via TLR2/TLR4', 'immune', 'A'),
  ('inflammation', 'Inflammation', 'Innate immune response to C. acnes and biofilm formation', 'immune', 'A'),
  ('high_glycemic_diet', 'High glycemic diet', 'High glycemic load increases IGF-1, stimulating sebum production', 'metabolic', 'B'),
  ('gut_dysbiosis', 'Gut dysbiosis', 'Gut-skin axis; dysbiosis may drive systemic inflammation', 'gut', 'D'),
  ('insulin_resistance', 'Insulin resistance', 'Hyperinsulinemia increases androgens and IGF-1', 'hormonal', 'B'),
  ('chronic_stress', 'Chronic stress', 'CRH/ACTH axis increases cortisol and androgens, stimulating sebum', 'nervous', 'B'),
  ('androgen_excess', 'Androgen excess', 'DHEA-S, testosterone, DHT drive sebum production', 'hormonal', 'A'),
  ('estrogen_fluctuations', 'Estrogen fluctuations', 'Mid-cycle and premenstrual estrogen drops worsen acne', 'hormonal', 'A'),
  ('cortisol_dysregulation', 'Cortisol dysregulation', 'Stress increases cortisol which increases androgens', 'hormonal', 'B'),
  ('mechanical_friction', 'Mechanical friction', 'Physical irritation disrupts follicular epithelium', 'immune', 'A'),
  ('heat_and_occlusion', 'Heat and occlusion', 'Traps sweat and sebum, promoting bacterial growth', 'nervous', 'A'),
  ('pressure', 'Pressure', 'Compresses follicles and increases inflammation', 'nervous', 'A'),
  ('malassezia_overgrowth', 'Malassezia overgrowth', 'Lipophilic yeast thrives in sebum-rich environments', 'immune', 'A'),
  ('heat_and_humidity', 'Heat and humidity', 'Promotes yeast proliferation', 'nervous', 'A'),
  ('antibiotic_use', 'Antibiotic use', 'Disrupts bacterial balance, allowing yeast overgrowth', 'immune', 'A'),
  ('immunosuppression', 'Immunosuppression', 'Reduced immune control of commensal yeast', 'nervous', 'B'),
  ('systemic_corticosteroids', 'Systemic corticosteroids', 'Prednisone and similar trigger sebaceous hyperplasia', 'immune', 'A'),
  ('anabolic_steroids', 'Anabolic steroids', 'Exogenous androgens increase sebum production', 'hormonal', 'A'),
  ('topical_steroid_overuse', 'Topical steroid overuse', 'Perioral and facial acneiform eruption', 'immune', 'A'),
  ('neurovascular_dysregulation', 'Neurovascular dysregulation', 'Abnormal blood vessel reactivity and inflammation', 'immune', 'A'),
  ('demodex_mite_overgrowth', 'Demodex mite overgrowth', 'Demodex folliculorum density higher in rosacea patients', 'immune', 'B'),
  ('genetic_predisposition', 'Genetic predisposition', 'Family history common; Celtic/Northern European ancestry', 'immune', 'B'),
  ('uv_damage', 'UV damage', 'Chronic sun exposure damages vessels and skin', 'nervous', 'A'),
  ('barrier_dysfunction', 'Barrier dysfunction', 'Filaggrin mutations; ceramide deficiency; increased TEWL', 'immune', 'A'),
  ('th2_immune_dysregulation', 'Th2 immune dysregulation', 'IL-4, IL-5, IL-13 drive inflammation and pruritus', 'immune', 'A'),
  ('environmental_allergens', 'Environmental allergens', 'Dust mites, pollen, pet dander trigger flares', 'nervous', 'A'),
  ('microbiome_dysbiosis', 'Microbiome dysbiosis', 'S. aureus overgrowth; reduced microbial diversity', 'immune', 'A'),
  ('stress', 'Stress', 'Stress worsens symptoms via HPA axis and immune modulation', 'nervous', 'A'),
  ('food_triggers', 'Food triggers', 'Dairy, eggs, wheat, soy in some patients', 'metabolic', 'B'),
  ('irritant_exposure', 'Irritant exposure', 'Detergents, solvents, acids, alkalis directly damage skin', 'immune', 'A'),
  ('allergic_sensitization', 'Allergic sensitization', 'Type IV hypersensitivity to specific allergens', 'immune', 'A'),
  ('sebaceous_gland_activity', 'Sebaceous gland activity', 'Androgen-driven sebum production feeds yeast', 'hormonal', 'A'),
  ('immune_response', 'Immune response', 'Individual susceptibility to Malassezia antigens', 'immune', 'A'),
  ('neurological_conditions', 'Neurological conditions', 'Parkinson''s disease increases risk', 'nervous', 'B'),
  ('th1_th17_immune_dysregulation', 'Th1/Th17 immune dysregulation', 'TNF-α, IL-17, IL-23 are key cytokines', 'immune', 'A'),
  ('environmental_triggers', 'Environmental triggers', 'Infection, trauma, stress, medications', 'nervous', 'A'),
  ('obesity_metabolic_syndrome', 'Obesity/metabolic syndrome', 'Adipokines promote inflammation; weight loss improves severity', 'metabolic', 'A'),
  ('alcohol_and_smoking', 'Alcohol and smoking', 'Exacerbate psoriasis and reduce treatment response', 'nervous', 'A'),
  ('uv_radiation', 'UV radiation', 'Stimulates melanocyte activity', 'nervous', 'A'),
  ('hormonal_factors', 'Hormonal factors', 'Estrogen, progesterone; pregnancy, OCPs, HRT', 'hormonal', 'A'),
  ('visible_light', 'Visible light', 'Contributes to pigmentation in darker skin', 'nervous', 'B'),
  ('thyroid_disease', 'Thyroid disease', 'Autoimmune thyroid disease association', 'hormonal', 'B'),
  ('inflammatory_mediator_release', 'Inflammatory mediator release', 'IL-1, TNF-α, GM-CSF stimulate melanocytes', 'immune', 'A'),
  ('melanocyte_activation', 'Melanocyte activation', 'Inflammation triggers melanin production', 'immune', 'A'),
  ('uv_exposure', 'UV exposure', 'Post-inflammatory skin is photosensitive; UV worsens PIH', 'nervous', 'A'),
  ('chronic_uv_exposure', 'Chronic UV exposure', 'Cumulative sun damage; UVA primarily responsible', 'nervous', 'A'),
  ('melanocyte_proliferation', 'Melanocyte proliferation', 'Increased melanocyte number and melanin', 'immune', 'A'),
  ('dna_damage', 'DNA damage', 'UV-induced p53 mutations in keratinocytes', 'immune', 'A'),
  ('autoimmune_destruction', 'Autoimmune destruction', 'CD8+ T-cells target melanocytes', 'immune', 'A'),
  ('oxidative_stress', 'Oxidative stress', 'Excessive H2O2 in epidermis; defective catalase', 'immune', 'A'),
  ('koebner_phenomenon', 'Koebner phenomenon', 'Trauma initiates new lesions', 'immune', 'A'),
  ('genetic_mutations', 'Genetic mutations', 'BRAF, NRAS, CDKN2A mutations', 'immune', 'A'),
  ('family_history', 'Family history', '10% have familial melanoma', 'immune', 'A'),
  ('many_nevi', 'Many nevi', '>50 common nevi increases risk', 'immune', 'A'),
  ('fluoride_toothpaste', 'Fluoride toothpaste', 'Can trigger or exacerbate', 'nervous', 'B'),
  ('cosmetics', 'Cosmetics', 'Heavy moisturizers, occlusive products', 'immune', 'B'),
  ('keratin_overproduction', 'Keratin overproduction', 'Excess keratin blocks hair follicles', 'immune', 'A'),
  ('dry_skin', 'Dry skin', 'Worse in winter; improves with humidity', 'immune', 'A'),
  ('atopic_diathesis', 'Atopic diathesis', 'Associated with atopic dermatitis', 'immune', 'B'),
  ('low_humidity', 'Low humidity', 'Winter, indoor heating, desert climates', 'nervous', 'A'),
  ('aging', 'Aging', 'Decreased sebum, ceramides, and natural moisturizing factors', 'immune', 'A'),
  ('harsh_cleansers', 'Harsh cleansers', 'Strip natural lipids', 'nervous', 'A'),
  ('hot_water', 'Hot water', 'Strips lipids and damages barrier', 'nervous', 'A'),
  ('medical_conditions', 'Medical conditions', 'Hypothyroidism, diabetes, kidney disease', 'immune', 'B'),
  ('nutritional_deficiency', 'Nutritional deficiency', 'Essential fatty acids, vitamins A, D, E', 'metabolic', 'B'),
  ('sun_exposure', 'Sun exposure', 'Contributes to development', 'nervous', 'B'),
  ('oily_skin', 'Oily skin', 'Malassezia thrives on sebum', 'immune', 'B'),
  ('bacterial_infection', 'Bacterial infection', 'S. aureus most common', 'immune', 'A'),
  ('fungal_infection', 'Fungal infection', 'Malassezia, dermatophytes', 'immune', 'A'),
  ('physical_irritation', 'Physical irritation', 'Shaving, friction, tight clothing', 'nervous', 'A'),
  ('ingrown_hairs', 'Ingrown hairs', 'Curly hair re-enters skin; pseudofolliculitis barbae', 'immune', 'A'),
  ('hot_tub_exposure', 'Hot tub exposure', 'Pseudomonas folliculitis', 'nervous', 'A'),
  ('hsv_1_reactivation', 'HSV-1 reactivation', 'Latent virus in trigeminal ganglion reactivates', 'immune', 'A'),
  ('hormonal_changes', 'Hormonal changes', 'Menstrual cycle, pregnancy', 'hormonal', 'B'),
  ('curly_coily_hair', 'Curly/coily hair', 'Hair re-enters skin after shaving; foreign body reaction', 'immune', 'A'),
  ('close_shaving', 'Close shaving', 'Multi-blade razors cut hair below skin surface', 'nervous', 'A'),
  ('pulling_skin_while_shaving', 'Pulling skin while shaving', 'Causes hair to snap back below surface', 'nervous', 'A'),
  ('androgen_driven_sebaceous_lipogenesis', 'Androgen-driven sebaceous lipogenesis', 'DHT is the primary mediator of sebaceous gland activity; testosterone converts to DHT via 5-alpha reductase at the skin level', 'hormonal', 'A'),
  ('insulin_&_igf_1_upregulation', 'Insulin & IGF-1 upregulation', 'Spikes in insulin and Insulin-like Growth Factor 1 directly upregulate sebum production via androgen pathway', 'hormonal', 'A'),
  ('dairy_&_whey_protein', 'Dairy & whey protein', 'Dairy (especially whey) increases IGF-1 levels, amplifying androgen-driven sebum production', 'metabolic', 'B'),
  ('collagen_&_elastin_loss_(aging)', 'Collagen & elastin loss (aging)', 'Decreased collagen and elastin around pore openings reduces structural support, making pores appear larger', 'immune', 'A'),
  ('dht_conversion', 'DHT conversion', 'Testosterone converts to more potent DHT via 5-alpha reductase, amplifying sebum production signal', 'hormonal', 'A'),
  ('over_exfoliation', 'Over-exfoliation', 'Excessive use of acids, retinoids, or physical scrubs damages barrier', 'nervous', 'A'),
  ('environmental_damage', 'Environmental damage', 'Pollution, wind, cold weather damage barrier lipids', 'nervous', 'A') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, body_system = EXCLUDED.body_system, evidence_level = EXCLUDED.evidence_level;

-- Seeded 86 root causes

-- ============================================
-- SEED DATA: MECHANISMS
-- ============================================

INSERT INTO public.mechanisms (id, name, description, pathway_type, evidence_level) VALUES
  ('follicular_hyperkeratinization_mech', 'Follicular hyperkeratinization pathway', 'Mechanism involving Follicular hyperkeratinization leading to skin symptoms. Abnormal desquamation of keratinocytes leading to microcomedone formation', 'inflammatory', 'A'),
  ('increased_sebum_production_mech', 'Increased sebum production pathway', 'Mechanism involving Increased sebum production leading to skin symptoms. Androgen-driven sebaceous gland hyperplasia; DHT is primary mediator', 'hormonal', 'A'),
  ('c._acnes_colonization_mech', 'C. acnes colonization pathway', 'Mechanism involving C. acnes colonization leading to skin symptoms. IA1 phylotype triggers inflammatory cascade via TLR2/TLR4', 'inflammatory', 'A'),
  ('inflammation_mech', 'Inflammation pathway', 'Mechanism involving Inflammation leading to skin symptoms. Innate immune response to C. acnes and biofilm formation', 'inflammatory', 'A'),
  ('high_glycemic_diet_mech', 'High glycemic diet pathway', 'Mechanism involving High glycemic diet leading to skin symptoms. High glycemic load increases IGF-1, stimulating sebum production', 'metabolic', 'B'),
  ('gut_dysbiosis_mech', 'Gut dysbiosis pathway', 'Mechanism involving Gut dysbiosis leading to skin symptoms. Gut-skin axis; dysbiosis may drive systemic inflammation', 'inflammatory', 'D'),
  ('insulin_resistance_mech', 'Insulin resistance pathway', 'Mechanism involving Insulin resistance leading to skin symptoms. Hyperinsulinemia increases androgens and IGF-1', 'hormonal', 'B'),
  ('chronic_stress_mech', 'Chronic stress pathway', 'Mechanism involving Chronic stress leading to skin symptoms. CRH/ACTH axis increases cortisol and androgens, stimulating sebum', 'metabolic', 'B'),
  ('androgen_excess_mech', 'Androgen excess pathway', 'Mechanism involving Androgen excess leading to skin symptoms. DHEA-S, testosterone, DHT drive sebum production', 'hormonal', 'A'),
  ('estrogen_fluctuations_mech', 'Estrogen fluctuations pathway', 'Mechanism involving Estrogen fluctuations leading to skin symptoms. Mid-cycle and premenstrual estrogen drops worsen acne', 'hormonal', 'A'),
  ('cortisol_dysregulation_mech', 'Cortisol dysregulation pathway', 'Mechanism involving Cortisol dysregulation leading to skin symptoms. Stress increases cortisol which increases androgens', 'hormonal', 'B'),
  ('mechanical_friction_mech', 'Mechanical friction pathway', 'Mechanism involving Mechanical friction leading to skin symptoms. Physical irritation disrupts follicular epithelium', 'inflammatory', 'A'),
  ('heat_and_occlusion_mech', 'Heat and occlusion pathway', 'Mechanism involving Heat and occlusion leading to skin symptoms. Traps sweat and sebum, promoting bacterial growth', 'metabolic', 'A'),
  ('pressure_mech', 'Pressure pathway', 'Mechanism involving Pressure leading to skin symptoms. Compresses follicles and increases inflammation', 'metabolic', 'A'),
  ('malassezia_overgrowth_mech', 'Malassezia overgrowth pathway', 'Mechanism involving Malassezia overgrowth leading to skin symptoms. Lipophilic yeast thrives in sebum-rich environments', 'inflammatory', 'A'),
  ('heat_and_humidity_mech', 'Heat and humidity pathway', 'Mechanism involving Heat and humidity leading to skin symptoms. Promotes yeast proliferation', 'metabolic', 'A'),
  ('antibiotic_use_mech', 'Antibiotic use pathway', 'Mechanism involving Antibiotic use leading to skin symptoms. Disrupts bacterial balance, allowing yeast overgrowth', 'inflammatory', 'A'),
  ('immunosuppression_mech', 'Immunosuppression pathway', 'Mechanism involving Immunosuppression leading to skin symptoms. Reduced immune control of commensal yeast', 'metabolic', 'B'),
  ('systemic_corticosteroids_mech', 'Systemic corticosteroids pathway', 'Mechanism involving Systemic corticosteroids leading to skin symptoms. Prednisone and similar trigger sebaceous hyperplasia', 'inflammatory', 'A'),
  ('anabolic_steroids_mech', 'Anabolic steroids pathway', 'Mechanism involving Anabolic steroids leading to skin symptoms. Exogenous androgens increase sebum production', 'hormonal', 'A'),
  ('topical_steroid_overuse_mech', 'Topical steroid overuse pathway', 'Mechanism involving Topical steroid overuse leading to skin symptoms. Perioral and facial acneiform eruption', 'inflammatory', 'A'),
  ('neurovascular_dysregulation_mech', 'Neurovascular dysregulation pathway', 'Mechanism involving Neurovascular dysregulation leading to skin symptoms. Abnormal blood vessel reactivity and inflammation', 'inflammatory', 'A'),
  ('demodex_mite_overgrowth_mech', 'Demodex mite overgrowth pathway', 'Mechanism involving Demodex mite overgrowth leading to skin symptoms. Demodex folliculorum density higher in rosacea patients', 'inflammatory', 'B'),
  ('genetic_predisposition_mech', 'Genetic predisposition pathway', 'Mechanism involving Genetic predisposition leading to skin symptoms. Family history common; Celtic/Northern European ancestry', 'inflammatory', 'B'),
  ('uv_damage_mech', 'UV damage pathway', 'Mechanism involving UV damage leading to skin symptoms. Chronic sun exposure damages vessels and skin', 'metabolic', 'A'),
  ('barrier_dysfunction_mech', 'Barrier dysfunction pathway', 'Mechanism involving Barrier dysfunction leading to skin symptoms. Filaggrin mutations; ceramide deficiency; increased TEWL', 'inflammatory', 'A'),
  ('th2_immune_dysregulation_mech', 'Th2 immune dysregulation pathway', 'Mechanism involving Th2 immune dysregulation leading to skin symptoms. IL-4, IL-5, IL-13 drive inflammation and pruritus', 'inflammatory', 'A'),
  ('environmental_allergens_mech', 'Environmental allergens pathway', 'Mechanism involving Environmental allergens leading to skin symptoms. Dust mites, pollen, pet dander trigger flares', 'metabolic', 'A'),
  ('microbiome_dysbiosis_mech', 'Microbiome dysbiosis pathway', 'Mechanism involving Microbiome dysbiosis leading to skin symptoms. S. aureus overgrowth; reduced microbial diversity', 'inflammatory', 'A'),
  ('stress_mech', 'Stress pathway', 'Mechanism involving Stress leading to skin symptoms. Stress worsens symptoms via HPA axis and immune modulation', 'metabolic', 'A'),
  ('food_triggers_mech', 'Food triggers pathway', 'Mechanism involving Food triggers leading to skin symptoms. Dairy, eggs, wheat, soy in some patients', 'metabolic', 'B'),
  ('irritant_exposure_mech', 'Irritant exposure pathway', 'Mechanism involving Irritant exposure leading to skin symptoms. Detergents, solvents, acids, alkalis directly damage skin', 'inflammatory', 'A'),
  ('allergic_sensitization_mech', 'Allergic sensitization pathway', 'Mechanism involving Allergic sensitization leading to skin symptoms. Type IV hypersensitivity to specific allergens', 'inflammatory', 'A'),
  ('sebaceous_gland_activity_mech', 'Sebaceous gland activity pathway', 'Mechanism involving Sebaceous gland activity leading to skin symptoms. Androgen-driven sebum production feeds yeast', 'hormonal', 'A'),
  ('immune_response_mech', 'Immune response pathway', 'Mechanism involving Immune response leading to skin symptoms. Individual susceptibility to Malassezia antigens', 'inflammatory', 'A'),
  ('neurological_conditions_mech', 'Neurological conditions pathway', 'Mechanism involving Neurological conditions leading to skin symptoms. Parkinson''s disease increases risk', 'metabolic', 'B'),
  ('th1_th17_immune_dysregulation_mech', 'Th1/Th17 immune dysregulation pathway', 'Mechanism involving Th1/Th17 immune dysregulation leading to skin symptoms. TNF-α, IL-17, IL-23 are key cytokines', 'inflammatory', 'A'),
  ('environmental_triggers_mech', 'Environmental triggers pathway', 'Mechanism involving Environmental triggers leading to skin symptoms. Infection, trauma, stress, medications', 'metabolic', 'A'),
  ('obesity_metabolic_syndrome_mech', 'Obesity/metabolic syndrome pathway', 'Mechanism involving Obesity/metabolic syndrome leading to skin symptoms. Adipokines promote inflammation; weight loss improves severity', 'metabolic', 'A'),
  ('alcohol_and_smoking_mech', 'Alcohol and smoking pathway', 'Mechanism involving Alcohol and smoking leading to skin symptoms. Exacerbate psoriasis and reduce treatment response', 'metabolic', 'A'),
  ('uv_radiation_mech', 'UV radiation pathway', 'Mechanism involving UV radiation leading to skin symptoms. Stimulates melanocyte activity', 'metabolic', 'A'),
  ('hormonal_factors_mech', 'Hormonal factors pathway', 'Mechanism involving Hormonal factors leading to skin symptoms. Estrogen, progesterone; pregnancy, OCPs, HRT', 'hormonal', 'A'),
  ('visible_light_mech', 'Visible light pathway', 'Mechanism involving Visible light leading to skin symptoms. Contributes to pigmentation in darker skin', 'metabolic', 'B'),
  ('thyroid_disease_mech', 'Thyroid disease pathway', 'Mechanism involving Thyroid disease leading to skin symptoms. Autoimmune thyroid disease association', 'hormonal', 'B'),
  ('inflammatory_mediator_release_mech', 'Inflammatory mediator release pathway', 'Mechanism involving Inflammatory mediator release leading to skin symptoms. IL-1, TNF-α, GM-CSF stimulate melanocytes', 'inflammatory', 'A'),
  ('melanocyte_activation_mech', 'Melanocyte activation pathway', 'Mechanism involving Melanocyte activation leading to skin symptoms. Inflammation triggers melanin production', 'inflammatory', 'A'),
  ('uv_exposure_mech', 'UV exposure pathway', 'Mechanism involving UV exposure leading to skin symptoms. Post-inflammatory skin is photosensitive; UV worsens PIH', 'metabolic', 'A'),
  ('chronic_uv_exposure_mech', 'Chronic UV exposure pathway', 'Mechanism involving Chronic UV exposure leading to skin symptoms. Cumulative sun damage; UVA primarily responsible', 'metabolic', 'A'),
  ('melanocyte_proliferation_mech', 'Melanocyte proliferation pathway', 'Mechanism involving Melanocyte proliferation leading to skin symptoms. Increased melanocyte number and melanin', 'inflammatory', 'A'),
  ('dna_damage_mech', 'DNA damage pathway', 'Mechanism involving DNA damage leading to skin symptoms. UV-induced p53 mutations in keratinocytes', 'inflammatory', 'A'),
  ('autoimmune_destruction_mech', 'Autoimmune destruction pathway', 'Mechanism involving Autoimmune destruction leading to skin symptoms. CD8+ T-cells target melanocytes', 'inflammatory', 'A'),
  ('oxidative_stress_mech', 'Oxidative stress pathway', 'Mechanism involving Oxidative stress leading to skin symptoms. Excessive H2O2 in epidermis; defective catalase', 'inflammatory', 'A'),
  ('koebner_phenomenon_mech', 'Koebner phenomenon pathway', 'Mechanism involving Koebner phenomenon leading to skin symptoms. Trauma initiates new lesions', 'inflammatory', 'A'),
  ('genetic_mutations_mech', 'Genetic mutations pathway', 'Mechanism involving Genetic mutations leading to skin symptoms. BRAF, NRAS, CDKN2A mutations', 'inflammatory', 'A'),
  ('family_history_mech', 'Family history pathway', 'Mechanism involving Family history leading to skin symptoms. 10% have familial melanoma', 'inflammatory', 'A'),
  ('many_nevi_mech', 'Many nevi pathway', 'Mechanism involving Many nevi leading to skin symptoms. >50 common nevi increases risk', 'inflammatory', 'A'),
  ('fluoride_toothpaste_mech', 'Fluoride toothpaste pathway', 'Mechanism involving Fluoride toothpaste leading to skin symptoms. Can trigger or exacerbate', 'metabolic', 'B'),
  ('cosmetics_mech', 'Cosmetics pathway', 'Mechanism involving Cosmetics leading to skin symptoms. Heavy moisturizers, occlusive products', 'inflammatory', 'B'),
  ('keratin_overproduction_mech', 'Keratin overproduction pathway', 'Mechanism involving Keratin overproduction leading to skin symptoms. Excess keratin blocks hair follicles', 'inflammatory', 'A'),
  ('dry_skin_mech', 'Dry skin pathway', 'Mechanism involving Dry skin leading to skin symptoms. Worse in winter; improves with humidity', 'inflammatory', 'A'),
  ('atopic_diathesis_mech', 'Atopic diathesis pathway', 'Mechanism involving Atopic diathesis leading to skin symptoms. Associated with atopic dermatitis', 'inflammatory', 'B'),
  ('low_humidity_mech', 'Low humidity pathway', 'Mechanism involving Low humidity leading to skin symptoms. Winter, indoor heating, desert climates', 'metabolic', 'A'),
  ('aging_mech', 'Aging pathway', 'Mechanism involving Aging leading to skin symptoms. Decreased sebum, ceramides, and natural moisturizing factors', 'inflammatory', 'A'),
  ('harsh_cleansers_mech', 'Harsh cleansers pathway', 'Mechanism involving Harsh cleansers leading to skin symptoms. Strip natural lipids', 'metabolic', 'A'),
  ('hot_water_mech', 'Hot water pathway', 'Mechanism involving Hot water leading to skin symptoms. Strips lipids and damages barrier', 'metabolic', 'A'),
  ('medical_conditions_mech', 'Medical conditions pathway', 'Mechanism involving Medical conditions leading to skin symptoms. Hypothyroidism, diabetes, kidney disease', 'inflammatory', 'B'),
  ('nutritional_deficiency_mech', 'Nutritional deficiency pathway', 'Mechanism involving Nutritional deficiency leading to skin symptoms. Essential fatty acids, vitamins A, D, E', 'metabolic', 'B'),
  ('sun_exposure_mech', 'Sun exposure pathway', 'Mechanism involving Sun exposure leading to skin symptoms. Contributes to development', 'metabolic', 'B'),
  ('oily_skin_mech', 'Oily skin pathway', 'Mechanism involving Oily skin leading to skin symptoms. Malassezia thrives on sebum', 'inflammatory', 'B'),
  ('bacterial_infection_mech', 'Bacterial infection pathway', 'Mechanism involving Bacterial infection leading to skin symptoms. S. aureus most common', 'inflammatory', 'A'),
  ('fungal_infection_mech', 'Fungal infection pathway', 'Mechanism involving Fungal infection leading to skin symptoms. Malassezia, dermatophytes', 'inflammatory', 'A'),
  ('physical_irritation_mech', 'Physical irritation pathway', 'Mechanism involving Physical irritation leading to skin symptoms. Shaving, friction, tight clothing', 'metabolic', 'A'),
  ('ingrown_hairs_mech', 'Ingrown hairs pathway', 'Mechanism involving Ingrown hairs leading to skin symptoms. Curly hair re-enters skin; pseudofolliculitis barbae', 'inflammatory', 'A'),
  ('hot_tub_exposure_mech', 'Hot tub exposure pathway', 'Mechanism involving Hot tub exposure leading to skin symptoms. Pseudomonas folliculitis', 'metabolic', 'A'),
  ('hsv_1_reactivation_mech', 'HSV-1 reactivation pathway', 'Mechanism involving HSV-1 reactivation leading to skin symptoms. Latent virus in trigeminal ganglion reactivates', 'inflammatory', 'A'),
  ('hormonal_changes_mech', 'Hormonal changes pathway', 'Mechanism involving Hormonal changes leading to skin symptoms. Menstrual cycle, pregnancy', 'hormonal', 'B'),
  ('curly_coily_hair_mech', 'Curly/coily hair pathway', 'Mechanism involving Curly/coily hair leading to skin symptoms. Hair re-enters skin after shaving; foreign body reaction', 'inflammatory', 'A'),
  ('close_shaving_mech', 'Close shaving pathway', 'Mechanism involving Close shaving leading to skin symptoms. Multi-blade razors cut hair below skin surface', 'metabolic', 'A'),
  ('pulling_skin_while_shaving_mech', 'Pulling skin while shaving pathway', 'Mechanism involving Pulling skin while shaving leading to skin symptoms. Causes hair to snap back below surface', 'metabolic', 'A'),
  ('androgen_driven_sebaceous_lipogenesis_mech', 'Androgen-driven sebaceous lipogenesis pathway', 'Mechanism involving Androgen-driven sebaceous lipogenesis leading to skin symptoms. DHT is the primary mediator of sebaceous gland activity; testosterone converts to DHT via 5-alpha reductase at the skin level', 'hormonal', 'A'),
  ('insulin_&_igf_1_upregulation_mech', 'Insulin & IGF-1 upregulation pathway', 'Mechanism involving Insulin & IGF-1 upregulation leading to skin symptoms. Spikes in insulin and Insulin-like Growth Factor 1 directly upregulate sebum production via androgen pathway', 'hormonal', 'A'),
  ('dairy_&_whey_protein_mech', 'Dairy & whey protein pathway', 'Mechanism involving Dairy & whey protein leading to skin symptoms. Dairy (especially whey) increases IGF-1 levels, amplifying androgen-driven sebum production', 'metabolic', 'B'),
  ('collagen_&_elastin_loss_(aging)_mech', 'Collagen & elastin loss (aging) pathway', 'Mechanism involving Collagen & elastin loss (aging) leading to skin symptoms. Decreased collagen and elastin around pore openings reduces structural support, making pores appear larger', 'inflammatory', 'A'),
  ('dht_conversion_mech', 'DHT conversion pathway', 'Mechanism involving DHT conversion leading to skin symptoms. Testosterone converts to more potent DHT via 5-alpha reductase, amplifying sebum production signal', 'hormonal', 'A'),
  ('over_exfoliation_mech', 'Over-exfoliation pathway', 'Mechanism involving Over-exfoliation leading to skin symptoms. Excessive use of acids, retinoids, or physical scrubs damages barrier', 'metabolic', 'A'),
  ('environmental_damage_mech', 'Environmental damage pathway', 'Mechanism involving Environmental damage leading to skin symptoms. Pollution, wind, cold weather damage barrier lipids', 'metabolic', 'A') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, pathway_type = EXCLUDED.pathway_type, evidence_level = EXCLUDED.evidence_level;

-- Seeded 86 mechanisms

-- ============================================
-- SEED DATA: SUPPLEMENTS
-- ============================================

INSERT INTO public.supplements (id, name, dosage, evidence_level, benefits, concerns_treated) VALUES
  ('zinc_picolinate_25_30mg', 'Zinc picolinate', '30mg', 'B', ARRAY['Inhibits 5-alpha reductase, anti-inflammatory; pair with copper 2-3mg', 'Modulates total androgen activity; natural anti-inflammatory; reduces lipid content of sebum. Pair with copper 2-3mg.'], ARRAY['acne-vulgaris', 'excess-sebum-enlarged-pores']),
  ('omega_3_(epa_dha_1000_2000mg)', 'Omega-', '2000mg', 'B', ARRAY['Anti-inflammatory; reduces PGE2 and LTB4; improves insulin sensitivity', 'Anti-inflammatory; improves insulin sensitivity; reduces prostaglandin-driven sebum production.', 'Essential fatty acids; supports barrier repair and reduces inflammation'], ARRAY['acne-vulgaris', 'excess-sebum-enlarged-pores', 'barrier-dysfunction']),
  ('vitamin_d3_2000_4000_iu', 'Vitamin D', '4000 IU', 'B', ARRAY['Deficiency common in acne; immune modulation; check 25(OH)D levels'], ARRAY['acne-vulgaris']),
  ('spearmint_tea', 'Spearmint tea', '2 cups daily showed reduction in free testosterone', 'B', ARRAY['Anti-androgen properties; 2 cups daily showed reduction in free testosterone'], ARRAY['hormonal-acne']),
  ('zinc_25_30mg', 'Zinc', '30mg', 'B', ARRAY['Inhibits 5-alpha reductase; reduces androgen-driven sebum'], ARRAY['hormonal-acne']),
  ('inositol_(myo_inositol)', 'Inositol (myo-inositol)', 'As directed', 'B', ARRAY['Improves insulin sensitivity; especially beneficial for PCOS-related acne'], ARRAY['hormonal-acne']),
  ('dim_(diindolylmethane)', 'DIM (diindolylmethane)', 'As directed', 'D', ARRAY['Promotes estrogen metabolism toward beneficial 2-hydroxyestrone pathway'], ARRAY['hormonal-acne']),
  ('zinc_15_25mg', 'Zinc', '25mg', 'B', ARRAY['Anti-inflammatory; supports healing', 'Anti-inflammatory support'], ARRAY['acne-mechanica', 'rosacea']),
  ('probiotics', 'Probiotics', 'As directed', 'D', ARRAY['Support microbiome balance', 'Gut-skin axis support', 'Support gut-skin axis'], ARRAY['fungal-acne', 'rosacea', 'psoriasis', 'perioral-dermatitis', 'tinea-versicolor']),
  ('omega_3', 'Omega-', 'As directed', 'B', ARRAY['Anti-inflammatory support', 'Anti-inflammatory; may improve skin texture'], ARRAY['steroid-acne', 'seborrheic-dermatitis', 'keratosis-pilaris', 'razor-bumps']),
  ('omega_3_(epa_dha)', 'Omega-', 'As directed', 'B', ARRAY['Anti-inflammatory; reduces flushing', 'Anti-inflammatory; reduces Th2 response', 'Anti-inflammatory; reduces disease severity', 'Essential fatty acids; supports barrier'], ARRAY['rosacea', 'atopic-dermatitis', 'psoriasis', 'xerosis']),
  ('vitamin_d3', 'Vitamin D', 'As directed', 'B', ARRAY['Deficiency common in eczema; immune modulation', 'Deficiency common; immune modulation'], ARRAY['atopic-dermatitis', 'psoriasis']),
  ('probiotics_(lactobacillus,_bifidobacterium)', 'Probiotics (Lactobacillus, Bifidobacterium)', 'As directed', 'B', ARRAY['Support gut and skin microbiome'], ARRAY['atopic-dermatitis']),
  ('quercetin', 'Quercetin', 'As directed', 'D', ARRAY['Natural mast cell stabilizer; antihistamine properties'], ARRAY['atopic-dermatitis']),
  ('vitamin_c', 'Vitamin C', 'As directed', 'B', ARRAY['Supports barrier repair and antioxidant defense', 'Antioxidant support', 'Antioxidant; supports melanin normalization', 'Immune support; wound healing'], ARRAY['contact-dermatitis', 'melasma', 'post-inflammatory-hyperpigmentation', 'cold-sore']),
  ('biotin', 'Biotin', 'As directed', 'D', ARRAY['Supports skin health'], ARRAY['seborrheic-dermatitis']),
  ('curcumin', 'Curcumin', 'As directed', 'B', ARRAY['Anti-inflammatory; Th17 modulation'], ARRAY['psoriasis']),
  ('oral_tranexamic_acid', 'Oral tranexamic acid', '250mg 2x daily', 'A', ARRAY['250mg 2x daily; prescription; significant improvement'], ARRAY['melasma']),
  ('polypodium_leucotomos', 'Polypodium leucotomos', 'As directed', 'B', ARRAY['Oral photoprotectant; reduces UV-induced pigmentation', 'Oral photoprotectant', 'Oral photoprotectant; may enhance repigmentation'], ARRAY['melasma', 'solar-lentigines', 'vitiligo']),
  ('zinc', 'Zinc', 'As directed', 'B', ARRAY['Anti-inflammatory; supports healing', 'Anti-inflammatory; immune support', 'Immune support; antiviral properties'], ARRAY['post-inflammatory-hyperpigmentation', 'folliculitis', 'cold-sore']),
  ('vitamin_d', 'Vitamin D', 'As directed', 'B', ARRAY['Deficiency common; immune modulation', 'Maintain adequate levels'], ARRAY['actinic-keratosis', 'skin-cancer-melanoma']),
  ('vitamin_e', 'Vitamin E', 'As directed', 'B', ARRAY['Antioxidant; supports barrier', 'Antioxidant; supports barrier repair'], ARRAY['xerosis', 'barrier-dysfunction']),
  ('hyaluronic_acid_(oral)', 'Hyaluronic acid (oral)', 'As directed', 'D', ARRAY['May improve skin hydration'], ARRAY['xerosis']),
  ('l_lysine', 'L-Lysine', 'As directed', 'B', ARRAY['May reduce recurrence frequency'], ARRAY['cold-sore']),
  ('green_tea_extract_(egcg)_400_800mg', 'Green Tea Extract (EGCG)', '800mg', 'B', ARRAY['Systemic 5-alpha reductase inhibitor; reduces DHT production from inside.'], ARRAY['excess-sebum-enlarged-pores']) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, dosage = EXCLUDED.dosage, evidence_level = EXCLUDED.evidence_level, benefits = EXCLUDED.benefits, concerns_treated = EXCLUDED.concerns_treated;

-- Seeded 25 supplements

-- ============================================
-- SEED DATA: CAUSE-CONDITION LINKS
-- ============================================

INSERT INTO public.cause_condition_links (root_cause_id, condition_id, relationship, mechanism_summary, evidence_level) VALUES
  ('follicular_hyperkeratinization', 'acne-vulgaris', 'causes', 'Abnormal desquamation of keratinocytes leading to microcomedone formation', 'A'),
  ('increased_sebum_production', 'acne-vulgaris', 'causes', 'Androgen-driven sebaceous gland hyperplasia; DHT is primary mediator', 'A'),
  ('c._acnes_colonization', 'acne-vulgaris', 'causes', 'IA1 phylotype triggers inflammatory cascade via TLR2/TLR4', 'A'),
  ('inflammation', 'acne-vulgaris', 'causes', 'Innate immune response to C. acnes and biofilm formation', 'A'),
  ('high_glycemic_diet', 'acne-vulgaris', 'aggravates', 'High glycemic load increases IGF-1, stimulating sebum production', 'B'),
  ('gut_dysbiosis', 'acne-vulgaris', 'aggravates', 'Gut-skin axis; dysbiosis may drive systemic inflammation', 'D'),
  ('insulin_resistance', 'acne-vulgaris', 'aggravates', 'Hyperinsulinemia increases androgens and IGF-1', 'B'),
  ('chronic_stress', 'acne-vulgaris', 'aggravates', 'CRH/ACTH axis increases cortisol and androgens, stimulating sebum', 'B'),
  ('androgen_excess', 'hormonal-acne', 'causes', 'DHEA-S, testosterone, DHT drive sebum production', 'A'),
  ('estrogen_fluctuations', 'hormonal-acne', 'causes', 'Mid-cycle and premenstrual estrogen drops worsen acne', 'A'),
  ('insulin_resistance', 'hormonal-acne', 'causes', 'PCOS-related; increases androgens and IGF-1', 'A'),
  ('cortisol_dysregulation', 'hormonal-acne', 'aggravates', 'Stress increases cortisol which increases androgens', 'B'),
  ('gut_dysbiosis', 'hormonal-acne', 'aggravates', 'Estrobolome dysfunction affects estrogen metabolism', 'D'),
  ('mechanical_friction', 'acne-mechanica', 'causes', 'Physical irritation disrupts follicular epithelium', 'A'),
  ('heat_and_occlusion', 'acne-mechanica', 'causes', 'Traps sweat and sebum, promoting bacterial growth', 'A'),
  ('pressure', 'acne-mechanica', 'causes', 'Compresses follicles and increases inflammation', 'A'),
  ('malassezia_overgrowth', 'fungal-acne', 'causes', 'Lipophilic yeast thrives in sebum-rich environments', 'A'),
  ('heat_and_humidity', 'fungal-acne', 'causes', 'Promotes yeast proliferation', 'A'),
  ('antibiotic_use', 'fungal-acne', 'causes', 'Disrupts bacterial balance, allowing yeast overgrowth', 'A'),
  ('immunosuppression', 'fungal-acne', 'aggravates', 'Reduced immune control of commensal yeast', 'B'),
  ('systemic_corticosteroids', 'steroid-acne', 'causes', 'Prednisone and similar trigger sebaceous hyperplasia', 'A'),
  ('anabolic_steroids', 'steroid-acne', 'causes', 'Exogenous androgens increase sebum production', 'A'),
  ('topical_steroid_overuse', 'steroid-acne', 'causes', 'Perioral and facial acneiform eruption', 'A'),
  ('neurovascular_dysregulation', 'rosacea', 'causes', 'Abnormal blood vessel reactivity and inflammation', 'A'),
  ('demodex_mite_overgrowth', 'rosacea', 'aggravates', 'Demodex folliculorum density higher in rosacea patients', 'B'),
  ('genetic_predisposition', 'rosacea', 'aggravates', 'Family history common; Celtic/Northern European ancestry', 'B'),
  ('uv_damage', 'rosacea', 'causes', 'Chronic sun exposure damages vessels and skin', 'A'),
  ('gut_dysbiosis', 'rosacea', 'aggravates', 'H. pylori and SIBO associations reported', 'D'),
  ('chronic_stress', 'rosacea', 'aggravates', 'Stress triggers flushing and neurogenic inflammation', 'B'),
  ('barrier_dysfunction', 'atopic-dermatitis', 'causes', 'Filaggrin mutations; ceramide deficiency; increased TEWL', 'A'),
  ('th2_immune_dysregulation', 'atopic-dermatitis', 'causes', 'IL-4, IL-5, IL-13 drive inflammation and pruritus', 'A'),
  ('environmental_allergens', 'atopic-dermatitis', 'causes', 'Dust mites, pollen, pet dander trigger flares', 'A'),
  ('microbiome_dysbiosis', 'atopic-dermatitis', 'causes', 'S. aureus overgrowth; reduced microbial diversity', 'A'),
  ('gut_dysbiosis', 'atopic-dermatitis', 'aggravates', 'Leaky gut may increase systemic inflammation', 'B'),
  ('stress', 'atopic-dermatitis', 'causes', 'Stress worsens symptoms via HPA axis and immune modulation', 'A'),
  ('food_triggers', 'atopic-dermatitis', 'aggravates', 'Dairy, eggs, wheat, soy in some patients', 'B'),
  ('irritant_exposure', 'contact-dermatitis', 'causes', 'Detergents, solvents, acids, alkalis directly damage skin', 'A'),
  ('allergic_sensitization', 'contact-dermatitis', 'causes', 'Type IV hypersensitivity to specific allergens', 'A'),
  ('barrier_dysfunction', 'contact-dermatitis', 'causes', 'Impaired barrier allows penetration of irritants/allergens', 'A'),
  ('malassezia_overgrowth', 'seborrheic-dermatitis', 'causes', 'Lipophilic yeast colonizes sebum-rich areas', 'A'),
  ('sebaceous_gland_activity', 'seborrheic-dermatitis', 'causes', 'Androgen-driven sebum production feeds yeast', 'A'),
  ('immune_response', 'seborrheic-dermatitis', 'causes', 'Individual susceptibility to Malassezia antigens', 'A'),
  ('neurological_conditions', 'seborrheic-dermatitis', 'aggravates', 'Parkinson''s disease increases risk', 'B'),
  ('stress', 'seborrheic-dermatitis', 'aggravates', 'Psychological stress exacerbates symptoms', 'B'),
  ('genetic_predisposition', 'psoriasis', 'causes', '30% family history; PSORS1 locus (HLA-Cw6) major susceptibility', 'A'),
  ('th1_th17_immune_dysregulation', 'psoriasis', 'causes', 'TNF-α, IL-17, IL-23 are key cytokines', 'A'),
  ('environmental_triggers', 'psoriasis', 'causes', 'Infection, trauma, stress, medications', 'A'),
  ('gut_dysbiosis', 'psoriasis', 'aggravates', 'Leaky gut, SIBO, and dysbiosis linked to psoriasis', 'D'),
  ('obesity_metabolic_syndrome', 'psoriasis', 'causes', 'Adipokines promote inflammation; weight loss improves severity', 'A'),
  ('alcohol_and_smoking', 'psoriasis', 'causes', 'Exacerbate psoriasis and reduce treatment response', 'A'),
  ('uv_radiation', 'melasma', 'causes', 'Stimulates melanocyte activity', 'A'),
  ('hormonal_factors', 'melasma', 'causes', 'Estrogen, progesterone; pregnancy, OCPs, HRT', 'A'),
  ('genetic_predisposition', 'melasma', 'causes', 'Family history common; darker skin types', 'A'),
  ('visible_light', 'melasma', 'aggravates', 'Contributes to pigmentation in darker skin', 'B'),
  ('thyroid_disease', 'melasma', 'aggravates', 'Autoimmune thyroid disease association', 'B'),
  ('inflammatory_mediator_release', 'post-inflammatory-hyperpigmentation', 'causes', 'IL-1, TNF-α, GM-CSF stimulate melanocytes', 'A'),
  ('melanocyte_activation', 'post-inflammatory-hyperpigmentation', 'causes', 'Inflammation triggers melanin production', 'A'),
  ('uv_exposure', 'post-inflammatory-hyperpigmentation', 'causes', 'Post-inflammatory skin is photosensitive; UV worsens PIH', 'A'),
  ('genetic_predisposition', 'post-inflammatory-hyperpigmentation', 'causes', 'Fitzpatrick III-VI at much higher risk', 'A'),
  ('chronic_uv_exposure', 'solar-lentigines', 'causes', 'Cumulative sun damage; UVA primarily responsible', 'A'),
  ('melanocyte_proliferation', 'solar-lentigines', 'causes', 'Increased melanocyte number and melanin', 'A'),
  ('dna_damage', 'solar-lentigines', 'causes', 'UV-induced p53 mutations in keratinocytes', 'A'),
  ('autoimmune_destruction', 'vitiligo', 'causes', 'CD8+ T-cells target melanocytes', 'A'),
  ('genetic_predisposition', 'vitiligo', 'causes', 'Polygenic; 30% family history', 'A'),
  ('oxidative_stress', 'vitiligo', 'causes', 'Excessive H2O2 in epidermis; defective catalase', 'A'),
  ('thyroid_disease', 'vitiligo', 'causes', '20-30% have autoimmune thyroid dysfunction', 'A'),
  ('koebner_phenomenon', 'vitiligo', 'causes', 'Trauma initiates new lesions', 'A'),
  ('chronic_uv_exposure', 'actinic-keratosis', 'causes', 'Cumulative DNA damage to keratinocytes', 'A'),
  ('immunosuppression', 'actinic-keratosis', 'causes', 'Organ transplant recipients at very high risk', 'A'),
  ('genetic_predisposition', 'actinic-keratosis', 'aggravates', 'Fair skin, family history', 'B'),
  ('uv_radiation', 'skin-cancer-melanoma', 'causes', 'Primary cause for most melanoma types', 'A'),
  ('genetic_mutations', 'skin-cancer-melanoma', 'causes', 'BRAF, NRAS, CDKN2A mutations', 'A'),
  ('family_history', 'skin-cancer-melanoma', 'causes', '10% have familial melanoma', 'A'),
  ('many_nevi', 'skin-cancer-melanoma', 'causes', '>50 common nevi increases risk', 'A'),
  ('immunosuppression', 'skin-cancer-melanoma', 'aggravates', 'Organ transplant recipients at higher risk', 'B'),
  ('topical_steroid_overuse', 'perioral-dermatitis', 'causes', 'Most common trigger; especially potent steroids on face', 'A'),
  ('fluoride_toothpaste', 'perioral-dermatitis', 'aggravates', 'Can trigger or exacerbate', 'B'),
  ('cosmetics', 'perioral-dermatitis', 'aggravates', 'Heavy moisturizers, occlusive products', 'B'),
  ('hormonal_factors', 'perioral-dermatitis', 'aggravates', 'More common in women', 'B'),
  ('microbiome_dysbiosis', 'perioral-dermatitis', 'aggravates', 'C. acnes and Demodex implicated', 'D'),
  ('keratin_overproduction', 'keratosis-pilaris', 'causes', 'Excess keratin blocks hair follicles', 'A'),
  ('genetic_predisposition', 'keratosis-pilaris', 'causes', 'Autosomal dominant; often familial', 'A'),
  ('dry_skin', 'keratosis-pilaris', 'causes', 'Worse in winter; improves with humidity', 'A'),
  ('atopic_diathesis', 'keratosis-pilaris', 'aggravates', 'Associated with atopic dermatitis', 'B'),
  ('low_humidity', 'xerosis', 'causes', 'Winter, indoor heating, desert climates', 'A'),
  ('aging', 'xerosis', 'causes', 'Decreased sebum, ceramides, and natural moisturizing factors', 'A'),
  ('harsh_cleansers', 'xerosis', 'causes', 'Strip natural lipids', 'A'),
  ('hot_water', 'xerosis', 'causes', 'Strips lipids and damages barrier', 'A'),
  ('medical_conditions', 'xerosis', 'aggravates', 'Hypothyroidism, diabetes, kidney disease', 'B'),
  ('nutritional_deficiency', 'xerosis', 'aggravates', 'Essential fatty acids, vitamins A, D, E', 'B'),
  ('genetic_predisposition', 'seborrheic-keratosis', 'causes', 'Autosomal dominant in some families', 'A'),
  ('sun_exposure', 'seborrheic-keratosis', 'aggravates', 'Contributes to development', 'B'),
  ('aging', 'seborrheic-keratosis', 'causes', 'Very common after age 50', 'A'),
  ('malassezia_overgrowth', 'tinea-versicolor', 'causes', 'Yeast converts to mycelial form under certain conditions', 'A'),
  ('heat_and_humidity', 'tinea-versicolor', 'causes', 'Promotes yeast proliferation', 'A'),
  ('oily_skin', 'tinea-versicolor', 'aggravates', 'Malassezia thrives on sebum', 'B'),
  ('immunosuppression', 'tinea-versicolor', 'aggravates', 'Increased susceptibility', 'B'),
  ('bacterial_infection', 'folliculitis', 'causes', 'S. aureus most common', 'A'),
  ('fungal_infection', 'folliculitis', 'causes', 'Malassezia, dermatophytes', 'A'),
  ('physical_irritation', 'folliculitis', 'causes', 'Shaving, friction, tight clothing', 'A'),
  ('ingrown_hairs', 'folliculitis', 'causes', 'Curly hair re-enters skin; pseudofolliculitis barbae', 'A'),
  ('hot_tub_exposure', 'folliculitis', 'causes', 'Pseudomonas folliculitis', 'A'),
  ('hsv_1_reactivation', 'cold-sore', 'causes', 'Latent virus in trigeminal ganglion reactivates', 'A'),
  ('immunosuppression', 'cold-sore', 'causes', 'Stress, illness, UV exposure trigger reactivation', 'A'),
  ('uv_exposure', 'cold-sore', 'causes', 'Common trigger for outbreaks', 'A'),
  ('stress', 'cold-sore', 'causes', 'Psychological and physical stress', 'A'),
  ('hormonal_changes', 'cold-sore', 'aggravates', 'Menstrual cycle, pregnancy', 'B'),
  ('curly_coily_hair', 'razor-bumps', 'causes', 'Hair re-enters skin after shaving; foreign body reaction', 'A'),
  ('close_shaving', 'razor-bumps', 'causes', 'Multi-blade razors cut hair below skin surface', 'A'),
  ('pulling_skin_while_shaving', 'razor-bumps', 'causes', 'Causes hair to snap back below surface', 'A'),
  ('genetic_predisposition', 'razor-bumps', 'causes', 'African descent; curly hair pattern', 'A'),
  ('androgen_driven_sebaceous_lipogenesis', 'excess-sebum-enlarged-pores', 'causes', 'DHT is the primary mediator of sebaceous gland activity; testosterone converts to DHT via 5-alpha reductase at the skin level', 'A'),
  ('insulin_&_igf_1_upregulation', 'excess-sebum-enlarged-pores', 'causes', 'Spikes in insulin and Insulin-like Growth Factor 1 directly upregulate sebum production via androgen pathway', 'A'),
  ('high_glycemic_diet', 'excess-sebum-enlarged-pores', 'aggravates', 'High glycemic load increases insulin and IGF-1, which directly stimulate sebaceous glands', 'B'),
  ('dairy_&_whey_protein', 'excess-sebum-enlarged-pores', 'aggravates', 'Dairy (especially whey) increases IGF-1 levels, amplifying androgen-driven sebum production', 'B'),
  ('follicular_hyperkeratinization', 'excess-sebum-enlarged-pores', 'causes', 'Abnormal shedding of dead skin cells inside the pore creates plugs that trap sebum and stretch the follicle wall', 'A'),
  ('collagen_&_elastin_loss_(aging)', 'excess-sebum-enlarged-pores', 'causes', 'Decreased collagen and elastin around pore openings reduces structural support, making pores appear larger', 'A'),
  ('chronic_stress', 'excess-sebum-enlarged-pores', 'aggravates', 'CRH/ACTH axis increases cortisol and androgens, stimulating sebum production', 'B'),
  ('dht_conversion', 'excess-sebum-enlarged-pores', 'causes', 'Testosterone converts to more potent DHT via 5-alpha reductase, amplifying sebum production signal', 'A'),
  ('over_exfoliation', 'barrier-dysfunction', 'causes', 'Excessive use of acids, retinoids, or physical scrubs damages barrier', 'A'),
  ('harsh_cleansers', 'barrier-dysfunction', 'causes', 'Sulfates and alkaline cleansers strip natural lipids', 'A'),
  ('environmental_damage', 'barrier-dysfunction', 'causes', 'Pollution, wind, cold weather damage barrier lipids', 'A'),
  ('uv_damage', 'barrier-dysfunction', 'causes', 'UV radiation damages lipids and proteins in stratum corneum', 'A') ON CONFLICT (root_cause_id, condition_id) DO UPDATE SET relationship = EXCLUDED.relationship, mechanism_summary = EXCLUDED.mechanism_summary, evidence_level = EXCLUDED.evidence_level;

-- Seeded 123 cause-condition links

-- ============================================
-- SEED DATA: MECHANISM CHAINS
-- ============================================

INSERT INTO public.mechanism_chains (root_cause_id, mechanism_id, condition_id, description, evidence_level) VALUES
  ('follicular_hyperkeratinization', 'follicular_hyperkeratinization_mech', 'acne-vulgaris', 'Follicular hyperkeratinization affects skin through skin pathways leading to Acne Vulgaris', 'A'),
  ('increased_sebum_production', 'increased_sebum_production_mech', 'acne-vulgaris', 'Increased sebum production affects skin through hormones pathways leading to Acne Vulgaris', 'A'),
  ('c._acnes_colonization', 'c._acnes_colonization_mech', 'acne-vulgaris', 'C. acnes colonization affects skin through skin pathways leading to Acne Vulgaris', 'A'),
  ('inflammation', 'inflammation_mech', 'acne-vulgaris', 'Inflammation affects skin through skin pathways leading to Acne Vulgaris', 'A'),
  ('high_glycemic_diet', 'high_glycemic_diet_mech', 'acne-vulgaris', 'High glycemic diet affects skin through nutrition pathways leading to Acne Vulgaris', 'B'),
  ('gut_dysbiosis', 'gut_dysbiosis_mech', 'acne-vulgaris', 'Gut dysbiosis affects skin through gut pathways leading to Acne Vulgaris', 'D'),
  ('insulin_resistance', 'insulin_resistance_mech', 'acne-vulgaris', 'Insulin resistance affects skin through hormones pathways leading to Acne Vulgaris', 'B'),
  ('chronic_stress', 'chronic_stress_mech', 'acne-vulgaris', 'Chronic stress affects skin through lifestyle pathways leading to Acne Vulgaris', 'B'),
  ('androgen_excess', 'androgen_excess_mech', 'hormonal-acne', 'Androgen excess affects skin through hormones pathways leading to Hormonal Acne', 'A'),
  ('estrogen_fluctuations', 'estrogen_fluctuations_mech', 'hormonal-acne', 'Estrogen fluctuations affects skin through hormones pathways leading to Hormonal Acne', 'A'),
  ('insulin_resistance', 'insulin_resistance_mech', 'hormonal-acne', 'Insulin resistance affects skin through hormones pathways leading to Hormonal Acne', 'A'),
  ('cortisol_dysregulation', 'cortisol_dysregulation_mech', 'hormonal-acne', 'Cortisol dysregulation affects skin through hormones pathways leading to Hormonal Acne', 'B'),
  ('gut_dysbiosis', 'gut_dysbiosis_mech', 'hormonal-acne', 'Gut dysbiosis affects skin through gut pathways leading to Hormonal Acne', 'D'),
  ('mechanical_friction', 'mechanical_friction_mech', 'acne-mechanica', 'Mechanical friction affects skin through skin pathways leading to Acne Mechanica', 'A'),
  ('heat_and_occlusion', 'heat_and_occlusion_mech', 'acne-mechanica', 'Heat and occlusion affects skin through lifestyle pathways leading to Acne Mechanica', 'A'),
  ('pressure', 'pressure_mech', 'acne-mechanica', 'Pressure affects skin through lifestyle pathways leading to Acne Mechanica', 'A'),
  ('malassezia_overgrowth', 'malassezia_overgrowth_mech', 'fungal-acne', 'Malassezia overgrowth affects skin through skin pathways leading to Fungal Acne (Malassezia Folliculitis)', 'A'),
  ('heat_and_humidity', 'heat_and_humidity_mech', 'fungal-acne', 'Heat and humidity affects skin through lifestyle pathways leading to Fungal Acne (Malassezia Folliculitis)', 'A'),
  ('antibiotic_use', 'antibiotic_use_mech', 'fungal-acne', 'Antibiotic use affects skin through skin pathways leading to Fungal Acne (Malassezia Folliculitis)', 'A'),
  ('immunosuppression', 'immunosuppression_mech', 'fungal-acne', 'Immunosuppression affects skin through lifestyle pathways leading to Fungal Acne (Malassezia Folliculitis)', 'B'),
  ('systemic_corticosteroids', 'systemic_corticosteroids_mech', 'steroid-acne', 'Systemic corticosteroids affects skin through skin pathways leading to Steroid Acne', 'A'),
  ('anabolic_steroids', 'anabolic_steroids_mech', 'steroid-acne', 'Anabolic steroids affects skin through hormones pathways leading to Steroid Acne', 'A'),
  ('topical_steroid_overuse', 'topical_steroid_overuse_mech', 'steroid-acne', 'Topical steroid overuse affects skin through skin pathways leading to Steroid Acne', 'A'),
  ('neurovascular_dysregulation', 'neurovascular_dysregulation_mech', 'rosacea', 'Neurovascular dysregulation affects skin through skin pathways leading to Rosacea', 'A'),
  ('demodex_mite_overgrowth', 'demodex_mite_overgrowth_mech', 'rosacea', 'Demodex mite overgrowth affects skin through skin pathways leading to Rosacea', 'B'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'rosacea', 'Genetic predisposition affects skin through skin pathways leading to Rosacea', 'B'),
  ('uv_damage', 'uv_damage_mech', 'rosacea', 'UV damage affects skin through lifestyle pathways leading to Rosacea', 'A'),
  ('gut_dysbiosis', 'gut_dysbiosis_mech', 'rosacea', 'Gut dysbiosis affects skin through gut pathways leading to Rosacea', 'D'),
  ('chronic_stress', 'chronic_stress_mech', 'rosacea', 'Chronic stress affects skin through lifestyle pathways leading to Rosacea', 'B'),
  ('barrier_dysfunction', 'barrier_dysfunction_mech', 'atopic-dermatitis', 'Barrier dysfunction affects skin through skin pathways leading to Atopic Dermatitis (Eczema)', 'A'),
  ('th2_immune_dysregulation', 'th2_immune_dysregulation_mech', 'atopic-dermatitis', 'Th2 immune dysregulation affects skin through skin pathways leading to Atopic Dermatitis (Eczema)', 'A'),
  ('environmental_allergens', 'environmental_allergens_mech', 'atopic-dermatitis', 'Environmental allergens affects skin through lifestyle pathways leading to Atopic Dermatitis (Eczema)', 'A'),
  ('microbiome_dysbiosis', 'microbiome_dysbiosis_mech', 'atopic-dermatitis', 'Microbiome dysbiosis affects skin through skin pathways leading to Atopic Dermatitis (Eczema)', 'A'),
  ('gut_dysbiosis', 'gut_dysbiosis_mech', 'atopic-dermatitis', 'Gut dysbiosis affects skin through gut pathways leading to Atopic Dermatitis (Eczema)', 'B'),
  ('stress', 'stress_mech', 'atopic-dermatitis', 'Stress affects skin through lifestyle pathways leading to Atopic Dermatitis (Eczema)', 'A'),
  ('food_triggers', 'food_triggers_mech', 'atopic-dermatitis', 'Food triggers affects skin through nutrition pathways leading to Atopic Dermatitis (Eczema)', 'B'),
  ('irritant_exposure', 'irritant_exposure_mech', 'contact-dermatitis', 'Irritant exposure affects skin through skin pathways leading to Contact Dermatitis', 'A'),
  ('allergic_sensitization', 'allergic_sensitization_mech', 'contact-dermatitis', 'Allergic sensitization affects skin through skin pathways leading to Contact Dermatitis', 'A'),
  ('barrier_dysfunction', 'barrier_dysfunction_mech', 'contact-dermatitis', 'Barrier dysfunction affects skin through skin pathways leading to Contact Dermatitis', 'A'),
  ('malassezia_overgrowth', 'malassezia_overgrowth_mech', 'seborrheic-dermatitis', 'Malassezia overgrowth affects skin through skin pathways leading to Seborrheic Dermatitis', 'A'),
  ('sebaceous_gland_activity', 'sebaceous_gland_activity_mech', 'seborrheic-dermatitis', 'Sebaceous gland activity affects skin through hormones pathways leading to Seborrheic Dermatitis', 'A'),
  ('immune_response', 'immune_response_mech', 'seborrheic-dermatitis', 'Immune response affects skin through skin pathways leading to Seborrheic Dermatitis', 'A'),
  ('neurological_conditions', 'neurological_conditions_mech', 'seborrheic-dermatitis', 'Neurological conditions affects skin through lifestyle pathways leading to Seborrheic Dermatitis', 'B'),
  ('stress', 'stress_mech', 'seborrheic-dermatitis', 'Stress affects skin through lifestyle pathways leading to Seborrheic Dermatitis', 'B'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'psoriasis', 'Genetic predisposition affects skin through skin pathways leading to Psoriasis', 'A'),
  ('th1_th17_immune_dysregulation', 'th1_th17_immune_dysregulation_mech', 'psoriasis', 'Th1/Th17 immune dysregulation affects skin through skin pathways leading to Psoriasis', 'A'),
  ('environmental_triggers', 'environmental_triggers_mech', 'psoriasis', 'Environmental triggers affects skin through lifestyle pathways leading to Psoriasis', 'A'),
  ('gut_dysbiosis', 'gut_dysbiosis_mech', 'psoriasis', 'Gut dysbiosis affects skin through gut pathways leading to Psoriasis', 'D'),
  ('obesity_metabolic_syndrome', 'obesity_metabolic_syndrome_mech', 'psoriasis', 'Obesity/metabolic syndrome affects skin through nutrition pathways leading to Psoriasis', 'A'),
  ('alcohol_and_smoking', 'alcohol_and_smoking_mech', 'psoriasis', 'Alcohol and smoking affects skin through lifestyle pathways leading to Psoriasis', 'A'),
  ('uv_radiation', 'uv_radiation_mech', 'melasma', 'UV radiation affects skin through lifestyle pathways leading to Melasma', 'A'),
  ('hormonal_factors', 'hormonal_factors_mech', 'melasma', 'Hormonal factors affects skin through hormones pathways leading to Melasma', 'A'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'melasma', 'Genetic predisposition affects skin through skin pathways leading to Melasma', 'A'),
  ('visible_light', 'visible_light_mech', 'melasma', 'Visible light affects skin through lifestyle pathways leading to Melasma', 'B'),
  ('thyroid_disease', 'thyroid_disease_mech', 'melasma', 'Thyroid disease affects skin through hormones pathways leading to Melasma', 'B'),
  ('inflammatory_mediator_release', 'inflammatory_mediator_release_mech', 'post-inflammatory-hyperpigmentation', 'Inflammatory mediator release affects skin through skin pathways leading to Post-Inflammatory Hyperpigmentation (PIH)', 'A'),
  ('melanocyte_activation', 'melanocyte_activation_mech', 'post-inflammatory-hyperpigmentation', 'Melanocyte activation affects skin through skin pathways leading to Post-Inflammatory Hyperpigmentation (PIH)', 'A'),
  ('uv_exposure', 'uv_exposure_mech', 'post-inflammatory-hyperpigmentation', 'UV exposure affects skin through lifestyle pathways leading to Post-Inflammatory Hyperpigmentation (PIH)', 'A'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'post-inflammatory-hyperpigmentation', 'Genetic predisposition affects skin through skin pathways leading to Post-Inflammatory Hyperpigmentation (PIH)', 'A'),
  ('chronic_uv_exposure', 'chronic_uv_exposure_mech', 'solar-lentigines', 'Chronic UV exposure affects skin through lifestyle pathways leading to Solar Lentigines', 'A'),
  ('melanocyte_proliferation', 'melanocyte_proliferation_mech', 'solar-lentigines', 'Melanocyte proliferation affects skin through skin pathways leading to Solar Lentigines', 'A'),
  ('dna_damage', 'dna_damage_mech', 'solar-lentigines', 'DNA damage affects skin through skin pathways leading to Solar Lentigines', 'A'),
  ('autoimmune_destruction', 'autoimmune_destruction_mech', 'vitiligo', 'Autoimmune destruction affects skin through skin pathways leading to Vitiligo', 'A'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'vitiligo', 'Genetic predisposition affects skin through skin pathways leading to Vitiligo', 'A'),
  ('oxidative_stress', 'oxidative_stress_mech', 'vitiligo', 'Oxidative stress affects skin through skin pathways leading to Vitiligo', 'A'),
  ('thyroid_disease', 'thyroid_disease_mech', 'vitiligo', 'Thyroid disease affects skin through hormones pathways leading to Vitiligo', 'A'),
  ('koebner_phenomenon', 'koebner_phenomenon_mech', 'vitiligo', 'Koebner phenomenon affects skin through skin pathways leading to Vitiligo', 'A'),
  ('chronic_uv_exposure', 'chronic_uv_exposure_mech', 'actinic-keratosis', 'Chronic UV exposure affects skin through lifestyle pathways leading to Actinic Keratosis', 'A'),
  ('immunosuppression', 'immunosuppression_mech', 'actinic-keratosis', 'Immunosuppression affects skin through lifestyle pathways leading to Actinic Keratosis', 'A'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'actinic-keratosis', 'Genetic predisposition affects skin through skin pathways leading to Actinic Keratosis', 'B'),
  ('uv_radiation', 'uv_radiation_mech', 'skin-cancer-melanoma', 'UV radiation affects skin through lifestyle pathways leading to Skin Cancer (Melanoma)', 'A'),
  ('genetic_mutations', 'genetic_mutations_mech', 'skin-cancer-melanoma', 'Genetic mutations affects skin through skin pathways leading to Skin Cancer (Melanoma)', 'A'),
  ('family_history', 'family_history_mech', 'skin-cancer-melanoma', 'Family history affects skin through skin pathways leading to Skin Cancer (Melanoma)', 'A'),
  ('many_nevi', 'many_nevi_mech', 'skin-cancer-melanoma', 'Many nevi affects skin through skin pathways leading to Skin Cancer (Melanoma)', 'A'),
  ('immunosuppression', 'immunosuppression_mech', 'skin-cancer-melanoma', 'Immunosuppression affects skin through lifestyle pathways leading to Skin Cancer (Melanoma)', 'B'),
  ('topical_steroid_overuse', 'topical_steroid_overuse_mech', 'perioral-dermatitis', 'Topical steroid overuse affects skin through skin pathways leading to Perioral Dermatitis', 'A'),
  ('fluoride_toothpaste', 'fluoride_toothpaste_mech', 'perioral-dermatitis', 'Fluoride toothpaste affects skin through lifestyle pathways leading to Perioral Dermatitis', 'B'),
  ('cosmetics', 'cosmetics_mech', 'perioral-dermatitis', 'Cosmetics affects skin through skin pathways leading to Perioral Dermatitis', 'B'),
  ('hormonal_factors', 'hormonal_factors_mech', 'perioral-dermatitis', 'Hormonal factors affects skin through hormones pathways leading to Perioral Dermatitis', 'B'),
  ('microbiome_dysbiosis', 'microbiome_dysbiosis_mech', 'perioral-dermatitis', 'Microbiome dysbiosis affects skin through skin pathways leading to Perioral Dermatitis', 'D'),
  ('keratin_overproduction', 'keratin_overproduction_mech', 'keratosis-pilaris', 'Keratin overproduction affects skin through skin pathways leading to Keratosis Pilaris', 'A'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'keratosis-pilaris', 'Genetic predisposition affects skin through skin pathways leading to Keratosis Pilaris', 'A'),
  ('dry_skin', 'dry_skin_mech', 'keratosis-pilaris', 'Dry skin affects skin through skin pathways leading to Keratosis Pilaris', 'A'),
  ('atopic_diathesis', 'atopic_diathesis_mech', 'keratosis-pilaris', 'Atopic diathesis affects skin through skin pathways leading to Keratosis Pilaris', 'B'),
  ('low_humidity', 'low_humidity_mech', 'xerosis', 'Low humidity affects skin through lifestyle pathways leading to Xerosis (Dry Skin)', 'A'),
  ('aging', 'aging_mech', 'xerosis', 'Aging affects skin through skin pathways leading to Xerosis (Dry Skin)', 'A'),
  ('harsh_cleansers', 'harsh_cleansers_mech', 'xerosis', 'Harsh cleansers affects skin through lifestyle pathways leading to Xerosis (Dry Skin)', 'A'),
  ('hot_water', 'hot_water_mech', 'xerosis', 'Hot water affects skin through lifestyle pathways leading to Xerosis (Dry Skin)', 'A'),
  ('medical_conditions', 'medical_conditions_mech', 'xerosis', 'Medical conditions affects skin through skin pathways leading to Xerosis (Dry Skin)', 'B'),
  ('nutritional_deficiency', 'nutritional_deficiency_mech', 'xerosis', 'Nutritional deficiency affects skin through nutrition pathways leading to Xerosis (Dry Skin)', 'B'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'seborrheic-keratosis', 'Genetic predisposition affects skin through skin pathways leading to Seborrheic Keratosis', 'A'),
  ('sun_exposure', 'sun_exposure_mech', 'seborrheic-keratosis', 'Sun exposure affects skin through lifestyle pathways leading to Seborrheic Keratosis', 'B'),
  ('aging', 'aging_mech', 'seborrheic-keratosis', 'Aging affects skin through skin pathways leading to Seborrheic Keratosis', 'A'),
  ('malassezia_overgrowth', 'malassezia_overgrowth_mech', 'tinea-versicolor', 'Malassezia overgrowth affects skin through skin pathways leading to Tinea Versicolor', 'A'),
  ('heat_and_humidity', 'heat_and_humidity_mech', 'tinea-versicolor', 'Heat and humidity affects skin through lifestyle pathways leading to Tinea Versicolor', 'A'),
  ('oily_skin', 'oily_skin_mech', 'tinea-versicolor', 'Oily skin affects skin through skin pathways leading to Tinea Versicolor', 'B'),
  ('immunosuppression', 'immunosuppression_mech', 'tinea-versicolor', 'Immunosuppression affects skin through lifestyle pathways leading to Tinea Versicolor', 'B'),
  ('bacterial_infection', 'bacterial_infection_mech', 'folliculitis', 'Bacterial infection affects skin through skin pathways leading to Folliculitis', 'A'),
  ('fungal_infection', 'fungal_infection_mech', 'folliculitis', 'Fungal infection affects skin through skin pathways leading to Folliculitis', 'A'),
  ('physical_irritation', 'physical_irritation_mech', 'folliculitis', 'Physical irritation affects skin through lifestyle pathways leading to Folliculitis', 'A'),
  ('ingrown_hairs', 'ingrown_hairs_mech', 'folliculitis', 'Ingrown hairs affects skin through skin pathways leading to Folliculitis', 'A'),
  ('hot_tub_exposure', 'hot_tub_exposure_mech', 'folliculitis', 'Hot tub exposure affects skin through lifestyle pathways leading to Folliculitis', 'A'),
  ('hsv_1_reactivation', 'hsv_1_reactivation_mech', 'cold-sore', 'HSV-1 reactivation affects skin through skin pathways leading to Cold Sore (HSV-1)', 'A'),
  ('immunosuppression', 'immunosuppression_mech', 'cold-sore', 'Immunosuppression affects skin through lifestyle pathways leading to Cold Sore (HSV-1)', 'A'),
  ('uv_exposure', 'uv_exposure_mech', 'cold-sore', 'UV exposure affects skin through lifestyle pathways leading to Cold Sore (HSV-1)', 'A'),
  ('stress', 'stress_mech', 'cold-sore', 'Stress affects skin through lifestyle pathways leading to Cold Sore (HSV-1)', 'A'),
  ('hormonal_changes', 'hormonal_changes_mech', 'cold-sore', 'Hormonal changes affects skin through hormones pathways leading to Cold Sore (HSV-1)', 'B'),
  ('curly_coily_hair', 'curly_coily_hair_mech', 'razor-bumps', 'Curly/coily hair affects skin through skin pathways leading to Razor Bumps (Pseudofolliculitis Barbae)', 'A'),
  ('close_shaving', 'close_shaving_mech', 'razor-bumps', 'Close shaving affects skin through lifestyle pathways leading to Razor Bumps (Pseudofolliculitis Barbae)', 'A'),
  ('pulling_skin_while_shaving', 'pulling_skin_while_shaving_mech', 'razor-bumps', 'Pulling skin while shaving affects skin through lifestyle pathways leading to Razor Bumps (Pseudofolliculitis Barbae)', 'A'),
  ('genetic_predisposition', 'genetic_predisposition_mech', 'razor-bumps', 'Genetic predisposition affects skin through skin pathways leading to Razor Bumps (Pseudofolliculitis Barbae)', 'A'),
  ('androgen_driven_sebaceous_lipogenesis', 'androgen_driven_sebaceous_lipogenesis_mech', 'excess-sebum-enlarged-pores', 'Androgen-driven sebaceous lipogenesis affects skin through hormones pathways leading to Excess Sebum & Enlarged Pores', 'A'),
  ('insulin_&_igf_1_upregulation', 'insulin_&_igf_1_upregulation_mech', 'excess-sebum-enlarged-pores', 'Insulin & IGF-1 upregulation affects skin through hormones pathways leading to Excess Sebum & Enlarged Pores', 'A'),
  ('high_glycemic_diet', 'high_glycemic_diet_mech', 'excess-sebum-enlarged-pores', 'High glycemic diet affects skin through nutrition pathways leading to Excess Sebum & Enlarged Pores', 'B'),
  ('dairy_&_whey_protein', 'dairy_&_whey_protein_mech', 'excess-sebum-enlarged-pores', 'Dairy & whey protein affects skin through nutrition pathways leading to Excess Sebum & Enlarged Pores', 'B'),
  ('follicular_hyperkeratinization', 'follicular_hyperkeratinization_mech', 'excess-sebum-enlarged-pores', 'Follicular hyperkeratinization affects skin through skin pathways leading to Excess Sebum & Enlarged Pores', 'A'),
  ('collagen_&_elastin_loss_(aging)', 'collagen_&_elastin_loss_(aging)_mech', 'excess-sebum-enlarged-pores', 'Collagen & elastin loss (aging) affects skin through skin pathways leading to Excess Sebum & Enlarged Pores', 'A'),
  ('chronic_stress', 'chronic_stress_mech', 'excess-sebum-enlarged-pores', 'Chronic stress affects skin through lifestyle pathways leading to Excess Sebum & Enlarged Pores', 'B'),
  ('dht_conversion', 'dht_conversion_mech', 'excess-sebum-enlarged-pores', 'DHT conversion affects skin through hormones pathways leading to Excess Sebum & Enlarged Pores', 'A'),
  ('over_exfoliation', 'over_exfoliation_mech', 'barrier-dysfunction', 'Over-exfoliation affects skin through lifestyle pathways leading to Barrier Dysfunction', 'A'),
  ('harsh_cleansers', 'harsh_cleansers_mech', 'barrier-dysfunction', 'Harsh cleansers affects skin through lifestyle pathways leading to Barrier Dysfunction', 'A'),
  ('environmental_damage', 'environmental_damage_mech', 'barrier-dysfunction', 'Environmental damage affects skin through lifestyle pathways leading to Barrier Dysfunction', 'A'),
  ('uv_damage', 'uv_damage_mech', 'barrier-dysfunction', 'UV damage affects skin through lifestyle pathways leading to Barrier Dysfunction', 'A') ON CONFLICT (root_cause_id, mechanism_id, condition_id) DO UPDATE SET description = EXCLUDED.description, evidence_level = EXCLUDED.evidence_level;

-- Seeded 123 mechanism chains

-- ============================================
-- SEEDING COMPLETE
-- ============================================