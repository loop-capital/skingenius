-- ============================================
-- SKINgenius Schema + Seed Data Script
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- REFERENCE TABLES (seeded from knowledge graph)
-- ============================================

-- Root causes (internal health factors)
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
  interactions TEXT[] DEFAULT '{}',
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
  concerns_treated TEXT[] DEFAULT '{}',
  interactions TEXT[] DEFAULT '{}',
  pregnancy_safe TEXT,
  root_causes_targeted TEXT[] DEFAULT '{}',
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

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cause_condition_root ON public.cause_condition_links(root_cause_id);
CREATE INDEX IF NOT EXISTS idx_cause_condition_condition ON public.cause_condition_links(condition_id);
CREATE INDEX IF NOT EXISTS idx_mechanism_chain_root ON public.mechanism_chains(root_cause_id);
CREATE INDEX IF NOT EXISTS idx_mechanism_chain_condition ON public.mechanism_chains(condition_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.root_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cause_condition_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanism_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view root_causes" ON public.root_causes FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanisms" ON public.mechanisms FOR SELECT USING (true);
CREATE POLICY "Anyone can view medications" ON public.medications FOR SELECT USING (true);
CREATE POLICY "Anyone can view supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Anyone can view cause_condition_links" ON public.cause_condition_links FOR SELECT USING (true);
CREATE POLICY "Anyone can view mechanism_chains" ON public.mechanism_chains FOR SELECT USING (true);
