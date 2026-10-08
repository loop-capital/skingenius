// ───────────────────────────────────────────────────────────────
// Clinical Review Data Layer — server helpers
// ───────────────────────────────────────────────────────────────

import { createClient } from "@/utils/supabase/server";
import {
  ClinicalReview,
  ClinicalReviewInput,
  ClinicalReviewUpdate,
  ClinicalReviewWithDetails,
  FlaggedFinding,
} from "@/types/clinical";

export interface CreateReviewPayload extends ClinicalReviewInput {
  user_id: string;
}

export async function createClinicalReview(
  payload: CreateReviewPayload,
): Promise<ClinicalReview> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clinical_reviews")
    .insert({
      scan_id: payload.scan_id,
      user_id: payload.user_id,
      patient_name: payload.patient_name,
      patient_email: payload.patient_email,
      patient_phone: payload.patient_phone ?? null,
      insurance_provider: payload.insurance_provider ?? null,
      insurance_policy_number: payload.insurance_policy_number ?? null,
      insurance_group_number: payload.insurance_group_number ?? null,
      status: "pending_payment",
      amount_cents: 4900,
      consent_hipaa: payload.consent_hipaa,
      consent_share: payload.consent_share,
      payment_intent_id: `mock_pi_${Date.now()}`,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create clinical review");
  }

  const review = data as ClinicalReview;

  if (payload.photos && payload.photos.length > 0) {
    const { error: photoError } = await supabase
      .from("clinical_review_photos")
      .insert(
        payload.photos.map((p) => ({
          clinical_review_id: review.id,
          photo_url: p.photo_url,
          photo_type: p.photo_type,
        })),
      );

    if (photoError) {
      // Non-fatal for prototype; log and continue
      console.warn("Failed to insert clinical review photos:", photoError.message);
    }
  }

  return review;
}

export async function getClinicalReviewById(
  id: string,
): Promise<ClinicalReviewWithDetails | null> {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("clinical_reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !review) return null;

  const { data: photos } = await supabase
    .from("clinical_review_photos")
    .select("*")
    .eq("clinical_review_id", id);

  const scanConditions = await getFlaggedConditionsForScan(review.scan_id);

  return {
    ...(review as ClinicalReview),
    photos: (photos ?? []) as ClinicalReviewWithDetails["photos"],
    scan_conditions: scanConditions,
  };
}

export async function getClinicalReviewsByStatus(
  status?: string,
): Promise<ClinicalReviewWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("clinical_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: reviews, error } = await query;

  if (error || !reviews) {
    throw new Error(error?.message ?? "Failed to load clinical reviews");
  }

  const results = await Promise.all(
    (reviews as ClinicalReview[]).map(async (review) => {
      const { data: photos } = await supabase
        .from("clinical_review_photos")
        .select("*")
        .eq("clinical_review_id", review.id);

      const scanConditions = await getFlaggedConditionsForScan(review.scan_id);

      return {
        ...review,
        photos: (photos ?? []) as ClinicalReviewWithDetails["photos"],
        scan_conditions: scanConditions,
      };
    }),
  );

  return results;
}

export async function updateClinicalReview(
  id: string,
  update: ClinicalReviewUpdate,
): Promise<ClinicalReview> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clinical_reviews")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update clinical review");
  }

  return data as ClinicalReview;
}

async function getFlaggedConditionsForScan(
  scanId: string | null,
): Promise<FlaggedFinding[]> {
  if (!scanId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("skin_analyses")
    .select(
      `condition_id, confidence_score, severity, location_on_face, notes, skin_conditions (name, slug)`,
    )
    .eq("id", scanId);

  if (error || !data || data.length === 0) return [];

  return data.map((row: Record<string, unknown>) => {
    const condition = row.skin_conditions as { name?: string; slug?: string } | null;
    return {
      condition_id: (row.condition_id as string) ?? undefined,
      name: condition?.name ?? "Unknown condition",
      severity: (row.severity as FlaggedFinding["severity"]) ?? "moderate",
      confidence: Number(row.confidence_score ?? 0),
      zone: (row.location_on_face as string) ?? "Unknown zone",
      features: row.notes ? [String(row.notes)] : [],
    };
  });
}

export async function logClinicalReviewEmail(
  reviewId: string,
  to: string,
): Promise<void> {
  // Prototype: log to stdout. Replace with Resend/SendGrid/SMTP in production.
  console.log(`[CLINICAL EMAIL] Review ${reviewId} complete. Sent to ${to}`);
}
