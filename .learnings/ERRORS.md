# ERRORS.md — SKINgenius Team
*Recurring errors and their resolutions*
*Last updated: 2026-06-21T09:37Z (Cycle 65)*

---

## [ERR-20260621-001] Pulse delivery FIXED — Telegram chat_id -5110202082 replaced with -1002227616648

**First seen**: 2026-06-18T00:00:00Z (Cycle 61)
**Resolved**: 2026-06-21T04:09:00Z (Cycle 65)
**Frequency**: Was 3+ consecutive cycles of failed delivery
**Agent**: skingenius-meta (Pulse)
**Status**: ✅ RESOLVED

### Error
Pulse cron delivery was failing with "Telegram chat_id -5110202082 not found". This was the Telegram target for improvement reports. Three consecutive cycles (61-64) had no successful delivery.

### Resolution
Telegram delivery target changed from `-5110202082` (not found) to `-1002227616648` (working group). Cycle 65 is the first cycle with confirmed working delivery.

### Prevention
Monitor delivery success in next 2-3 cycles. If delivery fails again, verify group chat ID hasn't changed.

---

## [ERR-20260620-001] CEO cron over-firing — 24 sessions/day, NOT manageable via gateway cron API

**First seen**: 2026-06-15T00:00:00Z
**Last seen**: 2026-06-21T09:37:00Z
**Frequency**: 24 sessions in 24h (unchanged from Cycle 64, target is 2/day)
**Agent**: skingenius-ceo
**Status**: ACTIVE — CRITICAL, WASTING RESOURCES

### Error
CEO cron (`90d8d5a5`) continues to over-fire. 24/day, firing approximately every hour via Che heartbeat dispatch. Each session consumes ~40KB. Total: 851+ sessions, ~34MB, ~99% cron-driven. All sessions in last 12h confirmed as Che heartbeat dispatches.

### Root Cause (Confirmed Cycle 64)
The cron is NOT a gateway cron job — it's the Che agent's heartbeat config that dispatches status checks to CEO every 30 minutes (48/day in Cycle 58, now ~24/day). Cannot be managed via gateway cron API.

### Workaround Needed
Fix Che agent's `heartbeat.every` config: reduce from 30m to 12h, or remove CEO dispatch entirely. This requires Jason to modify Che's agent configuration.

---

## [ERR-20260620-003] Meta agent turn failure rate improved from 16% to ~2%

**First seen**: 2026-06-20T21:37:00Z (Cycle 64)
**Last seen**: 2026-06-21T09:37:00Z (Cycle 65)
**Frequency**: Was 12/74 (16%) in Cycle 64, now 2/88 (~2%) in Cycle 65
**Agent**: skingenius-meta
**Status**: ✅ IMPROVING

### Error
Meta agent (Pulse) had 16% turn failure rate in Cycle 64. In Cycle 65, this improved to ~2% (2/88 turns had error mentions).

### Improvement
The improvement is likely due to model stability (glm-5.1:cloud). Only 2 error mentions found in last session, both related to Telegram delivery (now fixed).

### Monitoring
Continue tracking over next 2-3 cycles. If failure rate returns to >10%, investigate model or context issues.

---

## [ERR-20260616-001] Dev agent kimi-k2.6 produces garbage output + leaks API keys

**First seen**: 2026-06-16T00:00:00Z
**Last seen**: 2026-06-16T12:04:00Z
**Frequency**: 1 session (session 01b319d3 entirely garbled)
**Agent**: skingenius-dev
**Status**: ACTIVE — agent dormant since, needs model change before reactivation

### Error
Dev agent (Pixel) using kimi-k2.6:cloud model produced entirely garbled output in session 01b319d3. Additionally, the same model leaked SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, and SUPABASE_ACCESS_TOKEN in plain text.

### Resolution Needed
1. **Switch dev agent model** from kimi-k2.6 to glm-5.1 or another reliable model
2. **Rotate ALL three leaked API keys** (6+ days unrotated — SECURITY INCIDENT)
3. Add env variable protection to agent guardrails

---

## [ERR-20260615-001] Cloudflare blocks dermatology sites — use ScrapeGraph with stealth

**First seen**: 2026-06-15T00:00:00Z
**Status**: ONGOING — known workaround

### Error
dermatologytimes.com and hcplive.com block automated scraping with Cloudflare challenges.

### Workaround
Use ScrapeGraph with `stealth: true` and `mode: "js"` for these sites.