# MEMORY.md — SKINgenius Long-Term Memory

> **Last updated:** 2026-05-21
> **Wiki vault:** `~/.openclaw/wiki/skingenius/`
> **Daily notes:** `memory/YYYY-MM-DD.md`
> **Pulse cycle:** 10 (2026-05-22T09:37Z)

---

## 🚨 Pulse Alert: CEO Cron Redundancy CRITICAL — 6th Consecutive Cycle (2026-05-22)

**Progress:** Significant new deliverables since May 21:
- ✅ Recommendation engine implemented (fit scoring + query engine + API route)
- ✅ Scan pipeline implemented (EXIF strip + quality gate + mock classifier)
- ✅ Seed data v1.1 (151KB, 25+ conditions, 151+ ingredients, root-cause layer)
- ✅ API architecture designed by architect agent (now active!)
- ✅ TypeScript types, Supabase service module

**Architect status:** ACTIVE as of May 21 — broke 8+ day dormancy. Produced API architecture + seed data schema. Still has `assistant_turn_failed` errors.

**DevOps status:** STILL DORMANT. Tasks #4 (Vercel) and #5 (PostgreSQL) remain blocked.

**CRITICAL — CEO Cron Redundancy (6th cycle, 10th overall, NO FIX):** CEO check-in cron produces 20+ identical sessions per 24h. Cumulative token waste now 1.5M+ tokens. **This has been flagged for 6 consecutive cycles with zero corrective action.** Jason MUST reduce this cron frequency.

**New errors:** Tool validation errors (4 agents), TypeScript V1ScanMetadata type mismatch, web_fetch 403 on academic sources, architect `assistant_turn_failed`.

---

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
| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| 1 | Foundation — Research holistic model | Week 1-2 | ✅ Complete |
| 2 | Evidence Database — Ingredient + condition research | Week 2-3 | ✅ Complete |
| 3 | App Integration — Scan flow, API, components | Week 3-4 | 🔄 In Progress |
| 4 | Content Engine — Evidence-based articles | Week 4-5 | ⏳ Pending |
| 5 | Professional Referral — Severity + provider directory | Week 5-6 | ⏳ Pending |
| 6 | Data Integration — Wearables, Basys Health | Week 6-8 | ⏳ Pending |

See `BUILD-PLAN.md` for complete plan.

## Recent Deliverables (May 20)
- ✅ MANA Labs Product Scanner API — 4-tier pipeline (INCIdecoder → EWG → COSING → Gemini)
- ✅ MANA Labs Database Schema — 6 tables with RLS, indexes, CHECK constraints
- ✅ Knowledge graph: 25 conditions (added Excess Sebum & Enlarged Pores)
- ✅ Ingredient safety data: 50 records seeded
- ✅ Anti-aging peptides research doc

## Team (updated 2026-05-20)
| Agent | Name | Model | Role |
|-------|------|-------|------|
| skingenius-ceo | Nova | Xiaomi MiMo V2 Pro | CEO / Orchestrator |
| skingenius-architect | Dermis | Kimi K2 Thinking | Platform Architect |
| skingenius-dev | Pixel | Kimi K2.6 | Full-Stack Dev |
| skingenius-ai | Lens | MiMo V2 Omni (Vision) | AI/Vision Specialist |
| skingenius-data | Core | Nematron 3 Super | Data Engineering |
| skingenius-research | Sage | Kimi K2.6 | Research Lead |
| skingenius-devops | Forge | Nematron 3 Super | DevOps |
| skingenius-design | Aura | Kimi K2.6 | UX/Design |
| skingenius-syntax | Guard | MiniMax M2.7 | Code Quality |
| skingenius-meta | Pulse | GLM-5.1 | Meta/Tracking |

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
- [x] *Clean: The New Science of Skin* (Hamblin, 2020) — microbiome, over-cleansing
- [x] *The Beauty Molecule* (Perricone, 2010) — inflammation, mitochondria, acetylcholine
- [x] *The Hormone Reset Diet* (Gottfried, 2017) — cortisol, hormonal balance

### Pending
- [ ] *The Beauty of Dirty Skin* (Bowe, 2018) — gut-skin axis
- [ ] *Skin Deep* (Waldman, 2019) — toxic exposures
- [ ] *The Clear Skin Diet* (Logan & Treloar, 2017) — nutrition
- [ ] *The Mind-Gut Connection* (Mayer, 2016) — gut-brain-skin
- [ ] *The Perricone Prescription* (Perricone, 2002) — anti-inflammatory diet
- [ ] *Younger* (Lancer, 2014) — Dr. Lancer's method
- [ ] *The Skincare Bible* (Mahto, 2018) — evidence-based
- [ ] *Glow* (Nadolsky, 2020) — nutrition for skin
- [ ] *The Microbiome Solution* (Chutkan, 2015) — gut health
- [ ] *Brain Maker* (Perlmutter, 2015) — gut-brain connection

## Research Priorities (Updated 2026-05-14)
### Immediate (This Week)
1. [x] Build evidence scoring algorithm
2. [x] Build recommendation engine with GetUpLook integration
3. [x] Build condition-to-root-cause mapping
4. [ ] Research *Beauty of Dirty Skin* (Bowe) — sub-agent working
5. [ ] Research *Clear Skin Diet* (Logan) — sub-agent working
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

*Last updated: 2026-05-16 14:45 EDT (Che sync)*
*Next review: May 16, 2026*

## Promoted From Short-Term Memory (2026-05-20)

<!-- openclaw-memory-promotion:memory:memory/2026-05-14.md:4:4 -->
- Major pivot in understanding what SKINgenius actually is. NOT just a product database — it's a **holistic skin health intelligence platform**. [score=0.835 recalls=0 avg=0.620 source=memory/2026-05-14.md:4-4]
