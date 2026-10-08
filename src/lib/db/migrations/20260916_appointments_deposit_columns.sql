-- Migration: add Square deposit checkout columns to appointments
-- Created: 2026-09-16

-- Ensure provider_profiles mirrors GetUpLook structure with Square account id.
CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN (
    'esthetician',
    'injector_np_pa',
    'medical_esthetician',
    'dermatologist',
    'plastic_surgeon'
  )),
  business_name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website_url TEXT,
  email TEXT,
  square_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services mirror GetUpLook structure.
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment deposit/checkout columns.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS deposit_status TEXT NOT NULL DEFAULT 'pending' CHECK (deposit_status IN ('pending', 'pending_payment', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payout_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'skingenius' CHECK (platform IN ('skingenius', 'getuplook')),
  ADD COLUMN IF NOT EXISTS referral_id UUID,
  ADD COLUMN IF NOT EXISTS square_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS square_checkout_id TEXT;

-- Widen status to include pending_payment if not already present.
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no_show'));

-- Indexes.
CREATE INDEX IF NOT EXISTS idx_provider_profiles_square ON public.provider_profiles(square_account_id);
CREATE INDEX IF NOT EXISTS idx_services_provider ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_deposit_status ON public.appointments(deposit_status);
CREATE INDEX IF NOT EXISTS idx_appointments_referral ON public.appointments(referral_id);
CREATE INDEX IF NOT EXISTS idx_appointments_platform ON public.appointments(platform);
CREATE INDEX IF NOT EXISTS idx_appointments_square_checkout ON public.appointments(square_checkout_id);

-- RLS for new tables.
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Providers manage own profile" ON public.provider_profiles
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Anyone can view provider profiles" ON public.provider_profiles
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Providers manage own services" ON public.services
  FOR ALL USING (provider_id IN (
    SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
  )) WITH CHECK (provider_id IN (
    SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Anyone can view services" ON public.services
  FOR SELECT USING (true);
