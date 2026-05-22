# LEARNINGS.md — SKINgenius Team
*Auto-logged by Pulse (skingenius-meta) self-improvement loop*

---

## [LRN-20260514-001] Model quota exhaustion causes cascading cron failures

**Logged**: 2026-05-14T09:37:00Z
**Priority**: critical
**Status**: applied
**Area**: ai

### Summary
All 5 CEO check-in cron sessions (skingenius-ceo) on 2026-05-14 failed completely due to xiaomi-b/mimo-v2-pro quota exhaustion (HTTP 429), and fallback model kimi-k2-thinking:cloud returned 500 Internal Server Error, causing all sessions to abort.

### Details
Between 00:17 and 05:27 AM ET on May 14, every CEO check-in failed:
- Session c1dc355c (00:17): 429 → timeout
- Session ac8b58c2 (01:17): 429 → kimi 500 → timeout
- Session d98727c6 (02:19): 429 → kimi 500 → timeout  
- Session 64057c33 (03:21): 429 → kimi 500 → timeout
- Session 451a3f31 (04:23): 429 → kimi 500 → timeout
- Session 244b6403 (05:27): 429 → kimi 500 → timeout

The fallback model (kimi-k2-thinking:cloud) was also down, providing zero resilience.

### Suggested Action
1. Add glm-5.1:cloud as fallback (it works — meta agent uses it successfully)
2. Monitor xiaomi-b quota and alert when approaching limits
3. Consider staggering CEO check-in times or reducing frequency during off-hours

---

## [LRN-20260516-001] CEO check-in redundancy — same status recycled across 10+ sessions

**Logged**: 2026-05-16T21:37:00Z
**Priority**: high
**Status**: open
**Area**: workflow

### Summary
CEO check-in crons continue producing near-identical status reports every hour. Since last Pulse (May 16 05:42 UTC), 8+ CEO sessions ran, all summarizing the same MEMORY.md content with no new decisions or blockers.

### Details
Between 04:52 and 14:06 ET on May 16, 8 CEO check-in sessions ran. Key findings recycled across all:
- "Holistic vision pivot locked" (from May 14)
- "236 products across 21 brands" (unchanged since May 14)
- "Sub-agent scraping pending" (still pending, no update)
- "Phase 1/2 complete" (from May 15)

No new decisions, no new blockers identified, no escalations to Jason.

### Suggested Action
1. Implement conditional skip (FRQ-20260515-005)
2. Reduce to 4-hour intervals during steady-state
3. Trigger check-in on sub-agent completion events only

### Metadata
- Affected agents: skingenius-ceo
- Token waste: ~50K tokens/week on redundant check-ins

---

## [LRN-20260521-001] CEO check-in cron produces 20+ identical sessions per 24h — massive token waste

**Logged**: 2026-05-21T21:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
The CEO check-in cron fires hourly and produces near-identical status reports each time. In the last 24h, 23 CEO sessions ran, all reading the same MEMORY.md content and producing redundant status summaries with no new information between them.

### Details
Between May 20-21, 23 separate CEO check-in sessions ran. Every single one:
- Read MEMORY.md (last updated May 20)
- Attempted to read daily notes that don't exist (memory/2026-05-20.md, memory/2026-05-21.md — both ENOENT)
- Hit EISDIR error trying to read memory/ directory
- Produced the same status report: "MANA Labs Phase 1 completed, critical path partially unblocked"
- No new decisions, escalations, or blocker resolutions occurred

This was already flagged in LRN-20260516-001 (4 consecutive Pulse cycles) and MEMORY.md's Pulse Alert section, but no fix has been applied.

### Suggested Action
1. **Immediate**: Reduce CEO check-in to 4-hour intervals during steady-state
2. **Better**: Implement conditional skip — only run if MEMORY.md has changed since last check-in
3. **Best**: Event-driven check-ins triggered by sub-agent completion events
4. Fix the daily note creation — CEO always tries to read today's note and fails

### Metadata
- Affected agents: skingenius-ceo
- Token waste: estimated 1.2M+ tokens cumulative across all Pulse cycles
- This is the 5th consecutive Pulse cycle flagging this issue

---

## [LRN-20260521-002] Missing daily notes cause repeated ENOENT errors in every CEO session

**Logged**: 2026-05-21T21:37:00Z
**Priority**: medium
**Status**: open
**Area**: workflow

### Summary
Every CEO check-in session attempts to read `memory/YYYY-MM-DD.md` for the current day and the previous day, but those files don't exist. This causes 2 ENOENT errors per session, multiplied by 20+ sessions per day.

### Details
The memory/ directory only contains 3 daily notes (2026-05-10, 2026-05-14, 2026-05-18) plus a dreaming/ subdirectory. CEO sessions always try `memory/2026-05-20.md` and `memory/2026-05-21.md` which don't exist, producing file-not-found errors that waste tool calls.

### Suggested Action
1. Create a daily note as part of the Pulse cycle so it exists when CEO checks in
2. Or modify CEO agent to gracefully handle missing daily notes without error

---

## [LRN-20260521-003] EISDIR error when CEO reads memory/ directory path

**Logged**: 2026-05-21T21:37:00Z
**Priority**: low
**Status**: open
**Area**: agent-behavior

### Summary
Multiple CEO sessions hit `EISDIR: illegal operation on a directory, read` when trying to read a directory path instead of a file path. This is a minor bug in how the CEO assembles file paths.

### Details
The CEO agent sometimes constructs a path like `memory/` instead of `memory/YYYY-MM-DD.md`, causing the read to fail with EISDIR.

### Suggested Action
Add a path validation check in CEO's file reading logic to ensure paths always point to files, not directories.

**Logged**: 2026-05-16T21:37:00Z
**Priority**: medium
**Status**: open
**Area**: architecture

### Summary
skingenius-dev built COLORgenius integration modules (Square POS, Vagaro, compliance) inside the SKINgenius workspace's integration/ directory. This creates confusion about project boundaries and ownership.

### Details
During a COLORgenius subagent session, the dev agent created:
- integration/square/ — Full Square POS integration
- integration/vagaro/ — Full Vagaro salon management
- integration/compliance/ — GDPR, CCPA, privacy, consent

These serve COLORgenius but live in SKINgenius workspace. Risk of accidental dependency or deployment confusion.

### Suggested Action
1. Move integration/ to COLORgenius workspace
2. Add workspace boundary check to sub-agent context
3. Document which directories belong to which project

### Metadata
- Affected agents: skingenius-dev
- Related: FRQ-20260516-001

---

## [LRN-20260514-002] Holistic model pivot is well-documented but needs team alignment

**Logged**: 2026-05-14T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: architecture

### Summary
Major pivot from "product database" to "holistic skin health intelligence platform" was captured in daily notes and all agent MEMORY.md files now reflect it.

### Details
The pivot to treating skin as a mirror of internal health (gut-skin axis, hormones, nutrition) is fully documented and reflected in MEMORY.md, BUILD-PLAN.md, and all research docs.

### Suggested Action
Ensure new agents and sub-agents receive holistic model context on spawn.

### Metadata
- Source: Pulse analysis
- Tags: architecture, pivot, alignment
- Affects: all agents

---

## [LRN-20260514-003] Research sub-agents spawned dynamically and leave no session logs in the agents directory

**Logged**: 2026-05-14T09:37:00Z
**Priority**: low
**Status**: pending
**Area**: devops

