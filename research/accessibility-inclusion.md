# SKINgenius Accessibility & Inclusion Research Report

> **Date:** 2026-05-14
> **Agent:** skingenius-research
> **Status:** Draft — Ready for Clinical Review

---

## Executive Summary

This report details the accessibility and inclusive design requirements for the SKINgenius platform. An estimated **1.3 billion people globally (16% of the population)** experience significant disability, per WHO 2024 data. For a medical-grade skincare AI, accessibility is not optional—it is a clinical and ethical obligation. Skin health apps sit at the intersection of **healthcare technology**, **personal data**, and **appearance-related self-esteem**, making inclusive design particularly critical.

This report covers:
1. Visual Accessibility
2. Motor Accessibility
3. Cognitive Accessibility
4. Socioeconomic Considerations
5. Language & Localization
6. Legal & Compliance

---

## 1. Visual Accessibility

### 1.1 Color Blindness
- **Prevalence:** ~8% of males, ~0.5% of females have some form of color vision deficiency (CVD).
- **Impact:** Severity scales, progress indicators, and condition heat maps that rely solely on red/green coding will be misinterpreted by ~4% of all users.

**Requirements:**
- Never rely on color alone to convey meaning. Always pair color with:
  - Iconography (e.g., 🔴 Severity High + ⚠️ warning icon)
  - Text labels (e.g., "Severe" not just red)
  - Patterns/textures (e.g., hatched fills on charts)
- Use color-blind safe palettes (avoid red-green pairings; use blue-orange or blue-yellow instead).
- Provide a simulator or toggle for CVD modes (Deuteranopia, Protanopia, Tritanopia).
- Test with tools like [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/) or Stark.

### 1.2 Low Vision
- **Prevalence:** ~2.2 billion people globally have near or distance vision impairment (WHO).

**Requirements:**
- Full support for **200% text scaling** without loss of content or function (WCAG 1.4.4).
- Minimum contrast ratio of **4.5:1** for normal text, **3:1** for large text (WCAG 1.4.3).
- Offer a **high-contrast mode** (minimum 7:1 ratio).
- Ensure no content is clipped or obscured at high zoom levels.
- Support screen magnification tools (no fixed-width layouts that break at zoom).

### 1.3 Screen Reader Support
- **Prevalence:** Primary access method for blind users and many low-vision users.

**Requirements:**
- All UI elements must have descriptive **accessibility labels** (ARIA labels, alt text).
- Skin analysis images must include **detailed alt text** describing visible conditions (e.g., "Mild erythema on the left cheek, approximately 2cm in diameter").
- Navigation must be fully operable via screen reader (logical focus order, skip links, landmark regions).
- Form inputs must be properly associated with labels.
- Avoid placeholder-only labels.
- Provide **audio descriptions** for any video content.

### 1.4 Photosensitivity
- **Prevalence:** ~1 in 4,000 people have photosensitive epilepsy; many more experience discomfort from flashing content.

**Requirements:**
- No flashing content >3Hz in score displays, animations, or transitions.
- Avoid auto-playing animations. If present, provide pause/stop controls.
- Offer a **reduced motion** preference that disables all animations (respect `prefers-reduced-motion`).

### 1.5 Glaucoma / Cataracts / Age-Related Vision Loss
- **Prevalence:** Increases significantly with age; common in users 50+.

**Requirements:**
- **Tap targets minimum 44×44 dp/pt** (WCAG 2.5.5 AAA), ideally 48×48.
- Simplified layouts with clear visual hierarchy.
- Generous spacing between interactive elements.
- Large, legible fonts (minimum 16px base, scalable).
- Avoid text overlaid on busy backgrounds.

---

## 2. Motor Accessibility

### 2.1 Motor Impairments
- **Prevalence:** Includes Parkinson's, ALS, cerebral palsy, spinal cord injuries, and temporary impairments (broken arm).

**Requirements:**
- **Large buttons** with generous touch targets (48×48 dp minimum).
- **Voice control compatibility** — all interactive elements must have accessible names for voice commands (iOS Voice Control, Android Voice Access).
- Support for **external switch devices** and **adaptive hardware**.
- Avoid requiring multi-touch gestures (pinch, swipe) as the only method; provide button alternatives.
- Provide **undo** functionality for destructive actions.

### 2.2 Tremors
- **Prevalence:** Essential tremor affects ~1% of population; Parkinson's ~1% over 60.

