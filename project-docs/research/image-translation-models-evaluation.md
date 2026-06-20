# Image-to-Image Translation Models for Treatment Simulation

## Research Report — SKINgenius AI Skin Health Platform

**Date:** 2026-06-10  
**Author:** Sage (SKINgenius Research)  
**Scope:** Evaluate architectures for simulating "after treatment" facial results (Botox smoothing, filler volume, laser resurfacing) from user selfie scans.  
**Deliverable:** Architecture recommendation for a hybrid pipeline combining 3D mesh deformation + neural rendering.

---

## 1. Executive Summary

| Model | Paired/Unpaired | Photorealism | Identity Preservation | Training Data Needs | Mobile Inference | Best Fit |
|-------|-----------------|--------------|----------------------|---------------------|------------------|----------|
| **pix2pixHD** | Paired | High | Good | Large (1,000–10,000 pairs) | ❌ Server only | Controlled clinical pairs |
| **CUT** | Unpaired | Moderate–High | Good (with λ_ID) | Moderate (100s per domain) | ⚠️ Borderline | Best for unpaired data |
| **SimGAN** | Synthetic → Real | Moderate | Excellent | Small real set + large synthetic | ✅ Fast | Synthetic pre-training |
| **NeRF / 3DGS** | Multi-view | Very High | Native (geometry) | Dense views / video | ⚠️ 3DGS improving | 3D-aware preview |
| **StyleGAN3 + Inversion** | Latent walk | Very High | Excellent | Pre-trained only | ❌ Server | Attribute editing |
| **InstructPix2Pix** | Text-guided | High | Variable | Pre-trained + fine-tuning | ⚠️ Diffusion cost | Rapid prototyping |
| **DiT + CLIP** | Paired | High | Good | Moderate | ❌ | Research direction |

**Recommended Hybrid Pipeline:**

```
User Selfie
    ↓
3D Face Reconstruction (DECA / FLAME)
    ↓
Physics-Based Deformation (Botox = muscle relaxation; Filler = volume addition)
    ↓
Neural Texture Transfer (CUT or Diffusion-based)
    ↓
Photorealistic "After" Render
```

---

## 2. Detailed Evaluation

### 2.1 pix2pixHD (NVIDIA, 2018)

