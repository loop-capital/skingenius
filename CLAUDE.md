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