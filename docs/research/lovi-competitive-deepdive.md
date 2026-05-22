# Lovi.care — Competitive Deep-Dive

**Research Date:** May 10, 2026
**Company:** Digital Skincare Inc. (Delaware corp)
**HQ:** Built by the sea in Cyprus
**Parent:** Palta (formerly Pora) — London-based health/tech studio
**Website:** https://lovi.care
**App:** iOS only (no Android version found)
**Tagline:** "Science-backed AI Cosmetologist you can trust"
**Award:** Won Beauty Innovation Award (undated, referenced on Instagram)

---

## 1. Core Features

### 1.1 Face Scanner (Skin Analysis)

- **Detects 11+ skin issues:**
  1. Postacne spots
  2. Wrinkles
  3. Acne (Inflammatory)
  4. Whiteheads
  5. Redness
  6. Pigmentation
  7. Scars
  8. Visible pores
  9. Moles
  10. Nevi
  11. Freckles

- **How it works:** User takes a photo via in-app camera. AI analyzes the face and maps "green dots" (areas of concern) on facial regions. Analysis runs server-side, photos are deleted from servers after analysis completes. Photos remain stored on-device only.

- **Data handling:** Face Data processed by automation only, never accessible to developers. Opt-in consent required to use photos for Lovi model improvement (3-year retention if consented). GDPR-compliant with explicit consent flows.

- **Accuracy:** No published validation studies or peer-reviewed accuracy benchmarks. Claims to be "trained by a medical board" but no specifics on training data size, ethnicity diversity, or accuracy metrics per condition.

### 1.2 Skin Tracking (Timeline)

- Monthly tracking with timeline visualization
- Tracks changes in detected conditions over time (Jan–Dec timeline shown on site)
- Before/after comparison capability
- Key testimonial: "My pores have definitely become cleaner... the scanner shows less green dots in the center of the face" — suggests quantified tracking with visual overlays

### 1.3 Fit Score (Product Compatibility Scoring)

The Fit Score is Lovi's flagship differentiator. It scores products 0–100% fit for a specific user based on:

**Three scoring dimensions:**
1. **Safety** — Harmful ingredient detection, irritant risk assessment
2. **Effectiveness** — Does it contain the right active ingredients in effective concentrations?
3. **Skin Type Suitability** — Formulation/texture appropriateness for user's skin type

**Scoring tiers (well-documented):**

| Score Range | Safety | Effectiveness | Skin Type Fit |
|---|---|---|---|
| 0–10% | Harmful / prohibited ingredients | Opposite action to expected | Highly unsuitable |
| 11–20% | High irritation risk (rosacea/eczema/dermatitis) | Actively worsens existing issues | Contains opposite-type ingredients |
| 21–35% | High irritation risk (hypersensitive skin) | Poor performance, low-concentration actives | Unsuitable but not absolute |
| 36–50% | Moderate irritation risk | Basic level, limited benefits | Moderate unsuitability |
| 51–75% | Low/absent irritation risk | Quite well, moderately effective | Low risks, partial fit |
| 76–90% | No irritation risk | Well performance, effective concentrations | No risks, sufficient ingredients |
| 91–100% | No risk, soothing properties | Very well, synergistic pairings | Max beneficial ingredients, optimal texture/pH |

**Key details about Fit Score:**
- Evaluates entire product formulation, not just marketing claims
- Cross-references against ECHA (European Chemicals Agency), FDA, TGA, CIR
- Specific examples: retinol scored 5% for pregnant users; The Ordinary AHA 30% scored 23% for dry skin with pigmentation concerns
- Provides detailed "Why X%?" explanations for each score
- Pregnancy safety is explicitly factored in (flags retinol, etc.)

**Algorithm likely approach:**
- Ingredient database → user's SkinID profile → weighted scoring across safety/effectiveness/fit
- Uses PubMed research to validate ingredient effectiveness claims
- Appears to be rule-based + ML hybrid (references BioLinkBERT and PubMedBERT models)

### 1.4 Ingredient Checker

