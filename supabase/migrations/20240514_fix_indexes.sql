-- SKINgenius Database Migration — 2024-05-14
-- High-priority fixes from audit: indexes, junction table, roles, constraints

-- =============================================================================
-- 1. Create missing indexes (critical for performance)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_steps_product_id ON routine_steps(product_id);
CREATE INDEX IF NOT EXISTS idx_user_skin_profiles_user_id ON user_skin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_reactions_ingredient_id ON ingredient_reactions(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_skin_log_entries_user_date ON skin_log_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_category_evidence ON ingredients(category, evidence_level);

-- =============================================================================
-- 2. Create product-ingredient junction table
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_ingredients (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, ingredient_id)
);

-- =============================================================================
-- 3. Add admin role to profiles
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- 4. Add data-validation constraints
-- =============================================================================

ALTER TABLE ingredients ADD CONSTRAINT IF NOT EXISTS chk_concentration_range
  CHECK (min_concentration IS NULL OR max_concentration IS NULL OR min_concentration <= max_concentration);

ALTER TABLE user_skin_profiles ADD CONSTRAINT IF NOT EXISTS chk_sleep_hours
  CHECK (sleep_hours_avg IS NULL OR (sleep_hours_avg >= 0 AND sleep_hours_avg <= 24));
