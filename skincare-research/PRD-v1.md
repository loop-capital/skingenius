# SKINgenius Product Requirements Document (PRD) v1.0

**Date:** May 13, 2026  
**Owner:** Lucy Research Team (Strategy) / Che's Team (Development)  
**Status:** Draft for Development Handoff

---

## 1. Product Overview

### 1.1 Product Name
SKINgenius

### 1.2 One-Sentence Description
AI-powered skin health platform combining clinical-grade photo analysis with personalized, evidence-based skincare education for adults 40+.

### 1.3 Problem Statement
Gen X adults (40-60) are underserved by youth-focused beauty marketing and overwhelmed by conflicting skincare information. They need trustworthy, personalized guidance that respects their intelligence and addresses age-specific concerns.

### 1.4 Solution
- Phone-camera skin analysis with 8+ metrics
- Evidence-based product recommendations
- Comprehensive ingredient education
- Progress tracking with photo timelines
- Holistic skin health content

### 1.5 Target Release
- Beta: Month 3 (500 invited users)
- Public Launch: Month 6 (10,000 users)
- Premium Launch: Month 9

---

## 2. User Personas

### 2.1 Primary: Gen X Woman (45-55)
**Name:** "Vital Sarah"  
**Behaviors:** Researches before buying, reads reviews, values expert opinions, loyal once trust is earned  
**Goals:** Maintain healthy skin, prevent accelerated aging, understand what actually works  
**Pain Points:** Overwhelmed by influencer content, distrusts "anti-aging" hype, wants proof not promises  
**Tech Comfort:** Comfortable with smartphones, prefers email over social, uses apps for practical purposes

### 2.2 Secondary: Millennial Woman (32-38)
**Name:** "Prevention Priya"  
**Behaviors:** Digitally native but seeking substance, prevention-focused, skeptical of trends  
**Goals:** Start right, avoid mistakes, invest in long-term skin health  
**Pain Points:** Information overload, unsure which ingredients matter, wants guidance not more options

### 2.3 Tertiary: Man (42-52)
**Name:** "Practical Paul"  
**Behaviors:** Solution-oriented, minimal routine, willing to invest in what works  
**Goals:** Simple, effective routine, address specific concerns (aging, shaving irritation)  
**Pain Points:** Stigma around male skincare, lack of targeted education, products feel feminine-coded

---

## 3. User Stories & Acceptance Criteria

### Epic 1: Onboarding

#### US-1.1: Account Creation
**As a** new user, **I want to** create an account with email/password, **so that** I can save my skin data and track progress.

**Acceptance Criteria:**
- [ ] Email validation (format + uniqueness check)
- [ ] Password: min 8 chars, 1 uppercase, 1 number, 1 special
- [ ] Optional: profile photo upload (for progress tracking comparison)
- [ ] Terms of service + privacy policy acceptance (required)
- [ ] Welcome email sent upon verification
- [ ] Account creation completes in < 30 seconds

#### US-1.2: Skin Profile Setup
**As a** new user, **I want to** answer questions about my skin, **so that** recommendations are personalized.

**Acceptance Criteria:**
- [ ] Age range selection (30-39, 40-49, 50-59, 60+)
- [ ] Self-identified skin type (dry, oily, combination, normal, sensitive)
- [ ] Top 3 skin concerns (multi-select from list of 12)
- [ ] Current routine complexity (none, basic, moderate, advanced)
- [ ] Budget preference ($, $$, $$$)
- [ ] Skippable with "I'll complete this later" option

#### US-1.3: Camera Permission & Education
**As a** new user, **I want to** understand why the app needs camera access, **so that** I feel comfortable granting permission.

**Acceptance Criteria:**
- [ ] Clear explanation: photos are for analysis only, encrypted storage
- [ ] Visual demo of how analysis works (illustration or short video)
- [ ] Privacy commitment: "We never share your photos without consent"
- [ ] Permission request with system dialog fallback
- [ ] Option to skip and grant later (with reminder)

---

### Epic 2: AI Skin Analysis

#### US-2.1: Guided Photo Capture
**As a** user, **I want to** take photos with real-time guidance, **so that** analysis is accurate.

**Acceptance Criteria:**
- [ ] Frontal face capture with oval overlay guide
- [ ] Left profile capture (optional but recommended)
- [ ] Right profile capture (optional but recommended)
- [ ] Real-time quality feedback:
  - Lighting: "Too dark" / "Too bright" / "Good lighting"
  - Face position: "Move closer" / "Center your face" / "Perfect"
  - Shadows: "Reduce shadows" / "Good"
