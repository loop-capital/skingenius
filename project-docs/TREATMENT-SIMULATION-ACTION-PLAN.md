# SKINgenius Treatment Simulation — Master Action Plan

> **Compiled:** 2026-06-10
> **Status:** Research Complete → Architecture Defined → Ready for Build
> **FLAME 2023 Open:** ✅ Downloaded + Verified (5,023 vertices, 100 expression blendshapes, 400 shape params)

---

## Executive Summary

SKINgenius will offer AI-powered treatment simulation: users scan their face and see realistic "after treatment" visualizations. The system combines 3D mesh deformation (FLAME 2023 Open) with neural texture rendering (CUT/diffusion) to generate photorealistic predictions.

**Business model:** Free scans (monthly cap), revenue via practitioner referral fees + manufacturer product placement. Certified providers only.

**UX flow:** Post-scan choice — "Get Recommendations" (AI-driven) or "Choose Myself" (direct zone selection).

---

## What's Been Completed (Phase 1 + Phase 2)

### Research Reports Delivered
| Report | File | Key Finding |
|--------|------|-------------|
| 3D Mesh Models | `research/3d-mesh-models-evaluation.md` | FLAME 2023 Open (CC BY 4.0) — only free commercial 3DMM |
| Training Data Sources | `research/training-data-sources-audit.md` | ~600-900 real pairs from FDA + synthetic pipeline needed |
| Image Translation Models | `research/image-translation-models-evaluation.md` | Hybrid: FLAME deformation + CUT/diffusion rendering |

### Architecture & Strategy Delivered
| Document | File | Key Content |
|----------|------|-------------|
| Treatment Deformation Pipeline | `architecture/treatment-deformation-pipeline.md` | FLAME param mapping per treatment, 4 API endpoints, <3.5s latency |
| Manufacturer Partnership Strategy | `strategy/manufacturer-partnership-strategy.md` | Outreach plan, tiers, $1.5M-$4M Y1 revenue projection |
| FDA Scraper | `tools/fda_scraper.py` | Extracts clinical photos from FDA PDFs |
| FLAME Model | `data/models/flame/flame2023_Open.pkl` | ✅ Verified, ready for pipeline integration |

### Data Extracted
- **69 clinical images** from 4 FDA documents (Juvéderm Voluma, Volbella, Volux, Sculptra)
- Organized in `data/raw/fda/[product]/[before|after]/`
- Manifest CSV at `data/raw/fda/manifest.csv`

---

## Technical Architecture (Approved)

### The Hybrid Pipeline
```
User Selfie
    ↓
MediaPipe Face Mesh (real-time landmarks, on-device)
    ↓
FLAME 2023 Open Reconstruction (3D mesh from photo)
    ↓
Treatment-Specific Deformation
├── Botox: Expression θ blendshapes (100-dim), dynamic rest+expression pairs
├── Fillers: Identity β shape params (300-dim), volume addition
├── Laser: No mesh change, pure texture via diffusion
└── Thread lifts: Both β + θ, tissue repositioning
    ↓
Neural Texture Rendering (CUT + IP-Adapter + ControlNet)
    ↓
ArcFace Identity Verification Gate (cosine similarity >0.75)
    ↓
Photorealistic "After Treatment" Image
```

