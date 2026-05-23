# SKINgenius — On-Device Architecture

> **Source:** Jason's architecture decision (May 22, 2026)
> **Status:** DEFINITIVE — This is the path. Do not deviate.

---

## Why On-Device

A kid in a low-income household can't afford $50/dermatologist visit or a subscription app. They probably have a phone. On-device = infinite free scans, diagnosis, and product recommendations forever. Diet-linked conditions (eczema from dairy, acne from sugar, hyperpigmentation from nutrient deficiencies) get identified early. **That's the whole point.**

---

## Google Components

| Component | What It Does | Platform |
|-----------|-------------|----------|
| MediaPipe Face Detection | Face bounding box, landmarks, quality assessment | iOS + Android + Web |
| MediaPipe Image Classifier | Custom vision model inference | iOS + Android |
| Gemma 4 | Vision-language model, understands images, can identify skin conditions | iOS + Android via AI Edge SDK |
| LiteRT | Run any TFLite/custom vision model on-device | iOS + Android |
| AI Edge Gallery | Open-source app showing on-device ML (MIT license) | iOS + Android stores |

---

## Architecture

```
┌─── PHONE (100% offline capable) ──────────────────┐
│                                                     │
│  Camera → MediaPipe Face Detect → Quality Gate      │
│         → Gemma 4 Vision Analysis                   │
│         → Fitzpatrick Type Detection                │
│         → Condition Detection + Zone Mapping        │
│         → Results (instant, <3 seconds)             │
│                                                     │
│  Cost: $0.00 per scan. Unlimited.                   │
└─────────────┬───────────────────────────────────────┘
              │ POST /api/v1/scan (analysis results only)
              │ (never the photo)
              ▼
┌─── SERVER (Supabase) ─────────────────────────────┐
│                                                     │
│  Persist scan results → Fit Score engine            │
│  → Product recommendations → Routine builder        │
│  → User profiles → Auth → Referrals                 │
│                                                     │
│  Cost: Supabase (existing). No AI inference costs.  │
└─────────────────────────────────────────────────────┘
```

**The photo never leaves the phone. Privacy-first. Works offline. Zero API costs.**

---

## Free Tier Forever — Funded By

| Revenue Stream | Who Pays | Amount |
|---------------|----------|--------|
| Product affiliate links | Brands (when users buy) | 5-15% per purchase |
| Pro tier ($29/mo) | Estheticians | Recurring |
| Enterprise ($99/mo) | Salons/clinics | Recurring |
| Brand partnerships | Manufacturers | Education content |

The free user scans forever and pays nothing. They only generate revenue when they buy a product we recommend that actually works for their skin.

---

## Implementation Roadmap

### Phase 1 (Week 1-2): MediaPipe integration
- Replace server-side quality gate with on-device MediaPipe face detection
- Already supports Expo via native modules
- Immediate cost savings + faster scans

### Phase 2 (Week 3-4): Gemma 4 on-device
- Integrate Gemma 4 vision via LiteRT-LM (same as COLORgenius)
- On-device skin condition detection
- Fitzpatrick type classification

### Phase 3 (Week 5-6): Full offline mode
- Product recommendation engine on-device
- Routine builder on-device
- Cache results, sync when online

---

## Key Decisions
- **Photo NEVER leaves the phone** — only analysis results sent to server
- **Same LiteRT-LM as COLORgenius** — shared infrastructure
- **Expo native modules** for MediaPipe + LiteRT integration
- **Gemma 4 E4B** model (same as COLORgenius hair analysis)
- **Free tier = unlimited scans** — monetized through affiliate links

---

## Related
- COLORgenius uses same on-device architecture (Gemma E4B via LiteRT-LM)
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- MediaPipe: https://ai.google.dev/edge/mediapipe/solutions/guide
- AI Edge Gallery: https://github.com/google-ai-edge/gallery
