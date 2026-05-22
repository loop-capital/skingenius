/**
 * Ingredient Normalizer & Safety Database
 * Maps marketing names → INCI standards + safety data
 */

const INGREDIENT_DATABASE = {
  // Core actives (already researched)
  'Hyaluronic Acid': { inci: 'Sodium Hyaluronate', category: 'humectant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Niacinamide': { inci: 'Niacinamide', category: 'vitamin', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Vitamin C (L-Ascorbic Acid)': { inci: 'Ascorbic Acid', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Benzoyl Peroxide'], allergies: [] },
  'Retinol': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [], notes: 'Contraindicated in pregnancy. Stop 1 month before trying to conceive.' },
  'Ceramides': { inci: 'Ceramide NP/Ceramide AP/Ceramide EOP', category: 'lipid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Peptides': { inci: 'Palmitoyl Pentapeptide-4', category: 'peptide', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Salicylic Acid (BHA)': { inci: 'Salicylic Acid', category: 'acid', safe_pregnancy: false, safe_breastfeeding: true, interactions: ['Warfarin', 'Methotrexate'], allergies: ['Salicylate allergy'], notes: 'Avoid >2% in pregnancy. OK topical in breastfeeding (minimal systemic absorption).' },
  'Glycolic Acid (AHA)': { inci: 'Glycolic Acid', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: [], notes: 'Safe in pregnancy at low concentrations (≤10%).' },
  'Vitamin E (Tocopherol)': { inci: 'Tocopherol/Tocopheryl Acetate', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Soy allergy (if derived from soy)'] },
  'Green Tea Extract': { inci: 'Camellia Sinensis Leaf Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Warfarin (high doses)'], allergies: [] },
  'Azelaic Acid': { inci: 'Azelaic Acid', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Ferulic Acid': { inci: 'Ferulic Acid', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Resveratrol': { inci: 'Resveratrol', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners'], allergies: [] },
  'Allantoin': { inci: 'Allantoin', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Aloe Vera': { inci: 'Aloe Barbadensis Leaf Juice', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Latex allergy (cross-reactivity)'] },
  'Jojoba Oil': { inci: 'Simmondsia Chinensis (Jojoba) Seed Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Kojic Acid': { inci: 'Kojic Acid', category: 'brightening', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Can cause contact dermatitis in sensitive individuals.' },
  'Shea Butter': { inci: 'Butyrospermum Parkii (Shea) Butter', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Nut allergy (rare cross-reactivity)'] },
  'Squalane': { inci: 'Squalane', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Titanium Dioxide': { inci: 'Titanium Dioxide', category: 'sunscreen', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Zinc Oxide': { inci: 'Zinc Oxide', category: 'sunscreen', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  
  // Aesop-specific ingredients to research
  'Parsley Seed Extract': { inci: 'Carum Petroselinum (Parsley) Seed Oil', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Rich in apigenin, luteolin. Limited clinical data.' },
  'Grape Seed Extract': { inci: 'Vitis Vinifera (Grape) Seed Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners'], allergies: [] },
  'Mandarin Rind': { inci: 'Citrus Nobilis (Mandarin Orange) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing'], allergies: ['Citrus allergy'], notes: 'Phototoxic potential. Use sunscreen.' },
  'Evening Primrose Oil': { inci: 'Oenothera Biennis (Evening Primrose) Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners', 'Seizure medications'], allergies: [] },
  'Rosehip Seed Oil': { inci: 'Rosa Canina Seed Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Camellia Nut Oil': { inci: 'Camellia Japonica Seed Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Macadamia Nut Oil': { inci: 'Macadamia Ternifolia Seed Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Nut allergy (rare)'] },
  'Sandalwood': { inci: 'Santalum Album (Sandalwood) Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Endangered species concern. Use sustainably sourced.' },
  'Sodium Ascorbyl Phosphate': { inci: 'Sodium Ascorbyl Phosphate', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Vitamin B3': { inci: 'Niacinamide', category: 'vitamin', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Green Tea': { inci: 'Camellia Sinensis Leaf Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Aloe': { inci: 'Aloe Barbadensis Leaf Juice', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Bergamot': { inci: 'Citrus Aurantium Bergamia (Bergamot) Fruit Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing'], allergies: ['Citrus allergy'], notes: 'HIGHLY phototoxic. Use bergaptene-free version.' },
  'Geranium Leaf': { inci: 'Pelargonium Graveolens (Geranium) Flower Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Cedarwood': { inci: 'Cedrus Atlantica (Cedarwood) Bark Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Bitter Orange': { inci: 'Citrus Aurantium Amara (Bitter Orange) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing'], allergies: ['Citrus allergy'] },
  'Sage Leaf': { inci: 'Salvia Officinalis (Sage) Leaf Extract', category: 'antioxidant', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Seizure medications', 'Hormone therapy'], allergies: [], notes: 'Avoid in pregnancy/breastfeeding due to thujone content. May reduce milk supply.' },
  'Zinc': { inci: 'Zinc Oxide/Zinc PCA', category: 'mineral', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Beeswax': { inci: 'Cera Alba (Beeswax)', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Bee product allergy'] },
  'Castor Oil': { inci: 'Ricinus Communis (Castor) Seed Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Tea Tree Leaf': { inci: 'Melaleuca Alternifolia (Tea Tree) Leaf Oil', category: 'antimicrobial', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Endocrine disruptor concern at high concentrations. Use <5%.' },
  'Lavender': { inci: 'Lavandula Angustifolia (Lavender) Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Endocrine disruptor concern. Use with caution in children.' },
  'Vetiver Root': { inci: 'Vetiveria Zizanoides (Vetiver) Root Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Petitgrain': { inci: 'Citrus Aurantium Amara (Bitter Orange) Leaf/Twig Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Citrus allergy'] },
  'White Tea': { inci: 'Camellia Sinensis (White Tea) Leaf Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Vitamin C': { inci: 'Ascorbic Acid', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Benzoyl Peroxide'], allergies: [] },
  'Vitamin E': { inci: 'Tocopherol', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Vitamin A': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [], notes: 'Contraindicated in pregnancy' },
  'Vitamin B5': { inci: 'Panthenol', category: 'vitamin', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'panthenol': { inci: 'Panthenol', category: 'vitamin', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Glycerin': { inci: 'Glycerin', category: 'humectant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Caffeine': { inci: 'Caffeine', category: 'vasoconstrictor', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Safe topically. Systemic absorption minimal.' },
  'Chamomile': { inci: 'Chamomilla Recutita (Matricaria) Flower Extract', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners (high oral doses)'], allergies: ['Ragweed allergy (cross-reactivity)', 'Asteraceae allergy'] },
  'Licorice Root': { inci: 'Glycyrrhiza Glabra (Licorice) Root Extract', category: 'brightening', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Diuretics', 'Corticosteroids', 'Blood pressure medications'], allergies: [], notes: 'Avoid in hypertension, kidney disease. OK topically at low concentrations.' },
  'Matrixyl': { inci: 'Palmitoyl Pentapeptide-4', category: 'peptide', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Bisabolol': { inci: 'Bisabolol', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Ferulic Acid 0.5%': { inci: 'Ferulic Acid', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Phloretin': { inci: 'Phloretin', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Growth Factors': { inci: 'Sh-Oligopeptide-1 (EGF)', category: 'growth factor', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Limited long-term safety data. Some concern about cancer promotion. Use with caution.' },
  'Tranexamic Acid': { inci: 'Tranexamic Acid', category: 'brightening', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners', 'Hormonal contraceptives'], allergies: [] },
  'Lactic Acid': { inci: 'Lactic Acid', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: [], notes: 'Safe in pregnancy at low concentrations (≤10%).' },
  'Mandelic Acid': { inci: 'Mandelic Acid', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: ['Nut allergy (derived from almonds)'] },
  'Salicylic Acid': { inci: 'Salicylic Acid', category: 'acid', safe_pregnancy: false, safe_breastfeeding: true, interactions: ['Warfarin', 'Methotrexate'], allergies: ['Salicylate allergy'] },
  'Salicylic Acid 2%': { inci: 'Salicylic Acid', category: 'acid', safe_pregnancy: false, safe_breastfeeding: true, interactions: ['Warfarin', 'Methotrexate'], allergies: ['Salicylate allergy'] },
  'Retinol 0.25%': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Retinol 0.3%': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Retinol 0.5%': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Retinol 1%': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Retinol 1.0%': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'L-Ascorbic Acid': { inci: 'Ascorbic Acid', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Benzoyl Peroxide'], allergies: [] },
  'L-Ascorbic Acid 15%': { inci: 'Ascorbic Acid', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Benzoyl Peroxide'], allergies: [] },
  'Beta-Glucan': { inci: 'Beta-Glucan', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Cholesterol': { inci: 'Cholesterol', category: 'lipid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Citric Acid': { inci: 'Citric Acid', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Collagen': { inci: 'Hydrolyzed Collagen', category: 'protein', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Cucumber': { inci: 'Cucumis Sativus (Cucumber) Fruit Extract', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Gluconolactone': { inci: 'Gluconolactone', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'PHA - gentler than AHA/BHA. Safe in pregnancy.' },
  'Honey': { inci: 'Honey', category: 'humectant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Bee product allergy'] },
  'Hydroquinone 4%': { inci: 'Hydroquinone', category: 'brightening', safe_pregnancy: false, safe_breastfeeding: false, interactions: [], allergies: [], notes: 'Prescription required in many countries. Avoid in pregnancy/breastfeeding due to ochronosis risk and potential toxicity.' },
  'Kaolin': { inci: 'Kaolin', category: 'clay', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Papain': { inci: 'Papain', category: 'enzyme', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners'], allergies: ['Latex allergy (cross-reactivity)'] },
  'Probiotics': { inci: 'Lactobacillus Ferment', category: 'microbiome', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Sulfur': { inci: 'Sulfur', category: 'antimicrobial', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Can be drying. Strong odor.' },
  'Urea': { inci: 'Urea', category: 'humectant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Witch Hazel': { inci: 'Hamamelis Virginiana (Witch Hazel) Water', category: 'astringent', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Alcohol-free preferred. Can be drying with alcohol.' },
  'Zinc': { inci: 'Zinc Oxide/Zinc PCA', category: 'mineral', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Silymarin': { inci: 'Silybum Marianum (Milk Thistle) Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners'], allergies: ['Asteraceae allergy'] },
  'Snap-8': { inci: 'Acetyl Octapeptide-3', category: 'peptide', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Snow Algae': { inci: 'Coenochloris Signiensis Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Soy Isoflavones': { inci: 'Soy Isoflavones', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Tamoxifen', 'Hormone therapy'], allergies: ['Soy allergy'] },
  'Stem Cells': { inci: 'Malus Domestica Fruit Cell Culture Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Marketing term. Plant stem cells cannot become human skin cells. Antioxidant benefit only.' },
  'Yeast Extracts': { inci: 'Saccharomyces Ferment', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Ylang Ylang': { inci: 'Cananga Odorata (Ylang Ylang) Flower Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Bamboo Stem': { inci: 'Bambusa Arundinacea (Bamboo) Stem Extract', category: 'exfoliant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Bentonite': { inci: 'Bentonite', category: 'clay', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Charcoal': { inci: 'Charcoal Powder', category: 'absorbent', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Jojoba Beads': { inci: 'Hydrogenated Jojoba Oil', category: 'exfoliant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Magnesium Crystals': { inci: 'Magnesium Oxide', category: 'exfoliant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Pumice': { inci: 'Pumice', category: 'exfoliant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Quartz': { inci: 'Silica', category: 'exfoliant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Iron Oxides': { inci: 'Iron Oxides', category: 'pigment', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Colloidal Oatmeal': { inci: 'Avena Sativa (Oat) Kernel Flour', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Celiac disease (rare topical reaction)'] },
  'Lemon Rind': { inci: 'Citrus Limon (Lemon) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing'], allergies: ['Citrus allergy'] },
  'Tangerine Rind': { inci: 'Citrus Reticulata (Tangerine) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing'], allergies: ['Citrus allergy'] },
  'Grapefruit': { inci: 'Citrus Paradisi (Grapefruit) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing', 'Medications metabolized by CYP3A4'], allergies: ['Citrus allergy'] },
  'Grapefruit Rind': { inci: 'Citrus Paradisi (Grapefruit) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing', 'Medications metabolized by CYP3A4'], allergies: ['Citrus allergy'] },
  'Orange Rind': { inci: 'Citrus Aurantium Dulcis (Orange) Peel Oil', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing'], allergies: ['Citrus allergy'] },
  'Rosemary Leaf': { inci: 'Rosmarinus Officinalis (Rosemary) Leaf Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners', 'Blood pressure medications'], allergies: [] },
  'Thyme': { inci: 'Thymus Vulgaris (Thyme) Extract', category: 'antimicrobial', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'White Willow Bark': { inci: 'Salix Alba (Willow) Bark Extract', category: 'acid', safe_pregnancy: false, safe_breastfeeding: true, interactions: ['Warfarin', 'Methotrexate'], allergies: ['Salicylate allergy'], notes: 'Natural source of salicylates. Avoid in pregnancy.' },
  'Willow Bark Extract': { inci: 'Salix Alba (Willow) Bark Extract', category: 'acid', safe_pregnancy: false, safe_breastfeeding: true, interactions: ['Warfarin', 'Methotrexate'], allergies: ['Salicylate allergy'] },
  'Zanthoxylum Bungeanum': { inci: 'Zanthoxylum Bungeanum Fruit Extract', category: 'soothing', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'HEPES': { inci: 'Hydroxyethylpiperazine Ethane Sulfonic Acid', category: 'buffer', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Proxylane': { inci: 'Hydroxypropyl Tetrahydropyrantriol', category: 'anti-aging', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Dioic Acid': { inci: 'Dioic Acid', category: 'sebum regulator', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Phytic Acid': { inci: 'Phytic Acid', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Benzoyl Peroxide 10%': { inci: 'Benzoyl Peroxide', category: 'antimicrobial', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: [], notes: 'Safe in pregnancy. Can bleach fabrics. Start with lower concentration.' },
  'Benzoyl Peroxide 5%': { inci: 'Benzoyl Peroxide', category: 'antimicrobial', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: [] },
  'Alpha Hydroxy Acids': { inci: 'Alpha Hydroxy Acids', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: [] },
  'Hydroxy Acids': { inci: 'Hydroxy Acids', category: 'acid', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Retinoids'], allergies: [] },
  'Retinaldehyde': { inci: 'Retinaldehyde', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Retinyl Acetate': { inci: 'Retinyl Acetate', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Retinyl Palmitate': { inci: 'Retinyl Palmitate', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Concentrated Retinol': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'High Vitamin A': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Higher Retinol': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Higher Vitamin A': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Maximum Retinol': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Maximum Vitamin A': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Vitamins A': { inci: 'Retinol', category: 'retinoid', safe_pregnancy: false, safe_breastfeeding: false, interactions: ['Benzoyl Peroxide', 'AHA', 'BHA'], allergies: [] },
  'Vitamin E 1%': { inci: 'Tocopherol', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Vitamins': { inci: 'Mixed Vitamins', category: 'vitamin', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Amino Acids': { inci: 'Amino Acids', category: 'building block', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Antioxidants': { inci: 'Mixed Antioxidants', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Botanical Extracts': { inci: 'Mixed Botanical Extracts', category: 'mixed', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Plant allergies possible'] },
  'Botanical Oils': { inci: 'Mixed Botanical Oils', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Plant allergies possible'] },
  'Brightening Agents': { inci: 'Mixed Brightening Agents', category: 'brightening', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Detoxifying Herbs': { inci: 'Mixed Herbal Extracts', category: 'mixed', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Plant allergies possible'] },
  'Digestive Enzymes': { inci: 'Mixed Digestive Enzymes', category: 'enzyme', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Emollients': { inci: 'Mixed Emollients', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Enzymes': { inci: 'Mixed Enzymes', category: 'enzyme', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Essential Oils': { inci: 'Mixed Essential Oils', category: 'essential oil', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Photosensitizing possible'], allergies: ['Fragrance allergy'] },
  'Fatty Acids': { inci: 'Fatty Acids', category: 'lipid', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Gentle Formula': { inci: 'Mixed Ingredients', category: 'mixed', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Marine Extracts': { inci: 'Mixed Marine Extracts', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Shellfish allergy possible'] },
  'Moisturizing Agents': { inci: 'Mixed Moisturizers', category: 'humectant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Mushroom Extract': { inci: 'Mixed Mushroom Extracts', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Oxygenating Agents': { inci: 'Mixed Oxygenating Agents', category: 'mixed', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Plant Extracts': { inci: 'Mixed Plant Extracts', category: 'mixed', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: ['Plant allergies possible'] },
  'Pore-Refining Agents': { inci: 'Mixed Pore Refiners', category: 'mixed', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Astringents': { inci: 'Mixed Astringents', category: 'astringent', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Artemia Extract': { inci: 'Artemia Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Boswellia Serrata': { inci: 'Boswellia Serrata (Frankincense) Extract', category: 'anti-inflammatory', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners'], allergies: [] },
  'Blueberry Extract': { inci: 'Vaccinium Angustifolium (Blueberry) Fruit Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Olive Leaf': { inci: 'Olea Europaea (Olive) Leaf Extract', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: ['Blood thinners'], allergies: [] },
  'Sunflower Seed Oil': { inci: 'Helianthus Annuus (Sunflower) Seed Oil', category: 'emollient', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Aluminum Silicate': { inci: 'Aluminum Silicate', category: 'absorbent', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Sodium Bicarbonate': { inci: 'Sodium Bicarbonate', category: 'buffer', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Silica': { inci: 'Silica', category: 'absorbent', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [] },
  'Sodium DNA': { inci: 'Sodium DNA', category: 'repair', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Marketing term. Limited evidence.' },
  'Extremozymes': { inci: 'Mixed Extremophile Extracts', category: 'antioxidant', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Marketing term for enzymes from extremophiles.' },
  'Amniotic Fluid': { inci: 'Amniotic Fluid Extract', category: 'growth factor', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Derived from human placental tissue. Ethical concerns. Regulatory restrictions.' },
  'Microneedles': { inci: 'Microneedles', category: 'delivery system', safe_pregnancy: true, safe_breastfeeding: true, interactions: [], allergies: [], notes: 'Physical device, not ingredient. Professional use only.' },
};

/**
 * Normalize ingredient name to INCI standard
 */
function normalizeIngredient(name) {
  const clean = name.trim();
  const entry = INGREDIENT_DATABASE[clean];
  if (entry) {
    return {
      marketing_name: clean,
      inci_name: entry.inci,
      category: entry.category,
      safe_pregnancy: entry.safe_pregnancy,
      safe_breastfeeding: entry.safe_breastfeeding,
      interactions: entry.interactions,
      allergies: entry.allergies,
      notes: entry.notes || null
    };
  }
  // Try fuzzy match
  const lower = clean.toLowerCase();
  for (const [key, value] of Object.entries(INGREDIENT_DATABASE)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return {
        marketing_name: clean,
        inci_name: value.inci,
        category: value.category,
        safe_pregnancy: value.safe_pregnancy,
        safe_breastfeeding: value.safe_breastfeeding,
        interactions: value.interactions,
        allergies: value.allergies,
        notes: value.notes || null,
        matched_to: key
      };
    }
  }
  // Unknown ingredient
  return {
    marketing_name: clean,
    inci_name: null,
    category: 'unknown',
    safe_pregnancy: null,
    safe_breastfeeding: null,
    interactions: [],
    allergies: [],
    notes: 'REQUIRES RESEARCH'
  };
}

/**
 * Process product and normalize all ingredients
 */
function processProduct(product) {
  const rawIngredients = product.key_ingredients || product.ingredients || [];
  const normalized = rawIngredients.map(normalizeIngredient);
  
  // Safety summary
  const contraindications = [];
  if (normalized.some(i => i.safe_pregnancy === false)) {
    contraindications.push('Not safe during pregnancy');
  }
  if (normalized.some(i => i.safe_breastfeeding === false)) {
    contraindications.push('Not safe while breastfeeding');
  }
  
  const allInteractions = [...new Set(normalized.flatMap(i => i.interactions))];
  const allAllergies = [...new Set(normalized.flatMap(i => i.allergies))];
  const unknownIngredients = normalized.filter(i => i.inci_name === null);
  
  return {
    ...product,
    ingredients_normalized: normalized,
    safety_summary: {
      safe_pregnancy: !normalized.some(i => i.safe_pregnancy === false),
      safe_breastfeeding: !normalized.some(i => i.safe_breastfeeding === false),
      contraindications,
      medication_interactions: allInteractions,
      allergy_warnings: allAllergies,
      unknown_ingredients: unknownIngredients.map(i => i.marketing_name)
    }
  };
}

module.exports = { INGREDIENT_DATABASE, normalizeIngredient, processProduct };
