# Lovi.care Competitive Teardown — Post Face Scan Flow

> **Date:** 2026-05-19
> **Source:** Jason's screenshots (40+ screens analyzed)
> **Purpose:** Competitive benchmark for SKINgenius post-scan experience

---

## Complete User Flow (25+ Screens)

### PHASE 1: ONBOARDING & TRIAL
1. **Slide to Commit** — "Let's commit to care about yourself" (gradient blue text)
   - Slide-to-commit pill button (smiley emoji → right)
   - NLM citation: "The effectiveness of nudging" — academic credibility anchor
2. **How Your Trial Works** — modal overlay
   - Step 1: ✅ Goal set (pink, complete)
   - Step 2: 📱 Today — unlock routine + daily plan + tracking
   - Step 3: ⭐ In 3 days — "You'll be charged, cancel anytime"
   - CTA: "Start My Free Trial"
   - Links: "I have a promo code" | "Restore"

### PHASE 2: LOADING ANIMATION (Algorithm Theater)
Dark navy/black gradient + glowing cyan bokeh particles

| Stage | Number | Copy |
|-------|--------|------|
| 1 | 45,082 | "out of them match your face scanning results" |
| 2 | 1,029 | "out of them are suited for your skin conditions" |
| 3 | 64 | "out of them are the most effective choice for **you** in targeting **visible pores**" |
| 4 (final) | 8 | "out of them are the most effective choice for **you**" |

**Final screen:** "Your personal skincare program is ready!" → "Show My New Routine" CTA

**Psychology:**
- Anchoring (massive database)
- Sweat equity (forced wait)
- AI authority (particle animation)
- Personalization ("you" + "visible pores" highlighted in blue)

### PHASE 3: ANALYSIS RESULTS
7. **Zone-by-Zone Skin Analysis**
   - Filter tabs: All | Wrinkles | Freckles | Melasma
   - T-Zone: "Excessive Sebum and Congestion" — photo + description
   - Cheeks: "Visible Pore Size Reduction" — photo + description
   - Forehead: "Deep Forehead Wrinkle Lines" — photo + description
   - Each: cropped photo thumbnail, red label, bold title, gray description card

8. **Main Goal Progress**
   - Before/after comparison (baseline → now)
   - Goal zones highlighted (orange)
   - Green pill: "You are on track!"
   - Encouraging copy

9. **Skin Strengths** (positive reinforcement FIRST)
   - Cards: "Natural Resilience" (sparkle), "Self-Hydrating Capacity" (water drop), "High Cell Turnover"
   - Positive framing before prescribing problems

### PHASE 4: RECOMMENDATIONS
10. **5-Step General Skincare Routine** (advice, not products yet)

### PHASE 5: PRODUCT ROUTINE (Revenue Engine)

**Morning Routine (6 steps):**
| Step | Category | Product | Brand | Price | Fit |
|------|----------|---------|-------|-------|-----|
| 1-2 | Cleanser | Clear Skin Probiotic Cleanser | Eminence Organic | $37.17 | 99% |
| 3 | Toner | Lotion P50 | Biologique Recherche | $189.00 | 89% |
| 4 | Serum | Professional-C Serum 20% | Obagi | $155.00 | 92% |
| 5 | Moisturizer | Squalane + Copper Peptide Plumping Serum | Biossance | $69.00 | 91% |
| 6 | Serum/Treatment | Professional-C Serum 20% | Obagi | $155.00 | 92% |

**Weekly Routine:**
| Step | Category | Product | Brand | Price | Fit |
|------|----------|---------|-------|-------|-----|
| 1 | Pre-Cleanser | Ultime8 Sublime Beauty Cleansing Oil | Shu Uemura | $110.00 | 86% |
| 2 | Cleanser | Clear Skin Probiotic Cleanser | Eminence Organic | $37.17 | 99% |
| 4 | Cleansing Mask | Black Mask | Revision Skincare | $79.00 | 99% |

**Products Tab — Category Organization:**
- Weekly Clay Detox: Glamglow Supermud ($42, 90%), Sand & Sky Pink Clay ($39, 89%)
- Niacinamide Pore Smoothers: (2 products, 97-99% fit)
- Organized by ingredient/concern, not flat list

**Per-Product Card Anatomy:**
- Product image
- Fit% badge (purple/green pill)
- "Lóvi MD Verified" blue pill badge
- "Why we picked it" — ingredient-specific explanation copy
- Yellow Amazon button with price
- White "X alternatives" button
- Blue gradient "Continue" button
- Persistent bottom "🛒 Buy Routine" cart button

### PHASE 6: POST-ROUTINE ENGAGEMENT

**Feedback Popup:**
- "Love to see you here. Do you love us back?"
- From Julia, Lóvi Team (personalized signature)
- "I'm in" / "Maybe later"

**Today Dashboard:**
- Daily tasks, week view with completion checkmarks
- "First Steps" checklist (Meet Lóvi Cosmetics Scanner, Learn About Daily Plan)
- Goal badge: "Visible Pores Goal"
- Date picker: Sun-Sat with completed/active states

**AI Cosmetologist Chat:**
- "Ask Lóvi anything..." input field
- Prompt suggestions:
  - "Skincare products you should never mix"
  - "How to prevent wrinkles"
  - "Foods that help tighten oily skin"
  - "Skincare mistakes you should know"
  - "Does intimacy affect your skin health?"
  - "Prevent face aging with this simple routine"

**Daily Affirmation:**
- Gradient purple card
- "Tap to reveal" motivational content

