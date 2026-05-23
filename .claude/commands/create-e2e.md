---
description: Scaffold Playwright E2E tests for SKINgenius
scope: project
argument-hint: <feature-or-page-name>
---

# Create E2E Test

Create a Playwright E2E test for: **$ARGUMENTS**

## ABSOLUTE RULES — Read Before Writing

### 1. Every test MUST have explicit success criteria

"Page loads" is NOT a test. Every `test()` block MUST assert:
- **URL** — verify correct URL
- **Visible elements** — verify key elements present
- **Correct data** — verify right content displayed
- **Error states** — verify error messages when expected

```typescript
// CORRECT — explicit success criteria
test('dashboard shows user data after login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Verify URL changed
  await expect(page).toHaveURL('/dashboard');
  // Verify key element visible
  await expect(page.locator('h1')).toContainText('Welcome');
  // Verify correct data displayed
  await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
});
```

### 2. Test structure — ALWAYS follow this pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('$ARGUMENTS', () => {
  test.describe('happy path', () => {
    test('should [specific behavior] when [specific condition]', async ({ page }) => {
      // ARRANGE
      // ACT
      // ASSERT — verify SPECIFIC outcomes (URL, elements, data)
    });
  });

  test.describe('error handling', () => {
    test('should show error when [invalid input]', async ({ page }) => {
      // Test the failure mode
    });
  });

  test.describe('edge cases', () => {
    test('should handle [empty state]', async ({ page }) => {
      // Test boundaries
    });
  });
});
```

### 3. Use baseURL from config

```typescript
// CORRECT — uses baseURL from playwright.config.ts
await page.goto('/dashboard');

// WRONG — hardcoded URL
await page.goto('http://localhost:3000/dashboard');
```

## Step 0 — Auto-Branch

If on `main` or `master`, create a branch:

```bash
git branch --show-current
git checkout -b test/$ARGUMENTS
```

## Step 1 — Gather Information

Before writing the test:

1. **Read the source code** for the feature/page
2. **Identify all assertions** — URLs, elements, data
3. **Identify error states** — what can go wrong?
4. **Check for test data** — seeded data? mock API?

## Step 2 — Write the Test

Create the test file at `tests/e2e/$ARGUMENTS.spec.ts`.

## Step 3 — Verification Checklist

After writing, verify:

- [ ] File is at `tests/e2e/$ARGUMENTS.spec.ts`
- [ ] Every `test()` has at least 3 assertions (URL, element, data)
- [ ] Error cases are covered
- [ ] No hardcoded ports (uses baseURL from config)
- [ ] No `// TODO` placeholders
- [ ] Test names describe behavior: "should [verb] when [condition]"
- [ ] No `any` types
- [ ] No `.only` left in the code

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run a specific test file
npx playwright test tests/e2e/$ARGUMENTS.spec.ts

# Run with UI mode (debug)
npx playwright test --ui

# Run headed (see the browser)
npx playwright test --headed

# View the last test report
npx playwright show-report
```
