# MEMORY.md — SKINgenius Long-Term Memory

> **Last updated:** 2026-06-21
> **Wiki vault:** `~/.openclaw/wiki/skingenius/`
> **Daily notes:** `memory/YYYY-MM-DD.md`
> **Pulse Cycle:** 67 (2026-06-21T21:43Z)

---

## ✅ GIT COMMIT FIXED (June 21, 2026)

Committed 214 files across 4 commits. Remaining: only `graphify-out/graph.json` (regenerable, excluded via .gitignore).

**🔴 CEO CRON WASTING SESSIONS — Root cause confirmed: Che heartbeat every 30m-1h dispatches status checks to CEO. 899+ sessions total, ~24/day. NOT a gateway cron job. Fix requires Jason: reduce Che `heartbeat.every` from 30m to 12h.**

**🔴 PROJECT VELOCITY INSUFFICIENT:** Zero dev activity in last 6 days. 9/11 agents dormant 5-37d. MVP deadline July 7 (16 days). **3 API keys still unrotated after 8+ days** (SECURITY INCIDENT CRITICAL). Meta turn failure rate stable at ~0%.

**✅ PULSE STABLE (Cycle 67):** 0 consecutive errors. **Delivery NOW WORKING** — Telegram target `-1002227616648`. **Meta turn failure rate stable at ~0%** (3 consecutive cycles).

**✅ PULSE DELIVERY FIXED (June 21):** Changed Telegram delivery target from `-5110202082` (not found) to `-1002227616648` (working group). Confirmed working in Cycles 65-67 (3 consecutive cycles).

**✅ GIT COMMIT DONE (June 21):** 4 commits, 214 files, all meaningful changes committed. Only `.learnings/` + `DREAMS.md` remain (regenerable, auto-generated).

**🟡 WELLNESS PLAN PHASE 2 (19 components, COMMITTED June 21):**

**✅ SAGE CLINICAL SCAN (June 15):**

- FDA approved Differin Epiduo Gel OTC switch (adapalene 0.1%/BPO 2.5%)
- AAD 2026 acne guidelines: clascoterone, sarecycline, spironolactone
- Pipeline: XYNGARI/DMT310 (once-weekly topical, Phase 2b)
- Source: `docs/research/2026-06-15-clinical-scan.md`

**✅ GIT COMMIT DONE (June 21):** All meaningful files committed across 5 commits (215 files total). Only `graphify-out/graph.json` remains (regenerable, .gitignore).

**🔴 CEO SPAM ROOT CAUSE CONFIRMED:** Che agent heartbeat (every 30m-1h) dispatches status checks to CEO → 899+ CEO sessions, ~24/day. All 24 CEO sessions in last 24h were Che dispatches. Fix: reduce Che `heartbeat.every` to 12h. NOT manageable via gateway cron API.

**🟡 PULSE DELIVERY FIXED:** Telegram target changed from `-5110202082` (invalid) to `-1002227616648` (working). Stable 3 cycles.

**🔴 SECURITY INCIDENT (June 16, 8+ days unrotated):** Dev subagent session leaked SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, and SUPABASE_ACCESS_TOKEN in plain text. Keys STILL NOT ROTATED after 8+ days. WORSENING. IMMEDIATE rotation required. Add env var protection to agent guardrails.
**⚠️ KNOWN ISSUES:**

- 🔴 **API keys leaked in dev session logs** — rotate SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, SUPABASE_ACCESS_TOKEN immediately (8+ days unrotated!)
- 🔴 **Dev agent kimi-k2.6 produces garbage output** — session 01b319d3 entirely garbled, switch to glm-5.1 before reactivation
- 🔴 **Che heartbeat 30m-1h → CEO spam** — 24 CEO sessions/day, all Che dispatches. Fix Che `heartbeat.every` to 12h
- ✅ Pulse delivery WORKING — Telegram target `-1002227616648` confirmed (3 cycles stable)
- ✅ Pulse Cycle 62 recovered from 10 consecutive timeouts (268s run time)
- ✅ Git commit done — 4 commits, 214 files (June 21). Only .learnings/ + DREAMS.md remain.
- ✅ Meta turn failure rate stable at ~0% (3 consecutive cycles)
- Cloudflare blocks: dermatologytimes.com, hcplive.com — use ScrapeGraph with stealth
- memory_search: QMD times out at 4s, builtin fallback works at 6-7s (acceptable)
- Architect review found 7 high-severity issues (no auth, missing RLS, SQL injection)
- WellnessPlanPage.tsx likely over 300-line limit
- Mobile build broken — asset path resolution error persists
- Zero dev agent activity in last 6 days (dev dormant since June 16)
- Dev wired treatment_protocols into Wellness Plan API (June 15)

