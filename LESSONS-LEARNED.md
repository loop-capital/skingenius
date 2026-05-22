# LESSONS-LEARNED.md — SKINgenius Failure Log

> **Purpose:** Document failures so they don't repeat. Log lessons specific to SKINgenius work here.

---

## How To Use This File

1. **Before starting any task:** Read the anti-patterns below
2. **After any failure:** Add an entry immediately — don't wait
3. **Weekly review:** Clean up and promote durable rules

---

## Critical Anti-Patterns (Universal — DO NOT REPEAT)

### 🔴 AP-001: "I'll Back It Up Later"
Declare a safety step then skip it. **Fix:** Verify backup exists (`git branch`, `ls` backup path) before ANY destructive write.

### 🔴 AP-002: Retry Without Reading the Error
Something fails, retry 3+ times without checking why. **Fix:** Read the error, search for the cause, max 2 identical attempts before diagnosing.

### 🔴 AP-003: Memory Is Write-Only
Write to memory but never check it before tasks. **Fix:** Read this file + MEMORY.md at session start.

### 🟡 AP-004: Ask Instead of Act
Found a clear fix, asked permission instead of doing it. **Fix:** Act on internal improvements. Only ask before destructive/external actions.

### 🟡 AP-005: No Post-Mortem After Failure
Moved on without documenting. **Fix:** Write root cause to this file immediately after any failure >30 min.

### 🔴 AP-006: Cross-Talk Into Other Bot's Conversations
Responded to status from another bot as if it were my task. **Fix:** Status reports from other bots are READ ONLY unless the human explicitly asks me to act.

### 🔴 AP-007: Not Checking Existing Work Before Starting New
Spawned an agent to build something that already existed. **Fix:** `ls` the target, `git log`, search memory before spawning any "build X" task.

---

## Platform Knowledge (SKINgenius Stack)

### Vision / Image Analysis
- **Kimi K2.6 (`ollama/kimi-k2.6:cloud`)** supports image input — use for image analysis tasks
- Cheaper than specialized vision APIs for initial analysis
- For SKINgenius skin scanning: consider Kimi for first-pass, Omni or dedicated vision model for clinical-grade analysis

### Next.js
- _Add lessons here as you encounter issues_

### Supabase
- Service role key ≠ anon key (different permissions)
- Rotating keys breaks connected services
- 11 tables live: profiles, skin_photos, skin_conditions, skin_analyses, ingredients, products, routines, routine_steps, user_skin_profiles, skin_log_entries, ingredient_reactions
- Schema: `supabase/schema.sql`

### TypeScript
- _Add lessons here as you encounter issues_

### Vercel
- Free tier: 100 deploys/day, resets midnight UTC (8 PM ET)
- Batch edits, don't deploy one at a time

---

## Project-Specific Lessons

_SKINgenius failures and discoveries go here. Every session should check this before starting work._

<!-- Examples:
- "Knowledge graph already exists at knowledge-graph/ — don't rebuild"
- "Research reports are in research/ — 16 files, 1.3 MB"
- "Don't use MiMo for research tasks — SKINgenius-research (Kimi) handles it"
-->