### Summary
Research sub-agents (skingenius-research-aesop, etc.) were spawned but their session directories don't exist under /home/jason/.openclaw/agents/, making it impossible to audit their progress.

### Details
MEMORY.md lists 4 active research sub-agents but no directories found for them under /home/jason/.openclaw/agents/skingenius-research-*/.

### Suggested Action
Investigate where sub-agent sessions are stored. Consider adding a post-task log convention so Pulse can audit their outcomes.

---

## [LRN-20260514-004] Pulse (skingenius-meta) uses glm-5.1:cloud and works reliably

**Logged**: 2026-05-14T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: ai

### Summary
The meta agent's heartbeat session completed successfully using glm-5.1:cloud while both xiaomi-b and kimi models were failing.

### Details
The heartbeat session returned HEARTBEAT_OK using the ollama/glm-5.1:cloud model. This model should be considered as a reliable fallback.

### Suggested Action
Add glm-5.1:cloud to the fallback chain for skingenius-ceo cron jobs.

---

## [LRN-20260514-005] Dev and design agents spawn successfully but produce isolated component files

**Logged**: 2026-05-14T21:37:00Z
**Priority**: medium
**Status**: applied
**Area**: dev

### Summary
skingenius-dev and skingenius-design were both spawned as sub-agents on 2026-05-14 and completed, but produced component files in isolation without integration context.

### Details
- skingenius-dev wrote `supabase/migrations/20240514_fix_indexes.sql`
- skingenius-design wrote 2 React Native components (SkinScoreCard, RootCauseAnalysis)
- Neither agent had visibility into the other's work or the broader project state
- The components use placeholder SVG rendering (not production-ready)

### Suggested Action
1. Add project context injection for sub-agents — include current project state, existing components, and integration requirements
2. Create a component registry so agents know what exists
3. Add post-creation validation step to check component compatibility

### Metadata
- Source: session (skingenius-dev, skingenius-design)
- Tags: dev, design, subagents
- Affects: skingenius-dev, skingenius-design

---

## [LRN-20260514-006] CEO check-in crons produce diminishing returns during steady-state

**Logged**: 2026-05-14T21:37:00Z
**Priority**: medium
**Status**: pending
**Area**: devops

### Summary
CEO check-in crons run hourly but most produce status reports that summarize already-known information from MEMORY.md.

### Details
- 8+ CEO check-in sessions ran between 09:35-18:43 UTC on 2026-05-14
- Only session 5bdd55f0 produced substantial new work
- Most later sessions only generated status reports summarizing known state

### Suggested Action
1. Reduce CEO check-in frequency from hourly to every 4 hours during steady-state
2. Add conditional skip logic: if no new files/commits since last check-in, produce abbreviated status
3. Reserve full check-ins for when sub-agents complete or user requests status

---

## [LRN-20260514-007] Research agent progress tracking gap — CEO doing research directly

**Logged**: 2026-05-14T21:37:00Z
**Priority**: medium
**Status**: applied
**Area**: research

### Summary
CEO agent (skingenius-ceo) ended up doing research work directly (writing RESEARCH-BATCH-4A.md, ingredient frequency analysis) instead of delegating to skingenius-research.

### Details
Session 5bdd55f0 (08:36, 277KB) was the CEO agent writing research documents and ingredient frequency analysis. This is a sign that the research agent wasn't available or wasn't being delegated to effectively.

### Suggested Action
1. Ensure CEO delegates research tasks to skingenius-research via subagent spawn
2. Add research delegation patterns to CEO agent MEMORY.md
3. Track delegation success rate in Pulse cycles

### Metadata
- Source: session analysis (skingenius-ceo)
- Tags: research, delegation, ceo
- Affects: skingenius-ceo, skingenius-research

---

## [LRN-20260515-001] Knowledge graph build completed — 4 subagents produced structured data

**Logged**: 2026-05-15T09:37:00Z
**Priority**: high
**Status**: applied
**Area**: data

### Summary
skingenius-dev orchestrated 4 subagents to build the knowledge graph entities, relationships, and indexes in a single coordinated session.

### Details
The knowledge graph was built via parallel subagents:
- Subagent 1: conditions.json (24 conditions)
- Subagent 2: ingredients.json (large, ~237KB)
- Subagent 3: ingredient-conditions.json (406 entries)
- Subagent 4: ingredient-interactions.json
Plus: brands.json, hormones.json, product-conditions.json, procedure-products.json
Indexes: skin-type-recommendations.json, condition-to-treatments.json, condition-to-products.json, pregnancy-safe.json, ingredient-to-products.json

### Suggested Action
1. Validate data quality across all entity files
2. Consider building an admin UI for graph maintenance

### Metadata
- Source: session (skingenius-dev)
- Tags: knowledge-graph, data, subagents
- Affects: skingenius-dev

---

## [LRN-20260515-002] CEO cron check-ins still producing minimal new output

**Logged**: 2026-05-15T09:37:00Z
**Priority**: medium
**Status**: pending
**Area**: devops

### Summary
CEO check-in cron sessions continue running hourly but most produce status reports that summarize already-known information from MEMORY.md.

### Details
Between May 14 21:37 and May 15 17:36, 12+ CEO cron sessions ran. All produced status reports summarizing known information. No new decisions or blockers were surfaced.

### Suggested Action
Reduce check-in frequency. Implement conditional skip logic.

### Metadata
- Source: cron
- Tags: cron, efficiency, ceo
- Affects: skingenius-ceo

---

## [LRN-20260515-003] Brave Search API quota exhaustion blocks marketing research

**Logged**: 2026-05-15T09:37:00Z
**Priority**: high
**Status**: open
**Area**: ai

### Summary
skingenius-marketing hit Brave Search API quota limits (402 errors) repeatedly while researching competitors. The agent fell back to web_fetch but many competitor sites returned 404 or errors.

### Details
Marketing agent attempted to research 8+ competitors (Curology, Proven, ThinkDirty, Yuka, etc.) but every web_search call returned 402 "Usage limit exceeded." The agent then tried web_fetch which worked for some sites but many returned 404 errors.

### Suggested Action
1. Upgrade or rotate Brave Search API plan/quota
2. Implement search quota monitoring with alerts
3. Consider alternative search providers as fallback
4. Batch research requests to minimize API calls

### Metadata
- Source: session (skingenius-marketing)
- Tags: api, quota, search, marketing
- Affects: skingenius-marketing

---

## [LRN-20260515-004] Research agent produced Fitzpatrick/dark skin report and wiki_apply failures

**Logged**: 2026-05-15T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: research

### Summary
skingenius-research completed a comprehensive Fitzpatrick Skin Types & Darker Skin Tones research report but failed repeatedly when trying to write to the wiki using wiki_apply.

### Details
The research agent wrote a 43KB fitzpatrick-dark-skin.md report successfully to the workspace, but all wiki_apply calls failed with validation errors.

### Suggested Action
1. Fix wiki_apply validation — the operation parameter format may have changed
2. Add wiki_apply examples to agent instructions
3. Consider having research agents always write to workspace first, wiki second

### Metadata
- Source: session (skingenius-research)
- Tags: wiki, validation, research
- Affects: skingenius-research

---

## [LRN-20260515-005] DevOps agent completed technical architecture review

**Logged**: 2026-05-15T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: devops

