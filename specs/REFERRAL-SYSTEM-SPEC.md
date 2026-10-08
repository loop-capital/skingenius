# Referral System Specification

**Version:** 1.0  
**Created:** 2026-09-14  
**Status:** Draft  
**Author:** SKINgenius Architect  

---

## Overview

This specification defines the referral system for SKINgenius, enabling users to refer friends for skincare consultations and treatments. The system manages the complete referral lifecycle from creation through completion, handles appointment booking with conflict detection, triggers notifications at each state transition, and processes payments with provider payouts.

---

## 1. Referral Lifecycle State Machine

### States

```
draft → sent → viewed → accepted → scheduled → completed → cancelled
                ↓                        ↑
                └─────── expired ────────┘
```

### State Definitions

| State | Description | Entry Conditions | Exit Conditions |
|-------|-------------|------------------|-----------------|
| `draft` | Referral created but not sent | User creates referral, fills recipient details | Sender clicks "Send Referral" |
| `sent` | Referral delivered to recipient | Email/SMS successfully dispatched | Recipient opens referral link |
| `viewed` | Recipient has opened the referral | Referral link clicked, landing page loaded | Recipient accepts referral |
| `accepted` | Recipient accepted the referral | Recipient completes acceptance form | Recipient books appointment |
| `scheduled` | Appointment booked | Valid time slot selected, deposit paid | Appointment date passes (completed) OR cancellation requested |
| `completed` | Appointment fulfilled | Provider marks appointment as done | N/A (terminal state) |
| `cancelled` | Referral cancelled by either party | Cancellation request before completion | N/A (terminal state) |
| `expired` | Referral not accepted within validity period | Validity period elapsed (default: 30 days) | N/A (terminal state) |

### State Transition Rules

```typescript
interface StateTransition {
  from: ReferralState;
  to: ReferralState;
  trigger: string;
  guard?: () => boolean;
  actions: Array<() => void>;
}

const transitions: StateTransition[] = [
  {
    from: 'draft',
    to: 'sent',
    trigger: 'SEND_REFERRAL',
    actions: [sendNotificationEmail, sendNotificationSMS, startValidityTimer]
  },
  {
    from: 'sent',
    to: 'viewed',
    trigger: 'REFERRAL_LINK_CLICKED',
    actions: [trackEngagement, scheduleFollowUpReminder]
  },
  {
    from: 'viewed',
    to: 'accepted',
    trigger: 'ACCEPT_REFERRAL',
    guard: () => !validityPeriodExpired,
    actions: [notifyReferrer, createRecipientProfile]
  },
  {
    from: 'accepted',
    to: 'scheduled',
    trigger: 'BOOK_APPOINTMENT',
    guard: () => slotAvailable && depositPaid,
    actions: [createBooking, blockTimeSlot, sendConfirmation]
  },
  {
    from: 'scheduled',
    to: 'completed',
    trigger: 'MARK_APPOINTMENT_DONE',
    guard: () => appointmentDatePassed,
    actions: [processProviderPayout, notifyBothParties, issueReward]
  },
  {
    from: 'scheduled',
    to: 'cancelled',
    trigger: 'CANCEL_APPOINTMENT',
    guard: () => withinCancellationWindow,
    actions: [processRefund, releaseTimeSlot, notifyProvider]
  },
  {
    from: 'sent' | 'viewed' | 'accepted',
    to: 'expired',
    trigger: 'VALIDITY_TIMER_EXPIRED',
    actions: [notifyReferrer, archiveReferral]
  }
];
```

---

## 2. Booking/Appointment Data Model

### Core Entities

