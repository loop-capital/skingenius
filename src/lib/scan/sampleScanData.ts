/**
 * Sample scan data for the consumer-facing results pages.
 *
 * This module exports hardcoded data matching the /api/v1/scan response
 * contract. Replace the exported object with a real fetch in each page when
 * the API is wired up. Keep the same shape so existing UI components stay
 * compatible.
 */

import {
  V1ScanResponseData,
  V1DetectedCondition,
  V1Recommendation,
  V1ProductRecommendation,
} from "@/types/api";

export interface ConditionDetails {
  id: string;
  name: string;
  description: string;
  causes: string[];
  learnMoreUrl: string;
  ingredients: Array<{
    name: string;
    evidenceLevel: "A" | "B" | "C" | "D";
    concentration?: string;
    whyItHelps: string;
  }>;
}

export const sampleConditions: V1DetectedCondition[] = [
  {
    id: "acne",
    condition_id: "acne",
    name: "Acne",
    confidence: 0.87,
    severity: "moderate",
    affected_areas: ["cheeks", "chin"],
    features: ["papules", "comedones", "mild inflammation"],
    zone: "face",
  },
  {
    id: "post_inflammatory_hyperpigmentation",
    condition_id: "post_inflammatory_hyperpigmentation",
    name: "Post-Inflammatory Hyperpigmentation",
    confidence: 0.64,
    severity: "mild",
    affected_areas: ["cheeks"],
    features: ["dark marks", "no active inflammation"],
    zone: "face",
  },
  {
    id: "uneven_texture",
    condition_id: "uneven_texture",
    name: "Uneven Texture",
    confidence: 0.58,
    severity: "mild",
    affected_areas: ["forehead", "chin"],
    features: ["roughness", "small bumps"],
    zone: "face",
  },
];

export const sampleRecommendations: V1Recommendation[] = [
  {
    type: "ingredient",
    name: "Salicylic Acid",
    evidence_level: "A",
    concentration: "0.5–2%",
    reasoning:
      "Beta-hydroxy acid that penetrates oil to exfoliate inside pores and reduce acne lesions.",
  },
  {
    type: "ingredient",
    name: "Niacinamide",
    evidence_level: "A",
    concentration: "2–5%",
    reasoning:
      "Reduces inflammation, regulates sebum, and brightens post-acne marks over time.",
  },
  {
    type: "ingredient",
    name: "Azelaic Acid",
    evidence_level: "A",
    concentration: "10%",
    reasoning:
      "Helps fade hyperpigmentation and calms residual inflammation with strong tolerability.",
  },
  {
    type: "lifestyle",
    name: "Consistent sunscreen",
    evidence_level: "A",
    reasoning:
      "UV exposure darkens hyperpigmentation and slows acne healing. Daily SPF is non-negotiable.",
  },
];

export const sampleProductRecommendations: V1ProductRecommendation[] = [
  {
    product_id: "p-001",
    name: "Salicylic Acid Cleanser",
    brand: "CeraVe",
    category: "cleanser",
    match_score: 94,
    price: "$16",
    reasoning:
      "2% salicylic acid + ceramides makes it an ideal acne cleanser that won't strip the barrier.",
  },
  {
    product_id: "p-007",
    name: "Azelaic Acid Suspension 10%",
    brand: "The Ordinary",
    category: "treatment",
    match_score: 87,
    price: "$13",
    reasoning:
      "Targets both active acne and post-inflammatory hyperpigmentation with strong tolerability.",
  },
  {
    product_id: "p-006",
    name: "UV Clear Broad-Spectrum SPF 46",
    brand: "EltaMD",
    category: "sunscreen",
    match_score: 92,
    price: "$41",
    reasoning:
      "Zinc oxide + 5% niacinamide provides UV protection while calming acne-prone skin.",
  },
];

