# Aesthetic Journey-Inspired Feature Spec — SKINgenius

> **Date:** 2026-06-09
> **Source:** Competitive analysis of Aesthetic Journey (pre-launch 2026, iOS)
> **Author:** Che 🧬
> **Status:** SPEC — Ready for review

---

## Context

Aesthetic Journey is a pre-launch iOS app built by a PA with 19 years in aesthetics. Patient-owned (not clinic-owned) — same model as SKINgenius. They're building treatment tracking + education for aesthetic patients. We analyzed 6 core features and identified 4 we should build.

**SKINgenius already has:** AI skin analysis, ingredient analysis, routine building
**We're adding:** Treatment history tracker, procedure cards, photo journal, treatment logging

---

## Feature 1: Treatment History Tracker

### What It Does
Track every aesthetic treatment a patient has ever received — injectables, lasers, body treatments, skincare routines, GLP-1 therapy, supplements. Full history with notes, costs, provider details, and follow-up reminders.

### Data Model

```sql
-- Treatment categories
CREATE TABLE treatment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Injectables', 'Laser', 'Body', 'Skincare', 'Supplements', 'GLP-1'
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual treatments
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES treatment_categories(id),
  name TEXT NOT NULL, -- 'Botox - Forehead', 'CoolSculpting - Abdomen'
  brand TEXT, -- 'Allergan', 'Galderma', 'Juvederm'
  provider_name TEXT,
  provider_location TEXT,
  treatment_date DATE NOT NULL,
  cost DECIMAL(10,2),
  notes TEXT,
  follow_up_date DATE,
  follow_up_reminder BOOLEAN DEFAULT false,
  satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5),
  side_effects TEXT,
  photos_before UUID[], -- references to treatment_photos
  photos_after UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Treatment photos (linked to specific treatments)
CREATE TABLE treatment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at TIMESTAMPTZ,
  body_area TEXT,
  lighting_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Follow-up reminders
CREATE TABLE treatment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN ('follow_up', 'retreatment', 'check_in')),
  reminder_date DATE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/treatments` | Log a new treatment |
| `GET` | `/api/v1/treatments` | List user's treatments (paginated, filterable by category/date) |
| `GET` | `/api/v1/treatments/:id` | Get treatment detail with photos |
| `PATCH` | `/api/v1/treatments/:id` | Update treatment (add after photos, notes, rating) |
| `DELETE` | `/api/v1/treatments/:id` | Delete treatment |
| `POST` | `/api/v1/treatments/:id/photos` | Upload before/after photos |
| `GET` | `/api/v1/treatments/reminders` | Get upcoming reminders |
| `POST` | `/api/v1/treatments/:id/remind` | Set follow-up reminder |

### UI Components

```
mobile/app/treatments/
├── index.tsx          # Treatment history list (timeline view)
├── [id].tsx           # Treatment detail with photos
├── new.tsx            # Log new treatment (category picker → form)
├── photos.tsx         # Photo gallery for a treatment
└── reminders.tsx      # Upcoming reminders
```

### Key UX Decisions
- **Timeline view** — treatments ordered by date, grouped by category
- **Quick-log** — "I just got Botox" → 3 taps to log (category → treatment → date → done)
- **Photo comparison** — side-by-side before/after with zoom
- **Smart reminders** — "Time for your 2-week Botox check-in" / "CoolSculpting touch-up due"
- **Cost tracking** — total spend by category, by year, by provider

---

## Feature 2: Photo Journal & Progress

### What It Does
Track skin/treatment progress over time with standardized photos. Before/after comparisons, timeline view, AI-assisted progress analysis.

### Data Model

```sql
CREATE TABLE photo_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  body_area TEXT NOT NULL, -- 'face', 'neck', 'hands', 'body'
  photo_angle TEXT, -- 'front', 'left_profile', 'right_profile', 'close_up'
  lighting_type TEXT, -- 'natural', 'bathroom', 'clinical'
  treatment_context UUID REFERENCES treatments(id), -- optional link to treatment
  ai_analysis JSONB, -- skin condition scores, changes detected
  notes TEXT,
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI-detected changes between photos
CREATE TABLE photo_progress_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_before_id UUID REFERENCES photo_journal_entries(id),
  photo_after_id UUID REFERENCES photo_journal_entries(id),
  changes_detected JSONB, -- {wrinkle_depth: -15%, pigmentation: -8%, ...}
  confidence DECIMAL(3,2),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/photos` | Upload photo journal entry |
