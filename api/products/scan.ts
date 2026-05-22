/**
 * POST /api/products/scan
 *
 * Scans a skincare product via the 4-tier pipeline:
 *   INCIDecoder → EWG Skin Deep → CosIng (EU) → Gemini/Ollama fallback
 *
 * Body: { barcode?, productName?, imageUrl?, imageBase64? }
 * Returns: { product, ingredients[], safetyScore, conditionFit[], dataSource, tierReached }
 */

import { runPipeline, enrichWithCosing, PipelineResult } from "../../lib/scanner/pipeline";
import { scoreIngredients, ScoreBreakdown } from "../../lib/scanner/ingredient-scorer";
import { ScannedIngredient } from "../../lib/scanner/pipeline";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface ScanRequest {
  barcode?: string;
  productName?: string;
  imageUrl?: string; // public URL to ingredient list image
  imageBase64?: string; // base64-encoded image (data URI optional)
}

export interface ConditionFit {
  conditionId: string;
  conditionName: string;
  fitScore: number; // 0-100
  reasoning: string;
}

export interface ScanResponse {
  product: {
    name: string;
    brand?: string;
    category?: string;
    barcode?: string;
    photoUrl?: string;
  };
  ingredients: ScannedIngredient[];
  safetyScore: number; // 0-100
  scoreBreakdown: ScoreBreakdown;
  conditionFit: ConditionFit[];
  dataSource: string;
  tierReached: number;
  confidence: "high" | "medium" | "low";
  url?: string;
  scannedAt: string;
}

// ------------------------------------------------------------------
// Handler (Next.js App Router or standalone Node)
// ------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ScanRequest = await request.json();

    // Validate input
    if (!body.barcode && !body.productName && !body.imageUrl && !body.imageBase64) {
      return jsonError("Provide barcode, productName, imageUrl, or imageBase64", 400);
    }

    // If imageUrl provided but no base64, fetch and convert (simplified — production would stream)
    let imageBase64 = body.imageBase64;
    if (body.imageUrl && !imageBase64) {
      try {
        const imgRes = await fetch(body.imageUrl, { signal: AbortSignal.timeout(5000) });
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          imageBase64 = Buffer.from(buffer).toString("base64");
        }
      } catch {
        /* ignore fetch failure, fallback to text-only pipeline */
      }
    }

    // --- Run pipeline ------------------------------------------------
    let result = await runPipeline({
      barcode: body.barcode,
      productName: body.productName,
      imageBase64,
    });

    // --- Enrich with CosIng (EU) ------------------------------------
    if (result.tierReached > 0) {
      result = await enrichWithCosing(result);
    }

    // --- Score ingredients --------------------------------------------
    const scoreBreakdown = scoreIngredients(result.ingredients);

    // --- Determine condition fit -------------------------------------
    const conditionFit = determineConditionFit(result.ingredients);

    // --- Build response -----------------------------------------------
    const response: ScanResponse = {
      product: {
        name: result.productName,
        brand: result.brand,
        category: result.category,
        barcode: result.barcode,
        photoUrl: body.imageUrl,
      },
      ingredients: result.ingredients,
      safetyScore: scoreBreakdown.overall,
      scoreBreakdown,
      conditionFit,
      dataSource: result.dataSource,
      tierReached: result.tierReached,
      confidence: result.confidence,
      url: result.url,
      scannedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[scan] error:", err);
    return jsonError("Internal server error", 500);
  }
}

// ------------------------------------------------------------------
// Condition Fit Logic
// ------------------------------------------------------------------

function determineConditionFit(ingredients: ScannedIngredient[]): ConditionFit[] {
  const fits: ConditionFit[] = [];
  const names = ingredients.map((i) => i.name.toLowerCase());

  // Helper to check if any ingredient matches a keyword
  const has = (keywords: string[]) =>
    keywords.some((k) => names.some((n) => n.includes(k)));

  // --- Acne ---
  const acneScore =
    (has(["salicylic acid", "benzoyl peroxide", "azelaic acid", "niacinamide", "retinol", "tea tree"]) ? 30 : 0) +
    (has(["zinc", "sulfur", "clindamycin"]) ? 20 : 0) +
    (!has(["coconut oil", "isopropyl palmitate", "isopropyl myristate"]) ? 20 : 0) +
    (!has(["fragrance", "essential oil", "coconut"]) ? 15 : 0) +
    (has(["hyaluronic acid", "ceramide", "niacinamide"]) ? 15 : 0);

  if (acneScore > 0) {
    fits.push({
      conditionId: "acne",
      conditionName: "Acne / Breakout-Prone",
      fitScore: Math.min(100, acneScore),
      reasoning: buildAcneReasoning(ingredients),
    });
  }

  // --- Aging ---
  const agingScore =
    (has(["retinol", "tretinoin", "peptide", "vitamin c", "ascorbic acid"]) ? 35 : 0) +
    (has(["niacinamide", "tocopherol", "ferulic acid", "green tea"]) ? 20 : 0) +
    (has(["hyaluronic acid", "ceramide", "squalane"]) ? 20 : 0) +
    (has(["sunscreen", "zinc oxide", "titanium dioxide"]) ? 15 : 0) +
    (!has(["fragrance", "alcohol denat"]) ? 10 : 0);

  if (agingScore > 0) {
    fits.push({
      conditionId: "aging",
      conditionName: "Aging / Anti-Aging",
      fitScore: Math.min(100, agingScore),
      reasoning: buildAgingReasoning(ingredients),
    });
  }

  // --- Sensitivity / Barrier ---
  const sensScore =
    (has(["ceramide", "niacinamide", "allantoin", "panthenol", "beta glucan", "centella"]) ? 35 : 0) +
    (has(["hyaluronic acid", "squalane", "glycerin", "aloe"]) ? 25 : 0) +
    (!has(["fragrance", "essential oil", "alcohol denat", "witch hazel"]) ? 25 : 0) +
    (!has(["aha", "bha", "retinol", "tretinoin"]) ? 15 : 0);

  if (sensScore > 0) {
    fits.push({
      conditionId: "sensitivity",
      conditionName: "Sensitivity / Barrier Repair",
      fitScore: Math.min(100, sensScore),
      reasoning: buildSensitivityReasoning(ingredients),
    });
  }

  // --- Hyperpigmentation ---
  const pigScore =
    (has(["vitamin c", "ascorbic acid", "tranexamic acid", "azelaic acid", "hydroquinone", "kojic acid", "alpha arbutin"]) ? 40 : 0) +
    (has(["niacinamide", "licorice", "glabridin"]) ? 25 : 0) +
    (has(["retinoid", "retinol", "tretinoin"]) ? 20 : 0) +
    (has(["sunscreen", "zinc oxide", "titanium dioxide"]) ? 15 : 0);

  if (pigScore > 0) {
    fits.push({
      conditionId: "hyperpigmentation",
      conditionName: "Hyperpigmentation / Melasma",
      fitScore: Math.min(100, pigScore),
      reasoning: buildPigmentationReasoning(ingredients),
    });
  }

  // --- Rosacea ---
  const rosaceaScore =
    (has(["azelaic acid", "niacinamide", "green tea", "centella"]) ? 35 : 0) +
    (!has(["fragrance", "alcohol denat", "witch hazel", "menthol", "eucalyptus"]) ? 30 : 0) +
    (!has(["aha", "bha", "retinol", "tretinoin"]) ? 20 : 0) +
    (has(["ceramide", "hyaluronic acid", "allantoin"]) ? 15 : 0);

  if (rosaceaScore > 0) {
    fits.push({
      conditionId: "rosacea",
      conditionName: "Rosacea / Redness",
      fitScore: Math.min(100, rosaceaScore),
      reasoning: buildRosaceaReasoning(ingredients),
    });
  }

  return fits;
}

