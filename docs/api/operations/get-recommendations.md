### POST /api/v1/recommendations

Get product recommendations

**Operation ID:** `getRecommendations`  
**Tags:** api/recommendations

**Source:** [openapi.yaml:53](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


Returns personalized product recommendations based on detected conditions,
skin type, Fitzpatrick type, and user preferences.
Uses Fit Score algorithm with evidence-weighted matching.

#### cURL

**Default example:** Production · No Auth

```bash
curl -X POST \
  'https://skingenius-sigma.vercel.app/api/v1/recommendations' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"conditions":[{"condition_id":"tpq","confidence":0,"features":["WyY"],"name":"Post-Inflammatory Hyperpigmentation (PIH)","severity":"moderate","zone":"cheek-left"}],"fitzpatrick_type":4,"price_tier":"$","skin_type":"combination"}'
```

#### Request Body (`application/json`) — Required

**Source:** [openapi.yaml:60](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


**Schema ref:** [RecommendationRequest](../models/schemas/recommendation-request.md)

- Reference: [RecommendationRequest](../models/schemas/recommendation-request.md)
- Type: `object`
- Required: `conditions`
Properties:
- `conditions` (`array`) required
- `fitzpatrick_type` (`integer`)
- `price_tier` (`string`)
  - Enum: `$`, `$$`, `$$$`, `$$$$`
- `skin_type` (`string`)
  - Enum: `oily`, `dry`, `combination`, `normal`, `sensitive`

**Example payload**

```json
{
  "conditions": [
    {
      "condition_id": "tpq",
      "confidence": 0,
      "features": [
        "WyY"
      ],
      "name": "Post-Inflammatory Hyperpigmentation (PIH)",
      "severity": "moderate",
      "zone": "cheek-left"
    }
  ],
  "fitzpatrick_type": 4,
  "price_tier": "$",
  "skin_type": "combination"
}
```

#### Responses

**200** (`application/json`) — Recommendations returned

**Source:** [openapi.yaml:67](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)


**Schema ref:** [RecommendationResponse](../models/schemas/recommendation-response.md)

- Reference: [RecommendationResponse](../models/schemas/recommendation-response.md)
- Type: `object`
Properties:
- `data` (`array`)

**Example payload**

```json
{
  "data": [
    {
      "brand": "FEV",
      "category": "GbW",
      "conditions_addressed": [
        "ULA"
      ],
      "evidence_level": "B",
      "fit_score": 78,
      "key_actives": [
        {
          "effectiveness": 3,
          "ingredient": "mGN"
        }
      ],
      "name": "QWK",
      "pregnancy_safe": true,
      "price_tier": "FyW",
      "product_id": "Wvu",
      "reasoning": "WlD"
    }
  ]
}
```

**Models referenced:** [DetectedCondition](../models/schemas/detected-condition.md), [RecommendationRequest](../models/schemas/recommendation-request.md), [RecommendationResponse](../models/schemas/recommendation-response.md), [RecommendationResult](../models/schemas/recommendation-result.md)

#### Related Operations

- [POST /api/v1/scan](create-scan.md) — Submit scan results

