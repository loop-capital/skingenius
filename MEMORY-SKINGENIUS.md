# MEMORY-SKINGENIUS.md — SKINgenius Team Memory

> **Last updated:** 2026-05-30
> **Identity:** I am SKINgenius 🧬 — Skin Health Intelligence Platform
> **Workspace:** `/home/jason/.openclaw/workspaces/skingenius/`

---

## 🚨 CRITICAL: Workspace Isolation
**NEVER contaminate other workspaces. Read ONLY this file for SKINgenius context.**

---

## Current Status

### Database (May 23, 2026) — ✅ COMPLETE
- **Ingredients:** 103 ✅ (108 total, 5 are supplements that belong in supplements table)
- **Conditions:** 31 ✅
- **Products:** 236 ✅
- **Root causes:** 90 ✅
- **Mechanisms:** 90 ✅
- **Supplements:** 30 ✅ (separate table)
- **Cause links:** 130 ✅
- **Mechanism chains:** 122 ✅

### Vision Model Stack — ✅ BOTH TIERS READY
| Tier | Model | Cost | Status |
|------|-------|------|--------|
| **Free** | **Gemma 2B on-device** | **$0** | ✅ Downloaded, tested, working |
| **Pro** | **GPT-4o Vision API** | **~$0.005/scan** | ✅ API key verified, ready to build |

**API Key:** Stored securely in `.env.local`
**Available Models:** gpt-4o, gpt-4o-2024-05-13, gpt-4o-mini, gpt-4o-mini-2024-07-18, gpt-4o-2024-08-06

### Primary Objective
Analyze skin conditions → Recommend products, services, lifestyle changes → Help resolve issues

**Secondary (Viral):** Skin Age Estimator with photo sharing

---

## Active Tasks

### 🔄 Skin Age Estimator ENHANCED with Viral Components (May 27, 2026) — ✅ COMPLETE
- **Owner:** SKINgenius
- **Feature built:** Complete Skin Age Estimator with viral sharing capability
- **New files created:**
  - `src/components/skin-age/SkinAgeHero.tsx` — Beautiful landing hero with drag-and-drop selfie upload, camera/gallery buttons, privacy notice
  - `src/components/skin-age/SkinAgeResult.tsx` — Animated result card with counter animation, tabbed breakdown (factors vs tips), improvement potential CTA, funnel to full scan
  - `src/components/skin-age/SkinAgeShare.tsx` — Social share card generator with Instagram/Twitter/TikTok share buttons, download PNG, copy caption, QR code
  - `src/app/api/v1/skin-age/route.ts` — Complete API endpoint with free tier (deterministic mock) and Pro tier (GPT-4o Vision)
- **Integration:**
  - Updated `src/app/skin-age/page.tsx` — Full landing experience with hero, how-it-works, social proof, and CTA sections
  - Integrated with existing `PhotoUpload`, `AnalysisAnimation`, `ResultsCard`, `ShareCard` components
- **Design:** Clean, clinical-meets-beautiful, soft gradients, skin tones, soft pinks, clinical whites
- **Build:** ✅ Passes (0 errors)
- **TypeScript:** ✅ Passes (0 errors)
- **Dependencies added:** `framer-motion` for animations

### Skin Wellness Plan — DESIGN IN PROGRESS (June 13, 2026)
**Status:** Spec COMPLETE — 1156 lines, 64KB
**Concept:** Generate personalized wellness plans optimizing skin + cellular health

#### Core Components (confirmed)
1. **Diet Protocol** — Low glycemic, anti-inflammatory (limits glycation/AGEs)
2. **Supplement Stack** — Berberine, Vitamin D3, DHA/EPA, CoQ10/PQQ, NMN/NAD+, Glutathione/NAC, Collagen peptides
3. **Peptide Protocols** — Separate category from supplements, tiered by evidence/route:
   - Tier 1 (Topical): GHK-Cu, Matrixyl, Argireline
   - Tier 2 (Injectable, widely used): BPC-157, TB-500, CJC-1295/Ipamorelin, Epithalon
   - Tier 3 (Research): FOXO4-DRI, Humanin, Selank/Semax
   - Regulatory disclaimers per tier
4. **Hydration** — Personalized water intake targets
5. **Sleep Protocol** — Circadian alignment for skin repair
6. **Mitochondrial Support** — Cellular energy optimization
7. **Glycation Scoring** — HbA1c → AGE risk → skin aging connection (ADR-009)