export const conditionDetailsMap: Record<string, ConditionDetails> = {
  acne: {
    id: "acne",
    name: "Acne",
    description:
      "A common inflammatory skin condition where hair follicles become clogged with oil and dead skin cells, leading to blackheads, whiteheads, papules, and pustules.",
    causes: [
      "Excess sebum production",
      "Follicular hyperkeratinization (clogged pores)",
      "Cutibacterium acnes overgrowth",
      "Inflammation and hormonal fluctuations",
    ],
    learnMoreUrl: "/education/acne",
    ingredients: [
      {
        name: "Salicylic Acid",
        evidenceLevel: "A",
        concentration: "0.5–2%",
        whyItHelps:
          "Oil-soluble BHA that exfoliates inside pores, dissolves comedones, and reduces lesion count.",
      },
      {
        name: "Benzoyl Peroxide",
        evidenceLevel: "A",
        concentration: "2.5–5%",
        whyItHelps:
          "Kills C. acnes bacteria and reduces inflammation; start low to limit irritation.",
      },
      {
        name: "Niacinamide",
        evidenceLevel: "A",
        concentration: "2–5%",
        whyItHelps:
          "Regulates sebum, calms inflammation, and supports a healthy barrier.",
      },
    ],
  },
  post_inflammatory_hyperpigmentation: {
    id: "post_inflammatory_hyperpigmentation",
    name: "Post-Inflammatory Hyperpigmentation",
    description:
      "Darkened patches or spots that remain after acne or skin injury heals. More common and persistent in medium to deep skin tones.",
    causes: [
      "Inflammation triggers excess melanin production",
      "Sun exposure darkens existing marks",
      "Picking or squeezing lesions prolongs healing",
      "Genetic tendency toward hyperpigmentation",
    ],
    learnMoreUrl: "/education/hyperpigmentation",
    ingredients: [
      {
        name: "Azelaic Acid",
        evidenceLevel: "A",
        concentration: "10%",
        whyItHelps:
          "Inhibits tyrosinase and selectively treats hyperactive melanocytes with low irritation.",
      },
      {
        name: "Vitamin C",
        evidenceLevel: "A",
        concentration: "10–20%",
        whyItHelps:
          "Antioxidant that brightens skin and reduces melanin production over time.",
      },
      {
        name: "Niacinamide",
        evidenceLevel: "A",
        concentration: "2–5%",
        whyItHelps:
          "Interrupts melanin transfer to skin cells, fading marks without exfoliation.",
      },
    ],
  },
  uneven_texture: {
    id: "uneven_texture",
    name: "Uneven Texture",
    description:
      "Rough, bumpy, or dull skin surface often caused by slowed cell turnover, dehydration, or post-acne changes.",
    causes: [
      "Slowed epidermal cell turnover",
      "Dehydration or barrier damage",
      "Sun damage and collagen breakdown",
      "Post-acne scarring or enlarged pores",
    ],
    learnMoreUrl: "/education/uneven-texture",
    ingredients: [
      {
        name: "Glycolic Acid",
        evidenceLevel: "A",
        concentration: "5–10%",
        whyItHelps:
          "Accelerates cell turnover, smooths roughness, and improves product penetration.",
      },
      {
        name: "Retinol",
        evidenceLevel: "A",
        concentration: "0.25–0.5%",
        whyItHelps:
          "Boosts collagen and normalizes keratinization for smoother skin over weeks.",
      },
      {
        name: "Hyaluronic Acid",
        evidenceLevel: "B",
        concentration: "1–2%",
        whyItHelps:
          "Hydrates and plumps the skin surface, making texture appear smoother.",
      },
    ],
  },
};

export const sampleScanResponse: V1ScanResponseData = {
  scan_id: "550e8400-e29b-41d4-a716-446655440000",
  tier: "free",
  model: "on-device",
  processing_time_ms: 450,
  timestamp: new Date().toISOString(),
  conditions: sampleConditions,
  overall_score: 72,
  primary_concern: "acne",
  urgent_flag: false,
  fitzpatrick_type: "IV",
  recommendations: sampleRecommendations,
  product_recommendations: sampleProductRecommendations,
  scan_count_this_month: 2,
  scans_remaining: 2,
  provider_referral_eligible: true,
};

/** Hardcoded history for the scan history page. */
export interface ScanHistoryItem extends V1ScanResponseData {
  date: string;
}

export const sampleScanHistory: ScanHistoryItem[] = [
  {
    ...sampleScanResponse,
    scan_id: "550e8400-e29b-41d4-a716-446655440000",
    date: "2026-09-15",
    overall_score: 72,
    scan_count_this_month: 2,
    scans_remaining: 2,
  },
  {
    ...sampleScanResponse,
    scan_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    date: "2026-08-18",
    overall_score: 61,
    urgent_flag: false,
    primary_concern: "acne",
    conditions: sampleConditions.map((c) => ({ ...c, confidence: Math.max(0.42, c.confidence - 0.18) })),
    scan_count_this_month: 1,
    scans_remaining: 3,
  },
  {
    ...sampleScanResponse,
    scan_id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    date: "2026-07-20",
    overall_score: 54,
    urgent_flag: true,
    primary_concern: "acne",
    conditions: sampleConditions.map((c) => ({
      ...c,
      severity: c.id === "acne" ? "severe" : c.severity,
      confidence: Math.min(0.96, c.confidence + 0.12),
    })),
    scan_count_this_month: 4,
    scans_remaining: 0,
  },
];
