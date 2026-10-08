# Clinical Scan Escalation Flow — Spec

## Goal
When an on-device scan detects urgent or severe conditions, surface a "Clinical review recommended" prompt and let the user pay $49 for a board-certified dermatologist review.

## Capabilities

### 1. Escalation Prompt UI (`/scan/clinical-review`)
- Triggered from `/scan/results` when any detected condition has `severity === "severe"` or `requires_dermatologist === true`.
- Page content:
  - Headline: "This scan shows something that needs clinical attention"
  - Summary card of flagged findings (condition name, severity, zone, confidence)
  - Primary CTA: "Get Clinical Review — $49"
  - "What you'll receive" bullets: detailed analysis, treatment plan, prescription if needed, provider referral
  - "48-hour turnaround guarantee"
  - Trust badges: board-certified dermatologists, HIPAA compliant
- Pass-through data: `scan_id` via query param; page loads scan results from server context (mocked for prototype).

### 2. Clinical Scan Checkout
- One-time $49 payment (mock Stripe Checkout redirect for prototype).
- Collect:
  - Name, email, phone
  - Insurance info (optional: provider, policy number, group number)
  - Close-up photo upload (up to 3 additional photos)
  - Consent checkboxes: HIPAA notice, data sharing with dermatologist
- On submit: simulate Stripe payment success, create `clinical_reviews` record with status `pending_payment` → `pending_review`.
- Store uploaded photo metadata in `clinical_review_photos`.

### 3. Dermatologist Review Dashboard (`/dashboard/clinical-reviews`)
- Internal queue of pending clinical reviews.
- Case detail view:
  - Patient photos (original scan + uploaded close-ups)
  - Scan results / flagged conditions
  - Dermatologist inputs: diagnosis, treatment plan, prescription (name, dosage, instructions), provider referrals
  - Actions: mark complete, notify patient
- Prototype uses local mock data and a hardcoded internal role gate (no real auth).

### 4. Patient Results Page (`/scan/clinical-results/[id]`)
- Shows dermatologist diagnosis and notes.
- Prescription recommendations (if any).
- Provider referrals matched to condition.
- "Book Follow-up" button (opens mailto/tel placeholder).
- Only accessible with the review `id` in URL (no auth check in prototype).

### 5. Email Notifications
- When a review is marked complete, send a "Your clinical review is complete" email.
- Contains summary of findings and link to `/scan/clinical-results/[id]`.
- Prototype logs email to console / writes to `memory/YYYY-MM-DD.md` instead of sending.

## Data Model (Supabase additions)

```sql
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

CREATE TABLE IF NOT EXISTS public.clinical_review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinical_review_id UUID REFERENCES public.clinical_reviews(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT DEFAULT 'close_up' CHECK (photo_type IN ('close_up', 'original_scan')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Surface

- `POST /api/clinical-reviews` — create review from checkout form.
- `GET /api/clinical-reviews?status=pending_review` — queue for dashboard.
- `GET /api/clinical-reviews/[id]` — single case for dashboard + results page.
- `PATCH /api/clinical-reviews/[id]` — update diagnosis / status.
- `POST /api/clinical-reviews/[id]/notify` — mark complete + log email.

## Files to Create

### Routes
- `src/app/scan/clinical-review/page.tsx`
- `src/app/scan/clinical-results/[id]/page.tsx`
- `src/app/dashboard/clinical-reviews/page.tsx`
- `src/app/dashboard/clinical-reviews/[id]/page.tsx`

### API
- `src/app/api/clinical-reviews/route.ts`
- `src/app/api/clinical-reviews/[id]/route.ts`
- `src/app/api/clinical-reviews/[id]/notify/route.ts`

### Components / Lib
- `src/components/scan/ClinicalReviewPrompt.tsx`
- `src/components/scan/ClinicalCheckoutForm.tsx`
- `src/components/clinical/ReviewQueue.tsx`
- `src/components/clinical/ReviewCaseDetail.tsx`
- `src/components/clinical/ReviewResultCard.tsx`
- `src/lib/clinical/reviews.ts`
- `src/types/clinical.ts`

### DB Migration
- `supabase/migrations/20260915_clinical_reviews.sql`

## Prototype Decisions
- Payment: mock Stripe redirect that always succeeds (real Stripe integration is a follow-up).
- Email: console log + memory log (real SMTP/Resend integration is a follow-up).
- Photo upload: client-side `URL.createObjectURL` preview; server stores base64 placeholder.
- Auth: uses existing Supabase SSR pattern where present; dashboard has a hardcoded dev gate.

## Verification
- `npm run build` must pass.
- New routes must resolve without runtime errors.
