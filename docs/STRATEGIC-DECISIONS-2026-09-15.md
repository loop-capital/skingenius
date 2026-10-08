# 2026-09-15/16 — Strategic Decisions Record

> **Purpose:** Canonical record of all product, architecture, and business decisions made during the Sep 15-16 session.
> **Status:** Active — decisions are binding until superseded by explicit revision.

---

## 1. Vision Model Architecture

**Decision:** Three-tier scan model with different AI backends per tier.

| Tier | Cost | Scans/Month | Model | Ads | Conditions |
|------|------|-------------|-------|-----|------------|
| Free | $0 | 4 | On-device (TensorFlow Lite) | Yes | 5 core |
| Pro | $4.99/mo | Unlimited | Cloud (Gemini 1.5 Pro) | No | 25 total |
| Pro+ | $9.99/mo | Unlimited | Cloud + facial aesthetics | No | 25 + aesthetics |

**Rationale:** Free tier is ad-supported hook. Pro tier funds cloud API costs. Pro+ adds facial aesthetics analysis.

**Files:** `specs/VISION-MODEL-ARCHITECTURE.md`

---

## 2. Revenue Model — Referral Fees

**Decision:** 15% of total service value, deducted from 20% deposit collected at booking.

**Example ($150 service):**
- User pays $30 deposit (20%)
- Platform keeps $22.50 (15% of $150)
- Provider receives $7.50 from deposit
- Provider collects $120 balance at appointment
- Provider total: $127.50

**No-show policy:** User removed from platform, deposit forfeited.

**Legal safeguard:** Only apply to non-physician providers (estheticians, injectors). Physicians get directory listing fees only — no per-referral fees (Stark Law / Anti-Kickback Statute).

**Files:** `specs/REFERRAL-SYSTEM-SPEC.md`

---

## 3. Revenue Model — Manufacturer Partnerships

**Decision:** Charge manufacturers (Galderma, Allergan, Merz) for leads and acquisitions, NOT providers.

**Event types:**
- **CPL (Cost Per Lead):** $50-150 when user books consultation mentioning specific product
- **CPA (Cost Per Acquisition):** $200-500 when provider confirms treatment with specific product
- **Certification View:** $25-50 when user views certified provider profile
- **Clinical Trial Enrollment:** $500-2,000 per enrolled patient

**Attribution chain:** scan → condition → product → manufacturer → consultation → treatment

**Legal basis:** B2B marketing fees — not physician referral fees.

**Files:** `specs/MANUFACTURER-TRACKING-SPEC.md`

---

## 4. Certified Injector Network

**Decision:** Manufacturers certify providers on their products. SKINgenius lists ONLY certified providers for specific treatments.

**The virtuous cycle:**
1. Manufacturer certifies provider → sells training courses
2. Provider gets exclusive listing → stands out from competition
3. User sees certification badge → trusts provider is trained
4. Platform gets revenue from certification leads + patient referrals

**Certification flow:** Program creation → application → training → issuance → annual recertification

**Revenue:** Certification lead fee ($25-50/view) + annual listing fee ($500-1,000/provider)

**Files:** `specs/CERTIFIED-INJECTOR-NETWORK-SPEC.md`

---

## 5. Clinical Scan Escalation

**Decision:** When scan detects urgent/severe conditions, offer $49 dermatologist review.

**Flow:**
1. Scan flags concerning finding → "Clinical review recommended"
2. User fills checkout (name, email, phone, insurance, photos, consent)
3. Dermatologist reviews within 24-48 hours
4. Patient gets diagnosis, prescription, provider referrals

**Payment:** $49 one-time via Stripe (mocked in prototype, wire real Stripe before production)

**Files:** `specs/CLINICAL-SCAN-FLOW-SPEC.md`

---

## 6. Provider Types — Aesthetics Expansion

**Decision:** Expand beyond dermatologists to include aesthetics providers.

| Provider Type | Can Do | Fee Structure |
|--------------|--------|---------------|
| Dermatologist (MD/DO) | Medical, prescriptions | Directory listing only (no referral fees) |
| Esthetician | Facials, peels | 15% referral fee |
| Plastic Surgeon (MD/DO) | Surgical procedures | Directory listing only |
| Injector (NP/PA) | Botox, fillers, biostimulators | 15% referral fee |
| Medical Esthetician | Advanced procedures | 15% referral fee |

**Key condition:** "Ozempic face" / volume loss → biostimulator recommendation → injector referral

**Files:** `docs/AESTHETICS-CONDITION-PROVIDER-MAP.md`

---

## 7. Google Calendar Integration

**Decision:** Phase 1 — Google Calendar OAuth as universal availability adapter.

**What it does:**
- Provider connects Google Calendar in dashboard
- System reads busy times, generates available slots
- When user books, creates event in provider's calendar

**Why Google Calendar first:** Universal — works regardless of booking system (Square, Mindbody, Phorest)