#### NEW: 8 Additional Components (June 13)
8. **Psychodermatology** — Stress-skin connection: MBSR, CBT for skin anxiety, breathwork, biofeedback, adaptogens (ashwagandha, rhodiola)
9. **Smoking & Alcohol** — Lifestyle inputs that modify plan (oxidative stress, collagen damage, gut barrier, nutrient depletion)
10. **Medication Interactions** — SSRIs, birth control, statins, isotretinoin, metformin, GLP-1s → nutrient depletions + plan modifications
11. **Post-Procedure Recovery** — Pre/post protocols for microneedling, peels, laser, botox, filler, PRP, HIFU, thread lift
12. **Seasonal & Climate Adjustments** — Dynamic plan changes by season, climate, altitude, humidity
13. **Fitzpatrick-Specific Protocols** — UV, actives, procedures, supplements modified by skin type (I-VI)
14. **Oral Microbiome** — Oral probiotics, tongue scraping, SLS-free toothpaste → rosacea/perioral dermatitis
15. **Gut-Brain-Skin Triad** — Integrated protocols: stress → dysbiosis → permeability → inflammation → skin disease

#### Key Architecture Decisions
- Peptides = separate table from supplements
- 14 database tables total (added sun_exposure_protocols)
- 100+ seed data entries across all protocols
- Sun exposure = STRATEGIC (not avoid-all) — morning AM exposure for circadian, D3, mitochondrial, NO, serotonin; face protected during peak
- Wellness plan = output of conditions + root causes + mechanisms + lifestyle + medications + Fitzpatrick + season + procedures + sun habits
- Tiered delivery with regulatory disclaimers per tier
- 21 UI components

**Spec:** `skingenius/specs/WELLNESS-PLAN-SPEC.md` — COMPLETE (June 13, 2026) — 1221 lines
**Next:** Build Phase 1 (database schema + seed data + plan generation API + basic UI)

### Next: Build Skin Analysis Pipeline
- **Owner:** SKINGENIUS
- **Task:** Build API endpoint for skin photo analysis
- **Architecture:**
  - Free tier: Gemma 2B (directional, on-device, privacy-first)
  - Pro tier: GPT-4o Vision (clinical-grade, multi-zone)
- **Status:** Ready to start — both models available
- **ETA:** 2 hours for MVP

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-27 | Skin Age Estimator viral components built | SkinAgeHero, SkinAgeResult, SkinAgeShare with social sharing |
| 2026-05-27 | Skin Age Estimator enhanced with viral share features | Animated counters, improvement potential, social share card (Insta/Story, X/Twitter, TikTok), QR code, funnel CTA |
| 2026-05-24 | Skin Age restructured as funnel entry | Tab nav (Scan | Skin Age | Track), free tier = range, results funnel to /scan |
| 2026-05-23 | Skin Age Estimator built with mock free tier + GPT-4o Pro fallback | MVP ships now; on-device Gemma replaces mock later |
| 2026-05-23 | Hybrid model approach | Free = Gemma (privacy), Pro = GPT-4o (clinical) |
| 2026-05-23 | Gemma 2B over 4B | Smaller, faster, sufficient for directional analysis |
| 2026-05-23 | Exclude Kimi K2.6 | Closed model, cannot fine-tune |
| 2026-05-23 | Pro tier for professionals | Estheticians/dermatologists at $29-99/mo offset costs |
| 2026-05-23 | Database constraints updated | Jason ran SQL in Supabase Editor |
| 2026-05-23 | OpenAI API key obtained | Jason provided key, verified working |

---

## Blockers
**NONE** — Both models available, ingredients seeded, ready to build.

---

## Competitive Intelligence: Aesthetic Journey (June 7, 2026)
- **Competitor:** Pre-launch 2026, iOS, built by a PA with 19 years in aesthetics
- **Model:** Patient-owned, not clinic-owned (same as us)
- **6 Core Features:**
  1. Treatment & Wellness Tracker (injectables, lasers, body treatments, skincare, GLP-1, notes, costs, providers, reminders)
  2. Photo Journal & Progress Timeline (before/after, side-by-side, visual evolution)
  3. Appointment Tracker (past + upcoming, calendar integration, follow-up reminders)
  4. Educational Library (clinician-written procedure cards: mechanism, prep, recovery, complications, red flags, FAQs)
  5. Saved Articles & Cards (bookmark, compare, waiting room content)
  6. Achievements & Milestones (badges, streaks, gamification)
- **Key differentiator:** "Aesthetic IQ" — personalized insights from your own data patterns
- **Patient-owned model:** "Your data belongs to you, not any clinic"
- **GLP-1 tracking included** — wellness/body treatments, not just face
- **What SKINgenius has that they DON'T:** AI skin analysis, ingredient analysis, routine building
- **What WE need from them:** Treatment history tracker, procedure cards library, photo journal, treatment logging
- **Full spec:** `specs/AESTHETIC-JOURNEY-FEATURE-SPEC.md`

