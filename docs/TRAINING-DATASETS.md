# Training Datasets for SKINgenius MiMo Model

**Document Version:** 1.0  
**Date:** 2026-05-21  
**Author:** Sage (SKINgenius Research Agent)  
**Status:** Research Complete

---

## Executive Summary

This document catalogs public dermatology datasets suitable for fine-tuning the MiMo skin analysis model. We prioritize datasets with permissive licenses for commercial AI training, diverse skin tone representation, and clinical image formats (not just dermoscopic).

**Key Finding:** Most high-quality dermatology datasets are **CC-BY-NC (Non-Commercial)** licensed, which poses licensing constraints for commercial AI products. The **Fitzpatrick 17k** dataset is **CC-BY-NC-SA**, meaning commercial use is prohibited without explicit permission. **ISIC Archive** datasets are mostly **CC-0** (public domain) for the raw images but **CC-BY-NC** for the aggregated challenge datasets.

**Critical Gap:** No dataset includes condition severity grading beyond binary present/absent labels.

**Recommended Priority:**
1. **ISIC Archive** (2016-2020 challenges) — largest volume, CC-0 for raw images
2. **HAM10000** — 7-condition multi-class labels, well-curated
3. **Fitzpatrick 17k** — skin tone diversity (but NC license)
4. **DermNet NZ** — broad condition coverage (web scraping required)

---

## 1. Fitzpatrick 17k Dataset

### Overview
- **Name:** Fitzpatrick 17k
- **Type:** Clinical images with Fitzpatrick skin type labels
- **Source:** Dermatology atlases (DermaAmin + Atlas Dermatologico)
- **Key Feature:** Explicit Fitzpatrick skin type annotations (critical for fairness/robustness)

### Download Information
- **Primary Source:** https://github.com/mattgroh/fitzpatrick17k
- **Annotations CSV:** https://raw.githubusercontent.com/mattgroh/fitzpatrick17k/main/fitzpatrick17k.csv
- **Image Access:** Images must be downloaded from original URLs (some links are broken)
- **Alternative:** Fill out Google Form at https://forms.gle/4fS35Kg8x9pkG2Bn9 to request direct image download link
- **Size:** 16,577 clinical images

### License & Terms
- **License:** CC-BY-NC-SA 3.0 (Creative Commons Attribution-NonCommercial-ShareAlike)
- **Commercial Use:** ❌ **NOT PERMITTED** without explicit permission
- **Requirements:** Attribution, non-commercial use only, share-alike
- **Action Required:** Contact authors for commercial licensing if needed

### Data Format
- **Images:** JPEG format, clinical (non-dermoscopic) photos
- **Labels:** Fitzpatrick skin type (1-6) + condition labels
- **Metadata:** CSV file with columns: image filename, Fitzpatrick type, condition, source URL
- **Conditions:** 114 skin conditions (53-653 images per condition)

### Size and Structure
- **Total Images:** 16,577
- **Conditions:** 114 unique skin conditions
- **Fitzpatrick Distribution:**
  - Type I-II (light): ~47% (~7,790 images)
  - Type III-IV (medium): ~33% (~5,470 images)
  - Type V-VI (dark): ~13% (~2,155 images)
  - **Severe imbalance** toward lighter skin tones

### Skin Tone Diversity
- **Explicit Labels:** Yes, Fitzpatrick 1-6 scale
- **Known Bias:** Heavily skewed toward lighter skin tones (47% vs 13%)
- **Geographic Bias:** Sources are primarily from Western dermatology atlases
- **Impact:** Model may underperform on darker skin tones without augmentation or rebalancing

### Known Quality Issues
- **Broken URLs:** Some original image links are dead
- **Annotation Subjectivity:** Fitzpatrick labeling is subjective; inter-rater reliability varies
- **Source Quality:** Images come from various atlases with inconsistent quality
- **Age/Gender:** Unknown distribution; likely skewed toward adult patients
- **Condition Coverage:** Some conditions have very few samples (< 100)

