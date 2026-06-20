-- Migration: Treatment Tracker + Appointments + Procedure Cards + Achievements + Insights
-- Date: 2026-06-09
-- App: SKINgenius (React Native + Expo)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────
-- 1. Treatment Categories
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS treatment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: treatment categories
INSERT INTO treatment_categories (name, icon, sort_order) VALUES
  ('Injectables', '💉', 1),
  ('Laser', '🔆', 2),
  ('Body', '🧘', 3),
  ('Skincare', '✨', 4),
  ('Supplements', '💊', 5),
  ('GLP-1', '📉', 6),
  ('Wellness', '🍃', 7)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────
-- 2. Treatments
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES treatment_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  brand TEXT,
  provider_name TEXT,
  provider_location TEXT,
  treatment_date DATE NOT NULL,
  cost DECIMAL(10,2),
  notes TEXT,
  follow_up_date DATE,
  follow_up_reminder BOOLEAN DEFAULT false,
  satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5),
  side_effects TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────
-- 3. Treatment Photos
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS treatment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at TIMESTAMPTZ,
  body_area TEXT,
  lighting_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────
-- 4. Treatment Reminders
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS treatment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('follow_up', 'retreatment', 'check_in')),
  reminder_date DATE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────
-- 5. Appointments
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_location TEXT,
  provider_phone TEXT,
  provider_email TEXT,
  appointment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled', 'no_show')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  notes TEXT,
  follow_up_notes TEXT,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────