### Summary
skingenius-devops produced a comprehensive technical architecture review covering Supabase, Next.js app structure, camera components, and API routes.

### Details
The devops agent reviewed the full project structure including: Next.js app router, Supabase integration, camera components, API routes, and TypeScript types. Wrote a 19KB technical-review.md.

### Metadata
- Source: session (skingenius-devops)
- Tags: architecture, review, devops
- Affects: skingenius-devops

---

## [LRN-20260515-006] Design agent integrated Fitzpatrick quiz into onboarding

**Logged**: 2026-05-15T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: design

### Summary
skingenius-design created a FitzpatrickQuizScreen component and integrated it into the onboarding flow.

### Details
FitzpatrickQuizScreen.tsx (20KB) created and integrated into OnboardingNavigator, WelcomeScreen, and SkinTypeQuizScreen.

### Suggested Action
Fix the pre-existing ShareResultsScreen.tsx TS error (unclosed ScrollView tag at line 132).

### Metadata
- Source: session (skingenius-design)
- Tags: onboarding, fitzpatrick, design
- Affects: skingenius-design

---

## [LRN-20260515-007] Knowledge graph data fully populated — 3,294 data points

**Logged**: 2026-05-15T21:37:00Z
**Priority**: high
**Status**: applied
**Area**: data

### Summary
Knowledge graph completed with 17 JSON files containing 3,294 data points, 151 ingredients, 406 products, 24 conditions.

### Details
All entity files, relationship files, and index files are populated and verified.

### Metadata
- Source: session analysis
- Tags: knowledge-graph, data
- Affects: all agents

---

## [LRN-20260515-008] Research sessions with extremely high error counts

**Logged**: 2026-05-15T21:37:00Z
**Priority**: high
**Status**: open
**Area**: research

### Summary
Research sessions continue to hit Brave Search API 402 errors and web_fetch 404s.

### Details
- Top error sessions: 67cacd3c (61 errors), afb995ad (39), 42886152 (38)
- Primary errors: Brave Search 402 (quota exceeded), web_fetch 404 (competitor sites)

### Suggested Action
1. Upgrade Brave Search API plan (critical blocker for competitive research)
2. Cache search results to avoid redundant queries
3. Add fallback search provider

### Metadata
- Source: session analysis
- Tags: api, quota, search, research
- Affects: skingenius-research, skingenius-marketing

---

## [LRN-20260515-009] Meta Pulse cycle runs reliably on glm-5.1:cloud

**Logged**: 2026-05-15T21:37:00Z
**Priority**: medium
**Status**: applied
**Area**: ai

### Summary
Both previous Pulse cycles (05:37 AM and 05:37 PM) completed successfully on glm-5.1:cloud.

### Details
No 429 or 500 errors encountered. Consistent with LRN-20260514-004 recommendation.

### Suggested Action
Continue using glm-5.1:cloud for meta/Pulse agent.

### Metadata
- Source: session analysis
- Tags: model, reliability
- Affects: skingenius-meta

---

## [LRN-20260515-010] Dev agent spawned 12+ sub-sessions for knowledge graph build

**Logged**: 2026-05-15T21:37:00Z
**Priority**: medium
**Status**: applied
**Area**: dev

### Summary
skingenius-dev spawned at least 12 sub-sessions (depth 2/2) for knowledge graph construction, often maxing out the 4-concurrent-subagent limit.

### Details
All used kimi-k2.6:cloud model. The 4-subagent limit was hit repeatedly but the build completed successfully.

### Suggested Action
1. Document the 4-concurrent-subagent limit in agent instructions
2. Batch knowledge graph construction into groups of 4 or fewer
3. Consider building a task queue pattern for large parallel jobs

### Metadata
- Source: session analysis
- Tags: subagents, knowledge-graph, dev
- Affects: skingenius-dev

---

## [LRN-20260515-011] CEO check-in redundancy continues — 12+ sessions with minimal value

**Logged**: 2026-05-15T21:37:00Z
**Priority**: medium
**Status**: pending
**Area**: devops

### Summary
Between May 15 00:04 and 17:36, 12+ CEO check-in cron sessions ran. All produced status reports summarizing already-known information from MEMORY.md.

### Details
- 12 CEO check-in sessions (hourly) — all mimo-v2-pro model, all completed
- Sessions averaged 3KB each (minimal output) except 2 substantive ones
- Total token spend for minimal incremental value

### Suggested Action
1. Implement conditional skip: if no new files/commits since last check-in, produce abbreviated status
2. Reduce frequency to every 4 hours during steady-state
3. Reserve full check-ins for active sub-agent completions or user requests

### Metadata
- Source: cron analysis
- Tags: cron, efficiency, ceo
- Affects: skingenius-ceo

---

## [LRN-20260516-001] COLORgenius integrations built — Square, Vagaro, compliance

**Logged**: 2026-05-16T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: dev

### Summary
skingenius-dev built complete integration modules for COLORgenius (a sister project): Square POS, Vagaro salon management, and compliance (GDPR, CCPA, privacy, DPA templates).

### Details
New integration files created:
- integration/square/ — Square POS integration (customers, payments, bookings, catalog, webhooks, sync)
- integration/vagaro/ — Vagaro salon management (customers, appointments, services, inventory, webhooks, sync)
- integration/compliance/ — GDPR requirements, CCPA requirements, privacy policy template, consent flows, DPA templates, data handling spec
- integration/architecture.md, integration/api-design.md

### Suggested Action
Verify these integrations work with actual Square/Vagaro API credentials when available. Note: this was COLORgenius work, not SKINgenius core.

### Metadata
- Source: session (skingenius-dev)
- Tags: integration, colorgenius, dev
- Affects: skingenius-dev

---

## [LRN-20260516-002] Research agent completed skin-condition-profiles deep analysis

**Logged**: 2026-05-16T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: research

### Summary
skingenius-research completed reading and processing the full skin-condition-profiles.md and related research files in two large sessions (ebd6feb8 and 6c6f2503, combined ~290KB of session data).

### Details
The research agent read comprehensive clinical profiles, ingredient databases, and product data to continue building the knowledge graph seed data. These sessions represent deep research work on the SKINgenius clinical database.

### Suggested Action
Verify that knowledge graph seed data from these sessions was properly saved and indexed.

### Metadata
- Source: session (skingenius-research)
- Tags: research, clinical-data, knowledge-graph
- Affects: skingenius-research

---

## [LRN-20260516-003] Marketing agent hit model timeout — COLORgenius marketing pages

**Logged**: 2026-05-16T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: marketing

### Summary
skingenius-marketing session 80ea2f23 experienced a model timeout/retry before completing COLORgenius marketing pages.

### Details
The session started with "Retry after the previous model attempt failed or timed out" before the subagent context. Despite this, the agent completed all marketing page deliverables for COLORgenius.

### Suggested Action
This is a transient model issue. No action needed unless it becomes chronic.

### Metadata
- Source: session (skingenius-marketing)
- Tags: model, timeout, marketing
- Affects: skingenius-marketing

---

## [LRN-20260516-004] Scan flow architecture and API route built

**Logged**: 2026-05-16T09:37:00Z
**Priority**: high
**Status**: applied
**Area**: dev

### Summary
CEO session (f495b5af) confirmed scan flow architecture fully designed and core API route built (31KB route.ts).

