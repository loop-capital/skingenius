/**
 * Pipeline Orchestrator
 * Runs the 4-tier product scanner pipeline in order.
 * Stops when a match is found, returning enriched ingredient data.
 */

import {
  searchIncidecoder,
  IncidecoderProduct,
} from "./tier1-incidecoder";
import { searchEwg, EwgProductResult } from "./tier2-ewg";
import { searchCosing, CosingResult } from "./tier3-cosing";
import { analyzeWithOllama, GeminiAnalysisResult } from "./tier4-gemini";

export interface ScannedIngredient {
  name: string;
  inciName?: string;
  function?: string;
  safetyRating?: "safe" | "low_concern" | "moderate_concern" | "high_concern" | "avoid";
  hazardScore?: number; // EWG 1-10
  comedogenicRating?: number; // 0-5
  irritationPotential?: "none" | "low" | "moderate" | "high";
  pregnancySafe?: boolean;
  evidenceLevel?: "strong" | "moderate" | "limited" | "insufficient";
  euStatus?: {
    bannedInEu?: boolean;
    restrictedInEu?: boolean;
    preservative?: boolean;
    uvFilter?: boolean;
    colorant?: boolean;
  };
  notes?: string;
  dataSource: string;
}

export interface PipelineResult {
  productName: string;
  brand?: string;
  category?: string;
  barcode?: string;
  ingredients: ScannedIngredient[];
  safetyScore: number; // 0-100
  conditionFit?: Array<{ conditionId: string; fitScore: number; reasoning: string }>;
  dataSource: string;
  tierReached: number;
  url?: string;
  confidence: "high" | "medium" | "low";
}

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Run the full 4-tier pipeline for a product.
 *
 * @param input — barcode, productName, or imageBase64
 * @returns PipelineResult with the best available data
 */
export async function runPipeline(input: {
  barcode?: string;
  productName?: string;
  imageBase64?: string;
  rawText?: string;
}): Promise<PipelineResult> {
  const productName = input.productName || input.barcode || "Unknown Product";
  let tierReached = 0;
  let dataSource = "none";
  let confidence: PipelineResult["confidence"] = "low";

  // -- Tier 1: INCIDecoder -------------------------------------------------
  if (input.productName) {
    const t1 = await withTimeout(searchIncidecoder(input.productName), DEFAULT_TIMEOUT_MS);
    if (t1 && t1.matched) {
      tierReached = 1;
      dataSource = "incidecoder";
      confidence = "high";
      const ingredients = t1.ingredients.map((ing) => ({
        name: ing.name,
        inciName: ing.inciName,
        function: ing.function,
        safetyRating: ing.safetyRating,
        dataSource: "incidecoder",
      }));
      const safetyScore = computeSafetyScore(ingredients);
      return {
        productName: t1.productName,
        brand: t1.brand,
        category: t1.category,
        barcode: input.barcode,
        ingredients,
        safetyScore,
        dataSource,
        tierReached,
        url: t1.url,
        confidence,
      };
    }
  }

  // -- Tier 2: EWG Skin Deep -----------------------------------------------
  if (input.productName) {
    const t2 = await withTimeout(searchEwg(input.productName), DEFAULT_TIMEOUT_MS);
    if (t2 && t2.matched) {
      tierReached = 2;
      dataSource = "ewg";
      confidence = "high";
      const ingredients = t2.ingredients.map((ing) => ({
        name: ing.name,
        hazardScore: ing.hazardScore,
        dataSource: "ewg",
      }));
      const safetyScore = computeSafetyScore(ingredients);
      return {
        productName,
        barcode: input.barcode,
        ingredients,
        safetyScore,
        dataSource,
        tierReached,
        url: t2.url,
        confidence,
      };
    }
  }

  // -- Tier 3: CosIng (EU) — supplemental, not standalone product match ---
  // CosIng is ingredient-level; we skip standalone product match but enrich later

  // -- Tier 4: Gemini / Ollama fallback -------------------------------------
  if (input.imageBase64 || input.rawText) {
    const t4 = await withTimeout(
      analyzeWithOllama({ imageBase64: input.imageBase64, rawText: input.rawText }),
      15000 // longer timeout for AI
    );
    if (t4 && t4.matched) {
      tierReached = 4;
      dataSource = t4.dataSource;
      confidence = t4.confidence;
      const ingredients = t4.ingredients.map((ing) => ({
        name: ing.name,
        function: ing.function,
        safetyRating: ing.safetyRating,
        comedogenicRating: ing.comedogenicRating,
        irritationPotential: ing.irritationPotential,
        pregnancySafe: ing.pregnancySafe,
        dataSource: t4.dataSource,
      }));
      const safetyScore =
        t4.overallSafetyScore !== undefined
          ? t4.overallSafetyScore
          : computeSafetyScore(ingredients);
      return {
        productName,
        barcode: input.barcode,
        ingredients,
        safetyScore,
        dataSource,
        tierReached,
        confidence,
      };
    }
  }

  // -- Nothing found --------------------------------------------------------
  return {
    productName,
    barcode: input.barcode,
    ingredients: [],
    safetyScore: 0,
    dataSource: "none",
    tierReached: 0,
    confidence: "low",
  };
}

