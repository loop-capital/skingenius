# TASKS.md — SKINgenius

> **Sprint 1** | Start: 2026-05-13 | MVP Target: 2026-07-07
> **Week 2 Review:** 2026-05-18 | Updated by: Nova (skingenius-ceo)

---

## 🚨 Sprint 1, Week 2 — CATCH-UP SPRINT

Week 1 delivered strong research but zero architecture/infra tasks. This week focuses on the **critical path**: 5 decisions that unblock 15+ downstream tasks.

### Critical Path (Must Complete This Week)
| # | Status | Task | Owner | ETA |
|---|--------|------|-------|-----|
| 1 | [ ] | Define AI pipeline architecture (photo → condition → recommendation) | Dermis | Mon-Tue |
| 2 | [ ] | Design database schema (conditions, ingredients, products, users, routines) | Dermis + Core | Mon-Tue |
| 3 | [ ] | Define scan API contract (input/output JSON schema) | Dermis | Tue |
| 4 | [ ] | Provision Vercel project + environment variables | Forge | Mon |
| 5 | [ ] | Provision PostgreSQL (Neon) + pgvector extension | Forge | Mon-Tue |

### High Priority (Should Complete This Week)
| # | Status | Task | Owner | ETA |
|---|--------|------|-------|-----|
| 6 | [ ] | Evaluate vision models for skin condition classification | Lens | Wed-Thu |
| 7 | [ ] | Select and document tech stack decisions (ADRs) | Dermis | Wed |
| 8 | [ ] | Build ingredient database schema + seed 200 core actives | Core | Wed-Fri |
| 9 | [ ] | Build condition-ingredient mapping | Core + Sage | Thu-Fri |
| 10 | [x] | Build evidence scoring algorithm | Core | ✅ Done |
| 11 | [~] | Research top 10 skin conditions with clinical grading scales | Sage | Wed-Fri |
| 12 | [ ] | Design scan flow (camera capture + upload) | Aura | Wed-Thu |

### Nice to Have
| # | Status | Task | Owner | ETA |
|---|--------|------|-------|-----|
| 13 | [ ] | Set up S3 storage (Cloudflare R2) with encryption + CORS | Forge | Thu |
| 14 | [ ] | Configure Prisma + initial migrations | Forge | Fri |
| 15 | [ ] | Build /api/scan endpoint skeleton | Pixel | Fri |

---

## Epic 1 — Architecture & Foundation
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Define AI pipeline architecture (photo → condition → recommendation) | Dermis | Week 1-2 |
| [ ] | Design database schema: conditions, ingredients, products, users, routines | Dermis + Core | Week 1-2 |
| [ ] | Define scan API contract (input/output JSON schema) | Dermis | Week 2 |
| [ ] | Evaluate vision models for skin condition classification | Lens | Week 2 |
| [ ] | Select and document tech stack decisions (ADRs) | Dermis | Week 2 |

## Epic 2 — Data Foundation
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Build ingredient database schema + seed 200 core actives | Core | Week 2 |
| [ ] | Build condition-ingredient mapping (conditions → actives that address them) | Core + Sage | Week 2 |
| [ ] | Seed product database: 50 benchmark products across categories | Core | Week 2-3 |
| [x] | Build evidence scoring algorithm | Core | ✅ Done |
| [~] | Research top 10 skin conditions: profiles + clinical grading scales | Sage | Week 1-2 |
| [~] | Research key actives: Niacinamide, Retinol, Vitamin C, AHA/BHA, Hyaluronic Acid, SPF | Sage | Week 1-2 |

## Epic 3 — AI Vision Pipeline
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Engineer skin analysis prompt for vision model (structured JSON output) | Lens | Week 2-3 |
| [ ] | Build /api/scan endpoint skeleton | Pixel | Week 2-3 |
| [ ] | Integrate vision model into scan endpoint | Lens + Pixel | Week 2-3 |
| [ ] | Implement confidence scoring + threshold filtering | Lens | Week 3 |
| [ ] | Implement urgentFlag logic (suspicious lesion → dermatologist CTA) | Lens | Week 3 |
| [ ] | Test scan pipeline with 20 sample photos | Lens | Week 3 |

## Epic 4 — Infrastructure
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Provision Vercel project + environment variables | Forge | Week 1-2 |
| [ ] | Provision PostgreSQL database (Neon) + pgvector extension | Forge | Week 1-2 |
| [ ] | Set up S3-compatible storage (Cloudflare R2) with encryption + CORS | Forge | Week 2 |
| [ ] | Configure Prisma + run initial migrations | Forge | Week 2 |
| [ ] | Set up GitHub Actions CI/CD (lint, typecheck, test, deploy) | Forge | Week 2 |
| [ ] | Configure Sentry error tracking | Forge | Week 3 |
| [ ] | Implement rate limiting on scan API (Upstash Redis) | Forge | Week 3 |

## Epic 5 — Core UI
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Design scan flow (camera capture + upload) | Aura | Week 1-2 |
| [ ] | Design results page (condition breakdown + recommendations) | Aura | Week 2 |
| [ ] | Design product recommendation card component | Aura | Week 2 |
| [ ] | Design routine builder UI (AM/PM stack) | Aura | Week 3 |
| [ ] | Implement image capture/upload component (mobile-first) | Pixel | Week 2-3 |
| [ ] | Implement scan results page | Pixel | Week 3-4 |
| [ ] | Implement product recommendation cards | Pixel | Week 4 |
| [ ] | Implement routine builder | Pixel | Week 4-5 |

## Epic 6 — Recommendation Engine
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Build recommendation ranking algorithm | Core | Week 3-4 |
| [ ] | Build /api/recommendations endpoint | Pixel + Core | Week 4 |
| [ ] | Implement supplement recommendations module | Core + Sage | Week 4-5 |
| [ ] | Implement professional referral routing (condition severity → service tier) | Core | Week 5 |

## Epic 7 — MVP Polish & Launch Prep
| Status | Task | Owner | ETA |
|--------|------|-------|-----|
| [ ] | Auth integration (Clerk) | Pixel | Week 5 |
| [ ] | User scan history | Pixel | Week 5-6 |
| [ ] | Onboarding flow (skin type + goals quiz) | Pixel + Aura | Week 6 |
| [ ] | Full security audit | Guard | Week 6-7 |
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

## Blocked / Waiting
- Sub-agent brand scraping results (4 agents dispatched)
- Supabase JWT regeneration (needs Jason action)

---

## Phase 2 Backlog
- Basys Health biomarker integration
- HAIRgenius architecture alignment
- ByondEdu skincare certification courses
- Professional (B2B) aesthetician dashboard
- Product affiliate/commerce integration
