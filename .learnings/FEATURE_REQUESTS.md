# FEATURE_REQUESTS.md — SKINgenius Team
*Signals from sessions that suggest product or agent feature gaps*

---

## [FRQ-20260521-001] Conditional CEO check-in — skip when nothing has changed

**Captured**: 2026-05-21T21:37:00Z
**Source**: Pulse cycle analysis (5th consecutive cycle)
**Priority**: critical
**Status**: escalated

### Request
Implement a conditional check-in system that only runs the CEO cron when:
1. MEMORY.md has been updated since the last check-in
2. A sub-agent has completed a task
3. A configurable time threshold has passed (e.g., 4 hours minimum)

### Context
23 CEO check-in sessions ran in the last 24h, all producing identical status reports. This has been flagged in 5 consecutive Pulse cycles (since May 16) with no remediation. Cumulative token waste is estimated at 1.2M+ tokens.

### Recommendation
**CRITICAL**: This must be addressed immediately. The CEO cron is the single largest token consumer on the project. Implement hash-based change detection on MEMORY.md, or switch to event-driven check-ins.

---

## [FRQ-20260521-002] Auto-generate daily note stubs during Pulse cycle

**Captured**: 2026-05-21T21:37:00Z
**Source**: Pattern analysis (ENOENT errors)
**Priority**: high
**Status**: captured

### Request
Create a daily note file stub (`memory/YYYY-MM-DD.md`) during each Pulse cycle so that CEO check-in sessions don't hit ENOENT errors.

### Context
Every CEO session (20+/day) tries to read today's and yesterday's daily notes, but they rarely exist. Only 3 daily notes exist (May 10, 14, 18) despite the project running since May 10.

### Recommendation
Add daily note creation to the Pulse cycle. Create a minimal template with sections for: key events, decisions, blockers, completions.

---

## [FRQ-20260514-001] Model health monitoring and auto-fallback configuration

**Captured**: 2026-05-14T09:37:00Z
**Source**: session (cron failure analysis)
**Priority**: high
**Status**: captured

### Request
Add model health monitoring to OpenClaw agent configuration. When a primary model hits 429 quota limits, automatically:
1. Alert the team (via Pulse/Nova)
2. Switch to a verified-working fallback model
3. Reduce non-essential cron frequency to conserve remaining quota

### Context
6 consecutive CEO check-in sessions (5+ hours) failed completely because both primary (mimo-v2-pro) and fallback (kimi-k2-thinking:cloud) models were down. No alert was sent, and no auto-recovery occurred.

### Recommendation
Add to TASKS.md backlog as infrastructure improvement. Implement model health checks before each cron run, and add glm-5.1:cloud as a reliable fallback option.

---

## [FRQ-20260514-002] Research sub-agent progress tracking

**Captured**: 2026-05-14T09:37:00Z
**Source**: agent observation (Pulse analysis)
**Priority**: medium
**Status**: captured

### Request
Add a mechanism to track research sub-agent progress. Currently, dynamically-spawned research agents don't leave discoverable session directories.

### Context
MEMORY.md lists 4 active research sub-agents with specific brand assignments, but their session directories don't exist under the standard agents path.

### Recommendation
Create a research-progress.md file that sub-agents update upon completion, or ensure dynamically-spawned agents use a discoverable directory structure.

---

## [FRQ-20260514-003] CEO check-in resilience: graceful degradation

**Captured**: 2026-05-14T09:37:00Z
**Source**: session (cron failure pattern)
**Priority**: medium
**Status**: captured

### Request
When CEO check-in fails due to model issues, the system should gracefully degrade rather than failing silently. Options:
1. Skip the check-in and log the failure
2. Send a minimal status heartbeat using a lightweight model
3. Queue the check-in for the next successful window

### Context
Each failed CEO check-in consumed retry budget (4 retries per session × 6 sessions = 24 failed API calls) with zero useful output.