### FLAME Parameter Mapping
| Treatment | FLAME Params | Clinical Baseline |
|-----------|-------------|-------------------|
| Botox (forehead) | θ expression blendshapes | 20 units → Δθ ≈ -0.5 |
| Botox (crow's feet) | θ (orbicularis oculi region) | Dynamic pairs required |
| Filler (lips) | β shape (300-dim) | 1mL → Δβ ≈ +0.6 |
| Filler (cheeks) | β shape | 2mL/side → Δβ ≈ +0.6 |
| Filler (jawline) | β shape | 1.5mL/side → Δβ ≈ +0.4 |
| Laser resurfacing | None (texture only) | IP-Adapter intensity 1-5 |
| Thread lifts | β + θ | 4-8 threads → Δβ ≈ +0.5 |

### API Endpoints
| Endpoint | Latency | Purpose |
|----------|---------|---------|
| `POST /api/v1/simulation/reconstruct` | ~800ms | Selfie → 3D mesh |
| `POST /api/v1/simulation/preview` | ~2.5s | Treatment simulation |
| `POST /api/v1/simulation/3d-preview` | ~5s | Premium rotatable 3D |
| `GET /api/v1/simulation/treatments` | Cached | Treatment catalog |

### Performance Targets
- <3.5s end-to-end (p95)
- ~$0.005/simulation (primary), ~$0.001 (fallback)
- 3,600 sims/hour steady, 14,400 peak

---

## Business Model

### Revenue Streams
| Stream | Model | Projected Y1 |
|--------|-------|-------------|
| Practitioner referral fees | $30-$500 per booking | $360K–$1.2M |
| Product placement | $5K-$50K/month per manufacturer | $300K–$1.5M |
| Certification program | 60/40 revenue share | $120K–$300K |
| Data insights subscriptions | Anonymized demand data | $240K–$600K |
| **Total Year 1** | | **$1.02M–$3.6M** |

### Manufacturer Partnership Tiers
| Tier | Type | Annual Min | Target Partners |
|------|------|-----------|----------------|
| 1 | Data sharing only | $0 | Revance, Evolus (pilot) |
| 2 | Product placement | $60K–$180K | Merz, Galderma |
| 3 | Full strategic | $300K–$600K | Allergan (after proof) |

### Outreach Sequence
1. **Revance + Evolus** (new entrants, eager for distribution)
2. **Merz + Suneva** (months 4-6)
3. **Galderma** (acknowledge FACE by Galderma — provider-facing, we fill consumer gap)
4. **Allergan last** (hardest, biggest impact)

### UX Flow
Post-scan choice:
- 🤖 **Get Recommendations** → AI analyzes scan → surfaces areas → suggests treatments
- ✋ **Choose Myself** → User taps zones → browses available treatments

### Legal Position
Photos used solely to train predictive model for outcome visualization. No patient data storage, no PHI processing, not a medical device. Same legal basis as face-swap/aging apps.

---

## Phase 3: Build & Prototype (Next)

### Immediate Tasks (Weeks 1-2)

| # | Task | Agent | Priority | Dependencies |
|---|------|-------|----------|-------------|
| 1 | Build synthetic before/after generator using FLAME | skingenius-ai (Lens) | 🔴 High | FLAME model ✅ |
| 2 | Expand FDA scraper to all remaining Juvéderm/Restylane docs | skingenius-data (Core) | 🔴 High | Scraper ✅ |
| 3 | Scrape PMC open-access papers for additional training pairs | skingenius-research (Sage) | 🔴 High | — |
| 4 | Set up CUT training pipeline (PyTorch) | skingenius-dev (Pixel) | 🟡 Medium | — |
| 5 | Build FLAME → treatment deformation PoC (one treatment type) | skingenius-architect (Dermis) | 🟡 Medium | FLAME ✅ |
| 6 | Begin manufacturer outreach (Revance first) | skingenius-ceo (Nova) | 🟡 Medium | Strategy doc ✅ |

### Medium-Term Tasks (Weeks 3-6)

| # | Task | Agent | Priority |
|---|------|-------|----------|
| 7 | Train initial CUT model on synthetic + FDA data | skingenius-ai (Lens) | 🔴 High |
| 8 | Build ArcFace identity verification gate | skingenius-ai (Lens) | 🟡 Medium |
| 9 | Prototype mobile API (4 endpoints) | skingenius-dev (Pixel) | 🟡 Medium |
| 10 | Design scan → zone selection UI | skingenius-design (Aura) | 🟡 Medium |
| 11 | Build certification program framework | skingenius-ceo (Nova) | 🟡 Medium |

### Long-Term Tasks (Months 2-4)

| # | Task | Agent | Priority |
|---|------|-------|----------|
| 12 | Fine-tune model on real-world practitioner photos | skingenius-ai (Lens) | 🔴 High |
| 13 | Per-treatment model specialization | skingenius-ai (Lens) | 🟡 Medium |
| 13 | Mobile integration (React Native) | skingenius-dev (Pixel) | 🟡 Medium |
| 14 | 3D Gaussian Splatting for premium rotatable preview | skingenius-ai (Lens) | 🟢 Low |
| 15 | Manufacturer data integration (when partnerships close) | skingenius-data (Core) | 🟡 Medium |

---

## Key Milestones

| Milestone | Target | Dependencies |
|-----------|--------|-------------|
| Synthetic generation PoC | Week 2 | FLAME model ✅ |
| 1,000+ training pairs generated | Week 3 | Synthetic PoC |
| Initial CUT model trained | Week 4 | Training data |
| First treatment simulation working | Week 6 | CUT model + FLAME deformation |
| Mobile API prototype | Week 8 | Simulation working |
| Manufacturer partnership signed | Month 3 | Outreach + demo |
| Beta launch (Botox only) | Month 4 | All above |
| Full treatment catalog | Month 6 | Per-treatment fine-tuning |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| FLAME deformation doesn't look realistic | High | Synthetic pre-training + SimGAN domain adaptation |
| Identity drift in simulations | High | ArcFace gate (>0.75), 5-layer identity preservation |
| Insufficient training data | Medium | Synthetic augmentation (10,000+ pairs from FLAME) |
| Manufacturer partnerships slow | Medium | Start with public data, partner when we have demo |
| Mobile inference too slow | Medium | Server-side primary, on-device fallback for preview |
| Legal challenge on training data | Low | Public domain sources, no PHI, training-only use |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-10 | Hybrid approach (3D mesh + neural rendering) | Best balance of controllability and realism |
| 2026-06-10 | Free scans with monthly cap + referral revenue | User-friendly, monetized via practitioner/manufacturer fees |
| 2026-06-10 | Certified providers only | Quality control, manufacturer training revenue stream |
| 2026-06-10 | Post-scan choice (recommend vs. select) | Respects user agency, serves both newbies and informed users |
| 2026-06-10 | Start with Botox training data | Most publicly available data, highest demand |
| 2026-06-10 | FLAME 2023 Open as primary mesh model | Only free commercial 3DMM, 100 expression blendshapes |
| 2026-06-10 | Legal: training-only use, no PHI storage | Same basis as face-swap/aging apps |
| 2026-06-10 | Revance/Evolus first for manufacturer outreach | Newer entrants, easier to get, build proof before Allergan |

---

## Files Delivered

```
skingenius/
├── project-docs/
│   ├── TREATMENT-SIMULATION-PLAN.md          # Original plan
│   ├── TREATMENT-SIMULATION-ACTION-PLAN.md   # This file (master)
│   ├── research/
│   │   ├── 3d-mesh-models-evaluation.md      # FLAME vs BFM vs alternatives
│   │   ├── training-data-sources-audit.md    # FDA, PMC, web, synthetic sources
│   │   ├── image-translation-models-evaluation.md  # pix2pix, CUT, SimGAN, diffusion
│   │   └── flame-setup-notes.md              # FLAME installation guide
│   ├── architecture/
│   │   └── treatment-deformation-pipeline.md # Core technical spec (64KB)
│   └── strategy/
│       └── manufacturer-partnership-strategy.md  # Outreach + revenue model
├── tools/
│   ├── fda_scraper.py                        # FDA PDF image extractor
│   └── verify_flame.py                       # FLAME model verification
└── data/
    ├── raw/fda/                              # 69 extracted clinical images
    │   ├── manifest.csv
    │   └── [product]/[before|after]/
    └── models/flame/
        ├── flame2023_Open.pkl                # ✅ FLAME 2023 Open model
        └── FLAME2023_Open Readme.pdf
```
