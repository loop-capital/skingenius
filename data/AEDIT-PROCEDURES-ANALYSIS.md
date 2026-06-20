# AEDIT Procedure Directory — Analysis

> **Crawled:** 2026-06-14
> **Source:** https://aedit.com/procedure-directory
> **Total procedures found:** 100

---

## Current SKINgenius Coverage (10 procedures)

| Procedure | AEDIT Match |
|-----------|-------------|
| microneedling | ✅ `/procedure/microneedling-treatment` |
| chemical_peel | ✅ `/procedure/chemical-peels` |
| laser_fraxel | ✅ `/procedure/laser-skin-resurfacing` |
| laser_ipl | ⚠️ No direct match (covered under laser-skin-resurfacing) |
| botox | ✅ `/procedure/botox` |
| filler | ✅ `/procedure/dermal-fillersinjectables` |
| prp | ⚠️ No direct match (often part of microneedling) |
| rf_microneedling | ⚠️ No direct match (subset of microneedling/laser) |
| hifu | ⚠️ No direct match (subset of laser-skin-tightening) |
| thread_lift | ⚠️ No direct match (subset of facial-skin-firming) |

---

## New Procedures Worth Adding

### HIGH Priority (skin health, high demand)

| Procedure | AEDIT URL | Why Add |
|-----------|-----------|---------|
| **Laser Skin Tightening** | `/procedure/laser-skin-tightening` | Distinct from resurfacing — focused on collagen stimulation, not ablation. Different recovery/profile. |
| **Microdermabrasion** | `/procedure/microdermabrasion` | Common, lower-intensity alternative to chemical peels. Many users do this before stronger treatments. |
| **Dermabrasion** | `/procedure/dermabrasion-treatment` | Deeper than micro — different recovery protocol. |
| **Dermaplaning** | `/procedure/dermaplaning-treatment` | Extremely popular, minimal downtime. Different from peels. |
| **Facials** | `/procedure/facials` | Broad category — could break into HydraFacial, LED, etc. |
| **Melasma Solutions** | `/procedure/melasma-solutions` | Melasma is one of our top conditions — specific protocol needed. |
| **Acne Scar Treatment** | `/procedure/acne-scar-treatment` | Acne is our #1 condition — scar treatment protocol is critical. |
| **Even Skin Tone** | `/procedure/even-skin-tone-solutions` | Pigment-focused — PIH, sun spots, melasma overlap. |

### MEDIUM Priority (skin-adjacent, some demand)

| Procedure | AEDIT URL | Why Add |
|-----------|-----------|---------|
| **Hand Rejuvenation** | `/procedure/hand-rejuvenation` | Growing trend — filler + laser for hands. |
| **Eye Rejuvenation** | `/procedure/eye-rejuvenation-solutions` | Under-eye filler, laser, PRP — popular request. |
| **IV Nutrient Therapy** | `/procedure/intravenous-and-injectable-nutrient-therapy-solutions` | Wellness plan connection — IV vitamins for skin. |
| **Laser Tattoo Removal** | `/procedure/laser-tattoo-removal-procedure` | Different laser protocol — worth having. |
| **Excessive Sweating** | `/procedure/excessive-sweating-solutions` | Botox for hyperhidrosis — skin health adjacent. |
| **Cellulite Removal** | `/procedure/cellulite-removal` | Body skin concern — expanding beyond face. |
| **Lip Augmentation** | `/procedure/lip-augmentation-and-injections` | Subset of filler but specific protocol. |

### LOW Priority (mostly surgical/body, not skin health)

| Procedure | AEDIT URL | Why Add |
|-----------|-----------|---------|
| Breast augmentation | Various | Body surgery — not skin health |
| Liposuction | Various | Body contouring — not skin health |
| Rhinoplasty | Various | Facial surgery — not skin health |
| Facelift | Various | Surgical — could add post-op protocol |
| Hair transplant/restore | Various | Hair, not skin |
| Gender confirmation | Various | Niche — defer |

---

## Missing Categories We Should Consider

| Category | AEDIT Procedures | SKINgenius Gap |
|----------|-----------------|----------------|
| **Pigment disorders** | melasma, even-skin-tone, birthmark | We have melasma as a condition but no treatment protocol |
| **Acne scarring** | acne-scar-solutions, acne-scar-treatment | We have acne conditions but no scar-specific protocol |
| **Non-laser resurfacing** | microdermabrasion, dermabrasion, dermaplaning | We only have laser/peel options |
| **Facial rejuvenation** | facials, eye-rejuvenation, hand-rejuvenation | Broad category — could expand |
| **Body skin** | cellulite, excessive sweating | We're face-focused only |

---

## Recommendations

### Add to `post_procedure_protocols` (Phase 2):
1. `post-microdermabrasion` — HIGH volume, minimal recovery
2. `post-dermaplaning` — HIGH volume, minimal recovery
3. `post-laser-skin-tightening` — Distinct from resurfacing
4. `post-dermabrasion` — Deeper than micro, different recovery
5. `post-facial` — HydraFacial, LED, etc. (could be multiple)

### Add to `treatment_categories` or new table:
6. `melasma-protocol` — Treatment pathway for melasma (topical + procedural)
7. `acne-scar-protocol` — Treatment pathway for acne scarring
8. `pigment-correction-protocol` — PIH, sun spots, uneven tone

### Defer (surgical, not skin health):
- Breast, body contouring, rhinoplasty, facelift — these are surgical procedures, not skin wellness
- Could add post-op recovery protocols later if expanding into surgical aftercare

---

*This analysis lives at `skingenius/data/AEDIT-PROCEDURES-ANALYSIS.md`.*
