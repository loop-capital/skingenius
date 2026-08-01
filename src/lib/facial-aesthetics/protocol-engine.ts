/**
 * Facial Aesthetics — Protocol Generation Engine
 *
 * Combines aesthetic scores + skin conditions + lifestyle data + user preferences
 * into a phased, personalized aesthetic protocol.
 *
 * Algorithm:
 * 1. Identify features with highest improvement potential
 * 2. Match improvements from catalog (filtered by preferences)
 * 3. Sort by impact/cost ratio within budget
 * 4. Distribute across 3 phases (Foundation → Refinement → Enhancement)
 * 5. Add skin condition treatments from existing analysis
 *
 * Phase Structure:
 * - Phase 1 (0-4 wks): Foundation — Skin health + basic proportions
 * - Phase 2 (4-8 wks): Refinement — Targeted feature improvements
 * - Phase 3 (8-16 wks): Enhancement — Advanced interventions
 */

import {
  AestheticScores,
  FacialMetrics,
  AestheticProtocol,
  AestheticProtocolPhase,
  ProtocolStep,
  ProtocolPreferences,
  LifestyleScores,
  AestheticImprovement,
  ImprovementCategory,
} from "@/types/facial-aesthetics";
import {
  IMPROVEMENT_CATALOG,
  sortByImpactCostRatio,
  getImprovementsByFeature,
} from "./improvement-catalog";

// =============================================================================
// PHASE CONFIGURATION
// =============================================================================

interface PhaseConfig {
  phase: number;
  name: string;
  duration: string;
  minWeeks: number;
  maxWeeks: number;
  maxSteps: number;
  preferredCategories: ImprovementCategory[];
}

const PHASES: PhaseConfig[] = [
  {
    phase: 1,
    name: "Foundation — Skin Health \u0026 Basic Proportions",
    duration: "0-4 weeks",
    minWeeks: 0,
    maxWeeks: 4,
    maxSteps: 6,
    preferredCategories: ["topical", "lifestyle", "supplement"],
  },
  {
    phase: 2,
    name: "Refinement — Targeted Feature Improvements",
    duration: "4-8 weeks",
    minWeeks: 4,
    maxWeeks: 8,
    maxSteps: 5,
    preferredCategories: ["topical", "device", "peptide", "supplement"],
  },
  {
    phase: 3,
    name: "Enhancement — Advanced Interventions",
    duration: "8-16 weeks",
    minWeeks: 8,
    maxWeeks: 16,
    maxSteps: 4,
    preferredCategories: ["peptide", "procedure", "injectable"],
  },
];

// =============================================================================
// INVASIVENESS RANKING
// =============================================================================

const INVASIVENESS_ORDER = [
  "none",
  "minimal",
  "moderate",
  "significant",
] as const;

type InvasivenessRank = (typeof INVASIVENESS_ORDER)[number];

function invasivenessRank(level: string): number {
  return INVASIVENESS_ORDER.indexOf(level as InvasivenessRank);
}

function isInvasivenessAllowed(
  improvementInvasiveness: string,
  comfortLevel: string,
): boolean {
  const comfortMap: Record<string, number> = {
    topical_only: 0, // none only
    non_invasive: 1, // none + minimal
    minimally_invasive: 2, // none + minimal + moderate
    open: 3, // all
  };

  const maxAllowed = comfortMap[comfortLevel] ?? 0;
  return invasivenessRank(improvementInvasiveness) <= maxAllowed;
}

// =============================================================================
// BUDGET FILTERING
// =============================================================================

function getBudgetMax(preference: string): number {
  switch (preference) {
    case "minimal":
      return 100; // Max $100 total per phase
    case "moderate":
      return 500; // Max $500 total per phase
    case "unlimited":
      return 10000; // Effectively unlimited
    default:
      return 500;
  }
}

/**
 * Filter improvements by user preferences.
 */
function filterImprovements(
  improvements: AestheticImprovement[],
  preferences: ProtocolPreferences,
): AestheticImprovement[] {
  const budgetMax = getBudgetMax(preferences.budget);

  return improvements.filter((imp) => {
    // Check invasiveness comfort
    if (!isInvasivenessAllowed(imp.invasiveness, preferences.invasiveness)) {
      return false;
    }

    // Check budget (one-time cost must be within budget)
    if (imp.cost_max !== null && imp.cost_max > budgetMax) {
      return false;
    }

    // Check excluded features
    if (
      preferences.excluded_features &&
      preferences.excluded_features.includes(imp.feature)
    ) {
      return false;
    }

    return true;
  });
}

