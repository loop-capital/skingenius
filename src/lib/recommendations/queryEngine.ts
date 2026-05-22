import { createClient } from '@supabase/supabase-js';
import { Product, ConditionWithConfidence, QueryFilters } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getIngredientsForConditions(
  conditions: ConditionWithConfidence[]
): Promise<any[]> {
  const conditionIds = conditions.map(c => c.id);
  
  const { data, error } = await supabase
    .from('ingredients')
    .select(`
      id,
      name,
      condition_connections (
        condition_id,
        effectiveness,
        evidence_level
      )
    `)
    .in('condition_connections.condition_id', conditionIds);

  if (error) {
    console.error('Error fetching ingredients for conditions:', error);
    throw error;
  }

  return data || [];
}

export async function getProductsForIngredients(
  ingredientIds: string[]
): Promise<Product[]> {
  if (ingredientIds.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      brand,
      price_tier,
      category,
      ingredients (
        id,
        name
      ),
      pregnancy_safe,
      suitable_for_skin_types,
      suitable_for_fitzpatrick,
      contraindicated_ingredients
    `)
    .contains('ingredients', [{ id: { $in: ingredientIds } }]);

  if (error) {
    console.error('Error fetching products for ingredients:', error);
    throw error;
  }

  return (data as Product[]) || [];
}

export async function applyFilters(
  products: Product[],
  filters: QueryFilters
): Promise<Product[]> {
  return products.filter(product => {
    // Filter by skin type compatibility
    if (filters.skin_type && 
        !product.suitable_for_skin_types.includes(filters.skin_type)) {
      return false;
    }

    // Filter by Fitzpatrick compatibility
    if (filters.fitzpatrick && 
        !product.suitable_for_fitzpatrick.includes(filters.fitzpatrick)) {
      return false;
    }

    // Filter by pregnancy safety
    if (filters.is_pregnant && !product.pregnancy_safe) {
      return false;
    }

    // Filter by allergies
    if (filters.allergies && filters.allergies.length > 0) {
      const productIngredientNames = product.ingredients
        .map(ing => ing.name.toLowerCase());
      
      for (const allergy of filters.allergies) {
        if (productIngredientNames.includes(allergy.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });
}