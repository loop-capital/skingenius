# SKINgenius Synthetic Before/After Generation Notes

**Date:** auto-generated
**Model:** FLAME 2023 Open (5023 vertices, 9976 faces)

## Overview

This pipeline generates synthetic facial treatment pairs by deformin FLAME meshes and rendering them with matplotlib/trimesh.
No PyTorch3D is used.

## Treatments

### 1. Botox

- **Mechanism:** Reduces expression blendshape magnitudes.
- **Target PCs:**
  - PC 0: brow raise
  - PC 2: forehead wrinkle
  - PC 5: glabella frown
  - PC 60-64: crow's-feet proxy
- **Strength range:** 0.3 – 0.7 (1.0 = full suppression)

### 2. Fillers

- **Mechanism:** Amplifies identity shape parameters associated with facial volume.
- **Target PC ranges:**
  - Lips: 10–18, 20–25
  - Cheeks / midface: 35–45, 50–58
  - Jawline: 70–78, 80–88
- **Strength range:** 0.2 – 0.6

## Sample Summary

| Treatment | Sample | Max Δ (mm) | Mean Δ (mm) |
|-------------|--------|------------|-------------|
| botox | 1 | 1.976 | 0.248 |
| botox | 2 | 1.840 | 0.240 |
| fillers | 1 | 2.193 | 0.657 |
| fillers | 2 | 2.355 | 0.494 |

## Implementation Details

- **Shape params (β):** 300 identity PCs + 100 expression PCs.
- **Pose params (θ):** 5 joints × 3 axis-angle = 15; posedirs expect 36 (includes eye/neck correctives).
- **LBS:** Joint regression from `J_regressor`, rotation matrices via Rodrigues.
- **Renderer:** Matplotlib 3D scatter (point cloud) with synchronized axes and view angles.

## Known Limitations

1. Expression ↔ anatomical mapping is approximate (proxy PCs).
2. LBS implementation is lightweight; no smooth skinning weight optimization.
3. Rendering is stylised point-cloud; not photorealistic.
4. Filler effect is linear additive; real filler behavior is viscoelastic and non-linear.

## Next Steps

- [ ] Validate proxy PCs against FLAME expression semantic labels (if available).
- [ ] Integrate skin texture synthesis (GAN / diffusion) for photorealism.
- [ ] Add per-vertex wrinkle maps driven by expression magnitude.
