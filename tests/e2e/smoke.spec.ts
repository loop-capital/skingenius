import { test, expect } from '@playwright/test';

test.describe('SKINgenius Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');

    // Verify page title contains SKINgenius
    await expect(page).toHaveTitle(/SKINgenius/);

    // Verify page loaded successfully (not a 404 or error)
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Verify main content area is present
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('page responds with 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });
});
