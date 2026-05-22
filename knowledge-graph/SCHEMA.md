# SKINgenius Knowledge Graph Schema

> **Version:** 1.0
> **Last updated:** 2026-05-14
> **Purpose:** Define the entity types, relationships, and data model for the SKINgenius knowledge graph

---

## Entity Types

### 1. Condition
A dermatological condition (e.g., acne, eczema, melasma)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `acne-vulgaris` |
| name | string | Display name |
| icd10 | string | ICD-10-CM code |
| category | string | `inflammatory`, `pigmentation`, `infection`, `autoimmune`, `neoplastic`, `structural` |
| severity | string[] | `mild`, `moderate`, `severe` |
| description | string | Clinical description |
| symptoms | string[] | Key symptoms |
| triggers | string[] | Known triggers |
| related_conditions | string[] | IDs of related conditions |
| red_flags | string[] | When to refer to dermatologist |
| fitzpatrick_considerations | object | Special notes for skin of color |
| pregnancy_considerations | object | Safety during pregnancy/breastfeeding |

### 2. Ingredient
A single cosmetic/dermatological ingredient

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `niacinamide` |
| name | string | INCI name |
| common_names | string[] | Consumer-friendly names |
| category | string | `active`, `emollient`, `humectant`, `surfactant`, `preservative`, `fragrance`, `carrier`, `antioxidant`, `uv-filter`, `exfoliant` |
| sub_category | string | More specific: `aha`, `bha`, `retinoid`, `vitamin-c-derivative`, `peptide`, etc. |
| concentration_range | object | `{ typical: "2-5%", effective: "5%", max: "10%" }` |
| ph_range | string | Optimal pH for efficacy |
| evidence_level | string | `A` (strong), `B` (moderate), `C` (emerging), `D` (anecdotal) |
| mechanism | string | How it works |
| benefits | string[] | What it does |
| concerns_treated | string[] | Condition IDs it helps |
| concerns_exacerbated | string[] | Condition IDs it may worsen |
| skin_types | string[] | Suitable skin types |
| pregnancy_safe | boolean | Safe during pregnancy |
| interactions | object[] | `{ ingredient_id: string, type: "synergistic"|"antagonistic"|"caution", note: string }` |
| contraindications | string[] | Who should avoid |
| regulatory_notes | string[] | FDA/EU restrictions |

### 3. Product
A commercial skincare product

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `cerave-moisturizing-cream` |
| name | string | Product name |
| brand | string | Brand name |
| brand_id | string | Brand slug |
| category | string | `cleanser`, `serum`, `moisturizer`, `sunscreen`, `exfoliant`, `toner`, `mask`, `oil`, `treatment`, `eye-care`, `lip-care`, `body`, `supplement` |
| price | string | Price range |
| size | string | Product size |
| inci_ingredients | string[] | Full INCI list (ordered) |
| key_actives | object[] | `{ name, concentration, purpose }` |
| conditions_addressed | string[] | Condition IDs |
| skin_types | string[] | Suitable skin types |
| contraindications | string[] | Warnings |
| ph_range | string | Formulation pH |
| fitzpatrick_safe | string[] | Which Fitzpatrick types it's safe for |
| pregnancy_safe | boolean | Safe during pregnancy |
| price_tier | string | `$`, `$$`, `$$$`, `$$$$`, `$$$$$` |

### 4. Brand
A skincare brand

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `cerave` |
| name | string | Brand name |
| positioning | string | `clinical`, `luxury-botanical`, `clean-clinical`, `k-beauty`, `budget`, `professional`, `medical-grade`, `holistic` |
| price_tier | string | `$` to `$$$$$` |
| philosophy | string | Brand philosophy |
| product_count | number | Number of products in database |
| dermatologist_recommended | boolean | |
| cruelty_free | boolean | |
| pregnancy_line | boolean | Has pregnancy-safe products |

### 5. TreatmentLadder
Step-by-step treatment approach for a condition

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `acne-vulgaris-ladder` |
| condition_id | string | Condition ID |
| severity | string | `mild`, `moderate`, `severe` |
| steps | object[] | `{ order, type: "otc"|"prescription"|"procedure", description, products: [product_ids], duration, next_step_if_no_improvement }` |
| evidence_level | string | |
| special_populations | object | `{ pregnancy, pediatric, skin_of_color, sensitive }` |

