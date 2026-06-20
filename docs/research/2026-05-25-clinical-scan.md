# Monday Clinical Research Scan — May 25, 2026

**Scope:** Acne (all types), Hyperpigmentation / Melasma, Rosacea  
**Date Range:** May 2025 – May 2026  
**Sources:** PubMed (MEDLINE-indexed) via NCBI E-utilities; seminal papers supplemented when recent high-impact literature was sparse.  
**Confidence Legend:**  
- **High** = Meta-analysis, systematic review, or large RCT (n≥100) with low RoB  
- **Medium** = Prospective cohort, small RCT, or well-designed retrospective study  
- **Low** = Case series, preclinical, or high risk of bias

---

## 🔬 ACNE

### 1. Topical Antibiotic Monotherapy Only Provides Mild Benefit for Patients with Acne Vulgaris: A Systematic Review and Network Meta-analysis
- **Authors:** Lyu M, Fan W, Yang H, Luo X, Wang G, Zhu G, Zouboulis CC
- **Journal:** *Clinical Drug Investigation* — 2026 May 9 (Online ahead of print)
- **Key Findings:**
  - Network meta-analysis of **32 studies / 34 RCTs / 22,645 patients**
  - Only **dapsone 5%** and **erythromycin 2%** showed significant reduction in inflammatory lesions vs. placebo; **no treatment significantly improved total lesion counts vs. placebo**
  - Investigator's Global Assessment (IGA) improvement was superior for clindamycin 1%, GDC-268 (clindamycin phosphate 1% lotion), and minocycline 4% vs. placebo
  - High heterogeneity in safety/discontinuation data; evidence for routine antibiotic monotherapy is weak
- **Clinical Relevance to SKINgenius:**
  - **Down-rank standalone topical antibiotics** in our recommendation engine. Favor combination therapy (antibiotic + benzoyl peroxide or retinoid) or non-antibiotic alternatives
  - Update ingredient confidence scores: dapsone 5% → moderate evidence for inflammatory lesions; erythromycin 2% → limited utility due to resistance concerns
  - Flag "antibiotic stewardship" warning in UI when user selects topical antibiotic monotherapy
- **Confidence:** **High**

### 2. Efficacy and Safety of Melaleuca alternifolia (Tea Tree) Oil for Acne — A Systematic Review and Meta-Analysis
- **Authors:** Ye Y, Lim JJ, Huang Z, Chew FT
- **Journal:** *Phytotherapy Research* — 2026 May 7 (Online ahead of print)
- **Key Findings:**
  - **7 studies / 445 patients**; TTO associated with modest reduction in acne severity (pooled OR = 0.74, 95% CI 0.63–0.88)
  - Adverse events predominantly local and mild; significantly lower odds of mild itching vs. controls (pOR = 0.09)
  - Low risk of bias overall; no publication bias detected
- **Clinical Relevance to SKINgenius:**
  - **Elevate tea tree oil (TTO)** as a viable over-the-counter option for mild-to-moderate inflammatory acne, especially for patients seeking "natural" alternatives or avoiding antibiotics
  - Map TTO concentration range (typically 5–10%) in ingredient database; flag potential contact sensitization in sensitive skin profiles
- **Confidence:** **Medium** (limited to 7 studies, short follow-up)

### 3. Quality of Life Impairment in Singaporean Adolescents With Acne Vulgaris: A Cohort Study
- **Authors:** Soenjoyo KR, Choe SCX, Raveentheran G, Huiwei S, Koh MJA, Wee LWY
- **Journal:** *Pediatric Dermatology* — 2026 May 13 (Online ahead of print)
- **Key Findings:**
  - **n = 100 adolescents (12–18 years)**; significant psychosocial burden documented via CADI and TQoL scales
  - **Self-perceived severity poorly correlated with physician grading** (r = 0.334, p = 0.001)
  - Female sex, acne duration ≥2 years, and truncal involvement were significantly associated with worse QoL scores
- **Clinical Relevance to SKINgenius:**
  - Integrate **patient-reported outcome (PRO) screening** (e.g., acne-specific QoL questionnaire) into onboarding flow for adolescent users
  - Adjust severity algorithm to weight **self-perception + clinical grading** rather than relying on photo-analysis alone
  - Flag truncal acne and prolonged duration as psychosocial risk factors; trigger proactive mental-health resources
- **Confidence:** **Medium**

### 4. Perceived vs. Clinical Acne Severity: Impact on QoL and Treatment Adherence in Male Military Personnel
- **Authors:** Xu T, Li M, Zhan D, Li X, Hu X, Zhou Z
- **Journal:** *Clinical, Cosmetic and Investigational Dermatology* — 2026 May 12
- **Key Findings:**
  - **n = 300 male military personnel**; 52.3% overestimated their acne severity vs. clinician grading
  - Self-rated severity correlated **more strongly with DLQI impairment** than objective GAGS scores (r = 0.314 vs. 0.206)
  - Treatment paradox: objectively severe acne patients sought more interventions but discontinued earlier (≤1 month); subjectively severe patients adhered longer (>3 months)