**Requirements:**
- Avoid small, closely-spaced interactive elements.
- Increase spacing between buttons to prevent accidental taps.
- Support **gesture cancellation** (e.g., slide-off to cancel a button press).
- Offer **confirmation dialogs** for high-stakes actions.
- Reduce or eliminate time limits for interactions.

### 2.3 One-Handed Use
- **Prevalence:** Contextual — users holding a child, carrying groceries, or with one functional hand.

**Requirements:**
- All critical functions reachable with thumb without hand repositioning (bottom 2/3 of screen on mobile).
- Support for **bottom navigation** rather than top tabs.
- **Floating action buttons** placed within thumb reach.
- Support for **reachability features** (screen pull-down on iOS).

### 2.4 Switch Control
- **Prevalence:** Users with limited mobility rely on switch scanning.

**Requirements:**
- All functionality must be accessible via sequential navigation (tab order).
- No reliance on hover-only interactions.
- Clear focus indicators on all interactive elements.
- Group related controls logically to reduce scanning steps.

---

## 3. Cognitive Accessibility

### 3.1 ADHD
- **Prevalence:** ~5% of children, ~2.5% of adults globally.

**Requirements:**
- **Clear focus** — minimize distractions (auto-playing videos, bouncing notifications).
- **Progress indicators** for multi-step flows (skin assessment, onboarding).
- **Minimal interruptions** — batch notifications; no pop-ups during task flow.
- Chunk information into digestible sections.
- Provide estimated time for completion.

### 3.2 Autism Spectrum
- **Prevalence:** ~1-2% of global population.

**Requirements:**
- **Sensory-friendly options**:
  - Toggle to reduce animations (respect `prefers-reduced-motion`).
  - Muted color palette option.
  - Option to disable haptic feedback.
- Predictable navigation and layout consistency.
- Clear, literal language (avoid idioms, sarcasm, or ambiguous phrasing).
- Prepare users for changes (e.g., "Next, we'll take a photo of your skin").

### 3.3 Dyslexia
- **Prevalence:** ~10% of population; up to 20% may have some symptoms.

**Requirements:**
- **Readable fonts** — sans-serif, avoid all-caps for body text, generous letter-spacing.
- **Generous line spacing** (1.5× minimum).
- Short line lengths (50-75 characters max).
- **Text-to-speech** integration for all content.
- Avoid justified text (ragged right is easier to read).
- Offer a **dyslexia-friendly font** option (e.g., OpenDyslexic).

### 3.4 Cognitive Load / Intellectual Disabilities
- **Prevalence:** ~2-3% of global population.

**Requirements:**
- **Simple language** — write for 8th-grade reading level (Flesch-Kincaid).
- **Step-by-step guidance** with one action per screen.
- **No jargon without explanation** — define all medical terms inline or via tooltip.
- **Consistent UI patterns** — same buttons in same places across screens.
- **Error prevention** — inline validation, clear error messages with correction guidance.

### 3.5 Memory Impairments
- **Prevalence:** Includes dementia, traumatic brain injury, age-related decline.

**Requirements:**
- **Clear back navigation** at all times — visible back button, breadcrumb trails.
- **Saved progress** — never lose user input if they leave the app.
- **Reminders** for skincare routines, progress photos, re-assessments.
- **Contextual help** — don't rely on users remembering instructions from previous screens.
- **No timeouts** that log users out without warning and option to extend.

---

## 4. Socioeconomic Considerations

### 4.1 Product Recommendations Across Price Points
- **Requirement:** Every recommendation must include options at multiple price tiers:
  - **Budget** ($0-$20): Drugstore, widely available
  - **Mid-range** ($20-$60): Mass-market premium
  - **Premium** ($60-$150): Professional/doctor brands
  - **Luxury** ($150+): High-end, if relevant
- **Default behavior:** Sort by efficacy evidence, not price. Allow price filtering.
- **DIY alternatives:** Where evidence supports (e.g., honey masks, oatmeal soaks), provide safe, evidence-based DIY options with clear limitations.

### 4.2 Geographic Availability
- **Requirement:** Product recommendations must be filtered by user's country/region.
- **Challenges:**
  - Certain brands (e.g., CeraVe, La Roche-Posay) have different formulations by region.
  - Some actives (e.g., tretinoin, hydroquinone) are prescription-only or banned in certain countries.
  - Import restrictions on skincare products.
