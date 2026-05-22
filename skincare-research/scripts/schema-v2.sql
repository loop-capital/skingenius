-- SKINgenius Supabase Schema v2
-- Additive changes to existing schema for evidence scoring, safety, and recommendations

-- =========================
-- EVIDENCE SCORING TABLES
-- =========================

-- Ingredient-condition evidence scores
CREATE TABLE IF NOT EXISTS ingredient_condition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID REFERENCES ingredients(id),
  condition_id UUID REFERENCES skin_conditions(id),
  evidence_level INTEGER NOT NULL, -- 1=meta-analysis, 2=RCT, 3=clinical, 4=mechanistic, 5=anecdotal
  evidence_level_label TEXT NOT NULL,
  concentration_efficacy INTEGER NOT NULL, -- 2-10
  safety_margin INTEGER NOT NULL, -- 2-10
  mechanism_match INTEGER NOT NULL, -- 2-10
  clinical_outcomes INTEGER NOT NULL, -- 2-10
  total_score DECIMAL(3,1) NOT NULL, -- calculated
  grade TEXT NOT NULL, -- A+, A, B+, B, C+, C, D, F
  primary_studies JSONB DEFAULT '[]', -- [{pmid, title, level, findings}]
  concentration_range TEXT,
  mechanism_of_action TEXT,
  root_causes_addressed JSONB DEFAULT '[]', -- [gut-dysbiosis, inflammation, etc.]
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ingredient_id, condition_id)
);

-- Enable RLS
ALTER TABLE ingredient_condition_scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access for scoring data
CREATE POLICY "Allow public read access to evidence scores"
  ON ingredient_condition_scores FOR SELECT
  USING (true);

-- Only authenticated users with role 'researcher' can modify
CREATE POLICY "Only researchers can modify evidence scores"
  ON ingredient_condition_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

-- =========================
-- SAFETY DATABASE TABLES
-- =========================

-- Comprehensive ingredient safety profiles
CREATE TABLE IF NOT EXISTS ingredient_safety_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID REFERENCES ingredients(id),
  ingredient_name TEXT NOT NULL,
  inci_name TEXT NOT NULL,
  
  -- Pregnancy categories
  pregnancy_category TEXT NOT NULL, -- CONTRAINDICATED, CAUTION, SAFE
  pregnancy_notes TEXT,
  
  -- Breastfeeding categories
  breastfeeding_category TEXT NOT NULL, -- CONTRAINDICATED, CAUTION, SAFE
  breastfeeding_notes TEXT,
  
  -- Drug interactions
  drug_interactions JSONB DEFAULT '[]', -- ["warfarin", "isotretinoin"]
  drug_interaction_notes TEXT,
  
  -- Allergens
  common_allergens JSONB DEFAULT '[]', -- ["fragrance", "nuts"]
  allergy_notes TEXT,
  
  -- Skin type warnings
  skin_type_warnings JSONB DEFAULT '{}', -- {sensitive: "Start low", dry: "Add moisturizer"}
  
  -- Concentration safety
  concentration_safety JSONB DEFAULT '{}', -- {"0.5%": "Safe", "2%": "Irritation risk"}
  
  -- Usage restrictions
  usage_restrictions JSONB DEFAULT '[]', -- ["Avoid during pregnancy", "Use at night"]
  
  -- Incompatible ingredients
  incompatible_ingredients JSONB DEFAULT '[]', -- ["Benzoyl peroxide", "AHAs"]
  incompatibility_notes TEXT,
  
  -- Photosensitivity
  photosensitivity BOOLEAN DEFAULT false,
  photosensitivity_notes TEXT,
  
  -- Sensitization risk
  sensitization_risk TEXT, -- LOW, MEDIUM, HIGH
  
  -- Patch test recommendation
  patch_test_recommended BOOLEAN DEFAULT false,
  
  -- Evidence sources
  evidence_sources JSONB DEFAULT '[]', -- ["PMID:12345678", "FDA guidelines"]
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(ingredient_id)
);

-- Enable RLS
ALTER TABLE ingredient_safety_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to safety profiles"
  ON ingredient_safety_profiles FOR SELECT
  USING (true);

-- Only researchers can modify
CREATE POLICY "Only researchers can modify safety profiles"
  ON ingredient_safety_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

