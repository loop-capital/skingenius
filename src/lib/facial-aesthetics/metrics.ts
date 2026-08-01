/**
 * Facial Aesthetics — Metric Computation Engine
 *
 * Pure functions that compute derived metrics from raw 106-point facial landmarks.
 * All functions are side-effect-free: input landmarks → output numbers.
 *
 * MediaPipe Face Mesh 106-point landmark indices (subset):
 * - Brow: 0-19 (left), 20-39 (right)
 * - Eyes: 40-59 (left), 60-79 (right)
 * - Nose: 80-99
 * - Lips: 100-119
 * - Jaw: 120-135
 * - Face contour: 136-145
 *
 * Note: These are computed from normalized (0-1) landmark coordinates.
 * Actual indices may vary based on the specific landmark model used.
 * The functions below use generic landmark accessors that can be adapted
 * to the actual point mapping from Gemma 4 Vision output.
 */

import {
  Vector3,
  FacialLandmarks,
  FacialMetrics,
  FacialThirds,
  FacialFifths,
  SymmetryMetrics,
  BrowMetrics,
  EyeMetrics,
  EyeShape,
  NoseMetrics,
  LipMetrics,
  JawMetrics,
  SkinQualityMetrics,
  AestheticDimensions,
} from "@/types/facial-aesthetics";

// =============================================================================
// GEOMETRY UTILITIES
// =============================================================================

/**
 * Euclidean distance between two 3D points.
 */
