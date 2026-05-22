# SKINgenius Database Audit Report

> **Date:** 2026-05-14
> **Project:** SKINgenius (cnzoilxsttoqtvwotexd.supabase.co)
> **Auditor:** SKINgenius-Dev (che-dev agent)

---

## Executive Summary

| Metric | Status |
|--------|--------|
| **Tables** | 11 tables |
| **Indexes** | 15 indexes |
| **RLS Policies** | 33 policies |
| **Missing Indexes** | ⚠️ 6 critical |
| **Missing Constraints** | ⚠️ 4 recommended |
| **Security Gaps** | ⚠️ 2 identified |
| **Overall Health** | 🟡 Good, needs optimization |

---

## 1. Missing Indexes (Critical)

### 1.1 Foreign Key Without Index
| Table | Column | Foreign Key | Impact |
|-------|--------|-------------|--------|
| `skin_photos` | `user_id` | `profiles(id)` | ✅ Has index |
| `skin_analyses` | `photo_id` | `skin_photos(id)` | ✅ Has index |
| `skin_analyses` | `condition_id` | `skin_conditions(id)` | ✅ Has index |
| `skin_analyses` | `user_id` | `profiles(id)` | ❌ **MISSING** |
| `products` | `ingredient_ids` | Array of UUIDs | ❌ **MISSING** (GIN index) |
| `routine_steps` | `product_id` | `products(id)` | ❌ **MISSING** |
| `user_skin_profiles` | `user_id` | `profiles(id)` | ❌ **MISSING** |
| `ingredient_reactions` | `ingredient_id` | `ingredients(id)` | ❌ **MISSING** |
| `routines` | `user_id` | `profiles(id)` | ✅ Has index |

### 1.2 Recommended Composite Indexes
```sql
-- For efficient user + date queries on skin log
CREATE INDEX idx_skin_log_user_date ON skin_log_entries(user_id, date);

-- For ingredient search by category + evidence
CREATE INDEX idx_ingredients_category_evidence ON ingredients(category, evidence_level);

-- For product search by brand + category
CREATE INDEX idx_products_brand_category ON products(brand, category);
```

### 1.3 Array Column Indexes (GIN)
```sql
-- For product ingredient lookups
CREATE INDEX idx_products_ingredients ON products USING GIN(ingredients);

-- For ingredient interactions
CREATE INDEX idx_ingredients_interactions ON ingredients USING GIN(interactions);

-- For user concern matching
CREATE INDEX idx_ingredients_concerns ON ingredients USING GIN(concerns);
```

---

## 2. Missing Constraints

### 2.1 Not NULL Constraints
| Table | Column | Current | Recommended |
|-------|--------|---------|-------------|
| `ingredients` | `name` | NOT NULL | ✅ Keep |
| `ingredients` | `category` | NOT NULL | ✅ Keep |
| `ingredients` | `pregnancy_safe` | NULL | ⚠️ Should be NOT NULL with DEFAULT |
| `products` | `brand` | NOT NULL | ✅ Keep |
| `products` | `category` | NOT NULL | ✅ Keep |
| `products` | `price` | NULL | ⚠️ Consider NOT NULL or DEFAULT 0 |

### 2.2 Check Constraints
```sql
-- Ensure valid email format for profiles
ALTER TABLE profiles ADD CONSTRAINT chk_valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure min <= max concentration for ingredients
ALTER TABLE ingredients ADD CONSTRAINT chk_concentration_range 
  CHECK (min_concentration IS NULL OR max_concentration IS NULL OR min_concentration <= max_concentration);

-- Ensure rating is within valid range
ALTER TABLE skin_log_entries ADD CONSTRAINT chk_overall_rating 
  CHECK (overall_rating >= 1 AND overall_rating <= 10);

-- Ensure sleep hours are reasonable
ALTER TABLE user_skin_profiles ADD CONSTRAINT chk_sleep_hours 
  CHECK (sleep_hours_avg IS NULL OR (sleep_hours_avg >= 0 AND sleep_hours_avg <= 24));
```