### Recommendation
Add to TASKS.md. Implement exponential backoff with model failover, and add a "minimal check-in" mode that uses the cheapest reliable model.

---

## [FRQ-20260514-004] Sub-agent project context injection

**Captured**: 2026-05-14T09:37:00Z
**Source**: session (sub-agent coordination analysis)
**Priority**: medium
**Status**: captured

### Request
Inject project context (package.json, existing components, project structure) into sub-agent sessions so they produce compatible, integrated output instead of isolated, unusable components.

### Context
skingenius-design produced SkinScoreCard.tsx and RootCauseAnalysis.tsx using placeholder SVG instead of react-native-svg. skingenius-dev produced a Supabase migration without knowing the current schema state.

### Recommendation
Add to TASKS.md. Create a project-context.md file that is auto-injected into sub-agent sessions.

---

## [FRQ-20260514-005] Reduce CEO check-in frequency during steady-state

**Captured**: 2026-05-14T09:37:00Z
**Source**: session (cron efficiency analysis)
**Priority**: medium
**Status**: captured

### Request
Reduce CEO check-in frequency from hourly to every 4 hours when no active tasks or user requests are pending.

### Context
20+ CEO check-in sessions ran in 48 hours. Only 3-4 produced substantial new work. The rest consumed significant tokens for minimal incremental value.

### Recommendation
Add to TASKS.md. Implement conditional check-in frequency: hourly when active sub-agents are running, every 4 hours during steady-state, immediately on sub-agent completion.

---

## [FRQ-20260515-001] Fix wiki_apply tool validation errors

**Captured**: 2026-05-15T09:37:00Z
**Source**: session (skingenius-research failures)
**Priority**: high
**Status**: captured

### Request
The wiki_apply tool is failing with validation errors for all operation types. Research agents need to write findings to the Obsidian wiki vault.

### Context
skingenius-research tried 4 different parameter combinations for wiki_apply while saving the Fitzpatrick report. All failed with "op: must be equal to constant" and "op: must match a schema in anyOf" errors.

### Recommendation
Test wiki_apply with current schema and document correct usage format. Add working examples to research agent instructions.

---

## [FRQ-20260515-002] Fix pre-existing TS error in ShareResultsScreen.tsx

**Captured**: 2026-05-15T09:37:00Z
**Source**: session (skingenius-design observation)
**Priority**: medium
**Status**: captured

### Request
Fix the unclosed ScrollView tag at line 132 in src/screens/share/ShareResultsScreen.tsx that causes a TS17008 error.

### Context
The design agent noted this error while integrating the Fitzpatrick quiz. It's a pre-existing issue that blocks clean TypeScript compilation.

### Recommendation
Add to dev agent backlog as a quick fix. Add pre-commit TS checking.

---

## [FRQ-20260515-003] Upgrade or rotate Brave Search API quota

**Captured**: 2026-05-15T09:37:00Z
**Source**: session (skingenius-marketing 402 errors)
**Priority**: high
**Status**: captured

### Request
The Brave Search API free tier ($5/month) has been exhausted, blocking all competitive research.

### Context
Marketing agent hit 402 errors on every web_search call while researching 8+ competitors. Research agent sessions had 61+ errors each from same root cause.

### Recommendation
1. Upgrade Brave Search to paid plan (Search API Pro)
2. Add alternative search provider as fallback
3. Implement search result caching to avoid redundant API calls

---

## [FRQ-20260515-004] Add message target requirement to cron/subagent agent instructions

**Captured**: 2026-05-15T09:37:00Z
**Source**: session (skingenius-devops failure)
**Priority**: low
**Status**: captured

### Request
Document that the message tool requires an explicit target parameter when running in cron/subagent mode (no implicit current user).

### Context
skingenius-devops tried to send a completion message without specifying a target, resulting in: "Explicit message target required for this run."

### Recommendation
Add to all agent instructions: when running as subagent or cron, always specify a message target.