### Details
- SCAN-FLOW-ARCHITECTURE.md created
- Core API route built: src/app/api/[[...route]]/route.ts (31KB)
- Analysis pipeline, scan types, context, and navigator components coded
- Knowledge graph seeding script: scripts/seed-knowledge-graph.ts
- Supabase integration scaffolding started
- .learnings/ self-improvement docs generated by Pulse

### Suggested Action
Verify API route compiles and scan flow components integrate properly.

### Metadata
- Source: session (skingenius-ceo)
- Tags: architecture, api, scan-flow, dev
- Affects: skingenius-ceo, skingenius-dev

---

## [LRN-20260516-005] Dreaming system active — DREAMS.md and phase signals

**Logged**: 2026-05-16T09:37:00Z
**Priority**: low
**Status**: applied
**Area**: ai

### Summary
The OpenClaw dreaming system is now active, producing DREAMS.md and phase signal files in the memory directory. These appear to be automated consolidation/reflection artifacts.

### Details
New files:
- DREAMS.md (7.4KB) — Creative/dream-like reflections on project direction
- memory/.dreams/phase-signals.json, short-term-recall.json, daily-ingestion.json, session-ingestion.json
- memory/dreaming/light/, rem/, deep/ directories with daily entries

The dreaming content consistently reinforces the holistic model ("Skin is a mirror of internal health") and the pivot from product catalog to health intelligence platform.

### Suggested Action
Monitor dreaming output for useful project insights. No action needed — this is a system feature.

### Metadata
- Source: workspace analysis
- Tags: dreaming, ai, meta
- Affects: all agents

---

## [LRN-20260518-001] QMD embedding fails with --force flag (OOM kill on CPU)

**Logged**: 2026-05-18T21:37:00Z
**Priority**: high
**Status**: open
**Area**: infrastructure

### Summary
QMD `--force` embed consistently gets OOM-killed when run on CPU-only systems. The `--force` flag clears ALL vectors across ALL collections (not just the target), causing massive memory usage. Incremental embed (without `--force`) works but is extremely slow on CPU.

### Details
During Sprint 1 intelligence refresh (2026-05-18):
- `qmd embed --force` killed (OOM) multiple times
- Incremental embed (`qmd embed` without --force) runs but produces no output until completion
- skingenius-ws collection: 3/22 embedded, 19 pending
- skingenius-obsidian collection: 91/230 embedded, 139 pending
- Total: 905/1852 files have vectors, 1260 pending
- CPU-only environment (no GPU/Vulkan available)

### Suggested Action
1. Never use `--force` on CPU-only systems
2. Run incremental embed in background during off-peak hours
3. Investigate GPU/Vulkan acceleration for the host
4. Consider smaller batch embed operations

### Metadata
- Source: Pulse cycle analysis (skingenius-meta session 50a927af)
- Tags: qmd, embedding, cpu, oom, infrastructure
- Affects: skingenius-meta, all agents needing semantic search

---

## [LRN-20260518-002] CEO check-in redundancy crisis — 28+ redundant sessions in 72 hours

**Logged**: 2026-05-18T21:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
CEO check-in crons have produced 28+ near-identical status reports across 72+ hours (May 15-18). On May 18 alone, 20+ sessions ran between 9:15 AM and 5:37 PM, all recycling the same MEMORY.md content with zero new decisions, blockers, or escalations.

### Details
Every single CEO session on May 18 repeated:
- "Holistic vision locked" (from May 14)
- "236 products across 21 brands" (unchanged since May 14)
- "Phase 1/2 complete" (from May 15)
- "Sub-agent scraping pending" (still pending, no update)

Estimated token waste: 50K+ tokens/week across all redundant sessions.

### Suggested Action
1. **URGENT**: Reduce CEO check-in cron from hourly to every 4 hours minimum
2. Implement conditional skip: if no new files/commits since last check-in, skip or produce abbreviated status
3. Make check-ins event-driven (triggered by sub-agent completion, not timer)

### Metadata
- Source: Pulse session analysis (20+ CEO sessions on May 18)
- Tags: cron, ceo, redundancy, token-waste
- Affects: skingenius-ceo

---

## [LRN-20260518-003] Sprint 1 meta subagent QMD embed took entire session budget

**Logged**: 2026-05-18T21:37:00Z
**Priority**: medium
**Status**: open
**Area**: infrastructure

### Summary
The Sprint 1 intelligence refresh subagent (session 50a927af) spent most of its session budget trying to run QMD embed, which kept getting OOM-killed or running indefinitely on CPU.

### Details
- Graphify update succeeded (721 nodes, 1104 edges, 93 communities)
- QMD embed with --force: OOM killed after multiple attempts
- QMD embed without --force: ran indefinitely on CPU with no progress output
- The subagent had to be restarted via checkpoint 3 times
- Final status: incremental embed still incomplete

### Suggested Action
1. Pre-run QMD embed during off-peak hours before Pulse cycles
2. Add progress output to incremental embed
3. Set a timeout for embed operations within Pulse subagents

### Metadata
- Source: skingenius-meta session 50a927af
- Tags: qmd, embed, cpu, pulse, subagent
- Affects: skingenius-meta

---

## [LRN-20260518-004] Dev agent on-device AI session failed completely (4 consecutive failures)

**Logged**: 2026-05-18T21:37:00Z
**Priority**: medium
**Status**: open
**Area**: ai

### Summary
skingenius-dev session bc15c591 (May 17) experienced 4 consecutive "assistant turn failed before producing content" errors when trying to process the on-device AI architecture for SKINgenius.

### Details
The task was to read ON-DEVICE-AI-ARCHITECTURE.md and apply it to SKINgenius. All 4 assistant turns failed. No content was produced. This appears to be a model reliability issue (kimi-k2.6:cloud was the dev agent model).

### Suggested Action
1. Add retry with model fallback for failed assistant turns
2. Check if the on-device AI architecture document is accessible and well-formatted
3. Consider splitting large context tasks into smaller chunks

### Metadata
- Source: session analysis (skingenius-dev bc15c591)
- Tags: model-failure, dev, on-device-ai
- Affects: skingenius-dev

---

## [LRN-20260518-005] Research agent completed clinical scan using Google Scholar fallback

**Logged**: 2026-05-18T21:37:00Z
**Priority**: medium
**Status**: applied
**Area**: research

### Summary
skingenius-research successfully completed a clinical research scan for the top 3 active skin conditions (Acne, Rosacea, Eczema) using Google Scholar after Brave Search API hit quota limits.

### Details
- Brave Search API still returning 402 errors (quota exhausted)
- PubMed requires browser-based access
- Agent successfully fell back to Google Scholar for systematic reviews and meta-analyses
- Output written to /home/jason/.openclaw/workspaces/skingenius/skincare-research/research/

### Suggested Action
1. Add Google Scholar as a standard fallback in research agent instructions
2. Continue seeking Brave Search API quota upgrade
3. Consider caching PubMed article IDs for later browser-based access

### Metadata
- Source: session analysis (skingenius-research 562c77dc)
- Tags: research, brave-search, google-scholar, clinical
- Affects: skingenius-research

---

## [LRN-20260519-001] CEO check-in produces near-identical status reports across 12 sessions

**Logged**: 2026-05-19T09:37:00Z
**Priority**: high
**Status**: new
**Area**: workflow

### Summary
12 CEO check-in sessions in the last 12 hours all produced near-identical 5-bullet status reports. Each session independently queries memory_search, reads the same MEMORY.md and weekly status notes, and regenerates the same content. Total estimated token waste: ~150K tokens across 12 sessions.