### Preprocessing Recommendations
1. **Download Strategy:** Use the Google Form to get the complete image archive (avoids broken links)
2. **Skin Tone Augmentation:** Apply color jittering, brightness/contrast adjustments to darker skin samples
3. **Rebalancing:** Use weighted sampling or SMOTE for underrepresented Fitzpatrick types
4. **Quality Filtering:** Remove blurry or low-resolution images
5. **Standardization:** Resize to 224x224 or 299x299 (Inception/ResNet input sizes)

---

## 2. ISIC Archive (International Skin Imaging Collaboration)

### Overview
- **Name:** ISIC Archive / ISIC Challenge Datasets
- **Type:** Dermoscopic images (specialized dermatoscope cameras)
- **Source:** Multiple hospitals and institutions worldwide
- **Key Feature:** Largest public repository of skin lesion images

### Download Information
- **Official Website:** https://challenge.isic-archive.com/data/
- **Direct Downloads (S3):**
  - **2016:** https://isic-archive.s3.amazonaws.com/challenges/2016/
  - **2017:** https://isic-archive.s3.amazonaws.com/challenges/2017/
  - **2018:** https://isic-archive.s3.amazonaws.com/challenges/2018/
  - **2019:** https://isic-archive.s3.amazonaws.com/challenges/2019/
  - **2020:** https://isic-archive.s3.amazonaws.com/challenges/2020/
  - **2024 (SLICE-3D):** https://isic-archive.s3.amazonaws.com/challenges/2024/
- **API Access:** https://isic-archive.com/api/v1
- **No registration required** for download

### License & Terms
- **2016 Datasets:** CC-0 (Public Domain) ✅
- **2017 Datasets:** CC-0 (Public Domain) ✅
- **2018 Challenge:** CC-BY-NC 4.0 (Non-Commercial) ⚠️
- **2019 Challenge:** CC-BY-NC 4.0 (Non-Commercial) ⚠️
- **2020 Challenge:** CC-BY-NC 4.0 (Non-Commercial) ⚠️
- **Raw ISIC Archive:** CC-0 (individual images)

**Critical Note:** The aggregated challenge datasets (2018-2020) are CC-BY-NC, but the **raw individual images** in the ISIC gallery are CC-0. For commercial use, download images directly from the ISIC gallery API rather than the challenge bundles.

### Data Format
- **Images:** JPEG format, dermoscopic (specialized camera)
- **Labels:** Varies by challenge:
  - 2016: Binary segmentation masks + malignant/benign labels
  - 2017: 3-class classification (melanoma, nevus, seborrheic keratosis)
  - 2018: 7-class classification + segmentation + attribute detection
  - 2019: 8-class classification
  - 2020: Multi-class + patient metadata
- **Metadata:** CSV/JSON with patient demographics, lesion location, diagnosis

### Size and Structure
| Challenge | Training Images | Classes | License |
|-----------|----------------|---------|---------|
| 2016 | 900 + 807 | Segmentation + binary | CC-0 ✅ |
| 2017 | 2,000 | 3-class | CC-0 ✅ |
| 2018 | 10,015 (Task 3) | 7-class | CC-BY-NC ⚠️ |
| 2019 | 25,331 | 8-class | CC-BY-NC ⚠️ |
| 2020 | 33,126 | Multi-class | CC-BY-NC ⚠️ |
| 2024 | 401,059 | SLICE-3D | TBD |

**Total (all years):** ~470,000+ images

### Skin Tone Diversity
- **Explicit Labels:** No Fitzpatrick labels in ISIC datasets
- **Inferred Diversity:** Moderate (images from multiple countries: USA, Spain, Austria, Australia, Greece)
- **Known Bias:** Still skewed toward lighter skin tones; dermoscopy is less used on darker skin
- **Geographic Distribution:** Western-centric, with some Australian and European diversity

### Known Quality Issues
- **Dermoscopic Domain:** All images are dermoscopic — **MAJOR DOMAIN SHIFT** for smartphone photos
- **Class Imbalance:** Heavily skewed toward melanocytic lesions (nevi/melanomas)
- **Duplicate Images:** Some duplicate lesions across years (2020 provides duplicate list)
- **Image Quality:** Varies by source institution and camera equipment
- **Metadata Gaps:** Age/sex/location missing for some images

