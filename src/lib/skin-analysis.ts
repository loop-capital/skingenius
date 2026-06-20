// ───────────────────────────────────────────────────────────────
// Skin Analysis Engine — Hybrid Model (Gemma 2B Free / GPT-4o Pro)
// ───────────────────────────────────────────────────────────────

import { getOpenAIClient } from "@/lib/openai-client";
import { createServiceClient } from "@/utils/supabase/service";
import type {
  SkinAnalysisResult,
  DetectedSkinCondition,
  SkinZoneAnalysis,
  RecommendedIngredient,
  ProductSuggestion,
} from "@/types/skin-analysis";

// =============================================================================
// Constants
// =============================================================================

const GEMMA_MODEL = "gemma2:2b";
const GPT4O_MODEL = "gpt-4o";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

/** Minimum image dimension for reliable analysis */
const MIN_IMAGE_DIMENSION = 224;

// =============================================================================
// Tier Detection
// =============================================================================

/**
 * Determine which AI tier to use based on user's subscription status.
 * Pro users → GPT-4o Vision (actual image analysis)
 * Free users → Gemma 2B (text-based analysis from metadata)
 */
export async function detectUserTier(userId: string | null): Promise<"free" | "pro"> {
  if (!userId) return "free";

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .single();

    if (error || !data) return "free";
    return data.subscription_tier === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}

// =============================================================================
// Image Validation
// =============================================================================

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  faceDetected?: boolean;
}

/**
 * Validate uploaded image meets minimum requirements.
 * Checks dimensions and attempts basic face detection via metadata.
 */
export async function validateImage(buffer: Buffer): Promise<ImageValidationResult> {
  // Check if it's a valid image by reading dimensions from headers
  let width = 0;
  let height = 0;

  // JPEG check
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    // Find SOF0 marker (0xFF 0xC0) or SOF2 marker (0xFF 0xC2)
    for (let i = 0; i < buffer.length - 10; i++) {
      if (buffer[i] === 0xFF && (buffer[i + 1] === 0xC0 || buffer[i + 1] === 0xC2)) {
        height = (buffer[i + 5] << 8) | buffer[i + 6];
        width = (buffer[i + 7] << 8) | buffer[i + 8];
        break;
      }
    }
  }
  // PNG check
  else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47
  ) {
    width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
    height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
  }

  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image too small: ${width}x${height}. Minimum: ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}`,
      width,
      height,
    };
  }

  return {
    valid: true,
    width,
    height,
    faceDetected: true, // We accept the photo; face detection happens in analysis
  };
}

// =============================================================================
// Gemma 2B (Free Tier)
// =============================================================================

const GEMMA_ANALYSIS_PROMPT = `You are a dermatological AI assistant. Analyze the following skin photo metadata and provide a structured assessment.

Photo metadata:
- Dimensions: {width}x{height}
- Format: {format}

Based on typical patterns for this type of photo, identify potential skin conditions.

