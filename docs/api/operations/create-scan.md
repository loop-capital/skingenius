### POST /api/v1/scan

Submit scan results

**Operation ID:** `createScan`  
**Tags:** api/scan

**Source:** [openapi.yaml:23](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


Accepts on-device analysis results (NOT raw images). 
The scan pipeline runs entirely on the user's phone.
This endpoint persists results and returns product recommendations.

#### cURL

**Default example:** Production · No Auth

```bash
curl -X POST \
  'https://skingenius-sigma.vercel.app/api/v1/scan' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"capture_method":"camera","conditions":[{"condition_id":"bKB","confidence":0,"features":["hsS"],"name":"Post-Inflammatory Hyperpigmentation (PIH)","severity":"mild","zone":"cheek-left"}],"fitzpatrick_type":1,"quality_assessment":{"blur_score":1,"face_detected":true,"lighting_score":95},"skin_tone":1,"skin_zones":[{"confidence":67,"primary_concern":"zky","severity":"moderate","zone":"Mkm"}]}'
```

#### Request Body (`application/json`) — Required

**Source:** [openapi.yaml:30](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


**Schema ref:** [ScanRequest](../models/schemas/scan-request.md)

- Reference: [ScanRequest](../models/schemas/scan-request.md)
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

**Example payload**

```json
{
  "capture_method": "camera",
  "conditions": [
    {
      "condition_id": "bKB",
      "confidence": 0,
      "features": [
        "hsS"
      ],
      "name": "Post-Inflammatory Hyperpigmentation (PIH)",
      "severity": "mild",
      "zone": "cheek-left"
    }
  ],
  "fitzpatrick_type": 1,
  "quality_assessment": {
    "blur_score": 1,
    "face_detected": true,
    "lighting_score": 95
  },
  "skin_tone": 1,
  "skin_zones": [
    {
      "confidence": 67,
      "primary_concern": "zky",
      "severity": "moderate",
      "zone": "Mkm"
    }
  ]
}
```

#### Responses

**200** (`application/json`) — Scan results persisted

**Source:** [openapi.yaml:37](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


**Schema ref:** [ScanResponse](../models/schemas/scan-response.md)

- Reference: [ScanResponse](../models/schemas/scan-response.md)
- Type: `object`
Properties:
- `data` (`object`)

**Example payload**

```json
{
  "data": {
    "conditions": [
      {
        "condition_id": "dfD",
        "confidence": 0,
        "features": [
          "YSa"
        ],
        "name": "Post-Inflammatory Hyperpigmentation (PIH)",
        "severity": "moderate",
        "zone": "cheek-left"
      }
    ],
    "recommendations": [
      {
        "brand": "avn",
        "category": "ZRy",
        "conditions_addressed": [
          "pON"
        ],
        "evidence_level": "C",
        "fit_score": 56,
        "key_actives": [
          {
            "effectiveness": 46,
            "ingredient": "aKg"
          }
        ],
        "name": "rZZ",
        "pregnancy_safe": true,
        "price_tier": "TxZ",
        "product_id": "GNb",
        "reasoning": "BOh"
      }
    ],
    "scan_id": "5c941904-536c-56a6-033d-35d934122320",
    "skin_zones": [
      {
        "confidence": 71,
        "primary_concern": "pyR",
        "severity": "severe",
        "zone": "uQr"
      }
    ],
    "timestamp": "2026-05-22T21:25:15-04:00"
  }
}
```

**400** (`application/json`) — Invalid request

**Source:** [openapi.yaml:43](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


**Schema ref:** [ErrorResponse](../models/schemas/error-response.md)

- Reference: [ErrorResponse](../models/schemas/error-response.md)
- Type: `object`
Properties:
- `detail` (`string`)
- `error` (`string`)

**Example payload**

```json
{
  "detail": "LUl",
  "error": "WKZ"
}
```

**401** — Unauthorized

**Models referenced:** [DetectedCondition](../models/schemas/detected-condition.md), [ErrorResponse](../models/schemas/error-response.md), [QualityAssessment](../models/schemas/quality-assessment.md), [RecommendationResult](../models/schemas/recommendation-result.md), [ScanRequest](../models/schemas/scan-request.md), [ScanResponse](../models/schemas/scan-response.md), [SkinZone](../models/schemas/skin-zone.md)

#### Related Operations

- [POST /api/v1/recommendations](get-recommendations.md) — Get product recommendations

