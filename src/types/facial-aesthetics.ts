/**
 * Facial Aesthetics Analysis — Type Definitions
 *
 * Phase 1 Foundation: Data layer, scoring engine, and types
 * for SKINgenius Facial Aesthetics Analysis feature.
 *
 * Based on: FACIAL-AESTHETICS-ANALYSIS-SPEC.md Section 4
 */

// =============================================================================
// GEOMETRY PRIMITIVES
// =============================================================================

/**
 * 3D point with normalized coordinates (0-1 range).
 * Used for facial landmark representation from MediaPipe Face Mesh standard.
 */
export interface Vector3 {
  /** Normalized x-coordinate (0 = left, 1 = right) */
  x: number;
  /** Normalized y-coordinate (0 = top, 1 = bottom) */
  y: number;
  /** Normalized z-coordinate (depth, 0 = near, 1 = far) */
  z: number;
}

// =============================================================================
// FEATURE METRICS (per-feature detailed measurements)
// =============================================================================

/**
 * Brow feature metrics — shape, position, fullness.
 */
export interface BrowMetrics {
  /** Thickness of brow hairs / overall brow, 0-100 */
  thickness: number;
  /** How full the brow appears, 0-100 */
  fullness: number;
  /** Arch angle in degrees (positive = upward arch) */
  arch_angle: number;
  /** Distance from brow to eye, normalized to face height */
  position: number;
  /** Left-right symmetry score, 0-100 */
  symmetry: number;
  /** Outer tail droop angle in degrees (positive = drooping) */
  tail_drop: number;
  /** Distance between inner brow points, normalized to face width */
  interbrow_distance: number;
}

/**
 * Eye shape classification.
 */
export type EyeShape =
  | "almond"
  | "round"
  | "hooded"
  | "monolid"
  | "upturned"
  | "downturned";

/**
 * Eye feature metrics — shape, size, position.
 */
export interface EyeMetrics {
  /** Detected eye shape */
  shape: EyeShape;
  /** Relative size to face, 0-100 */
  size: number;
  /** Width normalized to face width */
  width: number;
  /** Height normalized to face height */
  height: number;
  /** How much upper eyelid is visible, 0-100 */
  upper_eyelid_exposure: number;
  /** Under-eye hollow darkness/volume loss, 0-100 */
  under_eye_hollowness: number;
  /** Under-eye pigmentation severity, 0-100 */
  under_eye_pigmentation: number;
  /** Canthal tilt in degrees (positive = positive/fox eye tilt) */
  canthal_tilt: number;
  /** Left-right symmetry score, 0-100 */
  symmetry: number;
}

/**
 * Nose feature metrics — proportions, projection, symmetry.
 */
export interface NoseMetrics {
  /** Nose width relative to face width (ideal ~0.22-0.26 depending on ethnicity) */
  width_ratio: number;
  /** Bridge width normalized to face width */
  bridge_width: number;
  /** How far nose tip projects forward, normalized */
  tip_projection: number;
  /** Tip angle from vertical in degrees */
  tip_angle: number;
  /** How flared nostrils appear, 0-100 */
  nostril_flare: number;
  /** Left-right symmetry score, 0-100 */
  symmetry: number;
}

/**
 * Lip feature metrics — fullness, ratio, definition.
 */
export interface LipMetrics {
  /** Lip volume/fullness, 0-100 */
  fullness: number;
  /** Upper-to-lower lip ratio (ideal ~1:1.618 golden ratio) */
  ratio: number;
  /** Lip width normalized to face width */
  width: number;
  /** Definition of cupid's bow shape, 0-100 */
  cupid_bow_definition: number;
  /** Left-right symmetry score, 0-100 */
  symmetry: number;
  /** Amount of vermilion (red part) visible, 0-100 */
  vermilion_exposure: number;
}

/**
 * Jaw feature metrics — angle, width, definition.
 */
