# Lovi.care Screen Analysis — Competitive Reference

> **Date:** 2026-05-15
> **Purpose:** Design reference for SKINgenius scan flow UI

---

## Complete Lovi.care Workflow (12 screens)

### Screen 1: Onboarding — AI Scanner Introduction
- **Type:** Feature promotion / onboarding
- **Layout:** Cream/off-white background, photo-illustration of woman's face (dark curly hair, gold eyeshadow) with glowing dotted mesh overlay showing AI scanning
- **Annotation bubbles:** 3 floating white bubbles with thin connector lines pointing to face zones:
  - Forehead → "Pigmentation" / "Your Focus" (pink target icon)
  - Under-eye/Cheek → "Wrinkles" / "Strength" (mint-green gauge icon)
  - Chin/Jaw → "Oily" / "Your Skin Type" (gray pill)
- **Headline:** "Sunshine, let's analyze your skin with our AI Face scanner."
- **Subtext:** "You'll also be able to monitor your skin's changes over time."
- **Primary CTA:** Blue-to-purple gradient pill button: "Make a face scan"
- **Secondary CTA:** Off-white/cream pill button: "Not now"
- **Design:** Friendly, warm tone ("Sunshine"), approachable clinical aesthetic

### Screen 2: Camera Permission Request
- **Type:** iOS system permission dialog
- **Layout:** Dark/black background with system alert overlay
- **Dialog:** "Lóvi Skincare would like to access the Camera"
- **Description:** "Camera is used for face and product scans to personalize skincare recommendations."
- **Actions:** "Don't Allow" / "Allow"
- **Behind:** App interface with "Continue" button visible

### Screen 3: Allow Camera Access
- **Type:** Pre-permission soft ask
- **Layout:** Full black background, centered white text
- **Copy:** "Allow Camera / access to make a / face scan" (3 lines, centered, large bold white)
- **CTA:** White pill button with black text: "Continue"
- **Close:** Circle outline × button top-right

### Screen 4: Scan Instructions
- **Type:** Bottom sheet modal (white, large top-corner radius ~36-40pt)
- **Layout:** White sheet over black camera background
- **Header:** "Scan Instructions" (left) + × close (right)
- **3 Steps** (each: black number badge + thumbnail photo + title + subtitle):
  1. **"Take glasses off"** / "And find a well-lit area" — Photo: woman front-facing, natural indoor lighting
  2. **"Keep head straight"** / "And press the Start button" — Photo: same woman with white oval face-guide overlay
  3. **"Make a full circle"** / "Slowly rotating & closing all the segments" — Photo: woman in left profile with green circular progress ring