### Preprocessing Recommendations
1. **Domain Adaptation:** Apply dermoscopic-to-clinical style transfer (CycleGAN) or use clinical photo datasets for fine-tuning
2. **Color Calibration:** Dermoscopic images use polarized light — adjust brightness/contrast to match smartphone photos
3. **Lesion Segmentation:** Use provided masks to crop lesions and remove black backgrounds
4. **Class Rebalancing:** Use weighted loss functions or oversampling for rare classes
5. **Multi-Resolution Training:** Train on multiple scales (224, 299, 384, 512)

---

## 3. HAM10000 Dataset

### Overview
- **Name:** HAM10000 (Human Against Machine with 10000 training images)
- **Type:** Dermoscopic images with 7-condition multi-class labels
- **Source:** Medical University of Vienna (Austria) + Cliff Rosendahl (Australia)
- **Key Feature:** Well-curated, multi-source, 7-class balanced labels

### Download Information
- **Official Publication:** https://doi.org/10.1038/sdata.2018.161
- **Dataverse:** https://doi.org/10.7910/DVN/DBW86T
- **ISIC Archive:** Integrated into ISIC 2018 Task 3
- **Kaggle Mirror:** https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
- **Size:** ~3.2GB (10,015 images)

### License & Terms
- **License:** CC-BY-NC 4.0 (Creative Commons Attribution-NonCommercial)
- **Commercial Use:** ❌ **NOT PERMITTED** without explicit permission
- **Citation Required:** Tschandl, P., Rosendahl, C. & Kittler, H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Sci. Data 5, 180161 (2018).

### Data Format
- **Images:** JPEG format, 600x450px, dermoscopic
- **Labels:** 7 classes (see below)
- **Metadata:** CSV with lesion ID, image path, diagnosis, age, sex, location
- **Ground Truth Types:**
  - Histopathology (excised lesions)
  - Confocal microscopy (some benign keratoses)
  - Follow-up (unchanged nevi over 1.5 years)
  - Consensus (expert agreement)

### Size and Structure
- **Total Images:** 10,015
- **Classes:** 7 diagnostic categories

| Class | Description | Count | % |
|-------|-------------|-------|---|
| AKIEC | Actinic keratosis / Bowen's disease | 327 | 3.3% |
| BCC | Basal cell carcinoma | 514 | 5.1% |
| BKL | Benign keratosis (solar lentigo, seborrheic keratosis, etc.) | 1,099 | 11.0% |
| DF | Dermatofibroma | 115 | 1.1% |
| MEL | Melanoma | 1,113 | 11.1% |
| NV | Melanocytic nevus | 6,705 | 67.0% |
| VASC | Vascular lesion (angioma, etc.) | 142 | 1.4% |

**Severe class imbalance:** Nevus (NV) dominates at 67%

### Skin Tone Diversity
- **Explicit Labels:** No Fitzpatrick labels
- **Source Diversity:** Austrian (European, lighter skin) + Australian (high sun damage, varied)
- **Known Bias:** European-centric; limited dark skin representation
- **Sun Damage:** Australian subset has high chronic sun damage (solar lentigines)

### Known Quality Issues
- **Class Imbalance:** 67% nevi vs 1.1% dermatofibroma
- **Dermoscopic Domain:** Same domain shift issue as ISIC
- **Multiple Images Per Lesion:** Some lesions have multiple photos (different magnifications)
- **Quality Variation:** Mix of modern digital, scanned slides, and MoleMax system images
- **Metadata:** Age/sex/location available but incomplete

### Preprocessing Recommendations
1. **Class Rebalancing:** Use stratified sampling or weighted loss
2. **Duplicate Removal:** Use lesion ID to avoid data leakage
3. **Multi-Image Handling:** For lesions with multiple images, use all or select best quality
4. **Quality Filtering:** Remove low-resolution or poorly cropped images
5. **Augmentation:** Heavy augmentation needed for rare classes (AKIEC, DF, VASC)

---

## 4. DermNet NZ

