-- Seed: Achievements (003_achievements.sql)
-- 20 gamification achievements for the SKINgenius platform
-- Idempotent: ON CONFLICT (slug) DO NOTHING

INSERT INTO achievements (
  id,
  slug,
  name,
  description,
  icon,
  category,
  threshold,
  points
) VALUES

-- ========================
-- TRACKING (5)
-- ========================

(
  gen_random_uuid(),
  'first_scan',
  'First Scan',
  'Complete your first skin scan.',
  'scan-line',
  'tracking',
  1,
  10
),

(
  gen_random_uuid(),
  'first_treatment',
  'Treatment Pioneer',
  'Log your first treatment.',
  'medical-services-line',
  'tracking',
  1,
  10
),

(
  gen_random_uuid(),
  'treatment_collector',
  'Treatment Collector',
  'Log 10 treatments.',
  'archive-line',
  'tracking',
  10,
  50
),

(
  gen_random_uuid(),
  'photo_pro',
  'Photo Pro',
  'Upload 50 photos.',
  'camera-line',
  'tracking',
  50,
  100
),

(
  gen_random_uuid(),
  'appointment_keeper',
  'Appointment Keeper',
  'Complete 5 appointments.',
  'calendar-check-line',
  'tracking',
  5,
  30
),

-- ========================
-- CONSISTENCY (5)
-- ========================

(
  gen_random_uuid(),
  'week_streak',
  'Week Warrior',
  'Maintain a 7-day tracking streak.',
  'fire-line',
  'consistency',
  7,
  25
),

(
  gen_random_uuid(),
  'month_streak',
  'Monthly Maven',
  'Maintain a 30-day tracking streak.',
  'calendar-star-line',
  'consistency',
  30,
  100
),

(
  gen_random_uuid(),
  'weekly_scanner',
  'Weekly Scanner',
  'Scan once per week for 4 consecutive weeks.',
  'scan-line',
  'consistency',
  4,
  30
),

(
  gen_random_uuid(),
  'monthly_checkin',
  'Monthly Check-in',
  'Log a treatment every month for 3 consecutive months.',
  'calendar-event-line',
  'consistency',
  3,
  40
),

(
  gen_random_uuid(),
  'routine_rockstar',
  'Routine Rockstar',
  'Follow your skincare routine for 14 days straight.',
  'star-smile-line',
  'consistency',
  14,
  50
),

-- ========================
-- KNOWLEDGE (4)
-- ========================

(
  gen_random_uuid(),
  'skin_scholar',
  'Skin Scholar',
  'Read 10 procedure cards.',
  'book-open-line',
  'knowledge',
  10,
  20
),

(
  gen_random_uuid(),
  'bookmark_collector',
  'Bookmark Collector',
  'Bookmark 5 procedures.',
  'bookmark-line',
  'knowledge',
  5,
  15
),

(
  gen_random_uuid(),
  'ingredient_expert',
  'Ingredient Expert',
  'Check 20 ingredients.',
  'flask-line',
  'knowledge',
  20,
  30
),

(
  gen_random_uuid(),
  'comparison_queen',
  'Comparison Queen',
  'Compare 3 treatments side-by-side.',
  'git-pull-request-line',
  'knowledge',
  3,
  20
),

-- ========================
-- MILESTONES (4)
-- ========================

(
  gen_random_uuid(),
  'six_month_journey',
  '6-Month Journey',
  'Track your skin health for 6 months.',
  'time-line',
  'milestones',
  180,
  150
),

(
  gen_random_uuid(),
  'one_year_anniversary',
  'One Year Anniversary',
  'Track your skin health for 1 year.',
  'cake-line',
  'milestones',
  365,
  300
),

(
  gen_random_uuid(),
  'big_spender',
  'Investment in Self',
  'Spend $1,000 or more on treatments.',
  'money-dollar-circle-line',
  'milestones',
  1000,
  50
),

(
  gen_random_uuid(),
  'provider_explorer',
  'Provider Explorer',
  'Visit 3 or more different providers.',
  'map-pin-line',
  'milestones',
  3,
  25
),

-- ========================
-- SKIN HEALTH (2)
-- ========================

(
  gen_random_uuid(),
  'improvement_detected',
  'Progress!',
  'AI detects improvement in a photo comparison.',
  'trending-up-line',
  'skin_health',
  1,
  50
),

(
  gen_random_uuid(),
  'skin_age_improved',
  'Age Defier',
  'Skin age improves by 1 or more years.',
  'flower-line',
  'skin_health',
  1,
  100
)
ON CONFLICT (slug) DO NOTHING;