- **CTA:** Light gray (#F2F2F7) pill button: "Continue"

### Screen 5: Live Scan — Start
- **Type:** Full-screen camera with AR overlay
- **Layout:** Full black background, oval face mask, heavy Gaussian blur outside oval
- **Top:** `?` help button | Lighting status pill (green sun + "OK") | `×` close
- **Center:** Live camera with oval face-positioning guide, face visible inside
- **Bottom:** White circle button with black "Start" text + concentric ripple rings
- **Features:** Real-time lighting validation, face positioning guide

### Screen 6: Live Scan — Head Rotation
- **Type:** Full-screen camera with AR mesh + progress tracking
- **Layout:** Same oval mask with AR face-tracking mesh + sparkle dots
- **Progress:** Dashed circle around oval with green tick marks (~20-25%)
- **Bottom pill:** "Move your head slowly to complete the circle"
- **Features:** ARKit mesh overlay, progressive angle capture, lighting validation

### Screen 7: Live Scan — Continued
- **Type:** Same as Screen 6, further along (~40-50% progress)
- **More green ticks around the oval**
- **Same instruction text**

### Screen 8: Privacy Consent Sheet
- **Type:** Bottom sheet over blurred camera background
- **Header:** "Privacy-First Processing For Your Photos"
- **Body:** "Help us to improve the face scanning experience and allow the use of photos for algorithm training. It's secure and guarantees privacy."
- **Primary CTA:** Blue-to-purple gradient pill: "Allow photo processing"
- **Secondary CTA:** Light gray pill: "Don't allow"
- **Footer:** "By proceeding, you allow Lóvi to store and process photos for algorithm training. Click **here** for details."
- **Note:** This is a TRAINING consent, not just analysis consent — important distinction

### Screen 9: Processing — Analysis
- **Type:** Dark mode processing screen
- **Layout:** Large card showing side-profile photo with 3D wireframe mesh + sparkle overlay
- **Progress bars:**
  - ✓ "Analysing scan results..." (~65-70%)
  - ○ "Building a scan report..." (gray/pending)
- **Features:** Two-phase progress feedback

### Screen 10: Processing — Multi-Angle Gallery
- **Type:** Dark mode, radial photo layout
- **Layout:** Black background, central circular hero (front face with mesh) + 6 orbital thumbnails (different angles, each with green ✓ badge)
- **Progress bars:**
  - ✓ "Analysing scan results..." (~90%)
  - ○ "Building a scan report..." (~25-40%)
- **Features:** Visual confirmation of all captured angles

### Screen 11: Results — Skin Analysis
- **Type:** Results view with AR mesh overlay + bottom sheet
- **Top:** Photo with 3D wireframe mesh, timestamp pill ("May 15 at 11:47 AM") + blue "Next" button
- **Concern filter pills:** Horizontally scrollable: "All" (selected/white), "Wrinkles", "Freckles", "Moles" (dark translucent)
- **Bottom sheet:** "Skin Analysis" heading
  - Small zoomed thumbnail (T-zone area)
  - Orange "T Zone" label with pin icon
  - "Excessive Oil and Congestion" heading
  - Gray description: "The T-zone shows significant sebum production and pore congestion that requires balancing. Regular use of BHA and clay will help clear these areas and..."

### Screen 12: (Implied full results dashboard — after "Next" button)

---

## Design Patterns for SKINgenius

### UX Flow We Should Replicate
1. **Onboarding intro** — personalized greeting + AI scanner pitch
2. **Camera permission** (system + soft ask)
3. **Scan instructions** — 3-step visual guide with thumbnails
4. **Live scan** — oval mask + lighting check + head rotation + AR mesh
5. **Privacy consent** — clear, GDPR-compliant
6. **Processing** — two-phase progress with angle gallery
7. **Results** — concern filters + zone-based analysis cards

### Key Differences for SKINgenius (vs Lovi)
| Aspect | Lovi.care | SKINgenius |
|--------|-----------|------------|
| Concerns | Wrinkles, Freckles, Moles | Acne, Hyperpigmentation, Redness, Texture, Scarring, Oil, Dryness |
| Analysis depth | Surface-level (zones) | Root-cause (surface → internal health) |
| Results | Zone description | Zone description + root cause + 4-tier recommendations |
| Privacy | "Allow training" | "Photos analyzed by AI, deleted within 24h" (no training opt-in) |
| Processing | Black-box "analysing" | Transparent: Quality check → Condition classification → Results |
| Brand tone | Warm/friendly ("Sunshine") | Clinical precision + holistic wellness |
| Skin diversity | Shown with annotation model | Must show diverse Fitzpatrick types |

### UI Components to Build
1. **ScannerOnboarding** — Intro screen with AI pitch + annotation bubbles
2. **CameraPermission** — Soft ask → system ask flow
3. **ScanInstructions** — 3-step bottom sheet with thumbnails
4. **ScanCamera** — Live camera with oval mask, lighting check, head rotation progress
5. **PrivacyConsent** — Bottom sheet for photo processing consent
6. **ProcessingScreen** — Two-phase progress (Kimi QC → MiMo classification)
7. **ResultsFilter** — Concern pills + zone-based analysis cards
8. **RootCauseCards** — Our addition: surface → internal health connection
9. **RecommendationTiers** — Product / Supplement / Practitioner / Basys Health

---

---

## Second Batch — Screens 13–16 (2026-05-15)

### Screen 13: Camera Permission (System Dialog + App Continue)
- **Type:** System-level camera permission dialog + app-level navigation
- **Layout:** Dark/black background, iOS system permission dialog centered
- **System Dialog:** Camera icon with accessibility badge, "Lóvi Skincare would like to access the Camera"
- **System description:** "Camera is used for face and product scans to personalize skincare recommendations."
- **System actions:** "Don't Allow" / "Allow" (standard iOS buttons)
- **Below dialog:** Large full-width rounded "Continue" button (light gray bg, black text)
- **Top-right:** Circular × close button
- **Pattern:** System dialog + app-level Continue = two-step permission flow

### Screen 14: Pre-Permission Soft Ask (Dark Mode)
- **Type:** Pre-education screen before system camera prompt
- **Layout:** Full black background, centered content, minimal UI
- **Copy:** "Allow Camera / access to make a / face scan" (3 lines, large bold white text, centered)
- **CTA:** White pill button with black text: "Continue"
- **Close:** Circle outline × button top-right corner
- **Pattern:** Educate user on WHY before asking for permission — increases grant rate significantly

### Screen 15: Scan Instructions Bottom Sheet
- **Type:** Modal bottom sheet with 3-step visual guide
- **Layout:** White rounded-top sheet over dark camera background
- **Header:** "Scan Instructions" (left-aligned, bold) + × close button (right)
- **3 Steps** (each: black number badge circle + real photo thumbnail + bold title + gray subtitle):
  1. **"Take glasses off"** / "And find a well-lit area" — Photo: woman front-facing, natural lighting
  2. **"Keep head straight"** / "And press the Start button" — Photo: woman with white oval face guide overlay
  3. **"Make a full circle"** / "Slowly rotating & closing all the segments" — Photo: woman left-profile with green circular progress ring
- **CTA:** Light gray (#F2F2F7) rounded pill button: "Continue"
- **Pattern:** Numbered steps with real photos (not illustrations) set clear expectations and reduce scan failures

### Screen 16: Processing — AR Mesh + Progress
- **Type:** Dark mode processing/analysis screen
- **Layout:** Dark background, large card showing side-profile photo with 3D wireframe mesh + sparkle/glow overlay
- **Visual:** Captured face photo with white/blue AR mesh overlay and data points (glowing dots) showing active analysis
- **Progress bars:**
  - ✓ "Analysing scan results..." (~65-70% filled)
  - ○ "Building a scan report..." (gray, pending/not started)
- **Pattern:** Sequential progress bars with visual mesh overlay make AI processing feel tangible and reduce perceived wait time

---

---

## Third Batch — Screens 17–22 (2026-05-15)

### Screen 17: Single-Angle Scan Processing (Side Profile)
- **Type:** Dark mode processing screen — individual angle
- **Layout:** Black background, large card with side-profile photo + 3D wireframe mesh + glowing data points
- **Progress bars:**
  - ✓ "Analysing scan results..." (~65-70% filled)
  - ○ "Building a scan report..." (gray/pending)
- **Pattern:** Per-angle processing before full report compilation. Each captured angle gets its own processing card.

### Screen 18: Opposite Side Profile Processing
- **Type:** Same as Screen 17, different angle
- **Pattern:** Consistent processing UI across all angles — users see the same layout regardless of which angle is being processed

### Screen 19: Multi-Angle Verification — All Scans Complete
- **Type:** Dark mode, radial photo layout with completion confirmation
- **Layout:** Black background, central circular hero (front face with glowing halo) + 6 orbital thumbnails (all angles), each with green ✓ badge
- **Progress bars:**
  - ✓ "Analysing scan results..." (100% filled, green checkmark)
  - ✓ "Building a scan report..." (partially filled)
- **Pattern:** Trust-building visual confirmation — all angles verified before building the report. Glowing halo on central scan creates focus hierarchy.

### Screen 20: Multi-Angle Report Building (Mid-Progress)
- **Type:** Same radial layout, progress advancing
- **Progress bars:** "Building a scan report..." bar further filled (maybe 40-50%)
- **Pattern:** Incremental progress tracking — keeps users engaged during longer wait

### Screen 21: Final Report Compilation (Nearly Done)
- **Type:** Same radial layout, near-completion
- **Progress bars:** "Building a scan report..." bar almost full (~85-90%)
- **Pattern:** Near-completion signal — sets clear expectations that the wait is almost over

### Screen 22: Initial Results Dashboard
- **Type:** First view of completed analysis — the main results entry point
- **Top section:**
  - iOS status bar
  - Pill badge: scan timestamp ("May 15 at 11:47 AM")
  - Blue "Next" action button (top right)
- **Main area:** Large front-face scan with facial wireframe overlay retained
- **Filter bar:** Horizontally scrollable concern pills:
  - "All" (selected, white bg)
  - "Wrinkles" (dark, wave icon)
  - "Freckles" (dark, purple dot icon)
  - "Moles" (dark, teal icon)
- **Bottom results card (white, rounded top corners):**
  - "Skin Analysis" heading
  - Zoomed T-zone thumbnail + orange "T Zone" label with pin icon
  - Finding: "Excessive Oil and Congestion"
  - Description: mentions BHA and clay recommendations
- **Pattern:** Filterable analysis with location-linked results — zoomed thumbnails paired with zone labels make findings feel specific and actionable

---

## Complete Workflow Map (All 22 Screens)

```
Onboarding → Camera Permission (soft ask) → Camera Permission (system) →
Scan Instructions (3-step) → Live Scan (start) → Head Rotation →
More Rotation → Privacy Consent →
Single-Angle Processing → Opposite Angle Processing →
Multi-Angle Verification → Report Building (mid) → Report Building (near-done) →
Results Dashboard (filter pills + zone cards) → Full Dashboard
```

## Key Design Patterns Summary

| Pattern | Lovi Implementation | SKINgenius Adaptation |
|---------|--------------------|--------------------|
| Progressive processing | 2 bars: "Analysing" + "Building report" | 3 bars: "Quality Check" → "Classification" → "Root Causes" |
| Multi-angle verification | Radial layout with green ✓ badges | Single-photo + quality gate (no AR head rotation in v1) |
| Concern filters | Pills: All, Wrinkles, Freckles, Moles | Pills: All, Acne, Hyperpigmentation, Redness, Texture, Oil |
| Zone-linked results | Zoomed thumbnail + zone label + description | Zone card + root cause connection + 4-tier recommendations |
| Privacy | Opt-in for algorithm training | Opt-in NOT offered — photos auto-deleted in 24h |
| AR mesh overlay | 3D wireframe + glowing data points | Simpler: face outline + progress dots (v1) |

*All 22 Lovi.care screens documented. SKINgenius scan flow architecture complete.*