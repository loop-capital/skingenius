# Research Collaboration Request — Fitzpatrick 17k Dataset

**From:** Jason Opland, SKINgenius
**To:** Dr. Matt Groh, Northwestern University (Kellogg School of Management)
**Date:** May 22, 2026
**Subject:** Research Collaboration — Free On-Device AI for Dermatological Access in Underserved Communities

---

Dear Dr. Groh,

I'm writing to propose a research collaboration involving the Fitzpatrick 17k dataset. I believe our work aligns directly with the mission behind your research — and may be of academic interest in its own right.

## What We're Building

**SKINgenius** is a free, on-device AI skin analysis tool. The scan runs entirely on the user's phone using Google's AI Edge SDK (Gemma 4 + MediaPipe). No photos leave the device. No API calls. No per-scan costs. **Every scan is free. Forever.**

This isn't a freemium upsell. There is no paid scan tier. The product is funded through product recommendation affiliate revenue and professional subscriptions (estheticians, clinics) — never by gatekeeping diagnosis from the people who need it most.

## Why This Matters for Your Research Populations

The Fitzpatrick 17k dataset was created because AI dermatology was broken for people with darker skin. Models trained on predominantly light-skinned populations produced higher false-negative rates for Types IV-VI. Your work exposed this problem.

We're building the solution — and making it free.

A child in a low-income household dealing with eczema, chronic acne, or hyperpigmentation caused by nutrient deficiencies can't afford a $250 dermatologist visit. They often can't afford a $10/month app subscription either. But they probably have a phone.

With on-device AI:
- **Zero cost per scan** — unlimited scans for every user
- **Works offline** — no internet required for analysis
- **Privacy-first** — photos never leave the device
- **Fitzpatrick-aware** — we explicitly detect skin type I-VI and calibrate recommendations accordingly

These are exactly the populations your dataset was created to help. We're building the delivery mechanism to actually reach them.

## What We're Asking

We'd like to discuss a **research collaboration** that could include:

1. **Access to the Fitzpatrick 17k dataset** under a research/non-commercial or limited commercial license
2. **Fairness validation** — We will test and publish accuracy metrics across all 6 Fitzpatrick types, contributing back to your research
3. **On-device deployment study** — Document the feasibility and accuracy of running dermatology AI on consumer phones without cloud inference
4. **Demographic impact research** — Track adoption and health outcomes in underserved communities

We will:
- **Cite your work** prominently in our methodology, app, and any publications
- **Share fairness metrics** — aggregate accuracy by Fitzpatrick type, published openly
- **Credit the source** — referenced in our about page and model documentation
- **Not redistribute the dataset** — used only for internal model training and validation

## Why This Could Be Interesting Academically

On-device dermatology AI that's free and offline-capable hasn't been done at scale. If we can demonstrate acceptable accuracy with Gemma 4 running on a consumer phone — with explicit fairness across Fitzpatrick types — that's a publishable finding.

We're essentially proposing to build the deployment layer for the equity problem your research identified.

## Flexibility on Structure

We're open to whatever arrangement works:
- Research collaboration agreement
- Time-limited evaluation license
- Co-authored paper on on-device dermatology AI fairness
- Joint grant proposal for community health impact study

We don't need your data to make money. We need it to serve people who've been left behind by clinical dermatology AI. The structure matters less than the outcome.

## About SKINgenius

- **Architecture:** On-device Gemma 4 via Google AI Edge SDK + server-side recommendation engine
- **Knowledge base:** 25 skin conditions, 105 evidence-based ingredients, Fitzpatrick-aware
- **Production:** https://skingenius-sigma.vercel.app (Phase 1-4 complete)
- **Mission:** Free scans forever. Funded by product affiliates and professional subscriptions, never by diagnosis fees.

## Contact

**Jason Opland**
Founder, SKINgenius
jasonopland@msn.com

I'm happy to jump on a call, share our technical architecture, or provide any additional documentation. Thank you for creating such an important dataset — we want to use it to build something that actually reaches the people it was meant to serve.

Best,
Jason

---

*Reference: Groh, M., et al. "Evaluating deep neural networks trained on clinical images in dermatology with the Fitzpatrick 17k dataset." CVPR 2021.*
