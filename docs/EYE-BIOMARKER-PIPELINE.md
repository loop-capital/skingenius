# Eye Biomarker Pipeline — SKINgenius

> **Date:** 2026-05-30
> **Status:** RESEARCH — Phase 4 roadmap item
> **Source:** Jason's research + YOU(th) Health Tech analysis

---

## How It Works

### The Science
Chronic high blood sugar alters systemic microcirculation. The concentration, twisting (tortuosity), and coloration of blood vessels on the surface of the eye (sclera) change under metabolic stress. AI can analyze these visual surface patterns from smartphone photos to estimate metabolic markers like HbA1c, cholesterol, and eGFR.

### Two Camera-Based Techniques

**1. Eye Photo (Sclera & Blood Vessels)**
- Close-up photo of the eye using phone camera
- AI analyzes the sclera (white of eye) and surface blood vessels
- NOT a clinical retinal scan (no specialized lenses needed)
- Vessel concentration, tortuosity, and coloration correlate with metabolic health
- Outputs: "Average Glucose Index" (HbA1c proxy), cholesterol estimate

**2. Face Video (PPG Light Reflection)**
- 30-60 second face video
- Detects microscopic color changes from blood pulsing through facial capillaries
- UCSF Tison Lab validated: flagged diabetic patients 72%+ of the time
- Connects vascular damage patterns to diabetes risk

---

## Data Acquisition Strategy

### Phase 1: Segmentation Training Data (Weeks 1-2)
Train model to segment sclera and isolate blood vessels from smartphone images.

| Dataset | Description | Size | License |
|---------|-------------|------|---------|
| **MOBIUS** | 16,000+ RGB eye images on mobile devices, unconstrained lighting, pixel-level sclera masks | 16K+ images | Open |
| **CUVIRIS / KartalOl** | Smartphone ocular capture, quality-assured, edge cases (blur, gaze, pigmentation) | Recent 2025/2026 | Open |
| **SBVPI** | DSLR sclera vasculature annotations, detailed vessel geometry | Smaller, high-quality | Open |

### Phase 2: Metabolic Correlation Training (Weeks 3-4)
Train prediction layer — map vascular features to systemic biomarkers.

| Dataset | Description | Key Feature |
|---------|-------------|-------------|
| **ODIR-5K** | 5,000 patients, age + ocular profiles + systemic labels (diabetes, hypertension) | Multi-label classification |
| **IDHea** | 420,000+ images from primary care with screening data | Largest real-world collection |
| **UK Biobank** | Anterior segment photos + metabolic panels + genomic data | Requires institutional access |

### Phase 3: Local Data Collection (Parallel Sprint)
iPhone-specific calibration to bridge domain gap between clinical cameras and phone sensors.

**Ambient Subtraction Technique (from neonatal jaundice screening):**
1. Take rapid-fire image pair: one with TrueTone flash, one without
2. In linear RAW (.DNG) space, subtract no-flash from flash matrix
3. Isolates raw RGB sclera reflective response, removes ambient room light
4. Bypasses hardware variance between iPhone models

**Micro-Sourcing Protocol:**
- 50-100 individuals with diverse metabolic baselines
- iPhone 15/16 Pro Max macro-mode eye photos
- Concurrent finger-prick metabolic tests (glucose, ketone, lipid panels)
- Track continuously over 2 weeks
- Better than 10,000 sterile clinical fundus photos for mobile validation

---

## Proposed Architecture

```
[iPhone RAW Image Pair (Flash / No-Flash)]
 │
 ▼
 [Ambient Light Subtraction] (Normalizes RGB Space)
 │
 ▼
 [MOBIUS/CUVIRIS Pre-trained U-Net] (Isolates Sclera & Vascular Bed)
 │
 ▼
 [ODIR / Local Bio-Marker Fine-Tuning] (Predicts Metabolic Outputs)
 │
 ▼
 [SKINgenius Integration] → "Your eye patterns suggest possible metabolic stress.
                              Consider checking your HbA1c."
```

---

## Wellness Positioning (Critical)

**What we CAN say:**
- "Your vascular patterns and eye vessel density match someone with insulin resistance"
- "Consider seeing a doctor to check your HbA1c"
- "Your eye health suggests possible metabolic stress"

**What we CANNOT say:**
- "Your HbA1c is 5.7%"
- "You have diabetes"
- "Your cholesterol is X"

**Legal protection:** Wellness app, not medical device. Proxy data, not diagnosis.

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Segmentation model | 2 weeks | U-Net that isolates sclera + vessels from phone photos |
| Metabolic correlation | 2 weeks | Model that predicts metabolic risk from vessel features |
| Local data collection | Parallel | 50-100 person dataset with iPhone + lab markers |
| Integration | 2 weeks | SKINgenius eye scan feature |
| **Total** | **6 weeks** | Prototype eye biomarker feature |

---

## References

1. UCSF Tison Lab — Smartphone PPG for diabetes detection (72%+ accuracy)
2. Lancet Digital Health 2023 — Google Health eye photo → systemic biomarkers
3. Neonatal jaundice screening — ambient subtraction technique
4. MOBIUS dataset — mobile ocular biometrics
5. ODIR-5K — ocular disease + systemic conditions
