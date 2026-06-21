# FEATURE_REQUESTS.md — SKINgenius Team
*Signals from sessions that suggest product or agent feature gaps*
*Last updated: 2026-06-21T21:43Z (Cycle 67)*

---

## [FRQ-20260621-001] Che heartbeat configuration management — reduce CEO spam from 24/day to 2/day

**Captured**: 2026-06-21T09:37:00Z
**Source**: Pulse Cycle 65-67 — CEO session analysis
**Priority**: critical
**Status**: proposed (requires Jason to modify Che config)

### Problem
CEO agent receives ~24 status-check dispatches per day from Che agent's heartbeat (every 30m-1h). Each session wastes ~30-60KB tokens producing near-identical reports. Over 899 sessions total (~27MB). This is NOT manageable via gateway cron API — it's Che's `heartbeat.every` config.

### Proposed Solution
1. Reduce Che `heartbeat.every` from 30m to 12h (or 6h at minimum)
2. Or: remove CEO dispatch from Che heartbeat, keep only direct reporting
3. Or: add dedup logic to CEO — skip status check if last report was <6h ago
4. Target: 2 CEO status reports per day, not 24

---

## [FRQ-20260621-002] Populate HEARTBEAT.md with periodic tasks or disable heartbeat — 100% no-op waste

**Captured**: 2026-06-21T21:37:00Z
**Source**: Pulse Cycle 66-67 — meta agent heartbeat analysis
**Priority**: high
**Status**: proposed

### Problem
Meta agent's heartbeat fires regularly but HEARTBEAT.md has no tasks defined. 100% of heartbeat sessions produce "HEARTBEAT.md is empty — no tasks defined. NO_REPLY". This wastes tokens and agent compute.

### Proposed Solution
1. Add periodic tasks to HEARTBEAT.md: check git status, verify cron health, check agent activity, run qmd update
2. Or reduce heartbeat frequency when no tasks are defined
3. Or disable heartbeat entirely and rely on Pulse cron (12h) for all meta tasks

---

## [FRQ-20260620-002] Meta agent turn failure investigation — RESOLVED (16%→2%→0%)

**Captured**: 2026-06-20T21:37:00Z
**Source**: Pulse Cycle 64-67 — meta agent session analysis
**Priority**: low
**Status**: ✅ RESOLVED

### Problem
Meta agent (Pulse) had 12/74 (16%) turn failures in Cycle 64. Improved to ~2% in Cycle 65 and ~0% in Cycles 66-67. Model (glm-5.1:cloud) is stable.

### Resolution
Model stability resolved the issue. No action needed. Closing this feature request.

---

## [FRQ-20260615-001] Dev agent model switch — kimi-k2.6 unreliable, switch to glm-5.1

**Captured**: 2026-06-15T00:00:00Z
**Source**: Dev agent session analysis (garbage output + env leak)
**Priority**: high
**Status**: proposed (dev agent dormant since Jun 16)

### Problem
Dev agent's kimi-k2.6 model produced entirely garbled/hallucinated output in session 01b319d3. Session also leaked API keys in plain text (SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, SUPABASE_ACCESS_TOKEN). Keys STILL NOT ROTATED after 8+ days.

### Proposed Solution
1. Switch dev agent model from kimi-k2.6 to glm-5.1 before reactivation
2. Rotate all 3 leaked API keys IMMEDIATELY
3. Add env var protection to agent guardrails to prevent future leaks
4. Audit all dev session logs for other potential leaks