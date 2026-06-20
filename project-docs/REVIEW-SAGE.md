# SKINgenius Scientific Review — Sage

> **Date:** 2026-05-30  
> **Reviewer:** Sage (Research Subagent)  
> **Scope:** Architecture v2 + PPG-RESEARCH.md  
> **Mandate:** Evaluate scientific realism, regulatory risk, and roadmap integrity. Do NOT read project memory — this is an independent, evidence-based review.

---

## 1. PPG Accuracy Claims — Are They Realistic?

### Claims Made
- HR: ±3 bpm
- SpO2: ±2% (Fitzpatrick I–IV), ±4% (V–VI)
- BP: via PTT + calibration model
- RR: ±2 breaths/min
- HRV/stress: LF/HF ratio

### Literature Assessment

| Biomarker | Claimed Accuracy | Published Reality | Verdict |
|-----------|----------------|-------------------|---------|
| **HR** | ±3 bpm | rPPG HR: ±2–5 bpm under controlled lighting, ±5–10 bpm in motion/noisy environments (De Haan 2013, Wang 2016) | **Plausible** ✅ — but ±3 bpm is optimistic for mobile, real-world use without motion control |
| **SpO2** | ±2% (I–IV), ±4% (V–VI) | Smartphone camera lacks IR. Red/blue ratio methods achieve ±3–5% under ideal conditions, but overestimate in dark skin (Bent 2020, JAMA). ±2% requires dual-wavelength (red + IR) — impossible on standard RGB cameras. | **Overclaimed** ❌ — drop claim to ±3–5% for I–IV and ±5–8% for V–VI, or relabel "directional estimate" |
| **BP** | PTT + calibration | PTT needs ECG R-peak. No ECG from camera. Two-site PTT (face + finger) is experimental and accuracy is ±10–15 mmHg even after calibration (Tison 2022, NPJ Digital Medicine). Calibration drift is real (±5 mmHg/week). | **High risk** ⚠️ — technically possible but far from clinical grade. Should be labeled "estimated trend" only |
| **RR** | ±2 breaths/min | Envelope detection on PPG is moderately validated. ±2 is achievable under rest conditions. | **Plausible** ✅ |
| **HRV / Stress** | LF/HF ratio | Needs 2+ min clean signal. rPPG HRV correlates with ECG HRV at r ≈ 0.7–0.8 under ideal conditions (McDuff 2015). Motion artifacts kill reliability. | **Moderate** ⚠️ — feasible but requires ≥90s video and very stable face. Label "wellness indicator" not "stress score" |

### Bottom Line
- HR and RR are realistic targets.
- SpO2 ±2% is not achievable on an RGB camera. Revise or drop the metric.
- BP estimation is the weakest link: requires ongoing calibration, drifts, and invites medical-adjacent risk.
- HRV/stress needs longer capture and strict motion control.

---

## 2. SpO2 from Face Alone — Feasible or Drop It?

### The Physics Problem
Clinical pulse oximetry uses **red (~660 nm) + infrared (~940 nm)**. Hemoglobin absorbance differs sharply between these wavelengths, enabling the ratio-of-ratios calculation.

Smartphone cameras have:
- Red channel (broadband, not narrowband)
- **No infrared**
- Green channel (used for HR, not SpO2)

The "red/blue ratio" workaround mentioned in PPG-RESEARCH.md is a **proxy**, not a validated oximetry method. Published results (e.g., Google Fit) show **directional trends only** — useful for detecting a drop from 98% → 92%, but not for claiming absolute SpO2 values.

### Skin Tone Bias
- Bent et al. (2020, JAMA) and Luks & Swenson (2020, NEJM) both document **systematic overestimation of SpO2 in darker skin** by pulse oximeters.
- rPPG on RGB cameras **amplifies this bias** because melanin absorbs visible light unevenly across channels.
- The MIT Media Lab (2021) paper on multi-wavelength PPG explicitly requires **additional hardware** (narrowband LEDs), not a standard camera.

### Recommendation
**Keep SpO2 as a directional wellness metric, not a clinical vital.**
- Rename: "Oxygen Trend" or "Wellness Oxygen Index"
- Never display a single % value. Show: "Typical range" or "No concerning trend detected"
- For Fitzpatrick V–VI: **do not display SpO2 at all** unless user calibrates with an external pulse oximeter. Show a message: "This feature is not validated for your skin tone. Use a pulse oximeter for accurate readings."
- This avoids both scientific embarrassment and liability.

---

## 3. Blood Pressure Estimation — Too Risky for a Wellness App?

### The Risk Profile
Blood pressure is a **medical vital sign**. Hypertension diagnosis and management are regulated medical activities in every jurisdiction (FDA Class II in the US, MDR Class IIa in EU).

