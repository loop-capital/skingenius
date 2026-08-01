/**
 * Facial Aesthetics — Scoring Engine
 *
 * Compute aesthetic scores from facial metrics + population baseline data.
 * All scores are 0-100. Higher = better/more ideal.
 *
 * Algorithm:
 * 1. Compare metrics to population-specific ideals
 * 2. Score each dimension independently
 * 3. Weight and composite into overall score
 * 4. Identify improvement potential
 */

import {
  FacialMetrics,
  AestheticScores,
  ImprovementPotential,
  PopulationBaseline,
  BrowMetrics,
  EyeMetrics,
  NoseMetrics,
  LipMetrics,
  JawMetrics,
  SkinQualityMetrics,
} from "@/types/facial-aesthetics";
import { getPopulationBaseline } from "./population-data";

// =============================================================================
// SCORING CONSTANTS
// =============================================================================

/** Weights for overall score composite */
const OVERALL_WEIGHTS = {
  proportions: 0.2,
  symmetry: 0.2,
  feature_balance: 0.15,
  skin_quality: 0.2,
  perceived_youth: 0.15,
  femininity: 0.05, // optional dimension
  averageness: 0.05, // optional dimension
} as const;

/** Feature score weights (how much each sub-metric contributes) */
const FEATURE_WEIGHTS = {
  brow: {
    thickness: 0.15,
    fullness: 0.2,
    arch_angle: 0.15,
    position: 0.15,
    symmetry: 0.2,
    tail_drop: 0.1,
    interbrow_distance: 0.05,
  },
  eyes: {
    size: 0.2,
    symmetry: 0.2,
    upper_eyelid_exposure: 0.15,
    under_eye_hollowness: 0.15,
    canthal_tilt: 0.15,
    under_eye_pigmentation: 0.1,
    width: 0.03,
    height: 0.02,
  },
  nose: {
    width_ratio: 0.25,
    tip_projection: 0.2,
    tip_angle: 0.15,
    symmetry: 0.2,
    bridge_width: 0.1,
    nostril_flare: 0.1,
  },
  lips: {
    fullness: 0.25,
    ratio: 0.2,
    symmetry: 0.2,
    cupid_bow_definition: 0.15,
    vermilion_exposure: 0.1,
    width: 0.1,
  },
  jaw: {
    angle: 0.25,
    definition: 0.25,
    chin_projection: 0.2,
    symmetry: 0.15,
    width: 0.1,
    v_angle: 0.05,
  },
  skin: {
    texture_smoothness: 0.25,
    pigmentation_evenness: 0.2,
    elasticity_visual: 0.2,
    pore_visibility: 0.15,
    vascularity: 0.1,
    oiliness: 0.1,
  },
} as const;

// =============================================================================
// SCORING UTILITIES
// =============================================================================

/**
 * Clamp a value to 0-100 range.
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Convert a raw deviation from ideal to a 0-100 score.
 * @param value - measured value
 * @param ideal - ideal value
 * @param tolerance - deviation that yields score=0
 */
function scoreFromDeviation(
  value: number,
  ideal: number,
  tolerance: number,
): number {
  const deviation = Math.abs(value - ideal);
  return clampScore(100 - (deviation / tolerance) * 100);
}

/**
 * Score a metric where higher is always better (no ideal, just maximize).
 */
function scoreHigherBetter(value: number, maxExpected: number): number {
  return clampScore((value / maxExpected) * 100);
}

/**
 * Score a metric where lower is always better.
 */
function scoreLowerBetter(value: number, maxExpected: number): number {
  return clampScore(100 - (value / maxExpected) * 100);
}

// =============================================================================
// DIMENSION SCORING
// =============================================================================

/**
 * Score facial proportions (thirds + fifths harmony).
 */