export interface JawMetrics {
  /** Mandibular angle in degrees (ideal ~120-130° for feminine, ~110-120° for masculine) */
  angle: number;
  /** Jaw width normalized to face width */
  width: number;
  /** How sharp/defined the jawline appears, 0-100 */
  definition: number;
  /** How far chin projects forward, normalized */
  chin_projection: number;
  /** Gonial angle in degrees (angle at jaw corner) */
  gonial_angle: number;
  /** V-shape angle for lower face taper assessment, degrees */
  v_angle: number;
  /** Left-right symmetry score, 0-100 */
  symmetry: number;
}

/**
 * Skin quality metrics — texture, tone, visual properties.
 * These are computed from the same photo used for landmark detection.
 */
export interface SkinQualityMetrics {
  /** How smooth the skin surface appears, 0-100 */
  texture_smoothness: number;
  /** Visibility of pores, 0-100 (lower = less visible) */
  pore_visibility: number;
  /** Evenness of skin pigmentation, 0-100 */
  pigmentation_evenness: number;
  /** Visible redness/broken capillaries, 0-100 (lower = better) */
  vascularity: number;
  /** Oiliness/grease appearance, 0-100 (lower = more matte) */
  oiliness: number;
  /** Visual elasticity estimation, 0-100 */
  elasticity_visual: number;
}

// =============================================================================
// COMPOSITE METRICS
// =============================================================================

/**
 * Facial thirds proportions — hairline to brow, brow to nose base, nose base to chin.
 * Ideal = equal thirds (~0.33 each).
 */
export interface FacialThirds {
  /** Upper third ratio (hairline to brow) */
  upper: number;
  /** Middle third ratio (brow to nose base) */
  middle: number;
  /** Lower third ratio (nose base to chin) */
  lower: number;
  /** How close to ideal thirds, 0-100 */
  harmony_score: number;
}

/**
 * Facial fifths proportions — horizontal zones.
 * Ideal = equal fifths (~0.20 each).
 */
export interface FacialFifths {
  /** Left outer fifth */
  left_outer: number;
  /** Left inner fifth */
  left_inner: number;
  /** Center fifth */
  center: number;
  /** Right inner fifth */
  right_inner: number;
  /** Right outer fifth */
  right_outer: number;
  /** How close to ideal fifths, 0-100 */
  harmony_score: number;
}

/**
 * Symmetry scores — overall and per-feature.
 */
export interface SymmetryMetrics {
  /** Overall facial symmetry, 0-100 */
  overall: number;
  /** Brow symmetry */
  brow_symmetry: number;
  /** Eye symmetry */
  eye_symmetry: number;
  /** Nose symmetry */
  nose_symmetry: number;
  /** Lip symmetry */
  lip_symmetry: number;
  /** Jaw symmetry */
  jaw_symmetry: number;
}

/**
 * Aesthetic dimensions — higher-level aesthetic properties.
 */
export interface AestheticDimensions {
  /** Femininity scale, 0-100 (0 = very masculine, 100 = very feminine) */
  femininity: number;
  /** How close to population mean/average face, 0-100 */
  averageness: number;
  /** Estimated perceived age in years */
  perceived_youth: number;
  /** How well features work together harmoniously, 0-100 */
  homogeneity: number;
  /** Balance of masculine/feminine traits, 0-100 (50 = balanced) */
  dimorphism_balance: number;
}

/**
 * Complete facial metrics computed from 106 landmarks.
 */
export interface FacialMetrics {
  /** Vertical proportions */
  facial_thirds: FacialThirds;
  /** Horizontal proportions */
  facial_fifths: FacialFifths;
  /** Symmetry scores */
  symmetry: SymmetryMetrics;
  /** Per-feature detailed metrics */
  features: {
    brow: BrowMetrics;
    eyes: EyeMetrics;
    nose: NoseMetrics;
    lips: LipMetrics;
    jaw: JawMetrics;
    skin: SkinQualityMetrics;
  };
  /** High-level aesthetic dimensions */
  dimensions: AestheticDimensions;
}

// =============================================================================
// FACIAL LANDMARKS
// =============================================================================

/**
 * Raw facial landmark data from on-device detection (106 points).
 * MediaPipe Face Mesh standard format.
 */
