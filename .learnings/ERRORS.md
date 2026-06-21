# ERRORS.md — SKINgenius Team
*Recurring errors and their resolutions*
*Last updated: 2026-06-21T21:43Z (Cycle 67)*

---

## [ERR-20260621-003] CEO cron over-firing — 24 sessions/day, all Che heartbeat dispatches, NOT manageable via gateway cron API

**First seen**: 2026-06-15T00:00:00Z
**Last seen**: 2026-06-21T21:43:00Z
**Frequency**: 24 sessions in 24h (unchanged across Cycles 64-67, target is 2/day)
**Agent**: skingenius-ceo
**Status**: ACTIVE — CRITICAL, WASTING RESOURCES

### Error
CEO cron (`90d8d5a5`) continues to over-fire. 24/day, firing approximately every hour via Che heartbeat dispatch. Each session consumes ~30-60KB. Total: 899+ sessions, ~99% cron-driven. Zero human interactions in last 24h. All sessions produce near-identical status reports.

### Root Cause (Confirmed Cycle 64)
The cron is NOT a gateway cron job — it's the Che agent's heartbeat config that dispatches status checks to CEO every 30 minutes. Cannot be managed via gateway cron API.

### Workaround Needed
Fix Che agent's `heartbeat.every` config: reduce from 30m to 12h, or remove CEO dispatch entirely. This requires Jason to modify Che's agent configuration.

---

## [ERR-20260621-002] Meta heartbeat 100% no-op — HEARTBEAT.md empty, all turns wasted

**First seen**: 2026-06-20T21:37:00Z (Cycle 64)
**Last seen**: 2026-06-21T21:43:00Z (Cycle 67)
**Frequency**: Every heartbeat session (estimated 2-4/day)
**Agent**: skingenius-meta
**Status**: ACTIVE — wasting tokens

### Error
Meta agent's heartbeat fires regularly but HEARTBEAT.md has no tasks defined. Every heartbeat response is "HEARTBEAT.md is empty — no tasks defined. Nothing to check. NO_REPLY". This wastes tokens and agent time on every heartbeat cycle.

### Resolution Needed
1. Add periodic tasks to HEARTBEAT.md (check git status, verify cron health, check agent activity)
2. Or reduce heartbeat frequency when no tasks are defined
3. Or disable heartbeat entirely and rely on Pulse cron (12h) for all meta tasks

---

## [ERR-20260621-001] Pulse delivery FIXED — Telegram chat_id -5110202082 replaced with -1002227616648

**First seen**: 2026-06-18T00:00:00Z (Cycle 61)
**Resolved**: 2026-06-21T04:09:00Z (Cycle 65)
**Frequency**: Was 3+ consecutive cycles of failed delivery
**Agent**: skingenius-meta (Pulse)
**Status**: ✅ RESOLVED — STABLE for 3 consecutive cycles

### Error
Pulse cron delivery was failing with "Telegram chat_id -5110202082 not found". This was the Telegram target for improvement reports.

### Resolution
Telegram delivery target changed from `-5110202082` (not found) to `-1002227616648` (working group). Cycles 65-67 confirmed working delivery.

### Prevention
Monitor delivery success. If delivery fails again, verify group chat ID hasn't changed.

---

## [ERR-20260620-003] Meta agent turn failure rate improved from 16% to ~0%

**First seen**: 2026-06-20T21:37:00Z (Cycle 64)
**Last seen**: 2026-06-21T21:43:00Z (Cycle 67)
**Frequency**: Was 12/74 (16%) in Cycle 64, ~2% in Cycle 65, ~0% in Cycles 66-67
**Agent**: skingenius-meta
**Status**: ✅ RESOLVED

### Error
Meta agent (Pulse) had 16% turn failure rate in Cycle 64. Improved to ~2% in Cycle 65 and ~0% in Cycles 66-67. Model (glm-5.1:cloud) is stable.

### Resolution
Model stability resolved the issue. No action needed. Closing this error tracking.

**First seen**: 2026-06-16T00:00:00Z
**Last seen**: 2026-06-16T12:04:00Z
**Frequency**: 1 session (session 01b319d3 entirely garbled)
**Agent**: skingenius-dev
**Status**: ACTIVE — agent dormant since, needs model change before reactivation

### Error
Dev agent (Pixel) using kimi-k2.6:cloud model produced entirely garbled output in session 01b319d3. Also leaked SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, and SUPABASE_ACCESS_TOKEN in plain text.

### Resolution Needed
1. **Switch dev agent model** from kimi-k2.6 to glm-5.1 or another reliable model
2. **Rotate ALL three leaked API keys** (7+ days unrotated — SECURITY INCIDENT)
3. Add env variable protection to agent guardrails

---

## [ERR-20260615-001] Cloudflare blocks dermatology sites — use ScrapeGraph with stealth

**First seen**: 2026-06-15T00:00:00Z
**Status**: ONGOING — known workaround

### Error
dermatologytimes.com and hcplive.com block automated scraping with Cloudflare challenges.

### Workaround
Use ScrapeGraph with `stealth: true` and `mode: "js"` for these sites.