```sql
-- ============================================
-- REFERRALS
-- ============================================

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'accepted', 'scheduled', 
    'completed', 'cancelled', 'expired'
  )),
  message TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  validity_days INTEGER DEFAULT 30,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROVIDERS (for appointments)
-- ============================================

CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT CHECK (specialty IN (
    'dermatologist', 'esthetician', 'nurse_practitioner', 
    'physician_assistant', 'wellness_coach'
  )),
  license_number TEXT,
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  accepts_referrals BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENT TYPES
-- ============================================

CREATE TABLE public.appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  deposit_required BOOLEAN DEFAULT TRUE,
  deposit_percentage DECIMAL(5,2) DEFAULT 20.00,
  description TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TIME SLOTS
-- ============================================

CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('available', 'blocked', 'booked', 'unavailable')),
  booking_id UUID, -- references appointments when booked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, start_time)
);

-- ============================================
-- APPOINTMENTS
-- ============================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  appointment_type_id UUID NOT NULL REFERENCES public.appointment_types(id),
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 
    'cancelled', 'no_show', 'rescheduled'
  )),
  location_type TEXT CHECK (location_type IN ('virtual', 'in_person')),
  location_address TEXT,
  meeting_link TEXT, -- for virtual appointments
  notes TEXT,
  internal_notes TEXT, -- provider-only notes
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMPTZ,
  total_amount DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  provider_payout DECIMAL(10,2),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN (
    'pending', 'processing', 'paid', 'failed'
  )),
  payout_paid_at TIMESTAMPTZ,
  cancellation_fee DECIMAL(10,2) DEFAULT 0,
  reschedule_count INTEGER DEFAULT 0,
  last_rescheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROVIDER AVAILABILITY
-- ============================================

CREATE TABLE public.provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, day_of_week, start_time)
);

-- ============================================
-- BOOKING CONFLICTS LOG
-- ============================================

CREATE TABLE public.booking_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempted_booking_data JSONB NOT NULL,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN (
    'double_book', 'outside_availability', 'insufficient_buffer',
    'provider_unavailable', 'slot_already_blocked'
  )),
  conflicting_appointment_id UUID REFERENCES public.appointments(id),
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_recipient ON public.referrals(recipient_email);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_expires ON public.referrals(expires_at);
CREATE INDEX idx_appointments_user ON public.appointments(user_id);
CREATE INDEX idx_appointments_provider ON public.appointments(provider_id);
CREATE INDEX idx_appointments_referral ON public.appointments(referral_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_start);
CREATE INDEX idx_time_slots_provider ON public.time_slots(provider_id, start_time);
CREATE INDEX idx_time_slots_status ON public.time_slots(slot_type);
CREATE INDEX idx_provider_availability_provider ON public.provider_availability(provider_id, day_of_week);
```

### Conflict Detection Logic

```typescript
interface BookingConflictCheck {
  providerId: string;
  requestedStart: Date;
  requestedEnd: Date;
  appointmentTypeId: string;
}

async function checkBookingConflicts(check: BookingConflictCheck): Promise<{
  available: boolean;
  conflicts: string[];
  suggestedAlternatives: Date[];
}> {
  const conflicts: string[] = [];
  
  // Check 1: Existing appointment overlap
  const existingOverlap = await db.appointments.findFirst({
    where: {
      provider_id: check.providerId,
      status: { in: ['scheduled', 'confirmed'] },
      OR: [
        {
          scheduled_start: { lte: check.requestedStart },
          scheduled_end: { gt: check.requestedStart }
        },
        {
          scheduled_start: { lt: check.requestedEnd },
          scheduled_end: { gte: check.requestedEnd }
        }
      ]
    }
  });
  
  if (existingOverlap) {
    conflicts.push('DOUBLE_BOOK');
  }
  
  // Check 2: Provider availability window
  const dayOfWeek = check.requestedStart.getDay();
  const availability = await db.provider_availability.findFirst({
    where: {
      provider_id: check.providerId,
      day_of_week: dayOfWeek,
      is_active: true
    }
  });
  
  if (!availability) {
    conflicts.push('OUTSIDE_AVAILABILITY');
  } else {
    const startTime = check.requestedStart.getHours() * 60 + check.requestedStart.getMinutes();
    const endTime = check.requestedEnd.getHours() * 60 + check.requestedEnd.getMinutes();
    const availStart = availability.start_time.getHours() * 60 + availability.start_time.getMinutes();
    const availEnd = availability.end_time.getHours() * 60 + availability.end_time.getMinutes();
    
    if (startTime < availStart || endTime > availEnd) {
      conflicts.push('OUTSIDE_HOURS');
    }
  }
  
  // Check 3: Buffer time between appointments (e.g., 15 min cleanup)
  const bufferMinutes = 15;
  const bufferConflict = await db.appointments.findFirst({
    where: {
      provider_id: check.providerId,
      status: { in: ['scheduled', 'confirmed'] },
      OR: [
        {
          scheduled_end: {
            gt: new Date(check.requestedStart.getTime() - bufferMinutes * 60000)
          },
          scheduled_end: {
            lte: check.requestedStart
          }
        },
        {
          scheduled_start: {
            lt: new Date(check.requestedEnd.getTime() + bufferMinutes * 60000)
          },
          scheduled_start: {
            gte: check.requestedEnd
          }
        }
      ]
    }
  });
  
  if (bufferConflict) {
    conflicts.push('INSUFFICIENT_BUFFER');
  }
  
  return {
    available: conflicts.length === 0,
    conflicts,
    suggestedAlternatives: await findAlternativeSlots(check)
  };
}
```

