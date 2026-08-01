# Facial Aesthetics Analysis — Feature Specification

> **Status:** SPEC — Ready for review
> **Created:** 2026-06-29
> **Author:** Che (orchestrator) + Jason (product)
> **Source:** Competitive analysis of Qoves Studio ($150/yr, 2M+ followers, 521 facial landmarks)
> **Depends on:** Existing SKINgenius architecture (scan flow, wellness plan, peptides, lifestyle questionnaire, Supabase)

---

## 1. Problem Statement

Qoves proved people will pay $150/yr for AI-powered facial aesthetics analysis. But Qoves is surface-level:

- Tells you _what_ to improve (proportions, symmetry, feature scores)
- Doesn't tell you _why_ your skin looks that way (root causes, mechanisms)
- Generic product recs ("use retinol") — no ingredient-level matching
- No health integration (metabolic, inflammatory, gut-skin axis)
- No peptide/supplement protocols
- No provider marketplace

**SKINgenius advantage:** We already have skin condition detection, root cause analysis, ingredient matching (105+ ingredients), peptide protocols (28 peptides), wellness plans, and lifestyle scoring. Adding facial aesthetics analysis makes us a **superset of Qoves** — same "what to improve" vision, but with clinical-grade "why" and "how."

---

## 2. What Qoves Does (Reference)

### Their Analysis (160+ tests across 521 landmarks)

- Facial symmetry score
- Proportional harmony (facial thirds, fifths)
- Dimorphism (masculine/feminine feature balance)
- Averageness (deviation from population mean)
- Perceived youthfulness
- Feature-level breakdown: brows (14 metrics), eyes (25+ metrics), nose (12+ metrics), lips (10+ metrics), jaw (8+ metrics), skin quality (6+ metrics)

### Their Protocol (phased, non-surgical default)

- **Phase 1 (0-1 mo):** Health markers — skincare routine, SPF, hydration, sleep
- **Phase 2 (1-2 mo):** Proportions — brow shaping ($25), retinol ($35-55), gua sha ($20-40)
- **Phase 3 (2-4 mo):** Dimorphism — fillers, botox, skin boosters (referenced, not sold)
- Each recommendation: cost estimate, difficulty, timeline, evidence citation

### Their Limitations

