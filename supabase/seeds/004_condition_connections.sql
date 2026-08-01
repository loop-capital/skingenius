-- SKINgenius Condition Connections Seed Data
-- Links ingredient slugs to condition slugs with effectiveness scores
-- Required for the recommendations query engine
-- Date: 2026-07-19

-- ============================================================
-- ACNE CONDITIONS
-- ============================================================

-- Acne Vulgaris
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.85, 'strong',
  'Retinoids normalize keratinization, reduce comedones, and decrease sebum production via RAR/RXR receptor modulation'
FROM public.ingredients WHERE slug = 'retinol' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.80, 'strong',
  'BHA penetrates pores, dissolves sebum, reduces inflammation via COX inhibition'
FROM public.ingredients WHERE slug = 'salicylic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.75, 'strong',
  'AHA promotes exfoliation, reduces comedones, stimulates collagen'
FROM public.ingredients WHERE slug = 'glycolic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.75, 'strong',
  'Reduces sebum production, improves barrier function, anti-inflammatory'
FROM public.ingredients WHERE slug = 'niacinamide' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.85, 'strong',
  'Antimicrobial against C. acnes, keratolytic, anti-inflammatory'
FROM public.ingredients WHERE slug = 'benzoyl-peroxide' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.70, 'strong',
  'Anti-inflammatory, reduces erythema, inhibits melanosome transfer'
FROM public.ingredients WHERE slug = 'azelaic-acid' LIMIT 1;

-- Hormonal Acne
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'hormonal-acne', 0.80, 'strong',
  'Retinoids reduce sebum production and comedone formation in jawline distribution'
FROM public.ingredients WHERE slug = 'retinol' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'hormonal-acne', 0.70, 'strong',
  'BHA penetrates deep pores common in hormonal acne distribution'
FROM public.ingredients WHERE slug = 'salicylic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'hormonal-acne', 0.65, 'moderate',
  'Anti-inflammatory, reduces post-inflammatory hyperpigmentation common in hormonal acne'
FROM public.ingredients WHERE slug = 'niacinamide' LIMIT 1;

-- Fungal Acne
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'fungal-acne', 0.70, 'moderate',
  'BHA reduces Malassezia-triggered inflammation and exfoliates follicles'
FROM public.ingredients WHERE slug = 'salicylic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'fungal-acne', 0.75, 'strong',
  'Azelaic acid has antifungal properties against Malassezia species'
FROM public.ingredients WHERE slug = 'azelaic-acid' LIMIT 1;

-- ============================================================
-- ROSACEA
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'rosacea', 0.80, 'strong',
  'Anti-inflammatory, reduces erythema, strengthens skin barrier, well-tolerated by rosacea patients'
FROM public.ingredients WHERE slug = 'niacinamide' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'rosacea', 0.70, 'strong',
  'Anti-inflammatory and antimicrobial; reduces papules and pustules in rosacea'
FROM public.ingredients WHERE slug = 'azelaic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'rosacea', 0.60, 'moderate',
  'Centella asiatica has anti-inflammatory and wound-healing properties'
FROM public.ingredients WHERE slug = 'centella-asiatica' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'rosacea', 0.55, 'moderate',
  'Chamomile extract has anti-inflammatory and soothing properties'
FROM public.ingredients WHERE slug = 'chamomile-extract' LIMIT 1;

-- ============================================================
-- HYPERPIGMENTATION / MELASMA / PIH
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.90, 'strong',
  'Potent tyrosinase inhibitor, antioxidant, promotes collagen synthesis, reduces melanin formation'
FROM public.ingredients WHERE slug = 'l-ascorbic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.80, 'strong',
  'Inhibits melanosome transfer, reduces PIH in darker skin tones'
FROM public.ingredients WHERE slug = 'niacinamide' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.75, 'strong',
  'Promotes cell turnover, reduces hyperpigmentation via retinoic acid pathway'
FROM public.ingredients WHERE slug = 'retinol' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.70, 'moderate',
  'Competitive tyrosinase inhibitor, effective for PIH and melasma'
FROM public.ingredients WHERE slug = 'alpha-arbutin' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.75, 'strong',
  'Kojic acid chelates copper at tyrosinase active site, reducing melanin production'
FROM public.ingredients WHERE slug = 'kojic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.70, 'moderate',
  'AHA exfoliation removes pigmented keratinocytes, stimulates cell turnover'
FROM public.ingredients WHERE slug = 'glycolic-acid' LIMIT 1;

-- Melasma
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'melasma', 0.85, 'strong',
  'Gold standard for melasma; inhibits tyrosinase, antioxidant, photoprotective'
FROM public.ingredients WHERE slug = 'l-ascorbic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'melasma', 0.80, 'strong',
  'Inhibits melanosome transfer, anti-inflammatory, well-tolerated'
FROM public.ingredients WHERE slug = 'niacinamide' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'melasma', 0.80, 'strong',
  'Tyrosinase inhibitor effective for epidermal melasma'
FROM public.ingredients WHERE slug = 'kojic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'melasma', 0.70, 'moderate',
  'Tranexamic acid inhibits melanogenesis via PLA2 pathway'