function scoreProportions(
  metrics: FacialMetrics,
  baseline: PopulationBaseline,
): number {
  const { facial_thirds, facial_fifths } = metrics;

  // Thirds: compare to population ideal
  const thirdsIdeal = baseline.facial_thirds_ideal;
  const thirdsDeviation = [
    Math.abs(facial_thirds.upper - thirdsIdeal[0]),
    Math.abs(facial_thirds.middle - thirdsIdeal[1]),
    Math.abs(facial_thirds.lower - thirdsIdeal[2]),
  ];
  const thirdsScore = clampScore(
    100 - (thirdsDeviation.reduce((a, b) => a + b, 0) / 3) * 300,
  );

  // Fifths: compare to population ideal
  const fifthsIdeal = baseline.facial_fifths_ideal;
  const fifthsDeviation = [
    Math.abs(facial_fifths.left_outer - fifthsIdeal[0]),
    Math.abs(facial_fifths.left_inner - fifthsIdeal[1]),
    Math.abs(facial_fifths.center - fifthsIdeal[2]),
    Math.abs(facial_fifths.right_inner - fifthsIdeal[3]),
    Math.abs(facial_fifths.right_outer - fifthsIdeal[4]),
  ];
  const fifthsScore = clampScore(
    100 - (fifthsDeviation.reduce((a, b) => a + b, 0) / 5) * 400,
  );

  // Weight thirds more heavily (vertical proportions more noticeable)
  return clampScore(thirdsScore * 0.6 + fifthsScore * 0.4);
}

/**
 * Score overall symmetry.
 */
function scoreSymmetry(metrics: FacialMetrics): number {
  const { symmetry } = metrics;
  const weights = {
    overall: 0.3,
    brow_symmetry: 0.1,
    eye_symmetry: 0.2,
    nose_symmetry: 0.15,
    lip_symmetry: 0.15,
    jaw_symmetry: 0.1,
  };

  return clampScore(
    symmetry.overall * weights.overall +
      symmetry.brow_symmetry * weights.brow_symmetry +
      symmetry.eye_symmetry * weights.eye_symmetry +
      symmetry.nose_symmetry * weights.nose_symmetry +
      symmetry.lip_symmetry * weights.lip_symmetry +
      symmetry.jaw_symmetry * weights.jaw_symmetry,
  );
}

/**
 * Score feature balance (homogeneity).
 */
function scoreFeatureBalance(metrics: FacialMetrics): number {
  const { features } = metrics;

  // Feature balance: individual feature scores should be similar
  // Large disparities between features = lower balance score
  const featureScores = [
    scoreBrow(features.brow),
    scoreEyes(features.eyes),
    scoreNose(features.nose),
    scoreLips(features.lips),
    scoreJaw(features.jaw),
    scoreSkin(features.skin),
  ];

  const avg = featureScores.reduce((a, b) => a + b, 0) / featureScores.length;
  const variance =
    featureScores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
    featureScores.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher balance
  // A perfectly balanced face has stdDev = 0 (score = 100)
  // A very unbalanced face might have stdDev = 30 (score = 40)
  const balanceScore = clampScore(100 - stdDev * 2);

  // Blend with dimensions homogeneity
  return clampScore(balanceScore * 0.7 + metrics.dimensions.homogeneity * 0.3);
}

/**
 * Score skin quality composite.
 */
function scoreSkinQuality(metrics: FacialMetrics): number {
  const { skin } = metrics.features;
  const weights = FEATURE_WEIGHTS.skin;

  return clampScore(
    skin.texture_smoothness * weights.texture_smoothness +
      (100 - skin.pore_visibility) * weights.pore_visibility + // invert: lower visibility = better
      skin.pigmentation_evenness * weights.pigmentation_evenness +
      (100 - skin.vascularity) * weights.vascularity + // invert
      (100 - skin.oiliness) * weights.oiliness + // invert: less oily = better
      skin.elasticity_visual * weights.elasticity_visual,
  );
}

// =============================================================================
// FEATURE-SPECIFIC SCORING
// =============================================================================

function scoreBrow(brow: BrowMetrics): number {
  const w = FEATURE_WEIGHTS.brow;
  return clampScore(
    brow.thickness * w.thickness +
      brow.fullness * w.fullness +
      scoreFromDeviation(brow.arch_angle, 15, 30) * w.arch_angle +
      scoreFromDeviation(brow.position, 0.05, 0.08) * w.position +
      brow.symmetry * w.symmetry +
      scoreLowerBetter(brow.tail_drop, 15) * w.tail_drop +
      scoreFromDeviation(brow.interbrow_distance, 0.2, 0.15) *
        w.interbrow_distance,
  );
}

