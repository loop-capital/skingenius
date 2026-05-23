### SkinZone

**Source:** [openapi.yaml](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


#### Schema Summary

- Type: `object`
Properties:
- `confidence` (`number`)
- `primary_concern` (`string`)
- `severity` (`string`)
  - Enum: `mild`, `moderate`, `severe`
- `zone` (`string`)

**Used by:** [POST /api/v1/scan](../../operations/create-scan.md)

**Referenced by:** [ScanRequest](../../models/schemas/scan-request.md), [ScanResponse](../../models/schemas/scan-response.md)