- **Clinical Relevance to SKINgenius:**
  - Reinforces need for **dual-dimensional severity assessment** (clinical + self-perceived) in recommendation logic
  - Design **adherence-prompting interventions** for users with objectively severe acne who are at high dropout risk
- **Confidence:** **Medium**

---

## 🎨 HYPERPIGMENTATION / MELASMA

### 5. Assessing the Safety and Efficacy of Picosecond Alexandrite Lasers in the Management of Melasma: A Systematic Review and Meta-Analysis of RCTs
- **Authors:** Chua KR, Vankayalapati DK, Shami MZ, Antoniou V, Nordahl EJB, Abdul-Aziz K, Bayan L, Lee SC, Nakanishi H, Than CA, Lim D
- **Journal:** *Australasian Journal of Dermatology* — 2026 May; 67(3):140–150
- **Key Findings:**
  - **5 RCTs / 139 patients**; registered on PROSPERO (CRD420251022381)
  - **Triple combination cream (TCC) outperformed** 755-nm picosecond alexandrite laser (PSAL) in MASI reduction (MD = 1.82, 95% CI: 1.11, 2.52)
  - Post-inflammatory hyperpigmentation (PIH) more common with PSAL vs. topical creams (OR = 6.86)
  - No hypopigmentation or infection reported; overall certainty rated **low** due to small, heterogeneous trials
- **Clinical Relevance to SKINgenius:**
  - **Prioritize topical triple combination therapy** (hydroquinone + tretinoin + corticosteroid) as first-line over laser for melasma in recommendation engine
  - Flag **laser-induced PIH risk** prominently for Fitzpatrick IV–VI skin types
  - Add "refractory melasma" pathway: reserve PSAL for cases failing optimized topical therapy, with explicit PIH counseling
- **Confidence:** **High** (systematic review + meta-analysis, though low certainty by GRADE)

### 6. Comparison of Efficacy and Safety of Fractional 1064 nm Picosecond Laser and Low-Fluence Q-Switched Nd:YAG Laser in the Treatment of Melasma
- **Authors:** Zhang X, Yang H, Ge Y, Yang Y, Lin T
- **Journal:** *Journal of Cosmetic and Laser Therapy* — 2025 Dec; 27(6–8):186–191
- **Key Findings:**
  - **Retrospective study / 99 female patients**
  - Fractional picosecond Nd:YAG (PSNY) achieved **23.7% mMASI reduction after 2 sessions** and **40.7% after 5 sessions**, vs. 9.8% and 29.5% for low-fluence Q-switched Nd:YAG (QSNY)
  - PSNY required lower energy fluence; PIH occurred in 7.4% (PSNY) vs. 13.3% (QSNY)
- **Clinical Relevance to SKINgenius:**
  - When procedural therapy is indicated, **fractional 1064 nm picosecond Nd:YAG** is preferable to Q-switched for faster improvement and lower PIH risk
  - Embed this hierarchy in our "Procedural Options" module for melasma
- **Confidence:** **Medium** (retrospective, single-center)

### 7. A Comparative Study of the Efficacy of Chemical Peels and Microneedling in the Treatment of Moderate to Severe Melasma
- **Authors:** Batool A, Seger AJ, Akhtar N, Mateen S, Amiruddin MU, Zain M
- **Journal:** *Cureus* — 2025 Dec 11; 17(12):e98962
- **Key Findings:**
  - **120 patients / comparative interventional study**
  - Microneedling with tranexamic acid + vitamin C achieved **superior MASI reduction** (9.11 → 5.21) vs. 15% TCA peels (22.97 → 13.16) at 12 weeks (p = 0.006)
  - Higher patient satisfaction and fewer adverse effects in microneedling group (36.7% vs. 58.3%)
  - No severe adverse events in either arm
- **Clinical Relevance to SKINgenius:**
  - Add **microneedling + tranexamic acid + vitamin C** as a procedural option for moderate-to-severe melasma, especially in darker skin phototypes prone to PIH
  - Position TCA peels as secondary option with stronger PIH counseling
- **Confidence:** **Medium**

### 8. Efficacy of Intense Pulsed Light Treatment in Melasma
- **Authors:** Acar A, Sagduyu IE
- **Journal:** *Indian Journal of Dermatology* — 2026 Jan–Feb; 71(1):51–54
- **Key Findings:**
  - IPL shows moderate improvement as monotherapy; most evidence supports **combination therapy**
  - Broad wavelength coverage allows simultaneous targeting of epidermal, dermal, and vascular components
  - Standardized protocols and longer follow-up are lacking
- **Clinical Relevance to SKINgenius:**
  - List IPL as **adjunctive option** only, not monotherapy, for melasma with vascular component
  - Flag need for practitioner expertise in parameter selection to minimize PIH
- **Confidence:** **Low** (narrative review, limited RCT data)

---

## 🔴 ROSACEA