### Overview
- **Name:** DermNet NZ Image Library
- **Type:** Clinical (non-dermoscopic) images of skin conditions
- **Source:** DermNet New Zealand Trust (dermatology education resource)
- **Key Feature:** Broad condition coverage (2,300+ categories), clinical photos

### Download Information
- **Website:** https://dermnetnz.org/images
- **Image Library:** https://dermnetnz.org/image-library/
- **No direct download** — requires web scraping
- **Terms:** https://dermnetnz.org/terms
- **Size:** 2,300+ condition categories, 10,000+ total images (estimated)

### License & Terms
- **License:** Custom — Educational use permitted with attribution
- **Commercial Use:** ⚠️ **UNCLEAR** — Terms state "non-commercial educational use"
- **Direct Quote:** "Images may be used for non-commercial educational purposes with attribution to DermNet"
- **Action Required:** Contact DermNet NZ for explicit commercial licensing
- **Contact:** info@dermnetnz.org

### Data Format
- **Images:** JPEG format, clinical photos (smartphone/camera quality)
- **Labels:** Condition name (2,300+ categories)
- **Metadata:** Condition description, patient demographics (incomplete)
- **Organization:** Hierarchical category structure

### Size and Structure
- **Categories:** 2,300+ skin conditions
- **Images per Category:** 1-50+ (highly variable)
- **Total Images:** ~10,000-15,000 (estimated)
- **Coverage:** Comprehensive — includes rare conditions not in other datasets

### Skin Tone Diversity
- **Explicit Labels:** No Fitzpatrick labels
- **Visual Diversity:** Moderate — includes some images of darker skin
- **Known Bias:** New Zealand-centric; predominantly lighter skin tones
- **Geographic Limitation:** Reflects NZ dermatology practice patterns

### Known Quality Issues
- **Inconsistent Quality:** Mix of professional and amateur photos
- **Varying Resolution:** No standardization
- **Metadata Gaps:** Limited patient demographics
- **Copyright Uncertainty:** Some images may be contributed by external dermatologists
- **Scraping Complexity:** Requires custom web scraping pipeline

### Preprocessing Recommendations
1. **Web Scraping:** Use respectful scraping (rate limiting, ~1 request/second)
2. **Image Filtering:** Remove watermarked or low-resolution images
3. **Category Consolidation:** Map 2,300 categories to SKINgenius taxonomy (~100 conditions)
4. **Quality Control:** Manual review of scraped images
5. **Deduplication:** Check for duplicate images across categories

---

## 5. Additional Public Dermatology Datasets

### 5.1 Skin Cancer MNIST (HAM10000 Kaggle Format)
- **Source:** https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
- **Format:** HAM10000 reorganized as MNIST-style dataset
- **License:** Same as HAM10000 (CC-BY-NC)
- **Use:** Convenient for quick prototyping

### 5.2 ISIC 2024 SLICE-3D Dataset
- **Source:** https://isic-archive.s3.amazonaws.com/challenges/2024/
- **Size:** 401,059 images
- **Type:** 3D total body photography (TBP) crops
- **License:** TBD (check before use)
- **Note:** Very large, may be overkill for initial training

### 5.3 UCI Skin Segmentation Dataset
- **Source:** https://archive.ics.uci.edu/dataset/229/skin+segmentation
- **Size:** 245,057 pixel-level samples (not images)
- **Use:** Skin vs. non-skin pixel classification
- **License:** UCI ML Repository (academic use)
- **Note:** Not suitable for condition classification

### 5.4 PH2 Dataset
- **Source:** http://www.fc.up.pt/addi/
- **Size:** 200 images
- **Classes:** Melanoma vs. nevus
- **License:** Academic use
- **Note:** Too small for deep learning, good for benchmarking

### 5.5 SCIN Dataset (Skin Condition Image Network)
- **Source:** Searched but not found as public download
- **Note:** May be proprietary or unpublished

### 5.6 Diverse Dermatology Images (DDI)
- **Source:** Not found in public repositories
- **Note:** May be part of Fitzpatrick 17k or separate research dataset

### 5.7 Stanford Skin Disease Dataset
- **Source:** Not publicly available (proprietary)
- **Note:** Requires institutional access

