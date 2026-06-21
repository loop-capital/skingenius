# LEARNINGS.md — SKINgenius Team
*Auto-logged by Pulse (skingenius-meta) self-improvement loop*
*Last updated: 2026-06-21T21:43Z (Cycle 67)*

---

## [LRN-20260621-003] CEO cron 24/day continues (899+ sessions), 0 human interactions, 9/11 agents dormant 6-37d, API keys 8+ days unrotated, zero feature velocity, MVP in 16 days

**Logged**: 2026-06-21T21:43:00Z
**Priority**: critical
**Status**: active
**Area**: reliability + project-execution + agent-health + security

### Summary
CEO cron continues over-firing at ~24 sessions/24h (all Che heartbeat dispatches). Zero human interactions in any CEO session in last 24h. All 9 non-CEO/meta agents dormant (6-37 days). API keys STILL unrotated 8+ days (SECURITY INCIDENT CRITICAL). Meta heartbeats produce 100% no-op responses (HEARTBEAT.md empty). Only .learnings/ files and DREAMS.md changed since last Pulse — no code changes for 6+ days. MVP deadline July 7 — 16 days remaining with zero feature velocity. Pulse delivery is stable (3 consecutive cycles working).

### Pattern
- **CEO**: 899+ total sessions, ~99% cron-driven. 24 new sessions in last 24h, ALL Che heartbeat dispatches with 0 human interactions. All "human" messages are Che dispatches (not real user input).
- **Che heartbeat**: `90d8d5a5` cron ID — NOT in gateway cron API. Each session ~30-60KB, all produce near-identical status reports.
- **Meta**: 5 sessions in last 24h (1 Pulse cycle + heartbeat). Meta turn failure rate appears ~0%. Heartbeat still 100% no-op.
- **Other agents**: ALL dormant. AI 11d, architect 7d, data 11d, design 11d, dev 5d (since Jun 16), devops 30d, marketing 37d, research 7d, syntax 30d.
- **Git**: Only .learnings/ files + DREAMS.md modified. No code changes for 6+ days.
- **API keys**: 8+ DAYS UNROTATED — SECURITY INCIDENT CRITICAL AND WORSENING.
- **MVP deadline**: July 7 — 16 days remaining with zero feature velocity.

### Key Metrics (Cycle 67)
| Metric | Value | Change from Cycle 66 |
|--------|-------|---------------------|
| CEO sessions (24h) | 24 | unchanged (~24/day) |
| CEO total sessions | 899+ | +24 |
| CEO daily token waste | ~960 KB/day | unchanged |
| CEO human interactions | 0 | unchanged |
| Meta turn failure rate | ~0% | stable (was ~0% in C66) |
| Pulse delivery | ✅ WORKING | stable (3 cycles) |
| Meta heartbeat no-op rate | 100% | unchanged |
| Git uncommitted | 5 files (.learnings/ + DREAMS.md) | ↑ from 1 |
| Other agents active (24h) | 0 | unchanged |
| Days API keys unrotated | 8+ | ↑ worsening from 7+ |
| Days since code commit | 6+ (no code changes) | ↑ worsening |
| MVP deadline | 16 days (July 7) | countdown continues |
| Dormant agents | 9/11 (6-37 days) | worsening |

### Positive Changes (Cycle 67)
1. ✅ **Pulse delivery stable** — working for 3 consecutive cycles (C65-C67)
2. ✅ **Meta turn failure rate ~0%** — stable for 2 consecutive cycles
3. ✅ **CEO model (glm-5.1:cloud) stable** — 0% failure rate confirmed across 899+ sessions
4. ✅ **All meaningful code committed** — only .learnings/ + DREAMS.md uncommitted

### Worsening Issues (Cycle 67)
1. 🔴 **API keys unrotated 8+ days** — was 7+ in Cycle 66, now 8+. SECURITY INCIDENT CRITICAL.
2. 🔴 **CEO cron still 24/day** — unchanged, Che heartbeat continues
3. 🔴 **9/11 agents dormant 6-37 days** — dev dormant 5d (since Jun 16), marketing 37d, devops 30d, syntax 30d
4. 🔴 **Zero feature velocity** — no code changes for 6+ days. Only DREAMS.md and .learnings/ modified
5. 🔴 **Meta heartbeat 100% no-op** — HEARTBEAT.md empty, all heartbeat turns wasted
6. 🟡 **QMD collections stale** — agent_memories 33d stale, skingenius-obsidian has 0 files