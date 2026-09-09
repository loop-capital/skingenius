// GetUpLook Integration Client
// Handles matching skin conditions to GetUpLook providers and creating referrals

import { createClient } from "@supabase/supabase-js";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";
const GETUPLOOK_ANON_KEY = process.env.GETUPLOOK_ANON_KEY;

export const getuplook = createGetUpLookClient;
function createGetUpLookClient() {
  if (!GETUPLOOK_ANON_KEY) {
    throw new Error("GETUPLOOK_ANON_KEY environment variable is required");
  }
  return createClient(GETUPLOOK_URL, GETUPLOOK_ANON_KEY);
}

// Condition → Service category mapping
const CONDITION_SERVICES: Record<string, string[]> = {
  acne: ["facial", "hydrafacial", "chemical peel", "led therapy"],
  wrinkles: ["botox", "filler", "laser", "microneedling"],
  "fine lines": ["botox", "filler", "microneedling", "chemical peel"],
  redness: ["laser", "ipl", "calming facial"],
  hyperpigmentation: ["chemical peel", "laser", "brightening facial"],
  dryness: ["hydrafacial", "hydrating facial", "moisture treatment"],
  texture: ["microdermabrasion", "chemical peel", "microneedling"],
  "large pores": ["chemical peel", "laser", "microdermabrasion"],
};

// Service name fuzzy matching
function matchServiceToCondition(
  serviceName: string,
  conditions: string[],
): number {
  const nameLower = serviceName.toLowerCase();
  let score = 0;

  for (const condition of conditions) {
    const keywords = CONDITION_SERVICES[condition.toLowerCase()] || [];
    if (keywords.some((kw) => nameLower.includes(kw))) {
      score += 1;
    }
  }

  return score;
}

export interface ProviderMatch {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
    match_score: number;
  }>;
  total_match_score: number;
  avg_rating?: number;
}

export async function matchProviders(
  conditions: string[],
): Promise<ProviderMatch[]> {
  // Fetch all active providers with their services
  const { data: providers, error: providersError } = await createGetUpLookClient()
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("role", "provider")
    .eq("is_active", true);

  if (providersError) throw providersError;

  const { data: services, error: servicesError } = await createGetUpLookClient()
    .from("services")
    .select("id, provider_id, name, price, duration_minutes")
    .eq("is_active", true);

  if (servicesError) throw servicesError;

  const { data: reviews, error: reviewsError } = await createGetUpLookClient()
    .from("reviews")
    .select("provider_id, rating");

  if (reviewsError) throw reviewsError;

  // Calculate average ratings
  const ratings =
    reviews?.reduce(
      (acc, r) => {
        if (!r.rating) return acc;
        acc[r.provider_id] = acc[r.provider_id] || [];
        acc[r.provider_id].push(r.rating);
        return acc;
      },
      {} as Record<string, number[]>,
    ) || {};

  // Match providers to conditions
  const matches: ProviderMatch[] =
    providers
      ?.map((provider) => {
        const providerServices =
          services?.filter((s) => s.provider_id === provider.id) || [];

        const scoredServices = providerServices
          .map((service) => ({
            ...service,
            match_score: matchServiceToCondition(service.name, conditions),
          }))
          .filter((s) => s.match_score > 0);

        const totalScore = scoredServices.reduce(
          (sum, s) => sum + s.match_score,
          0,
        );
        const providerRatings = ratings[provider.id] || [];
        const avgRating =
          providerRatings.length > 0
            ? providerRatings.reduce((a, b) => a + b, 0) /
              providerRatings.length
            : undefined;

        return {
          id: provider.id,
          first_name: provider.first_name,
          last_name: provider.last_name,
          email: provider.email,
          services: scoredServices.sort(
            (a, b) => b.match_score - a.match_score,
          ),
          total_match_score: totalScore,
          avg_rating: avgRating,
        };
      })
      .filter((m) => m.services.length > 0) || [];

  // Sort by total match score
  return matches.sort((a, b) => b.total_match_score - a.total_match_score);
}

export async function createReferral(input: {
  scanId: string;
  userId: string;
  providerId: string;
  conditions: string[];
  confidenceScores: Record<string, number>;
  scanMetadata?: Record<string, unknown>;
  recommendedServiceIds?: string[];
  matchScore?: number;
  notes?: string;
}) {
  const {
    scanId,
    userId,
    providerId,
    conditions,
    confidenceScores,
    scanMetadata,
    recommendedServiceIds,
    matchScore,
    notes,
  } = input;

  const { data, error } = await createGetUpLookClient()
    .from("referrals")
    .insert({
      external_scan_id: scanId,
      external_user_id: userId,
      provider_id: providerId,
      skin_conditions: conditions,
      confidence_scores: confidenceScores,
      scan_metadata: scanMetadata,
      recommended_service_ids: recommendedServiceIds,
      match_score: matchScore,
      notes,
      status: "sent",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
