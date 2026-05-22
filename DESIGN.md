---
version: alpha
name: SKINgenius
description: Evidence-based skin health intelligence platform connecting surface symptoms to internal health root causes with holistic treatment recommendations
colors:
  # Primary palette — clinical precision meets holistic warmth
  primary: "#0A2647"
  primary-light: "#144273"
  primary-dark: "#071D36"
  # Accent — biological vitality, DNA helix green
  accent: "#2CD674"
  accent-light: "#5EEAA0"
  accent-dark: "#1FA856"
  # Warmth — skin tone, human touch
  warmth: "#E8C8A0"
  warmth-light: "#F0DCC0"
  warmth-dark: "#C4A070"
  # Neutral — clinical backgrounds
  neutral: "#F8F6F3"
  neutral-warm: "#F5F0EB"
  neutral-cool: "#F0F2F5"
  # Surface — cards and containers
  surface: "#FFFFFF"
  surface-elevated: "#FFFFFF"
  surface-sunken: "#F2EFEA"
  # Text
  text-primary: "#0A2647"
  text-secondary: "#5A6B7F"
  text-tertiary: "#8A96A6"
  text-inverse: "#F8F6F3"
  # Semantic — health/clinical
  success: "#2CD674"
  warning: "#F5A623"
  error: "#E74C5E"
  info: "#4A90D9"
  # Condition severity colors
  mild: "#5EEAA0"
  moderate: "#F5A623"
  severe: "#E74C5E"
  urgent: "#B91C1C"
  # Evidence levels
  evidence-a: "#2CD674"
  evidence-b: "#4A90D9"
  evidence-c: "#F5A623"
  evidence-d: "#E74C5E"
typography:
  # Headlines — authoritative but approachable
  h1:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  # Body — clinical readability
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  # Data — ingredient concentrations, evidence levels, percentages
  data-lg:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum'"
  data-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum'"
  data-sm:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1
    fontFeature: "'tnum'"
  # Labels — clinical categories, evidence badges, section headers
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.02em
    textTransform: uppercase
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.04em
    textTransform: uppercase
  label-sm:
    fontFamily: Inter
    fontSize: 0.625rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.06em
    textTransform: uppercase
  # Caption — footnotes, PubMed citations, regulatory disclaimers
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
    fontStyle: italic
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  # Primary CTA — "Scan My Skin", "Get Recommendations"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#0A2647"
    rounded: "{rounded.lg}"
    padding: 14px 28px
    typography: "{typography.body-md}"
    fontWeight: 600
  button-primary-hover:
    backgroundColor: "{colors.accent-light}"
  button-primary-active:
    backgroundColor: "{colors.accent-dark}"
  # Secondary CTA — "Learn More", "View Evidence"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 14px 28px
    borderWidth: 2px
    borderColor: "{colors.primary}"
  button-secondary-hover:
    backgroundColor: "{colors.neutral-warm}"
  # Danger/Warning — "Not safe during pregnancy", "See dermatologist"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: 14px 28px
    fontWeight: 600
  # Cards — product recommendations, condition cards, ingredient cards
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "#E8E4DF"
    borderWidth: 1px
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-elevated:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  # Evidence badge — "Level A", "Level B", etc.
  badge-evidence-a:
    backgroundColor: "#E8FAF0"
    textColor: "#1FA856"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  badge-evidence-b:
    backgroundColor: "#EBF2FA"
    textColor: "#2B6CB0"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  badge-evidence-c:
    backgroundColor: "#FFF5E6"
    textColor: "#B87A1A"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  badge-evidence-d:
    backgroundColor: "#FDE8EB"
    textColor: "#C41D3A"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  # Severity indicator — mild/moderate/severe/urgent
  severity-mild:
    backgroundColor: "#E8FAF0"
    textColor: "#1FA856"
    rounded: "{rounded.sm}"
    padding: 4px 12px
  severity-moderate:
    backgroundColor: "#FFF5E6"
    textColor: "#B87A1A"
    rounded: "{rounded.sm}"
    padding: 4px 12px
  severity-severe:
    backgroundColor: "#FDE8EB"
    textColor: "#C41D3A"
    rounded: "{rounded.sm}"
    padding: 4px 12px
  severity-urgent:
    backgroundColor: "#C41D3A"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 4px 12px
  # Fit Score — product compatibility meter
  fit-score:
    rounded: "{rounded.full}"
    height: 8px
    backgroundColor: "#E8E4DF"
  fit-score-fill:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
  # Input — quiz, onboarding, search
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "#D4D0CB"
    borderWidth: 1px
    rounded: "{rounded.md}"
    padding: 12px 16px
    typography: "{typography.body-md}"
  input-focus:
    borderColor: "{colors.accent}"
    borderWidth: 2px
    boxShadow: "0 0 0 3px rgba(44,214,116,0.15)"
  # Navigation
  nav-link:
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-md}"
  nav-link-active:
    textColor: "{colors.primary}"
    fontWeight: 600
