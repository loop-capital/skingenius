# Training Data Sources Audit: Before/After Cosmetic Treatment Photos

> **Report Date:** 2026-06-10  
> **Author:** SKINgenius Research (Sage)  
> **Purpose:** Audit publicly available before/after photo datasets for AI treatment simulation training  
> **Status:** Complete — prioritized actionable sources identified

---

## Executive Summary

Building realistic AI treatment simulation requires **paired before/after images** of cosmetic procedures with consistent lighting, angles, and metadata. After auditing FDA documents, PubMed Central, open datasets, and web galleries, we found **no single large-scale, freely accessible, high-quality dataset** exists for this exact use case. The landscape is fragmented across:

- **FDA PMA documents** (hundreds of clinical photos, moderate quality, buried in PDFs)
- **Research datasets** (small, academic-focused, often surgical rather than injectable)
- **Web galleries** (massive volume, but inconsistent quality, scraping/legal concerns)
- **Open datasets** (very limited cosmetic treatment-specific data)

**Bottom line:** We will need a **multi-pronged data strategy** combining FDA document extraction, targeted PMC paper harvesting, and ethical web scraping — supplemented by synthetic data generation.

---

## 1. FDA Product Monographs & Clinical Study Documents

### 1.1 Juvéderm Family (AbbVie / Allergan Aesthetics)