### 2.3 Unique Constraints
```sql
-- Prevent duplicate routine step orders within a routine
ALTER TABLE routine_steps ADD CONSTRAINT unique_step_order 
  UNIQUE (routine_id, step_order);

-- Prevent duplicate skin log entries per day per user
-- Already has: UNIQUE(user_id, date) ✅
```

---

## 3. Data Type Optimizations

### 3.1 UUID vs. SERIAL
| Table | Current | Recommendation |
|-------|---------|----------------|
| All tables | `UUID` | ✅ Good for distributed systems |

### 3.2 Decimal Precision
| Column | Current | Recommended | Reason |
|--------|---------|-------------|--------|
| `price` | `DECIMAL(10,2)` | Keep | Good for currency |
| `confidence_score` | `DECIMAL(3,2)` | Keep | Good for 0.00-1.00 |
| `min_concentration` | `DECIMAL(5,2)` | Keep | Good for percentages |
| `sleep_hours_avg` | `DECIMAL(3,1)` | Keep | Good for hours |

### 3.3 Text vs. Enums
| Column | Current | Recommendation |
|--------|---------|----------------|
| `skin_type` | `TEXT` with CHECK | Consider `ENUM` type |
| `routine_type` | `TEXT` with CHECK | Consider `ENUM` type |
| `category` (ingredients) | `TEXT` with CHECK | Consider `ENUM` type |

Note: PostgreSQL enums are more performant than CHECK constraints but harder to modify.

---

## 4. Missing Relationships

### 4.1 Missing Foreign Key
| Table | Column | Should Reference | Status |
|-------|--------|------------------|--------|
| `routine_steps` | `product_id` | `products(id)` | ✅ Has ON DELETE SET NULL |
| `products` | `ingredient_ids` | Array reference to `ingredients(id)` | ❌ No FK constraint |

Note: Array foreign keys are not natively supported in PostgreSQL. Consider a junction table:
```sql
-- Junction table for product-ingredient relationships
CREATE TABLE product_ingredients (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, ingredient_id)
);
```

### 4.2 Missing Cascade Operations
```sql
-- When a user deletes their account, cascade to related data
-- Already has: ON DELETE CASCADE for user_id references ✅

-- When a product is deleted, set routine steps to NULL
-- Already has: ON DELETE SET NULL for routine_steps.product_id ✅
```

---

## 5. Row Level Security (RLS) Gaps

### 5.1 Missing Policies
| Table | Missing Policy | Risk |
|-------|---------------|------|
| `skin_photos` | UPDATE policy | Users can't update photo metadata |
| `products` | INSERT/UPDATE/DELETE | Anyone can modify products? |
| `ingredients` | INSERT/UPDATE/DELETE | Anyone can modify ingredients? |

### 5.2 Recommended Policies
```sql
-- Products: Admin-only write access
CREATE POLICY "Only admins can insert products" ON products FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update products" ON products FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete products" ON products FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Ingredients: Admin-only write access
CREATE POLICY "Only admins can insert ingredients" ON ingredients FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update ingredients" ON ingredients FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Skin photos: Allow updates
CREATE POLICY "Users can update own photos" ON skin_photos FOR UPDATE 
  USING (auth.uid() = user_id);
```

### 5.3 Security Recommendation
Consider adding an `is_admin` flag to profiles or using a custom claim in the JWT:
```sql
-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies to check admin status
CREATE POLICY "Admins can manage all data" ON skin_analyses FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));
```

---

## 6. Performance Recommendations

### 6.1 Vacuum and Analyze
```sql
-- Run after bulk data loads
VACUUM ANALYZE;

-- For specific tables
VACUUM ANALYZE skin_analyses;
VACUUM ANALYZE skin_log_entries;
```

