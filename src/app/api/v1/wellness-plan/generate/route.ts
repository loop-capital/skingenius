import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface SupplementProtocol {
  supplement_id: string;
  timing: string;
}

interface GenerateRequest {
  user_id: string;
  include_biomarkers?: {
    hba1c?: number;
    vitamin_d_ng_ml?: number;
    omega3_index?: number;
    crp?: number;
    fasting_glucose?: number;
  };
  preferences?: {
    peptide_comfort_level?: "none" | "topical_only" | "open_to_injectable";
    budget?: "basic" | "moderate" | "unlimited";
    dietary_restrictions?: string[];
    current_supplements?: string[];
  };
}

interface RelevanceScored<T> {
  item: T;
  score: number;
}

// ------------------------------------------------------------------
// Utility helpers
// ------------------------------------------------------------------

function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function evidenceToScore(level: string | null): number {
  switch (level) {
    case "A":
      return 10;
    case "B":
      return 7;
    case "C":
      return 4;
    case "D":
      return 2;
    default:
      return 0;
  }
}

function safeArrayOverlap(a: string[] | null, b: string[] | null): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// ------------------------------------------------------------------
// Plan Generation Algorithm
// ------------------------------------------------------------------

function calculateRelevanceScore(params: {
  conditionMatch: number;
  rootCauseMatch: number;
  mechanismMatch: number;
  evidenceLevel: string | null;
}): number {
  const evidenceScore = evidenceToScore(params.evidenceLevel);
  return (
    params.conditionMatch * 0.4 +
    params.rootCauseMatch * 0.3 +
    params.mechanismMatch * 0.2 +
    evidenceScore * 0.1
  );
}

// ------------------------------------------------------------------
// GET handler — fetch plan for user
// ------------------------------------------------------------------

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const { data: plan, error: planError } = await supabase
    .from("wellness_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (planError || !plan) {
    return apiError("No active wellness plan found", 404);
  }

  const { data: items, error: itemsError } = await supabase
    .from("wellness_plan_items")
    .select("*")
    .eq("plan_id", plan.id)
    .order("sort_order", { ascending: true });

  if (itemsError) {
    console.error("[wellness-plan/generate] items fetch error:", itemsError);
  }

  return NextResponse.json({ plan, items: items ?? [] });
}