---

## [FRQ-20260515-005] Conditional CEO check-in — skip when nothing changed

**Captured**: 2026-05-15T09:37:00Z
**Source**: cron pattern analysis (20+ redundant status sessions)
**Priority**: medium
**Status**: captured

### Request
Add conditional skip logic to CEO check-in cron: if no new files, commits, or sub-agent completions since last check-in, either produce an abbreviated status or skip entirely.

### Context
20+ CEO check-in sessions ran in 48 hours, most producing status reports that merely summarized existing MEMORY.md content.

### Recommendation
1. Check git log and file mtime since last check-in
2. If nothing changed, emit abbreviated "no changes" status
3. Reduce steady-state frequency to every 4 hours
4. Immediately check in on sub-agent completion events

---

## [FRQ-20260515-006] Sub-agent coordination improvements for large parallel builds

**Captured**: 2026-05-15T09:37:00Z
**Source**: session analysis (dev agent knowledge graph build)
**Priority**: low
**Status**: captured

### Request
Add task queue and batching to handle large parallel builds that exceed the 4-subagent limit.

### Context
The knowledge graph build required 12+ sub-sessions and repeatedly hit the 4-concurrent-subagent limit.

### Recommendation
1. Add a task queue pattern for large parallel operations
2. Batch work into groups of 4 to match subagent limit
3. Add progress tracking file that sub-agents update on completion

---

## [FRQ-20260516-001] Validate and integrate COLORgenius integration code

**Captured**: 2026-05-16T09:37:00Z
**Source**: session (skingenius-dev)
**Priority**: medium
**Status**: captured

### Request
The integration/ directory contains Square, Vagaro, and compliance modules built for COLORgenius. These need validation against actual APIs and should potentially be moved to the COLORgenius workspace.

### Context
skingenius-dev built integration modules (Square POS, Vagaro, compliance) during a COLORgenius-design subagent session. The code lives in the SKINgenius workspace but serves COLORgenius.

### Recommendation
1. Validate Square and Vagaro API integrations with actual credentials
2. Consider moving integration/ to the COLORgenius workspace
3. Add integration tests

---

## [FRQ-20260516-002] Validate scan flow API route and components

**Captured**: 2026-05-16T09:37:00Z
**Source**: session (skingenius-ceo)
**Priority**: high
**Status**: captured

### Request
The new scan flow architecture (SCAN-FLOW-ARCHITECTURE.md) and API route (route.ts, 31KB) need validation — compilation check, component integration testing, and end-to-end scan flow verification.

### Context
CEO session confirmed scan flow architecture is designed and core API route is built. This is the critical user-facing feature path and needs to work correctly.

### Recommendation
1. Run TypeScript compilation check on route.ts
2. Test API endpoints locally
3. Verify scan flow component integration
4. Add to dev agent backlog as high priority

---

## [FRQ-20260516-003] Resolve brand scraping sub-agent results gap

**Captured**: 2026-05-16T21:37:00Z
**Source**: session analysis (Pulse cycle 3)
**Priority**: high
**Status**: captured

### Request
4 brand scraping sub-agents launched May 14 have never confirmed results in 48+ hours of subsequent status reports. Need verification and integration.

### Context
CEO check-ins consistently report "sub-agent scraping pending" for Aesop, PCA Skin, SkinCeuticals/ZO, Biologique Recherche/iS Clinical/Osmosis/Environ (188 products expected). No completion confirmation exists.

### Recommendation
1. Check if sub-agent sessions completed (search session logs for completion markers)
2. If completed, integrate scraped data into product database
3. If failed, re-launch with proper progress tracking
4. Add research-progress.md as a standard sub-agent completion marker

---

## [FRQ-20260516-004] Move COLORgenius integration code out of SKINgenius workspace

**Captured**: 2026-05-16T21:37:00Z
**Source**: session analysis (Pulse cycle 3)
**Priority**: medium
**Status**: captured

