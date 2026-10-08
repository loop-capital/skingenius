# SKINgenius Vision Model Architecture

**Version:** 1.0  
**Created:** 2026-09-14  
**Status:** Draft  
**Author:** SKINgenius Architect  

---

## Executive Summary

Scans are free (ad-supported). Revenue comes later from product sales and provider referrals. This spec defines the vision pipeline that powers the free tier and upgrade path.

**Tier Summary:**

| Tier | Cost | Scans | Model | Ads | Notes |
|------|------|-------|-------|-----|-------|
| **Free** | $0 | 4/month | On-device (TensorFlow Lite) | Yes | 5 core conditions |
| **Pro** | $4.99/mo | Unlimited | Cloud (Gemini 1.5 Pro) | No | All 25 conditions |
| **Pro+** | $9.99/mo | Unlimited + aesthetics | Cloud priority | No | + facial aesthetics |

---

## 1. Free Tier: On-Device Model

### Model Selection

**Primary:** TensorFlow Lite dermatology classifier
- Base model: EfficientNet-Lite0 (4MB, fast on mobile)
- Fine-tuned on: ISIC Archive + HAM10000 + Fitzpatrick 17k
- Input: 224x224 RGB face photo
- Output: Multi-label classification (5 conditions + confidence)

**Conditions detected (Free tier):**
1. Acne
2. Hyperpigmentation
3. Dryness / Dehydration
4. Redness / Rosacea
5. Aging (wrinkles, fine lines)

**Accuracy target:** ~75% top-1, ~90% top-3

### Technical Spec

```typescript
interface OnDeviceScan {
  model: 'skinnet-lite-v1.tflite';
  inputSize: [224, 224, 3];
  preprocessing: {
    normalize: true;
    mean: [0.485, 0.456, 0.406];
    std: [0.229, 0.224, 0.225];
  };
  output: {
    conditions: Array<{
      id: string;
      name: string;
      confidence: number; // 0-1
      severity: 'mild' | 'moderate' | 'severe';
    }>;
    processingTimeMs: number;
  };
}
```

### Caching Strategy

- Scan results cached locally for 7 days
- Re-scanning same photo within 7 days = instant result, no model inference
- Cache key: photo hash (SHA-256)

---

## 2. Pro Tier: Cloud Model

### Model Selection

**Primary:** Google Gemini 1.5 Pro
- Multimodal (vision + text)
- Structured JSON output via prompting
- Cost: ~$0.003 per image
- Latency: 1-2 seconds

**Why Gemini over GPT-4V:**
- 50% cheaper
- Native JSON mode (no parsing brittle output)
- Multimodal follow-up ("What does this patch look like?")

### Prompt Engineering

```
You are a dermatology AI assistant. Analyze this facial photo and return a structured JSON response.

Detect ALL of the following conditions:
- acne
- hyperpigmentation
- dryness/dehydration
- redness/rosacea
- aging (wrinkles, fine lines)
- uneven texture
- enlarged pores
- dark circles
- sun damage
- melasma
- eczema/dermatitis
- fungal acne
- hormonal acne
- cystic acne

For each detected condition, provide:
- confidence_score (0.0-1.0)
- severity (mild/moderate/severe)
- affected_areas (array of facial zones)
- key_visual_indicators (what you see in the photo)

Also provide:
- overall_skin_health_score (0-100)
- primary_concern (most important condition to address)
- urgent_flag (true if lesion looks suspicious — melanoma warning)
- fitzpatrick_skin_type_estimate (I-VI)

Return ONLY valid JSON. No markdown, no explanation.
```

### Caching Strategy

- Cloud scan results cached in Redis for 30 days
- Cache key: user_id + photo_hash
- Re-scanning same photo = instant result from cache

---

## 3. Pro+ Tier: Facial Aesthetics

### Model Selection

