# SKINgenius CUT Model Training Data Pipeline

## Overview
This document describes the complete data processing pipeline for preparing training data for the CUT (Contrastive Unsupervised Translation) model in the SKINgenius platform. The pipeline transforms raw clinical photos from FDA and PMC sources, along with synthetic FLAME-generated pairs, into a standardized format suitable for training.

## Pipeline Components

### 1. Data Quality Scanner (`tools/data_quality_scan.py`)
**Purpose:** Validates raw image data and identifies quality issues.

**Functionality:**
- Scans all images in `data/raw/fda/` and `data/raw/pmc/`
- Checks for corrupted files, wrong formats, too small (< 64x64), too large (> 4K)
- Validates manifest entries match actual files
- Reports: total images, per-treatment counts, quality issues
- Outputs clean manifest to `data/processed/manifest_clean.csv`

**Output:**
- `data/processed/manifest_clean.csv` - Cleaned manifest with validated images
- `data/processed/quality_report.json` - Detailed quality report

### 2. Image Normalizer (`tools/image_normalizer.py`)
**Purpose:** Standardizes images to CUT model requirements.

**Functionality:**
- Reads clean manifest from `data/processed/manifest_clean.csv`
- Resizes all images to 256x256 (CUT standard)
- Normalizes pixel values to [-1, 1] range
- Converts to RGB (removes alpha channel if present)
- Saves to `data/processed/normalized/[treatment_type]/[before|after]/`

**Output:**
- Normalized images in `data/processed/normalized/` directory structure
- `data/processed/normalization_stats.json` - Processing statistics

### 3. Pair Matcher (`tools/pair_matcher.py`)
**Purpose:** Creates before/after image pairs for domain translation learning.

**Functionality:**
- Reads normalized images and their metadata from clean manifest
- Matches before/after images by product and patient (where metadata allows)
- For unpaired images, creates pseudo-pairs by treatment type
- Organizes into domain A (before) and domain B (after)
- Outputs to `data/processed/paired/[treatment_type]/[A|B]/`

**Output:**
- Paired images in `data/processed/paired/domain_A/` and `data/processed/paired/domain_B/`
- `data/processed/pairing_info.json` - Detailed pairing information
- `data/processed/pairing_stats.json` - Pairing statistics

### 4. Synthetic Data Integrator (`tools/synthetic_integrator.py`)
**Purpose:** Integrates synthetic FLAME-generated data with real clinical data.

**Functionality:**
- Reads synthetic pairs from `data/synthetic/`
- Normalizes to same format as real data (256x256, RGB, [-1, 1] range)
- Integrates into training pipeline with appropriate weighting (20% synthetic)
- Outputs to `data/processed/synthetic/[treatment_type]/[A|B]/`

**Output:**
- Synthetic images in `data/processed/synthetic/` directory structure
- `data/processed/manifest_synthetic.csv` - Synthetic data manifest
- `data/processed/synthetic_stats.json` - Integration statistics

## Directory Structure After Processing

```
data/processed/
├── manifest_clean.csv              # Clean manifest of validated real images
├── manifest_synthetic.csv          # Manifest of synthetic images
├── quality_report.json             # Data quality scan results
├── normalization_stats.json        # Image normalization statistics
├── pairing_info.json               # Pair matching details
├── pairing_stats.json              # Pair matching statistics
├── synthetic_stats.json            # Synthetic integration statistics
├── normalized/                     # Normalized real images
│   ├── [treatment_type]/
│   │   ├── before/
│   │   │   └── [image]_normalized.png
│   │   └── after/
│   │       └── [image]_normalized.png
├── paired/                         # Paired images for CUT training
│   ├── domain_A/                   # Before images (domain A)
│   │   ├── [treatment_type]/
│   │   │   ├── [treatment]_A_00000.png
│   │   │   └── ...
│   └── domain_B/                   # After images (domain B)
│       ├── [treatment_type]/
│       │   ├── [treatment]_B_00000.png
│       │   └── ...
└── synthetic/                      # Integrated synthetic data
    ├── [treatment_type]/
    │   ├── domain_A/               # Synthetic before/main images
    │   │   └── [treatment]_synthetic_A_[index].png
    │   └── domain_B/               # Synthetic after/view images
    │       └── [treatment]_synthetic_B_[index].png
```

## Data Statistics (from pipeline run)

### Raw Data Sources:
- **FDA clinical photos:** 135 images
- **PMC open-access photos:** 157 images  
- **Synthetic FLAME pairs:** 16 images (2 treatments × (1 main + 6 views))

### After Quality Scanning:
- **Total valid images:** 292/292 (100% pass rate)
- **FDA images:** 135
- **PMC images:** 157
- **Per-treatment distribution:**
  - botulinum_toxins: 5
  - cheek_augmentation: 57
  - daxxify: 2
  - hyaluronic_acid_lips: 42
  - jawline_contouring: 49
  - radiesse_(merz): 23
  - sculptra: 24
  - soft_tissue_fillers: 4
  - unknown_fda: 86

### After Image Normalization:
- **Successfully normalized:** 292/292 (100% success rate)
- **FDA:** 135 images
- **PMC:** 157 images

### After Pair Matching:
- **Total pairs:** 60 (120 images)
- **True pairs matched:** 30
- **Pseudo pairs created:** 30
- **Domain A (before):** 60 images
- **Domain B (after):** 60 images
- **Pairs by treatment:**
  - juvéderm_ultra_plus_xc: 28 pairs
  - juvéderm_volux_xc: 1 pair
  - radiesse_(merz): 18 pairs
  - sculptra: 13 pairs

### After Synthetic Integration:
- **Successfully integrated:** 14 synthetic images
- **Failed integration:** 0
- **Synthetic pairs:** 12 (2 treatments × 6 views each)
- **Integrated by treatment:**
  - botulinum_toxins: 7 images (1 main + 6 views)
  - hyaluronic_acid_lips: 7 images (1 main + 6 views)
- **Synthetic data weight:** 20% of training data

## Usage Instructions

To run the complete pipeline:

```bash
# 1. Scan data quality
python3 tools/data_quality_scan.py

# 2. Normalize images  
python3 tools/image_normalizer.py

# 3. Match pairs
python3 tools/pair_matcher.py

# 4. Integrate synthetic data
python3 tools/synthetic_integrator.py
```

## Training Data Ready For

The processed data is now ready for CUT model training with:
- **Domain A:** Before images (real + synthetic)
- **Domain B:** After images (real + synthetic)
- **Balanced pairs:** 60 real pairs + 12 synthetic pairs = 72 total pairs
- **Treatment diversity:** 8 different treatment types represented
- **Standardized format:** 256x256 RGB images normalized to [-1, 1] range

## Quality Assurance

All processing steps include:
- Comprehensive logging
- Error handling and reporting
- Statistics tracking
- Manifest validation
- Format standardization
- Corruption detection

## Next Steps

1. Train CUT model using the paired data in `data/processed/paired/`
2. Monitor training convergence and image quality
3. Iterate on synthetic data generation based on training results
4. Expand treatment types as more data becomes available