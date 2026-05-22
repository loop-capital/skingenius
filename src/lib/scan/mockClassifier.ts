/**
 * Mock vision model classifier for POST /api/v1/scan.
 *
 * Returns 3–5 conditions from the SKINgenius knowledge graph with
 * confidence scores, severity, and affected zones.
 *
 * In production this tier is replaced by MiMo Omni + premium fallback.
 */

import {
  V1DetectedCondition,
  V1SkinZone,
} from "@/types/api";

// Subset of conditions from knowledge-graph/seed-data.json
const KNOWLEDGE_CONDITIONS = [
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

function pickRandomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomSeverity(): "mild" | "moderate" | "severe" {
  const r = Math.random();
  if (r < 0.5) return "mild";
  if (r < 0.85) return "moderate";
  return "severe";
}

export async function mockClassify(
  _imageBase64: string,
  skinTone: number
): Promise<{
  conditions: V1DetectedCondition[];
  skinZones: V1SkinZone[];
}> {
  const selected = pickRandomSubset(KNOWLEDGE_CONDITIONS, 3, 5);

  const conditions: V1DetectedCondition[] = selected.map((c) => {
    const confidence = Math.round((0.55 + Math.random() * 0.4) * 100) / 100;
    const severity = randomSeverity();
    const zone = c.zones[Math.floor(Math.random() * c.zones.length)];
    const numFeatures = Math.min(3, c.features.length);
    const features = pickRandomSubset(c.features, 1, numFeatures).map(String);
    return {
      condition_id: c.slug,
      name: c.name,
      confidence,
      severity,
      features,
      zone,
    };
  });

  // Derive skin zones from conditions
  const zoneMap = new Map<string, { concern: string; severity: "mild" | "moderate" | "severe"; confidence: number; descriptions: string[] }>();

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

  // If skin tone 4-6, boost PIH / melasma confidence slightly for realism
  if (skinTone >= 4) {
    const pigmentation = conditions.find(
      (c) => c.condition_id === "post-inflammatory-hyperpigmentation" || c.condition_id === "melasma"
    );
    if (pigmentation) {
      pigmentation.confidence = Math.min(0.98, pigmentation.confidence + 0.1);
    }
  }

  return { conditions, skinZones };
}
