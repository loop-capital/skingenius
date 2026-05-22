# ERRORS.md — SKINgenius Team
*Recurring errors and their resolutions*

---

## [ERR-20260521-001] Missing daily notes — ENOENT on memory/YYYY-MM-DD.md (recurring every CEO session)

**First seen**: 2026-05-20T10:00:00Z
**Last seen**: 2026-05-21T17:00:00Z
**Frequency**: chronic (2-3 occurrences per CEO session × 20+ sessions/day)
**Agent**: skingenius-ceo
**Status**: open

### Error
`ENOENT: no such file or directory, access '/home/jason/.openclaw/workspaces/skingenius/memory/2026-05-20.md'` and `memory/2026-05-21.md` — both missing.

Every CEO check-in session tries to read the current and previous day's daily note, but only 3 daily notes exist (May 10, 14, 18). This produces 2 ENOENT errors per session.

### Root Cause
Daily notes are not being created automatically. The CEO agent's check-in routine assumes they exist but they're only created manually.

### Prevention
1. Pulse should create a daily note stub during each improvement cycle
2. CEO agent should gracefully handle missing daily notes

---

## [ERR-20260521-002] EISDIR when reading memory/ directory path

**First seen**: 2026-05-20T10:00:00Z
**Last seen**: 2026-05-21T17:00:00Z
**Frequency**: recurring
**Agent**: skingenius-ceo
**Status**: open

### Error
`EISDIR: illegal operation on a directory, read` when CEO agent constructs a path to `memory/` (directory) instead of `memory/YYYY-MM-DD.md` (file).

### Root Cause
CEO agent's file-reading logic sometimes uses the directory path directly instead of constructing a proper file path.

### Prevention
Add path validation in CEO's file reading to distinguish files from directories.

------

## [ERR-20260514-001] xiaomi-b mimo-v2-pro quota exhaustion (429)

**First seen**: 2026-05-14T04:17:00Z
**Last seen**: 2026-05-14T09:27:00Z
**Frequency**: chronic
**Agent**: skingenius-ceo (all 5 check-in sessions)
**Status**: resolved

### Error
HTTP 429 "quota exhausted" from xiaomi-b provider when calling mimo-v2-pro model. Every attempt across 5 separate sessions failed with this error.

### Root Cause
The xiaomi-b/mimo-v2-pro model hit its rate limit or account quota. This affected all cron-triggered sessions for skingenius-ceo.

### Resolution
Quota recovered after ~5 hours. Subsequent sessions (May 14 09:35+) completed successfully with mimo-v2-pro.

### Prevention
1. Add alternative model fallbacks in agent configuration (glm-5.1:cloud works)
2. Implement quota monitoring with alerts
3. Consider reducing check-in frequency during off-hours to conserve quota

---

## [ERR-20260514-002] kimi-k2-thinking:cloud Internal Server Error (500)

**First seen**: 2026-05-14T05:20:00Z
**Last seen**: 2026-05-14T09:27:00Z
**Frequency**: chronic
**Agent**: skingenius-ceo (all 5 fallback attempts)
**Status**: resolved

### Error
HTTP 500 Internal Server Error from kimi-k2-thinking:cloud when used as fallback after mimo-v2-pro failures.

### Root Cause
The kimi-k2-thinking:cloud model was experiencing server-side errors. Not a rate limit issue.

### Resolution
kimi-k2.6:cloud (the production model for dev/research/design agents) remained stable throughout. kimi-k2-thinking:cloud eventually recovered.

### Prevention
1. Add glm-5.1:cloud as a more reliable fallback
2. Deprioritize kimi-k2-thinking:cloud from fallback chain until stability improves

---

## [ERR-20260514-003] Cron job execution timeout after model failures

**First seen**: 2026-05-14T04:17:00Z
**Last seen**: 2026-05-14T09:27:00Z
**Frequency**: recurring
**Agent**: skingenius-ceo
**Status**: resolved

### Error
"aborted | cron: job execution timed out" — After model failures exhaust retries, the cron job eventually times out and aborts.

### Root Cause
Retry mechanism spends all budget on failing models, then cron timeout kicks in before any successful response.