- [ ] Multiple capture attempts allowed (save best)
- [ ] Preview with retake option before submission
- [ ] Total capture time: < 90 seconds for all 3 angles

#### US-2.2: Analysis Processing
**As a** user, **I want to** receive my skin analysis quickly, **so that** I stay engaged.

**Acceptance Criteria:**
- [ ] Upload to cloud processing queue
- [ ] Progress indicator: "Analyzing your skin..." with educational tip rotation
- [ ] Processing time: < 15 seconds (p95)
- [ ] Fallback: if processing > 30 seconds, notify user and send push when complete
- [ ] Error handling: "We couldn't analyze this photo. Let's try again." with guidance

#### US-2.3: Results Dashboard
**As a** user, **I want to** see my skin analysis results clearly, **so that** I understand my skin's condition.

**Acceptance Criteria:**
- [ ] Overall skin score (1-100) with age comparison
- [ ] 8 metric cards, each with:
  - Score (1-10)
  - Label (Fine Lines, Texture, Evenness, Dark Circles, Pores, Redness, Under-Eye Bags, Hydration)
  - Color coding: green (7-10), yellow (4-6), red (1-3)
  - Age-matched percentile ("Better than 65% of women your age")
- [ ] Tap any metric for detailed explanation
- [ ] Skin age estimate with confidence range
- [ ] Share button (optional, with privacy warning)
- [ ] Download results as PDF (premium feature)

#### US-2.4: Metric Deep Dive
**As a** user, **I want to** learn what each metric means, **so that** I can take appropriate action.

**Acceptance Criteria:**
- [ ] What this metric measures (plain language explanation)
- [ ] Why it matters for your age group
- [ ] Contributing factors (genetics, lifestyle, environment)
- [ ] Evidence-based improvement strategies (3-5 bullets)
- [ ] Related ingredients/products (links to routine builder)
- [ ] "When to see a professional" guidance (if score < 4)

---

### Epic 3: Routine Builder

#### US-3.1: Goal Selection
**As a** user, **I want to** select my skincare goals, **so that** my routine addresses my priorities.

**Acceptance Criteria:**
- [ ] Pre-populated from skin profile concerns
- [ ] Option to modify/reorder priorities
- [ ] Goal options: Anti-aging, Hydration, Brightening, Calming, Pore Refining, Firming, Even Tone, Acne Prevention
- [ ] Max 3 goals for focused routine
- [ ] Each goal shows estimated timeline to results ("Most see improvement in 6-8 weeks")

#### US-3.2: Current Product Scan
**As a** user, **I want to** scan products I already own, **so that** the app works with my existing routine.

**Acceptance Criteria:**
- [ ] Barcode scanner (camera-based)
- [ ] Manual entry fallback (brand + product name search)
- [ ] Product database lookup (top 500 brands at launch)
- [ ] Ingredient list parsing from database
- [ ] "Product not found" flow: manual ingredient entry or photo of label
- [ ] Save to "My Products" inventory

#### US-3.3: AI Routine Generation
**As a** user, **I want to** receive a personalized routine, **so that** I know what to use and when.

**Acceptance Criteria:**
- [ ] AM routine: 3-5 steps (cleanser, treatment, moisturizer, sunscreen)
- [ ] PM routine: 3-5 steps (cleanser, treatment, moisturizer, optional)
- [ ] Each step includes: product type, key ingredient, why it helps your goals
- [ ] Product recommendations from database (with price, rating, purchase links)
- [ ] Option to replace with products from "My Products"
- [ ] Routine complexity matches user preference (basic/moderate/advanced)
- [ ] Estimated monthly cost display
- [ ] "Too many steps?" simplification option

#### US-3.4: Ingredient Education
**As a** user, **I want to** learn about any ingredient, **so that** I understand what I'm putting on my skin.

**Acceptance Criteria:**
- [ ] Tap any ingredient in routine for deep dive
- [ ] Plain language description ("What it is")
- [ ] Function explanation ("What it does")
- [ ] Evidence level: Strong / Moderate / Emerging / Limited
- [ ] Best for: skin types, concerns, age groups
- [ ] Cautions: interactions, pregnancy, sensitivities
- [ ] Related ingredients (comparisons, alternatives)
- [ ] Source citations (links to studies)

---

### Epic 4: Progress Tracking

#### US-4.1: Photo Timeline
**As a** user, **I want to** compare photos over time, **so that** I can see my progress.

**Acceptance Criteria:**
- [ ] Side-by-side comparison tool (any two dates)
- [ ] Slider overlay (before/after on same photo)
- [ ] Album view: all photos chronologically
- [ ] Photo capture reminders (configurable: weekly, bi-weekly, monthly)
- [ ] Consistent lighting/positioning guidance for comparable photos
- [ ] Optional: add notes to each photo (new products, lifestyle changes)