- Individual ingredient safety ratings
- Allergen detection
- Ingredient function descriptions (e.g., "Retinol — a form of vitamin A," "Squalane — An emollient derived from plant sources")
- Safety flags: "Safe to use," "Non-Allergen" tags visible in UI
- Cross-references ECHA, FDA, TGA, CIR databases

### 1.5 AI Assistant (Chatbot)

- **Available 24/7** — "Cosmetologist in your pocket"
- Personalized responses based on user's SkinID and current routine
- Can answer any skincare question
- Suggests specific products with Fit Scores inline in chat
- Context-aware: knows UV index, recommends SPF on high-UV days
- Catches the user's skin goals, habits, behaviors

**Technical claims:**
- "Surpassed the pass mark on US Medical License Exam" (USMLE)
- Uses multiple AI models:
  - BioLinkBERT
  - PubMedBERT
  - GPT (likely GPT-4 or similar)
  - PubMed integration
- Claims "Medical License Level" competency
- No independent verification of the USMLE claim

### 1.6 Routine Builder

- Personalized routine programs tailored to user's unique needs
- AI-generated recommendations based on skin analysis results
- Suggests product additions with Fit Scores (e.g., "Consider adding a serum with retinol... 92% fit The Ordinary Retinol Serum")
- Morning and evening routine differentiation
- UV-aware recommendations

### 1.7 Product/Brand Database

**20+ major brands listed on site:**
Allies of Skin, Bubble, BYOMA, CeraVe, Cetaphil, Clinique, CosRX, Drunk Elephant, E.l.f. Cosmetics, Eucerin, Garnier, Glow Recipe, Good Molecules, La Roche-Posay, Mario Badescu, Neutrogena, Olay, Paula's Choice, SkinCeuticals, The Ordinary

- Claims 100% brand independence (no affiliate deals)
- Can scan any product via camera
- Also supports text search
- Shows price comparisons from multiple retailers

### 1.8 Cosmetics Scanner

- Scan product labels/ingredients via camera
- Immediate Fit Score output
- Alternative product suggestions ("Find better-fit-to-you alternatives")

---

## 2. Technical Analysis

### 2.1 AI/ML Architecture (Inferred)

**Computer Vision Pipeline:**
- Face detection + segmentation (likely MediaPipe or similar for landmark detection)
- Skin condition classification (CNN-based, likely custom-trained)
- Multi-label classification for 11+ conditions simultaneously
- Per-region analysis with visual overlay mapping

**NLP/Knowledge Models:**
- BioLinkBERT — biomedical entity linking and knowledge graph
- PubMedBERT — biomedical literature understanding
- GPT layer — conversational interface, question answering
- PubMed BERT — cited twice in their model stack, suggesting heavy biomedical grounding
- Likely uses RAG (Retrieval-Augmented Generation) with PubMed corpus

**Fit Score Engine:**
- Ingredient database (likely 10,000+ cosmetic ingredients)
- Regulatory database cross-references (ECHA, FDA, TGA, CIR)
- Rule-based safety checks + ML-based effectiveness scoring
- Personalization layer based on SkinID profile
- Research-backed effectiveness validation via PubMed

### 2.2 Lighting Conditions

- No published information on how they handle varying lighting
- Privacy policy mentions photos are processed server-side
- Likely relies on image normalization/preprocessing but no specifics available
- **Gap for SKINgenius:** Lovi doesn't mention controlled capture environment or lighting calibration

### 2.3 Data Collection (From Privacy Policy)

| Data Type | Collection Method | Purpose |
|---|---|---|
| Device info (model, OS, IP, etc.) | Automatic | Service delivery, security |
| App usage data | Automatic | Analytics, product improvement |
| Name, email | User-provided | Account management, support |
| Age, gender | User-provided | Skincare plan customization |
| Skin goals, issues, habits, behaviors | User-provided | Content personalization |
| Face Data (photos) | User-initiated via camera | Skin analysis (deleted after processing) |
| Product photos | User-initiated | Cosmetics scanner |
| AI chatbot conversations | User-provided | Chatbot service, anonymized for training |
| Pregnancy/breastfeeding status | User-provided | Safety filtering |

**Key privacy note:** Face Data is deleted from servers after analysis. On-device storage only. Developers have no access to face photos at any point. GDPR/CCPA compliant.

