# SKINgenius — Project Status

> **Last updated:** 2026-05-20
> **Current Phase:** Phase 3 — App Integration (Design + Architecture)

---

## Knowledge Base Stats (May 20, 2026)
- **25 conditions** (added excess-sebum-enlarged-pores)
- **105 ingredients** (up from 96 — added 9 new peptide/structural entries)
- **12 facial zones**
- All JSON validated clean

## Research Docs (May 20, 2026)
| Doc | What It Covers |
|---|---|
| `docs/EXCESS-SEBUM-ENLARGED-PORES.md` | Three-tier model: topical → clinical → systemic/dietary |
| `docs/ANTI-AGING-PEPTIDES.md` | 4 peptide categories + synergistic action matrix |
| `docs/TRENDING-INGREDIENTS-AND-DEVICES.md` | PDRN, panthenol, ectoin, microcurrent, LED — full mechanisms |
| `docs/DR-BAILEY-RESEARCH-SYNTHESIS.md` | 10 dermatologist articles synthesized |
| `docs/PAULAS-CHOICE-RESEARCH-SYNTHESIS.md` | 10 evidence-based articles synthesized |

## Phase 1: Research ✅ COMPLETE
- [x] 16 clinical research reports (1.3 MB)
- [x] Quality review passed (disclaimers, evidence levels, cross-references)
- [x] 24 brands, 406 products researched and normalized

## Phase 2: Knowledge Graph ✅ COMPLETE
- [x] 17 JSON files, 1.8 MB, 3,294 data points
- [x] 151 ingredients with concentrations, evidence levels, interactions
- [x] 406 products with full INCI, contraindications, pregnancy safety
- [x] 24 conditions, 26 procedures, 23 treatment ladders, 13 hormones
- [x] 499 ingredient-condition mappings, 145 ingredient interactions
- [x] 5 index files (skin-type recs, condition-to-products, ingredient-to-products, condition-to-treatments, pregnancy-safe)

## Phase 3: App Integration 🔄 IN PROGRESS

### Pro Tier — Esthetician Subscription (NEW — May 21)
**Decision:** Paid pro tier for estheticians. Architect now, build after consumer MVP.
| Plan | Monthly | Max Clients | Features |
|------|---------|-------------|----------|
| **Pro** | $29/mo | 50 | Client dashboard, check-ins, referral marketplace |
| **Enterprise** | $99/mo | Unlimited | API access, custom branding, priority matching |

- [x] Schema tables added (pro_subscriptions, client_pro_relationships, pro_messages, referral_queue)
- [x] API endpoints designed (pro/share, pro/clients, pro/message, referrals)
- [x] Granular sharing permissions model (6 data types, independently toggled)
- [x] Referral matching logic (Fitzpatrick-aware, specialty-based scoring)
- [ ] Pro dashboard UI (post-MVP)
- [ ] Square billing integration for pro subscriptions