---

## 3. Notification Triggers

### Notification Channels

| Channel | Use Case | Template ID |
|---------|----------|-------------|
| Email | Referral sent, accepted, appointment confirmed, reminders | `referral_*`, `appointment_*` |
| SMS | Time-sensitive: appointment reminders (24h, 1h), no-show alerts | `sms_appt_*` |
| Push | General updates, engagement nudges | `push_referral_*`, `push_appt_*` |

### Trigger Matrix

| State Transition | Email | SMS | Push |
|------------------|-------|-----|------|
| draft → sent | ✓ (to referrer + recipient) | ✓ (to recipient if phone) | ✓ (to referrer) |
| sent → viewed | ✓ (to referrer: "Your referral was opened!") | - | ✓ (to referrer) |
| viewed → accepted | ✓ (to both parties) | ✓ (to recipient) | ✓ (to both) |
| accepted → scheduled | ✓ (confirmation to both) | ✓ (24h before appt) | ✓ (confirmation) |
| scheduled → completed | ✓ (thank you + reward info) | - | ✓ (reward notification) |
| scheduled → cancelled | ✓ (cancellation confirmation) | ✓ (if <24h before) | ✓ (both parties) |
| any → expired | ✓ (to referrer) | - | - |

### Notification Templates

```typescript
interface NotificationTemplate {
  id: string;
  channel: 'email' | 'sms' | 'push';
  subject?: string; // email only
  body: string; // supports {{variables}}
  trigger: string;
  recipients: Array<'referrer' | 'recipient' | 'provider'>;
}

const templates: NotificationTemplate[] = [
  {
    id: 'referral_sent_recipient',
    channel: 'email',
    subject: '{{referrerName}} thinks you deserve great skin!',
    body: `
Hi {{recipientName}},

{{referrerName}} believes you'd love SKINgenius! They've sent you a referral for:

🎁 {{offerDescription}}

Your referral code: {{referralCode}}
Valid until: {{expiryDate}}

[Accept Referral]({{acceptanceLink}})

Questions? Reply to this email.

— Team SKINgenius
    `,
    trigger: 'REFERRAL_SENT',
    recipients: ['recipient']
  },
  {
    id: 'referral_accepted_referrer',
    channel: 'email',
    subject: 'Great news! {{recipientName}} accepted your referral',
    body: `
Hi {{referrerName}},

Good news! {{recipientName}} accepted your referral and is now booking their consultation.

You'll receive your {{rewardAmount}} credit once they complete their appointment.

Track your referrals: {{dashboardLink}}

— Team SKINgenius
    `,
    trigger: 'REFERRAL_ACCEPTED',
    recipients: ['referrer']
  },
  {
    id: 'sms_appointment_reminder_24h',
    channel: 'sms',
    body: `SKINgenius: Reminder - Your appointment with {{providerName}} is tomorrow at {{time}}. Reply C to cancel or R to reschedule. Questions? {{supportNumber}}`,
    trigger: 'APPOINTMENT_REMINDER_24H',
    recipients: ['recipient']
  },
  {
    id: 'sms_appointment_reminder_1h',
    channel: 'sms',
    body: `SKINgenius: Your appointment starts in 1 hour! Join here: {{meetingLink}} (virtual) or arrive 5 min early (in-person).`,
    trigger: 'APPOINTMENT_REMINDER_1H',
    recipients: ['recipient']
  },
  {
    id: 'email_cancellation_confirmation',
    channel: 'email',
    subject: 'Appointment cancelled - {{appointmentDate}}',
    body: `
Hi {{userName}},

Your appointment on {{appointmentDate}} at {{time}} has been cancelled.

{{cancellationFeeText}}

Your deposit: {{depositStatus}}
{{refundDetails}}

[Reschedule]({{rescheduleLink}})

— Team SKINgenius
    `,
    trigger: 'APPOINTMENT_CANCELLED',
    recipients: ['recipient', 'provider']
  }
];
```

### Scheduled Notifications

