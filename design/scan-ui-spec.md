# SKINgenius — Scan → Treatment Simulation UX Specification

> **Status:** Draft v1.0  
> **Owner:** Aura (Design Agent)  
> **Date:** 2026-06-10  
> **Scope:** Complete user flow from scan initiation through treatment simulation viewing

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [User Flow Overview](#user-flow-overview)
3. [Screen 1: Scan Prompt](#screen-1-scan-prompt)
4. [Screen 2: Camera/Scan](#screen-2-camerascan)
5. [Screen 3: Post-Scan Choice](#screen-3-post-scan-choice)
6. [Screen 4A: AI Recommendations](#screen-4a-ai-recommendations)
7. [Screen 4B: Zone Selection](#screen-4b-zone-selection)
8. [Screen 5: Simulation View](#screen-5-simulation-view)
9. [Edge Cases & Error States](#edge-cases--error-states)
10. [Accessibility Considerations](#accessibility-considerations)
11. [Animation & Motion Specs](#animation--motion-specs)

---

## Design Principles

### Vibe: Premium Wellness, Not Hospital
- **Medical-grade precision** in data presentation
- **Spa-like warmth** in visuals and tone
- **Apple/Oura-level polish** in interactions
- **Trust through transparency**, not authority through coldness

### Core Mantras
1. **"Your data, your control"** — Privacy is a feature, not an afterthought
2. **"See what's possible"** — Optimistic, empowering framing
3. **"Evidence meets intuition"** — AI suggestions feel collaborative, not prescriptive
4. **"Premium but approachable"** — Luxury without intimidation

### Visual Direction
- Clean, generous whitespace (Apple-esque)
- Soft gradients and glassmorphism (subtle, tasteful)
- Organic curves over sharp corners (skin = organic)
- Photography-forward (real faces, real results)

---

## User Flow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Scan Prompt   │────▶│  Camera/Scan    │────▶│  Post-Scan    │
│   (Screen 1)    │     │  (Screen 2)     │     │  Choice (Scr 3) │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                              ┌────────────────────────┘
                              │
                    ┌─────────▼──────────┐    ┌──────────▼─────────┐
                    │ AI Recommendations │    │  Zone Selection    │
                    │   (Screen 4A)      │    │   (Screen 4B)      │
                    └─────────┬──────────┘    └──────────┬─────────┘
                              │                        │
                              └──────────┬─────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   Simulation View   │
                              │    (Screen 5)     │
                              └───────────────────┘
```

**Total Screens:** 5 primary screens (with 2 branching paths at Screen 3)
**Estimated Journey Time:** 2-4 minutes (scan) + 1-2 minutes (exploration)
**Key Differentiator vs AI Aesthetics:** The **choice** at Screen 3 — AI-guided OR self-directed exploration

---

## Screen 1: Scan Prompt

### Purpose
Invite the user to begin their skin analysis journey. Set expectations, build trust, create excitement.

### Layout

```
┌─────────────────────────────┐
│ [Status Bar]                │
├─────────────────────────────┤
│                             │
│    ╭──────────────────╮     │
│    │                  │     │
│    │   [Hero Image]   │     │ ← Premium face scan
│    │   Soft gradient  │     │   illustration or
│    │   bg with subtle │     │   lifestyle photo
│    │   mesh overlay   │     │
│    │                  │     │
│    ╰──────────────────╯     │
│                             │
│         "See What's         │
│          Possible"          │
│                             │
│   Discover your skin's      │
│   potential with AI-        │
│   powered analysis and      │
│   personalized treatment    │
│   simulations.              │
│                             │
│   ╭─────────────────────╮   │
│   │  📷  Start Scan     │   │ ← Primary CTA
│   ╰─────────────────────╯   │
│                             │
│   ───── or ─────            │
│                             │
│   Upload a photo            │ ← Secondary option
│                             │
│   ╭─────────────────────╮   │
│   │ 🔒 Privacy Promise  │   │ ← Trust badge
│   │ Your photos are     │   │
│   │ processed on-device │   │
│   │ and never stored    │   │
│   │ without permission  │   │
│   ╰─────────────────────╯   │
│                             │
│ [Tab Bar — if applicable]   │
└─────────────────────────────┘
```

### Elements

#### Hero Section (Top 40%)
- **Asset:** Abstract face mesh illustration OR lifestyle photo of diverse person
- **Treatment:** Soft gradient overlay (rose-gold to cream)
- **Mesh overlay:** Subtle wireframe face hinting at the AI capability
- **Height:** ~320pt on mobile, responsive on tablet

#### Headline
- **Text:** "See What's Possible"
- **Typography:** Display Serif (Georgia or similar) — elegant, editorial
- **Size:** 32-40pt mobile / 48-56pt tablet
- **Color:** Deep charcoal (#1A1A1A) or near-black
- **Alignment:** Center

#### Subhead
- **Text:** "Discover your skin's potential with AI-powered analysis and personalized treatment simulations."
- **Typography:** Body Sans (Inter/System)
- **Size:** 16pt mobile / 18pt desktop
- **Color:** Warm gray (#6B6B6B)
- **Max-width:** 280pt centered

#### Primary CTA — "Start Scan"
- **Style:** Filled pill button, rose-gold gradient
- **Size:** Full-width minus 48pt margins, 56pt height
- **Icon:** Camera icon left-aligned in button
- **Label:** "Start Scan"
- **Shadow:** Subtle drop shadow (0 4px 12px rgba(212, 160, 160, 0.3))
- **Press state:** Scale to 0.97, darken 5%

#### Secondary Option — "Upload Photo"
- **Style:** Text button with underline
- **Label:** "Or upload a photo from gallery"
- **Color:** Rose-gold (#D4A0A0)
- **Tap target:** Minimum 44pt height

#### Trust Badge — Privacy Promise
- **Style:** Card with icon, border, or subtle background
- **Background:** Cream tint (#FDF8F5) with 1pt border (#E8DDD6)
- **Corner radius:** 12pt
- **Padding:** 16pt all sides
- **Icon:** Lock/shield icon, rose-gold
- **Headline:** "Your Privacy Matters"
- **Body:** "Your photos are processed on-device and encrypted. We never sell your data. You can delete your scans anytime."
- **CTA:** "Learn more about our privacy" → opens modal/link

### Interactions
| Trigger | Action | Duration | Easing |
|---------|--------|----------|--------|
| Screen load | Hero fades in + slides up | 600ms | ease-out-cubic |
| Headline | Fades in after hero | 400ms | ease-out |
| CTA | Slides up + fades | 500ms | ease-out-back |
| Tap "Start Scan" | Navigate to Screen 2 | 300ms | — |
| Tap "Upload" | Open native photo picker | Instant | — |

### Entry Points
- Home screen "Scan" tab
- Dashboard "Analyze Your Skin" card
- Onboarding completion prompt
- Push notification deep link

### Exit Points
- → Screen 2 (Camera/Scan)
- → Photo picker (native OS)
- → Privacy policy (modal/web)

---

## Screen 2: Camera/Scan

### Purpose
Capture the user's face with real-time AI feedback. The experience should feel magical but reassuring.

### Layout

```
┌─────────────────────────────┐
│ [Status Bar]                │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    LIVE CAMERA VIEW   │  │ ← Full bleed camera
│  │                       │  │
│  │   ○  ○  ○  ○  ○     │  │ ← Landmark dots
│  │    \   ○   /          │  │   (37+ points)
│  │     \  |  /           │  │
│  │      ○─○─○            │  │
│  │     /  |  \           │  │
│  │    /   ○   \          │  │
│  │   ○  ○  ○  ○  ○     │  │
│  │                       │  │
│  │  [Face Mesh Overlay]  │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  🔄  Before / After   │  │ ← Toggle (top overlay)
│  └───────────────────────┘  │
│                             │
│      "Hold still..."        │ ← Status text
│                             │
│      [■■□□□]  40%           │ ← Progress indicator
│                             │
│  ┌───────────────────────┐  │
│  │    [Capture Button]   │  │ ← Large circular shutter
│  │        ◉              │  │
│  └───────────────────────┘  │
│                             │
│  [Flip] [Gallery] [Flash] │ ← Camera controls
└─────────────────────────────┘
```

### Camera View (Full Bleed)
- **Aspect:** Covers entire screen above bottom control area
- **Overlay:** Semi-transparent darkening at edges to focus on face oval area
- **Safe zone:** Visual guide (oval or rectangle) showing optimal face placement
- **Grid:** Optional rule-of-thirds grid toggle

### Face Mesh Overlay
- **Style:** Neon-cyan or soft white dots connected by thin lines
- **Opacity:** 70% — visible but not distracting
- **Landmarks:** 37+ points as specified:
  - Jawline contour (12 points)
  - Eyebrows (10 points, 5 each)
  - Eyes (8 points, 4 each — inner/outer corner, upper/lower lid)
  - Nose (4 points — bridge, tip, nostrils)
  - Lips (6 points — upper/lower lip corners and centers)
  - Chin (1 point)
- **Animation:** Gentle pulse on active tracking points

### Before/After Toggle (Top Right)
- **Position:** Floating pill, top-right, below status bar
- **State:** Disabled during scan, enabled after first analysis
- **Style:** Segmented control — "Before" | "After"
- **Default:** "Before" selected (shows live camera)
- **Toggle animation:** Crossfade 300ms

### Status Text (Center Bottom Overlay)
- **States:**
  - `"Position your face in the oval"` — initial
  - `"Hold still..."` — capturing
  - `"Analyzing your skin..."` — processing
  - `"Complete!"` — done
- **Typography:** 18pt, medium weight, white with dark text-shadow
- **Transition:** Fade between states, 200ms

### Progress Indicator
- **Style:** Horizontal segmented bar or circular progress
- **Colors:** Rose-gold fill on neutral track
- **Segments:** 5 segments (align with 5 analysis phases)
- **Position:** Below status text

### Capture Button (Bottom Center)
- **Style:** Large circle, 72pt diameter
- **Outer ring:** White with 3pt stroke
- **Inner fill:** Rose-gold when ready, gray when positioning
- **Press:** Scale to 0.9, fill expands
- **Long-press:** Burst mode (optional)

### Camera Controls (Bottom Row)
- **Flip camera:** Icon button (front/rear toggle)
- **Gallery access:** Icon button (upload fallback)
- **Flash:** Icon button (auto/on/off)
- **Spacing:** Evenly distributed, 48pt tap targets

### Interactions
| Trigger | Action | Duration |
|---------|--------|----------|
| Face detected | Mesh overlay appears, dots animate | 300ms |
| Face positioned | Capture button turns rose-gold | 200ms |
| Tap capture | Shutter animation + flash | 150ms |
| Analysis begins | Progress bar fills segment-by-segment | ~3-5s total |
| Analysis complete | "Complete!" + confetti burst → auto-advance | 800ms |
| Before/After toggle | Crossfade camera ↔ simulation | 300ms |

### Technical Notes
- Face must fill 60%+ of frame for accurate analysis
- Auto-capture when face is stable for 1.5 seconds (optional)
- Minimum resolution: 1080p for analysis, 4K preferred
- Lighting check: Warn if too dark or uneven

### Exit Points
- → Screen 3 (Post-Scan Choice) — auto-advance on complete
- → Screen 1 (cancel)

---

## Screen 3: Post-Scan Choice

### Purpose
**THE KEY DIFFERENTIATOR.** Give users agency in how they explore treatments. This is the moment that separates SKINgenius from AI Aesthetics' linear flow.

### Layout

```
┌─────────────────────────────┐
│ [Status Bar]                │
├─────────────────────────────┤
│  ← Back                     │
│                             │
│   "Great! We've analyzed    │
│    your skin."              │
│                             │
│   How would you like to     │
│   explore treatments?       │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    🤖                 │  │
│  │                       │  │
│  │  Get Recommendations  │  │ ← AI Path
│  │                       │  │
│  │  "AI analyzes your     │  │
│  │   face and suggests     │  │
│  │   personalized          │  │
│  │   treatments"          │  │
│  │                       │  │
│  │  [→ Explore with AI]  │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    ✋                 │  │
│  │                       │  │
│  │   Choose Myself        │  │ ← Manual Path
│  │                       │  │
│  │  "Browse treatments    │  │
│  │   by facial zone and    │  │
│  │   explore on your       │  │
│  │   own"                  │  │
│  │                       │  │
│  │  [→ Browse Zones]     │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ─────────────────────────  │
│  📊 Your Skin Snapshot      │ ← Expandable section
│  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│ [Tab Bar]                   │
└─────────────────────────────┘
```

### Header
- **Back button:** Left chevron, "Back" label
- **Title:** Hidden (contextual header only)

### Celebration Message
- **Text:** "Great! We've analyzed your skin."
- **Typography:** 24pt, medium weight
- **Color:** Charcoal
- **Animation:** Gentle fade-in, slight bounce

### Choice Prompt
- **Text:** "How would you like to explore treatments?"
- **Typography:** 18pt, regular weight
- **Color:** Warm gray

### Choice Cards (2-up)

#### Card 1: AI Recommendations
- **Icon:** Sparkles/robot emoji (🤖 or AI sparkle icon)
- **Headline:** "Get Recommendations"
- **Description:** "AI analyzes your face and suggests personalized treatments based on your unique skin profile."
- **CTA:** "Explore with AI"
- **Visual:** Gradient background (soft violet to rose), abstract AI brain/face mesh illustration
- **Badge:** "Smart" — small pill badge

#### Card 2: Choose Myself
- **Icon:** Hand/pointer emoji (✋ or tap icon)
- **Headline:** "Choose Myself"
- **Description:** "Browse treatments by facial zone and explore options on your own terms."
- **CTA:** "Browse Zones"
- **Visual:** Gradient background (soft teal to mint), abstract face with zones illustration
- **Badge:** "Flexible" — small pill badge

### Card Specifications
- **Size:** Full-width minus 32pt, ~220pt height each
- **Corner radius:** 20pt
- **Shadow:** 0 8px 24px rgba(0,0,0,0.08)
- **Padding:** 24pt internal
- **Spacing between cards:** 16pt
- **Icon size:** 48pt
- **Tap feedback:** Scale to 0.98, shadow deepens

### Skin Snapshot (Collapsible)
- **Trigger:** Tap to expand
- **Collapsed:** "📊 Your Skin Snapshot" + right chevron
- **Expanded:** Brief summary of detected metrics (hydration, texture, tone, etc.) with mini visualizations
- **Purpose:** Transparency — show what the AI saw

### Interactions
| Trigger | Action | Duration |
|---------|--------|----------|
| Screen load | Cards slide up staggered | 400ms each, 100ms stagger |
| Tap card | Card presses → navigate | 200ms |
| Expand snapshot | Accordion expand | 300ms ease-in-out |

### Exit Points
- → Screen 4A (AI Recommendations)
- → Screen 4B (Zone Selection)
- → Back to Screen 2 (retake scan)

---

## Screen 4A: AI Recommendations

### Purpose
Present AI-generated treatment suggestions mapped to the user's face zones. Show the intelligence behind the recommendations.

### Layout

```
┌─────────────────────────────┐
│ [Status Bar]                │
├─────────────────────────────┤
│  ← Your Recommendations     │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   [Face Map]          │  │ ← Annotated face
│  │   with highlighted    │  │   with zone
│  │   zones               │  │   hotspots
│  │                       │  │
│  │   ○ Forehead          │  │
│  │   ○ Under-eye         │  │
│  │   ○ Cheeks            │  │
│  └───────────────────────┘  │
│                             │
│  Based on your analysis:    │
│                             │
│  ┌───────────────────────┐  │
│  │ 🔴 Forehead Zone      │  │
│  │                       │  │
│  │ Fine lines detected   │  │
│  │                       │  │
│  │ ┌───────────────────┐ │  │
│  │ │ 💉 Botox          │ │  │
│  │ │ $300-600 • 3-6mo  │ │  │
│  │ │ "Smooths dynamic   │ │  │
│  │ │  wrinkles"         │ │  │
│  │ │ [See Simulation]  │ │  │
│  │ └───────────────────┘ │  │
│  │ ┌───────────────────┐ │  │
│  │ │ 💧 Microneedling  │ │  │
│  │ │ $200-500 • 6-12mo │ │  │
│  │ │ "Stimulates collagen│ │  │
│  │ │  production"       │ │  │
│  │ │ [See Simulation]  │ │  │
│  │ └───────────────────┘ │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🟡 Under-Eye Zone     │  │
│  │ ...                   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  📅 Book Consultation │  │ ← Sticky bottom CTA
│  │     with Provider     │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Header
- **Back button:** Standard
- **Title:** "Your Recommendations"
- **Subtitle:** "Based on your skin analysis"

### Face Map (Top Section)
- **Display:** User's scanned face (or generic face diagram) with colored zone overlays
- **Zones:** Color-coded dots or heatmap overlays:
  - 🔴 Red = High priority (significant concern)
  - 🟡 Yellow = Moderate (improvement opportunity)
  - 🟢 Green = Good (maintain)
- **Interaction:** Tap a zone → scroll to that zone's recommendations
- **Legend:** Small key below map

### Zone Sections (Scrollable)
Each zone is a collapsible section:

#### Zone Header
- **Color dot:** Matches face map
- **Zone name:** "Forehead Zone", "Under-Eye Area", etc.
- **Concern:** Brief description (e.g., "Fine lines detected")
- **Severity:** Optional 1-10 indicator

#### Treatment Cards (within each zone)
- **Icon:** Treatment type emoji/icon
- **Treatment name:** "Botox", "Microneedling", "Chemical Peel", etc.
- **Price range:** "$300-600"
- **Duration:** "Lasts 3-6 months"
- **Brief description:** 1-line benefit statement
- **CTA:** "See Simulation" button
- **Evidence badge:** "Clinical studies" or star rating

### Treatment Card Specs
- **Background:** White
- **Border:** 1pt #E8DDD6
- **Corner radius:** 12pt
- **Padding:** 16pt
- **Shadow:** None (flat design within section)
- **Tap:** Full card is tappable, button is primary action

### Bottom CTA
- **Text:** "Book Consultation with Certified Provider"
- **Style:** Full-width sticky bottom button
- **Background:** Rose-gold
- **Visibility:** Appears after scrolling through first zone

### Interactions
| Trigger | Action | Duration |
|---------|--------|----------|
| Tap face map zone | Smooth scroll to zone section | 400ms ease-out |
| Tap treatment card | Navigate to Screen 5 | 300ms |
| Swipe zone section | Collapse/expand accordion | 300ms |
| Scroll past first zone | Bottom CTA slides up | 300ms |

### Exit Points
- → Screen 5 (Simulation View) — per treatment
- → External (Book consultation — GetUpLook integration)
- → Back to Screen 3

---

## Screen 4B: Zone Selection

### Purpose
Manual exploration path. User chooses facial zones and browses available treatments.

### Layout

```
┌─────────────────────────────┐
│ [Status Bar]                │
├─────────────────────────────┤
│  ← Browse by Zone           │
│                             │
│   "Choose a zone to         │
│    explore treatments"      │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [Interactive       │  │ ← Tappable face
│  │     Face Diagram]     │  │   diagram
│  │                       │  │
│  │      ● Forehead       │  │
│  │     ◐  Eyes           │  │
│  │    ○  Nose  ○         │  │
│  │     ◐  Lips           │  │
│  │      ● Jawline        │  │
│  │       ● Neck          │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Or select from list:       │
│                             │
│  ┌───────────────────────┐  │
│  │ 👁️ Eyes & Brow        →│  │
│  ├───────────────────────┤  │
│  │ 👃 Nose & Nasolabial  →│  │
│  ├───────────────────────┤  │
│  │ 💋 Lips & Mouth       →│  │
│  ├───────────────────────┤  │
│  │ 😊 Cheeks & Midface   →│  │
│  ├───────────────────────┤  │
│  │ 🦴 Jawline & Chin     →│  │
│  ├───────────────────────┤  │
│  │ ✨ Forehead & Temples  →│  │
│  ├───────────────────────┤  │
│  │ 🦢 Neck & Décolletage →│  │
│  └───────────────────────┘  │
│                             │
│  [Filter: All | Surgical |  │
│   Non-Surgical | Skincare]  │
│                             │
└─────────────────────────────┘
```

### Header
- **Back button:** Standard
- **Title:** "Browse by Zone"

### Interactive Face Diagram
- **Style:** Stylized line-art face or user scan outline
- **Zones:** Tap targets overlaid on zones:
  - Forehead (tap target: forehead area)
  - Eyes (tap target: eye area)
  - Nose (tap target: nose bridge + sides)
  - Lips (tap target: lip area)
  - Cheeks (tap target: cheek area)
  - Jawline (tap target: jaw contour)
  - Neck (tap target: neck area)
- **Active state:** Zone fills with rose-gold tint on tap
- **Animation:** Gentle pulse on load to indicate interactivity

### Zone List (Below Diagram)
- **Items:** Same 7 zones as diagram
- **Icons:** Emoji or custom icon per zone
- **Chevron:** Right arrow indicating drill-down
- **Tap:** Navigates to zone detail

### Filter Bar
- **Options:** All | Surgical | Non-Surgical | Skincare Only
- **Style:** Pill-shaped segmented control or horizontal scroll
- **Default:** "All"
- **Function:** Filters treatments shown in zone detail

### Interactions
| Trigger | Action | Duration |
|---------|--------|----------|
| Tap face zone | Zoom into zone + navigate to detail | 400ms |
| Tap list item | Navigate to zone detail | 300ms |
| Change filter | Updates upcoming zone detail filter | Instant |

### Exit Points
- → Zone Detail (not in spec — intermediate screen with treatments for selected zone)
- → Back to Screen 3

---

## Screen 5: Simulation View

### Purpose
Show the user their potential results. This is the "wow" moment that converts interest to action.

### Layout

```
┌─────────────────────────────┐
│ [Status Bar]                │
├─────────────────────────────┤
│  ←  Treatment Simulation    │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   [Before / After   │  │ ← Side-by-side or
│  │    Comparison]        │  │   slider comparison
│  │                       │  │
│  │   BEFORE    AFTER     │  │
│  │   ┌────┐   ┌────┐    │  │
│  │   │📷  │   │✨  │    │  │
│  │   │    │   │    │    │  │
│  │   └────┘   └────┘    │  │
│  │                       │  │
│  │  ◄──── Drag ────►    │  │ ← Slider handle
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ════════════════════════   │
│                             │
│  💉 Botox (Forehead)        │
│                             │
│  What it is:                │
│  A purified protein that    │
│  temporarily relaxes        │
│  muscles causing dynamic    │
│  wrinkles.                  │
│                             │
│  ─────────────────────      │
│                             │
│  ⏱️ Duration: 3-6 months   │
│  🩹 Downtime: None          │
│  💰 Price: $300-600         │
│  ⭐ Evidence: ★★★★☆ (4.2)  │
│                             │
│  ─────────────────────      │
│                             │
│  How it works:              │
│  [Expandable section with   │
│  mechanism description]     │
│                             │
│  ─────────────────────      │
│                             │
│  🤔 Good candidate if:      │
│  • You have dynamic         │
│    forehead lines           │
│  • You're 25-65 years old   │
│  • You want preventive      │
│    or corrective treatment  │
│                             │
│  ─────────────────────      │
│                             │
│  ⚠️ Considerations:        │
│  • Not recommended during   │
│    pregnancy                │
│  • Rare side effect:        │
│    eyelid drooping          │
│  • Requires maintenance     │
│                             │
│  ════════════════════════   │
│                             │
│  ┌───────────────────────┐  │
│  │ 🔍 Find a Certified   │  │ ← Primary CTA
│  │    Provider Near You  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🔄 Try Another        │  │ ← Secondary CTA
│  │    Treatment          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 💾 Save to My Plan    │  │ ← Tertiary action
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Header
- **Back button:** Standard
- **Title:** "Treatment Simulation"

### Before/After Viewer (Top 40%)

#### Option A: Side-by-Side
- **Layout:** 50/50 split
- **Labels:** "Before" / "After" badges top-left of each half
- **Border:** Subtle separator line

#### Option B: Slider Comparison (Recommended)
- **Layout:** Single image container with draggable divider
- **Left side:** Before (user's scan)
- **Right side:** After (AI-generated simulation)
- **Handle:** Vertical line with grabber icon, draggable horizontally
- **Labels:** "Before" (left) / "After" (right) fade in/out based on position
- **Hint:** "◄ Drag to compare ►" — fades after first interaction

#### Image Specs
- **Resolution:** Match device width, 1:1 or 4:3 aspect ratio
- **Processing:** AI simulation rendered from user's actual scan
- **Watermark:** Subtle "SIMULATION" badge (transparency)

### Treatment Details (Scrollable)

#### Treatment Name
- **Typography:** 24pt, bold
- **Icon:** Treatment type emoji
- **Zone tag:** Small pill badge ("Forehead")

#### What It Is
- **Headline:** "What it is"
- **Body:** 2-3 sentence plain-English explanation
- **Tone:** Educational, not promotional

#### Quick Facts (Horizontal row or grid)
- **Duration:** How long results last
- **Downtime:** Recovery time ("None", "1-3 days", etc.)
- **Price Range:** "$300-600" (regional variation noted)
- **Evidence Score:** Star rating + score (e.g., 4.2/5)

#### How It Works (Expandable)
- **Headline:** "How it works"
- **Default:** Collapsed (show first line)
- **Expanded:** Mechanism of action, procedure overview

#### Good Candidate If (Bullet list)
- **Headline:** "Good candidate if"
- **Items:** Checkmark bullet points
- **Content:** Ideal candidate criteria

#### Considerations (Bullet list)
- **Headline:** "Considerations"
- **Items:** Warning triangle bullet points
- **Content:** Contraindications, side effects, cautions
- **Style:** Amber/warm tone (not alarming red)

### CTAs (Bottom)

#### Primary: "Find a Certified Provider"
- **Style:** Filled rose-gold button
- **Function:** Opens GetUpLook provider search with treatment pre-selected
- **Sticky:** Optional sticky bottom placement

#### Secondary: "Try Another Treatment"
- **Style:** Outlined button
- **Function:** Navigate back to Screen 4A or 4B

#### Tertiary: "Save to My Plan"
- **Style:** Text button with bookmark icon
- **Function:** Adds to user's saved treatments

### Interactions
| Trigger | Action | Duration |
|---------|--------|----------|
| Drag slider | Reveal before/after | Real-time |
| Tap expandable | Accordion expand/collapse | 300ms |
| Tap "Save" | Bookmark animation + toast | 500ms |
| Tap "Find Provider" | Open provider search/modal | 300ms |

### Exit Points
- → GetUpLook provider search (external/integration)
- → Screen 4A/4B (try another)
- → Saved treatments (bookmark)
- → Back (previous screen)

---

## Edge Cases & Error States

### Camera Permission Denied
- **Screen:** Full-screen error with illustration
- **Message:** "Camera access is needed for skin analysis"
- **Actions:** "Open Settings" button, "Upload Photo Instead" alternative
- **Style:** Friendly, not accusatory

### Face Not Detected
- **Overlay:** On camera screen
- **Message:** "We can't see your face clearly"
- **Tips:**
  - "Make sure you're in a well-lit area"
  - "Remove glasses if possible"
  - "Keep your face centered in the oval"
- **Auto-dismiss:** When face is detected

### Analysis Failed
- **Screen:** Modal or inline error
- **Message:** "We couldn't complete the analysis"
- **Actions:** "Try Again", "Upload Photo Instead"
- **Logging:** Error reported for quality improvement

### Network Error During Scan Upload
- **Behavior:** Retry 3x automatically
- **Fallback:** Save locally, retry when connected
- **Message:** "Connection issue — we'll save your scan and retry"

### Low-Light Warning
- **Overlay:** Top of camera screen
- **Message:** "Lighting looks dim — move to a brighter area for best results"
- **Icon:** Lightbulb or sun
- **Dismiss:** Auto when lighting improves

---

## Accessibility Considerations

### VoiceOver / TalkBack
- All interactive elements have descriptive labels
- Face mesh landmarks: "Face detected at 7 positions"
- Before/After slider: "Drag to compare before and after treatment simulation"
- Treatment cards: Read name, price, and "Double tap to see simulation"

### Dynamic Type
- All text supports iOS Dynamic Type / Android font scaling
- Tested up to 200% font size
- Layouts gracefully reflow (no truncation)

### Color Blindness
- Zone colors (red/yellow/green) have icon/label alternatives
- Face map uses patterns + color, not color alone
- Severity indicators use numbers, not just color

### Motor Accessibility
- All tap targets minimum 44pt
- Slider supports double-tap to toggle (before/after snap)
- Buttons support reduced-motion preference

### Cognitive Accessibility
- Jargon-free language throughout
- Expandable sections for detailed info (progressive disclosure)
- Clear back navigation at every step

---

## Animation & Motion Specs

### General Principles
- **Duration range:** 200-600ms
- **Easing:** Primarily ease-out, occasional spring for playful elements
- **Reduced motion:** Respect system preference (disable non-essential animations)

### Screen Transitions
- **Push navigation:** Slide from right, 300ms, ease-out-quad
- **Modal:** Slide up from bottom, 400ms, ease-out-back
- **Back:** Slide from left, 300ms, ease-out-quad

### Micro-interactions

#### Button Press
- **Scale:** 0.96
- **Duration:** 100ms
- **Easing:** ease-out

#### Card Tap
- **Scale:** 0.98
- **Shadow:** Increase depth
- **Duration:** 150ms

#### Progress Fill
- **Style:** Segment-by-segment fill
- **Duration per segment:** 400ms
- **Easing:** ease-in-out

#### Face Mesh Dots
- **Pulse:** Scale 1.0 → 1.3 → 1.0
- **Duration:** 1200ms
- **Easing:** ease-in-out
- **Iteration:** Infinite while tracking

#### Success State
- **Confetti burst:** Optional, celebratory
- **Checkmark draw:** SVG stroke animation
- **Duration:** 800ms total

---

## Dependencies

### Assets Needed
- [ ] Hero illustration (Screen 1) — Face mesh abstract art
- [ ] Privacy shield icon set
- [ ] Treatment type icons (20+ treatments)
- [ ] Zone icons for face diagram (7 zones)
- [ ] Before/After placeholder images for demo
- [ ] Empty state illustrations

### Technical Dependencies
- Camera access (iOS AVCapture / Android CameraX)
- Face mesh detection (ARKit / ARCore or TensorFlow Lite)
- Image processing pipeline (simulation rendering)
- GetUpLook API (provider search integration)

### Analytics Events
- `scan_started` — User taps "Start Scan"
- `scan_completed` — Analysis finishes successfully
- `scan_failed` — Analysis error
- `choice_made` — User selects AI vs Manual path
- `treatment_viewed` — User views a treatment simulation
- `provider_search_initiated` — User taps "Find Provider"
- `simulation_shared` — User shares/saves simulation

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-10 | Aura (Design) | Initial specification |

---

## Related Documents

- [Components Inventory](components.md)
- [Style Guide](style-guide.md)
- [Lovi.care Teardown](../research/lovi-care-screens.md) — Competitive reference
- [GetUpLook Integration](../skincare-research/docs/getuplook-integration.md) — Provider search
- [SOUL.md](../SOUL.md) — Brand identity

---

*End of Specification*
