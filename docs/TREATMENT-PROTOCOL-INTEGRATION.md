# Treatment Protocol Integration — Summary

## What Changed

Wired the `condition_treatment_protocols` table into the SKINgenius Wellness Plan generation API (`src/app/api/v1/wellness-plan/generate/route.ts`).

### 1. Fetch Treatment Protocols (POST handler)

Added a new Supabase query inside the reference-data fetch block (after gut/brain/skin and sun exposure protocols):

```typescript
// Fetch treatment protocols for detected conditions
const { data: treatmentProtocols } = await supabase
  .from("condition_treatment_protocols")
  .select("*")
  .in("condition_slug", skinConditions.length > 0 ? skinConditions : ["_none_"])
  .order("phase_order", { ascending: true });
```

The results are grouped by condition slug:

```typescript
protocolsByCondition = {};
(treatmentProtocols ?? []).forEach((p) => {
  const slug = p.condition_slug as string;
  if (!protocolsByCondition[slug]) protocolsByCondition[slug] = [];
  protocolsByCondition[slug].push(p);
});
```

### 2. Store in `wellness_plans` Table

Added `treatment_protocols: protocolsByCondition` to the `planInsert` object so every generated plan persists its condition-specific protocols.

### 3. Return in API Response (POST handler)

Added `treatment_protocols: protocolsByCondition` to the JSON response returned by `POST /api/v1/wellness-plan/generate`.

### 4. GET Handler

No code change was required for the GET handler. The existing `select("*")` on `wellness_plans` automatically includes the new `treatment_protocols` column once it exists in the database.

### 5. Database Migration

Executed:

```sql
ALTER TABLE public.wellness_plans ADD COLUMN IF NOT EXISTS treatment_protocols JSONB DEFAULT '{}';
```

Result: Success (empty response from Supabase Management API confirms column added).

## What Was Preserved

- All existing scoring algorithms (diet, supplements, peptides) untouched.
- All existing protocol builders untouched.
- All existing response fields unchanged.
- No new endpoints created.

## Type-Safety Notes

The `protocolsByCondition` variable is declared outside the `try` block as `Record<string, unknown[]>` and populated inside the reference-data fetch so it is available for the plan insert and response construction. No new TypeScript errors were introduced by these changes.

## Files Modified

- `src/app/api/v1/wellness-plan/generate/route.ts`

## Files Created

- `docs/TREATMENT-PROTOCOL-INTEGRATION.md` (this document)