```typescript
// Cron jobs for time-based notifications
const scheduledNotifications = [
  {
    name: 'appointment_reminder_24h',
    cron: '0 9 * * *', // Daily at 9 AM
    query: `
      SELECT a.*, p.email, p.phone, pr.name as provider_name
      FROM appointments a
      JOIN profiles p ON a.user_id = p.id
      JOIN providers pr ON a.provider_id = pr.id
      WHERE a.scheduled_start BETWEEN NOW() + INTERVAL '23 hours' 
                                AND NOW() + INTERVAL '25 hours'
        AND a.status = 'scheduled'
    `,
    action: send24HourReminder
  },
  {
    name: 'appointment_reminder_1h',
    cron: '0 * * * *', // Every hour
    query: `
      SELECT a.*, p.email, p.phone, pr.name as provider_name
      FROM appointments a
      JOIN profiles p ON a.user_id = p.id
      WHERE a.scheduled_start BETWEEN NOW() 
                                AND NOW() + INTERVAL '2 hours'
        AND a.status = 'scheduled'
    `,
    action: send1HourReminder
  },
  {
    name: 'referral_expiry_check',
    cron: '0 0 * * *', // Daily at midnight
    query: `
      SELECT r.*, p.email as referrer_email
      FROM referrals r
      JOIN profiles p ON r.referrer_id = p.id
      WHERE r.expires_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
        AND r.status IN ('sent', 'viewed', 'accepted')
    `,
    action: sendExpiryWarning
  }
];
```

---

## 4. Payment Flow

### Payment Model

**Referral Fee Structure:**
- Platform referral fee: **15% of total service value**
- Fee is deducted from the 20% deposit collected from users at booking
- **No monthly fee** for curated providers on the platform
- Provider collects remaining balance directly from client at appointment

**Example Calculation ($150 service):**
- User pays $30 deposit (20% of $150) at booking
- Platform fee: $22.50 (15% of $150)
- Provider receives $7.50 from deposit ($30 - $22.50)
- Provider collects $120 balance at appointment
- **Provider total: $127.50** (85% of service value)

### No-Show Policy

**User no-show = removal from platform, deposit forfeited**

- If a user fails to attend their scheduled appointment without prior cancellation, they are removed from the platform entirely
- The deposit is forfeited (retained by the platform and provider per the fee split above)
- The provider still collects their portion of the deposit but does not collect the balance
- This is a zero-tolerance policy to protect provider time and platform integrity

### Payment States

```
initiated → deposit_paid → appointment_completed → provider_payout_complete
     ↓            ↓              ↓
  failed      refunded     no_show_forfeiture
```

### Payment Processing

```typescript
interface PaymentFlow {
  // Step 1: Booking initiation
  initiateBooking(appointmentId: string): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    depositAmount: number;
  }>;
  
  // Step 2: Deposit payment (required to confirm booking)
  processDeposit(paymentIntentId: string): Promise<{
    success: boolean;
    transactionId: string;
  }>;
  
  // Step 3: Pre-appointment full payment (optional, based on policy)
  processFullPayment(appointmentId: string): Promise<{
    success: boolean;
    amountCharged: number;
    previousDeposit: number;
  }>;
  
  // Step 4: Post-completion provider payout
  processProviderPayout(appointmentId: string): Promise<{
    success: boolean;
    payoutAmount: number;
    platformFee: number;
    estimatedArrival: string;
  }>;
  
  // Step 5: Refund processing (cancellations)
  processRefund(appointmentId: string, reason: string): Promise<{
    success: boolean;
    refundAmount: number;
    cancellationFee: number;
    refundMethod: 'original' | 'credit';
  }>;
}
```

### Database Schema Extensions

