# SKINgenius Core + Viral Features Spec

> **Author:** Che 🧬 | **Date:** 2026-05-23
> **Project:** SKINgenius
> **Primary Objective:** Analyze skin conditions, recommend products/services, and drive lifestyle changes that resolve issues.
> **Viral Feature:** Skin Age Estimator (side feature, not primary flow)

---

## Primary Flow: Condition Detection & Recommendations

### Step 1: Photo Capture
- Front-facing camera, well-lit environment
- Guided overlay (face positioning, lighting check)

### Step 2: Condition Detection

**Free Tier:** Gemma E4B on-device
- Detects: acne, redness, dark spots, dry patches, fine lines
- Outputs: condition probability scores (0-100%)
- Frame: "This is a preliminary scan. Upgrade for detailed analysis."

**Pro Tier:** GPT-4o Vision API (cloud)
- Detailed condition detection across all 6 Fitzpatrick types
- Zone-by-zone analysis (forehead, cheeks, under-eye, nose, chin, neck)
- Outputs: specific conditions, severity (mild/moderate/severe)

### Step 3: Root Cause Analysis
Based on conditions + user profile + lifestyle questionnaire

### Step 4: Product Recommendations
Ingredient-matched products from SKINgenius database (25 conditions, 105 ingredients)

### Step 5: Lifestyle Action Plan
Specific recommendations with difficulty level, expected impact, timeline

### Step 6: Progress Tracking
Re-scan every 2-4 weeks, compare over time

---

## Viral Feature: Skin Age Estimator (Side Tab)

**Location:** "Scan" (primary), "Skin Age" (viral), "Track" (progress)

**Free:** Gemma E4B detects surface aging markers + lifestyle questionnaire = rough skin age estimate
**Pro:** GPT-4o Vision clinical-grade analysis + detailed breakdown + action plan
**Shareable card:** Instagram/TikTok ready with disclaimer

---

## Technical Architecture

| Tier | Model | Use Case | Cost |
|------|-------|----------|------|
| Free | Gemma E4B (on-device) | Basic condition detection, surface aging | $0 |
| Pro | GPT-4o Vision (API) | Detailed analysis, clinical-grade | ~$0.005-0.01/image |
| Future | Fine-tuned Qwen2.5-VL | Proprietary model on user data | TBD |

**Why NOT Kimi K2.6:** Closed model, can't fine-tune. Use pre-trained models now, build proprietary later.

---

## Implementation Priority

1. **Phase 1 (Weeks 1-3):** Core condition detection — Gemma E4B, 3 conditions, generic recommendations
2. **Phase 2 (Weeks 3-5):** Pro analysis — GPT-4o Vision, zone breakdown, ingredient matching
3. **Phase 3 (Weeks 5-6):** Lifestyle action plan
4. **Phase 4 (Weeks 6-7):** Skin Age Estimator viral feature
5. **Phase 5 (Weeks 7-9):** Progress tracking + Basys Health integration

---

## Files to Reference

- SKINgenius seed data: `skingenius/data/seed-data.json` (25 conditions, 105 ingredients)
- SKINgenius schema: `skingenius/supabase/schema.sql`
- Gemma E4B: same on-device stack as COLORgenius photo analysis

---

*Primary objective: help people fix their skin. Viral feature: get them in the door.*