**Primary:** Same Gemini 1.5 Pro with extended prompt
- Adds facial proportion analysis
- 521-landmark detection (via MediaPipe Face Mesh as preprocessor)
- Aesthetic scoring: symmetry, proportions, harmony

### Extended Prompt

```
[Same dermatology analysis as Pro tier]

PLUS: Facial Aesthetics Analysis

Analyze facial proportions and return:
- facial_symmetry_score (0-100)
- proportional_harmony_score (0-100)
- feature_breakdown: {
    brows: { score, notes },
    eyes: { score, notes },
    nose: { score, notes },
    lips: { score, notes },
    jaw: { score, notes }
  }
- dimorphism_score (masculine/feminine balance, 0-100)
- perceived_youthfulness_score (0-100)
- glow_up_potential: array of top 3 improvements
```

---

## 4. API Contract

### POST /api/v1/scan

**Request:**
```json
{
  "image": "base64-encoded-image",
  "user_tier": "free | pro | pro_plus",
  "scan_type": "skin_health | aesthetics | both",
  "user_id": "uuid"
}
```

**Response (Free tier):**
```json
{
  "scan_id": "uuid",
  "tier": "free",
  "model": "on-device",
  "processing_time_ms": 450,
  "conditions": [
    {
      "id": "acne",
      "name": "Acne",
      "confidence": 0.87,
      "severity": "moderate",
      "affected_areas": ["cheeks", "chin"]
    }
  ],
  "overall_score": 72,
  "primary_concern": "acne",
  "urgent_flag": false,
  "fitzpatrick_type": "IV",
  "recommendations": [
    {
      "type": "ingredient",
      "name": "Salicylic Acid",
      "evidence_level": "A",
      "concentration": "2%"
    }
  ],
  "provider_referral_eligible": false,
  "product_recommendations": [
    {
      "product_id": "uuid",
      "name": "CeraVe SA Cleanser",
      "match_score": 94,
      "price": "$14.99"
    }
  ],
  "scan_count_this_month": 2,
  "scans_remaining": 2
}
```

**Response (Pro tier):**
```json
{
  "scan_id": "uuid",
  "tier": "pro",
  "model": "gemini-1.5-pro",
  "processing_time_ms": 1200,
  "conditions": [
    // All 14 conditions with confidence
  ],
  "overall_score": 68,
  "primary_concern": "hormonal_acne",
  "urgent_flag": false,
  "fitzpatrick_type": "IV",
  "recommendations": [
    // Ingredient + routine recommendations
  ],
  "provider_referral_eligible": true,
  "nearby_providers": [
    {
      "provider_id": "uuid",
      "name": "PLEIJ Salon + Spa",
      "distance_miles": 2.3,
      "match_score": 87,
      "services": ["HydraFacial", "Chemical Peel"]
    }
  ],
  "product_recommendations": [
    // Full product catalog matches
  ],
  "wellness_insights": [
    "Your acne pattern suggests hormonal fluctuation. Consider tracking cycle."
  ],
  "scan_history_comparison": {
    "previous_scan_date": "2026-08-15",
    "improvement_areas": ["hydration"],
    "worsening_areas": ["acne"]
  }
}
```

---

## 5. Implementation Phases

### Phase 1: Free Tier MVP (Week 1-2)
- [ ] Train/fine-tune TensorFlow Lite model on 5 conditions
- [ ] Build `/api/v1/scan` endpoint with tier detection
- [ ] Implement local caching (7 days)
- [ ] Build scan results UI (5 conditions, severity, recommendations)
- [ ] Add scan counter (4/month limit)
- [ ] Show interstitial ad after scan (before results)

### Phase 2: Pro Tier (Week 3-4)
- [ ] Integrate Gemini 1.5 Pro API
- [ ] Implement prompt engineering for 25 conditions
- [ ] Build Redis caching layer (30 days)
- [ ] Add provider referral matching
- [ ] Build Pro upgrade flow
- [ ] Remove ads for Pro users

