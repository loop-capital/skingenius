# Wellness Plan — Architecture Review

> **Reviewed:** 2026-06-14 by Che (orchestrator)
> **Status:** Phase 1 complete, Phase 2 blocked by issues below
> **Verdict:** Solid foundation. Fix the bugs, then build Phase 2.

---

## 1. API Review (`/api/v1/wellness-plan/generate`)

### ✅ What's Good
- Scoring algorithm matches spec exactly (condition×0.4 + root_cause×0.3 + mechanism×0.2 + evidence×0.1)
- All 11 protocol builders present and returning structured data
- Tiered peptide filtering respects user comfort level
- Glycation score calculation with factor breakdown
- Plan items generated for daily protocol view
- GET + POST handlers both present

### 🔴 Critical Issues

**1. `lifestyle_responses` table doesn't exist — API will 500**
The POST handler queries `lifestyle_responses` but we skipped the ALTER TABLE because the table doesn't exist. The query won't fail gracefully.
```typescript
// Line ~175: This will return null silently, but downstream code may break
const { data: lifestyle } = await supabase
  .from("lifestyle_responses")
  .select("*")
  ...
```
**Fix:** Either create the `lifestyle_responses` table or make all lifestyle-dependent builders null-safe.

**2. Missing error handling on reference data queries**
The `Promise.all` block fetching supplements, peptides, diet protocols, etc. has no error handling. If any query fails, the response will be partial with no warning.
```typescript
const [{ data: allSupplements }, { data: allPeptides }, { data: allDietProtocols }] =
  await Promise.all([...]); // No .catch() — silent failure
```
**Fix:** Add error handling and return 500 if critical reference data fails to load.

**3. Hardcoded `dev-user` in GET fallback**
```typescript
const effectiveUserId =
  process.env.NODE_ENV === "development" && !userId
    ? "00000000-0000-0000-0000-000000000000"
    : userId;
```
The logic is inverted — it only applies when `userId` is falsy AND in dev mode, but `userId` is already validated above. Dead code, but confusing.

**4. Response shape inconsistency**
- `GET` returns `{ plan, items }` 
- `POST` returns the flat plan object

The frontend `WellnessPlanPage` handles both, but this is fragile.

### 🟡 Moderate Issues

**5. Scoring doesn't normalize by array length**
`safeArrayOverlap` counts raw matches. A supplement with 20 `concerns_treated` entries is more likely to match than one with 3, regardless of relevance. Consider Jaccard similarity or at least normalize.

**6. Supplement timing is hardcoded to "morning"**
```typescript
timing: "morning", // All supplements get the same timing
```
The `supplement_protocols` table has timing data that's being ignored.

**7. No deduplication between supplement protocols and raw supplements**
The scoring queries `supplements` directly, but `supplement_protocols` has condition-specific dosing and timing. These should be joined, not queried separately.

### 🟢 Nice-to-Have

**8. Missing endpoints from spec:**
- `PATCH /api/v1/wellness-plan/items/:itemId` — mark items complete/skipped
- `GET /api/v1/wellness-plan/daily` — time-of-day grouped items
- `POST /api/v1/wellness-plan/checkin` — weekly check-in flow

These are Phase 3 but worth noting for API contract decisions now.

---

## 2. Data Model Review

### ✅ What's Good
- All 13 tables created with proper FK constraints
- RLS enabled on all tables with appropriate policies
- GIN indexes on array columns for efficient querying
- ON CONFLICT handling in seed data

### 🔴 Critical Issues

**1. `lifestyle_responses` table missing**
Referenced by both the API and the schema's ALTER TABLE (which we skipped). Need to either:
- Create the table with the wellness extension columns, OR
- Make the API fully work without it

**2. ~~Supplement ID format mismatch~~** ✅ VERIFIED CLEAN
Ran FK integrity check — all `supplement_protocols.supplement_id` values exist in `supplements`. No orphaned references.

### 🟡 Moderate Issues

**3. `dosage` column is now nullable**
We dropped the NOT NULL constraint to accommodate Basys imports. Some supplements will have null dosage, which will show as blank in the UI.

**4. No `wellness_plan_items` persistence for completion state**
The `DailyProtocolView` tracks completion in local React state (a `Set<string>`). Refreshing the page loses all progress. The `wellness_plan_items` table has `completed_at` and `skipped` columns that aren't being used.