### 6. Procedure
A cosmetic or dermatological procedure

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `microblading` |
| name | string | |
| category | string | `laser`, `injectable`, `chemical`, `mechanical`, `spmu`, `light-therapy` |
| description | string | |
| downtime | string | |
| fitzpatrick_considerations | object | |
| pregnancy_safe | boolean | |
| pre_care | string[] | |
| post_care | string[] | |
| contraindications | string[] | |
| related_products | string[] | Product IDs for aftercare |

### 7. Supplement
A nutritional supplement relevant to skin health

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `zinc-picolinate` |
| name | string | |
| dosage | string | Recommended dosage |
| evidence_level | string | |
| benefits | string[] | |
| concerns_treated | string[] | Condition IDs |
| interactions | string[] | Drug/supplement interactions |
| pregnancy_safe | boolean | |

### 8. Hormone
A hormone relevant to skin health

| Field | Type | Description |
|-------|------|-------------|
| id | string | Slug: `estrogen` |
| name | string | |
| effects_on_skin | string[] | |
| conditions_linked | string[] | Condition IDs |
| testing | string | DUTCH, blood, etc. |
| imbalances | object | `{ high: { causes, skin_effects }, low: { causes, skin_effects } }` |

---

## Relationship Types

| From | To | Relationship | Example |
|------|----|-------------|---------|
| Ingredient | Condition | `treats` | Niacinamide → treats → Acne |
| Ingredient | Condition | `exacerbates` | Coconut Oil → exacerbates → Acne |
| Ingredient | Ingredient | `synergistic_with` | Vitamin C + Ferulic Acid |
| Ingredient | Ingredient | `antagonistic_with` | Retinol + Benzoyl Peroxide |
| Product | Ingredient | `contains` | CeraVe Cream → contains → Ceramides |
| Product | Condition | `addresses` | Differin Gel → addresses → Acne |
| Product | Brand | `manufactured_by` | CeraVe Cream → manufactured_by → CeraVe |
| TreatmentLadder | Condition | `treats` | Acne Ladder → treats → Acne |
| TreatmentLadder | Product | `recommends` | Acne Step 1 → recommends → CeraVe SA Cleanser |
| Procedure | Condition | `treats` | Laser → treats → Acne Scars |
| Procedure | Product | `aftercare_with` | Microneedling → aftercare_with → Alastin Regenerating Skin Nudge |
| Supplement | Condition | `supports` | Zinc → supports → Acne |
| Hormone | Condition | `influences` | Estrogen → influences → Melasma |

---

## Knowledge Graph Output Files

The knowledge graph will be built as structured JSON files:

```
knowledge-graph/
├── SCHEMA.md              (this file)
├── entities/
│   ├── conditions.json    (24 conditions from research)
│   ├── ingredients.json   (extracted from all products + research)
│   ├── products.json      (merged from all brand files)
│   ├── brands.json        (24 brands)
│   ├── treatment-ladders.json
│   ├── procedures.json   (from cosmetic-procedures research)
│   ├── supplements.json   (from supplement-protocols research)
│   └── hormones.json     (from hormone-skin research)
├── relationships/
│   ├── ingredient-conditions.json
│   ├── ingredient-interactions.json
│   ├── product-conditions.json
│   ├── procedure-products.json
│   └── treatment-ladders.json
└── indexes/
    ├── condition-to-products.json
    ├── condition-to-treatments.json
    ├── ingredient-to-products.json
    ├── skin-type-recommendations.json
    └── pregnancy-safe.json
```

---

## Design Principles

1. **Safety First**: Every entity has `pregnancy_safe`, `contraindications`, `fitzpatrick_considerations`
2. **Evidence-Based**: Every claim has an evidence level (A-D)
3. **No Diagnosing**: Conditions link to "consult dermatologist" red flags
4. **Inclusive**: Fitzpatrick considerations on every product, procedure, and treatment
5. **Interconnected**: Everything links — conditions → ingredients → products → brands → ladders
6. **Actionable**: Treatment ladders give step-by-step OTC → Rx → procedure paths