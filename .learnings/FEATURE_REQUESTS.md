# FEATURE_REQUESTS.md — SKINgenius Team
*Signals from sessions that suggest product or agent feature gaps*
*Last updated: 2026-07-13T21:49Z (Cycle 129)*

---

## [FRQ-20260622-001] Che heartbeat configuration management — reduce CEO spam from ~24/day to 2/day

**Captured**: 2026-06-21T09:37:00Z
**Source**: Pulse Cycles 65-129 — CEO session analysis
**Priority**: critical
**Status**: active (CONFIRMED ~93% cron/Che dispatch in C129 24h — 1397 total sessions, rate ~24/day, flagged 65+ cycles with no action)

### Problem
CEO agent receives status-check dispatches from Che agent's heartbeat (every 30-60m). Total sessions: **1397**. ~93% of recent 24h sessions are cron/Che dispatch (25/27). All-time recent sessions: 100% Che/cron dispatch. Zero human interactions in 10+ days. Over 1397 total sessions, the vast majority are cron self-talk. This is NOT manageable via gateway cron API — it's Che's `heartbeat.every` config.

### Proposed Solution
1. Reduce Che `heartbeat.every` from 30m to 12h (or 6h at minimum)
2. Or: remove CEO dispatch from Che heartbeat, keep only direct reporting
3. Or: add dedup logic to CEO — skip status check if last report was <6h ago
4. Target: 2 CEO status reports per day, not 24+

### Data (Cycle 129)
- Total CEO sessions: 1397 (unchanged from C128)
- Last 24h: 27 sessions (25 cron dispatch, 2 Che heartbeat, 0 human)
- Human interactions: 0 (confirmed: no human interactions in last 10+ days)
- Rate: ~24/day (stable)
- Cron/Che dispatch ratio: ~93% (up from ~88%)

---

## [FRQ-20260622-002] Populate HEARTBEAT.md with periodic tasks or disable heartbeat — 100% no-op waste

**Captured**: 2026-06-21T21:37:00Z
**Source**: Pulse Cycles 66-129 — meta agent heartbeat analysis
**Priority**: high
**Status**: proposed (flagged 65+ cycles, no action taken)

### Problem
Meta agent's heartbeat fires regularly but HEARTBEAT.md doesn't exist as a file. 100% of heartbeat sessions produce empty-response messages. This wastes tokens and agent compute.

### Proposed Solution
1. Create HEARTBEAT.md with periodic tasks: check git status, verify cron health, check agent activity, run qmd update
2. Or reduce heartbeat frequency when no tasks are defined
3. Or disable heartbeat entirely and rely on Pulse cron (12h) for all meta tasks

---

## [FRQ-20260622-003] QMD GPU acceleration — Vulkan SDK for faster embeddings

**Captured**: 2026-06-25T09:37:00Z
**Source**: Pulse Cycles 77-129 — QMD embed testing
**Priority**: medium (elevated from low due to embed hang)
**Status**: proposed (CPU works but slow; NEW: qmd embed hangs on both collections — 2 consecutive cycles)

### Problem
QMD embed falls back to CPU which works but is slower (15s for 22 chunks). Not critical but could be improved. **CONFIRMED in C128-C129**: `qmd embed` command hangs indefinitely on both collections — may be related to CPU-only processing or collection size.

### Proposed Solution
1. Investigate qmd embed hang (2nd consecutive cycle)
2. Install Vulkan SDK on the host to enable GPU acceleration for QMD embeddings
3. Consider reducing collection size or batching embed operations

---

## [FRQ-20260703-004] Auto-escalation mechanism — Pulse should have graduated alert paths

**Captured**: 2026-07-03T21:37:00Z
**Source**: Pulse Cycles 64-129 — governance gap analysis
**Priority**: critical
**Status**: proposed (65+ cycles of escalation failure)

