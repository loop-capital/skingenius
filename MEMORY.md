# MEMORY.md — SKINgenius Long-Term Memory

> **Last updated:** 2026-10-07 (verified by SKINgenius)
> **Wiki vault:** `~/.openclaw/wiki/skingenius/`
> **Daily notes:** `memory/YYYY-MM-DD.md`

---

## Recent Research

- 2026-09-29: Research (categories 1, 3), 5 findings, see research/findings-2026-09-29.md
- 2026-09-27: Haut.AI competitive dossier (17KB), skingenius.app trademark discovery, Square commerce integration
- 2026-09-15: Research (categories 2, 3), 7 findings, see research/findings-2026-09-15.md
- 2026-09-14: Research (category 1 — condition-ingredient mapping), 14 conditions × 5–10 ingredients mapped, see docs/CONDITION-INGREDIENT-MAPPING.md
- 2026-09-09: Research (category 4 — competitor dossier), RéVive Skincare, see docs/research/revive-skincare-dossier.md

---

## Verification (2026-10-07)

The July 31 sections of this file framed the project as "governance deadlock"
(12 failed sprints, zero velocity, dormant agents). Verified against git
history and daily notes: **that framing was wrong.**

- **September was built, not stalled:** 13 commits Sep 9–13 (GetUpLook
  referral APIs), recommendation engine rewrite (Jul 31), Square commerce
  integration (Sep 16, build passed — 73 static pages).
- **API keys:** the 3 leaked keys from the June incident are rotated
  (confirmed with Jason, Sep 13). Resolved.
- **"640K insertions of unreviewed drift":** no such drift exists in the
  current tree. Working tree is docs + archive moves only.
- **Agent fleet:** the 11-agent dispatch workflow is retired. Sep 27 note:
  subagents ran 30+ times with zero output (2.36M tokens wasted). Direct
  execution replaced it. Sienna (renamed from "Che", Oct 3) runs orchestration.

The Pulse-era ops narrative (Che heartbeat spam, Telegram delivery, Pulse
cycles) is retired with it — those tracked the old automation, not the product.

---

## History (kept for the record)

- **Jun 16:** 3 API keys leaked. Rotated — resolved Sep.
- **Jun 20:** 214 files committed across 4 commits (bulk commit of accumulated work).
- **Jun 21:** Last Pulse-era commit; sprint reviews for Sprints 10–11 recorded
  low completion *against the old agent workflow*.
- **Jul 19:** Brief 4-agent activation; output absorbed into later commits.
- **Jul 31:** Pulse agent wrote the "governance deadlock" narrative
  (superseded by the 2026-10-07 verification above).
- **Sep 9–13:** GetUpLook referral API build (13 commits, merged).
- **Sep 14:** Legacy status files archived; Graphify removed fleet-wide (was
  never wired into the recommendation engine).
- **Sep 16:** Square commerce integration, build passed.
- **Sep 27:** Haut.AI dossier, skingenius.app competitor found, partnership
  strategy drafted.
- **Oct 7:** SKINgenius (Muse) took over project; PC2 SSH access configured;
  Phase 1 map completed; stale docs rewritten.

---

## Codebase (verified 2026-10-07)

- **Web app:** Next.js, ~40 API routes (scan, recommendations, referrals,
  facial-analysis, wellness-plan, Square/Stripe commerce, providers).
- **Knowledge graph:** `knowledge-graph/` (17 files, 1.8 MB) — the live
  recommendation data source (`condition-ingredient-mappings.json` + Supabase).
- **Mobile:** Expo app in `mobile/` (build status unverified).
- **Supabase:** schema migrated; email-confirmation 500 reported Sep 9 —
  re-verify.
- **Specs:** 14 docs in `specs/` (referral system, vision model, injector
  network, …).

## Promoted From Short-Term Memory

<!-- openclaw-memory-promotion -->