- **Implementation:** Maintain a product database with regional availability flags. Partner with local retailers where possible.

### 4.3 Ingredient Availability
- **Requirement:** Flag when recommended ingredients are difficult to obtain in user's region.
- **Examples:**
  - Azelaic acid: OTC in EU/UK, prescription in US.
  - Tretinoin: Prescription in most countries.
  - Certain K-beauty ingredients: Limited availability outside Asia.
- **Action:** Suggest structurally or functionally similar alternatives.

### 4.4 Cultural Practices
- **Requirement:** Respect and incorporate culturally specific skincare practices where evidence supports.

**Examples:**
| Practice | Region | Evidence Status | Integration |
|----------|--------|-----------------|-------------|
| Oil cleansing | East Asia, global | Supported | Include as first cleanse step |
| Herbal remedies (turmeric, neem) | South Asia | Mixed | Flag evidence level; warn about irritation |
| Traditional Chinese Medicine (TCM) herbal topicals | China | Limited | Reference with caveats |
| Shea butter / African black soap | West Africa | Supported | Recommend for dry/sensitive skin |
| Aloe vera | Global | Supported | Endorse for soothing |

- **Caution:** Never dismiss traditional practices outright. Frame within evidence spectrum: "This practice has limited clinical trials but has been used safely for generations."

### 4.5 Economic Barriers
- **Requirement:** Ensure core functionality (skin assessment, basic recommendations) is available without payment.
- **Freemium model considerations:**
  - Free tier: Basic analysis, ingredient education, routine builder.
  - Premium tier: Advanced tracking, dermatologist consultation booking, personalized product matching.
- **Data equity:** Users on low-end devices or slow connections must have functional experience. Optimize image upload (compression, offline queue).

---

## 5. Language & Localization

### 5.1 Medical Terminology Translation
- **Challenge:** Dermatological terms often lack direct equivalents (e.g., "comedogenic," "epidermal barrier," "trans-epidermal water loss").
- **Requirements:**
  - Use INCI (International Nomenclature of Cosmetic Ingredients) as the canonical standard.
  - Provide common names alongside INCI (e.g., "Ascorbic Acid (Vitamin C)").
  - Build a glossary of dermatological terms with plain-language explanations.
  - When translation ambiguity exists, provide the English term in parentheses.
  - Validate translations with native-speaking dermatologists or medical translators.

### 5.2 Cultural Beauty Standards
- **Critical sensitivity:** Skin lightening vs. brightening.

| Term | Meaning | Cultural Context |
|------|---------|------------------|
| **Brightening** | Reducing dullness, enhancing radiance, fading hyperpigmentation | Neutral, dermatologically appropriate |
| **Lightening / Whitening** | Reducing melanin production, altering natural skin tone | High risk; associated with colorism, mercury poisoning, steroid abuse |

- **Requirements:**
  - **Never use "whitening" or "lightening" as goals.** Use "even tone," "fade dark spots," "reduce hyperpigmentation."
  - If users search for "skin lightening," redirect to educational content about the dangers of unregulated lightening products (mercury, hydroquinone misuse, steroid thinning).
  - Flag that healthy skin comes in all tones. Do not pathologize darker skin.
  - Ensure stock imagery and skin tone examples span Fitzpatrick I-VI.

### 5.3 Right-to-Left (RTL) Languages
- **Languages:** Arabic, Hebrew, Persian, Urdu.
- **Requirements:**
  - Full UI mirroring (navigation, layouts, text alignment).
  - Icons that imply direction (arrows, progress bars) must flip.
  - Date/number formatting must follow locale conventions.
  - Test with native RTL speakers; don't rely on automated flipping alone.

### 5.4 Number, Date, and Currency Formatting
- **Requirements:**
  - Use ICU/Unicode locale data for all formatting.
  - Currency: Show local currency with approximate conversion.
  - Dates: Follow locale conventions (DD/MM/YYYY vs. MM/DD/YYYY).
  - Numbers: Respect decimal separator conventions (1.5 vs. 1,5).
  - Concentrations: Standardize ingredient percentages (e.g., "0.025% tretinoin") with local conventions.

### 5.5 Ingredient Naming
- **Challenge:** One ingredient has multiple names across regions and languages.