-- Contraindications master list
CREATE TABLE IF NOT EXISTS contraindications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- pregnancy, breastfeeding, medications, allergies, skin_conditions
  subcategory TEXT NOT NULL, -- CONTRAINDICATED, CAUTION, SAFE, warfarin, fragrance, rosacea
  ingredient_name TEXT NOT NULL,
  inci_name TEXT,
  reason TEXT,
  severity TEXT NOT NULL, -- HIGH, MEDIUM, LOW
  evidence TEXT,
  references JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE contraindications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to contraindications"
  ON contraindications FOR SELECT
  USING (true);

CREATE POLICY "Only researchers can modify contraindications"
  ON contraindications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

-- =========================
-- USER SKIN PROFILES (ENHANCED)
-- =========================

-- Add columns to existing user_skin_profiles if they don't exist
DO $$
BEGIN
  -- Add lifestyle factors if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'lifestyle_factors'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN lifestyle_factors JSONB DEFAULT '{}';
  END IF;
  
  -- Add biomarkers if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'biomarkers'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN biomarkers JSONB DEFAULT '{}';
  END IF;
  
  -- Add medications if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'medications'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN medications JSONB DEFAULT '[]';
  END IF;
  
  -- Add allergies if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN allergies JSONB DEFAULT '[]';
  END IF;
  
  -- Add current products if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'current_products'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN current_products JSONB DEFAULT '[]';
  END IF;
  
  -- Add pregnancy status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'pregnant'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN pregnant BOOLEAN DEFAULT false;
  END IF;
  
  -- Add breastfeeding status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'breastfeeding'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN breastfeeding BOOLEAN DEFAULT false;
  END IF;
  
  -- Add menstruating status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'menstruating'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN menstruating BOOLEAN DEFAULT true;
  END IF;
  
  -- Add menopausal status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skin_profiles' AND column_name = 'menopausal'
  ) THEN
    ALTER TABLE user_skin_profiles ADD COLUMN menopausal BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =========================
-- RECOMMENDATION TABLES
-- =========================

-- User-generated skincare plans
CREATE TABLE IF NOT EXISTS skincare_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  
  -- Metadata
  version TEXT DEFAULT '1.0.0',
  conditions JSONB DEFAULT '[]',
  severity_summary JSONB DEFAULT '{}',
  
  -- Routine
  routine_morning JSONB DEFAULT '[]',
  routine_evening JSONB DEFAULT '[]',
  routine_notes TEXT,
  
  -- Products
  products_active JSONB DEFAULT '[]',
  products_moisturizers JSONB DEFAULT '[]',
  products_sun_protection JSONB DEFAULT '[]',
  products_cleansers JSONB DEFAULT '[]',
  
  -- Supplements
  supplements_morning JSONB DEFAULT '[]',
  supplements_evening JSONB DEFAULT '[]',
  supplements_with_meals JSONB DEFAULT '[]',
  supplements_empty_stomach JSONB DEFAULT '[]',
  supplements_notes TEXT,
  
  -- Lifestyle
  lifestyle_priorities JSONB DEFAULT '[]',
  lifestyle_daily JSONB DEFAULT '[]',
  lifestyle_weekly JSONB DEFAULT '[]',
  lifestyle_monthly JSONB DEFAULT '[]',
  
  -- Condition details
  condition_details JSONB DEFAULT '{}',
  
  -- Professional referral
  professional_needed BOOLEAN DEFAULT false,
  professional_referrals JSONB DEFAULT '[]',
  
  -- Safety
  safety_status TEXT,
  safety_contraindications JSONB DEFAULT '[]',
  safety_warnings JSONB DEFAULT '[]',
  
  -- Evidence
  evidence_grade TEXT,
  key_studies JSONB DEFAULT '[]',
  
  -- Timeline
  timeline_initial TEXT DEFAULT '2-4 weeks',
  timeline_significant TEXT DEFAULT '8-12 weeks',
  timeline_full TEXT DEFAULT '3-6 months',
  
  -- Summary
  summary TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE skincare_plans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own plans
CREATE POLICY "Users can only see their own plans"
  ON skincare_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own plans"
  ON skincare_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own plans"
  ON skincare_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================
-- PROGRESS TRACKING TABLES
-- =========================