#### US-4.2: Metric Trends
**As a** user, **I want to** see how my skin metrics change over time, **so that** I know if my routine is working.

**Acceptance Criteria:**
- [ ] Line chart for each metric (last 6 months)
- [ ] Overall score trend
- [ ] Skin age estimate trend
- [ ] Annotation markers (new routine start, product changes, lifestyle events)
- [ ] Milestone celebrations ("Hydration improved 20%!")
- [ ] Export data as CSV (premium)

#### US-4.3: Skin Journal
**As a** user, **I want to** log notes about my skin, **so that** I can identify patterns.

**Acceptance Criteria:**
- [ ] Daily quick log: mood, sleep hours, water intake, stress level
- [ ] Skin-specific notes: breakouts, reactions, observations
- [ ] Product reactions log: started/stopped products, reactions
- [ ] Photo attachment option
- [ ] Tag system for filtering (#travel, #stress, #newproduct)
- [ ] Weekly summary view

---

### Epic 5: Content Discovery

#### US-5.1: Browse Library
**As a** user, **I want to** explore educational content, **so that** I can learn more about skin health.

**Acceptance Criteria:**
- [ ] Categories: Ingredients, Concerns, Routines, Lifestyle, Science Basics
- [ ] Search: by ingredient name, concern, product type
- [ ] Filter: by evidence level, reading time, complexity
- [ ] Related articles at bottom of each piece
- [ ] Save for later (bookmark)
- [ ] Share (with SKINgenius branding)

#### US-5.2: Personalized Content Feed
**As a** user, **I want to** see content relevant to my skin profile, **so that** I get value without searching.

**Acceptance Criteria:**
- [ ] Home screen: "For You" feed based on skin profile + recent activity
- [ ] Recommendations: articles matching your concerns and goals
- [ ] New ingredient spotlight (weekly rotation)
- [ ] "Trending in your age group" (anonymized)
- [ ] Fresh content indicator (new since last visit)

#### US-5.3: Evidence Grading
**As a** user, **I want to** understand how trustworthy information is, **so that** I can make informed decisions.

**Acceptance Criteria:**
- [ ] Every article shows evidence grade:
  - 🔷 Strong: Multiple peer-reviewed RCTs
  - 🔶 Moderate: Limited RCTs + strong mechanistic evidence
  - 🟢 Emerging: Preclinical + early clinical data
  - ⚪ Limited: Anecdotal/theoretical only
- [ ] Source list with links (minimum 3 for Strong, 1 for Limited)
- [ ] "How we grade evidence" explainer article
- [ ] Date published + last reviewed

---

### Epic 6: Premium Features (v2)

#### US-6.1: Advanced Analysis
**As a** premium user, **I want** deeper skin analysis, **so that** I get more detailed insights.

**Acceptance Criteria:**
- [ ] 12+ metrics (add: elasticity, pigmentation depth, vascularity, sebum production)
- [ ] 3D skin surface visualization
- [ ] UV damage mapping
- [ ] Comparison to ideal skin for age (not just peer average)
- [ ] Priority metric identification ("Focus here first")

#### US-6.2: Expert Q&A
**As a** premium user, **I want to** ask questions to skin experts, **so that** I get personalized advice.

**Acceptance Criteria:**
- [ ] Submit question via text or photo
- [ ] 24-48 hour response guarantee
- [ ] Answered by verified dermatologist or esthetician
- [ ] Response includes: assessment, recommendation, when to see in-person derm
- [ ] Question history searchable
- [ ] "Common questions" knowledge base

#### US-6.3: Provider Directory
**As a** premium user, **I want to** find trusted providers near me, **so that** I can get professional treatment.

**Acceptance Criteria:**
- [ ] Search by location, treatment type, provider type
- [ ] Verified profiles: credentials, specialties, reviews
- [ ] Integration with analysis results ("Based on your scores, consider consulting a provider for [metric]")
- [ ] Booking integration (where available)
- [ ] Provider content: articles, videos from verified professionals

---

## 4. Non-Functional Requirements

### 4.1 Performance
- App launch: < 2 seconds
- Photo analysis processing: < 15 seconds (p95)
- Page load (content): < 1 second
- API response time: < 200ms (p95)
- App crash rate: < 1%

### 4.2 Reliability
- API uptime: > 99.5%
- Photo storage: 99.999% durability
- Backup: Daily automated backups, 30-day retention
- Graceful degradation: Offline mode for content, queue analysis for later

### 4.3 Security & Privacy
- End-to-end encryption for photos (at rest + in transit)
- No third-party photo sharing without explicit opt-in
- GDPR compliant (right to erasure, data portability)
- HIPAA-aware design (consent, audit logs, minimum necessary)
- Annual security audit

### 4.4 Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Minimum tap target: 44×44pt
- Dynamic type support (up to 200%)
- High contrast mode
- Reduced motion option

### 4.5 Internationalization
- MVP: English only
- v2: Spanish, French, German
- v3: Japanese, Korean, Mandarin
- Currency + metric localization
- Regional regulatory compliance

---

## 5. Technical Architecture Overview

### 5.1 High-Level Stack
- **Mobile:** Native iOS (Swift), Android (Kotlin) — or React Native for speed
- **Backend:** Node.js / Express or Python / FastAPI
- **Database:** PostgreSQL (primary), Redis (cache), S3 (photos)
- **AI/ML:** TensorFlow Lite / Core ML (on-device), AWS SageMaker (cloud)
- **Infrastructure:** AWS or GCP, Kubernetes, auto-scaling
- **CDN:** CloudFront / CloudFlare

### 5.2 Key Integrations
- SendGrid / Mailgun (email)
- Mixpanel + Amplitude (analytics)
- Stripe (payments)
- OneSignal (push notifications)
- UPC Database (barcode lookup)

### 5.3 AI/ML Pipeline
```
Image Upload → Preprocessing (alignment, normalization, quality check) → 
Feature Extraction (CNN: wrinkles, texture, tone, pores, etc.) → 
Scoring (regression vs. age-matched model) → 
Confidence Calculation → Results Packaging
```

### 5.4 Data Model (Simplified)
See `MVP-SCOPE.md` for detailed schema.

---

## 6. Design & UX Requirements

### 6.1 Design System
- Color palette: Deep teal/navy (trust), warm gold (premium), soft coral (skin vitality)
- Typography: Inter or similar (clean, readable, modern)
- Imagery: Real people, diverse ages, clinical photography style
- Tone: Expert but accessible, warm, empowering, honest

### 6.2 Core Screens
1. Splash / onboarding flow
2. Skin analysis capture
3. Results dashboard
4. Metric detail view
5. Routine builder
6. Routine detail view
7. Ingredient detail view
8. Progress timeline
9. Content library
10. Article view
11. User profile / settings
12. Premium upgrade (v2)

### 6.3 Navigation
- Bottom tab bar: Home (analysis), Routine, Progress, Learn, Profile
- Top bar: Contextual actions (share, bookmark, settings)
- Deep linking: Shareable URLs for articles, product pages

---

## 7. Analytics & Metrics

### 7.1 Product Metrics
- Daily/Monthly Active Users (DAU/MAU)
- Assessment completion rate
- Routine creation rate
- Photo re-capture rate (retention indicator)
- Content engagement (time, scroll depth, shares)
- Premium conversion rate (v2)

### 7.2 Technical Metrics
- App performance (crash rate, latency, errors)
- API health (uptime, response times, error rates)
- Photo analysis accuracy (human validation sample)
- Model drift detection

### 7.3 Business Metrics
- CAC (customer acquisition cost)
- LTV (lifetime value)
- Payback period
- Churn rate
- NPS (Net Promoter Score)

---

## 8. Open Questions for Che's Team

1. **AI Model Source:** Build custom, license existing (Haut.AI, Perfect Corp), or hybrid approach?
2. **Platform:** Native iOS first, or React Native for cross-platform speed?
3. **Backend Language:** Team preference for Node.js vs. Python?
4. **Cloud Provider:** AWS, GCP, or Azure? Existing team expertise?
5. **CI/CD:** Existing tooling preference?
6. **Design Resources:** Will Che's team include a designer, or should we source separately?
7. **QA Strategy:** Automated testing approach, device farm for photo quality validation?

---

## 9. Appendix

### 9.1 Glossary
- **RCT:** Randomized Controlled Trial
- **p95:** 95th percentile (measurement standard)
- **LTV:** Lifetime Value
- **CAC:** Customer Acquisition Cost
- **MRR:** Monthly Recurring Revenue

### 9.2 Reference Documents
- `BRAND-STRATEGY.md` — Mission, positioning, messaging
- `COMPETITIVE-MATRIX.md` — Feature comparison
- `MVP-SCOPE.md` — Technical architecture, data model, development phases
- `PITCH-DECK.md` — Business case and funding
- `25-content-strategy-genx.md` — Content pillars and calendar

---

*PRD v1.0 — Ready for Che's Team Review*  
*Next Steps: Technical architecture review, AI model sourcing, design sprint*