### Problem
129 consecutive Pulse cycles have flagged the same 5 critical issues (API keys, CEO spam, dormant agents, heartbeat waste, stasis) with ZERO structural changes enacted. The current escalation model (write to MEMORY.md, .learnings/, send to CEO) is ineffective because:
1. CEO is ~93% cron/Che dispatch — human messages are invisible
2. Pulse has no authority to enact structural changes
3. No graduated escalation path (just repeated flags)
4. No direct notification to Jason (agent-to-agent messaging disabled, Telegram bot token missing)
5. **No human interaction across ANY agent** — project completely unstaffed (10+ days)

### Proposed Solution
1. **Direct notification**: Configure Telegram bot for skingenius-meta to send DMs to Jason for critical security items
2. **Escalation tiers**: 
   - Tier 1 (Cycles 1-3): Log to .learnings/
   - Tier 2 (Cycles 4-10): Send summary to CEO
   - Tier 3 (Cycles 11-20): Send direct message to Jason
   - Tier 4 (Cycles 20+): Send urgent security alert to Jason
3. **Auto-execute authority**: Grant Pulse limited authority to auto-rotate API keys and modify Che heartbeat after N cycles of no response
4. **Stasis detection**: If 30+ consecutive cycles show no structural change, trigger a "stasis alarm" with distinct formatting

### Data
- 129 consecutive cycles with zero structural changes
- 5 critical items flagged 65+ times each
- CEO dispatch ratio: ~93% cron/Che (24h), 100% all-time recent
- API keys unrotated for 28 days across 65+ cycles
- CEO session count: 1397
- **No human interaction across any agent** (10+ days)

---

## [FRQ-20260704-005] ~~Investigate CEO session count explosion~~ — RESOLVED

**Captured**: 2026-07-04T21:37:00Z
**Source**: Pulse Cycles 104-105 — CEO session count analysis
**Priority**: N/A (resolved)
**Status**: RESOLVED — previous reports of accelerating CEO sessions were due to counting trajectory files alongside session files. Actual count is ~24/day baseline, STABLE.

---

## [FRQ-20260710-006] QMD collection naming — RESOLVED

**Captured**: 2026-07-10T21:37:00Z
**Source**: Pulse Cycle 121 — QMD collection discovery
**Priority**: low
**Status**: resolved (working with current names)

---

## [FRQ-20260711-007] QMD CLI not on PATH — RESOLVED

**Captured**: 2026-07-11T21:37:00Z
**Source**: Pulse Cycles 123-129 — qmd CLI check
**Priority**: low
**Status**: RESOLVED — qmd CLI found at /home/linuxbrew/.linuxbrew/bin/qmd

---

## [FRQ-20260713-008] Graphify drift — 5 new .md files since last run, below update threshold

**Captured**: 2026-07-13T21:49:00Z
**Source**: Pulse Cycle 129 — workspace scan
**Priority**: low
**Status**: monitoring (below 10-file threshold)

### Problem
5 new .md files (3 workspace + 2 Obsidian) have been created since the last graphify run on Jul 13 07:02. Below the 10-file update threshold. No action needed this cycle.

### Proposed Solution
Run graphify update when 10+ new files accumulate: `graphify /home/jason/.openclaw/workspaces/skingenius --update --obsidian --obsidian-dir /home/jason/.openclaw/obsidian-vault/skingenius`

---

## [FRQ-20260713-009] Git drift — 25+ uncommitted files growing, no commits since June 21

**Captured**: 2026-07-13T21:49:00Z
**Source**: Pulse Cycle 129 — git status scan
**Priority**: medium
**Status**: new (first cycle flagging)

### Problem
Git status shows 25+ uncommitted files including:
- Clinical scan research documents (4 files)
- Facial aesthetics components and API routes (7+ files)
- Condition-ingredient mapping database (2 files)
- Supabase migrations (2 files)
- Seed scripts (2 files)
- Modified source files (recommendations engine, scan results page)

These represent substantial work that is at risk of loss. No commits have been made since June 21 (23 days ago).

### Proposed Solution
1. Create a feature branch and commit the accumulated work
2. Prioritize committing the clinical scan research, condition mappings, and facial aesthetics components
3. Set up a git hook or cron to auto-stage and commit workspace docs periodically