### 5.8 MED-NODE Dataset
- **Source:** http://www.cs.rug.nl/~imaging/datasets/
- **Size:** 170 melanoma + 80 nevus images
- **License:** Academic use
- **Note:** Very small, limited to melanoma/nevus

---

## 6. Data Augmentation Strategies for Domain Shift

### Problem: Dermoscopic → Smartphone Domain Shift
Dermoscopic images use polarized light and specialized cameras, creating a significant domain gap from smartphone photos. Models trained on dermoscopic images often fail on clinical photos.

### Recommended Augmentation Pipeline

#### 6.1 Color Space Augmentations
```python
# Simulate different lighting conditions
transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1)

# Simulate different skin tones
transforms.RandomAdjustSharpness(sharpness_factor=0.5, p=0.3)

# Add noise to simulate smartphone sensor
transforms.GaussianNoise(std=0.01)
```

#### 6.2 Geometric Augmentations
```python
transforms.RandomResizedCrop(224, scale=(0.8, 1.0))
transforms.RandomHorizontalFlip(p=0.5)
transforms.RandomRotation(degrees=15)
transforms.RandomAffine(degrees=0, translate=(0.1, 0.1))
```

#### 6.3 Domain-Specific Augmentations
```python
# Simulate smartphone photo artifacts
# - Add slight blur (out-of-focus)
# - Add compression artifacts (JPEG quality reduction)
# - Add glare/overexposure patches
# - Simulate different distances/zoom levels
```

#### 6.4 Style Transfer (Advanced)
- Use CycleGAN or similar to convert dermoscopic → clinical style
- Train on paired dermoscopic/clinical images if available
- Alternatively, use clinical-only datasets (Fitzpatrick 17k, DermNet) for fine-tuning

#### 6.5 Mixup/CutMix
```python
# Combine images for better generalization
# Mixup: Blend two images with alpha blending
# CutMix: Cut and paste patches between images
```

### Recommended Augmentation Order
1. Resize to target resolution (e.g., 299x299)
2. Random crop with scale jitter
3. Color jitter (brightness, contrast, saturation)
4. Random horizontal flip
5. Gaussian noise (light)
6. Random rotation (small angles)
7. Normalize with ImageNet statistics

---

## 7. Group-Aware Sampling Strategies for Skin Tone Balance

### Problem: Skin Tone Imbalance
Most datasets are skewed toward lighter skin tones (Fitzpatrick I-III), leading to poor performance on darker skin (Fitzpatrick IV-VI).

### 7.1 Stratified Sampling
```python
# Ensure each batch has proportional representation
# Example: 16.7% each Fitzpatrick type (1-6) per batch
from sklearn.model_selection import StratifiedShuffleSplit

sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2)
for train_idx, val_idx in sss.split(X, y_fitzpatrick):
    # Each split maintains Fitzpatrick proportions
```

### 7.2 Oversampling Minority Groups
```python
# Duplicate or synthesize samples for underrepresented types
from imblearn.over_sampling import SMOTE

# SMOTE for image data (requires feature extraction first)
# Or simple random oversampling
```

### 7.3 Weighted Loss Functions
```python
# Penalize misclassification of minority groups more
class_weights = {
    'fitz_1': 1.0,
    'fitz_2': 1.0,
    'fitz_3': 1.2,
    'fitz_4': 1.5,
    'fitz_5': 2.0,
    'fitz_6': 2.5
}

criterion = nn.CrossEntropyLoss(weight=class_weights)
```

### 7.4 Group-Specific Batch Normalization
```python
# Use separate batch norm statistics per skin tone group
# Improves feature learning for each group
```

### 7.5 Data Augmentation for Darker Skin
```python
# Augment darker skin images more aggressively
# - Increase brightness/contrast
# - Simulate different lighting conditions
# - Add color constancy adjustments
```

### 7.6 Adversarial Debiasing
```python
# Train model to be invariant to skin tone
# Add adversarial loss to prevent skin tone prediction
```

---

## 8. Severity Grading Assessment

