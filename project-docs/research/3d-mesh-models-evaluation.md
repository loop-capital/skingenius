# 3D Morphable Face Models Evaluation for Treatment Simulation

> **Research Date:** 2025-06-10  
> **Researcher:** SKINgenius Research (Sage)  
> **Scope:** Evaluate open-source 3D morphable face models for cosmetic treatment simulation (Botox, fillers, laser, etc.)  
> **Status:** Complete

---

## Executive Summary / Recommendation Table

| Model | Suitability for Treatment Simulation | Commercial Use | Input Requirements | Expression Handling | Integration Ease | Community Activity | Overall Score |
|-------|--------------------------------------|----------------|--------------------|---------------------|------------------|--------------------|---------------|
| **FLAME 2023 Open** | ⭐⭐⭐⭐⭐ **Best** | ✅ CC BY 4.0 | Single photo + 68 landmarks (optional) | Articulated jaw + 100 expression blendshapes | Python (PyTorch/TensorFlow), C++ | Very high | **9.5/10** |
| **INFERNO (EMICA)** | ⭐⭐⭐⭐⭐ **Best** (wrapper) | ⚠️ Non-commercial (research only) | Single photo | State-of-the-art expression capture | Python (PyTorch) | High | **9/10** |
| **DECA** | ⭐⭐⭐⭐☆ **Excellent** | ⚠️ Non-commercial (research only) | Single photo | Detailed expression + wrinkles | Python (PyTorch) | High | **8.5/10** |
| **EMOCA** | ⭐⭐⭐⭐☆ **Excellent** | ⚠️ Non-commercial (research only) | Single photo | Emotion-aware expression | Python (PyTorch) | Moderate (deprecated) | **8/10** |
| **MediaPipe Face Mesh** | ⭐⭐⭐⭐☆ **Excellent** (bridge) | ✅ Apache 2.0 | Single photo/video real-time | 468 3D landmarks, limited expression | Python, C++, JS, mobile | Extremely high | **8/10** |
| **eos (SFM/BFM)** | ⭐⭐⭐☆☆ **Good** | ⚠️ Non-commercial for BFM | Single photo + landmarks | 6 basic expressions (SFM) | C++ (header-only), Python | Moderate | **6/10** |
| **BFM 2017/2019** | ⭐⭐⭐☆☆ **Good** | 💰 €10K–40K | Single photo | PCA shape + expression | C++ / Python via eos | Low | **5/10** |

### Top Recommendation

For SKINgenius, the optimal approach is a **hybrid pipeline**:

1. **MediaPipe Face Mesh** for real-time landmark detection and lightweight preview (free, Apache 2.0)
2. **FLAME 2023 Open Model** for high-fidelity treatment deformation simulation (CC BY 4.0, commercially usable)
3. **DECA or EMOCA** for research/experimental features (if/when commercial licensing is secured)

This gives us a production-ready path that is legally clear while preserving the ability to upgrade quality later.

---

## 1. FLAME (Faces Learned with an Articulated Model and Expressions)

### Overview
FLAME is a lightweight and expressive generic head model learned from **over 33,000 accurately aligned 3D scans**. It combines a linear identity shape space (trained from 3,800 subjects) with an articulated jaw, neck, eyeballs, pose-dependent corrective blendshapes, and additional global expression blendshapes.

### Official Resources
- **Website:** https://flame.is.tue.mpg.de/
- **GitHub (Resources):** https://github.com/TimoBolkart/FLAME-Universe
- **PyTorch Implementation:** https://github.com/soubhiksanyal/FLAME_PyTorch
- **TensorFlow Implementation:** https://github.com/TimoBolkart/TF_FLAME
- **Fitting (Chumpy):** https://github.com/Rubikplayer/flame-fitting

### License — CRITICAL
FLAME has **dual licensing**:

1. **FLAME 2023 Open Model:** ✅ **CC BY 4.0** (commercially usable!)
   - Released November 2025
   - Allows commercial use with attribution
   - Must give credit, provide license link, indicate changes
   - Cannot be used for pornographic, fake/misleading, or defamatory content

