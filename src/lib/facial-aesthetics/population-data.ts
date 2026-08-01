/**
 * Facial Aesthetics — Population Reference Data
 *
 * Ethnicity-aware baseline proportions for scoring.
 * Each population defines its own "ideal" to avoid universal beauty standard bias.
 *
 * Sources: Anthropometric studies, Qoves methodology, facial plastic surgery literature.
 * Values are ratios and degrees, not absolute measurements.
 */

import {
  PopulationReferenceData,
  PopulationBaseline,
} from "@/types/facial-aesthetics";

// =============================================================================
// INDIVIDUAL POPULATION BASELINES
// =============================================================================

/**
 * Global composite baseline — population-weighted average across all groups.
 * Used when ethnicity is unknown or when comparing across populations.
 */
const GLOBAL_BASELINE: PopulationBaseline = {
  population: "global",
  facial_thirds_ideal: [0.33, 0.33, 0.34],
  facial_fifths_ideal: [0.2, 0.2, 0.2, 0.2, 0.2],
  brow_position_ideal: 0.05, // ~5% of face height above upper eyelid
  canthal_tilt_ideal: 4.0, // slight positive tilt
  lip_ratio_ideal: 1.618, // upper:lower = 1:1.618 (golden ratio approximation)
  nose_width_ratio_ideal: 0.24, // nose width / face width
  eyelid_exposure_ideal: 50, // moderate exposure
  lip_fullness_ideal: 55, // moderate fullness
  jaw_angle_ideal: 125, // slightly feminine-neutral
  gonial_angle_ideal: 125,
};

/**
 * East Asian population baseline.
 * Characteristics: slightly wider face, lower nasal bridge, less eyelid exposure,
 * fuller lower face, preference for oval face shape.
 */
const EAST_ASIAN_BASELINE: PopulationBaseline = {
  population: "east_asian",
  facial_thirds_ideal: [0.31, 0.34, 0.35], // slightly longer lower face
  facial_fifths_ideal: [0.2, 0.2, 0.2, 0.2, 0.2],
  brow_position_ideal: 0.04, // brows closer to eyes
  canthal_tilt_ideal: 3.0, // slightly less tilt
  lip_ratio_ideal: 1.5, // fuller lower lip relative to upper
  nose_width_ratio_ideal: 0.22, // narrower nose
  eyelid_exposure_ideal: 30, // less upper eyelid visible (monolid/hooded common)
  lip_fullness_ideal: 60, // fuller lips preferred
  jaw_angle_ideal: 128, // softer jawline
  gonial_angle_ideal: 128,
};

/**
 * South Asian population baseline.
 * Characteristics: stronger nose bridge, wider nose, fuller lips,
 * arched brows, moderate jaw definition.
 */
const SOUTH_ASIAN_BASELINE: PopulationBaseline = {
  population: "south_asian",
  facial_thirds_ideal: [0.32, 0.33, 0.35],
  facial_fifths_ideal: [0.2, 0.2, 0.2, 0.2, 0.2],
  brow_position_ideal: 0.05,
  canthal_tilt_ideal: 5.0, // more positive tilt common
  lip_ratio_ideal: 1.55,
  nose_width_ratio_ideal: 0.26, // wider nose
  eyelid_exposure_ideal: 55,
  lip_fullness_ideal: 65, // fuller lips
  jaw_angle_ideal: 122, // moderate definition
  gonial_angle_ideal: 122,
};

/**
 * European population baseline.
 * Characteristics: narrower face, prominent nose bridge, higher cheekbones,
 * more eyelid exposure, defined jawline.
 */
const EUROPEAN_BASELINE: PopulationBaseline = {
  population: "european",
  facial_thirds_ideal: [0.33, 0.33, 0.34],
  facial_fifths_ideal: [0.19, 0.2, 0.22, 0.2, 0.19], // slightly wider center
  brow_position_ideal: 0.06,
  canthal_tilt_ideal: 5.0,
  lip_ratio_ideal: 1.618,
  nose_width_ratio_ideal: 0.23,
  eyelid_exposure_ideal: 65,
  lip_fullness_ideal: 50,
  jaw_angle_ideal: 120, // more defined
  gonial_angle_ideal: 120,
};