export interface FacialLandmarks {
  /** 106 facial landmark points (x, y, z normalized 0-1) */
  points: Vector3[];
  /** Computed metrics from the raw points */
  metrics: FacialMetrics;
}

// =============================================================================
// AESTHETIC SCORES
// =============================================================================

/**
 * Improvement potential analysis — what to improve and how.
 */
export interface ImprovementPotential {
  /** Feature name with most improvement potential */
  highest_impact: string;
  /** Low-effort, high-impact improvements */
  quick_wins: string[];
  /** Higher-effort improvements for later phases */
  long_term: string[];
}

/**
 * Complete aesthetic scores computed from metrics + population data.
 * All scores are 0-100 unless otherwise noted.
 */
export interface AestheticScores {
  /** Overall composite score */
  overall: number;
  /** How close facial proportions are to ideal */
  proportions: number;
  /** Weighted average of all symmetry metrics */
  symmetry: number;
  /** How well features work together (homogeneity) */
  feature_balance: number;
  /** Skin quality composite (texture, pores, tone, etc.) */
  skin_quality: number;
  /** Perceived youthfulness (estimated perceived age in years, not 0-100) */
  perceived_youth: number;
  /** Femininity scale, 0-100 */
  femininity: number;
  /** How close to population mean, 0-100 */
  averageness: number;

  // Feature-specific composite scores
  brow_score: number;
  eye_score: number;
  nose_score: number;
  lip_score: number;
  jaw_score: number;

  /** Which features have most room for improvement */
  improvement_potential: ImprovementPotential;
}

// =============================================================================
// PROTOCOL TYPES
// =============================================================================

/**
 * Category of improvement action.
 */
export type ProtocolCategory =
  | "skincare"
  | "supplement"
  | "peptide"
  | "device"
  | "procedure"
  | "injectable"
  | "lifestyle";

/**
 * Difficulty level of a protocol step.
 */
export type StepDifficulty = "easy" | "moderate" | "hard";

/**
 * Evidence level for a protocol step (A = strongest, D = weakest).
 */
export type ProtocolEvidenceLevel = "A" | "B" | "C" | "D";

/**
 * A single step within an aesthetic protocol phase.
 */
export interface ProtocolStep {
  /** Phase number (1 = Foundation, 2 = Refinement, 3 = Enhancement) */
  phase: number;
  /** Category of improvement */
  category: ProtocolCategory;
  /** Human-readable action description */
  action: string;
  /** Which facial feature this targets */
  target_feature: string;
  /** Optional: linked skin condition (for integrated protocols) */
  target_condition?: string;
  /** Current score before this step */
  current_score: number;
  /** Projected score after this step */
  projected_score: number;
  /** Expected improvement (delta) */
  projected_improvement: number;
  /** Human-readable cost range */
  cost_estimate: string;
  /** Minimum cost in USD */
  cost_min: number;
  /** Maximum cost in USD */
  cost_max: number;
  /** Difficulty level */
  difficulty: StepDifficulty;
  /** Human-readable timeline */
  timeline: string;
  /** Timeline in weeks */
  timeline_weeks: number;
  /** Evidence quality for this intervention */
  evidence_level: ProtocolEvidenceLevel;

  // Links to SKINgenius database
  /** Ingredient IDs from ingredients table */
  ingredient_ids: string[];
  /** Supplement IDs from supplements table */
  supplement_ids: string[];
  /** Peptide IDs from peptides table */
  peptide_ids: string[];
  /** Product IDs from products table */
  product_ids: string[];

  // Provider marketplace hooks (optional)
  /** Type of provider for procedure/injectable steps */
  provider_type?:
    | "dermatologist"
    | "esthetician"
    | "plastic_surgeon"
    | "dentist";
  /** Search query for provider marketplace */
  search_query?: string;
}

/**
 * A single phase within an aesthetic protocol.
 */
export interface AestheticProtocolPhase {
  /** Phase number (1-3) */
  phase: number;
  /** Phase name */
  name: string;
  /** Duration description (e.g., "0-4 weeks") */
  duration: string;
  /** Goals for this phase */
  goals: string[];
  /** Ordered steps within this phase */
  steps: ProtocolStep[];
}