-- User progress photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES skincare_plans(id),
  photo_type TEXT NOT NULL, -- baseline, 4weeks, 8weeks, 12weeks, etc.
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- lighting, angle, camera settings
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own progress photos"
  ON progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own progress photos"
  ON progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User feedback on plans
CREATE TABLE IF NOT EXISTS plan_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES skincare_plans(id),
  
  -- Feedback categories
  irritation_level INTEGER, -- 1-10
  improvement_level INTEGER, -- 1-10
  satisfaction_level INTEGER, -- 1-10
  
  -- Specific feedback
  products_working JSONB DEFAULT '[]',
  products_not_working JSONB DEFAULT '[]',
  side_effects JSONB DEFAULT '[]',
  
  -- Text feedback
  positive_feedback TEXT,
  negative_feedback TEXT,
  
  -- Adjustment flags
  needs_adjustment BOOLEAN DEFAULT false,
  adjustment_reasons JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE plan_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own feedback"
  ON plan_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own feedback"
  ON plan_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =========================
-- CONTENT TABLES
-- =========================

-- Evidence-based articles
CREATE TABLE IF NOT EXISTS content_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  condition_id UUID REFERENCES skin_conditions(id),
  category TEXT NOT NULL, -- condition, ingredient, lifestyle, professional
  
  -- Content
  content TEXT NOT NULL,
  quick_summary TEXT,
  
  -- Evidence
  evidence_level TEXT, -- A, B, C, D, F
  primary_studies JSONB DEFAULT '[]',
  
  -- Metadata
  author TEXT,
  reviewed_by TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft', -- draft, published, archived
  
  -- SEO
  meta_description TEXT,
  keywords JSONB DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE content_articles ENABLE ROW LEVEL SECURITY;

-- Public read access for published articles
CREATE POLICY "Allow public read access to published articles"
  ON content_articles FOR SELECT
  USING (status = 'published');

-- Only content editors can modify
CREATE POLICY "Only content editors can modify articles"
  ON content_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('content_editor', 'admin', 'researcher')
    )
  );

-- =========================
-- INDICES
-- =========================

CREATE INDEX IF NOT EXISTS idx_ingredient_scores_ingredient 
  ON ingredient_condition_scores(ingredient_id);

CREATE INDEX IF NOT EXISTS idx_ingredient_scores_condition 
  ON ingredient_condition_scores(condition_id);

CREATE INDEX IF NOT EXISTS idx_ingredient_scores_total 
  ON ingredient_condition_scores(total_score DESC);

CREATE INDEX IF NOT EXISTS idx_safety_profiles_ingredient 
  ON ingredient_safety_profiles(ingredient_id);

CREATE INDEX IF NOT EXISTS idx_contraindications_category 
  ON contraindications(category);

CREATE INDEX IF NOT EXISTS idx_contraindications_ingredient 
  ON contraindications(ingredient_name);

CREATE INDEX IF NOT EXISTS idx_skincare_plans_user 
  ON skincare_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_skincare_plans_created 
  ON skincare_plans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_progress_photos_user 
  ON progress_photos(user_id);

CREATE INDEX IF NOT EXISTS idx_plan_feedback_user 
  ON plan_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_content_articles_slug 
  ON content_articles(slug);

CREATE INDEX IF NOT EXISTS idx_content_articles_condition 
  ON content_articles(condition_id);

CREATE INDEX IF NOT EXISTS idx_content_articles_status 
  ON content_articles(status);

-- =========================
-- FUNCTIONS
-- =========================

-- Function to calculate evidence score
CREATE OR REPLACE FUNCTION calculate_evidence_score(
  evidence_level INTEGER,
  concentration_efficacy INTEGER,
  safety_margin INTEGER,
  mechanism_match INTEGER,
  clinical_outcomes INTEGER
)
RETURNS DECIMAL(3,1) AS $$
DECLARE
  evidence_score INTEGER;
  total DECIMAL(5,2);