// =============================================================================
// STEP CONVERSION
// =============================================================================

/**
 * Convert an AestheticImprovement catalog item into a ProtocolStep.
 */
function improvementToStep(
  improvement: AestheticImprovement,
  phase: number,
  currentScore: number,
): ProtocolStep {
  const projectedScore = clampScore(
    currentScore + (improvement.score_impact ?? 0),
  );

  return {
    phase,
    category: improvement.category as ProtocolStep["category"],
    action: improvement.name,
    target_feature: improvement.feature,
    target_condition: undefined, // Will be set by caller if linked to skin condition
    current_score: currentScore,
    projected_score: projectedScore,
    projected_improvement: improvement.score_impact ?? 0,
    cost_estimate: `$${improvement.cost_min ?? 0}-${improvement.cost_max ?? 0}`,
    cost_min: Number(improvement.cost_min ?? 0),
    cost_max: Number(improvement.cost_max ?? 0),
    difficulty: inferDifficulty(improvement),
    timeline: `${improvement.timeline_weeks ?? 4} weeks`,
    timeline_weeks: improvement.timeline_weeks ?? 4,
    evidence_level: improvement.evidence_level ?? "C",
    ingredient_ids: improvement.ingredient_ids ?? [],
    supplement_ids: improvement.supplement_ids ?? [],
    peptide_ids: improvement.peptide_ids ?? [],
    product_ids: improvement.product_ids ?? [],
    provider_type:
      improvement.category === "injectable" ||
      improvement.category === "procedure"
        ? "dermatologist"
        : undefined,
    search_query:
      improvement.category === "injectable" ||
      improvement.category === "procedure"
        ? `${improvement.name} near me`
        : undefined,
  };
}

/**
 * Infer step difficulty from improvement properties.
 */
function inferDifficulty(
  improvement: AestheticImprovement,
): ProtocolStep["difficulty"] {
  if (
    improvement.invasiveness === "none" &&
    (improvement.timeline_weeks ?? 4) <= 4
  ) {
    return "easy";
  }
  if (
    improvement.invasiveness === "significant" ||
    (improvement.cost_max ?? 0) > 500
  ) {
    return "hard";
  }
  return "moderate";
}

/**
 * Clamp a score to 0-100.
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// =============================================================================
// PHASE GENERATION
// =============================================================================

/**
 * Generate steps for a specific phase.
 */
function generatePhaseSteps(
  phaseConfig: PhaseConfig,
  improvements: AestheticImprovement[],
  scores: AestheticScores,
  metrics: FacialMetrics,
  preferences: ProtocolPreferences,
): ProtocolStep[] {
  // Filter improvements for this phase's preferred categories
  let phaseImprovements = improvements.filter((imp) =>
    phaseConfig.preferredCategories.includes(
      imp.category as ImprovementCategory,
    ),
  );

  // If not enough items, fall back to all allowed improvements
  if (phaseImprovements.length < phaseConfig.maxSteps) {
    phaseImprovements = improvements;
  }

  // Sort by impact/cost ratio
  const sorted = sortByImpactCostRatio(phaseImprovements);

  // Get current scores for each feature
  const featureScores: Record<string, number> = {
    brow: scores.brow_score,
    eyes: scores.eye_score,
    nose: scores.nose_score,
    lips: scores.lip_score,
    jaw: scores.jaw_score,
    skin: scores.skin_quality,
  };

  // Prioritize features with lowest scores (highest improvement potential)
  const featuresByPriority = Object.entries(featureScores)
    .sort(([, a], [, b]) => a - b)
    .map(([feature]) => feature);

  const steps: ProtocolStep[] = [];
  const usedActions = new Set<string>();

  // Try to cover highest-priority features first
  for (const feature of featuresByPriority) {
    if (steps.length >= phaseConfig.maxSteps) break;

    const featureImprovements = sorted.filter(
      (imp) => imp.feature === feature && !usedActions.has(imp.id),
    );

    for (const improvement of featureImprovements.slice(0, 2)) {
      if (steps.length >= phaseConfig.maxSteps) break;

      const currentScore = featureScores[feature] ?? 50;
      const step = improvementToStep(
        improvement,
        phaseConfig.phase,
        currentScore,
      );
      steps.push(step);
      usedActions.add(improvement.id);
    }
  }

  // Fill remaining slots with highest impact/cost ratio items
  for (const improvement of sorted) {
    if (steps.length >= phaseConfig.maxSteps) break;
    if (usedActions.has(improvement.id)) continue;

    const feature = improvement.feature;
    const currentScore = featureScores[feature] ?? 50;
    const step = improvementToStep(
      improvement,
      phaseConfig.phase,
      currentScore,
    );
    steps.push(step);
    usedActions.add(improvement.id);
  }

  return steps;
}