function scoreEyes(eyes: EyeMetrics): number {
  const w = FEATURE_WEIGHTS.eyes;
  return clampScore(
    eyes.size * w.size +
      eyes.symmetry * w.symmetry +
      eyes.upper_eyelid_exposure * w.upper_eyelid_exposure +
      scoreLowerBetter(eyes.under_eye_hollowness, 80) * w.under_eye_hollowness +
      scoreFromDeviation(eyes.canthal_tilt, 4, 10) * w.canthal_tilt +
      scoreLowerBetter(eyes.under_eye_pigmentation, 80) *
        w.under_eye_pigmentation +
      eyes.width * w.width * 100 +
      eyes.height * w.height * 100,
  );
}

function scoreNose(nose: NoseMetrics, baseline?: PopulationBaseline): number {
  const w = FEATURE_WEIGHTS.nose;
  const idealWidth = baseline?.nose_width_ratio_ideal ?? 0.24;

  return clampScore(
    scoreFromDeviation(nose.width_ratio, idealWidth, 0.08) * w.width_ratio +
      nose.tip_projection * w.tip_projection * 1000 +
      scoreFromDeviation(nose.tip_angle, 85, 20) * w.tip_angle +
      nose.symmetry * w.symmetry +
      scoreLowerBetter(nose.bridge_width, 0.1) * w.bridge_width +
      scoreLowerBetter(nose.nostril_flare, 60) * w.nostril_flare,
  );
}

function scoreLips(lips: LipMetrics, baseline?: PopulationBaseline): number {
  const w = FEATURE_WEIGHTS.lips;
  const idealRatio = baseline?.lip_ratio_ideal ?? 1.618;
  const idealFullness = baseline?.lip_fullness_ideal ?? 55;

  return clampScore(
    scoreFromDeviation(lips.fullness, idealFullness, 40) * w.fullness +
      scoreFromDeviation(lips.ratio, idealRatio, 0.8) * w.ratio +
      lips.symmetry * w.symmetry +
      lips.cupid_bow_definition * w.cupid_bow_definition +
      lips.vermilion_exposure * w.vermilion_exposure +
      scoreFromDeviation(lips.width, 0.3, 0.1) * w.width,
  );
}

function scoreJaw(jaw: JawMetrics, baseline?: PopulationBaseline): number {
  const w = FEATURE_WEIGHTS.jaw;
  const idealAngle = baseline?.jaw_angle_ideal ?? 125;

  return clampScore(
    scoreFromDeviation(jaw.angle, idealAngle, 25) * w.angle +
      jaw.definition * w.definition +
      jaw.chin_projection * w.chin_projection * 1000 +
      jaw.symmetry * w.symmetry +
      scoreFromDeviation(jaw.width, 0.4, 0.15) * w.width +
      scoreFromDeviation(jaw.v_angle, 45, 20) * w.v_angle,
  );
}

function scoreSkin(skin: SkinQualityMetrics): number {
  const w = FEATURE_WEIGHTS.skin;
  return clampScore(
    skin.texture_smoothness * w.texture_smoothness +
      (100 - skin.pore_visibility) * w.pore_visibility +
      skin.pigmentation_evenness * w.pigmentation_evenness +
      (100 - skin.vascularity) * w.vascularity +
      (100 - skin.oiliness) * w.oiliness +
      skin.elasticity_visual * w.elasticity_visual,
  );
}

// =============================================================================
// IMPROVEMENT POTENTIAL
// =============================================================================

/**
 * Identify which features have the most room for improvement.
 */
