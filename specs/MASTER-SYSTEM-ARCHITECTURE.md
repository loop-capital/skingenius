# SKINgenius + GetUpLook Master System Architecture

**Version:** 1.1
**Status:** Updated — Reflecting Sep 16 decisions
**Created:** 2026-09-16
**Author:** SKINgenius Architect + CEO

---

## 1. System Overview

**Two platforms, one infrastructure:**
- **SKINgenius:** Consumer-facing skincare AI app (scan → analysis → referral → booking)
- **GetUpLook:** Provider directory + booking platform (directory → booking → payment)
- **Shared:** Booking layer, payment processing (Square), provider database, manufacturer network

**White-labeling:** Same backend, different branding per platform.
- SKINgenius bookings → SKINgenius-branded
- GetUpLook bookings → GetUpLook-branded

---

## 2. GetUpLook Current State

**What exists today:**
- Provider directory (6 providers, 225 services)
- Provider profiles with Square booking links in `website_url`
- No payment processing by GetUpLook
- No booking infrastructure (bookings table is empty shell)
- Static marketing site (not wired to Supabase)

**What we build:**
- Unified booking layer (new)
- Deposit collection via Square (new)
- Provider payout system (new)
- In-app scheduling (new)

---

## 3. Unified Data Model

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Authentication + profiles | id, email, subscription_tier, platform (skingenius \| getuplook) |
| `provider_profiles` | **Canonical provider data** | id, provider_type, certifications, specialties, square_account_id |
| `referrals` | Lead lifecycle | id, status, provider_id, user_id, scan_id, platform |
| `appointments` | Booking lifecycle | id, type (standard \| clinical_review), status, platform |
| `scan_results` | AI analysis output | id, tier, conditions (JSONB), overall_score, urgent_flag |
| `clinical_reviews` | Escalation cases | id, appointment_id, diagnosis, prescription, dermatologist_id |
| `manufacturer_revenue_events` | Attribution | id, event_type, amount, manufacturer_id, referral_id, appointment_id |
| `provider_certifications` | Manufacturer certs | id, provider_id, manufacturer_id, product_id, expiry_date |

### Conflict Resolutions

1. **Provider identity:** `provider_profiles` is canonical. `users.role='provider'` deprecated.
2. **Clinical reviews:** Reuse `appointments` with `type='clinical_review'`.
3. **Referral vs booking:** `referrals` tracks leads, `appointments` tracks bookings. Linked by `referral_id`.
4. **Manufacturer attribution:** Events reference both `referral_id` AND `appointment_id`.

---

## 4. White-Label Architecture

### Platform Detection
```
Request header or subdomain determines branding:
- skingenius.com → SKINgenius branding
- getuplook.com → GetUpLook branding
- API returns platform-specific colors, logos, terms
```

### Shared Components
- Booking engine (same backend)
- Payment processing (same Square integration)
- Provider database (same Supabase)
- Calendar sync (same Google Calendar)

### Platform-Specific Components
- Landing page
- Scan flow (SKINgenius only)
- Provider discovery UX
- Terms of service
- Privacy policy

---

## 5. Revenue Architecture

### Consumer Revenue (SKINgenius)
- **Pro subscription:** $4.99/mo
- **Pro+ subscription:** $9.99/mo

### Provider Revenue
- **Per-referral fee:** 15% of service value (NON-PHYSICIAN ONLY)
- **Directory listing:** $99-299/mo featured placement

### Manufacturer Revenue
- **CPL:** $50-150 per consultation booking
- **CPA:** $200-500 per confirmed treatment
- **Certification view:** $25-50 per profile view

### Clinical Revenue
- **Clinical review:** $49 one-time

### LEGAL STATUS
- **Non-physician providers (estheticians, injectors):** ✅ Platform fee model — proceed
- **Physician providers (dermatologists, surgeons):** ⛔ BLOCKED pending legal review
  - Directory listings only ($99-299/mo)
  - NO deposit collection for physician consultations until counsel approves
  - Jason handling legal review

---

## 6. Payment Processing (Square)

**Why Square:**
- GetUpLook providers already use Square
- Lower friction than Stripe (existing accounts)
- APIs for checkout, subscriptions, marketplace payouts

**Square Integration:**
- **Checkout API:** One-time payments ($49 clinical review)
- **Subscriptions API:** Recurring Pro subscriptions ($4.99/mo)
- **Webhooks:** Payment confirmation, subscription updates
- **Marketplace API:** Provider payouts (future)

**Deposit Flow:**
```
User books service ($150)
    |
    v
Square Checkout: collect $30 deposit (20%)
    |
    v
Platform holds $30
    |
    v
Platform pays provider $127.50 (after 15% fee)
    |
    v
Provider collects $120 balance at appointment
```

---

## 7. External Integrations

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| **Square** | Payment processing | API (Checkout, Subscriptions, payouts) |
| **Google Calendar** | Provider availability | OAuth + Calendar API v3 |
| **Supabase** | Database + Auth | REST API + Realtime |
| **Gemini 1.5 Pro** | Cloud scan model | Google AI SDK (SKINgenius only) |
| **TensorFlow Lite** | On-device scan model | Client-side inference (SKINgenius only) |
| **Manufacturer APIs** | Certification webhooks | REST webhooks |

---

## 8. Build Order & Dependencies

### Phase 1: Foundation (Week 1-2)
1. Fix data model conflicts
2. Set up Square integration
3. Connect Gemini API (SKINgenius)
4. Seed provider data from GetUpLook

### Phase 2: Non-Physician Booking (Week 3-4) ✅ PROCEED
5. Square checkout for deposits
6. Provider payout system
7. In-app scheduling
8. Google Calendar sync

### Phase 3: Consumer Features (Week 5-6)
9. Scan results UI
10. Pro upgrade flow
11. Ad integration (free tier)

### Phase 4: Manufacturer (Week 7-8)
12. Manufacturer tracking API
13. Certified injector network
14. Manufacturer dashboard

### Phase 5: Physician Integration (Week 9+) ⛔ BLOCKED
15. Physician directory listings
16. Physician deposit collection — **PENDING LEGAL REVIEW**
17. Clinical trial recruitment

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Status |
|------|-----------|--------|--------|
| HIPAA compliance | Medium | Critical | Mitigating |
| Physician referral fees (Stark Law) | Medium | Critical | **BLOCKED pending legal review** |
| Scan accuracy (liability) | Medium | High | Mitigating |
| Provider adoption | Medium | High | Monitoring |
| Manufacturer API changes | Low | Medium | Monitoring |
| Square integration issues | Low | Medium | Monitoring |

---

## 10. Open Questions

1. **Square API keys:** Need sandbox + production keys
2. **GetUpLook Square integration:** Build from scratch or leverage existing?
3. **Provider onboarding:** Invite-only or application-based?
4. **Manufacturer partnerships:** Which to approach first?
5. **Legal review:** Healthcare counsel for physician deposit model? *(Jason handling)*
6. **HIPAA:** Business Associate Agreements with providers?
7. **Launch scope:** MVP features vs. full marketplace?
8. **Physician integration:** Directory listings only until legal review complete? *(Jason handling)*

---

*Document version: 1.1 | Updated: 2026-09-16 | Next review: After legal review + Jason approval*