| `GET` | `/api/v1/photos` | List photos (filterable by area, date, treatment) |
| `GET` | `/api/v1/photos/compare` | Get before/after pair for comparison |
| `GET` | `/api/v1/photos/timeline` | Timeline view of all photos |
| `POST` | `/api/v1/photos/analyze` | Run AI progress analysis on photo pair |

### UI Components

```
mobile/app/photos/
├── index.tsx          # Photo timeline grid
├── capture.tsx        # Standardized photo capture (guide overlay)
├── compare.tsx        # Side-by-side before/after
├── [id].tsx           # Photo detail with AI analysis
└── progress.tsx       # Progress report with charts
```

### Key UX Decisions
- **Guided capture** — ghost overlay showing correct angle/distance for consistent photos
- **Auto-compare** — after 2+ photos of same area, prompt "See your progress?"
- **AI highlights** — overlay showing areas of improvement/regression
- **Shareable progress cards** — "8 weeks of retinol: 23% reduction in fine lines"
- **Privacy-first** — photos stored with user-controlled encryption, auto-delete option

---

## Feature 3: Procedure Cards Library

### What It Does
Educational library of aesthetic procedures. Each card covers: mechanism of action, prep guidance, recovery timeline, complications, red flag symptoms, FAQs. Browseable by concern, category, or treatment type.

### Data Model

```sql
CREATE TABLE procedure_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'botox-forehead', 'chemical-peel-medium'
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Injectables', 'Laser', 'Peels', 'Body', 'Surgical'
  summary TEXT NOT NULL, -- 1-2 sentence overview
  mechanism_of_action TEXT, -- How it works (patient-friendly)
  prep_guidance TEXT, -- What to do before
  recovery_timeline TEXT, -- Day-by-day or week-by-week
  downtime_days INT,
  pain_level TEXT, -- 'Minimal', 'Moderate', 'Significant'
  cost_range TEXT, -- '$300-$600 per session'
  results_duration TEXT, -- '3-6 months', 'Permanent'
  complications JSONB, -- [{name, likelihood, severity, when_to_seek_help}]
  red_flag_symptoms TEXT[], -- ['Asymmetry', 'Difficulty breathing', ...]
  faqs JSONB, -- [{question, answer}]
  contraindications TEXT[],
  ideal_candidates TEXT,
  alternatives TEXT[],
  related_procedures UUID[],
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User bookmarks
CREATE TABLE procedure_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES procedure_cards(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, card_id)
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/procedures` | List all procedure cards (filterable by category/concern) |
| `GET` | `/api/v1/procedures/:slug` | Get full procedure card |
| `GET` | `/api/v1/procedures/search` | Search procedures by keyword/concern |
| `POST` | `/api/v1/procedures/:slug/bookmark` | Bookmark a procedure |
| `DELETE` | `/api/v1/procedures/:slug/bookmark` | Remove bookmark |
| `GET` | `/api/v1/procedures/bookmarks` | Get user's bookmarks |

### Seed Data (Initial Procedures)

