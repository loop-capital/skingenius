# SKINgenius — Style Guide

> **Status:** Draft v1.0  
> **Owner:** Aura (Design Agent)  
> **Date:** 2026-06-10  
> **Scope:** Design tokens, colors, typography, spacing, shadows, and motion for the Scan → Treatment Simulation flow

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Shadows & Elevation](#shadows--elevation)
6. [Border Radius](#border-radius)
7. [Motion & Animation](#motion--animation)
8. [Iconography](#iconography)
9. [Imagery & Photography](#imagery--photography)
10. [Platform Adaptations](#platform-adaptations)

---

## Design Tokens

### Token Naming Convention
```
{category}-{property}-{variant}-{state}

Examples:
color-bg-primary-default
color-text-accent-hover
spacing-md
shadow-card-elevated
```

### Token Categories
| Category | Description | Examples |
|----------|-------------|----------|
| `color` | All colors | `color-bg-primary`, `color-text-secondary` |
| `spacing` | Margin/padding | `spacing-sm`, `spacing-lg` |
| `radius` | Corner radii | `radius-md`, `radius-full` |
| `shadow` | Box shadows | `shadow-card`, `shadow-modal` |
| `motion` | Durations, easings | `motion-fast`, `motion-spring` |
| `typography` | Font sizes, weights | `typography-h1`, `typography-body` |

---

## Color Palette

### Brand Colors

```css
/* Rose Gold — Primary Accent */
--color-brand-50: #FDF2F2;   /* Tint: backgrounds, subtle fills */
--color-brand-100: #FCE8E8;  /* Light: hover states, chips */
--color-brand-200: #F5C6C6;  /* Soft: decorative elements */
--color-brand-300: #E8A8A8;  /* Light-medium: secondary accents */
--color-brand-400: #D48888;  /* Medium: highlights */
--color-brand-500: #C47070;  /* Primary: buttons, key elements */
--color-brand-600: #B85C5C;  /* Dark: pressed states */
--color-brand-700: #A04040;  /* Darker: emphasis text */
--color-brand-800: #783030;  /* Darkest: deep accents */
--color-brand-900: #502020;  /* Deepest: minimal use */
```

### Neutral Colors

```css
/* Charcoal — Text & UI */
--color-neutral-50: #FAFAFA;   /* Background: lightest surfaces */
--color-neutral-100: #F5F5F5;  /* Subtle backgrounds */
--color-neutral-200: #EBEBEB;    /* Borders, dividers (light) */
--color-neutral-300: #DCDCDC;    /* Disabled backgrounds */
--color-neutral-400: #BFBFBF;    /* Placeholder text */
--color-neutral-500: #999999;    /* Secondary text, icons */
--color-neutral-600: #777777;    /* Body text, descriptions */
--color-neutral-700: #555555;    /* Headings, primary body */
--color-neutral-800: #333333;    /* Strong headings, dark UI */
--color-neutral-900: #1A1A1A;    /* Primary text, near black */
```

### Functional Colors

```css
/* Success — Positive outcomes */
--color-success-50: #E6F4EA;
--color-success-500: #34A853;
--color-success-600: #2E8B47;
--color-success-text: #1E6B33;

/* Warning — Cautionary states */
--color-warning-50: #FFF3E0;
--color-warning-500: #F39C12;
--color-warning-600: #E67E22;
--color-warning-text: #B87918;

/* Error — Negative outcomes */
--color-error-50: #FDEDEC;
--color-error-500: #E74C3C;
--color-error-600: #C0392B;
--color-error-text: #922B21;

/* Info — Educational content */
--color-info-50: #EBF5FB;
--color-info-500: #3498DB;
--color-info-600: #2980B9;
--color-info-text: #1F618D;
```

### Specialty Colors

```css
/* Cream — Premium backgrounds */
--color-cream-50: #FFFBF7;
--color-cream-100: #FDF8F5;
--color-cream-200: #F7EDE6;
--color-cream-border: #E8DDD6;

/* Clinical Accent — Medical trust */
--color-clinical-blue: #5B93D4;   /* Links, medical indicators */
--color-clinical-teal: #4CA6A6;   /* Wellness indicators */
--color-clinical-mint: #E8F5E9;   /* Success backgrounds */
```

### Gradient Definitions

```css
/* Primary Gradient — CTAs, hero elements */
--gradient-primary: linear-gradient(135deg, #D48888 0%, #C47070 50%, #B85C5C 100%);

/* Hero Gradient — Premium backgrounds */
--gradient-hero: linear-gradient(180deg, #FDF8F5 0%, #FCE8E8 50%, #F5C6C6 100%);

/* Choice Card A — AI Recommendations */
--gradient-ai: linear-gradient(135deg, #C8B8E8 0%, #D4A0A0 100%);

/* Choice Card B — Manual Browse */
--gradient-manual: linear-gradient(135deg, #A0C4C4 0%, #B8D4C8 100%);

/* Face Mesh Overlay */
--gradient-mesh: linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%);
```

### Color Usage Matrix

| Element | Light Mode | Dark Mode (Future) |
|---------|-----------|-------------------|
| Page background | `--color-neutral-50` | `--color-neutral-900` |
| Card background | `--color-neutral-50` | `--color-neutral-800` |
| Primary text | `--color-neutral-900` | `--color-neutral-50` |
| Secondary text | `--color-neutral-600` | `--color-neutral-400` |
| Tertiary text | `--color-neutral-500` | `--color-neutral-500` |
| Primary CTA bg | `--gradient-primary` | `--gradient-primary` |
| Secondary CTA bg | `--color-neutral-50` | `--color-neutral-800` |
| Accent elements | `--color-brand-500` | `--color-brand-400` |
| Borders | `--color-cream-border` | `--color-neutral-700` |
| Error states | `--color-error-500` | `--color-error-400` |
| Success states | `--color-success-500` | `--color-success-400` |

---

## Typography

### Font Stack

```css
/* Display / Headlines — Editorial elegance */
--font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;

/* Body / UI — Modern clarity */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace — Data, code */
--font-mono: 'SF Mono', Monaco, 'Courier New', monospace;

/* Fallback strategy */
--font-fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|------|--------|-------------|----------------|----------|
| `display-xl` | 48pt | 700 | 1.1 | -0.02em | Hero headlines |
| `display` | 40pt | 700 | 1.1 | -0.02em | Splash screen titles |
| `h1` | 32pt | 700 | 1.2 | -0.01em | Screen titles |
| `h2` | 24pt | 600 | 1.3 | -0.01em | Section headers |
| `h3` | 20pt | 600 | 1.3 | 0 | Card titles |
| `h4` | 18pt | 600 | 1.4 | 0 | Subsection titles |
| `body-large` | 18pt | 400 | 1.5 | 0 | Lead paragraphs |
| `body` | 16pt | 400 | 1.5 | 0 | Standard text |
| `body-small` | 14pt | 400 | 1.5 | 0.01em | Descriptions |
| `caption` | 12pt | 500 | 1.4 | 0.02em | Labels, timestamps |
| `overline` | 11pt | 600 | 1.4 | 0.08em | Section labels, uppercase |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `weight-regular` | 400 | Body text, descriptions |
| `weight-medium` | 500 | Buttons, emphasized body |
| `weight-semibold` | 600 | Headlines, section titles |
| `weight-bold` | 700 | Display text, prices |

### Text Styles

```css
/* Hero Title (Screen 1) */
.text-hero {
  font-family: var(--font-display);
  font-size: var(--display-xl);
  font-weight: var(--weight-bold);
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-neutral-900);
}

/* Section Header */
.text-section {
  font-family: var(--font-body);
  font-size: var(--h2);
  font-weight: var(--weight-semibold);
  line-height: 1.3;
  color: var(--color-neutral-900);
}

/* Body Text */
.text-body {
  font-family: var(--font-body);
  font-size: var(--body);
  font-weight: var(--weight-regular);
  line-height: 1.5;
  color: var(--color-neutral-700);
}

/* Price / Data */
.text-price {
  font-family: var(--font-body);
  font-size: var(--h3);
  font-weight: var(--weight-bold);
  color: var(--color-neutral-900);
  font-variant-numeric: tabular-nums;
}

/* Caption / Metadata */
.text-caption {
  font-family: var(--font-body);
  font-size: var(--caption);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-500);
  text-transform: uppercase;
}
```

---

## Spacing

### Base Unit
```css
--spacing-unit: 4pt;
```

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4pt | Icon gaps, tight padding |
| `space-sm` | 8pt | Inner element spacing |
| `space-md` | 16pt | Standard padding, card gutters |
| `space-lg` | 24pt | Section spacing, card padding |
| `space-xl` | 32pt | Screen margins, large gaps |
| `space-2xl` | 48pt | Major section separations |
| `space-3xl` | 64pt | Hero spacing, large blocks |
| `space-4xl` | 96pt | Splash screen padding |

### Common Patterns

```css
/* Screen Padding */
--screen-padding-x: 16pt;   /* Mobile */
--screen-padding-x-tablet: 24pt; /* Tablet */
--screen-padding-y: 16pt;

/* Card Padding */
--card-padding: 16pt;
--card-padding-large: 24pt;

/* Button Padding */
--button-padding-x: 24pt;
--button-padding-y: 12pt;

/* List Item Height */
--list-item-height: 48pt;
--list-item-padding-x: 16pt;

/* Header Height */
--header-height: 44pt;
--header-height-large: 56pt;

/* Bottom Safe Area */
--bottom-safe-area: env(safe-area-inset-bottom, 0pt);
```

---

## Shadows & Elevation

### Shadow Tokens

```css
/* Subtle — Cards at rest */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);

/* Standard — Elevated cards */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);

/* Prominent — Floating elements */
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);

/* Primary — Branded CTAs */
--shadow-primary: 0 4px 16px rgba(196, 112, 112, 0.35);

/* Modal — Dialogs, bottom sheets */
--shadow-modal: 0 -4px 24px rgba(0, 0, 0, 0.12);

/* Dropdown — Menus, pickers */
--shadow-dropdown: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Elevation Levels

| Level | Use Case | Shadow | Z-Index |
|-------|----------|--------|---------|
| `base` | Static content | none | 0 |
| `raised` | Interactive cards | `--shadow-sm` | 10 |
| `elevated` | Floating cards | `--shadow-md` | 20 |
| `floating` | Sticky headers | `--shadow-lg` | 30 |
| `overlay` | Modals, sheets | `--shadow-modal` | 40 |
| `maximum` | Toasts, alerts | `--shadow-dropdown` | 50 |

---

## Border Radius

### Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0pt | Sharp edges, dividers |
| `radius-sm` | 8pt | Small buttons, badges |
| `radius-md` | 12pt | Cards, inputs, medium elements |
| `radius-lg` | 16pt | Large cards, modals |
| `radius-xl` | 20pt | Hero cards, featured content |
| `radius-2xl` | 24pt | Bottom sheets, large containers |
| `radius-full` | 9999pt | Pill buttons, avatars, chips |

### Radius Usage Matrix

| Component | Radius |
|-----------|--------|
| Buttons (pill) | `radius-full` |
| Standard cards | `radius-md` |
| Featured cards | `radius-xl` |
| Input fields | `radius-md` |
| Badges | `radius-full` |
| Modals | `radius-xl` (top) or `radius-lg` (all) |
| Avatars | `radius-full` |
| Images (square) | `radius-md` |
| Bottom sheets | `radius-2xl` (top corners) |

---

## Motion & Animation

### Duration Tokens

| Token | Duration | Use Case |
|-------|----------|----------|
| `duration-instant` | 50ms | Micro-feedback |
| `duration-fast` | 150ms | Button presses, toggles |
| `duration-normal` | 300ms | Transitions, state changes |
| `duration-slow` | 500ms | Screen transitions, reveals |
| `duration-dramatic` | 800ms | Hero animations, celebrations |

### Easing Functions

```css
/* Standard — Most transitions */
--ease-default: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Accelerate — Exits, dismissals */
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);

/* Decelerate — Entrances, reveals */
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Spring — Playful bounces */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth — Continuous motion */
--ease-smooth: cubic-bezier(0.45, 0.05, 0.55, 0.95);

/* Bounce — Celebration elements */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animation Patterns

```css
/* Fade In Up — Content entrance */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20pt);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In — Pop entrance */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide In Right — Screen push */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Pulse — Attention/tracking */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