### Request
The integration/ directory contains Square POS, Vagaro, and compliance modules that serve COLORgenius, not SKINgenius. Move to appropriate workspace.

### Context
skingenius-dev built these during a COLORgenius-design subagent session. The code lives in SKINgenius workspace, creating project boundary confusion.

### Recommendation
1. Move integration/ directory to COLORgenius workspace
2. Add workspace ownership check to sub-agent context
3. Document directory-to-project mapping in AGENTS.md

---

## [FRQ-20260519-001] CEO cron deduplication and smart scheduling

**Captured**: 2026-05-19T09:37:00Z
**Source**: session analysis (Pulse cycle 5)
**Priority**: high
**Status**: captured

### Request
Implement smart scheduling for the CEO check-in cron. Currently runs hourly and produces near-identical reports. Should run at most 2x/day and only when something has changed.

### Context
12 CEO check-in sessions in 12h all produced the same 5-bullet status report. Each independently reads the same stale MEMORY.md (last updated May 15) and weekly status (May 18). Estimated ~150K tokens wasted per 12h cycle.

### Recommendation
1. Reduce cron schedule to 2x/day (8 AM + 8 PM ET)
2. Add change-detection: compare current state hash to last report hash
3. Only produce full report when state has changed
4. Add lightweight "no change" response option for unchanged states

---

## [FRQ-20260519-002] Agent dormancy detection and task redistribution

**Captured**: 2026-05-19T09:37:00Z
**Source**: session analysis (Pulse cycle 5)
**Priority**: high
**Status**: captured

### Request
Add agent dormancy detection to the Pulse improvement cycle. When an agent assigned to critical path tasks has 0 sessions for 24h+, alert the CEO and suggest task redistribution.

### Context
skingenius-architect (Dermis) and skingenius-devops (Forge) have had 0 sessions in the last 24h. They are assigned to all 5 critical path tasks, which have been at [ ] pending for 5+ days since May 13. The project cannot progress until these tasks are done.

### Recommendation
1. Add agent activity monitoring to Pulse: track sessions per agent per 24h
2. Alert threshold: 0 sessions for assigned agent = immediate flag
3. Auto-suggest redistribution: if agent dormant 48h, offer to reassign to active agents
4. Include agent dormancy status in CEO check-in reports

---

## [FRQ-20260519-003] MEMORY.md staleness alert

**Captured**: 2026-05-19T09:37:00Z
**Source**: session analysis (Pulse cycle 5)
**Priority**: medium
**Status**: captured

### Request
Alert when MEMORY.md hasn't been updated in 48h+. Multiple CEO check-ins are reading stale data (last updated May 15, now May 19 = 4 days stale) and generating reports based on outdated information.

### Context
MEMORY.md was last updated 2026-05-15. All 12 CEO check-in sessions on May 18-19 read this stale file and produced reports based on information that may no longer be accurate. The weekly status note (May 18) exists but isn't integrated back into MEMORY.md.

### Recommendation
1. Add staleness check: if MEMORY.md > 48h old, flag in CEO check-in output
2. After significant events (sprint reviews, architecture decisions), update MEMORY.md
3. Consider auto-merging weekly status highlights into MEMORY.md

---

## [FRQ-20260519-004] Create agent MEMORY.md files for session-to-session context persistence

**Captured**: 2026-05-19T21:37:00Z
**Source**: Pulse cycle 6 analysis
**Priority**: high
**Status**: captured

### Request
Create MEMORY.md files in each agent's agent/ directory so agents accumulate context across sessions instead of starting from zero each time.

### Context
None of the 9 skingenius agent directories contain a MEMORY.md file. Every agent session starts with no accumulated knowledge, leading to repeated work (identical CEO reports, repeated research queries, no learning from past sessions).

### Recommendation
1. Create agent/MEMORY.md for each agent with role-specific context
2. Pulse should update agent MEMORY.md during improvement cycles
3. Add MEMORY.md existence and freshness check to Pulse monitoring

