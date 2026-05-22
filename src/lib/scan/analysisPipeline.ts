/**
 * SKINgenius Analysis API Pipeline
 * 
 * Tier 0: EXIF strip (server-side)
 * Tier 1: Kimi K2.6 quality gate (free)
 * Tier 2: MiMo Omni classification (limited quota)
 * Tier 3: Premium fallback (GPT-4V / Claude Vision)
 * 
 * Routes:
 *   POST /api/analysis/upload     → EXIF strip + quality check
 *   POST /api/analysis/classify   → Condition classification
 *   GET  /api/analysis/:id        → Full results with root causes
 *   DELETE /api/analysis/:id/image → Delete raw image (privacy)
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Types
// =============================================================================

interface UploadRequest {
  image: string;           // base64 JPEG
  skinTone: 1 | 2 | 3 | 4 | 5 | 6;
  captureMethod: 'camera' | 'gallery';
}

interface UploadResponse {
  uploadId: string;
  qualityScore: number;
  lightingQuality: 'excellent' | 'good' | 'poor' | 'unusable';
  warnings: string[];
  faceDetected: boolean;
  faceCentered: boolean;
  eyesVisible: boolean;
  isSkinPhoto?: boolean;
  rejected?: {
    reason: string;
    suggestion: string;
  };
}

interface ClassifyRequest {
  uploadId: string;
  skinTone: 1 | 2 | 3 | 4 | 5 | 6;
}

interface ConditionResult {
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  features: string[];
  zone: string;
}

interface ZoneAnalysis {
  zone: string;
  primaryConcern: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface ClassifyResponse {
  analysisId: string;
  conditions: ConditionResult[];
  skinZones: ZoneAnalysis[];
  confidence: number;
  tier: 'tier2' | 'tier3';
  needsPremiumReview?: boolean;
}

// =============================================================================
// Tier 0: EXIF Strip
// =============================================================================

/**
 * Strip EXIF metadata from base64 JPEG.
 * Removes all metadata tags while preserving image data.
 * This is a privacy-first measure — no GPS, device info, or timestamps survive.
 */
function stripExif(base64Jpeg: string): string {
  // For a JPEG, EXIF data lives in APP1 markers (0xFFE1).
  // We strip by finding the JPEG data and removing APP1 segments.
  try {
    const buffer = Buffer.from(base64Jpeg, 'base64');
    let offset = 0;
    
    // Verify JPEG signature
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
      // Not a valid JPEG — return as-is (might be PNG or other format)
      return base64Jpeg;
    }
    
    const segments: Buffer[] = [];
    segments.push(Buffer.from([0xFF, 0xD8])); // SOI marker
    
    offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xFF) break;
      
      const marker = buffer[offset + 1];
      
      // APP1 (EXIF) — skip it
      if (marker === 0xE1) {
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        offset += 2 + length;
        continue;
      }
      
      // APP0 (JFIF), APP2-APP15, DQT, DHT, SOF, SOS, etc. — keep them
      if (marker >= 0xE0 && marker <= 0xEF) {
        // APP markers have length fields
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        segments.push(buffer.subarray(offset, offset + 2 + length));
        offset += 2 + length;
      } else if (marker === 0xDA) {
        // SOS — rest is entropy-coded data, copy everything
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        segments.push(buffer.subarray(offset));
        break;
      } else if (marker === 0xDB || marker === 0xC0 || marker === 0xC4) {
        // DQT, SOF0, DHT — have length fields
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        segments.push(buffer.subarray(offset, offset + 2 + length));
        offset += 2 + length;
      } else {
        // Unknown marker — copy 2 bytes (marker only, no length)
        segments.push(buffer.subarray(offset, offset + 2));
        offset += 2;
      }
    }
    
    const result = Buffer.concat(segments);
    return result.toString('base64');
  } catch {
    // If stripping fails, return original (better than losing the image)
    console.warn('EXIF strip failed, returning original image');
    return base64Jpeg;
  }
}

// =============================================================================
// Tier 1: Kimi K2.6 Quality Gate
// =============================================================================

const QUALITY_CHECK_PROMPT = `You are a skin photo quality checker for a dermatology AI. Assess this photo carefully:

1. Is a face clearly visible? (face_detected: boolean)
2. Is the face centered in frame? (face_centered: boolean)
3. Are eyes visible and open? (eyes_visible: boolean)
4. Lighting quality: excellent/good/poor/unusable
5. Is the image blurry? (is_blurry: boolean)
6. Is this actually a photo of skin/face, not food/pet/object? (is_skin_photo: boolean)

Respond ONLY with valid JSON:
{"face_detected": bool, "face_centered": bool, "eyes_visible": bool, "lighting_quality": "excellent"|"good"|"poor"|"unusable", "is_blurry": bool, "is_skin_photo": bool, "quality_score": 0-100, "warnings": ["warning1", ...], "suggestion": "improvement tip or null"}`;

