# SKINgenius Mobile App — Replit Agent Prompt

Copy this entire prompt into Replit's Agent to build the SKINgenius mobile prototype.

---

Build a React Native (Expo) mobile app called "SKINgenius" — an AI-powered skin analysis app. This should be a premium, polished mobile experience.

## Design Reference (Lovi.care Inspired, But Better)

Reference app: Lovi.care (skin analysis app). Here's their flow and how we improve it:

### What Lovi.care Does Well (Copy These)
1. **"Algorithm Theater" loading animation** — shows numbers counting down (45K→1K→64→8) to build trust and perceived value. We want this.
2. **Strengths before problems** — show positive reinforcement cards first ("Natural Resilience", "Self-Hydrating Capacity"), then conditions. Makes users feel good before prescribing.
3. **Zone-by-zone analysis** — each face zone (forehead, T-zone, cheeks, chin, under-eye) gets its own card with concern, severity, and photo thumbnail.
4. **Fit% badges on products** — purple/green pill showing "99% Fit" on each recommended product.
5. **"Why we picked it" copy** — each product has ingredient-specific explanation text.
6. **AM/PM routine with ordered steps** — step numbers, product images, prices, alternatives.
7. **Before/after progress tracking** — baseline vs current with goal zones highlighted.
8. **Commitment slider on onboarding** — "Let's commit to care about yourself" with slide-to-engage.

### What We Do DIFFERENTLY (Better)
1. **Fitzpatrick Type Detection** — we explicitly detect skin tone (Types I-VI) and calibrate all recommendations accordingly. Lovi.care doesn't do this.
2. **Root Cause Analysis** — we show what's CAUSING conditions (hormonal, gut health, diet-linked), not just symptoms. Include root cause cards with animated score bars.
3. **Diet Awareness** — "Your eczema may be linked to dairy sensitivity" — Lovi.care doesn't connect diet to skin.
4. **Evidence Levels** — every ingredient recommendation shows evidence grade (A/B/C/D with descriptions: "Double-blind clinical trial" vs "Anecdotal"). Lovi.care just says "MD Verified."
5. **Free Forever** — no trial gating, no paywall on scans. Lovi.care charges after 3 days.
6. **Privacy-First** — photos analyzed on-device, never uploaded. Lovi.care uploads to servers.