### Resolution
Models recovered after ~5 hours. Cron jobs resumed successfully.

### Prevention
1. Configure faster failover between models
2. Reduce retry count for 429 errors
3. Set per-model timeout shorter than overall cron timeout

---

## [ERR-20260514-004] Isolated sub-agent component files lack integration context

**First seen**: 2026-05-14T17:31:00Z
**Last seen**: 2026-05-14T17:31:00Z
**Frequency**: once
**Agent**: skingenius-dev, skingenius-design
**Status**: open

### Error
Sub-agents (dev and design) produced component files without awareness of each other's work or the project's existing component architecture.

### Root Cause
Sub-agents are spawned with minimal context about the existing project state.

### Resolution
Not yet resolved. Components need review and integration.

### Prevention
1. Inject current project state into sub-agent context
2. Add post-creation validation step to verify component compatibility
3. Create a component registry or index file that agents can reference

---

## [ERR-20260515-001] Brave Search API 402 — quota exhausted

**First seen**: 2026-05-14T18:57:00Z
**Last seen**: 2026-05-15T08:24:00Z
**Frequency**: chronic
**Agent**: skingenius-marketing, skingenius-research
**Status**: open

### Error
All web_search calls return HTTP 402 with "Usage limit exceeded" (plan: Search, current_spend: $5.0, usage_limit: $5.0).

### Root Cause
The Brave Search API free tier ($5/month) has been exhausted. Research and marketing agents require many search queries.

### Resolution
Not resolved. Agents fell back to web_fetch for direct URL access but couldn't perform general searches.

### Prevention
1. Upgrade Brave Search API plan or add billing
2. Implement search quota monitoring with early alerts
3. Cache search results to avoid redundant queries
4. Consider alternative search providers

---

## [ERR-20260515-002] wiki_apply validation failures — "op must be equal to constant"

**First seen**: 2026-05-14T21:50:00Z
**Last seen**: 2026-05-14T22:10:00Z
**Frequency**: recurring
**Agent**: skingenius-research
**Status**: open

### Error
All wiki_apply calls fail with validation errors: "op: must be equal to constant" and "op: must match a schema in anyOf".

### Root Cause
The wiki_apply tool schema has changed or the agent is using incorrect operation format.

### Resolution
Not resolved. Research agent fell back to writing files directly to the workspace filesystem.

### Prevention
1. Document correct wiki_apply operation formats in agent instructions
2. Add example wiki_apply calls to research agent MEMORY.md
3. Test wiki_apply with current schema to identify correct format

---

## [ERR-20260515-003] Subagent spawn limit hit (4/4)

**First seen**: 2026-05-14T18:57:00Z
**Last seen**: 2026-05-15T08:24:00Z
**Frequency**: recurring
**Agent**: skingenius-marketing, skingenius-dev
**Status**: mitigated

### Error
"sessions_spawn has reached max active children for this session (4/4)" — agents couldn't spawn 5th+ subagent.

### Root Cause
OpenClaw limits concurrent subagent spawns to 4 per session.

### Resolution
Agents now yield and wait for existing subagents to complete before spawning more. The knowledge graph build (12+ sub-sessions) completed by batching.

### Prevention
1. Document the 4-subagent limit in agent instructions
2. Batch research into groups of 4 or fewer
3. Use sequential research for lower-priority targets

---

## [ERR-20260515-004] ShareResultsScreen.tsx has pre-existing TS error

**First seen**: 2026-05-14T18:41:00Z
**Last seen**: 2026-05-14T18:41:00Z
**Frequency**: once
**Agent**: skingenius-design
**Status**: open

### Error
TypeScript compilation error in src/screens/share/ShareResultsScreen.tsx: "JSX element 'ScrollView' has no corresponding closing tag" at line 132.

### Root Cause
Pre-existing code issue — unclosed ScrollView tag in the component.

### Resolution
Not yet resolved. Noted but not in scope of the design agent's task.

### Prevention
Add pre-commit type checking to catch JSX errors before they accumulate.

---

## [ERR-20260515-005] CEO check-in crons wasting tokens on redundant status reports

