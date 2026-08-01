/**
 * POST /api/v1/recommendations
 *
 * Given detected skin conditions, returns product recommendations
 * ranked by fit score. The pipeline:
 *
 *   conditions[] → condition_connections → ingredients → products → fit scores
 *
 * Input:
 *   { conditions: ConditionWithConfidence[], skin_type, fitzpatrick, is_pregnant, allergies }
 *
 * Output:
 *   { success: true, data: { recommendations: RecommendationResult[] } }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getIngredientsForConditions,
  getProductsForIngredients,
  getProductsForConditions,
  applyFilters,
} from "@/lib/recommendations/queryEngine";
import { calculateFitScore } from "@/lib/recommendations/fitScore";
import {
  ConditionWithConfidence,
  UserProfile,
} from "@/lib/recommendations/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // ── Validate input ──────────────────────────────────────────
    if (!body.conditions || !Array.isArray(body.conditions)) {
      return NextResponse.json(
        { error: "Conditions array is required" },
        { status: 400 },
      );
    }

    if (body.conditions.length === 0) {
      return NextResponse.json(
        { error: "At least one condition is required" },
        { status: 400 },
      );
    }

    for (const condition of body.conditions) {
      if (!condition.id || typeof condition.confidence !== "number") {
        return NextResponse.json(
          { error: "Each condition must have id and confidence" },
          { status: 400 },
        );
      }
    }

    // ── Parse input ──────────────────────────────────────────────
    const conditions: ConditionWithConfidence[] = body.conditions;
    const userProfile: UserProfile = {
      skin_type: body.skin_type || "normal",
      fitzpatrick: body.fitzpatrick || 3,
      is_pregnant: body.is_pregnant || false,
      allergies: body.allergies || [],
      preferred_price_tier: body.preferences?.max_price_tier,
      preferred_brands: body.preferences?.preferred_brands,
    };

    // ── Step 1: Get ingredients linked to conditions ─────────────
    const enrichedIngredients = await getIngredientsForConditions(conditions);

    // Extract ingredient IDs that connect to our conditions
    const conditionIds = conditions.map((c) => c.id);
    const ingredientIds: string[] = [];
    for (const ingredient of enrichedIngredients) {
      const hasConnection = (ingredient.condition_connections || []).some(
        (conn) => conditionIds.includes(conn.condition_id),
      );
      if (hasConnection && ingredient.id) {
        ingredientIds.push(ingredient.id);
      }
    }
    const uniqueIngredientIds = [...new Set(ingredientIds)];

    // ── Step 2: Get products matching conditions ────────────────
    // Primary: query products by concerns overlap (most reliable with current data)
    // Secondary: query products by ingredient IDs (works when ingredient_ids populated)
    let products = await getProductsForConditions(
      conditions,
      userProfile.fitzpatrick,
    );

    // If concerns-based query returned nothing, try ingredient-based path
    if (products.length === 0 && uniqueIngredientIds.length > 0) {
      products = await getProductsForIngredients(uniqueIngredientIds);
    }

    // ── Step 3: Apply filters ────────────────────────────────────
    const filters = {
      skin_type: userProfile.skin_type,
      fitzpatrick: userProfile.fitzpatrick,
      is_pregnant: userProfile.is_pregnant,
      allergies: userProfile.allergies,
    };

    products = await applyFilters(products, filters);

    // ── Step 4: Calculate fit scores and rank ─────────────────────
    const recommendations = products
      .map((product) =>
        calculateFitScore(
          product,
          conditions,
          userProfile,
          enrichedIngredients,
        ),
      )
      .sort((a, b) => b.fit_score - a.fit_score)
      .slice(0, 10); // Top 10

    return NextResponse.json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    console.error("[recommendations] Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 },
    );
  }
}