---

## [FRQ-20260519-005] Competitive intelligence integration into product planning

**Captured**: 2026-05-19T21:37:00Z
**Source**: Lovi.care competitive teardown
**Priority**: medium
**Status**: captured

### Request
Integrate Lovi.care competitive insights into SKINgenius Phase 3 scan flow design, specifically the algorithm theater pattern and zone-by-zone analysis.

### Context
Lovi.care teardown revealed 25+ screens across 6 phases of user experience. Key patterns SKINgenius should adopt or improve on: algorithm theater (forced loading with personalization), zone-by-zone analysis, progress calendar, and subscription monetization.

### Recommendation
1. Reference LOVI-CARE-COMPETITIVE-TEARDOWN.md in Phase 3 design decisions
2. Build SKINgenius scan flow to match or exceed Lovi's post-scan experience
3. Create feature parity comparison matrix for product roadmap

**Captured**: 2026-05-19T09:37:00Z
**Source**: session analysis (Pulse cycle 5)
**Priority**: medium
**Status**: captured

### Request
Alert when MEMORY.md hasn't been updated in 48h+. Multiple CEO check-ins are reading stale data (last updated May 15, now May 19 = 4 days stale) and generating reports based on outdated information.

### Context
MEMORY.md was last updated 2026-05-15. All 12 CEO check-in sessions on May 18-19 read this stale file and produced reports based on information that may no longer be accurate. The weekly status note (May 18) exists but isn't integrated back into MEMORY.md.

### Recommendation
1. Add staleness check: if MEMORY.md > 48h old, flag in CEO check-in output
2. After significant events (sprint reviews, architecture decisions), update MEMORY.md
3. Consider auto-merging weekly status highlights into MEMORY.md
---

## [FRQ-20260520-001] CEO check-in filesystem change detection

**Priority**: critical
**Area**: workflow
**Status**: open
**Source**: Pulse cycle 8 analysis

### Problem
CEO check-in cron produces 30+ redundant sessions per 24h, all reporting stale data. On May 20, the CEO missed significant new work (MANA Labs integration, new DB schema, new condition) because it only reads MEMORY.md and doesn't scan the filesystem for recent changes.

### Proposed Solution
1. Add `find . -mmin -1440 -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/sessions/*'` to CEO check-in to detect recent file changes
2. Compare last-report hash stored in workspace to skip unchanged reports
3. Reduce cron from hourly to 2x/day during steady-state
4. Make check-ins event-driven: trigger on subagent completion, not just timer

### Impact
Would eliminate ~800K+ tokens/week of redundant CEO check-ins and ensure CEO actually detects new work.

---

## [FRQ-20260520-002] Subagent tool schema validation pre-check

**Priority**: medium
**Area**: dev
**Status**: open
**Source**: Pulse cycle 8 analysis (skingenius-dev sessions)

### Problem
Subagent models (kimi-k2.6:cloud) frequently generate malformed tool call arguments — missing required fields, empty objects, wrong property names. This causes validation errors and requires manual retries.

### Proposed Solution
1. Add tool schema validation instructions to subagent context: "Always verify all required properties before calling any tool"
2. Include example tool calls with correct arguments in subagent task prompts
3. Consider using models with better structured output for subagent tasks
4. Add a pre-call validation step that catches missing required fields before sending to tool

### Impact
Would reduce tool call failures in subagent sessions by ~60-80%, improving build reliability and reducing token waste on retries.

---

## [FRQ-20260520-003] Agent health monitoring dashboard

**Priority**: high
**Area**: devops
**Status**: open
**Source**: Pulse cycle 8 analysis (4+ cycles flagging dormant agents)

### Problem
skingenius-architect and skingenius-devops have been dormant since creation (7+ days). No monitoring exists to detect dormant agents or trigger automatic escalation. This has been flagged in 4 consecutive Pulse cycles with no corrective action.

