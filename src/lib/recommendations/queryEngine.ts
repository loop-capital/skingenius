/**
 * queryEngine.ts — SKINgenius Recommendation Query Engine
 *
 * Queries Supabase for ingredients linked to detected conditions,
 * then finds products containing those ingredients.
 *
 * Data flow:
 *   conditions[] → condition_connections → ingredients → products
 */

import { createClient } from "@supabase/supabase-js";
import { ConditionWithConfidence, Product, QueryFilters } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types for condition_connections rows ──────────────────────

interface ConditionConnectionRow {
  id: string;
  ingredient_id: string;
  condition_id: string;
  effectiveness: number;
  evidence_level: string;
  mechanism: string | null;
}

interface IngredientRow {
  id: string;
  name: string;
  slug: string;
  inci_name: string | null;
  category: string;
  evidence_level: string | null;
  pregnancy_safe: boolean | null;
  concerns: string[] | null;
  skin_types: string[] | null;
  interactions: string[] | null;
  min_concentration: number | null;
  max_concentration: number | null;
}

interface ProductRow {
  id: string;
  name: string;
  brand: string;
  slug: string;
  category: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  size: string | null;
  image_url: string | null;
  ingredients: string[] | null;
  ingredient_ids: string[] | null;
  skin_types: string[] | null;
  concerns: string[] | null;
  rating: number | null;
  review_count: number | null;
  url: string | null;
  is_clean: boolean | null;
  is_cruelty_free: boolean | null;
  is_vegan: boolean | null;
  is_fragrance_free: boolean | null;
}

// ─── Ingredient + connection enrichment ──────────────────────────

export interface EnrichedIngredient {
  id: string;
  name: string;
  slug: string;
  category: string;
  condition_connections: Array<{
    condition_id: string;
    effectiveness: number;
    evidence_level: string;
  }>;
  evidence_level: string | null;
  pregnancy_safe: boolean | null;
  concerns: string[] | null;
  skin_types: string[] | null;
  interactions: string[] | null;
}

// ─── Step 1: Get ingredients for conditions ─────────────────────

export async function getIngredientsForConditions(
  conditions: ConditionWithConfidence[],
): Promise<EnrichedIngredient[]> {
  if (conditions.length === 0) return [];

  const conditionIds = conditions.map((c) => c.id);

  // 1a. Find all condition_connections matching our conditions
  const { data: connections, error: connError } = await supabase
    .from("condition_connections")
    .select(
      "id, ingredient_id, condition_id, effectiveness, evidence_level, mechanism",
    )
    .in("condition_id", conditionIds);

  if (connError) {
    console.error(
      "[queryEngine] Error fetching condition_connections:",
      connError,
    );
    // Fall back to ingredient-based matching using the `concerns` array
    return await getIngredientsByConcerns(conditionIds);
  }

  if (!connections || connections.length === 0) {
    console.warn(
      "[queryEngine] No condition_connections found, falling back to concerns matching",
    );
    return await getIngredientsByConcerns(conditionIds);
  }

  // 1b. Get unique ingredient IDs from connections
  const ingredientIds = [
    ...new Set(connections.map((c: ConditionConnectionRow) => c.ingredient_id)),
  ];

  // 1c. Fetch ingredient details
  const { data: ingredients, error: ingError } = await supabase
    .from("ingredients")
    .select(
      "id, name, slug, inci_name, category, evidence_level, pregnancy_safe, concerns, skin_types, interactions",
    )
    .in("id", ingredientIds);

  if (ingError || !ingredients || ingredients.length === 0) {
    console.error("[queryEngine] Error fetching ingredients:", ingError);
    return [];
  }

  // 1d. Build a map of connections by ingredient_id for enrichment
  const connectionsByIngredient = new Map<string, ConditionConnectionRow[]>();
  for (const conn of connections as ConditionConnectionRow[]) {
    const existing = connectionsByIngredient.get(conn.ingredient_id) || [];
    existing.push(conn);
    connectionsByIngredient.set(conn.ingredient_id, existing);
  }

  // 1e. Enrich ingredients with their connections
  return (ingredients as IngredientRow[]).map((ing) => ({
    id: ing.id,
    name: ing.name,
    slug: ing.slug,
    category: ing.category,
    condition_connections: (connectionsByIngredient.get(ing.id) || []).map(
      (conn) => ({
        condition_id: conn.condition_id,
        effectiveness: conn.effectiveness,
        evidence_level: conn.evidence_level,
      }),
    ),
    evidence_level: ing.evidence_level,
    pregnancy_safe: ing.pregnancy_safe,
    concerns: ing.concerns,
    skin_types: ing.skin_types,
    interactions: ing.interactions,
  }));
}