// ------------------------------------------------------------------
// POST handler — generate new plan
// ------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const { include_biomarkers, preferences } = body as Omit<
    GenerateRequest,
    "user_id"
  >;

  const supabase = createServiceClient();

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let effectiveUserId: string | undefined = user?.id;

  // Dev fallback for unauthenticated requests
  if (process.env.NODE_ENV === "development" && !effectiveUserId) {
    effectiveUserId =
      (body as GenerateRequest).user_id ??
      "00000000-0000-0000-0000-000000000000";
  }

  if (!effectiveUserId) {
    return apiError("Unauthorized", 401);
  }

  // ------------------------------------------------------------------
  // 1. Fetch user's latest skin analysis + lifestyle data
  // ------------------------------------------------------------------

  const { data: profile } = await supabase
    .from("user_skin_profiles")
    .select("fitzpatrick_type")
    .eq("user_id", effectiveUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: lifestyle } = await supabase
    .from("lifestyle_responses")
    .select("*")
    .eq("user_id", effectiveUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: latestAnalysis } = await supabase
    .from("skin_analyses")
    .select("conditions, lifestyle_scores")
    .eq("user_id", effectiveUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // ------------------------------------------------------------------
  // 2. Gather reference data
  // ------------------------------------------------------------------

  const skinConditions = (latestAnalysis?.conditions as string[]) ?? [];
  const lifestyleScores =
    (latestAnalysis?.lifestyle_scores as Record<string, number>) ?? {};
  const fitzpatrickType = profile?.fitzpatrick_type ?? 3;

  // Root causes & mechanisms for detected conditions
  const { data: causeLinks } = await supabase
    .from("cause_condition_links")
    .select("root_cause_id, condition_id")
    .in(
      "condition_id",
      skinConditions.length > 0 ? skinConditions : ["acne-vulgaris"],
    );

  const { data: mechanismChains } = await supabase
    .from("mechanism_chains")
    .select("root_cause_id, mechanism_id, condition_id")
    .in(
      "condition_id",
      skinConditions.length > 0 ? skinConditions : ["acne-vulgaris"],
    );

  const rootCauses = unique(causeLinks?.map((c) => c.root_cause_id) ?? []);
  const mechanisms = unique(mechanismChains?.map((m) => m.mechanism_id) ?? []);

  // Fetch all reference data with error handling
  let allSupplements, allPeptides, allDietProtocols;
  let allFitzAdj, allMedEffects, allPsychoderm;
  let allPostProc, allOralMicro, allSeasonal;
  let allGutBrainSkin, allSunExposure;
  let protocolsByCondition: Record<string, unknown[]> = {};

  try {
    [
      { data: allSupplements },
      { data: allPeptides },
      { data: allDietProtocols },
    ] = await Promise.all([
      supabase.from("supplements").select("*"),
      supabase.from("peptides").select("*"),
      supabase.from("diet_protocols").select("*"),
    ]);

    if (!allSupplements || !allPeptides || !allDietProtocols) {
      throw new Error("Critical reference data failed to load");
    }

    [{ data: allFitzAdj }, { data: allMedEffects }, { data: allPsychoderm }] =
      await Promise.all([
        supabase
          .from("fitzpatrick_adjustments")
          .select("*")
          .eq("fitzpatrick_type", fitzpatrickType),
        supabase
          .from("medication_skin_effects")
          .select("*")
          .in(
            "medication_name",
            (lifestyle?.current_medications as string[])?.length > 0
              ? (lifestyle?.current_medications as string[])
              : ["_none_"],
          ),
        supabase.from("psychoderm_protocols").select("*"),
      ]);

    [{ data: allPostProc }, { data: allOralMicro }, { data: allSeasonal }] =
      await Promise.all([
        supabase.from("post_procedure_protocols").select("*"),
        supabase.from("oral_microbiome_protocols").select("*"),
        supabase
          .from("seasonal_adjustments")
          .select("*")
          .eq("season", lifestyle?.season ?? "spring")
          .eq("climate", lifestyle?.climate ?? "temperate"),
      ]);

    [{ data: allGutBrainSkin }, { data: allSunExposure }] = await Promise.all([
      supabase.from("gut_brain_skin_protocols").select("*"),
      supabase.from("sun_exposure_protocols").select("*"),
    ]);

    // Fetch treatment protocols for detected conditions
    const { data: treatmentProtocols } = await supabase
      .from("condition_treatment_protocols")
      .select("*")
      .in(
        "condition_slug",
        skinConditions.length > 0 ? skinConditions : ["_none_"],
      )
      .order("phase_order", { ascending: true });

    // Group protocols by condition
    protocolsByCondition = {};
    (treatmentProtocols ?? []).forEach((p) => {
      const slug = p.condition_slug as string;
      if (!protocolsByCondition[slug]) protocolsByCondition[slug] = [];
      protocolsByCondition[slug].push(p);
    });
  } catch (error) {
    console.error(
      "[wellness-plan/generate] reference data fetch error:",
      error,
    );
    return apiError("Failed to load reference data", 500);
  }

  // ------------------------------------------------------------------
  // 3. Score & select diet protocol
  // ------------------------------------------------------------------

  const scoredDiets: RelevanceScored<(typeof allDietProtocols)[number]>[] = (
    allDietProtocols ?? []
  )
    .map((diet) => {
      const conditionMatch = safeArrayOverlap(
        skinConditions,
        (diet.target_conditions ?? []) as string[],
      );
      const rootCauseMatch = safeArrayOverlap(
        rootCauses,
        (diet.target_root_causes ?? []) as string[],
      );
      const mechanismMatch = safeArrayOverlap(
        mechanisms,
        (diet.target_mechanisms ?? []) as string[],
      );
      const score = calculateRelevanceScore({
        conditionMatch,
        rootCauseMatch,
        mechanismMatch,
        evidenceLevel: diet.evidence_level,
      });
      return { item: diet, score };
    })
    .sort((a, b) => b.score - a.score);

  const selectedDiet = scoredDiets[0]?.item ?? allDietProtocols?.[0];

  // ------------------------------------------------------------------
  // 4. Score & select supplements
  // ------------------------------------------------------------------

  const scoredSupplements: RelevanceScored<(typeof allSupplements)[number]>[] =
    (allSupplements ?? [])
      .map((sup) => {
        const conditionMatch = safeArrayOverlap(
          skinConditions,
          (sup.concerns_treated ?? []) as string[],
        );
        const rootCauseMatch = safeArrayOverlap(
          rootCauses,
          (sup.root_causes_targeted ?? []) as string[],
        );
        const score = calculateRelevanceScore({
          conditionMatch,
          rootCauseMatch,
          mechanismMatch: 0,
          evidenceLevel: sup.evidence_level,
        });
        return { item: sup, score };
      })
      .filter((s) => s.score >= 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

  // Fetch supplement protocols for timing lookup
  const { data: allSupplementProtocols } = await supabase
    .from("supplement_protocols")
    .select("supplement_id, timing")
    .in(
      "condition_slug",
      skinConditions.length > 0 ? skinConditions : ["acne-vulgaris"],
    );

  const supplementTimingMap = new Map<string, string>();
  (allSupplementProtocols ?? []).forEach((proto) => {
    if (proto.supplement_id && proto.timing) {
      supplementTimingMap.set(proto.supplement_id, proto.timing);
    }
  });

  const supplementStack = scoredSupplements.map((s) => ({
    id: s.item.id,
    name: s.item.name,
    dosage: s.item.dosage,
    evidence_level: s.item.evidence_level,
    relevance_score: Math.round(s.score),
    benefits: s.item.benefits,
    timing: supplementTimingMap.get(s.item.id) ?? "morning",
  }));

  // ------------------------------------------------------------------
  // 5. Score & select peptides (respect comfort level)
  // ------------------------------------------------------------------

  const peptideComfort = preferences?.peptide_comfort_level ?? "topical_only";
  let maxPeptideTier = 1;
  if (peptideComfort === "open_to_injectable") maxPeptideTier = 3;

  const scoredPeptides: RelevanceScored<(typeof allPeptides)[number]>[] = (
    allPeptides ?? []
  )
    .filter((p) => p.tier <= maxPeptideTier)
    .map((pep) => {
      const conditionMatch = safeArrayOverlap(
        skinConditions,
        (pep.conditions_treated ?? []) as string[],
      );
      const rootCauseMatch = safeArrayOverlap(
        rootCauses,
        (pep.root_causes_targeted ?? []) as string[],
      );
      const mechanismMatch = safeArrayOverlap(
        mechanisms,
        (pep.mechanisms_targeted ?? []) as string[],
      );
      const score = calculateRelevanceScore({
        conditionMatch,
        rootCauseMatch,
        mechanismMatch,
        evidenceLevel: pep.evidence_level,
      });
      return { item: pep, score };
    })
    .filter((s) => s.score >= 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const peptideProtocol = scoredPeptides.map((p) => ({
    id: p.item.id,
    name: p.item.name,
    tier: p.item.tier,
    route: p.item.administration_route,
    dosage: p.item.dosage,
    frequency: p.item.frequency,
    evidence_level: p.item.evidence_level,
    regulatory_status: p.item.regulatory_status,
    relevance_score: Math.round(p.score),
    skin_benefits: p.item.skin_benefits,
  }));

  // ------------------------------------------------------------------
  // 6. Build protocol sections
  // ------------------------------------------------------------------

  const glycationRisk = calculateGlycationRisk({
    lifestyleScores,
    biomarkers: include_biomarkers,
  });

  const hydrationTarget = buildHydrationTarget({
    lifestyle,
    seasonal: allSeasonal,
  });
  const sleepProtocol = buildSleepProtocol({ lifestyle });
  const movementProtocol = buildMovementProtocol({ lifestyle });
  const stressProtocol = buildStressProtocol({
    lifestyle,
    psychoderm: allPsychoderm,
  });
  const environmentalDefense = buildEnvironmentalDefense({
    lifestyle,
    seasonal: allSeasonal,
  });
  const lightTherapy = buildLightTherapy({ lifestyle });
  const gutSkinProtocol = buildGutSkinProtocol({
    lifestyle,
    gutBrain: allGutBrainSkin,
  });
  const sunExposureProtocol = buildSunExposureProtocol({
    fitzpatrickType,
    lifestyle,
    sunProtocols: allSunExposure,
  });

  const fitzpatrickAdjustments = allFitzAdj ?? [];
  const medicationAdjustments =
    (lifestyle?.current_medications as string[])?.length > 0
      ? allMedEffects
      : [];

  const postProcedureProtocol =
    (lifestyle?.recent_procedures as string[])?.length > 0
      ? allPostProc?.filter((p) =>
          (lifestyle?.recent_procedures as string[]).includes(p.procedure_type),
        )
      : [];

  const oralMicrobiomeProtocol = buildOralMicrobiomeProtocol({
    oralMicro: allOralMicro,
  });
  const seasonalAdjustments = allSeasonal ?? [];
  const gutBrainSkinProtocol = buildGutBrainSkinProtocol({
    gutBrain: allGutBrainSkin,
    conditions: skinConditions,
  });

  // ------------------------------------------------------------------
  // 7. Insert plan into database
  // ------------------------------------------------------------------

  const planInsert = {
    user_id: effectiveUserId,
    plan_type: "auto",
    skin_conditions: skinConditions,
    root_causes: rootCauses,
    metabolic_risks: Object.keys(lifestyleScores).filter(
      (k) => k.includes("metabolic") || k.includes("glycation"),
    ),
    lifestyle_scores: lifestyleScores,
    hba1c: include_biomarkers?.hba1c ?? null,
    vitamin_d_ng_ml: include_biomarkers?.vitamin_d_ng_ml ?? null,
    omega3_index: include_biomarkers?.omega3_index ?? null,
    crp: include_biomarkers?.crp ?? null,
    fasting_glucose: include_biomarkers?.fasting_glucose ?? null,
    diet_protocol: selectedDiet
      ? {
          id: selectedDiet.id,
          name: selectedDiet.name,
          type: selectedDiet.protocol_type,
          foods_include: selectedDiet.foods_include,
          foods_avoid: selectedDiet.foods_avoid,
          evidence_level: selectedDiet.evidence_level,
        }
      : {},
    supplement_stack: supplementStack,
    peptide_protocol: peptideProtocol,
    hydration_target: hydrationTarget,
    sleep_protocol: sleepProtocol,
    movement_protocol: movementProtocol,
    stress_protocol: stressProtocol,
    environmental_defense: environmentalDefense,
    light_therapy: lightTherapy,
    gut_skin_protocol: gutSkinProtocol,
    glycation_score: glycationRisk,
    fitzpatrick_adjustments: fitzpatrickAdjustments,
    medication_adjustments: medicationAdjustments,
    post_procedure_protocol: postProcedureProtocol,
    oral_microbiome_protocol: oralMicrobiomeProtocol,
    seasonal_adjustments: seasonalAdjustments,
    gut_brain_skin_protocol: gutBrainSkinProtocol,
    sun_exposure_protocol: sunExposureProtocol,
    treatment_protocols: protocolsByCondition,
    psychoderm_protocol: stressProtocol,
    active: true,
    version: 1,
    notes: `Auto-generated wellness plan for ${skinConditions.length} detected conditions.`,
  };

  const { data: planRecord, error: planInsertError } = await supabase
    .from("wellness_plans")
    .insert(planInsert)
    .select()
    .single();

  if (planInsertError || !planRecord) {
    console.error("[wellness-plan/generate] insert error:", planInsertError);
    return apiError("Failed to create wellness plan", 500);
  }

  // ------------------------------------------------------------------
  // 8. Generate plan items for daily protocol
  // ------------------------------------------------------------------

  const planItems = buildPlanItems({
    planId: planRecord.id,
    supplementStack,
    peptideProtocol,
    selectedDiet,
    sleepProtocol,
    hydrationTarget,
    movementProtocol,
    stressProtocol,
  });

  if (planItems.length > 0) {
    const { error: itemsError } = await supabase
      .from("wellness_plan_items")
      .insert(planItems);

    if (itemsError) {
      console.error("[wellness-plan/generate] items insert error:", itemsError);
    }
  }

  // ------------------------------------------------------------------
  // 9. Build response
  // ------------------------------------------------------------------

  const response = {
    plan_id: planRecord.id,
    primary_goals: buildPrimaryGoals(skinConditions, rootCauses),
    diet_protocol: planInsert.diet_protocol,
    supplement_stack: supplementStack,
    peptide_protocol: peptideProtocol,
    hydration_target: hydrationTarget,
    sleep_protocol: sleepProtocol,
    mitochondrial_support: buildMitochondrialSupport(supplementStack),
    glycation_score: glycationRisk,
    movement_protocol: movementProtocol,
    stress_protocol: stressProtocol,
    environmental_defense: environmentalDefense,
    light_therapy: lightTherapy,
    gut_skin_protocol: gutSkinProtocol,
    psychoderm_protocol: stressProtocol,
    post_procedure_protocol: postProcedureProtocol,
    fitzpatrick_adjustments: fitzpatrickAdjustments,
    medication_adjustments: medicationAdjustments,
    oral_microbiome_protocol: oralMicrobiomeProtocol,
    seasonal_adjustments: seasonalAdjustments,
    gut_brain_skin_protocol: gutBrainSkinProtocol,
    sun_exposure_protocol: sunExposureProtocol,
    treatment_protocols: protocolsByCondition,
    disclaimer: buildDisclaimer(peptideProtocol),
    provider_recommendations: buildProviderRecs(peptideProtocol, allMedEffects),
  };

  return NextResponse.json(response, { status: 200 });
}

// ------------------------------------------------------------------
// Protocol builders
// ------------------------------------------------------------------

function calculateGlycationRisk(params: {
  lifestyleScores: Record<string, number>;
  biomarkers?: GenerateRequest["include_biomarkers"];
}): Record<string, unknown> {
  let score = 30; // baseline
  const factors: Array<{ name: string; value: string; points: number }> = [];

  const dietScore = params.lifestyleScores.diet ?? 5;
  if (dietScore < 4) {
    score += 20;
    factors.push({
      name: "Diet sugar/processed food",
      value: "HIGH",
      points: 20,
    });
  } else if (dietScore < 7) {
    score += 10;
    factors.push({
      name: "Diet sugar/processed food",
      value: "MODERATE",
      points: 10,
    });
  }

  if (params.biomarkers?.hba1c) {
    if (params.biomarkers.hba1c > 5.7) {
      score += 15;
      factors.push({
        name: "HbA1c",
        value: `${params.biomarkers.hba1c}%`,
        points: 15,
      });
    }
  } else {
    score += 15;
    factors.push({
      name: "HbA1c",
      value: "Not provided (estimated)",
      points: 15,
    });
  }

  const uvScore = params.lifestyleScores.uv ?? 5;
  if (uvScore < 4) {
    score += 15;
    factors.push({ name: "UV exposure", value: "HIGH", points: 15 });
  }

  return {
    score: Math.min(score, 100),
    risk_level: score > 70 ? "HIGH" : score > 50 ? "MODERATE" : "LOW",
    factors,
    interventions: [
      "Low GI diet (-30% AGE formation)",
      "Berberine (AMPK activation)",
      "Vitamin D (barrier repair)",
    ],
  };
}

function buildHydrationTarget(params: {
  lifestyle: Record<string, unknown> | null;
  seasonal: Array<Record<string, unknown>> | null;
}): Record<string, unknown> {
  const baseTarget = 64; // 8 glasses in oz
  const seasonalBoost = String(
    (params.seasonal ?? []).find((s) => s.category === "hydration")
      ?.adjustment ?? "",
  );

  let bonus = 0;
  if (seasonalBoost.includes("+30%")) bonus = 19;
  else if (seasonalBoost.includes("+20%")) bonus = 13;
  else if (seasonalBoost.includes("+10%")) bonus = 6;

  return {
    daily_oz: baseTarget + bonus,
    daily_ml: Math.round((baseTarget + bonus) * 29.57),
    glasses: Math.ceil((baseTarget + bonus) / 8),
    seasonal_adjustment: seasonalBoost,
    reminders: [
      "Morning: 16oz",
      "Midday: 16oz",
      "Afternoon: 16oz",
      "Evening: 16oz",
    ],
  };
}

function buildSleepProtocol(params: {
  lifestyle: Record<string, unknown> | null;
}): Record<string, unknown> {
  const sleepData = (params.lifestyle?.sleep as Record<string, unknown>) ?? {};
  const hours = (sleepData.hours as number) ?? 7;
  const quality = (sleepData.quality as string) ?? "fair";

  return {
    target_hours: hours < 7 ? 7 : hours,
    current_quality: quality,
    recommendations: [
      "Consistent bedtime (±30 min)",
      "No screens 60 min before bed",
      "Room temperature 65-68°F",
      "Complete darkness or eye mask",
      "Magnesium glycinate 400mg before bed",
    ],
    wind_down_routine: [
      "Dim lights at 9 PM",
      "Herbal tea (chamomile)",
      "Gentle stretching or breathwork",
      "Journal or read (physical book)",
    ],
  };
}

function buildMovementProtocol(params: {
  lifestyle: Record<string, unknown> | null;
}): Record<string, unknown> {
  const exerciseData = params.lifestyle ?? {};
  const freq = (exerciseData.exercise_frequency as string) ?? "rarely";
  const types = (exerciseData.exercise_type as string[]) ?? [];

  return {
    current_frequency: freq,
    current_types: types,
    recommendations: [
      "30 min moderate activity daily",
      "Zone 2 cardio (walking, cycling) 3-4x/week",
      "Resistance training 2-3x/week",
      "Facial yoga for muscle tone",
      "Post-workout: gentle cleanse + moisturizer",
    ],
    skin_specific: [
      "Shower immediately after sweating",
      "Use non-comedogenic sunscreen for outdoor exercise",
      "Cool down before applying actives",
    ],
  };
}

function buildStressProtocol(params: {
  lifestyle: Record<string, unknown> | null;
  psychoderm: Array<Record<string, unknown>> | null;
}): Record<string, unknown> {
  const stressData =
    (params.lifestyle?.stress as Record<string, unknown>) ?? {};
  const level = (stressData.level as string) ?? "moderate";

  const topPsychoderm = (params.psychoderm ?? [])
    .filter((p) => p.protocol_type !== "therapy_referral")
    .slice(0, 3);

  return {
    current_level: level,
    daily_practices: topPsychoderm.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.protocol_type,
      duration_minutes: p.duration_minutes,
      instructions: p.instructions,
    })),
    adaptogens: [
      "Ashwagandha 300-600mg (KSM-66)",
      "Magnesium glycinate 400mg before bed",
    ],
    escalation:
      level === "severe"
        ? "Consider therapy referral for stress-skin connection"
        : null,
  };
}

