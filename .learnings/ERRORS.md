# ERRORS.md — SKINgenius Team
*Recurring errors and their resolutions*
*Last updated: 2026-08-01T01:35Z (Cycle 139)*

---

## [ERR-20260628-001] CEO cron over-firing — 1487 sessions total, growth SLOWED (0 in last 24h)

**First seen**: 2026-06-15T00:00:00Z
**Last seen**: 2026-08-01T01:35:00Z (Cycle 139)
**Frequency**: Was ~24/day baseline, NOW 0 in last 24h — **POSSIBLY RESOLVED OR PAUSED**
**Agent**: skingenius-ceo
**Status**: MONITORING — growth slowed dramatically (+8 since C138 vs +15/cycle baseline)

### Error
CEO cron (`90d8d5a5`) was over-firing. Total sessions: **1487**. Growth rate dropped from ~15/cycle to 8 total since C138, and 0 sessions in last 24h. This is the first 0-session 24h window in 139+ cycles.

### Root Cause (Confirmed Cycle 64)
The cron was the Che agent's heartbeat config dispatching status checks to CEO every 30-60 minutes.

### New Signal (Cycle 139)
CEO session growth may have been throttled or paused. Monitor next 2-3 cycles to confirm:
- If CEO sessions remain near 1487 → Che dispatch throttled/paused (GOOD)
- If sessions resume growth → temporary gap, problem persists

---

## [ERR-20260627-002] Meta heartbeat no-op — RESOLVED (HEARTBEAT.md now exists)

**First seen**: 2026-06-20T21:37:00Z
**Last seen**: 2026-08-01T01:35:00Z (Cycle 139)
**Frequency**: Was every heartbeat session (2-4/day)
**Agent**: skingenius-meta
**Status**: ✅ RESOLVED — HEARTBEAT.md confirmed present (created May 14, was missing during Cycles 66-138)

### Error
Meta agent's heartbeat fired but HEARTBEAT.md didn't exist. 100% no-op waste for 74+ cycles.

### Resolution
HEARTBEAT.md now exists at `/home/jason/.openclaw/workspaces/skingenius/HEARTBEAT.md` (226 bytes, created 2026-05-14 but was absent during C66-C138, possibly recreated or path-fixed).

---

## [ERR-20260616-003] API keys leaked in dev session logs — 45 DAYS UNROTATED, 7TH WEEK+

**First seen**: 2026-06-16T00:00:00Z
**Last seen**: 2026-08-01T01:35:00Z (Cycle 139)
**Frequency**: Persistent exposure (keys still in session logs)
**Agent**: skingenius-dev
**Status**: ACTIVE — CRITICAL SECURITY INCIDENT (45 days, 7th week+)

### Error
SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, and SUPABASE_ACCESS_TOKEN leaked in dev session logs. STILL NOT ROTATED 45 days after discovery. Now in 7th week of exposure.

### Escalation
Flagged for 79+ consecutive Pulse cycles. Day 45. 7TH WEEK. CRITICAL.

---

## [ERR-20260616-004] Dev agent kimi-k2.6 produces garbage output — NOW DORMANT AGAIN

**First seen**: 2026-06-16T00:00:00Z
**Last seen**: 2026-07-19T00:00:00Z (Jul 19 agent spark)
**Frequency**: Per dev session using kimi-k2.6
**Agent**: skingenius-dev
**Status**: DORMANT — Dev reactivated Jul 19 on kimi-k2.6, output unverified, now dormant again

### Error
Dev agent using kimi-k2.6 model produces garbage output. Jul 19 spark used this model — 314KB session output quality unknown, git shows massive diffs (640K insertions) likely containing garbage code.

### Resolution
NOT RESOLVED. Model assignment persists. Dev dormant since Jul 19.

---

## [ERR-20260720-005] Telegram delivery broken — chat not found (6+ consecutive cycles, needs re-check)

**First seen**: 2026-07-15T00:00:00Z
**Last seen**: 2026-08-01T01:35:00Z (Cycle 139)
**Frequency**: Every Pulse cycle since C135 (6+ cycles)
**Agent**: skingenius-meta
**Status**: ACTIVE — primary escalation pathway blocked, needs re-verification

### Error
Chat `-1002227616648` returns "chat not found" for 6+ consecutive Pulse cycles. Bot likely removed from group or group migrated.

### Escalation
Flagged for 6+ cycles. No alternate delivery path established. This cycle will attempt delivery to re-verify status.