| INCI Name | Common Names | Regional Variants |
|-----------|-------------|-------------------|
| Ascorbic Acid | Vitamin C | L-Ascorbic Acid |
| Retinol | Vitamin A | Retinoid (class) |
| Niacinamide | Vitamin B3 | Nicotinamide |
| Salicylic Acid | BHA | 2-hydroxybenzoic acid |
| Centella Asiatica Extract | Cica, Gotu Kola | Tiger Grass (Korean beauty) |

- **Requirements:**
  - Database entries must include all known aliases.
  - Search must match across all name variants.
  - Display INCI as primary with common names as secondary.

---

## 6. Legal & Compliance

### 6.1 HIPAA Compliance (US)
- **Applicability:** If SKINgenius stores, processes, or transmits Protected Health Information (PHI) — including photos of skin conditions, user-reported symptoms, or diagnostic data.
- **Requirements:**
  - **Business Associate Agreements (BAAs)** with all third-party services handling PHI.
  - **Encryption at rest and in transit** (AES-256, TLS 1.3+).
  - **Access controls** — role-based, least-privilege, audit logging.
  - **User access** — patients must be able to access, amend, and request restrictions on their PHI.
  - **Breach notification** — notify users and HHS within 60 days of discovery.
  - **Minimum necessary standard** — only collect/access PHI required for the specific purpose.
- **Recommendation:** Conduct a HIPAA Risk Assessment and designate a Privacy Officer.

### 6.2 GDPR Compliance (EU/EEA)
- **Applicability:** Any user in the EU/EEA, regardless of company location.
- **Requirements:**
  - **Lawful basis** for processing — likely "explicit consent" for health data (Article 9 special category).
  - **Privacy by design and default** — minimal data collection, shortest retention.
  - **Right to access** — users can request all data held about them.
  - **Right to erasure ("right to be forgotten")** — complete data deletion within 30 days.
  - **Right to data portability** — export in machine-readable format (JSON).
  - **Data Protection Impact Assessment (DPIA)** — required for high-risk processing (health data).
  - **Data Protection Officer (DPO)** — mandatory for health data processing at scale.
  - **Cross-border transfers** — ensure adequacy decisions or Standard Contractual Clauses (SCCs).
- **Recommendation:** Map all data flows and implement privacy-first architecture.

### 6.3 FDA Regulations (US)
- **Applicability:** If SKINgenius claims to diagnose, treat, or prevent disease, it may be classified as a **medical device** under the FDA.
- **Current FDA stance (2022 guidance):**
  - Software that provides "general wellness" or "lifestyle" advice is generally **not regulated** as a device.
  - Software that claims to diagnose, treat, or monitor a specific disease or condition **may be regulated**.
- **Requirements for non-device classification:**
  - Clearly position as **informational/educational**, not diagnostic.
  - Always recommend consulting a dermatologist.
  - Avoid disease-specific claims (e.g., "diagnoses eczema").
  - Acceptable: "Identifies potential concerns to discuss with your doctor."
- **Recommendation:** Engage FDA regulatory counsel early. Consider 510(k) pathway if clinical claims expand.

### 6.4 FTC Guidelines (US)
- **Applicability:** All health and skincare claims made in marketing or within the app.
- **Requirements:**
  - **Substantiation:** All claims must be backed by competent and reliable scientific evidence.
  - **No deceptive claims:** "Clinically proven" requires actual clinical trials.
  - **Before/after photos:** Must be genuine, unretouched, and representative of typical results.
  - **Endorsements:** Disclose any material connections with product brands.
  - **Testimonials:** Must reflect typical experience; atypical results must be disclosed.
- **Recommendation:** Review all marketing copy and in-app claims with FTC compliance counsel.

### 6.5 ADA Compliance (US)
- **Applicability:** Title III applies to "places of public accommodation"; DOJ has increasingly applied this to websites and mobile apps.
- **Requirements:**
  - Conformance with **WCAG 2.1 Level AA** minimum (WCAG 2.2 preferred).
  - Accessible to users with screen readers, voice control, and assistive technologies.
  - Accessible customer support channels (TTY, email, chat alternatives to phone).
- **Risk:** DOJ enforcement and private litigation have increased. Inaccessible apps face lawsuits.
- **Recommendation:** Voluntary conformance to WCAG 2.2 AA; maintain VPAT (Voluntary Product Accessibility Template).

### 6.6 Medical Disclaimer Requirements
- **Mandatory elements:**
  - Clear statement that SKINgenius is **not a substitute for professional medical advice, diagnosis, or treatment**.
  - Always seek the advice of a dermatologist or other qualified health provider.
  - Never disregard professional medical advice because of information from the app.
  - Disclaimers must be:
    - Prominent on onboarding
    - Accessible before any assessment
    - Included in Terms of Service
    - Displayed when users receive any "concerning" results
