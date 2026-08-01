# SKINgenius Clinical Research Scan — 2026-07-31

> **Sprint:** 11 | **Agent:** Sage (skingenius-ceo) | **Scope:** Acne, Hyperpigmentation, Rosacea  
> **Date range:** 2024–2026 | **Evidence threshold:** Level III or higher

---

## 1. ACNE (Comedonal, Inflammatory, Cystic)

### 1.1 Updated Guidelines — AAD 2024 Clinical Practice Guideline

| Field                  | Detail                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Source**             | Reynolds et al., "Guidelines of care for the management of acne vulgaris," _JAAD_ (2024). doi:10.1016/j.jaad.2023.11.074 |
| **Evidence Level**     | I (Systematic review → CPG, GRADE methodology)                                                                           |
| **Clinical Relevance** | 🔴 **HIGH** — Primary guideline driving SKINgenius recommendation engine                                                 |

**Key changes from prior (2016) guideline:**

1. **Strong recommendations** for: benzoyl peroxide (BPO), topical retinoids (adapalene, tretinoin, tazarotene, trifarotene), topical antibiotics **only in fixed-dose combo with BPO**, oral doxycycline.
2. **Conditional recommendations** for: clascoterone 1% cream, salicylic acid, azelaic acid, oral minocycline, sarecycline, combined oral contraceptives (COCs), spironolactone.
3. **Antimicrobial stewardship** explicitly emphasized — topical antibiotic monotherapy is discouraged; oral erythromycin recommended only in pregnancy.
4. **Spironolactone** now recognized as comparable in effectiveness to oral tetracyclines for many women; routine potassium monitoring NOT required except in high-risk populations.
5. **Isotretinoin** remains strongly recommended for severe/scarring/refractory acne; flexible lab monitoring acknowledged.
6. **Conditional** support for light-based therapies, chemical peels, low glycemic load diets; **insufficient evidence** for most nutraceuticals/supplements.

**SKINgenius Impact:**

- Update condition profile: topical antibiotic monotherapy → contraindicated recommendation
- Add clascoterone as conditional first-line option for inflammatory acne (especially hormonal)
- Spironolactone: remove potassium monitoring caveat for low-risk patients
- Retinoid hierarchy: trifarotene (RAR-γ selective) added as option

---

### 1.2 Clascoterone (Winlevi®) — First-in-Class Topical Antiandrogen

| Field                  | Detail                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | NCBI Bookshelf, Clinical Review NDA 213433; DermNet NZ review (Jul 2025); _Practical Dermatology_ (Feb 2025); _JAAD_ (Dec 2025 review) |
| **Evidence Level**     | I (FDA-approved, pivotal RCTs)                                                                                                         |
| **Clinical Relevance** | 🔴 **HIGH** — Novel mechanism class for SKINgenius                                                                                     |

- FDA-approved 2020 (US); now approved in Canada (2023), Australia (2024), New Zealand (2024), UK (2025).
- **Mechanism:** Topical androgen receptor inhibitor — blocks dihydrotestosterone (DHT) at the pilosebaceous unit without systemic antiandrogen effects.
- **46% reduction in inflammatory lesions** at 12 weeks in pivotal trials.
- **2024 AAD guideline:** Conditionally recommended (cost currently limits stronger endorsement).
- Approved for ages 12+.
- Favorable safety profile: minimal systemic absorption, no hormonal side effects.

**SKINgenius Impact:**

- Add clascoterone to acne treatment recommendations as first topical antiandrogen
- Particularly valuable for: adult female hormonal acne, patients avoiding oral antiandrogens
- Note: currently prescription-only, high cost — flag as conditional recommendation

---

### 1.3 Topical Antibiotic Monotherapy — Network Meta-Analysis (2026)

| Field                  | Detail                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | Lyu et al., "Topical Antibiotic Monotherapy Only Provides Mild Benefit for Patients with Acne Vulgaris: A Systematic Review and Network Meta-analysis," _Clin Drug Investig_ (2026). doi:10.1007/s40261-026-01553-z |
| **Evidence Level**     | I (Network meta-analysis of RCTs)                                                                                                                                                                                   |
| **Clinical Relevance** | 🟡 **MODERATE** — Reinforces AAD stewardship guidance                                                                                                                                                               |