**First seen**: 2026-05-15T04:03:00Z
**Last seen**: 2026-05-18T21:37:00Z
**Frequency**: chronic (28+ occurrences in 72+ hours)
**Agent**: skingenius-ceo
**Status**: open

### Error
Not a technical error, but a process error: CEO check-in crons run hourly and produce status reports that merely summarize existing MEMORY.md content with no new information, decisions, or blockers. Now at 28+ redundant sessions across 72+ hours.

### Root Cause
No conditional skip logic. The cron fires every hour regardless of whether anything has changed since the last check-in.

### Resolution
Not resolved. ESCALATED — see ERR-20260518-003 for continuation. Estimated ~168K tokens/week wasted.

### Prevention
1. **URGENT**: Reduce cron frequency to 4h minimum during steady-state
2. Add git diff / file mtime check before generating full status
3. Make check-ins event-driven (sub-agent completion triggers check-in)
4. Add a "no changes detected" abbreviated output mode

---

## [ERR-20260515-006] Research sessions with extremely high error counts

**First seen**: 2026-05-14T03:39:00Z
**Last seen**: 2026-05-15T08:24:00Z
**Frequency**: recurring
**Agent**: skingenius-research
**Status**: open

### Error
Research agent sessions have disproportionately high error counts. Top 3: 67cacd3c (61 errors), afb995ad (39), 42886152 (38). Primary errors are Brave Search API 402 and web_fetch 404s.

### Root Cause
Brave Search API quota ($5/month) exhausted, and competitor URLs are frequently invalid or blocking.

### Resolution
Not resolved. Same root cause as ERR-20260515-001.

### Prevention
1. Upgrade Brave Search API plan
2. Cache search results to avoid redundant queries
3. Add alternative search provider
4. Pre-validate URLs before fetching

---

## [ERR-20260516-001] CEO check-in token waste continues — 8+ redundant sessions

**First seen**: 2026-05-16T04:52:00Z
**Last seen**: 2026-05-18T21:37:00Z
**Frequency**: chronic (28+ sessions in 72+ hours)
**Agent**: skingenius-ceo
**Status**: open — SUPERSEDED BY ERR-20260518-003

### Error
CEO check-in crons producing near-identical status reports hourly with no new information, decisions, or blockers. Each session consumes ~5-6K tokens.

### Root Cause
No conditional skip logic. Pattern continues from ERR-20260515-005. See ERR-20260518-003 for latest status.

### Resolution
Not resolved. See ERR-20260518-003.

### Prevention
See ERR-20260518-003 for full prevention list.

---

## [ERR-20260516-002] Brand scraping sub-agents results still pending after 48+ hours

**First seen**: 2026-05-14T18:57:00Z
**Last seen**: 2026-05-16T14:06:00Z
**Frequency**: chronic
**Agent**: skingenius-ceo (reporting)
**Status**: stale

### Error
4 brand scraping sub-agents launched May 14 (Aesop, PCA Skin, SkinCeuticals/ZO, BR/iS Clinical/Osmosis/Environ) with 188 products expected, but results have not been confirmed in any subsequent status report.

### Root Cause
Sub-agents may have completed but results weren't captured, or they may have failed silently. No progress tracking mechanism exists for dynamically-spawned research agents.

### Resolution
Stale — no status report since May 16 has updated this item. Likely the sub-agents timed out or their results were lost. Brand data should be re-scraped when search API quota is available.

### Prevention
1. Add research-progress.md that sub-agents update on completion
2. Add post-spawn verification step
3. Consider making research agents persistent instead of on-demand

---

## [ERR-20260518-001] QMD embed --force causes OOM kill on CPU-only system

**First seen**: 2026-05-18T16:00:00Z
**Last seen**: 2026-05-18T21:37:00Z
**Frequency**: recurring (3+ attempts)
**Agent**: skingenius-meta
**Status**: open

### Error
Running `qmd embed --force` gets OOM-killed on the CPU-only host. The `--force` flag clears ALL vectors across ALL collections (not just the target), causing massive memory usage during re-embedding.

### Root Cause
The host has no GPU/Vulkan support. Re-embedding 1852+ files simultaneously exceeds available memory. The `--force` flag is a global operation, not per-collection.

