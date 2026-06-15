-- ============================================================
-- Daily Protocol Persistence — 2026-06-15
-- Tracks per-day completion of wellness plan items
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wellness_plan_daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES public.wellness_plans(id) ON DELETE CASCADE NOT NULL,
  plan_item_id UUID REFERENCES public.wellness_plan_items(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','completed','skipped','partially_completed'
  )),
  completed_at TIMESTAMPTZ,
  skip_reason TEXT,
  user_notes TEXT,
  actual_dosage TEXT,       -- what they actually took/did (may differ from prescribed)
  actual_timing TEXT,       -- when they actually did it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One entry per plan item per day
  UNIQUE (plan_item_id, entry_date)
);

-- Indexes for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date
  ON public.wellness_plan_daily_entries (user_id, entry_date);

CREATE INDEX IF NOT EXISTS idx_daily_entries_plan_date
  ON public.wellness_plan_daily_entries (plan_id, entry_date);

-- Index for adherence queries (streaks, completion rates)
CREATE INDEX IF NOT EXISTS idx_daily_entries_status
  ON public.wellness_plan_daily_entries (user_id, entry_date, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_wellness_daily_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wellness_daily_entry_updated
  BEFORE UPDATE ON public.wellness_plan_daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_wellness_daily_entry_timestamp();

-- RLS
ALTER TABLE public.wellness_plan_daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily entries"
  ON public.wellness_plan_daily_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily entries"
  ON public.wellness_plan_daily_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily entries"
  ON public.wellness_plan_daily_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Adherence summary view (materialized later if slow)
CREATE OR REPLACE VIEW public.wellness_adherence_summary AS
SELECT
  user_id,
  plan_id,
  entry_date,
  COUNT(*) AS total_items,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_items,
  COUNT(*) FILTER (WHERE status = 'skipped') AS skipped_items,
  COUNT(*) FILTER (WHERE status = 'partially_completed') AS partial_items,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) AS completion_pct
FROM public.wellness_plan_daily_entries
GROUP BY user_id, plan_id, entry_date;
