# LEARNINGS.md — SKINgenius Team
*Auto-logged by Pulse (skingenius-meta) self-improvement loop*
*Last updated: 2026-06-21T09:37Z (Cycle 65)*

---

## [LRN-20260621-001] CEO cron still 24/day (Che heartbeat), git commits done, 9/11 agents dormant 5-37d, API keys unrotated 6+ days, meta turn failure improved to ~2%

**Logged**: 2026-06-21T09:37:00Z
**Priority**: critical
**Status**: active
**Area**: reliability + project-execution + agent-health

### Summary
CEO cron continues over-firing at ~24 sessions/24h (Che heartbeat every hour). 9/11 agents dormant for 5-37 days with zero feature velocity. Git commits were completed June 21 (4 commits, 214 files). API keys STILL unrotated after 6+ days (SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, SUPABASE_ACCESS_TOKEN). Meta turn failure rate improved from 16% to ~2% (2/88 turns had error mentions in last session). Pulse delivery NOW WORKING — Telegram target fixed from `-5110202082` to `-1002227616648`.

### Pattern
- **CEO**: 851+ total sessions, ~99% cron-driven. Each ~40KB, ~24/day = ~960KB/day token waste. All 12 sessions in last 12h were Che heartbeat dispatches.
- **Che heartbeat**: `90d8d5a5` cron ID — NOT in gateway cron API, it's the Che agent's heartbeat config dispatching to CEO.
- **Meta/Pulse**: 7 sessions in last 48h. Turn failure improved from 16% to ~2%. Delivery FIXED.
- **Dev**: Dormant 5 days (last session June 16 produced garbage output + env leak)
- **Git**: 4 commits on June 21 (214 files). Only DREAMS.md and MEMORY.md modified since.
- **API keys**: STILL unrotated 6+ days — SECURITY INCIDENT worsening.
- **MVP deadline**: July 7 — 16 days remaining with zero feature velocity.

### Key Metrics (Cycle 65)
| Metric | Value | Change from Cycle 64 |
|--------|-------|---------------------|
| CEO sessions (12h) | 12 | unchanged (~24/day) |
| CEO total sessions | 851+ | +12 |
| CEO daily token waste | ~960 KB/day | unchanged |
| Meta turn failure rate | ~2% (2/88) | ↓ improved from 16% |
| Pulse delivery | ✅ WORKING | FIXED |
| Git commits | 4 (June 21) | ✅ NEW |
| Uncommitted files | 2 (DREAMS.md, MEMORY.md) | ↓ from 349 |
| Other agents (24h) | 0 | unchanged |
| Days API keys unrotated | 6+ | ↑ worsening |
| Days since last commit | 0 | ↓ from 4 |
| MVP deadline | 16 days | countdown continues |

### Positive Changes (Cycle 65)
1. ✅ **Pulse delivery FIXED** — Telegram target changed to working group `-1002227616648`
2. ✅ **Git commits DONE** — 4 commits, 214 files committed
3. ✅ **Meta turn failure rate** — improved from 16% to ~2%
4. ✅ **Uncommitted files reduced** — from 349 to just 2 (DREAMS.md, MEMORY.md)

### Worsening Issues (Cycle 65)
1. 🔴 **API keys unrotated 6+ days** — was 5+ in Cycle 64, now 6+ days
2. 🔴 **CEO cron still 24/day** — unchanged, Che heartbeat continues
3. 🔴 **9/11 agents dormant 5-37 days** — Dev now dormant 5d (was 4d)
4. 🔴 **Zero feature velocity** — no dev activity for 5 days