-- Fix ingredient constraints to match current schema.sql
-- Run this in Supabase SQL Editor

-- First, drop old constraints
ALTER TABLE IF EXISTS public.ingredients 
  DROP CONSTRAINT IF EXISTS ingredients_category_check;

ALTER TABLE IF EXISTS public.ingredients 
  DROP CONSTRAINT IF EXISTS ingredients_evidence_level_check;

-- Add comprehensive category constraint (matches schema.sql)
ALTER TABLE IF EXISTS public.ingredients 
  ADD CONSTRAINT ingredients_category_check 
  CHECK (category IN (
    'retinoid', 'aha', 'bha', 'vitamin', 'antioxidant', 'peptide',
    'humectant', 'emollient', 'occlusive', 'sunscreen', 'botanical',
    'preservative', 'fragrance', 'surfactant', 'other',
    -- Extended clinical categories
    'antimicrobial', 'depigmenting', 'mineral', 'fatty-acid', 'barrier-repair',
    'keratolytic', 'antifungal', 'antiparasitic', 'calcineurin-inhibitor',
    'corticosteroid', 'chemotherapy', 'immune-modulator', 'jak-inhibitor',
    'anti-androgen', 'insulin-sensitizer', 'photoprotectant', 'protein',
    'flavonoid', 'anti-inflammatory', 'antiviral', 'amino-acid', 'soothing',
    'wound-healing', 'brightening', 'retinoid-alternative', 'antiproliferative',
    'nsaid', 'microtubule-inhibitor', 'hormonal', 'antibiotic',
    'immunosuppressant', 'biologic', 'phototherapy', 'injectable', 'procedure',
    'energy-device', 'laser', 'vitamin-d-analog', 'neuro-peptide',
    'anti-elastase-peptide', 'probiotic', 'pha', 'protective-extremolyte',
    'regenerative-biocompatible', 'pde4-inhibitor'
  ));

-- Add comprehensive evidence_level constraint
ALTER TABLE IF EXISTS public.ingredients 
  ADD CONSTRAINT ingredients_evidence_level_check 
  CHECK (evidence_level IN ('strong', 'moderate', 'emerging', 'limited', 
    'A', 'A-', 'B', 'B+', 'B-', 'C', 'C+', 'C-', 'D'));

-- Verify constraints were added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'ingredients'::regclass AND contype = 'c';
