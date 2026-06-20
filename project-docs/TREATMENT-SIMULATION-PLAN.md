# SKINgenius Treatment Simulation — Training Data & Model Plan

> **Created:** 2026-06-10
> **Owner:** Che (Orchestrator) + SKINgenius Team
> **Status:** Planning → Research Phase

---

## Executive Summary

SKINgenius will offer AI-powered treatment simulation: users scan their face, and the app generates realistic "after treatment" visualizations. This requires training a hybrid model combining 3D mesh deformation (structural changes) with neural rendering (skin texture changes).

## Business Model (Approved by Jason)

| Component | Approach |
|-----------|----------|
| User scans | **Free** (not gatekeepy like AI Aesthetics) |
| Monthly cap | Soft limit to control costs — generous enough to not frustrate |
| Revenue | Referral fees from practitioners + manufacturer partnerships |
| Provider network | **Certified providers only** — ensures quality, drives manufacturer training revenue |
| Product placement | Manufacturers promote products in-app, target scanned users |

### The Ecosystem
```
Manufacturer partners (fillers, skincare brands)
        ↓ promote their products in-app
SKINGENIUS (free scans, treatment recommendations)
        ↓ refer users to certified providers
Certified practitioners (pay referral fees)
        ↑ better experience = more conversions
Manufacturers sell training to become "certified"
```

### UX Flow (Post-Scan Choice)
After scan completes, ask user:
- **🤖 Get Recommendations** → AI analyzes scan → surfaces areas of interest → suggests treatments
- **✋ Choose Myself** → User taps zones directly → browses available treatments for that area

---

## Technical Architecture: Hybrid Approach

### Phase 1: STRUCTURE (3D Mesh Foundation)
- Download FLAME (Faces Learned Asymmetric Morphable Expression) mesh model
- Build 3D face reconstruction pipeline from existing landmark detection (37 points)
- Apply synthetic volume deformations to simulate filler effects
- Generate 10,000+ synthetic before/after pairs using FEM (Finite Element Method)
- Baseline mesh for all subsequent training

### Phase 2: BASE TRAINING (Pristine Paired Data)
- Scrape FDA product monographs (Juvéderm, Restylane, Sculptra approval docs)
- Scrape PMC open-access papers (MeSH: "Dermal Fillers/therapeutic use" AND "Photography/methods")
- Target journals: Aesthetic Surgery Journal, Plastic & Reconstructive Surgery, Dermatologic Surgery
- Clean, normalize, tag by treatment type
- Train pix2pix/CUT network on pristine paired data
- **Start with Botox** (most data available, most requested)

### Phase 3: REAL-WORLD REFINEMENT
- Scrape practitioner galleries (RealSelf, clinic websites)
- Add lighting/angle/expression variations
- Train neural renderer for texture + lighting robustness
- Fine-tune per skin tone, age range, treatment type

---

## Training Data Sources

### Tier 1: Publicly Available (No partnerships needed)

| Source | What | Quality | Volume | Action |
|--------|------|---------|--------|--------|
| FDA product monographs | Clinical trial photos for approved products | High (controlled) | Medium | Scrape approval docs |
| PMC Open Access | Published clinical study photos with annotations | High | Medium | Programmatic scrape via MeSH |
| FLAME/BFM meshes | 3D morphable face models | N/A (3D) | 1 model | Download from GitHub |
| RealSelf / clinic sites | Patient before/after galleries | Low-Medium (variable) | High | Web scrape |
| Manufacturer websites | Marketing before/after photos | Medium | Medium | Scrape |

### Tier 2: Requires Partnerships

| Source | What | Who | What We Offer |
|--------|------|-----|---------------|
| Clinical trial imagery | Standardized, high-fidelity pairs | Allergan/Galderma research portals | Product visibility to scanned users |
| EMR/practice software | Clinic patient photos | Med spa software providers | Beta features, analytics |
| Manufacturer datasets | Structured before/after with metadata | Direct manufacturer deals | Certified provider network |

### Tier 3: Synthetic Augmentation

| Method | What | Tool |
|--------|------|------|
| FEM soft tissue simulation | Synthetically deform 3D meshes to simulate filler volume | OpenCV + FLAME + custom FEM |
| Expression augmentation | Generate dynamic expression pairs (rest vs. max smile) | FLAME expression parameters |
| Skin tone augmentation | Vary lighting/skin tones across pairs | Neural style transfer |

---

## Technical Requirements

### Data Requirements Per Treatment Type

