# SKINgenius Condition-to-Ingredient Mapping

> **Source of truth:** `knowledge-graph/` — the v1.3 entity/relationship layer (`entities/`, `relationships/`, `indexes/`), the v1.0 core graph (`nodes.json`, `edges.json`), and the recommendation engine's `condition-ingredient-mappings.json`.
> **Generated:** 2026-09-14 · SKINgenius-Research (Sprint 12 deliverable: research-backed condition→ingredient table)
> **Scope:** The 14 skin conditions SKINgenius tracks — the union of the scan detector (`src/lib/scan/conditionDetector.ts`), the recommendation engine's condition keys (`src/lib/recommendations/queryEngine.ts`), and the knowledge graph's core Condition nodes / treatment index. Referral-only conditions (vitiligo, actinic keratosis, skin cancers) are excluded — see [Excluded conditions](#excluded-conditions-referral-only).

---

## Evidence grading

| Grade | Meaning | How it was derived |
|---|---|---|
| **A** | Strong RCT / clinical-guideline evidence | `A` in `relationships/ingredient-conditions.json` or core `edges.json`; `strong` in the engine mapping file |
| **B** | Moderate evidence (cohort studies, small RCTs) | `B` in relationship file; `moderate` in engine file |
| **C** | Case studies / expert opinion | `C` in relationship file; `emerging` in engine file |
| **D** | Emerging / theoretical | `D` in core edges (e.g., oral tranexamic acid for melasma) |

**Resolution rule:** where sources disagreed, the letter-graded relationship file won; engine-only pairs map strong→A, moderate→B, emerging→C. Evidence grades are per **ingredient-condition pair**, not per ingredient.

**Table columns:** Ingredient (Rx = prescription-only) · Evidence · Recommended concentration · **Do not combine with** (antagonistic/caution interactions from `entities/ingredients.json` + `relationships/ingredient-interactions.json`) · Contraindications.

---

## Master summary (one line per condition)

| # | Condition | Top evidence-backed actives | Pregnancy-safe pick | Fitzpatrick IV–VI first choice |
|---|---|---|---|---|
| 1 | Acne Vulgaris | Adapalene, BPO, salicylic acid, azelaic acid, tretinoin | Azelaic acid | Azelaic acid, mandelic acid |
| 2 | Hormonal Acne | Spironolactone (Rx), OCP (Rx), adapalene | Azelaic acid (topical) | Adapalene (titrated), azelaic acid |
| 3 | Fungal Acne | Ketoconazole, zinc pyrithione, ciclopirox | Zinc pyrithione wash | Ketoconazole 2%, zinc pyrithione |
| 4 | Rosacea | Azelaic acid 15%, metronidazole (Rx), ivermectin (Rx) | Azelaic acid | Azelaic acid, niacinamide |
| 5 | Melasma | Hydroquinone (Rx), tretinoin (Rx), azelaic acid, tranexamic acid | Azelaic acid + niacinamide | Azelaic acid, tranexamic acid; iron-oxide SPF |
| 6 | PIH | Azelaic acid, niacinamide, retinoids, vitamin C | Azelaic acid, niacinamide | Azelaic acid, mandelic acid |
| 7 | Solar Lentigines | Hydroquinone (Rx), tazarotene (Rx), vitamin C | Vitamin C | Vitamin C, alpha arbutin; HQ with duration limits |
| 8 | Atopic Dermatitis | Ceramides, colloidal oatmeal, urea, tacrolimus (Rx) | Ceramides, oatmeal | All barrier actives safe |
| 9 | Contact Dermatitis | Hydrocortisone 1%, colloidal oatmeal, petrolatum | Oatmeal, petrolatum | All barrier actives safe |
| 10 | Seborrheic Dermatitis | Ketoconazole, zinc pyrithione, selenium sulfide | Zinc pyrithione | Ketoconazole 2%, zinc pyrithione |
| 11 | Psoriasis | Calcipotriene (Rx), tazarotene (Rx), coal tar | Coal tar (topical) | Calcipotriene; potent-steroid caution |
| 12 | Perioral Dermatitis | Metronidazole (Rx), doxycycline (Rx), azelaic acid | Azelaic acid | Azelaic acid, zinc oxide |
| 13 | Keratosis Pilaris | Salicylic acid, urea, glycolic/lactic acid | Urea | Lactic acid, urea |
| 14 | Photoaging | Tretinoin (Rx), retinol, vitamin C+E+ferulic | Bakuchiol, vitamin C | Niacinamide, bakuchiol, vitamin C |

---

## Global safety rules

### Pregnancy (from `seed-data.json` pregnancySafety + ingredient entities)

- **Safe categories:** azelaic acid, niacinamide, vitamin C, zinc oxide, ceramides, hyaluronic acid, glycerin, colloidal oatmeal, physical sunscreens.
- **Avoid categories:** retinoids (all), hydroquinone, high-dose salicylic acid, oral antibiotics, spironolactone, isotretinoin, chemical sunscreens.
- **Oral medications (absolute contraindications):** isotretinoin (Category X, iPLEDGE mandatory), spironolactone (anti-androgen effects on male fetus), tetracyclines incl. doxycycline (bone/tooth development), methotrexate (teratogenic; 3-month washout before conception).
- Per-ingredient pregnancy flags in the tables below come from each ingredient entity's `pregnancy_safe` field.

### Fitzpatrick IV–VI (from core graph edges + README)

- **SAFE first choices:** azelaic acid, niacinamide, vitamin C, ceramides, tranexamic acid, mandelic acid, gluconolactone.
- **CAUTION:** retinoids, hydroquinone (ochronosis risk), glycolic acid peels >20%, salicylic acid peels >20%, topical corticosteroids, IPL/lasers (PIH risk).
- **Principle:** PIH prevention is the #1 priority for darker skin types — every recommendation must prioritize low-irritation strategies, and melasma/PIH protection requires **iron-oxide tinted sunscreen** (visible light, not just UV, drives pigmentation).

---

## 1. Acne Vulgaris (`acne-vulgaris`)

Multifactorial: sebum overproduction, *C. acnes*, follicular hyperkeratinization, inflammation.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Adapalene (OTC 0.1% / Rx 0.3%) | A | 0.1% (effective); 0.3% Rx | Salicylic acid (caution — irritation) | Pregnancy; breastfeeding (caution); rosacea/eczema flares |
| Benzoyl peroxide | A | 2.5–5% (max 10%) | Retinol & tretinoin (oxidizes/inactivates), vitamin C (antagonistic), salicylic acid (caution) | BPO sensitivity; severe eczema/dermatitis; bleaches fabrics |
| Salicylic acid | A | 0.5–2% (OTC max 2%) | Glycolic acid, retinoids (caution — over-exfoliation) | Pregnancy (salicylate absorption); aspirin allergy; rosacea/eczema |
| Azelaic acid | A | 10% OTC; 15–20% Rx | Vitamin C (caution) | None significant; **pregnancy-safe (Cat. B)** |
| Tretinoin (Rx) | A | 0.025–0.05% (max 0.1%) | Benzoyl peroxide (separate 12+ h), glycolic acid | Pregnancy (Cat. X); breastfeeding; eczema; rosacea; sunburned skin |
| Retinol | A | 0.3–0.5% (max 1%) | BPO (antagonistic), glycolic/SAs (caution), vitamin C (caution) | Pregnancy; breastfeeding; compromised barrier |
| Niacinamide | A | 2–5% (max 10%) | None (synergistic with retinoids, HA) | Rare flushing >5%; **pregnancy-safe** |
| Glycolic acid | A | 5–10% daily (peels 20–70% in-clinic only) | Retinoids, salicylic acid, vitamin C (caution) | Pregnancy (caution); active rosacea/eczema; Fitz IV–VI: peel >20% = PIH risk |
| Green tea extract (EGCG) | A | 2–5% | None known | Tea allergy (rare); **pregnancy-safe** |
| Mandelic acid | B | 5–10% | Other AHAs (caution) | Pregnancy; nut allergy; **preferred AHA for Fitz IV–VI** (lower PIH risk) |

**Adjuncts:** allantoin 0.5–1% (soothing), sulfur 3–10%, tea tree oil ≤5% (never undiluted).
**Moderate–severe (Rx):** isotretinoin 0.5–1 mg/kg/day (A; iPLEDGE, pregnancy Cat. X), doxycycline 50–100 mg (A; max 3–4 months), spironolactone 50–200 mg females (A). Zinc 25–30 mg/day supplement (B; separate from tetracyclines by 2–4 h).
**Pregnancy-safe picks:** azelaic acid, benzoyl peroxide, niacinamide, green tea extract.

---

## 2. Hormonal Acne (`hormonal-acne`)

Androgen-driven (jawline/cyclical pattern); **screen for PCOS in women with jawline/cyclical acne**. Topical regimen mirrors Acne Vulgaris above (adapalene is the engine's first-line topical); systemic options differ.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Spironolactone (Rx, oral) | A | 50–200 mg/day (females) | ACE inhibitors, ARBs, potassium supplements, lithium | **Pregnancy contraindicated** (anti-androgen effects on male fetus); monitor K⁺ and blood pressure |
| Combined oral contraceptives (Rx) | A | Per prescription (estrogen-containing types) | Physician-managed | Rx-only; requires physician oversight |
| Isotretinoin (Rx, oral) | A | 0.5–1 mg/kg/day, 16–24 wks (cumulative 120–150 mg/kg) | Vitamin A supplements, tetracyclines, phenytoin, corticosteroids | **ABSOLUTE: pregnancy Cat. X, iPLEDGE mandatory**; monitor lipids, liver, mood |
| Adapalene | A | 0.1% | Salicylic acid (caution) | Pregnancy; breastfeeding (caution) |
| Zinc (supplement) | B | 25–30 mg/day (picolinate or gluconate) | Separate from tetracyclines by 2–4 h | Excess >40 mg/day risks copper deficiency |
| Spearmint (supplement) | B | 2 cups tea daily or 400 mg extract | None known | Limited long-term data |
| Myo-inositol (supplement) | B | 2,000–4,000 mg/day (40:1 myo:D-chiro ratio) | None known | Especially relevant with PCOS/insulin resistance |

**Also in graph:** DIM supplement shows emerging promise (Evidence C). **Pregnancy-safe picks:** azelaic acid, benzoyl peroxide, niacinamide (topical only; all systemic options here are Rx and most are contraindicated in pregnancy).

---

## 3. Fungal Acne (`fungal-acne`)

*Malassezia* yeast-driven monomorphic itchy papules. **Avoid esters, fatty acids, and occlusive oils that feed *Malassezia*.**

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Ketoconazole (Rx/OTC) | A | 2% cream/shampoo | None (topical); oral form has hepatic monitoring | Oral Rx only for extensive disease; local irritation |
| Zinc pyrithione | A | 1–2% wash/shampoo | None known | Local irritation; **pregnancy-safe wash** |
| Ciclopirox (Rx) | A | 0.77% gel | None known | Rx per label |
| Salicylic acid | B | 0.5–2% | Glycolic acid, retinoids (caution) | Pregnancy; aspirin allergy |
| Sulfur | B | 3–10% | Benzoyl peroxide (caution) | Sulfa-drug allergy (caution); dryness; odor |
| Azelaic acid | B | 10–20% | Vitamin C (caution) | None significant; **pregnancy-safe** |
| Tea tree oil | B | ≤5%, never undiluted | Benzoyl peroxide (caution) | Pregnancy (limited data); broken skin; tea tree allergy |
| Benzoyl peroxide | B | 2.5–5% | Retinoids, vitamin C (antagonistic) | BPO sensitivity; less effective vs. *Malassezia* than antifungals |

**Extensive/refractory (Rx):** oral fluconazole or itraconazole (A). **Stop all oils/esters** including most moisturizers and fungal-acne-triggering ingredients.

---

## 4. Rosacea (`rosacea`)

Chronic facial redness with papules/pustules; barrier dysfunction and *Demodex* involvement.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Azelaic acid | A | 15% gel (Rx); 10% OTC | Vitamin C (caution) | None significant; **pregnancy-safe (Cat. B)** |
| Metronidazole (Rx) | A | 0.75–1% cream/gel | None noted | Rx; local irritation |
| Ivermectin (Rx) | A | 1% cream | None noted | Rx; *Demodex*-targeted |
| Doxycycline (Rx, oral) | A | 40 mg modified-release (sub-antimicrobial) or 50–100 mg; max 3–4 months | Antacids, iron supplements, isotretinoin, warfarin | **Pregnancy contraindicated**; photosensitivity; GI upset |
| Colloidal oatmeal | A | 1–5% | None known | Oat allergy (rare); **pregnancy-safe** |
| Niacinamide | B | 2–5% | None | Rare flushing >5%; **pregnancy-safe** |
| Sulfur | B | 3–10% (often Rx w/ sodium sulfacetamide) | Benzoyl peroxide (caution) | Dryness; odor |
| Green tea extract | B | 2–5% | None known | **Pregnancy-safe** |
| Zinc oxide | A | 10–25% mineral SPF | None known | **Pregnancy-safe**; rosacea-prone skin type flagged in entity |
| Ceramides | B | 2–5% | None known | **Pregnancy-safe** barrier support |

**Avoid on active rosacea (pairs file grades these C for rosacea):** retinol, tretinoin, adapalene, glycolic acid, salicylic acid, benzoyl peroxide, vitamin C (low-pH), lactic acid, mandelic acid, tea tree. Titanium dioxide mineral SPF is also A. **Persistent erythema:** pulsed-dye laser (A, procedure; Fitz IV–VI PIH caution).

---

## 5. Melasma (`melasma`)

Dermal ± epidermal pigmentation driven by hormones + UV + **visible light** (Fitz IV–VI require iron-oxide tinted SPF).

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Hydroquinone (Rx) | A | 2% OTC / 4% Rx; max 3–4 month cycles | Azelaic acid (caution — concurrent irritation per graph) | **Pregnancy; breastfeeding**; ochronosis history; Fitz IV–VI caution (exogenous ochronosis); EU Rx-only |
| Tretinoin (Rx) | A | 0.05% (as part of combo or alone 0.025–0.05%) | Benzoyl peroxide; glycolic acid (caution) | **Pregnancy (Cat. X)** |
| Azelaic acid | A | 15–20% | Vitamin C (caution) | **Pregnancy-safe (Cat. B)**; first choice in pregnancy and Fitz IV–VI |
| Tranexamic acid (topical) | A | 2–5% | Oral form + hormonal contraceptives (physician only) | Pregnancy (oral contraindicated; topical caution); thrombosis history for oral |
| Niacinamide | A | 2–5% | None | **Pregnancy-safe** |
| L-Ascorbic acid | A | 10–20%, pH < 3.5 | Benzoyl peroxide (oxidizes); copper peptides | Very sensitive skin may not tolerate pH < 3.5; **pregnancy-safe** |
| Kojic acid | B | 1–2% | None noted | Pregnancy (limited data); contact-sensitization risk |
| Alpha arbutin | B | 1–2% | None | **Pregnancy-safe** HQ alternative |
| Licorice root extract | B | 0.5–1% (glabridin) | None | Licorice allergy (rare); **pregnancy-safe** |
| Zinc oxide + iron oxide (tinted SPF) | A | 10–25%, SPF 30+ | None | **ESSENTIAL for all melasma patients**; pregnancy-safe |

**Triple combination cream** (hydroquinone 4% + tretinoin 0.05% + fluocinolone 0.01%): Evidence A; max 8 weeks continuous; **contraindicated in pregnancy; Fitz IV–VI caution** (ochronosis risk). **Oral tranexamic acid:** Rx, Evidence D per core graph. Photoprotection Protocol (broad-spectrum SPF 30+, mineral, iron-oxide tinted) is Evidence A and non-negotiable.

---

## 6. Post-Inflammatory Hyperpigmentation (`post-inflammatory-hyperpigmentation`)

Pigment left after inflammation; **Fitzpatrick IV–VI carry the highest risk — treat inflammation first, then pigment.**

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Azelaic acid | A | 10–20% | Vitamin C (caution) | **Pregnancy-safe; first-line for Fitz IV–VI** |
| Niacinamide | A | 2–5% | None | **Pregnancy-safe** |
| Tretinoin (Rx) | A | 0.025–0.05% | Benzoyl peroxide; glycolic acid (caution) | **Pregnancy (Cat. X)** |
| Retinol | A | 0.3–0.5% | BPO (antagonistic); acids (caution) | Pregnancy; breastfeeding |
| L-Ascorbic acid | A | 10–20% | Benzoyl peroxide; copper peptides | Low-pH irritation on sensitive skin; **pregnancy-safe** |
| Hydroquinone (Rx) | A | 2–4%, max 3–4 month cycles | Azelaic acid (caution) | **Pregnancy**; ochronosis; Fitz IV–VI duration limits |
| Glycolic acid | A | 5–10% daily leave-on | Retinoids, salicylic acid, vitamin C (caution) | Pregnancy (caution); Fitz IV–VI: keep ≤10% daily, in-clinic peels carry PIH risk |
| Mandelic acid | B | 5–10% | Other AHAs (caution) | Pregnancy; nut allergy; **preferred AHA for Fitz IV–VI** |
| Alpha arbutin | B | 1–2% | None | **Pregnancy-safe** |
| Tranexamic acid | B | 2–5% topical | Oral form: hormonal contraceptives (physician only) | Evidence strongest in melasma; oral = Rx, contraindicated in pregnancy |

**Also in graph:** bakuchiol 0.5–1% (B; pregnancy-safe retinol alternative), gluconolactone 5–15% (B; gentle PHA, less photosensitizing). Photoprotection Protocol (A) prevents deepening. In-clinic: glycolic peels, microneedling, QS Nd:YAG laser (A each; **Fitz IV–VI PIH caution**).

---

## 7. Solar Lentigines (`solar-lentigines`)

UV-driven flat pigment spots ("age spots"). Prevention-first; procedures are first-line for established lesions.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Hydroquinone (Rx) | A | 2–4%, max 3–4 month cycles | Azelaic acid (caution) | **Pregnancy**; ochronosis history; duration limits |
| Tazarotene (Rx) | A | Per prescription labeling | Other topical retinoids | **Pregnancy**; retinoid class warnings |
| L-Ascorbic acid | A | 10–20% | Benzoyl peroxide; copper peptides | Low-pH irritation; **pregnancy-safe** |
| Tranexamic acid | A | 2–5% topical | Oral form: hormonal contraceptives (physician only) | Pregnancy (oral contraindicated); thrombosis history (oral) |
| Ferulic acid | A | 0.5% (with vitamin C + E) | None known | Doubles photoprotection efficacy with C+E; **pregnancy-safe** |
| Alpha arbutin | B | 1–2% | None | **Pregnancy-safe** HQ alternative |
| Zinc oxide | A | 10–25%, SPF 30+ | None | Prevention essential; **pregnancy-safe** |
| Titanium dioxide | A | 5–25%, SPF 30+ | None | Prevention essential; **pregnancy-safe** |

**Procedures (per engine mappings):** IPL and QS Nd:YAG laser, Evidence A, for established lentigines — **Fitz IV–VI: laser PIH caution** (fitzpatrick_caution). Daily SPF prevents recurrence; chemical filters (avobenzone, octinoxate) are alternatives per graph but mineral preferred in pregnancy.

---

## 8. Atopic Dermatitis / Eczema (`atopic-dermatitis`)

Barrier dysfunction (filaggrin/ceramide deficiency) + type-2 inflammation; moisturize-first, trigger avoidance.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Ceramides | A | 2–5% (with cholesterol for barrier-lipid ratio) | None known | **Pregnancy-safe** |
| Colloidal oatmeal | A | 1–5% | None known | Oat allergy (rare); FDA Category I skin protectant; **pregnancy-safe** |
| Urea | A | 5–10% face (10–40% keratolytic body) | Can sting on broken skin at high % | Avoid >10% on face unless directed; **pregnancy-safe** |
| Panthenol | A | 2–5% | None known | **Pregnancy-safe** |
| Glycerin | A | 5–10% | Pair with occlusive in dry climates | **Pregnancy-safe** |
| Hyaluronic acid | A | 0.1–2% | None known | **Pregnancy-safe** |
| Niacinamide | A | 2–5% | None | Rare flushing; **pregnancy-safe** |
| Hydrocortisone (OTC/Rx) | A | 1%, low-potency for flares | Prolonged continuous use (atrophy, steroid acne) | Limit courses; Fitz IV–VI: repeated use risks hypopigmentation |
| Tacrolimus (Rx) | A | 0.03–0.1% ointment | None noted | Rx; initial burning common; steroid-sparing for face/folds; **pregnancy: physician-guided** |
| Pimecrolimus (Rx) | A | 1% cream | None noted | Rx; maintenance/face/eyelids |

**Avoid during flares (pairs file grades C for eczema):** retinol, tretinoin, adapalene, salicylic acid, glycolic acid, vitamin C (low pH), benzoyl peroxide, tea tree. **Adjuncts:** petrolatum (plain occlusive, A per ladder), squalane, madecassoside, snail mucin, bisabolol (B). **Moderate–severe (Rx):** dupilumab (A). **Systemic adjuncts:** omega-3 EPA/DHA, vitamin D (A per engine); gut-health optimization protocol (B); stress management (B).

---

## 9. Contact Dermatitis (`contact-dermatitis`)

Irritant or allergic reaction. **Remove the trigger (patch testing for allergens); zero actives during the acute phase.**

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Hydrocortisone 1% | A | 1% OTC, short courses (7–14 days) | Prolonged continuous use | Limit duration; Fitz IV–VI: repeated use risks hypopigmentation |
| Colloidal oatmeal | A | 1–5% | None known | Oat allergy (rare); **pregnancy-safe** |
| Petrolatum | A | Plain occlusive (100%) | None known | **Pregnancy-safe**; gold-standard plain barrier |
| Panthenol | A | 2–5% | None known | **Pregnancy-safe** |
| Ceramides | B | 2–5% | None known | **Pregnancy-safe** barrier repair |
| Allantoin | B | 0.5–1% | None known | FDA-recognized skin protectant; **pregnancy-safe** |
| Bisabolol | B | 0.5% | None known | Chamomile allergy (rare); **pregnancy-safe** |
| Centella asiatica | B | 2–5% | None known | **Pregnancy-safe** |
| Aloe vera | B | Per product (gels) | None known | Allergy (rare) |
| Chamomile extract | B | Per product | None known | Ragweed-family allergy |

**Rule:** no exfoliants, vitamin C, retinoids, or acids until the skin is fully healed; then reintroduce one at a time.

---

## 10. Seborrheic Dermatitis (`seborrheic-dermatitis`)

*Malassezia*-driven flaking on scalp and oily facial zones; antifungals + anti-inflammatories.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Ketoconazole | A | 2% cream/shampoo 2–3×/week (1% OTC shampoo) | None (topical) | Oral form = Rx with hepatic monitoring |
| Zinc pyrithione | A | 1–2% shampoo/wash | None known | **Pregnancy-safe wash** |
| Selenium sulfide | A | 1–2.5% shampoo | None noted | Odor; can discolor hair; oiliness |
| Ciclopirox (Rx) | A | 0.77% gel | None noted | Rx per label |
| Coal tar | A | OTC preparations (scalp shampoos/lotions) | None noted | Odor; photosensitivity; stains |
| Hydrocortisone 1% | A | Short-term flares only | Prolonged use (rebound, steroid acne) | Limit courses; Fitz IV–VI caution |
| Tacrolimus (Rx) | A | 0.1% for face/maintenance | None noted | Rx; steroid-sparing (esp. face) |
| Salicylic acid | B | 2% (medicated shampoos higher) | Other acids, retinoids (caution) | Pregnancy; stinging |
| Sulfur | B | 3–10% (often Rx w/ sodium sulfacetamide) | Benzoyl peroxide (caution) | Dryness; odor |
| Green tea extract | B | 2–5% | None known | **Pregnancy-safe** |

**Extensive/refractory (Rx):** oral fluconazole or itraconazole (A). **Support:** niacinamide, zinc PCA, ceramides (B) for sebum/barrier.

---

## 11. Psoriasis (`psoriasis`)

Autoimmune keratinocyte hyperproliferation. OTC topicals are adjuncts; **moderate–severe disease needs dermatology.**

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Calcipotriene (Rx) | A | Per prescription labeling (vitamin D analog) | None noted | Rx; facial/fold irritation |
| Tazarotene (Rx) | A | Per prescription labeling | Other topical retinoids | **Pregnancy**; retinoid class warnings |
| Coal tar | A | OTC shampoos/lotions | None noted | Odor; photosensitivity; folliculitis risk |
| Anthralin (Rx) | A | Per Rx (short-contact therapy) | None noted | Stains skin/clothing; irritation |
| Salicylic acid | B | 2%+ (keratolytic in medicated shampoos) | Other acids (caution) | Pregnancy; stinging |
| Hydrocortisone 1–2.5% | A | Limited plaques, 1–2 week courses | Prolonged use (rebound) | Rebound on withdrawal; Fitz IV–VI: repeated use risks hypopigmentation |

**Procedures/systemic (all Rx, Evidence A):** NB-UVB phototherapy, excimer laser, methotrexate (**pregnancy contraindicated; 3-month washout**), cyclosporine, apremilast, biologics (TNF-α inhibitors), dupilumab-class agents. **Systemic adjuncts:** omega-3 EPA/DHA, vitamin D (A per engine). **Red flag:** joint pain/stiffness → screen for psoriatic arthritis (rheumatology referral).

---

## 12. Perioral Dermatitis (`perioral-dermatitis`)

Perioral red papules, frequently steroid-induced. **Zero-therapy first: stop topical steroids and heavy occlusive creams before treating.**

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Metronidazole (Rx) | A | 0.75% gel/cream | None noted | Rx |
| Tacrolimus / Pimecrolimus (Rx) | A | 0.1% ointment / 1% cream | None noted | Rx; steroid-sparing maintenance |
| Doxycycline (Rx, oral) | A | 50–100 mg | Antacids, iron, isotretinoin, warfarin | **Pregnancy contraindicated**; photosensitivity |
| Azelaic acid | B | 10–15% | Vitamin C (caution) | **Pregnancy-safe** |
| Zinc oxide | B | 10–25% mineral SPF | None known | **Pregnancy-safe** |
| Ceramides | B | 2–5% | None known | **Pregnancy-safe** barrier support |
| Centella asiatica | B | 2–5% | None known | **Pregnancy-safe** |

**Avoid (per graph):** topical corticosteroids (cause rebound; the classic trigger), tretinoin and other retinoids during active disease (tretinoin entity lists perioral dermatitis as exacerbated; pairs grade C), benzoyl peroxide (C). Minocycline (A) is the alternative oral Rx.

---

## 13. Keratosis Pilaris (`keratosis-pilaris`)

Keratin plugs on upper arms/thighs; chronic — **maintenance, not cure.**

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Salicylic acid | A | 0.5–2% | Other acids, retinoids (caution) | Pregnancy; aspirin allergy |
| Urea | A | 10–20% (up to 40% body) | Broken-skin sting | Avoid >10% on face; **pregnancy-safe** |
| Glycolic acid | A | 5–10% | Retinoids, salicylic acid (caution) | Pregnancy (caution) |
| Lactic acid | A | 5–8% (max 12%) | Glycolic acid (caution) | Pregnancy (caution high dose); gentler AHA, NMF component |
| Retinol | B | 0.3–0.5% | BPO (antagonistic); acids (caution) | Pregnancy; breastfeeding |
| Tretinoin (Rx) | B | 0.025–0.05% | Benzoyl peroxide | **Pregnancy (Cat. X)** |
| Azelaic acid | B | 10–20% | Vitamin C (caution) | **Pregnancy-safe** |

**Rule:** gentle chemical exfoliation + emollients; physical scrubbing worsens it. Fitz IV–VI: prefer lactic/urea over glycolic to limit PIH.

---

## 14. Photoaging (`photoaging`)

UV is the primary driver (**~95% of facial aging per graph**). Prevention (photoprotection) outperforms reversal.

| Ingredient | Evidence | Concentration | Do not combine with | Contraindications / cautions |
|---|---|---|---|---|
| Tretinoin (Rx) | A | 0.02–0.05% (FDA-approved for photoaging) | Benzoyl peroxide; glycolic acid (caution) | **Pregnancy (Cat. X)**; retinization period |
| Retinol | A | 0.3–0.5% (max 1%) | BPO (antagonistic); acids (caution) | Pregnancy; breastfeeding; barrier compromise |
| L-Ascorbic acid | A | 10–20%, pH < 3.5 | BPO (oxidizes); copper peptides (antagonistic) | Low-pH irritation; **pregnancy-safe** |
| Ferulic acid | A | 0.5% (with C + E) | None known | Doubles photoprotection efficacy with C+E; **pregnancy-safe** |
| Glycolic acid | A | 5–10% daily | Retinoids, salicylic acid, vitamin C (caution) | Pregnancy (caution); Fitz IV–VI: peels >20% = PIH risk |
| Green tea extract | A | 2–5% | None known | **Pregnancy-safe** |
| Zinc oxide | A | 10–25%, SPF 30+ daily | None known | **Pregnancy-safe; the prevention cornerstone** |
| Bakuchiol | B | 0.5–1% | None known | **Pregnancy-safe** retinol alternative (2019 RCT: retinol-comparable) |
| Matrixyl (Palmitoyl Pentapeptide-4) | B | 0.01–0.05% | None noted | **Pregnancy-safe**; collagen-signaling peptide |

**Also Evidence A in graph:** retinaldehyde, vitamin E (synergistic with C/ferulic), titanium dioxide, sodium hyaluronate (hydration). **Procedures (A):** glycolic peels, microneedling, laser resurfacing, IPL, erbium:YAG — **Fitz IV–VI: PIH caution**. Collagen peptides + vitamin C show modest consistent benefits (B).

---

## Excluded conditions (referral-only)

The following tracked/live conditions are **excluded from ingredient tables** because the knowledge graph routes them to dermatologist referral rather than OTC actives:

| Condition | Why excluded | Graph guidance |
|---|---|---|
| Vitiligo | No OTC cosmetic actives; tacrolimus and systemic immunomodulation are Rx | Dermatology referral (core Condition node COND_009) |
| Actinic keratosis | Precancerous — cryotherapy/procedure first; tretinoin adjunct is Rx-supervised | Dermatology referral required |
| BCC / SCC / Melanoma | Cancer — not ingredient-treatable | Immediate dermatology referral; biopsy |
| Steroid acne | Iatrogenic — management is steroid cessation ± Rx | Address the steroid source first |

---

## Method

1. **Condition set (14):** union of `conditionDetector.ts` (10), `queryEngine.ts` condition keys (10), core graph Condition nodes (10), and `indexes/condition-to-treatments.json` (10) — deduplicated to the 14 conditions with ingredient-level treatment coverage. The live `skin_conditions` table (65 rows incl. cosmetic zones) and the 26-condition seed were reviewed; zones/cosmetic concerns (brow, jowls, neck, etc.) are not ingredient-mapped conditions.
2. **Pair evidence fusion:** `relationships/ingredient-conditions.json` (499 pairs, A/B/C) took precedence; engine `condition-ingredient-mappings.json` (429 pairs, strong/moderate/emerging → A/B/C) filled gaps; core `edges.json` (A/B/C/D, weights) anchored the core 25-ingredient set.
3. **Ranking:** engine `effectiveness` (0–1) desc, then evidence grade, then entity completeness. Top 5–10 retained per condition.
4. **Per-ingredient fields** from `entities/ingredients.json` (concentration_range, pregnancy_safe, contraindications, interactions); interaction warnings merged from `relationships/ingredient-interactions.json`; pregnancy categories cross-checked against `indexes/pregnancy-safe.json` and `seed-data.json.pregnancySafety`; Fitzpatrick flags from `edges.json` (fitzpatrick_safe / fitzpatrick_caution); Rx concentrations from `entities/treatment-ladders.json`; medication detail from `nodes.json` Medication nodes.
5. **ID normalization (graph typos/variants):** `melasa`→melasma; `PIH`/`pih`→post-inflammatory-hyperpigmentation; `hyalauronic-acid`→hyaluronic-acid; `vitamin-c`→L-ascorbic-acid; `arbutin`→alpha-arbutin; `-pure` suffixed engine IDs merged into base IDs.

**Data caveats:** the engine file's `evidence_level` vocabulary (strong/moderate/emerging) differs from the letter-graded files; a handful of pairs had conflicting grades across files (e.g., niacinamide–rosacea B in the relationship file vs. strong in the engine file) — the conservative letter grade is reported. Hydroquinone–azelaic acid is flagged "caution" by the interaction file (combined irritation), though both are independently first-line for pigment; stagger applications if co-prescribed.

## Review cadence

Quarterly, or upon new AAD guideline publication. Owner: SKINgenius-Research. Next review: **2026-12-14**.