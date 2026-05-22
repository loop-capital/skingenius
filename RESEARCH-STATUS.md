# SKINgenius Product & Ingredient Research Pipeline

## Status
**Started:** 2026-05-14
**Goal:** Complete ingredient research + safety database for all 236 products across 21 brands

## Phases

### Phase 1: Data Collection (IN PROGRESS)
- [x] Identify all brands and products (236 products, 8 brands with data)
- [ ] Scrape full INCI ingredient lists from brand websites
  - [ ] Aesop (31 products) — Agent: skingenius-research-aesop
  - [ ] PCA Skin (34 products) — Agent: skingenius-research-pca
  - [ ] SkinCeuticals + ZO Skin Health (54 products) — Agent: skingenius-research-medical
  - [ ] Biologique Recherche + iS Clinical + Osmosis + Environ (69 products) — Agent: skingenius-research-premium
- [ ] Normalize ingredient names (marketing → INCI)
- [ ] Research safety profiles

### Phase 2: Safety Research (PENDING)
For each unique ingredient:
- [ ] Efficacy evidence (RCTs, studies, concentration ranges)
- [ ] Pregnancy safety classification
- [ ] Breastfeeding safety classification
- [ ] Medication interactions
- [ ] Known allergies/contraindications
- [ ] Skin type compatibility

### Phase 3: Database Integration (PENDING)
- [ ] Create/update Supabase schema
- [ ] Sync products with full ingredient lists
- [ ] Sync ingredients with safety data
- [ ] Build contraindication engine
- [ ] Build recommendation algorithm

## Current Ingredient Database
- **Total unique ingredients across products:** 169
- **Already researched:** 30 (18%)
- **Unresearched:** 139 (82%)
- **Pregnancy contraindications identified:** 12 ingredients
- **Breastfeeding contraindications identified:** 8 ingredients

## Sub-agents Active
1. **skingenius-research-aesop** — Scraping Aesop + researching ingredients
2. **skingenius-research-pca** — Scraping PCA Skin + researching ingredients
3. **skingenius-research-medical** — Scraping SkinCeuticals + ZO Skin Health
4. **skingenius-research-premium** — Scraping Biologique Recherche, iS Clinical, Osmosis, Environ

## Key Files
- `/skincare-research/scripts/ingredient-normalizer.js` — INCI mapping + safety data
- `/skincare-research/scripts/sync-to-supabase.js` — Database sync pipeline
- `/skincare-research/data/products-[brand].json` — Product data per brand
- `/skincare-research/data/ingredient-database.json` — Master ingredient database

## Notes
- Supabase connection confirmed working (236 products confirmed)
- Publishable key: `sb_publishable_Q4iko4izuuRBZpCrSVwUkA_-LEUAQny`
- JWT keys return PGRST301 — use publishable key for REST API
