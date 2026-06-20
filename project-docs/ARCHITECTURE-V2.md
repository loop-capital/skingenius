# SKINgenius Architecture v2

> **Document Version:** 2.0  
> **Status:** DESIGN — NOT YET IMPLEMENTED  
> **Author:** SKINgenius Architect Subagent  
> **Date:** 2026-05-30  
> **Owner:** Jason (Product), Tiche (Domain Expert)

---

## Executive Summary

This document defines the complete v2 architecture for **SKINgenius**, a skin health intelligence platform. It unifies our existing on-device ViT model, cloud-based AI analysis via Gemini 2.5 Flash, and introduces a novel **PPG (Photoplethysmography) module** for cardiovascular and respiratory biomarker extraction from face video. The architecture is designed to be **privacy-first**, **mobile-native**, and **scientifically rigorous** while maintaining a clear **non-medical wellness positioning**.

**Key Addition in v2:** The PPG module enables measurement of heart rate, blood oxygen (SpO2), respiratory rate, blood pressure estimation, and stress levels by analyzing subtle color changes in facial blood vessels via the device's front camera. This represents a significant moat and aligns with Basys Health's biomarker integration roadmap.

---

## Table of Contents

1. [System Architecture Diagram](#1-system-architecture-diagram)
2. [Data Flow (Free & Paid Tiers)](#2-data-flow-for-both-tiers)
3. [Model Integration Strategy](#3-model-integration-strategy)
4. [PPG Module Design](#4-ppg-module-design)
5. [Mobile App Architecture](#5-mobile-app-architecture)
6. [API Design](#6-api-design)
7. [Database Schema Additions](#7-database-schema-additions)
8. [Phased Implementation Plan](#8-phased-implementation-plan)
9. [Risk Assessment](#9-risk-assessment)
10. [Open Questions](#10-open-questions-for-the-team)

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SKINgenius v2 Platform                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    REACT NATIVE / EXPO CLIENT                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────────┐ │   │
│  │  │   Camera     │  │   Storage    │  │      UI / Navigation        │ │   │
│  │  │   Module     │  │  (SQLite/FS) │  │      (Expo Router)          │ │   │
│  │  └──────┬───────┘  └──────────────┘  └─────────────────────────────┘ │   │
│  │         │                                                             │   │
│  │  ┌──────┴───────────────────────────────────────────────────────┐    │   │
│  │  │              ON-DEVICE PROCESSING ENGINE (TFLite)            │    │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │    │   │
│  │  │  │  ViT Model   │  │  PPG Module  │  │  Gemma 2B (NPU)     │ │    │   │
│  │  │  │  (~85MB)     │  │  (~15MB)     │  │  (~1.5GB opt)     │ │    │   │
│  │  │  │  Skin Class  │  │  Bio Signal  │  │  Reasoning/RAG    │ │    │   │
│  │  │  └──────────────┘  └──────────────┘  └───────────────────┘ │    │   │
│  │  │         │                   │                     │           │    │   │
│  │  │         ▼                   ▼                     ▼           │    │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐ │    │   │
│  │  │  │          RULE-BASED RECOMMENDATION ENGINE               │ │    │   │
│  │  │  │  (if acne → BHA, if rosacea → azelaic acid, etc.)       │ │    │   │
│  │  │  └──────────────────────────────────────────────────────────┘ │    │   │
│  │  └───────────────────────────────────────────────────────────────┘    │   │
│  │         │                                                             │   │
│  │         │ NO INTERNET REQUIRED (Free Tier)                            │   │
│  │         │                                                             │   │
│  │         │ INTERNET OPTIONAL (PPG cloud sync, Gemini Pro)              │   │
│  │         ▼                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │                      NETWORK LAYER                               │  │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │   │
│  │  │  │  Supabase    │  │  Gemini API  │  │  Cloud Storage       │ │  │   │
│  │  │  │  (REST/WS)   │  │  (HTTP/SSE)  │  │  (Scan images, PPG)  │ │  │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CLOUD INFRASTRUCTURE                          │   │
│  │  ┌───────────────────────────────────────────────────────────────┐   │   │
│  │  │                  Supabase (PostgreSQL + Edge Functions)       │   │   │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │   │   │
│  │  │  │ Auth/RLS   │  │  Database  │  │  Storage   │  │  Edge  │ │   │   │
│  │  │  │ (GoTrue)   │  │ (Postgres) │  │ (S3-like)  │  │ Functions│ │   │   │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────┘ │   │   │
│  │  └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐   │   │
│  │  │              GEMINI 2.5 FLASH (Google Vertex AI)              │   │   │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │   │   │
│  │  │  │  Vision    │  │  Analysis  │  │  Reasoning │  │  RAG   │ │   │   │
│  │  │  │  Parsing   │  │  (30s max) │  │  Chain     │  │  (DB)  │ │   │   │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────┘ │   │   │
│  │  └───────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow for Both Tiers

### 2.1 Free Tier Flow (Privacy-First, On-Device)

```
User captures selfie (front camera)
        │
        ▼
┌──────────────────────────────────────────┐
│  1. PHOTO PREPROCESSING                  │
│     • Resize to 224x224 (ViT input)     │
│     • Normalization (ImageNet stats)    │
│     • Lighting correction (histogram)   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  2. VI T INFERENCE (TFLite, ~85MB)       │
│     • Forward pass: ~200ms on mid-tier   │
│     • Output: condition logits (31 cls)  │
│     • Top-3 conditions with confidence   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  3. RULE-BASED RECOMMENDATION ENGINE     │
│     • Map condition → ingredients         │
│     • Filter by contraindications         │
│     • Sort by evidence score (our DB)     │
│     • Return: ingredients + products      │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  4. LOCAL RESULTS SCREEN                 │
│     • Condition name + severity estimate  │
│     • Top 3 recommended ingredients       │
│     • CTA: "Upgrade for deep analysis"    │
└──────────────────────────────────────────┘

NO DATA LEAVES DEVICE
NO INTERNET REQUIRED
NO API COST INCURRED
```

### 2.2 Paid Tier Flow (Cloud-Enhanced, Gemini 2.5 Flash)

```
User captures selfie + optional PPG video
        │
        ▼
┌──────────────────────────────────────────┐
│  1. ON-DEVICE PRE-SCAN (Free tier runs)  │
│     • ViT classification (same as free)   │
│     • Quick local preview for user       │
│     • PPG signal extraction (if video)   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  2. UPLOAD TO CLOUD (User consents)      │
│     • Original photo (encrypted in transit)│
│     • ViT results (condition + confidence)│
│     • PPG extracted signals (not raw video)│
│     • Optional: user profile (age, skin type)│
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  3. GEMINI 2.5 FLASH ANALYSIS            │
│     • Multi-zone breakdown:              │
│       - Forehead, cheeks, under-eye,     │
│         jawline, nose, chin              │
│     • Severity grading per zone          │
│       - Mild / Moderate / Severe         │
│     • Root cause reasoning chain         │
│       - Hormonal, environmental,         │
│         lifestyle, genetic factors       │
│     • PPG biomarker correlation          │
│       - Stress → cortisol → acne link   │
│     • Evidence-based product recs       │
│       - From Supabase DB via RAG        │
│     • Cost: ~$0.001/scan                │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  4. RICH RESULTS SCREEN                  │
│     • Interactive face map (zones)       │
│     • Severity heatmap                   │
│     • Root cause tree visualization      │
│     • Personalized routine builder       │
│     • Progress tracking setup            │
│     • Shareable report (PDF/ image)      │
└──────────────────────────────────────────┘
```

### 2.3 PPG Flow (Biomarker Extraction)

```
User captures 30-60s face video (front camera, well-lit)
        │
        ▼
┌──────────────────────────────────────────┐
│  1. VIDEO ACQUISITION                    │
│     • 30fps, 480p minimum (configurable)  │
│     • Auto-exposure lock to prevent      │
│       artifact injection                 │
│     • Face detection + ROI tracking        │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  2. PPG SIGNAL EXTRACTION (On-device)    │
│     • Face mesh detection (468 points)   │
│     • ROI selection: cheeks, forehead     │
│     • Green channel amplification          │
│       (maximizes hemoglobin absorption)   │
│     • Temporal filtering (bandpass 0.5-4Hz)│
│     • Motion artifact removal (PCA-based) │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  3. BIOMARKER COMPUTATION (TFLite)       │
│     • Heart rate (FFT peak detection)      │
│     • SpO2 (red/infrared ratio from       │
│       device camera if dual-LED, else    │
│       estimate from pulse waveform)       │
│     • Respiratory rate (envelope detection)│
│     • Blood pressure (pulse transit time   │
│       + calibration model)                │
│     • Stress index (HRV frequency analysis)│
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  4. SKIN TONE CALIBRATION                │
│     • Fitzpatrick type detection (from    │
│       scan or user profile)               │
│     • Melanin compensation matrix         │
│     • Per-type accuracy thresholds        │
│     • Uncertainty flags for Fitzpatrick   │
│       VI (darkest skin — lowest PPG SNR)  │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  5. RESULTS INTEGRATION                  │
│     • Free tier: basic vitals + skin link │
│     • Paid tier: full correlation with   │
│       Gemini analysis (stress → acne,     │
│       circulation → dark circles, etc.)   │
└──────────────────────────────────────────┘
```

---

## 3. Model Integration Strategy

### 3.1 ViT Model (On-Device, Both Tiers)

| Attribute | Specification |
|-----------|---------------|
| **Base Model** | Fine-tuned Vision Transformer (ViT-Base/16) |
| **Input** | 224x224 RGB image |
| **Output** | 31 skin condition classes + confidence scores |
| **Accuracy** | 93.5% (Fitzpatrick III-VI focus) |
| **Format** | TensorFlow Lite (`.tflite`) |
| **Size** | ~85MB (quantized INT8) |
| **Latency** | ~150-300ms on Snapdragon 7xx / A12+ |
| **Hardware** | CPU fallback, GPU delegate (OpenGL), NPU (Android NNAPI / CoreML) |

**Integration Points:**
- **Free Tier:** Sole analysis engine. Results fed directly to rule-based recommendation engine.
- **Paid Tier:** Pre-classification filter. Results sent to cloud alongside image for Gemini context.

**Model Hosting:**
- Bundled in app (core asset, downloaded on first install)
- Optional: split APK / App Thinning for <200MB constraint
- Update mechanism: version check against Supabase, background download

### 3.2 Gemini 2.5 Flash (Cloud, Paid Tier Only)

| Attribute | Specification |
|-----------|---------------|
| **Model** | Gemini 2.5 Flash (Google Vertex AI) |
| **Input** | Image (JPEG/PNG, max 4MB) + structured context (ViT results, user profile) |
| **Output** | JSON structured analysis (schema-defined) |
| **Cost** | ~$0.001 per scan (input: ~1K tokens image + 500 text, output: ~2K tokens) |
| **Latency** | 2-8 seconds (p99: 15s with retry) |
| **Rate Limit** | 60 RPM (free tier), 2,000 RPM (paid) — sufficient for our scale |

**Prompt Engineering Strategy:**
```
SYSTEM PROMPT (static):
You are a skincare analysis assistant. You do NOT provide medical diagnosis.
You analyze visual skin features and recommend evidence-based skincare ingredients.
Always include a disclaimer: "This is not medical advice."

USER PROMPT (dynamic):
{
  "image": <base64_image>,
  "vit_results": {
    "top_condition": "acne_vulgaris",
    "confidence": 0.91,
    "secondary_conditions": ["post_inflammatory_hyperpigmentation"]
  },
  "user_profile": {
    "age": 28,
    "skin_type": "combination_oily",
    "fitzpatrick": "IV",
    "concerns": ["breakouts", "dark_spots"]
  },
  "ppg_data": {
    "heart_rate": 72,
    "stress_index": "moderate",
    "spO2": 98
  }
}

OUTPUT SCHEMA (enforced):
{
  "zones": [
    {
      "name": "forehead",
      "severity": "moderate",
      "features": ["comedones", "mild_inflammation"],
      "recommendations": [...]
    }
  ],
  "root_causes": [...],
  "product_recommendations": [...],
  "routine_suggestion": {...}
}
```

**Error Handling:**
- **Timeout (>15s):** Fallback to cached "analysis in progress" + email notification when complete
- **Content filter triggered:** Return generic educational content + human review flag
- **Quota exceeded:** Queue + retry with exponential backoff, notify user of delay

### 3.3 PPG Model (On-Device, Optional for Both Tiers)

| Attribute | Specification |
|-----------|---------------|
| **Base** | Custom TensorFlow Lite model + classical signal processing |
| **Input** | 30-60s face video (30fps, 480p) |
| **Output** | HR, SpO2, RR, BP estimate, stress index |
| **Size** | ~15MB (TFLite face mesh + signal processing) |
| **Latency** | ~2-5s processing after video capture |
| **Accuracy targets** | HR: ±3bpm, SpO2: ±2% (Fitzpatrick I-IV), ±4% (V-VI) |

**Research Foundation:**
- Wroclaw University: "Remote PPG for cardiovascular monitoring" (2023)
- UCSF Tison Lab: "Smartphone-based blood pressure estimation" (2022)
- MIT Media Lab: "Multi-wavelength PPG for skin tone invariant SpO2" (2021)

**Skin Tone Calibration:**
Critical requirement. PPG signal quality (SNR) degrades with higher melanin content due to light absorption.

```
Calibration Strategy:
┌─────────────────────────────────────────────┐
│ 1. Fitzpatrick Detection                    │
│    • From user profile (self-reported)      │
│    • OR: from scan image (ViT auxiliary head)│
│                                             │
│ 2. Per-Type Compensation                     │
│    ┌─────────────┬─────────────────────────┐│
│    │ Fitzpatrick │ Compensation Multiplier ││
│    ├─────────────┼─────────────────────────┤│
│    │ I-II        │ 1.0x (baseline)         ││
│    │ III-IV      │ 1.3x (amplified gain)   ││
│    │ V-VI        │ 1.8x + uncertainty flag ││
│    └─────────────┴─────────────────────────┘│
│                                             │
│ 3. Uncertainty Communication                 │
│    • For V-VI: show "Estimated range"       │
│    • Flag: "Signal quality: Fair"             │
│    • Recommend quiet, well-lit environment    │
│    • Optional: external pulse oximeter sync   │
└─────────────────────────────────────────────┘
```

---

## 4. PPG Module Design

### 4.1 Signal Processing Pipeline

```
Raw Video (30s, 30fps, 480p)
        │
        ▼
┌─────────────────────────────────────┐
│ Frame Extraction & Face Detection   │
│ • MediaPipe Face Mesh (468 points) │
│ • ROI: cheeks (bilateral) +        │
│   forehead (forehead band)          │
│ • Tracking across frames (Kalman)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Color Space Transformation            │
│ • RGB → YUV (luminance separation)   │
│ • Green channel extraction            │
│   (peak hemoglobin absorption ~540nm)│
│ • Optional: IR channel if available  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Temporal Signal Construction        │
│ • Mean intensity per ROI per frame │
│ • Concatenate → raw PPG waveform   │
│ • Detrending (polynomial fit)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Filtering                             │
│ • Bandpass: 0.5Hz - 4Hz             │
│   (captures HR 30-240bpm + harmonics)│
│ • Notch filter: remove 50/60Hz artifact│
│ • Adaptive filter: motion artifact   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Feature Extraction                  │
│ • Peak detection (HR)               │
│ • FFT spectrum analysis              │
│ • Pulse waveform morphology          │
│   (systolic/diastolic ratio)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Biomarker Estimation (TFLite Models)│
│ • Heart Rate: direct from peaks      │
│ • SpO2: ratio-of-ratios (if dual-LED)│
│   OR: pulse oximetry model (single)  │
│ • Respiratory Rate: envelope of      │
│   low-frequency modulation           │
│ • Blood Pressure: PTT + calibration │
│ • Stress: HRV frequency domain        │
└─────────────────────────────────────┘
```

### 4.2 Architecture Components

| Component | Technology | Size | Runs On |
|-----------|-----------|------|---------|
| Face Detection | MediaPipe Face Mesh (TFLite) | ~8MB | Device |
| ROI Tracker | Custom Kalman filter (TFLite) | ~2MB | Device |
| Signal Processor | Classical DSP (no ML) | ~1MB | Device |
| HR/RR Extractor | TFLite regression model | ~2MB | Device |
| SpO2 Estimator | TFLite + lookup table | ~1MB | Device |
| BP Estimator | TFLite + calibration DB | ~1MB | Device |
| **Total** | | **~15MB** | |

### 4.3 Calibration Protocol

**Initial Calibration (Required for BP/SpO2 accuracy):**
```
User Flow:
1. "Let's calibrate your biomarkers"
2. Capture 60s face video
3. User inputs: age, weight, height, known BP (if available)
4. Optional: pair with external device (fitness tracker, BP cuff)
5. Store calibration vector in local SQLite
6. Re-calibrate every 30 days or on significant weight change
```

**Per-Session Quality Metrics:**
- `signal_quality_score`: 0-100 (based on SNR, motion artifacts)
- `roi_stability`: % of frames with stable face tracking
- `lighting_quality`: lux estimation from frame histogram
- **If <70:** Prompt user to re-capture in better conditions

### 4.4 Fitzpatrick-Specific Handling

```typescript
interface PPGCalibrationProfile {
  fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6;
  amplificationGain: number;      // 1.0 - 2.0
  noiseFloorThreshold: number;      // dynamic based on skin tone
  uncertaintyFlags: {
    heartRate: 'low' | 'moderate' | 'high';
    spO2: 'low' | 'moderate' | 'high';
    bloodPressure: 'low' | 'moderate' | 'high';
  };
  recommendedCaptureDuration: number; // 30s for I-IV, 60s for V-VI
  showConfidenceIntervals: boolean;   // true for V-VI
}

const DEFAULT_PROFILES: Record<number, PPGCalibrationProfile> = {
  1: { amplificationGain: 1.0, noiseFloorThreshold: 0.05, uncertaintyFlags: { heartRate: 'low', spO2: 'low', bloodPressure: 'low' }, recommendedCaptureDuration: 30, showConfidenceIntervals: false },
  2: { amplificationGain: 1.0, noiseFloorThreshold: 0.06, uncertaintyFlags: { heartRate: 'low', spO2: 'low', bloodPressure: 'low' }, recommendedCaptureDuration: 30, showConfidenceIntervals: false },
  3: { amplificationGain: 1.2, noiseFloorThreshold: 0.08, uncertaintyFlags: { heartRate: 'low', spO2: 'moderate', bloodPressure: 'low' }, recommendedCaptureDuration: 30, showConfidenceIntervals: false },
  4: { amplificationGain: 1.3, noiseFloorThreshold: 0.10, uncertaintyFlags: { heartRate: 'moderate', spO2: 'moderate', bloodPressure: 'moderate' }, recommendedCaptureDuration: 45, showConfidenceIntervals: false },
  5: { amplificationGain: 1.6, noiseFloorThreshold: 0.15, uncertaintyFlags: { heartRate: 'moderate', spO2: 'high', bloodPressure: 'high' }, recommendedCaptureDuration: 60, showConfidenceIntervals: true },
  6: { amplificationGain: 1.8, noiseFloorThreshold: 0.20, uncertaintyFlags: { heartRate: 'high', spO2: 'high', bloodPressure: 'high' }, recommendedCaptureDuration: 60, showConfidenceIntervals: true },
};
```

---

## 5. Mobile App Architecture

### 5.1 Module Breakdown (React Native / Expo)

```
src/
├── app/
│   ├── (tabs)/                    # Bottom navigation
│   │   ├── scan/                  # Main scan flow
│   │   ├── skin-age/              # Skin Age Estimator
│   │   ├── track/                 # Progress tracking
│   │   └── profile/               # User settings
│   ├── api/                       # API route handlers (Next.js style)
│   └── layout.tsx                 # Root layout
│
├── core/                          # Shared business logic
│   ├── ml/                        # Machine learning
│   │   ├── vit/                   # ViT model wrapper
│   │   ├── ppg/                   # PPG signal processing
│   │   └── gemma/                 # On-device LLM (future)
│   ├── recommendations/           # Rule-based engine
│   ├── db/                        # Local SQLite (offline)
│   └── network/                   # API clients
│
├── components/
│   ├── scan-flow/                 # Camera, preview, analysis
│   ├── ppg-capture/               # Video capture UI
│   ├── results/                   # Result cards, zone maps
│   └── ui/                        # Design system
│
├── hooks/
│   ├── useScan.ts                 # Full scan orchestration
│   ├── usePPG.ts                  # PPG capture & processing
│   └── useAuth.ts                 # Supabase auth
│
├── stores/
│   ├── scanStore.ts               # Zustand: scan state
│   ├── userStore.ts               # Zustand: user profile
│   └── ppgStore.ts                # Zustand: biomarker data
│
├── assets/
│   ├── models/                    # TFLite models (git-lfs)
│   │   ├── vit_skin_classifier.tflite
│   │   ├── ppg_face_mesh.tflite
│   │   ├── ppg_hr_estimator.tflite
│   │   └── ppg_spo2_estimator.tflite
│   └── calibration/               # Per-device calibration data
│
└── constants/
    ├── conditions.ts              # 31 condition definitions
    ├── ingredients.ts             # 103 ingredient profiles
    └── ppgProfiles.ts             # Fitzpatrick calibration profiles
```

### 5.2 What Runs Where

| Feature | Free Tier | Paid Tier | Runs On |
|---------|-----------|-----------|---------|
| Photo capture | ✅ | ✅ | Device camera |
| ViT classification | ✅ | ✅ | Device (TFLite) |
| Rule-based recommendations | ✅ | ✅ | Device (SQLite + logic) |
| Basic results display | ✅ | ✅ | Device |
| Skin Age Estimator | ✅ | ✅ | Device (deterministic) / Cloud (GPT-4o) |
| PPG signal extraction | ✅ | ✅ | Device (TFLite) |
| PPG basic vitals | ✅ | ✅ | Device |
| Multi-zone analysis | ❌ | ✅ | Cloud (Gemini) |
| Severity grading | ❌ | ✅ | Cloud (Gemini) |
| Root cause reasoning | ❌ | ✅ | Cloud (Gemini) |
| Product DB lookup | Cached | Live | Device / Cloud |
| Progress tracking | Local | Cloud-synced | Device + Supabase |
| Shareable reports | ❌ | ✅ | Cloud-rendered |

### 5.3 Performance Budget

| Asset | Size | Strategy |
|-------|------|----------|
| App shell + JS bundle | ~15MB | Hermes bytecode, code splitting |
| ViT model | ~85MB | Core bundle, load on first launch |
| PPG models | ~15MB | Core bundle |
| Gemma 2B (future) | ~1.5GB | **Optional download**, on-demand |
| Product images | ~50MB | Lazy loaded, CDN |
| **Total initial** | **~115MB** | **Well under 200MB** |
| **Total with Gemma** | **~1.6GB** | **Optional, WiFi-only download** |

---

## 6. API Design

### 6.1 Endpoints

```
Base URL: https://api.skingenius.co/v2
Auth: Bearer <JWT> (Supabase GoTrue)
```

#### Authentication
```http
POST /auth/register
Body: { email, password, fitzpatrick_type, skin_type }
→ { user, session }

POST /auth/login
Body: { email, password }
→ { user, session }

POST /auth/refresh
Headers: Authorization: Bearer <refresh_token>
→ { session }
```

#### Scan Flow
```http
POST /scan/analyze          # Paid tier only
Content-Type: multipart/form-data
Body:
  - image: File (JPEG/PNG, max 4MB)
  - vit_results: JSON { condition, confidence, secondary_conditions }
  - ppg_data: JSON { heart_rate, spO2, stress_index } [optional]
  - user_profile: JSON { age, skin_type, fitzpatrick }
→ 202 Accepted
  { scan_id, status: "processing", estimated_seconds: 8 }

GET /scan/{scan_id}/status
→ { scan_id, status: "complete|processing|failed", result?: ScanResult }

GET /scan/{scan_id}/result
→ ScanResult (see schema below)

POST /scan/feedback
Body: { scan_id, rating: 1-5, feedback_text? }
→ { success: true }
```

#### PPG Data Sync
```http
POST /ppg/session
Body: { session_id, biomarkers: PPGResults, calibration_profile }
→ { stored: true, anomalies_detected?: boolean }

GET /ppg/history?limit=30
→ { sessions: PPGSession[] }

GET /ppg/trends?days=30
→ { heart_rate_trend, stress_trend, correlation_with_skin }
```

#### Products & Recommendations
```http
GET /products?condition=acne_vulgaris&skin_type=oily&page=1
→ { products: Product[], total, page }

GET /products/{product_id}
→ Product (with ingredients, reviews, evidence)

GET /ingredients/{inci_name}
→ Ingredient (with mechanism, evidence_score, contraindications)

POST /recommendations
Body: { conditions: string[], skin_type, fitzpatrick, concerns }
→ { ingredients: Ingredient[], products: Product[], routine: RoutineStep[] }
```

#### User Profile
```http
GET /user/profile
→ UserProfile

PATCH /user/profile
Body: Partial<UserProfile>
→ UserProfile

GET /user/scans?limit=10&offset=0
→ { scans: ScanSummary[] }

GET /user/progress
→ { skin_score_history, condition_improvement, adherence_rate }
```

### 6.2 Data Schemas

```typescript
// Scan Result (Paid Tier)
interface ScanResult {
  id: string;
  created_at: string;
  user_id: string;
  tier: 'free' | 'paid';
  
  // ViT Results (both tiers)
  vit_analysis: {
    primary_condition: Condition;
    confidence: number;
    secondary_conditions: Condition[];
    fitzpatrick_detected: number;
  };
  
  // Multi-zone Analysis (paid only)
  zone_analysis?: {
    zones: FaceZone[];
    overall_severity: 'mild' | 'moderate' | 'severe';
  };
  
  // PPG Data (if captured)
  ppg_data?: {
    heart_rate: number;          // bpm
    heart_rate_variability: number; // ms (SDNN)
    spO2: number;                // %
    respiratory_rate: number;    // breaths/min
    blood_pressure_estimate?: { systolic: number; diastolic: number };
    stress_index: 'low' | 'moderate' | 'high';
    signal_quality: number;      // 0-100
    calibration_applied: boolean;
  };
  
  // Gemini Analysis (paid only)
  ai_analysis?: {
    root_causes: RootCause[];
    lifestyle_factors: LifestyleFactor[];
    product_recommendations: ProductRec[];
    routine_suggestion: RoutineStep[];
    expected_timeline: string;    // e.g., "6-8 weeks for visible improvement"
  };
  
  // Free tier recommendations
  rule_based_recommendations?: {
    key_ingredients: Ingredient[];
    products: Product[];
    avoid_ingredients: Ingredient[];
  };
  
  // Metadata
  disclaimer: string;           // "This is not medical advice..."
  image_url?: string;           // Stored scan image (encrypted)
}

interface FaceZone {
  name: 'forehead' | 'left_cheek' | 'right_cheek' | 'under_eye_left' | 
        'under_eye_right' | 'nose' | 'chin' | 'jawline';
  severity: 'clear' | 'mild' | 'moderate' | 'severe';
  features: string[];           // e.g., ["comedones", "erythema", "post_inflammatory_hyperpigmentation"]
  confidence: number;
}

interface PPGSession {
  id: string;
  recorded_at: string;
  duration_seconds: number;
  biomarkers: {
    heart_rate: number;
    spO2: number;
    respiratory_rate: number;
    stress_index: string;
  };
  signal_quality: number;
  calibration_profile_id: string;
}
```

### 6.3 Rate Limiting

| Endpoint | Free Tier | Paid Tier (Basic) | Paid Tier (Pro) |
|----------|-----------|-------------------|-----------------|
| `/scan/analyze` | 3/month | 30/month | Unlimited |
| `/scan/{id}/result` | 100/day | 500/day | 2000/day |
| `/ppg/session` | 10/day | 100/day | 500/day |
| `/products/*` | 100/day | 500/day | 2000/day |
| `/auth/*` | 10/min | 30/min | 60/min |

**Implementation:** Redis + sliding window, headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### 6.4 Security

- **Authentication:** Supabase GoTrue JWT (RS256), 1-hour access token, 7-day refresh token
- **Authorization:** Row-Level Security (RLS) on all tables — users can only read their own scans
- **Image Storage:** Encrypted at rest (AES-256), URLs are signed + expire in 1 hour
- **API Keys:** Gemini API key stored in Supabase Edge Function env (never client-side)
- **PPG Data:** HIPAA-adjacent handling — de-identified for research, encrypted for storage
- **CORS:** Strict origin whitelist (`skingenius.co`, `*.skingenius.co`, `localhost:3000` for dev)

---

## 7. Database Schema Additions

### 7.1 New Tables (Supabase PostgreSQL)

```sql
-- ============================================
-- PPG BIOMARKER SESSIONS
-- ============================================
create table ppg_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  scan_id uuid references scans(id) on delete set null,
  
  -- Timing
  recorded_at timestamptz default now(),
  duration_seconds integer not null check (duration_seconds between 10 and 120),
  
  -- Raw biomarkers
  heart_rate integer check (heart_rate between 30 and 220),
  heart_rate_variability integer, -- SDNN in ms
  spO2 integer check (spO2 between 70 and 100),
  respiratory_rate integer check (respiratory_rate between 5 and 40),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  stress_index text check (stress_index in ('low', 'moderate', 'high')),
  
  -- Quality & calibration
  signal_quality integer not null check (signal_quality between 0 and 100),
  calibration_profile_id uuid references ppg_calibration_profiles(id),
  fitzpatrick_type integer not null check (fitzpatrick_type between 1 and 6),
  
  -- Metadata
  device_info jsonb,            -- { model, os_version, camera_specs }
  environmental_conditions jsonb, -- { lux_estimate, temperature? }
  
  -- RLS
  constraint ppg_sessions_user_id_fkey foreign key (user_id) references auth.users(id)
);

-- Enable RLS
alter table ppg_sessions enable row level security;
create policy "Users can only access their own PPG sessions"
  on ppg_sessions for all
  using (auth.uid() = user_id);

-- ============================================
-- PPG CALIBRATION PROFILES
-- ============================================
create table ppg_calibration_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Calibration data
  fitzpatrick_type integer not null check (fitzpatrick_type between 1 and 6),
  amplification_gain numeric(3,2) not null default 1.0,
  noise_floor_threshold numeric(4,3) not null default 0.05,
  
  -- External validation
  external_device_brand text,
  external_device_model text,
  reference_heart_rate integer,
  reference_bp_systolic integer,
  reference_bp_diastolic integer,
  
  -- Versioning
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  is_active boolean default true,
  
  constraint ppg_calibration_profiles_user_id_fkey foreign key (user_id) references auth.users(id)
);

alter table ppg_calibration_profiles enable row level security;
create policy "Users can only access their own calibration profiles"
  on ppg_calibration_profiles for all
  using (auth.uid() = user_id);

-- ============================================
-- SCAN RESULTS (ENHANCED FOR v2)
-- ============================================
-- Note: Extends existing scans table

-- Add columns to existing scans table
alter table scans 
  add column if not exists tier text check (tier in ('free', 'paid')) default 'free',
  add column if not exists ppg_session_id uuid references ppg_sessions(id),
  add column if not exists zone_analysis jsonb,
  add column if not exists ai_analysis jsonb,
  add column if not exists root_causes jsonb,
  add column if not exists lifestyle_factors jsonb,
  add column if not exists routine_suggestion jsonb,
  add column if not exists expected_timeline text,
  add column if not exists disclaimer text default 'This analysis is for informational purposes only and does not constitute medical advice. Consult a dermatologist for diagnosis and treatment.',
  add column if not exists feedback_rating integer check (feedback_rating between 1 and 5),
  add column if not exists feedback_text text;

-- Index for analytics
 create index idx_scans_tier on scans(tier);
 create index idx_scans_ppg_session on scans(ppg_session_id);
 create index idx_ppg_sessions_user_recorded on ppg_sessions(user_id, recorded_at desc);

-- ============================================
-- USER SUBSCRIPTIONS & QUOTAS
-- ============================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  tier text not null check (tier in ('free', 'basic', 'pro', 'professional')),
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  
  -- Quota tracking
  scans_used_this_month integer default 0,
  scans_limit integer not null,
  ppg_sessions_used_this_month integer default 0,
  ppg_sessions_limit integer not null,
  
  -- Billing
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint subscriptions_user_id_fkey foreign key (user_id) references auth.users(id)
);

alter table subscriptions enable row level security;
create policy "Users can only access their own subscription"
  on subscriptions for all
  using (auth.uid() = user_id);

-- ============================================
-- PRODUCT RECOMMENDATION LOG
-- ============================================
create table recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  recommended_products uuid[],      -- Array of product IDs
  recommended_ingredients text[],   -- Array of INCI names
  user_clicked_product_id uuid references products(id),
  user_purchased boolean default false,
  
  created_at timestamptz default now(),
  
  constraint recommendation_logs_user_id_fkey foreign key (user_id) references auth.users(id)
);

-- Analytics index
 create index idx_recommendation_logs_scan on recommendation_logs(scan_id);
 create index idx_recommendation_logs_user_created on recommendation_logs(user_id, created_at desc);

-- ============================================
-- PPG RESEARCH CONSENT (GDPR/CCPA)
-- ============================================
create table research_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Consent flags
  allow_anonymized_research boolean default false,
  allow_ppg_data_research boolean default false,
  allow_image_research boolean default false,
  
  -- Consent record
  consent_version text not null,
  consented_at timestamptz default now(),
  ip_address inet,
  user_agent text,
  
  -- Withdrawal
  withdrawn_at timestamptz,
  
  constraint research_consents_user_id_fkey foreign key (user_id) references auth.users(id)
);

alter table research_consents enable row level security;
create policy "Users can only access their own consent records"
  on research_consents for all
  using (auth.uid() = user_id);
```

### 7.2 Edge Functions (Supabase)

```typescript
// functions/analyze-scan/index.ts
// Triggered by POST /scan/analyze
// Flow:
// 1. Validate JWT + subscription tier
// 2. Check rate limit (Redis)
// 3. Upload image to encrypted storage
// 4. Call Gemini 2.5 Flash with structured prompt
// 5. Parse JSON response
// 6. Query Supabase for product recommendations (RAG-style)
// 7. Store result in scans table
// 8. Return 202 + scan_id

// functions/process-ppg/index.ts
// Triggered by POST /ppg/session
// Flow:
// 1. Validate JWT
// 2. Store biomarker data
// 3. Run anomaly detection (if HR > 120 or < 50, flag for review)
// 4. Update user's trend data
// 5. If linked to scan, correlate with skin analysis

// functions/generate-report/index.ts
// Triggered by GET /scan/{id}/report
// Flow:
// 1. Fetch scan + PPG + recommendations
// 2. Generate PDF (using PDFKit or external service)
// 3. Upload to signed URL
// 4. Return URL (expires in 1 hour)
```

---

## 8. Phased Implementation Plan

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Free tier MVP with on-device ViT + basic PPG

| Week | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 1 | Set up React Native project structure | Mobile Dev | Repo + navigation |
| 1 | Integrate TFLite runtime (React Native) | Mobile Dev | `tflite-react-native` working |
| 2 | Port ViT model to TFLite (if not already) | ML Eng | `vit_skin_classifier.tflite` |
| 2 | Build camera capture component | Mobile Dev | Photo + video capture |
| 3 | Implement rule-based recommendation engine | Backend | Ingredient→condition mapping |
| 3 | Build free-tier results screen | Mobile Dev | Basic UI with ingredients |
| 4 | Integrate PPG face detection (MediaPipe) | ML Eng | Face mesh ROI extraction |
| 4 | **Phase 1 QA + Beta test** | QA | 5 users, all Fitzpatrick types |

**Exit Criteria:**
- Free tier scan works end-to-end on Android 8+ and iPhone 8+
- PPG captures 30s video and extracts heart rate
- App bundle <120MB (ViT + PPG only)

### Phase 2: Cloud Intelligence (Weeks 5-8)
**Goal:** Paid tier with Gemini 2.5 Flash integration

| Week | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 5 | Set up Gemini API access (Vertex AI) | Backend | API key + rate limits configured |
| 5 | Build `/scan/analyze` endpoint | Backend | 202 + async processing |
| 6 | Implement Gemini prompt + JSON schema | ML Eng | Structured output pipeline |
| 6 | Build multi-zone face map UI | Mobile Dev | Interactive zone breakdown |
| 7 | Integrate Supabase RAG for products | Backend | Product lookup in prompt context |
| 7 | Build paid results screen (rich) | Mobile Dev | Severity heatmap, root cause tree |
| 8 | Subscription tier gating (Stripe) | Backend | Free / Basic / Pro tiers |
| 8 | **Phase 2 QA + A/B test** | QA | 20 users, conversion tracking |

**Exit Criteria:**
- Paid scan completes in <10s (p95)
- Multi-zone accuracy >80% (vs. dermatologist labels on 50 images)
- Conversion free→paid >5% on first scan

### Phase 3: PPG Maturity (Weeks 9-12)
**Goal:** Full PPG biomarker suite with skin tone calibration

| Week | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 9 | Build SpO2 estimation model | ML Eng | TFLite model + validation |
| 9 | Implement respiratory rate extraction | ML Eng | Envelope detection algorithm |
| 10 | Build blood pressure estimation (PTT) | ML Eng | Calibrated model |
| 10 | Stress index (HRV frequency analysis) | ML Eng | LF/HF ratio computation |
| 11 | Fitzpatrick calibration profiles | ML Eng | Per-type accuracy validation |
| 11 | PPG-Skin correlation insights | Product | "Stress may be contributing to breakouts" |
| 12 | PPG trends + history UI | Mobile Dev | Charts, week/month views |
| 12 | **Phase 3 QA + Clinical validation** | QA | 100 users, accuracy report |

**Exit Criteria:**
- PPG accuracy: HR ±3bpm, SpO2 ±3% (Fitzpatrick I-IV)
- Calibration flow works for all 6 Fitzpatrick types
- Users with >3 scans show engagement increase

### Phase 4: Scale & Polish (Weeks 13-16)
**Goal:** Production readiness, performance, virality

| Week | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 13 | App bundle optimization (<200MB) | Mobile Dev | App thinning, model compression |
| 13 | Background model updates | Mobile Dev | OTA model download |
| 14 | Shareable reports (PDF/image) | Mobile Dev | Instagram/TikTok share cards |
| 14 | Professional tier (estheticians) | Product | Multi-client dashboard |
| 15 | Analytics + funnel optimization | Growth | Amplitude/Mixpanel integration |
| 15 | Performance monitoring (Sentry) | Backend | Crash-free rate >99.9% |
| 16 | Security audit (VibeSec) | Security | Pen test report, fixes |
| 16 | **Production launch** | All | App store submission |

**Exit Criteria:**
- App approved on iOS App Store + Google Play
- Crash-free rate >99.5%
- DAU/MAU >20% (engagement)

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **PPG accuracy poor on Fitzpatrick V-VI** | High | High | Aggressive calibration, uncertainty flags, set expectations as "estimate" not medical measurement |
| **Gemini API latency >10s** | Medium | Medium | Async processing + push notification; fallback to cached generic analysis |
| **App bundle >200MB** | Medium | High | Model compression (INT8, pruning), optional Gemma download, App Thinning |
| **Regulatory scrutiny (FDA/CE)** | Medium | Critical | Strict non-medical positioning, disclaimers, no diagnostic language, legal review |
| **Privacy concerns (photo storage)** | Medium | High | End-to-end encryption, RLS, auto-delete after 30 days, consent flow |
| **iPhone 8 / Android 8 performance** | Medium | Medium | Graceful degradation (skip PPG on very old devices, cloud-only for complex analysis) |
| **OpenAI/Gemini API price increase** | Low | Medium | Cache common patterns, hybrid approach (Gemma for simple cases), cost monitoring alerts |
| **Competitor launches similar feature** | Medium | Medium | Speed to market (16-week plan), PPG moat, Fitzpatrick focus differentiation |
| **PPG signal quality in poor lighting** | High | Medium | Real-time quality feedback during capture, auto-reject low-quality sessions |
| **User calibration fatigue** | Medium | Medium | Optional calibration (still works uncalibrated with wider error bars), 30-day re-cal reminder |

---

## 10. Open Questions for the Team

### Technical
1. **PPG Ground Truth:** Do we have access to clinical-grade pulse oximeters / BP cuffs for validation? Can we partner with Basys Health for this?
2. **ViT TFLite:** Is the current ViT model already converted to TFLite INT8? If not, what's the timeline for quantization?
3. **Gemma 2B:** Do we proceed with on-device Gemma for free tier reasoning, or stick with rule-based? Gemma adds ~1.5GB optional download.
4. **Camera specs:** Do we require dual-LED flash for SpO2 ratio-of-ratios? Most phones have single LED — our SpO2 model must work with single-channel.
5. **NPU delegates:** Should we prioritize Android NNAPI or Apple CoreML for GPU/NPU acceleration? What's the device coverage?

### Product
6. **PPG Positioning:** Is PPG a core feature or "Labs"-style experimental feature? This affects UI prominence and user expectations.
7. **Pricing:** What are the exact tier prices? Free / $4.99/mo Basic / $12.99/mo Pro / $49/mo Professional?
8. **Scan frequency:** How often should free users scan? Unlimited free scans with limited results, or limited scans?
9. **Data retention:** How long do we store scan images? 30 days? 90 days? User-deletable anytime?
10. **Professional tier:** What's the scope for estheticians/dermatologists? Multi-client? White-label?

### Business
11. **Basys Health integration:** Timeline for biomarker data sharing? API specs? Revenue share?
12. **Clinical validation:** Do we need IRB approval for PPG accuracy studies? What's the budget?
13. **Regulatory:** Have we engaged a regulatory consultant for FDA "general wellness" vs. "medical device" classification?
14. **Gemini API:** Is the API key obtained? What's the approved budget for inference costs?
15. **Competitive landscape:** Have we analyzed similar apps (Neutrogena Skin360, YouCam, Perfect Corp)? What's our defensibility?

### Design
16. **PPG capture UX:** How do we guide users to hold still for 30-60s? Gamification? Progress bar? Breathing guide?
17. **Results visualization:** How do we display "estimated" vs. "measured" biomarkers without losing credibility?
18. **Fitzpatrick V-VI messaging:** How do we communicate reduced PPG accuracy without alienating users?
19. **Dark mode:** Is the app dark-mode first? PPG capture requires bright screen — potential conflict.
20. **Accessibility:** VoiceOver/TalkBack support for all scan flows?

---

## Appendix A: PPG Research References

1. **Wroclaw University of Science and Technology** (2023). "Remote Photoplethysmography for Cardiovascular Monitoring: A Review." *Biomedical Signal Processing and Control*.
2. **UCSF Tison Lab** (2022). "Smartphone-Based Blood Pressure Estimation Using Facial Video and Deep Learning." *NPJ Digital Medicine*.
3. **MIT Media Lab** (2021). "Multi-Wavelength Photoplethysmography for Skin-Tone-Invariant Oxygen Saturation Estimation." *ACM IMWUT*.
4. **Google Research** (2020). "Digital Skin Tone Annotation for ML Fairness." *Fitzpatrick 17k dataset paper*.
5. **IEEE** (2019). "Motion Artifact Reduction in rPPG Using PCA-Based Method." *IEEE Transactions on Biomedical Engineering*.

## Appendix B: Model Specifications

| Model | Format | Size | Input | Output | Latency |
|-------|--------|------|-------|--------|---------|
| ViT Skin Classifier | TFLite INT8 | 85MB | 224x224 RGB | 31 logits | 200ms |
| PPG Face Mesh | TFLite FP16 | 8MB | 480p video | 468 landmarks | 30fps |
| PPG HR Estimator | TFLite INT8 | 2MB | 900-sample waveform | HR (bpm) | 50ms |
| PPG SpO2 Estimator | TFLite INT8 | 1MB | Dual-channel PPG | SpO2 (%) | 30ms |
| PPG BP Estimator | TFLite INT8 | 1MB | Waveform + calibration | SBP/DBP | 40ms |
| Gemma 2B (future) | TFLite/Mediapipe | 1.5GB | Text | Text | 2s/token |

## Appendix C: Cost Model

| Component | Unit | Cost | Monthly (1K users) | Monthly (10K users) |
|-----------|------|------|-------------------|---------------------|
| Gemini 2.5 Flash | Per scan | $0.001 | $10 (1K scans) | $100 (10K scans) |
| Supabase (DB + Auth) | Flat | $25/mo | $25 | $25 |
| Supabase Storage | Per GB | $0.021/GB | $5 (~250GB) | $50 (~2.5TB) |
| Supabase Edge Functions | Per invoke | $2/million | $2 | $20 |
| Vercel (Web app) | Flat | $20/mo | $20 | $20 |
| **Total** | | | **~$62** | **~$215** |

---

*Document end. Next step: Team review + Phase 1 kickoff.*