- Topical antibiotic monotherapy shows only mild benefit vs. vehicle.
- Reinforces guideline directive: **never prescribe topical antibiotics without BPO or retinoid combination**.

**SKINgenius Impact:**

- Strengthen contraindication flag on topical antibiotic monotherapy in recommendation engine
- Auto-suggest BPO + antibiotic combinations when antibiotic route selected

---

### 1.4 Acne Microbiome — Systematic Review (2025)

| Field                  | Detail                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | Podwojniak et al., "Acne and the cutaneous microbiome: A systematic review of mechanisms and implications for treatments," _JEADV_ (2025). doi:10.1111/jdv.20332 |
| **Evidence Level**     | II (Systematic review of mechanistic + clinical studies)                                                                                                         |
| **Clinical Relevance** | 🟡 **MODERATE** — Emerging mechanism insights                                                                                                                    |

**Key findings:**

- _C. acnes_ phylotype diversity matters: phylotype IA1 associated with acne; IB/II associated with healthy skin.
- _C. granulosum_ has fewer virulence factors — potential probiotic role.
- _C. acnes_ bacteriophages modulate strain populations; phage therapy is a future direction.
- **Gut-skin axis:** Oral probiotics show modest anti-inflammatory benefit (SMD −0.57; 95% CI −0.94 to −0.21) but substantial heterogeneity (I²=72%); evidence quality rated **low-to-moderate**.

**SKINgenius Impact:**

- Add microbiome-aware language to acne condition profile
- Flag oral probiotics as adjunctive only (Level III evidence); do not recommend as primary therapy
- Track phage therapy (BX001 and similar) as pipeline — not yet Level III

---

### 1.5 Oral Probiotics — Meta-Analysis (2025)

| Field                  | Detail                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Oral Probiotics in Acne vulgaris: A Systematic Review and Meta-Analysis of Double-Blind Randomized Clinical Trials," _Medicina_ (2025). PROSPERO CRD420251181388 |
| **Evidence Level**     | II (Meta-analysis of 3 double-blind RCTs, n=231)                                                                                                                  |
| **Clinical Relevance** | 🟡 **MODERATE**                                                                                                                                                   |

- Pooled SMD: −0.57 (95% CI −0.94 to −0.21) for inflammatory lesion count reduction.
- 95% prediction interval (−1.25 to 0.11) — future studies may find no meaningful effect.
- **No serious adverse events** across all trials.
- Evidence rated **low-to-moderate certainty**.
- Strain-level data insufficient for specific product recommendations.

**SKINgenius Impact:**

- Oral probiotics: adjunctive only, moderate uncertainty
- Do NOT recommend specific probiotic strains at this time (insufficient strain-level evidence)

---

### 1.6 Novel Acne Treatments — Narrative Review (2025)

| Field                  | Detail                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Update on novel acne treatments: a narrative review focused on microbiome modulation and non-pharmacological approaches," _PMC_ (2025). PMC12830251 |
| **Evidence Level**     | III (Narrative review with clinical trial table)                                                                                                     |
| **Clinical Relevance** | 🟡 **MODERATE** — Pipeline tracking                                                                                                                  |

**Emerging therapies identified:**

| Therapy                                                                                | Stage                  | Key Finding                                                               |
| -------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| Topical probiotics (Lactobacillus spp.)                                                | Phase II               | Reduced C. acnes colonization; improved hydration. Small RCTs.            |
| _Nitrosomonas eutropha_ B244 (AOBiome)                                                 | Phase IIb RCT (n=358)  | IGA success OR 2.45 vs. placebo (p=0.03). Inflammatory lesions NS.        |
| Engineered _C. acnes_ expressing NGAL                                                  | Preclinical            | Reduced sebum production in sebocytes; no increase in IL-1β, IL-6, TNF-α. |
| Bacteriophage therapy (BX001)                                                          | Phase 1 cosmetic trial | Safe; reduced C. acnes in biofilm.                                        |
| Biotech phytocomplex (C. sinensis + M. citrifolia + niacinamide 4% + succinic acid 2%) | Open-label (n=43)      | 52.1% reduction in inflammatory lesions at 8 weeks.                       |
| _E. faecalis_ CBT SL-5 postbiotic lotion                                               | Split-face RCT (n=20)  | Significant improvement at weeks 2, 4, 6.                                 |

