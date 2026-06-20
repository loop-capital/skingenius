# Architectural Decisions — SKINgenius v2

> **Date:** 2026-05-30
> **Supersedes:** DECISIONS.md (v1)

---

## ADR-006: Native App (React Native + Expo) Over Web

**Date:** 2026-05-30
**Status:** Accepted
**Supersedes:** ADR-001 (partial — see ADR-007)

### Context
SKINgenius is a camera-first product. Users need to capture skin photos and eventually face videos. Web apps cannot reliably access iOS camera, run on-device ML models, integrate with HealthKit, or be distributed through the App Store. A web app is not viable for this product.

### Decision
Build a native mobile app using React Native + Expo. Target iOS first (App Store), then Android (Play Store).

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Next.js web app (PWA) | Existing codebase, fast to ship | No reliable camera access on iOS, no HealthKit, no App Store, no on-device ML |
| Swift (native iOS) | Best performance, full API access | iOS only, need separate Android team, slower iteration |
| React Native + Expo | Cross-platform, Expo tooling, OTA updates, large ecosystem | Bridge overhead, some native modules need custom work |
| Flutter | Good performance, cross-platform | Smaller ecosystem, no Expo equivalent, Dart learning curve |

### Consequences
- Existing Next.js web app becomes the marketing site / dashboard only
- All mobile features built in React Native
- Expo EAS for builds and App Store submission
- OTA updates for non-native changes

---

## ADR-007: ViT + Gemini 2.5 Flash Over On-Device Gemma

**Date:** 2026-05-30
**Status:** Accepted
**Supersedes:** ADR-001

### Context
ADR-001 specified Gemma 4B via LiteRT-LM for on-device inference. However:
- Gemma 4B is 1.5-4GB — too large for mobile bundle
- LiteRT-LM is immature (Google I/O 2024, limited docs)
- We've trained a custom ViT model (93.5% accuracy, 85MB) that's purpose-built for skin condition classification
- Gemini 2.5 Flash provides cloud-grade analysis at $0.001/scan

### Decision
**Free tier:** Fine-tuned ViT model (TFLite, ~85MB) on-device + rule-based recommendations. Photos never leave the phone.
**Paid tier:** ViT pre-classification → Gemini 2.5 Flash for deep multi-zone analysis, severity grading, root cause reasoning.

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Gemma 4B on-device (ADR-001) | All on-device, private | 1.5GB+ bundle, immature runtime, general-purpose (not skin-specific) |
| GPT-4o Vision (cloud) | Best quality | $0.005/scan, slower, privacy concerns |
| Gemini 2.5 Flash (cloud) | Fast, $0.001/scan, good JSON output | Cloud dependency for paid tier, privacy concerns |
| ViT + Gemini hybrid | Fast on-device + deep cloud, cost-effective | Two models to maintain |

### Consequences
- Free tier: zero API cost, full privacy, works offline
- Paid tier: $0.001/scan, 2-8s latency, cloud processing
- ViT model updates require app store release
- Gemini prompt updates can be deployed server-side

---

## ADR-008: Wearable Integration Over Phone-Camera PPG

**Date:** 2026-05-30
**Status:** Accepted

### Context
PPG (photoplethysmography) from phone camera was proposed for cardiovascular biomarker extraction. However:
- Users already wear Apple Watches, Oura rings, Whoop bands with clinical-grade PPG sensors
- Phone-camera PPG has accuracy issues, especially on darker skin tones (Fitzpatrick V-VI)
- Building and calibrating our own PPG pipeline is a 12+ week effort
- Wearable data is more accurate, continuous, and FDA-cleared

### Decision
Integrate with Apple HealthKit and Google Health Connect to pull existing wearable data. Do NOT build phone-camera PPG.

### Biomarkers to Pull from Wearables
| Biomarker | Source | Skin Relevance |
|-----------|--------|---------------|
| Heart rate | Apple Watch, Oura, Whoop | Stress indicator → acne flares |
| HRV (heart rate variability) | Apple Watch, Oura | Stress/cortisol → inflammation |
| Sleep duration + quality | Apple Watch, Oura, Whoop | Skin repair, dark circles, dullness |
| SpO2 | Apple Watch | Circulation → skin health |
| Activity / exercise | All wearables | Circulation, inflammation |
| Body temperature | Oura | Inflammation indicator |
| **HbA1c** (future) | CGM (Dexcom, Libre), lab results | **Glycation → collagen damage, aging** |

### Consequences
- Zero PPG development cost
- Clinical-grade data from validated sensors
- No skin tone calibration needed (wearable sensors are validated)
- Requires HealthKit (iOS) and Health Connect (Android) permissions
- HbA1c integration depends on CGM adoption / Apple glucose feature

---

## ADR-009: HbA1c as Key Skin Health Biomarker

**Date:** 2026-05-30
**Status:** Accepted

### Context
Glycation is one of the primary mechanisms of skin aging. Elevated blood sugar (HbA1c) causes:
- Advanced Glycation End-products (AGEs) that cross-link collagen
- Skin stiffness, wrinkles, loss of elasticity
- Impaired wound healing
- Dullness and sallowness

No other skin app connects metabolic health to skin outcomes.

### Decision
Position HbA1c as a key differentiator. When available (via CGM, lab results, or future Apple glucose), display glycation risk scoring and connect it to skin aging analysis.

### Data Sources (Priority Order)
1. User-reported lab results (manual entry)
2. CGM integration (Dexcom API, LibreLink)
3. Apple HealthKit (when Apple ships non-invasive glucose)
4. Eye biomarker analysis (Phase 4+, requires dataset collection)

### Consequences
- Unique positioning (no competitor does this)
- Requires user education (why does blood sugar matter for skin?)
- Creates upsell opportunity (glucose management → skincare routine)
- Potential partnership with CGM companies

---

## ADR-010: Supabase as Backend

**Date:** 2026-05-30
**Status:** Accepted (carried forward from v1)

### Context
SKINgenius needs auth, database, storage, and edge functions. Options: Supabase, Firebase, custom.

### Decision
Continue with Supabase (already configured for web app).

### Consequences
- PostgreSQL + RLS for data security
- Edge Functions for Gemini API calls
- Storage for scan images (encrypted)
- Auth for user management
- Realtime for live scan status updates
- Existing schema (31 conditions, 103 ingredients, 236 products)

---

## Summary: v2 Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native + Expo | iOS/Android app |
| **On-device ML** | TensorFlow Lite | ViT skin classifier (85MB) |
| **Cloud AI** | Gemini 2.5 Flash | Deep analysis (paid tier) |
| **Backend** | Supabase | Auth, DB, storage, edge functions |
| **Wearable** | HealthKit + Health Connect | HR, HRV, sleep, SpO2, activity |
| **Payments** | Stripe | Subscriptions |
| **Build** | Expo EAS | App Store submission |
