---
description: Audit file against CLAUDE.md rules and refactor
scope: project
argument-hint: <file-path> [--dry-run]
---

# Refactor — Best Practices Enforcement

Refactor the target file following every rule in this project's CLAUDE.md.

**Target:** $ARGUMENTS

If `--dry-run` is passed, report what WOULD change without modifying any files.

## Step 0 — Auto-Branch

If on `main` or `master`, create a feature branch:

```bash
git branch --show-current
git checkout -b refactor/<filename-without-extension>
```

## Step 0.5 — Read Before Touching

NEVER refactor blind. Read these files first:

1. The target file (fully — every line)
2. `CLAUDE.md` — current project rules
3. `API-ARCHITECTURE.md` — where things belong
4. `tsconfig.json` — TypeScript strict mode settings

Also check blast radius:
```bash
# What imports this file?
grep -r "import.*<filename>" src/
```

## Step 1 — Audit the File

### 1A. File Size
- **> 300 lines = MUST split.** No exceptions.

### 1B. Function Size
- **> 50 lines = MUST extract.** No exceptions.

### 1C. TypeScript Compliance
- If `.js` or `.jsx` → convert to `.ts` / `.tsx`
- Find ALL `any` types → replace with proper types
- Missing return types on exported functions
- `@ts-ignore` or `@ts-expect-error` — remove if possible

### 1D. Import Hygiene
- No barrel imports
- No circular imports
- Types use `import type { }`
- Unused imports → remove
- Sort: external packages first, then internal, then types

### 1E. Error Handling
- No swallowed errors (`catch { return null }`)
- No empty catch blocks
- Errors logged with context
- User-facing errors have clear messages

### 1F. Supabase / Database Access
- Service role key ONLY in server-side code
- Client code uses anon key only
- All queries respect RLS
- No raw SQL injection vulnerabilities

### 1G. API Routes (Rule 2)
- All endpoints use `/api/v1/` prefix
- No business logic in route handlers
- Input validation on every route
- Proper HTTP status codes

### 1H. Independent Awaits
- Sequential `await` calls that don't depend on each other → `Promise.all`

### 1I. Security
- No hardcoded secrets
- No SQL/NoSQL injection
- Input validation on external data

### 1J. Dead Code
- Unused functions → remove
- Commented-out code → remove

## Step 2 — Plan the Refactor

Before changing ANYTHING, present the plan:

```
Refactor Plan for: src/handlers/users.ts (347 lines)
=====================================================

File size: 347 lines → SPLIT REQUIRED (max 300)

Split into:
  1. src/handlers/users.ts        — main handler (~120 lines)
  2. src/handlers/user-validation.ts — input validation (~80 lines)
  3. src/types/user.ts            — types (~40 lines)

TypeScript fixes:
  - Line 45: `any` → `CreateUserInput`
  - Line 89: missing return type → `Promise<UserResponse>`

Other fixes:
  - Lines 23-25: sequential awaits → Promise.all
  - Line 67: swallowed error → proper logging + rethrow

Blast radius: imported by 3 files
Proceed? (yes / no / modify plan)
```

WAIT for user approval before making any changes.

## Step 3 — Execute the Refactor

After approval, make changes in this order:

1. Create new files first (types, helpers, utilities)
2. Move code from original file to new files
3. Update imports in original file
4. Update imports in ALL files that imported from original
5. Fix TypeScript (types, return types, remove `any`)
6. Fix patterns (Promise.all, error handling, dead code)
7. Verify TypeScript compiles: `npx tsc --noEmit`

## Step 4 — Verify

- [ ] TypeScript compiles clean
- [ ] No broken imports
- [ ] No file exceeds 300 lines
- [ ] No function exceeds 50 lines
- [ ] No remaining `any` types

## Step 5 — Report

```
Refactor Complete: src/handlers/users.ts
========================================
Before: 1 file, 347 lines, 4 violations
After:  4 files, ~300 lines total, 0 violations

Files created:
  ✓ src/types/user.ts
  ✓ src/handlers/user-validation.ts

Files modified:
  ✓ src/handlers/users.ts (120 lines — down from 347)

Fixes applied:
  ✓ 3 `any` types replaced
  ✓ 2 functions extracted
  ✓ 1 Promise.all optimization
  ✓ 1 swallowed error fixed

TypeScript: compiles clean ✓
```