**Paper:** Wang et al., *"High-Resolution Image Synthesis and Semantic Manipulation with Conditional GANs"* (CVPR 2018)  
**GitHub:** [NVIDIA/pix2pixHD](https://github.com/NVIDIA/pix2pixHD) (BSD-3-Clause)

#### Architecture Overview
- **Generator:** Coarse-to-fine two-stage GAN. Global generator (1024×512) + local enhancer (up to 2048×1024).
- **Discriminator:** Multi-scale (3 scales) PatchGAN to capture both fine texture and global structure.
- **Key innovation:** Instance map input for object-aware feature normalization, enabling separate control of object identity and style.

#### SKINgenius Relevance
- **Use case fit:** ⭐⭐⭐ Good for paired before/after clinical photography. Works well when facial pose, lighting, and expression are controlled.
- **Training data:** Requires **strictly paired** images. Minimum ~1,000–2,000 aligned pairs for acceptable quality; 5,000+ for clinical-grade realism.
- **Photorealism:** State-of-the-art for paired translation at high resolution (up to 2K). Proven on face label→photo synthesis.
- **Identity preservation:** Moderate. The L1 reconstruction loss helps, but there is no explicit identity constraint. Faces can drift.
- **Inference:** ~200–500ms on V100 for 1024px images. Not feasible on mobile.
- **Conditioning:** Supports semantic maps as additional conditioning, which could encode treatment zones.

#### Limitations for Our Use Case
- **Paired data is expensive:** Collecting aligned before/after photos with identical pose, lighting, and expression is extremely difficult in clinical practice.
- **No 3D awareness:** Cannot model volumetric changes (filler) or muscle relaxation (Botox) physically.
- **Mode collapse risk:** With small datasets, outputs become homogeneous.

#### Verdict
Use only if we can secure a large paired dataset (>5,000 clinical before/after pairs with controlled conditions). Not recommended as primary architecture.

---

### 2.2 CUT — Contrastive Unpaired Translation (ECCV 2020)

**Paper:** Park et al., *"Contrastive Learning for Unpaired Image-to-Image Translation"*  
**GitHub:** [taesungp/contrastive-unpaired-translation](https://github.com/taesungp/contrastive-unpaired-translation) (MIT License)

#### Architecture Overview
- Replaces cycle-consistency loss with **patch-level contrastive learning** (InfoNCE).
- Aligns corresponding patches between input and output without requiring paired data.
- Includes optional **identity loss** (`lambda_NCE=1` with identity preservation).

#### SKINgenius Relevance
- **Use case fit:** ⭐⭐⭐⭐ Excellent. We do NOT have perfectly paired data. CUT is designed for unpaired domains.
- **Training data:** Requires only **unpaired** images from two domains (before-treatment faces vs. after-treatment faces). Minimum 200–500 images per domain; 1,000+ preferred.
- **Photorealism:** High. Often competitive with pix2pixHD despite no paired supervision.
- **Identity preservation:** Configurable via `lambda_identity`. With identity loss enabled, facial structure is well preserved while style/texture changes.
- **Inference:** Similar to pix2pixHD (~100–300ms on GPU). Not mobile-native but could be quantized.
- **Conditioning:** Original CUT does not support explicit conditioning. Extensions (e.g., DCLGAN) add treatment-type control.

#### Key Advantage for SKINgenius
We can collect **unpaired** datasets:
- Domain A: Photos of people before any treatment (from public datasets + our user base).
- Domain B: Photos of people after treatment (from clinical partners, consented).

No need for the same person at the same angle—CUT learns the statistical transformation.

#### Verdict
**Strong candidate** for our primary 2D translation backbone, especially if paired data is unavailable.

---

### 2.3 SimGAN — Simulated + Unsupervised Learning (CVPR 2017)

**Paper:** Shrivastava et al., *"Learning from Simulated and Unsupervised Images through Adversarial Training"*  
**GitHub:** [apple/ml-simgan](https://github.com/apple/ml-simgan) (Apple, no official PyTorch)

#### Architecture Overview
- **Refiner network:** Takes synthetic images and adds realism (texture, lighting, noise) while preserving annotations.
- **Self-regularization loss:** L1 penalty between input synthetic and refined output to prevent drift.
- **Local adversarial loss:** Discriminator evaluates patches, not full images, to avoid overfitting to small datasets.

#### SKINgenius Relevance
- **Use case fit:** ⭐⭐⭐⭐ Ideal for our **synthetic → real** pipeline.
- **Training data:** Small unlabeled real set (hundreds) + large synthetic set (unlimited from FLAME renderings).
- **Photorealism:** Moderate. SimGAN excels at texture realism (skin pores, sensor noise) but does not handle large structural changes.
- **Identity preservation:** Excellent by design—the self-regularization term forces the output to stay close to the synthetic input.
- **Inference:** Very fast (single forward pass, ~10–50ms).
- **License:** Apple Research code; academic-friendly but verify for commercial use.

#### How We Would Use It
1. Generate **synthetic before/after pairs** using FLAME mesh deformations (see §5).
2. Use SimGAN to refine synthetic renders into photorealistic images.
3. Fine-tune CUT or diffusion model on the refined dataset.

#### Verdict
**Essential component** of our hybrid pipeline for bridging the synthetic-to-real gap.

---

### 2.4 NeRF / 3D Gaussian Splatting (3DGS)

**Papers:**
- Mildenhall et al., *"NeRF: Representing Scenes as Neural Radiance Fields"* (ECCV 2020)
- Kerbl et al., *"3D Gaussian Splatting for Real-Time Radiance Field Rendering"* (SIGGRAPH 2023)
- Wu et al., *"4D Gaussian Splatting for Real-Time Dynamic Scene Rendering"* (CVPR 2024)

**GitHub:**
- [nerfstudio-project/nerfstudio](https://github.com/nerfstudio-project/nerfstudio) (Apache-2.0)
- [graphdeco-inria/gaussian-splatting](https://github.com/graphdeco-inria/gaussian-splatting) (custom research license)

#### Architecture Overview
- **NeRF:** Represents scene as continuous MLP mapping (x,y,z,θ,φ) → (RGB, density). Slow training and inference.
- **3DGS:** Represents scene as millions of anisotropic 3D Gaussians with tile-based rasterizer. **100× faster** than NeRF, comparable quality.
- **Dynamic variants:** Deformation fields (4DGS) or per-Gaussian motion modeling for facial expressions.

#### SKINgenius Relevance
- **Use case fit:** ⭐⭐⭐⭐⭐ Unique for **3D-aware treatment preview**. Users could rotate the simulated result.
- **Training data:** Requires multi-view capture (video orbit or 12+ static photos). Our mobile scan flow already captures this.
- **Photorealism:** Very high. 3DGS renders at 1080p with photorealistic skin texture.
- **Identity preservation:** Native—identity is encoded in the 3D geometry and appearance, not learned.
- **Inference speed:**
  - Desktop GPU: 100–300 FPS (real-time).
  - **Mobile-GS** (ICLR 2026): Real-time on Snapdragon 8 Gen 3 via quantization and sorting optimization.
  - Current mobile: ~5–15 FPS with aggressive compression (FlashGS, CVPR 2025).
- **Conditioning:** Deformation fields can be conditioned on treatment parameters (volume, zone).

#### Limitations
- **Not a direct image translator:** Requires multi-view input. Cannot edit a single selfie.
- **Computational cost:** Still heavy for low-end devices; requires cloud rendering for now.
- **Dynamic face modeling:** 4DGS for expression changes is cutting-edge; robustness unproven at scale.

#### Verdict
**Best for premium feature**: A 3D preview that users can rotate. Pair with 2D neural translation for the primary quick-result view.

---

### 2.5 StyleGAN3 + Inversion-Based Editing

**Paper:** Karras et al., *"Alias-Free GAN"* (NeurIPS 2021)  
**GitHub:** [NVlabs/stylegan3](https://github.com/NVlabs/stylegan3) (NVIDIA Source Code License)

#### Architecture Overview
- StyleGAN3 solves the texture-sticking problem of StyleGAN2, enabling meaningful latent space interpolation.
- **Inversion:** Project real face into W+ latent space using e4e, pSp, or ReStyle.
- **Editing:** Apply precomputed direction vectors (InterfaceGAN, GANSep, StyleSpace) for attributes like "age", "smile", "wrinkles".

#### SKINgenius Relevance
- **Use case fit:** ⭐⭐⭐ Good for attribute-based editing ("reduce wrinkles" ≈ Botox).
- **Training data:** None required if using pre-trained FFHQ model (70,000 faces).
- **Photorealism:** Exceptional. FFHQ-trained StyleGAN3 generates indistinguishable-from-real faces at 1024px.
- **Identity preservation:** Excellent when using e4e encoder + small latent shift.
- **Inference:** ~50–200ms on GPU for inversion + edit + synthesis. Not mobile.
- **Conditioning:** Pre-defined attribute directions. No direct "Botox" or "filler" direction exists; would need custom discovery.

#### Limitations
- **Latent directions are entangled:** "Reduce wrinkles" may also change age expression or skin tone.
- **No explicit treatment simulation:** The model does not understand anatomy or physics.
- **License restriction:** NVIDIA Source Code License—non-commercial research only without separate agreement.

#### Verdict
Use as a **baseline** or for generating synthetic training data. Not suitable as primary production pipeline due to license and controllability constraints.

---

### 2.6 Diffusion-Based Approaches (2024–2026)

#### 2.6.1 InstructPix2Pix
- **Paper:** Brooks et al., *"Learning to Follow Image Editing Instructions"* (2022)
- **Key idea:** Fine-tune Stable Diffusion to accept image + text instruction → edited image.
- **Pros:** No paired data needed; natural language control ("smooth forehead wrinkles").
- **Cons:** Identity preservation is **variable**; often changes face shape or ethnicity. Requires DDIM sampling (~1–3 seconds).
- **License:** Stable Diffusion Open RAIL-M (commercial use allowed with restrictions).

#### 2.6.2 IP-Adapter / IP-FaceDiff
- **Paper:** Ye et al., *"IP-Adapter: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models"* (2023); IP-FaceDiff (2025).
- **Key idea:** Inject face identity embedding into diffusion cross-attention layers.
- **Pros:** Strong identity preservation when combined with ControlNet (pose + structure control).
- **Cons:** Inference is slow (~2–5 seconds). Fine-tuning required for treatment-specific styles.
- **Use case:** Could condition on treatment type text prompt + user face image + segmentation mask.

#### 2.6.3 DiT + CLIP Conditioning (2025)
- **Paper:** Zhu et al., *"Image-to-Image Translation with Diffusion Transformers and CLIP-Based Image Conditioning"* (CVIDL 2025).
- **Key idea:** Uses Diffusion Transformers (DiT) with CLIP image embeddings instead of text.
- **Pros:** Global coherence; no paired text descriptions needed.
- **Cons:** Very new; limited community support. Not yet proven for faces.

#### 2.6.4 ReF-LDM (NeurIPS 2024)
- **Paper:** Hsiao et al., *"ReF-LDM: A Latent Diffusion Model for Reference-based Face Image Restoration"*
- **Key idea:** Reference image conditioning with CacheKV mechanism; timestep-scaled identity loss.
- **Relevance:** Could be adapted for treatment simulation by using "after" reference images as style targets.

#### Diffusion Verdict
Diffusion models are **rapidly overtaking GANs** for image editing. For SKINgenius:
- **Short-term:** Use IP-Adapter + ControlNet for high-quality, identity-preserving treatment previews (cloud inference).
- **Long-term:** Fine-tune a latent diffusion model on our clinical dataset with treatment-type text conditioning.

---

## 3. Key Questions Answered

### 3.1 Can We Pre-train on Synthetic FLAME Deformations Then Fine-tune on Real Photos?

**Yes — this is the recommended path.**

| Step | Method | Output |
|------|--------|--------|
| 1. Synthetic generation | FLAME model + physics-based deformations | 10,000+ synthetic before/after pairs |
| 2. Realism refinement | SimGAN or diffusion refinement | Photorealistic synthetic dataset |
| 3. Domain adaptation | CUT (unpaired) or pix2pixHD (if paired) | Learned real-world transformation |
| 4. Fine-tuning | Fine-tune on small real clinical set (100–500 pairs) | Production model |

**Rationale:** FLAME provides anatomically correct deformations for Botox (muscle relaxation) and filler (volume addition). SimGAN bridges the domain gap. This overcomes the primary barrier—lack of large paired clinical datasets.

### 3.2 How Do We Preserve User Identity While Applying Treatment Effects?

| Technique | Implementation | Strength |
|-----------|---------------|----------|
| **3D reconstruction + deformation** | DECA/FLAME fit → deform mesh | Identity is inherent to geometry |
| **Identity loss (L_ID)** | Face recognition embedding (ArcFace, CosFace) | Pixel-space constraint |
| **Latent space preservation** | StyleGAN W+ space small shift | Only subtle attribute changes |
| **Reference image conditioning** | IP-Adapter, ReF-LDM CacheKV | Strong identity from reference |
| **Segmentation masking** | Face parsing (BiSeNet) to isolate treatment zones | Prevents background/untouched region drift |

**Recommended stack:** DECA reconstruction + facial segmentation mask + IP-Adapter identity conditioning + ControlNet pose guidance.

### 3.3 Can We Condition the Model on Treatment Type + Zone?

| Model | Conditioning Mechanism |
|-------|----------------------|
| pix2pixHD | Semantic label map (encode zone + treatment as classes) |
| CUT | Limited. Requires extension (e.g., FUNIT, StarGAN v2) |
| Diffusion (ControlNet) | Text prompt ("Botox on forehead") + segmentation mask |
| 3DGS + deformation | Anatomical parameters (muscle activation, volume delta) |

**Recommended:** For maximum controllability, use **3D anatomical parameters** as primary conditioning (treatment type determines which muscles/volumes to modify), then use diffusion for texture-level changes (smoothing, redness, etc.).

### 3.4 What Is the Minimum Viable Training Dataset Size?

| Architecture | Paired | Unpaired | Notes |
|------------|--------|----------|-------|
| pix2pixHD | 2,000–5,000 | N/A | Quality degrades significantly below 1,000 pairs |
| CUT | N/A | 500–1,000 per domain | Identity loss helps with small data |
| SimGAN | N/A | 100–500 real + unlimited synthetic | Synthetic data compensates |
| StyleGAN3 fine-tuning | N/A | 1,000–5,000 | Transfer learning from FFHQ |
| Diffusion fine-tuning | 500–2,000 | 2,000–5,000 | LoRA adapters reduce needs to ~500 |

**SKINgenius MVP Estimate:**
- **Synthetic pre-training:** 10,000 FLAME-generated pairs (free).
- **SimGAN refinement:** 200 unlabeled real patient photos.
- **Final fine-tuning:** 500 paired before/after clinical photos (consented, anonymized).
- **Total real data needed:** ~500–700 images.

This is achievable through partnerships with medspas and dermatology clinics.

---

## 4. Competitive Landscape

| Product / Research | Approach | Limitations |
|-------------------|----------|-------------|
| **PlasticGAN** (2022) | Holistic GAN for post-surgery faces | Academic; limited to common surgeries; not commercialized |
| **MWM Botox Simulator** (2026) | Unknown; appears to be template-based | "Real time on your own photo"—unclear if true neural translation |
| **EntityMD AI Simulator** (Memphis Plastic Surgery, 2024) | Unknown proprietary | Single-provider deployment |
| **AI-Enhanced Facial Filler Simulation** (PubMed 2025) | Pre-procedural 3D imaging | Requires structured light/3D scan hardware |
| **DreamMakeup** (2025) | Latent diffusion for makeup transfer | Makeup only, not structural changes |

**SKINgenius opportunity:** No commercial product combines **anatomically accurate 3D deformation** with **neural texture translation** for consumer mobile use. Our hybrid approach is defensible IP.

---

## 5. Recommended Hybrid Pipeline

### 5.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER SELFIE INPUT                          │
│                   (Single photo or video scan)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STAGE 1: 3D FACE RECONSTRUCTION                    │
│  • DECA / EMOCA → FLAME mesh + texture + camera parameters      │
│  • Segmentation: BiSeNet face parsing (19 zones)               │
│  • Identity embedding: ArcFace / CosFace (512-dim)            │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   PATH A: 2D PREVIEW    │     │   PATH B: 3D PREVIEW        │
│   (Fast, default)       │     │   (Premium, rotatable)      │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│ STAGE 2A: DEFORMATION   │     │ STAGE 2B: 3D DEFORMATION    │
│ • Anatomical parameter  │     │ • FLAME shape/blendshapes    │
│   map per treatment:    │     │   modified per treatment    │
│   - Botox: muscle       │     │   type and zone             │
│     activation ↓        │     │ • Render to 12+ views       │
│   - Filler: volume ↑    │     │   for 3DGS reconstruction   │
│   - Laser: texture σ    │     │                             │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│ STAGE 3A: NEURAL        │     │ STAGE 3B: 3D GAUSSIAN       │
│   TRANSLATION           │     │   SPLATTING                 │
│ • Identity-preserving   │     │ • Train 3DGS from deformed │
│   image translation:    │     │   multi-view renders         │
│   - Primary: IP-Adapter │     │ • Real-time viewer (web/    │
│     + ControlNet        │     │   mobile)                    │
│   - Fallback: CUT       │     │                              │
│     (if paired data     │     │                              │
│     scarce)             │     │                              │
│ • Conditioning:         │     │                              │
│   text prompt +         │     │                              │
│   segmentation mask     │     │                              │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OUTPUT: "AFTER" SIMULATION                   │
│  • Photorealistic 2D image (Path A, <2s)                       │
│  • Interactive 3D model (Path B, real-time)                     │
│  • Treatment parameters stored for reproducibility             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

| Component | Technology | License | Status |
|-----------|-----------|---------|--------|
| 3D Face Reconstruction | DECA (FLAME-based) | Academic Free | ✅ Mature |
| Face Segmentation | BiSeNet / FaceParse | MIT / Apache-2.0 | ✅ Mature |
| Identity Encoding | ArcFace (insightface) | MIT | ✅ Mature |
| 2D Translation (primary) | IP-Adapter + ControlNet + SD 1.5/SDXL | Open RAIL-M | ✅ Mature |
| 2D Translation (fallback) | CUT / FastCUT | MIT | ✅ Mature |
| Synthetic Refinement | SimGAN-style refiner | Custom | ⚠️ Needs implementation |
| 3D Rendering | 3D Gaussian Splatting | Custom research | ⚠️ Mobile-GS emerging |
| Mobile Inference | CoreML (iOS) / ONNX Runtime (Android) | Apache-2.0 | ✅ Available |

### 5.3 Training Data Strategy

| Phase | Data Source | Volume | Cost |
|-------|------------|--------|------|
| Phase 0: Synthetic base | FLAME deformations + rendering | 10,000 pairs | Free (compute only) |
| Phase 1: Realism bridge | SimGAN on 200 unlabeled clinic photos | 200 real + 10K synthetic | Low |
| Phase 2: Translation learn | CUT on unpaired before/after sets | 1,000 per domain | Medium |
| Phase 3: Fine-tuning | Paired clinical before/after (consented) | 500–1,000 pairs | High (partnerships) |
| Phase 4: Diffusion adapt | LoRA fine-tune SD with IP-Adapter | 500 pairs | Medium |

### 5.4 Identity Preservation Guarantee

1. **Geometric anchor:** FLAME mesh ensures structural identity is never lost.
2. **Texture anchor:** IP-Adapter FaceID embedding forces output to match user's facial texture distribution.
3. **Pose anchor:** ControlNet OpenPose/depth conditioning prevents head angle changes.
4. **Zone isolation:** Segmentation mask ensures only treatment zones are modified.
5. **Quality gate:** Face verification API (ArcFace cosine similarity > 0.75) rejects outputs that drift too far.

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Insufficient real paired data | Medium | High | Synthetic pre-training + SimGAN + CUT unpaired learning |
| Identity drift in diffusion outputs | Medium | Critical | Multi-anchor pipeline + face verification gate |
| Mobile inference too slow | Medium | High | Cloud rendering for 2D; 3D preview optional/premium |
| Regulatory (medical device claim) | Low | Critical | Clear disclaimer: "Simulation only, not medical advice" |
| License incompatibility (StyleGAN3) | Low | Medium | Avoid StyleGAN3 in production; use SD + IP-Adapter |
| Synthetic data domain gap | Medium | Medium | Progressive fine-tuning: synthetic → refined → real |

---

## 7. Implementation Roadmap

### Phase 1: Proof of Concept (Weeks 1–4)
- [ ] Implement FLAME deformation for Botox (forehead wrinkles) and filler (cheek volume).
- [ ] Generate 1,000 synthetic before/after pairs.
- [ ] Train CUT on unpaired synthetic→synthetic-refined data.
- [ ] Evaluate identity preservation with ArcFace similarity.

### Phase 2: Real Data Integration (Weeks 5–8)
- [ ] Collect 200 unlabeled real patient photos (consent obtained).
- [ ] Train SimGAN-style refiner.
- [ ] Fine-tune CUT on real unpaired data.
- [ ] Build segmentation mask pipeline.

### Phase 3: Diffusion Upgrade (Weeks 9–12)
- [ ] Fine-tune SD 1.5 + IP-Adapter + ControlNet with 500 paired clinical images.
- [ ] Implement text conditioning for treatment types.
- [ ] A/B test: CUT vs. Diffusion for photorealism and identity preservation.

### Phase 4: 3D Preview (Weeks 13–16)
- [ ] Integrate DECA → FLAME → 3DGS pipeline.
- [ ] Deploy 3D viewer for web (Three.js + GaussianSplatting3D).
- [ ] Mobile optimization via Mobile-GS or cloud streaming.

---

## 8. References

1. Wang et al. (2018). *High-Resolution Image Synthesis and Semantic Manipulation with Conditional GANs*. CVPR. https://github.com/NVIDIA/pix2pixHD
2. Park et al. (2020). *Contrastive Learning for Unpaired Image-to-Image Translation*. ECCV. https://github.com/taesungp/contrastive-unpaired-translation
3. Shrivastava et al. (2017). *Learning from Simulated and Unsupervised Images through Adversarial Training*. CVPR. https://arxiv.org/abs/1612.07828
4. Mildenhall et al. (2020). *NeRF: Representing Scenes as Neural Radiance Fields*. ECCV.
5. Kerbl et al. (2023). *3D Gaussian Splatting for Real-Time Radiance Field Rendering*. SIGGRAPH.
6. Wu et al. (2024). *4D Gaussian Splatting for Real-Time Dynamic Scene Rendering*. CVPR.
7. Karras et al. (2021). *Alias-Free Generative Adversarial Networks*. NeurIPS.
8. Brooks et al. (2022). *InstructPix2Pix: Learning to Follow Image Editing Instructions*. https://arxiv.org/abs/2211.09800
9. Zhu et al. (2025). *Image-to-Image Translation with Diffusion Transformers and CLIP-Based Image Conditioning*. CVIDL. https://arxiv.org/abs/2505.16001
10. Hsiao et al. (2024). *ReF-LDM: A Latent Diffusion Model for Reference-based Face Image Restoration*. NeurIPS. https://github.com/ChiWeiHsiao/ref-ldm
11. Ye et al. (2023). *IP-Adapter: Text Compatible Image Prompt Adapter*. https://arxiv.org/abs/2308.06721
12. Mobile-GS (2026). *Real-time Gaussian Splatting for Mobile Devices*. ICLR. https://arxiv.org/abs/2603.11531
13. PlasticGAN (2022). *Holistic GAN on Face Plastic and Aesthetic Surgery*. Multimedia Tools and Applications.
14. AI-Enhanced Facial Filler Simulation (2025). PubMed. https://pubmed.ncbi.nlm.nih.gov/40681302/

---

## 9. Appendix: Quick Reference Table

| Need | Recommended Model | Runner-up |
|------|------------------|-----------|
| Unpaired data, fast training | **CUT** | CycleGAN |
| Paired data, highest 2D quality | **pix2pixHD** | Diffusion (DiT+CLIP) |
| Synthetic → real bridge | **SimGAN** | Diffusion refinement |
| 3D-aware preview | **3D Gaussian Splatting** | NeRF (too slow) |
| Text-conditioned editing | **InstructPix2Pix** | IP-Adapter + ControlNet |
| Identity preservation | **IP-Adapter FaceID** | ArcFace loss in CUT |
| Mobile inference | **Mobile-GS (3D)** / CoreML quantized | Cloud API fallback |
| No real data at all | **FLAME + SimGAN** | Pure StyleGAN latent walk |

---

*Report generated by SKINgenius Research (Sage). For questions or to discuss implementation details, contact the AI/Vision team (Lens).*