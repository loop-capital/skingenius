# LESSONS-LEARNED.md — SKINgenius Failure Log

> **Purpose:** Document failures so they don't repeat. Log lessons specific to SKINgenius work here.
> **⚠️ Anti-patterns AP-001 through AP-034 live in the main file:** `~/.openclaw/workspaces/che/LESSONS-LEARNED.md`
> Read that file for universal anti-patterns. This file contains ONLY SKINgenius-specific lessons.

---

## Platform Knowledge (SKINgenius Stack)

### Next.js
- _Add lessons here as you encounter issues_

### Supabase
- Service role key ≠ anon key (different permissions)
- Rotating keys breaks connected services
- 11 tables live: profiles, skin_photos, skin_conditions, skin_analyses, ingredients, products, routines, routine_steps, user_skin_profiles, skin_log_entries, ingredient_reactions
- Schema: `supabase/schema.sql`

### TypeScript
- _Add lessons here as you encounter issues_

### Vercel
- Free tier: 100 deploys/day, resets midnight UTC (8 PM ET)
- Batch edits, don't deploy one at a time

## FLAME Model (PoC)
- Load via `pickle.load(f, encoding='latin1')`
- Keys: `f` (faces), `J_regressor` (joint regressor), `shapedirs` (identity/shape PCA: (5023, 3, 400)), `posedirs` (pose deformations: (5023, 3, 36)), `weights` (skinning weights: (5023, 5)), `v_template` (neutral template: (5023, 3))
- Expression/shape parameters must match PCA dimensions (400 shape, likely 100 expr from metadata though `shapedirs` bundles identity PCA).
- Actual blendshape directions for expression are in `posedirs` when `bs_type` is 'lbs'.
- Need custom expression handling: `shapedirs` covers identity PCA; `posedirs` is pose-dependent and may hold expression components too.

---

## Project-Specific Lessons

_SKINgenius failures and discoveries go here. Every session should check this before starting work._