### Details
- Sessions: 2134ea41, 31b751f9, 3f2e6cad, 5254764a, 7a276c04, 7ed500cc, 8098c6f4, 8ba6a8c8, a6de09b8, c4177958, ca371798, e400b079
- All triggered by cron:90d8d5a5 (CEO Check-in via Che)
- All read MEMORY.md (last updated 2026-05-15) and memory/2026-05-18.md
- All produce same 5-point summary: Phase 1+2 complete, Phase 3 in progress, Supabase JWT blocker, architecture tasks pending, MVP at risk
- No session produces novel insights or actions

### Suggested Action
1. Reduce CEO check-in frequency from hourly to 2x daily (morning + evening)
2. Add deduplication: if memory/2026-05-XX.md already has today's status, skip regeneration
3. Make check-ins action-oriented: only report if something CHANGED since last check-in
4. Store last check-in timestamp in MEMORY.md; sessions compare and skip if nothing new

### Metadata
- Source: Pulse session scan (12 CEO sessions, May 18-19)
- Tags: workflow, cron, token-waste, deduplication
- Affects: skingenius-ceo

---

## [LRN-20260519-002] Critical path tasks stuck at [ ] pending for 5+ days

**Logged**: 2026-05-19T09:37:00Z
**Priority**: critical
**Status**: active
**Area**: project-management

### Summary
The 5 critical path tasks (AI pipeline architecture, database schema, scan API contract, Vercel provisioning, PostgreSQL provisioning) have been at [ ] pending status since May 13. No evidence of any agent (Dermis/architect, Forge/devops) actually working on them in the last 12h session logs.

### Details
- TASKS.md still shows all 5 critical path items as [ ] pending
- No skingenius-architect sessions found in last 12h logs
- No skingenius-devops sessions found in last 12h logs
- CEO check-ins correctly identify this as a blocker but take no action
- The assigned agents (Dermis=skingenius-architect, Forge=skingenius-devops) appear dormant

### Suggested Action
1. Escalate to Jason: architect and devops agents need activation or task reassignment
2. Consider reassigning critical path tasks to active agents (skingenius-dev, skingenius-data)
3. Add agent health monitoring: detect when assigned agents have 0 sessions in 24h
4. Create a fallback plan: if architect/devops don't activate within 48h, redistribute work

### Metadata
- Source: TASKS.md review + session log scan
- Tags: project-management, blockers, agent-dormancy, critical-path
- Affects: skingenius-architect, skingenius-devops, skingenius-ceo

---

## [LRN-20260519-003] Meta heartbeat session shows intermittent model failures

**Logged**: 2026-05-19T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: ai

### Summary
Meta heartbeat sessions show intermittent model failure clusters — 4 consecutive failures on May 18, then recovery. Similar pattern in dev agent.

### Details
- skingenius-meta: 4 consecutive heartbeat failures on May 18, then recovered
- skingenius-dev: 4 consecutive "assistant turn failed" errors in one session
- Pattern: transient clusters followed by recovery, not permanent outages

### Suggested Action
1. Add retry with backoff (already partially in place)
2. Add model-failure alert to Pulse: if 3+ consecutive failures, flag in improvement report
3. Consider glm-5.1:cloud as stable fallback (proven reliable for meta agent)

---

## [LRN-20260519-004] CEO status reports remain unchanged for 4+ days — cron needs redesign

**Logged**: 2026-05-19T21:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
Cycle 6 confirms cycle 5 finding: CEO check-in cron continues producing near-identical reports every hour. 24 sessions in 24h, all reporting the same stale status. Zero action taken between cycle 5 and cycle 6 to reduce frequency or add change-detection.

### Details
- 24 CEO sessions in last 24h (up from 12 in previous 12h window)
- All produce identical "Phase 1+2 done, Phase 3 blocked, Supabase JWT invalid, architect idle" report
- MEMORY.md still 4 days stale (last updated May 15)
- No deduplication mechanism implemented despite cycle 5 recommendation
- Estimated token waste: ~300K tokens/24h cycle

### Suggested Action
1. **IMMEDIATE**: Reduce CEO check-in cron from hourly to 2x/day (8 AM + 8 PM ET)
2. **IMMEDIATE**: Add change-detection — compare last-report hash, skip if unchanged
3. Store report fingerprint in MEMORY.md for quick comparison

---

## [LRN-20260519-005] Critical path deadlock persists — 6+ days with zero progress

**Logged**: 2026-05-19T21:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
All 5 critical path tasks have been at [ ] pending since May 13 (now 6+ days). Assigned agents (skingenius-architect, skingenius-devops) remain completely dormant. No corrective action taken despite being flagged in cycles 4 and 5.

### Details
- Tasks stuck: AI pipeline architecture, DB schema, scan API contract, Vercel provisioning, PostgreSQL+pgvector
- skingenius-architect: 0 sessions in last 24h (dormant since May 13)
- skingenius-devops: 0 sessions in last 24h (dormant since May 13)
- These 5 tasks block 15+ downstream tasks
- MVP target (July 7) is at risk
- CEO reports continue flagging this but taking no corrective action

### Suggested Action
1. **Jason must intervene**: Reassign critical path tasks to active agents
2. Consider promoting skingenius-dev (Pixel) to handle architecture tasks
3. Add task-reassignment escalation: if agent dormant 48h+, auto-suggest redistribution

---

## [LRN-20260519-006] Lovi.care competitive teardown provides crucial UX intelligence

**Logged**: 2026-05-19T21:37:00Z
**Priority**: high
**Status**: captured
**Area**: product

### Summary
Jason provided 40+ screenshots of Lovi.care competitor app, producing a detailed competitive teardown covering 25+ screens across 6 phases (onboarding, algorithm theater, analysis results, recommendations, product routine, post-routine engagement).

### Details
- Key UX patterns identified: algorithm theater (forced loading with personalization), zone-by-zone analysis, progress calendar, massage/guide cards, skincare academy
- Monetization insights: free trial → paid subscription, product upsells within routine
- SKINgenius gaps identified vs Lovi: no scan flow, no AI pipeline, no progress tracking, no professional referral
- Doc created: docs/LOVI-CARE-COMPETITIVE-TEARDOWN.md

### Suggested Action
1. Use teardown to inform scan flow design (Phase 3)
2. Prioritize algorithm theater UX pattern for SKINgenius post-scan experience
3. Build competitive feature comparison matrix into product decisions

---

## [LRN-20260519-007] Agent MEMORY.md files don't exist — agents start every session with zero context

**Logged**: 2026-05-19T21:37:00Z
**Priority**: medium
**Status**: open
**Area**: workflow

### Summary
None of the 9 skingenius agent directories contain a MEMORY.md file. This means every agent session starts from scratch with no accumulated knowledge from previous sessions, leading to repeated work and inconsistent context.

### Details
- Checked all 9 agent directories: skingenius-ceo, dev, research, design, architect, devops, ai, data, syntax
- None have agent/MEMORY.md
- Agents rely solely on workspace MEMORY.md and AGENTS.md for context
- This explains why CEO check-in reports are identical — no session-to-session memory

### Suggested Action
1. Create MEMORY.md for each active agent with role-specific context
2. Update agent MEMORY.md after each significant session
3. Pulse should write to agent MEMORY.md files during improvement cycles