**Agent Health Summary (as of June 21, 05:37 ET):**
| Agent | Sessions | Last Active | Status |
|-------|----------|------------|--------|
| CEO | 899+ | Jun 21 (Che dispatch) | 🔴 Active but 24x/day from Che heartbeat (should be 2/day max) |
| Meta | 88+ | Jun 21 21:43 (Pulse C67) | 🟢 Active (Cycle 67, 0 errors, delivery WORKING) |
| Dev | 71 | Jun 16 12:04 | 🔴 Dormant 5d (last: garbage + env leak) |
| Architect | 20 | Jun 14 17:58 | 🔴 Dormant 7d |
| Research | 64 | Jun 14 19:12 | 🔴 Dormant 7d |
| AI | 10 | Jun 10 22:39 | 🔴 Dormant 11d |
| Data | 14 | Jun 10 22:52 | 🔴 Dormant 11d |
| Design | 15 | Jun 10 22:46 | 🔴 Dormant 11d |
| DevOps | 9 | May 22 08:04 | 🔴 Dormant 30d |
| Marketing | 2 | May 15 22:43 | 🔴 Dormant 37d |
| Syntax | 2 | May 22 08:40 | 🔴 Dormant 30d |

**Key Insight:** CEO running 24 sessions/day from Che heartbeat dispatch (every ~1h). 9/11 agents dormant 6-37d. 16 days to MVP with zero feature velocity. Dev agent dormant since June 16 (garbage + env leak). Pulse Cycle 67 stable (0 errors) with delivery WORKING (3 consecutive cycles). 3 API keys still need rotation after 8+ days (SECURITY INCIDENT CRITICAL). Meta turn failure rate stable at ~0%. Git commits done — 214 files committed. Only .learnings/ + DREAMS.md remain uncommitted.

**Progress since Cycle 54:**

- 🔴 **CEO SPAM ONGOING** — Che heartbeat dispatches to CEO ~24x/day. 899+ total sessions. Requires Jason to fix.
- ✅ **PULSE DELIVERY WORKING** — Telegram target `-1002227616648` confirmed working (3 cycles stable)
- ✅ **GIT COMMIT DONE** — 4 commits, 214 files (June 21). Only .learnings/ + DREAMS.md remain.
- ✅ **META TURN FAILURES STABLE** — At ~0% for 3 consecutive cycles (glm-5.1 model stable)
- ✅ **MEMORY_SEARCH FALLBACK** — QMD timeout acceptable, builtin fallback works
- ✅ **DEV WIRED TREATMENT_PROTOCOLS** — Wellness Plan API integration (June 15)
- 🔴 **SECURITY INCIDENT CRITICAL** — API keys leaked 8+ days ago, STILL NOT ROTATED
- 🔴 **DEV GARBAGE OUTPUT** — kimi-k2.6 produced hallucinated content, needs model switch
- 🔴 **Mobile build broken** — Asset path resolution error persists
- ✅ 67 Pulse cycles completed

## CRITICAL: What SKINgenius Actually Is (Updated 2026-05-14)

SKINgenius is a **holistic skin health intelligence platform** that treats skin as a **mirror of internal health**.

### NOT Just a Product Database

We are NOT building a product catalog with reviews. We are building a **medical-grade skin analysis and recommendation engine** that:

1. **Analyzes skin photos** using AI vision (MiMo V2 Omni)
2. **Identifies root causes** — not just symptoms
3. **Recommends holistic treatments** — products + supplements + lifestyle + professional
4. **Checks safety** — pregnancy, medications, allergies, contraindications
5. **Tracks progress** — photo timeline + health journal + biomarkers

### The Holistic Model

