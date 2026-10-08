/**
 * visionPrompt.ts — GPT-4o Vision prompts for SKINgenius cloud skin analysis.
 *
 * Used by pro/pro_plus tiers in POST /api/v1/scan. The model describes visible
 * skin features and returns structured JSON matching the V1 API contract.
 * It NEVER diagnoses — every output is framed as visible-feature description
 * with a "not a medical diagnosis" disclaimer handled by the UI layer.
 */

import type { ScanType } from "@/types/api";

// ─── Condition taxonomy (25 conditions from VISION-MODEL-ARCHITECTURE spec) ───

export const CONDITION_TAXONOMY = [
  "acne",
  "hyperpigmentation",
  "melasma",
  "dryness",
  "oily_skin",
  "fine_lines",
  "wrinkles",
  "uneven_texture",
  "enlarged_pores",
  "redness",
  "rosacea",
  "dark_circles",
  "puffiness",
  "sun_damage",
  "age_spots",
  "uneven_skin_tone",
  "dullness",
  "blackheads",
  "whiteheads",
  "scarring",
  "sensitivity",
  "eczema",
  "psoriasis",
  "seborrheic_dermatitis",
  "keratosis_pilaris",
] as const;

// ─── Severity anchors (clinical calibration for the model) ───────────────────

const SEVERITY_GUIDE = `
SEVERITY CALIBRATION — use these clinical anchors:
- "mild": few scattered lesions, minimal discoloration, subtle texture change.
  Cosmetic concern only.
- "moderate": multiple visible lesions or patches, noticeable discoloration or
  texture change across a zone, some inflammation. Would benefit from a
  consistent skincare routine.
- "severe": widespread, cystic/nodulocystic, scarring, oozing, or bleeding
  lesions; extensive discoloration. Recommend seeing a dermatologist.
`.trim();

// ─── Urgent flag criteria ────────────────────────────────────────────────────

const URGENT_FLAG_GUIDE = `
Set urgent_flag=true ONLY if you observe any of the following red flags:
- Asymmetric pigmented lesion with irregular borders or multiple colors
- Lesion that appears to be bleeding, ulcerated, or rapidly changing
- Widespread blistering, oozing, or signs of infection (pus, spreading redness)
Otherwise urgent_flag=false. When in doubt, prefer false — the UI always shows
a "see a dermatologist" path for severe findings regardless.
`.trim();

// ─── System prompt ───────────────────────────────────────────────────────────

export const VISION_SYSTEM_PROMPT = `
You are a dermatology-trained visual assistant for SKINgenius, a consumer
skincare analysis app. You analyze facial photographs and describe VISIBLE SKIN
FEATURES in structured JSON.

CRITICAL RULES:
1. You describe what you SEE. You do not diagnose medical conditions.
2. Output MUST be valid JSON matching the schema below — no prose, no markdown.
3. Only report conditions you can actually observe in the image. If the image
   is too blurry, dark, or obscured to assess, return an empty conditions array
   with overall_score=null and a note in primary_concern.
4. Confidence scores reflect how clearly the feature is visible (0.0–1.0).
5. affected_areas must use these zone names: forehead, nose, cheeks, chin,
   jawline, around-eyes, around-mouth, neck.
6. Keep descriptions concise and consumer-friendly (no jargon without
   explanation).

${SEVERITY_GUIDE}

${URGENT_FLAG_GUIDE}

OUTPUT JSON SCHEMA:
{
  "conditions": [
    {
      "id": "<one of: ${CONDITION_TAXONOMY.join(", ")}>",
      "name": "<human-readable name>",
      "confidence": <0.0-1.0>,
      "severity": "<mild|moderate|severe>",
      "affected_areas": ["<zone>", ...]
    }
  ],
  "skin_zones": [
    {
      "zone": "<zone name>",
      "primary_concern": "<condition name or 'None'>",
      "description": "<1-2 sentence consumer-friendly description>",
      "severity": "<mild|moderate|severe>",
      "confidence": <0.0-1.0>
    }
  ],
  "overall_score": <0-100, higher = healthier skin>,
  "primary_concern": "<name of top condition or 'No significant concerns detected'>",
  "urgent_flag": <boolean>,
  "fitzpatrick_type": "<I|II|III|IV|V|VI>",
  "clinical_notes": "<optional 1-2 sentence note for the user, consumer-friendly>"
}
`.trim();

// ─── User prompt builder ─────────────────────────────────────────────────────

export function buildVisionUserPrompt(
  scanType: ScanType,
  skinToneHint?: number
): string {
  const scanFocus =
    scanType === "aesthetics"
      ? "Focus on aesthetic concerns: fine lines, wrinkles, texture, pores, tone evenness, and dullness."
      : scanType === "both"
        ? "Assess both skin-health concerns (acne, redness, pigmentation, dryness, sensitivity) and aesthetic concerns (lines, texture, pores, tone)."
        : "Focus on skin-health concerns: acne, redness, pigmentation, dryness, oiliness, and sensitivity.";

  const toneHint =
    typeof skinToneHint === "number"
      ? ` The on-device pipeline estimated Fitzpatrick type ~${skinToneHint}; use this as a hint but make your own assessment from the image.`
      : "";

  return `Analyze this facial photograph for visible skin features. ${scanFocus}${toneHint} Return ONLY the JSON object described in your instructions.`.trim();
}
