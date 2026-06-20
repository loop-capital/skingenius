# SKINgenius — Component Inventory

> **Status:** Draft v1.0  
> **Owner:** Aura (Design Agent)  
> **Date:** 2026-06-10  
> **Scope:** Reusable UI components for the Scan → Treatment Simulation flow

---

## Table of Contents

1. [Component Philosophy](#component-philosophy)
2. [Foundation Components](#foundation-components)
3. [Scan Flow Components](#scan-flow-components)
4. [Treatment Components](#treatment-components)
5. [Navigation Components](#navigation-components)
6. [Feedback Components](#feedback-components)
7. [Layout Components](#layout-components)
8. [Component States](#component-states)
9. [Responsive Behavior](#responsive-behavior)

---

## Component Philosophy

### Atomic Design Approach
Components follow atomic design principles:
- **Atoms:** Colors, typography, icons, spacing tokens
- **Molecules:** Buttons, inputs, cards, badges
- **Organisms:** Header bars, scan interface, treatment viewers
- **Templates:** Full screen layouts
- **Pages:** Composed screens (defined in scan-ui-spec.md)

### Component Principles
1. **Single Responsibility:** Each component does one thing well
2. **Composable:** Complex components built from simpler ones
3. **Configurable:** Props-driven, not hardcoded
4. **Accessible:** WCAG 2.1 AA compliant out of the box
5. **Themeable:** All visual properties tokenized

### Naming Convention
- **PascalCase** for component names: `ScanButton`, `TreatmentCard`
- **camelCase** for props: `isLoading`, `onScanComplete`
- **BEM-inspired** for CSS classes where needed

---

## Foundation Components

### SGButton

**Purpose:** Primary action button throughout the app.

**Variants:**
| Variant | Use Case | Background | Text |
|---------|----------|------------|------|
| `primary` | Main CTAs | Rose-gold gradient | White |
| `secondary` | Alternative actions | White | Rose-gold |
| `tertiary` | Minor actions | Transparent | Rose-gold |
| `danger` | Destructive actions | Soft red | White |
| `ghost` | Icon-only or subtle | Transparent | Inherit |

**Props:**
```typescript
interface SGButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size: 'small' | 'medium' | 'large' | 'full';
  icon?: string;          // Icon name or emoji
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}
```

**Specs:**
- **Small:** Height 36pt, padding 12pt horizontal, font 14pt
- **Medium:** Height 44pt, padding 16pt horizontal, font 16pt
- **Large:** Height 56pt, padding 24pt horizontal, font 18pt
- **Full:** Width 100% minus 32pt margins, inherits height from size
- **Corner radius:** 28pt (pill shape)
- **Shadow (primary only):** `0 4px 12px rgba(212, 160, 160, 0.3)`
- **Press scale:** 0.96
- **Loading state:** Spinner replaces icon/text

**Usage:**
- Screen 1: `Start Scan` (primary, large, full, icon="camera")
- Screen 3: Card CTAs (primary, medium)
- Screen 5: `Find Provider` (primary, large, full)

---

### SGIcon

**Purpose:** Consistent iconography throughout the app.

**Icon Set:** Custom + Lucide/Phosphor icons

**Sizes:**
| Size | Dimensions | Use Case |
|------|------------|----------|
| `xs` | 16×16pt | Inline text, badges |
| `sm` | 20×20pt | Buttons, list items |
| `md` | 24×24pt | Navigation, standard |
| `lg` | 32×32pt | Feature highlights |
| `xl` | 48×48pt | Card headers, hero |
| `2xl` | 64×64pt | Empty states, illustrations |

**Props:**
```typescript
interface SGIconProps {
  name: string;           // Icon identifier
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;         // Token or hex
  strokeWidth?: number;   // 1.5 (default), 2, or 3
}
```

**Custom Icons Needed:**
- `face-mesh` — Wireframe face illustration
- `face-scan` — Scanning in progress
- `zone-forehead`, `zone-eyes`, `zone-nose`, `zone-lips`, `zone-cheeks`, `zone-jawline`, `zone-neck`
- `treatment-botox`, `treatment-filler`, `treatment-peel`, `treatment-laser`, `treatment-microneedling`, etc.
- `privacy-shield` — Privacy/trust badge
- `evidence-star` — Evidence rating
- `simulation-before`, `simulation-after` — Before/After labels

---

### SGBadge

**Purpose:** Status indicators, tags, and labels.

**Variants:**
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `default` | Cream | Dark | None |
| `primary` | Rose-gold | White | None |
| `success` | Mint green | Dark | None |
| `warning` | Amber | Dark | None |
| `info` | Sky blue | Dark | None |
| `outline` | Transparent | Inherit | 1pt |

**Props:**
```typescript
interface SGBadgeProps {
  variant: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'outline';
  size: 'sm' | 'md' | 'lg';
  icon?: string;
  children: React.ReactNode;
}
```

**Specs:**
- **Small:** Height 20pt, padding 6pt 10pt, font 12pt
- **Medium:** Height 24pt, padding 8pt 12pt, font 13pt
- **Large:** Height 28pt, padding 10pt 14pt, font 14pt
- **Corner radius:** Full (pill shape)

**Usage:**
- Screen 4A: Zone severity badges (warning/info/success)
- Screen 4A: Treatment type badges
- Screen 5: Evidence rating badge
- Screen 5: Zone tag on treatment name

---

### SGCard

**Purpose:** Container for grouped content.

**Variants:**
| Variant | Background | Shadow | Border |
|---------|------------|--------|--------|
| `elevated` | White | Medium | None |
| `outlined` | White | None | 1pt |
| `filled` | Cream | None | None |
| `gradient` | Gradient | Large | None |

**Props:**
```typescript
interface SGCardProps {
  variant: 'elevated' | 'outlined' | 'filled' | 'gradient';
  gradient?: string[];      // For gradient variant
  cornerRadius?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isPressable?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}
```

**Specs:**
- **Corner radius:** sm=8pt, md=12pt, lg=16pt, xl=20pt
- **Shadow (elevated):** `0 4px 16px rgba(0,0,0,0.06)`
- **Shadow (gradient):** `0 8px 24px rgba(0,0,0,0.1)`
- **Press scale:** 0.98 (when isPressable)
- **Padding:** none=0, sm=12pt, md=16pt, lg=24pt

**Usage:**
- Screen 1: Privacy Promise card (outlined, md radius, lg padding)
- Screen 3: Choice cards (gradient, xl radius, lg padding)
- Screen 4A: Zone sections (elevated, md radius, md padding)
- Screen 4A: Treatment cards (outlined, md radius, md padding)
- Screen 5: Info sections (outlined, sm radius, md padding)

---

### SGText

**Purpose:** Typography consistency.

**Variants (from style-guide.md):**
| Variant | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| `hero` | 48pt | Bold | 1.1 | -0.02em |
| `h1` | 32pt | Bold | 1.2 | -0.01em |
| `h2` | 24pt | Semibold | 1.3 | -0.01em |
| `h3` | 20pt | Medium | 1.3 | 0 |
| `body-large` | 18pt | Regular | 1.5 | 0 |
| `body` | 16pt | Regular | 1.5 | 0 |
| `body-small` | 14pt | Regular | 1.5 | 0.01em |
| `caption` | 12pt | Medium | 1.4 | 0.02em |
| `overline` | 11pt | Semibold | 1.4 | 0.08em |

**Props:**
```typescript
interface SGTextProps {
  variant: 'hero' | 'h1' | 'h2' | 'h3' | 'body-large' | 'body' | 'body-small' | 'caption' | 'overline';
  color?: string;           // Token or hex
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  children: React.ReactNode;
}
```

**Usage:**
- All text rendering across all screens

---

## Scan Flow Components

### SGFaceMesh

**Purpose:** Real-time face mesh overlay during scanning.

**Props:**
```typescript
interface SGFaceMeshProps {
  landmarks: Landmark[];    // 37+ face landmarks
  isTracking: boolean;
  activeColor?: string;     // Default: cyan
  inactiveColor?: string;   // Default: white
  lineColor?: string;       // Default: white 50%
  dotSize?: number;         // Default: 6pt
  lineWidth?: number;       // Default: 1pt
  opacity?: number;          // Default: 0.7
}

interface Landmark {
  id: string;
  x: number;                // Normalized 0-1
  y: number;                // Normalized 0-1
  type: 'contour' | 'eyebrow' | 'eye' | 'nose' | 'lip' | 'chin';
  isActive?: boolean;
}
```

**Specs:**
- **Dots:** Circular, pulse animation when `isTracking`
- **Connections:** Thin lines between related landmarks
- **Active state:** Larger dot, brighter color, faster pulse
- **Pulse animation:** Scale 1.0 → 1.4 → 1.0, 1.2s, infinite
- **Opacity:** 0.7 default (visible but not obstructing)

**Usage:**
- Screen 2: Overlaid on camera feed

---

### SGScanProgress

**Purpose:** Shows analysis progress during scan.

**Props:**
```typescript
interface SGScanProgressProps {
  phase: 'positioning' | 'capturing' | 'analyzing' | 'complete';
  progress: number;         // 0-100
  statusText: string;
  phaseLabels?: string[];   // Default: ['Position', 'Capture', 'Analyze', 'Complete']
}
```

**Specs:**
- **Style:** Segmented bar (4 segments) or circular progress
- **Fill color:** Rose-gold
- **Track color:** Neutral light gray
- **Segment animation:** Fill left to right, 400ms per segment
- **Status text:** Below bar, 18pt medium, white with shadow
- **Complete state:** Checkmark + confetti burst (optional)

**Usage:**
- Screen 2: Bottom overlay during analysis

---

### SGCameraOverlay

**Purpose:** Guides and controls overlaid on camera feed.

**Props:**
```typescript
interface SGCameraOverlayProps {
  showGuide: boolean;       // Face oval guide
  guideType: 'oval' | 'rectangle';
  lightingWarning?: 'none' | 'dim' | 'uneven';
  showControls: boolean;
  onFlip: () => void;
  onGallery: () => void;
  onFlash: () => void;
  flashMode: 'auto' | 'on' | 'off';
}
```

**Specs:**
- **Guide overlay:** Semi-transparent dark mask with clear face-shaped cutout
- **Warning banner:** Top, amber background, dismissible
- **Controls:** Bottom row, 48pt tap targets, glassmorphism background
- **Safe area:** Respects device notches/home indicators

**Usage:**
- Screen 2: Full camera experience wrapper

---

### SGBeforeAfterSlider

**Purpose:** Interactive before/after comparison viewer.

**Props:**
```typescript
interface SGBeforeAfterSliderProps {
  beforeImage: string;      // URI or require()
  afterImage: string;
  beforeLabel?: string;     // Default: "Before"
  afterLabel?: string;      // Default: "After"
  initialPosition?: number; // Default: 0.5 (50%)
  isVertical?: boolean;     // Default: false (horizontal)
}
```

**Specs:**
- **Container:** Fixed aspect ratio (1:1 or 4:3)
- **Divider:** 2pt white line with circular handle (32pt diameter)
- **Handle:** Rose-gold center with white border, grabber icon
- **Drag gesture:** Horizontal pan, smooth, bounds 10%-90%
- **Labels:** Top-left (before) and top-right (after), fade based on slider position
- **Hint:** "Drag to compare" — fades after first interaction
- **Labels:** 12pt white, semi-transparent black background

**Usage:**
- Screen 5: Main simulation viewer
- Screen 2: Before/After toggle (simpler version)

---

## Treatment Components

### SGTreatmentCard

**Purpose:** Displays a single treatment option within a zone.

**Props:**
```typescript
interface SGTreatmentCardProps {
  treatment: {
    id: string;
    name: string;
    icon: string;
    description: string;
    priceRange: string;
    duration: string;
    evidenceScore: number;    // 0-5
    isRecommended?: boolean;
    isNew?: boolean;
    isPopular?: boolean;
  };
  onSeeSimulation: () => void;
  onLearnMore?: () => void;
}
```

**Specs:**
- **Layout:** Horizontal or vertical
  - **Horizontal (compact):** Icon left, text center, CTA right
  - **Vertical (detailed):** Icon top, full text, CTA bottom
- **Background:** White (outlined card)
- **Recommended badge:** "AI Pick" pill, rose-gold
- **Evidence stars:** 5-star display, rose-gold filled
- **CTA:** "See Simulation" text button with arrow
- **Press:** Full card navigates, button is explicit CTA

**Usage:**
- Screen 4A: Within zone sections
- Screen 4B: Within zone detail lists

---

### SGZonePicker

**Purpose:** Interactive facial zone selection.

**Props:**
```typescript
interface SGZonePickerProps {
  zones: Zone[];
  activeZone?: string;
  onSelectZone: (zoneId: string) => void;
  viewMode: 'diagram' | 'list';
}

interface Zone {
  id: string;
  name: string;
  icon: string;
  tapArea: { x: number; y: number; width: number; height: number }; // Normalized 0-1
  isActive?: boolean;
}
```

**Specs:**
- **Diagram mode:** Face outline with tappable zones
  - **Face graphic:** Line art or user scan silhouette
  - **Tap areas:** Invisible hit targets overlaid on face
  - **Active state:** Zone fills with rose-gold at 20% opacity
  - **Animation:** Gentle pulse on load to show interactivity
- **List mode:** Vertical list of zone names with icons and chevrons
- **Toggle:** Switch between diagram and list (optional)

**Usage:**
- Screen 4B: Main zone selection interface

---

### SGFaceMap

**Purpose:** Annotated face showing analysis results.

**Props:**
```typescript
interface SGFaceMapProps {
  imageUri: string;         // User's scan photo
  zones: FaceMapZone[];
  onTapZone: (zoneId: string) => void;
  legendPosition?: 'bottom' | 'hidden';
}

interface FaceMapZone {
  id: string;
  name: string;
  severity: 'high' | 'moderate' | 'low' | 'good';
  coordinates: { x: number; y: number }; // Center point, normalized
  radius?: number;          // Dot size
}
```

**Specs:**
- **Base image:** User's scan or generic face diagram
- **Zone dots:** Colored circles at zone centers
  - **High (red):** `#E74C3C`, 12pt diameter
  - **Moderate (yellow):** `#F39C12`, 10pt diameter
  - **Low (green):** `#27AE60`, 8pt diameter
  - **Good (no dot):** Hidden
- **Heatmap overlay:** Optional radial gradient at each dot
- **Legend:** Bottom row of color + label pairs
- **Tap:** Scrolls to corresponding zone section

**Usage:**
- Screen 4A: Top of AI Recommendations

---

### SGTreatmentDetail

**Purpose:** Expandable treatment information sections.

**Props:**
```typescript
interface SGTreatmentDetailProps {
  sections: DetailSection[];
  defaultExpanded?: string[];
}

interface DetailSection {
  id: string;
  title: string;
  icon?: string;
  content: React.ReactNode;
  type: 'text' | 'bullet' | 'grid';
}
```

**Specs:**
- **Accordion style:** Tap to expand/collapse
- **Header:** Title + chevron (rotates 180° when expanded)
- **Animation:** Height transition, 300ms ease-in-out
- **Divider:** Hairline between sections
- **Types:**
  - **Text:** Plain paragraph
  - **Bullet:** Checkmark or triangle bullets
  - **Grid:** Key-value pairs (duration, price, downtime)

**Usage:**
- Screen 5: Treatment details (What it is, How it works, Good candidate, Considerations)

---

## Navigation Components

### SGHeader

**Purpose:** Consistent screen headers.

**Props:**
```typescript
interface SGHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  isTranslucent?: boolean;
}
```

**Specs:**
- **Height:** 44pt (standard) + safe area
- **Background:** White or translucent blur
- **Title:** 17pt semibold, centered
- **Back button:** Left, chevron + optional text
- **Shadow:** 1pt hairline when scrolled (optional)
- **Translucent:** Blur effect for overlays

**Usage:**
- All screens except full-bleed camera

---

### SGChoiceCard

**Purpose:** Large selectable cards for binary choices.

**Props:**
```typescript
interface SGChoiceCardProps {
  icon: string;
  headline: string;
  description: string;
  cta: string;
  gradient: string[];
  badge?: string;
  onSelect: () => void;
}
```

**Specs:**
- **Size:** Full-width minus 32pt, ~220pt height
- **Corner radius:** 20pt
- **Gradient:** Linear, top-left to bottom-right
- **Icon:** 48pt, centered top
- **Headline:** 20pt semibold, white
- **Description:** 15pt, white at 80% opacity
- **CTA:** 16pt medium, white with arrow
- **Badge:** Top-right pill
- **Shadow:** `0 8px 24px rgba(0,0,0,0.1)`
- **Tap:** Scale 0.98, shadow deepens

**Usage:**
- Screen 3: AI Recommendations vs Choose Myself

---

## Feedback Components

### SGToast

**Purpose:** Temporary feedback messages.

**Props:**
```typescript
interface SGToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;        // Default: 3000ms
  position?: 'top' | 'bottom';
  onDismiss?: () => void;
}
```

**Specs:**
- **Background:** Dark charcoal (#2C2C2C) or type-color tinted
- **Text:** White, 14pt
- **Icon:** Leading icon for type
- **Corner radius:** 12pt
- **Shadow:** `0 4px 12px rgba(0,0,0,0.15)`
- **Entry:** Slide up + fade, 300ms
- **Exit:** Fade out, 200ms
- **Auto-dismiss:** Yes, with progress bar (optional)

**Usage:**
- Confirmation: "Saved to your plan"
- Warnings: "Please enable camera access"
- Errors: "Analysis failed — please try again"

---

### SGEmptyState

**Purpose:** Placeholder when no content exists.

**Props:**
```typescript
interface SGEmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

**Specs:**
- **Icon:** 64pt, muted gray or subtle rose-gold
- **Title:** 20pt semibold, charcoal
- **Description:** 16pt, warm gray
- **Action:** SGButton (tertiary)
- **Layout:** Centered vertically and horizontally

**Usage:**
- No saved treatments
- No providers in area
- Camera permission denied alternative

---

### SGLoadingState

**Purpose:** Loading indicators.

**Props:**
```typescript
interface SGLoadingStateProps {
  message?: string;
  submessage?: string;
  type: 'spinner' | 'skeleton' | 'progress';
  progress?: number;
}
```

**Specs:**
- **Spinner:** Rose-gold circular spinner
- **Skeleton:** Shimmer effect on placeholder shapes
- **Progress:** Circular or linear with percentage
- **Message:** Below indicator, 16pt
- **Submessage:** 14pt, gray

**Usage:**
- Screen 2: Analyzing state
- Treatment list loading
- Provider search loading

---

## Layout Components

### SGScreen

**Purpose:** Wrapper for consistent screen layout.

**Props:**
```typescript
interface SGScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  background?: string;
  safeArea?: boolean;
}
```

**Specs:**
- **Background:** White or cream
- **Safe area:** Respects notches, home indicators
- **Scroll:** Optional scrollable container
- **Header/Footer:** Fixed areas with scrollable content between
- **Padding:** 16pt horizontal standard

**Usage:**
- All screens as base wrapper

---

### SGScrollSection

**Purpose:** Grouped scrollable content with optional sticky headers.

**Props:**
```typescript
interface SGScrollSectionProps {
  title?: string;
  children: React.ReactNode;
  isSticky?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

**Specs:**
- **Title:** 20pt semibold, optional right action
- **Background:** White or cream
- **Spacing:** 16pt between items
- **Sticky:** Title sticks to top of scroll container when scrolling
- **Divider:** Optional bottom separator

**Usage:**
- Screen 4A: Zone sections
- Screen 5: Detail sections

---

### SGBottomSheet

**Purpose:** Modal overlay from bottom.

**Props:**
```typescript
interface SGBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'half' | 'full' | number;
  showHandle?: boolean;
}
```

**Specs:**
- **Entry:** Slide up from bottom, 400ms, ease-out-back
- **Exit:** Slide down, 300ms, ease-in
- **Backdrop:** Dark scrim, 50% opacity, tap to dismiss
- **Handle:** Top-centered pill, 36×4pt
- **Corner radius:** 20pt (top-left, top-right)
- **Scroll:** Scrollable if content overflows
- **Gesture:** Swipe down to dismiss

**Usage:**
- Privacy policy details
- Treatment filter selection
- Provider contact options

---

## Component States

### Standard State Definitions

| State | Visual Treatment | Interaction |
|-------|-----------------|-------------|
| **Default** | Standard styling | Fully interactive |
| **Hover/Web** | Scale 1.02, shadow increase | Mouse pointer |
| **Press/Active** | Scale 0.96-0.98, darken 5% | Touch feedback |
| **Disabled** | Opacity 0.4, no shadow | No interaction |
| **Loading** | Spinner replaces content, disabled | No interaction |
| **Error** | Red tint, shake animation | Error message |
| **Success** | Green tint, checkmark | Completion state |
| **Focused** | Outline ring (2pt, rose-gold) | Keyboard nav |

### State Transition Animations

| Transition | Duration | Easing |
|------------|----------|--------|
| Default → Press | 100ms | ease-out |
| Press → Default | 150ms | ease-out |
| Default → Loading | 200ms | ease-in-out |
| Loading → Success | 300ms | ease-out-back |
| Error shake | 400ms | ease-in-out |

---

## Responsive Behavior

### Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `mobile-sm` | < 375pt | iPhone SE, mini |
| `mobile` | 375-428pt | Standard phones |
| `tablet-sm` | 428-768pt | Large phones, small tablets |
| `tablet` | 768-1024pt | iPad, tablets |
| `desktop` | > 1024pt | Desktop web |

### Adaptive Patterns

**Mobile (< 768pt):**
- Full-width cards
- Bottom sheets for modals
- Single column layouts
- Sticky bottom CTAs

**Tablet (768-1024pt):**
- 2-column grids for cards
- Side panels for detail views
- Persistent side navigation
- Floating CTAs

**Desktop (> 1024pt):**
- Centered max-width container (800pt)
- Hover states for interactive elements
- Horizontal zone picker with vertical list
- Side-by-side comparison layouts

### Touch Targets

| Element | Minimum Size |
|---------|-------------|
| Buttons | 44×44pt |
| List items | 48pt height |
| Icons | 24×24pt (44×44pt hit area) |
| Form inputs | 56pt height |
| Cards | Entire card pressable |
| Slider handle | 32×32pt |

---

## Component Checklist

### Must Have for MVP
- [x] SGButton (all variants)
- [x] SGIcon
- [x] SGBadge
- [x] SGCard
- [x] SGText
- [x] SGFaceMesh
- [x] SGScanProgress
- [x] SGBeforeAfterSlider
- [x] SGTreatmentCard
- [x] SGZonePicker
- [x] SGFaceMap
- [x] SGChoiceCard
- [x] SGHeader
- [x] SGToast
- [x] SGScreen

### Nice to Have (Post-MVP)
- [ ] SGBottomSheet (can use native modal initially)
- [ ] SGEmptyState (simple placeholder OK for MVP)
- [ ] SGSkeletonLoader (spinner OK for MVP)
- [ ] SGParallaxHero (static hero OK for MVP)
- [ ] SGConfettiBurst (simple checkmark OK for MVP)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-10 | Aura (Design) | Initial component inventory |

---

## Related Documents

- [Scan UI Specification](scan-ui-spec.md) — Screen layouts and flows
- [Style Guide](style-guide.md) — Colors, typography, spacing

---

*End of Component Inventory*