**Future phases:** Square Bookings API (Month 2-3), Mindbody/Phorest (Month 4+)

**Files:** Built in `src/lib/provider/google-calendar.ts`

---

## 8. Unified Data Model — Conflict Resolutions

**Decision:** The following conflicts were resolved in `specs/MASTER-SYSTEM-ARCHITECTURE.md`:

| Conflict | Resolution | Rationale |
|----------|------------|-----------|
| Provider identity canonical table | `provider_profiles` is canonical | GetUpLook legacy `users.role='provider'` deprecated |
| Clinical reviews separate table | Reuse `appointments` with `type='clinical_review'` | Avoids duplication, links to booking system |
| Referral vs booking lifecycle | `referrals` tracks leads, `appointments` tracks bookings | Separate concerns, link via `referral_id` |
| Manufacturer attribution | Events reference both `referral_id` AND `appointment_id` | Supports both lead and conversion attribution |

**Files:** `specs/MASTER-SYSTEM-ARCHITECTURE.md`

---

## 9. Build Process Change

**Decision:** Shift from "build fast, ask questions later" to "plan first, then execute."

**New process:**
1. Architect creates master architecture document
2. CEO + dev + devops review for gaps and conflicts
3. Jason approves unified plan or tells us what to change
4. THEN dispatch dev agents with clear build order

**Rationale:** Prevents fragmentation, conflicting data models, and technical debt.

---

## 10. Product-Provider Separation

**Decision:** Product sales are Phase 2 revenue. Building SKINgenius platform is Phase 1 priority.

**Phase 1:** Platform (scan → analysis → referral → booking)
**Phase 2:** Product marketplace (affiliate sales, recovery kits)

**Product lines accessible through PLEIJ Salon / GetUpLook online store.** Manufacturers may sell direct with affiliate fees.

---

## 11. Free Tier Limitations

**Decision:** Free tier = 4 scans per month, ad-supported, 5 conditions only.

**Rationale:** Enough for user to experience value, not enough to satisfy ongoing need. Drives Pro conversion.

---

## 12. No Monthly Fee for Providers

**Decision:** Curated providers (invited, not self-serve) pay no monthly platform fee.

**Revenue from providers:** Per-referral fee (15%) OR directory listing fee — not both.

**Value-adds for providers (free):**
- Backlinks to website (SEO)
- Instagram photo feed on profile
- Follow button
- Customer scan data sharing (with consent)

---

## 13. Ad Integration Strategy

**Decision:** Ads are the free tier revenue source, not the primary business model.

**Ad types:**
- **Contextual:** Shown next to relevant scan results (not random)
- **Educational:** "Learn how Sculptra works" not "Buy now"
- **Manufacturer-sponsored:** Content on specific condition pages

**Revenue target:** ~$0.50/month per free user (light, non-intrusive)

---

## Files Created Tonight

### Specs (9)
- `specs/REFERRAL-SYSTEM-SPEC.md`
- `specs/REFERRAL-UX-SPEC.md`
- `docs/CONDITION-INGREDIENT-MAPPING.md`
- `specs/VISION-MODEL-ARCHITECTURE.md`
- `docs/DERMATOLOGY-PARTNERSHIP-RESEARCH.md`
- `specs/CLINICAL-SCAN-FLOW-SPEC.md`
- `docs/AESTHETICS-CONDITION-PROVIDER-MAP.md`
- `specs/CERTIFIED-INJECTOR-NETWORK-SPEC.md`
- `specs/MANUFACTURER-TRACKING-SPEC.md`
- `specs/MASTER-SYSTEM-ARCHITECTURE.md`

### Research (2)
- `docs/CONDITION-INGREDIENT-MAPPING.md`
- `docs/AESTHETICS-CONDITION-PROVIDER-MAP.md`

### Code Built (7 components)
- Scan API endpoint
- Referral APIs (5 endpoints)
- Provider dashboard (5 pages)
- Pro upgrade flow (paywall, Stripe checkout)
- Google Calendar integration
- Consumer scan results UI (3 pages)
- Clinical scan escalation (4 pages, 3 APIs)
- Manufacturer dashboard (6 pages)

---

## Open Questions for Jason

1. **Stripe keys:** Need real test/live keys for Pro upgrade and clinical checkout
2. **Google Calendar OAuth:** Need OAuth client ID/secret for provider calendar sync
3. **Manufacturer partnerships:** Which manufacturers to approach first (Galderma, Allergan, Merz)?
4. **Clinical trial partners:** Any existing relationships with dermatology research groups?
5. **Provider onboarding:** How do we invite initial providers? GetUpLook relationship?
6. **Legal review:** Healthcare counsel to review manufacturer fee structure?
7. **HIPAA compliance:** Business Associate Agreements with providers needed?

---

*Record created: 2026-09-16 00:08 EDT*
*Next review: After master architecture approval*
