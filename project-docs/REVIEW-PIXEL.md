# Technical Review — SKINgenius Architecture v2 + PPG Research

> **Reviewer:** Pixel (skingenius-dev, Kimi K2.6)  
> **Date:** 2026-05-30  
> **Status:** CRITICAL — Action required before Phase 1 kickoff  
> **Scope:** ARCHITECTURE-V2.md, PPG-RESEARCH.md, DECISIONS.md, INFRASTRUCTURE.md, MEMORY.md (Pulse Cycle 22)

---

## TL;DR — Executive Verdict

The architecture is **ambitious but directionally sound**. The phased plan is **overly aggressive** — it demands 4 parallel workstreams in Phase 1 that the current team (9 dormant agents, Vercel builds broken, Brave Search API dead) cannot execute. **The single biggest risk is execution capacity, not technical feasibility.**

**My recommendation: Define a "Demo MVP" (scan → analyze → recommend, no PPG), ship it in 4 weeks, then layer PPG in Phase 2.** This mirrors Pulse Cycle 22's recommendation and acknowledges the team's stalled state.

---

## 1. Phased Implementation Plan — Realistic?

### Verdict: **Optimistic by ~2x. Critical path dependencies ignored.**

| Phase | Doc Claim | Reality | Gap |
|-------|-----------|---------|-----|
| Phase 1 (W1-4) | Free tier MVP + basic PPG | Team has 0 active devs, Vercel broken, no TFLite runtime in repo | **Massive** |
| Phase 2 (W5-8) | Gemini integration + paid tier | Requires Phase 1 API scaffold + auth + Supabase edge functions | **Blocked by Phase 1** |
| Phase 3 (W9-12) | Full PPG suite | Requires trained TFLite models that don't exist | **Blocked by ML pipeline** |
| Phase 4 (W13-16) | Scale + polish | Production launch on broken infrastructure | **Fantasy** |

### What's Missing

1. **Infrastructure recovery phase** — Vercel builds have been failing since May 21 (10+ days). Phase 1 needs a W0 "fix the build" sprint.
2. **ML model validation** — The ViT model (85MB) is referenced but I see no `vit_skin_classifier.tflite` in the workspace. The PPG models (15MB total) are described but not built. Phase 1 has no "train/convert models" task.
3. **Team capacity planning** — The plan assumes 8 owners across 4 weeks. Currently 0/9 agents are active. The architect model (Kimi K2 Thinking) is experiencing "failure storms" (28+ errors in 4 sessions, per Pulse Cycle 22).
4. **Brave Search API recovery** — Research is blocked since May 14. No alternative search configured. This blocks ingredient data enrichment, which blocks the recommendation engine.
5. **CEO cron disable** — Pulse has flagged this for 18 cycles. The cron burns ~2.3M tokens/day with zero output. This is a resource drain that prevents agent allocation to actual work.
6. **Gemma 4B vs. ViT + Gemini conflict** — ARCHITECTURE.md (ADR-001) specifies on-device Gemma 4B (LiteRT) for skin analysis. ARCHITECTURE-V2.md specifies ViT (TFLite) on-device + Gemini 2.5 Flash cloud. These are **incompatible** without a decision record. Which is it?

### Recommended Revision

```
W0 (Recovery): Fix Vercel builds, disable CEO cron, reactivate 2 dev agents
W1-2 (Demo MVP): Scan flow → ViT inference → rule-based recommendations
W3-4 (Polish): UI/UX pass, beta test with 5 users, ingredient database seeding
W5-8 (Cloud tier): Gemini integration, multi-zone analysis, Stripe subscriptions
W9-12 (PPG): MediaPipe face mesh, POS algorithm, HR extraction, calibration
W13-16 (Scale): Model compression, shareable reports, professional tier
```

---

## 2. React Native + TFLite Integration — Gotchas

### Verdict: **Feasible but the stack pivot from Next.js is a major unplanned cost.**