| Category | Procedures |
|----------|-----------|
| **Injectables** | Botox (forehead, crow's feet, masseter), Dysport, Xeomin, Juvederm (Voluma, Vollure, Volbella), Restylane, Sculptra, Radiesse, Kybella |
| **Laser** | Fraxel, IPL, CO2, Clear + Brilliant, Laser Hair Removal, Vbeam, Halo |
| **Peels** | Glycolic, Salicylic, TCA, Jessner, Phenol |
| **Body** | CoolSculpting, Emsculpt, Morpheus8 Body, Cellfina |
| **Skin** | Microneedling, HydraFacial, Dermaplaning, LED Therapy |
| **Surgical** | Blepharoplasty, Rhinoplasty, Facelift, Liposuction |

### Key UX Decisions
- **Concern-based browsing** — "I have dark circles" → relevant procedures
- **Comparison view** — "Botox vs Dysport: which is right for you?"
- **Save for later** — bookmark procedures before a consultation
- **Waiting room mode** — pull up cards while at the clinic
- **"Am I a candidate?"** — interactive quiz per procedure

---

## Feature 4: Treatment Logging (Quick Log)

### What It Does
Fast, frictionless way to log a treatment session. 3-tap flow: pick category → pick treatment → confirm date. Optional: add cost, provider, photos, notes.

### This is the "glue" between Features 1-3

When a user browses a Procedure Card → "I just got this" → auto-populates treatment log.
When a user uploads a progress photo → optional link to treatment log.
When a user views their timeline → shows treatments + photos together.

### Integration Points

```
Procedure Card → "Log this treatment" → Treatment History
Photo Journal → "Link to treatment" → Treatment History  
Treatment History → "View procedure info" → Procedure Card
Treatment History → "See progress" → Photo Journal
```

---

## Feature 5: Appointment Tracker

### What It Does
Track past and upcoming appointments with providers. Calendar integration, follow-up reminders, provider details, notes. Links to treatment history.

### Data Model

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_location TEXT,
  provider_phone TEXT,
  provider_email TEXT,
  appointment_type TEXT NOT NULL, -- 'Botox touch-up', 'Annual skin check', 'CoolSculpting session'
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled', 'no_show')) DEFAULT 'upcoming',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  notes TEXT, -- pre-appointment notes, questions to ask
  follow_up_notes TEXT, -- post-appointment notes
  treatment_id UUID REFERENCES treatments(id), -- linked treatment if completed
  reminder_sent BOOLEAN DEFAULT false,
  calendar_event_id TEXT, -- external calendar sync
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/appointments` | Create appointment |
| `GET` | `/api/v1/appointments` | List appointments (upcoming/completed/all) |
| `GET` | `/api/v1/appointments/:id` | Get appointment detail |
| `PATCH` | `/api/v1/appointments/:id` | Update appointment (add notes, mark complete) |
| `DELETE` | `/api/v1/appointments/:id` | Cancel/delete appointment |
| `POST` | `/api/v1/appointments/:id/complete` | Mark complete → auto-create treatment log |
| `GET` | `/api/v1/appointments/reminders` | Get upcoming reminders |

### Key UX Decisions
- **Calendar view** — month/week view of appointments
- **Quick-add** — "Booked Botox for next Tuesday" → 2 taps
- **Auto-link** — completing an appointment auto-creates a treatment log entry
- **Prep checklist** — "Things to ask your provider" based on procedure card
- **Follow-up reminders** — "Your CoolSculpting follow-up is tomorrow"

---

## Feature 6: Achievements & Milestones (Gamification)

### What It Does
Badges, streaks, and consistency rewards. Gamification to drive engagement and retention. "Aesthetic IQ" — personalized insights from your own data patterns.

### Data Model

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'first_scan', '7_day_streak', 'treatment_tracker'
  name TEXT NOT NULL, -- 'Skin Scholar', 'Consistency Queen', 'Treatment Pro'
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT, -- 'tracking', 'consistency', 'knowledge', 'milestones'
  threshold INT, -- e.g., 7 for '7_day_streak'
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  progress INT DEFAULT 0, -- current progress toward threshold
  UNIQUE(user_id, achievement_id)
);

-- Aesthetic IQ insights (pattern recognition from user data)
CREATE TABLE aesthetic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT, -- 'pattern', 'recommendation', 'milestone', 'comparison'
  title TEXT NOT NULL, -- 'You\'ve leaned into volume-loss work'
  body TEXT NOT NULL, -- '8 sessions across six months, $2,400 invested'
  data JSONB, -- supporting data for the insight
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Achievement Categories

| Category | Examples |
|----------|----------|
| **Tracking** | First Scan, First Treatment, 10 Treatments Logged, Photo Pro (50 photos) |
| **Consistency** | 7-Day Streak, 30-Day Streak, Weekly Scanner, Monthly Check-in |
| **Knowledge** | Read 10 Procedure Cards, Bookmarked 5 Treatments, Ingredient Expert |
| **Milestones** | 6-Month Journey, 1-Year Anniversary, $1K Invested, 5 Providers Tried |
| **Skin Health** | Improvement Detected, Skin Age Reduced, Condition Cleared |

### Aesthetic IQ (Personalized Insights)

Pattern recognition from user's own data:
- "You've leaned into volume-loss work — 8 sessions across six months"
- "Your skin improved 23% in hydration over 3 months since starting hyaluronic acid"
- "You tend to get treatments every 12 weeks — your next Botox is due in 2 weeks"
- "Your total investment in skin health this year: $3,200 across 14 treatments"
- "Your top provider: Dr. Smith at Glow Aesthetics (6 visits)"

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/achievements` | List all achievements with user progress |
| `GET` | `/api/v1/achievements/:slug` | Get achievement detail |
| `GET` | `/api/v1/insights` | Get Aesthetic IQ insights |
| `POST` | `/api/v1/insights/:id/read` | Mark insight as read |

### Key UX Decisions
- **Subtle celebration** — badge unlock animation, not intrusive
- **Progress bars** — show how close to next achievement
- **Shareable badges** — "I completed 30 days of skincare tracking" → share card
- **Aesthetic IQ dashboard** — personal stats, trends, investment tracking
- **Privacy-first** — insights are local, never shared without consent

---

## Implementation Priority

| Phase | Feature | Effort | Impact |
|-------|---------|--------|--------|
| **Phase 1** | Treatment History Tracker | 2-3 days | HIGH — core retention loop |
| **Phase 2** | Photo Journal (basic) | 2 days | HIGH — visual proof of value |
| **Phase 3** | Procedure Cards (seed data) | 3-4 days | MEDIUM — education + SEO |
| **Phase 4** | Appointment Tracker | 2 days | MEDIUM — retention + reminders |
| **Phase 5** | Photo AI Progress Analysis | 1 week | HIGH — differentiator |
| **Phase 6** | Achievements & Aesthetic IQ | 3-4 days | MEDIUM — gamification + engagement |
| **Phase 7** | Quick Log + Cross-linking | 2 days | MEDIUM — UX polish |

**Total estimated effort:** 3.5-4 weeks for full feature set

---

## How This Fits SKINgenius

**Existing features:**
- ✅ AI skin analysis (scan → detect conditions)
- ✅ Ingredient analysis (product safety check)
- ✅ Routine building (AM/PM skincare)
- ✅ Skin Age Estimator (viral funnel)

**New features (this spec):**
- 🆕 Treatment History Tracker (retention)
- 🆕 Photo Journal (visual proof)
- 🆕 Procedure Cards (education + SEO)
- 🆕 Quick Log (friction reduction)

**Combined value proposition:**
> "Scan your skin → understand your conditions → build a routine → track treatments → see progress over time"

No competitor does all 5. Aesthetic Journey does 3-4 but lacks AI analysis. SKINgenius becomes the complete skin health platform.

---

## Key Differentiators vs Aesthetic Journey

| Feature | Aesthetic Journey | SKINgenius |
|---------|-------------------|------------|
| Treatment Tracker | ✅ | ✅ (this spec) |
| Photo Journal | ✅ | ✅ (this spec) |
| Appointment Tracker | ✅ | ✅ (this spec) |
| Procedure Cards | ✅ | ✅ (this spec) |
| Achievements/Gamification | ✅ | ✅ (this spec) |
| Aesthetic IQ (insights) | ✅ | ✅ (this spec) |
| Patient-Owned Data | ✅ | ✅ (Supabase RLS) |
| GLP-1/Wellness Tracking | ✅ | ✅ (this spec) |
| AI Skin Analysis | ❌ | ✅ (already built) |
| Ingredient Analysis | ❌ | ✅ (already built) |
| Routine Builder | Partial | ✅ (already built) |
| Skin Age Estimator | ❌ | ✅ (already built) |
| On-Device AI | ❌ | ✅ (Gemma/ViT) |
| Wearable Integration | ❌ | ✅ (HealthKit) |
| Metabolic → Skin | ❌ | ✅ (HbA1c pipeline) |

**We're building a superset.** Aesthetic Journey is one feature set. SKINgenius is the full platform.

---

*Spec written by Che 🧬 — 2026-06-09*
