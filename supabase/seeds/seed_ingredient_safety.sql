-- ============================================
-- Seed Ingredient Safety Data (50 Ingredients)
-- ============================================

-- Add safety columns to ingredients table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ingredients' AND column_name='comedogenic_rating') THEN
    ALTER TABLE public.ingredients ADD COLUMN comedogenic_rating INTEGER CHECK (comedogenic_rating >= 0 AND comedogenic_rating <= 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ingredients' AND column_name='irritation_potential') THEN
    ALTER TABLE public.ingredients ADD COLUMN irritation_potential TEXT CHECK (irritation_potential IN ('none', 'low', 'moderate', 'high'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ingredients' AND column_name='safety_rating') THEN
    ALTER TABLE public.ingredients ADD COLUMN safety_rating TEXT CHECK (safety_rating IN ('safe', 'low_concern', 'moderate_concern', 'high_concern', 'avoid'));
  END IF;
END $$;

-- Seed data
INSERT INTO public.ingredients (name, slug, inci_name, category, description, evidence_level, concerns, pregnancy_safe, comedogenic_rating, irritation_potential, safety_rating) VALUES
('Niacinamide', 'niacinamide', 'Niacinamide', 'vitamin', 'Vitamin B3; proven for barrier repair, hyperpigmentation, and acne. Anti-inflammatory and brightening.', 'strong', ARRAY['hyperpigmentation','acne','redness','barrier'], TRUE, 0, 'none', 'safe'),
('Salicylic Acid', 'salicylic-acid', 'Salicylic Acid', 'bha', 'Beta-hydroxy acid; oil-soluble, exfoliates inside pores. Gold standard for acne and blackheads.', 'strong', ARRAY['acne','blackheads','texture'], FALSE, 0, 'moderate', 'low_concern'),
('Retinol', 'retinol', 'Retinol', 'retinoid', 'Vitamin A derivative; accelerates cell turnover, reduces wrinkles and acne. Photosensitizing.', 'strong', ARRAY['aging','acne','hyperpigmentation','texture'], FALSE, 2, 'high', 'moderate_concern'),
('Hyaluronic Acid', 'hyaluronic-acid', 'Hyaluronic Acid', 'humectant', 'Naturally occurring molecule; holds up to 1000x its weight in water. Hydrates without heaviness.', 'strong', ARRAY['hydration','plumping','barrier'], TRUE, 0, 'none', 'safe'),
('Ascorbic Acid', 'ascorbic-acid', 'Ascorbic Acid', 'vitamin', 'Pure Vitamin C; powerful antioxidant, collagen synthesis, brightening. Unstable in water.', 'strong', ARRAY['hyperpigmentation','aging','brightness','antioxidant'], TRUE, 0, 'moderate', 'low_concern'),
('Azelaic Acid', 'azelaic-acid', 'Azelaic Acid', 'aha', 'Dicarboxylic acid; anti-inflammatory, antimicrobial, effective for rosacea and hyperpigmentation.', 'strong', ARRAY['rosacea','acne','hyperpigmentation','redness'], TRUE, 0, 'low', 'safe'),
('Benzoyl Peroxide', 'benzoyl-peroxide', 'Benzoyl Peroxide', 'treatment', 'Oxidizing agent; kills acne bacteria, reduces inflammation. Can bleach fabrics.', 'strong', ARRAY['acne','inflammatory_acne'], FALSE, 0, 'moderate', 'moderate_concern'),
('Glycolic Acid', 'glycolic-acid', 'Glycolic Acid', 'aha', 'Smallest AHA molecule; penetrates deeply, exfoliates, stimulates collagen. Higher irritation risk.', 'strong', ARRAY['aging','hyperpigmentation','texture','acne'], TRUE, 0, 'high', 'low_concern'),
('Lactic Acid', 'lactic-acid', 'Lactic Acid', 'aha', 'Gentler AHA; exfoliates plus hydrates. Good for sensitive skin.', 'strong', ARRAY['hydration','texture','hyperpigmentation','aging'], TRUE, 0, 'low', 'safe'),
('Ceramides', 'ceramides', 'Ceramides', 'emollient', 'Lipid molecules; essential for barrier function. Replenishes skin''s natural moisture barrier.', 'strong', ARRAY['barrier','dryness','sensitivity'], TRUE, 0, 'none', 'safe'),
('Centella Asiatica', 'centella-asiatica', 'Centella Asiatica Extract', 'botanical', 'Traditional medicinal herb; wound healing, anti-inflammatory, collagen boosting. Also known as gotu kola or cica.', 'moderate', ARRAY['redness','sensitivity','barrier','aging'], TRUE, 0, 'none', 'safe'),
('Tea Tree Oil', 'tea-tree-oil', 'Melaleuca Alternifolia Leaf Oil', 'botanical', 'Natural antimicrobial; effective for mild-moderate acne. Potentially sensitizing at high concentrations.', 'moderate', ARRAY['acne','antimicrobial'], TRUE, 0, 'moderate', 'low_concern'),
('Zinc Oxide', 'zinc-oxide', 'Zinc Oxide', 'sunscreen', 'Physical sunscreen; broad spectrum UVA/UVB protection. Also soothing and anti-inflammatory.', 'strong', ARRAY['sun_protection','redness','sensitivity'], TRUE, 0, 'none', 'safe'),
('Titanium Dioxide', 'titanium-dioxide', 'Titanium Dioxide', 'sunscreen', 'Physical sunscreen; UV protection plus some coverage. Often micronized for better texture.', 'strong', ARRAY['sun_protection'], TRUE, 0, 'none', 'safe'),
('Dimethicone', 'dimethicone', 'Dimethicone', 'occlusive', 'Silicone; occlusive barrier, smooths texture, non-comedogenic.', 'strong', ARRAY['texture','barrier'], TRUE, 1, 'none', 'safe'),
('Shea Butter', 'shea-butter', 'Butyrospermum Parkii Butter', 'emollient', 'Rich plant butter; deeply moisturizing, anti-inflammatory, barrier-supporting.', 'moderate', ARRAY['dryness','barrier','eczema'], TRUE, 0, 'low', 'safe'),
('Squalane', 'squalane', 'Squalane', 'emollient', 'Lightweight, non-comedogenic oil; mimics skin''s natural sebum. Great for all skin types.', 'moderate', ARRAY['hydration','barrier','dryness'], TRUE, 0, 'none', 'safe'),
('Peptides', 'peptides', 'Palmitoyl Pentapeptide-4', 'peptide', 'Short chains of amino acids; signal collagen production. Evidence is emerging but promising.', 'moderate', ARRAY['aging','firmness','elasticity'], TRUE, 0, 'none', 'safe'),
('Tranexamic Acid', 'tranexamic-acid', 'Tranexamic Acid', 'treatment', 'Antifibrinolytic agent; reduces melanin production. Excellent for hyperpigmentation and melasma.', 'strong', ARRAY['hyperpigmentation','melasma','dark_spots'], TRUE, 0, 'low', 'safe'),
('Kojic Acid', 'kojic-acid', 'Kojic Acid', 'treatment', 'Fungal metabolite; inhibits melanin production. Effective for hyperpigmentation but can irritate.', 'moderate', ARRAY['hyperpigmentation','melasma'], TRUE, 0, 'moderate', 'low_concern'),
('Alpha Arbutin', 'alpha-arbutin', 'Alpha-Arbutin', 'treatment', 'Hydroquinone derivative; inhibits tyrosinase for brightening. Safer than hydroquinone.', 'moderate', ARRAY['hyperpigmentation','brightness'], TRUE, 0, 'low', 'safe'),
('Vitamin E', 'vitamin-e', 'Tocopherol', 'vitamin', 'Antioxidant; protects from oxidative stress, supports barrier, synergistic with Vitamin C.', 'strong', ARRAY['antioxidant','barrier','aging'], TRUE, 2, 'low', 'safe'),
('Ceramide NP', 'ceramide-np', 'Ceramide NP', 'emollient', 'Specific ceramide type; major component of skin barrier lipids. Critical for dry/sensitive skin.', 'strong', ARRAY['barrier','dryness','eczema'], TRUE, 0, 'none', 'safe'),
('Beta Hydroxy Acid', 'beta-hydroxy-acid', 'Salicylic Acid', 'bha', 'Same as salicylic acid; oil-soluble exfoliant. Penetrates pores to clear debris.', 'strong', ARRAY['acne','blackheads','texture'], FALSE, 0, 'moderate', 'low_concern'),
('Alpha Hydroxy Acid', 'alpha-hydroxy-acid', 'Glycolic Acid', 'aha', 'General class including glycolic and lactic acid; water-soluble surface exfoliants.', 'strong', ARRAY['aging','hyperpigmentation','texture'], TRUE, 0, 'moderate', 'low_concern'),
('Retinyl Palmitate', 'retinyl-palmitate', 'Retinyl Palmitate', 'retinoid', 'Ester form of Vitamin A; gentler than retinol, less effective but suitable for sensitive skin.', 'moderate', ARRAY['aging','acne','brightness'], FALSE, 2, 'low', 'low_concern'),
('Adapalene', 'adapalene', 'Adapalene', 'retinoid', 'Third-generation retinoid; prescription-strength for acne. More stable than tretinoin.', 'strong', ARRAY['acne','texture','aging'], FALSE, 0, 'moderate', 'moderate_concern'),
('Tretinoin', 'tretinoin', 'Tretinoin', 'retinoid', 'Prescription retinoic acid; gold standard for acne and photoaging. Highly irritating initially.', 'strong', ARRAY['acne','aging','hyperpigmentation','texture'], FALSE, 0, 'high', 'moderate_concern'),
('Bakuchiol', 'bakuchiol', 'Bakuchiol', 'botanical', 'Plant-derived retinol alternative; similar benefits with less irritation. Pregnancy-safe option.', 'moderate', ARRAY['aging','acne','hyperpigmentation'], TRUE, 0, 'low', 'safe'),
('N-Acetyl Glucosamine', 'n-acetyl-glucosamine', 'Acetyl Glucosamine', 'treatment', 'Amino sugar; brightening, supports hyaluronic acid synthesis, gentle exfoliation.', 'moderate', ARRAY['hyperpigmentation','hydration','texture'], TRUE, 0, 'none', 'safe'),
('Licorice Root Extract', 'licorice-root', 'Glycyrrhiza Glabra Root Extract', 'botanical', 'Anti-inflammatory, brightening, soothes redness. Contains glabridin for pigmentation.', 'moderate', ARRAY['redness','hyperpigmentation','sensitivity'], TRUE, 0, 'none', 'safe'),
('Green Tea Extract', 'green-tea-extract', 'Camellia Sinensis Leaf Extract', 'botanical', 'Rich in polyphenols (EGCG); antioxidant, anti-inflammatory, sebum-regulating.', 'strong', ARRAY['antioxidant','redness','acne','aging'], TRUE, 0, 'none', 'safe'),
('Resveratrol', 'resveratrol', 'Resveratrol', 'antioxidant', 'Polyphenol antioxidant; anti-inflammatory, photoprotective, anti-aging.', 'moderate', ARRAY['aging','antioxidant','redness'], TRUE, 0, 'low', 'safe'),
('Ferulic Acid', 'ferulic-acid', 'Ferulic Acid', 'antioxidant', 'Plant antioxidant; stabilizes Vitamin C & E, enhances photoprotection.', 'moderate', ARRAY['antioxidant','aging','sun_protection'], TRUE, 0, 'low', 'safe'),
('Coenzyme Q10', 'coenzyme-q10', 'Ubiquinone', 'antioxidant', 'Cellular energy cofactor; antioxidant, reduces fine lines, energizes skin.', 'moderate', ARRAY['aging','antioxidant'], TRUE, 0, 'none', 'safe'),
('Madecassoside', 'madecassoside', 'Madecassoside', 'botanical', 'Active compound from Centella Asiatica; healing, anti-inflammatory, collagen synthesis.', 'moderate', ARRAY['barrier','redness','sensitivity','aging'], TRUE, 0, 'none', 'safe'),
('Allantoin', 'allantoin', 'Allantoin', 'treatment', 'Anti-irritant, soothing, promotes wound healing. Common in sensitive skin formulations.', 'strong', ARRAY['sensitivity','barrier','redness'], TRUE, 0, 'none', 'safe'),
('Panthenol', 'panthenol', 'Panthenol', 'vitamin', 'Pro-Vitamin B5; humectant, soothing, barrier repair, wound healing.', 'strong', ARRAY['hydration','barrier','sensitivity'], TRUE, 0, 'none', 'safe'),
('Urea', 'urea', 'Urea', 'humectant', 'Natural moisturizing factor; hydrates and gently exfoliates at higher concentrations.', 'strong', ARRAY['dryness','texture','barrier'], TRUE, 0, 'low', 'safe'),
('Lactobionic Acid', 'lactobionic-acid', 'Lactobionic Acid', 'aha', 'PHA; gentler than AHAs, antioxidant, hydrating, suitable for sensitive/rosacea skin.', 'moderate', ARRAY['aging','hydration','texture','redness'], TRUE, 0, 'none', 'safe'),
('Gluconolactone', 'gluconolactone', 'Gluconolactone', 'aha', 'PHA; mild exfoliation plus antioxidant benefits. Very gentle.', 'moderate', ARRAY['aging','texture','hydration'], TRUE, 0, 'none', 'safe'),
('Mandelic Acid', 'mandelic-acid', 'Mandelic Acid', 'aha', 'Large-molecule AHA; penetrates slowly, less irritating. Good for darker skin tones.', 'moderate', ARRAY['hyperpigmentation','acne','texture'], TRUE, 0, 'low', 'safe'),
('Rosehip Oil', 'rosehip-oil', 'Rosa Canina Seed Oil', 'botanical', 'Natural source of Vitamin A & C; nourishing, regenerative, anti-inflammatory.', 'moderate', ARRAY['aging','hydration','redness'], TRUE, 1, 'low', 'safe'),
('Jojoba Oil', 'jojoba-oil', 'Simmondsia Chinensis Seed Oil', 'emollient', 'Wax ester mimicking human sebum; moisturizing, non-comedogenic, balancing.', 'moderate', ARRAY['hydration','barrier','oil_balance'], TRUE, 2, 'low', 'safe'),
('Sunflower Seed Oil', 'sunflower-seed-oil', 'Helianthus Annuus Seed Oil', 'emollient', 'Light, non-comedogenic oil; rich in linoleic acid, barrier-supporting.', 'moderate', ARRAY['hydration','barrier'], TRUE, 0, 'none', 'safe'),
('Propolis Extract', 'propolis', 'Propolis Extract', 'botanical', 'Bee resin; antimicrobial, anti-inflammatory, wound healing. Good for acne-prone skin.', 'limited', ARRAY['acne','redness','barrier'], TRUE, 2, 'low', 'safe'),
('Snail Mucin', 'snail-mucin', 'Snail Secretion Filtrate', 'treatment', 'Popular in K-beauty; hydrating, soothing, promotes healing. Evidence is anecdotal.', 'limited', ARRAY['hydration','barrier','sensitivity','aging'], TRUE, 0, 'none', 'safe'),
('Polyhydroxy Acid', 'polyhydroxy-acid', 'Gluconolactone', 'aha', 'Gentle acid class; exfoliates with added antioxidant and hydrating benefits.', 'moderate', ARRAY['aging','texture','hydration'], TRUE, 0, 'none', 'safe'),
('Sodium Ascorbyl Phosphate', 'sodium-ascorbyl-phosphate', 'Sodium Ascorbyl Phosphate', 'vitamin', 'Stable Vitamin C derivative; gentle, brightening, some anti-acne evidence.', 'moderate', ARRAY['brightness','acne','aging'], TRUE, 0, 'none', 'safe'),
('Magnesium Ascorbyl Phosphate', 'magnesium-ascorbyl-phosphate', 'Magnesium Ascorbyl Phosphate', 'vitamin', 'Stable Vitamin C derivative; hydrating, brightening, less irritating than ascorbic acid.', 'moderate', ARRAY['brightness','hydration','aging'], TRUE, 0, 'none', 'safe'),
('Tetrahexyldecyl Ascorbate', 'tetrahexyldecyl-ascorbate', 'Tetrahexyldecyl Ascorbate', 'vitamin', 'Oil-soluble Vitamin C derivative; penetrates well, stable, anti-aging and brightening.', 'moderate', ARRAY['aging','brightness','hyperpigmentation'], TRUE, 0, 'none', 'safe')
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  evidence_level = EXCLUDED.evidence_level,
  concerns = EXCLUDED.concerns,
  pregnancy_safe = EXCLUDED.pregnancy_safe,
  comedogenic_rating = EXCLUDED.comedogenic_rating,
  irritation_potential = EXCLUDED.irritation_potential,
  safety_rating = EXCLUDED.safety_rating;
