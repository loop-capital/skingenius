/**
 * skinToneEstimator.ts — Fitzpatrick skin type estimation from face image
 *
 * Samples skin pixels from the cheek region, converts to LAB colour space,
 * and maps L* value to Fitzpatrick type I–VI.
 *
 * Pure functions, no DOM deps — ready for React Native port.
 */

import { FaceDetectionResult } from "./faceDetection";

// ─── Types ─────────────────────────────────────────────────────

export interface SkinToneEstimate {
  fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6;
  confidence: number; // 0–1
  lValue: number; // LAB L*
  aValue: number; // LAB a*
  bValue: number; // LAB b*
  sampleCount: number;
}

export interface LightingAssessment {
  brightness: number; // 0–255 (mean grayscale)
  contrast: number; // std dev of grayscale
  isUnderexposed: boolean;
  isOverexposed: boolean;
  quality: "excellent" | "good" | "poor" | "unusable";
}

// ─── Constants ───────────────────────────────────────────────

// Fitzpatrick L* boundaries (empirical, based on published dermatology data)
const FITZPATRICK_L_RANGES: { min: number; max: number; type: 1 | 2 | 3 | 4 | 5 | 6 }[] = [
  { min: 75, max: 100, type: 1 }, // Very fair
  { min: 65, max: 75, type: 2 },  // Fair
  { min: 55, max: 65, type: 3 },  // Medium
  { min: 45, max: 55, type: 4 },  // Olive / brown
  { min: 35, max: 45, type: 5 },  // Dark brown
  { min: 20, max: 35, type: 6 },  // Deeply pigmented
];

// ─── Colour Conversion Helpers ─────────────────────────────────

/**
 * Convert sRGB (0–255) to linear RGB (0–1).
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear RGB to XYZ (D65).
 */
function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  return {
    x: lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
    y: lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175,
    z: lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041,
  };
}

/**
 * Convert XYZ to LAB.
 * Reference white: D65.
 */
function xyzToLab(x: number, y: number, z: number): { l: number; a: number; b: number } {
  const xRef = 0.95047;
  const yRef = 1.0;
  const zRef = 1.08883;

  const f = (t: number) =>
    t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;

  const l = 116 * f(y / yRef) - 16;
  const a = 500 * (f(x / xRef) - f(y / yRef));
  const b = 200 * (f(y / yRef) - f(z / zRef));

  return { l, a, b };
}

function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

// ─── Pixel Sampling ────────────────────────────────────────────

/**
 * Check if a pixel is likely skin (based on RGB ratios).
 * Excludes lips (high R), eyes (dark), and obvious background.
 */
function isSkinPixel(r: number, g: number, b: number): boolean {
  // Basic skin pixel heuristic
  if (r < 40 || g < 30 || b < 20) return false; // Too dark
  if (r > 250 && g > 250 && b > 250) return false; // Blown out

  const rg = r - g;
  const rb = r - b;

  // Skin tends to have R slightly > G > B
  return rg > -10 && rg < 50 && rb > -5 && rb < 60 && g > b;
}

/**
 * Get cheek sampling regions based on face detection result.
 * Returns two rectangles (left and right cheek) relative to image dimensions.
 */
function getCheekRegions(
  face: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number
): Array<{ x: number; y: number; w: number; h: number }> {
  if (!face.detected || !face.boundingBox) return [];

  const { x, y, width, height } = face.boundingBox;

  // Cheeks are roughly:
  // Left cheek:  left 20-45% of face width,  vertical 40-70%
  // Right cheek: right 55-80% of face width, vertical 40-70%
  const regions = [
    {
      x: x + width * 0.2,
      y: y + height * 0.45,
      w: width * 0.25,
      h: height * 0.25,
    },
    {
      x: x + width * 0.55,
      y: y + height * 0.45,
      w: width * 0.25,
      h: height * 0.25,
    },
  ];

  return regions.map((r) => ({
    x: Math.max(0, Math.round(r.x)),
    y: Math.max(0, Math.round(r.y)),
    w: Math.min(imageWidth - Math.round(r.x), Math.round(r.w)),
    h: Math.min(imageHeight - Math.round(r.y), Math.round(r.h)),
  }));
}

// ─── Lighting Assessment ───────────────────────────────────────

/**
 * Assess lighting quality from image data.
 */
export function assessLighting(imageData: ImageData): LightingAssessment {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  let totalGray = 0;
  let sumSq = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    totalGray += gray;
    sumSq += gray * gray;
  }

  const mean = totalGray / pixelCount;
  const variance = sumSq / pixelCount - mean * mean;
  const stdDev = Math.sqrt(Math.max(0, variance));

  const isUnderexposed = mean < 60;
  const isOverexposed = mean > 230;

  let quality: LightingAssessment["quality"] = "good";
  if (isUnderexposed || isOverexposed || stdDev < 20) {
    quality = "poor";
  } else if (mean >= 100 && mean <= 200 && stdDev >= 30) {
    quality = "excellent";
  } else if (mean >= 80 && mean <= 220 && stdDev >= 20) {
    quality = "good";
  } else {
    quality = "poor";
  }

  if (mean < 30 || mean > 245 || stdDev < 10) {
    quality = "unusable";
  }

  return {
    brightness: Math.round(mean),
    contrast: Math.round(stdDev),
    isUnderexposed,
    isOverexposed,
    quality,
  };
}