2. **FLAME 2017–2020:** ❌ **Non-commercial academic only**
   - Single-user, non-transferable
   - Sole purpose: non-commercial scientific research, education, or artistic projects
   - Commercial licensing available via ps-license@tue.mpg.de

> **SKINgenius must use FLAME 2023 Open Model only.** Previous versions are legally unsuitable for commercial use.

### Input Requirements
- **Single photo** is sufficient for reconstruction frameworks (e.g., RingNet, DECA)
- Optional: **68 facial landmarks** for fitting
- Optional: **Multi-camera setup** for highest-quality registration
- Template mesh topology is fixed (standardized)

### Expression Handling
- **100 expression blendshapes** (FLAME 2020+)
- **Articulated jaw, neck, and eyeballs**
- **Pose-dependent corrective blendshapes**
- Expression parameters can be independently controlled
- **Ideal for treatment simulation:** can isolate and deform specific facial regions (e.g., lips for fillers, forehead for Botox)

### Community / Activity Level
- **Very high** — one of the most cited 3D face models
- Active ecosystem: DECA, EMOCA, INFERNO, MICA, SMPL-X, VOCA
- Regular updates (FLAME 2023 Open was released November 2025)
- Strong academic backing (MPI-IS)

### Integration
- **Python:** PyTorch (`FLAME_PyTorch`), TensorFlow (`TF_FLAME`)
- **C++:** Via SMPL-X or custom implementations
- **Blender:** Official Blender Add-on available
- **Dependencies:** PyTorch/TensorFlow, NumPy
- **Pre-trained models:** Available after registration

### Pros for SKINgenius
- ✅ **Commercially usable** (FLAME 2023 Open)
- ✅ Very expressive (better than BFM and FaceWarehouse)
- ✅ Disentangles identity, expression, and pose
- ✅ Large community and tooling ecosystem
- ✅ Region-specific deformation possible (critical for fillers/Botox)
- ✅ Compatible with DECA/EMOCA for detail capture

### Cons
- ⚠️ Must ensure using 2023 Open Model, not earlier versions
- ⚠️ Registration required for download
- ⚠️ Requires some ML/deep learning expertise

---

## 2. BFM (Basel Face Model)

### Overview
The Basel Face Model is one of the earliest and most widely used 3D morphable face models. BFM 2017 improved upon the 2009 version with better representation of facial diversity.

### Official Resources
- **BFM 2017:** https://faces.dmi.unibas.ch/bfm/bfm2017.html
- **BFM 2019:** https://faces.dmi.unibas.ch/bfm/bfm2019.html
- **Open-source pipeline:** https://github.com/unibas-gravis/basel-face-pipeline
- **Fitting library (eos):** https://github.com/patrikhuber/eos

### License — CRITICAL
- **❌ NOT free for commercial use**
- Research/academic license is free
- **Commercial licensing:** ~€10,000/year or €40,000 perpetual (as of 2021 reports)
- Contact: faces@dmi.unibas.ch
- The open-source pipeline is available, but the model data itself is restricted

### Input Requirements
- Single photo + landmarks (eos fitting)
- Multi-camera / 3D scan for building custom models
- 68 or more facial landmarks recommended

### Expression Handling
- PCA-based shape and expression space
- BFM itself is primarily **identity-focused**; expression typically requires external blendshapes (e.g., FaceWarehouse)
- BFM_to_FLAME converter exists to translate BFM to FLAME topology

### Community / Activity Level
- **Moderate** — historically very popular, but declining relative to FLAME
- eos library is maintained but not rapidly evolving
- BFM pipeline is open-source but the model data is restricted

### Integration
- **C++:** eos library (header-only, modern C++11/14)
- **Python:** Python bindings via eos (`pip install eos-py`)
- **Dependencies:** Eigen, OpenCV, Boost (for examples)

### Pros for SKINgenius
- ✅ Well-established, well-documented
- ✅ eos library is lightweight and easy to integrate
- ✅ Good for basic shape fitting

