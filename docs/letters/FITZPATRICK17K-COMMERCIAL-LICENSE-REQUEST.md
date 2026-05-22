# Commercial License Request — Fitzpatrick 17k Dataset

**From:** Jason Opland, SKINgenius
**To:** Matt Groh (MIT Media Lab) & co-authors
**Date:** May 21, 2026
**Subject:** Commercial License Request for Fitzpatrick 17k — AI Skin Health Platform Serving Diverse Skin Tones

---

Dear Dr. Groh and co-authors,

I'm writing to request a commercial-use license for the Fitzpatrick 17k dataset (CC-BY-NC-SA 3.0). I understand and respect the non-commercial restriction, and I want to explain why we believe our use case aligns with the original intent of your work.

## Who We Are

We are building **SKINgenius**, an AI-powered skin health intelligence platform. Our product takes a photo of a user's skin, identifies conditions using computer vision, analyzes root causes (not just symptoms), and generates personalized recommendations — products, supplements, lifestyle changes, and professional referrals when needed.

We are not a beauty brand. We are not selling products. We are building a clinical-grade analysis engine that helps people understand what's happening with their skin and what to do about it — with evidence-tagged recommendations and safety filters for pregnancy, drug interactions, and allergies.

## Why Fitzpatrick 17k Specifically

Your dataset is unique in the landscape of dermatology AI for one critical reason: **explicit Fitzpatrick skin type annotations on every image.** No other publicly available dataset provides this at scale.

This matters because the current state of AI dermatology is broken for people with darker skin:

- Diagnostic models trained on predominantly light-skinned populations produce higher false-negative rates for Types V-VI
- Product recommendation engines trained without skin tone data default to recommendations optimized for lighter skin
- The clinical evidence base itself is skewed — most RCTs underrepresent darker skin tones

We want to build something better. Your dataset would allow us to:

1. **Validate fairness** — Test our model's accuracy across all 6 Fitzpatrick types and report disparities
2. **Calibrate confidence** — Reduce confidence scores on skin tones where training data is thin
3. **Improve representation** — Ensure our recommendations are clinically appropriate for darker skin (e.g., PIH risk with certain actives, melanin-specific formulation guidance)

## What We're Asking

A **non-exclusive commercial license** to use the Fitzpatrick 17k dataset for:

- Training and validating our skin condition classification model
- Fairness auditing across Fitzpatrick skin types
- Generating aggregate, anonymized performance metrics by skin tone

We will:

- **Cite your work** prominently — your paper will be referenced in our methodology documentation, about page, and any academic publications
- **Share our fairness results** — We will publish aggregate accuracy metrics by Fitzpatrick type, contributing back to the research community
- **Not redistribute the dataset** — Images will be used for internal model training only
- **Credit the source** — Every public-facing model card will reference Fitzpatrick 17k

## Our Motivation

The populations most underserved by current dermatology AI — people with Fitzpatrick Types IV-VI — are exactly the populations your dataset was created to help. We want to use your data to build a tool that serves everyone, not just the light-skinned majority that dominates existing training data.

If a commercial license isn't possible, we would also consider:
- A research collaboration agreement
- A time-limited evaluation license
- A license with revenue-sharing terms

We're flexible on structure. What we care about is building a skin health tool that doesn't leave anyone behind.

## Contact

**Jason Opland**
Founder, SKINgenius
[jasonopland@msn.com]

I'm happy to jump on a call, share our technical architecture, or provide any additional documentation about our use case. Thank you for creating such an important dataset — it's exactly what the field needed.

Best,
Jason

---

*Attachment: SKINgenius one-pager (upon request)*
*Reference: Groh, M., et al. "Evaluating deep neural networks trained on clinical images in dermatology with the Fitzpatrick 17k dataset." CVPR 2021.*
