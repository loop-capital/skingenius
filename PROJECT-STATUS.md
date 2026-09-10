# PROJECT-STATUS.md — SKINgenius

> **Last updated:** 2026-09-09
> **Purpose:** Single source of truth for what is done, what is in progress, and what is next.

## Current Blockers
- **Supabase auth blocked:** Email confirmation flow is broken. Jason has seen this before — confirm email endpoint returns 500.
- **Skin scan model:** No production vision model for skin analysis yet. Using placeholder mock. Need to decide: on-device (Gemma) vs server-side API.
- **Routine algorithm:** No personalization engine built yet. Currently serving generic routines instead of custom logic.
- **Affiliate wiring:** Amazon Affiliate tags not applied to product links. Revenue not active.

## Active Tasks
- [ ] Fix Supabase email confirmation (500 error)
- [ ] Build vision model pipeline (placeholder → production)
- [ ] Write recommendation engine algorithm
- [ ] Wire Amazon Affiliate tags to product links
- [ ] Create landing page (skingenius.co)
- [ ] Deploy to Vercel

## Next Up (Priority Order)
1. Fix Supabase auth → unblock development
2. Write recommendation algorithm spec → then build
3. Build vision model integration spec → then build
4. Wire affiliate links
5. Deploy landing page

## What Has Been Done (2026-09)
- Supabase project setup complete (schema migrated, tables built)
- 776 supplement entries loaded into knowledge-base
- Skincare routine template structure created
- Basic ingredient database built
- API endpoints scaffolded (analyze, recommends, routines)

## What Has NOT Been Done
- Actual skin scan vision model (placeholder only)
- Recommendation engine personalization (serving generic)
- Affiliate links (no revenue pipeline)
- Landing page (no public face)
- No production deployment

## Blocker History
- 2026-09-08: SKINgenius team said they have no PROJECT-STATUS.md. This file now exists to fix that.
