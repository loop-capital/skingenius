# FEATURE_REQUESTS.md — SKINgenius Team
*Signals from sessions that suggest product or agent feature gaps*
*Last updated: 2026-08-01T01:35Z (Cycle 139)*

---

## [FRQ-20260622-001] Che heartbeat configuration management — CEO spam NOW POSSIBLY RESOLVED (0 sessions in 24h)

**Captured**: 2026-06-21T09:37:00Z
**Source**: Pulse Cycles 65-139 — CEO session analysis
**Priority**: high (downgraded from critical — signal change detected)
**Status**: MONITORING — CEO session growth stalled, 0 in last 24h (Cycle 139)

### Problem
CEO agent received status-check dispatches from Che agent's heartbeat (every 30-60m). Total sessions reached **1487**. However, Cycle 139 shows **0 CEO sessions in 24h** — first zero-growth window in 139 cycles. Growth slowed from +15/cycle to +8 total since C138.

### Proposed Solution
1. ~~Reduce Che `heartbeat.every` from 30m to 12h~~ — MAY ALREADY BE DONE (monitoring)
2. Verify Che dispatch is actually paused/throttled (not a system error)
3. If confirmed paused: close this issue
4. If system error: restore dispatch and then properly throttle

### Update (Cycle 139)
CEO sessions: 1487 total, +8 since C138 (was +15/cycle), 0 in last 24h. Monitoring for 2-3 more cycles before declaring resolved.

---

## [FRQ-20260622-002] HEARTBEAT.md no-op — RESOLVED

**Captured**: 2026-06-21T21:37:00Z
**Source**: Pulse Cycles 66-138
**Priority**: ~~high~~ CLOSED
**Status**: ✅ RESOLVED (Cycle 139) — HEARTBEAT.md confirmed present

### Problem
Meta agent's heartbeat fired but HEARTBEAT.md didn't exist. 100% empty-response waste for 74+ cycles.

### Resolution
HEARTBEAT.md now exists at `/home/jason/.openclaw/workspaces/skingenius/HEARTBEAT.md` (226 bytes). No-op waste eliminated.

---

## [FRQ-20260703-004] Auto-escalation mechanism — graduated alert paths for Pulse

**Captured**: 2026-07-03T21:37:00Z
**Source**: Pulse Cycles 64-139 — governance gap analysis
**Priority**: critical
**Status**: active (79+ cycles of escalation failure, Telegram delivery unknown)

### Problem
139 consecutive Pulse cycles flagged same 5 critical issues with ZERO structural changes. CEO was 100% cron/subagent (may now be paused). No human interaction in 45+ days. Telegram delivery broken for 6+ cycles (needs re-verification). Governance gap is systemic and worsening.

### Proposed Solution
1. Re-verify Telegram delivery target (chat ID may have changed again)
2. Escalation tiers: log → CEO → Jason direct → urgent security alert
3. Auto-execute authority for API key rotation after N cycles
4. Stasis alarm if 30+ cycles with no structural change (TRIGGERED at Cycle 90+, still no action)
5. Jason-notification bypass — if Telegram fails, switch to direct DM

### Update (Cycle 139)
79+ cycles of flagging with zero structural change. API keys at 45 days. Stasis day 45+. Telegram delivery status unknown — will re-verify this cycle.

---

## [FRQ-20260713-009] Git drift management — 640K insertions uncommitted, unverified (UNCHANGED since C137)

**Captured**: 2026-07-13T00:00:00Z
**Source**: Pulse Cycles 130-139 — git analysis
**Priority**: critical
**Status**: active (unchanged — 640,817 insertions from Jul 19 spark, still unreviewed)

### Problem
47 uncommitted files, 640,817 insertions across 15 files from Jul 19 agent dispatch. No quality review performed. No commits since Jul 13 (chore), Jun 21 (feature). Dev agent used kimi-k2.6 (known garbage model).

### Proposed Solution
1. Review all Jul 19 agent output before any commit
2. Discard kimi-k2.6 output from Dev agent
3. Keep Architect/Data output (glm-5.1, nemotron-3-super — higher quality)
4. Commit reviewed changes on feature branch, NOT main
5. Add git hook to prevent direct commits to main (already exists per AGENTS.md)

### Update (Cycle 139)
Git drift unchanged at 640,817 insertions. 18 days since last commit (Jul 13 chore). 41 days since last feature commit (Jun 21).

---

## [FRQ-20260720-010] Agent reactivation follow-through — prevent spark-then-fizzle

**Captured**: 2026-07-20T21:37:00Z
**Source**: Pulse Cycle 138 — Jul 19 spark analysis
**Priority**: high
**Status**: active (no follow-through since Jul 19 spark)

### Problem
Jul 19 saw 4 agents briefly reactivated with sprint tasks. By Jul 20, all 4 were dormant again. By Aug 1 (Cycle 139), still dormant. The spark produced 640K insertions but no review, no commit, no follow-up. Pattern: activate → generate → go dormant → output rots.

### Proposed Solution
1. After agent activation, schedule follow-up review within 24h
2. Require commit review before agent session ends
3. If agent goes dormant mid-task, flag output as "incomplete" in MEMORY.md
4. Never activate agents on known-bad models (kimi-k2.6)
5. If no follow-up within 48h, auto-revert uncommitted changes