-- SKINgenius Facial Aesthetics Analysis — Database Migration
-- Phase 1 Foundation: facial_analyses, aesthetic_protocols, aesthetic_improvements
-- Created: 2026-07-02
-- Depends on: existing skin_analyses table
-- =============================================================================

-- ============================================
-- TABLE: facial_analyses
-- Stores landmark data, metrics, and scores per facial aesthetics scan
-- ============================================

CREATE TABLE IF NOT EXISTS public.facial_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Link to skin analysis (same scan session)
  skin_analysis_id UUID REFERENCES public.skin_analyses(id) ON DELETE SET NULL,

  -- Landmark data (stored as JSONB for flexibility)
  landmarks JSONB NOT NULL DEFAULT '{}',
  -- Computed metrics from landmarks
  metrics JSONB NOT NULL DEFAULT '{}',
  -- Aesthetic scores computed from metrics
  scores JSONB NOT NULL DEFAULT '{}',

  -- Snapshot of user context at analysis time
  ethnicity TEXT,
  age_at_scan INT CHECK (age_at_scan >= 0 AND age_at_scan <= 120),
  gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_say')),

  -- Processing metadata
  model_used TEXT NOT NULL DEFAULT 'gemma-4-vision',
  on_device BOOLEAN DEFAULT true,
  processing_time_ms INT CHECK (processing_time_ms >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: aesthetic_protocols
-- Phased aesthetic improvement recommendations
-- ============================================

CREATE TABLE IF NOT EXISTS public.aesthetic_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.facial_analyses(id) ON DELETE CASCADE NOT NULL,

  -- Protocol phases (JSONB structure from spec Section 4.3)
  phases JSONB NOT NULL DEFAULT '[]',

  -- Visualization data
  projected_landmarks JSONB,
  projection_images JSONB,

  -- User preferences
  budget_preference TEXT CHECK (budget_preference IN ('minimal', 'moderate', 'unlimited')),
  invasive_comfort TEXT CHECK (invasive_comfort IN ('topical_only', 'non_invasive', 'minimally_invasive', 'open')),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  started_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: aesthetic_improvements
-- Feature-specific improvement catalog (60+ items)
-- ============================================

CREATE TABLE IF NOT EXISTS public.aesthetic_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What feature this improves
  feature TEXT NOT NULL,          -- 'brow', 'eyes', 'nose', 'lips', 'jaw', 'skin'
  sub_feature TEXT,               -- 'arch_angle', 'fullness', 'under_eye_hollowness'

  -- Improvement details
  name TEXT NOT NULL,             -- 'Brow lamination for fullness'
  category TEXT NOT NULL,         -- 'topical', 'device', 'procedure', 'injectable', 'lifestyle', 'supplement', 'peptide'
  invasiveness TEXT NOT NULL CHECK (invasiveness IN ('none', 'minimal', 'moderate', 'significant')),

  -- Impact modeling
  score_impact NUMERIC(4,1),     -- expected score change (e.g., +15.0)
  confidence NUMERIC(3,2),       -- 0.00-1.00 confidence in impact
  timeline_weeks INT,            -- weeks to see results

  -- Cost
  cost_min NUMERIC(8,2),
  cost_max NUMERIC(8,2),
  recurring BOOLEAN DEFAULT false,
  recurring_cost_monthly NUMERIC(8,2),

  -- Evidence
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  evidence_notes TEXT,
  key_studies TEXT[],

  -- Links to existing tables
  ingredient_ids TEXT[],         -- from ingredients table
  supplement_ids TEXT[],         -- from supplements table
  peptide_ids TEXT[],            -- from peptides table
  product_ids TEXT[],            -- from products table

  -- Ethnicity-aware recommendations
  ethnicity_adjustments JSONB,   -- {south_asian: "prefer azelaic acid over hydroquinone", ...}
  fitzpatrick_adjustments JSONB, -- {type_5_6: "avoid aggressive laser", ...}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_facial_analyses_user ON public.facial_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_facial_analyses_skin_analysis ON public.facial_analyses(skin_analysis_id);
CREATE INDEX IF NOT EXISTS idx_facial_analyses_created ON public.facial_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aesthetic_protocols_user ON public.aesthetic_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_aesthetic_protocols_analysis ON public.aesthetic_protocols(analysis_id);
CREATE INDEX IF NOT EXISTS idx_aesthetic_protocols_status ON public.aesthetic_protocols(status);

CREATE INDEX IF NOT EXISTS idx_aesthetic_improvements_feature ON public.aesthetic_improvements(feature, sub_feature);
CREATE INDEX IF NOT EXISTS idx_aesthetic_improvements_category ON public.aesthetic_improvements(category);
CREATE INDEX IF NOT EXISTS idx_aesthetic_improvements_invasiveness ON public.aesthetic_improvements(invasiveness);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- facial_analyses: user-scoped
ALTER TABLE public.facial_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own facial analyses" ON public.facial_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own facial analyses" ON public.facial_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own facial analyses" ON public.facial_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own facial analyses" ON public.facial_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- aesthetic_protocols: user-scoped
ALTER TABLE public.aesthetic_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own aesthetic protocols" ON public.aesthetic_protocols FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own aesthetic protocols" ON public.aesthetic_protocols FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own aesthetic protocols" ON public.aesthetic_protocols FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own aesthetic protocols" ON public.aesthetic_protocols FOR DELETE
  USING (auth.uid() = user_id);

-- aesthetic_improvements: public read (reference data), admin write
ALTER TABLE public.aesthetic_improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aesthetic improvements" ON public.aesthetic_improvements FOR SELECT
  USING (true);

-- Only service role can write (enforced by Supabase client, not RLS directly)
-- RLS allows inserts from authenticated users but actual seeding should use service role
CREATE POLICY "Authenticated users can insert aesthetic improvements" ON public.aesthetic_improvements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_aesthetic_protocols_updated_at
  BEFORE UPDATE ON public.aesthetic_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_aesthetic_improvements_updated_at
  BEFORE UPDATE ON public.aesthetic_improvements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
