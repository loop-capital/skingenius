### RecommendationRequest

**Source:** [openapi.yaml](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


#### Schema Summary

- Type: `object`
- Required: `conditions`
Properties:
- `conditions` (`array`) required
- `fitzpatrick_type` (`integer`)
- `price_tier` (`string`)
  - Enum: `$`, `$$`, `$$$`, `$$$$`
- `skin_type` (`string`)
  - Enum: `oily`, `dry`, `combination`, `normal`, `sensitive`

**Used by:** [POST /api/v1/recommendations](../../operations/get-recommendations.md)

**References:** [DetectedCondition](../../models/schemas/detected-condition.md)

