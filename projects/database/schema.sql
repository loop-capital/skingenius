-- SKINgenius Database Schema
-- PostgreSQL schema for skincare intelligence platform

-- Drop tables if they exist (for clean recreation)
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS condition_services CASCADE;
DROP TABLE IF EXISTS condition_products CASCADE;
DROP TABLE IF EXISTS condition_ingredients CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS skin_conditions CASCADE;
DROP TABLE IF EXISTS supplements CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

-- 1. Ingredients table
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    inci_name VARCHAR(255) NOT NULL UNIQUE,
    common_name VARCHAR(255),
    category VARCHAR(100),
    mechanism TEXT,
    evidence_tier VARCHAR(20), -- Strong, Moderate, Emerging, Limited
    effective_concentration VARCHAR(100),
    ph_requirements VARCHAR(100),
    conflicts TEXT,
    side_effects TEXT,
    contraindications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skin conditions table
CREATE TABLE skin_conditions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    medical_name VARCHAR(255),
    prevalence VARCHAR(100),
    pathophysiology TEXT,
    standard_treatment TEXT,
    red_flags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_line VARCHAR(100),
    price DECIMAL(10, 2),
    size VARCHAR(50), -- e.g., "50ml", "1.7 oz"
    ingredients_list TEXT, -- JSON array of ingredient IDs or comma-separated list for simplicity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Routines table
CREATE TABLE routines (
    id SERIAL PRIMARY KEY,
    user_skin_type VARCHAR(50), -- oily, dry, combination, sensitive, normal
    user_concerns TEXT, -- JSON array or comma-separated list of skin condition IDs
    am_steps TEXT, -- JSON array of product IDs for morning routine
    pm_steps TEXT, -- JSON array of product IDs for evening routine
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    service_type VARCHAR(100) NOT NULL, -- peel, microneedling, laser, etc.
    conditions_treated TEXT, -- JSON array of skin condition IDs
    evidence TEXT,
    cost_range VARCHAR(50), -- e.g., "$100-$300"
    downtime VARCHAR(100),
    risks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Service providers table
CREATE TABLE service_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    services_offered TEXT, -- JSON array of service IDs
    price_range VARCHAR(50),
    rating DECIMAL(3, 2), -- out of 5.0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Supplements table
CREATE TABLE supplements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dose VARCHAR(100),
    evidence_tier VARCHAR(20), -- Strong, Moderate, Emerging, Limited
    skin_conditions TEXT, -- JSON array of skin condition IDs
    conflicts TEXT,
    oral_vs_topical VARCHAR(20), -- 'oral', 'topical', 'both'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Condition ingredients junction table (many-to-many)
CREATE TABLE condition_ingredients (
    id SERIAL PRIMARY KEY,
    condition_id INTEGER REFERENCES skin_conditions(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    effectiveness_score INTEGER, -- 1-5 scale of how effective for this condition
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(condition_id, ingredient_id)
);

-- 9. Condition products junction table (many-to-many)
CREATE TABLE condition_products (
    id SERIAL PRIMARY KEY,
    condition_id INTEGER REFERENCES skin_conditions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    effectiveness_score INTEGER, -- 1-5 scale
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(condition_id, product_id)
);

-- 10. Condition services junction table (many-to-many)
CREATE TABLE condition_services (
    id SERIAL PRIMARY KEY,
    condition_id INTEGER REFERENCES skin_conditions(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    effectiveness_score INTEGER, -- 1-5 scale
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(condition_id, service_id)
);

-- 11. User profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    skin_type VARCHAR(50), -- oily, dry, combination, sensitive, normal
    concerns TEXT, -- JSON array of skin condition IDs
    sensitivities TEXT, -- JSON array of ingredient IDs to avoid
    medications TEXT, -- JSON array of medication names
    budget DECIMAL(10, 2), -- monthly skincare budget
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Recommendations table
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    routine_id INTEGER REFERENCES routines(id) ON DELETE SET NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- AI-generated explanation or notes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_ingredients_name ON ingredients(inci_name);
CREATE INDEX idx_skin_conditions_name ON skin_conditions(name);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_services_type ON services(service_type);
CREATE INDEX idx_service_providers_name ON service_providers(name);
CREATE INDEX idx_supplements_name ON supplements(name);
CREATE INDEX idx_user_profiles_skin_type ON user_profiles(skin_type);
CREATE INDEX idx_recommendations_user_profile ON recommendations(user_profile_id);
CREATE INDEX idx_recommendations_generated_at ON recommendations(generated_at);

-- Add comments to tables and columns
COMMENT ON TABLE ingredients IS 'Skincare ingredients with their properties';
COMMENT ON TABLE skin_conditions IS 'Various skin conditions and their characteristics';
COMMENT ON TABLE products IS 'Skincare products from various brands';
COMMENT ON TABLE routines IS 'Recommended skincare routines (AM/PM)';
COMMENT ON TABLE services IS 'Professional skincare services and treatments';
COMMENT ON TABLE service_providers IS 'Providers of professional skincare services';
COMMENT ON TABLE supplements IS 'Nutritional supplements with skin benefits';
COMMENT ON TABLE condition_ingredients IS 'Junction table linking conditions to effective ingredients';
COMMENT ON TABLE condition_products IS 'Junction table linking conditions to effective products';
COMMENT ON TABLE condition_services IS 'Junction table linking conditions to effective services';
COMMENT ON TABLE user_profiles IS 'User profiles storing skin type, concerns, etc.';
COMMENT ON TABLE recommendations IS 'Generated recommendations linked to user profiles';