/* Shimmer — Skeleton loading */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Shake — Error feedback */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8pt); }
  75% { transform: translateX(8pt); }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Iconography

### Icon Library
- **Primary:** Lucide React (`lucide-react-native`)
- **Secondary:** Custom SKINgenius icons
- **Size:** 24dp standard (MDPI baseline)

### Icon Sizes

| Token | Size | Use Case |
|-------|------|----------|
| `icon-xs` | 16×16pt | Inline text, badges |
| `icon-sm` | 20×20pt | Compact buttons |
| `icon-md` | 24×24pt | Standard navigation |
| `icon-lg` | 32×32pt | Feature highlights |
| `icon-xl` | 48×48pt | Card headers |
| `icon-2xl` | 64×64pt | Empty states |

### Custom Icons Needed

| Icon | Description | Usage |
|------|-------------|-------|
| `face-scan` | Face with scanning grid | Scan prompt, loading |
| `face-mesh` | Wireframe face | Technical indicators |
| `zone-forehead` | Forehead highlight | Zone picker |
| `zone-eyes` | Eye area highlight | Zone picker |
| `zone-nose` | Nose highlight | Zone picker |
| `zone-lips` | Lip area highlight | Zone picker |
| `zone-cheeks` | Cheek highlight | Zone picker |
| `zone-jawline` | Jaw contour | Zone picker |
| `zone-neck` | Neck area | Zone picker |
| `privacy-shield` | Shield with lock | Privacy messaging |
| `treatment-botox` | Syringe | Treatment list |
| `treatment-laser` | Laser beam | Treatment list |
| `treatment-peel` | Chemical drops | Treatment list |
| `treatment-filler` | Droplet/plump | Treatment list |
| `evidence-star` | Star with check | Evidence rating |
| `simulation-badge` | "SIM" badge | Watermark |

