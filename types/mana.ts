// ============================================================
// MANA Labs Integration Types
// Skincare Product Scanner + Nutrition-Skin Module
// ============================================================

// --------------------------------------------------
// Product Scanner
// --------------------------------------------------

export type DataSource = 'incidecoder' | 'ewg' | 'cosing' | 'gemini' | 'manual';
export type ProductCategory = 'cleanser' | 'moisturizer' | 'serum' | 'sunscreen' | 'treatment' | 'mask' | 'toner' | 'exfoliant' | 'eye_care' | 'body_care' | 'other';
export type SafetyRating = 'safe' | 'low_concern' | 'moderate_concern' | 'high_concern' | 'avoid';
export type IrritationPotential = 'none' | 'low' | 'moderate' | 'high';
export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'insufficient';
export type TrendDirection = 'improving' | 'stable' | 'declining';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface ScannedProduct {
  id: string;
  user_id: string;
  barcode?: string | null;
  product_name: string;
  brand?: string | null;
  category?: ProductCategory | null;
  ingredients_raw?: string | null;
  photo_url?: string | null;
  data_source?: DataSource | null;
  safety_score?: number | null; // 0-100
  scanned_at?: string; // ISO timestamp
  created_at?: string;
}

export interface ProductIngredientAnalysis {
  id: string;
  scanned_product_id: string;
  ingredient_id?: string | null;
  ingredient_name: string;
  function?: string | null;
  safety_rating?: SafetyRating | null;
  comedogenic_rating?: number | null; // 0-5
  irritation_potential?: IrritationPotential | null;
  pregnancy_safe?: boolean;
  evidence_level?: EvidenceLevel | null;
  notes?: string | null;
  created_at?: string;
}

export interface ProductConditionFit {
  id: string;
  scanned_product_id: string;
  condition_id: string;
  fit_score?: number | null; // 0-100
  reasoning?: string | null;
  created_at?: string;
}

// --------------------------------------------------
// Nutrition-Skin
// --------------------------------------------------

export interface SkinNutritionLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  vitamin_a_mcg?: number | null;
  vitamin_c_mg?: number | null;
  vitamin_d_iu?: number | null;
  vitamin_e_mg?: number | null;
  zinc_mg?: number | null;
  omega_3_mg?: number | null;
  selenium_mcg?: number | null;
  biotin_mcg?: number | null;
  water_ml?: number | null;
  sugar_high?: boolean;
  dairy_consumed?: boolean;
  alcohol_units?: number | null;
  nutrition_score?: number | null; // 0-100
  notes?: string | null;
  created_at?: string;
}

export interface ScannedFood {
  id: string;
  user_id: string;
  barcode?: string | null;
  food_name: string;
  brand?: string | null;
  data_source?: DataSource | null;
  calories?: number | null;
  protein_g?: number | null;
  fat_g?: number | null;
  carbs_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
  vitamin_c_mg?: number | null;
  vitamin_a_mcg?: number | null;
  omega_3_mg?: number | null;
  zinc_mg?: number | null;
  portion_multiplier?: number; // default 1.0
  meal_type?: MealType | null;
  eaten_at?: string | null; // ISO timestamp
  created_at?: string;
}

// --------------------------------------------------
// Unified Skin Score
// --------------------------------------------------

export interface SkinHealthScore {
  id: string;
  user_id: string;
  score_date: string; // YYYY-MM-DD
  surface_score?: number | null; // 0-100
  product_safety_score?: number | null; // 0-100
  nutrition_score?: number | null; // 0-100
  lifestyle_score?: number | null; // 0-100
  total_score?: number | null; // 0-100
  top_positive?: string | null;
  top_negative?: string | null;
  trend?: TrendDirection | null;
  created_at?: string;
}

// --------------------------------------------------
// Ingredient Safety (from seed data)
// --------------------------------------------------

export interface IngredientSafety {
  id: string;
  name: string;
  slug: string;
  inci_name?: string | null;
  category: string; // matches ingredients.category
  description?: string | null;
  evidence_level?: EvidenceLevel | null;
  concerns?: string[];
  skin_types?: string[];
  interactions?: string[];
  pregnancy_safe?: boolean | null;
  min_concentration?: number | null;
  max_concentration?: number | null;
  comedogenic_rating?: number | null; // 0-5
  irritation_potential?: IrritationPotential | null;
  safety_rating?: SafetyRating | null;
  created_at?: string;
  updated_at?: string;
}

// --------------------------------------------------
// API Request/Response Types
// --------------------------------------------------

export interface ScanRequest {
  barcode?: string;
  productName?: string;
  imageUrl?: string;
  category?: ProductCategory;
}

export interface ScanResponse {
  product: ScannedProduct;
  ingredients: ProductIngredientAnalysis[];
  safetyScore: number; // 0-100
  conditionFit: ProductConditionFit[];
  dataSource: DataSource;
  warnings?: string[];
}

export interface CompatibilityRequest {
  productId: string;
  routineIds: string[];
}

export interface CompatibilityConflict {
  ingredient1: string;
  ingredient2: string;
  severity: 'warning' | 'critical';
  reason: string;
  recommendation: string;
}

export interface CompatibilityBoost {
  ingredient1: string;
  ingredient2: string;
  reason: string;
  benefit: string;
}

export interface CompatibilityResponse {
  compatible: boolean;
  score: number; // 0-100
  conflicts: CompatibilityConflict[];
  warnings: string[];
  boosts: CompatibilityBoost[];
  routineFit: Record<string, number>;
}

export interface NutritionLogRequest {
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  vitamin_d_iu?: number;
  vitamin_e_mg?: number;
  zinc_mg?: number;
  omega_3_mg?: number;
  selenium_mcg?: number;
  biotin_mcg?: number;
  water_ml?: number;
  sugar_high?: boolean;
  dairy_consumed?: boolean;
  alcohol_units?: number;
  notes?: string;
}

export interface NutritionLogResponse {
  log: SkinNutritionLog;
  nutritionScore: number;
  suggestions: string[];
  skinRelevantNutrients: string[];
}

export interface SkinScoreResponse {
  total: number;
  components: {
    surface: number | null;
    productSafety: number | null;
    nutrition: number | null;
    lifestyle: number | null;
  };
  trend: TrendDirection | null;
  insights: string[];
  date: string;
}

export interface SkinScoreHistoryResponse {
  scores: SkinHealthScore[];
  trend: TrendDirection | null;
  milestones: {
    date: string;
    type: 'improvement' | 'decline' | 'milestone';
    description: string;
  }[];
}

export interface CorrelationInsight {
  nutrient: string;
  skinMetric: string;
  direction: 'positive' | 'negative';
  strength: number; // 0-1
  insight: string;
}

export interface NutritionCorrelationResponse {
  correlations: CorrelationInsight[];
  insights: string[];
  daysAnalyzed: number;
}
