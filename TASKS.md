# TASKS.md — SKINgenius

> **Sprint 12** | Start: 2026-07-31 | MVP Target: **2026-08-07 (UNREACHABLE without Jason)**
> **Week 12 Review:** 2026-07-31 | Updated by: Nova (skingenius-ceo)
> **⚠️ ORIGINAL MVP DEADLINE PASSED (Jul 7) — PROJECT IN STASIS DAY 45+**

---

## 🚨 Sprint 12 — Hard Reset: Document-First, Lower Bar

**Sprint 11 FAILED: 0/6 tasks completed. Day 45 of code stasis. MVP deadline July 7 PASSED (Day 24+).** 140+ consecutive Pulse cycles produced ZERO structural changes. 9/11 agents dormant. No human interaction in 14+ days. **Root cause unchanged: Che dispatch spam consumes ~24 CEO sessions/day, leaving zero capacity for autonomous work.**

**Strategy for Sprint 12:** Same document-first approach, but with explicit acceptance that without Jason's involvement, no sprint can succeed on code deliverables. Focus on knowledge work and documentation that CAN be done autonomously. 4th carry for AI pipeline spec.

**🔴 STILL BLOCKED ON JASON (83+ cycles, 45+ days):**

1. **MVP direction decision** — slip confirmed to Aug 7, scope cut still needs approval (35+ days)
2. **Rotate 3 leaked API keys** (8TH WEEK APPROACHING — CRITICAL SECURITY INCIDENT)
3. **Reduce Che heartbeat** from 30min to 12h (~1,500 CEO sessions, ~100% cron spam)

### Tier 1: Autonomous CEO Execution (This Week — Sprint 12)

| #   | Status | Task                                           | Owner | ETA      | Notes                           |
| --- | ------ | ---------------------------------------------- | ----- | -------- | ------------------------------- |
| 1   | [ ]    | Write AI pipeline architecture spec document   | Nova  | Mon      | 4TH CARRY (Sprint 10→11→12)     |
| 2   | [ ]    | Write condition-ingredient mapping table       | Nova  | Wed      | Research-backed Markdown table  |
| 3   | [ ]    | Write scan API contract (JSON schema)          | Nova  | Fri      | Based on #1                     |
| 4   | [ ]    | Audit Vercel build errors — diagnosis doc only | Nova  | Next Mon | No code changes                 |
| 5   | [ ]    | Review Jul 19 git drift — assess mergeability  | Nova  | Next Tue | 640K insertions, 12+ days stale |

### Tier 2: Requires Jason (BLOCKED — 45+ days)

| #   | Status | Task                                                   | Owner | Blocked Since                           |
| --- | ------ | ------------------------------------------------------ | ----- | --------------------------------------- |
| 1   | [ ]    | MVP direction decision (slip confirmed, scope cut TBD) | Jason | Jun 26 (35+ days)                       |
| 2   | [ ]    | Rotate 3 leaked API keys                               | Jason | Jun 16 (45+ days, 8th week approaching) |
| 3   | [ ]    | Fix Che heartbeat (30min → 12h)                        | Jason | Jun 18 (43+ days)                       |
| 4   | [ ]    | Reactivate dev agents                                  | Jason | Ongoing (39+ days)                      |
| 5   | [ ]    | Provision Neon database                                | Jason | Week 6 (56+ days)                       |
| 6   | [ ]    | Apply schema to live Supabase                          | Jason | Week 6 (56+ days)                       |

### Tier 3: Deferred (Post-Jason-Return)

- Wellness Plan Phase 2+ features
- Routine builder UI
- Professional referral routing
- Auth integration (Clerk)
- Onboarding flow
- CI/CD pipeline
- Sentry error tracking
- Rate limiting
- Seed remaining 61 ingredients (target: 169)
- Deploy any code changes
- Actual Vercel build fixes

### Recommended MVP Scope (August 7 Target — SLIP CONFIRMED, SCOPE CUT PENDING)

**Minimum viable product:**

1. Photo upload → AI condition analysis
2. Condition breakdown with confidence scores
3. Ingredient recommendations based on conditions
4. Urgent flag for suspicious lesions (dermatologist CTA)

**Cut from MVP:** Wellness plan, routine builder, professional referrals, auth, onboarding, CI/CD, Sentry, rate limiting

**⚠️ Jason MUST APPROVE this scope cut. Without it, we cannot prioritize.**

---

## Epic 1 — Architecture & Foundation

| Status | Task                                                                       | Owner     | ETA                   |
| ------ | -------------------------------------------------------------------------- | --------- | --------------------- |
| [ ]    | Define AI pipeline architecture (photo → condition → recommendation)       | Nova      | Sprint 12 (4TH CARRY) |
| [ ]    | Design database schema: conditions, ingredients, products, users, routines | Nova      | Sprint 12+            |
| [ ]    | Define scan API contract (input/output JSON schema)                        | Nova      | Sprint 12             |
| [ ]    | Evaluate vision models for skin condition classification                   | Lens/Sage | Sprint 12+            |
| [ ]    | Select and document tech stack decisions (ADRs)                            | Nova      | Sprint 12+            |

