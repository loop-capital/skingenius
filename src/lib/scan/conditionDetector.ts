/**
 * conditionDetector.ts — Skin condition detection for SKINgenius
 *
 * Initial implementation: deterministic mock classification (same as server-side).
 * Structured for future Gemma 4 integration.
 *
 * Pure functions, no DOM deps — ready for React Native port.
 */

import {
  V1DetectedCondition,
  V1SkinZone,
} from "@/types/api";
import { FaceDetectionResult } from "./faceDetection";

// ─── Types ─────────────────────────────────────────────────────

export interface ConditionDetectionResult {
  conditions: V1DetectedCondition[];
  skinZones: V1SkinZone[];
}

export interface DetectorOptions {
  skinTone: number; // 1–6
  useGemma: boolean; // Future: true when Gemma 4 is ready
  gemmaModelPath?: string; // Future: local model path
}

// ─── Knowledge Base (same as server-side mock) ─────────────────

interface KnowledgeCondition {
  slug: string;
  name: string;
  zones: string[];
  features: string[];
}

const KNOWLEDGE_CONDITIONS: KnowledgeCondition[] = [
  {
    slug: "acne-vulgaris",
    name: "Acne Vulgaris",
    zones: ["t-zone", "cheeks", "chin", "forehead", "jawline"],
    features: ["comedones", "papules", "pustules", "nodules", "cysts", "post-inflammatory hyperpigmentation"],
  },
  {
    slug: "hormonal-acne",
    name: "Hormonal Acne",
    zones: ["jawline", "chin", "neck", "cheeks"],
    features: ["deep cysts", "nodules", "painful lesions", "menstrual flares"],
  },
  {
    slug: "rosacea",
    name: "Rosacea",
    zones: ["cheeks", "nose", "chin", "forehead"],
    features: ["persistent erythema", "papules", "pustules", "telangiectasias", "flushing", "burning sensation"],
  },
  {
    slug: "post-inflammatory-hyperpigmentation",
    name: "Post-Inflammatory Hyperpigmentation (PIH)",
    zones: ["face", "neck", "cheeks", "chin", "forehead"],
    features: ["tan to dark brown patches", "follows-pattern-of-inflammation", "no-active-inflammation"],
  },
  {
    slug: "melasma",
    name: "Melasma",
    zones: ["cheeks", "forehead", "upper-lip", "nose", "chin"],
    features: ["symmetric patches", "brown to gray-brown color", "worsens with sun"],
  },
  {
    slug: "seborrheic-dermatitis",
    name: "Seborrheic Dermatitis",
    zones: ["scalp", "eyebrows", "nasolabial-folds", "chest", "ears"],
    features: ["erythema", "greasy-scales", "pruritus", "dandruff"],
  },
  {
    slug: "atopic-dermatitis",
    name: "Atopic Dermatitis (Eczema)",
    zones: ["face", "neck", "antecubital-folds", "hands", "wrists"],
    features: ["pruritus", "erythema", "xerosis", "lichenification", "excoriations", "crusting"],
  },
  {
    slug: "solar-lentigines",
    name: "Solar Lentigines",
    zones: ["face", "dorsal-hands", "forearms", "chest", "shoulders"],
    features: ["well-circumscribed macules", "light to dark brown", "sun-exposed areas"],
  },
  {
    slug: "fungal-acne",
    name: "Fungal Acne (Malassezia Folliculitis)",
    zones: ["forehead", "chest", "back", "upper-arms"],
    features: ["monomorphic papules", "pruritus", "triggered by heat/sweat", "worsens with antibiotics"],
  },
  {
    slug: "contact-dermatitis",
    name: "Contact Dermatitis",
    zones: ["hands", "face", "neck", "exposed-areas"],
    features: ["erythema", "vesicles", "pruritus", "burning", "edema"],
  },
];

// ─── Helpers ───────────────────────────────────────────────────

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const positive = Math.abs(hash);
  return (positive % 10000) / 10000;
}

function pickSeededSubset<T>(arr: T[], seed: string, count: number): T[] {
  const shuffled = [...arr].sort((a, b) => {
    const randA = seededRandom(seed + JSON.stringify(a));
    const randB = seededRandom(seed + JSON.stringify(b));
    return randA - randB;
  });
  return shuffled.slice(0, count);
}

function seededSeverity(seed: string): "mild" | "moderate" | "severe" {
  const r = seededRandom(seed + "_severity");
  if (r < 0.5) return "mild";
  if (r < 0.85) return "moderate";
  return "severe";
}

// ─── Mock Detection (Tier 1 — current) ─────────────────────────