### Finding: No Public Dataset Includes Severity Grading
After extensive research, **none** of the public dermatology datasets include condition severity grading beyond binary present/absent labels.

### What We Found:
| Dataset | Severity Labels | Notes |
|---------|----------------|-------|
| Fitzpatrick 17k | ❌ No | Binary condition labels only |
| ISIC Archive | ❌ No | Binary/diagnostic labels only |
| HAM10000 | ❌ No | 7 diagnostic classes only |
| DermNet NZ | ❌ No | Binary category labels |
| PH2 | ❌ No | Melanoma/nevus only |

### Implications for SKINgenius:
1. **Cannot train severity classifier** directly on public data
2. **Alternative approaches:**
   - Use lesion size/asymmetry/color variation as severity proxies
   - Partner with dermatologists to annotate severity on subset
   - Use clinical guidelines (e.g., EADV, AAD) to infer severity from condition type
   - Consider severity as post-processing rule-based system

### Recommended Severity Proxy Features:
- Lesion size relative to image
- Color variation (number of colors)
- Border irregularity
- Presence of ulceration/crusting
- Patient symptoms (if available)

---

## 9. Prioritized Acquisition Plan

### Phase 1: Immediate (Week 1-2)
**Goal:** Download and organize largest CC-0 datasets

1. **ISIC 2016 + 2017** (CC-0)
   - ~2,900 images
   - Segmentation + 3-class labels
   - **Action:** Download directly from S3 URLs
   - **Time:** 1-2 days

2. **ISIC Raw Archive** (CC-0)
   - ~13,000+ individual images
   - Use API to download gallery images
   - **Action:** Write API scraper
   - **Time:** 3-5 days

### Phase 2: Short-term (Week 3-4)
**Goal:** Add multi-class datasets with NC licensing considerations

3. **HAM10000** (CC-BY-NC)
   - 10,015 images, 7 classes
   - **Action:** Download from Dataverse
   - **Time:** 2-3 days
   - **Risk:** NC license for commercial use

4. **ISIC 2018-2020** (CC-BY-NC)
   - ~68,000 images
   - **Action:** Download challenge datasets
   - **Time:** 3-5 days
   - **Risk:** NC license for commercial use

### Phase 3: Medium-term (Month 2)
**Goal:** Add clinical photo datasets for domain diversity

5. **Fitzpatrick 17k** (CC-BY-NC-SA)
   - 16,577 clinical images
   - **Action:** Fill Google Form for image access
   - **Time:** 1-2 weeks (includes approval)
   - **Risk:** NC-SA license; broken URLs

6. **DermNet NZ** (Custom terms)
   - 10,000+ clinical images
   - **Action:** Web scraping pipeline + contact for licensing
   - **Time:** 2-3 weeks
   - **Risk:** Legal uncertainty, scraping complexity

### Phase 4: Long-term (Month 3+)
**Goal:** Augment with additional sources

7. **ISIC 2024 SLICE-3D**
   - 401,059 images (very large)
   - **Action:** Evaluate if needed
   - **Time:** 1-2 weeks

8. **Partner with dermatology clinics**
   - Collect proprietary smartphone photos
   - **Action:** Legal agreements, IRB approval
   - **Time:** 3-6 months
   - **Benefit:** Clinical quality, proper licensing

---

## 10. Licensing Risk Matrix

| Dataset | License | Commercial Use | Risk Level | Mitigation |
|---------|---------|---------------|------------|------------|
| ISIC 2016-2017 | CC-0 | ✅ Yes | 🟢 Low | None needed |
| ISIC Raw Archive | CC-0 | ✅ Yes | 🟢 Low | None needed |
| ISIC 2018-2020 | CC-BY-NC | ❌ No | 🔴 High | Contact ISIC for commercial license |
| HAM10000 | CC-BY-NC | ❌ No | 🔴 High | Contact authors for commercial license |
| Fitzpatrick 17k | CC-BY-NC-SA | ❌ No | 🔴 High | Contact authors for commercial license |
| DermNet NZ | Custom | ⚠️ Unclear | 🟡 Medium | Contact DermNet for explicit permission |