-- 6. Procedure Cards
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS procedure_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  mechanism_of_action TEXT,
  prep_guidance TEXT,
  recovery_timeline TEXT,
  downtime_days INT,
  pain_level TEXT,
  cost_range TEXT,
  results_duration TEXT,
  complications JSONB,
  red_flag_symptoms TEXT[],
  faqs JSONB,
  contraindications TEXT[],
  ideal_candidates TEXT,
  alternatives TEXT[],
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: procedure cards (10+)
INSERT INTO procedure_cards (
  slug, name, category, summary, mechanism_of_action, prep_guidance, recovery_timeline,
  downtime_days, pain_level, cost_range, results_duration, complications, red_flag_symptoms,
  faqs, contraindications, ideal_candidates, alternatives, image_url
) VALUES
(
  'botox',
  'Botox Cosmetic',
  'Injectables',
  'Botulinum toxin type A that temporarily relaxes muscles to smooth wrinkles, commonly used for forehead lines, crow''s feet, and frown lines.',
  'Blocks nerve signals to muscles, preventing contraction. Results appear gradually as the muscle activity reduces.',
  'Avoid blood thinners, alcohol, and intense exercise for 24 hours before. No facial massages 3 days prior.',
  'Day 1-3: slight redness/bruising. Day 4-7: results begin. Day 14: full effect.',
  0,
  'Minimal',
  '$300 - $600 per area',
  '3 - 4 months',
  '[{"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If persistent >1 week"}, {"name": "Eyelid ptosis", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "Immediately if drooping interferes with vision"}]',
  ARRAY['Asymmetry', 'Difficulty breathing or swallowing', 'Drooping eyelid', 'Severe headache'],
  '[{"question": "When will I see results?", "answer": "Results typically begin 3-4 days post-injection and peak at 2 weeks."}, {"question": "Can I exercise after?", "answer": "Avoid strenuous exercise for 24 hours to minimize bruising and migration."}]',
  ARRAY['Pregnancy or breastfeeding', 'Neuromuscular disorders (e.g., ALS, myasthenia gravis)', 'Infection at injection site'],
  'Adults seeking to reduce dynamic wrinkles caused by muscle movement; best for moderate to severe lines.',
  ARRAY['Dysport', 'Xeomin', 'Daxxify'],
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
),
(
  'dysport',
  'Dysport',
  'Injectables',
  'A botulinum toxin similar to Botox with a slightly faster onset and more diffusion; ideal for larger areas like the forehead.',
  'Same mechanism as Botox—blocks acetylcholine release at the neuromuscular junction to relax muscles.',
  'Avoid alcohol and NSAIDs 24 hours before. No facials or massages 3 days prior.',
  'Day 1-3: injection site reactions. Day 2-5: onset of effect. Day 14: full results.',
  0,
  'Minimal',
  '$250 - $500 per area',
  '3 - 4 months',
  '[{"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If >1 week"}, {"name": "Headache", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If persistent >48 hours"}]',
  ARRAY['Spread to unintended muscles', 'Excessive weakness', 'Vision changes'],
  '[{"question": "Dysport vs Botox?", "answer": "Dysport may act faster and spread more—useful for broad areas. Units are not 1:1 interchangeable."}]',
  ARRAY['Pregnancy or breastfeeding', 'Neuromuscular disease', 'Allergy to cow''s milk protein'],
  'Patients wanting quicker onset for forehead or crow''s feet lines.',
  ARRAY['Botox', 'Xeomin'],
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
),
(
  'juvederm',
  'Juvederm (Hyaluronic Acid Fillers)',
  'Injectables',
  'Hyaluronic acid-based dermal fillers that restore volume, smooth lines, and enhance lips and cheeks.',
  'Attracts water to the injected area to plump tissue and smooth wrinkles or enhance contours.',
  'Avoid alcohol, NSAIDs, and supplements like fish oil 3 days prior to reduce bruising.',
  'Day 1: swelling/bruising. Day 2-7: settling. Day 14: final results.',
  0,
  'Moderate',
  '$600 - $1,200 per syringe',
  '6 - 18 months (product dependent)',
  '[{"name": "Bruising/swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal, resolves in 1-2 weeks"}, {"name": "Vascular occlusion", "likelihood": "Rare", "severity": "Severe", "when_to_seek_help": "IMMEDIATELY—skin blanching, severe pain, vision changes"}]',
  ARRAY['Severe pain', 'Skin turning white/gray', 'Vision loss or changes', 'Lumps that do not soften after 2 weeks'],
  '[{"question": "How long does it last?", "answer": "Voluma (cheek) up to 2 years; Volbella (lip) ~1 year; Vollure (nasolabial) ~18 months."}, {"question": "Is it reversible?", "answer": "Yes—hyaluronidase can dissolve HA fillers if needed."}]',
  ARRAY['Pregnancy or breastfeeding', 'History of severe allergies or anaphylaxis', 'Active infection near injection site'],
  'Adults seeking volume restoration, lip enhancement, or wrinkle reduction.',
  ARRAY['Restylane', 'RHA Collection', 'Sculptra'],
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
),
(
  'coolsculpting',
  'CoolSculpting Elite (Cryolipolysis)',
  'Body',
  'Non-invasive fat-reduction treatment that freezes and eliminates stubborn fat cells via controlled cooling.',
  'Cryolipolysis cools fat cells to a temperature that triggers apoptosis (cell death) without damaging surrounding tissue. Dead cells are naturally cleared by the body over weeks.',
  'Maintain a stable weight. Avoid anti-inflammatory meds if possible (they may reduce efficacy). Ensure the target area has enough pinchable fat.',
  'Day 1: numbness, redness, swelling. Week 1-4: gradual changes. Month 2-3: peak visible results.',
  0,
  'Moderate',
  '$2,000 - $4,000 per area',
  'Permanent (fat cells destroyed)',
  '[{"name": "Paradoxical adipose hyperplasia (PAH)", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If treated area enlarges instead of shrinking—surgical correction may be needed"}, {"name": "Numbness", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Usually resolves within weeks to months"}]',
  ARRAY['Increasing firmness/lump', 'Severe or worsening pain after 2 weeks', 'Significant asymmetry'],
  '[{"question": "How many sessions?", "answer": "Most areas benefit from 1-2 sessions spaced 6-8 weeks apart."}, {"question": "Does it hurt?", "answer": "Intense cold and suction for first 5-10 minutes, then numbness. Post-treatment massage can be uncomfortable."}]',
  ARRAY['Cryoglobulinemia', 'Paroxysmal cold hemoglobinuria', 'Cold agglutinin disease', 'Poorly controlled Raynaud''s', 'Pregnancy', 'Hernia in treatment area'],
  'Healthy adults near ideal body weight with localized stubborn fat resistant to diet/exercise.',
  ARRAY['Liposuction', 'Kybella (submental)', 'Emsculpt Neo'],
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
),
(
  'chemical-peel',
  'Chemical Peel (Medium - TCA)',
  'Skincare',
  'A controlled chemical exfoliation using trichloroacetic acid to improve texture, pigmentation, and fine lines.',
  'TCA denatures epidermal proteins, causing controlled peeling. Depth depends on concentration and skin prep.',
  'Pre-treat with retinoids or bleaching agents as directed. Avoid sun exposure and waxing 1 week prior.',
  'Day 1-3: tight, bronzed skin. Day 3-7: active peeling. Day 7-14: new skin revealed.',
  3,
  'Moderate to Significant',
  '$500 - $1,500',
  'Months to years (with sun protection)',
  '[{"name": "Post-inflammatory hyperpigmentation (PIH)", "likelihood": "Moderate in darker skin", "severity": "Moderate", "when_to_seek_help": "If darkening persists >2 months"}, {"name": "Scarring", "likelihood": "Rare", "severity": "Severe", "when_to_seek_help": "If textural changes or raised areas appear"}]',
  ARRAY['Severe burning not relieved by cool compress', 'Signs of infection (pus, fever)', 'Worsening redness after day 7', 'Fever or chills'],
  '[{"question": "How long is downtime?", "answer": "Medium-depth TCA peels typically require 5-7 days of visible peeling and up to 2 weeks for full social recovery."}, {"question": "How often can I do this?", "answer": "Medium peels: every 3-6 months. Deep peels: once every few years."}]',
  ARRAY['Active cold sores or herpes simplex (without prophylaxis)', 'Pregnancy or breastfeeding', 'Isotretinoin use within 6 months', 'Compromised immune system'],
  'Patients with sun damage, actinic keratoses, or moderate photoaging seeking rejuvenation.',
  ARRAY['Laser resurfacing', 'Microneedling', 'Topical retinoids'],
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'
),
(
  'microneedling',
  'Microneedling (Collagen Induction Therapy)',
  'Skincare',
  'A minimally invasive treatment using fine needles to create micro-injuries, stimulating collagen and elastin production.',
  'Controlled micro-injuries trigger the wound-healing cascade—release of growth factors → new collagen and elastin synthesis.',
  'Avoid retinoids and exfoliants 3-5 days prior. Stay well-hydrated. No sunburn or active breakouts.',
  'Day 1: redness like sunburn. Day 2-3: mild swelling, dryness. Day 4-7: glowing, improving texture.',
  1,
  'Moderate',
  '$300 - $700 per session',
  '3 - 6 months (series recommended)',
  '[{"name": "Pinpoint bleeding", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Stops quickly after treatment"}, {"name": "Infection", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If redness, warmth, pus develop after 48 hours"}]',
  ARRAY['Severe or spreading redness after 3 days', 'Pus or yellow crusting', 'Fever', 'Worsening pain'],
  '[{"question": "How many sessions for acne scars?", "answer": "Typically 3-6 sessions spaced 4-6 weeks apart for best results on atrophic scars."}, {"question": "Can I wear makeup after?", "answer": "Wait 24 hours; mineral makeup is safest if needed sooner."}]',
  ARRAY['Active skin infection or acne', 'Keloid tendency', 'Blood clotting disorders', 'Pregnancy (relative)'],
  'Patients with acne scars, fine lines, enlarged pores, or overall texture concerns.',
  ARRAY['Laser resurfacing', 'Chemical peels', 'RF microneedling (Morpheus8)'],
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'
),
(
  'hydrafacial',
  'HydraFacial',
  'Skincare',
  'A multi-step facial combining cleansing, exfoliation, extraction, hydration, and antioxidant infusion in one session.',
  'Vortex-Fusion technology delivers serums while simultaneously extracting impurities and dead skin cells.',
  'No special prep needed. Avoid heavy makeup the day of. Disclose any allergies to skincare ingredients.',
  'Immediate glow with no downtime. Results peak for 3-5 days post-treatment.',
  0,
  'Minimal',
  '$150 - $350 per session',
  '5 - 7 days',
  '[{"name": "Breakout", "likelihood": "Occasional", "severity": "Mild", "when_to_seek_help": "Usually resolves in a few days; contact provider if cystic"}]',
  ARRAY['Severe allergic reaction during treatment', 'Persistent rash >1 week'],
  '[{"question": "How often should I get one?", "answer": "Monthly is ideal for maintenance; weekly for an event-ready glow."}, {"question": "Is it safe for all skin types?", "answer": "Yes—it is customizable for sensitive, oily, dry, and acne-prone skin."}]',
  ARRAY['Active sunburn', 'Open wounds or rashes on face', 'Severe rosacea flare (relative)'],
  'All skin types wanting immediate hydration, glow, and gentle resurfacing without downtime.',
  ARRAY['Traditional facial', 'Microdermabrasion', 'Oxygen facial'],
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'
),
(
  'fraxel',
  'Fraxel (Fractional Laser Resurfacing)',
  'Laser',
  'A fractional non-ablative or ablative laser that creates microscopic treatment zones to resurface skin and stimulate collagen.',
  'Laser energy creates controlled microthermal zones, leaving surrounding tissue intact for rapid healing while triggering collagen remodeling.',
  'Avoid sun and tanning for 2-4 weeks prior. Stop retinoids 1 week before. Antiviral prophylaxis if history of cold sores.',
  'Day 1-2: redness, swelling, bronzed appearance. Day 3-5: rough sandpaper texture. Day 5-7: flaking and revealing new skin.',
  3,
  'Moderate to Significant',
  '$1,000 - $2,500 per session',
  '1 - 2 years',
  '[{"name": "Prolonged redness", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If >2 weeks or accompanied by pain"}, {"name": "Post-inflammatory hyperpigmentation", "likelihood": "Moderate in darker skin", "severity": "Moderate", "when_to_seek_help": "If persistent >3 months"}]',
  ARRAY['Severe pain not controlled by prescribed meds', 'Signs of infection', 'Blistering or oozing after day 3', 'Vision changes (if treated near eyes)'],
  '[{"question": "How many sessions?", "answer": "Non-ablative: 3-5 sessions. Ablative: often 1 session with longer downtime."}, {"question": "Can I wear makeup?", "answer": "Mineral makeup after 24-48 hours for non-ablative; 1-2 weeks for ablative."}]',
  ARRAY['Active infection or cold sore', 'Pregnancy or breastfeeding', 'Recent isotretinoin (within 6 months)', 'History of keloid formation'],
  'Patients with acne scars, fine lines, pigmentation, or sun-damaged skin willing to accept downtime.',
  ARRAY['CO2 laser', 'Microneedling RF', 'Chemical peel'],
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800'
),
(
  'sculptra',
  'Sculptra (Poly-L-lactic Acid)',
  'Injectables',
  'A biostimulatory injectable that gradually restores facial volume by stimulating your body''s own collagen production.',
  'PLLA microparticles trigger a controlled inflammatory response, recruiting fibroblasts to produce new collagen over months.',
  'Massage treated areas 5 minutes, 5 times daily for 5 days (the 5-5-5 rule). Avoid excessive sun/UV exposure.',
  'Week 1-2: mild swelling, bruising. Month 1-2: subtle volume increase. Month 3-6: progressive improvement.',
  0,
  'Moderate',
  '$800 - $1,500 per vial (typically 2-3 vials)',
  '2+ years',
  '[{"name": "Nodules or papules", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If palpable lumps persist >2 weeks or are visible"}, {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Normal, resolves in 1-2 weeks"}]',
  ARRAY['Visible lumps or bumps after 1 month', 'Severe swelling or asymmetry', 'Signs of infection'],
  '[{"question": "How soon will I see results?", "answer": "Initial swelling subsides in days; true collagen build takes 6-12 weeks. Full results at 3-6 months."}, {"question": "How is this different from HA fillers?", "answer": "Sculptra stimulates your own collagen rather than adding volume directly. Results are gradual and longer-lasting."}]',
  ARRAY['Pregnancy or breastfeeding', 'Active infection or inflammation at injection site', 'History of keloid formation'],
  'Patients seeking gradual, natural-looking volume restoration for temples, cheeks, or jawline.',
  ARRAY['Hyaluronic acid fillers', 'Radiesse', 'Fat transfer'],
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
),
(
  'laser-hair-removal',
  'Laser Hair Removal',
  'Laser',
  'A laser treatment that targets melanin in hair follicles to permanently reduce unwanted hair growth.',
  'Laser energy is absorbed by melanin in the hair shaft, heating and destroying the follicle while cooling protects the skin.',
  'Shave the area 24 hours before. Avoid waxing, plucking, or sun exposure 2-4 weeks prior. No self-tanner.',
  'Day 1-3: redness and perifollicular edema (like goosebumps). Shedding begins over 1-3 weeks.',
  0,
  'Minimal',
  '$200 - $500 per session',
  'Permanent reduction (maintenance may be needed)',
  '[{"name": "Burns or blistering", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "Immediately if blistering or pigment changes occur"}, {"name": "Paradoxical hair growth", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If fine hair becomes thicker/coarser in treated area"}]',
  ARRAY['Severe blistering or crusting', 'Signs of infection', 'Significant pigment change'],
  '[{"question": "How many sessions?", "answer": "Usually 6-8 sessions spaced 4-8 weeks apart depending on body area and hair type."}, {"question": "Does it work for all hair/skin types?", "answer": "Best for dark hair on light skin. Modern lasers (Nd:YAG) can treat darker skin safely. Blonde/gray hair is challenging."}]',
  ARRAY['Pregnancy or breastfeeding', 'Active infection or open wounds in area', 'Recent tanning or sunburn', 'History of photosensitivity disorders'],
  'Patients wanting permanent reduction of unwanted hair on face or body.',
  ARRAY['Electrolysis', 'IPL (Intense Pulsed Light)'],
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800'
)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────
-- 7. Procedure Bookmarks
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS procedure_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES procedure_cards(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- ─────────────────────────────
-- 8. Achievements
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  threshold INT DEFAULT 1,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: achievements (15-20)
INSERT INTO achievements (slug, name, description, icon, category, threshold, points) VALUES
  ('first_scan', 'First Scan', 'Completed your first AI skin scan', '📱', 'tracking', 1, 10),
  ('first_treatment', 'Treatment Pro', 'Logged your first aesthetic treatment', '💉', 'tracking', 1, 15),
  ('ten_treatments', 'Treatment Veteran', 'Logged 10 treatments in your history', '📋', 'tracking', 10, 50),
  ('photo_pro', 'Photo Pro', 'Uploaded 50 progress photos', '📸', 'tracking', 50, 40),
  ('seven_day_streak', '7-Day Streak', 'Used SKINgenius for 7 consecutive days', '🔥', 'consistency', 7, 20),
  ('thirty_day_streak', 'Consistency Queen', 'Used SKINgenius for 30 consecutive days', '👑', 'consistency', 30, 100),
  ('weekly_scanner', 'Weekly Scanner', 'Completed a skin scan every week for a month', '📅', 'consistency', 4, 30),
  ('monthly_checkin', 'Monthly Check-in', 'Logged a treatment or scan every month for 6 months', '🗓️', 'consistency', 6, 60),
  ('read_ten_cards', 'Skin Scholar', 'Read 10 procedure cards', '📚', 'knowledge', 10, 25),
  ('bookmark_five', 'Treatment Researcher', 'Bookmarked 5 procedure cards', '🔖', 'knowledge', 5, 20),
  ('ingredient_expert', 'Ingredient Expert', 'Analyzed 20 ingredients', '🔬', 'knowledge', 20, 35),
  ('six_month_journey', '6-Month Journey', 'Active on SKINgenius for 6 months', '🌱', 'milestones', 1, 50),
  ('one_year_anniversary', 'One Year Strong', 'Celebrated one year with SKINgenius', '🎂', 'milestones', 1, 100),
  ('one_k_invested', '$1K Invested', 'Tracked $1,000 in treatment spending', '💰', 'milestones', 1000, 40),
  ('five_providers', 'Provider Explorer', 'Tried 5 different providers', '🏥', 'milestones', 5, 30),
  ('improvement_detected', 'Glowing Up', 'AI detected measurable skin improvement', '✨', 'skin_health', 1, 25),
  ('skin_age_reduced', 'Turning Back Time', 'Reduced your estimated skin age', '⏳', 'skin_health', 1, 50),
  ('condition_cleared', 'Condition Cleared', 'Tracked a skin condition to resolution', '🎯', 'skin_health', 1, 35)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────
-- 9. User Achievements
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  progress INT DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- ─────────────────────────────
-- 10. Aesthetic Insights
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS aesthetic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'recommendation', 'milestone', 'comparison')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────
-- Indexes
-- ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_treatments_user_id ON treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_treatments_treatment_date ON treatments(treatment_date DESC);
CREATE INDEX IF NOT EXISTS idx_treatments_category_id ON treatments(category_id);

