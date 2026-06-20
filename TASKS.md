# TASKS.md — SKINgenius

> **Sprint 1** | Start: 2026-05-13 | MVP Target: 2026-07-07
> **Week 5 Review:** 2026-06-15 | Updated by: Nova (skingenius-ceo)

---

## 🚨 Sprint 1, Week 5 — RECOVERY SPRINT

**Weeks 3-4 were lost to model failures and team dormancy.** Week 5 is a recovery sprint: commit existing work, complete critical-path architecture, reactivate dev agents.

**MVP Deadline: July 7, 2026 — 22 days remaining.**

### Critical Path (Must Complete This Week — Weeks 3-5 Carryover)
| # | Status | Task | Owner | ETA |
|---|--------|------|-------|-----|
| 1 | [ ] | ⚡ **Git commit 299 uncommitted files** (23 days of work at risk) | Nova | Mon |
| 2 | [ ] | Define AI pipeline architecture (photo → condition → recommendation) | Dermis | Mon-Tue |
| 3 | [ ] | Design database schema (conditions, ingredients, products, users, routines) | Dermis + Core | Mon-Tue |
| 4 | [ ] | Define scan API contract (input/output JSON schema) | Dermis | Tue |
| 5 | [ ] | Fix Vercel build errors — deployment must work | Forge + Pixel | Mon-Tue |
| 6 | [ ] | Provision PostgreSQL (Neon) + pgvector extension | Forge | Mon-Tue |

### High Priority (Should Complete This Week)
| # | Status | Task | Owner | ETA |
|---|--------|------|-------|-----|
| 7 | [ ] | Evaluate vision models for skin condition classification | Lens | Wed-Thu |
| 8 | [ ] | Apply Supabase schema to live DB (tables exist in code, not deployed) | Forge + Core | Tue |
| 9 | [ ] | Resolve Supabase JWT connection issue | Forge | Tue |
| 10 | [ ] | Seed remaining 61 ingredients (target: 169 prioritized actives) | Core | Wed-Fri |
| 11 | [ ] | Build condition-ingredient mapping (acne, hyperpigmentation, rosacea) | Core + Sage | Thu-Fri |
| 12 | [ ] | Clinical research scan — acne, hyperpigmentation, rosacea | Sage | Mon (dispatched) |
| 13 | [ ] | Build `/api/scan` endpoint skeleton | Pixel | Wed-Thu |
| 14 | [~] | Research top 10 skin conditions with clinical grading scales | Sage | Wed-Fri |

### Nice to Have
| # | Status | Task | Owner | ETA |
|---|--------|------|-------|-----|
| 15 | [ ] | Design scan flow (camera capture + upload) | Aura | Thu |
| 16 | [ ] | Configure Prisma + initial migrations | Forge | Fri |
| 17 | [ ] | Product database expansion — target 300 products | Core | Fri |

---

## Epic 1 — Architecture & Foundation
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Define AI pipeline architecture (photo → condition → recommendation) | Dermis | Week 5 (CRITICAL) |
| [ ] | Design database schema: conditions, ingredients, products, users, routines | Dermis + Core | Week 5 (CRITICAL) |
| [ ] | Define scan API contract (input/output JSON schema) | Dermis | Week 5 (CRITICAL) |
| [ ] | Evaluate vision models for skin condition classification | Lens | Week 5 |
| [ ] | Select and document tech stack decisions (ADRs) | Dermis | Week 5 |

## Epic 2 — Data Foundation
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [~] | Build ingredient database schema + seed 200 core actives | Core | Week 5 (108 done, need 169) |
| [ ] | Build condition-ingredient mapping (conditions → actives that address them) | Core + Sage | Week 5 |
| [ ] | Seed product database: 50 benchmark products across categories | Core | Week 5 |
| [x] | Build evidence scoring algorithm | Core | ✅ Done |
| [~] | Research top 10 skin conditions: profiles + clinical grading scales | Sage | Week 5 |
| [~] | Research key actives: Niacinamide, Retinol, Vitamin C, AHA/BHA, Hyaluronic Acid, SPF | Sage | Partially done |

## Epic 3 — AI Vision Pipeline
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Engineer skin analysis prompt for vision model (structured JSON output) | Lens | Week 5-6 |
| [ ] | Build `/api/scan` endpoint skeleton | Pixel | Week 5 |
| [ ] | Integrate vision model into scan endpoint | Lens + Pixel | Week 5-6 |
| [ ] | Implement confidence scoring + threshold filtering | Lens | Week 5-6 |
| [ ] | Implement urgentFlag logic (suspicious lesion → dermatologist CTA) | Lens | Week 6 |
| [ ] | Test scan pipeline with 20 sample photos | Lens | Week 6 |