The existing architecture (INFRASTRUCTURE.md, DECISIONS.md) specifies:
- **Next.js 14 (App Router)** on Vercel
- **No React Native** mentioned anywhere

ARCHITECTURE-V2.md introduces React Native / Expo without a migration plan. This is a **full stack pivot** — not an incremental addition.

### Gotchas

1. **Model format mismatch** — TFLite runs on mobile (Android NNAPI, CoreML). The existing app is a web app (Next.js). If we stay web, we need **TensorFlow.js** (not TFLite) or a native module bridge. If we go native, we abandon the existing Next.js codebase.
2. **TFLite React Native libraries are immature**:
   - `react-native-tflite` — unmaintained (last commit 2 years ago)
   - `expo-tflite` — Expo-only, limited ops support
   - `@tensorflow/tfjs-react-native` — TensorFlow.js, not TFLite, requires Metro config hacks
   - **Recommendation:** Use **React Native's New Architecture (TurboModules)** to write a thin C++ bridge to TFLite C API. Or use **Expo Modules API** if staying Expo.
3. **Model size — 85MB ViT + 15MB PPG = 100MB core bundle** — iOS App Store over-the-air limit is 200MB (uncompressed). Android AAB handles this better with dynamic delivery. But **first install size matters** for conversion — users abandon downloads >50MB.
4. **INT8 quantization accuracy loss** — The doc claims 93.5% accuracy for ViT. If this is FP32 accuracy, INT8 quantization typically drops 1-3% unless calibrated with representative data. No calibration dataset is mentioned.
5. **NPU delegate fragmentation** — Android NNAPI and Apple CoreML have different op support. A model that runs on CoreML may fail on NNAPI. Need per-platform testing.
6. **Hermes + TFLite memory pressure** — Hermes (React Native JS engine) + TFLite interpreter + camera feed = memory pressure on 3GB RAM devices (iPhone 8, budget Android). The doc targets "iPhone 8+" — this device has 2GB RAM.

### My Recommendation

**Do NOT pivot to React Native for the MVP.** The existing Next.js web app can use:
- **TensorFlow.js** for in-browser ViT inference (WebGL backend, ~150MB model loads from CDN)
- **MediaPipe for web** (WASM) for face mesh + PPG signal extraction
- **PWA** for "app-like" installability

If React Native is a hard requirement (e.g., Pleij Salon needs native app), treat it as a **Phase 3 native rewrite**, not a Phase 1 foundation. The team does not have capacity for a stack pivot right now.

---

## 3. PPG in React Native — Feasibility?

### Verdict: **Heart rate = feasible. SpO2/BP/stress = questionable. Fitzpatrick V-VI = high risk.**

### Libraries I Would Use (Web or Native)

| Component | Library | Notes |
|-----------|---------|-------|
| Face Detection | **MediaPipe Face Mesh** (WASM for web, TFLite for native) | Production-ready, 468 landmarks, 30fps on mid-tier |
| PPG Extraction | **POS algorithm** (custom TypeScript/C++) | No mature JS/TS library exists. Must implement from paper. |
| Signal Filtering | **DSP.js** (web) or custom FFT (native) | Butterworth bandpass, 0.5-4Hz. FFT peak detection for HR. |
| HR Extraction | **Custom** (FFT peak detection) | 30s of 30fps = 900 samples. FFT → find peak in 0.5-4Hz range. |
| SpO2 Estimation | **Custom ML model** (TFLite) | No phone has IR camera. Red/blue ratio workaround needs training data. |
| BP Estimation | **Not recommended for MVP** | Requires calibration with cuff. Pulse transit time without ECG is unreliable. |
| Stress Index | **Custom** (HRV frequency analysis) | Needs 2+ min clean signal. 60s capture is insufficient per the research doc's own findings. |

### Critical Issues

