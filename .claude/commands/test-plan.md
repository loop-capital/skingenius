---
description: Generate test plan from code analysis for SKINgenius
scope: project
argument-hint: <feature-name>
---

# Test Plan Generator

Create a structured test plan for: **$ARGUMENTS**

## Auto-Branch

If on `main` or `master`, create a branch:

```bash
git branch --show-current
git checkout -b test/$ARGUMENTS-plan
```

## Template

Generate the following markdown document:

```markdown
# [$ARGUMENTS] Test Plan

**Created:** [today's date]
**Feature:** $ARGUMENTS
**Status:** ⬜ Not Started

---

## Quick Status

| Feature Area | Status |
|-------------|--------|
| Unit Tests | ⬜ NOT TESTED |
| Integration Tests | ⬜ NOT TESTED |
| E2E Tests | ⬜ NOT TESTED |

---

## Prerequisites

- [ ] Required services running
- [ ] Test data created
- [ ] Environment variables set

---

## Unit Tests — Priority P0

### Test 1: [Core function/handler]

**Action:** Call function with valid input
**Expected:** Returns correct output

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Return type | Correct | | ⬜ |
| Data shape | Matches schema | | ⬜ |
| Edge case: null | Handles gracefully | | ⬜ |
| Edge case: empty | Handles gracefully | | ⬜ |

---

## Integration Tests — Priority P1

### Test 1: [API endpoint integration]

**Action:** Call endpoint with valid input
**Expected:** Returns 200, correct data

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Response code | 200 | | ⬜ |
| Data returned | [specific shape] | | ⬜ |
| Auth enforced | 401 for missing token | | ⬜ |

---

## E2E Tests — Priority P1

### Test 1: [User flow]

**Action:** User performs action in browser
**Expected:** UI updates correctly

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Page loads | < 2s | | ⬜ |
| Form submits | Success message shown | | ⬜ |
| Data persists | On page refresh | | ⬜ |

---

## Error Cases — Priority P0

### 1.1 [Invalid input]

**Action:** Submit invalid data
**Expected:** Specific error message shown

### 1.2 [Unauthorized access]

**Action:** Access without auth
**Expected:** Redirect to login or 401

---

## Edge Cases — Priority P2

### 3.1 [Empty state]
### 3.2 [Maximum values]
### 3.3 [Concurrent access]
### 3.4 [Network failure]

---

## Pass/Fail Criteria

| Criteria | Pass | Fail |
|----------|------|------|
| All P0 tests pass | Yes | Any failure |
| All P1 tests pass | Yes | Any failure |
| Error messages shown | Yes | Silent failure |
| Data persists | Yes | Lost on refresh |

---

## Sign-Off

| Test Level | Tester | Date | Status |
|-----------|--------|------|--------|
| Unit | | | ⬜ |
| Integration | | | ⬜ |
| E2E | | | ⬜ |
```

Save to `tests/plans/$ARGUMENTS-test-plan.md`

## After Creating

1. Create the `tests/plans/` directory if it doesn't exist
2. Write the test plan markdown
3. Report summary to the user