// ─── Blur Detection (Laplacian Variance) ─────────────────────

/**
 * Estimate image sharpness using Laplacian variance.
 * Higher value = sharper image.
 * Thresholds: < 100 = blurry, 100-500 = acceptable, > 500 = sharp.
 */
export function estimateBlur(imageData: ImageData): number {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);

  // Convert to grayscale
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] =
        data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
    }
  }

  // 3×3 Laplacian kernel
  const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let conv = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const g = gray[(y + ky) * width + (x + kx)];
          conv += g * kernel[(ky + 1) * 3 + (kx + 1)];
        }
      }
      sum += conv;
      sumSq += conv * conv;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.max(0, variance);
}

// ─── Skin Tone Estimation ──────────────────────────────────────

/**
 * Estimate Fitzpatrick skin type from face image.
 *
 * @param imageData Full image ImageData
 * @param face Face detection result (used to find cheek regions)
 * @param imageWidth Total image width
 * @param imageHeight Total image height
 */
export function estimateSkinTone(
  imageData: ImageData,
  face: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number
): SkinToneEstimate | null {
  const regions = getCheekRegions(face, imageWidth, imageHeight);
  if (regions.length === 0) return null;

  const { data } = imageData;
  let totalL = 0;
  let totalA = 0;
  let totalB = 0;
  let sampleCount = 0;

  for (const region of regions) {
    for (let y = region.y; y < region.y + region.h; y++) {
      for (let x = region.x; x < region.x + region.w; x++) {
        const idx = (y * imageData.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (isSkinPixel(r, g, b)) {
          const lab = rgbToLab(r, g, b);
          totalL += lab.l;
          totalA += lab.a;
          totalB += lab.b;
          sampleCount++;
        }
      }
    }
  }

  if (sampleCount < 50) {
    // Fallback: sample from full face bbox
    if (!face.boundingBox) return null;
    const { x, y, width: w, height: h } = face.boundingBox;
    for (let py = Math.round(y); py < Math.round(y + h); py++) {
      for (let px = Math.round(x); px < Math.round(x + w); px++) {
        if (px >= imageData.width || py >= imageData.height) continue;
        const idx = (py * imageData.width + px) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (isSkinPixel(r, g, b)) {
          const lab = rgbToLab(r, g, b);
          totalL += lab.l;
          totalA += lab.a;
          totalB += lab.b;
          sampleCount++;
        }
      }
    }
  }

  if (sampleCount < 10) return null;

  const avgL = totalL / sampleCount;
  const avgA = totalA / sampleCount;
  const avgB = totalB / sampleCount;

  // Map L* to Fitzpatrick type
  let fitzType: 1 | 2 | 3 | 4 | 5 | 6 = 3;
  let confidence = 0.5;

  for (const range of FITZPATRICK_L_RANGES) {
    if (avgL >= range.min && avgL < range.max) {
      fitzType = range.type;
      // Confidence is higher when in the middle of the range
      const mid = (range.min + range.max) / 2;
      const dist = Math.abs(avgL - mid);
      const halfRange = (range.max - range.min) / 2;
      confidence = Math.max(0.3, 1 - dist / halfRange);
      break;
    }
  }

  // Clamp confidence
  confidence = Math.min(0.95, Math.max(0.3, confidence));

  return {
    fitzpatrickType: fitzType,
    confidence,
    lValue: Math.round(avgL * 10) / 10,
    aValue: Math.round(avgA * 10) / 10,
    bValue: Math.round(avgB * 10) / 10,
    sampleCount,
  };
}

/**
 * Adjust L* value for lighting conditions.
 * Underexposed images will have artificially low L*.
 */
export function adjustForLighting(
  estimate: SkinToneEstimate,
  lighting: LightingAssessment
): SkinToneEstimate {
  if (lighting.quality === "excellent" || lighting.quality === "good") {
    return estimate; // No adjustment needed
  }

  let adjustment = 0;
  if (lighting.isUnderexposed) {
    adjustment = Math.min(15, (80 - lighting.brightness) * 0.2);
  } else if (lighting.isOverexposed) {
    adjustment = -Math.min(15, (lighting.brightness - 220) * 0.2);
  }

  const adjustedL = estimate.lValue + adjustment;

  // Re-map type
  let newType: 1 | 2 | 3 | 4 | 5 | 6 = estimate.fitzpatrickType;
  for (const range of FITZPATRICK_L_RANGES) {
    if (adjustedL >= range.min && adjustedL < range.max) {
      newType = range.type;
      break;
    }
  }

  // Reduce confidence due to lighting correction
  const adjustedConfidence = Math.max(0.2, estimate.confidence * 0.8);

  return {
    ...estimate,
    fitzpatrickType: newType,
    confidence: adjustedConfidence,
  };
}