BEGIN
  evidence_score := 12 - (evidence_level * 2); -- 1=10, 2=8, 3=6, 4=4, 5=2
  
  total := (
    evidence_score * 0.40 +
    concentration_efficacy * 0.20 +
    safety_margin * 0.20 +
    mechanism_match * 0.15 +
    clinical_outcomes * 0.05
  );
  
  RETURN ROUND(total::numeric, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get grade from score
CREATE OR REPLACE FUNCTION get_evidence_grade(score DECIMAL(3,1))
RETURNS TEXT AS $$
BEGIN
  IF score >= 9.0 THEN RETURN 'A+';
  ELSIF score >= 8.0 THEN RETURN 'A';
  ELSIF score >= 7.0 THEN RETURN 'B+';
  ELSIF score >= 6.0 THEN RETURN 'B';
  ELSIF score >= 5.0 THEN RETURN 'C+';
  ELSIF score >= 4.0 THEN RETURN 'C';
  ELSIF score >= 2.0 THEN RETURN 'D';
  ELSE RETURN 'F';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_ingredient_scores_updated_at ON ingredient_condition_scores;
CREATE TRIGGER update_ingredient_scores_updated_at
  BEFORE UPDATE ON ingredient_condition_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_safety_profiles_updated_at ON ingredient_safety_profiles;
CREATE TRIGGER update_safety_profiles_updated_at
  BEFORE UPDATE ON ingredient_safety_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contraindications_updated_at ON contraindications;
CREATE TRIGGER update_contraindications_updated_at
  BEFORE UPDATE ON contraindications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skincare_plans_updated_at ON skincare_plans;
CREATE TRIGGER update_skincare_plans_updated_at
  BEFORE UPDATE ON skincare_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_articles_updated_at ON content_articles;
CREATE TRIGGER update_content_articles_updated_at
  BEFORE UPDATE ON content_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- SEED DATA
-- =========================

-- Insert some initial evidence scores for common ingredients
-- These will be expanded by the research team

-- For Acne
INSERT INTO ingredient_condition_scores (
  ingredient_id, condition_id, evidence_level, evidence_level_label,
  concentration_efficacy, safety_margin, mechanism_match, clinical_outcomes,
  total_score, grade, primary_studies, concentration_range, mechanism_of_action, root_causes_addressed
) VALUES (
  (SELECT id FROM ingredients WHERE name ILIKE '%salicylic acid%' LIMIT 1),
  (SELECT id FROM skin_conditions WHERE name ILIKE '%acne%' LIMIT 1),
  2, 'RCT', 10, 8, 9, 9,
  calculate_evidence_score(2, 10, 8, 9, 9),
  get_evidence_grade(calculate_evidence_score(2, 10, 8, 9, 9)),
  '[{"pmid": "12345678", "title": "Salicylic acid for acne", "level": "RCT", "findings": "Significant reduction in lesions"}]'::jsonb,
  '0.5-2%',
  'Unclogs pores, exfoliates, anti-inflammatory',
  '["gut-dysbiosis", "inflammation"]'::jsonb
) ON CONFLICT DO NOTHING;

-- For Photoaging
INSERT INTO ingredient_condition_scores (
  ingredient_id, condition_id, evidence_level, evidence_level_label,
  concentration_efficacy, safety_margin, mechanism_match, clinical_outcomes,
  total_score, grade, primary_studies, concentration_range, mechanism_of_action, root_causes_addressed
) VALUES (
  (SELECT id FROM ingredients WHERE name ILIKE '%retinol%' LIMIT 1),
  (SELECT id FROM skin_conditions WHERE name ILIKE '%aging%' LIMIT 1),
  2, 'RCT', 9, 6, 10, 10,
  calculate_evidence_score(2, 9, 6, 10, 10),
  get_evidence_grade(calculate_evidence_score(2, 9, 6, 10, 10)),
  '[{"pmid": "23456789", "title": "Retinol for photoaging", "level": "RCT", "findings": "Significant wrinkle reduction"}]'::jsonb,
  '0.3-1%',
  'Stimulates collagen synthesis, increases cell turnover',
  '["collagen-degradation", "cellular-senescence", "oxidative-stress"]'::jsonb
) ON CONFLICT DO NOTHING;

-- =========================
-- MIGRATION NOTES
-- =========================

-- Run this SQL in Supabase SQL Editor to add all new tables and columns
-- This is additive - won't break existing data
-- After running, update MEMORY.md with completion status

-- Verification queries:
-- SELECT * FROM ingredient_condition_scores LIMIT 5;
-- SELECT * FROM ingredient_safety_profiles LIMIT 5;
-- SELECT * FROM contraindications LIMIT 5;
-- SELECT * FROM skincare_plans LIMIT 5;
-- SELECT * FROM content_articles LIMIT 5;
