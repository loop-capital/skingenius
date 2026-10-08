// ───────────────────────────────────────────────────────────────
// Clinical Review Types — SKINgenius escalation flow
// ───────────────────────────────────────────────────────────────

export type ClinicalReviewStatus =
  | "pending_payment"
  | "pending_review"
  | "in_review"
  | "complete"
  | "cancelled";

export interface ClinicalReviewPhoto {
  id: string;
  clinical_review_id: string;
  photo_url: string;
  photo_type: "close_up" | "original_scan";
  created_at: string;
}

export interface ProviderReferral {
  name: string;
  specialty: string;
  address?: string;
  phone?: string;
  distance_miles?: number;
  matched_condition: string;
}

export interface ClinicalReview {
  id: string;
  scan_id: string | null;
  user_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_group_number: string | null;
  status: ClinicalReviewStatus;
  payment_intent_id: string | null;
  amount_cents: number;
  consent_hipaa: boolean;
  consent_share: boolean;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescription_name: string | null;
  prescription_dosage: string | null;
  prescription_instructions: string | null;
  provider_referrals: ProviderReferral[] | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalReviewInput {
  scan_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  consent_hipaa: boolean;
  consent_share: boolean;
  photos?: { photo_url: string; photo_type: "close_up" | "original_scan" }[];
}

export interface ClinicalReviewUpdate {
  status?: ClinicalReviewStatus;
  diagnosis?: string;
  treatment_plan?: string;
  prescription_name?: string;
  prescription_dosage?: string;
  prescription_instructions?: string;
  provider_referrals?: ProviderReferral[];
  completed_at?: string;
}

export interface FlaggedFinding {
  condition_id?: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  confidence: number;
  zone: string;
  features: string[];
}

export interface ClinicalReviewWithDetails extends ClinicalReview {
  photos: ClinicalReviewPhoto[];
  scan_conditions: FlaggedFinding[];
}