### Cons
- ❌ **Commercial licensing is expensive**
- ❌ Less expressive than FLAME for treatment simulation
- ❌ Expression handling requires external data
- ❌ Smaller community than FLAME
- ⚠️ BFM_to_FLAME converter exists — consider going directly to FLAME instead

---

## 3. MediaPipe Face Mesh

### Overview
MediaPipe Face Mesh is a real-time face geometry solution that estimates **468 3D face landmarks** (plus 10 iris landmarks) from a single camera input. It uses lightweight ML models and runs on mobile devices.

### Official Resources
- **Documentation:** https://developers.google.com/mediapipe/solutions/vision/face_landmarker
- **GitHub:** https://github.com/google-ai-edge/mediapipe
- **Wiki:** https://github.com/google-ai-edge/mediapipe/wiki/MediaPipe-Face-Mesh

### License
- ✅ **Apache 2.0** — fully free for commercial use
- No registration required
- Can be used in apps, services, research, and products

### Input Requirements
- **Single photo or video frame**
- No depth sensor required
- Works on mobile, desktop, and web
- Real-time performance on modern devices

### Expression Handling
- **468 3D landmarks** cover the full facial surface
- Landmark positions shift with expressions, but **no explicit blendshape parameters**
- Z-coordinate is relative/weak-perspective scaled
- **Not a true morphable model** — it's a landmark detector
- Can bridge to FLAME via landmark correspondences

### Community / Activity Level
- **Extremely high** — maintained by Google
- Widely used in AR, filters, and mobile apps
- Active development and regular updates
- Cross-platform (iOS, Android, web, Python, C++)

### Integration
- **Python:** `mediapipe` package (`pip install mediapipe`)
- **C++:** Native MediaPipe framework
- **JavaScript:** MediaPipe Tasks Vision
- **Mobile:** iOS and Android SDKs
- **No heavy dependencies** — self-contained

### Pros for SKINgenius
- ✅ **Fully free and open (Apache 2.0)**
- ✅ Real-time performance
- ✅ Easy to integrate across platforms
- ✅ Can serve as landmark input for FLAME fitting
- ✅ Ideal for mobile/web deployment
- ✅ No registration or model downloads needed

### Cons
- ⚠️ **Not a true 3D morphable model** — no explicit shape/expression parameters
- ⚠️ Cannot directly simulate tissue deformation (fillers, Botox)
- ⚠️ Landmark-based deformation is less physically accurate than FLAME
- ⚠️ For treatment simulation, needs to be paired with a deformation model

### Recommended Usage
MediaPipe is best used as:
1. **A bridge:** Detect landmarks → feed into FLAME fitting
2. **A fallback:** Real-time preview on devices where FLAME is too heavy
3. **A companion:** Quick landmark detection while FLAME runs in background

---

## 4. DECA (Detailed Expression Capture and Animation)

### Overview
DECA reconstructs a 3D head model with **detailed facial geometry** from a single image. It can animate faces with realistic wrinkle deformations.

### Official Resources
- **GitHub:** https://github.com/yfeng95/DECA (redirects from YadiraF)
- **Project page:** https://deca.is.tue.mpg.de/
- **Paper:** SIGGRAPH 2021

### License
- ❌ **Non-commercial scientific research only**
- Same restrictions as FLAME (academic model license)
- Commercial licensing via MPI-IS

### Input Requirements
- Single photo
- Optional: face alignment preprocessing

### Expression Handling
- **Detailed expression capture** with wrinkles
- **Animatable** — can transfer expressions between subjects
- Uses FLAME as the underlying model
- Adds **detail displacements** for skin-level geometry

### Community / Activity Level
- **High** — widely cited, strong results
- No longer the SOTA (superseded by EMOCA/INFERNO)
- But still very capable and stable

### Integration
- **Python** (PyTorch)
- Dependencies: PyTorch, PyTorch3D, OpenCV, face-alignment

### Pros for SKINgenius
- ✅ Very high-quality reconstructions
- ✅ Wrinkle-level detail (good for aging/texture simulation)
- ✅ Built on FLAME (compatible)