**5. ~~`condition_root_cause_mapping` → `cause_condition_links` naming`~~** ✅ VERIFIED
Table names `cause_condition_links`, `mechanism_chains`, `root_causes`, `mechanisms` all exist and match the API queries.

---

## 3. UI Component Review

### ✅ What's Good
- Clean tabbed layout with 8 sections
- Mobile-responsive grid (4 cols mobile, 8 cols desktop)
- Loading skeleton and error states handled
- SupplementStack has expandable detail view with relevance scores
- GlycationScore has visual progress bar and factor breakdown
- DietProtocolCard has include/avoid food lists with color coding
- DailyProtocolView has time-of-day grouping with checkboxes

### 🔴 Critical Issues

**1. References to non-existent components**
`WellnessPlanPage.tsx` renders `SleepProtocolCard`, `MovementProtocolCard`, `StressProtocolCard`, and `EnvironmentDefenseCard` — but these are defined **inline in the same file**, not as separate components. They compile because they're in the same file, but they're basic and lack the richness the spec describes.

**2. `Pill`, `Activity`, `Brain` icons defined as inline SVGs**
`DailyProtocolView.tsx` defines custom SVG icon components at the bottom because the lucide-react imports at the top (`Sun`, `CloudSun`, `Moon`, `Bed`, `Check`, `Clock`, `Flame`, `Droplets`) don't include `Pill`, `Activity`, or `Brain`. This works but is fragile — should use lucide-react consistently.

**3. No persistence layer for daily protocol completion**
`completedItems` is a React `Set` — lost on page refresh. Needs API integration with `wellness_plan_items.completed_at`.

### 🟡 Moderate Issues

**4. Missing Phase 2 components (from spec):**
| Component | Status |
|-----------|--------|
| PeptideProtocol (standalone tiered card) | ⬜ Not built (inline in SupplementStack) |
| PsychodermProtocol | ⬜ Not built |
| PostProcedureCard | ⬜ Not built |
| FitzpatrickAdjustments | ⬜ Not built |
| MedicationInteractions | ⬜ Not built |
| OralMicrobiomeCard | ⬜ Not built |
| SeasonalAdjustments | ⬜ Not built |
| GutBrainSkinTriad | ⬜ Not built |
| SmokingAlcoholImpact | ⬜ Not built |
| SunExposureProtocol | ⬜ Not built (part of EnvironmentDefenseCard) |
| WeeklyCheckin | ⬜ Not built |
| PlanCustomizer | ⬜ Not built |

**5. No `/wellness-plan/daily` route**
The spec calls for a dedicated daily protocol page. Currently the daily view is just a tab on the main page.

**6. Supplement detail modal is a stub**
`SupplementDetailModal` shows name and dosage only. Should show benefits, evidence, interactions, relevance score.

---

## 4. Integration Points

### How the plan connects to existing systems:

| System | Connection | Status |
|--------|-----------|--------|
| Skin Analysis → Plan | API queries `skin_analyses.conditions` | ✅ Working |
| Lifestyle Questionnaire → Plan | API queries `lifestyle_responses` | ❌ Table doesn't exist |
| User Profile → Plan | API queries `user_skin_profiles.fitzpatrick_type` | ✅ Working |
| Root Causes → Scoring | API queries `cause_condition_links` | ✅ Verified |
| Mechanisms → Scoring | API queries `mechanism_chains` | ✅ Verified |
| Auth → User ID | Frontend sends `user_id` in request body | ⚠️ No auth check |

### Auth Concern
The API accepts `user_id` in the request body with no authentication verification. In production, any user can generate a plan for any other user. Should use `auth.uid()` from Supabase session.

---

## 5. Recommendations

### Before Phase 2 — Fix These:

1. **Create `lifestyle_responses` table** or make API null-safe for all lifestyle-dependent builders
2. **Audit supplement ID FK integrity** — verify all `supplement_protocols.supplement_id` values exist in `supplements`
3. **Verify table names** — `cause_condition_links` and `mechanism_chains` must match actual schema
4. **Add error handling** to the `Promise.all` reference data queries
5. **Standardize response shape** — GET and POST should return the same structure
6. **Wire up supplement timing** from `supplement_protocols` instead of hardcoding "morning"

### Phase 2 Build Order (recommended):

| Priority | Component | Effort | Why |
|----------|-----------|--------|-----|
| 1 | Daily protocol persistence (API + UI) | 1 day | Core engagement loop |
| 2 | Standalone PeptideProtocol card | 0.5 day | High-value differentiator |
| 3 | PsychodermProtocol card | 0.5 day | Unique feature |
| 4 | MedicationInteractions warnings | 0.5 day | Safety-critical |
| 5 | PostProcedureCard | 0.5 day | Recovery guidance |
| 6 | SunExposureProtocol (standalone) | 0.5 day | Fitzpatrick-specific |
| 7 | SeasonalAdjustments card | 0.5 day | Dynamic relevance |
| 8 | GutBrainSkinTriad visualization | 1 day | Complex but differentiated |
| 9 | WeeklyCheckin flow | 1 day | Retention mechanism |
| 10 | PlanCustomizer | 1 day | User control |

### Phase 3 Considerations:

- **API auth** — Use Supabase auth instead of passing user_id in body
- **Supplement protocol joins** — Use `supplement_protocols` for condition-specific dosing
- **Scoring normalization** — Consider Jaccard similarity for array overlap
- **Caching** — Reference data (peptides, supplements, protocols) changes rarely; cache in memory
- **Pagination** — 804 supplements loaded every plan generation; consider limiting to skin-relevant subset

---

## 6. Summary

| Area | Score | Blockers |
|------|-------|----------|
| API | 7/10 | lifestyle_responses table missing, no error handling |
| Data Model | 8/10 | FK integrity audit needed |
| UI Components | 6/10 | Phase 2 cards missing, no persistence |
| Integration | 6/10 | Auth gap only — table names verified |
| **Overall** | **7/10** | **4 blockers remain, then build Phase 2** |

**Bottom line:** The foundation is solid. The scoring algorithm, data model, and basic UI are all in place. Fix the 6 blockers above (1-2 days of work), then Phase 2 is pure UI expansion on a proven architecture.

---

*This review lives at `skingenius/docs/WELLNESS-PLAN-ARCHITECTURE-REVIEW.md`.*