| Treatment | Deformation Type | Key Data Needed |
|-----------|-----------------|-----------------|
| **Botox (forehead)** | Dynamic — muscle relaxation | Before/after at rest AND max expression |
| **Botox (crow's feet)** | Dynamic — lateral orbicularis oculi | Smile expression pairs |
| **Filler (lips)** | Static — volume increase | Neutral face, profile + frontal |
| **Filler (cheeks)** | Static — midface volume | Neutral face, 3/4 angle |
| **Filler (jawline)** | Static — structural contour | Profile view critical |
| **Laser resurfacing** | Texture — skin quality | Close-up, controlled lighting |
| **Thread lifts** | Static — tissue repositioning | Before/after, frontal + profile |

### Critical: Expression Pairs
- Botox relaxes muscles → need before/after at rest AND at maximum expression
- Filler adds volume → need before/after at rest (neutral)
- Model must learn both static and dynamic deformations

### 3D Mesh Models (Open Source)
- **FLAME** — https://github.com/TimoBFLworworking/FLAME — asymmetric morphable expression
- **BFM (Basel Face Model)** — https://faces.dmi.unibas.ch/bfm/ — statistical face model
- **MediaPipe Face Mesh** — 468 landmarks (we already have 37, need to upgrade)

---

## Model Architecture

### Hybrid Pipeline
```
Input: User selfie + treatment selection
        ↓
Step 1: 3D Face Reconstruction (FLAME mesh from photo)
        ↓
Step 2: Structural Deformation (filler volume, lift direction)
        ├── FEM simulation for filler effects
        └── Mesh warping for tissue repositioning
        ↓
Step 3: Neural Texture Rendering (skin quality, Botox smoothing)
        ├── pix2pix/CUT network for photorealistic output
        └── Conditioned on treatment type + zone
        ↓
Output: Simulated "after treatment" image
```

### Training Pipeline
```
Phase 1: Pre-train on synthetic FLAME deformations (unlimited data)
Phase 2: Fine-tune on FDA/PMC pristine pairs (high quality, limited)
Phase 3: Fine-tune on real-world scraped data (noisy, high volume)
Phase 4: Per-treatment fine-tuning (Botox, filler, laser, etc.)
```

---

## Competitive Analysis Reference

### AI Aesthetics Face Cosmetics
- ✅ Better scan visualization (face mesh, zone highlights)
- ✅ Before/After toggle
- ❌ AI-recommends only — no direct user selection
- ❌ Limited free scans (paywall)
- ❌ Affiliate-heavy ($150 off Botox promos on every screen)

### SKINgenius Differentiators
1. Free scans with monthly cap (not paywalled)
2. User choice: AI recommendations OR direct zone selection
3. Certified provider network (quality guarantee)
4. Manufacturer partnerships (product placement, training revenue)
5. Treatment simulation (see before you book)

---

## Research Phase — COMPLETED 2026-06-10

### Reports Delivered
- ✅ `research/3d-mesh-models-evaluation.md` — FLAME 2023 Open recommended (CC BY 4.0)
- ✅ `research/training-data-sources-audit.md` — Multi-pronged strategy, ~600-900 real pairs available
- ✅ `research/image-translation-models-evaluation.md` — Hybrid pipeline: FLAME deformation + CUT/diffusion rendering

### Key Decisions from Research
- **Mesh:** FLAME 2023 Open (free, commercial) + MediaPipe (landmarks)
- **Translation:** CUT for unpaired + SimGAN for synthetic→real + IP-Adapter diffusion for photorealism
- **Identity:** ArcFace verification gate
- **Data:** FDA SSEDs first (~500 pairs), then synthetic FLAME generation (10,000+), then manufacturer partnerships
- **Legal:** Training-only use, no PHI storage, same basis as face-swap/aging apps

---

## Phase 2: Architecture & Pipeline Build

### Agent Assignments

| Task | Agent | Priority |
|------|-------|----------|
| Design FLAME → treatment deformation pipeline | skingenius-architect (Dermis) | 🔴 High |
| Build FDA SSED PDF scraper for clinical photos | skingenius-data (Core) | 🔴 High |
| Download + configure FLAME 2023 Open model | skingenius-data (Core) | 🔴 High |
| Manufacturer partnership strategy + outreach plan | skingenius-ceo (Nova) | 🟡 Medium |
| Prototype synthetic before/after generation | skingenius-ai (Lens) | 🟡 Medium |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-10 | Hybrid approach (3D mesh + neural rendering) | Best balance of controllability and realism |
| 2026-06-10 | Free scans with monthly cap + referral revenue | User-friendly, monetized via practitioner/manufacturer fees |
| 2026-06-10 | Certified providers only | Quality control, manufacturer training revenue stream |
| 2026-06-10 | Post-scan choice (recommend vs. select) | Respects user agency, serves both newbies and informed users |
| 2026-06-10 | Start with Botox training data | Most publicly available data, highest demand |
| 2026-06-10 | Legal: training-only use, no PHI storage | Photos used solely to train predictive model for outcome visualization. Not storing patient data, not processing PHI, not a medical device. Same legal basis as face-swap/aging apps. |