---

## 3. Business Model

### 3.1 Pricing

- **Subscription-based** (exact pricing not publicly listed on website)
- Purchases available via App Store (Apple manages refunds) or directly via website
- 30-day money-back guarantee for website purchases
- "Workbooks" mentioned as non-refundable downloadable products
- No free tier specifics visible (likely freemium with premium features behind paywall)

### 3.2 Monetization

- **No brand affiliations** — explicitly stated multiple times ("Zero Affiliation with skincare brands")
- Revenue is subscription-only (no affiliate commissions from product recommendations)
- This is a strong trust signal but limits revenue diversification

### 3.3 Parent Company / Funding

- **Palta** (formerly Pora) — London-based health tech studio
- Lovi appears to be one of several products in Palta's portfolio
- Palta job page suggests 50+ person team across portfolio
- **Funding:** Couldn't access Crunchbase. Palta is likely venture-backed but exact Lovi.care funding is unknown.
- Medium publication has only 23 followers — suggests relatively small user base or early-stage content marketing

### 3.4 Team

**Medical Board (7 members):**
- Nadia Kapleva, MS — Medical Director, Cosmetic Chemist
- Aishani Shah, MD — Dermatologist (IFAAD member)
- Dr. Sofía Perea Pérez, MD, MSc — Aesthetic Medicine, Pharmacology candidate
- Asya Zubkova, MS — IFSCC Member, Cosmetic Chemist
- Hanna Kurets, MD — Dermatology MD
- Elina Nazarenko, MD — Dermatology & Diagnostic Consultant
- Victoria Derkova, MS — Cosmetic Development Technologist

**Engineering/Design (from Medium):**
- Co-founder, CEO & CTO
- Chief Medical Officer (linked from pora.ai)
- Lead Product Designer
- iOS Developer
- Headquarters in Cyprus, parent Palta in London

### 3.5 Social Presence

- **Instagram:** @lovibeautyworld
- **TikTok:** @lovibeautyworld
- **LinkedIn:** company/lovi-care
- **Medium:** "Glow & Tell by Lovi" (23 followers — very small)
- **Trustpilot:** Active profile with verified reviews

---

## 4. User Reviews — What People Love and Hate

### 4.1 Positive Feedback (from website testimonials + Trustpilot)

- **"No more wasting money on the wrong skincare"** — Tracy K., May 2025 (Trustpilot verified)
- **"Makes things easier"** — Katie R., May 2025 — "I don't have to spend hours researching what products to buy anymore"
- **"Tracking my progress kept me from quitting during the initial purging stage"** — suggests skin tracking is motivating
- **"Facial scan was insightful"** — Kate K., 2023
- **"Products that fit me 100% and didn't cost like a spaceship"** — Melissa P.
- **"Pores have definitely become cleaner"** — Merilyn D.
- **"Useful app with the notion of maintaining a healthy lifestyle"** — Chelsey J.
- Product recommendations with Fit Scores are valued

### 4.2 Known Complaints / Gaps

**Based on review analysis and feature gaps:**

- **iOS only** — Android users excluded entirely
- **No professional service referrals** — can't connect users with dermatologists for in-person care
- **No supplement recommendations** — focused purely on topical skincare
- **No drug interaction warnings** — doesn't account for medications users may be taking
- **No clinical-grade imaging** — uses phone camera only, no Visia-level imaging
- **No biomarker integration** — doesn't connect skin health to internal health data
- **"Science-backed" is vague** — no published papers, no clinical trial data, no accuracy benchmarks
- **Small community** — only 23 Medium followers suggests limited engagement
- **AI assistant accuracy** — unverified USMLE claim; no transparency on error rates
- **Pricing opacity** — subscription cost not disclosed on website

### 4.3 Features Users Would Want (Inferred Gaps)

Based on Lovi's own FAQ structure and what they choose to highlight:

- Better skin tracking with clinical-grade imaging
- Integration with health data (blood work, hormones, gut health)
- Professional service referrals
- Supplement and holistic health recommendations
- Android support
- Deeper education (why certain ingredients work, with citations)

---

## 5. SKINgenius Competitive Analysis

### 5.1 Feature-by-Feature Comparison