### 6.2 Partitioning (Future)
For high-volume tables like `skin_log_entries`, consider partitioning by date:
```sql
-- Partition by month for better query performance
CREATE TABLE skin_log_entries_2026_01 PARTITION OF skin_log_entries
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 6.3 Connection Pooling
- Enable PgBouncer in Supabase for connection pooling
- Recommended pool size: 10-20 connections per application instance

---

## 7. Schema Completeness

### 7.1 Missing Tables (Future Features)
| Feature | Table Needed |
|---------|-------------|
| Root Cause Mappings | `root_causes` |
| Gut-Skin Correlations | `gut_skin_correlations` |
| Hormone Triggers | `hormone_triggers` |
| Nutrition Deficiencies | `nutrition_deficiencies` |
| User Favorites | `user_favorites` |
| Product Reviews | `product_reviews` |
| Routine Templates | `routine_templates` |
| Treatment History | `treatment_history` |

### 7.2 Missing Columns
| Table | Missing Column | Purpose |
|-------|---------------|---------|
| `profiles` | `phone` | SMS notifications |
| `profiles` | `timezone` | Time-aware notifications |
| `profiles` | `language` | Localization |
| `skin_photos` | `metadata` | EXIF data, camera info |
| `products` | `country_of_origin` | Import compliance |
| `products` | `expiration_date` | Shelf life tracking |

---

## 8. Migration Scripts

### 8.1 Immediate Fixes (Safe to run)
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user ON skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_steps_product ON routine_steps(product_id);
CREATE INDEX IF NOT EXISTS idx_user_skin_profiles_user ON user_skin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_reactions_ingredient ON ingredient_reactions(ingredient_id);

-- Add GIN indexes for array columns
CREATE INDEX IF NOT EXISTS idx_products_ingredients ON products USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_ingredients_concerns ON ingredients USING GIN(concerns);

-- Add missing UPDATE policy for skin_photos
CREATE POLICY "Users can update own photos" ON skin_photos FOR UPDATE 
  USING (auth.uid() = user_id);
```

### 8.2 Recommended Fixes (Test first)
```sql
-- Add admin role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add product-ingredient junction table
CREATE TABLE IF NOT EXISTS product_ingredients (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, ingredient_id)
);

-- Add constraints
ALTER TABLE ingredients ADD CONSTRAINT chk_concentration_range 
  CHECK (min_concentration IS NULL OR max_concentration IS NULL OR min_concentration <= max_concentration);

ALTER TABLE user_skin_profiles ADD CONSTRAINT chk_sleep_hours 
  CHECK (sleep_hours_avg IS NULL OR (sleep_hours_avg >= 0 AND sleep_hours_avg <= 24));
```

---

## 9. Action Items

### Priority: High 🔴
1. [ ] Add missing indexes on foreign keys
2. [ ] Add RLS UPDATE policy for skin_photos
3. [ ] Add admin role and restrict product/ingredient modifications

### Priority: Medium 🟡
4. [ ] Create product-ingredient junction table
5. [ ] Add check constraints for data validation
6. [ ] Add GIN indexes for array columns
7. [ ] Update products table: add admin-only write policies

### Priority: Low 🟢
8. [ ] Consider partitioning for skin_log_entries (when data grows)
9. [ ] Add missing columns (phone, timezone, metadata)
10. [ ] Create missing tables for future features

---

## 10. Overall Assessment

| Category | Score | Notes |
|----------|-------|-------|
| **Schema Design** | 8/10 | Good normalization, proper types |
| **Indexes** | 6/10 | Missing critical FK indexes |
| **RLS Policies** | 7/10 | Good coverage, missing admin controls |
| **Constraints** | 7/10 | Good CHECK constraints, missing data validation |
| **Scalability** | 7/10 | Ready for growth with minor adjustments |
| **Security** | 7/10 | Good user isolation, missing admin controls |

**Overall: 7/10** — Solid foundation, needs optimization for production scale.

---

*Report generated by SKINgenius-Dev (che-dev agent)*
*Next review recommended: After implementing high-priority fixes*