```sql
-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================

CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'deposit', 'full_payment', 'refund', 'cancellation_fee', 
    'provider_payout', 'adjustment'
  )),
  payment_method TEXT CHECK (payment_method IN (
    'credit_card', 'debit_card', 'apple_pay', 'google_pay', 
    'bank_transfer', 'credit_balance'
  )),
  processor TEXT NOT NULL DEFAULT 'stripe',
  processor_transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
  )),
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================
-- PROVIDER PAYOUTS
-- ============================================

CREATE TABLE public.provider_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  payout_method TEXT CHECK (payout_method IN (
    'bank_transfer', 'paypal', 'check', 'credit_balance'
  )),
  payout_details JSONB, -- encrypted bank account / PayPal info
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'paid', 'failed', 'cancelled'
  )),
  failure_reason TEXT,
  stripe_transfer_id TEXT,
  initiated_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REFERRAL REWARDS
-- ============================================

CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'credit', 'percentage_discount', 'free_service', 'cash'
  )),
  reward_value DECIMAL(10,2) NOT NULL, -- e.g., 25.00 for $25 credit
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'earned', 'claimed', 'expired', 'forfeited'
  )),
  earned_at TIMESTAMPTZ, -- when referral completed
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  applied_to_purchase UUID, -- which purchase used this reward
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER CREDIT BALANCE
-- ============================================

CREATE TABLE public.user_credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  pending_credits DECIMAL(10,2) DEFAULT 0.00, -- rewards not yet earned
  lifetime_earned DECIMAL(10,2) DEFAULT 0.00,
  lifetime_used DECIMAL(10,2) DEFAULT 0.00,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_payment_transactions_appointment ON public.payment_transactions(appointment_id);
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_provider_payouts_provider ON public.provider_payouts(provider_id);
CREATE INDEX idx_provider_payouts_status ON public.provider_payouts(status);
CREATE INDEX idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX idx_referral_rewards_referral ON public.referral_rewards(referral_id);
CREATE INDEX idx_referral_rewards_status ON public.referral_rewards(status);
```

### Payout Calculation

```typescript
interface PayoutCalculation {
  appointmentTotal: number;
  depositPaid: number;
  platformFeePercentage: number; // e.g., 15%
  providerRate: number; // hourly or per-service rate
}

function calculateProviderPayout(calc: PayoutCalculation): {
  grossAmount: number;
  platformFee: number;
  netPayout: number;
} {
  const grossAmount = calc.appointmentTotal;
  const platformFee = grossAmount * (calc.platformFeePercentage / 100);
  const netPayout = grossAmount - platformFee;
  
  return {
    grossAmount,
    platformFee,
    netPayout
  };
}
```

---

## 5. Calendar Sync Strategy

### Phase 1: Google Calendar OAuth (Universal Adapter)

**Timeline:** MVP Launch

**Implementation:**
- OAuth 2.0 integration with Google Calendar API
- Providers connect their primary business calendar
- Two-way sync: SKINgenius bookings → Google Calendar, Google Calendar busy blocks → SKINgenius availability
- Universal adapter pattern: abstracts calendar operations behind a common interface

**Benefits:**
- Works for ALL providers regardless of their booking software
- Real-time conflict prevention
- Automatic busy-block propagation when providers add personal events

**Technical Approach:**
```typescript
interface CalendarAdapter {
  connect(credentials: OAuthCredentials): Promise<void>;
  getBusyBlocks(start: Date, end: Date): Promise<TimeBlock[]>;
  createEvent(event: CalendarEvent): Promise<string>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
}

class GoogleCalendarAdapter implements CalendarAdapter {
  // Implementation uses googleapis npm package
  // Scopes: ['https://www.googleapis.com/auth/calendar.events']
}
```

### Phase 2: Square Bookings API

**Timeline:** Post-MVP (Month 2-3)

**Target:** Providers using Square Appointments for their primary booking system

**Implementation:**
- Square OAuth integration
- Read existing appointments from Square
- Write new SKINgenius referrals to Square
- Sync availability windows from Square settings

**Benefits:**
- Eliminates double-entry for Square users (~40% of small beauty businesses)
- Native payment reconciliation if provider uses Square Payments

### Phase 3: Native Integrations (Mindbody, Phorest, etc.)

**Timeline:** Month 4+

**Target Platforms:**
- Mindbody (large chains, fitness + wellness)
- Phorest (salon-focused, strong in US/Europe)
- Vagaro (spa + salon)
- GlossGenius (independent beauty professionals)

**Strategy:**
- Build adapters per platform based on provider demand
- Priority determined by provider onboarding surveys
- Each integration follows the same CalendarAdapter interface

---

## 6. Provider Value-Adds (Free)

Curated providers on SKINgenius receive the following value-added benefits at no cost:

### 6.1 Backlinks to Provider Website

**SEO Benefit:**
- Every provider profile includes a do-follow backlink to their practice website
- High-authority domain (SKINgenius) passes link equity
- Anchor text: provider name + specialty (e.g., "Dr. Jane Smith, Board-Certified Dermatologist")

**Implementation:**
```html
<a href="{{providerWebsiteUrl}}" rel="dofollow" target="_blank">
  Visit {{providerName}}'s Website
</a>
```

