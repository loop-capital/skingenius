# IMPROVEMENTS.md — SKINgenius Team
*Validated improvements applied to agents, workflows, or architecture*
*Last updated: 2026-06-21T09:37Z (Cycle 65)*

## [IMP-20260621-001] Pulse Cycle 65 — Delivery fixed, git committed, turn failure improved, but CEO spam continues, API keys 6+ days unrotated, 9/11 agents dormant

**Applied**: 2026-06-21T09:37:00Z
**Impact**: mixed (3 improvements, 4 worsening issues)
**Area**: reliability + project-execution + agent-health

### What Improved (Cycle 65)
1. ✅ **PULSE DELIVERY FIXED**: Telegram target changed from `-5110202082` (not found) to `-1002227616648` (working). 3+ cycles of failed delivery now resolved.
2. ✅ **GIT COMMITS DONE**: 4 commits on June 21, 214 files committed. Only 2 files remain modified (DREAMS.md, MEMORY.md).
3. ✅ **META TURN FAILURE RATE IMPROVED**: From 16% (12/74) to ~2% (2/88). Model (glm-5.1:cloud) now stable.
4. ✅ **UNCOMMITTED FILES REDUCED**: From 349 to 2. Data loss risk dramatically reduced.

### What Worsened (Cycle 65)
1. 🔴 **CEO CRON 24/DAY UNCHANGED**: Still ~1/hour via Che heartbeat. 12 sessions in last 12h, all Che dispatches. ~960KB/day waste.
2. 🔴 **API KEYS UNROTATED 6+ DAYS**: SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, SUPABASE_ACCESS_TOKEN. Worsening from 5+ to 6+ days.
3. 🔴 **9/11 AGENTS DORMANT 5-37 DAYS**: Dev now dormant 5d. Zero feature velocity. 16 days to MVP.
4. 🔴 **ZERO FEATURE VELOCITY**: No dev activity for 5 days. No agents activated.

### Key Metrics (Cycle 65)
- CEO sessions (12h): 12 (unchanged, ~24/day)
- CEO total sessions: 851+ 
- CEO daily token waste: ~960 KB/day
- Meta turn failure rate: ~2% (↓ from 16%)
- Pulse delivery: ✅ WORKING
- Pulse cron: 0 consecutive errors (stable since Cycle 62)
- Other agents (24h): 0
- Uncommitted files: 2 (↓ from 349)
- Days since API key exposure: 6+
- Days since last commit: 0 (commit done June 21)
- Last commit: 413ca9f (June 21)
- MVP deadline: 16 days (July 7)

### Action Items (Priority Order)
1. **CRITICAL**: Fix Che heartbeat — reduce from 30m to 12h or remove CEO dispatch. Requires Jason.
2. **CRITICAL**: Rotate 3 leaked API keys (6+ days — SECURITY INCIDENT worsening)
3. **HIGH**: Reactivate dev agents or reduce MVP scope — 16 days to deadline with zero velocity
4. **HIGH**: Switch dev agent model from kimi-k2.6 to glm-5.1 before reactivation
5. **MEDIUM**: Monitor meta turn failure rate — if stays <5% for 3 cycles, close ERR-20260620-003
6. **MEDIUM**: Add tasks to HEARTBEAT.md or disable meta heartbeat (18% no-op waste)
7. **LOW**: Consider reducing CEO cron to 2/day for status reports