function buildEnvironmentalDefense(params: {
  lifestyle: Record<string, unknown> | null;
  seasonal: Array<Record<string, unknown>> | null;
}): Record<string, unknown> {
  const airQuality =
    (params.lifestyle?.indoor_air_quality as string) ?? "moderate";
  const humidity = (params.lifestyle?.humidity_level as string) ?? "moderate";

  return {
    indoor_air_quality: airQuality,
    humidity_level: humidity,
    recommendations: [
      humidity === "very_dry" || humidity === "dry"
        ? "Use humidifier (target 40-60%)"
        : "Monitor humidity levels",
      airQuality === "poor"
        ? "Consider HEPA air purifier"
        : "Maintain ventilation",
      "Antioxidant serum (vitamin C) daily",
      "SPF 30+ daily regardless of season",
      "Rinse face after outdoor exposure in polluted areas",
    ],
    seasonal_notes: (params.seasonal ?? [])
      .filter((s) => s.category === "environmental")
      .map((s) => s.adjustment),
  };
}

function buildLightTherapy(params: {
  lifestyle: Record<string, unknown> | null;
}): Record<string, unknown> {
  const redLight = (params.lifestyle?.red_light_therapy as boolean) ?? false;

  return {
    red_light_therapy: redLight,
    morning_light: "Get 10-20 min morning sunlight within 1 hour of waking",
    evening_light: "Dim artificial lights 2 hours before bed",
    screen_settings: "Enable night mode/blue light filters after sunset",
    red_light_device: redLight
      ? "Continue current red/NIR device protocol"
      : "Consider 660nm red light device for collagen + mitochondrial support",
  };
}