1. **No mature JS/TS PPG library** — The research doc lists `webcam-ppg` (prototype) and `pulse-oximeter-js` (limited). We would be building the signal processing pipeline from scratch. This is **not a 4-week task** — it's 4-8 weeks for a competent signal processing engineer.
2. **SpO2 without IR is fundamentally limited** — The research doc acknowledges this (±3-5% vs clinical ±2%). For a wellness app, this is acceptable. But we must **never** display SpO2 as a clinical measurement. "Estimated oxygen level" with a wide confidence interval.
3. **Fitzpatrick V-VI SNR problem is real and unsolved** — The research doc cites SNR 5-12 dB for V-VI. The proposed "amplification gain" solution (1.8x) amplifies noise along with signal. The POS algorithm's skin-tone robustness is "good" (per the table), but "good" means ±3 bpm on light skin — likely ±5-8 bpm on dark skin. **This is a product liability risk, not just a technical one.**
4. **60s capture for stress/HRV contradicts UX feasibility** — Users will not hold still for 60 seconds. Google Fit's PPG (similar approach) uses **15 seconds** for heart rate. We should target **15-30s for HR, 60s optional for HRV** with clear UX guidance.
5. **Motion artifact removal is hard** — The doc mentions "PCA-based" motion artifact removal. PCA requires computing eigenvectors across frames — expensive on mobile. A simpler approach: detect motion via optical flow between frames, reject segments with motion >threshold.

### My Recommendation

**PPG Phase 1 scope should be:**
- Heart rate only (30s capture, POS algorithm, FFT peak detection)
- Signal quality score (SNR-based, reject if <40)
- Fitzpatrick-aware amplification (with uncertainty flags)
- **No SpO2, no BP, no stress index for MVP**

This reduces Phase 1 PPG from "full biomarker suite" to "heart rate estimation with quality control" — achievable in 4 weeks with 1 ML engineer + 1 mobile dev.

---

## 4. Gemini API Integration — Async 202 Pattern

### Verdict: **Correct pattern. Implementation details need tightening.**

The doc specifies:
```
POST /scan/analyze → 202 Accepted
{ scan_id, status: "processing", estimated_seconds: 8 }
GET /scan/{scan_id}/status → polling
GET /scan/{scan_id}/result → final result
```

This is the right pattern for long-running AI inference. But there are gaps:

### Issues

1. **No webhook/push notification fallback** — Mobile clients should not poll. Use **Supabase Realtime** (WebSocket) or **Firebase Cloud Messaging** to push "scan complete" to device. Polling drains battery.
2. **"Estimated seconds: 8" is a lie** — Gemini 2.5 Flash latency is 2-8s (p99: 15s). The doc acknowledges this. The 202 response should say `"estimated_seconds": 15` and set client polling to 5s intervals with backoff.
3. **No retry/circuit breaker spec** — If Gemini times out (>15s), the edge function should:
   - Retry once with 5s delay
   - On second failure, fall back to cached generic analysis + queue for human review
   - Return 200 (not 500) with `"status": "degraded"` and partial results
4. **JSON schema enforcement** — The doc shows a structured output schema. Gemini 2.5 Flash supports `"response_mime_type": "application/json"` with JSON schema in the API call. Use this — do NOT rely on prompt engineering for JSON structure.
5. **Cost at scale** — The doc estimates $0.001/scan. At 10K users doing 3 scans/month = $30/month. This is negligible. But if users do unlimited scans (Pro tier), cost balloons. Need scan quota enforcement before the Gemini call, not after.

### My Recommendation