### Recommended Legal Actions:
1. **Contact ISIC** (isic-archive@upenn.edu) for commercial licensing
2. **Contact HAM10000 authors** (philipp.tschandl@meduniwien.ac.at) for commercial use
3. **Contact Fitzpatrick 17k authors** (mgroh@mit.edu) for commercial use
4. **Contact DermNet NZ** (info@dermnetnz.org) for commercial scraping permission

---

## 11. Data Preprocessing Pipeline Recommendations

### Standard Pipeline for All Datasets:
```
1. Download → 2. Deduplicate → 3. Quality Filter → 4. Resize → 5. Normalize → 6. Augment → 7. Split
```

### Dataset-Specific Steps:

**ISIC Archive:**
- Remove black backgrounds using segmentation masks
- Crop to lesion bounding box
- Apply dermoscopic-to-clinical style transfer (if available)

**HAM10000:**
- Group by lesion ID to prevent data leakage
- Stratify by class (heavy imbalance)
- Use only highest quality image per lesion

**Fitzpatrick 17k:**
- Download complete archive via Google Form
- Verify image integrity (some URLs broken)
- Stratify by Fitzpatrick type

**DermNet NZ:**
- Respectful scraping (1 req/sec)
- Remove watermarked images
- Map categories to SKINgenius taxonomy

### Recommended Image Specifications:
- **Resolution:** 299x299 (Inception) or 224x224 (ResNet)
- **Format:** JPEG, quality 90+
- **Color Space:** RGB (standard)
- **Normalization:** ImageNet statistics (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

---

## 12. Summary and Next Steps

### Key Findings:
1. **CC-0 Data:** ~15,000 images available for unrestricted commercial use (ISIC 2016-2017 + raw archive)
2. **NC-Licensed Data:** ~120,000 images available with restrictions (ISIC 2018-2020, HAM10000, Fitzpatrick 17k)
3. **Clinical Photos:** Fitzpatrick 17k and DermNet NZ are the main sources of non-dermoscopic images
4. **Severity Grading:** No public dataset includes severity labels — requires custom annotation or proxy features
5. **Skin Tone Bias:** All datasets skew toward lighter skin — requires active rebalancing

### Immediate Actions Required:
- [ ] Download ISIC 2016-2017 (CC-0) — 1 day
- [ ] Write ISIC API scraper for raw archive — 3 days
- [ ] Contact ISIC for commercial licensing — 1 week
- [ ] Contact HAM10000 authors for commercial licensing — 1 week
- [ ] Contact Fitzpatrick 17k authors for commercial licensing — 1 week
- [ ] Set up web scraping pipeline for DermNet NZ — 2 weeks
- [ ] Implement group-aware sampling pipeline — 1 week
- [ ] Design severity proxy feature extraction — 2 weeks

### Estimated Total Training Data (Post-Acquisition):
- **CC-0 (unrestricted):** ~15,000 images
- **NC-licensed (restricted):** ~120,000 images
- **Clinical photos:** ~26,000 images (Fitzpatrick 17k + DermNet NZ)
- **Dermoscopic:** ~109,000 images (ISIC + HAM10000)
- **Total:** ~135,000+ unique images

### Final Recommendation:
Start with CC-0 data for initial model development, then negotiate commercial licenses for NC datasets. Prioritize clinical photo datasets (Fitzpatrick 17k, DermNet NZ) to minimize domain shift. Implement aggressive augmentation and group-aware sampling from day one.

---

## References

1. Groh, M., et al. (2021). Evaluating deep neural networks trained on clinical images in dermatology with the Fitzpatrick 17k dataset. CVPR 2021.
2. Tschandl, P., Rosendahl, C. & Kittler, H. (2018). The HAM10000 dataset. Scientific Data 5, 180161.
3. Codella, N., et al. (2018). Skin Lesion Analysis Toward Melanoma Detection 2018. MICCAI.
4. ISIC Archive. https://www.isic-archive.com/
5. DermNet NZ. https://dermnetnz.org/

---

*Document compiled by Sage (SKINgenius Research Agent) on 2026-05-21. For questions or updates, contact the SKINgenius ML team.*
