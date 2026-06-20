// ───────────────────────────────────────────────────────────────
// Lifestyle Questionnaire Types
// ───────────────────────────────────────────────────────────────

export interface SleepData {
  hoursPerNight: number;       // 4–10
  sleepQuality: number;        // 1–10
  sleepConsistent: boolean;    // same time every night
}

export interface StressData {
  stressLevel: number;         // 1–10
  triggers: string[];          // work, relationships, health, financial
  management: string[];        // exercise, meditation, therapy, none
}

export interface DietData {
  waterIntake: number;         // glasses per day
  sugarConsumption: "low" | "medium" | "high";
  dairyConsumption: "none" | "low" | "medium" | "high";
  processedFood: "rare" | "occasional" | "frequent";
}

export interface UVData {
  dailySunExposure: number;    // minutes
  sunscreenUsage: "never" | "sometimes" | "always";
  spfLevel: number;            // SPF value used
  tanningBed: boolean;
}

export interface LifestyleResponses {
  id?: string;
  user_id?: string;
  sleep: SleepData;
  stress: StressData;
  diet: DietData;
  uv: UVData;
  created_at?: string;
  updated_at?: string;
}

export interface LifestyleRecommendation {
  category: "sleep" | "stress" | "diet" | "uv";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export type LifestyleStep = "sleep" | "stress" | "diet" | "uv" | "review";

export const STRESS_TRIGGERS = [
  { id: "work", label: "Work", icon: "Briefcase" },
  { id: "relationships", label: "Relationships", icon: "Heart" },
  { id: "health", label: "Health", icon: "Activity" },
  { id: "financial", label: "Financial", icon: "DollarSign" },
];

export const STRESS_MANAGEMENT = [
  { id: "exercise", label: "Exercise", icon: "Dumbbell" },
  { id: "meditation", label: "Meditation", icon: "Brain" },
  { id: "therapy", label: "Therapy", icon: "MessageCircle" },
  { id: "none", label: "None", icon: "X" },
];

export const SUGAR_OPTIONS = [
  { value: "low", label: "Low", desc: "Rarely eat sweets or sugary drinks" },
  { value: "medium", label: "Moderate", desc: "Occasional treats or soda" },
  { value: "high", label: "High", desc: "Daily sugary snacks or beverages" },
];

export const DAIRY_OPTIONS = [
  { value: "none", label: "None", desc: "No dairy at all" },
  { value: "low", label: "Low", desc: "Minimal dairy (e.g. in coffee)" },
  { value: "medium", label: "Moderate", desc: "Some cheese or yogurt daily" },
  { value: "high", label: "High", desc: "Multiple servings per day" },
];

export const PROCESSED_OPTIONS = [
  { value: "rare", label: "Rare", desc: "Whole foods most of the time" },
  { value: "occasional", label: "Occasional", desc: "A few times per week" },
  { value: "frequent", label: "Frequent", desc: "Most meals include processed food" },
];

export const SUNSCREEN_OPTIONS = [
  { value: "never", label: "Never", desc: "I don't wear sunscreen" },
  { value: "sometimes", label: "Sometimes", desc: "Only on beach days or sunny days" },
  { value: "always", label: "Always", desc: "Every day, rain or shine" },
];