## Epic 4 — Infrastructure
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Fix Vercel build errors — deployment must work | Forge + Pixel | Week 5 (CRITICAL) |
| [ ] | Provision PostgreSQL database (Neon) + pgvector extension | Forge | Week 5 (CRITICAL) |
| [ ] | Apply Supabase schema to live DB | Forge + Core | Week 5 |
| [ ] | Resolve Supabase JWT connection issue | Forge | Week 5 |
| [ ] | Set up S3-compatible storage (Cloudflare R2) with encryption + CORS | Forge | Week 5-6 |
| [ ] | Configure Prisma + run initial migrations | Forge | Week 5 |
| [ ] | Set up GitHub Actions CI/CD (lint, typecheck, test, deploy) | Forge | Week 5-6 |
| [ ] | Configure Sentry error tracking | Forge | Week 6 |
| [ ] | Implement rate limiting on scan API (Upstash Redis) | Forge | Week 6 |

## Epic 5 — Core UI
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Design scan flow (camera capture + upload) | Aura | Week 5 |
| [ ] | Design results page (condition breakdown + recommendations) | Aura | Week 5-6 |
| [ ] | Design product recommendation card component | Aura | Week 5-6 |
| [ ] | Design routine builder UI (AM/PM stack) | Aura | Week 6 |
| [ ] | Implement image capture/upload component (mobile-first) | Pixel | Week 5-6 |
| [ ] | Implement scan results page | Pixel | Week 6 |
| [ ] | Implement product recommendation cards | Pixel | Week 6-7 |
| [ ] | Implement routine builder | Pixel | Week 7 |

## Epic 6 — Recommendation Engine
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Build recommendation ranking algorithm | Core | Week 5-6 |
| [ ] | Build `/api/recommendations` endpoint | Pixel + Core | Week 5-6 |
| [ ] | Implement supplement recommendations module | Core + Sage | Week 6 |
| [ ] | Implement professional referral routing (condition severity → service tier) | Core | Week 6-7 |

## Epic 7 — MVP Polish & Launch Prep
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Auth integration (Clerk) | Pixel | Week 6 |
| [ ] | User scan history | Pixel | Week 6-7 |
| [ ] | Onboarding flow (skin type + goals quiz) | Pixel + Aura | Week 7 |
| [ ] | Full security audit | Guard | Week 7 |
| [ ] | Performance audit (sub-3s scan target) | Forge + Lens | Week 7 |
| [ ] | MVP beta prep (5 aesthetician testers) | Nova | Week 7-8 |

---

## Done
- [x] Build evidence scoring algorithm (Core) — 2026-05-14
- [x] Gut-skin axis research (Sage) — 2026-05-14
- [x] Hormone-skin connection research (Sage) — 2026-05-14
- [x] Root cause mapping for 10 conditions (Sage + Core) — 2026-05-14
- [x] 236 products seeded across 21 brands — 2026-05-14
- [x] GetUpLook integration designed — 2026-05-14
- [x] 5 UI components created (Aura) — 2026-05-14
- [x] Supabase schema (11 tables, RLS) — 2026-05-14
- [x] Ingredient frequency analysis (169 ingredients prioritized) — 2026-05-14
- [x] 108 ingredients seeded into Supabase — 2026-05-24
- [x] Evidence level mapping bug fixed — 2026-05-24
- [x] Category validation bug fixed — 2026-05-24
- [x] Core + Viral features spec created — 2026-05-24
- [x] Vision Model Research doc added — 2026-05-24
- [x] Treatment simulation pipeline architecture spec (ADR-006) — 2026-06-10
- [x] FastAPI treatment simulation service (health endpoint) — 2026-06-10
- [x] PMC Open Access scraper (157 images, 6 categories) — 2026-06-10
- [x] CUT model training data pipeline built — 2026-06-10
- [x] FDA clinical photos dataset analysis (135 images) — 2026-06-10
- [x] 3D mesh model evaluation (FLAME vs alternatives) — 2026-06-10
- [x] Image translation models evaluation (CUT vs CycleGAN vs pix2pix) — 2026-06-10
- [x] Wellness Plan Phase 1 (14-table schema, seed data, API route, 7 UI components) — 2026-06-13

## Blocked / Waiting
- ⚡ 299 uncommitted files — git commit needed ASAP
- Supabase schema not yet applied to live DB (Forge dispatched May 21 — dormant)
- Vercel deployment failing (build errors — unresolved since May)
- AI pipeline architecture decision (Dermis dispatched May 21 — dormant)
- Supabase JWT connection issue — unresolved
- Sub-agent brand scraping results (4 agents dispatched May 21 — check results)

---

## Phase 2 Backlog
- Basys Health biomarker integration
- HAIRgenius architecture alignment
- ByondEdu skincare certification courses
- Professional (B2B) aesthetician dashboard
- Product affiliate/commerce integration

---

## Sprint Metrics

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 Target |
|--------|--------|--------|--------|--------|---------------|
| Products | 236 | 236 | 236 | 236 | 300 |
| Ingredients seeded | 30 | 108 | 108 | 108 | 169 |
| Skin conditions | 14 | 14 | 14 | 14 | 20 |
| UI components | 5 | 5 | 5 | 12 | 15 |
| Research docs | 8 | 9 | 9 | 12 | 15 |
| Critical path done | 0/5 | 0/5 | 0/5 | 0/5 | 3/5 |
| Git commits | 5 | 5 | 1 | 0 | 5+ |