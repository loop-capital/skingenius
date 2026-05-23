### DetectedCondition

**Source:** [openapi.yaml](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


#### Schema Summary

- Type: `object`
- Required: `condition_id`, `name`, `confidence`, `severity`, `zone`
Properties:
- `condition_id` (`string`) required
- `confidence` (`number`) required
- `features` (`array`)
- `name` (`string`) required Example: `Post-Inflammatory Hyperpigmentation (PIH)`
- `severity` (`string`) required
  - Enum: `mild`, `moderate`, `severe`
- `zone` (`string`) required Example: `cheek-left`

**Used by:** [POST /api/v1/recommendations](../../operations/get-recommendations.md), [POST /api/v1/scan](../../operations/create-scan.md)

**Referenced by:** [RecommendationRequest](../../models/schemas/recommendation-request.md), [ScanRequest](../../models/schemas/scan-request.md), [ScanResponse](../../models/schemas/scan-response.md)