// =============================================================================
// SKIN CONDITION INTEGRATION
// =============================================================================

/**
 * Detected skin condition from existing analysis.
 */
interface DetectedSkinCondition {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
}

/**
 * Add skin condition steps to Phase 1.
 * These are merged with aesthetic steps for an integrated protocol.
 */
function addSkinConditionSteps(
  phase1Steps: ProtocolStep[],
  conditions: DetectedSkinCondition[],
): ProtocolStep[] {
  if (!conditions || conditions.length === 0) return phase1Steps;

  const skinConditionSteps: ProtocolStep[] = conditions.map((condition) => ({
    phase: 1,
    category: "skincare",
    action: `Treat ${condition.name} (${condition.severity})`,
    target_feature: "skin",
    target_condition: condition.name,
    current_score: 50,
    projected_score: 70,
    projected_improvement: 20,
    cost_estimate: "$25-50",
    cost_min: 25,
    cost_max: 50,
    difficulty: condition.severity === "severe" ? "hard" : "moderate",
    timeline: "4-8 weeks",
    timeline_weeks: 6,
    evidence_level: "A",
    ingredient_ids: [],
    supplement_ids: [],
    peptide_ids: [],
    product_ids: [],
  }));

  // Insert skin condition steps at the beginning of Phase 1
  return [...skinConditionSteps, ...phase1Steps].slice(0, 8); // Cap at 8 steps
}

// =============================================================================
// MAIN PROTOCOL GENERATION
// =============================================================================

/**
 * Generate a complete aesthetic protocol.
 *
 * @param scores - Computed aesthetic scores
 * @param metrics - Computed facial metrics
 * @param conditions - Detected skin conditions (from existing skin analysis)
 * @param lifestyleScores - Lifestyle questionnaire scores
 * @param preferences - User preferences (budget, invasiveness, etc.)
 * @returns Complete AestheticProtocol object
 */
export function generateProtocol(
  scores: AestheticScores,
  metrics: FacialMetrics,
  conditions: DetectedSkinCondition[],
  lifestyleScores: LifestyleScores,
  preferences: ProtocolPreferences,
): Omit<
  AestheticProtocol,
  "id" | "user_id" | "analysis_id" | "created_at" | "updated_at"
> {
  // Filter catalog by preferences
  const filteredImprovements = filterImprovements(
    IMPROVEMENT_CATALOG,
    preferences,
  );

  // Generate phases
  const phases: AestheticProtocolPhase[] = PHASES.map((phaseConfig) => {
    let steps = generatePhaseSteps(
      phaseConfig,
      filteredImprovements,
      scores,
      metrics,
      preferences,
    );

    // Add skin condition steps to Phase 1
    if (phaseConfig.phase === 1) {
      steps = addSkinConditionSteps(steps, conditions);
    }

    // Generate goals for this phase
    const goals = generatePhaseGoals(
      phaseConfig.phase,
      scores,
      conditions,
      lifestyleScores,
    );

    return {
      phase: phaseConfig.phase,
      name: phaseConfig.name,
      duration: phaseConfig.duration,
      goals,
      steps,
    };
  });

  return {
    phases,
    projected_landmarks: undefined, // Will be populated by visualization engine
    projection_images: undefined,
    budget_preference: preferences.budget,
    invasive_comfort: preferences.invasiveness,
    status: "active",
    started_at: null,
  };
}

/**
 * Generate phase goals based on current scores and conditions.
 */
