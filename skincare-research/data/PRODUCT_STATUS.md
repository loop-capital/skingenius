# SKINgenius Product Database Status

**Date:** 2026-05-13
**Status:** ✅ 236 Products Across 21 Brands

## Product Count by Brand

| Brand | Count | Category Focus |
|-------|-------|---------------|
| PCA Skin | 34 | Professional/medical |
| Aesop | 31 | Botanical/luxury |
| SkinCeuticals | 28 | Antioxidant/vitamin C |
| ZO Skin Health | 28 | Medical-grade |
| Environ | 25 | Vitamin A/retinol |
| Biologique Recherche | 18 | French luxury |
| iS Clinical | 17 | Pharmaceutical botanicals |
| The Ordinary | 13 | Affordable actives |
| Osmosis Beauty | 9 | Holistic wellness |
| CeraVe | 6 | Barrier repair |
| La Roche-Posay | 6 | Sensitive skin |
| Neutrogena | 5 | Drugstore |
| Paula's Choice | 4 | Evidence-based |
| Cetaphil | 2 | Gentle cleansing |
| First Aid Beauty | 2 | Sensitive skin |
| Vanicream | 2 | Ultra-gentle |
| Vichy | 2 | French pharmacy |
| Aveeno | 1 | Oat-based |
| Differin | 1 | Retinoid |
| EltaMD | 1 | Sunscreen |
| Eucerin | 1 | Healing |

## Product Categories

| Category | Approximate Count |
|----------|-------------------|
| serum | ~50 |
| moisturizer | ~45 |
| cleanser | ~30 |
| treatment | ~35 |
| sunscreen | ~18 |
| eye_cream | ~12 |
| toner | ~15 |
| mask | ~10 |
| exfoliant | ~8 |
| supplement | ~2 |

## Data Files Created

All product data extracted from research docs and websites:

1. `products-environ.json` - 25 products
2. `products-osmosis.json` - 9 products
3. `products-is-clinical.json` - 17 products
4. `products-skinceuticals.json` - 26 products
5. `products-zo-skin-health.json` - 28 products
6. `products-biologique-recherche.json` - 18 products
7. `products-pca-skin.json` - 34 products
8. `products-aesop.json` - 31 products (scraped via Crawl4AI)

## Scraping Tool

Crawl4AI v0.8.6 configured in `scripts/scrape-products.py`

Usage:
```bash
python3 scripts/scrape-products.py https://www.brand.com BrandName
```

## Next Steps

- [ ] Add more brands via Crawl4AI scraping
- [ ] Link ingredients to products
- [ ] Add product images/URLs
- [ ] Verify all prices are current
- [ ] Add product descriptions

---
*Database: cnzoilxsttoqtvwotexd.supabase.co*
*Scraper: Crawl4AI 0.8.6*