function buildGutSkinProtocol(params: {
  lifestyle: Record<string, unknown> | null;
  gutBrain: Array<Record<string, unknown>> | null;
}): Record<string, unknown> {
  const gutSymptoms = (params.lifestyle?.gut_health_symptoms as string[]) ?? [];
  const topGutProtocol = params.gutBrain?.find(
    (g) => g.protocol_type === "probiotic",
  );

  return {
    symptoms: gutSymptoms,
    protocol: topGutProtocol
      ? {
          id: topGutProtocol.id,
          name: topGutProtocol.name,
          type: topGutProtocol.protocol_type,
          details: topGutProtocol.intervention_details,
        }
      : null,
    recommendations: [
      "Fermented foods daily (kimchi, sauerkraut, kefir)",
      "30g fiber daily from diverse sources",
      "Avoid processed foods and excess sugar",
      "Chew thoroughly, eat mindfully",
      "Consider elimination diet if symptoms persist",
    ],
  };
}

function buildSunExposureProtocol(params: {
  fitzpatrickType: number;
  lifestyle: Record<string, unknown> | null;
  sunProtocols: Array<Record<string, unknown>> | null;
}): Record<string, unknown> {
  const morningExposure =
    (params.lifestyle?.morning_sun_exposure as string) ?? "sometimes";
  const fitzpatrickKey =
    ["I", "II", "III", "IV", "V", "VI"][params.fitzpatrickType - 1] ?? "III";

  const protocols = (params.sunProtocols ?? [])
    .filter((s) => {
      const durations =
        (s.fitzpatrick_duration as Record<string, number>) ?? {};
      return durations[fitzpatrickKey] !== undefined;
    })
    .slice(0, 3)
    .map((s) => {
      const durations =
        (s.fitzpatrick_duration as Record<string, number>) ?? {};
      return {
        id: s.id,
        name: s.name,
        time_window: s.time_window,
        duration_minutes: durations[fitzpatrickKey],
        uv_risk: s.uv_risk,
        benefits: {
          d3: s.d3_synthesis,
          circadian: s.circadian_benefit,
          mitochondrial: s.mitochondrial_benefit,
        },
      };
    });

  return {
    current_morning_exposure: morningExposure,
    fitzpatrick_type: params.fitzpatrickType,
    recommended_protocols: protocols,
    daily_target: "10-20 min morning sun (6-8 AM or 8-10 AM)",
    safety_rules: [
      "Never burn — stop before redness",
      "Face protected with SPF 30+ during exposure",
      "Avoid peak UV (10 AM - 4 PM) without protection",
      "Sunglasses optional for circadian benefit (without = better)",
    ],
  };
}

