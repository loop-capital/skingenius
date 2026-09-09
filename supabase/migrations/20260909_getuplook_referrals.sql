-- GetUpLook Referrals Integration
-- Run this SQL in your GetUpLook Supabase project (SQL Editor)
-- This creates the table that links SKINgenius scans to GetUpLook providers

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to SKINgenius scan/analysis (external UUID from SKINgenius DB)
  external_scan_id UUID,
  external_user_id UUID,
  
  -- Link to GetUpLook provider
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Skin analysis data shared with provider
  skin_conditions TEXT[], -- Array of detected conditions: acne, wrinkles, redness, etc.
  confidence_scores JSONB, -- { "acne": 0.92, "wrinkles": 0.78 }
  scan_metadata JSONB, -- Age estimate, skin type, image URL if available
  
  -- Service recommendations
  recommended_service_ids UUID[], -- Services matched from provider's offerings
  match_score DECIMAL(3,2), -- 0.00 to 1.00 confidence in provider match
  
  -- Referral status tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'booked', 'completed', 'expired')),
  viewed_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT, -- Provider notes after review
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_provider ON referrals(provider_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_external_scan ON referrals(external_scan_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_referrals_updated_at 
  BEFORE UPDATE ON referrals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'referrals';