```
Surface Symptoms (What You See)
         ↓
    AI Photo Analysis (8+ metrics)
         ↓
Skin Conditions + Severity Grading
         ↓
    Root Cause Analysis
         ↓
Internal Factors:
├── Gut Health (microbiome, SIBO, leaky gut, dysbiosis)
├── Hormones (cortisol, estrogen, testosterone, insulin, thyroid)
├── Nutrition (deficiencies, glycation, anti-inflammatory diet)
├── Lifestyle (sleep, stress, exercise, alcohol, smoking, UV)
├── Medications (side effects, interactions)
└── Genetics (family history, skin type)
         ↓
    Holistic Recommendations
         ↓
├── Products (topical, with safety checks + evidence scores)
├── Supplements (internal root cause support)
├── Lifestyle (diet, sleep, stress management, exercise)
└── Professional (when needed — dermatologist, medspa)
         ↓
    Progress Tracking
         ↓
Photo Timeline + Health Journal + Biomarkers + Lifestyle Correlation
```

### Key Differentiators vs Competitors

- **Evidence-first**: Every recommendation backed by PubMed/clinical trials
- **Safety-first**: Pregnancy, medications, allergies, contraindications checked
- **Root cause focus**: We don't just treat symptoms — we find why
- **Age-inclusive**: Built for 40+ (Gen X), not youth-focused
- **Holistic**: Connects skin to gut, hormones, nutrition, lifestyle
- **Professional bridge**: When to see a dermatologist, what treatments exist
- **Transparency**: Algorithmic accountability, open methodology

---

## Project Status

- **Phase:** Phase 3 (App Integration) — Research + Architecture + Initial Dev
- **Timeline:** 8 weeks to MVP (target: early July 2026)
- **Model:** On-demand sub-agents (will become persistent on Mac Mini M5 Pro, June 2026)
- **Last Pulse:** 2026-05-20T21:37 UTC (cycle 8)

## Build Plan Phases

| Phase | Focus                                                 | Timeline | Status                      |
| ----- | ----------------------------------------------------- | -------- | --------------------------- |
| 1     | Foundation — Research holistic model                  | Week 1-2 | ✅ Complete                 |
| 2     | Evidence Database — Ingredient + condition research   | Week 2-3 | ✅ Complete                 |
| 3     | App Integration — Scan flow, API, components          | Week 3-4 | 🔄 In Progress              |
| 3.5   | Treatment Simulation — FLAME + CUT pipeline           | Week 4-5 | 🔄 Building (June 10 start) |
| 4     | Content Engine — Evidence-based articles              | Week 5-6 | ⏳ Pending                  |
| 5     | Professional Referral — Severity + provider directory | Week 6-7 | ⏳ Pending                  |
| 6     | Data Integration — Wearables, Basys Health            | Week 7-8 | ⏳ Pending                  |

See `BUILD-PLAN.md` for complete plan.

## Recent Deliverables (June 10)

- ✅ Treatment deformation pipeline architecture spec (ADR-006, 78KB)
- ✅ FastAPI treatment simulation service (working `/health` endpoint)
- ✅ PMC Open Access scraper (157 images, 6 treatment categories)
- ✅ CUT model training data pipeline (quality scanner, normalizer, pair matcher, synthetic integrator)
- ✅ FDA clinical photos dataset analysis (135 images, 102 before/33 after)
- ✅ 3D mesh model evaluation (FLAME vs alternatives)
- ✅ Image translation models evaluation (CUT vs CycleGAN vs pix2pix)
- ✅ Training data sources audit
- ✅ Manufacturer partnership strategy document

## Recent Deliverables (May 20)

- ✅ MANA Labs Product Scanner API — 4-tier pipeline (INCIdecoder → EWG → COSING → Gemini)
- ✅ MANA Labs Database Schema — 6 tables with RLS, indexes, CHECK constraints
- ✅ Knowledge graph: 25 conditions (added Excess Sebum & Enlarged Pores)
- ✅ Ingredient safety data: 50 records seeded
- ✅ Anti-aging peptides research doc

## Team (updated 2026-05-20)

| Agent                | Name   | Model                 | Role                 |
| -------------------- | ------ | --------------------- | -------------------- |
| skingenius-ceo       | Nova   | Xiaomi MiMo V2 Pro    | CEO / Orchestrator   |
| skingenius-architect | Dermis | Kimi K2 Thinking      | Platform Architect   |
| skingenius-dev       | Pixel  | Kimi K2.6             | Full-Stack Dev       |
| skingenius-ai        | Lens   | MiMo V2 Omni (Vision) | AI/Vision Specialist |
| skingenius-data      | Core   | Nematron 3 Super      | Data Engineering     |
| skingenius-research  | Sage   | Kimi K2.6             | Research Lead        |
| skingenius-devops    | Forge  | Nematron 3 Super      | DevOps               |
| skingenius-design    | Aura   | Kimi K2.6             | UX/Design            |
| skingenius-syntax    | Guard  | MiniMax M2.7          | Code Quality         |
| skingenius-meta      | Pulse  | GLM-5.1               | Meta/Tracking        |

