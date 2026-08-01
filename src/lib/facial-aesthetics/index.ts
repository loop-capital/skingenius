/**
 * Facial Aesthetics — Module Index
 *
 * Barrel file exporting all facial aesthetics modules.
 * Import from this file for all facial aesthetics functionality.
 */

// Types
export * from "@/types/facial-aesthetics";

// Population reference data
export {
  POPULATION_REFERENCE_DATA,
  getPopulationBaseline,
  getAvailablePopulations,
  isValidPopulation,
} from "./population-data";

// Metric computation engine
export {
  computeFacialThirds,
  computeFacialFifths,
  computeSymmetry,
  computeBrowMetrics,
  computeEyeMetrics,
  computeNoseMetrics,
  computeLipMetrics,
  computeJawMetrics,
  computeSkinQualityMetrics,
  computeAestheticDimensions,
  computeAllMetrics,
} from "./metrics";

// Scoring engine
export {
  computeAestheticScores,
  rescoreWithPopulation,
  interpretScore,
  scoreColor,
} from "./scoring";

// Improvement catalog
export {
  IMPROVEMENT_CATALOG,
  IMPROVEMENT_CATALOG_COUNT,
  getImprovementsByFeature,
  getImprovementsByCategory,
  getImprovementsByInvasiveness,
  getImprovementsByBudget,
  sortByImpactCostRatio,
} from "./improvement-catalog";

// Protocol generation engine
export {
  generateProtocol,
  calculateProtocolCost,
  calculateTotalImprovement,
  getAllSteps,
  getStepsByCategory,
  hasInvasiveProcedures,
  getRequiredProviders,
  createMinimalProtocol,
  createComprehensiveProtocol,
} from "./protocol-engine";