**Logged**: 2026-05-19T09:37:00Z
**Priority**: medium
**Status**: monitoring
**Area**: infrastructure

### Summary
The skingenius-meta heartbeat session (ea96798b) shows 4 consecutive "assistant turn failed before producing content" errors on May 18, followed by successful heartbeats. Pattern: model failures come in clusters, then recover.

### Details
- Heartbeat poll failures: 4 consecutive failures on session ea96798b
- Then recovered with successful HEARTBEAT_OK responses
- Same pattern seen in skingenius-dev session bc15c591 (4 failures)
- Likely same root cause: transient model provider issues

### Suggested Action
1. Add exponential backoff to heartbeat polling after consecutive failures
2. Log failure patterns to detect chronic vs transient issues
3. Alert if 5+ consecutive failures occur (could indicate systemic model outage)

### Metadata
- Source: skingenius-meta session ea96798b analysis
- Tags: infrastructure, model-failure, heartbeat
- Affects: skingenius-meta

---

## [LRN-20260520-001] CEO check-in cron produces 23 sessions/24h with zero tool calls — pure waste

**Logged**: 2026-05-20T09:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
Cycle 7 confirms cycles 5 and 6 findings with worsening metrics: 23 CEO check-in sessions in 24 hours, ALL producing near-identical status reports with ZERO tool calls. Every session reads MEMORY.md (stale since May 15), regurgitates the same 5-bullet summary, and exits. Estimated token waste: ~345K tokens/24h (23 sessions × ~15K tokens each).

### Details
- 23 CEO sessions in 24h (up from 12 in previous 12h window, consistent with hourly cron)
- ALL 6 sampled sessions have 0 tool calls — pure text generation, no file reads, no searches, no actions
- MEMORY.md last updated May 15 (5 days stale)
- Same content recycled: "Phase 1+2 done, Phase 3 blocked, Supabase JWT invalid, architect idle"
- No corrective action taken between cycles 5, 6, and 7
- Total estimated token waste across cycles 5-7: ~800K+ tokens

### Suggested Action
1. **CRITICAL**: Reduce CEO check-in cron to 2x/day (8 AM + 8 PM ET)
2. Add change-detection: hash MEMORY.md, skip if unchanged since last report
3. Store last-report-hash in workspace for quick comparison
4. Make check-ins ACTION-oriented: only report deltas

### Metadata
- Source: Pulse cycle 7 analysis (23 CEO sessions, May 19-20)
- Tags: workflow, cron, token-waste, critical
- Affects: skingenius-ceo

---

## [LRN-20260520-002] Critical path deadlock reaches 7+ days — architect and devops still dormant

**Logged**: 2026-05-20T09:37:00Z
**Priority**: critical
**Status**: open
**Area**: project-management

### Summary
All 5 critical path tasks have been at [ ] pending since May 13 (now 7+ days). Assigned agents (skingenius-architect=Dermis, skingenius-devops=Forge) remain completely dormant — 0 sessions in the last 24h. This has been flagged in 3 consecutive Pulse cycles (5, 6, 7) with no corrective action.

### Details
- 5 critical path tasks still [ ] pending: AI pipeline architecture, DB schema, scan API contract, Vercel provisioning, PostgreSQL provisioning
- skingenius-architect: 0 sessions in last 24h (dormant since initial creation)
- skingenius-devops: 0 sessions in last 24h (dormant since initial creation)
- These 5 tasks block 15+ downstream tasks
- MVP target (July 7) is now at risk — 1 of 8 weeks already lost
- CEO reports continue flagging but no escalation to Jason has succeeded

### Suggested Action
1. **Jason MUST intervene**: Assign these tasks to active agents or activate architect/devops
2. Reassign AI pipeline architecture to skingenius-dev (Pixel, currently active)
3. Reassign Vercel/PostgreSQL provisioning to skingenius-dev (can be done by active dev)
4. Set 48h deadline: if architect/devops don't activate by May 22, redistribute all their tasks

### Metadata
- Source: Pulse cycle 7, TASKS.md review
- Tags: project-management, blockers, critical-path, dormant-agents
- Affects: skingenius-architect, skingenius-devops, skingenius-ceo

---

## [LRN-20260520-003] Agent MEMORY.md files still don't exist — no session-to-session context persistence

**Logged**: 2026-05-20T09:37:00Z
**Priority**: medium
**Status**: open
**Area**: workflow

### Summary
Despite being flagged in cycle 6 (LRN-20260519-007), none of the 11 skingenius agent directories contain a MEMORY.md file. This means every agent session starts with zero accumulated knowledge from previous work sessions.

### Details
- All 11 agent directories checked: no MEMORY.md files found
- CEO check-in reports are identical because the CEO starts each session from scratch
- No agent has persistent memory of what it accomplished in previous sessions
- This was flagged in cycle 6 but no corrective action was taken

### Suggested Action
1. **Creating agent MEMORY.md files in this cycle** — Pulse will write them
2. Update agent MEMORY.md after each significant session
3. Add MEMORY.md existence check to Pulse monitoring

### Metadata
- Source: Pulse cycle 7, directory scan
- Tags: workflow, memory, agent-context
- Affects: all skingenius agents
---

## [LRN-20260520-004] MANA Labs integration completed — Product Scanner + DB schema + new condition

**Logged**: 2026-05-20T21:37:00Z
**Priority**: high
**Status**: applied
**Area**: dev

### Summary
skingenius-dev (Pixel) completed 3 significant deliverables in a single day (May 20), representing the first real forward progress on the critical path since May 14:

1. **MANA Labs Product Scanner API** — 4-tier pipeline (INCIdecoder → EWG → COSING → Gemini), safety scoring, compatibility checking
2. **MANA Labs Database Schema** — 6 new tables with RLS, indexes, CHECK constraints (002_mana_integration.sql)
3. **Knowledge graph: Excess Sebum & Enlarged Pores condition** — 25th condition added to seed-data.json

### Details
- 13 new files created: API routes, scanner library, database migration, seed data, types
- scan.ts (11.8KB) — POST /api/products/scan endpoint
- check-compatibility.ts (5.6KB) — POST /api/products/check-compatibility endpoint  
- scanner/pipeline.ts (7.9KB) — 4-tier ingredient resolution pipeline
- scanner/ingredient-scorer.ts (4.3KB) — Safety scoring engine
- scanner/compatibility-engine.ts (6.9KB) — Product compatibility checking
- scanner/tier1-incidecoder.ts through tier4-gemini.ts — Individual tier implementations
- scanner/rules/ — comedogenicity, pregnancy, interactions rules
- data/ingredient-safety.json — 50 ingredient safety records
- 002_mana_integration.sql (10.6KB) — 6 tables with full RLS
- types/mana.ts — TypeScript type definitions
- Knowledge graph expanded to 25 conditions

### Build Issues Noted
- scan.ts had TypeScript errors (TS1109: Expression expected) that required patching
- `update_plan` tool validation errors in dev subagent sessions
- `write` tool called with empty arguments (missing required `path` and `content`)
- npm test command failed (no test runner configured)
- psql connection failed (expected — no local database)

### Suggested Action
1. Validate TypeScript compilation of all new files in a proper build environment
2. Run the Supabase migration against a real instance
3. Add integration tests for the 4-tier scanner pipeline
4. Consider this pattern (subagent dispatch from CEO) for remaining critical path tasks