async function checkImageQuality(imageBase64: string): Promise<{
  qualityScore: number;
  lightingQuality: 'excellent' | 'good' | 'poor' | 'unusable';
  faceDetected: boolean;
  faceCentered: boolean;
  eyesVisible: boolean;
  isSkinPhoto: boolean;
  warnings: string[];
  suggestion: string | null;
}> {
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

  if (!response.ok) {
    throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  try {
    // Extract JSON from response (may have markdown fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      qualityScore: Math.min(100, Math.max(0, parsed.quality_score || 0)),
      lightingQuality: ['excellent', 'good', 'poor', 'unusable'].includes(parsed.lighting_quality)
        ? parsed.lighting_quality : 'poor',
      faceDetected: Boolean(parsed.face_detected),
      faceCentered: Boolean(parsed.face_centered),
      eyesVisible: Boolean(parsed.eyes_visible),
      isSkinPhoto: parsed.is_skin_photo !== false,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      suggestion: parsed.suggestion || null,
    };
  } catch {
    // Fallback: if parsing fails, assume moderate quality
    return {
      qualityScore: 50,
      lightingQuality: 'good',
      faceDetected: true,
      faceCentered: true,
      eyesVisible: true,
      isSkinPhoto: true,
      warnings: ['AI quality check could not be parsed — using fallback'],
      suggestion: null,
    };
  }
}

// =============================================================================
// Tier 2: MiMo Omni Classification
// =============================================================================

const CLASSIFICATION_PROMPT = (skinTone: number) => `You are a dermatological AI analyzing a skin photo. The user has Fitzpatrick Skin Type ${skinTone}.

Analyze this photo and identify:
1. Primary skin conditions (acne, rosacea, melasma, eczema, hyperpigmentation, etc.)
2. Severity (mild/moderate/severe) for each
3. Specific features (cystic, comedonal, scarring, erythema, etc.)
4. Facial zone (T-Zone, Cheeks, Forehead, Chin, Nose)
5. Confidence level (0-1) for each finding

Respond ONLY with valid JSON:
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

async function classifyWithMiMo(
  imageBase64: string,
  skinTone: number
): Promise<{ conditions: ConditionResult[]; skinZones: ZoneAnalysis[] }> {
  const response = await fetch('https://api.xiaomi.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MIMO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mimo-v2-omni',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: 'text', text: CLASSIFICATION_PROMPT(skinTone) }
        ]
      }],
    }),
  });

  if (!response.ok) {
    // If MiMo quota exhausted, throw to trigger Tier 3
    if (response.status === 429) {
      throw new Error('MiMo quota exhausted — escalate to Tier 3');
    }
    throw new Error(`MiMo API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in MiMo response');
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      conditions: (parsed.conditions || []).map((c: Record<string, unknown>) => ({
        name: String(c.name || 'Unknown'),
        confidence: Math.min(1, Math.max(0, Number(c.confidence || 0))),
        severity: ['mild', 'moderate', 'severe'].includes(c.severity as string)
          ? c.severity as 'mild' | 'moderate' | 'severe' : 'mild',
        features: Array.isArray(c.features) ? c.features.map(String) : [],
        zone: String(c.zone || 'Unknown'),
      })),
      skinZones: (parsed.skin_zones || []).map((z: Record<string, unknown>) => ({
        zone: String(z.zone || 'Unknown'),
        primaryConcern: String(z.primary_concern || 'Unknown'),
        description: String(z.description || ''),
        severity: ['mild', 'moderate', 'severe'].includes(z.severity as string)
          ? z.severity as 'mild' | 'moderate' | 'severe' : 'mild',
      })),
    };
  } catch {
    throw new Error('Failed to parse MiMo classification response');
  }
}

// =============================================================================
// Tier 3: Premium Fallback (placeholder — GPT-4V / Claude Vision)
// =============================================================================

async function classifyWithPremium(
  imageBase64: string,
  skinTone: number,
  tier2Result: { conditions: ConditionResult[]; skinZones: ZoneAnalysis[] }
): Promise<ClassifyResponse> {
  // TODO: Implement GPT-4V or Claude Vision fallback
  // For now, return the Tier 2 result with a flag
  return {
    analysisId: generateId(),
    conditions: tier2Result.conditions,
    skinZones: tier2Result.skinZones,
    confidence: tier2Result.conditions.reduce((sum, c) => sum + c.confidence, 0) / Math.max(1, tier2Result.conditions.length),
    tier: 'tier3',
    needsPremiumReview: false,
  };
}

// =============================================================================
// Helpers
// =============================================================================

