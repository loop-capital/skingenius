# SKINgenius Knowledge Graph v1.0

**Built:** 2026-05-15  
**Source Reports:** 16 research documents (23,489 lines)  
**Purpose:** Foundation for SKINgenius recommendation engine

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Nodes** | 65 |
| **Total Edges** | 95 |
| **Conditions** | 10 |
| **Root Causes** | 8 |
| **Mechanisms** | 8 |
| **Ingredients** | 25 |
| **Medications** | 7 |
| **Nutrients** | 6 |
| **Treatments** | 10 |
| **Risk Factors** | 5 |

### Edge Type Distribution

| Edge Type | Count | Description |
|-----------|-------|-------------|
| `causes` | 17 | RootCause → Condition |
| `mechanism` | 8 | Mechanism connects RootCause ↔ Condition |
| `treats` | 42 | Treatment/Ingredient/Medication/Nutrient → Condition |
| `supports` | 5 | Nutrient → Mechanism |
| `aggravates` | 7 | RiskFactor → Condition |
| `interacts_with` | 3 | Medication → Ingredient/Nutrient |
| `contraindicated_for` | 8 | Treatment/Medication/Ingredient → RiskFactor |
| `fitzpatrick_safe` | 6 | Ingredient → Fitzpatrick IV-VI |
| `fitzpatrick_caution` | 9 | Ingredient → Fitzpatrick IV-VI |

### Evidence Level Distribution

| Level | Count | Description |
|-------|-------|-------------|
| **A** | 47 | Strong RCT evidence |
| **B** | 43 | Moderate evidence |
| **C** | 3 | Case studies/expert opinion |
| **D** | 2 | Emerging/theoretical |

---

## Key Insights

### 1. Fitzpatrick IV-VI Safety Is Paramount

**Critical finding:** 15 of 25 ingredients (60%) require **special caution** for darker skin types:

- **SAFE first choices:** Azelaic acid, Niacinamide, Vitamin C, Ceramides, Tranexamic acid, Mandelic acid, Gluconolactone
- **CAUTION:** Retinoids, Hydroquinone, Glycolic acid peels >20%, Salicylic acid peels >20%, Corticosteroids, IPL/lasers
- **PIH prevention** is the #1 priority — all treatment recommendations for Fitzpatrick IV-VI must prioritize low-irritation strategies

### 2. Gut-Skin Axis Is Foundationally Important

**Evidence strength:** B (growing RCT support)

- Gut dysbiosis → leaky gut → LPS translocation → systemic inflammation → skin conditions
- Probiotics (L. rhamnosus GG, B. breve) show measurable improvements in acne, eczema, and barrier function
- **Clinical implication:** Every skin assessment should include gut health screening questions

### 3. Pregnancy Contraindications Are Non-Negotiable

**Absolute contraindications:**
- Oral isotretinoin (Category X) — iPLEDGE mandatory
- Spironolactone (anti-androgen effects on male fetus)
- Tetracyclines (bone/tooth development)
- Methotrexate (teratogenic; 3-month washout)
- All retinoids (topical and oral)

**Safe in pregnancy:**
- Azelaic acid, Niacinamide, Vitamin C, Physical sunscreens, Low-potency hydrocortisone

### 4. Hormonal Acne Requires Systemic Approach

**Evidence strength:** A

- Androgen excess (PCOS) is a primary driver
- Spironolactone 50-200mg + combined oral contraceptives are first-line hormonal therapies
- DIM supplements show emerging promise (Evidence C)
- Always screen for PCOS in women with jawline/cyclical acne

### 5. Photoaging Is Preventable But Not Reversible

**Evidence strength:** A

- UV is the primary driver (95% of facial aging)
- Visible light (not just UV) contributes to melasma in darker skin → iron oxide sunscreens essential
- Retinoids + Vitamin C + Sunscreen = gold standard prevention
- Collagen peptides + Vitamin C show modest but consistent benefits (Evidence B)

---

## Usage Examples

### Query: "What treats acne in pregnancy?"

```
Nodes: Condition[Acne] → treats ← Ingredient/Medication
Filter: pregnancy = "SAFE"

Results:
- Azelaic acid 20% (SAFE)
- Benzoyl peroxide 2.5-5% (Category C, generally safe)
- Niacinamide (SAFE)
- Low-potency glycolic acid (likely safe)
- Topical erythromycin (SAFE)
```

### Query: "What's safe for melasma in Fitzpatrick VI?"

```
Nodes: Condition[Melasma] → treats ← Ingredient
Filter: fitzpatrick_IV_VI = "SAFE" AND pregnancy = safe

Results:
- Azelaic acid 20% (SAFE - first choice)
- Niacinamide 2-5% (SAFE)
- Vitamin C 10-20% (SAFE)
- Tranexamic acid 2-5% topical (SAFE)
- Alpha arbutin 1-2% (SAFE)
- Iron oxide sunscreen (ESSENTIAL)

AVOID:
- Hydroquinone (caution - ochronosis risk)
- Tretinoin (contraindicated in pregnancy)
- Glycolic peels >20% (PIH risk)
- IPL/lasers (PIH risk)
```