// ─── Fallback: Match ingredients by concerns array ──────────────

async function getIngredientsByConcerns(
  conditionIds: string[],
): Promise<EnrichedIngredient[]> {
  // Map condition slugs to concern strings used in the ingredients table
  const concernMap: Record<string, string[]> = {
    "acne-vulgaris": ["acne"],
    "hormonal-acne": ["acne"],
    rosacea: ["rosacea", "redness"],
    "post-inflammatory-hyperpigmentation": ["hyperpigmentation"],
    melasma: ["hyperpigmentation"],
    "seborrheic-dermatitis": ["seborrheic_dermatitis"],
    "atopic-dermatitis": ["barrier_repair", "sensitivity"],
    "solar-lentigines": ["sun_damage", "hyperpigmentation"],
    "fungal-acne": ["acne"],
    "contact-dermatitis": ["sensitivity", "redness"],
  };

  const allConcerns = new Set<string>();
  for (const cid of conditionIds) {
    const mapped = concernMap[cid];
    if (mapped) {
      mapped.forEach((c) => allConcerns.add(c));
    }
  }

  if (allConcerns.size === 0) return [];

  // Use Supabase overlap filter to find ingredients that address any of these concerns
  const { data: ingredients, error } = await supabase
    .from("ingredients")
    .select(
      "id, name, slug, inci_name, category, evidence_level, pregnancy_safe, concerns, skin_types, interactions",
    )
    .overlaps("concerns", Array.from(allConcerns));

  if (error || !ingredients) {
    console.error("[queryEngine] Fallback query error:", error);
    return [];
  }

  // Build synthetic condition_connections from the concerns overlap
  return (ingredients as IngredientRow[]).map((ing) => ({
    id: ing.id,
    name: ing.name,
    slug: ing.slug,
    category: ing.category,
    condition_connections: conditionIds
      .filter((cid) => {
        const mapped = concernMap[cid] || [];
        return mapped.some((c) => ing.concerns?.includes(c));
      })
      .map((cid) => ({
        condition_id: cid,
        effectiveness: 0.7, // default moderate effectiveness
        evidence_level: ing.evidence_level || "emerging",
      })),
    evidence_level: ing.evidence_level,
    pregnancy_safe: ing.pregnancy_safe,
    concerns: ing.concerns,
    skin_types: ing.skin_types,
    interactions: ing.interactions,
  }));
}

export async function getProductsForConditions(
  conditions: ConditionWithConfidence[],
  skinTone: number,
): Promise<Product[]> {
  // Map condition IDs to concern strings used in the products table
  const concernMap: Record<string, string[]> = {
    "acne-vulgaris": ["acne"],
    "hormonal-acne": ["acne"],
    rosacea: ["rosacea", "redness"],
    "post-inflammatory-hyperpigmentation": ["hyperpigmentation"],
    melasma: ["hyperpigmentation"],
    "seborrheic-dermatitis": ["seborrheic_dermatitis"],
    "atopic-dermatitis": ["eczema", "sensitivity"],
    "solar-lentigines": ["sun_damage", "hyperpigmentation"],
    "fungal-acne": ["acne"],
    "contact-dermatitis": ["sensitivity", "redness"],
  };

  const allConcerns = new Set<string>();
  for (const c of conditions) {
    const mapped = concernMap[c.id];
    if (mapped) {
      mapped.forEach((concern) => allConcerns.add(concern));
    }
  }

  if (allConcerns.size === 0) return [];

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .overlaps("concerns", Array.from(allConcerns));

  if (error || !products) {
    console.error("[queryEngine] Error fetching products by concerns:", error);
    return [];
  }

  return (products as ProductRow[]).map(mapProductRow);
}

// ─── Step 2: Get products containing ingredients ────────────────

