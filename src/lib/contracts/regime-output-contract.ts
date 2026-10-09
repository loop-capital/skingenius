/**
 * regime-output-contract.ts — THE regime output schema for SKINgenius.
 *
 * Sienna's rule: the engine publishes this early so Jensen (website builder)
 * isn't blocked on the money screen (scan results page).
 *
 * This is what POST /api/v1/scan returns and what the results UI renders.
 * Covers the FULL regime: products, clinical treatments, providers, lifestyle.
 *
 * Version: 1.0.0
 */

import type { IntakeProfile } from "./intake-contract";

// ─── Scan analysis ───────────────────────────────────────────────────────────

export type Severity = "mild" | "moderate" | "severe";

export interface DetectedCondition {
  id: string;
  name: string;
  confidence: number; // 0-1
  severity: Severity;
  affected_areas: string[];
  /** Consumer-friendly description of what's visible */
  description: string;
}

export interface SkinZoneAnalysis {
  zone: string;
  primary_concern: string;
  description: string;
  severity: Severity;
  confidence: number;
}

// ─── Product recommendations ─────────────────────────────────────────────────

export interface RegimeProduct {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  /** Why this product for this user */
  reasoning: string;
  key_actives: Array<{ ingredient: string; concentration?: string }>;
  price_tier: "$" | "$$" | "$$$";
  /** Direct brand URL (preferred) or affiliate-wrapped URL */
  purchase_url?: string;
  /** When to use it */
  usage: "morning" | "evening" | "both";
  /** Step order in the routine (1 = first) */
  routine_step: number;
}

// ─── Clinical treatments ─────────────────────────────────────────────────────

export type TreatmentCategory =
  | "chemical_peel"
  | "microneedling"
  | "laser"
  | "dermal_filler"
  | "botox"
  | "hydrafacial"
  | "led_therapy"
  | "prescription"
  | "other";

export interface ClinicalTreatment {
  treatment_id: string;
  name: string;
  category: TreatmentCategory;
  /** Why this treatment for this user's conditions */
  reasoning: string;
  /** Expected sessions */
  typical_sessions: string;
  /** Price range */
  price_range: string;
  /** Urgency: routine | recommended | urgent (see derm soon) */
  priority: "routine" | "recommended" | "urgent";
  /** Contraindications based on intake (pregnancy, allergies, etc.) */
  contraindications: string[];
}

// ─── Provider referrals ──────────────────────────────────────────────────────

export interface ProviderReferral {
  provider_id: string;
  name: string;
  /** dermatologist | aesthetician | med_spa | clinic */
  type: string;
  /** Why this provider for this user */
  match_reason: string;
  distance_miles?: number;
  rating?: number;
  /** AgentCal booking hook — stub until Q publishes the contract */
  agentcal_booking_url?: string;
  specialties: string[];
}

// ─── Lifestyle recommendations ───────────────────────────────────────────────

export interface LifestyleRecommendation {
  category: "sleep" | "stress" | "diet" | "uv" | "routine";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

// ─── THE CONTRACT ────────────────────────────────────────────────────────────

/**
 * Complete regime output. This is the money screen.
 * Jensen builds the results UI against this schema.
 */
export interface RegimeOutput {
  /** Schema version */
  version: "1.0.0";
  scan_id: string;
  user_id: string;
  created_at: string;

  /** Which model produced this (on-device | gpt-4o | etc.) */
  model: string;
  /** User tier at time of scan */
  tier: "free" | "pro" | "pro_plus";

  // Analysis
  overall_score: number; // 0-100, higher = healthier
  primary_concern: string;
  urgent_flag: boolean;
  fitzpatrick_type: string;
  conditions: DetectedCondition[];
  skin_zones: SkinZoneAnalysis[];

  // The full regime
  /** Ordered morning routine */
  morning_routine: RegimeProduct[];
  /** Ordered evening routine */
  evening_routine: RegimeProduct[];
  /** Clinical treatments beyond OTC */
  clinical_treatments: ClinicalTreatment[];
  /** Provider referrals with booking */
  providers: ProviderReferral[];
  /** Lifestyle changes */
  lifestyle: LifestyleRecommendation[];

  // Personalization
  /** References intake answers, e.g. "Based on what you told me about your sleep..." */
  personalization_notes: string[];

  // Metadata
  processing_time_ms: number;
  /** Intake profile that informed this regime (if provided) */
  intake_snapshot?: IntakeProfile;
}

/** What the scan endpoint returns (wraps RegimeOutput). */
export interface ScanResponse {
  success: boolean;
  data: RegimeOutput;
  error?: string;
}
