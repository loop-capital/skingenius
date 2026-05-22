-- SKINgenius Database Schema
-- Project: cnzoilxsttoqtvwotexd.supabase.co
-- Created: 2026-05-13
-- Strategy: Separate instance, seeded from Basys pattern, specialized for skin

-- ============================================
-- AUTH & PROFILES (shared pattern with Basys)
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  skin_type TEXT CHECK (skin_type IN ('normal', 'dry', 'oily', 'combination', 'sensitive')),
  primary_concerns TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SKIN ANALYSIS
-- ============================================

-- Skin photos uploaded for analysis
CREATE TABLE IF NOT EXISTS public.skin_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('face_front', 'face_left', 'face_right', 'forehead', 'cheek', 'chin', 'nose', 'full_body', 'other')),
  body_region TEXT,
  lighting_condition TEXT DEFAULT 'natural',
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skin conditions detected by AI analysis
CREATE TABLE IF NOT EXISTS public.skin_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'acne', 'aging', 'pigmentation', 'sensitivity', 'hydration',
    'redness', 'texture', 'scarring', 'sun_damage', 'eczema',
    'psoriasis', 'rosacea', 'keratosis', 'other'
  )),
  description TEXT,
  severity_scale TEXT DEFAULT 'mild_moderate_severe',
  icd_code TEXT, -- ICD-10 code for medical reference
  requires_dermatologist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual analysis results (links photo to detected conditions)
CREATE TABLE IF NOT EXISTS public.skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES public.skin_photos(id) ON DELETE CASCADE NOT NULL,
  condition_id UUID REFERENCES public.skin_conditions(id) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  location_on_face TEXT,
  notes TEXT,
  ai_model TEXT DEFAULT 'mimo-v2-omni',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INGREDIENTS
-- ============================================

-- Ingredient reference database
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  inci_name TEXT, -- International Nomenclature of Cosmetic Ingredients
  category TEXT NOT NULL CHECK (category IN (
    'retinoid', 'aha', 'bha', 'vitamin', 'antioxidant', 'peptide',
    'humectant', 'emollient', 'occlusive', 'sunscreen', 'botanical',
    'preservative', 'fragrance', 'surfactant', 'other'
  )),
  description TEXT,
  evidence_level TEXT DEFAULT 'emerging' CHECK (evidence_level IN ('strong', 'moderate', 'emerging', 'limited')),
  pubmed_ids TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}', -- what it treats
  skin_types TEXT[] DEFAULT '{}', -- recommended skin types
  interactions TEXT[] DEFAULT '{}', -- ingredients it interacts with
  pregnancy_safe BOOLEAN,
  min_concentration DECIMAL(5,2), -- percentage
  max_concentration DECIMAL(5,2), -- percentage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS
-- ============================================

-- Product database
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'cleanser', 'moisturizer', 'serum', 'toner', 'exfoliant',
    'sunscreen', 'mask', 'eye_cream', 'treatment', 'supplement', 'other'
  )),
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  size TEXT, -- e.g., "30ml", "50g"
  image_url TEXT,
  ingredients TEXT[] DEFAULT '{}', -- list of ingredient names for quick lookup
  ingredient_ids UUID[] DEFAULT '{}', -- references to ingredients table
  skin_types TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  url TEXT, -- purchase URL
  is_clean BOOLEAN DEFAULT FALSE,
  is_cruelty_free BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_fragrance_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROUTINES
-- ============================================

-- User skin routines
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'evening', 'weekly', 'as_needed')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products in a routine (ordered steps)
CREATE TABLE IF NOT EXISTS public.routine_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  custom_product_name TEXT, -- for products not in database
  step_order INTEGER NOT NULL,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'twice_daily', 'weekly', 'biweekly', 'monthly', 'as_needed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER SKIN PROFILES & TRACKING
-- ============================================

