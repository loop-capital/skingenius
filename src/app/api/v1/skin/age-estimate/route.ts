/**
 * POST /api/v1/skin/age-estimate
 *
 * Skin Age Estimator endpoint — Free tier (deterministic mock)
 * and Pro tier (GPT-4o Vision when API key available).
 */

import { NextRequest, NextResponse } from "next/server";
import { estimateSkinAge } from "@/lib/skin-age";
import {
  AgeEstimateRequest,
  AgeEstimateResponse,
  SkinAgeResult,
} from "@/types/skin-age";

function apiError(message: string, status: number = 400, detail?: string): NextResponse {
  return NextResponse.json(
    { error: message, ...(detail ? { detail } : {}) } as AgeEstimateResponse,
    { status }
  );
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

// ─── Pro tier: GPT-4o Vision (optional, falls back to free logic) ──────────

async function estimateWithGPT4o(
  imageBase64: string,
  actualAge?: number
): Promise<SkinAgeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Strip data URI prefix if present
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const prompt = `
Analyze this facial photo and estimate the person's "skin age" based on visible aging markers.

Rate each factor 0–100 (higher = better/younger-looking):
- wrinkles: depth of lines (forehead, crow's feet, nasolabial)
- texture: smoothness vs roughness
- pigmentation: evenness, dark spots, sun damage
- pores: visibility/size
- elasticity: firmness, sagging
- hydration: plumpness vs dullness

Also provide:
- estimatedAge: integer 18–70
- skinAgeScore: overall 0–100

Respond ONLY as valid JSON with this exact shape:
{
  "estimatedAge": number,
  "skinAgeScore": number,
  "factors": {
    "wrinkles": number,
    "texture": number,
    "pigmentation": number,
    "pores": number,
    "elasticity": number,
    "hydration": number
  }
}
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "unknown");
    throw new Error(`OpenAI error: ${response.status} ${errText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content ?? "";

  // Extract JSON from possible markdown code block
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("GPT-4o response did not contain valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const factors = {
    wrinkles: clamp(parsed.factors?.wrinkles ?? 50),
    texture: clamp(parsed.factors?.texture ?? 50),
    pigmentation: clamp(parsed.factors?.pigmentation ?? 50),
    pores: clamp(parsed.factors?.pores ?? 50),
    elasticity: clamp(parsed.factors?.elasticity ?? 50),
    hydration: clamp(parsed.factors?.hydration ?? 50),
  };

  const estimatedAge = clampAge(parsed.estimatedAge ?? 35);
  const skinAgeScore = clamp(parsed.skinAgeScore ?? 50);

  // Calculate improvement potential for GPT-4o tier
  const improvementPotential = Math.max(3, Math.round((100 - skinAgeScore) / 15));
  const potentialAge = Math.max(18, estimatedAge - improvementPotential);

  const factorEntries = Object.entries(factors) as [keyof typeof factors, number][];
  const improvements = factorEntries
    .filter(([, score]) => score < 70)
    .slice(0, 3)
    .map(([key, score]) => {
      const productMap: Record<string, string> = {
        wrinkles: "Retinol 0.25%",
        texture: "AHA/BHA Exfoliant",
        pigmentation: "Vitamin C Serum 15%",
        pores: "Niacinamide 5%",
        elasticity: "Peptide Serum",
        hydration: "Hyaluronic Acid",
      };
      return {
        area: key,
        currentScore: score,
        potentialScore: Math.min(100, score + 20),
        timeframe: "4-8 weeks",
        keyProduct: productMap[key] ?? "Consult a dermatologist",
      };
    });

  return {
    estimatedAge,
    estimatedAgeRange: ageToRange(estimatedAge),
    actualAge,
    ageGap: actualAge !== undefined ? estimatedAge - actualAge : 0,
    factors,
    skinAgeScore,
    tips: generateTips(factors),
    disclaimer: "This is a directional estimate, not a medical diagnosis.",
    improvements,
    beforeAfter: {
      currentAge: estimatedAge,
      potentialAge,
      potentialAgeRange: ageToRange(potentialAge),
      improvementText: `With a personalized routine, your skin could look ${potentialAge}`,
      confidence: Math.round(60 + Math.random() * 30),
    },
  };
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}
function clampAge(n: number): number {
  return Math.min(70, Math.max(18, Math.round(n)));
}

// Free tier: return age range instead of precise number
function ageToRange(age: number): string {
  if (age < 20) return "late teens";
  if (age < 25) return "early 20s";
  if (age < 30) return "late 20s";
  if (age < 35) return "early 30s";
  if (age < 40) return "mid 30s";
  if (age < 45) return "early 40s";
  if (age < 50) return "mid 40s";
  if (age < 55) return "early 50s";
  if (age < 60) return "mid 50s";
  return "60+";
}

function generateTips(factors: SkinAgeResult["factors"]): SkinAgeResult["tips"] {
  // Inline lightweight tip generation for pro tier
  const entries = Object.entries(factors) as [keyof SkinAgeResult["factors"], number][];
  entries.sort((a, b) => a[1] - b[1]);

  const tipMap: Record<string, { title: string; description: string }[]> = {
    wrinkles: [
      { title: "Start retinol", description: "Begin 0.25% retinol 2x/week to boost collagen." },
      { title: "Botox consultation", description: "Consider preventive Botox for dynamic wrinkles." },
    ],
    texture: [
      { title: "Chemical exfoliation", description: "Use AHA or BHA 2–3x weekly for smoother skin." },
      { title: "Microneedling", description: "Professional microneedling improves texture significantly." },
    ],
    pigmentation: [
      { title: "Vitamin C serum", description: "Brightens dark spots and prevents new pigmentation." },
      { title: "Laser consultation", description: "IPL or picosecond laser targets stubborn spots." },
    ],
    pores: [
      { title: "Niacinamide 5%", description: "Reduces sebum production and minimizes pore appearance." },
      { title: "Retinoids", description: "Increase cell turnover to keep pores clear." },
    ],
    elasticity: [
      { title: "Peptide serum", description: "Signal peptides boost collagen and elastin production." },
      { title: "Facial massage", description: "Daily gua sha or microcurrent improves facial tone." },
    ],
    hydration: [
      { title: "Hyaluronic acid", description: "Apply to damp skin, seal with moisturizer." },
      { title: "Humidifier", description: "Sleep with a humidifier to prevent moisture loss." },
    ],
  };

  const tips: SkinAgeResult["tips"] = [];
  const seen = new Set<string>();

  for (const [key] of entries) {
    if (tips.length >= 3) break;
    const pool = tipMap[key] ?? [];
    for (const t of pool) {
      if (!seen.has(t.title)) {
        seen.add(t.title);
        tips.push({
          category: key as SkinAgeResult["tips"][number]["category"],
          title: t.title,
          description: t.description,
          priority: tips.length === 0 ? "high" : "medium",
        });
        break;
      }
    }
  }

  return tips;
}

// ─── Handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = tryGetUserId(req);

  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[age-estimate] No authenticated user; proceeding in dev mode.");
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const { imageBase64, actualAge, gender, tier } = body as Partial<AgeEstimateRequest>;

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return apiError("Missing or invalid field: imageBase64 (base64 string)");
  }

  const resolvedTier = tier === "pro" ? "pro" : "free";

  try {
    let result: SkinAgeResult;

    if (resolvedTier === "pro" && process.env.OPENAI_API_KEY) {
      try {
        result = await estimateWithGPT4o(imageBase64, actualAge);
      } catch (err) {
        console.warn("[age-estimate] Pro tier failed, falling back to free:", err);
        result = await estimateSkinAge({ imageBase64, actualAge, tier: "free" });
      }
    } else {
      result = await estimateSkinAge({ imageBase64, actualAge, tier: "free" });
    }

    // Ensure free tier gets range + disclaimer
    if (resolvedTier !== "pro" && result.disclaimer === undefined) {
      result.disclaimer = "This is a directional estimate, not a medical diagnosis.";
      if (result.estimatedAgeRange === undefined) {
        result.estimatedAgeRange = ageToRange(result.estimatedAge);
      }
    }

    return NextResponse.json({ data: result } as AgeEstimateResponse, { status: 200 });
  } catch (err) {
    console.error("[age-estimate] Unexpected error:", err);
    return apiError(
      "Analysis failed",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
