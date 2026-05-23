# SKINgenius — Mission & Architecture

> **Last updated:** 2026-05-22
> **Production:** https://skingenius-sigma.vercel.app

---

## Mission

SKINgenius exists to democratize dermatological access. Skin conditions disproportionately affect low-income communities, children, and people of color who lack access to dermatologists and don't realize their diet, environment, and products are contributing to their conditions.

**Core principle: Free scans for everyone. Forever.**

This is only possible because the scan runs entirely on-device — no API costs, no per-scan charges, no paywalls on diagnosis. Users can scan as often as they need.

The product is funded through:
- Product recommendation affiliate revenue (users buy products that work for them)
- Pro tier subscriptions ($29/mo estheticians, $99/mo enterprise)
- Brand partnerships (evidence-based ingredient education)

**Never charge for the scan. Never gate the diagnosis.**

---

## Architecture: On-Device AI

### Stack
- **React Native / Expo** — mobile app
- **Google AI Edge SDK** — on-device ML runtime
- **Gemma 4** — on-device vision model for skin analysis
- **MediaPipe** — face detection, quality gate, landmark detection
- **LiteRT** — custom model runtime for fine-tuned dermatology models

### Scan Pipeline (100% On-Device)
```
Camera → MediaPipe Face Detection → Quality Gate (blur/lighting)
→ EXIF Strip (client) → Gemma 4 Vision Analysis
→ Fitzpatrick Type Detection → Condition Detection
→ Zone Mapping → Results (instant, offline-capable)
```

### Server Side (Persistence + Recommendations)
```
POST /api/v1/scan (results from on-device analysis, NOT raw images)
→ Supabase persist → Fit Score engine → Product recommendations
```

### Key Insight
The image never leaves the phone. Only the analysis results (conditions, zones, Fitzpatrick type) are sent to the server for persistence and product matching. This means:
- Privacy-first (photos never stored)
- Works offline
- Zero per-scan cost
- Unlimited scans

---

## On-Device Model Roadmap

### Phase 1: Gemma 4 + MediaPipe (Now)
- MediaPipe for face detection + quality gate
- Gemma 4 for general image understanding + skin condition identification
- Works out of the box, no training required
- Supports iOS + Android via Google AI Edge SDK

### Phase 2: Fine-Tuned Dermatology Model (Month 2-3)
- Fine-tune Gemma 4 with Fitzpatrick 17k dataset
- Add ISIC Archive dermatology images
- Custom LoRA training on our 25 conditions + 105 ingredients
- Improved accuracy for skin of color (Fitzpatrick IV-VI)

### Phase 3: Custom Lightweight Model (Month 4-6)
- Train specialist model for specific conditions (acne, rosacea, eczema, hyperpigmentation)
- Optimize for mobile inference (<500MB, <2s scan)
- A/B test against Gemma 4 baseline
- Incorporate user feedback loops (did the recommendation help?)

---

## Pricing Model

| Tier | Price | Scans | Features |
|------|-------|-------|----------|
| Free | $0 | Unlimited | On-device scan, conditions, basic recommendations |
| Pro | $29/mo | Unlimited | + Client dashboard, referral marketplace, shared scans |
| Enterprise | $99/mo | Unlimited | + Multi-location, API access, custom branding |

The free tier is our humanitarian tier. It must always exist.