/* ------------------------------------------------------------------ */
// Reasoning builders
/* ------------------------------------------------------------------ */

function buildAcneReasoning(ingredients: ScannedIngredient[]): string {
  const actives = ingredients
    .filter((i) =>
      ["salicylic acid", "benzoyl peroxide", "azelaic acid", "niacinamide", "retinol", "tea tree", "sulfur", "zinc"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);
  const comedogens = ingredients
    .filter((i) =>
      ["coconut oil", "isopropyl palmitate", "isopropyl myristate", "oleyl alcohol"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);

  let reason = "";
  if (actives.length > 0) {
    reason += `Contains acne-fighting actives: ${actives.join(", ")}. `;
  }
  if (comedogens.length > 0) {
    reason += `⚠️ Contains potentially comedogenic ingredients: ${comedogens.join(", ")}. `;
  }
  if (actives.length > 0 && comedogens.length === 0) {
    reason += "No major comedogenic ingredients detected.";
  }
  return reason.trim() || "No strong acne-specific actives or comedogens found.";
}

function buildAgingReasoning(ingredients: ScannedIngredient[]): string {
  const actives = ingredients
    .filter((i) =>
      ["retinol", "tretinoin", "peptide", "vitamin c", "ascorbic acid", "tocopherol", "ferulic acid", "green tea"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);
  return actives.length > 0
    ? `Contains anti-aging actives: ${actives.join(", ")}.`
    : "No strong anti-aging actives detected.";
}

function buildSensitivityReasoning(ingredients: ScannedIngredient[]): string {
  const soothers = ingredients
    .filter((i) =>
      ["ceramide", "allantoin", "panthenol", "centella", "beta glucan", "niacinamide"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);
  const irritants = ingredients
    .filter((i) =>
      ["fragrance", "essential oil", "alcohol denat", "witch hazel", "menthol"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);

  let reason = "";
  if (soothers.length > 0) {
    reason += `Contains barrier-supporting/soothing ingredients: ${soothers.join(", ")}. `;
  }
  if (irritants.length > 0) {
    reason += `⚠️ Contains potential irritants: ${irritants.join(", ")}. `;
  }
  return reason.trim() || "No strong sensitivity-specific profile detected.";
}

function buildPigmentationReasoning(ingredients: ScannedIngredient[]): string {
  const actives = ingredients
    .filter((i) =>
      ["vitamin c", "ascorbic acid", "tranexamic acid", "azelaic acid", "kojic acid", "alpha arbutin", "hydroquinone", "niacinamide", "licorice", "glabridin"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);
  return actives.length > 0
    ? `Contains brightening/depigmenting actives: ${actives.join(", ")}.`
    : "No strong pigmentation actives detected.";
}

function buildRosaceaReasoning(ingredients: ScannedIngredient[]): string {
  const good = ingredients
    .filter((i) =>
      ["azelaic acid", "niacinamide", "green tea", "centella", "allantoin", "ceramide"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);
  const bad = ingredients
    .filter((i) =>
      ["fragrance", "alcohol denat", "witch hazel", "menthol", "eucalyptus", "aha", "bha", "retinol", "tretinoin"].some((k) => i.name.toLowerCase().includes(k))
    )
    .map((i) => i.name);

  let reason = "";
  if (good.length > 0) {
    reason += `Rosacea-friendly ingredients: ${good.join(", ")}. `;
  }
  if (bad.length > 0) {
    reason += `⚠️ Contains potentially irritating ingredients for rosacea: ${bad.join(", ")}. `;
  }
  return reason.trim() || "No strong rosacea-specific profile detected.";
}

/* ------------------------------------------------------------------ */
// Utilities
/* ------------------------------------------------------------------ */

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