function buildOralMicrobiomeProtocol(params: {
  oralMicro: Array<Record<string, unknown>> | null;
}): Record<string, unknown> {
  const protocols = (params.oralMicro ?? []).slice(0, 3).map((o) => ({
    id: o.id,
    name: o.name,
    type: o.protocol_type,
    instructions: o.instructions,
  }));

  return {
    protocols,
    daily_practices: [
      "Tongue scraping every morning",
      "SLS-free toothpaste",
      "Floss daily",
      "Oil pulling 2x/week (coconut oil, 10 min)",
    ],
    supplements: [
      "Oral probiotic lozenge (L. reuteri)",
      "Zinc 15mg for gum health",
    ],
  };
}

function buildGutBrainSkinProtocol(params: {
  gutBrain: Array<Record<string, unknown>> | null;
  conditions: string[];
}): Record<string, unknown> {
  const matched = (params.gutBrain ?? []).filter((g) => {
    const treated = (g.conditions_treated as string[]) ?? [];
    return params.conditions.some((c) => treated.includes(c));
  });

  const top = matched[0] ?? params.gutBrain?.[0];

  return {
    primary_protocol: top
      ? {
          id: top.id,
          name: top.name,
          type: top.protocol_type,
          mechanism_chain: top.mechanism_chain,
          targets: {
            gut: top.targets_gut,
            brain: top.targets_brain,
            skin: top.targets_skin,
          },
        }
      : null,
    supporting_practices: [
      "Mindful eating (20 min per meal)",
      "Vagus nerve stimulation (cold shower finish, humming, gargling)",
      "Omega-3 3g daily for pro-resolving mediators",
      "Psychobiotic (L. rhamnosus + B. longum)",
    ],
  };
}

