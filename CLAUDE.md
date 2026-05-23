# CLAUDE.md — SKINgenius Workspace

## Identity
This is the SKINgenius workspace. AI-powered skin analysis: photo → condition detection → product/supplement/professional service recommendations.

## Session Startup
1. Read SOUL.md — who you are and what matters
2. Read MEMORY.md — current project state
3. Read TASKS.md — what's in progress
4. Check `memory/` for recent daily notes

## Team
| Agent ID | Name | Model | Role |
|----------|------|-------|------|
| skingenius-ceo | Nova | Xiaomi MiMo V2 Pro | CEO / Orchestrator |
| skingenius-architect | Dermis | Kimi K2 Thinking | Platform Architect |
| skingenius-dev | Pixel | Kimi K2.6 | Full-Stack Dev |
| skingenius-ai | Lens | MiMo V2 Omni (Vision) | AI/Vision Specialist |
| skingenius-data | Core | Nemotron 3 Super | Data Engineering |
| skingenius-devops | Forge | Nemotron 3 Super | DevOps |
| skingenius-design | Aura | Kimi K2.6 | UX/Design |
| skingenius-syntax | Guard | MiniMax M2.7 | Code Quality |
| skingenius-meta | Pulse | GLM-5.1 | Meta/Tracking |

## Database — LIVE (as of 2026-05-13)
- **Supabase project:** cnzoilxsttoqtvwotexd.supabase.co
- **.env.local** has both anon key and service role key
- **Client helpers:** src/utils/supabase/server.ts, client.ts, middleware.ts
- **11 tables with RLS** — see MEMORY.md for full list
- **Seed data loaded:**
  - 14 skin conditions (Acne, Eczema, Rosacea, Psoriasis, etc.)
  - 30 ingredients (Retinol, Niacinamide, Hyaluronic Acid, etc.)
  - 48 products (CeraVe, The Ordinary, La Roche-Posay, SkinCeuticals, etc.)
- **Schema file:** supabase/schema.sql

## Research Materials
- `skincare-research/` — 25+ research docs from Lucy team
- `skincare-research/PRD-v1.md` — Full product requirements doc
- `skincare-research/INDEX.md` — Master index of all research
- `skincare-research/data/` — Seed JSON files (already loaded into DB)
- `skincare-research/COMPETITIVE-MATRIX.md` — Feature comparison
- `skincare-research/PITCH-DECK.md` — Investor presentation

## Key Architecture Decisions
- **Web-first MVP** using Next.js (current scaffold)
- **AI model:** MiMo V2 Omni for skin photo analysis (vision model)
- **Database:** Separate Supabase instance (NOT shared with Basys Health)
- **Cross-product data:** API layer for Basys Health biomarkers (read-only)
- **Evidence-first:** Every claim must cite PubMed/clinical trials

## Hard Rules
- Never diagnose — analyze, recommend, refer
- Never fabricate clinical evidence — cite PubMed
- Skin photos are health data — encrypted, presigned URLs only
- urgentFlag: true → suppress all product recs, show dermatologist CTA only
- TypeScript strict mode — no `any`

## Also see: AGENTS.md for tools + collaboration context

---

## Critical Rules

### 0. NEVER Publish Sensitive Data
- NEVER commit passwords, API keys, tokens, or secrets to git
- NEVER commit .env files — verify .env is in .gitignore
- Before ANY commit: verify no secrets are included
- Supabase service role key NEVER in client code

### 1. TypeScript Always
- ALWAYS use TypeScript for new files (strict mode)
- NEVER use `any` unless absolutely necessary and documented why
- Explicit return types on exported functions
- Proper null handling (`User | null`)

### 2. API Endpoints
- ALWAYS validate input before processing (Zod)
- ALWAYS return proper HTTP status codes
- ALWAYS include auth checks
- NEVER expose Supabase service role key in client code
- ALL endpoints use `/api/v1/` prefix
- Pagination on ALL list endpoints (default 20, max 100)

### 3. Testing
- Write tests for all new API endpoints
- Every PR must pass `npm run build`
- E2E tests for user-facing flows
- Unit tests for business logic
- Integration tests for database queries

### 4. Worktrees
- NEVER work directly on main
- Use `git worktree` or feature branches for all changes
- Create branches with pattern: `feat/`, `fix/`, `refactor/`, `test/`

### 5. Security
- Run /security-check before any deployment
- Run /review before any PR merge
- Check for XSS, SQL injection, auth bypass on every change
- Supabase RLS enabled on ALL tables
- Skin photos encrypted at rest and in transit

### 6. SKINgenius Medical Safety
- NEVER diagnose definitively — always recommend dermatologist
- NEVER fabricate clinical evidence — cite PubMed
- urgentFlag: true → suppress ALL product recs, show dermatologist CTA only
- Skin data treated as health data (encrypted, access-controlled)
- Product recommendations evidence-based, not marketing-driven

### 7. Quality Gates
- No file exceeds 300 lines
- No function exceeds 50 lines
- No barrel imports
- No circular imports
- No dead code (commented-out code, unused functions)