### Resolution
Not resolved. Workaround: use incremental embed (`qmd embed` without `--force`) which runs on CPU but is very slow (1260 files still pending after multiple sessions).

### Prevention
1. Never use `--force` on CPU-only systems
2. Run incremental embed during off-peak hours
3. Investigate GPU/Vulkan acceleration
4. Add per-collection force option to QMD

---

## [ERR-20260518-002] skingenius-meta session 11 consecutive assistant turn failures

**First seen**: 2026-05-18T09:15:00Z
**Last seen**: 2026-05-18T17:00:00Z
**Frequency**: recurring
**Agent**: skingenius-meta
**Status**: resolved

### Error
Meta agent session ea96798b experienced 11 consecutive "assistant turn failed before producing content" errors during the Sprint 1 intelligence refresh.

### Root Cause
Model instability (likely kimi-k2.6:cloud or mimo-v2-pro). The session was eventually recovered via checkpoint restart.

### Resolution
Recovered after checkpoint restart. Subsequent turns completed successfully.

### Prevention
1. Add retry with model fallback for failed assistant turns
2. Implement automatic checkpoint recovery after N consecutive failures
3. Consider adding a health-check turn at session start

---

## [ERR-20260518-003] CEO check-in redundancy continues — 28+ identical sessions in 72 hours

**First seen**: 2026-05-15T04:03:00Z
**Last seen**: 2026-05-18T21:37:00Z
**Frequency**: chronic (28+ occurrences)
**Agent**: skingenius-ceo
**Status**: open

### Error
CEO check-in crons have produced 28+ near-identical status reports since May 15. Each session (~5-6K tokens) recycles the same MEMORY.md content with zero new information, decisions, or blockers.

### Root Cause
No conditional skip logic. The cron fires every hour regardless of whether anything has changed. Escalated from ERR-20260515-005 (20+ in 48h) and ERR-20260516-001 (8+ in 10h).

### Resolution
Not resolved. Pattern continues and is now at 28+ redundant sessions. Estimated ~168K tokens wasted per week.

### Prevention
1. **URGENT**: Reduce cron frequency to 4h minimum
2. Add git diff / file mtime check before generating full status
3. Make check-ins event-driven (sub-agent completion triggers check-in)
4. Add a "no changes detected" abbreviated output mode

---

## [ERR-20260518-004] Brave Search API quota still exhausted (4+ days)

**First seen**: 2026-05-14T18:57:00Z
**Last seen**: 2026-05-18T21:37:00Z
**Frequency**: chronic
**Agent**: skingenius-research, skingenius-marketing
**Status**: open

### Error
Brave Search API free tier ($5/month) has been exhausted since May 14 (4+ days). All web_search calls return HTTP 402 with "Usage limit exceeded".

### Root Cause
The Brave Search API free tier ($5/month) was consumed within the first 2 weeks. Research and marketing agents require many search queries.

### Resolution
Not resolved. Research agent has fallen back to Google Scholar for clinical searches. Marketing agent cannot perform competitor research effectively.

### Prevention
1. Upgrade Brave Search API plan or add billing
2. Implement search quota monitoring with early alerts
3. Cache search results to avoid redundant queries
4. Add Google Scholar and DuckDuckGo as fallback search providers

---

## [ERR-20260518-005] Dev agent 4 consecutive assistant turn failures

**First seen**: 2026-05-17T00:00:00Z
**Last seen**: 2026-05-17T23:59:00Z
**Frequency**: once
**Agent**: skingenius-dev
**Status**: open

### Error
skingenius-dev session bc15c591 experienced 4 consecutive "assistant turn failed before producing content" errors when trying to process the on-device AI architecture for SKINgenius.

### Root Cause
Model reliability issue. The dev agent model (kimi-k2.6:cloud) may have had a transient outage or the task context was too large.

### Resolution
Not resolved. The on-device AI architecture work was not completed.

### Prevention
1. Add retry with model fallback for failed turns
2. Split large context tasks into smaller chunks
3. Check model health before spawning sub-agents for complex tasks

---