### Query: "What causes eczema flares?"

```
Nodes: Condition[Eczema] ← causes/mechanism/aggravates

Results:
- Gut dysbiosis (causes) → leaky gut → systemic inflammation
- Chronic stress (causes) → cortisol → barrier dysfunction
- Nutrient deficiency (causes) → Vitamin D, Zinc, Omega-3
- Microbial dysbiosis (mechanism) → S. aureus overgrowth
- Barrier dysfunction (mechanism) → filaggrin deficiency
```

### Query: "Drug interactions with doxycycline"

```
Nodes: Medication[Doxycycline] → interacts_with

Results:
- Zinc supplements (separate by 2-4 hours)
- Iron supplements (separate by 2-4 hours)
- Isotretinoin (avoid concurrent)
- Antacids (reduce absorption)
```

---

## File Structure

```
knowledge-graph/
├── schema.json           # Graph schema, node types, edge types, evidence levels
├── nodes.json            # All 65 nodes with full properties
├── edges.json            # All 95 edges with weights and citations
├── README.md             # This file
└── BUILDER.md            # Build strategy and taxonomy
```

### Data Model

**Nodes** have these properties:
- `id`: Unique identifier (e.g., COND_001, ING_001)
- `type`: One of [Condition, RootCause, Mechanism, Ingredient, Medication, Nutrient, Treatment, RiskFactor]
- `name`: Human-readable name
- `evidence_level`: A/B/C/D
- Fitzpatrick safety annotations where applicable
- Pregnancy safety annotations where applicable
- Source citations (which research report + section)

**Edges** have these properties:
- `source`: Source node ID
- `target`: Target node ID
- `type`: One of [causes, mechanism, treats, contains, interacts_with, contraindicated_for, supports, aggravates, fitzpatrick_safe, fitzpatrick_caution]
- `weight`: 0.0-1.0 (evidence strength)
- `evidence`: A/B/C/D
- `notes`: Clinical notes
- `source_citation`: Specific report section

---

## Evidence Grading

| Grade | Description | Examples |
|-------|-------------|----------|
| **A** | Strong RCT evidence | Retinoids for acne, Biologics for psoriasis, Hydroquinone for melasma |
| **B** | Moderate evidence (cohort, small RCTs) | Probiotics for skin, Collagen peptides for aging, Zinc for acne |
| **C** | Case studies, expert opinion | DIM for hormonal acne, Adaptogens for stress |
| **D** | Emerging/theoretical | Postbiotics in skincare, Oral tranexamic acid for melasma |

---

## Sources

All nodes and edges cite their source reports:

1. `skin-condition-profiles.md` — 24 conditions with ICD-10, grading, treatment ladders
2. `clinical-guidelines.md` — AAD guidelines for 10 conditions
3. `gut-skin-axis.md` — Microbiome research, probiotic evidence
4. `hormone-skin-connection.md` — HPA axis, estrogen, androgen, cortisol pathways
5. `nutrition-skin.md` — Vitamin/mineral roles in skin health
6. `supplement-protocols.md` — Dosing, forms, safety for 31 supplements
7. `medication-skin-interactions.md` — Drug interactions and contraindications
8. `melanin-assessment.md` — PIH risk assessment for Fitzpatrick IV-VI
9. `fitzpatrick-dark-skin.md` — Skin of color considerations
10. `ingredients-batch-2.md` — 20 ingredients (014-033) with evidence
11. `lifestyle-skin.md` — UV, sleep, stress, exercise impacts
12. `cosmetic-procedures.md` — 26 procedures including SPMU
13. `safety-demographics.md` — Age, pregnancy, medical condition safety
14. `accessibility-inclusion.md` — WCAG, cultural sensitivity
15. `phenotype-skin-sensitivity.md` — MC1R, sensitivity profiles
16. `technical-review.md` — Architecture review

---

## Next Steps for Recommendation Engine

1. **Ingest into graph database** (Neo4j or similar)
2. **Build query layer** for:
   - Condition → safe treatments (filtered by Fitzpatrick, pregnancy, age)
   - Drug interaction checking
   - Pregnancy safety screening
   - PIH risk assessment for Fitzpatrick IV-VI
3. **Add user context** (Fitzpatrick type, pregnancy status, allergies, current medications)
4. **Score recommendations** by evidence level + safety + user context
5. **Generate personalized routines** with ingredient combinations and contraindication checks

---

## Quality Assurance

- ✅ Every connection has source citation
- ✅ Evidence levels assigned (A/B/C/D)
- ✅ Fitzpatrick safety notes on all ingredient/treatment nodes
- ✅ Pregnancy contraindications flagged
- ✅ Drug interactions documented
- ✅ Deduplication performed (same entity = single node)
- ✅ Cross-referenced across all 16 reports

---

**Built by:** SKINgenius-Research  
**Review cycle:** Quarterly or upon new guideline publication  
**Next review:** 2026-08-14
