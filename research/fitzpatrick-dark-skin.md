# Fitzpatrick Skin Types & Darker Skin Tones — SKINgenius Research Report

**Research Date:** 2026-05-14  
**Author:** Sage (skingenius-research)  
**Scope:** Clinical dermatology, skin-of-color research, AI vision pipeline considerations  
**Status:** Complete  
**Related:** `docs/conditions/skin-conditions.md`, `concepts/ai-pipeline.md`, `concepts/ingredient-database.md`  

---

## Table of Contents

1. [Fitzpatrick Skin Type Classification](#1-fitzpatrick-skin-type-classification)
2. [Conditions More Common in Darker Skin](#2-conditions-more-common-in-darker-skin)
3. [Conditions That Present Differently on Dark Skin](#3-conditions-that-present-differently-on-dark-skin)
4. [Ingredients to Use with Caution on Dark Skin](#4-ingredients-to-use-with-caution-on-dark-skin)
5. [Ingredients Particularly Beneficial for Darker Skin](#5-ingredients-particularly-beneficial-for-darker-skin)
6. [AI Detection Challenges for Darker Skin Tones](#6-ai-detection-challenges-for-darker-skin-tones)
7. [Clinical References](#7-clinical-references)

---

## 1. Fitzpatrick Skin Type Classification

### The Scale (I–VI)

The Fitzpatrick phototype scale, developed by Dr. Thomas B. Fitzpatrick in 1975, classifies skin by its **response to UV exposure** — specifically the propensity to tan or burn. It remains the standard clinical reference for assessing photosensitivity, skin cancer risk, and treatment planning.

| Type | UV Response | Typical Features | Melanin Content | Cancer Risk | Photosensitivity |
|------|-------------|-----------------|-----------------|-------------|-----------------|
| **I** | Always burns, never tans | Very pale white skin; red or blonde hair; light eyes; freckles | Very low (eumelanin:pheomelanin ratio ~1:4) | Very high | Extreme |
| **II** | Usually burns, tans minimally | Fair skin; light hair; blue or green eyes | Low | High | High |
| **III** | Sometimes burns, tans gradually | Medium skin tone; darker hair; any eye color | Moderate | Moderate | Moderate |
| **IV** | Burns minimally, tans well | Olive/light brown skin; dark hair; brown eyes | Moderate-high | Lower | Low-moderate |
| **V** | Rarely burns, tans darkly | Brown skin; dark hair; brown eyes | High | Low | Low |
| **VI** | Never burns, deeply pigmented | Dark brown/black skin; black hair; dark brown eyes | Very high | Very low | Minimal |

### Melanin Content Correlation

- **Melanocytes are present in roughly equal numbers across all Fitzpatrick types** (~1,000–2,000 per mm²)
- The difference is in **melanosome size, density, and distribution**:
  - **Fitzpatrick I–III:** Smaller, less dense melanosomes; clustered in keratinocytes (grouped)
  - **Fitzpatrick IV–VI:** Larger, denser melanosomes; distributed singly throughout keratinocytes
- **Fitzpatrick VI** has up to **10× more melanin per cell** than Fitzpatrick I
- **Eumelanin** (brown-black, photoprotective) predominates in darker skin; **pheomelanin** (red-yellow, photoreactive) predominates in lighter skin

### Photosensitivity Differences

| Factor | Light Skin (I–III) | Dark Skin (IV–VI) |
|--------|-------------------|-------------------|
| **SPF of melanin** | Equivalent to ~SPF 3–5 | Equivalent to ~SPF 13–15 |
| **DNA damage after UV** | Higher | Lower |
| **Photocarcinogenesis risk** | High | Very low (but not zero) |
| **Photoaging (wrinkles)** | Prominent | Delayed; textural changes more common than wrinkling |
| **UVB MED (minimal erythema dose)** | 15–30 mJ/cm² | 60–200+ mJ/cm² |
| **Vitamin D synthesis** | Efficient | Reduced — requires longer sun exposure |

### Clinical Caveats
- The Fitzpatrick scale is **not a perfect proxy for skin color** — it was designed for photosensitivity, not aesthetic tone classification
- **Skin of color** (SOC) dermatology often uses **Fitzpatrick IV–VI** as the working definition
- **Fitzpatrick VI includes a wide range** from medium-dark brown to deeply pigmented skin
- For SKINgenius AI vision: supplement Fitzpatrick with **visual skin tone estimation** and **melanin density inference**

---

## 2. Conditions More Common in Darker Skin

### 2.1 Post-Inflammatory Hyperpigmentation (PIH)

**Definition:** Dark marks or patches that develop after skin inflammation, injury, or irritation heals.

- **Prevalence in SOC:** Affects **>65% of Black patients** after acne; **40–50% of Hispanic/Latino patients**
- **Pathophysiology:** Inflammation triggers melanocyte activation → increased melanin production → hyperpigmented macules/patches at site of prior lesion
- **On darker skin:** PIH is often the **primary complaint** rather than the acne itself; acne lesions heal but leave lasting dark marks for **months to years**
- **Trigger factors:** Acne, eczema, insect bites, shaving, chemical peels, laser treatments, any procedure causing inflammation
- **Distribution:** Face (most common), neck, back, chest — wherever the original inflammation occurred

**Visual indicators on dark skin:**
- Flat, hyperpigmented macules or patches
- Color ranges from light brown to blue-gray to black
- May be larger than the original lesion
- No texture change — purely pigmentary

**Clinical severity (for SKINgenius grading):**
| Grade | Description |
|-------|-------------|
| Mild | Few scattered spots, light brown |
| Moderate | Multiple spots, medium-dark brown, some merging |
| Severe | Extensive, dark brown to black, persistent >6 months |

**Active ingredients (evidence-based):**
- Azelaic acid 15–20% (Evidence Grade A)
- Niacinamide 2–5% (Evidence Grade A)
- Vitamin C (L-ascorbic acid) 10–20% (Evidence Grade A)
- Kojic acid 1–4% (Evidence Grade B)
- Glycolic acid 5–10% (Evidence Grade A — lower concentrations for dark skin)
- Tranexamic acid 2–5% (Evidence Grade B–A)
- Licorice root extract (Evidence Grade C)

**Red flags → dermatologist:**
- PIH that worsens despite treatment
- PIH with raised/irregular borders (rule out melanoma in SOC)
- Sudden onset without identifiable trigger

---

### 2.2 Melasma

**Definition:** Symmetric, blotchy hyperpigmentation triggered by hormonal factors and UV exposure.

- **Prevalence:** Affects **90% of those with melasma are women**; highest prevalence in **Fitzpatrick IV–VI** (especially Latin American, Asian, Middle Eastern, and Black populations)
- **Pathophysiology:** UV radiation + hormonal stimulation (estrogen, progesterone) → melanocyte hyperactivity → increased melanin in epidermis and/or dermis
- **Types:**
  - **Epidermal melasma:** Brown, well-defined, responds better to treatment
  - **Dermal melasma:** Blue-gray, poorly defined, harder to treat
  - **Mixed:** Most common; combination of epidermal and dermal pigment
- **Triggers:** Pregnancy (chloasma/mask of pregnancy), oral contraceptives, hormone replacement therapy, sun exposure, some cosmetics

**Visual indicators on dark skin:**
- Symmetric brown to gray-brown patches
- **Central facial pattern:** forehead, cheeks, upper lip, nose, chin
- **Malar pattern:** cheeks and nose
- **Mandibular pattern:** jawline (more common in darker skin)

**Clinical severity (MASI — Melasma Area Severity Index):**
| Grade | Description |
|-------|-------------|
| I (Mild) | Slight color; covers small area |
| II (Moderate) | Obvious color; moderate area |
| III (Severe) | Marked color; extensive area |

**Active ingredients (evidence-based):**
- **Azelaic acid 20%** — FDA-approved for melasma (Evidence Grade A)
- **Tranexamic acid** — oral (250 mg 2× daily) and topical (2–5%); growing evidence (Evidence Grade B–A)
- **Kojic acid 2–4%** (Evidence Grade B)
- **Niacinamide 4–5%** (Evidence Grade A)
- **Vitamin C** — as adjunctive (Evidence Grade B)
- **Glycolic acid peels** — professional only, lower strength for dark skin

**Red flags → dermatologist:**
- First-line treatment failure
- Possible dermal melasma (poor response to topical therapy)
- Uncertainty about diagnosis (rule out other pigmentary disorders)

---

### 2.3 Dermatosis Papulosa Nigra (DPN)

**Definition:** Small, dark brown to black papules on the face and neck, clinically and histologically related to seborrheic keratoses.

- **Prevalence:** Affects **35–75% of Black patients**; onset typically in adolescence, increasing with age
- **Pathophysiology:** Benign epidermal proliferation; exact cause unknown; likely genetic (autosomal dominant inheritance with variable expressivity)
- **Distribution:** Malar cheeks, temples, periorbital area, neck, upper chest

**Visual indicators on dark skin:**
- 1–5 mm smooth, dome-shaped papules
- Dark brown to black color
- Multiple lesions (can be dozens to hundreds)
- Non-tender, non-itchy

**Treatment:**
- Primarily **cosmetic concern**; not dangerous
- Options: electrocautery, cryotherapy, curettage, laser (Nd:YAG or CO₂ with caution in dark skin)
- **Risk in dark skin:** Any destructive treatment carries **PIH risk** — must be performed by experienced provider

**SKINgenius stance:** DPN is benign. Recommend dermatologist/aesthetician for cosmetic removal if desired. Flag PIH risk with any treatment.

---

### 2.4 Keloids and Hypertrophic Scars

**Definition:**
- **Keloid:** Scar tissue that grows beyond the boundaries of the original wound; continues to enlarge over time
- **Hypertrophic scar:** Raised scar confined to the original wound boundaries; may flatten over time

- **Prevalence:** Keloids **15× more common in Black patients** than White; also higher in Asian and Hispanic populations
- **Pathophysiology:** Dysregulated wound healing → excessive collagen (type III) deposition by fibroblasts; genetic predisposition (TGF-β signaling, fibronectin gene variants)
- **Common sites:** Earlobes (piercings), chest, shoulders, upper arms, jawline, back
- **High-risk procedures in SOC:** Ear piercing, acne excoriation, surgical incisions, tattoos

**Visual indicators on dark skin:**
- Raised, firm, rubbery texture
- Color: hyperpigmented (dark brown to purple) or hypopigmented at center
- Keloids: extend beyond original wound margins; may have "claw-like" projections
- Hypertrophic: confined to wound; may be red/purple early, then darken

**Active ingredients / treatments:**
- **First-line:** Intralesional corticosteroid injections (triamcinolone) — dermatologist
- **Silicone gel sheets** — adjunctive (Evidence Grade B)
- **Pressure therapy** — for ear keloids
- **Laser** (pulsed-dye laser) — early scars; caution in dark skin
- **Cryotherapy** — intralesional; dermatologist only
- **5-FU injections** — for resistant keloids
- **Topical retinoids** — limited evidence; may help early hypertrophic scars

**SKINgenius red flags → dermatologist:**
- Any keloid or hypertrophic scar
- New scar that is thickening or enlarging
- Scar on high-risk site (chest, ear)
- History of keloid formation → pre-treatment counseling for any procedure

---

### 2.5 Central Centrifugal Cicatricial Alopecia (CCCA)

**Definition:** A scarring alopecia (hair loss) primarily affecting Black women, causing permanent hair follicle destruction.

- **Prevalence:** Most common **scarring alopecia in Black women**; estimated 2–5% prevalence
- **Pathophysiology:** Chronic inflammation of the hair follicle → follicle miniaturization and destruction → permanent hair loss; likely multifactorial (genetic, mechanical from hairstyling, autoimmune component)
- **Contributing factors:** Tight hairstyles (braids, weaves, extensions), chemical relaxers, heat styling, genetic predisposition

**Visual indicators on dark skin:**
- Hair loss beginning at the **vertex/crown** of the scalp
- Expands outward in a **centrifugal pattern**
- Affected scalp may show **smooth, shiny skin** (scarring)
- **Perifollicular erythema** or hyperpigmentation may be visible
- Hairs at the edge of the bald area may be **broken or miniaturized**
- **"Follicular dropout"** — loss of follicular openings visible on dermoscopy

**Red flags → dermatologist urgently:**
- This is a **medical emergency for hair** — permanent follicle destruction means hair cannot regrow
- Early treatment can halt progression; delayed treatment = permanent loss
- Any woman of African descent with crown hair loss should see a dermatologist

**SKINgenius note:** While primarily a scalp condition, CCCA awareness is important for holistic skin health conversations with users who may mention hair concerns alongside facial analysis.

---

### 2.6 Pseudofolliculitis Barbae (Razor Bumps)

**Definition:** Chronic inflammatory condition caused by **ingrown hairs**, particularly in the beard area.

- **Prevalence:** Affects **45–80% of Black men** who shave; also common in other SOC populations with curly/coily hair
- **Pathophysiology:** Curly/coily hair re-enters the skin after shaving → foreign body inflammatory reaction → papules, pustules, PIH, and potential scarring/keloid formation
- **Complications:** Secondary bacterial infection, permanent scarring, keloids, hyperpigmentation

**Visual indicators on dark skin:**
- **Papules and pustules** in beard area, neck, jawline
- **Ingrown hairs** visible under skin surface
- **PIH** surrounding lesions
- **Keloid scars** in chronic, severe cases
- May be confused with acne but distribution is **shaved areas only**

**Prevention & treatment:**
- **Shaving technique:** Single-blade razor (not multi-blade); shave **with** the grain; use shaving gel; avoid stretching skin; do not shave too close
- **Chemical depilatories** — dissolve hair above skin; reduce ingrown risk (patch test first)
- **Topical clindamycin** or **erythromycin** — for inflammatory lesions
- **Topical retinoids** — reduce follicular plugging (caution: initial irritation)
- **Benzoyl peroxide wash** — antimicrobial, reduces inflammation
- **Laser hair reduction** (Nd:YAG for dark skin) — definitive treatment for chronic cases

**Red flags → dermatologist:**
- Severe or persistent cases
- Keloid formation
- Suspected secondary infection

---

### 2.7 Vitiligo

**Definition:** Autoimmune destruction of melanocytes → depigmented (white) patches.

- **Prevalence:** ~1% globally; all skin types affected; **more psychologically distressing in darker skin** due to higher contrast
- **Pathophysiology:** Autoimmune attack on melanocytes; genetic predisposition (30% have family history); associated with other autoimmune conditions (thyroid disease, type 1 diabetes, pernicious anemia)
- **Types:**
  - **Non-segmental vitiligo (NSV):** Most common; bilateral, symmetric; progressive
  - **Segmental vitiligo:** Unilateral, dermatomal distribution; earlier onset; more stable
  - **Focal:** Single or few patches
  - **Acrofacial:** Fingers, toes, face (periorificial)

**Visual indicators on dark skin:**
- **Well-demarcated milky-white patches** — high contrast against surrounding dark skin
- May have **trichrome** appearance (white center, tan intermediate zone, normal skin at edge)
- **Koebner phenomenon** — new lesions at sites of trauma
- **Perifollicular repigmentation** may be visible with treatment (hairs may remain pigmented)
- **Wood's lamp:** bright white fluorescence (diagnostic)

**Red flags → dermatologist (always):**
- Vitiligo is a **medical condition**, not purely cosmetic
- Requires dermatologist diagnosis and management
- Treatment options: topical corticosteroids, calcineurin inhibitors (tacrolimus, pimecrolimus), phototherapy (NB-UVB), excimer laser, JAK inhibitors (new, promising), depigmentation (for extensive disease)
- **Psychological support** is critical — vitiligo has significant psychosocial impact, especially in SOC communities

---

### 2.8 Seborrheic Dermatitis (Differential Presentation)

**Definition:** Chronic inflammatory condition of sebaceous gland-rich areas; caused by *Malassezia* yeast overgrowth and inflammatory response.

- **Prevalence:** 3–5% of adults; **higher prevalence and more severe in SOC**
- **Pathophysiology:** *Malassezia* (lipophilic yeast) colonizes sebum-rich areas → hydrolyzes sebum triglycerides → releases oleic acid → inflammatory reaction in susceptible individuals

**How presentation differs in dark skin:**

| Feature | Light Skin | Dark Skin |
|---------|-----------|-----------|
| **Erythema** | Prominent pink/red | Often subtle or absent; look for **darker brown, violaceous, or gray discoloration** |
| **Scale** | White, greasy, yellowish | White or gray scale; may be more adherent |
| **Distribution** | Scalp, eyebrows, nasolabial folds, chest | Same, but **post-auricular area** and **eyelids** may be more involved |
| **Hypopigmentation** | Less common | **Common** — SD can cause **hypopigmented patches** that look like tinea versicolor or vitiligo |
| **Hair texture effects** | Dandruff | More severe scaling; may be associated with **central hair loss pattern** |

**Visual indicators in SOC:**
- **Hypopigmented patches** on face (may be misdiagnosed as vitiligo or tinea)
- **Violaceous or brown discoloration** rather than redness
- **Greasy, yellowish scale** on scalp and eyebrows
- **Crusting** around eyelashes (blepharitis component)

**Active ingredients:**
- Ketoconazole 2% shampoo/cream (Evidence Grade A)
- Zinc pyrithione shampoo (Evidence Grade B)
- Selenium sulfide shampoo (Evidence Grade B)
- Coal tar shampoo (Evidence Grade B)
- Topical corticosteroids — short courses for flares (caution: skin atrophy, PIH)
- Topical calcineurin inhibitors (tacrolimus, pimecrolimus) — steroid-sparing

**Red flags → dermatologist:**
- Severe or refractory cases
- Uncertain diagnosis (rule out psoriasis, tinea, lupus)
- Involvement of non-seborrheic areas

---

## 3. Conditions That Present Differently on Dark Skin

### 3.1 Erythema (Redness)

**The Challenge:** Erythema is the dermatologist's primary visual cue for inflammation, infection, and many skin conditions. On dark skin, **redness is often not visible**.

**What to look for instead:**
- **Warmth:** Palpation — inflamed skin feels warmer than surrounding skin
- **Texture changes:** Swelling, induration (hardening), or edema
- **Subtle color shifts:**
  - **Violaceous (purple)** hue in deeper inflammation
  - **Gray or ashy** discoloration
  - **Darker brown** than surrounding skin
  - **Lighter/whitish** in some inflammatory conditions
- **Pain or tenderness:** Patient-reported symptoms are more reliable than visual inspection
- **Scale or desquamation:** May be more prominent than color change

**Clinical examples:**
| Condition | Light Skin | Dark Skin |
|-----------|-----------|-----------|
| Acute eczema | Bright red patches | Dark brown/violaceous; warmth; swelling |
| Cellulitis | Diffuse erythema, warmth | Swelling, warmth, subtle color change; may look normal but feel hot |
| Rosacea | Persistent facial redness | Rare; when present, may show brownish discoloration |
| Sunburn | Bright red, painful | May show minimal color change but same UV damage; delayed darkening |

**For SKINgenius AI vision:**
- Redness detection algorithms must be **color-normalized**
- Texture analysis (swelling, scale) more important than color for inflammation detection
- Warmth cannot be detected via photo — supplement with user-reported symptoms

---

### 3.2 Acne

**Differences in dark skin:**
- **Inflammatory lesions** may appear **dark purple/brown** rather than red
- **PIH is often the dominant concern** — patients may care more about the marks than the active acne
- **Nodulocystic acne** more common in SOC; higher risk of scarring
- **Pomade acne** (acne cosmetica from hair products) particularly common in Black patients — forehead and temples

**SKINgenius considerations:**
- Grade acne severity based on lesion count + inflammation depth
- Flag PIH risk in all acne treatment recommendations
- Recommend **non-comedogenic** products and **pomade-free** hair products for SOC users
- Retinoids are first-line but must be introduced **slowly** to minimize initial irritation → PIH

---

### 3.3 Rosacea

**In darker skin, rosacea is:**
- **Rare but underdiagnosed**
- **Does not present with visible redness**
- May show:
  - **Brownish discoloration** or hyperpigmentation
  - **Warmth and swelling** (patient-reported)
  - **Papules and pustules** without background erythema
  - **Ocular symptoms** (dry, gritty eyes) may be the first sign

**Types 1–4 (all can occur in SOC):**
| Type | Name | Presentation in Dark Skin |
|------|------|--------------------------|
| 1 | Erythematotelangiectatic | May show subtle brown discoloration; warmth; no visible vessels |
| 2 | Papulopustular | Brown papules and pustules; misdiagnosed as acne |
| 3 | Phymatous | Rhinophyma (rare in SOC) |
| 4 | Ocular | Same across skin types — dry eyes, blepharitis |

**Treatment:** Same as for lighter skin — azelaic acid (especially good for SOC), metronidazole, ivermectin; oral antibiotics for severe cases.

---

### 3.4 Eczema / Atopic Dermatitis

**Presentation differences:**
- **Acute eczema:** Rather than bright red, appears as **dark brown, violaceous, or gray patches**
- **Chronic eczema:** **Lichenification** (skin thickening, prominent skin lines) more pronounced; **hyperpigmentation** common
- **Dyschromia:** Both hyperpigmentation AND hypopigmentation may occur
- **Follicular prominence:** In SOC, eczema may show **follicular papules** rather than patches ("follicular eczema")
- **Distribution:** Same flexural areas, but may also involve extensor surfaces in SOC

**Key visual cue:** Look for **texture change** (roughness, lichenification, oozing) rather than relying on color alone.

---

### 3.5 Psoriasis

**Presentation in SOC:**
- **Plaque color:** Violaceous, dark brown, or gray rather than salmon-pink
- **Scale:** Same silvery-white scale, but may be more adherent
- **Post-inflammatory changes:** Both hyperpigmentation and hypopigmentation common after plaques resolve
- **Scalp psoriasis:** May be misdiagnosed as seborrheic dermatitis or tinea capitis
- **Inverse psoriasis:** Affects skin folds; in SOC, may be misdiagnosed as fungal infection due to maceration and color changes
- **Erythrodermic psoriasis:** Generalized redness is visible in all skin types — medical emergency

**SKINgenius note:** Psoriasis requires dermatologist management. AI should flag for referral.

---

## 4. Ingredients to Use with Caution on Dark Skin

### 4.1 High-Strength AHAs / BHAs

| Concern | Detail |
|---------|--------|
| **Risk** | Chemical irritation → post-inflammatory hyperpigmentation |
| **Problem ingredients** | High-concentration glycolic acid (>10%), salicylic acid peels, TCA |
| **Safer approach** | Start low (glycolic 5–8%), titrate slowly; use mandelic acid (larger molecule, gentler); avoid professional peels unless by experienced provider |
| **Evidence** | Chemical peels in SOC have higher PIH risk; mandelic acid has lower risk profile |
| **SKINgenius flag** | For Fitzpatrick IV–VI: recommend lower concentrations, gradual introduction, strict sun protection |

### 4.2 Hydroquinone

| Concern | Detail |
|---------|--------|
| **Risk** | **Exogenous ochronosis** with prolonged use (>3–6 months continuous) — blue-black hyperpigmentation that is permanent and difficult to treat |
| **Usage pattern** | 2–4% for 3 months, then break; never >6 months continuously |
| **In SOC** | Ochronosis risk higher; hydroquinone should be **dermatologist-supervised** |
| **Regulatory status** | OTC hydroquinone banned in EU; 2% OTC in US but under review; prescription 4% |
| **Alternatives** | Azelaic acid, kojic acid, tranexamic acid, niacinamide — all safer for long-term use |
| **SKINgenius flag** | **Do not recommend hydroquinone without dermatologist note**; suggest safer alternatives first |

### 4.3 Strong Retinoids

| Concern | Detail |
|---------|--------|
| **Risk** | Initial irritation phase (retinization) → peeling, redness (or darkening in SOC) → PIH |
| **Problem** | Tretinoin 0.1%, high-strength adapalene, strong retinol products |
| **Safer approach** | Microencapsulated retinol, low-dose tretinoin (0.025%), or retinol esters; introduce 2–3×/week, gradually increase; moisturize generously |
| **Benefit** | Retinoids are **actually excellent for PIH and melasma** long-term; the key is **gradual introduction** |
| **SKINgenius flag** | Recommend "start low, go slow" for all Fitzpatrick IV–VI users; pair with niacinamide to reduce irritation |

### 4.4 Benzoyl Peroxide

| Concern | Detail |
|---------|--------|
| **Risk** | Can cause **irritation and bleaching/darkening paradox** in SOC; dryness may trigger compensatory melanin production |
| **Problem** | High concentrations (5–10%), leave-on formulations |
| **Safer approach** | Lower concentrations (2.5–5%), wash-off formulations, short-contact therapy; pair with moisturizer |
| **Note** | Benzoyl peroxide is still effective for acne in SOC; just requires careful formulation |
| **SKINgenius flag** | Recommend lower concentration, moisturizer pairing; flag bleaching of fabrics/hair |

### 4.5 Certain Lasers & Light-Based Devices

| Concern | Detail |
|---------|--------|
| **Risk** | **Hypopigmentation** (white spots) or **hyperpigmentation** from thermal injury; laser hair removal burns |
| **Problem devices** | IPL (intense pulsed light) — poor melanin selectivity; some ablative lasers; wrong wavelength for skin type |
| **Safer approach** | **Nd:YAG 1064nm** — safest for dark skin (longer wavelength penetrates deeper, less epidermal melanin absorption); **Q-switched Nd:YAG** for pigmented lesions |
| **Never use** | IPL for hair removal on Fitzpatrick V–VI (high burn risk) |
| **SKINgenius flag** | Any laser recommendation for SOC → must specify Nd:YAG; flag that provider must have SOC experience |

### 4.6 Other Caution Notes

| Ingredient/Procedure | Risk in SOC | Safer Alternative |
|----------------------|-------------|-------------------|
| **Medium-depth chemical peels** | PIH, scarring | Superficial peels only; mandelic acid |
| **Cryotherapy** | Hypopigmentation (white spots) | Alternative treatments; if cryo used, lower intensity |
| **Liquid nitrogen for wart removal** | Hypopigmentation | Cantharidin, salicylic acid |
| **Sclerotherapy (spider veins)** | Hyperpigmentation at injection site | Laser (Nd:YAG for leg veins) |
| **Microneedling** | Generally safe but PIH risk if done too aggressively | Shorter needles (0.5–1.0mm), professional only |

---

## 5. Ingredients Particularly Beneficial for Darker Skin

### 5.1 Azelaic Acid

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐⭐ — **Top recommendation for SOC** |
| **Concentration** | 10% (OTC), 15–20% (prescription) |
| **Mechanism** | Tyrosinase inhibition; anti-inflammatory; antimicrobial against *C. acnes*; normalizes keratinization |
| **Evidence Grade** | **A** — FDA-approved for melasma and rosacea; multiple RCTs |
| **Why for SOC** | **Non-irritating**, does not cause PIH, treats acne + PIH + melasma simultaneously, safe for long-term use |
| **SKINgenius use** | First-line for: acne in SOC, PIH, melasma, rosacea in SOC |

### 5.2 Kojic Acid

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐ |
| **Concentration** | 1–4% |
| **Mechanism** | Chelates copper at tyrosinase active site → inhibits melanin production |
| **Evidence Grade** | **B** — cohort studies; less robust than azelaic but effective |
| **Why for SOC** | Effective for melasma and PIH; generally well-tolerated |
| **Caution** | Rare contact dermatitis; potential carcinogenicity concern at very high concentrations (not relevant at cosmetic levels) |
| **SKINgenius use** | Second-line for hyperpigmentation; can combine with azelaic or vitamin C |

### 5.3 Vitamin C (L-Ascorbic Acid)

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐⭐ |
| **Concentration** | 10–20% (pH ≤ 3.5 for L-AA) |
| **Mechanism** | Antioxidant (neutralizes free radicals); inhibits tyrosinase; promotes collagen synthesis |
| **Evidence Grade** | **A** — multiple RCTs for photoprotection, hyperpigmentation, anti-aging |
| **Why for SOC** | **Brightening without irritation**; helps PIH fade; provides photoprotection (important since melanin alone is not enough SPF) |
| **Formulation note** | L-AA is unstable; derivatives (magnesium ascorbyl phosphate, ascorbyl glucoside) are more stable but less potent |
| **SKINgenius use** | Morning routine staple for all skin types; especially valuable for SOC hyperpigmentation |

### 5.4 Niacinamide (Vitamin B3)

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐⭐ |
| **Concentration** | 2–10% (sweet spot: 4–5%) |
| **Mechanism** | Inhibits melanosome transfer to keratinocytes; anti-inflammatory; strengthens barrier (stimulates ceramide synthesis); reduces sebum |
| **Evidence Grade** | **A** — multiple RCTs for hyperpigmentation, acne, barrier repair, anti-aging |
| **Why for SOC** | **Extremely well-tolerated** — no irritation, no PIH risk; reduces inflammation that leads to PIH; barrier support is critical for SOC |
| **Synergy** | Pairs beautifully with retinoids (reduces retinization irritation), vitamin C, azelaic acid |
| **SKINgenius use** | Universal ingredient — safe, effective, compatible with almost everything; especially recommended for SOC |

### 5.5 Tranexamic Acid

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐⭐ |
| **Concentration** | Topical 2–5%; Oral 250 mg 2× daily |
| **Mechanism** | Plasmin inhibitor → reduces arachidonic acid → decreases prostaglandin synthesis → reduces melanocyte stimulation |
| **Evidence Grade** | **B–A** — growing evidence; RCTs showing efficacy for melasma |
| **Why for SOC** | **Excellent for melasma** — especially when hormonal factors are present; well-tolerated |
| **Caution** | Oral TXA: contraindicated in history of thromboembolism; requires physician supervision |
| **SKINgenius use** | Topical for melasma/PIH; oral only with physician note |

### 5.6 Glycolic Acid (Lower Concentrations)

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐ |
| **Concentration** | 5–8% for SOC (vs. 10%+ for lighter skin) |
| **Mechanism** | AHA exfoliation; accelerates cell turnover → fades PIH; stimulates collagen |
| **Evidence Grade** | **A** — multiple RCTs |
| **Why for SOC** | Effective for PIH and texture; **must use lower concentrations** to avoid irritation → PIH |
| **Caution** | Always pair with SPF; introduce slowly |
| **SKINgenius use** | For Fitzpatrick IV–VI: recommend 5–8% maximum; professional peels only by experienced provider |

### 5.7 Mandelic Acid

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐ |
| **Concentration** | 5–10% |
| **Mechanism** | AHA with larger molecular size (152 Da vs. glycolic 76 Da) → slower, more even penetration → less irritation |
| **Evidence Grade** | **B** — smaller trial body but consistent results |
| **Why for SOC** | **Gentler than glycolic acid**; antibacterial properties (good for acne); excellent PIH profile |
| **SKINgenius use** | Recommended over glycolic for sensitive or pigmentation-prone SOC |

### 5.8 Retinoids (Microencapsulated or Low-Dose)

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐⭐⭐ |
| **Concentration** | Retinol 0.25–0.5%; Tretinoin 0.025% |
| **Mechanism** | Increases cell turnover; normalizes keratinization; stimulates collagen; disperses melanin |
| **Evidence Grade** | **A** — decades of RCT data |
| **Why for SOC** | **Gold standard for PIH, melasma, acne, and anti-aging** — but the key is **gradual introduction** |
| **Microencapsulation** | Encapsulated retinol releases slowly → less irritation → lower PIH risk |
| **SKINgenius use** | Start with retinol 0.25% 2–3×/week; pair with niacinamide; increase frequency gradually; always night use + morning SPF |

### 5.9 Green Tea (EGCG)

| Attribute | Detail |
|-----------|--------|
| **Strength** | ⭐⭐⭐ |
| **Concentration** | 2–5% extract or EGCG |
| **Mechanism** | Potent antioxidant; anti-inflammatory (inhibits NF-κB); anti-androgenic (may reduce sebum) |
| **Evidence Grade** | **B** — clinical trials for acne, photoaging |
| **Why for SOC** | **Anti-inflammatory benefits reduce the root cause of PIH**; antioxidant protection; very well-tolerated |
| **SKINgenius use** | Excellent adjunctive ingredient; good for sensitive SOC |

### 5.10 Summary Table: Best Actives for Darker Skin

| Ingredient | Best For | Evidence | Fitzpatrick IV–VI Safety |
|-----------|----------|----------|--------------------------|
| **Azelaic acid** | Melasma, PIH, acne, rosacea | A | ⭐⭐⭐⭐⭐ Excellent |
| **Niacinamide** | PIH, barrier, inflammation, pores | A | ⭐⭐⭐⭐⭐ Excellent |
| **Vitamin C** | Brightening, antioxidant, PIH | A | ⭐⭐⭐⭐⭐ Excellent |
| **Tranexamic acid** | Melasma (topical) | B–A | ⭐⭐⭐⭐⭐ Excellent |
| **Retinoids (low-dose)** | PIH, melasma, acne, aging | A | ⭐⭐⭐⭐ Good (start slow) |
| **Kojic acid** | Hyperpigmentation, melasma | B | ⭐⭐⭐⭐ Good |
| **Mandelic acid** | Gentle exfoliation, PIH, acne | B | ⭐⭐⭐⭐⭐ Excellent |
| **Glycolic acid (low)** | Exfoliation, PIH, texture | A | ⭐⭐⭐ Good (use cautiously) |
| **Green tea** | Anti-inflammatory, antioxidant | B | ⭐⭐⭐⭐⭐ Excellent |

---

## 6. AI Detection Challenges for Darker Skin Tones

### 6.1 The Problem

AI vision models, including dermatology-focused systems, have historically been trained on **predominantly light-skinned datasets**. This creates systematic biases:

- **Underdetection** of conditions in SOC
- **Misclassification** due to different visual presentation
- **Lower confidence scores** for dark skin images
- **Failure to detect** subtle color changes that are the primary indicators in SOC

### 6.2 Specific Challenges for SKINgenius

| Challenge | Impact | Mitigation Strategy |
|-----------|--------|---------------------|
| **Erythema detection** | Redness algorithms fail on dark skin; inflammation is missed | Supplement with texture analysis (swelling, scale); prompt user for symptoms (warmth, pain) |
| **Color-normalized preprocessing** | Standard RGB processing may wash out subtle SOC variations | Implement **color constancy algorithms** (e.g., shade of gray, gray world); **histogram equalization** for darker tones |
| **Hyperpigmentation grading** | PIH may blend with baseline skin tone; difficult to quantify contrast | Use **relative color difference** within image rather than absolute color values; assess area + density |
| **Hypopigmentation detection** | Vitiligo patches may have lower contrast; subtle hypo areas missed | Enhance contrast in preprocessing; train on SOC-specific hypopigmentation datasets |
| **Lesion analysis (ABCDE)** | Melanoma in SOC presents differently (acral lentiginous, subungual); dark lesions harder to evaluate | Include **SOC-specific melanoma patterns** in training; flag all suspicious dark lesions for dermatologist |
| **Texture vs. color reliance** | Over-reliance on color-based features | Increase weight of **texture features** (roughness, scale, elevation) in model |
| **Lighting calibration** | Uneven lighting creates artifacts on dark skin | Standardize lighting requirements; reject poor-quality images; use **flat-field correction** |

### 6.3 Lighting Calibration Requirements

| Requirement | Specification |
|-------------|---------------|
| **Lighting type** | Diffuse, even illumination; avoid directional/spot lighting |
| **Color temperature** | 5000–6500K (daylight balanced) |
| **Background** | Neutral gray or white; avoid colored backgrounds |
| **Shadow minimization** | Multiple light sources or ring light |
| **Image quality gate** | Reject if: uneven lighting, deep shadows on face, overexposed highlights |
| **User guidance** | "Take photo in natural daylight, facing a window"; "Avoid overhead lighting"; "Hold phone at arm's length" |

### 6.4 Color-Normalized Preprocessing Pipeline

```
Raw Image
    ↓
[Face Detection & Alignment]
    ↓
[Skin Region Segmentation]
    → Exclude: hair, eyes, lips, glasses, jewelry
    ↓
[Color Constancy]
    → Shade-of-Gray or Gray-World algorithm
    → Compensate for lighting color cast
    ↓
[Contrast Enhancement]
    → CLAHE (Contrast Limited Adaptive Histogram Equalization)
    → Applied per-region, not globally
    ↓
[Feature Extraction]
    → Color features (HSV, LAB color spaces — LAB better for skin tone)
    → Texture features (LBP, GLCM, deep features)
    → Structural features (edges, gradients)
    ↓
[Condition Classification]
    → Multi-task model: condition + severity + confidence
    ↓
[Post-Processing]
    → Confidence threshold check
    → Skin tone-specific calibration
    → Flag for human review if confidence < 0.6
```

### 6.5 Training Data Requirements

| Dataset Need | Priority | Action |
|-------------|----------|--------|
| **Balanced Fitzpatrick distribution** | Critical | Ensure training data has ≥25% Fitzpatrick IV–VI |
| **SOC-specific condition images** | Critical | Partner with dermatology clinics serving diverse populations |
| **Same-condition, multiple skin tones** | High | Include acne, eczema, psoriasis across all Fitzpatrick types |
| **Melanoma in SOC** | High | Include acral lentiginous melanoma, subungual melanoma, mucosal melanoma |
| **Normal skin variability** | Medium | Include healthy skin across full Fitzpatrick spectrum |
| **Lighting variation** | Medium | Train on images with varied lighting conditions |

### 6.6 Model Performance Monitoring

| Metric | Target | Action if Below Target |
|--------|--------|-------------------------|
| **Sensitivity (recall) by Fitzpatrick type** | ≥85% for all types | Analyze failure modes; augment training data for underperforming groups |
| **Specificity by Fitzpatrick type** | ≥90% for all types | Review false positive patterns |
| **Confidence score calibration** | Well-calibrated across skin tones | Apply **Platt scaling** or **temperature scaling** per skin tone group |
| **PIH detection rate** | ≥80% in Fitzpatrick IV–VI | PIH is critical concern in SOC; prioritize this metric |
| **Melanoma sensitivity in SOC** | ≥95% | Cannot miss melanoma in any skin type; escalate to human review |

### 6.7 User-Facing Adjustments

| Feature | Implementation |
|---------|---------------|
| **Skin tone confirmation** | After AI estimation, ask user to confirm or adjust Fitzpatrick type |
| **Symptom prompts** | For inflammation detection, ask: "Is the area warm? Tender?" |
| **Cultural context** | Acknowledge that some conditions (PIH, DPN) are common and normal in SOC |
| **Provider matching** | If dermatologist referral needed, prioritize providers with SOC experience |
| **Ingredient cautions** | Automatically flag high-risk ingredients for Fitzpatrick IV–VI |
| **SPF emphasis** | Stronger messaging: "Your melanin provides ~SPF 13, but you still need SPF 30+ daily" |

---

## 7. Clinical References

### Key Dermatology Texts

1. **Taylor SC, et al.** *Treatments for Skin of Color.* Elsevier, 2021.
2. **Kelly AP, Taylor SC.** *Dermatology for Skin of Color.* McGraw-Hill, 2009.
3. **Bolognia JL, et al.** *Dermatology.* 4th ed. Elsevier, 2018. (Section on skin of color)
4. **Fitzpatrick TB, et al.** *Color Atlas and Synopsis of Clinical Dermatology.* 8th ed. McGraw-Hill, 2017.

### Seminal Papers

1. **Fitzpatrick TB.** "The validity and practicality of sun-reactive skin types I through VI." *Arch Dermatol.* 1988;124(6):869–871. — Original Fitzpatrick scale validation
2. **Taylor SC.** "Skin of color: biology, structure, function, and implications for dermatologic disease." *J Am Acad Dermatol.* 2002;46(2 Suppl):S41–S62.
3. **Davis EC, Callender VD.** "Postinflammatory hyperpigmentation: a review of the epidemiology, clinical features, and treatment options in skin of color." *J Clin Aesthet Dermatol.* 2010;3(7):20–31.
4. **Alexis AF, et al.** "Epidemiology and treatment of acne in ethnic skin." *J Drugs Dermatol.* 2011;10(6):653–657.
5. **Callender VD, et al.** "Azelaic acid 20% cream in the treatment of facial hyperpigmentation in darker-skinned patients." *Cutis.* 1997;60(2):86–89.
6. **Kimbrough-Green CK, et al.** "Topical retinoic acid (tretinoin) for melasma in black patients." *Arch Dermatol.* 1994;130(6):727–733.
7. **Balkrishnan R, et al.** "Development and validation of a health-related quality of life instrument for women with melasma." *Br J Dermatol.* 2003;149(Suppl 1):13.
8. **Ogunsola B, et al.** "Central centrifugal cicatricial alopecia: challenges and solutions." *Clin Cosmet Investig Dermatol.* 2021;14:407–418.
9. **Alexis A, et al.** "Racial and ethnic differences in dermatology: a review of the literature." *J Am Acad Dermatol.* 2021;84(5):1379–1391.
10. **Wolf K, et al.** "Melasma and post-inflammatory hyperpigmentation in skin of color." *Dermatol Clin.* 2023;41(2):289–301.

### AI / Computer Vision

1. **Daneshjou R, et al.** "Disparities in dermatology AI performance on a diverse, curated clinical image set." *Sci Adv.* 2022;8(31):eabq6147. — Landmark study showing AI bias across skin tones
2. **Groh M, et al.** "Evaluating deep neural networks trained on clinical images in dermatology with the Fitzpatrick 17k dataset." *CVPR.* 2021.
3. **Fitzpatrick 17k Dataset.** Public dataset of 16,577 clinical images with Fitzpatrick labels for training debiased models.

---

## Appendix: Quick Reference for SKINgenius Development

### Fitzpatrick → Ingredient Risk Matrix

| Ingredient | Fitz I–III | Fitz IV | Fitz V | Fitz VI |
|-----------|-----------|---------|--------|---------|
| Azelaic acid 10–20% | Safe | ✅ Preferred | ✅ Preferred | ✅ Preferred |
| Niacinamide 2–10% | Safe | ✅ Preferred | ✅ Preferred | ✅ Preferred |
| Vitamin C 10–20% | Safe | ✅ Preferred | ✅ Preferred | ✅ Preferred |
| Tranexamic acid 2–5% | Safe | ✅ Preferred | ✅ Preferred | ✅ Preferred |
| Retinol 0.25–0.5% | Safe | ⚠️ Start slow | ⚠️ Start slow | ⚠️ Start slow |
| Tretinoin 0.025% | Safe | ⚠️ Careful | ⚠️ Careful | ⚠️ Careful |
| Glycolic acid 5–8% | Safe | ✅ OK | ⚠️ Monitor | ⚠️ Use caution |
| Glycolic acid >10% | Safe | ⚠️ Caution | ❌ Avoid | ❌ Avoid |
| Salicylic acid 0.5–2% | Safe | ✅ OK | ✅ OK | ✅ OK |
| Salicylic acid peels | Safe | ⚠️ Caution | ❌ Avoid | ❌ Avoid |
| Kojic acid 2–4% | Safe | ✅ OK | ✅ OK | ✅ OK |
| Mandelic acid 5–10% | Safe | ✅ Preferred | ✅ Preferred | ✅ Preferred |
| Hydroquinone 2–4% | Safe | ⚠️ Short-term only | ⚠️ Derm-supervised | ⚠️ Derm-supervised |
| Benzoyl peroxide 2.5–5% | Safe | ✅ OK | ✅ OK | ⚠️ Lower conc. |
| Benzoyl peroxide >5% | Safe | ⚠️ Caution | ⚠️ Caution | ❌ Avoid |
| Chemical peels (medium) | Safe | ❌ Avoid | ❌ Avoid | ❌ Avoid |
| Laser (IPL) | Safe | ❌ Avoid | ❌ Avoid | ❌ Avoid |
| Laser (Nd:YAG) | Safe | ✅ Preferred | ✅ Preferred | ✅ Preferred |

### Urgent Flag Conditions (All Skin Tones)

These conditions require **immediate dermatologist referral** regardless of Fitzpatrick type:

- Suspected melanoma (any new/changing dark lesion)
- Rapidly growing keloid
- Vitiligo (new diagnosis)
- CCCA (any scarring alopecia)
- Severe drug reaction / SJS-TEN
- Erythrodermic psoriasis
- Suspected cellulitis with systemic symptoms

---

*End of Report*

**Last Updated:** 2026-05-14  
**Next Review:** When new clinical evidence emerges or AI pipeline updates require revision  
**Owner:** Sage (skingenius-research)  
**Reviewers:** Nova (CEO), Lens (AI Vision), Core (Data)