### Stroke Widths
- **Standard:** 1.5pt
- **Bold:** 2pt (navigation, important actions)
- **Thin:** 1pt (decorative, subtle)

---

## Imagery & Photography

### Photography Style
- **Subject:** Diverse faces, real people, natural lighting
- **Treatment:** Soft, warm color grading; minimal retouching
- **Composition:** Close-up portraits, 3/4 angle preferred
- **Background:** Clean, blurred, or environmental
- **Mood:** Confident, approachable, authentic

### Illustration Style
- **Face meshes:** Neon cyan (#00E5CC) on dark, or white on light
- **Abstract elements:** Soft gradients, organic curves
- **Medical diagrams:** Clean line art, subtle color coding
- **Icons:** Minimalist, single-weight line art

### Asset Requirements

| Asset | Resolution | Format | Notes |
|-------|-----------|--------|-------|
| Hero illustration | 1200×800pt | SVG/PNG | Abstract face mesh |
| Face diagram | 400×500pt | SVG | 7 labeled zones |
| Treatment icons | 64×64pt | SVG | 20+ variations |
| Zone icons | 48×48pt | SVG | 7 zones |
| Empty state illustrations | 200×200pt | PNG/SVG | 3-5 variations |
| Privacy badge icon | 32×32pt | SVG | Shield + lock |
| Logo/wordmark | Variable | SVG | Vector, scalable |

---

## Platform Adaptations

### iOS Specific

```swift
// Safe Areas
.safeAreaInset(edge: .top) { /* Header */ }
.safeAreaInset(edge: .bottom) { /* Footer */ }

// Typography
.font(.system(.title, design: .serif))  // Display
.font(.system(.body, design: .rounded)) // Body

// Haptics
.lightImpact.feedback()  // Button tap
.success.notificationOccurred() // Scan complete
.error.notificationOccurred() // Scan failed
```

### Android Specific

```xml
<!-- Status Bar -->
<android:windowLightStatusBar>true</android:windowLightStatusBar>
<android:statusBarColor>@color/cream_50</android:statusBarColor>

<!-- Navigation Bar -->
<android:navigationBarColor>@color/cream_50</android:navigationBarColor>
<android:windowLightNavigationBar>true</android:windowLightNavigationBar>
```

### Web/Desktop Specific

```css
/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8pt;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
}

/* Hover States */
@media (hover: hover) {
  .interactive:hover {
    transform: scale(1.02);
    transition: transform var(--duration-fast) var(--ease-default);
  }
}

/* Cursor */
.interactive {
  cursor: pointer;
}
```

---

## Accessibility

### Color Contrast
All text must meet WCAG 2.1 AA standards:
- **Normal text (≤ 18pt):** 4.5:1 minimum
- **Large text (> 18pt or bold ≥ 14pt):** 3:1 minimum
- **UI components:** 3:1 against adjacent colors

### Focus Indicators
```css
:focus-visible {
  outline: 2pt solid var(--color-brand-500);
  outline-offset: 2pt;
}
```

### Minimum Touch Targets
- All interactive elements: **44×44pt minimum**
- Recommended: **48×48pt**

### Screen Reader Support
- All images have descriptive `alt` text
- Buttons describe their action, not appearance
- Live regions for scan progress updates
- Skip links for keyboard navigation

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-10 | Aura (Design) | Initial style guide |

---

## Related Documents

- [Scan UI Specification](scan-ui-spec.md) — Screen layouts and flows
- [Component Inventory](components.md) — Reusable components

---

*End of Style Guide*