/**
 * African population baseline.
 * Characteristics: wider nose, fuller lips, broader face,
 * stronger jaw, less nasal projection, wider set eyes.
 */
const AFRICAN_BASELINE: PopulationBaseline = {
  population: "african",
  facial_thirds_ideal: [0.32, 0.33, 0.35],
  facial_fifths_ideal: [0.21, 0.19, 0.2, 0.19, 0.21], // wider outer fifths
  brow_position_ideal: 0.04,
  canthal_tilt_ideal: 3.5,
  lip_ratio_ideal: 1.45, // fuller lower lip
  nose_width_ratio_ideal: 0.28, // wider nose
  eyelid_exposure_ideal: 45,
  lip_fullness_ideal: 70, // fullest lips
  jaw_angle_ideal: 118, // strongest jaw
  gonial_angle_ideal: 118,
};

/**
 * Middle Eastern population baseline.
 * Characteristics: prominent nose, strong brow ridge, almond eyes,
 * arched brows, moderate lip fullness, strong jaw.
 */
const MIDDLE_EASTERN_BASELINE: PopulationBaseline = {
  population: "middle_eastern",
  facial_thirds_ideal: [0.33, 0.32, 0.35],
  facial_fifths_ideal: [0.2, 0.2, 0.2, 0.2, 0.2],
  brow_position_ideal: 0.055,
  canthal_tilt_ideal: 6.0, // strongest positive tilt
  lip_ratio_ideal: 1.6,
  nose_width_ratio_ideal: 0.24,
  eyelid_exposure_ideal: 60,
  lip_fullness_ideal: 58,
  jaw_angle_ideal: 121,
  gonial_angle_ideal: 121,
};

/**
 * Latino/Hispanic population baseline.
 * Characteristics: moderate nose width, full lips, medium jaw definition,
 * olive skin tones, moderate facial width.
 */
const LATINO_BASELINE: PopulationBaseline = {
  population: "latino",
  facial_thirds_ideal: [0.33, 0.33, 0.34],
  facial_fifths_ideal: [0.2, 0.2, 0.2, 0.2, 0.2],
  brow_position_ideal: 0.05,
  canthal_tilt_ideal: 4.5,
  lip_ratio_ideal: 1.55,
  nose_width_ratio_ideal: 0.25,
  eyelid_exposure_ideal: 55,
  lip_fullness_ideal: 62,
  jaw_angle_ideal: 124,
  gonial_angle_ideal: 124,
};

// =============================================================================
// AGGREGATED REFERENCE DATA
// =============================================================================

/**
 * Complete population reference dataset.
 * Export this for use in scoring engines and protocol generation.
 */
export const POPULATION_REFERENCE_DATA: PopulationReferenceData = {
  version: "1.0",
  populations: {
    global: GLOBAL_BASELINE,
    east_asian: EAST_ASIAN_BASELINE,
    south_asian: SOUTH_ASIAN_BASELINE,
    european: EUROPEAN_BASELINE,
    african: AFRICAN_BASELINE,
    middle_eastern: MIDDLE_EASTERN_BASELINE,
    latino: LATINO_BASELINE,
  },
};

/**
 * Get a population baseline by ethnicity code.
 * Falls back to global if not found.
 */
export function getPopulationBaseline(
  ethnicity: string | null | undefined,
): PopulationBaseline {
  if (!ethnicity) return GLOBAL_BASELINE;

  const normalized = ethnicity.toLowerCase().replace(/[-_\s]/g, "_");
  return POPULATION_REFERENCE_DATA.populations[normalized] ?? GLOBAL_BASELINE;
}

/**
 * List all available population codes.
 */
export function getAvailablePopulations(): string[] {
  return Object.keys(POPULATION_REFERENCE_DATA.populations);
}

/**
 * Check if a population code exists in reference data.
 */
export function isValidPopulation(population: string): boolean {
  return (
    population.toLowerCase().replace(/[-_\s]/g, "_") in
    POPULATION_REFERENCE_DATA.populations
  );
}