### Proposed Solution
1. Agent health check: count sessions per agent in last 24h, flag agents with 0 sessions
2. 48h escalation: if an assigned agent has 0 sessions for 48h, auto-suggest task redistribution
3. Dashboard or daily digest showing agent activity levels
4. Critical path task reassignment: if owner is dormant for 48h+, redistribute to next available agent

### Impact
Would have caught the architect/devops dormancy on day 2 instead of day 7+, preventing critical path deadlock.

---

## [FRQ-20260521-001] CEO check-in conditional skip — stop redundant status reports

**Captured**: 2026-05-21T09:37:00Z
**Source**: Pulse cycle 9 analysis
**Priority**: critical
**Status**: escalated

### Request
Implement conditional skip logic for CEO check-in cron sessions. Currently the cron fires hourly, producing near-identical status reports regardless of whether anything has changed. This wastes an estimated 1.2M+ tokens across 80+ redundant sessions over 5+ days.

### Context
The CEO check-in cron (cron:90d8d5a5) has been running hourly since at least May 15. Each session reads MEMORY.md, searches memory, and generates the same 5-bullet status report. When significant work DID happen (MANA Labs on May 20), the CEO didn't detect it because it only reads stale MEMORY.md content.

### Recommendation
1. Add filesystem change detection: `find . -mmin -1440 -type f | head -20` before generating reports
2. Store last-report-hash in workspace to skip unchanged content
3. Make check-ins delta-only: only report what CHANGED since last check-in
4. Reduce frequency to 2x/day (8 AM + 8 PM ET) as absolute maximum
5. Consider event-driven check-ins triggered by subagent completions

---

## [FRQ-20260521-002] Critical path task reassignment — activate dormant agents or redistribute

**Captured**: 2026-05-21T09:37:00Z
**Source**: Pulse cycle 9 analysis
**Priority**: critical
**Status**: escalated

### Request
Activate skingenius-architect (Dermis) and skingenius-devops (Forge) OR redistribute their tasks to active agents. These agents have had ZERO sessions since creation, blocking 3 critical path tasks for 8+ days and putting the July 7 MVP target at serious risk.

### Context
- AI pipeline architecture (assigned to Dermis/architect) — dormant since creation
- Vercel provisioning (assigned to Forge/devops) — dormant since creation
- PostgreSQL provisioning (assigned to Forge/devops) — dormant since creation
- skingenius-dev (Pixel) proved capable of handling similar tasks (MANA Labs)
- MVP target: July 7 (now less than 7 weeks away)

### Recommendation
1. If architect/devops can't be activated by May 23, reassign all their tasks to skingenius-dev
2. Add cron triggers for architect/devops agents
3. Implement 48h escalation for dormant agents

---

## [FRQ-20260521-003] Research evidence integration into knowledge graph

**Captured**: 2026-05-21T09:37:00Z
**Source**: workspace filesystem analysis
**Priority**: medium
**Status**: captured