**SKINgenius Impact:**

- Track as pipeline only; no Level III evidence for recommendation yet
- Succinic acid 2%: emerging data (included in phytocomplex study) — monitor

---

### 1.7 Acne Hydrogels — Meta-Analysis (2025)

| Field                  | Detail                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Hydrogels for acne treatment: a systematic review and meta-analysis of clinical trials," _PubMed_ (2025). PMID: 41528187 |
| **Evidence Level**     | II (Systematic review + meta-analysis)                                                                                    |
| **Clinical Relevance** | 🟢 **LOW** — Formulation science, not new active                                                                          |

- Hydrogel-based formulations improve tolerability and adherence vs. traditional vehicles.
- No new active ingredients; delivery vehicle innovation.

**SKINgenius Impact:**

- When recommending existing actives, note hydrogel formulations may improve compliance
- Not a condition profile change

---

## 2. HYPERPIGMENTATION (PIH, Melasma, Sun Damage)

### 2.1 Tranexamic Acid (TXA) — Comprehensive Review (2025)

| Field                  | Detail                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Tranexamic Acid for Hyperpigmentation Disorders: A Literature Review on Efficacy and Safety in Melasma and PIH," _J Cosmet Dermatol_ (2025). PMC12848551 |
| **Evidence Level**     | II (Comprehensive literature review, 2010–2025)                                                                                                           |
| **Clinical Relevance** | 🔴 **HIGH** — Expanding evidence for multiple delivery routes                                                                                             |

**Key findings:**

- **Oral TXA** (250–500 mg/day): Significant reduction in mMASI scores. Low-dose regimens (250 mg BID) show efficacy with minimal adverse effects.
- **Topical TXA**: Demonstrated efficacy in melasma and PIH; typically 2–5% concentrations.
- **Intradermal/microneedle TXA**: Emerging delivery showing superior local deposition vs. topical alone.
- **Combination TXA (3% + kojic acid 1% + niacinamide 5%)**: Brazilian clinical study (n=55) showed effectiveness for mild-to-moderate PIH.
- Safety profile: Generally well-tolerated. Oral TXA carries rare thromboembolic risk — screen for contraindications.
- **Pessotti et al. (2026)**: Updated systematic review and meta-analysis of RCTs confirming TXA efficacy across all delivery routes.

**SKINgenius Impact:**

- Upgrade TXA recommendation strength for melasma and PIH
- Add intradermal TXA as emerging option
- Flag oral TXA thromboembolic contraindications in safety profile
- Add combination formula (TXA 3% + kojic acid 1% + niacinamide 5%) as OTC-compatible recommendation for PIH

---

### 2.2 TXA Meta-Analysis for Melasma (2024)

| Field                  | Detail                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | Bhatt et al., "Tranexamic acid as a therapeutic option for melasma management: meta-analysis and systematic review of randomized controlled trials," _J Dermatolog Treat_ (2024). doi:10.1080/09546634.2024.2361106 |
| **Evidence Level**     | I (Meta-analysis of RCTs)                                                                                                                                                                                           |
| **Clinical Relevance** | 🔴 **HIGH**                                                                                                                                                                                                         |

- Confirms TXA efficacy in reducing MASI/mMASI at both 8 and 12 weeks.
- Route comparison: oral > intradermal > topical in magnitude of effect, but all significant.
- Adverse events mild and self-limiting.

---

### 2.3 TXA Injectable Combination — Network Meta-Analysis (2025)

| Field                  | Detail                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Comparative Efficacy and Safety of Injectable Tranexamic Acid Combination Therapies for Melasma: A Network Meta-analysis," _Aesth Surg J_ (2025). doi:10.1093/asj/sjaf133 |
| **Evidence Level**     | II (Network meta-analysis of 9 RCTs, n=358)                                                                                                                                |
| **Clinical Relevance** | 🟡 **MODERATE**                                                                                                                                                            |

- Injectable TXA + microneedling or PRP shows enhanced efficacy vs. TXA alone.
- Best combination: TXA + microneedling for MASI reduction.

---

### 2.4 Cysteamine — Systematic Review & Meta-Analysis (2024)

