# SKINgenius — On-Device AI Research

> **Date:** 2026-05-22
> **Researcher:** Che (automated)

---

## Google AI Edge SDK — What's Available

### For Skin Analysis (Vision + Classification)

| Component | Platform | What It Does | Model Size |
|-----------|----------|-------------|------------|
| **MediaPipe Face Detection** | iOS + Android + Web | Face bounding box, 6 landmarks, quality scores | ~2MB |
| **MediaPipe Image Classifier** | iOS + Android | Custom vision model inference | Depends on model |
| **Gemma 4 (via LiteRT-LM)** | iOS + Android | Vision-language model, understands images | 2-4GB |
| **LiteRT** | iOS + Android | Run any TFLite/custom model | Depends on model |

### MediaPipe Face Detection
- **Packages:** `@mediapipe/tasks-vision` (web), native SDKs for iOS/Android
- **Provides:** Face bounding box, 468 facial landmarks, face quality score
- **Model hosted on CDN:** Auto-downloaded on first use
- **React Native:** No official wrapper, but MediaPipe has native Android/iOS SDKs that can be wrapped via Expo native modules

### Gemma 4 On-Device
- **Available through:** AI Edge Gallery app (open-source, both stores)
- **Can analyze images:** Yes — vision-language model
- **Inference time:** 2-5 seconds on modern phones (iPhone 14+, Pixel 7+)
- **Model size:** ~2-4GB (downloaded on first use)
- **Offline:** Yes — runs entirely on-device after download
- **Web:** Available via `@litert-lm/core` npm package

### LiteRT-LM (On-Device LLM Runtime)
- **Web:** `@litert-lm/core` npm package
- **iOS:** LiteRT-LM Swift API with Metal GPU
- **Android:** LiteRT-LM Kotlin API
- **Supported models:** Gemma 4, Gemma 3, and other LiteRT-compatible models

---

## How COLORgenius Does It

COLORgenius uses Google Edge Gallery for on-device hair analysis:
- Camera captures photo
- On-device model analyzes hair color/texture
- Results sent to server (NOT the photo)
- Zero API costs per analysis

Same pattern applies to SKINgenius skin analysis.

---

## Recommended Architecture for SKINgenius

### Phase 1: MediaPipe + Web (NOW)
```bash
npm install @mediapipe/tasks-vision
```
- MediaPipe face detection in browser (already built in our pipeline)
- Quality gate runs client-side (blur, lighting)
- Skin tone estimation runs client-side
- Zero server cost for quality checks

### Phase 2: Gemma 4 Vision (Month 1-2)
- Integrate Gemma 4 via LiteRT-LM for on-device skin condition detection
- Model downloaded on first app launch (~2-4GB)
- Replace mock classifier with on-device Gemma 4 analysis
- Works offline after download

### Phase 3: Fine-Tuned Model (Month 3-4)
- Fine-tune Gemma 4 with Fitzpatrick 17k dataset (once licensed)
- LoRA training on our 25 conditions + 105 ingredients
- Improved accuracy for Fitzpatrick IV-VI
- A/B test against base Gemma 4

### Phase 4: Lightweight Specialist (Month 5-6)
- Train small models (<500MB) for specific conditions
- Faster inference, works on older phones
- Progressive enhancement: base model first, specialist model if hardware supports it

---

## Implementation: Expo + MediaPipe

### Option A: Expo Native Module (Recommended)
- Write a native module wrapping MediaPipe Android/iOS SDK
- Expose to React Native via Expo config plugin
- Most control, best performance

### Option B: Web-First with React Native Web
- Use `@mediapipe/tasks-vision` in web context
- Works in Expo web target
- Simpler but limited to web builds

### Option C: AI Edge Gallery SDK (When Available)
- Google may release a React Native SDK for AI Edge Gallery
- Check: `react-native-google-ai-edge` (doesn't exist yet, check periodically)
- Wait and see — might be announced at Google I/O

**Recommended:** Option A — native module wrapping MediaPipe. Most reliable, best performance.

---

## Cost Impact

| Approach | Cost per Scan | 1,000 scans/day |
|----------|--------------|-----------------|
| Server-side (Gemini Vision API) | $0.0025-$0.013 | $2.50-$13/day |
| Server-side (GPT-4 Vision) | $0.01-$0.03 | $10-$30/day |
| On-device (MediaPipe + Gemma 4) | **$0.00** | **$0.00** |

On-device = unlimited free scans forever.

---

## Open Questions
1. Does Google plan to release a React Native wrapper for AI Edge Gallery?
2. What's the minimum hardware spec for Gemma 4 on-device?
3. Can we fine-tune Gemma 4 with LoRA and deploy the fine-tuned model on-device?
4. How to handle the 2-4GB model download (progressive download, user consent)?

## Sources
- https://ai.google.dev/edge
- https://ai.google.dev/edge/litert-lm
- https://ai.google.dev/edge/mediapipe/solutions/guide
- https://github.com/google-ai-edge/gallery
- https://ai.google.dev/gemma/docs
