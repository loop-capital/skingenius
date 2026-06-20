# SKINgenius × Basys Health — Peptide Supplier Bridge

> **Created:** 2026-06-16
> **Purpose:** Link SKINgenius peptide recommendations to verified supplier quality data from Basys Health

---

## Cross-Project Data Flow

```
SKINgenius Wellness Plan
  └── Peptide Protocol (28 peptides, 3 tiers)
       ├── Tier 1: Topical (OTC, no sourcing concern)
       ├── Tier 2: Injectable (requires compounding pharmacy or research vendor)
       └── Tier 3: Research-grade (highest sourcing risk)
            │
            ▼
       Basys Health Supplier Quality Checklist
            ├── Paradigm Peptide (primary — Finnrick A, 218 tests)
            ├── Peptide Technologies (backup — Finnrick A-B, 311 tests)
            └── Scoring rubric: COA, HPLC+MS, endotoxin, cold chain
```

## GLOW STACK — Skin/Hair Peptides

| Peptide | SKINgenius Tier | Route | Cost/mo | Skin Benefits | Supplier Verified? |
|---------|----------------|-------|---------|---------------|-------------------|
| GHK-Cu | T1 (topical) | Topical | $30 | Collagen synthesis, wound healing, anti-inflammatory | N/A (OTC cosmetic) |
| GHK-Cu | T2 (injectable) | Injectable | $140 | Systemic anti-aging, tissue remodeling | ✅ Paradigm |
| BPC-157 | T2 | Injectable | $120 | Gut-skin axis, anti-inflammatory, tissue repair | ✅ Paradigm |
| TB-500 | T2 | Injectable | $150 | Wound healing, cell migration, anti-inflammatory | ✅ Paradigm |

**GLOW STACK total (T2):** ~$410/month via verified vendors

## How SKINgenius Uses This

1. **Tier 1 peptides** — no supplier concern (OTC cosmetic ingredients)
2. **Tier 2 peptides** — SKINgenius recommends, links to Basys supplier checklist for sourcing guidance
3. **Tier 3 peptides** — SKINgenius recommends with research-only disclaimers, no sourcing links

## Wellness Plan Integration

When a user's SKINgenius wellness plan includes Tier 2+ peptides:
- Show disclaimer: "Injectable peptides require medical supervision"
- Link to Basys Health supplier quality checklist for vendor verification
- Recommend Paradigm Peptide as primary verified source
- Emphasize: "Always verify batch COA on lab's server before use"

---

## Files Reference

- **SKINgenius peptides:** `supabase/SEED-WELLNESS-PLAN.sql` (28 entries)
- **Basys supplier rankings:** `basys-health/suppliers/PEPTIDE-VENDOR-RANKINGS.md`
- **Basys quality checklist:** `basys-health/suppliers/SUPPLIER-QUALITY-CHECKLIST.md`
- **SKINgenius wellness spec:** `specs/WELLNESS-PLAN-SPEC.md`