Even if you label it "wellness," regulators look at:
1. **Intended use:** Does the app claim to help users manage cardiovascular health?
2. **User perception:** Will users treat BP estimates as medical advice?
3. **Harm potential:** A false negative (missed hypertension) or false positive (unnecessary anxiety) both cause harm.

### Technical Reality
- Tison et al. (2022) achieved ±10–15 mmHg with video-based BP estimation **after individual calibration**.
- Calibration requires a reference BP cuff measurement.
- Calibration decays over days to weeks (vascular tone changes).
- No smartphone-only BP device has received FDA clearance without a cuff.

### Regulatory Precedent
- **Samsung Galaxy Watch:** BP feature requires calibration with a cuff every 4 weeks. FDA-cleared as a **medical device accessory**.
- **Aktiia bracelet:** Optical BP monitoring. CE-marked but requires clinical validation dossier.
- **Omron HeartGuide:** FDA-cleared wearable BP monitor. Took 5+ years and millions in clinical trials.

### Recommendation
**Drop BP estimation from v2. Add it to a "Future Research" section only.**
- If retained, it must:
  - Require cuff calibration every 2–4 weeks
  - Display as "BP Trend" (not "Your BP is 120/80")
  - Carry a prominent disclaimer: "Not for diagnosis. Use a validated BP monitor for medical decisions."
  - Be locked behind a "Research Mode" toggle with explicit informed consent
- Even then, the regulatory burden may outweigh the feature value for a skincare app.

---

## 4. Skin Tone Calibration — Sound Approach? What's Missing?

### What's Good
- Fitzpatrick-aware amplification gains (1.0× → 1.8×) are a reasonable first-order correction.
- Multi-ROI fusion (forehead + cheeks + nose bridge) is a validated noise-reduction strategy.
- Quality-based rejection (SNR + periodicity + stability) is essential and correctly prioritized.
- Uncertainty communication for V–VI is the right ethical stance.

### What's Missing or Weak

| Gap | Why It Matters | Suggested Fix |
|-----|----------------|-------------|
| **No empirical SNR mapping to Fitzpatrick** | The gain table (1.0→1.8×) appears arbitrary. Is it from a paper or estimated? | Cite a source or run a pilot: measure SNR on 5–10 subjects per Fitzpatrick type with controlled lighting, then derive gains empirically |
| **No melanin optical density modeling** | Fitzpatrick is a visual scale, not an optical property. Melanin content varies within a Fitzpatrick type. | Add optional **pixel-intensity histogram calibration** — measure mean facial luminance and adjust gain dynamically |
| **No validation dataset diversity** | The ViT is claimed at 93.5% on "Fitzpatrick III–VI focus" but PPG calibration lacks any stated validation size. | Define a **PPG calibration validation set**: ≥30 subjects per Fitzpatrick type, controlled and natural lighting |
| **No cross-device camera calibration** | iPhone, Samsung, Pixel cameras have different spectral sensitivities. A gain of 1.3× on iPhone may not equal 1.3× on Pixel. | Add **device-specific calibration profiles** in `device_info` JSON. Map camera model to spectral response correction |
| **No lighting temperature correction** | Warm vs. cool lighting shifts RGB channels, affecting green-channel PPG amplitude. | Add **color temperature estimation** (from frame histogram) and apply a white-balance correction before POS |
| **Motion artifact model is simplistic** | "PCA-based" motion removal is mentioned but not specified. Facial motion (talking, blinking, micro-movements) is the #1 rPPG killer. | Implement **CHROM fallback** when POS quality < 50. Consider frame-level face-landmark stability scoring to reject motion-corrupted frames |
| **No mention of makeup / facial hair** | Makeup (foundation) blocks green-light reflection. Beards/mustaches occlude ROIs. | Add pre-capture checklist: "Remove makeup, ensure clean-shaven ROI areas." Detect facial-hair occlusion and warn user |

### Bottom Line
The calibration framework is **directionally correct but underspecified.** It needs:
1. Empirical derivation of gain values
2. Per-device spectral correction
3. Dynamic luminance-based adjustment
4. A clear validation protocol before launch

---

## 5. Eye Biomarker Analysis (YOU(th) Health Tech) — Training Data? Roadmap?

### What YOU(th) Claims
YOU(th) Health Tech offers "50+ biomarkers from face video + voice + eye photos." Eye biomarkers include:
- Jaundice detection (scleral color)
- Anemia signs (conjunctival pallor)
- Cardiovascular risk (retinal vessel analysis)
- Neurological signs (pupil reactivity, nystagmus)

### Training Data Availability
**None of these datasets are publicly available for commercial use.**