### 6.2 Instagram Photo Feed Integration

**Social Proof:**
- Providers can connect their Instagram Business account
- Latest 9 photos displayed in a grid on their SKINgenius profile
- Auto-refreshes weekly via Instagram Graph API
- Increases profile engagement by ~40% (industry benchmark)

**Requirements:**
- Instagram Business or Creator account
- Public profile (or approved app access via Meta OAuth)
- Valid access token (refreshed automatically)

**Implementation:**
```typescript
interface InstagramFeed {
  providerId: string;
  instagramUsername: string;
  accessToken: string; // encrypted
  lastSyncedAt: Date;
  photos: Array<{
    id: string;
    imageUrl: string;
    caption: string;
    timestamp: Date;
    permalink: string;
  }>;
}
```

### 6.3 Follow Button

**Audience Building:**
- Users can follow providers without booking
- Followers receive notifications about:
  - New availability slots
  - Special promotions (optional, provider-controlled)
  - Educational content posted by provider
- Builds provider's owned audience on-platform

**Metrics Tracked:**
- Follower count (public on profile)
- Follower growth rate
- Follower-to-client conversion rate

### 6.4 Customer Scan Data Sharing (With Consent)

**Clinical Intelligence:**
- After each appointment, users can consent to share their skin scan results with the provider
- Providers receive:
  - Hydration levels
  - Texture analysis
  - Pigmentation mapping
  - Sensitivity indicators
  - Historical trend data (if multiple scans)
- Enables personalized treatment recommendations and product selection

**Consent Flow:**
```typescript
interface DataSharingConsent {
  userId: string;
  providerId: string;
  appointmentId: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  dataTypes: Array<'hydration' | 'texture' | 'pigmentation' | 'sensitivity' | 'trends'>;
  expiresAt: Date; // consent valid for 12 months
  revocable: true; // user can revoke anytime
}
```

**Privacy Compliance:**
- HIPAA-compliant data transmission (encrypted at rest + in transit)
- User can revoke consent at any time via Settings
- Data automatically anonymized after consent expiry
- Provider may only use data for treatment purposes (not marketing without separate consent)

---

## 5. Edge Cases & Policies

### No-Show Policy (Updated)

**CRITICAL: Zero-Tolerance Removal Policy**

```typescript
interface NoShowPolicy {
  definition: 'Client fails to attend scheduled appointment without prior cancellation';
  gracePeriodMinutes: 15; // brief grace period before marking no-show
  consequence: 'REMOVAL_FROM_PLATFORM'; // user account terminated
  depositStatus: 'FORFEITED'; // retained by platform + provider per fee split
  providerAction: 'RETAIN_DEPOSIT_PORTION'; // keeps their 85% share of deposit
  balanceCollection: 'NOT_APPLICABLE'; // appointment did not occur
}

const noShowPolicy = {
  definition: 'User fails to attend without cancellation ≥1 hour before appointment',
  gracePeriodMinutes: 15,
  consequences: {
    accountStatus: 'TERMINATED', // permanent removal from platform
    depositForfeited: true, // no refund under any circumstance
    futureBookingAllowed: false, // cannot re-register
    dataRetention: 'ANONYMIZED' // personal data purged per privacy policy
  },
  providerWorkflow: {
    markNoShowDeadline: 24, // provider must mark within 24 hours
    automaticPayout: true, // provider receives their deposit share automatically
    requiresDocumentation: false // provider attestation sufficient
  }
};
```

### Cancellation Policy (Updated for No-Show Removal)