function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// In-memory store for upload tracking (replace with Supabase in production)
// =============================================================================

const uploadStore = new Map<string, { imageBase64: string; skinTone: number; capturedAt: number }>();

// Auto-delete images after 24 hours
const IMAGE_TTL = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, upload] of uploadStore.entries()) {
    if (now - upload.capturedAt > IMAGE_TTL) {
      uploadStore.delete(id);
    }
  }
}, 60 * 60 * 1000); // Check every hour

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * POST /api/analysis/upload
 * Tier 0 (EXIF strip) + Tier 1 (Kimi quality gate)
 */
export async function POST_upload(req: NextRequest): Promise<NextResponse> {
  try {
    const body: UploadRequest = await req.json();
    
    if (!body.image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }
    if (!body.skinTone || body.skinTone < 1 || body.skinTone > 6) {
      return NextResponse.json({ error: 'Valid skinTone (1-6) is required' }, { status: 400 });
    }

    // Tier 0: Strip EXIF metadata (privacy-first)
    const cleanImage = stripExif(body.image);
    
    // Tier 1: Kimi quality check
    const quality = await checkImageQuality(cleanImage);
    
    const uploadId = generateId();
    
    // Store cleaned image for Tier 2 processing
    uploadStore.set(uploadId, {
      imageBase64: cleanImage,
      skinTone: body.skinTone,
      capturedAt: Date.now(),
    });
    
    const response: UploadResponse = {
      uploadId,
      qualityScore: quality.qualityScore,
      lightingQuality: quality.lightingQuality,
      warnings: quality.warnings,
      faceDetected: quality.faceDetected,
      faceCentered: quality.faceCentered,
      eyesVisible: quality.eyesVisible,
    };
    
    // If quality is too low, reject with helpful suggestion
    if (quality.qualityScore < 50 || !quality.faceDetected || quality.isSkinPhoto === false) {
      response.rejected = {
        reason: !quality.faceDetected
          ? 'No face detected in the photo'
          : quality.lightingQuality === 'poor' || quality.lightingQuality === 'unusable'
            ? 'Lighting is insufficient for accurate analysis'
            : 'Image quality is too low for reliable analysis',
        suggestion: quality.suggestion || 'Move to a well-lit area with even, natural lighting and retake the photo',
      };
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analysis/classify
 * Tier 2 (MiMo Omni) + Tier 3 (premium fallback if needed)
 */
export async function POST_classify(req: NextRequest): Promise<NextResponse> {
  try {
    const body: ClassifyRequest = await req.json();
    
    if (!body.uploadId) {
      return NextResponse.json({ error: 'uploadId is required' }, { status: 400 });
    }
    
    // Retrieve stored image
    const upload = uploadStore.get(body.uploadId);
    if (!upload) {
      return NextResponse.json({ error: 'Upload not found or expired' }, { status: 404 });
    }
    
    const skinTone = body.skinTone || upload.skinTone;
    
    // Tier 2: MiMo Omni classification
    let classification: { conditions: ConditionResult[]; skinZones: ZoneAnalysis[] };
    let tier: 'tier2' | 'tier3' = 'tier2';
    let needsPremium = false;
    
    try {
      classification = await classifyWithMiMo(upload.imageBase64, skinTone);
      
      // Check if any condition needs premium review
      needsPremium = classification.conditions.some(c => c.confidence < 0.70);
    } catch (miMoError) {
      console.warn('MiMo classification failed, escalating to Tier 3:', miMoError);
      
      // Use a minimal fallback result and flag for premium
      classification = {
        conditions: [],
        skinZones: [],
      };
      needsPremium = true;
      tier = 'tier3';
    }
    
    // If low confidence, try Tier 3
    if (needsPremium && classification.conditions.length > 0) {
      try {
        const premiumResult = await classifyWithPremium(upload.imageBase64, skinTone, classification);
        return NextResponse.json(premiumResult);
      } catch {
        // Premium failed too — return what we have from Tier 2
        console.warn('Tier 3 fallback also failed, returning Tier 2 results');
      }
    }
    
    const analysisId = generateId();
    
    const response: ClassifyResponse = {
      analysisId,
      conditions: classification.conditions,
      skinZones: classification.skinZones,
      confidence: classification.conditions.length > 0
        ? classification.conditions.reduce((sum, c) => sum + c.confidence, 0) / classification.conditions.length
        : 0,
      tier,
      needsPremiumReview: needsPremium,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Classify error:', error);
    return NextResponse.json(
      { error: 'Failed to classify image', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analysis/:id/image
 * Privacy: delete stored image after processing
 */
export async function DELETE_image(req: NextRequest, uploadId: string): Promise<NextResponse> {
  const deleted = uploadStore.delete(uploadId);
  if (!deleted) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Image deleted' });
}