### Cons
- ❌ Non-commercial license
- ⚠️ Superseded by EMOCA/INFERNO
- ⚠️ Slightly heavier compute than base FLAME

---

## 5. EMOCA (Emotion-Driven Monocular Face Capture and Animation)

### Overview
EMOCA reconstructs a 3D face with **emotion-aware expression detail** from a single in-the-wild image. Sets the standard for reconstructing highly emotional images.

### Official Resources
- **GitHub:** https://github.com/radekd91/emoca
- **Project page:** https://emoca.is.tue.mpg.de/
- **Paper:** CVPR 2022

### License
- ❌ **Non-commercial scientific research only**
- Same MPI-IS academic license

### Input Requirements
- Single photo
- v2 improved with MediaPipe landmarks for better lips/eyes

### Expression Handling
- **Emotion-driven reconstruction**
- Better lip and eye alignment than DECA (v2)
- Uses perceptual lip-reading loss
- Still animatable like DECA

### Community / Activity Level
- **Moderate** — EMOCA is now **deprecated**
- Developers recommend **INFERNO FaceReconstruction** instead
- EMOCA v2 available but no longer actively maintained

### Integration
- **Python** (PyTorch, PyTorch Lightning)
- More complex setup than DECA (conda environment, tricky PyTorch3D install)

### Pros for SKINgenius
- ✅ Better emotional expression capture than DECA
- ✅ Good for showing "before/after" emotional responses

### Cons
- ❌ Non-commercial license
- ❌ Deprecated — use INFERNO instead
- ⚠️ More complex installation

---

## 6. INFERNO (Face Reconstruction Library)

### Overview
INFERNO is a **library of tools and applications** for deep-learning-based in-the-wild face reconstruction, animation, and accompanying tasks. It contains EMICA — a combination of DECA, EMOCA, SPECTRE, and MICA.

### Official Resources
- **GitHub:** https://github.com/radekd91/inferno
- **Discord community:** https://discord.gg/3sJSPSVgSm

### License
- ❌ **Non-commercial scientific research only**
- Same MPI-IS academic license

### Input Requirements
- Single photo or video
- FaceReconstruction module produces excellent results

### Expression Handling
- **State-of-the-art** — combines best of DECA + EMOCA + SPECTRE + MICA
- Can reconstruct from images and videos
- Supports speech-driven animation (EMOTE)

### Community / Activity Level
- **High** — actively maintained
- Discord community for support
- Docker installation available

### Integration
- **Python** (PyTorch, PyTorch Lightning, Hydra)
- Docker support
- Modular design

### Pros for SKINgenius
- ✅ Best current face reconstruction quality
- ✅ Modular — can use only FaceReconstruction
- ✅ Active development and community

### Cons
- ❌ Non-commercial license
- ⚠️ Complex setup (conda, PyTorch3D, CUDA)

---

## 7. Other Models Worth Mentioning

### eos / Surrey Face Model (SFM)
- **Repository:** https://github.com/patrikhuber/eos
- **License:** Apache 2.0 (code), non-commercial (model)
- Lightweight C++ header-only library
- Includes a low-res shape-only SFM (3,448 vertices)
- 6 expression blendshapes (anger, disgust, fear, happiness, sadness, surprise)
- Good for **basic fitting** but not rich enough for treatment simulation

### FaceWarehouse
- **Dataset:** 3D facial expression database (150 subjects × 20 expressions)
- **License:** Research only
- Often used as expression basis for BFM
- Less expressive than FLAME

### 3DDFA-V2 / FaceBoxes
- Real-time 3D face alignment
- Lightweight but lower quality than FLAME/DECA
- Good for mobile real-time applications

### SMPL-X
- Full body + face + hands model
- Uses FLAME for the face component
- Overkill if only face is needed, but useful if full-body avatar is desired later

---

## Comparison Matrix

