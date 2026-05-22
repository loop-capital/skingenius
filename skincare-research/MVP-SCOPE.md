# SKINgenius MVP Scope Document

**Version:** 1.0  
**Date:** May 13, 2026  
**Status:** Draft for Development Planning

---

## MVP Definition

**Goal:** Launch a Minimum Viable Product that delivers core value to early adopters (Gen X women) and validates key assumptions.

**Timeline:** 8-10 weeks to beta launch

**Target Users:** 500 beta testers (invited waitlist)

---

## Core User Flow

```
[Onboarding] → [Skin Assessment] → [Results Dashboard] → [Routine Builder] → [Progress Tracking] → [Content Discovery]
```

### 1. Onboarding (2-3 min)
- Welcome: Brand promise + value proposition
- Account creation: Email, password, optional profile photo
- Quick survey: Age range, skin type (self-assessed), top concerns (pick 3)
- Camera permission: Explain photo privacy + AI analysis

### 2. Skin Assessment (3-5 min)
- **Photo capture:** Guided selfie (frontal, left, right profile)
- **Lighting check:** Real-time quality feedback (too dark, too bright, shadows)
- **AI Analysis:** Cloud-based processing (return in <15 seconds)
- **Results display:** 8 metric scores + overall skin age estimate

**Metrics Analyzed (MVP):**
1. Fine Lines & Wrinkles
2. Texture / Smoothness
3. Evenness / Tone
4. Dark Circles
5. Pore Size
6. Redness / Inflammation
7. Under-Eye Bags
8. Overall Hydration

**Scoring:** 1-10 scale, compared to age-matched peer group

### 3. Results Dashboard
- **Visual summary:** Scorecard with color coding (green/yellow/red)
- **Deep dive:** Tap any metric for explanation + evidence
- **Trend prompt:** "Take another photo in 2 weeks to track progress"
- **Action CTA:** "Build My Routine" → Routine Builder

### 4. Routine Builder (2-3 min)
- **Goal selection:** Pick 2-3 priorities (anti-aging, hydration, brightening, calming, etc.)
- **Budget preference:** $-$$$ (filters product recommendations)
- **Current products:** Optional barcode scan or manual entry
- **AI-generated routine:** AM + PM regimen with specific product types
- **Ingredient education:** Tap any ingredient for deep dive

### 5. Progress Tracking
- **Photo timeline:** Side-by-side comparison tool
- **Metric trends:** Line charts over time
- **Journal entries:** Optional notes (new products, reactions, lifestyle)
- **Reminder settings:** Photo prompts, routine reminders

### 6. Content Discovery
- **Browse library:** Categories (ingredients, concerns, routines, lifestyle)
- **Search:** Ingredient names, product types, skin conditions
- **Favorites:** Save articles for reference
- **Share:** Send to friends, providers, or social

---

## Technical Architecture (MVP)

### Frontend
- **Platform:** iOS first (primary demographic), Android next quarter
- **Framework:** React Native (cross-platform future-proofing)
- **Design System:** Custom component library based on brand identity

### Backend
- **API:** Node.js / Express or Python / FastAPI
- **Database:** PostgreSQL (user data), Redis (caching)
- **AI/ML:** 
  - Image analysis: TensorFlow Lite or Core ML (on-device for speed)
  - Cloud fallback: AWS SageMaker or Google Vertex AI
  - Model: Fine-tuned CNN for skin metric scoring
- **Image Storage:** AWS S3 with encryption
- **CDN:** CloudFront for content delivery

### AI/ML Pipeline
```
Image Upload → Preprocessing (alignment, normalization) → 
Feature Extraction (CNN) → Metric Scoring (regression models) → 
Comparison Engine (peer group matching) → Results Packaging
```

### Third-Party Integrations
- **Barcode lookup:** UPC Database or similar
- **Email:** SendGrid or Mailgun
- **Analytics:** Mixpanel + Amplitude
- **Crash reporting:** Sentry
- **Payments:** Stripe (for future premium launch)

---

## Data Model (Simplified)

### User
- id, email, password_hash, created_at, demographics
- skin_profile (type, concerns, goals)
- subscription_status (free/premium)

### SkinAssessment
- id, user_id, timestamp, image_urls[]
- metrics {wrinkles, texture, evenness, dark_circles, pores, redness, bags, hydration}
- overall_score, skin_age_estimate
- lighting_quality, image_quality_score

### Product
- id, name, brand, category, price_range
- ingredients[] (linked to ingredient library)
- barcode, image_url
- ai_recommendation_score (for this user)

### Ingredient
- id, name, category, function
- evidence_level (strong/moderate/weak/emerging)
- description, sources[], contraindications[]

### Routine
- id, user_id, created_at, updated_at
- am_steps[] (product references)
- pm_steps[] (product references)
- goals[]
- is_active