## Epic 2 — Data Foundation

| Status | Task                                                                                 | Owner     | ETA                             |
| ------ | ------------------------------------------------------------------------------------ | --------- | ------------------------------- |
| [~]    | Build ingredient database schema + seed 200 core actives                             | Core/Nova | Sprint 12+ (108 done, need 169) |
| [ ]    | Build condition-ingredient mapping (conditions → actives that address them)          | Nova      | Sprint 12                       |
| [ ]    | Seed product database: 50 benchmark products across categories                       | Core      | Post-MVP                        |
| [x]    | Build evidence scoring algorithm                                                     | Core      | ✅ Done                         |
| [~]    | Research top 10 skin conditions: profiles + clinical grading scales                  | Sage      | Partially done (updated Jul 13) |
| [~]    | Research key actives: Niacinamide, Retinol, Vitamin C, AHA/BHA, Hyaluronic Acid, SPF | Sage      | Partially done                  |

## Epic 3 — AI Vision Pipeline

| Status | Task                                                                    | Owner      | ETA        |
| ------ | ----------------------------------------------------------------------- | ---------- | ---------- |
| [ ]    | Engineer skin analysis prompt for vision model (structured JSON output) | Nova/Lens  | Sprint 12+ |
| [ ]    | Build `/api/scan` endpoint skeleton                                     | Nova       | Sprint 12+ |
| [ ]    | Integrate vision model into scan endpoint                               | Lens/Pixel | Sprint 13+ |
| [ ]    | Implement confidence scoring + threshold filtering                      | Lens       | Sprint 13+ |
| [ ]    | Implement urgentFlag logic (suspicious lesion → dermatologist CTA)      | Lens       | Sprint 13+ |
| [ ]    | Test scan pipeline with 20 sample photos                                | Lens       | Sprint 13+ |

## Epic 4 — Infrastructure

| Status | Task                                                                | Owner      | ETA                            |
| ------ | ------------------------------------------------------------------- | ---------- | ------------------------------ |
| [ ]    | Fix Vercel build errors — deployment must work                      | Nova       | Sprint 12 (DIAGNOSIS DOC ONLY) |
| [ ]    | Provision PostgreSQL database (Neon) + pgvector extension           | Jason      | BLOCKED (56+ days)             |
| [ ]    | Apply Supabase schema to live DB                                    | Jason      | BLOCKED (56+ days)             |
| [ ]    | Resolve Supabase JWT connection issue                               | Nova/Forge | Sprint 12+                     |
| [ ]    | Set up S3-compatible storage (Cloudflare R2) with encryption + CORS | Forge      | Post-MVP                       |
| [ ]    | Configure Prisma + run initial migrations                           | Nova       | Sprint 12+                     |
| [ ]    | Set up GitHub Actions CI/CD (lint, typecheck, test, deploy)         | Forge      | Post-MVP                       |
| [ ]    | Configure Sentry error tracking                                     | Forge      | Post-MVP                       |
| [ ]    | Implement rate limiting on scan API (Upstash Redis)                 | Forge      | Post-MVP                       |

## Epic 5 — Core UI

| Status | Task                                                        | Owner     | ETA          |
| ------ | ----------------------------------------------------------- | --------- | ------------ |
| [ ]    | Design scan flow (camera capture + upload)                  | Aura/Nova | Sprint 13+   |
| [ ]    | Design results page (condition breakdown + recommendations) | Aura/Nova | Sprint 13+   |
| [ ]    | Design product recommendation card component                | Aura/Nova | Sprint 13+   |
| [ ]    | ~~Design routine builder UI (AM/PM stack)~~                 | —         | CUT from MVP |
| [ ]    | Implement image capture/upload component (mobile-first)     | Pixel     | Sprint 13+   |
| [ ]    | Implement scan results page                                 | Pixel     | Sprint 14+   |
| [ ]    | Implement product recommendation cards                      | Pixel     | Sprint 14+   |
| [ ]    | ~~Implement routine builder~~                               | —         | CUT from MVP |

## Epic 6 — Recommendation Engine

| Status | Task                                        | Owner      | ETA          |
| ------ | ------------------------------------------- | ---------- | ------------ |
| [ ]    | Build recommendation ranking algorithm      | Core/Nova  | Sprint 13+   |
| [ ]    | Build `/api/recommendations` endpoint       | Pixel/Core | Sprint 13+   |
| [ ]    | Implement supplement recommendations module | Core/Sage  | Post-MVP     |
| [ ]    | ~~Implement professional referral routing~~ | —          | CUT from MVP |