## [ERR-20260519-001] CEO cron check-in spawning 12+ redundant sessions per 12h cycle

**First seen**: 2026-05-18T22:44:00Z
**Last seen**: 2026-05-19T08:59:00Z
**Frequency**: chronic
**Agent**: skingenius-ceo
**Status**: open

### Error
The CEO check-in cron (cron:90d8d5a5) triggered 12 sessions in 12 hours, each producing near-identical output. This wastes ~150K tokens/session cycle and provides zero incremental value.

### Root Cause
Cron schedule is too aggressive (appears hourly). Each session independently reads same stale data and regenerates the same status report. No deduplication or change-detection mechanism.

### Resolution
Not resolved.

### Prevention
1. Reduce cron frequency to 2x/day (morning + evening)
2. Add change-detection: only generate full report if data has changed since last check-in
3. Store last-report-hash in MEMORY.md for quick comparison
4. Consider condensing check-ins to only surface DELTAS

---

## [ERR-20260519-002] Critical path agents dormant — 0 sessions in 24h

**First seen**: 2026-05-15T00:00:00Z
**Last seen**: 2026-05-19T21:37:00Z
**Frequency**: chronic
**Agent**: skingenius-architect, skingenius-devops
**Status**: open

### Error
The two agents assigned to all 5 critical path tasks (skingenius-architect=Dermis, skingenius-devops=Forge) have had zero sessions in the last 24 hours. All critical path tasks remain at [ ] pending after 6+ days.

### Root Cause
Agents may not be properly activated, or their cron triggers are not firing. No sessions were found for either agent in the last 24h scan window. This has persisted across 3 consecutive Pulse cycles (cycles 4, 5, 6) with no corrective action.

### Resolution
Not resolved.

### Prevention
1. Add agent activity monitoring to Pulse cycle
2. Alert when assigned agents have 0 sessions for 24h+
3. Implement task reassignment fallback: if agent dormant for 48h, redistribute to active agents
4. Add agent health check endpoint to Pulse cycle

---

## [ERR-20260519-003] CEO cron redundancy worsening — 24 sessions in 24h producing identical reports

**First seen**: 2026-05-16T00:00:00Z
**Last seen**: 2026-05-19T21:37:00Z
**Frequency**: chronic
**Agent**: skingenius-ceo
**Status**: open

### Error
CEO check-in cron (cron:90d8d5a5) produced 24 sessions in 24 hours (up from 12 in 12h last cycle). All sessions produce near-identical output. Despite being flagged in cycles 4 and 5, no corrective action was taken.

### Root Cause
Cron frequency is too high (hourly or more). No change-detection or deduplication mechanism. MEMORY.md is 4 days stale, causing all reports to read identical data.

### Resolution
Not resolved. Recommendation from cycle 5 was not implemented.

### Prevention
1. **URGENT**: Reduce cron frequency to 2x/day maximum
2. Add report fingerprint hashing to skip duplicate content
3. Update MEMORY.md after every significant sprint event

---

## [ERR-20260519-004] No agent MEMORY.md files exist — zero session-to-session context persistence

**First seen**: 2026-05-19T21:37:00Z
**Last seen**: 2026-05-20T09:37:00Z
**Frequency**: chronic
**Agent**: all skingenius agents
**Status**: in-progress

### Error
None of the 11 skingenius agent directories contain a MEMORY.md file. This means every agent session starts with zero accumulated knowledge from previous work sessions. Flagged in cycles 6 and 7.

### Root Cause
Agent MEMORY.md files were never created. The agent configuration doesn't auto-generate them, and no one created them manually.

### Resolution
In progress — Pulse cycle 7 will create MEMORY.md files for all active agents.

### Prevention
1. Create MEMORY.md for each agent during Pulse cycle ✅ (this cycle)
2. Update agent MEMORY.md after significant sessions
3. Add MEMORY.md existence check to Pulse monitoring

---

## [ERR-20260520-001] CEO cron check-in redundancy reaches 23 sessions/24h — estimated 345K tokens wasted daily

**First seen**: 2026-05-15T04:03:00Z
**Last seen**: 2026-05-20T09:37:00Z
**Frequency**: chronic (50+ sessions across 5+ days)
**Agent**: skingenius-ceo
**Status**: open