## Active Sub-Agents (as of 2026-05-14)

4 agents scraping + researching all 8 premium brands:

- **skingenius-research-aesop** — Aesop (31 products)
- **skingenius-research-pca** — PCA Skin (34 products)
- **skingenius-research-medical** — SkinCeuticals + ZO Skin Health (54 products)
- **skingenius-research-premium** — Biologique Recherche + iS Clinical + Osmosis + Environ (69 products)

## Architecture (Live)

- **Photo analysis**: MiMo V2 Omni for skin condition detection
- **Condition → Root Cause → Treatment** pipeline
- **Biomarker integration**: From Basys Health (read-only API, not shared DB)
- **Evidence scoring**: Every claim cites PubMed/clinical trials
- **Safety engine**: Pregnancy, medications, allergies, contraindications
- **Supabase**: cnzoilxsttoqtvwotexd.supabase.co (own instance)
- **11 tables live with RLS**: profiles, skin_photos, skin_conditions, skin_analyses, ingredients, products, routines, routine_steps, user_skin_profiles, skin_log_entries, ingredient_reactions
- **Storage bucket**: skin-photos (private, per-user folders)
- **Client helpers**: server.ts, client.ts, middleware.ts in src/utils/supabase/

## Current Database Status (as of 2026-05-14)

- **Products**: 236 across 21 brands
- **Ingredients researched**: 30 (need 139 more)
- **Skin conditions**: 14 seeded
- **Safety data**: Basic pregnancy/allergy flags (need comprehensive profiles)
- **Evidence scores**: Algorithm built (`evidence-scoring-engine.js`)
- **Root cause mapping**: Complete for 10 major conditions (acne, photoaging, hyperpigmentation, rosacea, eczema, dry skin, sensitive skin, oily skin, dark circles, textural irregularities)
- **Gut-skin axis**: Research complete (`research/gut-skin-axis.md`)
- **Hormone-skin connection**: Research in progress (`research/hormone-skin-connection.md`)
- **Evidence scoring algorithm**: Built and ready (`research/evidence-scoring-algorithm.md`)
- **GetUpLook integration**: Built (`scripts/getuplook-integration.js`) — contextual, goal-based, never pushy
  - User sets skin goals during onboarding
  - System asks "Are you open to professional treatments?" (yes/no/maybe)
  - Recommendations show "At-Home Care" first, "Professional Boost" second
  - 2-3 local providers from GetUpLook shown when relevant
  - Timing: Week 4 first mention, then at check-ins (8, 12, 16 weeks)
  - High severity (≥8/10) triggers immediate referral
  - Service mapping: 20+ treatments matched to 15 skin goals
  - Provider matching: by service, location, rating, availability

## Key Research Documents (Created 2026-05-14)

1. `BUILD-PLAN.md` — Complete 6-phase build plan with team assignments
2. `skincare-research/research/gut-skin-axis.md` — Full gut-skin connection research
3. `skincare-research/research/hormone-skin-connection.md` — Hormone-skin research
4. `skincare-research/research/evidence-scoring-algorithm.md` — Evidence scoring system
5. `skincare-research/research/condition-root-cause-mapping.md` — 10 conditions mapped to root causes with holistic treatments

## Books to Research (Updated 2026-05-14)

### Completed

- [x] _Clean: The New Science of Skin_ (Hamblin, 2020) — microbiome, over-cleansing
- [x] _The Beauty Molecule_ (Perricone, 2010) — inflammation, mitochondria, acetylcholine
- [x] _The Hormone Reset Diet_ (Gottfried, 2017) — cortisol, hormonal balance

### Pending