```typescript
// Edge function (Supabase) pseudo-code
export async function analyzeScan(req: Request) {
  // 1. Auth + rate limit (Redis sliding window)
  const user = await authUser(req);
  const quota = await checkQuota(user.id);
  if (!quota.remaining) return 429;

  // 2. Decrement quota IMMEDIATELY (prevent race)
  await decrementQuota(user.id);

  // 3. Upload image to encrypted storage
  const imageUrl = await storeEncrypted(req.image, user.id);

  // 4. Queue Gemini job (do NOT block)
  const scanId = await createScanRecord(user.id, imageUrl, vitResults);
  await queueGeminiJob(scanId); // Background worker, not sync

  // 5. Return 202
  return json({ scan_id: scanId, status: "processing", estimated_seconds: 15 }, { status: 202 });
}
```

Add a **background worker** (Supabase Edge Function triggered by pg_cron or Queue) to process Gemini calls asynchronously. Do NOT call Gemini synchronously from the API request thread.

---

## 5. Database Schema Additions — Issues?

### Verdict: **Well-designed but 3 critical gaps.**

The schema in §7 is comprehensive. I like:
- `ppg_sessions` with signal_quality, calibration_profile_id, fitzpatrick_type
- `ppg_calibration_profiles` with 30-day expiry
- `research_consents` for GDPR/CCPA compliance
- RLS on every table

### Issues

1. **Missing `scan_images` table** — The doc says "Original photo (encrypted in transit)" and "image_url" in ScanResult. But there's no table for image metadata (size, encryption key ID, retention policy). Add:
   ```sql
   create table scan_images (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) on delete cascade,
     scan_id uuid references scans(id) on delete cascade,
     storage_path text not null, -- e.g., "private/{user_id}/{scan_id}.jpg"
     size_bytes integer,
     encryption_key_id text, -- KMS reference
     retention_until timestamptz, -- auto-delete after 30 days
     created_at timestamptz default now()
   );
   ```
2. **No index on `scans(tier, created_at)`** — Analytics queries will filter by tier + date range. The doc indexes `scans(tier)` and `ppg_sessions(user_id, recorded_at)` but not the composite.
3. **`ppg_sessions.blood_pressure_systolic` nullable with no check** — Should have `check (blood_pressure_systolic between 70 and 250)` and same for diastolic (40-150).
4. **No `device_capabilities` table** — For graceful degradation (iPhone 8 skips PPG, Android 8 cloud-only), we need to track device capability profiles:
   ```sql
   create table device_profiles (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) on delete cascade,
     device_model text not null,
     os_version text,
     supports_tflite_gpu boolean default false,
     supports_ppg boolean default false,
     max_model_size_mb integer,
     last_updated timestamptz default now()
   );
   ```
5. **Subscription quota reset** — The `subscriptions` table tracks `scans_used_this_month` but no mechanism to reset monthly. Needs a cron job or Supabase pg_cron.
6. **`recommendation_logs.user_purchased` is a boolean** — Should be nullable (unknown) not `default false`. Also needs `purchased_at` and `purchase_value` for affiliate revenue tracking.

### My Recommendation

Fix the 6 gaps above before Phase 2. The core schema is solid — these are refinements, not redesigns.

---

## 6. Top 3 Technical Risks

### Risk 1: Execution Capacity Collapse (LIKELIHOOD: CERTAIN | IMPACT: FATAL)

**The team has 0 active agents, Vercel builds broken for 10 days, and the CEO cron burns 2.3M tokens/day.** Even if the architecture is perfect, it will not ship without people working on it. The 16-week plan assumes 8 parallel workstreams — we have capacity for maybe 2.

**Mitigation:**
- Disable CEO cron (Pulse recommendation, 18 cycles ignored)
- Reactivate 2 dev agents (Pixel + 1 other) with explicit daily tasks
- Define Demo MVP scope: scan → analyze → recommend. NO PPG. NO Gemini cloud. Just the free tier working end-to-end.
- Fix Vercel builds in W0.

### Risk 2: PPG Accuracy on Fitzpatrick V-VI (LIKELIHOOD: HIGH | IMPACT: REPUTATIONAL)

