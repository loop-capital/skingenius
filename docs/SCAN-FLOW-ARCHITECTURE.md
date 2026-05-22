# SKINgenius Scan Flow — Architecture & Integration Guide

> **Date:** 2026-05-15
> **Status:** Design complete, ready for implementation
> **Design team:** Handles UI/styling. **Our team:** Handles workflow, state machine, and API pipeline.

---

## Workflow State Machine

```
┌─────────────┐
│  WELCOME     │  (existing WelcomeScreen)
└──────┬──────┘
       │ "Make a face scan"
       ▼
┌─────────────┐
│  PERMISSION  │  Camera permission request (soft ask → system ask)
└──────┬──────┘
       │ Granted
       ▼
┌─────────────┐
│  INSTRUCTIONS│  3-step bottom sheet: remove glasses → position head → rotate head
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│  SCAN_LIVE   │  Camera with oval mask, lighting check, head rotation progress
└──────┬──────┘
       │ Capture complete
       ▼
┌─────────────┐
│  PRIVACY     │  Bottom sheet: "Photos analyzed by AI, deleted within 24h"
└──────┬──────┘
       │ "Allow"
       ▼
┌─────────────┐
│  PROCESSING  │  3-phase progress: Quality Check → Classification → Root Causes
└──────┬──────┘
       │ Complete
       ▼
┌─────────────┐
│  RESULTS     │  Concern filter pills + zone-based analysis cards
└──────┬──────┘
       │ Select concern / "Next"
       ▼
┌─────────────┐
│  ROOT_CAUSES │  Surface → Internal health connections + 4-tier recommendations
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DASHBOARD   │  (existing DashboardHome)
└─────────────┘
```

### Alternative Path: Photo Upload

```
WELCOME → PERMISSION (gallery) → REVIEW (zoom/pan) → CALIBRATION (Fitzpatrick) → PRIVACY → PROCESSING → RESULTS → ROOT_CAUSES → DASHBOARD
```

Users who don't want to do a live scan can upload from gallery. Same pipeline after calibration.

---

## Scan Flow State Types

```typescript
// src/types/scan.ts

export type ScanStep =
  | 'welcome'        // Existing WelcomeScreen
  | 'permission'     // Camera + gallery permission request
  | 'instructions'   // 3-step scan instructions bottom sheet
  | 'scan_live'      // Live camera with oval mask + head rotation
  | 'scan_review'    // Review captured photo (zoom/pan)
  | 'calibration'    // Fitzpatrick skin tone selection
  | 'privacy'        // Privacy consent for AI processing
  | 'processing'     // 3-phase processing pipeline
  | 'results'        // Concern filter pills + zone analysis
  | 'root_causes'    // Surface → internal health connections
  | 'complete';      // Redirect to dashboard

export type ProcessingPhase =
  | 'quality_check'    // Tier 0: EXIF strip + Tier 1: Kimi quality gate
  | 'classification'   // Tier 2: MiMo Omni condition classification
  | 'root_causes';     // Knowledge graph lookup + recommendation generation

export interface ScanState {
  step: ScanStep;
  // Captured data
  capturedImageData: string | null;       // base64 JPEG
  uploadedImageUri: string | null;        // gallery upload URI
  // Calibration
  skinTone: FitzpatrickType | null;
  skinToneAutoDetected: boolean;
  // Quality (from Tier 1 Kimi)
  qualityScore: number;                   // 0-100
  lightingQuality: 'excellent' | 'good' | 'poor' | 'unusable';
  qualityWarnings: string[];
  // Face detection (client-side)
  faceDetected: boolean;
  faceCentered: boolean;
  eyesVisible: boolean;
  // Processing
  processingPhase: ProcessingPhase | null;
  processingProgress: number;             // 0-100 per phase
  // Results (from Tier 2 MiMo)
  analysisId: string | null;
  conditions: ConditionResult[];
  skinZones: ZoneAnalysis[];
  // Privacy
  privacyConsented: boolean;
  // Errors
  error: string | null;
}

export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

export interface ConditionResult {
  name: string;                           // e.g., "Acne", "Rosacea", "Hyperpigmentation"
  confidence: number;                      // 0-1
  severity: 'mild' | 'moderate' | 'severe';
  features: string[];                      // e.g., ["nodular", "cystic", "scarring"]
  zone: string;                           // e.g., "T-Zone", "Cheeks", "Forehead"
}

export interface ZoneAnalysis {
  zone: string;                           // "T-Zone", "Cheeks", "Forehead", "Chin", "Nose"
  thumbnailCrop: { x: number; y: number; width: number; height: number };
  primaryConcern: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface RootCauseResult {
  condition: string;
  rootCauses: {
    cause: string;                        // e.g., "Gut dysbiosis", "Insulin resistance"
    evidence: 'strong' | 'moderate' | 'emerging';
    tier: 'product' | 'supplement' | 'practitioner' | 'basys_health';
    recommendations: string[];
  }[];
}
```

---

## API Pipeline Routes

### POST `/api/analysis/upload`
Receives captured image, runs Tier 0 + Tier 1.