/**
 * Enrich a pipeline result with CosIng (EU) data for each ingredient.
 */
export async function enrichWithCosing(
  result: PipelineResult
): Promise<PipelineResult> {
  if (result.ingredients.length === 0) return result;

  const names = result.ingredients.map((i) => i.inciName || i.name).filter(Boolean);
  const cosingMap = new Map<string, import("./tier3-cosing").CosingIngredient>();

  // Sequential CosIng lookups to be polite to their server
  for (const name of names) {
    const cosing = await searchCosing(name);
    if (cosing && cosing.ingredients.length > 0) {
      cosingMap.set(name.toLowerCase(), cosing.ingredients[0]);
    }
  }

  result.ingredients = result.ingredients.map((ing) => {
    const key = (ing.inciName || ing.name).toLowerCase();
    const eu = cosingMap.get(key);
    if (!eu) return ing;

    return {
      ...ing,
      euStatus: {
        bannedInEu: eu.bannedInEu,
        restrictedInEu: eu.restrictedInEu,
        preservative: eu.preservative,
        uvFilter: eu.uvFilter,
        colorant: eu.colorant,
      },
      function: ing.function || (eu.cosmeticFunctions || [])[0],
    };
  });

  return result;
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function withTimeout<T>(promise: Promise<T | null>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<T | null>((_resolve, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ).catch(() => null),
  ]);
}

/**
 * Compute a 0-100 safety score from ingredient data.
 * Higher = safer.
 */
function computeSafetyScore(ingredients: Partial<ScannedIngredient>[]): number {
  if (ingredients.length === 0) return 0;

  let total = 0;
  for (const ing of ingredients) {
    let score = 50; // default neutral

    if (ing.safetyRating) {
      const map: Record<string, number> = {
        safe: 100,
        low_concern: 80,
        moderate_concern: 50,
        high_concern: 20,
        avoid: 0,
      };
      score = map[ing.safetyRating] ?? score;
    }

    if (ing.hazardScore !== undefined) {
      // EWG 1-10 inverted
      score = Math.min(score, (10 - ing.hazardScore) * 10);
    }

    if (ing.comedogenicRating !== undefined) {
      // 0-5 inverted
      score = Math.min(score, (5 - ing.comedogenicRating) * 20);
    }

    if (ing.irritationPotential) {
      const map: Record<string, number> = {
        none: 100,
        low: 80,
        moderate: 50,
        high: 20,
      };
      score = Math.min(score, map[ing.irritationPotential] ?? score);
    }

    if (ing.pregnancySafe === false) {
      score = Math.min(score, 10);
    }

    total += score;
  }

  return Math.round(total / ingredients.length);
}