function generatePhaseGoals(
  phase: number,
  scores: AestheticScores,
  conditions: DetectedSkinCondition[],
  lifestyleScores: LifestyleScores,
): string[] {
  const goals: string[] = [];

  if (phase === 1) {
    // Foundation: focus on skin health + basic improvements
    if (scores.skin_quality < 60) {
      goals.push("Improve skin texture and tone");
    }
    if (conditions.some((c) => c.severity !== "mild")) {
      goals.push("Address active skin conditions");
    }
    if (lifestyleScores.sleep < 60) {
      goals.push("Establish sleep routine");
    }
    if (lifestyleScores.nutrition < 60) {
      goals.push("Improve dietary habits");
    }
    goals.push("Build consistent skincare routine");
  } else if (phase === 2) {
    // Refinement: target specific features
    const { improvement_potential } = scores;
    if (improvement_potential.quick_wins.length > 0) {
      goals.push(`Improve ${improvement_potential.quick_wins.join(", ")}`);
    }
    goals.push("Add targeted treatments");
    goals.push("Maintain skin health gains");
  } else {
    // Enhancement: advanced interventions
    const { improvement_potential } = scores;
    if (improvement_potential.long_term.length > 0) {
      goals.push(`Address ${improvement_potential.long_term.join(", ")}`);
    }
    goals.push("Consider advanced procedures if aligned with preferences");
    goals.push("Optimize long-term skin health");
  }

  return goals.slice(0, 4); // Max 4 goals per phase
}

// =============================================================================
// PROTOCOL UTILITIES
// =============================================================================

/**
 * Calculate total estimated cost of a protocol.
 */
export function calculateProtocolCost(protocol: AestheticProtocol): {
  totalMin: number;
  totalMax: number;
  monthlyRecurring: number;
} {
  let totalMin = 0;
  let totalMax = 0;
  let monthlyRecurring = 0;

  for (const phase of protocol.phases) {
    for (const step of phase.steps) {
      totalMin += step.cost_min;
      totalMax += step.cost_max;

      // Estimate monthly recurring from timeline
      if (step.timeline_weeks >= 4) {
        const monthlyCost = (step.cost_max / step.timeline_weeks) * 4;
        monthlyRecurring += monthlyCost;
      }
    }
  }

  return { totalMin, totalMax, monthlyRecurring };
}

/**
 * Calculate total projected score improvement.
 */
export function calculateTotalImprovement(protocol: AestheticProtocol): number {
  let totalImprovement = 0;
  for (const phase of protocol.phases) {
    for (const step of phase.steps) {
      totalImprovement += step.projected_improvement;
    }
  }
  return totalImprovement;
}

/**
 * Get all steps flattened across phases.
 */
export function getAllSteps(protocol: AestheticProtocol): ProtocolStep[] {
  return protocol.phases.flatMap((phase) => phase.steps);
}

/**
 * Filter protocol steps by category.
 */
export function getStepsByCategory(
  protocol: AestheticProtocol,
  category: string,
): ProtocolStep[] {
  return getAllSteps(protocol).filter((step) => step.category === category);
}

/**
 * Check if protocol contains any invasive procedures.
 */
export function hasInvasiveProcedures(protocol: AestheticProtocol): boolean {
  return getAllSteps(protocol).some(
    (step) => step.category === "injectable" || step.category === "procedure",
  );
}

/**
 * Get recommended provider types for a protocol.
 */
export function getRequiredProviders(protocol: AestheticProtocol): string[] {
  const providers = new Set<string>();
  for (const step of getAllSteps(protocol)) {
    if (step.provider_type) {
      providers.add(step.provider_type);
    }
  }
  return Array.from(providers);
}

/**
 * Create a minimal protocol for users with budget constraints.
 */
export function createMinimalProtocol(
  scores: AestheticScores,
  metrics: FacialMetrics,
  conditions: DetectedSkinCondition[],
): Omit<
  AestheticProtocol,
  "id" | "user_id" | "analysis_id" | "created_at" | "updated_at"
> {
  return generateProtocol(
    scores,
    metrics,
    conditions,
    {
      overall: 50,
      sleep: 50,
      hydration: 50,
      nutrition: 50,
      stress: 50,
      exercise: 50,
    },
    {
      budget: "minimal",
      invasiveness: "topical_only",
    },
  );
}

/**
 * Create a comprehensive protocol for users with unlimited budget.
 */
export function createComprehensiveProtocol(
  scores: AestheticScores,
  metrics: FacialMetrics,
  conditions: DetectedSkinCondition[],
): Omit<
  AestheticProtocol,
  "id" | "user_id" | "analysis_id" | "created_at" | "updated_at"
> {
  return generateProtocol(
    scores,
    metrics,
    conditions,
    {
      overall: 50,
      sleep: 50,
      hydration: 50,
      nutrition: 50,
      stress: 50,
      exercise: 50,
    },
    {
      budget: "unlimited",
      invasiveness: "open",
    },
  );
}