### Error
CEO check-in cron (cron:90d8d5a5) produced 23 sessions in the last 24 hours, all producing near-identical status reports with zero tool calls. Pattern has persisted across 3 Pulse cycles (5, 6, 7) with no corrective action taken. Estimated cumulative token waste: 800K+ tokens across 5+ days.

### Root Cause
No conditional skip logic. Cron fires hourly. Each session independently reads stale MEMORY.md (last updated May 15) and regenerates the same 5-bullet summary. No change-detection mechanism.

### Resolution
Not resolved. ESCALATION: This error has been flagged 3 times (cycles 5, 6, 7) without any corrective action.

### Prevention
1. **URGENT**: Reduce cron frequency to 2x/day
2. Add change-detection (hash MEMORY.md, skip if unchanged)
3. Store last-report-hash in workspace
4. Make check-ins delta-only (only report what CHANGED)

---

## [ERR-20260520-002] Critical path tasks stalled 7+ days — architect and devops agents never activated

**First seen**: 2026-05-13T00:00:00Z
**Last seen**: 2026-05-20T09:37:00Z
**Frequency**: chronic (7+ days)
**Agent**: skingenius-architect, skingenius-devops
**Status**: open

### Error
All 5 critical path tasks have been at [ ] pending for 7+ days. Assigned agents (skingenius-architect, skingenius-devops) have zero sessions since creation. No corrective action taken despite being flagged in 3 consecutive Pulse cycles.

### Root Cause
The architect and devops agents were configured but never activated (no cron triggers, no manual sessions). Their tasks are blockers for 15+ downstream tasks.

### Resolution
Not resolved. Jason needs to intervene to activate these agents or reassign their tasks.

### Prevention
1. Add agent health monitoring to detect dormant agents
2. Implement 48h escalation: if agent dormant for 48h+, redistribute tasks
3. Add cron triggers for architect and devops agents
---

## [ERR-20260520-003] Dev subagent tool validation errors — update_plan and write missing required fields

**First seen**: 2026-05-20T14:45:00Z
**Last seen**: 2026-05-20T14:50:00Z
**Frequency**: recurrent (per subagent spawn)
**Agent**: skingenius-dev (Pixel)
**Status**: open

### Error
Subagent sessions for MANA Labs integration repeatedly hit tool validation errors:
1. `update_plan` — "plan.0.step: must have required properties step" (5 times in one session)
2. `write` — "path: must have required properties path, content" — called with empty arguments (3 times)
3. `edit` — "Could not find edits[0] in scan.ts. The oldText must match exactly including all whitespace and newlines."

### Root Cause
Subagent models (kimi-k2.6:cloud) appear to generate malformed tool call arguments. The `update_plan` calls had plan items with missing `step` property. The `write` calls had empty argument objects. These are model output formatting issues, not tool bugs.

### Resolution
Workaround: manual patching of scan.ts TypeScript errors. The tool calls were retried with correct arguments. However, this pattern will recur with every subagent spawn.

### Prevention
1. Add tool schema validation to subagent context instructions
2. Consider using models with better structured output for subagent tasks
3. Add pre-call validation step in agent instructions: "Always verify tool arguments before calling"

---

## [ERR-20260520-004] CEO check-in reports stale data — missed MANA Labs integration completion

**First seen**: 2026-05-20T16:57:00Z
**Last seen**: 2026-05-20T21:03:00Z
**Frequency**: chronic (every session)
**Agent**: skingenius-ceo (Nova)
**Status**: open

### Error
All CEO check-in sessions on May 20 reported "no new deliverables since May 18" despite significant new work completed on May 20:
- MANA Labs Product Scanner API (13 files)
- Database schema (002_mana_integration.sql)
- Knowledge graph condition addition (Excess Sebum)
- New docs: MANA-LABS-INTEGRATION-SPEC.md, EXCESS-SEBUM-ENLARGED-PORES.md, ANTI-AGING-PEPTIDES.md