| Feature | Lovi.care | SKINgenius (Current/Planned) | SKINgenius Advantage |
|---|---|---|---|
| **Face Scanner** | 11+ conditions, phone camera | Can replicate with CV models; add Visia integration | Visia referral network + clinical imaging |
| **Skin Tracking** | Monthly timeline, visual overlay | Reproducible; can add AI-generated insights | Deeper trend analysis with biomarker correlation |
| **Fit Score** | 0–100%, 3-dimension scoring | Can reproduce; expand dimensions | Add biomarker dimension + drug interaction layer |
| **Ingredient Checker** | Safety, allergens, function | Reproducible; can enrich | Add PubMed citations for each ingredient claim |
| **AI Assistant** | GPT + BioLinkBERT + PubMedBERT | Can match/beat with RAG architecture | Add biomarker awareness + supplement knowledge |
| **Routine Builder** | AI-generated, SkinID-based | Reproducible | Add supplement + professional service recs |
| **Product Database** | 20+ major brands | Can match; expand to indie brands | Broader database, affiliate-optional model |
| **Pregnancy Safety** | Yes, flags retinol etc. | Must-have, replicate | Can go deeper with drug interaction awareness |
| **Brand Independence** | 100% independent | Match this — it's a trust differentiator | Same positioning, stronger with evidence |

### 5.2 SKINgenius Unique Differentiators (What Lovi Doesn't Have)

#### 🔬 Biomarker Integration
- Lovi operates purely on external skin analysis
- SKINgenius can correlate skin conditions with blood work, hormones, gut health, vitamin levels
- **Why it matters:** Skin issues like acne, rosacea, hyperpigmentation often have internal causes (hormonal, nutritional, inflammatory markers)
- **Lovi can't do this:** No health data integration at all
- **Impact:** Positions SKINgenius as a holistic health platform, not just a cosmetic tool

#### 💊 Supplement Recommendations with Drug Interactions
- Lovi recommends topical products only
- SKINgenius can recommend supplements (zinc, vitamin C, omega-3, probiotics, etc.) for skin health
- Drug interaction warnings are critical (e.g., zinc + antibiotics, vitamin A + retinoids)
- **Lovi can't do this:** No supplement awareness, no medication cross-referencing
- **Impact:** Huge safety differentiator — prevents dangerous combinations

#### 🏥 Professional Service Recommendations + Visia Referral Network
- Lovi gives DIY advice only
- SKINgenius can recommend professional treatments (chemical peels, microneedling, laser, Visia imaging)
- Visia referral network = clinical-grade imaging partnerships
- **Lovi can't do this:** No service provider connections
- **Impact:** Bridges the gap between consumer advice and professional care — builds trust and revenue (referral fees)

#### 📊 Evidence-Based with Citations
- Lovi claims "science-backed" but provides no citations
- SKINgenius can link every recommendation to specific PubMed papers
- Show confidence scores + evidence levels (RCT, meta-analysis, expert opinion)
- **Lovi's weakness:** Their "science-backed" claim is vague and unverifiable
- **Impact:** Builds serious credibility with knowledgeable consumers and professionals

#### 🧬 Holistic Health Model
- Lovi = cosmetics recommender
- SKINgenius = skin health platform that connects the dots between lifestyle, nutrition, supplements, genetics, and topical care
- **Impact:** Higher user engagement, more value per user, stronger retention

### 5.3 What Lovi Does Well (That We Should Match or Exceed)

1. **Fit Score concept is brilliant** — 0–100% with detailed explanations. We should have our own scoring system, potentially with MORE dimensions (add biomarker fit, supplement interactions, professional service relevance)

2. **Clear safety tiers** — Their 0–10%, 11–20%, etc. scoring explanation is excellent UX. Users understand WHY a product scored low. We should match this transparency.

3. **Pregnancy safety** — Non-negotiable. Must be in SKINgenius from day one.

4. **Medical board credentialed** — Having named, verifiable medical professionals builds trust. Our team should have equivalent or better credentials.

5. **Brand independence** — Critical trust signal. If we take affiliate revenue, we need very clear disclosure.