/**
 * Deterministic mock classification using a seed derived from image data.
 * Returns the same results for the same input (unlike Math.random).
 */
export function mockDetectConditions(
  imageHash: string,
  skinTone: number
): ConditionDetectionResult {
  const conditionCount = 3 + Math.floor(seededRandom(imageHash + "_count") * 3); // 3–5 conditions
  const selected = pickSeededSubset(KNOWLEDGE_CONDITIONS, imageHash, conditionCount);

  const conditions: V1DetectedCondition[] = selected.map((c, idx) => {
    const seed = `${imageHash}_${idx}`;
    const confidence = Math.round((0.55 + seededRandom(seed + "_conf") * 0.4) * 100) / 100;
    const severity = seededSeverity(seed);
    const zone = c.zones[Math.floor(seededRandom(seed + "_zone") * c.zones.length)];
    const numFeatures = Math.min(3, c.features.length);
    const features = pickSeededSubset(c.features, seed + "_feat", numFeatures);

    return {
      condition_id: c.slug,
      name: c.name,
      confidence,
      severity,
      features: features.map(String),
      zone,
    };
  });

  // Derive skin zones from conditions
  const zoneMap = new Map<
    string,
    {
      concern: string;
      severity: "mild" | "moderate" | "severe";
      confidence: number;
      descriptions: string[];
    }
  >();

  for (const c of conditions) {
    const existing = zoneMap.get(c.zone);
    if (!existing) {
      zoneMap.set(c.zone, {
        concern: c.name,
        severity: c.severity,
        confidence: c.confidence,
        descriptions: [`${c.name} detected (${c.severity})`],
      });
    } else {
      if (c.confidence > existing.confidence) {
        existing.concern = c.name;
        existing.severity = c.severity;
        existing.confidence = c.confidence;
      }
      existing.descriptions.push(`${c.name} detected (${c.severity})`);
    }
  }

  const skinZones: V1SkinZone[] = Array.from(zoneMap.entries()).map(
    ([zone, data]) => ({
      zone,
      primary_concern: data.concern,
      description: data.descriptions.join("; "),
      severity: data.severity,
      confidence: data.confidence,
    })
  );

  // If skin tone 4–6, boost PIH / melasma confidence slightly for realism
  if (skinTone >= 4) {
    const pigmentation = conditions.find(
      (c) =>
        c.condition_id === "post-inflammatory-hyperpigmentation" ||
        c.condition_id === "melasma"
    );
    if (pigmentation) {
      pigmentation.confidence = Math.min(0.98, pigmentation.confidence + 0.1);
    }
  }

  return { conditions, skinZones };
}

// ─── Hash Helper ───────────────────────────────────────────────

/**
 * Create a simple hash from image data for deterministic mock results.
 */
export function hashImageData(imageData: ImageData): string {
  let hash = 0;
  const { data } = imageData;
  // Sample every 50th pixel for performance
  for (let i = 0; i < data.length; i += 200) {
    hash = (hash * 31 + data[i]) | 0;
  }
  return hash.toString(16);
}

// ─── Main Detector Interface ───────────────────────────────────

/**
 * Detect skin conditions from a face image.
 *
 * Current implementation uses deterministic mock classification.
 * Future: switch to Gemma 4 when model is ready.
 *
 * @param imageData Full image ImageData
 * @param face Face detection result
 * @param options Detection options (skin tone, model config)
 */
export async function detectConditions(
  imageData: ImageData,
  face: FaceDetectionResult,
  options: DetectorOptions
): Promise<ConditionDetectionResult> {
  // Future: if options.useGemma, load and run Gemma 4
  if (options.useGemma) {
    console.warn("Gemma 4 integration not yet implemented, falling back to mock");
  }

  // Generate deterministic seed from image
  const imageHash = hashImageData(imageData);

  // Include face position in hash for slight variation
  const faceSeed = face.boundingBox
    ? `${Math.round(face.boundingBox.x)}_${Math.round(face.boundingBox.y)}`
    : "noface";

  return mockDetectConditions(`${imageHash}_${faceSeed}`, options.skinTone);
}

/**
 * Detect conditions from a base64 image string (convenience for server API).
 */
export async function detectConditionsFromBase64(
  base64Image: string,
  skinTone: number
): Promise<ConditionDetectionResult> {
  // Simple hash from base64 content
  let hash = 0;
  for (let i = 0; i < Math.min(base64Image.length, 5000); i += 10) {
    hash = (hash * 31 + base64Image.charCodeAt(i)) | 0;
  }
  return mockDetectConditions(hash.toString(16), skinTone);
}
