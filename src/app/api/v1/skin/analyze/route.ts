// ───────────────────────────────────────────────────────────────
// POST /api/v1/skin/analyze
//
// Hybrid skin analysis endpoint:
//   • Free tier → Gemma 2B (text-based, local Ollama)
//   • Pro tier  → GPT-4o Vision (actual image analysis)
//
// Accepts: multipart/form-data with photo file
// Returns:   JSON with conditions, scores, recommendations
// ───────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  detectUserTier,
  validateImage,
  analyzeWithGemma,
  analyzeWithGPT4o,
  getRecommendedIngredients,
  getProductSuggestions,
  storeAnalysisResult,
} from "@/lib/skin-analysis";
import type {
  SkinAnalyzeResponse,
  SkinAnalysisResult,
} from "@/types/skin-analysis";

// =============================================================================
// Rate Limiting (in-memory, per IP)
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMITS = {
  free: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  pro: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100/hour
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string, tier: "free" | "pro"): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const limit = RATE_LIMITS[tier];
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetAt: now + limit.windowMs });
    return { allowed: true, remaining: limit.requests - 1, resetAt: now + limit.windowMs };
  }

  if (entry.count >= limit.requests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit.requests - entry.count, resetAt: entry.resetAt };
}

// =============================================================================
// Auth
// =============================================================================

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

// =============================================================================
// Helpers
// =============================================================================

function apiError(
  message: string,
  status: number = 400,
  detail?: string
): NextResponse {
  const body: SkinAnalyzeResponse = {
    success: false,
    error: message,
    ...(detail ? { detail } : {}),
  };
  return NextResponse.json(body, { status });
}

function apiSuccess(data: SkinAnalysisResult): NextResponse {
  const body: SkinAnalyzeResponse = { success: true, data };
  return NextResponse.json(body, { status: 200 });
}

// =============================================================================
// Main Handler
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // ── 1. Auth ──────────────────────────────────────────────
    const userId = tryGetUserId(req);

    // ── 2. Determine tier ────────────────────────────────────
    const tier = await detectUserTier(userId);

    // ── 3. Rate limiting ───────────────────────────────────
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, tier);

    if (!rateLimit.allowed) {
      const response = apiError("Rate limit exceeded. Try again later.", 429);
      response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS[tier].requests));
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));
      return response;
    }

    // ── 4. Parse multipart form ─────────────────────────────
    let imageBuffer: Buffer;
    let skinTone: number | undefined;

    try {
      const formData = await req.formData();
      const photo = formData.get("photo");

      if (!photo || !(photo instanceof File)) {
        return apiError("Missing required field: photo (must be a file)", 400);
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(photo.type)) {
        return apiError(
          `Invalid image format: ${photo.type}. Allowed: jpeg, jpg, png, webp`,
          400
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (photo.size > maxSize) {
        return apiError(
          `Image too large: ${(photo.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`,
          400
        );
      }

      const bytes = await photo.arrayBuffer();
      imageBuffer = Buffer.from(bytes);

      // Optional skin tone
      const toneParam = formData.get("skin_tone");
      if (toneParam) {
        const parsed = parseInt(String(toneParam), 10);
        if (parsed >= 1 && parsed <= 6) {
          skinTone = parsed;
        }
      }
    } catch {
      return apiError("Failed to parse form data. Ensure multipart/form-data encoding.", 400);
    }

    // ── 5. Validate image ──────────────────────────────────
    const validation = await validateImage(imageBuffer);
    if (!validation.valid) {
      return apiError(validation.error || "Invalid image", 400);
    }

    // ── 6. Run analysis based on tier ──────────────────────
    const metadata = {
      width: validation.width || 0,
      height: validation.height || 0,
      format: imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 ? "png" : "jpeg",
      skinTone,
    };

    let partialResult: Awaited<ReturnType<typeof analyzeWithGemma>>;

    if (tier === "pro") {
      partialResult = await analyzeWithGPT4o(imageBuffer, metadata);
    } else {
      partialResult = await analyzeWithGemma(imageBuffer, metadata);
    }

    // ── 7. Get recommendations ───────────────────────────────
    const [recommendedIngredients, productSuggestions] = await Promise.all([
      getRecommendedIngredients(partialResult.conditions),
      (async () => {
        const ingredientIds = await getRecommendedIngredients(partialResult.conditions);
        return getProductSuggestions(
          partialResult.conditions,
          ingredientIds.map((i) => i.ingredient_id)
        );
      })(),
    ]);

    // ── 8. Build final result ────────────────────────────────
    const analysisId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const result: SkinAnalysisResult = {
      analysis_id: analysisId,
      user_id: userId || undefined,
      timestamp,
      model: partialResult.model,
      tier,
      conditions: partialResult.conditions,
      zones: partialResult.zones,
      skin_score: partialResult.skin_score,
      recommended_ingredients: recommendedIngredients,
      product_suggestions: productSuggestions,
      urgent_flag: partialResult.urgent_flag,
      warnings: partialResult.warnings,
      metadata: {
        ...partialResult.metadata,
        processing_time_ms: Date.now() - startTime,
        photo_quality_score: calculatePhotoQualityScore(validation),
      },
    };

    // ── 9. Store in Supabase ─────────────────────────────────
    const storageResult = await storeAnalysisResult(result);
    if (!storageResult.success) {
      console.error("[skin/analyze] Storage failed:", storageResult.error);
      // Don't fail the request — return result anyway
      result.warnings.push("Analysis saved but storage failed. Results may not persist.");
    }

    // ── 10. Return response with rate limit headers ─────────
    const response = apiSuccess(result);
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS[tier].requests));
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));
    response.headers.set("X-Analysis-Model", partialResult.model);
    response.headers.set("X-Analysis-Tier", tier);

    return response;
  } catch (error) {
    console.error("[skin/analyze] Unhandled error:", error);
    return apiError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// =============================================================================
// GET — API Info
// =============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: "/api/v1/skin/analyze",
    method: "POST",
    description: "Analyze skin photo and return conditions + recommendations",
    content_type: "multipart/form-data",
    fields: {
      photo: "Required. Image file (jpeg, png, webp). Max 10MB.",
      skin_tone: "Optional. Fitzpatrick type 1-6.",
    },
    tiers: {
      free: { model: "Gemma 2B (text-based)", limit: "10/hour" },
      pro: { model: "GPT-4o Vision (image-based)", limit: "100/hour" },
    },
  });
}

// =============================================================================
// Helpers
// =============================================================================

function calculatePhotoQualityScore(
  validation: Awaited<ReturnType<typeof validateImage>>
): number {
  if (!validation.width || !validation.height) return 50;

  // Resolution score (optimal ~1024x1024)
  const resolution = validation.width * validation.height;
  const resolutionScore = Math.min(100, (resolution / (1024 * 1024)) * 100);

  // Aspect ratio score (prefer close to 1:1)
  const ratio = validation.width / validation.height;
  const ratioScore = ratio > 0.8 && ratio < 1.2 ? 100 : 70;

  return Math.round((resolutionScore * 0.6 + ratioScore * 0.4));
}
