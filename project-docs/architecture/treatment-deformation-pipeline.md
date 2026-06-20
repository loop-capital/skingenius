# SKINgenius FLAME Treatment Deformation Pipeline — Architecture Specification

> **Document:** ADR-006: Treatment Simulation Pipeline — FLAME + MediaPipe + Neural Rendering Hybrid  
> **Status:** Accepted (2026-06-10)  
> **Owner:** Dermis (SKINgenius Architect)  
> **Reviewers:** Nova (CEO), Lens (AI/Vision), Pixel (Dev), Tiche (Domain Expert)  
> **Depends on:** ADR-001 (On-Device AI), ADR-002 (Supabase), TREATMENT-SIMULATION-PLAN.md, 3d-mesh-models-evaluation.md, image-translation-models-evaluation.md  

---

## 1. Executive Summary

This document defines the complete deformation pipeline for SKINgenius AI-powered treatment simulation. It specifies how a user selfie flows through 3D face reconstruction (FLAME), anatomically-informed deformation (per treatment type), and neural texture rendering to produce a photorealistic "after treatment" visualization.

**Core principle:** Structure first (anatomically correct 3D deformation), then texture (neural rendering). The FLAME mesh is the single source of truth for what changes; CUT/IP-Adapter only translate those changes into photorealistic pixels.

---

