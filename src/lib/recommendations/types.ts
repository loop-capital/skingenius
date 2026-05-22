export interface UserProfile {
  skin_type: string; // oily, dry, combination, sensitive, normal
  fitzpatrick: number; // 1-6
  is_pregnant: boolean;
  allergies: string[]; // ingredient names to avoid
  preferred_price_tier?: string; // $, $$, $$$, etc.
  preferred_brands?: string[]; // preferred brand names
}

export interface ConditionWithConfidence {
  id: string; // condition slug
  confidence: number; // 0-1
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface IngredientMatch {
  ingredient_id: string;
  condition_id: string;
  effectiveness: number; // 0-1, from knowledge graph
  evidence_level: 'A' | 'B' | 'C' | 'D';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price_tier: string; // $, $$, $$$, etc.
  category: string; // cleanser, moisturizer, treatment, etc.
  ingredients: Array<{
    id: string;
    name: string;
    concentration?: string;
  }>;
  pregnancy_safe: boolean;
  suitable_for_skin_types: string[]; // e.g., ['oily', 'dry', 'combination']
  suitable_for_fitzpatrick: number[]; // e.g., [1,2,3,4,5,6]
  contraindicated_ingredients: string[]; // ingredients that make this product unsafe for certain conditions
}

export interface RecommendationResult {
  product_id: string;
  name: string;
  brand: string;
  fit_score: number; // 0-100
  evidence_level: 'A' | 'B' | 'C' | 'D';
  pregnancy_safe: boolean;
  reasoning: string;
  key_actives: Array<{
    ingredient: string;
    concentration?: string;
    effectiveness: number;
  }>;
  conditions_addressed: string[];
  contraindications: string[];
  price_tier: string;
  category: string;
}

export interface QueryFilters {
  skin_type?: string;
  fitzpatrick?: number;
  is_pregnant?: boolean;
  allergies?: string[];
}