import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('renders dashboard with header "Scan Results"', async ({ page }) => {
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/SKINgenius/);

    // Verify header contains "Scan Results"
    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Scan Results');
  });

  test('displays scan date and Fitzpatrick type', async ({ page }) => {
    // Verify scan metadata is displayed
    const dateText = page.locator('text=2025-05-22');
    await expect(dateText).toBeVisible();

    // Verify Fitzpatrick label is shown
    const fitzpatrickText = page.locator('text=Type III');
    await expect(fitzpatrickText).toBeVisible();
  });

  test('displays skin score with correct structure', async ({ page }) => {
    // Verify "Skin Score" label
    const skinScoreLabel = page.locator('text=Skin Score');
    await expect(skinScoreLabel).toBeVisible();

    // Verify score value is present (mock data shows 68)
    const scoreValue = page.locator('text=68');
    await expect(scoreValue).toBeVisible();

    // Verify "/ 100" denominator
    const maxScore = page.locator('text=/ 100');
    await expect(maxScore).toBeVisible();
  });

  test('displays action buttons (Share and Rescan)', async ({ page }) => {
    // Verify Share button
    const shareButton = page.getByRole('button', { name: /Share with Esthetician/i });
    await expect(shareButton).toBeVisible();

    // Verify Rescan button
    const rescanButton = page.getByRole('button', { name: /Rescan/i });
    await expect(rescanButton).toBeVisible();
  });

  test('displays conditions section with detected conditions', async ({ page }) => {
    // Verify conditions section heading
    // ConditionsGrid component renders conditions - verify at least one condition card exists
    const conditionCards = page.locator('[class*="Card"]');
    await expect(conditionCards.first()).toBeVisible();

    // Verify known mock conditions appear
    await expect(page.locator('text=Acne Vulgaris')).toBeVisible();
    await expect(page.locator('text=Post-Inflammatory Hyperpigmentation')).toBeVisible();
  });

  test('displays skin zone map section', async ({ page }) => {
    // SkinZoneMap component should render zones
    // Verify zone-related content exists
    const zoneContent = page.locator('text=forehead, text=t-zone, text=under-eye, text=cheeks');
    // At least some zone content should be visible
    await expect(page.locator('text=forehead').first()).toBeVisible();
  });

  test('displays root causes section', async ({ page }) => {
    // Verify Root Causes heading
    const rootCausesHeading = page.locator('h2').filter({ hasText: 'Root Causes' });
    await expect(rootCausesHeading).toBeVisible();

    // Verify AI-driven badge
    const aiBadge = page.locator('text=AI-driven');
    await expect(aiBadge).toBeVisible();

    // Verify known root causes from mock data
    await expect(page.locator('text=Barrier Dysfunction')).toBeVisible();
    await expect(page.locator('text=Microbiome Imbalance')).toBeVisible();
    await expect(page.locator('text=Inflammation')).toBeVisible();
  });

  test('displays recommendations section with products', async ({ page }) => {
    // Verify Recommended Products heading
    const recsHeading = page.locator('h2').filter({ hasText: 'Recommended Products' });
    await expect(recsHeading).toBeVisible();

    // Verify Evidence-ranked badge
    const evidenceBadge = page.locator('text=Evidence-ranked');
    await expect(evidenceBadge).toBeVisible();

    // Verify "View all" link/button
    const viewAll = page.getByRole('button', { name: /View all/i });
    await expect(viewAll).toBeVisible();

    // Verify known mock products appear
    await expect(page.locator('text=Barrier Repair Moisturizer')).toBeVisible();
    await expect(page.locator('text=Azelaic Acid 15% Gel')).toBeVisible();
    await expect(page.locator('text=Retinol 0.3% Serum')).toBeVisible();
  });

  test('rescan button navigates to /scan', async ({ page }) => {
    const rescanButton = page.getByRole('button', { name: /Rescan/i });
    await rescanButton.click();

    await expect(page).toHaveURL(/\/scan/);
    await expect(page.locator('h1')).toContainText('Skin Scan');
  });

  test('page has proper semantic structure', async ({ page }) => {
    // Verify main content area exists
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Verify header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