### Metadata
- Source: Pulse cycle 8, session analysis (skingenius-dev)
- Tags: dev, mana-labs, scanner, api, database
- Affects: skingenius-dev

---

## [LRN-20260520-005] CEO check-in cron continues — 30+ sessions in 24h, still zero action

**Logged**: 2026-05-20T21:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
CEO check-in cron continues running approximately hourly. Between May 19 21:37 and May 20 21:37, 30+ sessions ran, all producing near-identical 5-bullet status reports. Despite flagging in 4 consecutive Pulse cycles (5, 6, 7, 8), no corrective action has been taken. Estimated cumulative token waste across all cycles: ~1.2M+ tokens.

### Details
- 30+ CEO sessions in 24h (consistent with hourly cron)
- All produce same report: "Phase 1+2 done, no new work, architect idle, MVP at risk"
- MEMORY.md still referencing May 19 status
- Notably, significant new work DID happen on May 20 (MANA scanner, DB schema, condition) but CEO did not detect it — reports still say "no new deliverables"
- This confirms the CEO has no mechanism to detect new file creation or subagent completions

### Suggested Action
1. **URGENT**: Reduce CEO check-in cron to 2x/day maximum
2. Add file-system change detection: compare `find -newer` timestamps vs last check-in
3. CEO should run `git status` or `find -mmin -60` to detect recent work before reporting
4. Store last-report-hash to skip unchanged reports

### Metadata
- Source: Pulse cycle 8, 30+ CEO session analysis
- Tags: workflow, cron, token-waste, critical
- Affects: skingenius-ceo

---

## [LRN-20260521-001] CEO check-in cron reaches 30+ sessions/24h — cumulative token waste exceeds 1.2M

**Logged**: 2026-05-21T09:37:00Z
**Priority**: critical
**Status**: open
**Area**: workflow

### Summary
CEO check-in cron (cron:90d8d5a5) continues producing 30+ near-identical sessions per 24h. This has been flagged in 5 consecutive Pulse cycles (5-9) with ZERO corrective action taken. Estimated cumulative token waste across all cycles: 1.2M+ tokens. This is the single largest resource waste in the system.

### Details
- Cycle 9 (May 21): 12+ CEO sessions in last 12h, all producing identical 5-bullet status reports
- All sessions triggered by cron:90d8d5a5 (CEO Check-in via Che)
- Every session reads MEMORY.md (updated May 20), searches memory, regenerates the same content
- Notably, even after MANA Labs integration was completed on May 20, CEO reports were stale for hours because it doesn't detect filesystem changes
- This pattern has been flagged 5 times across cycles 5-9 with no fix applied

### Suggested Action
1. **CRITICAL**: Reduce CEO check-in cron from hourly to 2x/day maximum
2. Add filesystem change detection: `find . -mmin -1440 -type f` before generating reports
3. Store last-report-hash to skip unchanged content
4. Make check-ins delta-only: only report what CHANGED since last check-in

### Metadata
- Source: Pulse cycle 9 (May 21, 2026)
- Tags: workflow, cron, token-waste, critical, ceo
- Affects: skingenius-ceo

---

## [LRN-20260521-002] MANA Labs Phase 1 delivered — partial critical path progress

**Logged**: 2026-05-21T09:37:00Z
**Priority**: high
**Status**: applied
**Area**: dev

### Summary
skingenius-dev (Pixel) completed MANA Labs integration Phase 1 on May 20, partially addressing 2 of 5 critical path tasks (DB schema and scan API contract). This is the first real forward progress on the critical path since May 14.

### Details
Deliverables:
1. Product Scanner API — 4-tier pipeline (INCIdecoder → EWG → COSING → Gemini)
2. Database Schema — 002_mana_integration.sql (6 tables with RLS, indexes, CHECK constraints)
3. New condition: Excess Sebum & Enlarged Pores (25th condition in knowledge graph)
4. Ingredient safety data: 50 records seeded

Still pending on critical path:
- Task #1: AI pipeline architecture (Dermis/architect — dormant)
- Task #4: Vercel provisioning (Forge/devops — dormant)
- Task #5: PostgreSQL provisioning (Forge/devops — dormant)

### Suggested Action
1. Validate TypeScript compilation of all new files in a proper build environment
2. Run Supabase migration 002 against real instance
3. Reassign remaining critical path tasks to active agents if architect/devops don't activate within 48h

### Metadata
- Source: Pulse cycle 9, skingenius-dev session analysis
- Tags: dev, mana-labs, scanner, database, critical-path
- Affects: skingenius-dev

---

## [LRN-20260521-003] Critical path deadlock reaches 8+ days — architect and devops still dormant

**Logged**: 2026-05-21T09:37:00Z
**Priority**: critical
**Status**: open
**Area**: project-management

### Summary
All 3 remaining critical path tasks (AI pipeline architecture, Vercel provisioning, PostgreSQL provisioning) have been at [ ] pending since May 13 (8+ days). Assigned agents remain completely dormant. This has been flagged in 5 consecutive Pulse cycles (5-9) with no corrective action.