function buildMitochondrialSupport(
  supplements: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const mitoSupps = supplements.filter(
    (s) =>
      (s.name as string)?.toLowerCase().includes("coq") ||
      (s.name as string)?.toLowerCase().includes("pqq") ||
      (s.name as string)?.toLowerCase().includes("nmn") ||
      (s.name as string)?.toLowerCase().includes("nr"),
  );

  return {
    supplements: mitoSupps.map((s) => ({
      id: s.id,
      name: s.name,
      dosage: s.dosage,
    })),
    lifestyle: [
      "Morning sunlight exposure (mitochondrial red/NIR)",
      "Zone 2 cardio 3-4x/week",
      "Cold exposure finish (30-60 sec cold shower)",
      "Time-restricted eating (12-14 hour fast)",
    ],
  };
}

function buildPrimaryGoals(
  conditions: string[],
  rootCauses: string[],
): Array<{ goal: string; from: string }> {
  const goals: Array<{ goal: string; from: string }> = [];

  if (
    conditions.includes("acne-vulgaris") ||
    conditions.includes("hormonal-acne")
  ) {
    goals.push({
      goal: "Reduce inflammation and normalize sebum production",
      from: "acne",
    });
  }
  if (conditions.includes("premature-aging")) {
    goals.push({
      goal: "Support collagen synthesis and reduce oxidative damage",
      from: "aging",
    });
  }
  if (conditions.includes("rosacea")) {
    goals.push({
      goal: "Reduce vascular reactivity and barrier inflammation",
      from: "rosacea",
    });
  }
  if (conditions.includes("atopic-dermatitis")) {
    goals.push({
      goal: "Restore barrier function and reduce immune hyper-reactivity",
      from: "eczema",
    });
  }

  if (rootCauses.includes("glycation")) {
    goals.push({
      goal: "Reduce glycation damage through diet and AMPK activation",
      from: "glycation",
    });
  }
  if (rootCauses.includes("gut_dysbiosis")) {
    goals.push({
      goal: "Optimize gut-skin axis through microbiome support",
      from: "gut dysbiosis",
    });
  }

  if (goals.length === 0) {
    goals.push({
      goal: "Optimize overall skin health and resilience",
      from: "general wellness",
    });
  }

  return goals;
}