CREATE INDEX IF NOT EXISTS idx_treatment_photos_user_id ON treatment_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_photos_treatment_id ON treatment_photos(treatment_id);

CREATE INDEX IF NOT EXISTS idx_treatment_reminders_user_id ON treatment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_reminders_reminder_date ON treatment_reminders(reminder_date);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_procedure_cards_category ON procedure_cards(category);
CREATE INDEX IF NOT EXISTS idx_procedure_cards_slug ON procedure_cards(slug);

CREATE INDEX IF NOT EXISTS idx_procedure_bookmarks_user_id ON procedure_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_aesthetic_insights_user_id ON aesthetic_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_aesthetic_insights_created_at ON aesthetic_insights(created_at DESC);

-- ─────────────────────────────
-- Updated-at triggers
-- ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_cards_updated_at
  BEFORE UPDATE ON procedure_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────
-- RLS Policies
-- ─────────────────────────────
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_insights ENABLE ROW LEVEL SECURITY;

-- Note: procedure_cards and achievements are global read-only reference tables.
-- They do NOT have RLS (anyone can read), but only admins insert/update.

-- treatments: users see only their own
CREATE POLICY treatments_select_own
  ON treatments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY treatments_insert_own
  ON treatments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY treatments_update_own
  ON treatments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY treatments_delete_own
  ON treatments FOR DELETE
  USING (user_id = auth.uid());