export async function getProductsForIngredients(
  ingredientIds: string[],
): Promise<Product[]> {
  if (ingredientIds.length === 0) return [];

  // Fetch products that contain any of the specified ingredient IDs
  // Use the ingredient_ids array column with overlap
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .overlaps("ingredient_ids", ingredientIds);

  if (error) {
    console.error("[queryEngine] Error fetching products:", error);

    // Fallback: try matching by ingredient names via the ingredients text[]
    const { data: ingredientNames, error: nameError } = await supabase
      .from("ingredients")
      .select("name")
      .in("id", ingredientIds);

    if (nameError || !ingredientNames) return [];

    const names = ingredientNames.map((i: { name: string }) => i.name);

    const { data: fallbackProducts, error: fbError } = await supabase
      .from("products")
      .select("*")
      .overlaps("ingredients", names);

    if (fbError || !fallbackProducts) return [];

    return (fallbackProducts as ProductRow[]).map(mapProductRow);
  }

  if (!products || products.length === 0) {
    // Try fallback with ingredient names
    const { data: ingredientNames } = await supabase
      .from("ingredients")
      .select("name")
      .in("id", ingredientIds);

    if (!ingredientNames || ingredientNames.length === 0) return [];

    const names = ingredientNames.map((i: { name: string }) => i.name);

    const { data: fallbackProducts } = await supabase
      .from("products")
      .select("*")
      .overlaps("ingredients", names);

    if (!fallbackProducts) return [];

    return (fallbackProducts as ProductRow[]).map(mapProductRow);
  }

  return (products as ProductRow[]).map(mapProductRow);
}

// ─── Map DB row → Product type ──────────────────────────────────

function mapProductRow(row: ProductRow): Product {
  // Parse ingredient_ids + ingredients (name array) into structured list
  const ingredientNames = row.ingredients || [];
  const ingredientIds = row.ingredient_ids || [];

  const ingredientList = ingredientNames.map((name, idx) => ({
    id: ingredientIds[idx] || "",
    name,
  }));

  // Map DB price_tier notation
  const priceTier =
    row.price != null
      ? row.price <= 15
        ? "$"
        : row.price <= 35
          ? "$$"
          : row.price <= 75
            ? "$$$"
            : "$$$$"
      : "$$"; // default

  // Map skin_types → suitable_for_skin_types
  const suitableForSkinTypes: string[] = row.skin_types || [
    "normal",
    "oily",
    "dry",
    "combination",
    "sensitive",
  ];

  // Map concerns + skin_types → suitable_for_fitzpatrick (default all)
  const suitableForFitzpatrick: number[] = [1, 2, 3, 4, 5, 6];

  // Determine pregnancy safety
  const pregnancySafe =
    row.is_fragrance_free !== false && row.is_clean !== false;

  // Determine contraindicated ingredients from interactions
  // (This is a simplification; ideally this would be a separate lookup)
  const contraindicatedIngredients: string[] = [];

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price_tier: priceTier,
    category: row.category,
    ingredients: ingredientList,
    pregnancy_safe: pregnancySafe,
    suitable_for_skin_types: suitableForSkinTypes,
    suitable_for_fitzpatrick: suitableForFitzpatrick,
    contraindicated_ingredients: contraindicatedIngredients,
  };
}

// ─── Step 3: Apply filters ──────────────────────────────────────

export async function applyFilters(
  products: Product[],
  filters: QueryFilters,
): Promise<Product[]> {
  return products.filter((product) => {
    // Filter by skin type compatibility
    if (
      filters.skin_type &&
      product.suitable_for_skin_types.length > 0 &&
      !product.suitable_for_skin_types.includes(filters.skin_type)
    ) {
      return false;
    }

    // Filter by Fitzpatrick compatibility
    if (
      filters.fitzpatrick &&
      product.suitable_for_fitzpatrick.length > 0 &&
      !product.suitable_for_fitzpatrick.includes(filters.fitzpatrick)
    ) {
      return false;
    }

    // Filter by pregnancy safety
    if (filters.is_pregnant && !product.pregnancy_safe) {
      return false;
    }

    // Filter by allergies
    if (filters.allergies && filters.allergies.length > 0) {
      const productIngredientNames = product.ingredients.map((ing) =>
        ing.name.toLowerCase(),
      );

      for (const allergy of filters.allergies) {
        if (productIngredientNames.includes(allergy.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });
}