```typescript
// Request
{
  image: string;              // base64 JPEG
  skinTone: FitzpatrickType;  // from calibration
  captureMethod: 'camera' | 'gallery';
}

// Response (Tier 0 + Tier 1 result)
{
  uploadId: string;
  qualityScore: number;       // 0-100
  lightingQuality: 'excellent' | 'good' | 'poor' | 'unusable';
  warnings: string[];
  faceDetected: boolean;
  faceCentered: boolean;
  eyesVisible: boolean;
  // If quality < 50, include rejection reason + suggestion
  rejected?: {
    reason: string;
    suggestion: string;       // e.g., "Move to a brighter area and retake"
  };
}
```

**Implementation:**
```typescript
// src/app/api/analysis/upload/route.ts

export async function POST(request: Request) {
  const { image, skinTone, captureMethod } = await request.json();
  
  // Tier 0: EXIF strip (server-side)
  const cleanImage = stripExif(image);
  
  // Tier 1: Kimi K2.6 quality gate
  const qualityResult = await checkImageQuality(cleanImage);
  
  if (qualityResult.qualityScore < 50) {
    return Response.json({
      uploadId: generateId(),
      ...qualityResult,
      rejected: {
        reason: qualityResult.lightingQuality === 'poor' 
          ? 'Lighting is insufficient for accurate analysis' 
          : 'No face detected or image is blurry',
        suggestion: qualityResult.lightingQuality === 'poor'
          ? 'Move to a well-lit area with even, natural lighting'
          : 'Position your face clearly in the frame and hold steady',
      },
    });
  }
  
  // Store in Supabase Storage for Tier 2 processing
  const uploadId = generateId();
  await storeImage(uploadId, cleanImage, skinTone);
  
  return Response.json({
    uploadId,
    ...qualityResult,
  });
}

async function checkImageQuality(imageBase64: string) {
  const response = await fetch('https://api.kimi.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'kimi-k2.6',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: 'text', text: QUALITY_CHECK_PROMPT }
        ]
      }],
    }),
  });
  // Parse structured response
  return parseQualityResponse(await response.json());
}

const QUALITY_CHECK_PROMPT = `You are a skin photo quality checker for a dermatology AI. Assess this photo on:
1. Is a face clearly visible? (face_detected: boolean)
2. Is the face centered in frame? (face_centered: boolean)
3. Are eyes visible and open? (eyes_visible: boolean)
4. Lighting quality: excellent/good/poor/unusable
5. Is the image blurry? (is_blurry: boolean)
6. Is this actually a photo of skin/face, not food/pet/object? (is_skin_photo: boolean)

Respond in JSON format:
{"face_detected": bool, "face_centered": bool, "eyes_visible": bool, "lighting_quality": "excellent"|"good"|"poor"|"unusable", "is_blurry": bool, "is_skin_photo": bool, "quality_score": 0-100, "warnings": ["warning1", ...], "suggestion": "improvement tip or null"}`;
```

### POST `/api/analysis/classify`
Runs Tier 2 (and Tier 3 if needed).

```typescript
// Request
{
  uploadId: string;
  skinTone: FitzpatrickType;
}

// Response
{
  analysisId: string;
  conditions: ConditionResult[];
  skinZones: ZoneAnalysis[];
  confidence: number;        // average confidence across conditions
  tier: 'tier2' | 'tier3';   // which model produced results
  // If any condition < 70% confidence, flag for Tier 3
  needsPremiumReview?: boolean;
}
```

**Implementation:**
```typescript
// src/app/api/analysis/classify/route.ts

export async function POST(request: Request) {
  const { uploadId, skinTone } = await request.json();
  
  // Retrieve stored image
  const imageData = await retrieveImage(uploadId);
  
  // Tier 2: MiMo Omni classification
  const classification = await classifyWithMiMo(imageData, skinTone);
  
  // Check if any condition needs Tier 3 review
  const needsPremium = classification.conditions.some(c => c.confidence < 0.70);
  
  if (needsPremium) {
    // Tier 3: Premium fallback (GPT-4V or Claude Vision)
    const premiumResult = await classifyWithPremium(imageData, skinTone, classification);
    return Response.json({
      ...premiumResult,
      tier: 'tier3',
    });
  }
  
  return Response.json({
    analysisId: generateId(),
    ...classification,
    tier: 'tier2',
    needsPremiumReview: false,
  });
}

const CLASSIFICATION_PROMPT = `You are a dermatological AI analyzing a skin photo. The user has Fitzpatrick Skin Type {skinTone}.

Analyze this photo and identify:
1. Primary skin conditions (acne, rosacea, melasma, eczema, hyperpigmentation, etc.)
2. Severity (mild/moderate/severe) for each
3. Specific features (cystic, comedonal, scarring, erythema, etc.)
4. Facial zone (T-Zone, Cheeks, Forehead, Chin, Nose)
5. Confidence level (0-1) for each finding

