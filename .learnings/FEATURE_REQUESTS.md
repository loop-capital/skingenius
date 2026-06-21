# FEATURE_REQUESTS.md — SKINgenius Team
*Signals from sessions that suggest product or agent feature gaps*
*Last updated: 2026-06-21T09:37Z (Cycle 65)*

---

## [FRQ-20260621-001] Che heartbeat configuration management — reduce CEO spam from 24/day to 2/day

**Captured**: 2026-06-21T09:37:00Z
**Source**: Pulse Cycle 65 — CEO session analysis
**Priority**: critical
**Status**: proposed

### Problem
CEO agent receives ~24 status-check dispatches per day from Che agent's heartbeat (every 30m-1h). Each session wastes ~40KB tokens producing near-identical reports. Over 851 sessions total (~34MB). This is NOT manageable via gateway cron API — it's Che's `heartbeat.every` config.

### Proposed Solution
1. Reduce Che `heartbeat.every` from 30m to 12h (or 6h at minimum)
2. Or: remove CEO dispatch from Che heartbeat, keep only direct reporting
3. Or: add dedup logic to CEO — skip status check if last report was <6h ago
4. Target: 2 CEO status reports per day, not 24

---

## [FRQ-20260620-002] Meta agent turn failure investigation — diagnose 16%→2% failure rate

**Captured**: 2026-06-20T21:37:00Z
**Source**: Pulse Cycle 64 — meta agent session analysis
**Priority**: medium
**Status**: monitoring (improved to ~2%)

### Problem
Meta agent (Pulse) had 12/74 (16%) turn failures in Cycle 64. In Cycle 65, this improved to 2/88 (~2%). Need to confirm the improvement is stable.

### Proposed Solution
1. Monitor failure rate for next 2-3 Pulse cycles
2. If remains <5%, close this investigation
3. If returns to >10%, investigate model or context issues
4. Consider adding explicit retry logic for failed turns

---

## [FRQ-20260620-001] Meta heartbeat optimization — eliminate 18% no-op responses

**Captured**: 2026-06-20T21:37:00Z
**Source**: Pulse Cycle 64 — meta agent session analysis
**Priority**: medium
**Status**: proposed

### Problem
Meta agent's heartbeat fires regularly but HEARTBEAT.md has no tasks defined, causing no-op "HEARTBEAT.md is empty" responses. This wastes tokens and agent time.

### Proposed Solution
1. Add periodic tasks to HEARTBEAT.md (check git status, verify cron health, check agent activity)
2. Or reduce heartbeat frequency when no tasks are defined
3. Or disable heartbeat entirely and rely on Pulse cron (12h) for all meta tasks

---

## [FRQ-20260615-001] Dev agent model switch — kimi-k2.6 unreliable, switch to glm-5.1

**Captured**: 2026-06-15T00:00:00Z
**Source**: Dev agent session analysis (garbage output + env leak)
**Priority**: high
**Status**: proposed (agent dormant, needs model change before reactivation)

### Problem
Dev agent (Pixel) using kimi-k2.6:cloud produced entirely garbled output in last session (01b319d3). Also leaked 3 API keys in plain text. Model is unreliable.

### Proposed Solution
1. Switch dev agent model from kimi-k2.6 to glm-5.1:cloud (0% failure rate in meta agent)
2. Add env variable protection to agent guardrails (mask secrets in output)
3. Rotate leaked API keys before reactivating dev agent
4. Add session log monitoring for garbage output detection