-- User skin profile (evolves over time)
CREATE TABLE IF NOT EXISTS public.user_skin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  skin_type TEXT CHECK (skin_type IN ('normal', 'dry', 'oily', 'combination', 'sensitive')),
  skin_tone TEXT, -- Fitzpatrick scale I-VI
  primary_concerns TEXT[] DEFAULT '{}',
  secondary_concerns TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  sensitivities TEXT[] DEFAULT '{}',
  climate TEXT, -- humid, dry, temperate, cold
  water_hardness TEXT CHECK (water_hardness IN ('hard', 'soft', 'moderate')),
  sleep_hours_avg DECIMAL(3,1),
  hydration_level TEXT CHECK (hydration_level IN ('low', 'moderate', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily skin log entries
CREATE TABLE IF NOT EXISTS public.skin_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
  hydration_level INTEGER CHECK (hydration_level >= 1 AND hydration_level <= 10),
  redness_level INTEGER CHECK (redness_level >= 1 AND redness_level <= 10),
  breakout_level INTEGER CHECK (breakout_level >= 1 AND breakout_level <= 10),
  sensitivity_level INTEGER CHECK (sensitivity_level >= 1 AND sensitivity_level <= 10),
  notes TEXT,
  photo_url TEXT,
  products_used UUID[] DEFAULT '{}', -- product IDs used that day
  weather TEXT,
  sleep_hours DECIMAL(3,1),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- INGREDIENT REACTIONS (user-reported)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ingredient_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('positive', 'negative', 'neutral')),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ingredient_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_skin_photos_user ON public.skin_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_photos_status ON public.skin_photos(analysis_status);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user ON public.skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_photo ON public.skin_analyses(photo_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_condition ON public.skin_analyses(condition_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON public.ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_slug ON public.ingredients(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_routines_user ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_steps_routine ON public.routine_steps(routine_id);
CREATE INDEX IF NOT EXISTS idx_skin_log_user_date ON public.skin_log_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ingredient_reactions_user ON public.ingredient_reactions(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_reactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Skin photos: users can only access their own
CREATE POLICY "Users can view own photos" ON public.skin_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photos" ON public.skin_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.skin_photos FOR DELETE USING (auth.uid() = user_id);

-- Skin conditions: public read (reference data)
CREATE POLICY "Anyone can view conditions" ON public.skin_conditions FOR SELECT USING (true);

-- Skin analyses: users can only access their own
CREATE POLICY "Users can view own analyses" ON public.skin_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.skin_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ingredients: public read (reference data)
CREATE POLICY "Anyone can view ingredients" ON public.ingredients FOR SELECT USING (true);

-- Products: public read, admin write
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Routines: users can only access their own
CREATE POLICY "Users can view own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- Routine steps: via routine ownership
CREATE POLICY "Users can view own routine steps" ON public.routine_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_steps.routine_id AND routines.user_id = auth.uid())
);
CREATE POLICY "Users can insert own routine steps" ON public.routine_steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_steps.routine_id AND routines.user_id = auth.uid())
);
CREATE POLICY "Users can update own routine steps" ON public.routine_steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_steps.routine_id AND routines.user_id = auth.uid())
);
CREATE POLICY "Users can delete own routine steps" ON public.routine_steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_steps.routine_id AND routines.user_id = auth.uid())
);

-- User skin profiles: users can only access their own
CREATE POLICY "Users can view own skin profile" ON public.user_skin_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skin profile" ON public.user_skin_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skin profile" ON public.user_skin_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Skin log entries: users can only access their own
CREATE POLICY "Users can view own log entries" ON public.skin_log_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own log entries" ON public.skin_log_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own log entries" ON public.skin_log_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own log entries" ON public.skin_log_entries FOR DELETE USING (auth.uid() = user_id);

-- Ingredient reactions: users can only access their own
CREATE POLICY "Users can view own reactions" ON public.ingredient_reactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reactions" ON public.ingredient_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.ingredient_reactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Skin photo storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('skin-photos', 'skin-photos', false) ON CONFLICT DO NOTHING;

-- Storage policy: users can only upload/read their own photos
CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'skin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'skin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'skin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);