function distance(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Angle between three points (in degrees).
 * Vertex is the middle point.
 */
function angle3p(a: Vector3, vertex: Vector3, b: Vector3): number {
  const va = { x: a.x - vertex.x, y: a.y - vertex.y, z: a.z - vertex.z };
  const vb = { x: b.x - vertex.x, y: b.y - vertex.y, z: b.z - vertex.z };
  const dot = va.x * vb.x + va.y * vb.y + va.z * vb.z;
  const magA = Math.sqrt(va.x * va.x + va.y * va.y + va.z * va.z);
  const magB = Math.sqrt(vb.x * vb.x + vb.y * vb.y + vb.z * vb.z);
  if (magA === 0 || magB === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Clamp a number to [0, 100].
 */
function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/**
 * Clamp a number to [0, 1].
 */
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Convert a deviation from ideal to a 0-100 score.
 * Lower deviation = higher score.
 */
function deviationToScore(deviation: number, maxDeviation: number): number {
  return clampScore(100 - (deviation / maxDeviation) * 100);
}

// =============================================================================
// FACIAL THIRDS
// =============================================================================

/**
 * Compute facial thirds proportions.
 *
 * Uses approximate landmark positions:
 * - Hairline: top of face contour
 * - Brow: top of brow ridge
 * - Nose base: bottom of nose
 * - Chin: bottom of face
 */
export function computeFacialThirds(landmarks: Vector3[]): FacialThirds {
  // Approximate key points from face contour
  const top = landmarks[0]; // approximate top of face
  const bottom = landmarks[landmarks.length - 1]; // approximate chin
  const totalHeight = distance(top, bottom);

  // Find brow ridge (approximate: around 20% down from top)
  const browIndex = Math.floor(landmarks.length * 0.2);
  const brow = landmarks[browIndex] ?? top;

  // Find nose base (approximate: around 55% down from top)
  const noseBaseIndex = Math.floor(landmarks.length * 0.55);
  const noseBase = landmarks[noseBaseIndex] ?? bottom;

  const upperHeight = distance(top, brow);
  const middleHeight = distance(brow, noseBase);
  const lowerHeight = distance(noseBase, bottom);

  const total = upperHeight + middleHeight + lowerHeight || 1;

  const upper = upperHeight / total;
  const middle = middleHeight / total;
  const lower = lowerHeight / total;

  // Harmony: how close to 0.33 each
  const ideal = 1 / 3;
  const deviations = [
    Math.abs(upper - ideal),
    Math.abs(middle - ideal),
    Math.abs(lower - ideal),
  ];
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 3;
  const harmonyScore = deviationToScore(avgDeviation, 0.15);

  return {
    upper: clamp01(upper),
    middle: clamp01(middle),
    lower: clamp01(lower),
    harmony_score: harmonyScore,
  };
}

// =============================================================================
// FACIAL FIFTHS
// =============================================================================

/**
 * Compute facial fifths proportions (horizontal).
 *
 * Divides face width into 5 equal zones from left ear to right ear.
 * Eyes should be centered in the middle three fifths.
 */
export function computeFacialFifths(landmarks: Vector3[]): FacialFifths {
  // Approximate face width from outermost points
  const leftmost = landmarks.reduce(
    (min, p) => (p.x < min.x ? p : min),
    landmarks[0],
  );
  const rightmost = landmarks.reduce(
    (max, p) => (p.x > max.x ? p : max),
    landmarks[0],
  );
  const totalWidth = rightmost.x - leftmost.x || 1;

  // Divide into 5 zones
  const zoneWidth = totalWidth / 5;
  const zones = [0, 1, 2, 3, 4].map((i) => {
    const start = leftmost.x + i * zoneWidth;
    const end = start + zoneWidth;
    // Count points in zone as proxy for width
    const pointsInZone = landmarks.filter(
      (p) => p.x >= start && p.x < end,
    ).length;
    return pointsInZone / landmarks.length;
  });

  const [left_outer, left_inner, center, right_inner, right_outer] = zones;

  // Harmony: how close to equal distribution
  const ideal = 0.2;
  const deviations = zones.map((z) => Math.abs(z - ideal));
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 5;
  const harmonyScore = deviationToScore(avgDeviation, 0.1);

  return {
    left_outer: clamp01(left_outer),
    left_inner: clamp01(left_inner),
    center: clamp01(center),
    right_inner: clamp01(right_inner),
    right_outer: clamp01(right_outer),
    harmony_score: harmonyScore,
  };
}

// =============================================================================
// SYMMETRY
// =============================================================================

/**
 * Compute symmetry by comparing left and right halves.
 * Mirror left side, compute point-by-point deviation from right side.
 */
export function computeSymmetry(landmarks: Vector3[]): SymmetryMetrics {
  const centerX = landmarks.reduce((sum, p) => sum + p.x, 0) / landmarks.length;

  // Pair left-right points (approximation: sort by distance from center, pair closest)
  const leftPoints = landmarks
    .filter((p) => p.x < centerX)
    .sort((a, b) => b.x - a.x);
  const rightPoints = landmarks
    .filter((p) => p.x > centerX)
    .sort((a, b) => a.x - b.x);

  const pairs = Math.min(leftPoints.length, rightPoints.length);
  let totalDeviation = 0;

  for (let i = 0; i < pairs; i++) {
    const left = leftPoints[i];
    const right = rightPoints[i];
    // Mirror left point across center
    const mirroredLeft = {
      x: centerX - (left.x - centerX),
      y: left.y,
      z: left.z,
    };
    const dev = distance(mirroredLeft, right);
    totalDeviation += dev;
  }

  const avgDeviation = pairs > 0 ? totalDeviation / pairs : 0;
  const overall = deviationToScore(avgDeviation, 0.05);

  // Per-feature symmetry (simplified: use subsets of landmarks)
  const browSymmetry = computeFeatureSymmetry(landmarks, 0, 0.3); // upper face
  const eyeSymmetry = computeFeatureSymmetry(landmarks, 0.2, 0.5); // eye region
  const noseSymmetry = computeFeatureSymmetry(landmarks, 0.4, 0.6); // center
  const lipSymmetry = computeFeatureSymmetry(landmarks, 0.5, 0.7); // lower-mid
  const jawSymmetry = computeFeatureSymmetry(landmarks, 0.6, 1.0); // lower face

  return {
    overall,
    brow_symmetry: browSymmetry,
    eye_symmetry: eyeSymmetry,
    nose_symmetry: noseSymmetry,
    lip_symmetry: lipSymmetry,
    jaw_symmetry: jawSymmetry,
  };
}

/**
 * Compute symmetry for a subset of landmarks (by vertical position range).
 */
function computeFeatureSymmetry(
  landmarks: Vector3[],
  yStart: number,
  yEnd: number,
): number {
  const subset = landmarks.filter((p) => p.y >= yStart && p.y <= yEnd);
  if (subset.length < 2) return 50;

  const centerX = subset.reduce((sum, p) => sum + p.x, 0) / subset.length;
  const left = subset.filter((p) => p.x < centerX);
  const right = subset.filter((p) => p.x > centerX);

  if (left.length === 0 || right.length === 0) return 50;

  // Compare average distances from center
  const avgLeftDist =
    left.reduce((sum, p) => sum + Math.abs(p.x - centerX), 0) / left.length;
  const avgRightDist =
    right.reduce((sum, p) => sum + Math.abs(p.x - centerX), 0) / right.length;

  const deviation = Math.abs(avgLeftDist - avgRightDist);
  return deviationToScore(deviation, 0.05);
}

// =============================================================================
// BROW METRICS
// =============================================================================

/**
 * Compute brow metrics from landmarks.
 * Uses upper face landmarks (approximate brow region).
 */
export function computeBrowMetrics(landmarks: Vector3[]): BrowMetrics {
  const browPoints = landmarks.slice(0, Math.floor(landmarks.length * 0.25));
  if (browPoints.length < 4) {
    return {
      thickness: 50,
      fullness: 50,
      arch_angle: 15,
      position: 0.05,
      symmetry: 50,
      tail_drop: 5,
      interbrow_distance: 0.2,
    };
  }

  const leftBrow = browPoints.slice(0, Math.floor(browPoints.length / 2));
  const rightBrow = browPoints.slice(Math.floor(browPoints.length / 2));

  // Thickness: vertical span of brow points
  const thickness = clampScore(
    (Math.max(...browPoints.map((p) => p.y)) -
      Math.min(...browPoints.map((p) => p.y))) *
      500,
  );

  // Fullness: density proxy (number of points / area)
  const area =
    (Math.max(...browPoints.map((p) => p.x)) -
      Math.min(...browPoints.map((p) => p.x))) *
    (Math.max(...browPoints.map((p) => p.y)) -
      Math.min(...browPoints.map((p) => p.y)));
  const fullness =
    area > 0 ? clampScore((browPoints.length / area) * 0.001) : 50;

  // Arch angle: angle at highest point
  const highestBrow = browPoints.reduce(
    (max, p) => (p.y < max.y ? p : max),
    browPoints[0],
  );
  const leftEnd = leftBrow.reduce(
    (min, p) => (p.x < min.x ? p : min),
    leftBrow[0],
  );
  const rightEnd = rightBrow.reduce(
    (max, p) => (p.x > max.x ? p : max),
    rightBrow[0],
  );
  const archAngle = angle3p(leftEnd, highestBrow, rightEnd);

  // Position: distance from eye region (approximate)
  const eyeRegionY = landmarks[Math.floor(landmarks.length * 0.35)]?.y ?? 0.3;
  const position = Math.abs(highestBrow.y - eyeRegionY);

  // Symmetry
  const symmetry = computeFeatureSymmetry(browPoints, 0, 0.25);

  // Tail drop: how much lower the tail is than the head
  const leftTailDrop = leftEnd.y - highestBrow.y;
  const rightTailDrop = rightEnd.y - highestBrow.y;
  const tailDrop = ((leftTailDrop + rightTailDrop) / 2) * 180;

  // Interbrow distance: gap between inner brow edges
  const leftInner = leftBrow.reduce(
    (max, p) => (p.x > max.x ? p : max),
    leftBrow[0],
  );
  const rightInner = rightBrow.reduce(
    (min, p) => (p.x < min.x ? p : min),
    rightBrow[0],
  );
  const interbrow = Math.abs(rightInner.x - leftInner.x);

  return {
    thickness: clampScore(thickness),
    fullness: clampScore(fullness),
    arch_angle: clampScore(archAngle),
    position: clamp01(position),
    symmetry: clampScore(symmetry),
    tail_drop: clampScore(tailDrop),
    interbrow_distance: clamp01(interbrow),
  };
}

// =============================================================================
// EYE METRICS
// =============================================================================

/**
 * Compute eye metrics from landmarks.
 */
export function computeEyeMetrics(landmarks: Vector3[]): EyeMetrics {
  const eyeRegion = landmarks.slice(
    Math.floor(landmarks.length * 0.25),
    Math.floor(landmarks.length * 0.5),
  );
  if (eyeRegion.length < 6) {
    return {
      shape: "almond",
      size: 50,
      width: 0.15,
      height: 0.05,
      upper_eyelid_exposure: 50,
      under_eye_hollowness: 30,
      under_eye_pigmentation: 20,
      canthal_tilt: 4,
      symmetry: 50,
    };
  }

  const leftEye = eyeRegion.slice(0, Math.floor(eyeRegion.length / 2));
  const rightEye = eyeRegion.slice(Math.floor(eyeRegion.length / 2));

  // Size: area proxy
  const eyeWidth =
    Math.max(...eyeRegion.map((p) => p.x)) -
    Math.min(...eyeRegion.map((p) => p.x));
  const eyeHeight =
    Math.max(...eyeRegion.map((p) => p.y)) -
    Math.min(...eyeRegion.map((p) => p.y));
  const size = clampScore(eyeWidth * eyeHeight * 2000);

  // Width / Height
  const width = clamp01(eyeWidth);
  const height = clamp01(eyeHeight);

  // Shape detection (simplified)
  const aspectRatio = eyeHeight / (eyeWidth || 1);
  let shape: EyeShape = "almond";
  if (aspectRatio > 0.45) shape = "round";
  else if (aspectRatio < 0.25) shape = "hooded";

  // Canthal tilt: angle between inner and outer canthus
  const leftInner = leftEye.reduce(
    (min, p) => (p.x < min.x ? p : min),
    leftEye[0],
  );
  const leftOuter = leftEye.reduce(
    (max, p) => (p.x > max.x ? p : max),
    leftEye[0],
  );
  const rightInner = rightEye.reduce(
    (max, p) => (p.x > max.x ? p : max),
    rightEye[0],
  );
  const rightOuter = rightEye.reduce(
    (min, p) => (p.x < min.x ? p : min),
    rightEye[0],
  );

  const leftTilt =
    Math.atan2(leftInner.y - leftOuter.y, leftInner.x - leftOuter.x) *
    (180 / Math.PI);
  const rightTilt =
    Math.atan2(rightInner.y - rightOuter.y, rightInner.x - rightOuter.x) *
    (180 / Math.PI);
  const canthalTilt = (leftTilt + rightTilt) / 2;

  // Symmetry
  const symmetry = computeFeatureSymmetry(eyeRegion, 0.25, 0.5);

  return {
    shape,
    size: clampScore(size),
    width: clamp01(width),
    height: clamp01(height),
    upper_eyelid_exposure: clampScore(50 + (aspectRatio - 0.35) * 100), // proxy
    under_eye_hollowness: clampScore(30), // would need specialized detection
    under_eye_pigmentation: clampScore(20), // would need specialized detection
    canthal_tilt: clampScore(canthalTilt),
    symmetry: clampScore(symmetry),
  };
}

// =============================================================================
// NOSE METRICS
// =============================================================================

/**
 * Compute nose metrics from landmarks.
 */
export function computeNoseMetrics(landmarks: Vector3[]): NoseMetrics {
  const noseRegion = landmarks.slice(
    Math.floor(landmarks.length * 0.45),
    Math.floor(landmarks.length * 0.6),
  );
  if (noseRegion.length < 4) {
    return {
      width_ratio: 0.24,
      bridge_width: 0.05,
      tip_projection: 0.03,
      tip_angle: 85,
      nostril_flare: 30,
      symmetry: 50,
    };
  }

  const faceWidth =
    Math.max(...landmarks.map((p) => p.x)) -
      Math.min(...landmarks.map((p) => p.x)) || 1;

  const noseWidth =
    Math.max(...noseRegion.map((p) => p.x)) -
    Math.min(...noseRegion.map((p) => p.x));
  const widthRatio = noseWidth / faceWidth;

  const bridgeWidth = noseWidth * 0.3; // approximate

  // Tip projection: how far nose extends forward (z depth)
  const tip = noseRegion.reduce(
    (max, p) => (p.z > max.z ? p : max),
    noseRegion[0],
  );
  const tipProjection = tip.z;

  // Tip angle: approximate using top and bottom of nose
  const noseTop = noseRegion.reduce(
    (min, p) => (p.y < min.y ? p : min),
    noseRegion[0],
  );
  const noseBottom = noseRegion.reduce(
    (max, p) => (p.y > max.y ? p : max),
    noseRegion[0],
  );
  const tipAngle = angle3p(
    { x: noseTop.x - 0.05, y: noseTop.y, z: noseTop.z },
    noseTop,
    { x: noseTop.x + 0.05, y: noseTop.y, z: noseTop.z },
  );

  const symmetry = computeFeatureSymmetry(noseRegion, 0.45, 0.6);

  return {
    width_ratio: clamp01(widthRatio),
    bridge_width: clamp01(bridgeWidth / faceWidth),
    tip_projection: clamp01(tipProjection),
    tip_angle: clampScore(tipAngle),
    nostril_flare: clampScore(30), // would need specialized landmarks
    symmetry: clampScore(symmetry),
  };
}

// =============================================================================
// LIP METRICS
// =============================================================================

/**
 * Compute lip metrics from landmarks.
 */
export function computeLipMetrics(landmarks: Vector3[]): LipMetrics {
  const lipRegion = landmarks.slice(
    Math.floor(landmarks.length * 0.55),
    Math.floor(landmarks.length * 0.7),
  );
  if (lipRegion.length < 4) {
    return {
      fullness: 50,
      ratio: 1.618,
      width: 0.3,
      cupid_bow_definition: 50,
      symmetry: 50,
      vermilion_exposure: 50,
    };
  }

  const faceWidth =
    Math.max(...landmarks.map((p) => p.x)) -
      Math.min(...landmarks.map((p) => p.x)) || 1;

  const lipWidth =
    Math.max(...lipRegion.map((p) => p.x)) -
    Math.min(...lipRegion.map((p) => p.x));
  const width = lipWidth / faceWidth;

  // Fullness: volume proxy (height * width)
  const lipHeight =
    Math.max(...lipRegion.map((p) => p.y)) -
    Math.min(...lipRegion.map((p) => p.y));
  const fullness = clampScore(lipHeight * lipWidth * 5000);

  // Ratio: upper to lower (approximate by splitting at midpoint)
  const midY =
    (Math.max(...lipRegion.map((p) => p.y)) +
      Math.min(...lipRegion.map((p) => p.y))) /
    2;
  const upperLip = lipRegion.filter((p) => p.y < midY);
  const lowerLip = lipRegion.filter((p) => p.y >= midY);
  const upperHeight =
    upperLip.length > 0
      ? Math.max(...upperLip.map((p) => p.y)) -
        Math.min(...upperLip.map((p) => p.y))
      : 0;
  const lowerHeight =
    lowerLip.length > 0
      ? Math.max(...lowerLip.map((p) => p.y)) -
        Math.min(...lowerLip.map((p) => p.y))
      : 0;
  const ratio = lowerHeight > 0 ? upperHeight / lowerHeight : 1;

  const symmetry = computeFeatureSymmetry(lipRegion, 0.55, 0.7);

  return {
    fullness: clampScore(fullness),
    ratio: ratio > 0 ? ratio : 1,
    width: clamp01(width),
    cupid_bow_definition: clampScore(50), // would need precise cupid bow landmarks
    symmetry: clampScore(symmetry),
    vermilion_exposure: clampScore(lipHeight * 200), // proxy
  };
}

// =============================================================================
// JAW METRICS
// =============================================================================

/**
 * Compute jaw metrics from landmarks.
 */
export function computeJawMetrics(landmarks: Vector3[]): JawMetrics {
  const jawRegion = landmarks.slice(Math.floor(landmarks.length * 0.7));
  if (jawRegion.length < 4) {
    return {
      angle: 125,
      width: 0.4,
      definition: 50,
      chin_projection: 0.05,
      gonial_angle: 125,
      v_angle: 45,
      symmetry: 50,
    };
  }

  const faceWidth =
    Math.max(...landmarks.map((p) => p.x)) -
      Math.min(...landmarks.map((p) => p.x)) || 1;
  const jawWidth =
    Math.max(...jawRegion.map((p) => p.x)) -
    Math.min(...jawRegion.map((p) => p.x));
  const width = jawWidth / faceWidth;

  // Jaw angle: angle at jaw corners (gonial angle proxy)
  const leftCorner = jawRegion.reduce(
    (min, p) => (p.x < min.x ? p : min),
    jawRegion[0],
  );
  const rightCorner = jawRegion.reduce(
    (max, p) => (p.x > max.x ? p : max),
    jawRegion[0],
  );
  const chin = jawRegion.reduce(
    (max, p) => (p.y > max.y ? p : max),
    jawRegion[0],
  );

  const angle = angle3p(leftCorner, chin, rightCorner);

  // Definition: how sharp the jawline (contrast between jaw and neck)
  const definition = clampScore(180 - angle);

  // Chin projection: how far forward chin projects
  const chinProjection = chin.z;

  // Gonial angle: angle at jaw corners (same as angle here, simplified)
  const gonialAngle = angle;

  // V-angle: angle between jaw corners and chin (smaller = more V-shaped)
  const vAngle = angle;

  return {
    angle: clampScore(angle),
    width: clamp01(width),
    definition: clampScore(definition),
    chin_projection: clamp01(chinProjection),
    gonial_angle: clampScore(gonialAngle),
    v_angle: clampScore(vAngle),
    symmetry: clampScore(50), // Simplified — would need bilateral landmark comparison
  };
}

// =============================================================================
// SKIN QUALITY METRICS
// =============================================================================

/**
 * Compute skin quality metrics from landmarks + image analysis.
 *
 * NOTE: These are visual estimates from the image data.
 * True values require pixel-level analysis of the original photo.
 * This is a placeholder that will be enhanced when image texture data
 * is passed alongside landmarks.
 */
export function computeSkinQualityMetrics(
  _landmarks: Vector3[],
  _imageTextureData?: {
    textureScore: number;
    poreScore: number;
    pigmentationScore: number;
    vascularityScore: number;
    oilinessScore: number;
    elasticityScore: number;
  },
): SkinQualityMetrics {
  // If texture data is provided, use it; otherwise return neutral values
  if (_imageTextureData) {
    return {
      texture_smoothness: clampScore(_imageTextureData.textureScore),
      pore_visibility: clampScore(_imageTextureData.poreScore),
      pigmentation_evenness: clampScore(_imageTextureData.pigmentationScore),
      vascularity: clampScore(_imageTextureData.vascularityScore),
      oiliness: clampScore(_imageTextureData.oilinessScore),
      elasticity_visual: clampScore(_imageTextureData.elasticityScore),
    };
  }

  // Return neutral baseline when no texture data available
  // These will be populated by the image analysis pipeline
  return {
    texture_smoothness: 50,
    pore_visibility: 50,
    pigmentation_evenness: 50,
    vascularity: 50,
    oiliness: 50,
    elasticity_visual: 50,
  };
}

// =============================================================================
// AESTHETIC DIMENSIONS
// =============================================================================

/**
 * Compute high-level aesthetic dimensions from metrics.
 */
export function computeAestheticDimensions(
  metrics: FacialMetrics,
): AestheticDimensions {
  const { features, symmetry, facial_thirds, facial_fifths } = metrics;

  // Femininity: combination of soft angles, fuller lips, higher brows, smaller jaw
  const femininity = clampScore(
    features.brow.position * 500 +
      features.lips.fullness * 0.3 +
      (180 - features.jaw.angle) * 0.5 +
      features.eyes.canthal_tilt * 3,
  );

  // Averageness: how close to population mean (proxied by proportion harmony)
  const averageness = clampScore(
    (facial_thirds.harmony_score + facial_fifths.harmony_score) / 2,
  );

  // Perceived youth: combination of skin quality, eye openness, lip fullness, jaw definition
  const perceivedYouth =
    25 +
    clampScore(
      features.skin.texture_smoothness * 0.3 +
        features.eyes.upper_eyelid_exposure * 0.2 +
        features.lips.fullness * 0.15 +
        features.jaw.definition * 0.15 +
        (100 - features.jaw.angle) * 0.2,
    ) *
      0.6;

  // Homogeneity: how well all features work together
  const featureScores = [
    features.brow.symmetry,
    features.eyes.symmetry,
    features.nose.symmetry,
    features.lips.symmetry,
    features.jaw.symmetry,
  ];
  const avgSymmetry =
    featureScores.reduce((a, b) => a + b, 0) / featureScores.length;
  const homogeneity = clampScore(
    avgSymmetry * 0.5 +
      facial_thirds.harmony_score * 0.25 +
      facial_fifths.harmony_score * 0.25,
  );

  // Dimorphism balance: how balanced masculine/feminine traits are
  const dimorphismBalance = clampScore(100 - Math.abs(femininity - 50) * 2);

  return {
    femininity,
    averageness,
    perceived_youth: clampScore(perceivedYouth),
    homogeneity,
    dimorphism_balance: dimorphismBalance,
  };
}

// =============================================================================
// MASTER COMPUTE FUNCTION
// =============================================================================

/**
 * Compute all facial metrics from raw landmarks in one call.
 *
 * @param landmarks - 106 facial landmark points (Vector3 array)
 * @param imageTextureData - Optional pixel-level skin texture scores
 * @returns Complete FacialMetrics object
 */
export function computeAllMetrics(
  landmarks: Vector3[],
  imageTextureData?: {
    textureScore: number;
    poreScore: number;
    pigmentationScore: number;
    vascularityScore: number;
    oilinessScore: number;
    elasticityScore: number;
  },
): FacialMetrics {
  const facialThirds = computeFacialThirds(landmarks);
  const facialFifths = computeFacialFifths(landmarks);
  const symmetry = computeSymmetry(landmarks);
  const browMetrics = computeBrowMetrics(landmarks);
  const eyeMetrics = computeEyeMetrics(landmarks);
  const noseMetrics = computeNoseMetrics(landmarks);
  const lipMetrics = computeLipMetrics(landmarks);
  const jawMetrics = computeJawMetrics(landmarks);
  const skinQualityMetrics = computeSkinQualityMetrics(
    landmarks,
    imageTextureData,
  );

  const metrics: FacialMetrics = {
    facial_thirds: facialThirds,
    facial_fifths: facialFifths,
    symmetry,
    features: {
      brow: browMetrics,
      eyes: eyeMetrics,
      nose: noseMetrics,
      lips: lipMetrics,
      jaw: jawMetrics,
      skin: skinQualityMetrics,
    },
    dimensions: computeAestheticDimensions({
      facial_thirds: facialThirds,
      facial_fifths: facialFifths,
      symmetry,
      features: {
        brow: browMetrics,
        eyes: eyeMetrics,
        nose: noseMetrics,
        lips: lipMetrics,
        jaw: jawMetrics,
        skin: skinQualityMetrics,
      },
      // dimensions will be computed inside computeAestheticDimensions
      dimensions: {
        femininity: 50,
        averageness: 50,
        perceived_youth: 30,
        homogeneity: 50,
        dimorphism_balance: 50,
      },
    }),
  };

  // Recompute dimensions with the full metrics
  metrics.dimensions = computeAestheticDimensions(metrics);

  return metrics;
}