function buildPlanItems(params: {
  planId: string;
  supplementStack: Array<Record<string, unknown>>;
  peptideProtocol: Array<Record<string, unknown>>;
  selectedDiet: Record<string, unknown> | null;
  sleepProtocol: Record<string, unknown>;
  hydrationTarget: Record<string, unknown>;
  movementProtocol: Record<string, unknown>;
  stressProtocol: Record<string, unknown>;
}): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = [];
  let sortOrder = 0;

  // Morning supplements
  params.supplementStack.slice(0, 4).forEach((sup) => {
    items.push({
      plan_id: params.planId,
      category: "supplement",
      item_type: "daily",
      title: sup.name as string,
      description: `Take ${sup.dosage ?? "as directed"}`,
      dosage: sup.dosage,
      timing: "morning",
      frequency: "daily",
      supplement_id: sup.id,
      priority: "high",
      evidence_level: sup.evidence_level,
      sort_order: sortOrder++,
    });
  });

  // Evening supplements
  params.supplementStack.slice(4, 7).forEach((sup) => {
    items.push({
      plan_id: params.planId,
      category: "supplement",
      item_type: "daily",
      title: sup.name as string,
      description: `Take ${sup.dosage ?? "as directed"} with evening meal`,
      dosage: sup.dosage,
      timing: "evening",
      frequency: "daily",
      supplement_id: sup.id,
      priority: "medium",
      evidence_level: sup.evidence_level,
      sort_order: sortOrder++,
    });
  });

  // Topical peptides (PM)
  params.peptideProtocol
    .filter((p) => (p.route as string) === "topical")
    .forEach((pep) => {
      items.push({
        plan_id: params.planId,
        category: "peptide",
        item_type: "daily",
        title: pep.name as string,
        description: `Apply ${pep.dosage ?? "as directed"} in evening routine`,
        dosage: pep.dosage,
        timing: "evening",
        frequency: pep.frequency ?? "daily",
        peptide_id: pep.id,
        priority: "medium",
        evidence_level: pep.evidence_level,
        sort_order: sortOrder++,
      });
    });

  // Hydration
  items.push({
    plan_id: params.planId,
    category: "hydration",
    item_type: "daily",
    title: "Daily Hydration Target",
    description: `Drink ${params.hydrationTarget.glasses ?? 8} glasses of water today`,
    timing: "throughout_day",
    frequency: "daily",
    priority: "high",
    sort_order: sortOrder++,
  });

  // Sleep
  items.push({
    plan_id: params.planId,
    category: "sleep",
    item_type: "daily",
    title: "Sleep Optimization",
    description: "Target 7-9 hours with consistent bedtime",
    timing: "before_bed",
    frequency: "daily",
    priority: "high",
    sort_order: sortOrder++,
  });

  // Movement
  items.push({
    plan_id: params.planId,
    category: "exercise",
    item_type: "daily",
    title: "Movement Protocol",
    description: "30 minutes moderate activity",
    timing: "morning_or_afternoon",
    frequency: "daily",
    priority: "medium",
    sort_order: sortOrder++,
  });

  // Stress management
  const topStress = ((params.stressProtocol.daily_practices as Array<
    Record<string, unknown>
  >) ?? [])[0];
  if (topStress) {
    items.push({
      plan_id: params.planId,
      category: "stress",
      item_type: "daily",
      title: topStress.name as string,
      description: topStress.instructions as string,
      timing: "morning_or_evening",
      frequency: topStress.frequency as string,
      priority: "medium",
      sort_order: sortOrder++,
    });
  }

  return items;
}