---

## Next Actions
1. ✅ Build skin analysis API endpoint (Gemma for free, GPT-4o for Pro) — DONE
2. ✅ Add Skin Age tab to main navigation (Scan | Skin Age | Track) — DONE
3. ✅ Wire Skin Age Estimator to main app layout/navigation — DONE
4. ✅ Build viral Skin Age components (Hero, Result, Share) — DONE (May 27)
5. 🔄 Test endpoint with real photos (requires dev server running + Ollama)
6. 🔄 Next: Add mobile bottom nav to Scan + Track pages for consistency
7. 🔄 Next: Integration test of full Skin Age flow (upload → analyze → share)
8. 🆕 Build Treatment History Tracker (see AESTHETIC-JOURNEY-FEATURE-SPEC.md)
9. 🆕 Build Photo Journal for treatment progress
10. 🆕 Build Procedure Cards library
11. 🆕 Build Appointment Tracker
12. 🆕 Build Achievements & Aesthetic IQ system

---

## Key Files
- `src/components/skin-age/SkinAgeHero.tsx` — Landing hero with selfie upload
- `src/components/skin-age/SkinAgeResult.tsx` — Animated result card with age score
- `src/components/skin-age/SkinAgeShare.tsx` — Social share card generator
- `src/app/api/v1/skin-age/route.ts` — Skin Age API endpoint (free + pro tiers)
- `supabase/schema.sql` — Database schema (CURRENT, 54 categories)
- `knowledge-graph/seed-data.json` — Seed data (108 items, 103 ingredients + 5 supplements)
- `scripts/seed-supabase.ts` — Seed script (fixed with transformIngredients)
- `docs/VISION-MODEL-RESEARCH.md` — Model research report
- `project-docs/ARCHITECTURE.md` — System architecture
- `specs/SKIN-CORE-AND-VIRAL.md` — Feature spec
- `.env.local` — API keys (OpenAI, Supabase)

---

## v2 Architecture — May 30, 2026

### Stack Pivot: Web → Native
- **Decision:** React Native + Expo (not Next.js web app)
- **Reason:** Camera-first product requires native iOS/Android, HealthKit integration, App Store distribution
- **Web app:** Becomes marketing site / dashboard only
- **Mobile app:** `/mobile/` directory, Expo Router, TypeScript

### Model Architecture: ViT + Gemini (replaces Gemma 4B)
- **Free tier:** Fine-tuned ViT (85MB, TFLite) on-device + rule-based recommendations
- **Paid tier:** ViT pre-scan → Gemini 2.5 Flash for deep analysis ($0.001/scan)
- **Trained model:** `training/fitzpatrick17k/model_output/best/` — 93.5% accuracy, Fitzpatrick III-VI
- **ADR-007 supersedes ADR-001** (Gemma 4B dropped — too large, immature runtime)

### Wearable Integration (replaces PPG)
- **Decision:** HealthKit/Health Connect integration, NOT phone-camera PPG
- **Reason:** Users already have Apple Watch, Oura, Whoop — clinical-grade sensors, no calibration needed
- **Biomarkers:** HR, HRV, sleep, SpO2, activity, HbA1c (future)
- **ADR-008**

### HbA1c as Key Differentiator
- **Why:** Glycation damages collagen → skin aging. No competitor connects metabolic health to skin.
- **Sources:** CGM (Dexcom, Libre), lab results, future Apple glucose
- **ADR-009**

### Key Files (v2)
- `mobile/` — React Native app (Expo)
- `mobile/app/scan.tsx` — Camera capture + analysis screen
- `mobile/lib/ml/inference.ts` — On-device ViT inference (mock → TFLite)
- `mobile/lib/health/healthkit.ts` — Wearable data integration
- `mobile/lib/supabase/client.ts` — Backend client
- `project-docs/ARCHITECTURE-V2.md` — Full architecture doc
- `project-docs/DECISIONS-V2.md` — ADR-006 through ADR-010
- `project-docs/REVIEW-PIXEL.md` — Dev review
- `project-docs/REVIEW-SAGE.md` — Research review
- `docs/PPG-RESEARCH.md` — PPG research (reference only, not building)
- `training/fitzpatrick17k/` — Training data + model

### Eye Biomarker Pipeline — Added May 30
- **What:** Smartphone eye photo → metabolic health estimation (HbA1c, cholesterol proxy)
- **How:** Sclera segmentation (MOBIUS/CUVIRIS) + vessel analysis + metabolic correlation (ODIR/IDHea)
- **Key technique:** Ambient light subtraction (flash/no-flash pairs) to normalize iPhone sensor data
- **Timeline:** 6-week sprint for prototype
- **Data sources:** MOBIUS (16K mobile eye images), ODIR-5K (5K patients + systemic labels), IDHea (420K images + screening data)
- **Local data:** 50-100 person collection with iPhone + finger-prick metabolic tests
- **Wellness positioning:** "Your eye patterns suggest possible metabolic stress" — NOT diagnosis
- **Full spec:** `docs/EYE-BIOMARKER-PIPELINE.md`