### Root Cause
CEO check-in only reads MEMORY.md (last updated May 19) and searches memory for "completed" or "delivered" keywords. It does NOT scan the filesystem for recently modified files. The CEO has no mechanism to detect new code or new documents.

### Resolution
Not resolved. CEO continues reporting stale status.

### Prevention
1. Add filesystem change detection to CEO check-in: `find . -mmin -1440 -type f` to detect recent work
2. Update MEMORY.md after each significant deliverable (not just in Pulse cycles)
3. Add daily note creation after major milestones

---

## [ERR-20260521-001] CEO check-in cron redundancy — 5+ days, 80+ sessions, no fix applied

**First seen**: 2026-05-15T04:03:00Z
**Last seen**: 2026-05-21T09:37:00Z
**Frequency**: chronic (80+ sessions across 5+ days)
**Agent**: skingenius-ceo
**Status**: open — CRITICAL ESCALATION

### Error
CEO check-in cron (cron:90d8d5a5) has now produced 80+ redundant sessions across 5+ days, all regurgitating the same MEMORY.md content. This has been escalated in Pulse cycles 5-9 with ZERO corrective action taken. Estimated cumulative token waste: 1.2M+ tokens.

### Root Cause
No conditional skip logic. No change-detection. No report hashing. Cron fires hourly regardless of data staleness.

### Resolution
**NOT RESOLVED. This is the 5th consecutive Pulse cycle flagging this issue. No action has been taken.**

### Prevention
1. **URGENT**: Reduce cron frequency to 2x/day maximum
2. Add filesystem change detection (`find . -mmin -1440 -type f`)
3. Store last-report-hash for deduplication
4. Make check-ins delta-only

---

## [ERR-20260521-002] Critical path agents dormant 8+ days — architect and devops have zero sessions EVER

**First seen**: 2026-05-13T00:00:00Z
**Last seen**: 2026-05-21T09:37:00Z
**Frequency**: chronic (8+ days)
**Agent**: skingenius-architect, skingenius-devops
**Status**: open — CRITICAL ESCALATION

### Error
skingenius-architect (Dermis) and skingenius-devops (Forge) have had ZERO sessions since creation. All 3 remaining critical path tasks (AI pipeline architecture, Vercel provisioning, PostgreSQL provisioning) are blocked. This has been flagged in 5 consecutive Pulse cycles (5-9) with no corrective action.

### Root Cause
Agents were configured but never activated. No cron triggers configured. No manual sessions initiated.

### Resolution
**NOT RESOLVED. This is the 5th consecutive Pulse cycle flagging this issue. Jason must intervene.**

### Prevention
1. Activate architect/devops agents immediately
2. Reassign their tasks to active agents (skingenius-dev) as fallback
3. Add agent health monitoring to detect dormant agents
4. Implement 48h escalation for dormant agents

---

## [ERR-20260521-003] Meta heartbeat 48% failure rate — model instability clusters

**First seen**: 2026-05-18T00:00:00Z
**Last seen**: 2026-05-21T05:37:00Z
**Frequency**: recurring
**Agent**: skingenius-meta
**Status**: open

### Error
Meta heartbeat session ea96798b shows 12 out of 25 heartbeats failed (48% failure rate). Failures come in clusters of 4-5, followed by recovery.

### Root Cause
Model provider instability. Likely kimi or mimo model issues causing "assistant turn failed before producing content" errors.

### Resolution
Auto-recovery after cluster failures. No permanent fix needed for transient issues.

### Prevention
1. Add exponential backoff after consecutive failures
2. Alert if 5+ consecutive failures occur
3. Consider model fallback chain for heartbeat sessions

---

## [ERR-20260522-001] Tool validation errors — `edit` tool called with wrong parameter structure (4 sessions)

**First seen**: 2026-05-21T00:00:00Z
**Last seen**: 2026-05-22T09:37:00Z
**Frequency**: recurring (4 sessions)
**Agents**: skingenius-data, skingenius-dev, skingenius-research, skingenius-meta
**Status**: open

### Error
Multiple agents called the `edit` tool with incorrect parameter structure:
```
Validation failed for tool "edit":
- edits: must have required properties edits
- root: must not have additional properties
```
This occurred in 4 different agent sessions across data, dev, research, and meta agents.