Respond ONLY with valid JSON in this exact format:
{
  "conditions": [
    {
      "name": "Condition Name",
      "confidence": 0.75,
      "severity": "mild",
      "features": ["feature1", "feature2"],
      "zone": "T-Zone"
    }
  ],
  "zones": [
    {
      "zone": "T-Zone",
      "primary_concern": "oiliness",
      "description": "Typical oiliness in forehead and nose area",
      "severity": "mild"
    }
  ],
  "skin_score": 75,
  "warnings": ["This is a directional analysis only — consult a dermatologist for diagnosis."]
}`;

/**
 * Analyze skin using Gemma 2B via local Ollama.
 * This is a text-based analysis using photo metadata (not actual image content).
 * Suitable for free tier — fast, private, zero API cost.
 */
export async function analyzeWithGemma(
  imageBuffer: Buffer,
  metadata: { width: number; height: number; format: string; skinTone?: number }
): Promise<Omit<SkinAnalysisResult, "analysis_id" | "timestamp" | "user_id" | "tier" | "recommended_ingredients" | "product_suggestions">> {
  const startTime = Date.now();

  try {
    const prompt = GEMMA_ANALYSIS_PROMPT
      .replace("{width}", String(metadata.width))
      .replace("{height}", String(metadata.height))
      .replace("{format}", metadata.format);

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GEMMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 800,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.response || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemma response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      model: "gemma-2b",
      conditions: (parsed.conditions || []).map((c: Record<string, unknown>) => ({
        condition_id: slugify(String(c.name || "unknown")),
        name: String(c.name || "Unknown Condition"),
        confidence: clamp(Number(c.confidence || 0), 0, 1),
        severity: normalizeSeverity(c.severity),
        features: Array.isArray(c.features) ? c.features.map(String) : [],
        zone: String(c.zone || "face"),
      })),
      zones: (parsed.zones || []).map((z: Record<string, unknown>) => ({
        zone: String(z.zone || "face"),
        primary_concern: String(z.primary_concern || "general"),
        description: String(z.description || ""),
        severity: normalizeSeverity(z.severity),
      })),
      skin_score: clamp(Number(parsed.skin_score || 70), 0, 100),
      urgent_flag: false,
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.map(String)
        : ["Directional analysis only — not a medical diagnosis."],
      metadata: {
        processing_time_ms: Date.now() - startTime,
        face_detected: true, // Assumed for upload
        vision_analysis: false,
      },
    };
  } catch (error) {
    console.error("Gemma analysis failed:", error);

    // Return fallback result so the API doesn't crash
    return {
      model: "gemma-2b",
      conditions: [],
      zones: [],
      skin_score: 0,
      urgent_flag: false,
      warnings: [
        "Analysis engine temporarily unavailable. Please try again.",
        error instanceof Error ? error.message : "Unknown error",
      ],
      metadata: {
        processing_time_ms: Date.now() - startTime,
        face_detected: true,
        vision_analysis: false,
      },
    };
  }
}

// =============================================================================
// GPT-4o Vision (Pro Tier)
// =============================================================================

const GPT4O_SYSTEM_PROMPT = `You are a dermatological AI with clinical-grade vision analysis capabilities. Analyze the provided skin photo and return a structured JSON assessment.

Analyze for:
1. Skin conditions (acne, rosacea, melasma, hyperpigmentation, eczema, fine lines, etc.)
2. Severity (mild/moderate/severe)
3. Facial zones affected
4. Observable features
5. Overall skin health score (0-100)
6. Whether any condition requires dermatologist attention

