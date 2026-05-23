### RecommendationResult

**Source:** [openapi.yaml](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


#### Schema Summary

- Type: `object`
Properties:
- `brand` (`string`)
- `category` (`string`)
- `conditions_addressed` (`array`)
- `evidence_level` (`string`)
  - Enum: `A`, `B`, `C`, `D`
- `fit_score` (`integer`)
- `key_actives` (`array`)
- `name` (`string`)
- `pregnancy_safe` (`boolean`)
- `price_tier` (`string`)
- `product_id` (`string`)
- `reasoning` (`string`)

**Used by:** [POST /api/v1/recommendations](../../operations/get-recommendations.md), [POST /api/v1/scan](../../operations/create-scan.md)

**Referenced by:** [RecommendationResponse](../../models/schemas/recommendation-response.md), [ScanResponse](../../models/schemas/scan-response.md)