/**
 * Complete aesthetic protocol — phased recommendations.
 */
export interface AestheticProtocol {
  /** Unique protocol ID */
  id: string;
  /** Reference to user */
  user_id: string;
  /** Reference to facial analysis */
  analysis_id: string;
  /** Phased protocol steps */
  phases: AestheticProtocolPhase[];
  /** Morphed landmark positions showing projected results (optional) */
  projected_landmarks?: FacialLandmarks;
  /** Projection image URLs */
  projection_images?: {
    before_url: string;
    projected_url: string;
    feature_overlay_url: string;
  };
  /** User budget preference */
  budget_preference: "minimal" | "moderate" | "unlimited";
  /** User comfort with invasiveness */
  invasive_comfort:
    | "topical_only"
    | "non_invasive"
    | "minimally_invasive"
    | "open";
  /** Protocol status */
  status: "active" | "paused" | "completed" | "archived";
  /** When protocol was started */
  started_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// DATABASE RECORD TYPES
// =============================================================================

/**
 * Database record for a facial analysis (matches facial_analyses table).
 */
export interface FacialAnalysisRecord {
  id: string;
  user_id: string;
  /** Link to skin analysis (same scan session) */
  skin_analysis_id: string | null;
  /** Raw landmark data as JSONB */
  landmarks: FacialLandmarks;
  /** Computed metrics as JSONB */
  metrics: FacialMetrics;
  /** Aesthetic scores as JSONB */
  scores: AestheticScores;
  /** User ethnicity for population baseline */
  ethnicity: string | null;
  /** User age at time of scan */
  age_at_scan: number | null;
  /** User gender */
  gender: string | null;
  /** Model used for landmark detection */
  model_used: string;
  /** Whether processing was on-device */
  on_device: boolean;
  /** Processing time in milliseconds */
  processing_time_ms: number | null;
  created_at: string;
}

/**
 * Invasiveness level for aesthetic improvements.
 */
export type InvasivenessLevel = "none" | "minimal" | "moderate" | "significant";

/**
 * Category for aesthetic improvements.
 */
export type ImprovementCategory =
  | "topical"
  | "device"
  | "procedure"
  | "injectable"
  | "lifestyle"
  | "supplement"
  | "peptide";

/**
 * Ethnicity-specific adjustment notes for an improvement.
 */
export interface EthnicityAdjustments {
  /** Population-specific recommendations keyed by ethnicity code */
  [ethnicity: string]: string;
}

/**
 * Fitzpatrick type-specific adjustment notes.
 */
export interface FitzpatrickAdjustments {
  /** Recommendations keyed by Fitzpatrick range (e.g., "type_5_6") */
  [range: string]: string;
}

/**
 * Aesthetic improvement catalog item (matches aesthetic_improvements table).
 */
export interface AestheticImprovement {
  id: string;
  /** Which facial feature this improves */
  feature: string;
  /** Which sub-feature within the feature (e.g., "arch_angle") */
  sub_feature: string | null;
  /** Human-readable name */
  name: string;
  /** Category of improvement */
  category: ImprovementCategory;
  /** Invasiveness level */
  invasiveness: InvasivenessLevel;
  /** Expected score change (e.g., +15.0) */
  score_impact: number | null;
  /** Confidence in impact estimate (0.00-1.00) */
  confidence: number | null;
  /** Weeks to see results */
  timeline_weeks: number | null;
  /** Minimum cost in USD */
  cost_min: number | null;
  /** Maximum cost in USD */
  cost_max: number | null;
  /** Whether this requires ongoing payment */
  recurring: boolean;
  /** Monthly recurring cost in USD */
  recurring_cost_monthly: number | null;
  /** Evidence quality (A = strongest) */
  evidence_level: "A" | "B" | "C" | "D" | null;
  /** Free-text evidence notes */
  evidence_notes: string | null;
  /** PubMed IDs or study identifiers */
  key_studies: string[] | null;
  /** Linked ingredient IDs */
  ingredient_ids: string[] | null;
  /** Linked supplement IDs */
  supplement_ids: string[] | null;
  /** Linked peptide IDs */
  peptide_ids: string[] | null;
  /** Linked product IDs */
  product_ids: string[] | null;
  /** Ethnicity-specific adjustments */
  ethnicity_adjustments: EthnicityAdjustments | null;
  /** Fitzpatrick type adjustments */
  fitzpatrick_adjustments: FitzpatrickAdjustments | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// PROTOCOL GENERATION INPUTS
// =============================================================================

/**
 * User preferences for protocol generation.
 */
export interface ProtocolPreferences {
  /** Budget comfort level */
  budget: "minimal" | "moderate" | "unlimited";
  /** Invasiveness comfort level */
  invasiveness: "topical_only" | "non_invasive" | "minimally_invasive" | "open";
  /** Time commitment preference (hours per week) */
  time_commitment?: "low" | "moderate" | "high";
  /** Specific features to prioritize */
  priority_features?: string[];
  /** Features to exclude */
  excluded_features?: string[];
}

/**
 * Lifestyle scores from existing questionnaire.
 */
export interface LifestyleScores {
  /** Overall lifestyle score, 0-100 */
  overall: number;
  /** Sleep quality score, 0-100 */
  sleep: number;
  /** Hydration score, 0-100 */
  hydration: number;
  /** Diet quality score, 0-100 */
  nutrition: number;
  /** Stress level score, 0-100 (lower = more stressed) */
  stress: number;
  /** Exercise frequency score, 0-100 */
  exercise: number;
}

// =============================================================================
// POPULATION REFERENCE DATA
// =============================================================================

/**
 * Population-specific ideal proportions and measurements.
 * Each population defines its own beauty standards rather than using a universal ideal.
 */
export interface PopulationBaseline {
  /** Population identifier (e.g., "global", "east_asian", "south_asian") */
  population: string;
  /** Ideal facial thirds ratios [upper, middle, lower] */
  facial_thirds_ideal: [number, number, number];
  /** Ideal facial fifths ratios [left_outer, left_inner, center, right_inner, right_outer] */
  facial_fifths_ideal: [number, number, number, number, number];
  /** Ideal brow position from eye (normalized) */
  brow_position_ideal: number;
  /** Ideal canthal tilt in degrees */
  canthal_tilt_ideal: number;
  /** Ideal upper:lower lip ratio */
  lip_ratio_ideal: number;
  /** Ideal nose width / face width ratio */
  nose_width_ratio_ideal: number;
  /** Ideal eyelid exposure percentage */
  eyelid_exposure_ideal: number;
  /** Ideal lip fullness score */
  lip_fullness_ideal: number;
  /** Ideal jaw angle in degrees */
  jaw_angle_ideal: number;
  /** Ideal gonial angle in degrees */
  gonial_angle_ideal: number;
}

/**
 * Collection of population baselines for ethnicity-aware scoring.
 */
export interface PopulationReferenceData {
  version: string;
  populations: {
    [population: string]: PopulationBaseline;
  };
}

// =============================================================================
// UTILITY TYPE EXPORTS
// =============================================================================

/** Feature name for type-safe feature references */
export type FacialFeature = "brow" | "eyes" | "nose" | "lips" | "jaw" | "skin";

/** Sub-feature names for type-safe references */
export type FacialSubFeature =
  | "thickness"
  | "fullness"
  | "arch_angle"
  | "position"
  | "tail_drop"
  | "interbrow_distance"
  | "shape"
  | "size"
  | "width"
  | "height"
  | "upper_eyelid_exposure"
  | "under_eye_hollowness"
  | "under_eye_pigmentation"
  | "canthal_tilt"
  | "width_ratio"
  | "bridge_width"
  | "tip_projection"
  | "tip_angle"
  | "nostril_flare"
  | "ratio"
  | "cupid_bow_definition"
  | "vermilion_exposure"
  | "angle"
  | "definition"
  | "chin_projection"
  | "gonial_angle"
  | "v_angle"
  | "texture_smoothness"
  | "pore_visibility"
  | "pigmentation_evenness"
  | "vascularity"
  | "oiliness"
  | "elasticity_visual";