-- treatment_photos: users see only their own
CREATE POLICY treatment_photos_select_own
  ON treatment_photos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY treatment_photos_insert_own
  ON treatment_photos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY treatment_photos_update_own
  ON treatment_photos FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY treatment_photos_delete_own
  ON treatment_photos FOR DELETE
  USING (user_id = auth.uid());

-- treatment_reminders: users see only their own
CREATE POLICY treatment_reminders_select_own
  ON treatment_reminders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY treatment_reminders_insert_own
  ON treatment_reminders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY treatment_reminders_update_own
  ON treatment_reminders FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY treatment_reminders_delete_own
  ON treatment_reminders FOR DELETE
  USING (user_id = auth.uid());

-- appointments: users see only their own
CREATE POLICY appointments_select_own
  ON appointments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY appointments_insert_own
  ON appointments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY appointments_update_own
  ON appointments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY appointments_delete_own
  ON appointments FOR DELETE
  USING (user_id = auth.uid());

-- procedure_bookmarks: users see only their own
CREATE POLICY procedure_bookmarks_select_own
  ON procedure_bookmarks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY procedure_bookmarks_insert_own
  ON procedure_bookmarks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY procedure_bookmarks_update_own
  ON procedure_bookmarks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY procedure_bookmarks_delete_own
  ON procedure_bookmarks FOR DELETE
  USING (user_id = auth.uid());

-- user_achievements: users see only their own
CREATE POLICY user_achievements_select_own
  ON user_achievements FOR SELECT
  USING (user_id = auth.uid());

-- user_achievements are typically system-generated, but allow insert for triggers
CREATE POLICY user_achievements_insert_own
  ON user_achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_achievements_update_own
  ON user_achievements FOR UPDATE
  USING (user_id = auth.uid());

-- aesthetic_insights: users see only their own
CREATE POLICY aesthetic_insights_select_own
  ON aesthetic_insights FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY aesthetic_insights_insert_own
  ON aesthetic_insights FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY aesthetic_insights_update_own
  ON aesthetic_insights FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY aesthetic_insights_delete_own
  ON aesthetic_insights FOR DELETE
  USING (user_id = auth.uid());

-- ─────────────────────────────
-- Admin-only policies for procedure_cards and achievements
-- ─────────────────────────────
-- procedure_cards: readable by everyone, writable only by admin (service role)
-- achievements: readable by everyone, writable only by admin (service role)
-- No RLS on these tables = all authenticated users can SELECT.
-- Writes should go through service-role key or admin functions.

-- ─────────────────────────────
-- End of migration
-- ─────────────────────────────