## Color Scheme
- Primary: Emerald (#059669)
- Neutrals: Stone (#78716C, #F5F5F4)
- Background: #FFFBF5 (warm white)
- Accent: Amber (#F59E0B) for warnings, Red (#EF4444) for severe
- Text: #1C1917 (stone-900)

## Screens to Build

### 1. Onboarding (3 slides)
- Slide 1: "Your skin, understood." — camera icon, Fitzpatrick diversity in hero image
- Slide 2: "AI-powered analysis" — 3-step flow (Scan → Analyze → Recommend)
- Slide 3: "Works on every skin tone" — Fitzpatrick scale visual (Types I-VI)
- CTA: "Get Started" → navigates to scan

### 2. Home Screen
- Greeting: "Good morning, [Name]"
- Last scan summary: Skin score, Fitzpatrick type detected
- Quick actions: "New Scan" (camera button), "View Routine", "Products"
- Recent scans list (last 3)
- Bottom tab navigation: Home | Scan | Routine | Products | Profile

### 3. Scan Flow
- **Screen 3a: Fitzpatrick Selector** — 6 skin tone swatches in a row, visual selection
- **Screen 3b: Camera Capture** — face outline guide, capture button, gallery upload option
- **Screen 3c: Analyzing** — Dark background with glowing particles animation
  - Stage 1: "45,082 conditions in our database"
  - Stage 2: "1,029 matching your Fitzpatrick type"
  - Stage 3: "64 targeting your specific concerns"
  - Stage 4: "8 personalized recommendations ready"
  - Progress bar with percentage
- **Screen 3d: Strengths First** — positive cards: "Natural Resilience", "Good Hydration", "Even Tone"
- **Screen 3e: Conditions Detected** — zone cards with severity badges (mild=amber, moderate=orange, severe=red)
- **Screen 3f: Root Cause Analysis** — animated horizontal bars:
  - Barrier Function: 72% (green)
  - Inflammation: 45% (red)
  - Hydration: 88% (blue)
  - Oil Balance: 61% (amber)

### 4. Results Dashboard
- **Summary Banner** — overall score (0-100), Fitzpatrick type, scan date
- **Zone Map** — face outline divided into 7 zones, colored by severity
- **Conditions Grid** — cards with: name, confidence %, severity badge, features list, zone
- **Root Causes** — animated score bars with labels
- **Recommendations** — product cards with: image, name, brand, fit score bar, evidence badge (A/B/C/D), price, "Why this?" expandable
- **"Share with Esthetician"** CTA
- **"Rescan"** button

### 5. Routine Builder
- **AM/PM tabs**
- **Ordered steps** with drag-to-reorder
- **Each step**: category icon, product name, instructions, frequency badge (daily/weekly)
- **Add step** button
- **"Get AI Recommendations"** button
- **Empty state**: "No routine yet. Start by scanning your skin."

### 6. Products Browse
- **Search bar** at top
- **Filter chips**: Category (Cleanser, Serum, Moisturizer, Sunscreen, Treatment), Price ($, $$, $$$, $$$$)
- **Product cards**: image, name, brand, fit score, evidence level, price, "Add to Routine"
- **Sort**: Fit Score, Price, Evidence Level
- **"Scan for Personalized Results"** CTA banner

### 7. Profile
- **Display name** (editable)
- **Fitzpatrick type** selector (visual swatches)
- **Skin type** selector (Oily/Dry/Combination/Normal/Sensitive)
- **Skin concerns** multi-select tags
- **Allergies** input
- **Settings**: notifications, data privacy, logout

## Mock Products (8 Products)
```json
[
  {"name": "Gentle Foaming Cleanser", "brand": "CeraVe", "category": "cleanser", "price": "$", "fit_score": 95, "evidence_level": "A", "key_actives": ["Ceramides", "Hyaluronic Acid", "Niacinamide"]},
  {"name": "BHA Pore-Refining Toner", "brand": "Paula's Choice", "category": "toner", "price": "$$", "fit_score": 92, "evidence_level": "A", "key_actives": ["Salicylic Acid 2%", "Green Tea"]},
  {"name": "Vitamin C Serum 20%", "brand": "SkinCeuticals", "category": "serum", "price": "$$$", "fit_score": 89, "evidence_level": "A", "key_actives": ["L-Ascorbic Acid 20%", "Ferulic Acid", "Vitamin E"]},
  {"name": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "category": "serum", "price": "$", "fit_score": 94, "evidence_level": "B", "key_actives": ["Niacinamide 10%", "Zinc PCA"]},
  {"name": "Daily Moisturizing Lotion", "brand": "CeraVe", "category": "moisturizer", "price": "$", "fit_score": 91, "evidence_level": "A", "key_actives": ["Ceramides", "Hyaluronic Acid"]},
  {"name": "UV Aqua Rich SPF 50+", "brand": "Bioré", "category": "sunscreen", "price": "$", "fit_score": 88, "evidence_level": "B", "key_actives": ["Chemical UV filters", "Hyaluronic Acid"]},
  {"name": "Adapalene Gel 0.1%", "brand": "Differin", "category": "treatment", "price": "$$", "fit_score": 87, "evidence_level": "A", "key_actives": ["Adapalene 0.1%"]},
  {"name": "Peptide Eye Cream", "brand": "The Inkey List", "category": "eye_cream", "price": "$", "fit_score": 85, "evidence_level": "B", "key_actives": ["Matrixyl 3000", "Caffeine"]}
]
```

## Technical Requirements
- React Native with Expo (managed workflow)
- React Navigation for routing
- NativeWind or Tailwind CSS for styling
- TypeScript strict
- Mobile-first responsive
- Smooth animations (React Native Animated API or Reanimated)
- Camera access via expo-camera
- Image picker via expo-image-picker

## What NOT to Include Yet
- Real AI model integration (mock data is fine)
- Supabase backend (mock data)
- Payments/authentication
- App store submission

This is a visual prototype — it should look and feel like a finished product even with mock data.
