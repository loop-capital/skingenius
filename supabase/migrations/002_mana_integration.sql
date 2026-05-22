-- ============================================
-- MANA Labs Integration Migration
-- Adds: Product Scanner, Nutrition-Skin, Unified Skin Score
-- ============================================

-- ============================================
-- PRODUCT SCANNER TABLES
-- ============================================

-- Scanned skincare products (like MANA's food product lookup)
CREATE TABLE IF NOT EXISTS public.scanned_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  barcode TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT CHECK (category IN ('cleanser', 'moisturizer', 'serum', 'sunscreen', 'treatment', 'mask', 'toner', 'exfoliant', 'eye_care', 'body_care', 'other')),
  ingredients_raw TEXT, -- Full INCI list as scanned
  photo_url TEXT,
  data_source TEXT CHECK (data_source IN ('incidecoder', 'ewg', 'cosing', 'gemini', 'manual')),
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual ingredient analysis from scanned product
CREATE TABLE IF NOT EXISTS public.product_ingredient_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_product_id UUID REFERENCES public.scanned_products(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  function TEXT, -- emollient, humectant, preservative, active, fragrance, etc.
  safety_rating TEXT CHECK (safety_rating IN ('safe', 'low_concern', 'moderate_concern', 'high_concern', 'avoid')),
  comedogenic_rating INTEGER CHECK (comedogenic_rating >= 0 AND comedogenic_rating <= 5),
  irritation_potential TEXT CHECK (irritation_potential IN ('none', 'low', 'moderate', 'high')),
  pregnancy_safe BOOLEAN DEFAULT TRUE,
  evidence_level TEXT CHECK (evidence_level IN ('strong', 'moderate', 'limited', 'insufficient')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product-to-skin-condition compatibility
CREATE TABLE IF NOT EXISTS public.product_condition_fit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_product_id UUID REFERENCES public.scanned_products(id) ON DELETE CASCADE NOT NULL,
  condition_id UUID REFERENCES public.skin_conditions(id) NOT NULL,
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  reasoning TEXT, -- "Contains niacinamide (evidence A for acne); no irritating fragrances"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NUTRITION-SKIN TABLES
-- ============================================

-- Daily skin nutrition log (opt-in, skin-relevant nutrients only)
CREATE TABLE IF NOT EXISTS public.skin_nutrition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Skin-relevant micronutrients (mg/mcg, simplified)
  vitamin_a_mcg INTEGER,
  vitamin_c_mg INTEGER,
  vitamin_d_iu INTEGER,
  vitamin_e_mg INTEGER,
  zinc_mg DECIMAL(4,1),
  omega_3_mg INTEGER,
  selenium_mcg INTEGER,
  biotin_mcg INTEGER,
  -- Hydration
  water_ml INTEGER,
  -- Dietary flags
  sugar_high BOOLEAN DEFAULT FALSE, -- Simple flag vs detailed tracking
  dairy_consumed BOOLEAN DEFAULT FALSE,
  alcohol_units DECIMAL(3,1) DEFAULT 0,
  -- Optional EAT-style score
  nutrition_score INTEGER CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Scanned food items (optional deeper tracking)
CREATE TABLE IF NOT EXISTS public.scanned_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  barcode TEXT,
  food_name TEXT NOT NULL,
  brand TEXT,
  data_source TEXT CHECK (data_source IN ('openfoodfacts', 'usda', 'exa', 'gemini', 'manual')),
  calories INTEGER,
  protein_g DECIMAL(5,1),
  fat_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  sugar_g DECIMAL(5,1),
  sodium_mg INTEGER,
  -- Skin-relevant highlights
  vitamin_c_mg DECIMAL(5,1),
  vitamin_a_mcg INTEGER,
  omega_3_mg INTEGER,
  zinc_mg DECIMAL(4,1),
  -- User's portion
  portion_multiplier DECIMAL(3,2) DEFAULT 1.0,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  eaten_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UNIFIED SKIN SCORE TABLE
-- ============================================

-- Daily Skin Health Score (computed, cached)
CREATE TABLE IF NOT EXISTS public.skin_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Component scores (each 0-100)
  surface_score INTEGER, -- From latest photo analysis
  product_safety_score INTEGER, -- Avg of products in routine
  nutrition_score INTEGER, -- From nutrition log
  lifestyle_score INTEGER, -- Sleep, stress, exercise (future)
  -- Computed total
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  -- Insights
  top_positive TEXT, -- "Omega-3 intake improved inflammation markers"
  top_negative TEXT, -- "High sugar intake correlated with breakout risk"
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scanned_products_user ON public.scanned_products(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_barcode ON public.scanned_products(barcode);
CREATE INDEX IF NOT EXISTS idx_scanned_products_scanned_at ON public.scanned_products(scanned_at);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_scanned_product ON public.product_ingredient_analysis(scanned_product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient ON public.product_ingredient_analysis(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_condition_fit_product ON public.product_condition_fit(scanned_product_id);
CREATE INDEX IF NOT EXISTS idx_product_condition_fit_condition ON public.product_condition_fit(condition_id);
CREATE INDEX IF NOT EXISTS idx_skin_nutrition_user_date ON public.skin_nutrition_log(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_scanned_foods_user ON public.scanned_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_foods_barcode ON public.scanned_foods(barcode);
CREATE INDEX IF NOT EXISTS idx_scanned_foods_eaten_at ON public.scanned_foods(eaten_at);
CREATE INDEX IF NOT EXISTS idx_skin_scores_user_date ON public.skin_health_scores(user_id, score_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.scanned_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredient_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_condition_fit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_nutrition_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_health_scores ENABLE ROW LEVEL SECURITY;

-- scanned_products: users can only access their own
CREATE POLICY "Users can view own scanned products" ON public.scanned_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scanned products" ON public.scanned_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scanned products" ON public.scanned_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scanned products" ON public.scanned_products FOR DELETE USING (auth.uid() = user_id);

-- product_ingredient_analysis: via scanned product ownership
CREATE POLICY "Users can view own ingredient analyses" ON public.product_ingredient_analysis FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scanned_products WHERE scanned_products.id = product_ingredient_analysis.scanned_product_id AND scanned_products.user_id = auth.uid())
);
CREATE POLICY "Users can insert own ingredient analyses" ON public.product_ingredient_analysis FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.scanned_products WHERE scanned_products.id = product_ingredient_analysis.scanned_product_id AND scanned_products.user_id = auth.uid())
);

-- product_condition_fit: via scanned product ownership
CREATE POLICY "Users can view own condition fits" ON public.product_condition_fit FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scanned_products WHERE scanned_products.id = product_condition_fit.scanned_product_id AND scanned_products.user_id = auth.uid())
);
CREATE POLICY "Users can insert own condition fits" ON public.product_condition_fit FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.scanned_products WHERE scanned_products.id = product_condition_fit.scanned_product_id AND scanned_products.user_id = auth.uid())
);

-- skin_nutrition_log: users can only access their own
CREATE POLICY "Users can view own nutrition log" ON public.skin_nutrition_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition log" ON public.skin_nutrition_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition log" ON public.skin_nutrition_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition log" ON public.skin_nutrition_log FOR DELETE USING (auth.uid() = user_id);

-- scanned_foods: users can only access their own
CREATE POLICY "Users can view own scanned foods" ON public.scanned_foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scanned foods" ON public.scanned_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scanned foods" ON public.scanned_foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scanned foods" ON public.scanned_foods FOR DELETE USING (auth.uid() = user_id);

-- skin_health_scores: users can only access their own
CREATE POLICY "Users can view own health scores" ON public.skin_health_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health scores" ON public.skin_health_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health scores" ON public.skin_health_scores FOR UPDATE USING (auth.uid() = user_id);
