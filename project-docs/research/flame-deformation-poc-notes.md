# FLAME Treatment Deformation PoC — Research Notes

> **Project:** SKINgenius AI Skin Health Platform  
> **Component:** Dermis (3D Morphable Face Model for Treatment Simulation)  
> **Date:** 2026-06-10  
> **Author:** SKINgenius Architect (Dermis)

---

## 1. Objective

Build a lightweight Python proof-of-concept that demonstrates **treatment-specific deformation** on the FLAME 2023 Open morphable face model.  For this iteration we chose **Botox forehead** as the canonical example because it has a clear, localised anatomical effect (paralysis of the frontalis muscle reduces brow raise).

---

## 2. FLAME Model Overview

| Property | Value |
|----------|-------|
| File | `data/models/flame/flame2023_Open.pkl` |
| Vertices | 5,023 |
| Faces | 9,976 |
| Identity (shape) PCs | 300 (first 300 of 400) |
| Expression PCs | 100 (last 100 of 400) |
| Units | Metres |

The model is a linear PCA blendshape model.  The vertex displacement formula is:

```
v = v_template
    + Σ_i  β_i · identity_shapedir_i
    + Σ_j  θ_j · expr_shapedir_j
```

where `β ∈ ℝ³⁰⁰` controls identity and `θ ∈ ℝ¹⁰⁰` controls expression.

> **Important:** The `shapedirs` tensor is `(5023, 3, 400)`.  The **first 300** components are identity PCs, the **last 100** are expression PCs (confirmed by `supr_expression_metadata['n_expr'] == 100` and `expr_components == 'last_100'`).

---

## 3. Botox Forehead PoC Pipeline

### 3.1  Expression Parameter Selection
We synthesise a “maximum forehead raise” by positively weighting the **first 5 expression PCs**.  In PCA-based expression models, early components typically encode the largest-amplitude, most common expressions (e.g. surprise / brow raise).

```python
MAX_EXPR_PARAMS = [2.0, 1.5, 1.0, 0.8, 0.5] + [0.0] * 95
```

These weights are scaled to produce visually obvious brow elevation without producing unrecognisable distortion (~13 mm peak displacement).

### 3.2  Botox Effect Simulation
Botox temporarily paralyses the frontalis muscle, reducing the ability to raise the eyebrows.  In our linear model we simulate this as a **global suppression** of the same expression PCs:

```python
BOTOX_REDUCTION = 0.55   # ~45 % suppression
botox_theta = MAX_EXPR_PARAMS * BOTOX_REDUCTION
```

This is a coarse approximation; a future clinical-grade implementation would:
- Use a **muscle-actuation map** (frontalis → affected vertex weights).
- Apply **asymmetric, spatially varying** suppression rather than uniform scaling.
- Calibrate against real pre/post Botox 3D scans.

### 3.3  Forehead ROI
A simple geometric heuristic isolates the forehead / brow region:

- `y` above the 78th percentile (upper face)
- `z` near the anterior-most plane of the face (within 3 cm of the nose-tip z)
- `|x|` < 8 cm (midline, excluding ears)

Result: **57 vertices** out of 5,023 (~1.1 %).

---

## 4. Quantitative Results

| Metric | Before Botox | After Botox | Δ |
|--------|-------------|------------|---|
| Peak displacement (full face) | 12.99 mm | 7.15 mm | –44.9 % |
| Mean displacement (full face) | 1.583 mm | 0.871 mm | –45.0 % |
| Forehead-ROI mean displacement | 1.738 mm | 0.956 mm | –45.0 % |

The ~45 % reduction in both peak and mean displacement matches the `BOTOX_REDUCTION` parameter, confirming that the deformation is behaving as a linear scaling—exactly what we expect from a PCA blendshape model.

---

## 5. Visualisation Strategy

### 5.1  Four-State Grid (`botox_forehead_four_states.png`)
A single composite image (4 × 3) showing:

| Row | State | Description |
|-----|-------|-------------|
| 1 | **Neutral (rest)** | Template mesh, no expression activation |
| 2 | **Raised brows (before)** | Max expression, pre-treatment |
| 3 | **Botox rest** | Neutral again, but conceptually “post-treatment baseline” |
| 4 | **Botox raised** | Same expression attempt after suppression |

Columns: Left Profile, Frontal, Right Profile.

### 5.2  OBJ Exports
Four Wavefront OBJ files are exported for interactive inspection in MeshLab, Blender, or Trimesh viewer:
- `botox_neutral.obj`
- `botox_before_expression.obj`
- `botox_after_expression.obj`
- `botox_at_rest.obj`

### 5.3  Vertex Highlighting
Vertices displaced more than **0.75 mm** are coloured warm red-orange; the rest are neutral grey.  This makes the “frozen” effect visually obvious: the Botox row shows far fewer highlighted vertices than the Before row.

---

## 6. Implementation Notes

- **Environment:** Isolated Python 3.12 venv under `skingenius/venv/`.
- **Dependencies:** `numpy`, `scipy`, `matplotlib`, `trimesh` (installed), `pyvista` (installed, unused in this revision to avoid headless VTK quirks).
- **File Size:** The PoC script itself is **~270 lines**, well under the 300-line hard limit.  Helper functions are all ≤ 40 lines.
- **Matplotlib Limitations:** `plot_trisurf` does **not** support per-vertex colour.  For a richer visualisation we should switch to Trimesh + PyVista or Blender scripting in a future iteration.

---

## 7. Known Limitations & Next Steps

| # | Limitation | Proposed Fix |
|---|-----------|--------------|
| L1 | Uniform global suppression of expression PCs is not anatomically realistic. | Build a **frontalis muscle mask** using FLAME’s `J_regressor` / `weights` (LBS weights) and suppress only affected vertices. |
| L2 | No pose (jaw / neck / eye) parameters used. | Extend PoC to include subtle neck pose for a more natural “surprise” look. |
| L3 | Identity fixed to neutral (`β = 0`). | Sample random identities or use a user-specific scan fit. |
| L4 | Colouring is binary (>0.75 mm = red). | Use continuous heat-maps once we switch to a renderer that supports per-vertex colour (Trimesh/PyVista/Blender). |
| L5 | Forehead ROI heuristic is geometry-only. | Integrate with FLAME’s `landmarks` or UV texture mapping for anatomically informed ROI. |
| L6 | Static images only. | Export animated GIF / MP4 of expression interpolation before ↔ after. |

---

## 8. Anti-Patterns Logged

- **AP-FLAME-001:** `pickle.load(..., encoding='latin1')` is required because the `.pkl` was pickled in Python 2.
- **AP-FLAME-002:** `shapedirs` is a single `(V, 3, 400)` tensor, *not* separate identity/expression arrays.  The last 100 slices are expression; the first 300 are identity.  Mis-splitting causes silent garbage output.
- **AP-FLAME-003:** FLAME units are **metres**, not millimetres.  Thresholds and ROI bounds must be expressed accordingly (e.g. 0.75 mm → 0.00075 m).

---

## 9. Deliverables Checklist

| Deliverable | Path | Status |
|-------------|------|--------|
| PoC script | `tools/flame_deformation_poc.py` | ✅ |
| Composite visualisation | `data/visualizations/botox_forehead_four_states.png` | ✅ |
| OBJ exports (4) | `data/visualizations/botox_*.obj` | ✅ |
| Research notes | `project-docs/research/flame-deformation-poc-notes.md` | ✅ |

---

## 10. References

- Li, T., Bolkart, T., Black, M. J., Li, H., & Romero, J. (2017). *Learning a model of facial shape and expression from 4D scans.* ACM Transactions on Graphics (TOG).
- FLAME 2023 Open model release (ps.is.tuebingen.mpg.de).
- SUPR expression basis extension (n_expr = 100, gender = male).
