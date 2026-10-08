-- Clinical Scan Escalation Flow — Database additions
-- Created: 2026-09-15

-- ============================================
-- CLINICAL REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.clinical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES public.skin_analyses(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'pending_review', 'in_review', 'complete', 'cancelled')),
  payment_intent_id TEXT,
  amount_cents INTEGER DEFAULT 4900,
  consent_hipaa BOOLEAN DEFAULT FALSE,
  consent_share BOOLEAN DEFAULT FALSE,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescription_name TEXT,
  prescription_dosage TEXT,
  prescription_instructions TEXT,
  provider_referrals JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard queue queries
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_status ON public.clinical_reviews(status);
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_user_id ON public.clinical_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_created_at ON public.clinical_reviews(created_at DESC);

-- ============================================
-- CLINICAL REVIEW PHOTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.clinical_review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinical_review_id UUID REFERENCES public.clinical_reviews(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT DEFAULT 'close_up' CHECK (photo_type IN ('close_up', 'original_scan')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_review_photos_review_id ON public.clinical_review_photos(clinical_review_id);

-- ============================================
-- RLS POLICIES (starter set — tighten for production)
-- ============================================

ALTER TABLE public.clinical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_review_photos ENABLE ROW LEVEL SECURITY;

-- Users can read their own reviews
CREATE POLICY IF NOT EXISTS clinical_reviews_select_own
  ON public.clinical_reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own reviews
CREATE POLICY IF NOT EXISTS clinical_reviews_insert_own
  ON public.clinical_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own reviews (limited to payment/cancellation flows)
CREATE POLICY IF NOT EXISTS clinical_reviews_update_own
  ON public.clinical_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Internal dermatologists can read all pending/complete reviews
CREATE POLICY IF NOT EXISTS clinical_reviews_select_internal
  ON public.clinical_reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Internal dermatologists can update all reviews
CREATE POLICY IF NOT EXISTS clinical_reviews_update_internal
  ON public.clinical_reviews
  FOR UPDATE
  TO authenticated
  USING (true);

-- Photo policies mirror review ownership
CREATE POLICY IF NOT EXISTS clinical_review_photos_select_own
  ON public.clinical_review_photos
  FOR SELECT
  TO authenticated
  USING (
    clinical_review_id IN (
      SELECT id FROM public.clinical_reviews WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS clinical_review_photos_select_internal
  ON public.clinical_review_photos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS clinical_review_photos_insert_own
  ON public.clinical_review_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    clinical_review_id IN (
      SELECT id FROM public.clinical_reviews WHERE user_id = auth.uid()
    )
  );