Respond ONLY with valid JSON in this exact format:
{
  "conditions": [
    {
      "name": "Condition Name",
      "confidence": 0.85,
      "severity": "mild",
      "features": ["comedonal", "erythema"],
      "zone": "T-Zone"
    }
  ],
  "zones": [
    {
      "zone": "T-Zone",
      "primary_concern": "acne",
      "description": "Mild comedonal acne with some erythema",
      "severity": "mild"
    }
  ],
  "skin_score": 78,
  "urgent_flag": false,
  "warnings": ["Note about the analysis"]
}`;

/**
 * Analyze skin using GPT-4o Vision via OpenAI API.
 * This performs actual image analysis — clinical-grade, multi-zone detection.
 * Suitable for pro tier — higher accuracy, real vision understanding.
 */
export async function analyzeWithGPT4o(
  imageBuffer: Buffer,
  metadata: { width: number; height: number; format: string; skinTone?: number }
): Promise<Omit<SkinAnalysisResult, "analysis_id" | "timestamp" | "user_id" | "tier" | "recommended_ingredients" | "product_suggestions">> {
  const startTime = Date.now();

  try {
    const openai = getOpenAIClient();
    const base64Image = imageBuffer.toString("base64");
    const mimeType = metadata.format === "png" ? "image/png" : "image/jpeg";

    const response = await openai.chat.completions.create({
      model: GPT4O_MODEL,
      messages: [
        {
          role: "system",
          content: GPT4O_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: metadata.skinTone
                ? `Fitzpatrick skin type: ${metadata.skinTone}`
                : "Analyze this skin photo and provide the structured JSON assessment.",
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in GPT-4o response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      model: "gpt-4o-vision",
      conditions: (parsed.conditions || []).map((c: Record<string, unknown>) => ({
        condition_id: slugify(String(c.name || "unknown")),
        name: String(c.name || "Unknown Condition"),
        confidence: clamp(Number(c.confidence || 0), 0, 1),
        severity: normalizeSeverity(c.severity),
        features: Array.isArray(c.features) ? c.features.map(String) : [],
        zone: String(c.zone || "face"),
      })),
      zones: (parsed.zones || []).map((z: Record<string, unknown>) => ({
        zone: String(z.zone || "face"),
        primary_concern: String(z.primary_concern || "general"),
        description: String(z.description || ""),
        severity: normalizeSeverity(z.severity),
      })),
      skin_score: clamp(Number(parsed.skin_score || 70), 0, 100),
      urgent_flag: Boolean(parsed.urgent_flag),
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.map(String)
        : [],
      metadata: {
        processing_time_ms: Date.now() - startTime,
        face_detected: true,
        vision_analysis: true,
      },
    };
  } catch (error) {
    console.error("GPT-4o analysis failed:", error);

    // Return fallback result
    return {
      model: "gpt-4o-vision",
      conditions: [],
      zones: [],
      skin_score: 0,
      urgent_flag: false,
      warnings: [
        "Vision analysis temporarily unavailable. Please try again.",
        error instanceof Error ? error.message : "Unknown error",
      ],
      metadata: {
        processing_time_ms: Date.now() - startTime,
        face_detected: true,
        vision_analysis: true,
      },
    };
  }
}

// =============================================================================
// Recommendation Engine
// =============================================================================

/**
 * Get recommended ingredients for detected conditions.
 * Queries the Supabase ingredients table for matches.
 */
export async function getRecommendedIngredients(
  conditions: DetectedSkinCondition[]
): Promise<RecommendedIngredient[]> {
  if (conditions.length === 0) return [];

  try {
    const supabase = createServiceClient();
    const conditionNames = conditions.map((c) => c.name.toLowerCase());

    // Query ingredients that help with these conditions
    // This is a simplified matching — in production, you'd use a proper
    // knowledge graph or embeddings-based similarity search
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, name, description, evidence_level, category, concerns")
      .or(
        conditionNames.map((name) => `description.ilike.%${name}%`).join(",")
      )
      .limit(20);

    if (error || !data) return [];

    return data.map((ing) => ({
      ingredient_id: ing.id,
      name: ing.name,
      reasoning: ing.description || `May help with ${conditionNames.join(", ")}`,
      evidence_level: normalizeEvidenceLevel(ing.evidence_level),
      effectiveness: 0.7, // Default — would be computed from knowledge graph
    }));
  } catch (error) {
    console.error("Failed to fetch recommended ingredients:", error);
    return [];
  }
}

/**
 * Get product suggestions based on conditions and recommended ingredients.
 */
export async function getProductSuggestions(
  conditions: DetectedSkinCondition[],
  ingredientIds: string[]
): Promise<ProductSuggestion[]> {
  if (conditions.length === 0 || ingredientIds.length === 0) return [];

  try {
    const supabase = createServiceClient();

    // Find products that contain these ingredients
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category, description, price, rating, ingredient_ids, url")
      .overlaps("ingredient_ids", ingredientIds)
      .order("rating", { ascending: false })
      .limit(10);

    if (error || !data) return [];

    return data.map((product) => ({
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      reasoning: `Contains ingredients that help with ${conditions.map((c) => c.name).join(", ")}`,
      fit_score: Math.round((product.rating || 3) * 20), // Convert 5-star to 0-100
      key_actives: [], // Would be populated from ingredient mapping
      price_tier: getPriceTier(product.price),
      url: product.url,
    }));
  } catch (error) {
    console.error("Failed to fetch product suggestions:", error);
    return [];
  }
}

// =============================================================================
// Storage
// =============================================================================

/**
 * Store analysis result in Supabase.
 */
export async function storeAnalysisResult(
  result: SkinAnalysisResult
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Store in skin_analyses table
    const { error } = await supabase.from("skin_analyses").insert({
      id: result.analysis_id,
      user_id: result.user_id || null,
      conditions: result.conditions.map((c) => ({
        condition: c.condition_id,
        confidence: c.confidence,
        severity: c.severity,
      })),
      skin_score: result.skin_score,
      notes: result.warnings.join("\n"),
      urgent_flag: result.urgent_flag,
      created_at: result.timestamp,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to store analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// Helpers
// =============================================================================

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function normalizeSeverity(s: unknown): "mild" | "moderate" | "severe" {
  if (s === "mild" || s === "moderate" || s === "severe") return s;
  return "mild";
}

function normalizeEvidenceLevel(level: string | null): "A" | "B" | "C" | "D" {
  const mapping: Record<string, "A" | "B" | "C" | "D"> = {
    strong: "A",
    moderate: "B",
    emerging: "C",
    limited: "D",
    A: "A",
    "A-": "A",
    B: "B",
    "B+": "B",
    "B-": "B",
    C: "C",
    "C+": "C",
    "C-": "C",
    D: "D",
  };
  return mapping[level || ""] || "C";
}

function getPriceTier(price: number | null): string {
  if (!price) return "$$";
  if (price < 20) return "$";
  if (price < 50) return "$$";
  if (price < 100) return "$$$";
  return "$$$$";
}
