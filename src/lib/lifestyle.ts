// ───────────────────────────────────────────────────────────────
// Lifestyle Questionnaire Logic
// ───────────────────────────────────────────────────────────────

import {
  LifestyleResponses,
  SleepData,
  StressData,
  DietData,
  UVData,
} from "@/types/lifestyle";

const STORAGE_KEY = "skingenius_lifestyle_draft";

export function loadDraft(): Partial<LifestyleResponses> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(data: Partial<LifestyleResponses>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const DEFAULT_SLEEP: SleepData = {
  hoursPerNight: 7,
  sleepQuality: 5,
  sleepConsistent: false,
};

export const DEFAULT_STRESS: StressData = {
  stressLevel: 5,
  triggers: [],
  management: [],
};

export const DEFAULT_DIET: DietData = {
  waterIntake: 4,
  sugarConsumption: "medium",
  dairyConsumption: "medium",
  processedFood: "occasional",
};

export const DEFAULT_UV: UVData = {
  dailySunExposure: 30,
  sunscreenUsage: "sometimes",
  spfLevel: 30,
  tanningBed: false,
};

export function getDefaultResponses(): LifestyleResponses {
  return {
    sleep: DEFAULT_SLEEP,
    stress: DEFAULT_STRESS,
    diet: DEFAULT_DIET,
    uv: DEFAULT_UV,
  };
}

export function mergeWithDefaults(
  draft: Partial<LifestyleResponses> | null
): LifestyleResponses {
  const defaults = getDefaultResponses();
  if (!draft) return defaults;
  return {
    sleep: { ...defaults.sleep, ...draft.sleep },
    stress: { ...defaults.stress, ...draft.stress },
    diet: { ...defaults.diet, ...draft.diet },
    uv: { ...defaults.uv, ...draft.uv },
  };
}

// ─── Scoring ──────────────────────────────────────────────────

export interface LifestyleScore {
  overall: number;      // 0–100
  sleep: number;
  stress: number;
  diet: number;
  uv: number;
}

export function calculateLifestyleScore(data: LifestyleResponses): LifestyleScore {
  // Sleep: 0–25
  const sleepScore = Math.min(
    ((data.sleep.hoursPerNight / 8) * 12.5) +
    ((data.sleep.sleepQuality / 10) * 12.5),
    25
  );

  // Stress: 0–25 (inverse — lower stress is better)
  const stressScore = Math.min(
    ((10 - data.stress.stressLevel) / 10) * 25,
    25
  );

  // Diet: 0–25
  const sugarScore =
    data.diet.sugarConsumption === "low" ? 8 :
    data.diet.sugarConsumption === "medium" ? 5 : 2;
  const waterScore = Math.min((data.diet.waterIntake / 8) * 8, 8);
  const dairyScore =
    data.diet.dairyConsumption === "none" ? 3 :
    data.diet.dairyConsumption === "low" ? 4 :
    data.diet.dairyConsumption === "medium" ? 3 : 2;
  const processedScore =
    data.diet.processedFood === "rare" ? 6 :
    data.diet.processedFood === "occasional" ? 4 : 2;
  const dietScore = Math.min(sugarScore + waterScore + dairyScore + processedScore, 25);

  // UV: 0–25
  const exposureScore = Math.max(0, 12.5 - (data.uv.dailySunExposure / 60) * 12.5);
  const sunscreenScore =
    data.uv.sunscreenUsage === "always" ? 12.5 :
    data.uv.sunscreenUsage === "sometimes" ? 6 : 0;
  const uvScore = Math.min(exposureScore + sunscreenScore, 25);

  return {
    overall: Math.round(sleepScore + stressScore + dietScore + uvScore),
    sleep: Math.round(sleepScore),
    stress: Math.round(stressScore),
    diet: Math.round(dietScore),
    uv: Math.round(uvScore),
  };
}

// ─── Recommendations ──────────────────────────────────────────

export interface LifestyleRecommendation {
  category: "sleep" | "stress" | "diet" | "uv";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function generateRecommendations(
  data: LifestyleResponses
): LifestyleRecommendation[] {
  const recs: LifestyleRecommendation[] = [];

  // Sleep recommendations
  if (data.sleep.hoursPerNight < 7) {
    recs.push({
      category: "sleep",
      title: "Aim for 7–9 hours of sleep",
      description: "Your skin repairs itself during deep sleep. Insufficient rest accelerates aging and impairs barrier function.",
      priority: "high",
    });
  }
  if (data.sleep.sleepQuality < 6) {
    recs.push({
      category: "sleep",
      title: "Improve sleep quality",
      description: "Consider a consistent bedtime routine, blue-light filters after 8pm, and a cool (65–68°F) bedroom.",
      priority: "high",
    });
  }
  if (!data.sleep.sleepConsistent) {
    recs.push({
      category: "sleep",
      title: "Stick to a consistent sleep schedule",
      description: "Irregular sleep disrupts cortisol and melatonin rhythms, worsening inflammation and skin repair.",
      priority: "medium",
    });
  }

  // Stress recommendations
  if (data.stress.stressLevel > 6) {
    recs.push({
      category: "stress",
      title: "Manage chronic stress",
      description: "High cortisol triggers breakouts, slows healing, and degrades collagen. Try 10 minutes of daily breathwork or a short walk.",
      priority: "high",
    });
  }
  if (data.stress.triggers.includes("work")) {
    recs.push({
      category: "stress",
      title: "Set work-life boundaries",
      description: "Work stress elevates cortisol. Try time-blocking and a hard stop at a set hour to protect skin recovery time.",
      priority: "medium",
    });
  }
  if (data.stress.management.length === 0 || data.stress.management.includes("none")) {
    recs.push({
      category: "stress",
      title: "Build a stress-management practice",
      description: "Even 5 minutes of meditation or journaling can lower cortisol. Pick one habit and anchor it to an existing routine.",
      priority: "high",
    });
  }

  // Diet recommendations
  if (data.diet.waterIntake < 6) {
    recs.push({
      category: "diet",
      title: "Drink more water",
      description: "Aim for 6–8 glasses daily. Dehydration reduces skin elasticity and makes fine lines more visible.",
      priority: "high",
    });
  }
  if (data.diet.sugarConsumption === "high") {
    recs.push({
      category: "diet",
      title: "Reduce sugar intake",
      description: "Excess sugar causes glycation, which stiffens collagen and accelerates wrinkles. Swap soda for sparkling water.",
      priority: "high",
    });
  }
  if (data.diet.processedFood === "frequent") {
    recs.push({
      category: "diet",
      title: "Cut back on processed foods",
      description: "Processed foods are high in omega-6 oils and preservatives that promote inflammation. Cook one extra meal at home per week.",
      priority: "medium",
    });
  }
  if (data.diet.dairyConsumption === "high") {
    recs.push({
      category: "diet",
      title: "Moderate dairy",
      description: "High dairy intake correlates with acne in some people. Try a 2-week reduction and monitor your skin.",
      priority: "medium",
    });
  }

  // UV recommendations
  if (data.uv.dailySunExposure > 60) {
    recs.push({
      category: "uv",
      title: "Limit unprotected sun exposure",
      description: "Prolonged UV exposure is the #1 cause of premature aging and pigmentation. Seek shade between 10am–4pm.",
      priority: "high",
    });
  }
  if (data.uv.sunscreenUsage !== "always") {
    recs.push({
      category: "uv",
      title: "Wear sunscreen daily",
      description: "UVA penetrates windows and clouds. A daily SPF 30+ is the single best anti-aging step you can take.",
      priority: "high",
    });
  }
  if (data.uv.spfLevel < 30) {
    recs.push({
      category: "uv",
      title: "Use SPF 30 or higher",
      description: "SPF 30 blocks ~97% of UVB. Anything lower leaves significant cumulative damage over time.",
      priority: "medium",
    });
  }
  if (data.uv.tanningBed) {
    recs.push({
      category: "uv",
      title: "Avoid tanning beds",
      description: "Tanning beds emit concentrated UVA that dramatically increases skin cancer risk and accelerates photoaging.",
      priority: "high",
    });
  }

  return recs.sort((a, b) => {
    const pMap = { high: 3, medium: 2, low: 1 };
    return pMap[b.priority] - pMap[a.priority];
  });
}