FROM public.ingredients WHERE slug = 'tranexamic-acid' LIMIT 1;

-- ============================================================
-- SEBORRHEIC DERMATITIS
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'seborrheic-dermatitis', 0.70, 'strong',
  'Keratolytic, anti-inflammatory, reduces Malassezia-triggered flaking'
FROM public.ingredients WHERE slug = 'salicylic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'seborrheic-dermatitis', 0.65, 'moderate',
  'AHA exfoliation reduces scale, but may irritate inflamed skin'
FROM public.ingredients WHERE slug = 'glycolic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'seborrheic-dermatitis', 0.60, 'moderate',
  'Zinc oxide has antimicrobial and anti-inflammatory properties'
FROM public.ingredients WHERE slug = 'zinc-oxide' LIMIT 1;

-- ============================================================
-- ATOPIC DERMATITIS (ECZEMA)
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.85, 'strong',
  'Essential for barrier repair; ceramide supplementation reduces TEWL'
FROM public.ingredients WHERE slug = 'ceramides' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.80, 'strong',
  'Hyaluronic acid draws water into the skin, supporting barrier hydration'
FROM public.ingredients WHERE slug = 'hyaluronic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.70, 'moderate',
  'Anti-inflammatory, soothes irritation, reduces TEWL'
FROM public.ingredients WHERE slug = 'niacinamide' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.65, 'moderate',
  'Centella asiatica promotes wound healing and has anti-inflammatory properties'
FROM public.ingredients WHERE slug = 'centella-asiatica' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.60, 'moderate',
  'Chamomile has anti-inflammatory and soothing properties for irritated skin'
FROM public.ingredients WHERE slug = 'chamomile-extract' LIMIT 1;

-- ============================================================
-- SOLAR LENTIGINES (SUN SPOTS)
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'solar-lentigines', 0.85, 'strong',
  'L-ascorbic acid inhibits tyrosinase, photoprotective, reduces UV-induced pigmentation'
FROM public.ingredients WHERE slug = 'l-ascorbic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'solar-lentigines', 0.80, 'strong',
  'Retinol promotes cell turnover, disperses melanin, reduces sun spots'
FROM public.ingredients WHERE slug = 'retinol' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'solar-lentigines', 0.70, 'moderate',
  'AHA exfoliation removes pigmented surface cells'
FROM public.ingredients WHERE slug = 'glycolic-acid' LIMIT 1;

-- ============================================================
-- CONTACT DERMATITIS
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'contact-dermatitis', 0.70, 'moderate',
  'Ceramides restore barrier function compromised by contact irritants'
FROM public.ingredients WHERE slug = 'ceramides' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'contact-dermatitis', 0.65, 'moderate',
  'Hyaluronic acid hydrates and soothes irritated barrier'
FROM public.ingredients WHERE slug = 'hyaluronic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'contact-dermatitis', 0.60, 'moderate',
  'Aloe vera has anti-inflammatory and soothing properties for contact reactions'
FROM public.ingredients WHERE slug = 'aloe-vera' LIMIT 1;

-- ============================================================
-- CROSS-CUTTING: Hydration for dry/barrier conditions
-- ============================================================

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.75, 'strong',
  'Humectant that draws water into stratum corneum, improving hydration'
FROM public.ingredients WHERE slug = 'hyaluronic-acid' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'seborrheic-dermatitis', 0.55, 'emerging',
  'Ceramides support barrier repair even in sebhorreic skin'
FROM public.ingredients WHERE slug = 'ceramides' LIMIT 1;

-- ============================================================
-- ADDITIONAL: Antioxidants for multiple conditions
-- ============================================================

-- Green Tea (EGCG) for inflammation
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'acne-vulgaris', 0.55, 'moderate',
  'EGCG reduces sebum production and has anti-inflammatory properties'
FROM public.ingredients WHERE slug = 'green-tea-extract' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'rosacea', 0.55, 'moderate',
  'EGCG has anti-inflammatory and photoprotective properties'
FROM public.ingredients WHERE slug = 'green-tea-extract' LIMIT 1;

-- Snail mucin for barrier and hydration
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'atopic-dermatitis', 0.55, 'emerging',
  'Snail mucin contains glycoproteins and hyaluronic acid for barrier repair'
FROM public.ingredients WHERE slug = 'snail-mucin' LIMIT 1;

INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.50, 'emerging',
  'Snail mucin promotes wound healing and may reduce PIH'
FROM public.ingredients WHERE slug = 'snail-mucin' LIMIT 1;

-- Resveratrol for aging and photodamage
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'solar-lentigines', 0.55, 'moderate',
  'Resveratrol inhibits tyrosinase and has photoprotective antioxidant properties'
FROM public.ingredients WHERE slug = 'resveratrol' LIMIT 1;

-- Copper peptides for wound healing
INSERT INTO public.condition_connections (ingredient_id, condition_id, effectiveness, evidence_level, mechanism)
SELECT id, 'post-inflammatory-hyperpigmentation', 0.50, 'emerging',
  'Copper peptides promote wound healing and may reduce post-inflammatory marks'
FROM public.ingredients WHERE slug = 'copper-peptides' LIMIT 1;