- [ ] _The Beauty of Dirty Skin_ (Bowe, 2018) — gut-skin axis
- [ ] _Skin Deep_ (Waldman, 2019) — toxic exposures
- [ ] _The Clear Skin Diet_ (Logan & Treloar, 2017) — nutrition
- [ ] _The Mind-Gut Connection_ (Mayer, 2016) — gut-brain-skin
- [ ] _The Perricone Prescription_ (Perricone, 2002) — anti-inflammatory diet
- [ ] _Younger_ (Lancer, 2014) — Dr. Lancer's method
- [ ] _The Skincare Bible_ (Mahto, 2018) — evidence-based
- [ ] _Glow_ (Nadolsky, 2020) — nutrition for skin
- [ ] _The Microbiome Solution_ (Chutkan, 2015) — gut health
- [ ] _Brain Maker_ (Perlmutter, 2015) — gut-brain connection

## Research Priorities (Updated 2026-05-14)

### Immediate (This Week)

1. [x] Build evidence scoring algorithm
2. [x] Build recommendation engine with GetUpLook integration
3. [x] Build condition-to-root-cause mapping
4. [ ] Research _Beauty of Dirty Skin_ (Bowe) — sub-agent working
5. [ ] Research _Clear Skin Diet_ (Logan) — sub-agent working
6. [ ] Build safety engine — sub-agent working
7. [ ] Build content engine — sub-agent working
8. [x] Ingredient frequency analysis complete — 169 unique ingredients prioritized
9. [x] Initial UI components created (5 components by design agent)
10. [x] Supabase migration for indexes created
11. [ ] Review and integrate sub-agent component files (placeholders need react-native-svg)
12. [ ] Fix Supabase JWT connection

### Short-Term (Next 2 Weeks)

6. [ ] Complete lifestyle-skin research (sleep, stress, exercise, alcohol)
7. [ ] Build safety engine (medication interactions, contraindications)
8. [ ] Map conditions to root causes
9. [ ] Build recommendation algorithm logic
10. [ ] Research all remaining books

### Medium-Term (Next Month)

11. [ ] Build content engine (evidence-based articles)
12. [ ] Build professional referral logic
13. [ ] Integrate wearable/biomarker data
14. [ ] Build routine compatibility engine
15. [ ] User testing with beta group

## Critical Decisions (Updated 2026-05-14)

- **Holistic approach confirmed**: We treat root causes, not just symptoms
- **Safety-first**: Every recommendation checked against user profile
- **Evidence-first**: Every claim backed by PubMed citations
- **Age-inclusive**: Built for 40+ (Gen X primary, Millennials secondary)
- **Professional bridge**: Refer to dermatologists when appropriate
- **Separate Supabase**: Not shared with Basys Health
- **Cross-product data via API**: Not direct DB joins
- **On-demand agents until Mac Mini**: PC2 RAM limited at 7.6GB

## Key Metrics to Track

- **Research quality**: 169 ingredients fully researched with PubMed citations
- **Safety coverage**: 100% of ingredients have pregnancy + interaction data
- **Condition coverage**: 50+ skin conditions profiled with grading scales
- **Content depth**: 100+ evidence-based articles
- **Recommendation accuracy**: >80% user-reported improvement
- **Safety false negative rate**: <1% (critical for medical-adjacent app)

## ⚠️ Competitive Intelligence — Lovi.care (READ THIS FIRST)

**Lovi.care is our closest competitor.** AI face scanner app, iOS only. We have a full teardown.

**Files:**

- `research/lovi-care-screens.md` — Complete 12-screen scan workflow teardown
- Obsidian vault: `skingenius/Lovi *` — Feature analysis, gaps, parent company

**Lovi Quick Intel:**

- AI face scanner → skin assessment → product recommendations
- Uses BioLinkBERT + PubMedBERT + GPT (claims USMLE-level medical knowledge)
- Parent company: Palta (formerly Pora)
- iOS only, no Android

**Our advantages (exploit these):**

- ✅ Holistic (gut, hormones, nutrition, lifestyle) vs Lovi's surface-only approach
- ✅ Biomarker/internal health integration — Lovi has none
- ✅ Supplement recommendations — Lovi has none
- ✅ Cross-platform (iOS + Android) — Lovi is iOS only
- ✅ Professional salon/spa integration — Lovi has none
- ✅ Ingredient safety for melanin-rich skin — Lovi has none
- ✅ Fitzpatrick-aware recommendations — Lovi has none

**When discussing competitors or features, always reference Lovi.care research.**

---

## Related Projects

