-- Migration: Create condition_connections table
-- Links ingredients to skin conditions with effectiveness scores
-- Required for recommendations query engine
-- Date: 2026-07-06

CREATE TABLE IF NOT EXISTS public.condition_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  condition_id TEXT NOT NULL,
  effectiveness NUMERIC(3,2) CHECK (effectiveness >= 0 AND effectiveness <= 1),
  evidence_level TEXT CHECK (evidence_level IN ('strong', 'moderate', 'emerging')),
  mechanism TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for the query engine's .in() filter on condition_id
CREATE INDEX IF NOT EXISTS idx_condition_connections_condition_id
  ON public.condition_connections(condition_id);

-- Index for ingredient lookups
CREATE INDEX IF NOT EXISTS idx_condition_connections_ingredient_id
  ON public.condition_connections(ingredient_id);

-- Unique constraint to prevent duplicate mappings
CREATE UNIQUE INDEX IF NOT EXISTS idx_condition_connections_unique
  ON public.condition_connections(ingredient_id, condition_id);

-- RLS: public read (reference data, like ingredients table)
ALTER TABLE public.condition_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.condition_connections FOR SELECT USING (true);

-- Add to table status tracking if monitoring exists
COMMENT ON TABLE public.condition_connections IS 'Links ingredients to skin conditions with effectiveness scores for recommendation engine';