```typescript
interface CancellationPolicy {
  // Tiers based on notice period
  tiers: Array<{
    noticePeriodHours: number;
    penaltyType: 'none' | 'percentage' | 'flat_fee' | 'full';
    penaltyValue?: number;
    refundPercentage: number;
  }>;
  
  // Special circumstances
  exceptions: {
    medicalEmergency: {
      requiresDocumentation: boolean;
      penaltyWaived: boolean;
    };
    severeWeather: {
      automaticReschedule: boolean;
      penaltyWaived: boolean;
    };
    providerCancelled: {
      fullRefund: boolean;
      bonusCredit: number; // goodwill credit to client
    };
  };
  
  // Rescheduling rules
  rescheduling: {
    freeReschedulesAllowed: number;
    rescheduleDeadlineHours: number;
    sameProviderOnly: boolean;
  };
}

const cancellationPolicy: CancellationPolicy = {
  tiers: [
    {
      noticePeriodHours: 48,
      penaltyType: 'none',
      refundPercentage: 100
    },
    {
      noticePeriodHours: 24,
      penaltyType: 'percentage',
      penaltyValue: 50, // 50% of deposit
      refundPercentage: 50
    },
    {
      noticePeriodHours: 0,
      penaltyType: 'full',
      refundPercentage: 0 // forfeit entire deposit
    }
  ],
  exceptions: {
    medicalEmergency: {
      requiresDocumentation: true,
      penaltyWaived: true
    },
    severeWeather: {
      automaticReschedule: true,
      penaltyWaived: true
    },
    providerCancelled: {
      fullRefund: true,
      bonusCredit: 25.00 // $25 credit for inconvenience
    }
  },
  rescheduling: {
    freeReschedulesAllowed: 2,
    rescheduleDeadlineHours: 24,
    sameProviderOnly: false
  },
  noShowConsequence: {
    accountTermination: true, // user removed from platform permanently
    depositForfeited: true, // no exceptions
    appealProcess: false // zero-tolerance policy
  }
};
```

### Rescheduling Workflow

```typescript
interface RescheduleRequest {
  appointmentId: string;
  newPreferredSlots: Date[];
  reason?: string;
}

async function handleReschedule(request: RescheduleRequest): Promise<{
  success: boolean;
  newAppointmentId?: string;
  rescheduleCount: number;
  feeCharged: number;
  error?: string;
}> {
  const appointment = await db.appointments.findUnique({
    where: { id: request.appointmentId },
    include: { user: true, provider: true }
  });
  
  // Check reschedule limit
  if (appointment.reschedule_count >= 2) {
    return {
      success: false,
      error: 'Maximum reschedule limit (2) reached. Please cancel and rebook.'
    };
  }
  
  // Check deadline (24 hours before appointment)
  const hoursUntilAppointment = 
    (appointment.scheduled_start.getTime() - Date.now()) / (1000 * 60 * 60);
  
  if (hoursUntilAppointment < 24) {
    return {
      success: false,
      error: 'Rescheduling not allowed within 24 hours of appointment. Please cancel instead.'
    };
  }
  
  // Find alternative slot
  const conflictChecks = await Promise.all(
    request.newPreferredSlots.map(slot => 
      checkBookingConflicts({
        providerId: appointment.provider_id,
        requestedStart: slot,
        requestedEnd: new Date(slot.getTime() + getDuration(appointment.appointment_type_id)),
        appointmentTypeId: appointment.appointment_type_id
      })
    )
  );
  
  const availableSlot = conflictChecks.find(check => check.available);
  
  if (!availableSlot) {
    return {
      success: false,
      error: 'No available slots match your preferences. Please contact support.'
    };
  }
  
  // Create new appointment (keep old one as 'rescheduled')
  const newAppointment = await db.appointments.create({
    data: {
      referral_id: appointment.referral_id,
      user_id: appointment.user_id,
      provider_id: appointment.provider_id,
      appointment_type_id: appointment.appointment_type_id,
      scheduled_start: availableSlot.suggestedAlternatives[0],
      scheduled_end: new Date(availableSlot.suggestedAlternatives[0].getTime() + 
        getDuration(appointment.appointment_type_id)),
      status: 'scheduled',
      deposit_amount: appointment.deposit_amount,
      deposit_paid: appointment.deposit_paid,
      reschedule_count: appointment.reschedule_count + 1,
      last_rescheduled_at: new Date()
    }
  });
  
  // Update old appointment
  await db.appointment.update({
    where: { id: appointment.id },
    data: { status: 'rescheduled' }
  });
  
  // Send notifications
  await sendRescheduleConfirmation(appointment.user_id, newAppointment);
  await notifyProviderOfReschedule(appointment.provider_id, newAppointment);
  
  return {
    success: true,
    newAppointmentId: newAppointment.id,
    rescheduleCount: newAppointment.reschedule_count,
    feeCharged: 0 // free within policy
  };
}
```

### Dispute Resolution