6. **Face Data privacy** — Their approach (server-side deletion after analysis, on-device storage, no developer access) is the gold standard. We should match or exceed this.

7. **Detailed "Why" explanations** — Every product score includes a plain-English explanation. Users love this. Must-have for SKINgenius.

### 5.4 Strategy Summary

**Lovi's position:** Best-in-class cosmetic product recommender with AI analysis. Pure skincare play.

**SKINgenius opportunity:** Own the "skin health platform" category that connects cosmetics, supplements, biomarkers, professional services, and evidence-based recommendations.

**The moat:** Lovi cannot easily add biomarker integration (different data model), supplement recommendations (different expertise), or professional service referrals (different business model). These are structural advantages.

---

## 6. Key Gaps in Lovi That SKINgenius Can Exploit

### Immediate Exploits (Build into v1)

1. **Evidence citations** — Every recommendation linked to PubMed papers. Lovi has none. Easy win.
2. **Supplement recommendations** — Lovi ignores internal health. Huge value-add.
3. **Drug interaction warnings** — Lovi has zero awareness. Safety differentiator.
4. **Android support** — Lovi is iOS-only. Capture the 70%+ of the market they ignore.
5. **Pricing transparency** — Lovi hides pricing. Be upfront from day one.

### Medium-Term (Build into v2)

6. **Biomarker integration** — Blood work, hormones, gut health. Lovi has no path here.
7. **Visia referral network** — Clinical imaging partnerships. Lovi has no professional connections.
8. **Professional treatment recommendations** — Chemical peels, laser, microneedling. Lovi is DIY-only.
9. **Deeper education** — Why ingredients work, with citations. Lovi's education is surface-level.
10. **Holistic health model** — Connect sleep, stress, nutrition to skin. Lovi doesn't touch this.

### Long-Term Competitive Advantages

11. **Clinical-grade imaging** — Partner with Visia or build equivalent. Phone cameras are limited.
12. **Practitioner marketplace** — Connect users with dermatologists, aestheticians. Lovi can't do this.
13. **Skin health API** — Let other apps/platforms use our scoring engine. Lovi has no API.
14. **Research partnerships** — Publish validation studies. Lovi has zero published research.

---

## 7. Risks & Considerations

### Lovi Strengths We Shouldn't Underestimate

- **Well-designed UX** — Clean, intuitive product. Their Fit Score presentation is excellent.
- **Medical board** — 7 credentialed professionals is serious. We need equivalent backing.
- **Palta backing** — Parent company likely has significant resources.
- **First-mover advantage** — Established product with users, reviews, and brand recognition.
- **Privacy-first approach** — Their Face Data handling is genuinely good. Sets a high bar.

### Potential Lovi Moves

- **Android launch** — Could significantly expand their market
- **B2B/API play** — Could license Fit Score to retailers
- **Deeper integrations** — Could partner with health platforms for biomarker data
- **International expansion** — Cyprus base suggests EU focus; could expand to US/Asia

### Our Response

- **Move fast on Android** — Capture market they're ignoring
- **Lead with evidence** — Make PubMed citations our brand identity
- **Build the biomarker moat early** — This is the hardest feature for Lovi to copy
- **Publish research** — Clinical validation studies will differentiate us from ALL competitors, not just Lovi
- **Privacy excellence** — Match or exceed Lovi's Face Data handling

---

## Appendix: Data Sources

- https://lovi.care (main site) — Fetched May 10, 2026
- https://lovi.care/fitscore (Fit Score page) — Fetched May 10, 2026
- https://lovi.care/privacy-policy (privacy policy) — Fetched May 10, 2026
- https://lovi.care/money-back (refund policy) — Fetched May 10, 2026
- https://lovi.care/terms (terms of use) — Fetched May 10, 2026
- https://medium.com/pora-ai (Medium publication) — Fetched May 10, 2026
- Instagram testimonial references (website)
- Trustpilot review excerpts (website)

**Note:** Search API quota was exhausted during research. App Store reviews, Reddit discussions, Product Hunt profiles, and Crunchbase funding data were not accessible. These should be researched in a follow-up session when API quota resets.

---

*This document directly informs the SKINgenius product roadmap. Updated May 10, 2026.*