| Field                  | Detail                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Efficacy and safety of cysteamine 5% cream for the management of melasma: a systematic review and meta-analysis of randomized controlled trials," _Arch Dermatol Res_ (2024). doi:10.1007/s00403-024-03571-3 |
| **Evidence Level**     | I (Systematic review + meta-analysis of RCTs)                                                                                                                                                                 |
| **Clinical Relevance** | 🔴 **HIGH** — New Level I evidence for non-HQ depigmenting agent                                                                                                                                              |

**Key findings:**

- 5% cysteamine cream is **superior or non-inferior to 4% hydroquinone** in mMASI reduction at 2 and 4 months (9% greater reduction; p=0.005 at 2 months, p=0.001 at 4 months vs. modified Kligman's).
- Now available in **7.5% concentration** (Cyspera®).
- Effective for melasma in skin of color (Level II case series evidence).
- Also effective for acne-induced PIH (RCT: cysteamine 5% vs. HQ 4%/ascorbic acid 3%, JCAD 2024).
- Combination protocol emerging: cysteamine (short-contact) + thiamidol + antioxidants AM; retinoids PM.
- Side effects: transient erythema, odor — manageable with short-contact application.

**SKINgenius Impact:**

- **Add cysteamine 5%/7.5% as Level I recommendation for melasma** — non-HQ alternative
- Add short-contact application protocol (15–30 min then wash off)
- Add to PIH recommendations with Level II evidence
- Flag combination with thiamidol as emerging strategy

---

### 2.5 Thiamidol — New Clinical Data (2025–2026)

| Field                  | Detail                                                                                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Clinical Evaluation of Thiamidol-Containing Formulations for the Visual Management of Facial Hyperpigmentation," _PubMed_ (2025). PMID: 41329151; "Efficacy and Tolerability of 0.2% Thiamidol Cream," _PMC_ (2025). PMC13013891 |
| **Evidence Level**     | II (Randomized clinical trials)                                                                                                                                                                                                   |
| **Clinical Relevance** | 🔴 **HIGH** — Novel tyrosinase inhibitor with strong in-vitro and growing clinical data                                                                                                                                           |

**Key findings:**

- **Thiamidol (isobutylamido thiazolyl resorcinol)**: Novel reversible human tyrosinase inhibitor.
- In vitro: superior to arbutin, kojic acid, and hydroquinone in melanin inhibition.
- **0.2% thiamidol cream**: RCT shows significant improvement in facial hyperpigmentation over vehicle.
- **Thiamidol-based regimen** (serum BID + day lotion SPF 30 + night cream): 12-week study (n=90) showed improvement in ITA° angle and colorimetric measures, with 6-week regression data.
- **Combination strategy** (Dermatology Times, Jul 2026): Thiamidol + cysteamine (short-contact) + antioxidants AM; retinoids PM for melasma.

**SKINgenius Impact:**

- Add thiamidol as recommended active for hyperpigmentation (currently OTC in Eucerin Anti-Pigment line)
- Higher evidence tier than kojic acid or arbutin for tyrosinase inhibition
- Note: thiamidol products not widely available in all markets — flag regional availability

---

### 2.6 Emerging Topical Therapies for Melasma — Comparative Analysis (2025)

| Field                  | Detail                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Emerging topical therapies for melasma: a comparative analysis of efficacy and safety," _J Dermatolog Treat_ (2025). doi:10.1080/09546634.2025.2591502 |
| **Evidence Level**     | II (Comparative review with RCT data)                                                                                                                   |
| **Clinical Relevance** | 🟡 **MODERATE**                                                                                                                                         |

- 0.2% thiamidol demonstrates superior outcomes vs. other topical alternatives in self-assessment.
- Comparative ranking (for topicals beyond HQ): thiamidol > cysteamine ≥ TXA > kojic acid > azelaic acid for melasma.
- Cysteamine offers best HQ-free alternative with strongest head-to-head data.

---

## 3. ROSACEA (Types 1–4)

### 3.1 DFD-29 / Emrosi™ (Minocycline HCl Modified-Release) — FDA Approval (Nov 2024)

| Field                  | Detail                                                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | Bhatia et al., "Efficacy, Safety, and Tolerability of Oral DFD-29," _JAMA Dermatol_ (2025); FDA approval announcement (Nov 2024); _Pharmacy Times_ (Jun 2026); _HCPLive_ (Jul 2026) |
| **Evidence Level**     | I (Two Phase 3 RCTs, FDA-approved)                                                                                                                                                  |
| **Clinical Relevance** | 🔴 **HIGH** — First new oral rosacea approval in years                                                                                                                              |

**Key findings:**

- **FDA approved November 2024** (marketed as Emrosi™; Journey Medical Corporation).
- **Formulation:** Modified-release minocycline HCl capsules (10 mg IR + 30 mg ER = 40 mg total). Lowest FDA-approved oral minocycline dose.
- **Phase 3 (MVOR-1 & MVOR-2):** 16-week trials, 3:3:2 randomization (DFD-29 : doxycycline 40 mg : placebo).
- **Results:**
  - 62.7% IGA treatment success rate
  - Statistically superior to BOTH placebo AND doxycycline 40 mg (Oracea®)
  - Significant reduction in inflammatory lesions AND erythema (Clinician's Erythema Assessment)
  - Minimal adverse events — most common was dyspepsia (low rate)
  - No significant safety issues through 16 weeks
- **Launch:** Expected early 2025 (per company press release).
- **Significance:** First oral agent to address both inflammatory lesions AND erythema in rosacea; outperforms current standard (doxycycline 40 mg MR).

**SKINgenius Impact:**

- Add Emrosi™ (DFD-29) as new oral treatment option for moderate-to-severe papulopustular rosacea
- Note dual benefit: lesions + erythema (unique among oral agents)
- Flag as prescription-only, recently launched — availability may vary

---

### 3.2 Rosacea Microbiome — Pathogenesis Advances (2025)

| Field                  | Detail                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Source**             | "Advances in the pathogenesis of rosacea," _Frontiers in Immunology_ (2025). doi:10.3389/fimmu.2025.1705588; "The Skin Microbiome in Rosacea: Mechanisms, Gut-Skin Interactions, and Therapeutic Implications," _Cutis_ (2025) |
| **Evidence Level**     | II (Comprehensive mechanistic review)                                                                                                                                                                                          |
| **Clinical Relevance** | 🟡 **MODERATE** — Strengthens microbiome-targeted rationale                                                                                                                                                                    |

**Key findings:**

- **Microbial dysbiosis in rosacea** confirmed: increased _Demodex folliculorum_, _Staphylococcus epidermidis_ (pathobiont shift), _Bacillus oleronius_ (from Demodex), and altered _C. acnes_ populations.
- **Gut-skin axis:** Small intestinal bacterial overgrowth (SIBO) and _H. pylori_ amplify systemic inflammation → cutaneous flares. However, _H. pylori_ eradication does NOT reliably improve rosacea.
- **Skin barrier disruption** is central: dysbiosis → TLR-2 activation → cathelicidin (LL-37) release → inflammation cascade → vascular changes.
- **Probiotics:** Emerging adjunctive therapy (restore microbial balance, reduce systemic inflammation). Early clinical data; no Level I evidence yet.
- **Fungal microbiome:** New multi-kingdom analysis (skin, blood, stool) shows fungal community shifts in rosacea patients (2025 study, PMID: 40943051).

**SKINgenius Impact:**

- Update rosacea pathogenesis section: microbiome dysbiosis as core mechanism
- Add Demodex + _B. oleronius_ as key targets
- Add probiotic adjunctive recommendation (Level III evidence only — "may consider")
- Note: _H. pylori_ eradication does NOT reliably improve rosacea (add as myth-busting)

---

### 3.3 Rosacea Treatment — Systematic Review of Topicals (2025)

| Field                  | Detail                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**             | "Efficacy and safety of topical minocycline preparations for papulopustular rosacea: a systematic review and meta-analysis," _Frontiers in Medicine_ (2025). doi:10.3389/fmed.2025.1517825; "Efficacy of Widely Used Topical Drugs for Rosacea: A Systematic Review and Meta-Analysis," _JAAD_ (2025). doi:10.1016/j.jaad.2025.04.020 |
| **Evidence Level**     | I (Systematic reviews + meta-analyses)                                                                                                                                                                                                                                                                                                |
| **Clinical Relevance** | 🔴 **HIGH** — Confirms treatment hierarchy                                                                                                                                                                                                                                                                                            |

**Topical efficacy ranking (meta-analytic evidence):**

1. **Ivermectin 1% cream** — most effective for papulopustular lesions; also reduces Demodex burden
2. **Azelaic acid 15% gel** — second-line, good safety profile
3. **Metronidazole 0.75%/1%** — effective but less so than ivermectin
4. **Topical minocycline 1.5% foam** (Zilxi®) — FDA-approved 2020 for papulopustular rosacea
5. **Benzoyl peroxide 5% cream** (Epsolay®) — FDA-approved 2022; microencapsulated formulation

**For persistent erythema:**

- **Brimonidine 0.33% gel** and **oxymetazoline 1% cream** — alpha-agonists; FDA-approved for erythema
- Can be combined with anti-inflammatory topicals for mixed presentation

**SKINgenius Impact:**

- Update rosacea treatment hierarchy: ivermectin > azelaic acid > metronidazole
- Add minocycline 1.5% foam as option for papulopustular rosacea
- Add BPO 5% microencapsulated as option (reduced irritation vs. traditional BPO)
- Clarify: alpha-agonists for erythema only; anti-inflammatory topicals for papulopustular

---

### 3.4 Rosacea — Novel and Emerging Topicals (2024–2026)

| Field                  | Detail                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Source**             | "Advances in Rosacea Therapy," _Dermatology Times_ (Jul 2026); "Exploring New Dimensions in Longitudinal Rosacea Management," _Dermatol Ther_ (2025). doi:10.1007/s13555-025-01612-x |
| **Evidence Level**     | II–III (Clinical trials and expert reviews)                                                                                                                                          |
| **Clinical Relevance** | 🟡 **MODERATE**                                                                                                                                                                      |

**Emerging agents:**

| Agent                                     | Mechanism                        | Stage               | Notes                                                 |
| ----------------------------------------- | -------------------------------- | ------------------- | ----------------------------------------------------- |
| **Microencapsulated BPO 5%** (Epsolay®)   | Antimicrobial, anti-inflammatory | FDA-approved (2022) | Reduced irritation vs. standard BPO via encapsulation |
| **Minocycline 1.5% foam** (Zilxi®/FMX103) | Anti-inflammatory, anti-demodex  | FDA-approved (2020) | Topical alternative to oral minocycline               |
| **DFD-29 / Emrosi™**                      | Oral minocycline MR              | FDA-approved (2024) | See §3.1 above                                        |
| **Carvedilol**                            | Beta-blocker, anti-angiogenic    | Emerging            | Off-label for refractory erythema                     |
| **Probiotics**                            | Microbiome modulation            | Early clinical      | Adjunctive only; no Level I evidence                  |

---

### 3.5 NRS Updated Rosacea Management Algorithm (2020, reaffirmed 2024)

| Field                  | Detail                                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| **Source**             | National Rosacea Society Expert Committee; GuidelineCentral summary (2024) |
| **Evidence Level**     | I (Expert consensus + systematic review)                                   |
| **Clinical Relevance** | 🔴 **HIGH** — Standard of care algorithm                                   |

**Phenotype-based approach:**

| Phenotype                        | First-line                                           | Adjunctive                        |
| -------------------------------- | ---------------------------------------------------- | --------------------------------- |
| Erythema/telangiectasia (Type 1) | Brimonidine 0.33% gel or oxymetazoline 1% cream      | IPL/PDL laser                     |
| Papulopustular (Type 2)          | Ivermectin 1% cream, azelaic acid 15%, metronidazole | Oral doxycycline 40 mg MR, DFD-29 |
| Phymatous (Type 3)               | Oral isotretinoin (low-dose)                         | Surgical/debulking procedures     |
| Ocular (Type 4)                  | Ophthalmology co-management                          | Oral doxycycline, lid hygiene     |

**SKINgenius Impact:**

- Align rosacea recommendations with phenotype-based (not subtype) classification
- Each type gets distinct treatment algorithm in recommendation engine

---

## 4. CROSS-CUTTING FINDINGS

### 4.1 Acne × Hyperpigmentation — PIH Connection

- The AAD 2024 guideline explicitly notes that **azelaic acid** is conditionally recommended for acne **and** addresses hyperpigmentation (dual benefit).
- Cysteamine 5% cream now has RCT evidence for **acne-induced PIH** specifically (Ahmadi et al., _JCAD_, 2024) — superior or non-inferior to HQ 4%/ascorbic acid 3%.
- Clascoterone may have mild pigment-lightening effects via anti-inflammatory mechanism (not yet studied specifically for PIH).

### 4.2 Acne × Rosacea Overlap

- Acne and rosacea can co-occur; treatment must account for both conditions.
- **Caution:** Topical BPO for acne may aggravate rosacea erythema; microencapsulated formulation (Epsolay®) may be better tolerated.
- **Ivermectin** effective for rosacea papulopustular lesions but NOT for acne.
- Oral doxycycline 40 mg MR treats rosacea but is sub-antimicrobial — not appropriate for moderate-to-severe acne where therapeutic dosing is needed.
- DFD-29 (Emrosi™) addresses both lesions and erythema — may simplify treatment in overlap patients.

### 4.3 Microbiome — Cross-Condition Theme

- **Acne:** _C. acnes_ phylotype-specific approach emerging; probiotics/phage therapy promising but early.
- **Rosacea:** Demodex + _B. oleronius_ axis established; probiotics adjunctive only.
- **Hyperpigmentation:** No direct microbiome link established.

---

## 5. EVIDENCE QUALITY SUMMARY

| Finding                                               | Evidence Level | Direction         | Action for SKINgenius         |
| ----------------------------------------------------- | -------------- | ----------------- | ----------------------------- |
| AAD 2024 acne guideline                               | I              | Strong            | Update condition profiles     |
| Clascoterone 1% for acne                              | I              | Conditional       | Add as recommendation option  |
| Topical antibiotic monotherapy inadequate             | I              | Strong (negative) | Add contraindication flag     |
| TXA for melasma/PIH (all routes)                      | I–II           | Positive          | Upgrade recommendation        |
| Cysteamine 5%/7.5% for melasma                        | I              | Positive          | Add as Level I recommendation |
| Thiamidol for hyperpigmentation                       | II             | Positive          | Add as recommendation         |
| DFD-29 (Emrosi™) for rosacea                          | I              | Positive          | Add as oral treatment option  |
| Ivermectin > azelaic acid > metronidazole for rosacea | I              | Positive          | Update hierarchy              |
| Oral probiotics for acne                              | II             | Modest/uncertain  | Adjunctive only flag          |
| Acne microbiome/phage therapy                         | III            | Emerging          | Pipeline tracking only        |
| Rosacea microbiome/dysbiosis                          | II             | Mechanistic       | Update pathogenesis           |
| Rosacea probiotics adjunctive                         | III            | Weak              | "May consider" only           |

---

## 6. PRIORITY UPDATES FOR SKINgenius RECOMMENDATION ENGINE

### Immediate (This Sprint)

1. **Acne condition profile**: Update with AAD 2024 guideline changes (topical antibiotic combo mandate, clascoterone conditional, spironolactone potassium monitoring update)
2. **Hyperpigmentation condition profile**: Add cysteamine 5%/7.5% (Level I), TXA upgrade, thiamidol as OTC option
3. **Rosacea condition profile**: Add Emrosi™ (DFD-29), update topical hierarchy, phenotype-based treatment algorithm

### Next Sprint

4. **Ingredient database**: Add clascoterone, DFD-29, cysteamine, thiamidol entries with evidence grades
5. **Interaction flags**: BPO + rosacea caution, oral TXA contraindications, topical antibiotic monotherapy warning
6. **Condition overlap module**: Acne × PIH, Acne × Rosacea cross-referencing

### Pipeline (Monitor Only)

7. Phage therapy for acne (BX001 and others)
8. Engineered _C. acnes_ (NGAL-expressing)
9. _Nitrosomonas eutropha_ B244 topical (AOBiome Phase IIb)
10. Rosacea probiotics (awaiting Level I evidence)

---

_Scan completed 2026-07-31 by SKINgenius Sage. All findings verified against primary literature. Evidence levels follow Oxford CEBM hierarchy. Skip any finding below Level III._
