/**
 * mockOnDeviceResponse.ts — Hardcoded on-device scan response for POST /api/v1/scan.
 *
 * In production this is replaced by an actual TensorFlow Lite model.
 * For the free-tier MVP it returns deterministic, spec-compliant sample data.
 */

import { V1DetectedCondition, V1SkinZone, V1Recommendation, V1ProductRecommendation } from "@/types/api";

export interface MockOnDeviceResult {
  conditions: V1DetectedCondition[];
  skinZones: V1SkinZone[];
  overallScore: number;
  primaryConcern: string;
  urgentFlag: boolean;
  fitzpatrickType: string;
  recommendations: V1Recommendation[];
  productRecommendations: V1ProductRecommendation[];
  processingTimeMs: number;
}

export function buildMockOnDeviceResponse(
  skinTone = 4,
  scanType: "skin_health" | "aesthetics" | "both" = "skin_health"
): MockOnDeviceResult {
  const conditions: V1DetectedCondition[] = [
    {
      id: "acne",
      name: "Acne",
      confidence: 0.87,
      severity: "moderate",
      affected_areas: ["cheeks", "chin"],
    },
    {
      id: "hyperpigmentation",
      name: "Hyperpigmentation",
      confidence: 0.72,
      severity: "mild",
      affected_areas: ["cheeks"],
    },
    {
      id: "dryness",
      name: "Dryness / Dehydration",
      confidence: 0.65,
      severity: "mild",
      affected_areas: ["forehead", "around-eyes"],
    },
  ];

  // Add aesthetics-only concerns when requested
  if (scanType === "aesthetics" || scanType === "both") {
    conditions.push({
      id: "uneven_texture",
      name: "Uneven Texture",
      confidence: 0.58,
      severity: "mild",
      affected_areas: ["forehead", "nose"],
    });
  }

  const skinZones: V1SkinZone[] = [
    {
      zone: "cheeks",
      primary_concern: "Acne",
      description: "Moderate acne with mild post-inflammatory hyperpigmentation.",
      severity: "moderate",
      confidence: 0.87,
    },
    {
      zone: "chin",
      primary_concern: "Acne",
      description: "Active comedonal and inflammatory lesions.",
      severity: "moderate",
      confidence: 0.8,
    },
    {
      zone: "forehead",
      primary_concern: "Dryness / Dehydration",
      description: "Mild dehydration lines and texture irregularity.",
      severity: "mild",
      confidence: 0.65,
    },
  ];

  const recommendations: V1Recommendation[] = [
    {
      type: "ingredient",
      name: "Salicylic Acid",
      evidence_level: "A",
      concentration: "2%",
      reasoning: "Beta-hydroxy acid that penetrates pores and reduces acne lesions.",
    },
    {
      type: "ingredient",
      name: "Niacinamide",
      evidence_level: "A",
      concentration: "5%",
      reasoning: "Improves barrier function and reduces post-inflammatory hyperpigmentation.",
    },
    {
      type: "ingredient",
      name: "Hyaluronic Acid",
      evidence_level: "B",
      concentration: "1-2%",
      reasoning: "Hydrates the stratum corneum without occluding pores.",
    },
  ];

  const productRecommendations: V1ProductRecommendation[] = [
    {
      product_id: "p-001",
      name: "Salicylic Acid Cleanser",
      brand: "CeraVe",
      category: "cleanser",
      match_score: 94,
      price: "$14.99",
      reasoning: "Contains 2% salicylic acid plus barrier-supporting ceramides.",
    },
    {
      product_id: "p-005",
      name: "Barrier Repair Moisturizer",
      brand: "Paula's Choice",
      category: "moisturizer",
      match_score: 89,
      price: "$39.00",
      reasoning: "Niacinamide and ceramides support acne-prone, dehydrated skin.",
    },
    {
      product_id: "p-006",
      name: "UV Clear Broad-Spectrum SPF 46",
      brand: "EltaMD",
      category: "sunscreen",
      match_score: 92,
      price: "$41.00",
      reasoning: "Zinc oxide + niacinamide helps prevent hyperpigmentation darkening.",
    },
  ];

  return {
    conditions,
    skinZones,
    overallScore: 72,
    primaryConcern: "acne",
    urgentFlag: false,
    fitzpatrickType: romanizeFitzpatrick(skinTone),
    recommendations,
    productRecommendations,
    processingTimeMs: 450,
  };
}

function romanizeFitzpatrick(type: number): string {
  const map = ["I", "II", "III", "IV", "V", "VI"];
  return map[Math.max(1, Math.min(6, type)) - 1];
}