**The research doc acknowledges SNR drops to 5-12 dB for V-VI. Amplification gain amplifies noise. POS algorithm is "good" but not validated on dark skin in published literature (most rPPG studies use light-skinned subjects).**

If SKINgenius markets "Fitzpatrick-first" but delivers ±8 bpm heart rate for dark-skinned users, we will be called out — especially given the JAMA/NEJM citations on pulse oximetry racial bias. The product liability is real.

**Mitigation:**
- For MVP: PPG is "Labs" experimental feature, not core
- Fitzpatrick V-VI: show "Estimated range" (72 ± 8 bpm), not "72 bpm"
- Mandatory calibration with external pulse oximeter for V-VI users
- Publish accuracy study results (even if internal) — transparency builds trust
- Consider partnering with Basys Health for clinical validation

### Risk 3: Stack Pivot to React Native (LIKELIHOOD: HIGH | IMPACT: 4-6 WEEK DELAY)

**The existing app is Next.js on Vercel. ARCHITECTURE-V2.md introduces React Native without migration planning. A full native rewrite is 2-3 months of work for a team of 2-3 mobile devs. We don't have that capacity.**

If Jason/Tiche insists on native app, we need to:
- Keep web app as "PWA MVP"
- Start React Native as parallel track with dedicated native team
- Share Supabase backend, TFLite models, and API layer

**Mitigation:**
- Stay web-first for MVP (Next.js + TensorFlow.js + MediaPipe for web)
- React Native = Phase 3, not Phase 1
- If native is non-negotiable, hire/assign a dedicated React Native engineer

---

## 7. Recommended Priority Order for Phase 1 Tasks

Based on the above analysis and the team's current state (0 active agents, broken builds, stalled for 10 days), here is my revised Phase 1:

### Week 0: Recovery (CRITICAL — Do Not Skip)

| Priority | Task | Owner | Deliverable |
|----------|------|-------|-------------|
| P0 | Disable CEO cron | Nova | Cron stopped, token burn halved |
| P0 | Fix Vercel builds | Forge | `npm run build` passes, deploy succeeds |
| P0 | Reactivate 2 dev agents | Nova | Pixel + 1 other assigned daily tasks |
| P0 | Configure alternative search API | Forge | Research unblocked (Serper, DuckDuckGo, or Perplexity) |
| P1 | Define Demo MVP scope | Jason + Nova | 1-page scope: scan → analyze → recommend |

### Week 1: Foundation

| Priority | Task | Owner | Deliverable |
|----------|------|-------|-------------|
| P0 | Confirm AI model choice (Gemma 4B vs ViT+Gemini) | Dermis + Lens | ADR updated, team aligned |
| P0 | Integrate TensorFlow.js (or TFLite bridge) into existing Next.js app | Pixel | Model loads in browser, inference works |
| P1 | Build camera capture component (web, PWA) | Pixel | Photo capture + preview |
| P1 | Port/verify ViT model (or Gemma 4B LiteRT) | Lens | Model binary in repo, INT8 quantized |
| P2 | Seed rule-based recommendation engine | Core | Ingredient → condition mapping in Supabase |

### Week 2: Core Flow

| Priority | Task | Owner | Deliverable |
|----------|------|-------|-------------|
| P0 | End-to-end scan flow: capture → inference → results | Pixel | Free tier works on web |
| P0 | Build results screen (basic) | Aura | Condition name + top 3 ingredients |
| P1 | Auth + user profiles (Supabase) | Pixel | Sign up, skin profile, Fitzpatrick type |
| P2 | Ingredient database completeness (150 ingredients) | Core + Sage | 150 ingredients with evidence scores |

### Week 3: Polish + Beta

| Priority | Task | Owner | Deliverable |
|----------|------|-------|-------------|
| P0 | Beta test with 5 users (all Fitzpatrick types) | Jason + Tiche | Feedback doc, bug list |
| P0 | Performance budget audit | Pixel | Bundle <200KB (JS), model <100MB |
| P1 | Error handling + edge cases | Pixel | Offline mode, model load failure, low memory |
| P2 | Analytics instrumentation (Amplitude/Mixpanel) | Growth | Funnel tracking |