| Criterion | FLAME 2023 | BFM 2017 | MediaPipe | DECA | EMOCA | INFERNO | eos/SFM |
|-----------|------------|----------|-----------|------|-------|---------|---------|
| **Commercial License** | ✅ CC BY 4.0 | 💰 Paid | ✅ Apache 2.0 | ❌ Academic | ❌ Academic | ❌ Academic | ⚠️ Non-commercial |
| **Single Photo Input** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Expression Parameters** | ✅ 100 blendshapes | ⚠️ Limited | ❌ Landmarks only | ✅ Detailed | ✅ Emotion | ✅ SOTA | ⚠️ 6 basic |
| **Region-Specific Deform** | ✅ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| **Treatment Simulation** | ✅ Excellent | ⚠️ Fair | ❌ Needs pairing | ✅ Excellent | ✅ Excellent | ✅ Excellent | ❌ Poor |
| **Real-Time** | ⚠️ No | ✅ Yes | ✅ Yes | ⚠️ No | ⚠️ No | ⚠️ No | ✅ Yes |
| **Mobile Ready** | ❌ No | ⚠️ Heavy | ✅ Yes | ❌ No | ❌ No | ❌ No | ⚠️ Maybe |
| **Community** | Very High | Moderate | Extremely High | High | Moderate | High | Moderate |
| **Python Support** | ✅ PyTorch/TF | ⚠️ eos | ✅ | ✅ PyTorch | ✅ PyTorch | ✅ PyTorch | ✅/C++ |
| **C++ Support** | ✅ Via SMPL-X | ✅ eos | ✅ | ❌ | ❌ | ❌ | ✅ Native |

---

## Architecture Recommendation for SKINgenius

### Phase 1: MVP (Immediate)
1. **MediaPipe Face Mesh** for real-time landmark detection
2. **Simple landmark deformation** for treatment preview (e.g., lip fullness, brow position)
3. **2D warp/overlay** for quick visual feedback

**Why:** Fastest to implement, fully free, runs on mobile

### Phase 2: Production (3–6 months)
1. **FLAME 2023 Open Model** for true 3D morphable simulation
2. **MediaPipe landmarks** as input to FLAME fitting
3. **Region-specific blendshape deformation** for Botox (forehead), fillers (lips/cheeks), etc.
4. **Render to 2D** with texture mapping for user preview

**Why:** Physically accurate deformation, commercially clear, scientifically grounded

### Phase 3: Premium (6–12 months)
1. **INFERNO/DECA** for detail-level reconstruction (wrinkles, skin texture)
2. **Commercial licensing** from MPI-IS if needed
3. **4D animation** — show expressions before/after

**Why:** Highest quality, but requires commercial licensing negotiation

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| **License violation** | Use only FLAME 2023 Open + MediaPipe. Never use pre-2023 FLAME or BFM in production. |
| **Compute cost** | Run FLAME inference server-side; MediaPipe runs client-side for real-time preview. |
| **Accuracy** | Validate deformation against dermatologist feedback. Use clinical photos for ground truth. |
| **User expectation** | Clearly label simulations as "illustrative only, not a guarantee of results." |
| **Data privacy** | Process images server-side with encryption; never store raw facial scans without consent. |

---

## References

1. Li et al. (2017). "Learning a model of facial shape and expression from 4D scans." *ACM TOG (SIGGRAPH Asia)*.
2. Feng et al. (2021). "Learning an Animatable Detailed 3D Face Model from In-The-Wild Images." *ACM TOG (SIGGRAPH)*.
3. Danecek et al. (2022). "EMOCA: Emotion Driven Monocular Face Capture and Animation." *CVPR*.
4. Gerig et al. (2018). "Morphable Face Models — An Open Framework." *CVPR Workshops*.
5. Cao et al. (2014). "FaceWarehouse: A 3D Facial Expression Database for Visual Computing." *IEEE TVCG*.
6. Huber et al. (2016). "A Multiresolution 3D Morphable Face Model and Fitting Framework." *VISAPP*.
7. FLAME Model License: https://flame.is.tue.mpg.de/modellicense.html
8. MediaPipe Face Mesh: https://developers.google.com/mediapipe/solutions/vision/face_landmarker

---

*Report prepared by SKINgenius Research (Sage) on 2025-06-10. For questions, contact the research team.*