function computeImprovementPotential(
  scores: Omit<AestheticScores, "improvement_potential">,
  metrics: FacialMetrics,
): ImprovementPotential {
  const featureScores = [
    { name: "brow", score: scores.brow_score },
    { name: "eyes", score: scores.eye_score },
    { name: "nose", score: scores.nose_score },
    { name: "lips", score: scores.lip_score },
    { name: "jaw", score: scores.jaw_score },
    { name: "skin", score: scores.skin_quality },
  ];

  // Sort by score ascending (lowest = most potential)
  const sorted = [...featureScores].sort((a, b) => a.score - b.score);

  const highestImpact = sorted[0]?.name ?? "skin";

  // Quick wins: features with score 40-65 (moderate room, easy to improve)
  const quickWins = sorted
    .filter((f) => f.score >= 35 && f.score <= 65)
    .slice(0, 3)
    .map((f) => f.name);

  // Long term: features with score < 40 (need significant work)
  const longTerm = sorted
    .filter((f) => f.score < 40)
    .slice(0, 2)
    .map((f) => f.name);

  return {
    highest_impact: highestImpact,
    quick_wins: quickWins.length > 0 ? quickWins : [highestImpact],
    long_term: longTerm.length > 0 ? longTerm : [],
  };
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

/**
 * Compute all aesthetic scores from facial metrics.
 *
 * @param metrics - Computed facial metrics
 * @param population - Population code for ethnicity-aware scoring (e.g., "east_asian")
 * @param age - User age in years (affects perceived youth scoring)
 * @param gender - User gender (affects femininity/dimorphism scoring)
 * @returns Complete AestheticScores object
 */
export function computeAestheticScores(
  metrics: FacialMetrics,
  population: string = "global",
  age?: number,
  gender?: string,
): AestheticScores {
  const baseline = getPopulationBaseline(population);

  // Compute dimension scores
  const proportions = scoreProportions(metrics, baseline);
  const symmetry = scoreSymmetry(metrics);
  const featureBalance = scoreFeatureBalance(metrics);
  const skinQuality = scoreSkinQuality(metrics);

  // Perceived youth: estimated age from features
  const perceivedYouth = metrics.dimensions.perceived_youth;

  // Feature-specific scores
  const browScore = scoreBrow(metrics.features.brow);
  const eyeScore = scoreEyes(metrics.features.eyes);
  const noseScore = scoreNose(metrics.features.nose, baseline);
  const lipScore = scoreLips(metrics.features.lips, baseline);
  const jawScore = scoreJaw(metrics.features.jaw, baseline);

  // Adjust femininity based on gender preference if provided
  let femininity = metrics.dimensions.femininity;
  if (gender === "male") {
    // For male users, score how well their features align with masculine ideals
    // Masculine = higher jaw definition, lower brow position, stronger nose
    femininity = 100 - femininity;
  }

  const averageness = metrics.dimensions.averageness;

  // Overall: weighted composite
  const overall = clampScore(
    proportions * OVERALL_WEIGHTS.proportions +
      symmetry * OVERALL_WEIGHTS.symmetry +
      featureBalance * OVERALL_WEIGHTS.feature_balance +
      skinQuality * OVERALL_WEIGHTS.skin_quality +
      clampScore(100 - Math.abs((age ?? 30) - perceivedYouth) * 3) *
        OVERALL_WEIGHTS.perceived_youth +
      femininity * OVERALL_WEIGHTS.femininity +
      averageness * OVERALL_WEIGHTS.averageness,
  );

  const baseScores: Omit<AestheticScores, "improvement_potential"> = {
    overall,
    proportions,
    symmetry,
    feature_balance: featureBalance,
    skin_quality: skinQuality,
    perceived_youth: perceivedYouth,
    femininity,
    averageness,
    brow_score: browScore,
    eye_score: eyeScore,
    nose_score: noseScore,
    lip_score: lipScore,
    jaw_score: jawScore,
  };

  const improvementPotential = computeImprovementPotential(baseScores, metrics);

  return {
    ...baseScores,
    improvement_potential: improvementPotential,
  };
}

/**
 * Re-score with updated population baseline.
 * Useful when user changes ethnicity preference.
 */
export function rescoreWithPopulation(
  metrics: FacialMetrics,
  newPopulation: string,
  age?: number,
  gender?: string,
): AestheticScores {
  return computeAestheticScores(metrics, newPopulation, age, gender);
}

/**
 * Get a human-readable interpretation of a score.
 */
export function interpretScore(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  if (score >= 40) return "Below Average";
  return "Needs Attention";
}

/**
 * Get color for score visualization.
 */
export function scoreColor(score: number): string {
  if (score >= 85) return "#22c55e"; // green-500
  if (score >= 70) return "#84cc16"; // lime-500
  if (score >= 55) return "#eab308"; // yellow-500
  if (score >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}