function buildDisclaimer(
  peptideProtocol: Array<Record<string, unknown>>,
): string {
  const hasTier2 = peptideProtocol.some((p) => (p.tier as number) >= 2);
  const hasTier3 = peptideProtocol.some((p) => (p.tier as number) >= 3);

  if (hasTier3) {
    return "These compounds are classified as research peptides and are not approved for human use by the FDA. This information is provided for educational and research purposes only.";
  }
  if (hasTier2) {
    return "These peptides are not FDA-approved for the uses described. SKINgenius provides this information for educational purposes only. Consult a licensed healthcare provider before use.";
  }
  return "These recommendations are based on published research and are intended for informational purposes. They are not intended to diagnose, treat, cure, or prevent any disease.";
}

function buildProviderRecs(
  peptideProtocol: Array<Record<string, unknown>>,
  medEffects: Array<Record<string, unknown>> | null,
): Array<Record<string, unknown>> {
  const recs: Array<Record<string, unknown>> = [];

  if (peptideProtocol.some((p) => (p.tier as number) >= 2)) {
    recs.push({
      type: "peptide_clinic",
      reason: "Tier 2+ peptides require medical supervision",
      urgency: "recommended",
    });
  }

  if ((medEffects ?? []).length > 0) {
    recs.push({
      type: "pharmacist_review",
      reason: "Medication interactions detected",
      urgency: "recommended",
    });
  }

  return recs;
}