- **Basys Health** — biomarker data (separate Supabase, SKINgenius reads via API)
- **HAIRgenius** — hair health companion, shared architecture pattern
- **ByondEdu** — education platform, potential skincare courses
- **COLORgenius** — separate agent/workspace, not our responsibility
- **GetUpLook** — **PROFESSIONAL REFERRAL PARTNER** (getuplook.com). SKINgenius refers users to GetUpLook providers when severity >= 7/10. See `skincare-research/docs/getuplook-integration.md`

## Key Data Sources

- PubMed / clinical trials (primary)
- Paula's Choice Ingredient Dictionary
- INCIDecoder
- CosIng (EU cosmetic ingredient database)
- SkinSAFE (allergen database)
- AAD clinical guidelines
- EDF guidelines

## Notes

- **URGENT**: Do NOT forget the holistic model. Skin is a mirror of internal health.
- **CRITICAL**: Every recommendation must have safety checks. We are medical-adjacent.
- **IMPORTANT**: Content must be evidence-based. No influencer claims. No brand bias.
- **REMEMBER**: Age-inclusive design. 40+ market is massively underserved.

---

_Last updated: 2026-05-16 14:45 EDT (Che sync)_
_Next review: May 16, 2026_

## Promoted From Short-Term Memory (2026-06-21)

<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:40:43 -->

- Sprint Metrics: | Metric | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 Target | |--------|--------|--------|--------|--------|---------------| | Products | 236 | 236 | 236 | 236 | 300 | | Ingredients seeded | 30 | 108 | 108 | 108 | 169 | [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:40-43]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:44:47 -->
- Sprint Metrics: | Skin conditions | 14 | 14 | 14 | 14 | 20 | | UI components | 5 | 5 | 5 | 5+7 wellness | 15 | | Research docs | 8 | 9 | 9 | 9+ | 12 | | Critical path done | 0/5 | 0/5 | 0/5 | 0/5 | 3/5 | [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:44-47]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:53:56 -->
- Agent Health: | Agent | Last Active | Status | Notes | |-------|------------|--------|-------| | CEO (Nova) | Jun 15 (today) | 🟢 Active | Cron-driven, model fix confirmed | | Meta (Pulse) | Jun 14 | 🟢 Active | Cycle 50, running stably | [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:53-56]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:57:60 -->
- Agent Health: | Dev (Pixel) | Jun 13 | 🟡 Partial | Built Wellness Plan Phase 1 | | Architect (Dermis) | Jun 10 | 🔴 Dormant 5d | Architecture tasks pending | | Research (Sage) | Jun 10 | 🔴 Dormant 5d | Research scan dispatched today | | Data (Core) | Jun 10 | 🔴 Dormant 5d | Data seeding pending | [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:57-60]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:61:64 -->
- Agent Health: | AI (Lens) | Jun 10 | 🔴 Dormant 5d | Vision model evaluation pending | | Design (Aura) | Jun 10 | 🔴 Dormant 5d | UI design pending | | DevOps (Forge) | May 22 | 🔴 Dormant 24d | Infra provisioning pending | | Syntax (Guard) | May 22 | 🔴 Dormant 24d | Code quality pending | [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:61-64]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:65:65 -->
- Agent Health: | Marketing | May 15 | 🔴 Dormant 31d | Not sprint-critical | [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:65-65]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:72:75 -->
- Critical Path (Must Complete): **Commit 299 uncommitted files** — Git commit all staged work immediately; **Define AI pipeline architecture** — Photo → condition → recommendation pipeline spec; **Fix Vercel build errors** — Deployment must work before any feature dev; **Provision Neon PostgreSQL + pgvector** — Database foundation [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:72-75]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:76:76 -->
- Critical Path (Must Complete): **Define scan API contract** — JSON schema for /api/scan input/output [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:76-76]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:79:82 -->
- High Priority (Should Complete): **Evaluate vision models** — MiMo V2 Omni vs alternatives for skin classification; **Build condition-ingredient mapping** — Acne, hyperpigmentation, rosacea; **Apply Supabase schema to live DB** — Tables exist in code, not deployed; **Resolve Supabase JWT connection** — Auth issue blocking API work [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:79-82]
<!-- openclaw-memory-promotion:memory:memory/2026-06-15.md:83:83 -->
- High Priority (Should Complete): **Seed remaining ingredients** — Target 169 prioritized actives (currently 108) [score=0.828 recalls=0 avg=0.620 source=memory/2026-06-15.md:83-83]