```typescript
interface DisputeCase {
  id: string;
  appointmentId: string;
  raisedBy: 'client' | 'provider' | 'system';
  disputeType: 'no_show' | 'service_quality' | 'billing' | 'cancellation' | 'other';
  description: string;
  evidence: Array<{
    type: 'photo' | 'message' | 'recording' | 'document';
    url: string;
    submittedBy: string;
    submittedAt: Date;
  }>;
  status: 'open' | 'under_review' | 'resolved';
  resolution?: {
    decidedBy: string;
    decision: string;
    refundAmount?: number;
    creditIssued?: number;
    notes: string;
    decidedAt: Date;
  };
}

// Dispute escalation path:
// 1. Automated mediation (for simple cases)
// 2. Human review (customer support)
// 3. Escalation to management (high-value or complex)
```

---

## Appendix A: API Endpoints

### Referral Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/referrals` | Create new referral |
| GET | `/api/referrals` | List user's referrals |
| GET | `/api/referrals/:id` | Get referral details |
| POST | `/api/referrals/:id/send` | Send referral to recipient |
| POST | `/api/referrals/:id/accept` | Accept referral (recipient) |
| DELETE | `/api/referrals/:id` | Cancel referral |

### Appointment Booking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers/:id/availability` | Get provider available slots |
| POST | `/api/appointments` | Create appointment (booking) |
| GET | `/api/appointments/:id` | Get appointment details |
| PUT | `/api/appointments/:id` | Update appointment (reschedule) |
| DELETE | `/api/appointments/:id` | Cancel appointment |
| POST | `/api/appointments/:id/confirm` | Confirm appointment |
| POST | `/api/appointments/:id/complete` | Mark appointment complete |
| POST | `/api/appointments/:id/no-show` | Mark no-show |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/deposit` | Process deposit payment |
| POST | `/api/payments/full` | Process full payment |
| POST | `/api/payments/refund` | Process refund |
| GET | `/api/payments/transactions` | List payment history |

---

## Appendix B: Event Stream

```typescript
// Events emitted by the referral system
type ReferralEvent =
  | { type: 'REFERRAL_CREATED'; payload: Referral }
  | { type: 'REFERRAL_SENT'; payload: Referral }
  | { type: 'REFERRAL_VIEWED'; payload: { referralId: string; viewedAt: Date } }
  | { type: 'REFERRAL_ACCEPTED'; payload: Referral }
  | { type: 'APPOINTMENT_BOOKED'; payload: Appointment }
  | { type: 'APPOINTMENT_CONFIRMED'; payload: Appointment }
  | { type: 'APPOINTMENT_RESCHEDULED'; payload: { old: Appointment; new: Appointment } }
  | { type: 'APPOINTMENT_CANCELLED'; payload: { appointment: Appointment; reason: string } }
  | { type: 'APPOINTMENT_COMPLETED'; payload: Appointment }
  | { type: 'NO_SHOW_MARKED'; payload: { appointmentId: string; markedBy: string } }
  | { type: 'PAYMENT_RECEIVED'; payload: PaymentTransaction }
  | { type: 'REFUND_PROCESSED'; payload: PaymentTransaction }
  | { type: 'PAYOUT_INITIATED'; payload: ProviderPayout }
  | { type: 'REWARD_EARNED'; payload: ReferralReward };

// Example subscriber
eventStream.subscribe('REFERRAL_ACCEPTED', async (event) => {
  await analytics.track('referral_accepted', {
    referralId: event.payload.id,
    referrerId: event.payload.referrer_id,
    timestamp: event.payload.accepted_at
  });
  
  await notifications.send({
    templateId: 'referral_accepted_referrer',
    recipientId: event.payload.referrer_id,
    variables: extractVariables(event.payload)
  });
});
```

---

## Appendix C: Metrics & KPIs

| Metric | Formula | Target |
|--------|---------|--------|
| Referral Conversion Rate | accepted / sent | ≥ 40% |
| Acceptance-to-Booking Rate | scheduled / accepted | ≥ 70% |
| Booking Completion Rate | completed / scheduled | ≥ 85% |
| No-Show Rate | no_shows / scheduled | ≤ 5% |
| Cancellation Rate | cancelled / scheduled | ≤ 10% |
| Average Time to Accept | avg(accepted_at - sent_at) | < 48 hours |
| Reward Redemption Rate | claimed / earned | ≥ 60% |
| Provider Payout Success Rate | successful_payouts / total_payouts | ≥ 99% |

---

## Related Documents

- [Condition-Ingredient Mappings](./knowledge-graph/condition-ingredient-mappings.json)
- [Recommendation Engine](./knowledge-graph/RECOMMENDATION-ENGINE.md)
- [Database Schema](../supabase/schema.sql)

---

*Document version: 1.0 | Last updated: 2026-09-14*