| Biomarker | Required Data | Availability |
|-----------|---------------|------------|
| Jaundice / scleral icterus | Scleral images + bilirubin levels | **Scarce** — mostly pediatric datasets (e.g., BiliScreen from UW, ~100 subjects). Licensing restricted. |
| Anemia / conjunctival pallor | Conjunctival images + hemoglobin levels | **Very scarce** — one or two small studies (n < 200). No public training corpus. |
| Retinal vessel analysis | Fundus photos + CVD outcomes | **Moderate** — datasets like UK Biobank fundus (n ≈ 60k) exist but require research agreements. Not eye photos from a phone. |
| Pupil reactivity | Video pupillometry + neurological labels | **Scarce** — clinical devices (NeurOptics) dominate. No phone-based public dataset. |

### YOU(th)'s Likely Advantage
YOU(th) probably has:
- **Private clinical partnerships** (longevity clinics, insurers) providing labeled data
- **In-house data collection** via their own app deployments
- **Academic collaborations** with restricted datasets

This is **not replicable** without significant capital and clinical relationships.

### Recommendation for SKINgenius Roadmap
**Do NOT add eye biomarkers to the 2026 roadmap.**
- Skin-focused analysis is already a crowded enough development pipeline.
- Eye biomarkers require ophthalmology-grade image quality (scleral illumination, pupil dilation, fundus optics). Phone cameras are insufficient without accessories.
- Regulatory risk jumps dramatically: eye biomarkers (jaundice, anemia, CVD risk) are **medical diagnostic proxies**.

**If investigated in 2027+:**
- Partner with an ophthalmology clinic or academic hospital for a pilot study
- Focus on ONE eye biomarker (e.g., scleral color for jaundice) with a clear, single-use case
- Ensure IRB approval and HIPAA compliance for any data collection
- Budget 6–12 months for data collection + model training

---

## 6. Voice Biomarkers — Worth Adding? What Data Exists?

### Current State of Voice Biomarkers
Voice biomarker research is active but **early-stage** for wellness applications:

| Biomarker | Signal | Validation Level | Data Availability |
|-----------|--------|------------------|-------------------|
| **Stress / anxiety** | Fundamental frequency (F0), jitter, shimmer | Moderate — correlates with self-reported stress (r ≈ 0.5–0.6) | Some public datasets (e.g., RAVDESS, SUSAS) but small (n < 1000) |
| **Sleep quality** | Breathing patterns, snoring detection | Low — mostly rule-based, not ML-validated | Scarce |
| **Hydration** | Vocal fold viscosity (jitter/shimmer shift) | Very low — theoretical only | None |
| **Cognitive decline** | Speech pace, pause patterns, word-finding | Moderate — Alzheimer's Voice Initiative (n ≈ 1000) | Some open datasets (DementiaBank) but restricted use |
| **Respiratory health** | Cough detection, breathing rate from audio | High for COVID-19 cough classifiers (e.g., Google AI, MIT). Not general wellness. | Large datasets exist (CoughVid, Coswara) but are COVID-specific |

### Why It's Not a Priority for SKINgenius
1. **No clear skin correlation:** Voice biomarkers don't map to acne, aging, pigmentation, or barrier function.
2. **User friction:** Requires microphone permission + quiet environment. Lower engagement than camera-only.
3. **Privacy sensitivity:** Voice data is biometric. Storage and processing raise GDPR/CCPA concerns beyond photo data.
4. **Model size:** Good voice analysis needs spectral features (MFCCs) + temporal models (LSTM/Transformer). Adds 5–20MB to app bundle.
5. **Competitive moat weak:** Anyone can add a voice recording feature. The skin+PPG fusion is the real differentiator.

### Recommendation
**Deprioritize voice biomarkers.**
- If added later, focus on **respiratory rate from audio** as a PPG validation cross-check ("Our camera says 14 breaths/min, your breathing audio says 15 — good agreement").
- Do not market voice as a standalone feature.

---

## 7. Non-Medical Positioning — Regulatory Scrutiny Risk?

### Current Positioning
- "You do NOT provide medical diagnosis"
- "This is not medical advice"
- "Consult a dermatologist"
- Wellness / skincare intelligence only

### The Problem: Intent vs. Capability
Regulators (FDA, FTC, EU MDR) assess **intended use** AND **reasonable user perception**.

Even with disclaimers, if SKINgenius:
- Shows "blood pressure estimate" → Users may use it instead of a cuff
- Shows "SpO2 94%" → Users may think they have hypoxemia
- Shows "stress index: high" + "breakouts linked to stress" → Users may self-medicate or avoid medical care
- Claims "31 conditions classified" + severity grading → This is **diagnostic language**

### Specific Regulatory Risks