| Product | FDA Approval | PMA Document | Photo Content |
|---------|-----------|--------------|---------------|
| **Juvéderm Voluma XC** | Oct 2013 (cheek); Jun 2020 (chin); Aug 2022 (temple) | [P110033 SSED PDF](https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033b.pdf) | Clinical study photos for mid-face volume correction. Figure 1 shows treated regions. Estimated **50-100 before/after pairs** in SSED. |
| **Juvéderm Volbella XC** | Jun 2016 (lips/perioral); Feb 2022 (infraorbital hollows) | [P110033/S018 PDF](https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S018b.pdf) | Lip augmentation and under-eye hollows. Estimated **30-50 pairs**. |
| **Juvéderm Vollure XC** | Mar 2017 | [P110033/S020 PDF](https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S020D.pdf) | Nasolabial folds. Estimated **40-60 pairs**. |
| **Juvéderm Ultra XC** | Jan 2010 (lips) | [P050047/S044 PDF](https://www.accessdata.fda.gov/cdrh_docs/pdf5/p050047s044c.pdf) | Lip augmentation. Estimated **30-50 pairs**. |
| **Juvéderm Volux XC** | Aug 2022 | [P110033/S065 PDF](https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S065B.pdf) | Jawline definition. Estimated **30-50 pairs**. |
| **Juvéderm Ultra Plus XC** | 2006 | [P050047 PDF](https://www.accessdata.fda.gov/cdrh_docs/pdf5/p050047c.pdf) | Facial wrinkles/folds. Estimated **40-60 pairs**. |

**Access Method:** `https://www.accessdata.fda.gov/cdrh_docs/pdf11/[PMA_NUMBER].pdf` — free, public domain government documents.

**Image Quality:** Moderate. Photos are embedded in PDFs, often compressed, sometimes grayscale. Standardized clinical photography protocols used (frontal, 3/4, profile views). Lighting is consistent within studies but varies across products.

**Metadata:** Treatment details (product, volume, injection sites), patient demographics (age, sex, Fitzpatrick skin type), timepoints (baseline, 1 month, 3 months, 6 months, 12 months), investigator/patient satisfaction scores.

**Legal/Licensing:** FDA SSED documents are public domain (U.S. government work). However, individual patient photos may have restrictions. Use for research/training likely permissible under fair use for transformative AI model development, but commercial deployment requires legal review.

**Estimated Total Juvéderm Pairs:** 200-370 pairs across all products.

---

### 1.2 Restylane Family (Galderma)

| Product | FDA Approval | Access | Photo Content |
|---------|-----------|--------|---------------|
| **Restylane Lyft** | Jun 2015 (cheek); May 2018 (hands); Nov 2018 (cannula) | Galderma clinical summaries, FDA SSED | Mid-face volume, dorsal hand. Estimated **40-60 pairs**. |
| **Restylane Silk** | 2014 | FDA SSED | Lip augmentation, perioral lines. Estimated **30-50 pairs**. |
| **Restylane Defyne** | Oct 2016 (NLF); Feb 2021 (chin) | FDA SSED | Nasolabial folds, chin augmentation. Estimated **40-60 pairs**. |
| **Restylane Refyne** | Oct 2016 | FDA SSED | Nasolabial folds. Estimated **30-50 pairs**. |
| **Restylane Contour** | Mar 2026 | FDA SSED | Temple hollowing. Estimated **20-30 pairs**. |
| **Restylane Eyelight** | 2023 | Galderma announcements | Under-eye. Limited photos in public docs. |

**Access Method:** Galderma publishes clinical summaries on `galderma.com/news/`. FDA SSEDs available via accessdata.fda.gov with PMA numbers.

**Estimated Total Restylane Pairs:** 160-250 pairs.

---

### 1.3 Botox Cosmetic (onabotulinumtoxinA) — AbbVie

| Indication | FDA Approval | Document | Photos |
|-----------|-----------|----------|--------|
| Glabellar lines | Apr 2002 | [Label PDF](https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/103000s5316s5319s5323s5326s5331lbl.pdf) | Limited. Label contains schematic diagrams, not patient photos. |
| Forehead lines | Oct 2013 | Same label | Limited patient photos in clinical sections. |
| Crow's feet | Sep 2013 | Same label | Limited. |
| Platysma bands | Oct 2024 | [Press release](https://news.abbvie.com/2024-10-18-BOTOX-R-Cosmetic...) | Clinical study photos in presentations. |

**Access Method:** FDA drug labels at accessdata.fda.gov. Clinical study photos are **NOT typically embedded** in drug labels (unlike device SSEDs). Botox is regulated as a drug, not a device, so PMA SSED with photos is not required.

**Photo Availability:** Very limited in public FDA documents. AbbVie publishes patient photos on `botoxcosmetic.com` and in clinical presentations at conferences (ASDS, AMWC).

**Estimated Botox Pairs from FDA:** <20 pairs.

---

### 1.4 Dysport (abobotulinumtoxinA) — Ipsen / Galderma

| Indication | FDA Approval | Document | Photos |
|-----------|-----------|----------|--------|
| Glabellar lines | Apr 2009 | [Label PDF](https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/125274s125lbl.pdf) | Limited in label. |

**Same limitation as Botox:** Regulated as drug, not device. Clinical photos not in FDA label. Ipsen publishes photos on dysport.com and in medical education materials.

**Estimated Dysport Pairs from FDA:** <10 pairs.

---

### 1.5 Sculptra (poly-L-lactic acid) — Galderma

| Indication | FDA Approval | Document | Photos |
|-----------|-----------|----------|--------|
| HIV lipoatrophy | Aug 2004 | [P030050 SSED](https://www.accessdata.fda.gov/cdrh_docs/pdf3/p030050s002b.pdf) | HIV-associated facial lipoatrophy. Estimated **50-80 pairs**. |
| Fine lines/wrinkles (cheek) | Apr 2023 | [P030050/S039 SSED](https://www.accessdata.fda.gov/cdrh_docs/pdf3/P030050S039B.pdf) | Cheek wrinkles in immunocompetent patients. Estimated **30-50 pairs**. |

**Access Method:** FDA device PMA documents. Sculptra is regulated as a device.

**Image Quality:** Moderate. Standardized clinical photography. HIV lipoatrophy photos show dramatic volume loss → restoration, but this population differs from typical aesthetic patients.

**Estimated Sculptra Pairs:** 80-130 pairs.

---

### 1.6 FDA Summary: Total Estimated Photo Pairs

| Source Category | Estimated Pairs | Quality | Accessibility |
|-----------------|-----------------|---------|---------------|
| Juvéderm SSEDs | 200-370 | Moderate | High (free PDFs) |
| Restylane SSEDs | 160-250 | Moderate | High (free PDFs) |
| Botox labels | <20 | Low | High (free PDFs) |
| Dysport labels | <10 | Low | High (free PDFs) |
| Sculptra SSEDs | 80-130 | Moderate | High (free PDFs) |
| **TOTAL FDA** | **~470-780** | **Moderate** | **High** |

**Critical Gap:** Botulinum toxin photos are severely underrepresented in FDA documents because they are regulated as drugs, not devices. The majority of FDA photos are for dermal fillers (devices).

---

## 2. PubMed Central (PMC) Open Access Papers

### 2.1 Search Strategy & Findings

We searched for:
- MeSH terms: "Dermal Fillers/therapeutic use" AND "Photography/methods"
- Journals: Aesthetic Surgery Journal, Plastic & Reconstructive Surgery, Dermatologic Surgery
- Keywords: "before and after," "clinical photographs," "photographic assessment"

**Result:** Very few PMC papers contain downloadable high-resolution before/after images. Most figures are:
- Low-resolution (72-150 DPI, suitable for print only)
- Heavily compressed
- Often just 1-2 example cases per paper
- Copyrighted by publishers (Elsevier, Wiley, Oxford) even in "open access" articles

### 2.2 Notable PMC Articles with Images

| Paper | Journal | Year | Images | URL |
|-------|---------|------|--------|-----|
| "Efficacy and safety of a new resilient HA dermal filler" | PMC / J Cosmet Dermatol | 2020 | Before/after nasolabial folds | [PMC7384057](https://pmc.ncbi.nlm.nih.gov/articles/PMC7384057/) |
| "One-Year Safety Evaluation of New HA Fillers" | PMC / J Cosmet Dermatol | 2024 | Limited clinical photos | [PMC11288390](https://pmc.ncbi.nlm.nih.gov/articles/PMC11288390/) |
| "Evaluating HA dermal fillers: critique of characterization" | PMC / J Cosmet Dermatol | 2022 | Some filler comparison photos | [PMC9285697](https://pmc.ncbi.nlm.nih.gov/articles/PMC9285697/) |
| "Adverse effects of aesthetic use of botulinum toxin and dermal fillers" | PMC / J Cosmet Dermatol | 2024 | Complication photos (not ideal for training) | [PMC11745296](https://pmc.ncbi.nlm.nih.gov/articles/PMC11745296/) |

**Estimated PMC Photo Pairs:** 50-100 pairs across all accessible articles.

**Quality:** Variable. Some figures are high-quality clinical photos; others are low-res composites.

**Legal:** PMC articles are NIH-funded open access (CC-BY or public domain). Publisher copyright applies to figures in non-NIH-funded articles even if full text is on PMC.

**Accessibility:** Medium. Requires manual extraction from PDFs. No bulk download API for figures.

---

### 2.3 Aesthetic Surgery Journal (ASJ) / Oxford Academic

- **Open Access Policy:** Offers open access publishing option (author pays ~$3,000-4,000). Most articles are paywalled.
- **Photo Content:** Extensive before/after figures in cosmetic surgery papers.
- **Volume:** ~200-300 aesthetic papers/year, maybe 20-30% with before/after photos.
- **Access:** Individual articles ~$40-50 each. Institutional subscription required.
- **Estimated Pairs:** 200-400 pairs if full archive accessed (cost-prohibitive for MVP).

---

### 2.4 Journal of Plastic, Reconstructive & Aesthetic Surgery (JPRAS)

- **Open Access:** `JPRAS Open` is fully open access. Main JPRAS is hybrid.
- **Content:** Reconstructive-heavy, but aesthetic section growing.
- **Estimated Pairs from JPRAS Open:** 50-100 pairs.

---

## 3. Open Datasets

### 3.1 Academic/Research Datasets

| Dataset | Size | Content | Quality | URL | License |
|---------|------|---------|---------|-----|---------|
| **IIITD Plastic Surgery Face Database** | 1,800 images (900 subjects) | Before/after facial plastic surgery (rhinoplasty, facelift, blepharoplasty) | High — controlled illumination, neutral expression | [NIST BDbC #327](https://tsapps.nist.gov/BDbC/Search/Details/327) | Research use (contact IIITD) |
| **Botox Before & After (Kaggle)** | ~50-100 patients | Same individuals before/after Botox | Moderate — real-world photos | [Kaggle](https://www.kaggle.com/datasets/trainingdatapro/botox-injections-before-and-after) | Unknown (Kaggle terms) |
| **Botox Before & After (Hugging Face)** | ~50-100 patients | Same as Kaggle, mirrored | Moderate | [Hugging Face](https://huggingface.co/datasets/UniqueData/botox-injections-before-and-after) | Unknown |
| **Makeup Detection Dataset** | ~1,000+ pairs | Before/after makeup (NOT medical) | Moderate — makeup, not injectables | [Hugging Face](https://huggingface.co/datasets/TrainingDataPro/makeup-detection-dataset) | CC or similar |
| **Figaro-tresses (Mendeley)** | Hair tresses, 3 timepoints | Cosmetic hair treatment (NOT facial) | High — controlled | [Mendeley](https://data.mendeley.com/datasets/37dkygd6sm/1) | CC-BY |
| **Skin Disease Datasets** | 1,000-35,000 images | Skin conditions (acne, eczema, etc.) | Variable | Kaggle/Hugging Face | Variable |

### 3.2 Key Finding: No Dedicated Cosmetic Injectable Dataset

**There is currently NO large, publicly available dataset specifically for cosmetic injectable before/after photos.** The closest is:
- IIITD Plastic Surgery Database (surgical, not injectable)
- Small Kaggle Botox dataset (uncertain quality/licensing)

### 3.3 Synthetic Data Generation (Important Gap-Filler)

Given the scarcity of real paired data, **synthetic data generation** is a viable complement:
- **3D morphable face models** + simulation of filler volume addition
- **GAN-based aging/rejuvenation** models (e.g., StyleGAN modifications)
- **Physics-based simulation** of HA filler injection (finite element modeling)

Research reference: "Machine Learning Approaches for Prediction of Facial Rejuvenation Using Real and Synthetic Data" (IEEE Access 2019) — developed Rejuv3DNet with synthetic 3D face cosmetic dataset.

---

## 4. Web Sources

### 4.1 RealSelf

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://www.realself.com/photos` |
| **Volume** | **500,000+ before/after photos** across all procedures |
| **Treatment Types** | Botox, fillers (Juvederm, Restylane, Sculptra), lasers, facelifts, etc. |
| **Quality** | Highly variable. Professional clinic photos mixed with user-submitted phone photos. Lighting, angle, resolution inconsistent. |
| **Metadata** | Procedure type, provider, cost, review text, patient age (sometimes), time since procedure |
| **Access** | Public web browsing. No official API. Scraping violates ToS. |
| **Legal** | Photos are user-submitted or provider-submitted with patient consent. RealSelf claims copyright on gallery presentation. Scraping for commercial AI training is legally risky. |
| **Ethical** | Using patient photos without explicit consent for AI training raises HIPAA-adjacent privacy concerns even if photos are public. |

**Assessment:** Massive volume but **not suitable for direct training data extraction** without partnership or explicit licensing agreement.

---

### 4.2 ASPS Photo Gallery

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://www.plasticsurgery.org/photo-gallery` |
| **Volume** | Thousands of photos from ASPS member surgeons |
| **Quality** | Higher than RealSelf — professional clinical photography standards |
| **Access** | Public browsing. Free account required for full gallery. |
| **Legal** | Photos submitted by surgeons with patient consent. ASPS copyright applies. |

---

### 4.3 The Aesthetic Society

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://www.theaestheticsociety.org/` |
| **Volume** | Photos from 2,200+ surgeons |
| **Quality** | Professional clinical photography |
| **Access** | Public browsing |

---

### 4.4 Manufacturer Websites

| Manufacturer | URL | Content | Quality |
|-------------|-----|---------|---------|
| **Allergan Aesthetics** | `botoxcosmetic.com`, `juvederm.com` | Patient before/after galleries | High — professional photos |
| **Galderma** | `restylaneusa.com`, `sculptrausa.com` | Patient results galleries | High — professional photos |
| **Merz Aesthetics** | `merzaesthetics.com` | Before/after for Xeomin, Radiesse, Belotero | High — professional photos |

**Volume:** Each manufacturer has 50-200 example photos per product.
**Legal:** Copyrighted by manufacturers. Patient consent obtained for marketing. Using for AI training without license is infringement risk.

---

### 4.5 Individual Clinic Websites

Top clinic chains (e.g., LaserAway, Ideal Image, Sono Bello) publish before/after galleries:
- Volume: 10-100 photos per clinic
- Quality: Variable
- Legal: Same concerns as RealSelf

---

## 5. Priority Ranking: Quality × Volume × Accessibility

### Tier 1: Immediate Action (High Value, Accessible)

| Rank | Source | Est. Pairs | Quality | Accessibility | Action |
|------|--------|-----------|---------|---------------|--------|
| 1 | **FDA SSED Documents (Juvéderm + Restylane + Sculptra)** | 470-780 | Moderate | High (free PDFs) | Extract images from PDFs using Python (PyMuPDF/pdf2image). Public domain. |
| 2 | **PMC Open Access Papers** | 50-100 | Variable | Medium (manual) | Batch download PDFs, extract figures. Focus on CC-BY articles. |
| 3 | **IIITD Plastic Surgery Database** | 900 subjects | High | Medium (request access) | Contact IIITD for research use agreement. Surgical, not injectable, but useful for facial feature change modeling. |

### Tier 2: Moderate Effort (Good Value, Some Barriers)

| Rank | Source | Est. Pairs | Quality | Accessibility | Action |
|------|--------|-----------|---------|---------------|--------|
| 4 | **Kaggle Botox Dataset** | 50-100 | Moderate | High | Download and evaluate. Verify licensing. |
| 5 | **Manufacturer Websites (Allergan, Galderma, Merz)** | 200-600 | High | High (public) | Do NOT scrape. Contact for partnership/licensing. Or use as reference for synthetic data generation. |
| 6 | **ASPS / Aesthetic Society Galleries** | 1,000+ | High | Medium (account required) | Review terms of use. Potential partnership. |

### Tier 3: High Effort / Legal Risk (Large Volume, Problematic)

| Rank | Source | Est. Pairs | Quality | Accessibility | Action |
|------|--------|-----------|---------|---------------|--------|
| 7 | **RealSelf** | 500,000+ | Highly variable | High (public) | **Do NOT scrape without legal agreement.** Consider partnership for anonymized dataset. |
| 8 | **Individual Clinic Websites** | 10,000+ | Variable | Medium | Same legal concerns. Not recommended for direct use. |

### Tier 4: Synthetic / Complementary

| Rank | Source | Est. Pairs | Quality | Accessibility | Action |
|------|--------|-----------|---------|---------------|--------|
| 9 | **Synthetic Data Generation (3D morphable models + GANs)** | Unlimited | High (if well-designed) | High | Develop in-house pipeline. Reference: Rejuv3DNet paper. |
| 10 | **Aesthetic Surgery Journal Archive** | 200-400 | High | Low (paywalled) | Evaluate subscription cost vs. value. $40-50/article. |

---

## 6. Legal & Licensing Considerations

### 6.1 Public Domain / Government Works
- **FDA SSED documents:** Public domain. Photos within them are technically public domain IF taken by government employees or contractors working for the government. However, many FDA photos are submitted by manufacturers and may retain copyright.
- **Safe approach:** Use for research and model development. Seek legal review before commercial deployment.

### 6.2 Creative Commons (CC-BY)
- **PMC articles:** CC-BY licensed figures can be used with attribution.
- **Action:** Filter PMC search to "Open Access" + "CC-BY" only.

### 6.3 Copyrighted / Commercial
- **Manufacturer galleries, RealSelf, clinic websites:** Copyrighted. Patient consent does NOT equal copyright license for AI training.
- **Risk:** Copyright infringement lawsuits, privacy violations, reputational damage.
- **Recommendation:** Obtain explicit licensing agreements or use only for reference (not training).

### 6.4 Patient Privacy (HIPAA-Adjacent)
- Even public photos on RealSelf/clinic sites may be subject to state privacy laws.
- De-identification is not sufficient if photos are recognizable.
- **Recommendation:** Consult healthcare privacy attorney before using any patient photos.

---

## 7. Recommended Data Strategy

### Phase 1: Foundation (Weeks 1-2)
1. **Extract FDA SSED photos** — target 500+ pairs from Juvéderm, Restylane, Sculptra documents.
2. **Download PMC CC-BY articles** — target 50+ papers with before/after figures.
3. **Request IIITD database** — apply for research access.
4. **Evaluate Kaggle Botox dataset** — assess quality and licensing.

**Expected yield:** 600-900 real before/after pairs.

### Phase 2: Augmentation (Weeks 3-4)
5. **Synthetic data pipeline** — generate 1,000+ synthetic pairs using 3D morphable models.
6. **Contact manufacturers** — explore partnership/licensing for high-quality clinical photos.
7. **Contact RealSelf** — explore data partnership or API access.

### Phase 3: Scale (Ongoing)
8. **Build annotation pipeline** — label treatment type, facial region, severity grade, timepoint.
9. **Quality control** — ensure consistent lighting, angle, resolution. Reject low-quality pairs.
10. **Continuous monitoring** — scan new PMC papers, FDA approvals for fresh data.

---

## 8. Key Metrics & Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Real before/after pairs** | 1,000+ | Minimum viable for deep learning |
| **Synthetic pairs** | 5,000+ | Augment real data, cover edge cases |
| **Treatment types covered** | 6+ | Botox, Juvederm, Restylane, Sculptra, Dysport, laser |
| **Facial regions** | 8+ | Forehead, glabella, crow's feet, cheeks, lips, NLF, jawline, temples |
| **Fitzpatrick skin types** | I-VI | Ensure diverse skin tones |
| **Image resolution** | ≥512×512 px | Minimum for AI model input |
| **Consistent metadata** | 100% | Treatment type, timepoint, demographics |

---

## 9. Critical Gaps & Risks

### 9.1 Botulinum Toxin Photo Gap
- **Problem:** Botox/Dysport/Xeomin before/after photos are scarce in FDA documents (regulated as drugs).
- **Mitigation:** Target PMC papers on botulinum toxin efficacy (Carruthers et al. papers in Dermatologic Surgery). Explore manufacturer clinical presentations.

### 9.2 Temporal Consistency Gap
- **Problem:** Most photos are single timepoint (before + after). Few have intermediate timepoints (1 week, 1 month, 3 months).
- **Mitigation:** Time-series modeling may require synthetic interpolation.

### 9.3 Skin Tone Diversity Gap
- **Problem:** FDA clinical trials historically underrepresent darker skin tones (Fitzpatrick IV-VI).
- **Mitigation:** Prioritize PMC papers and datasets with diverse populations. Synthetic data can augment but must be validated.

### 9.4 Legal Risk
- **Problem:** Using patient photos for AI training without explicit consent is legally untested territory.
- **Mitigation:** Use public domain FDA photos + CC-BY research images + fully synthetic data as primary sources. Obtain legal counsel before any commercial deployment.

---

## 10. Appendix: Key URLs & References

### FDA Documents
- FDA Approved Dermal Fillers: `https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/fda-approved-dermal-fillers`
- FDA AccessData (search PMA): `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm`
- Drugs@FDA (Botox labels): `https://www.accessdata.fda.gov/scripts/cder/daf/`

### Research Databases
- PubMed Central: `https://pmc.ncbi.nlm.nih.gov/`
- ClinicalTrials.gov: `https://clinicaltrials.gov/`
- NIST Biometric Database Catalog: `https://tsapps.nist.gov/BDbC/`

### Open Datasets
- Kaggle Botox Dataset: `https://www.kaggle.com/datasets/trainingdatapro/botox-injections-before-and-after`
- Hugging Face Botox Dataset: `https://huggingface.co/datasets/UniqueData/botox-injections-before-and-after`
- IIITD Database info: `https://tsapps.nist.gov/BDbC/Search/Details/327`

### Web Galleries
- RealSelf: `https://www.realself.com/photos`
- ASPS Gallery: `https://www.plasticsurgery.org/photo-gallery`
- Aesthetic Society: `https://www.theaestheticsociety.org/`

### Key Papers
1. Singh et al. "Machine Learning Approaches for Prediction of Facial Rejuvenation Using Real and Synthetic Data." *IEEE Access*, 2019.
2. Bhatt et al. "Matching Before and After Surgery Faces." *Procedia Computer Science*, 2018.
3. Arxiv paper: "Automated Assessment of Aesthetic Outcomes in Facial Plastic Surgery" (2025) — used Instagram photos with IRB approval.

---

## 11. Next Steps for SKINgenius

1. **Assign Dev agent** to build FDA PDF image extraction pipeline (PyMuPDF + pdf2image).
2. **Assign Research agent** to batch-download PMC CC-BY aesthetic papers and extract figures.
3. **Contact IIITD** for Plastic Surgery Face Database research use agreement.
4. **Legal review** — have attorney assess FDA photo use for commercial AI training.
5. **Synthetic data R&D** — prototype 3D morphable model pipeline for filler simulation.
6. **Manufacturer outreach** — draft partnership proposal for Allergan/Galderma photo licensing.

---

*Report prepared by SKINgenius Research (Sage) | 2026-06-10*  
*For questions or updates, contact skingenius-ceo (Nova)*