---

# SKINgenius Design System

## Overview

SKINgenius is a clinical-precision health platform with a human touch. The visual language sits at the intersection of **medical authority** and **holistic warmth** — like a dermatologist who also understands nutrition, hormones, and lifestyle. Every screen should feel trustworthy enough for medical-grade information, yet warm enough that someone dealing with acne or eczema feels seen, not diagnosed.

The design draws from three pillars:
- **Clinical precision** — Data, evidence levels, concentration ranges, pH values presented with typographic rigor
- **Biological vitality** — The accent green (#2CD674) evokes cellular health, DNA repair, growth. Not a generic "go" green — a living, enzymatic green.
- **Skin warmth** — The warmth palette (#E8C8A0) grounds the UI in the human body, in melanin and tissue tone. This is not beige or cream — it's the color of healthy skin across the spectrum.

The target user is health-conscious, evidence-seeking, and often anxious about their skin. They've been burned by marketing claims. The UI must feel like a **lab report that actually makes sense** — data-rich but never intimidating.

## Colors

### Primary Palette

- **Primary (#0A2647):** Deep ink blue — authority, trust, clinical depth. Used for headlines, navigation, and core text. Never feels cold because it's paired with warmth tones.
- **Accent (#2CD674):** Enzymatic green — cellular vitality, evidence-backed, "this works." Used exclusively for primary CTAs, evidence-A badges, and success states. This green says "your skin is healing."
- **Warmth (#E8C8A0):** Skin-tone warmth — the human element. Used for subtle backgrounds, dividers, and hover states. Evokes healthy dermis, not cosmetic beige.

### Neutral System

- **Neutral (#F8F6F3):** Warm white — never clinical white, never yellowed. The base layer for all screens.
- **Surface (#FFFFFF):** Pure white for elevated cards and containers against the warm neutral base.
- **Surface Sunken (#F2EFEA):** Subtle depression for form fields and inactive areas.

### Semantic Colors

- **Severity scale:** Mild (green) → Moderate (amber) → Severe (red) → Urgent (dark red). This is used for condition severity, red flags, and "see dermatologist" urgency.
- **Evidence levels:** A (green, strong clinical evidence) → B (blue, moderate) → C (amber, limited) → D (red, anecdotal). Every claim is tagged with evidence level. No exceptions.

### Color Rules

1. Accent green is reserved for positive actions and high-evidence content. Never use it decoratively.
2. Error red (#E74C5E) is used for contraindications, pregnancy warnings, and dermatologist referral CTAs.
3. Warmth tones are used for secondary navigation, subtle backgrounds, and hover states — never for primary content.
4. All text-color-on-background combinations must meet WCAG AA (4.5:1 for body text, 3:1 for large text).

## Typography

Inter is the sole typeface. It's clean, highly readable at small sizes (critical for ingredient lists and concentration data), and has tabular number support (essential for Fit Scores and evidence levels).

### Typographic Hierarchy

- **H1/H2:** Bold, tight tracking — used for condition names and screen titles. Feels authoritative, like a medical textbook heading.
- **Body:** Regular weight, generous line-height (1.6) — skin health information requires reading. Never compress body text.
- **Data:** Tabular figures, tight tracking — for concentration ranges (0.5–2%), Fit Scores (87%), evidence levels. Numbers must align perfectly.
- **Labels:** Uppercase, wide tracking — for section dividers, evidence badges, and category pills. Clinical, like a lab label.
- **Caption:** Italic — for PubMed citations, regulatory disclaimers, and evidence footnotes. This is the "trust, but verify" layer.

### Typographic Rules

1. Never use italic for emphasis in body text. Use weight changes (600) or color changes instead.
2. Numbers in data contexts always use tabular figures (`font-feature-settings: 'tnum'`).
3. Concentration ranges use en-dash (0.5–2%), not hyphen.
4. Evidence citations always use superscript format: "Niacinamide reduces hyperpigmentation¹²"

## Layout

### Grid System

- 8px base grid. All spacing, padding, and sizing is a multiple of 8.
- Max content width: 680px for article/readable content, 1200px for dashboard layouts.
- Mobile-first. 60% of users will be on mobile during their skincare routine.

### Key Layout Patterns

1. **Scan Flow** — Full-screen camera → Results stack → Recommendations. No sidebar. Single column. Each result is a card.
2. **Results Dashboard** — Condition cards in priority order (severity-weighted). Root cause section below. Lifestyle factors in expandable sections.
3. **Product Card** — Horizontal: product image left, data right. Fit Score as circular progress. Evidence badges inline. Pregnancy safety icon prominent.
4. **Routine Builder** — AM/PM tabs. Drag-to-reorder. Compatibility warnings inline (not hidden).

### Spacing Rules

- Screen padding: 16px mobile, 24px tablet, 32px desktop
- Card padding: 24px
- Section gaps: 48px (3xl)
- Between cards in a list: 12px (md variant)

## Elevation & Depth

Minimal elevation. SKINgenius is clinical, not playful.

- **Level 0:** Base layer (neutral background)
- **Level 1:** Cards (1px border, no shadow)
- **Level 2:** Elevated cards (subtle shadow: `0 1px 3px rgba(10,38,71,0.08)`)
- **Level 3:** Modals and overlays (`0 4px 16px rgba(10,38,71,0.12)`)
- **Level 4:** Toast notifications (`0 8px 24px rgba(10,38,71,0.16)`)

No colored shadows. No blur effects on cards. Elevation is subtle and functional.

## Shapes

- **Buttons:** lg radius (16px) — approachable but not bubbly
- **Cards:** lg radius (16px) — soft containers, not sharp boxes
- **Inputs:** md radius (12px) — comfortable typing targets
- **Badges:** full radius (9999px) — pill-shaped evidence and severity indicators
- **Avatars/Photos:** full radius (circular for user photos, rounded-lg for product images)

No hard corners anywhere. The system is rounded but not cartoonish — medical apps that look "fun" undermine trust.

## Components

### Condition Card

The primary content unit. Shows: condition name (h3), severity badge, brief description (body-sm), evidence level, key triggers, and "Learn more" link. Tappable to reveal full root-cause analysis.

### Product Recommendation Card

Horizontal layout: product image (80×80, rounded-lg) left, content right. Shows: product name (h4), brand (label-sm), Fit Score (circular, accent green fill), key actives (badge pills), pregnancy safety icon (if applicable), price indicator ($ to $$$$). "Add to routine" CTA.

### Evidence Badge

Pill-shaped, color-coded by evidence level. Always uppercase label (LEVEL A, LEVEL B, etc.). Positioned next to any claim that references clinical evidence. Non-negotiable — every recommendation must carry an evidence badge.

### Severity Indicator

Color-coded bar or pill showing condition severity. Mild = green, Moderate = amber, Severe = red, Urgent = dark red with pulsing animation. Used on condition cards and in scan results header.

### Fit Score Meter

Circular or horizontal progress bar showing product-skin compatibility percentage. Accent green fill (#2CD674) for scores ≥70%, amber for 40-69%, red for <40%. Always shows percentage number inside. This is the "will this work for me?" answer at a glance.

### Pregnancy Safety Icon

Shield icon with checkmark (safe) or X (avoid). Red shield for contraindicated, green for safe. Positioned prominently on product cards. This is a safety-critical UI element — never hidden behind a tap.

### Routine Timeline

AM/PM tab toggle. Vertical timeline of product application steps. Each step shows: step number, product name, key active, application order, compatibility notes. Drag-to-reorder. Warning icon for incompatible combinations (e.g., retinol + AHA same night).

### Root Cause Map

Visual connection between surface condition → internal factors. Example: Acne → Insulin Resistance → Diet → Gut Microbiome. Interactive nodes, tappable for deep-dive. Uses connecting lines in warmth color (#E8C8A0).

## Do's and Don'ts

### Do

- ✅ Show evidence levels on every claim. No exceptions.
- ✅ Use warmth tones for secondary elements, accent green for primary actions only.
- ✅ Prioritize pregnancy safety — it must be visible at first glance on every product.
- ✅ Use tabular figures for all numerical data (concentrations, scores, percentages).
- ✅ Keep clinical language plain-English. "Exfoliates dead skin cells" not "Promotes desquamation of corneocytes."
- ✅ Show the root-cause connection. Always make the internal health link visible.
- ✅ Design for anxious users — people checking skin conditions are often worried. Warmth over coldness.
- ✅ Use the severity color system consistently. Mild=green, Moderate=amber, Severe=red, Urgent=dark-red.
- ✅ Cite sources. "American Academy of Dermatology, 2024" builds trust.

### Don't

- ❌ Use accent green for anything other than primary CTAs and success/evidence-A states.
- ❌ Hide pregnancy safety behind a tap or accordion. It must be immediately visible.
- ❌ Use "whitening" or "lightening" — always "even tone" or "reduce hyperpigmentation."
- ❌ Show conditions without severity assessment. Every condition needs mild/moderate/severe/urgent.
- ❌ Recommend products without evidence backing. Every product recommendation must cite evidence level.
- ❌ Use italic for emphasis in body text. Use weight or color changes instead.
- ❌ Use pure white (#FFF) as a background — always use the warm neutral (#F8F6F3).
- ❌ Make the user feel diagnosed. Always include "consult a dermatologist" for moderate+ severity.
- ❌ Use decorative blur effects, gradient overlays, or neon accents. This is clinical, not crypto.