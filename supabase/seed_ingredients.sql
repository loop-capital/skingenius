-- SKINgenius Ingredients Seed File
-- Generated from 50 ingredient profiles across batches
-- Created: 2026-05-14

-- =========================================================
-- BATCH 1: Retinoids & Acids (10 ingredients)
-- =========================================================

INSERT INTO public.ingredients (
  name, slug, inci_name, category, description, evidence_level,
  concerns, skin_types, interactions, pregnancy_safe,
  min_concentration, max_concentration
) VALUES
(
  'Retinol', 'retinol', 'Retinol (Vitamin A1)', 'retinoid',
  'Binds to nuclear retinoic acid receptors (RARs), modulating gene expression involved in cellular differentiation, proliferation, and extracellular matrix production. Converted to retinaldehyde then retinoic acid in skin. Increases collagen synthesis, enhances epidermal thickness, reduces fine lines and hyperpigmentation.',
  'strong',
  ARRAY['aging', 'acne', 'hyperpigmentation', 'texture'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY['benzoyl peroxide', 'AHA', 'BHA', 'other retinoids'],
  FALSE,
  0.1, 1.0
),
(
  'Tretinoin', 'tretinoin', 'Tretinoin (All-trans retinoic acid)', 'retinoid',
  'Prescription retinoid. Direct agonist of retinoic acid receptors (RAR-α, β, γ), regulating gene expression for keratinocyte differentiation, collagen synthesis, and melanin dispersion. Gold standard for photoaging treatment and acne.',
  'strong',
  ARRAY['aging', 'acne', 'hyperpigmentation', 'texture'],
  ARRAY['oily', 'combination'],
  ARRAY['benzoyl peroxide', 'sulfur', 'resorcinol', 'salicylic acid', 'other retinoids'],
  FALSE,
  0.025, 0.1
),
(
  'L-Ascorbic Acid', 'l-ascorbic-acid', 'L-Ascorbic Acid', 'vitamin',
  'Potent antioxidant that neutralizes free radicals, essential cofactor for collagen synthesis (hydroxylation of proline and lysine), inhibits tyrosinase to reduce melanin formation. Protects against UV-induced photodamage.',
  'strong',
  ARRAY['hyperpigmentation', 'aging', 'sun_damage', 'brightness'],
  ARRAY['normal', 'oily', 'combination', 'dry'],
  ARRAY['copper peptides'],
  TRUE,
  10.0, 20.0
),
(
  'Niacinamide', 'niacinamide', 'Niacinamide (Vitamin B3, Nicotinamide)', 'vitamin',
  'Precursor to NAD+/NADH, involved in cellular energy transfer, DNA repair, and modulation of inflammatory pathways. Inhibits melanosome transfer, improves barrier ceramides, reduces sebum production.',
  'strong',
  ARRAY['hyperpigmentation', 'acne', 'rosacea', 'barrier_repair', 'redness'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  2.0, 10.0
),
(
  'Hyaluronic Acid', 'hyaluronic-acid', 'Hyaluronic Acid (HA, Sodium Hyaluronate)', 'humectant',
  'Highly hydrophilic molecule that binds and retains water (up to 1000x its weight). Provides hydration, plumping effect, and supports extracellular matrix. Different molecular weights penetrate to different depths.',
  'strong',
  ARRAY['dryness', 'aging', 'texture'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  0.1, 2.0
),
(
  'Glycolic Acid', 'glycolic-acid', 'Glycolic Acid (AHA - Alpha Hydroxy Acid)', 'aha',
  'Keratolytic agent that breaks down desmosomes between corneocytes, promoting exfoliation. Smallest AHA molecule allows for good penetration. Stimulates collagen and glycosaminoglycan production.',
  'strong',
  ARRAY['hyperpigmentation', 'aging', 'texture', 'acne'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY['salicylic acid', 'retinoids', 'vitamin C'],
  FALSE,
  5.0, 10.0
),
(
  'Salicylic Acid', 'salicylic-acid', 'Salicylic Acid (BHA - Beta Hydroxy Acid)', 'bha',
  'Lipophilic agent that penetrates sebaceous follicles, dissolves intercellular cement, and desmosomes. Anti-inflammatory via aspirin-like properties. Keratolytic and comedolytic.',
  'strong',
  ARRAY['acne', 'texture', 'seborrheic_dermatitis', 'keratosis_pilaris'],
  ARRAY['oily', 'combination'],
  ARRAY['glycolic acid', 'retinoids', 'benzoyl peroxide'],
  FALSE,
  0.5, 2.0
),
(
  'Ceramides', 'ceramides', 'Ceramides (Ceramide AP, EOP, NG, NP, NS)', 'emollient',
  'Essential lipid components of the stratum corneum that maintain barrier integrity, prevent transepidermal water loss, and protect against irritants and pathogens. Work with cholesterol and fatty acids in lipid matrix.',
  'strong',
  ARRAY['dryness', 'eczema', 'barrier_repair', 'sensitivity'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  0.1, 5.0
),
(
  'Azelaic Acid', 'azelaic-acid', 'Azelaic Acid', 'other',
  'Antimicrobial against P. acnes and S. epidermidis, inhibits tyrosinase (reducing melanin production), anti-inflammatory (scavenges free radicals), normalizes keratinization.',
  'strong',
  ARRAY['acne', 'hyperpigmentation', 'rosacea', 'melasma'],
  ARRAY['normal', 'oily', 'combination', 'sensitive'],
  ARRAY[],
  TRUE,
  10.0, 20.0
),
(
  'Benzoyl Peroxide', 'benzoyl-peroxide', 'Benzoyl Peroxide (BPO)', 'other',
  'Releases free radical oxygen species that oxidize bacterial proteins and Cutibacterium acnes. Also has mild keratolytic and anti-inflammatory effects. Does not induce bacterial resistance.',
  'strong',
  ARRAY['acne', 'inflammation'],
  ARRAY['oily', 'combination'],
  ARRAY['retinol', 'tretinoin', 'vitamin C'],
  TRUE,
  2.5, 10.0
);

-- =========================================================
-- BATCH 3: Specialty & Protective (5 ingredients)
-- =========================================================

INSERT INTO public.ingredients (
  name, slug, inci_name, category, description, evidence_level,
  concerns, skin_types, interactions, pregnancy_safe,
  min_concentration, max_concentration
) VALUES
(
  'Licorice Root Extract', 'licorice-root-extract', 'Glycyrrhiza Glabra (Licorice) Root Extract', 'botanical',
  'Contains glabridin, which inhibits tyrosinase. Liquiritin disperses existing melanin. Glycyrrhizin exhibits anti-inflammatory action via inhibition of phospholipase A2 and COX-2.',
  'moderate',
  ARRAY['hyperpigmentation', 'melasma', 'redness', 'inflammation'],
  ARRAY['normal', 'combination', 'dry', 'sensitive'],
  ARRAY['high-strength retinoids', 'high-strength AHAs', 'mineral salts'],
  TRUE,
  0.5, 5.0
),
(
  'Kojic Acid', 'kojic-acid', 'Kojic Acid (5-hydroxy-2-hydroxymethyl-4H-pyran-4-one)', 'other',
  'Chelates copper at the active site of tyrosinase, preventing the conversion of L-tyrosine to dopaquinone. Also scavenges free radicals.',
  'strong',
  ARRAY['hyperpigmentation', 'melasma'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY['iron salts', 'copper peptides', 'niacinamide'],
  FALSE,
  1.0, 4.0
),
(
  'Astaxanthin', 'astaxanthin', 'Astaxanthin (Haematococcus Pluvialis Extract)', 'antioxidant',
  'Potent lipid-phase antioxidant. Quenches singlet oxygen (~6,000x more effective than vitamin C, ~550x more effective than vitamin E). Spans lipid bilayer. Inhibits MMP expression, reducing UV-induced collagen breakdown.',
  'emerging',
  ARRAY['aging', 'sun_damage', 'inflammation'],
  ARRAY['normal', 'dry', 'combination', 'sensitive'],
  ARRAY[],
  TRUE,
  0.001, 0.1
),
(
  'Zinc Oxide', 'zinc-oxide', 'Zinc Oxide (ZnO)', 'sunscreen',
  'Mineral UV filter that reflects, scatters, and absorbs UV radiation. Broad-spectrum UVA+UVB. Also exhibits mild antimicrobial and astringent properties.',
  'strong',
  ARRAY['sun_damage', 'acne', 'inflammation'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY['AHAs', 'BHAs', 'citric acid', 'EDTA'],
  TRUE,
  10.0, 25.0
),
(
  'Snail Mucin', 'snail-mucin', 'Snail Secretion Filtrate', 'humectant',
  'Natural mixture of glycoproteins, glycolic acid, hyaluronic acid, copper peptides, antimicrobial peptides, and protease inhibitors. Stimulates fibroblast proliferation and collagen/elastin synthesis.',
  'emerging',
  ARRAY['hydration', 'aging', 'texture', 'wound_healing'],
  ARRAY['normal', 'dry', 'combination', 'sensitive'],
  ARRAY['high-strength AHAs', 'retinoids'],
  TRUE,
  20.0, 97.0
);

-- =========================================================
-- BATCH 4: Botanicals & Natural Extracts (20 ingredients)
-- =========================================================

INSERT INTO public.ingredients (
  name, slug, inci_name, category, description, evidence_level,
  concerns, skin_types, interactions, pregnancy_safe,
  min_concentration, max_concentration
) VALUES
(
  'Aloe Vera', 'aloe-vera', 'Aloe Barbadensis Leaf Juice', 'botanical',
  'Polysaccharides (acemannan) form a protective gel barrier; anthraquinones and salicylic acid derivatives provide mild anti-inflammatory and antimicrobial effects. Stimulates fibroblast activity and collagen synthesis.',
  'moderate',
  ARRAY['dryness', 'inflammation', 'wound_healing', 'redness'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  1.0, 10.0
),
(
  'Apple Cider Vinegar', 'apple-cider-vinegar', 'Acetum / Apple Cider Vinegar', 'other',
  'Acetic acid lowers skin pH, promoting acid mantle restoration. Contains alpha-hydroxy acids (malic acid, citric acid) for mild exfoliation. Antimicrobial against Malassezia and Cutibacterium acnes.',
  'limited',
  ARRAY['acne', 'texture', 'pH_balance'],
  ARRAY['oily', 'combination'],
  ARRAY['retinoids', 'strong acids'],
  TRUE,
  1.0, 5.0
),
(
  'Avocado Extract', 'avocado-extract', 'Persea Gratissima (Avocado) Fruit Extract', 'emollient',
  'Rich in oleic acid, linoleic acid, and palmitoleic acid. High content of vitamins E, C, and carotenoids. Phytosterols support barrier repair and reduce inflammation.',
  'moderate',
  ARRAY['dryness', 'barrier_repair', 'aging'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  TRUE,
  1.0, 5.0
),
(
  'Bamboo Extract', 'bamboo-extract', 'Bambusa Vulgaris Extract', 'botanical',
  'Rich in silica (silicon dioxide), essential for collagen synthesis. Contains flavonoids and phenolic acids with antioxidant activity. Provides mild mechanical exfoliation in powder form.',
  'limited',
  ARRAY['aging', 'texture'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY[],
  TRUE,
  0.5, 3.0
),
(
  'Calendula Extract', 'calendula-extract', 'Calendula Officinalis Flower Extract', 'botanical',
  'Triterpenoids and flavonoids inhibit prostaglandin synthesis and reduce inflammation. Saponins and carotenoids promote granulation tissue formation. Antibacterial and antifungal.',
  'moderate',
  ARRAY['inflammation', 'wound_healing', 'radiation_dermatitis'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY[],
  FALSE,
  1.0, 5.0
),
(
  'Carrot Seed Oil', 'carrot-seed-oil', 'Daucus Carota Sativa (Carrot) Seed Oil', 'botanical',
  'High in carotenoids that convert to vitamin A and provide photoprotection. Rich in vitamin E and vitamin C. Sesquiterpenes have antimicrobial and antifungal properties.',
  'limited',
  ARRAY['aging', 'regeneration', 'antioxidant'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  FALSE,
  0.1, 1.0
),
(
  'Chamomile Extract', 'chamomile-extract', 'Chamomilla Recutita Flower Extract', 'botanical',
  'Bisabolol and chamazulene inhibit leukotriene and prostaglandin synthesis. Apigenin and luteolin flavonoids provide antioxidant activity. Alpha-bisabolol has antimicrobial activity.',
  'moderate',
  ARRAY['redness', 'inflammation', 'sensitivity', 'eczema'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  1.0, 5.0
),
(
  'Coconut Oil', 'coconut-oil', 'Cocos Nucifera (Coconut) Oil', 'occlusive',
  '47% lauric acid provides antimicrobial activity. Medium-chain fatty acids penetrate stratum corneum, supporting barrier repair. Triglycerides form occlusive film reducing TEWL.',
  'strong',
  ARRAY['dryness', 'eczema', 'barrier_repair'],
  ARRAY['normal', 'dry'],
  ARRAY[],
  TRUE,
  1.0, 10.0
),
(
  'Cucumber Extract', 'cucumber-extract', 'Cucumis Sativus (Cucumber) Fruit Extract', 'botanical',
  'High water content provides immediate hydration. Cucurbitacins and flavonoids offer anti-inflammatory and antioxidant activity. Ascorbic acid and caffeic acid reduce UV-induced oxidative stress.',
  'limited',
  ARRAY['hydration', 'soothing', 'puffiness'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  1.0, 5.0
),
(
  'Echinacea Extract', 'echinacea-extract', 'Echinacea Purpurea Extract', 'botanical',
  'Echinacoside and chicoric acid modulate immune responses. Alkamides and polysaccharides have antiviral and antibacterial properties. Inhibits hyaluronidase.',
  'limited',
  ARRAY['aging', 'inflammation', 'immunomodulation'],
  ARRAY['normal', 'combination', 'dry'],
  ARRAY[],
  TRUE,
  0.5, 3.0
),
(
  'Frankincense Oil', 'frankincense-oil', 'Boswellia Carterii Oil', 'botanical',
  'Boswellic acids inhibit 5-lipoxygenase, reducing leukotriene-mediated inflammation. Incensole acetate has anti-anxiety and anti-inflammatory effects. Promotes keratinocyte differentiation.',
  'moderate',
  ARRAY['aging', 'inflammation', 'scar_reduction'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  FALSE,
  0.1, 1.0
),
(
  'Ginkgo Biloba Extract', 'ginkgo-biloba-extract', 'Ginkgo Biloba Leaf Extract', 'botanical',
  'Flavonoid glycosides and terpene lactones scavenge free radicals and reduce oxidative stress. Improves microcirculation through PAF antagonism. Inhibits collagenase and elastase.',
  'limited',
  ARRAY['aging', 'circulation', 'antioxidant'],
  ARRAY['normal', 'combination', 'dry'],
  ARRAY[],
  TRUE,
  0.5, 2.0
),
(
  'Gotu Kola Extract', 'gotu-kola-extract', 'Centella Asiatica Extract', 'botanical',
  'Triterpenoids (asiaticoside, madecassoside) stimulate collagen types I and III synthesis. Modulates inflammation by inhibiting IL-6 and TNF-alpha. Improves microcirculation.',
  'strong',
  ARRAY['wound_healing', 'scar_reduction', 'aging', 'inflammation'],
  ARRAY['normal', 'dry', 'combination', 'sensitive'],
  ARRAY[],
  FALSE,
  1.0, 5.0
),
(
  'Grape Seed Extract', 'grape-seed-extract', 'Vitis Vinifera (Grape) Seed Extract', 'antioxidant',
  'Proanthocyanidins (OPCs) are potent free radical scavengers. Inhibit collagenase, elastase, and hyaluronidase. Linoleic acid supports barrier function. Antimicrobial against P. acnes.',
  'moderate',
  ARRAY['aging', 'acne', 'sun_damage'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY[],
  TRUE,
  0.5, 3.0
),
(
  'Green Tea Extract', 'green-tea-extract', 'Camellia Sinensis Leaf Extract', 'antioxidant',
  'Polyphenols (catechins, especially EGCG) are potent antioxidants. EGCG inhibits 5-alpha-reductase, reducing sebum production. Anti-inflammatory through NF-kB pathway inhibition. Photoprotective.',
  'strong',
  ARRAY['aging', 'acne', 'sun_damage', 'redness', 'inflammation'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  1.0, 5.0
),
(
  'Helichrysum Oil', 'helichrysum-oil', 'Helichrysum Italicum Extract', 'botanical',
  'Italidiones provide potent anti-inflammatory activity. Promotes tissue regeneration and reduces bruising through improved microcirculation.',
  'limited',
  ARRAY['scar_reduction', 'inflammation', 'bruising'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  FALSE,
  0.1, 1.0
),
(
  'Hibiscus Extract', 'hibiscus-extract', 'Hibiscus Rosa-Sinensis Flower Extract', 'botanical',
  'Natural source of AHAs (citric acid, malic acid, tartaric acid). Anthocyanins provide antioxidant and anti-inflammatory activity. Mucilage forms hydrating film.',
  'limited',
  ARRAY['texture', 'aging', 'hydration'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY[],
  TRUE,
  1.0, 5.0
),
(
  'Horsetail Extract', 'horsetail-extract', 'Equisetum Arvense Extract', 'botanical',
  'Rich in silica essential for collagen synthesis. Flavonoids provide antioxidant activity. Astringent tannins tighten tissues and reduce inflammation.',
  'limited',
  ARRAY['aging', 'wound_healing', 'texture'],
  ARRAY['normal', 'oily', 'combination'],
  ARRAY[],
  FALSE,
  0.5, 3.0
),
(
  'Irish Moss', 'irish-moss', 'Chondrus Crispus Extract', 'humectant',
  'Carrageenan polysaccharides form a protective, hydrating film. Rich in minerals and vitamins. Sulfated polysaccharides have demonstrated antimicrobial and anti-inflammatory properties.',
  'limited',
  ARRAY['hydration', 'soothing', 'texture'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY[],
  TRUE,
  0.5, 3.0
),
(
  'Jasmine Oil', 'jasmine-oil', 'Jasminum Officinale Flower Oil', 'fragrance',
  'Benzoic acid derivatives and benzyl acetate provide antimicrobial activity. Jasmonates have demonstrated anti-aging effects in plant models. Linalool provides mild antiseptic properties.',
  'limited',
  ARRAY['mood', 'antimicrobial'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  FALSE,
  0.05, 0.5
);

-- =========================================================
-- SUPPLEMENT BRIDGE: Skin-relevant supplements (5 ingredients)
-- =========================================================

INSERT INTO public.ingredients (
  name, slug, inci_name, category, description, evidence_level,
  concerns, skin_types, interactions, pregnancy_safe,
  min_concentration, max_concentration
) VALUES
(
  'Collagen Peptides', 'collagen-peptides', 'Hydrolyzed Collagen', 'peptide',
  'Oral hydrolyzed collagen provides amino acids (glycine, proline, hydroxyproline) that accumulate in skin and stimulate fibroblasts to produce new collagen.',
  'moderate',
  ARRAY['aging', 'dryness', 'wound_healing'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  TRUE,
  2.5, 10.0
),
(
  'Probiotics', 'probiotics', 'Probiotic Complex', 'other',
  'Gut microbiome influences systemic inflammation and immune regulation. Dysbiosis linked to acne, eczema, rosacea. Strain-specific benefits (L. rhamnosus GG for eczema, L. reuteri for acne).',
  'moderate',
  ARRAY['acne', 'eczema', 'rosacea', 'sensitivity'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY['antibiotics'],
  TRUE,
  1.0, 10.0
),
(
  'Evening Primrose Oil', 'evening-primrose-oil', 'Oenothera Biennis (Evening Primrose) Oil', 'emollient',
  'Contains gamma-linolenic acid (GLA), an omega-6 that supports skin barrier ceramide synthesis.',
  'moderate',
  ARRAY['eczema', 'dryness', 'atopic_dermatitis'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY['blood thinners'],
  TRUE,
  0.5, 2.0
),
(
  'DIM', 'dim', 'Diindolylmethane', 'other',
  'Derived from cruciferous vegetables. Modulates estrogen metabolism, reducing estrogen dominance that drives hormonal acne.',
  'limited',
  ARRAY['hormonal_acne', 'PCOS'],
  ARRAY['oily', 'combination'],
  ARRAY['hormone-modulating medications', 'birth control'],
  FALSE,
  0.1, 0.2
),
(
  'Biotin', 'biotin', 'Biotin (Vitamin B7)', 'vitamin',
  'Involved in keratin production. Only helps if genuinely deficient (rare). Excess biotin can cause acne in some people. Overhyped for skin.',
  'limited',
  ARRAY['hair_loss', 'brittle_nails'],
  ARRAY['normal', 'dry', 'combination', 'oily', 'sensitive'],
  ARRAY[],
  TRUE,
  0.0025, 0.005
);

-- =========================================================
-- BATCH 4A: Additional research ingredients (5 ingredients)
-- =========================================================

INSERT INTO public.ingredients (
  name, slug, inci_name, category, description, evidence_level,
  concerns, skin_types, interactions, pregnancy_safe,
  min_concentration, max_concentration
) VALUES
(
  'Resveratrol', 'resveratrol', 'Resveratrol (Polygonum Cuspidatum Root Extract)', 'antioxidant',
  'Polyphenol with potent antioxidant and anti-inflammatory properties. Activates sirtuins (longevity genes). Inhibits NF-kB and COX-2 pathways. Protects against UV-induced damage.',
  'moderate',
  ARRAY['aging', 'sun_damage', 'inflammation', 'redness'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY[],
  FALSE,
  0.5, 1.0
),
(
  'Peptides (Copper)', 'copper-peptides', 'Copper Tripeptide-1 (GHK-Cu)', 'peptide',
  'Copper tripeptide promotes collagen and elastin production. Anti-inflammatory. Supports wound healing and tissue repair. May help with skin firmness and elasticity.',
  'moderate',
  ARRAY['aging', 'wound_healing', 'elasticity'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['vitamin C'],
  FALSE,
  0.01, 0.05
),
(
  'Tranexamic Acid', 'tranexamic-acid', 'Tranexamic Acid', 'other',
  'Anti-fibrinolytic agent. Reduces plasmin activity, decreasing melanin production triggered by UV and inflammation. Effective for melasma and stubborn hyperpigmentation.',
  'strong',
  ARRAY['melasma', 'hyperpigmentation'],
  ARRAY['normal', 'combination', 'dry'],
  ARRAY['hormonal contraceptives', 'blood clotting disorders'],
  FALSE,
  2.0, 5.0
),
(
  'Alpha Arbutin', 'alpha-arbutin', 'Alpha-Arbutin', 'other',
  'Inhibits tyrosinase activity without cytotoxicity. More stable and effective than beta-arbutin. Gradual skin brightening with low irritation potential.',
  'strong',
  ARRAY['hyperpigmentation', 'melasma', 'brightness'],
  ARRAY['normal', 'oily', 'combination', 'dry', 'sensitive'],
  ARRAY['vitamin C', 'niacinamide'],
  TRUE,
  1.0, 2.0
),
(
  'Centella Asiatica', 'centella-asiatica', 'Centella Asiatica Extract', 'botanical',
  'Same active compound as Gotu Kola. Stimulates collagen synthesis, improves microcirculation, reduces inflammation. Popular in K-beauty as "Cica".',
  'strong',
  ARRAY['wound_healing', 'scar_reduction', 'aging', 'inflammation', 'redness'],
  ARRAY['normal', 'dry', 'combination', 'sensitive'],
  ARRAY[],
  FALSE,
  1.0, 5.0
);

-- =========================================================
-- Total: 50 ingredients seeded
-- =========================================================

-- =========================================================
-- Verification: Confirm seed counts
-- =========================================================
SELECT 'Ingredients seeded' AS check_name, COUNT(*) AS row_count FROM public.ingredients;
