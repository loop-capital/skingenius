/**
 * POST /api/v1/scan
 *
 * Spec-driven scan endpoint for SKINgenius.
 *
 * Request body:
 *   {
 *     "image": "base64-encoded-image",
 *     "user_tier": "free | pro | pro_plus",
 *     "scan_type": "skin_health | aesthetics | both",
 *     "user_id": "uuid"
 *   }
 *
 * Behavior:
 *   - Determines tier from request body or user profile.
 *   - Free tier: returns a mock on-device response, enforces 4 scans/month.
 *   - Pro/Pro+ tiers: currently return mock responses while cloud model is wired.
 *   - Persists results to Supabase scan_results table.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  V1ScanRequest,
  V1ScanResponse,
  V1ScanResponseData,
  UserTier,
  ScanType,
} from "@/types/api";
import { buildMockOnDeviceResponse } from "@/lib/scan/mockOnDeviceResponse";
import { analyzeImageWithVision } from "@/lib/scan/cloudVision";

// ─── Constants ────────────────────────────────────────────────

const FREE_TIER_MONTHLY_SCAN_LIMIT = 4;

// ─── Helpers ──────────────────────────────────────────────────

function apiError(
  message: string,
  status: number = 400,
  detail?: string
): NextResponse {
  return NextResponse.json(
    { error: message, ...(detail ? { detail } : {}) } as V1ScanResponse,
    { status }
  );
}

function isValidUserTier(value: unknown): value is UserTier {
  return value === "free" || value === "pro" || value === "pro_plus";
}

function isValidScanType(value: unknown): value is ScanType {
  return value === "skin_health" || value === "aesthetics" || value === "both";
}

async function detectUserTierFromProfile(userId: string): Promise<UserTier> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .single();

    if (error || !data?.subscription_tier) return "free";

    const tier = data.subscription_tier;
    if (tier === "pro_plus") return "pro_plus";
    if (tier === "pro") return "pro";
    return "free";
  } catch {
    return "free";
  }
}

async function countScansThisMonth(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("scan_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    console.error("[scan] countScansThisMonth error:", error);
    return 0;
  }

  return count ?? 0;
}

function tryGetUserId(req: NextRequest): string | null {
  const testUser = req.headers.get("x-test-user-id");
  if (testUser) return testUser;

  try {
    const cookie = req.cookies.get("sb-access-token")?.value;
    if (cookie) {
      const payload = JSON.parse(
        Buffer.from(cookie.split(".")[1], "base64").toString("utf8")
      );
      if (payload?.sub) return payload.sub as string;
    }
  } catch {
    // ignore
  }

  return null;
}

// ─── Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  // ── 1. Auth / user ID ───────────────────────────────────────
  let userId = tryGetUserId(req);

  // ── 2. Parse body ──────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const {
    image,
    user_tier,
    scan_type,
    user_id,
  } = body as Partial<V1ScanRequest>;

  // Prefer explicit user_id in body if no authenticated user
  if (!userId && user_id) {
    userId = user_id;
  }

  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[scan] No authenticated user; using dev dummy UUID.");
      userId = "00000000-0000-0000-0000-000000000000";
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  // ── 3. Validate required fields ────────────────────────────
  if (!image || typeof image !== "string") {
    return apiError("Missing or invalid field: image (base64 string)");
  }

  const resolvedScanType: ScanType = isValidScanType(scan_type)
    ? scan_type
    : "skin_health";

  // ── 4. Resolve tier ─────────────────────────────────────────
  let tier: UserTier = isValidUserTier(user_tier) ? user_tier : "free";
  if (tier === "free" && userId) {
    tier = await detectUserTierFromProfile(userId);
  }

  // ── 5. Enforce free-tier monthly scan limit ────────────────
  const supabase = createServiceClient();
  const scanCountThisMonth = await countScansThisMonth(supabase, userId);
  const scansRemaining = Math.max(
    0,
    FREE_TIER_MONTHLY_SCAN_LIMIT - scanCountThisMonth
  );

  if (tier === "free" && scanCountThisMonth >= FREE_TIER_MONTHLY_SCAN_LIMIT) {
    return NextResponse.json(
      {
        error: "Free-tier scan limit reached",
        detail: `You have used ${scanCountThisMonth} of ${FREE_TIER_MONTHLY_SCAN_LIMIT} free scans this month.`,
        data: {
          tier,
          scan_count_this_month: scanCountThisMonth,
          scans_remaining: 0,
        },
      } as V1ScanResponse,
      { status: 429 }
    );
  }

  // ── 6. Run analysis ─────────────────────────────────────────
  // Free tier: deterministic on-device mock (TFLite model later).
  // Pro/Pro+: GPT-4o Vision via cloudVision.ts (falls back to mock).
  const mockResult =
    tier === "free"
      ? buildMockOnDeviceResponse(4, resolvedScanType)
      : await analyzeImageWithVision(image ?? "", resolvedScanType, 4);

  const scanId = crypto.randomUUID();

  // ── 7. Build response payload ───────────────────────────────
  const responseData: V1ScanResponseData = {
    scan_id: scanId,
    tier,
    model: tier === "free" ? "on-device" : "gpt-4o",
    processing_time_ms: Math.round(performance.now() - startTime),
    timestamp: new Date().toISOString(),
    conditions: mockResult.conditions,
    skin_zones: mockResult.skinZones,
    overall_score: mockResult.overallScore,
    primary_concern: mockResult.primaryConcern,
    urgent_flag: mockResult.urgentFlag,
    fitzpatrick_type: mockResult.fitzpatrickType,
    recommendations: mockResult.recommendations,
    product_recommendations: mockResult.productRecommendations,
    scan_count_this_month: scanCountThisMonth + 1,
    scans_remaining:
      tier === "free" ? Math.max(0, scansRemaining - 1) : null as unknown as number,
    provider_referral_eligible: tier !== "free",
    nearby_providers: tier !== "free" ? [] : undefined,
    wellness_insights:
      tier !== "free"
        ? ["Your acne pattern suggests hormonal fluctuation. Consider tracking your cycle."]
        : undefined,
    scan_history_comparison: undefined,
    metadata: {
      capture_method: "unknown",
      skin_tone: 4,
      processed: true,
      model_version: tier === "free" ? "v1-ondevice-mock" : "v1-gpt4o-vision",
    },
  };

  // ── 8. Persist to Supabase ─────────────────────────────────
  const row = {
    id: scanId,
    user_id: userId,
    photo_id: null as string | null,
    capture_method: "gallery",
    skin_tone: 4,
    user_tier: tier,
    scan_type: resolvedScanType,
    quality_assessment: null,
    conditions: mockResult.conditions,
    skin_zones: mockResult.skinZones,
    overall_score: mockResult.overallScore,
    primary_concern: mockResult.primaryConcern,
    urgent_flag: mockResult.urgentFlag,
    fitzpatrick_type: mockResult.fitzpatrickType,
    recommendations: mockResult.recommendations,
    product_recommendations: mockResult.productRecommendations,
    metadata: responseData.metadata,
    created_at: responseData.timestamp,
  };

  const { error: insertError } = await supabase.from("scan_results").insert(row);

  if (insertError) {
    console.error("[scan] Supabase insert error:", insertError);
  }

  // ── 9. Return response ─────────────────────────────────────
  const finalResponse: V1ScanResponseData = {
    ...responseData,
    metadata: {
      ...responseData.metadata,
      storage_failed: insertError ? true : undefined,
      storage_error: insertError ? insertError.message : undefined,
    },
  };

  return NextResponse.json(
    { data: finalResponse } as V1ScanResponse,
    { status: 200 }
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: "/api/v1/scan",
    method: "POST",
    description: "Analyze a skin photo and return tier-aware results",
    request_body: {
      image: "base64-encoded image (required)",
      user_tier: "free | pro | pro_plus (optional)",
      scan_type: "skin_health | aesthetics | both (optional)",
      user_id: "uuid (optional, used when no auth cookie)",
    },
    tiers: {
      free: { scans_per_month: 4, model: "on-device" },
      pro: { scans_per_month: "unlimited", model: "gemini-1.5-pro" },
      pro_plus: { scans_per_month: "unlimited", model: "gemini-1.5-pro + aesthetics" },
    },
  });
}