### ContentArticle
- id, title, slug, category, tags[]
- body (markdown), author, sources[]
- read_time, published_at, updated_at
- related_products[], related_ingredients[]

---

## Key Assumptions to Validate

| # | Assumption | Validation Method | Success Criteria |
|---|-----------|-------------------|------------------|
| 1 | Gen X women will use AI skin analysis | Beta signups + completion rate | >60% complete assessment |
| 2 | They want evidence-based recommendations | Routine builder engagement | >50% build a routine |
| 3 | Progress tracking drives retention | 2-week photo return rate | >40% return for follow-up |
| 4 | Ingredient education is compelling | Article read time + shares | >3 min avg read, >10% share |
| 5 | They'll pay for premium features | Waitlist survey + beta feedback | >20% indicate willingness |
| 6 | Photo quality is good enough | Image quality scores + user feedback | >80% photos usable |

---

## MVP Exclusions (Post-Launch)

| Feature | Why Excluded | When Added |
|---------|-------------|------------|
| AR Try-On | Complex, not core value | v2 or retail partner |
| Wearable Integration | Low priority for target demo | v3 |
| Provider Booking | Requires provider network | v2 (directory first) |
| Social Features | Focus on individual value first | v2 |
| Android App | iOS first for speed | Month 4 |
| Web App | Mobile-native experience | v2 |
| Real-Time Derm Chat | High operational cost | v3 |
| Marketplace/Checkout | Affiliate model first | v2 |
| Multi-language | English-only for launch | v3 |
| Advanced 3D Analysis | Requires specialized hardware | Partner integration |

---

## Development Phases

### Sprint 1-2: Foundation (Weeks 1-4)
- [ ] Backend API scaffold
- [ ] Database setup + migrations
- [ ] User auth (signup/login)
- [ ] Photo upload + storage pipeline
- [ ] Basic AI model integration (wrinkles + texture)

### Sprint 3-4: Core Features (Weeks 5-8)
- [ ] All 8 metric analysis
- [ ] Results dashboard UI
- [ ] Ingredient database (top 100)
- [ ] Routine builder v1
- [ ] Content library (25 articles)

### Sprint 5: Polish + Beta (Weeks 9-10)
- [ ] Onboarding flow
- [ ] Progress tracking UI
- [ ] Analytics instrumentation
- [ ] Bug fixes + performance
- [ ] Beta invite system

### Post-MVP (Month 3-4)
- [ ] Premium subscription launch
- [ ] Email nurture sequences
- [ ] Community features
- [ ] Provider directory
- [ ] A/B testing framework

---

## Success Metrics for MVP

### Product
- Daily Active Users (DAU): 200+ by week 4 post-launch
- Assessment completion rate: >60%
- Routine creation rate: >50% of completers
- 7-day retention: >40%
- 30-day retention: >25%

### Technical
- App crash rate: <1%
- Photo analysis latency: <15 seconds (p95)
- API uptime: >99.5%
- Image quality acceptance: >80%

### Business
- Beta waitlist: 500+ signups pre-launch
- Email open rate: >30%
- Premium waitlist: 100+ interested
- Net Promoter Score: >30 (MVP baseline)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI accuracy insufficient | High | Conservative scoring, clear uncertainty ranges, human review pipeline |
| Photo quality too variable | Medium | Real-time guidance, multiple attempts, manual override option |
| iOS App Store rejection | Medium | Conservative medical claims, clear disclaimers, legal review |
| Slow user acquisition | High | Email waitlist, referral incentives, content marketing pre-launch |
| Backend scaling issues | Low | Cloud-native architecture, auto-scaling, load testing |
| Data privacy concerns | Medium | Transparent policy, opt-in consent, encryption, no third-party sale |

---

## Budget Estimate (MVP)

| Category | Estimate |
|----------|----------|
| Development (2 engineers, 10 weeks) | $40,000-60,000 |
| Design (1 designer, part-time) | $8,000-12,000 |
| AI/ML (cloud compute, model training) | $3,000-5,000 |
| Infrastructure (hosting, storage, CDN) | $1,000-2,000 |
| Third-party tools (analytics, email, etc.) | $500-1,000 |
| Legal/Compliance review | $3,000-5,000 |
| **Total MVP Budget** | **$55,000-85,000** |

---

## Next Steps

1. **Finalize team** — Confirm iOS + backend engineer availability
2. **Design sprint** — Wireframes + UI kit (2 weeks)
3. **AI model procurement** — License or train core analysis model
4. **Legal review** — Medical claims, privacy policy, terms of service
5. **Beta waitlist landing page** — Collect emails while building
6. **Content preparation** — Write 25 MVP articles

---

*Document Status: DRAFT v1.0  
Owner: SKINgenius Product Team  
Next Review: Upon team formation*