### Phase 3: Pro+ Tier (Week 5-6)
- [ ] Add facial aesthetics analysis
- [ ] Integrate MediaPipe Face Mesh for landmark detection
- [ ] Build aesthetics scoring UI
- [ ] Add glow-up protocol recommendations
- [ ] Build Pro+ upgrade flow

### Phase 4: Product Integration (Week 7-8)
- [ ] Connect scan results to product recommendation engine
- [ ] Build affiliate link generation
- [ ] Add "Buy Now" buttons to scan results
- [ ] Track conversion rates

---

## 6. Cost Model

### Per-Scan Costs

| Tier | Model | Cost per Scan | Monthly Cost (10K users) |
|------|-------|---------------|--------------------------|
| Free | On-device | $0 | $0 |
| Pro | Gemini 1.5 Pro | $0.003 | $30 (assuming 10K scans) |
| Pro+ | Gemini 1.5 Pro | $0.003 | $30 (same API call) |

### Revenue Model

| Revenue Source | Free | Pro | Pro+ |
|---------------|------|-----|------|
| Ads | Yes | No | No |
| Subscription | No | $4.99/mo | $9.99/mo |
| Product affiliate | 5% | 10% | 15% |
| Provider referral | No | Yes | Yes |

### Break-Even Analysis

- Cloud API cost per Pro user: $0.012/month (4 scans × $0.003)
- Pro subscription revenue: $4.99/month
- Gross margin per Pro user: $4.98/month (99.8%)
- Product affiliate revenue per user (avg): $7.50/month
- **Total revenue per Pro user: $12.49/month**
- **Total cost per Pro user: $0.012/month**

**Conclusion:** The model is highly profitable even at low conversion rates.

---

## 7. Technical Architecture

```
User Uploads Photo
    |
    v
[Tier Detection] — Free, Pro, or Pro+
    |
    +---> Free: TensorFlow Lite (on-device)
    |       |
    |       v
    |   [Local Inference] → 5 conditions
    |       |
    |       v
    |   [Local Cache] (7 days)
    |
    +---> Pro/Pro+: Gemini 1.5 Pro (cloud)
            |
            v
        [API Call] → 25 conditions + aesthetics
            |
            v
        [Redis Cache] (30 days)
            |
            v
        [Result Enrichment]
            - Provider matching
            - Product recommendations
            - Wellness insights
            |
            v
        [Response]
```

---

## 8. Privacy & Security

- Free tier: Photo never leaves device (on-device inference)
- Pro tier: Photo sent to Gemini API (Google's privacy policy applies)
- All tiers: Results stored encrypted at rest
- User can delete all scan history (GDPR/CCPA compliant)
- Urgent flag photos flagged for human review (dermatologist verification)

---

## 9. Metrics & KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Free-to-Pro conversion | 5% | Monthly active free users → Pro subscribers |
| Pro-to-Pro+ conversion | 10% | Pro subscribers → Pro+ subscribers |
| Scan accuracy (Free) | 75% top-1 | Human dermatologist validation sample |
| Scan accuracy (Pro) | 90% top-3 | Human dermatologist validation sample |
| Average scan time (Free) | <500ms | Device telemetry |
| Average scan time (Pro) | <2s | API latency tracking |
| Ad revenue per free user | $0.50/month | Ad impression × CPM |
| Product affiliate conversion | 10% | Scan → product click → purchase |

---

## Related Documents

- `specs/FACIAL-AESTHETICS-ANALYSIS-SPEC.md` — Facial aesthetics detail
- `docs/CONDITION-INGREDIENT-MAPPING.md` — Ingredient recommendations
- `specs/REFERRAL-SYSTEM-SPEC.md` — Provider referral flow
- `specs/REFERRAL-UX-SPEC.md` — User experience flows

---

*Document version: 1.0 | Created: 2026-09-14 | Next review: Post-MVP*