- No skin health depth (doesn't detect acne, rosacea, barrier damage)
- No ingredient science (just "use retinol" — not which retinoid for your skin)
- No metabolic/glycation/inflammation integration
- No peptide protocols
- No verified product database
- No provider network
- No progress tracking beyond before/after photos

---

## 3. SKINgenius Facial Aesthetics — What We're Building

### 3.1 The Core Concept

**One scan → Two analyses:**

1. **Skin Health Analysis** (existing) — conditions, root causes, mechanisms, ingredient matches, wellness plan
2. **Facial Aesthetics Analysis** (NEW) — proportions, symmetry, feature scoring, aesthetic protocol

Both analyses share the same photo. The aesthetic analysis **layers on top of** the skin health analysis. A user with acne AND weak jaw definition gets one integrated protocol that addresses both.

### 3.2 Navigation

Current: `Scan | Skin Age | Track`

New: `Scan | Aesthetics | Skin Age | Track`

- **Scan** — Skin health analysis (conditions, root causes, ingredient protocol)
- **Aesthetics** — Facial proportion analysis + glow-up protocol (NEW)
- **Skin Age** — Viral estimator (existing)
- **Track** — Progress photos + protocol adherence (existing, enhanced)

---

## 4. Facial Aesthetics Analysis — Data Model

### 4.1 Facial Landmarks (on-device, Gemma 4 Vision)

We map **106 facial landmarks** (MediaPipe Face Mesh standard) and compute derived metrics:

```typescript
interface FacialLandmarks {
  // Raw landmark points (x, y, z normalized 0-1)
  points: Vector3[]; // 106 points

  // Derived metrics (computed on-device)
  metrics: FacialMetrics;
}

interface FacialMetrics {
  // Proportions
  facial_thirds: {
    upper: number; // hairline to brow (ratio)
    middle: number; // brow to nose base (ratio)
    lower: number; // nose base to chin (ratio)
    harmony_score: number; // 0-100
  };
  facial_fifths: {
    left_outer: number;
    left_inner: number;
    center: number;
    right_inner: number;
    right_outer: number;
    harmony_score: number; // 0-100
  };

  // Symmetry
  symmetry: {
    overall: number; // 0-100
    brow_symmetry: number;
    eye_symmetry: number;
    nose_symmetry: number;
    lip_symmetry: number;
    jaw_symmetry: number;
  };

  // Feature scores (each 0-100)
  features: {
    brow: BrowMetrics;
    eyes: EyeMetrics;
    nose: NoseMetrics;
    lips: LipMetrics;
    jaw: JawMetrics;
    skin: SkinQualityMetrics;
  };

  // Aesthetic dimensions
  dimensions: {
    femininity: number; // 0-100 (scale from masculine to feminine)
    averageness: number; // 0-100 (how close to population mean)
    perceived_youth: number; // estimated perceived age
    homogeneity: number; // 0-100 (how features work together)
    dimorphism_balance: number; // 0-100
  };
}

interface BrowMetrics {
  thickness: number; // 0-100
  fullness: number; // 0-100
  arch_angle: number; // degrees
  position: number; // distance from eye (normalized)
  symmetry: number; // 0-100
  tail_drop: number; // degrees
  interbrow_distance: number; // normalized
}

interface EyeMetrics {
  shape: "almond" | "round" | "hooded" | "monolid" | "upturned" | "downturned";
  size: number; // 0-100 (relative to face)
  width: number; // normalized
  height: number; // normalized
  upper_eyelid_exposure: number; // 0-100
  under_eye_hollowness: number; // 0-100
  under_eye_pigmentation: number; // 0-100
  canthal_tilt: number; // degrees (positive = positive tilt)
  symmetry: number; // 0-100
}

interface NoseMetrics {
  width_ratio: number; // nose width / face width
  bridge_width: number; // normalized
  tip_projection: number; // normalized
  tip_angle: number; // degrees from vertical
  nostril_flare: number; // 0-100
  symmetry: number; // 0-100
}

interface LipMetrics {
  fullness: number; // 0-100
  ratio: number; // upper:lower lip ratio
  width: number; // normalized to face width
  cupid_bow_definition: number; // 0-100
  symmetry: number; // 0-100
  vermilion_exposure: number; // 0-100
}

interface JawMetrics {
  angle: number; // degrees (mandibular angle)
  width: number; // normalized
  definition: number; // 0-100 (how sharp the jawline is)
  chin_projection: number; // normalized
  gonial_angle: number; // degrees
  v_angle: number; // for V-shape assessment
}

interface SkinQualityMetrics {
  texture_smoothness: number; // 0-100
  pore_visibility: number; // 0-100
  pigmentation_evenness: number; // 0-100
  vascularity: number; // 0-100
  oiliness: number; // 0-100
  elasticity_visual: number; // 0-100
}
```

### 4.2 Aesthetic Scores (computed from metrics)

```typescript
interface AestheticScores {
  overall: number; // 0-100 composite
  proportions: number; // facial thirds + fifths harmony
  symmetry: number; // weighted average of all symmetry scores
  feature_balance: number; // how well features work together
  skin_quality: number; // texture, pores, pigmentation, vascularity
  perceived_youth: number; // estimated perceived age
  femininity: number; // 0-100
  averageness: number; // 0-100

  // Feature-specific scores
  brow_score: number;
  eye_score: number;
  nose_score: number;
  lip_score: number;
  jaw_score: number;

  // Potential scores (how much room for improvement)
  improvement_potential: {
    highest_impact: string; // feature name with most potential
    quick_wins: string[]; // low-effort, high-impact improvements
    long_term: string[]; // higher-effort improvements
  };
}
```

### 4.3 Database Tables

```sql
-- Facial aesthetics analysis results
CREATE TABLE IF NOT EXISTS public.facial_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Link to skin analysis (same scan session)
  skin_analysis_id UUID REFERENCES public.skin_analyses(id),

  -- Landmark data (stored as JSONB for flexibility)
  landmarks JSONB NOT NULL,
  metrics JSONB NOT NULL,
  scores JSONB NOT NULL,

  -- Snapshot of user context at analysis time
  ethnicity TEXT,
  age_at_scan INT,
  gender TEXT,

  -- Processing metadata
  model_used TEXT NOT NULL DEFAULT 'gemma-4-vision',
  on_device BOOLEAN DEFAULT true,
  processing_time_ms INT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aesthetic protocols (phased recommendations)
CREATE TABLE IF NOT EXISTS public.aesthetic_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.facial_analyses(id) NOT NULL,

  -- Protocol phases
  phases JSONB NOT NULL,
  -- Structure:
  -- [
  --   {
  --     "phase": 1,
  --     "name": "Foundation — Skin Health & Basic Proportions",
  --     "duration": "0-4 weeks",
  --     "goals": ["clear skin", "balanced thirds"],
  --     "steps": [
  --       {
  --         "category": "skincare",
  --         "action": "Start retinol 0.5%",
  --         "target_feature": "skin_quality",
  --         "current_score": 45,
  --         "projected_score": 65,
  --         "cost_estimate": "$35-55",
  --         "difficulty": "easy",
  --         "timeline": "4-8 weeks",
  --         "evidence_level": "A",
  --         "product_ids": ["..."],  -- linked to products table
  --         "supplement_ids": ["..."],
  --         "peptide_ids": ["..."]
  --       }
  --     ]
  --   }
  -- ]

  -- Visualization data
  projected_landmarks JSONB,  -- morphed landmarks showing projected result
  projection_images JSONB,    -- {before_url, projected_url, feature_overlay_url}

  -- User preferences
  budget_preference TEXT CHECK (budget_preference IN ('minimal', 'moderate', 'unlimited')),
  invasive_comfort TEXT CHECK (invasive_comfort IN ('topical_only', 'non_invasive', 'minimally_invasive', 'open')),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  started_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature-specific improvement catalog
CREATE TABLE IF NOT EXISTS public.aesthetic_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What feature this improves
  feature TEXT NOT NULL,          -- 'brow', 'eyes', 'nose', 'lips', 'jaw', 'skin'
  sub_feature TEXT,               -- 'arch_angle', 'fullness', 'under_eye_hollowness'

  -- Improvement details
  name TEXT NOT NULL,             -- 'Brow lamination for fullness'
  category TEXT NOT NULL,         -- 'topical', 'device', 'procedure', 'injectable', 'lifestyle', 'supplement', 'peptide'
  invasiveness TEXT NOT NULL CHECK (invasiveness IN ('none', 'minimal', 'moderate', 'significant')),

  -- Impact modeling
  score_impact NUMERIC(4,1),     -- expected score change (e.g., +15.0)
  confidence NUMERIC(3,2),       -- 0.00-1.00 confidence in impact
  timeline_weeks INT,            -- weeks to see results

  -- Cost
  cost_min NUMERIC(8,2),
  cost_max NUMERIC(8,2),
  recurring BOOLEAN DEFAULT false,
  recurring_cost_monthly NUMERIC(8,2),

  -- Evidence
  evidence_level TEXT CHECK (evidence_level IN ('A','B','C','D')),
  evidence_notes TEXT,
  key_studies TEXT[],

  -- Links to existing tables
  ingredient_ids TEXT[],         -- from ingredients table
  supplement_ids TEXT[],         -- from supplements table
  peptide_ids TEXT[],            -- from peptides table
  product_ids TEXT[],            -- from products table

  -- Ethnicity-aware recommendations
  ethnicity_adjustments JSONB,   -- {south_asian: "prefer azelaic acid over hydroquinone", ...}
  fitzpatrick_adjustments JSONB, -- {type_5_6: "avoid aggressive laser", ...}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_facial_analyses_user ON public.facial_analyses(user_id);
CREATE INDEX idx_aesthetic_protocols_user ON public.aesthetic_protocols(user_id);
CREATE INDEX idx_aesthetic_improvements_feature ON public.aesthetic_improvements(feature, sub_feature);
```

---

## 5. User Journey

### 5.1 First Scan (New User)

```
┌─────────────────────────────────────────────────────────────┐
│                  FACIAL AESTHETICS FLOW                       │
│                                                               │
│  Take Photo ──→ Skin Analysis ──→ Aesthetic Analysis          │
│  (one photo     (existing)        (NEW)                       │
│   serves both)                                                │
│       │                           │                           │
│       ▼                           ▼                           │
│  Skin Conditions            Aesthetic Scores                  │
│  • Acne: mild               • Overall: 72/100                 │
│  • Redness: moderate        • Proportions: 78                 │
│  • Fine lines: early        • Symmetry: 85                    │
│                             • Perceived age: 31               │
│                             • Highest potential: jaw           │
│                             • Quick wins: brow shape, skin     │
│       │                           │                           │
│       └───────────┬───────────────┘                           │
│                   ▼                                           │
│         INTEGRATED PROTOCOL                                   │
│                                                               │
│  Phase 1 (0-4 wks): Foundation                               │
│  ├── Skin: Retinol 0.5% + SPF + Niacinamide                 │
│  ├── Aesthetic: Brow shaping ($25)                            │
│  └── Wellness: Sleep 7+ hrs, reduce sugar                    │
│                                                               │
│  Phase 2 (4-8 wks): Refinement                               │
│  ├── Skin: Add Vitamin C serum                               │
│  ├── Aesthetic: Gua sha (lymphatic drainage)                 │
│  ├── Supplement: Collagen peptides + GHK-Cu topical          │
│  └── Wellness: Anti-inflammatory diet protocol               │
│                                                               │
│  Phase 3 (8-16 wks): Enhancement                             │
│  ├── Skin: Prescription retinoid if needed                   │
│  ├── Aesthetic: Consider jawline filler ($600-800)           │
│  ├── Peptide: BPC-157 for skin repair                        │
│  └── Wellness: Full protocol adherence tracking              │
│                                                               │
│  [View Full Protocol]  [Track Progress]  [Find Providers]    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Returning User (Progress Tracking)

```
┌─────────────────────────────────────────────────────────────┐
│                  AESTHETICS PROGRESS                          │
│                                                               │
│  Last scan: 4 weeks ago                                      │
│                                                               │
│  Score Changes:                                               │
│  ├── Overall: 72 → 76 (+4) ██████████░░░░                   │
│  ├── Skin quality: 58 → 71 (+13) ██████████████░            │
│  ├── Symmetry: 85 → 86 (+1) ████████████████░               │
│  └── Perceived age: 31 → 29 (-2 yrs) ✓                      │
│                                                               │
│  Protocol Adherence:                                          │
│  ├── Retinol: 28/30 days ✓                                   │
│  ├── SPF daily: 25/30 days ⚠️                                │
│  ├── Gua sha: 18/30 days ⚠️                                  │
│  └── Sleep 7+: 20/30 days ⚠️                                 │
│                                                               │
│  [Re-scan]  [Adjust Protocol]  [Share Progress Card]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Technical Implementation

### 6.1 On-Device Processing (Gemma 4 Vision)

Facial landmark detection runs **on-device** using the same Gemma 4 Vision model already used for skin analysis. The model outputs:

1. 106 facial landmark coordinates (x, y, z)
2. Derived metrics (computed via geometry, no ML needed)
3. Aesthetic scores (computed from metrics + population data)

**Why on-device:**

- Privacy (facial geometry never leaves phone)
- Zero API cost
- Instant results (no upload wait)
- Same model, same photo — skin analysis + aesthetics in one pass

### 6.2 Population Reference Data

Aesthetic scores are computed relative to **population baselines** stored as static JSON:

```json
{
  "version": "1.0",
  "populations": {
    "global": {
      "facial_thirds_ideal": [0.33, 0.33, 0.34],
      "facial_fifths_ideal": [0.2, 0.2, 0.2, 0.2, 0.2],
      "brow_position_ideal": 0.05,
      "canthal_tilt_ideal": 4.0,
      "lip_ratio_ideal": 1.618
    },
    "east_asian": {
      "facial_thirds_ideal": [0.31, 0.34, 0.35],
      "nose_width_ratio_ideal": 0.22,
      "eyelid_exposure_ideal": 30
    },
    "south_asian": {
      "nose_width_ratio_ideal": 0.26,
      "lip_fullness_ideal": 65
    }
    // ... 6+ ethnic reference datasets
  }
}
```

These baselines define "ideal" proportions **within each demographic** — not a single universal standard. This is the same approach Qoves uses (ethnicity-aware analysis).

### 6.3 Protocol Generation Engine

The protocol engine combines:

1. **Aesthetic scores** → identify which features have highest improvement potential
2. **Skin conditions** → existing condition detection
3. **Root causes** → existing root cause mapping
4. **Lifestyle scores** → existing questionnaire data
5. **User preferences** → budget, invasiveness comfort, time commitment

Output: A phased protocol that addresses both skin health AND aesthetic improvements, with specific product/supplement/peptide matches from the SKINgenius database.

```typescript
interface ProtocolStep {
  phase: number;
  category:
    | "skincare"
    | "supplement"
    | "peptide"
    | "device"
    | "procedure"
    | "injectable"
    | "lifestyle";
  action: string;
  target_feature: string;
  target_condition?: string; // links to skin condition if applicable
  current_score: number;
  projected_score: number;
  projected_improvement: number; // delta
  cost_estimate: string;
  cost_min: number;
  cost_max: number;
  difficulty: "easy" | "moderate" | "hard";
  timeline: string;
  timeline_weeks: number;
  evidence_level: "A" | "B" | "C" | "D";

  // Links to SKINgenius database
  ingredient_ids: string[];
  supplement_ids: string[];
  peptide_ids: string[];
  product_ids: string[];

  // Provider actions (if procedure/injectable)
  provider_type?:
    | "dermatologist"
    | "esthetician"
    | "plastic_surgeon"
    | "dentist";
  search_query?: string; // for provider marketplace
}
```

### 6.4 Before/After Visualization

Project aesthetic changes onto the user's actual photo:

1. **Landmark morphing** — adjust specific landmark positions based on projected improvements
2. **Feature overlay** — highlight the specific feature being improved with a transparent overlay
3. **Realistic rendering** — use image inpainting to show what the change actually looks like

**Implementation:** Start with simple landmark-based morphing (delaunay triangulation + affine transforms). Move to diffusion-based inpainting in Phase 2 for more realistic results.

---

## 7. Improvement Catalog (Seed Data)

### Category: Topical / Skincare

| Feature | Improvement                     | Score Impact | Cost   | Timeline | Evidence |
| ------- | ------------------------------- | ------------ | ------ | -------- | -------- |
| Skin    | Retinol 0.5% → 1%               | +12-18       | $35-55 | 8-12 wks | A        |
| Skin    | Vitamin C serum (L-ascorbic)    | +8-12        | $25-45 | 4-8 wks  | A        |
| Skin    | Niacinamide 5%                  | +6-10        | $15-30 | 4-6 wks  | A        |
| Skin    | Azelaic acid 10%                | +8-14        | $20-40 | 6-10 wks | A        |
| Skin    | SPF 50 daily (prevention)       | +5-10        | $15-30 | 2-4 wks  | A        |
| Eyes    | Retinol eye cream               | +5-8         | $30-60 | 8-12 wks | B        |
| Eyes    | Vitamin K cream (under-eye)     | +4-7         | $25-40 | 4-8 wks  | B        |
| Lips    | Hyaluronic acid lip treatment   | +6-10        | $20-35 | 2-4 wks  | B        |
| Brows   | Castor oil / peptide brow serum | +8-12        | $15-30 | 8-16 wks | C        |

### Category: Devices / Tools

| Feature | Improvement                   | Score Impact | Cost     | Timeline  | Evidence |
| ------- | ----------------------------- | ------------ | -------- | --------- | -------- |
| Face    | Gua sha (lymphatic drainage)  | +5-8         | $20-40   | 2-4 wks   | C        |
| Face    | Jade roller (depuffing)       | +3-5         | $15-30   | Immediate | C        |
| Skin    | LED red light therapy         | +8-12        | $100-300 | 8-12 wks  | B        |
| Skin    | Microneedling (at-home 0.5mm) | +10-15       | $30-60   | 6-10 wks  | B        |
| Jaw     | Jawline exerciser             | +3-5         | $15-25   | 8-12 wks  | D        |

### Category: Lifestyle

| Feature | Improvement             | Score Impact | Cost | Timeline | Evidence |
| ------- | ----------------------- | ------------ | ---- | -------- | -------- |
| All     | Sleep 7+ hours          | +5-10        | $0   | 2-4 wks  | A        |
| All     | Hydration 2L+ daily     | +3-5         | $0   | 1-2 wks  | B        |
| Skin    | Low glycemic diet       | +6-10        | $0   | 4-8 wks  | A        |
| Skin    | Reduce alcohol          | +4-8         | $0   | 2-4 wks  | B        |
| Face    | Nose breathing / mewing | +3-5         | $0   | 12+ wks  | C        |
| Skin    | Stress reduction        | +5-8         | $0   | 4-8 wks  | B        |

### Category: Supplements

| Feature | Improvement                    | Score Impact | Cost      | Timeline | Evidence |
| ------- | ------------------------------ | ------------ | --------- | -------- | -------- |
| Skin    | Collagen peptides (Type I/III) | +8-12        | $25-40/mo | 8-12 wks | A        |
| Skin    | Vitamin D3 (if deficient)      | +5-8         | $10-15/mo | 8-12 wks | A        |
| Skin    | Omega-3 (DHA/EPA)              | +5-8         | $20-30/mo | 8-12 wks | A        |
| Skin    | CoQ10 + PQQ                    | +4-7         | $25-40/mo | 12+ wks  | B        |
| Skin    | NMN/NAD+                       | +5-8         | $40-80/mo | 12+ wks  | B        |
| Skin    | Glutathione / NAC              | +5-8         | $15-25/mo | 8-12 wks | B        |
| Hair    | Biotin + Zinc                  | +4-6         | $10-20/mo | 12+ wks  | B        |

### Category: Peptides (from existing peptide table)

| Feature | Improvement                       | Score Impact | Cost      | Timeline | Evidence |
| ------- | --------------------------------- | ------------ | --------- | -------- | -------- |
| Skin    | GHK-Cu topical (2%)               | +10-15       | $30-50/mo | 6-10 wks | A        |
| Skin    | Matrixyl Synthe'6                 | +8-12        | $25-40/mo | 8-12 wks | B        |
| Skin    | BPC-157 (topical)                 | +6-10        | $40-60/mo | 6-10 wks | B        |
| Skin    | Argireline (Acetyl Hexapeptide-3) | +5-8         | $20-35/mo | 4-8 wks  | B        |
| Hair    | Thymosin Beta 4 (for hair)        | +6-10        | $50-80/mo | 12+ wks  | C        |

### Category: Injectables / Procedures (referenced, not sold)

| Feature   | Improvement                  | Score Impact | Cost       | Timeline  | Evidence |
| --------- | ---------------------------- | ------------ | ---------- | --------- | -------- |
| Lips      | Hyaluronic acid filler       | +12-20       | $500-800   | Immediate | A        |
| Cheeks    | Cheek filler (volume)        | +10-18       | $600-1000  | Immediate | A        |
| Jaw       | Jawline filler               | +12-18       | $600-1200  | Immediate | A        |
| Under-eye | Tear trough filler           | +10-15       | $500-800   | Immediate | A        |
| Forehead  | Botox (smoothing)            | +8-12        | $200-400   | 2 wks     | A        |
| Masseter  | Botox (slimming)             | +8-12        | $400-600   | 4-8 wks   | A        |
| Skin      | Profhilo / skin boosters     | +10-15       | $300-600   | 4-8 wks   | A        |
| Skin      | Chemical peel (professional) | +8-12        | $150-300   | 2-4 wks   | A        |
| Skin      | Microneedling (professional) | +10-15       | $200-400   | 6-10 wks  | A        |
| Skin      | Laser resurfacing (CO2)      | +15-25       | $1000-3000 | 4-8 wks   | A        |
| Brows     | Brow lamination              | +6-10        | $50-100    | Immediate | B        |
| Lashes    | Lash lift + tint             | +5-8         | $75-150    | Immediate | B        |

---

## 8. Integration with Existing SKINgenius Features

### 8.1 Skin Health + Aesthetics = One Protocol

The key differentiator: **Qoves gives you an aesthetic protocol. We give you ONE integrated protocol.**

Example user with acne + weak jaw + under-eye hollows:

**Qoves would say:**

- Phase 1: Skincare routine, retinol, SPF
- Phase 2: Jawline filler ($800), under-eye filler ($600)
- Phase 3: Maintain

**SKINgenius says:**

- Phase 1 (0-4 wks):
  - Skin: Retinol 0.5% + Niacinamide 5% + SPF 50 (addresses acne + texture)
  - Aesthetic: Gua sha for depuffing (free, reveals jaw definition)
  - Supplement: Collagen peptides + Vitamin D3 (if deficient)
  - Wellness: Sleep 7+ hrs, reduce sugar (reduces inflammation → less acne → better skin quality score)
- Phase 2 (4-8 wks):
  - Skin: Add GHK-Cu topical (collagen synthesis + anti-inflammatory)
  - Aesthetic: Botox masseter ($400-600) if jaw width is muscular not skeletal
  - Supplement: Omega-3 + NAC (anti-inflammatory)
  - Wellness: Low glycemic diet protocol
- Phase 3 (8-16 wks):
  - Skin: Prescription tretinoid if OTC retinol insufficient
  - Aesthetic: Jawline filler ($600-800) if still needed after masseter reduction
  - Aesthetic: Tear trough filler ($500-800) for under-eye
  - Peptide: BPC-157 for skin repair
  - Wellness: Full protocol adherence review

### 8.2 Provider Marketplace (Future)

For injectable/procedure recommendations, link to verified providers:

- Search by procedure type + location
- Provider ratings from SKINgenius users
- Before/after galleries from verified providers
- Booking integration

### 8.3 Progress Card (Viral Share)

Generate shareable progress cards:

- Side-by-side before/after with score overlay
- "My SKINgenius Aesthetics Score: 72 → 82 (+10)"
- Feature breakdown with improvement highlights
- Instagram/TikTok story format
- Disclaimer: "AI-generated analysis. Consult a provider for medical advice."

---

## 9. Implementation Phases

### Phase 1: Core Analysis (Weeks 1-3)

- [ ] Facial landmark detection (106 points) via Gemma 4 Vision
- [ ] Metric computation (proportions, symmetry, feature scores)
- [ ] Population reference data (6+ ethnic baselines)
- [ ] Aesthetic score computation
- [ ] Basic results page (scores + feature breakdown)
- [ ] Database tables (facial_analyses, aesthetic_improvements)

### Phase 2: Protocol Engine (Weeks 3-5)

- [ ] Improvement catalog seed data (60+ improvements across 7 categories)
- [ ] Protocol generation algorithm (scores + conditions + preferences → phased plan)
- [ ] Integration with existing skin analysis protocol (one unified protocol)
- [ ] Phased protocol UI (timeline view with steps)
- [ ] Budget and invasiveness preference filters

### Phase 3: Visualization (Weeks 5-7)

- [ ] Before/after projection (landmark morphing)
- [ ] Feature overlay highlighting
- [ ] Score change visualization (animated transitions)
- [ ] Shareable progress cards

### Phase 4: Enhancement (Weeks 7-9)

- [ ] Ethnicity-specific recommendations (azelaic vs hydroquinone, etc.)
- [ ] Fitzpatrick type adjustments
- [ ] Integration with treatment history tracker (Aesthetic Journey spec)
- [ ] Provider marketplace hooks (search by procedure)
- [ ] A/B testing on protocol phasing

---

## 10. Success Metrics

| Metric               | Target             | Why                                    |
| -------------------- | ------------------ | -------------------------------------- |
| Scan completion rate | >80%               | Users should find value in one scan    |
| Protocol engagement  | >60% start Phase 1 | Protocol must feel achievable          |
| 30-day retention     | >40%               | Users must see results to stay         |
| Share rate           | >15% of scans      | Viral growth through progress cards    |
| Pro conversion       | >8% from free scan | Aesthetic analysis drives Pro upgrades |
| Revenue per user     | >$25/yr            | Blended free + Pro + affiliate         |

---

## 11. Files to Reference

- SKINgenius architecture: `skingenius/project-docs/ARCHITECTURE.md`
- Wellness plan spec: `skingenius/specs/WELLNESS-PLAN-SPEC.md`
- Aesthetic Journey spec: `skingenius/specs/AESTHETIC-JOURNEY-FEATURE-SPEC.md`
- SKIN Core + Viral: `skingenius/specs/SKIN-CORE-AND-VIRAL.md`
- Seed data: `skingenius/data/seed-data.json` (25 conditions, 105 ingredients)
- Peptide table: defined in WELLNESS-PLAN-SPEC.md
- Supabase schema: `skingenius/supabase/schema.sql`
- Existing scan components: `skingenius/src/components/scan/`
- Existing wellness components: `skingenius/src/components/wellness/`

---

_This spec positions SKINgenius as the Qoves killer — same facial aesthetics analysis, but with clinical-grade skin health depth, ingredient science, peptide protocols, and an integrated wellness engine that Qoves can't match._
