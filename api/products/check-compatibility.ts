/**
 * POST /api/products/check-compatibility
 *
 * Checks a scanned product against a user's existing routine for:
 *   - Ingredient interactions (retinol+AHA, BPO+tretinoin, etc.)
 *   - pH conflicts (vitamin C + niacinamide timing)
 *   - Pregnancy / breastfeeding safety
 *   - Synergies (CEF combination, niacinamide+HA, etc.)
 *
 * Body: { productId, routineIds[], userContext? }
 * Returns: { compatible, score, conflicts[], warnings[], synergies[] }
 */

import { checkCompatibility, CompatibilityResult } from "../../lib/scanner/compatibility-engine";
import { ScannedIngredient } from "../../lib/scanner/pipeline";
import { scoreIngredients } from "../../lib/scanner/ingredient-scorer";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface CompatibilityRequest {
  productId: string; // UUID of scanned product (from scanned_products table)
  routineIds: string[]; // UUIDs of routine steps to check against
  userContext?: {
    pregnant?: boolean;
    breastfeeding?: boolean;
    sensitive?: boolean;
    skinType?: string;
  };
}

export interface CompatibilityResponse {
  compatible: boolean;
  score: number; // 0-100
  conflicts: Array<{
    type: string;
    severity: string;
    ingredients: string[];
    message: string;
    suggestion?: string;
  }>;
  warnings: Array<{
    type: string;
    severity: string;
    ingredients: string[];
    message: string;
    suggestion?: string;
  }>;
  synergies: Array<{
    type: string;
    severity: string;
    ingredients: string[];
    message: string;
  }>;
  productSafetyScore: number; // standalone safety score of the new product
  checkedAt: string;
}

// ------------------------------------------------------------------
// Mock database lookups (replace with real DB queries in production)
// ------------------------------------------------------------------

/**
 * Fetch product ingredients from the database.
 * In production, this queries `public.product_ingredient_analysis`.
 */
async function fetchProductIngredients(productId: string): Promise<ScannedIngredient[]> {
  // TODO: Replace with actual Supabase / DB query
  // Example:
  // const { data } = await supabase
  //   .from('product_ingredient_analysis')
  //   .select('*')
  //   .eq('scanned_product_id', productId);

  // For now, return a simulated lookup. In the real implementation,
  // you'd fetch from the database and map to ScannedIngredient[].
  console.log(`[check-compatibility] fetchProductIngredients(${productId}) — DB stub`);
  return [];
}

/**
 * Fetch all ingredients from a list of routine steps.
 * In production, this queries `public.routine_steps` joined with
 * `public.products` and `public.product_ingredients`.
 */
async function fetchRoutineIngredients(routineIds: string[]): Promise<ScannedIngredient[]> {
  // TODO: Replace with actual DB query
  // Example:
  // const { data } = await supabase
  //   .from('routine_steps')
  //   .select('products(*, product_ingredients(*))')
  //   .in('routine_id', routineIds);

  console.log(`[check-compatibility] fetchRoutineIngredients(${routineIds.join(", ")}) — DB stub`);
  return [];
}

// ------------------------------------------------------------------
// Handler
// ------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  try {
    const body: CompatibilityRequest = await request.json();

    // Validate
    if (!body.productId) {
      return jsonError("productId is required", 400);
    }
    if (!body.routineIds || body.routineIds.length === 0) {
      return jsonError("routineIds array is required (at least one routine)", 400);
    }

    // --- Fetch data --------------------------------------------------
    const [productIngredients, routineIngredients] = await Promise.all([
      fetchProductIngredients(body.productId),
      fetchRoutineIngredients(body.routineIds),
    ]);

    // Edge case: if DB stubs return empty, we still run the engine
    // but results will be limited. In production, you'd want to
    // return a 404 if the product or routines aren't found.

    // --- Run compatibility engine ------------------------------------
    const result = checkCompatibility(
      productIngredients,
      routineIngredients,
      body.userContext
    );

    // --- Compute standalone product safety score ---------------------
    const productSafety = scoreIngredients(productIngredients);

    // --- Build response ----------------------------------------------
    const response: CompatibilityResponse = {
      compatible: result.compatible,
      score: result.score,
      conflicts: result.conflicts,
      warnings: result.warnings,
      synergies: result.synergies,
      productSafetyScore: productSafety.overall,
      checkedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[check-compatibility] error:", err);
    return jsonError("Internal server error", 500);
  }
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
