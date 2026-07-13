# ERRORS.md — SKINgenius Team
*Recurring errors and their resolutions*
*Last updated: 2026-07-13T21:49Z (Cycle 129)*

---

## [ERR-20260628-001] CEO cron over-firing — 1397 sessions total, ~24/day Che/cron dispatch, NOT manageable via gateway cron API

**First seen**: 2026-06-15T00:00:00Z
**Last seen**: 2026-07-13T21:49:00Z (Cycle 129)
**Frequency**: ~24 sessions/day baseline (STABLE, confirmed ~93% cron/Che in C129)
**Agent**: skingenius-ceo
**Status**: ACTIVE — confirmed NOT paused

### Error
CEO cron (`90d8d5a5`) continues to over-fire. Total sessions: **1397**. Last 24h: 27 sessions (25 cron, 2 Che). All recent CEO sessions are cron dispatches or Che heartbeats. Zero human interactions confirmed in 10+ days. Each session wastes ~30-60KB tokens. Total waste likely exceeds ~1MB+/day.

### Root Cause (Confirmed Cycle 64)
The cron is NOT a gateway cron job — it's the Che agent's heartbeat config that dispatches status checks to CEO every 30-60 minutes. Cannot be managed via gateway cron API.

### Workaround Needed
Fix Che agent's `heartbeat.every` config: reduce from 30m to 12h, or remove CEO dispatch entirely. This requires Jason to modify Che's agent configuration.

### Escalation
Flagged for 65+ consecutive Pulse cycles (Cycles 64-129). No action taken. CEO sessions confirmed ~93% cron/Che dispatch in last 24h (0% human).

---

## [ERR-20260627-002] Meta heartbeat 100% no-op — HEARTBEAT.md does NOT EXIST, all turns wasted

**First seen**: 2026-06-20T21:37:00Z
**Last seen**: 2026-07-13T21:49:00Z (Cycle 129)
**Frequency**: Every heartbeat session (estimated 2-4/day)
**Agent**: skingenius-meta
**Status**: ACTIVE — wasting tokens (65+ cycles flagging)

### Error
Meta agent's heartbeat fires regularly but HEARTBEAT.md doesn't exist as a file. 100% of heartbeat sessions produce empty-response messages. This wastes tokens and agent compute.

### Resolution Needed
1. Create HEARTBEAT.md with periodic tasks: check git status, verify cron health, check agent activity, run qmd update
2. Or reduce heartbeat frequency when no tasks are defined
3. Or disable heartbeat entirely (Pulse cron handles all meta tasks)

### Escalation
Flagged for 65+ consecutive Pulse cycles. No action taken.

---

## [ERR-20260616-003] API keys leaked in dev session logs — SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, SUPABASE_ACCESS_TOKEN

**First seen**: 2026-06-16T00:00:00Z
**Last seen**: 2026-07-13T21:49:00Z (Cycle 129)
**Frequency**: Persistent exposure (keys still in session logs)
**Agent**: skingenius-dev
**Status**: ACTIVE — CRITICAL SECURITY INCIDENT (28 days unrotated, 4th week+)

### Error
Dev subagent session leaked SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, and SUPABASE_ACCESS_TOKEN in plain text. Keys STILL NOT ROTATED 28 days after discovery.

### Impact
- SUPABASE_SERVICE_ROLE_KEY: Full database access bypassing RLS
- OPENAI_API_KEY: API usage/spend exposure
- SUPABASE_ACCESS_TOKEN: Service account compromise

### Resolution
IMMEDIATE rotation of all three keys. Add env var protection to agent guardrails.

### Escalation
Flagged for 65+ consecutive Pulse cycles. No action taken. Day 28. 4TH WEEK+. CRITICAL SECURITY INCIDENT worsening daily.

---

## [ERR-20260616-004] Dev agent kimi-k2.6 produces garbage output

**First seen**: 2026-06-16T00:00:00Z
**Last seen**: 2026-07-13T21:49:00Z (Cycle 129)
**Frequency**: Persistent (session 01b319d3 entirely garbled)
**Agent**: skingenius-dev
**Status**: ACTIVE — blocks dev agent reactivation

### Error
Session 01b319d3 showed entirely garbled output from kimi-k2.6 model. All content was hallucinated/garbled. This blocks safe reactivation of the dev agent.

### Resolution
Switch dev agent model from kimi-k2.6 to glm-5.1 before reactivation. Test with a small task first.

---

## [ERR-20260615-005] Mobile build broken — asset path resolution error

**First seen**: 2026-06-15T00:00:00Z
**Last seen**: 2026-07-13T21:49:00Z (Cycle 129)
**Frequency**: Persistent (not fixed)
**Agent**: skingenius-dev
**Status**: ACTIVE — blocks mobile deployment

### Error
Mobile build fails with asset path resolution error. No fix attempted since June 15.

---

## [ERR-20260713-008] QMD embed command hangs — indexed fine but embedding step stalls indefinitely

**First seen**: 2026-07-13T21:43:00Z (Cycle 128)
**Last seen**: 2026-07-13T21:49:00Z (Cycle 129)
**Frequency**: Persistent (2 consecutive cycles)
**Agent**: skingenius-meta
**Status**: ACTIVE — needs investigation

### Error
`qmd embed` command hangs indefinitely on both agent_memories and skingenius_workspace collections. `qmd update` succeeds (0 new, 0 updated, 14 unchanged), but embedding step never completes. Process requires kill after 30+ seconds.

### Resolution Needed
Investigate qmd embed performance. Possibly GPU acceleration issue or large collection size. Index is current; embeddings may be stale.

---

## [ERR-20260710-006] QMD collection names changed — RESOLVED

**First seen**: 2026-07-10T21:37:00Z (Cycle 121)
**Last seen**: 2026-07-11T09:37:00Z (Cycle 122)
**Frequency**: One-time
**Agent**: skingenius-meta
**Status**: RESOLVED — collections renamed to agent_memories and obsidian_vault

---

## [ERR-20260711-007] QMD CLI not available on PATH — RESOLVED

**First seen**: 2026-07-11T21:37:00Z (Cycle 123)
**Last seen**: 2026-07-12T21:37:00Z (Cycle 125)
**Frequency**: Resolved
**Agent**: skingenius-meta
**Status**: RESOLVED — qmd CLI found at /home/linuxbrew/.linuxbrew/bin/qmd