## Epic 7 — MVP Polish & Launch Prep

| Status | Task                                         | Owner      | ETA          |
| ------ | -------------------------------------------- | ---------- | ------------ |
| [ ]    | ~~Auth integration (Clerk)~~                 | —          | CUT from MVP |
| [ ]    | User scan history                            | Pixel      | Post-MVP     |
| [ ]    | ~~Onboarding flow (skin type + goals quiz)~~ | —          | CUT from MVP |
| [ ]    | Full security audit                          | Guard      | Pre-launch   |
| [ ]    | Performance audit (sub-3s scan target)       | Forge/Lens | Pre-launch   |
| [ ]    | MVP beta prep (5 aesthetician testers)       | Nova       | Sprint 14+   |

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
- [x] FDA clinical photos dataset analysis (135 images) — 2026-06-10
- [x] 3D mesh model evaluation (FLAME vs alternatives) — 2026-06-10
- [x] Image translation models evaluation (CUT vs CycleGAN vs pix2pix) — 2026-06-10
- [x] Wellness Plan Phase 1 (14-table schema, seed data, API route, 7 UI components) — 2026-06-13
- [x] Git commit 214 files (4 commits) — 2026-06-21
- [x] Pulse delivery fixed (Telegram target working) — 2026-06-21
- [x] Meta turn failures resolved (glm-5.1:cloud stable at ~0%) — 2026-06-21
- [x] Sage clinical scan completed (8 Obsidian notes) — 2026-06-29
- [x] Facial Aesthetics Analysis SPEC (714 lines) — 2026-06-29
- [x] Sprint 8 review + stasis assessment — 2026-07-06
- [x] Sprint 9 hard reset review — 2026-07-06
- [x] Sprint 10 review (document-first strategy) — 2026-07-13
- [x] Sprint 11 review (carried forward, Jul 19 agent spark) — 2026-07-20
- [x] Sprint 12 review (hard reset, document-first) — 2026-07-31

## Blocked / Waiting

- ⚡ **Jason MUST DECIDE on MVP scope cut** — slip confirmed to Aug 7, scope cut STILL needs approval (35+ days)
- ⚡ **3 API keys need rotation** — Jason action required (45+ days, 8th week approaching, CRITICAL SECURITY INCIDENT)
- ⚡ **Che heartbeat spamming CEO** — Jason action required (~1,500 sessions, ~100% cron, reduce to 12h)
- ⚡ **Reactivate dev agents** — Jason action required (9/11 dormant 39-61+ days)
- 🔴 Database schema not applied to live DB (BLOCKED on Neon provisioning, 56+ days)
- 🔴 Supabase JWT connection issue — unresolved
- 🔴 Zero feature velocity for 45+ days (last meaningful code: June 21)
- 🔴 Auto-execute threshold passed 33+ days — NOT ENACTED
- 🔴 Telegram delivery BROKEN (5+ consecutive cycles, chat "not found")
- 🟡 AI pipeline architecture — CEO writing spec doc (4TH CARRY, Day 25+ overdue)
- 🟡 Vercel build errors — CEO auditing (CARRIED FROM SPRINT 10)
- 🟡 Jul 19 agent output — 640K insertions, uncommitted, unverified, 12+ days stale

## Phase 2 Backlog

- Basys Health biomarker integration
- HAIRgenius architecture alignment
- ByondEdu skincare certification courses
- Professional (B2B) aesthetician dashboard
- Product affiliate/commerce integration

---

## Sprint Metrics

| Metric                   | Sprint 10   | Sprint 11 Actual     | Sprint 12 Target    |
| ------------------------ | ----------- | -------------------- | ------------------- |
| Products                 | 236         | 236                  | 236                 |
| Ingredients seeded       | 108         | 108                  | 108                 |
| Skin conditions          | 14          | 14                   | 14                  |
| UI components            | 12          | 12                   | 12                  |
| Research docs            | 15+         | 15+                  | 18+                 |
| Critical path done       | 0/8         | 0/8                  | 3/5 (docs + audit)  |
| Git commits (meaningful) | 0           | 0                    | 0 (docs, not code)  |
| Active agents            | 2→4 (spark) | 2 steady             | 2 (CEO+Meta)        |
| Jason decisions          | 0           | 0                    | 0 (STILL BLOCKED)   |
| CEO Che sessions         | 1,464       | ~1,500+              | ~1,560 (projected)  |
| Days in stasis           | 39          | 45+                  | 52+ (projected)     |
| API keys unrotated       | 38+ days    | 45+ days (7th week+) | 52+ days (8th week) |
| Telegram delivery        | BROKEN      | BROKEN               | Unknown             |
| Git drift                | 638K        | 640K (12 days stale) | Assess & triage     |