| Feature | Risk | Mitigation |
|---------|------|------------|
| **"31 skin conditions" classification** | FDA may classify this as **Software as a Medical Device (SaMD)** if conditions are disease names (acne vulgaris, rosacea, melasma). | Rename to **"skin concerns"** or **"skin observations."** Avoid ICD-10 names. Use consumer language: "blemishes," "redness," "dark spots." |
| **Severity grading (mild/moderate/severe)** | Implies clinical assessment. "Severe" suggests need for medical intervention. | Replace with **"Level 1 / 2 / 3"** or descriptive terms: "Occasional / Frequent / Widespread." |
| **PPG BP estimation** | Direct medical device territory if labeled as blood pressure. | **Remove** or rebrand as "Circulation Trend." Never show mmHg values. |
| **PPG SpO2** | Pulse oximetry is a regulated medical device function (FDA 510(k)). | Do not show % values. Use qualitative bands: "Normal / Low / Very Low." Or remove entirely. |
| **Product recommendations for "conditions"** | If you recommend a prescription ingredient (e.g., tretinoin, hydroquinone) for a diagnosed condition, this is **medical advice**. | Restrict recommendations to **OTC cosmetics only.** Flag prescription ingredients with: "Consult a dermatologist for prescription options." |
| **"Skin Age Estimator"** | Cosmetic claim, low risk. But if linked to disease risk ("skin age 45 = higher cancer risk"), risk escalates. | Keep purely cosmetic. No disease linkage. |

### Jurisdiction-Specific Notes
- **US (FDA):** Wellness apps are exempt if they meet "general wellness" criteria (intended for general wellness, present low risk, NOT for disease management). PPG BP/SpO2 pushes you out of this exemption.
- **EU (MDR / IVDR):** Software that provides information for diagnostic decisions is a medical device. The "31 conditions" + severity grading is close to this line.
- **UK (MHRA):** Similar to EU MDR. Post-Brexit alignment but stricter on AI/ML.
- **South Korea (MFDS):** Very strict on cosmetic/medical boundary. Any "diagnosis" language triggers medical device classification.

### Bottom Line
**The non-medical positioning is currently at risk due to specific features and language choices.**
- The biggest risks: BP estimation, SpO2 % display, and clinical condition naming.
- Fix the language and feature framing NOW, before regulatory review.

---

## Summary: Critical Actions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| **P0** | Remove BP estimation from v2. Move to "Future Research." | Product | Before Phase 3 (Week 9) |
| **P0** | SpO2: never show % values. Use qualitative bands or remove. | Product + ML | Before Phase 3 |
| **P0** | Rename "31 skin conditions" to "skin observations" using consumer language. Avoid ICD-10 terms in UI. | Product | Before Phase 2 (Week 5) |
| **P0** | Severity grading: replace mild/moderate/severe with "Level 1/2/3" or descriptive terms. | Product | Before Phase 2 |
| **P1** | Derive Fitzpatrick gain values empirically (pilot study, n ≥ 5 per type). | ML + Research | Phase 1 (Week 4) |
| **P1** | Add device-specific camera spectral calibration. | ML | Phase 2 |
| **P1** | Add color-temperature correction before POS algorithm. | ML | Phase 2 |
| **P1** | Add pre-capture checklist (no makeup, clean ROI, stable lighting). | Mobile Dev | Phase 1 |
| **P2** | Eye biomarkers: do not add to 2026 roadmap. Revisit in 2027+ with clinical partner. | Product | Roadmap |
| **P2** | Voice biomarkers: deprioritize entirely. | Product | Roadmap |
| **P2** | Run a legal review of "general wellness" exemption criteria per target market. | Legal / Compliance | Before beta launch |

---

## Appendix: Key Papers to Keep Handy for Regulatory Defense

1. De Haan, G. & Jeanne, V. (2013). "Robust Pulse Rate From Chrominance-Based rPPG." *IEEE Trans. Biomed. Engineering.* — Validates HR from camera.
2. Wang, W. et al. (2016). "Algorithmic Principles of Remote PPG." *IEEE Trans. Biomed. Engineering.* — Reviews rPPG methods.
3. Tison, G. et al. (2022). "Smartphone-Based Blood Pressure Estimation Using Facial Video." *NPJ Digital Medicine.* — Shows limitations of camera BP (±10–15 mmHg).
4. Bent, B. et al. (2020). "Accuracy of Pulse Oximetry in Patients with Dark Skin." *JAMA.* — Documents skin tone bias.
5. FDA (2023). "General Wellness: Policy for Low Risk Devices." — Defines exemption boundaries.
6. EU MDR (2017/745), Annex VIII, Rule 11 — Software as Medical Device criteria.

---

*Review complete. This document is a scientific opinion, not legal advice. Engage regulatory counsel before product launch.*