### Week 4: Demo MVP Complete

| Priority | Task | Owner | Deliverable |
|----------|------|-------|-------------|
| P0 | Demo MVP launch (internal) | All | Working product, no PPG, no cloud AI |
| P0 | Decision gate: proceed to Phase 2 (cloud tier) or refine | Jason | Go/no-go |
| P1 | Documentation: architecture decision on React Native vs PWA | Dermis | ADR-006 |
| P1 | PPG feasibility spike (1 week, 1 engineer) | Lens | Heart rate from 30s video, 5 users, accuracy report |

---

## Appendix: Conflict Analysis — Gemma 4B vs ViT + Gemini

| Document | On-Device Model | Cloud Model | Stack |
|----------|---------------|-------------|-------|
| ARCHITECTURE.md (ADR-001) | Gemma 4B (LiteRT-LM) | None | Next.js web |
| ARCHITECTURE-V2.md | ViT (TFLite, 85MB) | Gemini 2.5 Flash | React Native |

**This is a fundamental architectural disagreement that must be resolved before any code is written.**

My assessment:
- **Gemma 4B** is a general-purpose LLM. It can do vision + reasoning + recommendation in one model. But it's 1.5GB (or 4GB depending on quantization), which is massive for mobile. LiteRT-LM is experimental (Google I/O 2024 announcement, limited docs).
- **ViT + Gemini** separates concerns: fast on-device classification (200ms) + rich cloud analysis (2-8s). This is more robust, lower risk, and aligns with the free/paid tier split.
- **Recommendation:** Adopt ViT + Gemini, deprecate Gemma 4B for now. Gemma can be revisited as an on-device reasoning option in 2027 when LiteRT-LM matures. Update ADR-001 to superseded, create ADR-006.

---

## Appendix: PPG Skin Tone Calibration — Deeper Analysis

The research doc's calibration table:

| Fitzpatrick | Gain | Noise Floor | Uncertainty |
|-------------|------|-------------|-------------|
| V | 1.6x | 0.15 | "high" for SpO2/BP |
| VI | 1.8x | 0.20 | "high" for all |

**Problem:** Higher gain amplifies noise. At 1.8x gain with noise floor 0.20, the signal-to-noise ratio is ~9 dB (calculated: 20*log10(1.8/0.20) ≈ 19 dB, but this assumes signal amplitude is proportional to gain, which is not how PPG works).

**Real physics:** Melanin absorbs green light (peak hemoglobin absorption ~540nm). The signal amplitude is lower because less green light reflects back to the camera. "Amplification" in software (multiplying pixel values) does not recover lost photons — it multiplies noise from the camera sensor.

**What actually helps:**
1. **Longer exposure / higher ISO** — More photons captured. But increases motion blur and sensor noise.
2. **Brighter illumination** — The doc mentions "well-lit environment" but doesn't specify lux levels. For Fitzpatrick VI, we may need >1000 lux (bright indoor / near-window) vs 200-500 lux for Fitzpatrick I.
3. **Multi-ROI fusion** — Average signal from forehead + both cheeks. If one ROI is noisy, weight it lower.
4. **Longer capture duration** — 60s instead of 30s for VI. More samples = better FFT resolution.
5. **Calibration with reference device** — Compare with pulse oximeter, learn per-user offset.

**My revised calibration for Fitzpatrick VI:**
- Capture duration: 60s (not 30s)
- Minimum lux: 800 (not "well-lit")
- Show "Estimated heart rate: 72-88 bpm" (not "72 bpm")
- Flag: "For best results, sit near a bright window"
- Optional: sync with Apple Watch / Fitbit for validation

---

*Review completed by Pixel (skingenius-dev). Ready for team discussion.*
