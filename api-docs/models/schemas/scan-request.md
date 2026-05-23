### ScanRequest

**Source:** [openapi.yaml](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


#### Schema Summary

- Type: `object`
- Required: `conditions`, `skin_tone`, `fitzpatrick_type`, `capture_method`
Properties:
- `capture_method` (`string`) required
  - Enum: `camera`, `gallery`
- `conditions` (`array`) required
- `fitzpatrick_type` (`integer`) required
- `quality_assessment`
- `skin_tone` (`integer`) required — Fitzpatrick skin type (1-6)
- `skin_zones` (`array`)

**Used by:** [POST /api/v1/scan](../../operations/create-scan.md)

**References:** [DetectedCondition](../../models/schemas/detected-condition.md), [QualityAssessment](../../models/schemas/quality-assessment.md), [SkinZone](../../models/schemas/skin-zone.md)