### Phase 1 Status (May 30)
- ✅ Architecture designed and reviewed by team
- ✅ React Native app scaffolded (Expo + TypeScript)
- ✅ Camera capture screen built
- ✅ ML inference module (mock, ready for TFLite conversion)
- ✅ HealthKit integration module (mock)
- ✅ Supabase client configured
- ✅ 5 tab screens (Home, Scan, Routine, Track, Profile)
- ✅ TypeScript: zero errors
- ⏳ Need: Convert ViT to TFLite format
- ⏳ Need: Supabase anon key configuration
- ⏳ Need: Test on physical device

---

*I am SKINgenius. I analyze skin. I recommend solutions. I help people feel confident in their skin.* 🧬

## Treatment Simulation — Research & Architecture (2026-06-10)

### What We're Building
AI-powered treatment simulation: users scan their face, see realistic "after treatment" visualizations (Botox, fillers, laser, thread lifts).

### Key Decisions
- **Mesh model:** FLAME 2023 Open (CC BY 4.0, free commercial use) — downloaded + verified
- **Landmarks:** MediaPipe Face Mesh (real-time, on-device)
- **Rendering:** CUT + SimGAN + IP-Adapter diffusion (hybrid pipeline)
- **Identity preservation:** ArcFace verification gate (>0.75 cosine similarity)
- **Business model:** Free scans (monthly cap), revenue via practitioner referrals + manufacturer placement
- **Legal:** Training-only use, no PHI storage, same basis as face-swap apps
- **UX:** Post-scan choice — "Get Recommendations" or "Choose Myself"

### FLAME Model Specs
- 5,023 vertices / 9,976 faces
- 400 shape parameters (identity)
- 100 expression blendshapes (critical for Botox simulation)
- 5 joints (jaw, neck, eyes)
- Location: `data/models/flame/flame2023_Open.pkl`

### Training Data
- 69 clinical images extracted from FDA documents (scraper built)
- Need ~600-900 real pairs + 10,000+ synthetic FLAME pairs
- Synthetic generation pipeline next

### Manufacturer Partnership Strategy
- Outreach order: Revance/Evolus → Merz/Suneva → Galderma → Allergan
- Y1 revenue projection: $1.5M–$4M
- Start with Tier 1 (data sharing) to build proof

### API Endpoints (Designed)
- `POST /api/v1/simulation/reconstruct` (~800ms) — selfie → 3D mesh
- `POST /api/v1/simulation/preview` (~2.5s) — treatment simulation
- `POST /api/v1/simulation/3d-preview` (~5s) — premium rotatable 3D
- `GET /api/v1/simulation/treatments` — cached treatment catalog

### Performance Targets
- <3.5s end-to-end (p95)
- ~$0.005/simulation
- 3,600 sims/hour steady

### Deliverables
- `project-docs/TREATMENT-SIMULATION-ACTION-PLAN.md` — Master action plan
- `project-docs/research/3d-mesh-models-evaluation.md`
- `project-docs/research/training-data-sources-audit.md`
- `project-docs/research/image-translation-models-evaluation.md`
- `project-docs/architecture/treatment-deformation-pipeline.md` (64KB)
- `project-docs/strategy/manufacturer-partnership-strategy.md`
- `tools/fda_scraper.py`
- `data/raw/fda/manifest.csv` (69 images)

### Phase 3 Tasks (Next)
1. Build synthetic before/after generator using FLAME (Lens)
2. Expand FDA scraper to remaining documents (Core)
3. Scrape PMC papers for additional pairs (Sage)
4. Set up CUT training pipeline (Pixel)
5. Build FLAME → treatment deformation PoC (Dermis)
6. Begin manufacturer outreach — Revance first (Nova)

## Peptide Supplier Bridge (June 16, 2026)
- **Cross-project link:** Basys Health supplier quality data → SKINgenius peptide recommendations
- **GLOW STACK:** GHK-Cu + BPC-157 + TB-500 — all seeded in SKINgenius (T1/T2)
- **Primary verified vendor:** Paradigm Peptide (Finnrick A, 218 tests, $410/mo for GLOW STACK T2)
- **Bridge doc:** `docs/PEPTIDE-SUPPLIER-BRIDGE.md`
- **Integration:** Tier 2+ peptide recommendations link to Basys supplier checklist
