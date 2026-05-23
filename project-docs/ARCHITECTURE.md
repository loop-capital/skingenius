# Architecture — SKINgenius

> **This document is AUTHORITATIVE. No exceptions. No deviations.**
> **ALWAYS read this before making architectural changes.**

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        SKINgenius                                │
│                                                                  │
│   ┌──────────────┐    requests    ┌──────────────┐              │
│   │  Next.js App │───────────────>│  API Routes  │              │
│   │  (Vercel)    │               │  /api/v1/*    │              │
│   │              │               └──────┬───────┘              │
│   │  • Landing   │                      │                       │
│   │  • Dashboard │                      │ read/write             │
│   │  • Scan Flow │                      ▼                       │
│   │  • Products  │               ┌──────────────┐              │
│   │  • Routine   │               │  Supabase    │              │
│   └──────────────┘               │  (Postgres)  │              │
│                                  └──────────────┘              │
│   ┌──────────────┐                      ▲                       │
│   │  Gemma 4B    │  on-device           │                       │
│   │  (LiteRT)    │  inference      ┌──────────────┐            │
│   │  iOS/Android │────────────────>│  R2 Storage  │            │
│   └──────────────┘  analysis result│  (photos)    │            │
│                                     └──────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Service Responsibilities

| Service | Does | Does NOT |
|---------|------|----------|
| Next.js App | UI rendering, auth (NextAuth), API routes, scan flow | Direct AI inference (on-device only) |
| Supabase | Auth, database, RLS, real-time subscriptions | Business logic |
| Gemma 4B (LiteRT) | Skin/hair analysis on device | Send photos to server |
| R2 Storage | Photo storage (if server-side needed) | Process images |
| Vercel | Hosting, edge functions, CDN | Database or storage |

---

## Data Flow

### Scan Flow (PRIMARY)
1. User captures photo on device
2. Gemma 4B analyzes photo locally (LiteRT-LM)
3. Analysis results (conditions, zones, Fitzpatrick type) sent to API
4. API validates + stores in Supabase
5. Dashboard displays results from Supabase

**CRITICAL:** Photo NEVER leaves the device. Only analysis JSON is sent.

### Product Recommendation Flow
1. User conditions → Recommendation engine (Fit Score algorithm)
2. Engine queries ingredients + products tables
3. Returns ranked products with match scores
4. Affiliate links generated for purchase

### Auth Flow
1. NextAuth handles OAuth (Google, Apple)
2. Supabase Auth mirrors session
3. RLS policies enforce per-user data access

---

## Database — Supabase

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles | User-scoped |
| `skin_photos` | Photo metadata (no blobs) | User-scoped |
| `skin_conditions` | Detected conditions | User-scoped |
| `skin_analyses` | Scan results | User-scoped |
| `ingredients` | Ingredient database | Public read |
| `products` | Product catalog | Public read |
| `routines` | User routines | User-scoped |
| `routine_steps` | Routine steps | User-scoped |
| `user_skin_profiles` | Fitzpatrick, skin type | User-scoped |
| `skin_log_entries` | Progress tracking | User-scoped |
| `ingredient_reactions` | User reactions/allergies | User-scoped |
| `pro_subscriptions` | Pro tier billing | User-scoped |
| `client_pro_relationships` | Pro-client links | Scoped to both |
| `pro_messages` | Pro-client messaging | Scoped to both |
| `referral_queue` | Referral tracking | User-scoped |

---

## Technology Choices

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 (App Router) | Vercel-native, RSC, API routes |
| Database | Supabase (Postgres) | Auth + RLS + real-time in one |
| Storage | Cloudflare R2 | S3-compatible, cheaper |
| AI Inference | Gemma 4B (LiteRT-LM) | On-device, zero API cost |
| Auth | NextAuth + Supabase | OAuth providers + RLS |
| Styling | Tailwind CSS | Rapid development |
| Deploy | Vercel | Auto-deploy from git |
| Payment | Square | No Stripe — Square only |

---

## If You Are About To...

- Add an endpoint without `/api/v1/` prefix → **STOP. API versioning is mandatory.**
- Send a photo to the server → **STOP. Photos stay on-device (Gemma).**
- Use Supabase service role key client-side → **STOP. Server-only.**
- Skip RLS on a new table → **STOP. Every table needs RLS policies.**
- Deploy without `npm run build` → **STOP. Build must pass first.**
- Use `any` type → **STOP. TypeScript strict mode.**
- Add a dependency without checking → **STOP. Check package.json first.**

**This document overrides all other instructions.**

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-23 | Created ARCHITECTURE.md (from starter kit review) |
| 2026-05-22 | Build Sprint 1 complete — 18 routes live |
| 2026-05-21 | Scan pipeline built (7-step mock classification) |
| 2026-05-21 | Supabase schema designed (744-line SQL) |