### Request
Incorporate the new research synthesis documents (Dr. Bailey, Paula's Choice, Trending Ingredients) into the knowledge graph and seed data.

### Context
Three significant research documents were added May 20-21:
- Dr. Bailey: 10 dermatologist-authored articles with clinical ingredient/condition data
- Paula's Choice: 10 evidence-based articles with peer-reviewed citations
- Trending Ingredients: PDRN, panthenol, ectoin, microcurrent, LED mechanisms

These contain valuable evidence data that should enrich the 151-ingredient and 25-condition knowledge graph.

### Recommendation
1. Extract ingredient-condition mappings from Dr. Bailey and Paula's Choice syntheses
2. Add trending ingredients (PDRN, panthenol, ectoin) to seed-data.json
3. Cross-reference with existing 499 ingredient-condition mappings
4. Update evidence scoring for newly enriched entries

---

## [FRQ-20260521-004] Agent MEMORY.md creation for all skingenius agents

**Captured**: 2026-05-21T09:37:00Z
**Source**: Pulse cycle 9 analysis
**Priority**: medium
**Status**: in-progress

### Request
Create MEMORY.md files for all active skingenius agents so they have persistent session-to-session context.

### Context
None of the 11 skingenius agent directories contain a MEMORY.md file. Every agent starts each session from scratch, leading to:
- Identical CEO check-in reports (no memory of what was already reported)
- Repeated work (agents don't remember what they accomplished)
- No continuity between sessions

### Recommendation
1. Create agent MEMORY.md files for all active agents (this Pulse cycle)
2. Update agent MEMORY.md after each significant session
3. Add MEMORY.md existence check to Pulse monitoring

---

## [FRQ-20260522-001] Integration tests for recommendation engine

**Captured**: 2026-05-22T09:37:00Z
**Source**: Pulse cycle 10 analysis
**Priority**: high
**Status**: captured

### Request
Add integration tests for the recommendation engine's fit scoring, query engine, and API endpoint.

### Context
The recommendation engine is now implemented (fitScore.ts, queryEngine.ts, route.ts) but has no test coverage. Need validation that:
- Evidence-tier scoring produces correct rankings
- Safety scoring properly penalizes contraindicated products
- Query engine handles condition, ingredient, and concern-based queries
- API endpoint returns proper response format

### Recommendation
1. Create `src/lib/recommendations/__tests__/` directory
2. Write unit tests for fitScore with known condition-ingredient pairs
3. Write API integration tests for the recommendations endpoint
4. Add to CI pipeline

---

## [FRQ-20260522-002] TypeScript strict mode and type sync enforcement

**Captured**: 2026-05-22T09:37:00Z
**Source**: skingenius-dev session analysis
**Priority**: medium
**Status**: captured

### Request
Enable TypeScript strict mode and add type synchronization enforcement to prevent V1ScanMetadata-style mismatches.

### Context
Dev agent implemented scan pipeline with `storage_failed` field that wasn't in the V1ScanMetadata type definition. This causes build errors and indicates type drift between specs and implementation.

### Recommendation
1. Enable `strict: true` in tsconfig.json
2. Add pre-commit type check
3. Create shared type spec that both architect and dev reference
4. Consider type-generation from OpenAPI spec

---

## [FRQ-20260522-003] Local research cache for academic sources

**Captured**: 2026-05-22T09:37:00Z
**Source**: skingenius-research session analysis
**Priority**: medium
**Status**: captured

### Request
Build a local cache of frequently-referenced research papers and datasets to avoid repeated 403 errors from academic sources.

### Context
Research agent encounters 403 Forbidden errors from PubMed, UCI ML, and other academic sources. Fallback to alternative sources loses data depth. Building a local cache would:
- Eliminate 403 errors for commonly-referenced sources
- Speed up research sessions (no network latency)
- Ensure reproducibility of evidence scores

### Recommendation
1. Create `docs/research/cache/` directory with frequently-used papers
2. Pre-fetch PubMed abstracts for core conditions (acne, rosacea, eczema, etc.)
3. Cache UCI/dermatology dataset references locally
4. Add cache-first strategy to research agent instructions

---

## [FRQ-20260522-004] Edit tool parameter structure documentation

**Captured**: 2026-05-22T09:37:00Z
**Source**: 4 different agent sessions with tool validation errors
**Priority**: medium
**Status**: captured

### Request
Add explicit edit tool usage documentation to prevent recurring parameter structure errors.

### Context
4 different agents (data, dev, research, meta) called the `edit` tool with incorrect parameters. They sent `{path, oldText, newText}` instead of `{path, edits: [{oldText, newText}]}`. This wastes tokens on validation failures and retry cycles.

### Recommendation
1. Add correct `edit` tool examples to workspace AGENTS.md
2. Add to each agent's instructions
3. Consider adding a pre-validation check before edit calls