### Root Cause
Agents are passing individual edit parameters (oldText/newText as top-level) instead of wrapping them in an `edits` array. The tool expects `{path, edits: [{oldText, newText}]}` but agents are sending `{path, oldText, newText}`.

### Resolution
NOT RESOLVED. Agents will continue hitting this until their tool-use instructions are clarified.

### Prevention
1. Add explicit edit tool usage examples to AGENTS.md
2. Consider adding a pre-validation step in agent instructions
3. Document the correct `edits` array structure in workspace TOOLS.md

---

## [ERR-20260522-002] Architect agent `assistant_turn_failed` — model instability

**First seen**: 2026-05-21T18:21:00Z
**Last seen**: 2026-05-22T09:37:00Z
**Frequency**: recurring
**Agent**: skingenius-architect
**Status**: open

### Error
Architect agent (Dermis) experienced `assistant_turn_failed before producing content` errors in both recent sessions (9277f891 and bd3cd0d5). Despite these failures, the agent still managed to produce deliverables after recovery.

### Root Cause
Model provider instability (likely kimi/glm model). The errors occur at the start of responses, suggesting cold-start or timeout issues.

### Resolution
Partial — agent recovers and produces output, but wastes tokens on failed attempts.

### Prevention
1. Add retry logic for architect agent's first response
2. Consider warm-up prompt or prefill for architect sessions
3. Monitor failure rate and switch models if it exceeds 30%

---

## [ERR-20260522-003] Next.js build deprecation warnings — DEP0205 module.register()

**First seen**: 2026-05-21T18:00:00Z
**Last seen**: 2026-05-22T09:37:00Z
**Frequency**: recurring (3 sessions)
**Agents**: skingenius-data, skingenius-dev, skingenius-meta
**Status**: open (low priority)

### Error
```
(node:XXXXX) [DEP0205] DeprecationWarning: `module.register()` is deprecated.
Use `module.registerHooks()` instead.
```
Appears during `next build` in Next.js 16.2.6 with Turbopack.

### Root Cause
Next.js 16.2.6 uses deprecated Node.js API `module.register()`. This is a framework-level issue, not our code.

### Resolution
Non-blocking. Build completes successfully despite the warning. Will be fixed when Next.js updates their module registration code.

### Prevention
None needed at this time. Monitor for breaking changes in future Node.js versions.

---

## [ERR-20260522-004] Web fetch 403 errors blocking research from academic sources

**First seen**: 2026-05-21T18:00:00Z
**Last seen**: 2026-05-22T09:37:00Z
**Frequency**: recurring
**Agents**: skingenius-research, skingenius-meta
**Status**: open

### Error
Research agent encounters 403 Forbidden when attempting to web_fetch from certain academic/institutional sources (UCI ML datasets, some redirected arxiv URLs).

### Root Cause
Academic and institutional sites often block automated requests. The `web_fetch` tool doesn't handle JavaScript-rendered pages or bot detection.

### Resolution
Agent falls back to alternative sources but loses some data depth.

### Prevention
1. Use autocli for 403-blocked academic sources (has browser automation)
2. Build local research cache of frequently-referenced papers/datasets
3. Add arxiv-specific fetch logic with proper headers

---

## [ERR-20260522-005] TypeScript type error — V1ScanMetadata missing `storage_failed` field

**First seen**: 2026-05-22T00:00:00Z
**Last seen**: 2026-05-22T09:37:00Z
**Frequency**: once
**Agent**: skingenius-dev
**Status**: open

### Error
`storage_failed` is not in `V1ScanMetadata`. The scan pipeline implementation uses optional metadata fields that aren't defined in the type specification.

### Root Cause
Agent implemented scan route with additional optional fields (`storage_failed`, possibly others) that weren't included in the `src/types/api.ts` V1ScanMetadata type definition.

### Resolution
NOT YET RESOLVED — needs type update in api.ts.

### Prevention
1. Update V1ScanMetadata in src/types/api.ts to include optional `storage_failed` and related fields
2. Add TypeScript strict mode to catch these at build time
3. Keep types and implementation in sync