## 2. Pipeline Overview (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        FLAME TREATMENT DEFORMATION PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  PHASE 0: INPUT ACQUISITION (Mobile App)                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ User Selfie       │  │ Treatment Type  │  │ Treatment Params│                     │
│  │ (frontal, 512px)  │  │ (botox/filler/  │  │ (dose, zone,    │                     │
│  │ Optional profile  │  │  laser/thread)  │  │ brand, etc.)    │                     │
│  └────────┬──────────┘  └────────┬──────────┘  └────────┬──────────┘                     │
│           │                      │                      │                               │
│           └──────────────────────┼──────────────────────┘                               │
│                                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 1: 3D RECONSTRUCTION & SEGMENTATION (Server, ~800ms)                    │    │
│  │                                                                               │    │
│  │  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐              │    │
│  │  │ MediaPipe    │───→│ FLAME Fitting   │───→│ BiSeNet Face     │              │    │
│  │  │ Face Mesh    │    │ (DECA wrapper)  │    │ Parsing (19      │              │    │
│  │  │ 468 landmarks│    │ → β (shape 300) │    │ semantic zones)  │              │    │
│  │  │              │    │ → θ (expression │    │                  │              │    │
│  │  │              │    │   100 blendshapes)│   │                  │              │    │
│  │  │              │    │ → ψ (pose 6)    │    │                  │              │    │
│  │  │              │    │ → camera (3)    │    │                  │              │    │
│  │  └──────────────┘    └─────────────────┘    └──────────────────┘              │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                  │                                                      │
│                                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 2: ANATOMICAL DEFORMATION (Server, ~200ms)                              │    │
│  │                                                                               │    │
│  │  Treatment Router                                                               │    │
│  │       │                                                                        │    │
│  │       ├───→ BotoxDeformer    (muscle relaxation map)                        │    │
│  │       ├───→ FillerDeformer     (volume field → shape parameters)               │    │
│  │       ├───→ LaserDeformer      (texture parameter map — no structural change)   │    │
│  │       └───→ ThreadDeformer     (tissue repositioning vector field)              │    │
│  │                                                                               │    │
│  │  Output: Modified FLAME parameters β' θ' ψ'                                   │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                  │                                                      │
│                                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 3: MESH RENDERING (Server, ~300ms)                                      │    │
│  │                                                                               │    │
│  │  FLAME(β', θ', ψ') → Deformed Mesh (5,023 vertices)                             │    │
│  │       │                                                                        │    │
│  │       ├───→ UV texture transfer from original photo                            │    │
│  │       ├───→ Normal map generation                                             │    │
│  │       └───→ Depth map generation                                              │    │
│  │                                                                               │    │
│  │  Output: Albedo image + Normal map + Depth map (512×512)                       │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                  │                                                      │
│                                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 4: NEURAL TEXTURE RENDERING (Server, ~1.5s primary / ~3s fallback)      │    │
│  │                                                                               │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐     │    │
│  │  │ PRIMARY: IP-Adapter + ControlNet (photorealistic, identity-preserving)│     │    │
│  │  │                                                                       │     │    │
│  │  │  Inputs:                                                              │     │    │
│  │  │    • Original selfie (reference identity)                            │     │    │
│  │  │    • Deformed mesh render (structure conditioning)                    │     │    │
│  │  │    • Segmentation mask (zone isolation)                               │     │    │
│  │  │    • Text prompt: "{treatment} on {zone}, subtle, natural"          │     │    │
│  │  │                                                                       │     │    │
│  │  │  IP-Adapter FaceID embedding → cross-attention injection             │     │    │
│  │  │  ControlNet depth + pose → spatial control                          │     │    │
│  │  │  25 DDIM steps → 512×512 output                                     │     │    │
│  │  └──────────────────────────────────────────────────────────────────────┘     │    │
│  │                                                                               │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐     │    │
│  │  │ FALLBACK: CUT (FastCUT) — if diffusion unavailable or high load       │     │    │
│  │  │                                                                       │     │    │
│  │  │  Inputs: Unpaired before/after domain training                        │     │    │
│  │  │  Output: Translated texture, same pose                              │     │    │
│  │  │  Latency: ~300ms on GPU                                              │     │    │
│  │  └──────────────────────────────────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                  │                                                      │
│                                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 5: QUALITY GATES & POST-PROCESSING (Server, ~100ms)                     │    │
│  │                                                                               │    │
│  │  • ArcFace identity verification (cosine sim > 0.75)                           │    │
│  │  • Segmentation mask overlay (show treated vs untreated zones)                │    │
│  │  • Sharpness + tone correction                                               │    │
│  │  • Watermark: "Simulation only — results may vary"                            │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                  │                                                      │
│                                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ OUTPUT: Photorealistic "After" Image + Interactive Comparison UI              │    │
│  │                                                                               │    │
│  │  Mobile Display:                                                              │    │
│  │    • Before/After swipe slider                                               │    │
│  │    • Zone highlight toggle                                                   │    │
│  │    • Treatment parameter summary card                                        │    │
│  │    • CTA: "Find certified providers" → GetUpLook referral                    │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

Total Pipeline Latency (Target): < 3.5s end-to-end (p95 on cloud GPU)
```

---

## 3. FLAME Parameter Model

### 3.1 FLAME 2023 Open — Parameter Space

FLAME disentangles face geometry into three orthogonal subspaces:

| Parameter | Symbol | Dimensions | Controls | Range (Typical) |
|-----------|--------|-----------|----------|-----------------|
| **Identity (Shape)** | β | 300 | Bone structure, ethnic ancestry, intrinsic face shape | [-3σ, +3σ] |
| **Expression** | θ | 100 | Muscle activations, facial expressions, dynamic wrinkles | [-3σ, +3σ] |
| **Head Pose** | ψ | 6 | Rotation (3) + translation (3) | Rotation: ±30°, Trans: ±100mm |
| **Neck Pose** | — | 6 | Neck rotation + translation (subordinate) | — |
| **Eye Gaze** | — | 6 | Eyeball rotation (subordinate) | — |

**Treatment-relevant principle:**
- **Botox** modifies **expression parameters θ** (muscle relaxation)
- **Fillers** modify **identity parameters β** (volume addition changes shape)
- **Laser** modifies **texture only** (no β or θ change)
- **Thread lifts** modify both **β and θ** (tissue repositioning)

### 3.2 MediaPipe → FLAME Landmark Correspondence

MediaPipe 468 landmarks map to FLAME template vertices. Critical correspondences for treatment zones:

```
MediaPipe Landmark Indices → FLAME Vertex Groups (zone-based)
═══════════════════════════════════════════════════════════════

Forehead (Botox — frontalis):
  MP: [10, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 21]
  FLAME: vertices 500–700 (upper face region)

Glabella / Frown Lines (Botox — corrugator/procerus):
  MP: [8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 2]
  FLAME: vertices 800–950 (brow medial region)

Crow's Feet (Botox — orbicularis oculi lateral):
  MP: [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
    + [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382]
  FLAME: vertices 1200–1400 (lateral orbit)

Lips (Filler):
  MP: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
  FLAME: vertices 3000–3300 (labial region)

Cheeks (Filler — midface):
  MP: [50, 101, 205, 187, 123, 116, 143, 35, 226, 130, 247, 30, 29, 28, 56, 190, 243, 112, 233, 232, 231, 230, 229, 228, 118, 47, 114, 217]
    + [280, 429, 427, 434, 416, 432, 423, 358, 262, 259, 257, 258, 286, 414, 398, 360, 363, 281, 5, 4, 373, 374, 380, 381]
  FLAME: vertices 1500–1800, 2000–2300 (bilateral malar)

Jawline (Filler / Thread):
  MP: [58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 435, 416, 433]
  FLAME: vertices 2500–2800 (mandibular contour)

Nasolabial Folds (Filler):
  MP: [209, 49, 102, 64, 48, 115, 219, 237, 44, 45, 51, 3, 275, 281, 4, 275, 278, 279, 360, 363]
  FLAME: vertices 1800–2000 (alar to oral commissure)

Chin (Filler):
  MP: [152, 148, 176, 149, 150, 136, 172, 58, 215, 213, 138, 135, 169, 170, 140, 171, 175, 396, 369, 395, 394, 364, 367, 435, 401]
  FLAME: vertices 2800–3000 (mental region)
```

### 3.3 Face Parsing Zones (BiSeNet)

BiSeNet provides 19 semantic classes. We group these into treatment zones:

```
BiSeNet Class ID → Treatment Zone Mapping
═══════════════════════════════════════
 1 (skin)        → General face, laser target
 2 (left brow)   → Botox (frontalis/corrugator)
 3 (right brow)  → Botox (frontalis/corrugator)
 4 (left eye)    → Crow's feet zone
 5 (right eye)   → Crow's feet zone
 6 (nose)        → Not targeted (rhinoplasty out of scope)
 7 (upper lip)   → Filler (vermillion border, volume)
 8 (lower lip)   → Filler (vermillion border, volume)
 9 (mouth)       → Oral commissure (filler for downturn)
10 (left ear)     → Not targeted
11 (right ear)    → Not targeted
12 (hair)         → Not targeted
13 (left pupil)   → Not targeted
14 (right pupil)  → Not targeted
15 (neck)         → Thread lift (platysmal banding — future)
16 (background)   → Not targeted
17 (glasses)      → Not targeted
18 (left sclera)  → Not targeted
19 (right sclera) → Not targeted
```

---

## 4. Deformation Mappings Per Treatment

### 4.1 Botox (Dynamic — Muscle Relaxation)

**Mechanism:** Botulinum toxin blocks acetylcholine release at the neuromuscular junction, reducing muscle contraction. In FLAME terms, this reduces expression blendshape activation.

**FLAME Parameter Modification:**

```
┌────────────────────────────────────────────────────────────────────┐
│                    BOTOX DEFORMATION MAPPING                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TREATMENT ZONE → AFFECTED MUSCLE → FLAME BLENDSHAPES → Δθ RANGE │
│                                                                    │
│  Forehead lines                                                    │
│    Zone: Upper face (BiSeNet 2,3)                                  │
│    Muscle: Frontalis                                               │
│    FLAME blendshapes: expression_01 (brow raise),                 │
│                       expression_03 (surprise),                    │
│                       expression_15 (forehead tension)             │
│    Δθ: -0.3 to -0.8 (30–80% reduction in activation)              │
│    Clinical baseline: 20 units Botox → Δθ ≈ -0.5                  │
│    Effect: Smooth forehead, reduce horizontal rhytids               │
│                                                                    │
│  Glabellar / Frown lines                                           │
│    Zone: Glabella (BiSeNet between brows)                          │
│    Muscle: Corrugator supercilii + Procerus                        │
│    FLAME blendshapes: expression_05 (brow lower),                 │
│                       expression_07 (anger),                       │
│                       expression_12 (scowl)                        │
│    Δθ: -0.4 to -0.9                                               │
│    Clinical baseline: 20 units → Δθ ≈ -0.6                        │
│    Effect: Reduce "11" lines, brow depressor relaxation            │
│                                                                    │
│  Crow's Feet                                                       │
│    Zone: Lateral orbit (BiSeNet 4,5 lateral)                       │
│    Muscle: Orbicularis oculi (lateral fibers)                     │
│    FLAME blendshapes: expression_09 (squint),                     │
│                       expression_17 (eye closure),                │
│                       expression_22 (laugh lines)                  │
│    Δθ: -0.2 to -0.7                                               │
│    Clinical baseline: 12 units per side → Δθ ≈ -0.45              │
│    Effect: Reduce lateral canthal rhytids on smiling               │
│                                                                    │
│  Bunny Lines (optional)                                            │
│    Muscle: Nasalis                                                 │
│    FLAME blendshapes: expression_28 (nose wrinkle)                │
│    Δθ: -0.3 to -0.6                                               │
│                                                                    │
│  Chin Dimpling (optional)                                        │
│    Muscle: Mentalis                                                │
│    FLAME blendshapes: expression_35 (chin tension)                 │
│    Δθ: -0.2 to -0.5                                               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Dynamic Pair Generation:**

Botox requires showing effect at **both rest AND maximum expression**:

```
User provides: Neutral selfie
                ↓
System generates TWO outputs:
  1. REST simulation: θ_rest' = θ_rest + Δθ_botox
     (relaxed muscles, subtle smoothing)

  2. MAX EXPRESSION simulation:
     a. Compute user's max expression from FLAME fitting (θ_max)
     b. Apply Botox attenuation: θ_max' = θ_rest + α(θ_max - θ_rest)
        where α = muscle activation retention (0.1–0.3 post-Botox)
     c. Result: reduced movement amplitude, softer dynamic wrinkles

User sees: Split-screen or slider comparing:
  • Before-Rest vs After-Rest
  • Before-Smile vs After-Smile
```

**Dose-response curve (modeled as sigmoid):**

```python
# Pseudo-code for Botox dose → Δθ mapping
import numpy as np

def botox_dose_to_delta_theta(dose_units, muscle_sensitivity=1.0):
    """
    dose_units: Botox units injected (typical 10–60)
    muscle_sensitivity: Individual factor (0.8–1.2)
    Returns: Δθ (negative = reduced activation)
    """
    # Sigmoid: low doses have minimal effect, plateau at ~50 units
    max_effect = -0.9  # 90% reduction at saturation
    half_effect_dose = 25  # units for 50% of max effect
    slope = 0.15

    effect_ratio = 1 / (1 + np.exp(-slope * (dose_units - half_effect_dose)))
    delta_theta = max_effect * effect_ratio * muscle_sensitivity
    return delta_theta
```

---

### 4.2 Fillers (Static — Volume Addition)

**Mechanism:** Hyaluronic acid (or CaHA, PLLA) injected subcutaneously or supraperiosteally adds volume. In FLAME terms, this modifies identity shape parameters β to expand specific facial regions.

**Volume → Shape Parameter Mapping:**

```
┌────────────────────────────────────────────────────────────────────┐
│                   FILLER DEFORMATION MAPPING                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TREATMENT ZONE → VOLUME MODEL → FLAME SHAPE MODIFICATION         │
│                                                                    │
│  Lips                                                              │
│    Zone: Vermillion border + body (BiSeNet 7,8)                   │
│    Volume model: Local radial expansion from injection points      │
│    FLAME modification:                                               │
│      • β_lip_protrusion (shape dim 142): +0.2 to +0.8 per mL     │
│      • β_lip_width (shape dim 143): +0.1 to +0.4 per mL          │
│      • β_philtrum_depth (shape dim 145): -0.1 to -0.3 per mL     │
│    Injection sites: 6 points (upper 3, lower 3)                  │
│    Clinical baseline:                                              │
│      0.5mL → subtle enhancement (Δβ ≈ +0.3)                       │
│      1.0mL → moderate enhancement (Δβ ≈ +0.6)                    │
│      1.5mL+ → pronounced (Δβ ≈ +0.9, with eversion)              │
│                                                                    │
│  Cheeks (Midface)                                                  │
│    Zone: Malar eminence (BiSeNet 1, lateral upper)               │
│    Volume model: Hemispherical projection above zygomatic arch     │
│    FLAME modification:                                               │
│      • β_cheek_projection (shape dim 87): +0.15 to +0.5 per mL   │
│      • β_cheek_width (shape dim 88): +0.05 to +0.2 per mL        │
│      • β_submalar_hollow (shape dim 89): -0.1 to -0.4 per mL      │
│    Injection sites: 2–3 points per side (zygomatic, zygomaticofacial)
│    Clinical baseline:                                              │
│      1.0mL per side → Δβ ≈ +0.35                                  │
│      2.0mL per side → Δβ ≈ +0.6 (noticeable lift)                 │
│                                                                    │
│  Jawline                                                           │
│    Zone: Mandibular border (BiSeNet 1, lower lateral)             │
│    Volume model: Linear augmentation along mandibular border       │
│    FLAME modification:                                               │
│      • β_jaw_angle (shape dim 92): +0.2 to +0.6 per mL            │
│      • β_jaw_width (shape dim 93): +0.1 to +0.3 per mL           │
│      • β_prejowl_sulcus (shape dim 94): -0.15 to -0.4 per mL     │
│    Injection sites: 3–5 points per side (angle, prejowl, chin)    │
│    Clinical baseline:                                              │
│      1.5mL per side → Δβ ≈ +0.4 (defined contour)                 │
│      3.0mL per side → Δβ ≈ +0.7 (masculinization, sharp)         │
│                                                                    │
│  Nasolabial Folds                                                  │
│    Zone: Alar base to oral commissure (BiSeNet 1, medial lower)   │
│    Volume model: Linear filling of fold valley                     │
│    FLAME modification:                                               │
│      • β_nasolabial_depth (shape dim 110): -0.2 to -0.7 per mL   │
│      • β_upper_lip_length (shape dim 111): +0.05 per mL           │
│    Injection sites: 2–3 points per side (deep + superficial)        │
│    Clinical baseline:                                              │
│      0.5mL per side → Δβ ≈ -0.3 (softening)                       │
│      1.0mL per side → Δβ ≈ -0.55 (significant smoothing)          │
│                                                                    │
│  Chin                                                              │
│    Zone: Mental region (BiSeNet 1, center lower)                  │
│    Volume model: Anterior projection + width increase                │
│    FLAME modification:                                               │
│      • β_chin_projection (shape dim 95): +0.3 to +1.0 per mL    │
│      • β_chin_width (shape dim 96): +0.1 to +0.3 per mL           │
│      • β_labiomental_angle (shape dim 97): +0.2 per mL          │
│    Injection sites: 1–3 points (central + lateral)                  │
│    Clinical baseline:                                              │
│      1.0mL → Δβ ≈ +0.4 (subtle projection)                          │
│      2.0mL → Δβ ≈ +0.75 (strong projection, heart-shaped face)   │
│                                                                    │
│  Temples (optional)                                                │
│    Zone: Temporal fossa                                             │
│    Volume model: Concavity reduction                                 │
│    FLAME: β_temporal_fullness (dim 98): +0.2 to +0.5 per mL       │
│                                                                    │
│  Under-Eye / Tear Trough (optional)                                │
│    Zone: Infraorbital (BiSeNet below 4,5)                         │
│    Volume model: Valley filling                                    │
│    FLAME: β_tear_trough (dim 112): -0.15 to -0.4 per mL          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Volume-to-Deformation Physics:**

We model filler as a **soft tissue expansion field** on the FLAME mesh surface. For each injection point:

```python
# Pseudo-code for filler volume → vertex displacement
def apply_filler(mesh, injection_points, volume_ml, product_G_prime):
    """
    injection_points: List of (vertex_idx, depth_layer)
    volume_ml: Total volume injected
    product_G_prime: Elastic modulus (Juvederm Voluma ≈ 400Pa, Restylane Lyft ≈ 300Pa)
    Returns: Deformed mesh vertices
    """
    displacement_field = np.zeros_like(mesh.vertices)

    for inj_vtx, depth in injection_points:
        # Volume distributes as Gaussian in local neighborhood
        distances = np.linalg.norm(mesh.vertices - mesh.vertices[inj_vtx], axis=1)
        spread_sigma = 15.0 * (volume_ml ** 0.3)  # empirical: larger volume = wider spread

        # Depth attenuation: superficial → more surface projection
        depth_factor = 1.0 if depth == 'superficial' else 0.6 if depth == 'mid' else 0.4

        # Product stiffness: higher G' = more projection, less spread
        stiffness_factor = (product_G_prime / 400.0) ** 0.5

        # Normal direction expansion (outward from bone)
        normals = mesh.vertex_normals
        displacement = (
            volume_ml * 2.5 *  # empirical scaling (mL → mm displacement)
            depth_factor *
            stiffness_factor *
            np.exp(-distances**2 / (2 * spread_sigma**2))[:, np.newaxis] *
            normals
        )
        displacement_field += displacement

    # Apply to FLAME shape parameters via Jacobian
    # J = d(vertices)/dβ — precomputed per FLAME model
    delta_beta = np.linalg.lstsq(J, displacement_field.flatten(), rcond=None)[0]
    return delta_beta
```

---

### 4.3 Laser Resurfacing (Texture)

**Mechanism:** Laser (CO₂, Erb:YAG, fractional) ablates epidermis and heats dermis, triggering collagen remodeling. No structural volume change — purely texture/quality improvement.

**FLAME Impact:** NONE on β or θ. This is a **pure texture transformation** handled entirely by neural rendering.

**Neural Rendering Conditioning:**

```
┌────────────────────────────────────────────────────────────────────┐
│                  LASER TEXTURE RENDERING                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TREATMENT TYPE → TEXTURE CHANGE → DIFFUSION PROMPT               │
│                                                                    │
│  Fractional CO₂ Resurfacing                                        │
│    Target: Overall skin texture, fine lines, tone                  │
│    Diffusion prompt:                                               │
│      "Same person, smoother skin texture, reduced fine lines,    │
│       more even skin tone, subtle glow, natural result,           │
│       preserve all facial features and identity"                   │
│    ControlNet: depth map from FLAME (unchanged structure)         │
│    IP-Adapter: user's FaceID (identity lock)                        │
│    Segmentation mask: full face (BiSeNet class 1)                │
│                                                                    │
│  IPL / Photofacial                                                │
│    Target: Pigmentation, vascular lesions, redness                 │
│    Diffusion prompt:                                               │
│      "Same person, reduced redness and dark spots,                │
│       more even complexion, reduced vascular markings,            │
│       preserve identity"                                          │
│    Segmentation mask: full face                                    │
│                                                                    │
│  RF Microneedling (Morpheus8)                                     │
│    Target: Skin tightening, texture, mild contour                  │
│    Diffusion prompt:                                               │
│      "Same person, slightly firmer skin, improved jawline        │
│       definition, smoother texture, natural result"                │
│    Note: Subtle contour changes may need minor β adjustment        │
│                                                                    │
│  Chemical Peel (medium depth)                                     │
│    Target: Texture, superficial pigmentation                       │
│    Diffusion prompt:                                               │
│      "Same person, brighter complexion, reduced dullness,        │
│       smoother skin texture, fresh appearance"                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Texture Severity Scale → Diffusion Strength:**

```python
# Pseudo-code: laser intensity → diffusion conditioning strength
def laser_diffusion_strength(treatment_intensity):
    """
    treatment_intensity: 1-5 (mild to aggressive)
    Returns: conditioning_scale for IP-Adapter + text guidance_scale
    """
    intensity_map = {
        1: {"ip_scale": 0.15, "guidance": 3.0,  "prompt": "subtle glow, barely perceptible improvement"},
        2: {"ip_scale": 0.25, "guidance": 4.0,  "prompt": "noticeable smoother texture, fresher look"},
        3: {"ip_scale": 0.40, "guidance": 5.5,  "prompt": "significantly smoother, more even tone"},
        4: {"ip_scale": 0.55, "guidance": 7.0,  "prompt": "dramatic texture improvement, youthful glow"},
        5: {"ip_scale": 0.70, "guidance": 9.0,  "prompt": "maximum resurfacing effect, dramatically renewed skin"},
    }
    return intensity_map[treatment_intensity]
```

---

### 4.4 Thread Lifts (Structural — Tissue Repositioning)

**Mechanism:** PDO/PLLA threads inserted subcutaneously create mechanical lift vectors and stimulate collagen. This is a **geometric repositioning** of facial tissue.

**FLAME Parameter Modification:**

```
┌────────────────────────────────────────────────────────────────────┐
│                  THREAD LIFT DEFORMATION MAPPING                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TREATMENT TYPE → LIFT VECTORS → FLAME MODIFICATION               │
│                                                                    │
│  Midface Lift (vector lift)                                        │
│    Vectors: Superolateral (45° upward + outward)                   │
│    Anchors: Temporal region → malar fat pad                        │
│    FLAME modification:                                             │
│      • β_midface_vertical (dim 78): +0.3 to +0.8                │
│        (tissue moved superiorly)                                   │
│      • β_midface_lateral (dim 79): +0.2 to +0.5                 │
│        (tissue moved laterally, widened upper face)              │
│      • β_nasolabial_depth (dim 110): -0.2 to -0.4               │
│        (secondary: fold effacement from upward pull)               │
│      • θ_expression_09 (dim 9): +0.1 to +0.2                    │
│        (subtle: slightly more open eye appearance)                 │
│    Clinical baseline: 4–8 threads per side → Δβ ≈ +0.5            │
│                                                                    │
│  Jawline Tightening                                                │
│    Vectors: Posterior-superior along mandibular border             │
│    Anchors: Preauricular → angle of mandible                       │
│    FLAME modification:                                             │
│      • β_jawline_angle (dim 92): +0.2 to +0.5                   │
│        (sharper angle from upward pull)                            │
│      • β_jowl_definition (dim 101): -0.3 to -0.6                │
│        (reduced jowl from tightening)                              │
│      • β_submental_angle (dim 102): +0.1 to +0.3                │
│        (improved cervicomental angle)                              │
│    Clinical baseline: 3–6 threads per side → Δβ ≈ +0.4          │
│                                                                    │
│  Brow Lift (fox eye / brow lift)                                   │
│    Vectors: Superior-lateral (tail of brow)                       │
│    Anchors: Temporal → lateral brow                               │
│    FLAME modification:                                             │
│      • β_brow_position (dim 103): +0.3 to +0.7                 │
│        (elevated lateral brow)                                     │
│      • θ_expression_01 (dim 1): +0.1                             │
│        (subtle: more alert appearance)                             │
│    Clinical baseline: 2–4 threads → Δβ ≈ +0.45                    │
│                                                                    │
│  Neck Lift (future — platysmal bands)                              │
│    Vectors: Posterior-superior                                     │
│    FLAME: β_neck_contour (dim 105): +0.2 to +0.4                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Vector Field Representation:**

Thread lifts create a **displacement vector field** on the FLAME mesh. Each thread is modeled as a spring:

```python
# Pseudo-code: thread lift vector field
def thread_lift_field(mesh, thread_specs):
    """
    thread_specs: List of {entry_vtx, exit_vtx, tension_N, thread_type}
    Returns: Vertex displacement field
    """
    displacement = np.zeros_like(mesh.vertices)

    for thread in thread_specs:
        entry = mesh.vertices[thread.entry_vtx]
        exit = mesh.vertices[thread.exit_vtx]
        direction = exit - entry
        length = np.linalg.norm(direction)
        unit_dir = direction / length

        # Tension decreases with distance from thread line
        for v_idx, vtx in enumerate(mesh.vertices):
            # Shortest distance to thread line segment
            t = np.dot(vtx - entry, unit_dir) / length
            t = np.clip(t, 0, 1)
            closest = entry + t * unit_dir
            dist = np.linalg.norm(vtx - closest)

            # Influence radius: ~25mm for PDO, ~30mm for PLLA
            influence = thread.tension_N * np.exp(-dist**2 / (2 * 25**2))

            # Displacement toward exit point (lift direction)
            displacement[v_idx] += influence * unit_dir * thread.elasticity_factor

    return displacement
```

---

## 5. API Design (Mobile ↔ Server)

### 5.1 Endpoints

```
┌────────────────────────────────────────────────────────────────────────┐
│                    TREATMENT SIMULATION API                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  POST /api/v1/simulation/reconstruct                                   │
│  ─────────────────────────────────                                     │
│  Input:  { image: base64<JPG>, scan_id: uuid }                       │
│  Output: { mesh_id: uuid, landmarks: [...], zones: [...],           │
│            flamel_params: { beta, theta, psi } }                       │
│  Latency: ~800ms                                                       │
│  Cost:   ~$0.001 (GPU compute)                                        │
│                                                                         │
│  POST /api/v1/simulation/preview                                     │
│  ─────────────────────────────                                         │
│  Input:  { mesh_id: uuid, treatment: TreatmentConfig,                │
│            expression: "rest" | "smile" | "frown" | "surprise" }     │
│  Output: { preview_url: <CDN>, parameters: {...},                     │
│            confidence: 0.0–1.0, processing_time_ms }                   │
│  Latency: ~2.5s (primary IP-Adapter) / ~1.0s (fallback CUT)          │
│  Cost:   ~$0.005 (diffusion) / ~$0.001 (CUT)                         │
│                                                                         │
│  POST /api/v1/simulation/compare                                     │
│  ─────────────────────────────                                         │
│  Input:  { mesh_id: uuid, treatments: TreatmentConfig[] }            │
│  Output: { comparisons: [{ treatment_id, before_url, after_url }] }    │
│  Latency: ~2.5s × N treatments                                       │
│                                                                         │
│  POST /api/v1/simulation/3d-preview    [Premium]                       │
│  ───────────────────────────────                                       │
│  Input:  { mesh_id: uuid, treatment: TreatmentConfig }                │
│  Output: { gsplat_url: <3DGS viewer URL>, rotations: [...] }        │
│  Latency: ~5s (multi-view render + 3DGS reconstruction)              │
│  Cost:   ~$0.02                                                       │
│                                                                         │
│  GET  /api/v1/simulation/treatments                                  │
│  ─────────────────────────────────                                     │
│  Output: { treatments: [{ id, name, zones[], params[],               │
│            avg_cost_usd, duration_months }] }                         │
│  Latency: <100ms (cached)                                             │
│                                                                         │
│  POST /api/v1/simulation/feedback                                     │
│  ─────────────────────────────                                         │
│  Input:  { simulation_id, rating: 1–5, notes: string }               │
│  Output: { status: "recorded" }                                        │
│  Purpose: Improve deformation accuracy via user feedback              │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 TypeScript API Contracts

```typescript
// ==== REQUEST TYPES ====

interface TreatmentConfig {
  treatment_type: 'botox' | 'filler' | 'laser' | 'thread_lift';
  zones: TreatmentZone[];
  products?: ProductConfig[];      // e.g., [{ brand: "Juvederm", product: "Voluma" }]
  practitioner_notes?: string;      // free text from provider
}

interface TreatmentZone {
  zone_id: string;                 // e.g., "forehead", "lips", "cheeks"
  side: 'left' | 'right' | 'both';
  parameters: ZoneParameters;
}

// ZoneParameters is discriminated by treatment type
interface BotoxZoneParameters {
  units: number;                    // 1–100 units
  injection_pattern: 'standard' | 'microbotox' | 'mesobotox';
}

interface FillerZoneParameters {
  volume_ml: number;                // 0.1–5.0 mL
  injection_depth: 'superficial' | 'mid' | 'deep' | 'supraperiosteal';
  technique: 'linear_threading' | 'fanning' | 'cross_hatching' | 'bolus';
  product?: string;                 // e.g., "Juvederm Ultra XC"
}

interface LaserZoneParameters {
  treatment_type: 'co2_fractional' | 'erbium_yag' | 'ipl' | 'rf_microneedling';
  intensity: 1 | 2 | 3 | 4 | 5;    // mild to aggressive
  passes: number;                   // 1–3
}

interface ThreadZoneParameters {
  thread_type: 'pdo_smooth' | 'pdo_screw' | 'pdo_cog' | 'plla' | 'pcl';
  count: number;                   // threads per side
  entry_points: string[];           // e.g., ["temporal", "preauricular"]
  exit_points: string[];
  tension: 'low' | 'medium' | 'high';
}

type ZoneParameters =
  | { type: 'botox'; data: BotoxZoneParameters }
  | { type: 'filler'; data: FillerZoneParameters }
  | { type: 'laser'; data: LaserZoneParameters }
  | { type: 'thread_lift'; data: ThreadZoneParameters };

// ==== RESPONSE TYPES ====

interface SimulationResult {
  simulation_id: string;
  mesh_id: string;
  before_image: ImageAsset;
  after_image: ImageAsset;
  treatment_summary: TreatmentSummary;
  flamel_deltas: FLAMEDeltas;
  quality_gates: QualityGateResults;
  processing_time_ms: number;
}

interface ImageAsset {
  url: string;                     // CDN URL
  width: number;
  height: number;
  format: 'jpg' | 'png';
}

interface TreatmentSummary {
  treatment_type: string;
  zones_treated: string[];
  estimated_duration: string;       // e.g., "30–45 minutes"
  estimated_cost_usd: { min: number; max: number };
  recovery_time: string;           // e.g., "None", "2–3 days", "1–2 weeks"
  result_longevity: string;        // e.g., "3–4 months", "12–18 months"
}

interface FLAMEDeltas {
  beta_changes: Record<string, number>;    // shape_dim → delta
  theta_changes: Record<string, number>;   // expression_dim → delta
  max_vertex_displacement_mm: number;       // physical accuracy check
}

interface QualityGateResults {
  identity_preserved: boolean;      // ArcFace cosine similarity > 0.75
  identity_score: number;           // 0.0–1.0
  anatomical_plausibility: boolean;   // No self-intersections, valid normals
  zone_isolation: boolean;           // Untouched zones unchanged
  render_quality: number;            // SSIM vs reference
}
```

---

## 6. Data Flow

### 6.1 Sequence Diagram (Scan → Render → Display)

```
Mobile App              Supabase              Simulation Service          GPU Worker              CDN
──────────              ────────              ───────────────────          ────────              ────
   │                       │                         │                         │                    │
   │ 1. Capture selfie     │                         │                         │                    │
   │──────────────────────>│                         │                         │                    │
   │                       │                         │                         │                    │
   │                       │ 2. Store raw image      │                         │                    │
   │                       │────────────────────────>│                         │                    │
   │                       │                         │                         │                    │
   │                       │                         │ 3. Fetch image + config │                    │
   │                       │                         │<────────────────────────│                    │
   │                       │                         │                         │                    │
   │                       │                         │ 4. MediaPipe landmarks  │                    │
   │                       │                         │────────────────────────>│                    │
   │                       │                         │                         │                    │
   │                       │                         │ 5. FLAME fit (DECA)     │                    │
   │                       │                         │────────────────────────>│                    │
   │                       │                         │                         │                    │
   │                       │                         │ 6. Return β, θ, ψ       │                    │
   │                       │                         │<────────────────────────│                    │
   │                       │                         │                         │                    │
   │                       │                         │ 7. Apply deformation    │                    │
   │                       │                         │  (treatment-specific)   │                    │
   │                       │                         │                         │                    │
   │                       │                         │ 8. Render mesh → maps   │                    │
   │                       │                         │────────────────────────>│                    │
   │                       │                         │                         │                    │
   │                       │                         │ 9. Neural render        │                    │
   │                       │                         │  (IP-Adapter/ControlNet)│                    │
   │                       │                         │────────────────────────>│                    │
   │                       │                         │                         │                    │
   │                       │                         │ 10. Quality gates       │                    │
   │                       │                         │  (ArcFace + plausibility)│                    │
   │                       │                         │                         │                    │
   │                       │ 11. Store result        │                         │                    │
   │                       │<────────────────────────│                         │                    │
   │                       │                         │                         │                    │
   │                       │ 12. Upload to CDN       │                         │                    │
   │                       │───────────────────────────────────────────────────────────────────────>│
   │                       │                         │                         │                    │
   │                       │ 13. Return simulation_id│                         │                    │
   │<──────────────────────│                         │                         │                    │
   │                       │                         │                         │                    │
   │ 14. Fetch & display   │                         │                         │                    │
   │──────────────────────>│                         │                         │                    │
   │                       │                         │                         │                    │
   │ 15. CDN URL → display │                         │                         │                    │
   │<──────────────────────│                         │                         │                    │
   │                       │                         │                         │                    │
```

### 6.2 State Machine (Simulation Job)

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐
│ PENDING │───→│ QUEUED   │───→│ RECONSTRUCT│───→│ DEFORM    │───→│ RENDER  │
└─────────┘    └──────────┘    └───────────┘    └───────────┘    └───┬─────┘
     │                                                                  │
     │                                                                  ▼
     │                                                           ┌─────────┐
     │                                                           │ QUALITY │
     │                                                           │  GATE   │
     │                                                           └────┬────┘
     │                                                                  │
     │                    ┌─────────────────────────────────────────────┘
     │                    │
     │                    ▼
     │              ┌──────────┐
     │              │ APPROVED │────────────────→┌──────────┐
     │              │          │                 │ COMPLETE │
     └──────────────┤ FAIL    │────────────────→│  FAILED  │
                    └──────────┘                 └──────────┘
```

---

## 7. Performance Requirements

### 7.1 Latency Targets

```
┌────────────────────────────────────────────────────────────────────┐
│                    LATENCY BUDGET (p95)                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Phase                            │ Target    │ Max    │ Notes     │
│  ─────────────────────────────────┼───────────┼────────┼───────────│
│  Image upload (WiFi)              │ < 500ms   │ 1s     │ Depends   │
│  Image upload (4G)                │ < 1.5s    │ 3s     │ on size   │
│                                                                    │
│  3D Reconstruction (MediaPipe+FLAME)│ < 1s    │ 2s     │ GPU T4    │
│  Anatomical Deformation           │ < 200ms   │ 500ms  │ CPU/GPU   │
│  Mesh Rendering                   │ < 300ms   │ 600ms  │ PyTorch3D │
│                                                                    │
│  Neural Render (PRIMARY: IP-Adapter)│ < 2s    │ 4s     │ A10G, 25  │
│    - DDIM steps (25)                │ ~1.2s   │        │ steps     │
│    - Face encoding                  │ ~100ms  │        │           │
│    - ControlNet depth               │ ~400ms  │        │           │
│    - VAE decode                     │ ~300ms  │        │           │
│                                                                    │
│  Neural Render (FALLBACK: CUT)      │ < 500ms │ 1s     │ T4, one   │
│    - Single forward pass            │ ~300ms  │        │ pass      │
│                                                                    │
│  Quality Gates                      │ < 100ms │ 200ms  │ ArcFace   │
│  Post-processing                    │ < 100ms │ 200ms  │ CPU       │
│                                                                    │
│  ─────────────────────────────────┼───────────┼────────┼───────────│
│  TOTAL (Primary pipeline, p95)    │ < 3.5s    │ 6s     │           │
│  TOTAL (Fallback pipeline, p95)   │ < 2.0s    │ 4s     │           │
│                                                                    │
│  3D Preview (Premium, p95)        │ < 5s      │ 10s    │ Multi-view│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Throughput Targets

```
┌────────────────────────────────────────────────────────────────────┐
│                    THROUGHPUT REQUIREMENTS                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Metric                          │ Target    │ Peak       │ Notes │
│  ────────────────────────────────┼───────────┼────────────┼───────│
│  Concurrent simulations          │ 50        │ 200        │ GPU   │
│  Simulations / hour              │ 3,600     │ 14,400     │ pool  │
│  Simulations / day               │ 86,400    │ 345,600    │       │
│                                                                    │
│  GPU Requirements (steady):                                               │
│    - Reconstruction: 2× NVIDIA T4 (shared with existing GPU pool) │
│    - Rendering:     4× NVIDIA A10G (dedicated for diffusion)      │
│                                                                    │
│  Cost per simulation:                                                         │
│    - Primary (IP-Adapter): ~$0.005                                │
│    - Fallback (CUT):        ~$0.001                                │
│    - 3D Preview:            ~$0.02                                  │
│    - At 10K sims/day:       ~$50/day → $1,500/month                │
│                                                                    │
│  CDN caching:                                                         │
│    - Before/After pairs cached 7 days                               │
│    - Same user + same params = cache hit                            │
│    - Target cache hit rate: 40% (users experiment with params)        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.3 Mobile Constraints

```
┌────────────────────────────────────────────────────────────────────┐
│                    MOBILE PERFORMANCE                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Constraint                      │ Requirement                    │
│  ────────────────────────────────┼────────────────────────────────│
│  App download size               │ < 200MB total (CoreML models   │
│                                  │  only for MediaPipe preview)    │
│                                                                    │
│  Client-side preview (optional)  │ MediaPipe-only deformation     │
│    - Landmark-based warp         │ < 100ms on iPhone 12+          │
│    - No FLAME (cloud handles 3D) │                                │
│                                                                    │
│  Image upload size               │ JPEG, 512×512, quality 85      │
│                                  │ Target: < 150KB                │
│                                                                    │
│  Minimum network                 │ Stable 3G (384kbps) for upload │
│                                                                    │
│  Offline behavior                │ Queue simulation, run when     │
│                                  │ connectivity restored            │
│                                                                    │
│  Battery impact                  │ < 5% for 30s scan + upload     │
│                                                                    │
│  Progressive loading             │ Show reconstruction wireframe  │
│                                  │ while neural render completes  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. Identity Preservation Architecture

### 8.1 Multi-Anchor Identity System

```
┌────────────────────────────────────────────────────────────────────┐
│                 IDENTITY PRESERVATION STACK                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Anchor Layer          │ Mechanism                │ Failure Mode │
│  ──────────────────────┼──────────────────────────┼──────────────│
│  1. Geometric Anchor   │ FLAME mesh identity (β)  │ Cannot fail  │
│                        │ is preserved; only       │ structurally │
│                        │ specific zones deform    │              │
│                                                                    │
│  2. Texture Anchor     │ IP-Adapter FaceID        │ IP-Adapter   │
│                        │ embedding injected into  │ may over-    │
│                        │ diffusion cross-attention│ condition    │
│                                                                    │
│  3. Pose Anchor        │ ControlNet depth +       │ Pose may     │
│                        │ OpenPose conditioning      │ drift if     │
│                        │ locks head angle         │ depth map    │
│                        │                          │ ambiguous    │
│                                                                    │
│  4. Zone Anchor        │ BiSeNet segmentation     │ Segmentation │
│                        │ mask isolates treatment  │ errors may   │
│                        │ zones; untouched pixels  │ leak changes │
│                        │ copied from original     │              │
│                                                                    │
│  5. Pixel Anchor       │ ArcFace verification     │ Face crop    │
│                        │ rejects outputs with     │ may miss     │
│                        │ cosine similarity < 0.75 │ features     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 8.2 ArcFace Quality Gate

```python
# ArcFace identity verification gate
def verify_identity(original_image, rendered_image, threshold=0.75):
    """
    Returns: { passed: bool, similarity: float }
    """
    emb1 = arcface_encoder(original_image)
    emb2 = arcface_encoder(rendered_image)

    similarity = cosine_similarity(emb1, emb2)

    return {
        "passed": similarity >= threshold,
        "similarity": float(similarity),
        "threshold": threshold
    }

# Fallback cascade if primary gate fails
IDENTITY_CASCADE = [
    ("ArcFace", 0.75, "primary"),
    ("ArcFace_relaxed", 0.65, "warn"),     # Accept with warning overlay
    ("Facenet", 0.60, "emergency"),        # Last resort
    (None, 0.0, "reject")                  # Show error, no output
]
```

---

## 9. Safety & Compliance

### 9.1 Output Disclaimers

Every rendered image MUST include:

```
["Simulation only. Results may vary. Consult a certified provider.",
 "This is an AI-generated visualization, not a medical prediction.",
 "Individual results depend on anatomy, product choice, and injector skill.",
 "Not a substitute for professional medical advice."]
```

Display formats:
- **Image watermark:** Subtle overlay, bottom-right corner
- **UI card:** Expandable "About this simulation" section
- **Share output:** Disclaimer included in exported image metadata

### 9.2 Clinical Boundaries

```
┌────────────────────────────────────────────────────────────────────┐
│                    CLINICAL GUARDRAILS                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Rule                              │ Implementation               │
│  ──────────────────────────────────┼──────────────────────────────│
│  No medical diagnosis              │ Simulation label only, no    │
│                                    │ condition claims             │
│                                                                    │
│  No outcome guarantees             │ "May vary" on every output   │
│                                                                    │
│  Max deformation limits            │ Hard caps on β/θ deltas to   │
│                                    │ prevent unrealistic results  │
│                                                                    │
│  Age-appropriate                   │ Deformations scaled by       │
│                                    │ detected age (e.g., less    │
│                                    │ dramatic for 60+)            │
│                                                                    │
│  Fitzpatrick-aware               │ Texture changes calibrated   │
│                                    │ for melanin content          │
│                                                                    │
│  Provider referral for severe      │ If user severity ≥ 8/10 on   │
│  cases                             │ any zone, prompt GetUpLook   │
│                                    │ referral instead of sim      │
│                                                                    │
│  No self-injection encouragement   │ Educational content only;    │
│                                    │ no DIY instructions          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 9.3 Data Privacy

- Raw selfies: Encrypted in transit (TLS 1.3), encrypted at rest (AES-256)
- FLAME parameters: Stored in Supabase with RLS (user_id scoped)
- Rendered images: Auto-expire from CDN after 30 days
- Training data: NEVER use user photos for model training without explicit opt-in
- Mesh data: Anonymized immediately (no link to user identity)

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1–4)

```
□ Download FLAME 2023 Open model + DECA wrapper
□ Set up GPU inference service (Docker + FastAPI)
□ Implement MediaPipe → FLAME landmark fitting
□ Build basic mesh renderer (PyTorch3D or trimesh + OpenCV)
□ Implement Botox deformation (forehead only)
□ Train CUT on 1,000 synthetic FLAME before/after pairs
□ Build API endpoints (/reconstruct, /preview)
□ Mobile integration: upload + display result
```

### Phase 2: Production (Weeks 5–8)

```
□ Expand to all Botox zones (glabella, crow's feet)
□ Implement all filler deformation mappings
□ Integrate IP-Adapter + ControlNet pipeline
□ Build quality gates (ArcFace + plausibility)
□ Implement segmentation masking (BiSeNet)
□ Add before/after slider UI component
□ Provider referral integration (GetUpLook)
□ User feedback loop (rate simulation accuracy)
```

### Phase 3: Polish (Weeks 9–12)

```
□ Thread lift deformation implementation
□ Laser texture rendering (diffusion prompts)
□ Dynamic expression pairs (rest + smile)
□ 3D preview (3DGS reconstruction — premium)
□ Performance optimization (batching, caching)
□ A/B test: CUT vs IP-Adapter photorealism
□ Dermatologist validation study (10 providers)
```

### Phase 4: Scale (Weeks 13–16)

```
□ Multi-GPU autoscaling
□ Model quantization (INT8) for faster inference
□ Offline queue system
□ Advanced parameter tuning (dose-response curves)
□ Manufacturer product library (Juvederm, Restylane, etc.)
□ Outcome tracking: user returns with real after-photo
```

---

## 11. Open Questions

1. **FLAME 2023 Open registration:** Who holds the account? Need corporate email?
2. **DECA commercial licensing:** MPI-IS has been contacted — status?
3. **GPU infrastructure:** Run on Vercel GPU functions or dedicated GPU cluster?
4. **Training data partnerships:** Which medspas can provide consented before/afters?
5. **Dermatologist validation:** Budget for 10-provider review panel?
6. **3DGS viewer:** Three.js + gaussian splatting or native Unity/Unreal?
7. **Apple App Store review:** Will treatment simulation trigger medical app classification?
8. **Age detection:** Use existing ViT or add auxiliary age estimation head?

---

## 12. References

1. FLAME Model: Li et al. (2017), "Learning a model of facial shape and expression from 4D scans." *ACM TOG (SIGGRAPH Asia)*.
2. DECA: Feng et al. (2021), "Learning an Animatable Detailed 3D Face Model from In-The-Wild Images." *ACM TOG (SIGGRAPH)*.
3. MediaPipe Face Mesh: https://developers.google.com/mediapipe/solutions/vision/face_landmarker
4. CUT: Park et al. (2020), "Contrastive Learning for Unpaired Image-to-Image Translation." *ECCV*.
5. IP-Adapter: Ye et al. (2023), "IP-Adapter: Text Compatible Image Prompt Adapter." https://arxiv.org/abs/2308.06721
6. ArcFace: Deng et al. (2019), "ArcFace: Additive Angular Margin Loss for Deep Face Recognition." *CVPR*.
7. BiSeNet: Yu et al. (2018), "Bilateral Segmentation Network for Real-time Semantic Segmentation." *ECCV*.
8. FLAME 2023 Open License: https://flame.is.tue.mpg.de/modellicense.html
9. FDA Botox Cosmetic Label: https://www.accessdata.fda.gov/drugsatfda_docs/label/2020/103000s5297lbl.pdf
10. Juvederm Product Portfolio: https://www.juvederm.com/

---

*Document prepared by SKINgenius Architect (Dermis).*
*Last updated: 2026-06-10*
*Next review: Upon completion of Phase 1 implementation.*