**Insights Tab:**
- "What is Lóvi?" (101 tutorials, 1 min reads)
- "Skincare Trends" (K-Beauty, PDRN, etc.)
- Knowledge cards with read time indicators

**New Scan Modal:**
- Face scan (limited — "No free scans")
- Cosmetics scan ("2 scans left")
- Scan-gating as monetization

**Premium Upsell:**
- "Switch to Lóvi Premium" persistent button
- Appears on Today, Products, Insights tabs

---

## MONETIZATION STACK

| Revenue Stream | Implementation | Estimated Take |
|----------------|----------------|----------------|
| Amazon Affiliate | Per-product yellow CTA buttons | 4-8% per sale |
| Product Alternatives | "X alternatives" buttons = more clicks | More affiliate clicks |
| Buy Routine | Bundle purchase cart | One-time purchase |
| Free Trial → Subscription | 3-day free, then charged, cancel anytime | Recurring revenue |
| Scan Gating | Limited free scans, pay for more | Conversion driver |
| Premium Tier | Persistent upsell across app | Subscription upsell |
| Budget Tiers | User sets $100+ → routine adapts price range | AOV optimization |

---

## APP NAVIGATION (Bottom Tab Bar)

| Tab | Icon | Purpose |
|-----|------|---------|
| Today | ☀️ Sunrise | Daily tasks, routine, chat, affirmations |
| Products | 🧴 | Product catalog by category/ingredient |
| New Scan | 📷 | Face scan + cosmetics scan |
| Insights | 📊 | Educational content, trends |
| Sunshine | 😊 | User profile/personal |

---

## UX PATTERNS WORTH STEALING

1. **Commitment slider before paywall** — psychological buy-in
2. **Strengths before problems** — positive framing first
3. **Algorithm theater** — 45K → 8 funnel builds perceived value
4. **"Why we picked it"** — ingredient-specific copy per product builds trust
5. **Fit% badges** — quantified personalization
6. **MD Verified** — medical authority trust signal
7. **Alternatives system** — budget flexibility + more affiliate revenue
8. **Daily engagement layer** — tasks, chat, affirmations drive retention
9. **Scan gating** — limited free scans as conversion lever
10. **Personalized names** — "Sunshine's Routine Formula" feels personal

---

## WHAT SKINGENIUS NEEDS TO MATCH

| Layer | Lovi Has | SKINgenius Status | Build Priority |
|-------|----------|-------------------|----------------|
| AI Face Analysis | ✅ | ✅ Built | Done |
| Zone-by-Zone Results | ✅ | ✅ Built | Done |
| Loading Animation | 45K→8 funnel | ❌ Not built | Medium |
| Strengths Cards | ✅ | ❌ Not built | Low |
| Commitment Slider | ✅ | ❌ Not built | Low |
| Product Recommendation Engine | Condition→Ingredient→Product | ⚠️ Partial | **HIGH** |
| Routine Builder | AM/PM/Weekly steps | ❌ Not built | **HIGH** |
| Affiliate Links | Amazon per product | ❌ Not built | **HIGH** |
| Fit% Scoring | ✅ | ❌ Not built | Medium |
| MD Verified Badge | ✅ | ❌ Not built | Low |
| Product Alternatives | ✅ | ❌ Not built | Medium |
| AI Chat | "Ask Lóvi" | ❌ Not built | Medium |
| Daily Tasks/Affirmations | ✅ | ❌ Not built | Low |
| Progress Tracking | Before/after comparison | ❌ Not built | Medium |
| Insights/Education | ✅ | ❌ Not built | Low |
| Scan Gating | ✅ | ❌ Not built | Low |
| Premium Tier | ✅ | ❌ Not built | Low |
| Budget Tier Filtering | ✅ | ❌ Not built | Medium |
| Feedback/Rating | ✅ | ❌ Not built | Low |
| Buy Routine (Cart) | ✅ | ❌ Not built | Medium |
| Progress Calendar | ✅ | ❌ Not built | Low |
| Massage/Exercise Guides | ✅ | ❌ Not built | Low |
| Skincare Academy (Education) | ✅ | ❌ Not built | Low |
| Locked Premium Content | ✅ | ❌ Not built | Low |
| Step Timers (Routine) | ✅ | ❌ Not built | Low |

---

## NEW SCREENS ADDED (Screens 21-25)

### Sunshine Tab — Progress Calendar
- Monthly calendar with avatar dots on scan days
- Visual consistency tracker (gamification)
- "Scans & Diary — May" header

### Today — Massage & Guide Cards
- "Massages for your focus area" — facial massage routines
- Cards: Massage Between Eyebrows (4 steps, 14 min), Massage Nasolabial Area (5 steps, 12 min)
- "Handcrafted Skincare Guides" by Lovi Medical Team
  - Sunscreen Guide (SPF, 20 min), Weekly Guide (27 pages)
- Routine step cards with timers ("Start 2 min")

### Insights — Skincare Academy (Wrinkles)
- Condition-specific education hub
- Content cards: "Skincare Rules Everyone Should Know" (Basics, 2 min), "Why Do I Need Vitamin D?" (Nutrition, 1 min)
- "Have You Ever Heard About Double Cleansing?" (Basics, 2 min), "Is Acne Genetic or Environmental?" (Acne, 1 min)
- Massage tutorials: Forehead (8 steps, 18 min), Eye Area (7 steps, 23 min)
- All content locked behind Premium (lock icons)

---

*Standing by for additional screenshots.*
