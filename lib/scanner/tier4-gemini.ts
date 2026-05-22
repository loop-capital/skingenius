/**
 * Tier 4: Gemini / Ollama Fallback
 * OCR + AI analysis for ingredients not found in databases.
 * Uses Ollama (local/free) with Kimi K2.6 model for clinical ingredient analysis.
 */

export interface GeminiIngredientAnalysis {
  name: string;
  function?: string;
  safetyRating?: "safe" | "low_concern" | "moderate_concern" | "high_concern" | "avoid";
  comedogenicRating?: number; // 0-5
  irritationPotential?: "none" | "low" | "moderate" | "high";
  pregnancySafe?: boolean;
  notes?: string;
}

export interface GeminiAnalysisResult {
  ingredients: GeminiIngredientAnalysis[];
  overallSafetyScore?: number; // 0-100
  dataSource: "gemini" | "ollama";
  confidence: "high" | "medium" | "low";
  matched: boolean;
}

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "kimi-k2.6";

/**
 * Analyze an ingredient list image (or raw text) using Ollama/Kimi.
 * This is the free fallback when no database match is found.
 */
export async function analyzeWithOllama(
  input: { imageBase64?: string; rawText?: string }
): Promise<GeminiAnalysisResult | null> {
  const hasImage = !!input.imageBase64;
  const hasText = !!input.rawText;

  if (!hasImage && !hasText) {
    console.error("[tier4-gemini] No input provided (image or text required)");
    return null;
  }

  const systemPrompt = `You are a clinical cosmetic chemist assistant for SKINgenius, a medical-grade skincare AI.
Your job is to analyze skincare ingredient lists and return structured safety data.

Rules:
- NEVER make up ingredients. If uncertain, mark confidence as "low".
- Rate comedogenicity 0-5 based on standard classifications (0 = non-comedogenic, 5 = highly comedogenic).
- Rate irritation potential: none / low / moderate / high.
- Flag pregnancy safety: safe (true) or avoid (false) with known data. If unknown, say "unknown".
- Return ONLY valid JSON. No markdown, no explanation outside JSON.

Output JSON format:
{
  "ingredients": [
    {
      "name": "Water",
      "function": "solvent",
      "safetyRating": "safe",
      "comedogenicRating": 0,
      "irritationPotential": "none",
      "pregnancySafe": true,
      "notes": ""
    }
  ],
  "overallSafetyScore": 85,
  "confidence": "high"
}`;

  let userPrompt: string;
  if (hasText) {
    userPrompt = `Analyze this skincare ingredient list and return structured JSON:\n\n${input.rawText}`;
  } else {
    userPrompt = `Analyze the skincare ingredient list in this image and return structured JSON.`;
  }

  try {
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // If image is provided, encode it in the prompt for vision-capable models.
    // Kimi K2.6 supports image input via Ollama's /api/generate or /api/chat.
    const body: any = {
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.2, num_predict: 2048 },
    };

    if (hasImage && input.imageBase64) {
      // Ollama chat API with images: use the images array on the user message
      body.messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userPrompt,
          images: [input.imageBase64],
        },
      ];
    }

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("[tier4-gemini] Ollama API error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const rawContent = json.message?.content || json.response || "";

    // Extract JSON from the response (handle markdown fences)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawContent);

    const ingredients: GeminiIngredientAnalysis[] = (parsed.ingredients || []).map(
      (ing: any) => ({
        name: ing.name || "Unknown",
        function: ing.function,
        safetyRating: normalizeSafety(ing.safetyRating),
        comedogenicRating: clamp(ing.comedogenicRating, 0, 5),
        irritationPotential: normalizeIrritation(ing.irritationPotential),
        pregnancySafe:
          ing.pregnancySafe === true
            ? true
            : ing.pregnancySafe === false
            ? false
            : undefined,
        notes: ing.notes,
      })
    );

    return {
      ingredients,
      overallSafetyScore: clamp(parsed.overallSafetyScore, 0, 100),
      dataSource: "ollama",
      confidence: parsed.confidence || "medium",
      matched: ingredients.length > 0,
    };
  } catch (err) {
    console.error("[tier4-gemini] analysis error:", err);
    return null;
  }
}

/**
 * Analyze a raw ingredient list text (no image).
 */
export async function analyzeIngredientText(
  rawText: string
): Promise<GeminiAnalysisResult | null> {
  return analyzeWithOllama({ rawText });
}

/**
 * Analyze an ingredient list from a base64-encoded image.
 */
export async function analyzeIngredientImage(
  imageBase64: string
): Promise<GeminiAnalysisResult | null> {
  return analyzeWithOllama({ imageBase64 });
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function normalizeSafety(raw: unknown): GeminiIngredientAnalysis["safetyRating"] {
  if (typeof raw !== "string") return undefined;
  const map: Record<string, GeminiIngredientAnalysis["safetyRating"]> = {
    safe: "safe",
    low_concern: "low_concern",
    moderate_concern: "moderate_concern",
    high_concern: "high_concern",
    avoid: "avoid",
  };
  return map[raw.toLowerCase().replace(/\s+/g, "_")] || undefined;
}

function normalizeIrritation(raw: unknown): GeminiIngredientAnalysis["irritationPotential"] {
  if (typeof raw !== "string") return undefined;
  const map: Record<string, GeminiIngredientAnalysis["irritationPotential"]> = {
    none: "none",
    low: "low",
    moderate: "moderate",
    high: "high",
  };
  return map[raw.toLowerCase()] || undefined;
}

function clamp(n: unknown, min: number, max: number): number | undefined {
  if (typeof n !== "number" || isNaN(n)) return undefined;
  return Math.max(min, Math.min(max, n));
}