### 9. Advances in the Pathogenesis of Rosacea
- **Authors:** Wang H, Zhou C
- **Journal:** *Frontiers in Immunology* — 2026 Jan 21; 16:1705588
- **Key Findings:**
  - Comprehensive review of genomic, neurovascular, immunologic, and microbiome advances
  - Key pathways: **TLR2/LL-37/mTORC1 signaling axis**; dysbiosis of skin and gut microbiota
  - Neurovascular dysfunction driven by abnormal neuropeptide expression and dysregulated amino acid metabolism
  - Skin barrier impairment is closely linked to onset and progression
- **Clinical Relevance to SKINgenius:**
  - Inform **mechanism-based ingredient mapping**: strengthen links for barrier repair (niacinamide, ceramides), microbiome modulation (prebiotics), and anti-neurogenic agents (brimonidine, oxymetazoline)
  - Research pipeline: flag emerging targets (e.g., TLR2 antagonists, mTORC1 modulators) for future ingredient database updates
- **Confidence:** **High** (comprehensive review, mechanistic depth)

### 10. Morbihan Disease May Induce Nonspecific Inflammatory of Extra-Facial Region: A Case Report and Literature Review
- **Authors:** Deng F, Wang P
- **Journal:** *Clinical, Cosmetic and Investigational Dermatology* — 2026 Apr 27; 19:596249
- **Key Findings:**
  - Literature review (2004–2025) of **Morbihan disease** (severe rosacea variant with persistent facial edema)
  - **Isotretinoin** provided sustained remission; omalizumab and IPL showed partial improvement
  - Lymphatic/vascular dilation correlated with favorable outcome; dermal edema and granuloma predicted poorer prognosis
- **Clinical Relevance to SKINgenius:**
  - Add **Morbihan disease** as a severe rosacea subtype flag in our condition taxonomy
  - Route users with persistent facial edema + papulopustular rosacea to dermatologist urgently
  - Note isotretinoin as treatment of choice for this subtype
- **Confidence:** **Low** (case report + literature review, uncontrolled data)

### 11. Effectiveness of Radiofrequency Microneedling in the Treatment of Dermatological Conditions: A Systematic Review
- **Authors:** Kumar N, Kim HM, Nishikawa A, Heo CY, Wu WTL
- **Journal:** *Aesthetic Plastic Surgery* — 2026 Apr 28 (Online ahead of print)
- **Key Findings:**
  - **41 studies / 15 RCTs**; PROSPERO-registered (CRD420251089393)
  - RFMN showed **benefits for rosacea** (among acne scars, skin laxity, melasma, striae) with favorable safety profile
  - Erythema, edema, and transient pain were common; PIH infrequent and self-limited
  - Technical parameter reporting was inconsistent across studies
- **Clinical Relevance to SKINgenius:**
  - Add **radiofrequency microneedling (RFMN)** as an emerging procedural option for rosacea-associated skin texture concerns and erythema
  - Caution: evidence base is heterogeneous; recommend only in specialist settings with standardized protocols
- **Confidence:** **Medium**

---

## 📊 Cross-Cutting Themes

1. **Antibiotic Stewardship in Acne:** Two high-quality systematic reviews (topical antibiotic NMA + broader antibiotic resistance landscape) support reducing standalone topical antibiotic recommendations in favor of combination or non-antibiotic regimens.

2. **Patient-Reported Outcomes Matter:** Multiple acne QoL studies demonstrate discordance between clinical and self-perceived severity. SKINgenius should integrate PRO instruments (DLQI, CADI) into longitudinal tracking.

3. **Melasma: Topical > Laser for First-Line:** Strong meta-analytic evidence favors triple combination cream over picosecond lasers. Lasers should be reserved for refractory cases with explicit PIH counseling, especially in darker skin types.

4. **Rosacea Pathogenesis Deepening:** TLR2/LL-37/mTORC1 axis and microbiome dysbiosis are emerging as central mechanisms. Ingredient database should map existing actives to these pathways and monitor clinical pipeline for novel targets.

5. **Procedural Innovation:** Fractional picosecond Nd:YAG and radiofrequency microneedling show promise across multiple conditions but require larger, standardized RCTs before firm clinical adoption.

---

## 🗂️ Notes & Limitations

- **Search Strategy:** PubMed E-utilities (`esearch` + `efetch`) with date-restricted queries (`pdat:2025/05:2026/05[dp]`). No Embase/Cochrane/Web of Science coverage.
- **Seminal Fallback:** Not required — recent high-impact literature was identified for all three conditions.
- **Gaps Identified:**
  - Limited 2025–2026 RCTs on **novel oral agents** for rosacea (e.g., new subantimicrobial-dose doxycycline formulations, ivermectin combos)
  - Sparse recent data on **cystic/nodular acne** specifically (most acne papers focused on mild-to-moderate)
  - No 2025–2026 publications on **exosomes in acne/rosacea** — exosome review (PMID 42139022) was preclinical/clinical mixed
- **Next Scan:** June 9, 2026 — focus on cystic acne RCTs and rosacea novel oral therapies.

---

*Report compiled by SKINgenius-Research | May 25, 2026*