Respond in JSON format:
{
  "conditions": [
    {
      "name": "condition name",
      "confidence": 0.0-1.0,
      "severity": "mild"|"moderate"|"severe",
      "features": ["feature1", ...],
      "zone": "zone name"
    }
  ],
  "skin_zones": [
    {
      "zone": "zone name",
      "primary_concern": "concern name",
      "description": "brief description",
      "severity": "mild"|"moderate"|"severe"
    }
  ]
}`;
```

### GET `/api/analysis/:id`
Retrieves full analysis results including root causes.

```typescript
// Response
{
  analysisId: string;
  conditions: ConditionResult[];
  skinZones: ZoneAnalysis[];
  rootCauses: RootCauseResult[];
  recommendations: {
    product: Recommendation[];
    supplement: Recommendation[];
    practitioner: Recommendation[];
    basys_health: Recommendation[];
  };
  createdAt: string;
}
```

---

## Processing Screen Phases

The processing screen shows 3 phases with progress bars (like Lovi.care):

| Phase | Label | What's Happening | Model |
|-------|-------|------------------|-------|
| 1 | "Checking photo quality..." | EXIF strip + Kimi quality gate | Kimi K2.6 (free) |
| 2 | "Analyzing your skin..." | Condition classification | MiMo Omni (or premium) |
| 3 | "Connecting root causes..." | Knowledge graph lookup + recommendations | Supabase query |

Each phase transitions only when the previous completes successfully.

**Phase 1 fails (quality < 50):** Show rejection card with suggestion, "Retake Photo" button.

**Phase 2 low confidence (< 70%):** Silently escalates to Tier 3. User sees no difference.

**Phase 3:** Knowledge graph lookup is deterministic (no model), just Supabase queries.

---

## Component Mapping (Existing → New)

### Existing Components (Keep & Enhance)

| Component | Status | Action |
|-----------|--------|--------|
| `CameraCapture.tsx` | ✅ Exists | **Enhance**: Add oval mask with progress ticks (Lovi pattern), lighting status pill, head rotation guide |
| `PhotoCalibration.tsx` | ✅ Exists | **Keep**: Fitzpatrick selection works well |
| `PhotoReview.tsx` | ✅ Exists | **Keep**: Zoom/pan review is solid |
| `PhotoUpload.tsx` | ✅ Exists | **Keep**: Gallery upload alternative |
| `CameraPermissionRequest.tsx` | ✅ Exists | **Enhance**: Add Lovi-style soft ask before system prompt |
| `WelcomeScreen.tsx` | ✅ Exists | **Enhance**: Already has Kora hero image |

### New Components (Build)

| Component | Purpose | Priority |
|-----------|---------|----------|
| `ScanInstructionsSheet.tsx` | 3-step bottom sheet (Lovi pattern) | P0 |
| `ScanNavigator.tsx` | State machine orchestrator for scan flow | P0 |
| `PrivacyConsentSheet.tsx` | Privacy consent bottom sheet | P0 |
| `ProcessingScreen.tsx` | 3-phase progress with labels | P0 |
| `ResultsFilterScreen.tsx` | Concern filter pills + zone analysis cards | P0 |
| `RootCauseCards.tsx` | Surface → internal health connection cards | P1 |
| `LightingStatusPill.tsx` | Green sun + "OK" / "Move to better lighting" | P1 |
| `HeadRotationGuide.tsx` | Oval mask + dashed progress circle + AR mesh | P1 (needs Expo AR) |

### API Routes (Build)

| Route | Purpose | Priority |
|-------|---------|----------|
| `POST /api/analysis/upload` | EXIF strip + Kimi quality gate | P0 |
| `POST /api/analysis/classify` | MiMo classification + premium fallback | P0 |
| `GET /api/analysis/:id` | Full results with root causes | P0 |
| `DELETE /api/analysis/:id/image` | Delete image after processing (privacy) | P1 |

---

## Privacy Architecture (Critical Differentiator)

**Lovi asks users to opt INTO algorithm training.** We do the opposite.

Our privacy consent says:
> "Your photos are analyzed by AI and automatically deleted within 24 hours. We never use your photos for training, advertising, or sharing. Your skin data is encrypted and only visible to you."

Implementation:
1. **EXIF strip** before any model sees the image (Tier 0)
2. **Auto-delete** raw images from Supabase Storage after 24 hours (cron job)
3. **Store only analysis results** (conditions, zones, root causes) — never the original photo
4. **No training opt-in** — we simply don't train on user data
5. **Encryption at rest** for any temporary image storage

---

## Design Team Handoff

The design team handles:
- Color palette, typography, spacing
- Bottom sheet styling and animations
- Button styles (pill shapes, gradients)
- Dark mode processing screen aesthetic
- Oval mask overlay visual design
- Progress bar styling
- Card layouts for zone analysis results

Our team handles:
- State machine (`ScanNavigator.tsx`)
- API pipeline (`/api/analysis/upload`, `/api/analysis/classify`, `/api/analysis/:id`)
- Image processing (EXIF strip, quality scoring)
- Model integration (Kimi → MiMo → premium)
- Knowledge graph queries for root causes
- Supabase storage and auto-deletion

**Integration point:** The design team provides styled components. We wire them to the state machine and API.

---

*Architecture complete. Ready for implementation sprint.*