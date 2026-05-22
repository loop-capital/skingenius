-- SKINgenius Knowledge Graph Schema
-- Adds root cause, zone, and recommendation tables for the scan flow
-- Run AFTER the main schema.sql

-- ============================================
-- FACIAL ZONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.facial_zones (
  id TEXT PRIMARY KEY, -- e.g., 't-zone', 'cheeks'
  name TEXT NOT NULL,
  description TEXT,
  common_concerns TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KNOWLEDGE GRAPH: CONDITIONS (extends skin_conditions)
-- ============================================

-- We add knowledge-graph fields to the existing skin_conditions table
-- rather than creating a separate table, to keep queries simple.
-- The slug column already exists and is UNIQUE.

ALTER TABLE public.skin_conditions
  ADD COLUMN IF NOT EXISTS icd10_code TEXT,
  ADD COLUMN IF NOT EXISTS fitzpatrick_notes TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS affected_zones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requires_dermatologist BOOLEAN DEFAULT FALSE;

-- ============================================
-- ROOT CAUSES
-- ============================================

CREATE TABLE IF NOT EXISTS public.root_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_slug TEXT NOT NULL REFERENCES public.skin_conditions(slug) ON DELETE CASCADE,
  cause TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('skin', 'gut', 'hormones', 'nutrition', 'lifestyle')),
  evidence TEXT NOT NULL CHECK (evidence IN ('strong', 'moderate', 'emerging', 'limited')),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_root_causes_condition ON public.root_causes(condition_slug);
CREATE INDEX IF NOT EXISTS idx_root_causes_domain ON public.root_causes(domain);

-- ============================================
-- RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_slug TEXT NOT NULL REFERENCES public.skin_conditions(slug) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('product', 'supplement', 'practitioner', 'basys_health')),
  name TEXT NOT NULL,
  description TEXT,
  evidence TEXT NOT NULL CHECK (evidence IN ('strong', 'moderate', 'emerging', 'limited')),
  dosage TEXT, -- for supplements
  duration TEXT, -- e.g., "8-12 weeks"
  pregnancy_safe BOOLEAN,
  fitzpatrick_safe TEXT[] DEFAULT '{}', -- empty = all safe, otherwise list unsafe types
  contraindications TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_condition ON public.recommendations(condition_slug);
CREATE INDEX IF NOT EXISTS idx_recommendations_tier ON public.recommendations(tier);

-- ============================================
-- ZONE-CONDITION MAPPING
-- ============================================

CREATE TABLE IF NOT EXISTS public.zone_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT NOT NULL REFERENCES public.facial_zones(id) ON DELETE CASCADE,
  condition_slug TEXT NOT NULL REFERENCES public.skin_conditions(slug) ON DELETE CASCADE,
  primary_concern TEXT,
  description TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone_id, condition_slug)
);

CREATE INDEX IF NOT EXISTS idx_zone_conditions_zone ON public.zone_conditions(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_conditions_condition ON public.zone_conditions(condition_slug);

-- ============================================
-- RLS FOR NEW TABLES
-- ============================================

-- Facial zones: public read
ALTER TABLE public.facial_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view facial zones" ON public.facial_zones FOR SELECT USING (true);

-- Root causes: public read
ALTER TABLE public.root_causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view root causes" ON public.root_causes FOR SELECT USING (true);

-- Recommendations: public read
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recommendations" ON public.recommendations FOR SELECT USING (true);

-- Zone conditions: public read
ALTER TABLE public.zone_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view zone conditions" ON public.zone_conditions FOR SELECT USING (true);