### Details
- skingenius-architect (Dermis): 0 sessions EVER (dormant since creation)
- skingenius-devops (Forge): 0 sessions EVER (dormant since creation)
- These 3 tasks block 15+ downstream tasks
- MVP target (July 7) is now at serious risk — 1+ weeks lost
- CEO reports continue flagging but no escalation to Jason has succeeded
- MANA Labs work (tasks #2 and #3) was done by dev agent, proving active agents can handle these tasks

### Suggested Action
1. **Jason MUST intervene**: Activate architect/devops agents or reassign their tasks immediately
2. Reassign AI pipeline architecture to skingenius-dev (Pixel) — proven capable
3. Reassign Vercel/PostgreSQL provisioning to skingenius-dev — infrastructure tasks are doable
4. Set hard deadline: if architect/devops don't activate by May 23, redistribute all their tasks

### Metadata
- Source: Pulse cycle 9, TASKS.md review
- Tags: project-management, blockers, critical-path, dormant-agents
- Affects: skingenius-architect, skingenius-devops, skingenius-ceo

---

## [LRN-20260521-004] Meta heartbeat failures — 12 out of 25 heartbeats failed

**Logged**: 2026-05-21T09:37:00Z
**Priority**: medium
**Status**: open
**Area**: infrastructure

### Summary
skingenius-meta heartbeat session (ea96798b) shows 12 failed heartbeats out of 25 total (48% failure rate). Failures come in clusters of 4-5, followed by recovery periods.

### Details
- 13 successful HEARTBEAT_OK responses
- 12 "assistant turn failed before producing content" errors
- Pattern: clusters of failures followed by recovery
- Same pattern seen in skingenius-dev (LRN-20260518-004)
- Likely model provider instability (kimi models)

### Suggested Action
1. Add exponential backoff after consecutive failures
2. Alert if 5+ consecutive failures occur
3. Consider model fallback chain for heartbeat sessions

### Metadata
- Source: skingenius-meta session ea96798b
- Tags: infrastructure, model-failure, heartbeat
- Affects: skingenius-meta

---

## [LRN-20260521-005] Research doc expansion — Dr. Bailey + Paula's Choice + Trending Ingredients

**Logged**: 2026-05-21T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: research

### Summary
Three significant research synthesis documents were added to the workspace on May 20-21:
1. Dr. Bailey Research Synthesis — 10 dermatologist-authored articles (acne, rosacea, pores, vitamin C, dehydrated skin, etc.)
2. Paula's Choice Research Synthesis — 10 evidence-based articles (anti-aging, peels, vitamin C, retinol)
3. Trending Ingredients & Devices — PDRN, panthenol, ectoin, microcurrent, LED (full mechanisms)

Plus 11 individual Dr. Bailey article clean-text extractions in research/dr-bailey-crawls/.

### Details
- These docs enrich the evidence base for condition recommendations
- Dr. Bailey content covers clinical-grade dermatological advice (board-certified dermatologist since 1987)
- Paula's Choice content provides ingredient-level evidence with peer-reviewed citations
- Trending ingredients doc covers 2026 skin longevity trends (barrier repair, biocompatible actives, device stacking)

### Suggested Action
1. Incorporate Dr. Bailey evidence into knowledge graph condition entries
2. Add trending ingredients to seed-data.json for database seeding
3. Cross-reference Paula's Choice ingredient data with existing ingredient profiles

### Metadata
- Source: workspace filesystem analysis (May 20-21)
- Tags: research, evidence-base, clinical-data
- Affects: skingenius-research, skingenius-data

---

## [LRN-20260521-006] COLORgenius navigation spec created by SKINgenius design agent

**Logged**: 2026-05-21T09:37:00Z
**Priority**: low
**Status**: applied
**Area**: design

### Summary
skingenius-design (Aura) was dispatched to spec the COLORgenius mobile app navigation architecture. The spec was written to /home/jason/.openclaw/workspaces/colorgenius/mobile/docs/NAV-ARCHITECTURE.md (17,390 bytes).

### Details
- This is cross-project work — SKINgenius design agent working on COLORgenius
- The design agent was spawned as a subagent from skingenius-ceo
- This confirms the CEO is using subagents for cross-project work
- No conflict with SKINgenius work identified

### Suggested Action
No action needed. Note for awareness: cross-project agent dispatch is working.

### Metadata
- Source: skingenius-design session 7b55f048
- Tags: design, cross-project, colorgenius
- Affects: skingenius-design

---

## [LRN-20260522-001] Data agent produced recommendation engine + seed data v1.1 — major milestone

**Logged**: 2026-05-22T09:37:00Z
**Priority**: high
**Status**: applied
**Area**: data, backend

### Summary
skingenius-data (Nexus) completed two major deliverables in recent sessions:
1. **Recommendation Engine**: TypeScript modules for fit scoring, query engine, and API route (`/api/v1/recommendations`) — includes Supabase integration, evidence-based scoring, and condition-product matching
2. **Seed Data v1.1**: 151KB knowledge graph seed data with conditions, ingredients, products, and recommendation mappings — includes root-cause layer, Basys Health integration fields, and trending 2026 ingredients (PDRN, panthenol, ectoin, microcurrent, LED)

### Details
- Fit scoring module (`src/lib/recommendations/fitScore.ts`) uses evidence tiers (strong/moderate/weak) with safety scoring
- Query engine (`src/lib/recommendations/queryEngine.ts`) supports condition-based, ingredient-based, and concern-based queries
- API route handles POST requests for recommendation generation
- Seed data includes 25+ conditions, 151+ ingredients, root-cause analysis, and Basys Health biomarker integration

### Suggested Action
1. Run `seed-supabase.ts` script to populate the database with seed data
2. Add integration tests for the recommendation API
3. Validate fit scoring algorithm with known condition-ingredient pairs

### Metadata
- Source: skingenius-data sessions 69101e65, 5ed3b576
- Tags: backend, recommendation-engine, seed-data, supabase
- Affects: skingenius-data, skingenius-dev

---

## [LRN-20260522-002] Architect agent active — designed API architecture + seed data schema

**Logged**: 2026-05-22T09:37:00Z
**Priority**: medium
**Status**: applied
**Area**: architecture

### Summary
skingenius-architect (Dermis) broke dormancy and completed two significant architecture sessions:
1. API Architecture design (`docs/API-ARCHITECTURE.md`) — Scan → Conditions → Recommendations pipeline
2. Knowledge graph seed data schema design — conditions, ingredients, root causes, Basys Health integration

Note: Architect had multiple `assistant_turn_failed` errors but still produced deliverables.

### Details
- The architect agent was previously flagged as dormant for 8+ days
- Recent sessions show it was activated for specific subagent tasks from the CEO/data agent
- Output includes comprehensive API pipeline design with tiered model strategy (EXIF → Kimi K2.6 → MiMo → Premium fallback)

### Suggested Action
1. Keep architect agent active for Phase 3 architectural decisions
2. Monitor for recurring `assistant_turn_failed` errors
3. Have architect review dev agent's implementation for alignment

### Metadata
- Source: skingenius-architect sessions 9277f891, bd3cd0d5
- Tags: architecture, api-design, seed-data
- Affects: skingenius-architect, skingenius-dev

---

## [LRN-20260522-003] Research agent web fetch 403 errors — PubMed/external sources blocking

**Logged**: 2026-05-22T09:37:00Z
**Priority**: medium
**Status**: open
**Area**: research

### Summary
skingenius-research encountered 403 Forbidden errors when attempting to web_fetch from certain academic and institutional sources. This blocks real-time research from PubMed, UCI datasets, and similar sources.

### Details
- Research agent session 0cc8a1c3 shows `web_fetch` 403 errors
- Affected sources include arxiv.org (which worked but some redirects failed) and UCI ML datasets
- The agent fell back to successful alternative sources but lost some data depth

### Suggested Action
1. Consider using autocli or browser automation for 403-blocked academic sources
2. Add a cached PubMed reference layer to avoid repeated fetching
3. Build a local research cache that agents can reference instead of live-fetching

### Metadata
- Source: skingenius-research session 0cc8a1c3
- Tags: research, web-fetch, error-handling
- Affects: skingenius-research

---

## [LRN-20260522-004] Dev agent produced scan pipeline — EXIF strip + quality gate + mock classifier

**Logged**: 2026-05-22T09:37:00Z
**Priority**: high
**Status**: applied
**Area**: development

### Summary
skingenius-dev (Pixel) produced the core scan pipeline implementation:
1. EXIF stripping module (`src/lib/scan/exif.ts`) — server-side privacy-first image handling
2. Quality gate module (`src/lib/scan/qualityGate.ts`) — Kimi K2.6 integration for image quality validation
3. Mock classifier (`src/lib/scan/mockClassifier.ts`) — development-mode skin condition classification
4. API route (`/api/v1/scan/route.ts`) — the main scan endpoint

Also produced shared types (`src/types/api.ts`, `src/types/scan.ts`) and Supabase service module.

### Details
- TypeScript build errors encountered (V1ScanMetadata missing `storage_failed` field)
- Multiple `next build` runs during development (build-fix-verify cycles)
- Tool validation errors when using `edit` tool with wrong parameter structure
- Implementation follows the architect's API architecture spec

### Suggested Action
1. Fix TypeScript type errors (V1ScanMetadata storage_failed field)
2. Add integration tests for scan pipeline
3. Wire up quality gate to actual Kimi K2.6 API (currently mock?)
4. Connect scan pipeline to recommendation engine

### Metadata
- Source: skingenius-dev sessions 7ec49665, 09c2e73c
- Tags: development, scan-pipeline, api, typescript
- Affects: skingenius-dev