### 3A: Design System ✅
- [x] DESIGN.md created (Google DESIGN.md spec)
- [x] Visual identity defined: clinical precision + holistic warmth
- [x] Color palette: primary ink (#0A2647), accent green (#2CD674), warmth (#E8C8A0)
- [x] 31 color tokens, 14 typography levels, 22 components
- [x] Component system: condition cards, product cards, evidence badges, fit scores, pregnancy safety icons, routine timeline, root cause map
- [x] Do's and Don'ts defined (evidence-first, pregnancy-safe-first, culturally sensitive)

### 3B: Competitive Audit ✅ COMPLETE
- [x] Lovi.care deep competitive analysis (40+ screens analyzed)
- [x] Feature comparison matrix (Lovi vs SKINgenius)
- [x] Pora.ai competitive analysis (same company as Lovi — app appears dead)
- [x] Pricing model research
- [x] Competitive teardown doc: `docs/LOVI-CARE-COMPETITIVE-TEARDOWN.md`

### 3C: Architecture 📋 QUEUED
- [ ] Define API contracts (scan → conditions → recommendations)
- [ ] Database schema review (Supabase vs knowledge graph JSON)
- [ ] Recommendation engine algorithm design
- [ ] AI vision pipeline architecture
- [ ] Safety filter logic (pregnancy, drug interactions, allergies)
- [ ] Seed knowledge graph to Supabase (seed-data.json is ready)
- [ ] Add 5 trending ingredients to seed-data.json (PDRN, panthenol, ectoin, microcurrent, LED)
- [ ] Add 'Barrier Dysfunction' condition
- [ ] Add 'Device' recommendation tier

### 3D: Backend Build 📋 QUEUED
- [ ] Knowledge graph → Supabase seed
- [ ] /api/recommendations endpoint
- [ ] /api/scan endpoint
- [ ] /api/routine endpoint
- [ ] Fit Score algorithm
- [ ] AI chat cosmetologist

### 3E: Frontend Build 📋 QUEUED
- [ ] Mobile-first scan flow
- [ ] Results dashboard
- [ ] Product recommendation cards
- [ ] Routine builder (AM/PM)
- [ ] Progress tracking

## Public Datasets for Model Training
| Dataset | Use Case | Status |
|---|---|---|
| Fitzpatrick 17k | Per-skin-tone validation | 📋 To pull |
| ISIC Archive | Melanoma/lesion classification pre-training | 📋 To pull |
| HAM10000 | 7-condition classification | 📋 To pull |
| DermNet NZ | 2,300+ condition reference images | 📋 To pull |

## Team Assignments

| Agent | Model | Current Task |
|-------|-------|-------------|
| skingenius (me) | MiMo V2 Pro | Architecture, design, coordination |
| skingenius-research | Kimi K2.6 | Lovi.care competitive audit |
| skingenius-dev | Qwen 2.5:7b | Backend API build |
| skingenius-design | Kimi K2.6 | Wireframes from DESIGN.md |
| skingenius-devops | Nemotron | Infrastructure setup |
| skingenius-marketing | GLM-5.1 | Pricing, content calendar |
| skingenius-syntax | Kimi K2.6 | Code review |

## Key Decisions
- **Design system:** Google DESIGN.md spec — YAML front matter + markdown prose
- **Color identity:** Clinical ink (#0A2647) + enzymatic green (#2CD674) + skin warmth (#E8C8A0)
- **Differentiator vs Lovi.care:** Root cause engine (gut/hormone/lifestyle), not just surface-level
- **Evidence-first:** Every claim tagged A/B/C/D, no exceptions
- **Pregnancy safety:** Must be visible at first glance, never hidden behind a tap
- **Cultural sensitivity:** "Even tone" not "whitening", Fitzpatrick-inclusive throughout

## Files
- `/home/jason/.openclaw/workspaces/skingenius/DESIGN.md` — Design system (16.5 KB)
- `/home/jason/.openclaw/workspaces/skingenius/knowledge-graph/` — Knowledge graph (17 files, 1.8 MB)
- `/home/jason/.openclaw/workspaces/skingenius/BUILD-PLAN.md` — Full project plan
- `/home/jason/.openclaw/workspaces/skingenius/TASKS.md` — Sprint tasks
- `/home/jason/.openclaw/workspaces/skingenius/research/` — 16 clinical reports

## Competitive Landscape: Lovi.care

| Feature | Lovi.care | SKINgenius Differentiator |
|---------|-----------|--------------------------|
| Face scan | 11+ conditions | Same + root cause analysis |
| Fit Score | 0-100% product compatibility | Deeper: evidence + safety + root cause |
| Product database | ~20 brands | 24 brands, 406 products |
| AI assistant | 24/7 chat (PubMed/BioLiMBERT) | Knowledge graph-powered, evidence-tagged |
| Routine tracking | AM/PM | Same + compatibility warnings |
| Safety checking | Pregnancy, skin type | Pregnancy + drug interactions + allergies |
| Progress tracking | Monthly face scan comparison | Same + internal health correlation |
| **Root cause engine** | ❌ Not present | ✅ Gut-skin, hormone-skin, nutrition-skin |
| **Supplement recs** | ❌ Not present | ✅ 22 evidence-based supplements |
| **Lifestyle factors** | ❌ Not present | ✅ Sleep, stress, UV, diet, exercise |
| **Cultural sensitivity** | ❌ | ✅ Fitzpatrick, melanin-rich, inclusive language |