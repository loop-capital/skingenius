-- COMPREHENSIVE FIX: Update all ingredient constraints to match current schema
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop old constraints
-- ============================================
ALTER TABLE IF EXISTS public.ingredients 
  DROP CONSTRAINT IF EXISTS ingredients_category_check;

ALTER TABLE IF EXISTS public.ingredients 
  DROP CONSTRAINT IF EXISTS ingredients_evidence_level_check;

ALTER TABLE IF EXISTS public.ingredients 
  DROP CONSTRAINT IF EXISTS ingredients_concerns_check;

-- ============================================
-- STEP 2: Add comprehensive constraints (from schema.sql)
-- ============================================

-- Extended category list with clinical categories
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

-- Extended evidence levels
ALTER TABLE IF EXISTS public.ingredients 
  ADD CONSTRAINT ingredients_evidence_level_check 
  CHECK (evidence_level IN ('strong', 'moderate', 'emerging', 'limited', 
    'A', 'A-', 'B', 'B+', 'B-', 'C', 'C+', 'C-', 'D'));

-- ============================================
-- STEP 3: Verify
-- ============================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'ingredients'::regclass 
  AND contype = 'c'
ORDER BY conname;
