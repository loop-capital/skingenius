import { NextResponse } from 'next/server';
import { getIngredientsForConditions } from '@/lib/recommendations/queryEngine';
import { getProductsForIngredients } from '@/lib/recommendations/queryEngine';
import { applyFilters } from '@/lib/recommendations/queryEngine';
import { calculateFitScore } from '@/lib/recommendations/fitScore';
import { ConditionWithConfidence, UserProfile } from '@/lib/recommendations/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.conditions || !Array.isArray(body.conditions)) {
      return NextResponse.json(
        { error: 'Conditions array is required' },
        { status: 400 }
      );
    }
    
    // Validate each condition has required fields
    for (const condition of body.conditions) {
      if (!condition.id || typeof condition.confidence !== 'number') {
        return NextResponse.json(
          { error: 'Each condition must have id and confidence' },
          { status: 400 }
        );
      }
    }
    
    // Parse input
    const conditions: ConditionWithConfidence[] = body.conditions;
    const userProfile: UserProfile = {
      skin_type: body.skin_type || 'normal',
      fitzpatrick: body.fitzpatrick || 3,
      is_pregnant: body.is_pregnant || false,
      allergies: body.allergies || [],
      preferred_price_tier: body.preferences?.max_price_tier,
      preferred_brands: body.preferences?.preferred_brands
    };
    
    // Step 1: Get ingredients that address the conditions
    const ingredients = await getIngredientsForConditions(conditions);
    
    // Extract ingredient IDs
    const ingredientIds = ingredients
      .flatMap(item => item.condition_connections || [])
      .map(conn => conn.condition_id); // This needs adjustment based on actual DB structure
    
    // Step 2: Get products containing those ingredients
    let products = await getProductsForIngredients(ingredientIds);
    
    // Step 3: Apply filters
    const filters = {
      skin_type: userProfile.skin_type,
      fitzpatrick: userProfile.fitzpatrick,
      is_pregnant: userProfile.is_pregnant,
      allergies: userProfile.allergies
    };
    
    products = await applyFilters(products, filters);
    
    // Step 4: Calculate fit scores and rank
    const recommendations = products
      .map(product => calculateFitScore(product, conditions, userProfile))
      .sort((a, b) => b.fit_score - a.fit_score)
      .slice(0, 10); // Top 10 recommendations
    
    return NextResponse.json({
      success: true,
      data: {
        recommendations
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}