- **Urgent flagging:** If analysis suggests possible melanoma, severe infection, or acute reaction, the app must:
  - Clearly state this is not a diagnosis.
  - **Strongly urge immediate dermatologist/ER visit** with a direct call button or location finder.
  - Log the interaction for safety auditing.

---

## 7. Implementation Priority Matrix

| Priority | Category | Action | Effort | Impact |
|----------|----------|--------|--------|--------|
| **P0** | Legal | Medical disclaimer, HIPAA/GDPR audit | High | Critical |
| **P0** | Visual | Never rely on color alone + CVD safe palette | Low | High |
| **P0** | Visual | Screen reader support (labels, alt text) | Medium | High |
| **P1** | Legal | ADA/WCAG 2.2 AA conformance plan | Medium | High |
| **P1** | Motor | 48×48 dp touch targets, voice control support | Low | High |
| **P1** | Cognitive | Plain language (8th grade), glossary, progress indicators | Medium | High |
| **P1** | Socioeconomic | Price tier filtering, regional availability | Medium | Medium |
| **P2** | Visual | High contrast mode, text scaling support | Low | Medium |
| **P2** | Cognitive | Reduced motion toggle, sensory-friendly mode | Low | Medium |
| **P2** | Language | INCI + common name database, RTL support | High | Medium |
| **P2** | Cultural | Evidence-based traditional practice integration | Medium | Medium |
| **P3** | Motor | Switch control optimization | Medium | Low |
| **P3** | Cognitive | Dyslexia-friendly font option, TTS integration | Low | Low |
| **P3** | Legal | FDA 510(k) pathway assessment (if needed) | High | Conditional |

---

## 8. Testing & Validation

### 8.1 Automated Testing
- **Tools:** axe-core, Lighthouse, WAVE, Pa11y
- **Coverage:** Run on every build. Catch 30-40% of issues.

### 8.2 Manual Testing
- **Screen readers:** NVDA (Windows), VoiceOver (iOS/macOS), TalkBack (Android)
- **Keyboard-only navigation:** Tab order, focus trapping, skip links
- **Zoom testing:** 200%, 400% browser zoom
- **Color blindness simulation:** Coblis, Sim Daltonism, Stark

### 8.3 User Testing
- **Recruit participants with disabilities:** Partner with disability organizations.
- **Minimum cohorts:**
  - 3+ blind/low-vision users
  - 3+ motor-impaired users
  - 3+ users with cognitive disabilities
  - 3+ users over 65
  - 3+ non-native English speakers
- **Compensation:** Pay all participants fairly for their expertise.

### 8.4 Continuous Monitoring
- Integrate accessibility checks into CI/CD pipeline.
- Quarterly accessibility audits.
- Track VPAT updates annually.

---

## 9. Resources & References

- [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [WHO Disability and Health Fact Sheet](https://www.who.int/news-room/fact-sheets/detail/disability-and-health)
- [MDN Web Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ADA.gov Web Accessibility Guidance](https://www.ada.gov/resources/web-guidance/)
- [Section 508 Standards](https://www.section508.gov/)
- [GDPR.eu Compliance Checklist](https://gdpr.eu/checklist/)
- [FDA Mobile Medical Applications Guidance](https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications)
- [HHS HIPAA for Professionals](https://www.hhs.gov/hipaa/for-professionals/index.html)
- [The A11Y Project](https://www.a11yproject.com/)
- [Coblis Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [Stark Accessibility Tools](https://www.getstark.co/)

---

## 10. Open Questions for Product Review

1. Will SKINgenius store or process images on-device or in the cloud? (HIPAA/GDPR implications)
2. What is the target launch region? (Determines GDPR, CCPA, and local regulatory scope)
3. Will there be any clinical validation studies? (Impacts FDA classification)
4. What is the monetization model? (Impacts data handling and user equity)
5. Do we have partnerships with dermatologists for urgent flagging workflows?
6. What is the timeline for WCAG 2.2 AA conformance?

---

*This report was compiled by the SKINgenius Research Agent using WHO, W3C, FDA, HHS, DOJ, and FTC public guidance. It does not constitute legal advice. Engage qualified regulatory counsel for compliance implementation.*
