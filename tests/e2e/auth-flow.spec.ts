import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.describe('/login — Login Page', () => {
    test('renders login page with all expected elements', async ({ page }) => {
      await page.goto('/login');

      // Verify page title contains SKINgenius
      await expect(page).toHaveTitle(/SKINgenius/);

      // Verify logo and brand
      await expect(page.getByText('SKINgenius', { exact: false })).toBeVisible();

      // Verify welcome heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Welcome back');

      // Verify subtext
      await expect(page.locator('text=Sign in to continue your skin journey')).toBeVisible();

      // Verify OAuth buttons
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Continue with Apple/i })).toBeVisible();

      // Verify email input
      const emailInput = page.locator('input#email');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');

      // Verify password input
      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Verify forgot password link
      const forgotPassword = page.getByRole('link', { name: /Forgot password/i });
      await expect(forgotPassword).toBeVisible();
      await expect(forgotPassword).toHaveAttribute('href', '/auth/reset-password');

      // Verify sign in button
      const signInButton = page.getByRole('button', { name: /Sign in$/i });
      await expect(signInButton).toBeVisible();

      // Verify sign up link
      const signUpLink = page.getByRole('link', { name: /Sign up/i });
      await expect(signUpLink).toBeVisible();
      await expect(signUpLink).toHaveAttribute('href', '/signup');
    });

    test('email input has correct autocomplete and required attributes', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.locator('input#email');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(emailInput).toHaveAttribute('required');

      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('shows password toggle functionality', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the eye toggle button (tabIndex=-1)
      const toggleButton = page.locator('button[tabindex="-1"]');
      await expect(toggleButton).toBeVisible();
      await toggleButton.click();

      // After click, password should be visible (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('form validation prevents submission with empty fields', async ({ page }) => {
      await page.goto('/login');

      const signInButton = page.getByRole('button', { name: /Sign in$/i });
      await signInButton.click();

      // HTML5 validation should prevent submission; page should still be on /login
      await expect(page).toHaveURL(/\/login/);

      // Verify the required inputs are still present
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
    });

    test('displays message query parameter when redirected from signup', async ({ page }) => {
      await page.goto('/login?message=check-email');

      // Verify the success message is shown
      const message = page.locator('text=Account created! Please check your email');
      await expect(message).toBeVisible();
    });

    test('trust badge is displayed at bottom', async ({ page }) => {
      await page.goto('/login');

      const trustBadge = page.locator('text=Your data is encrypted and never sold');
      await expect(trustBadge).toBeVisible();
    });
  });

  test.describe('/signup — Signup Page', () => {
    test('renders signup page with all form fields', async ({ page }) => {
      await page.goto('/signup');

      // Verify page title
      await expect(page).toHaveTitle(/SKINgenius/);

      // Verify heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Create your account');

      // Verify OAuth buttons
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Continue with Apple/i })).toBeVisible();

      // Verify display name input
      const displayNameInput = page.locator('input#displayName');
      await expect(displayNameInput).toBeVisible();
      await expect(displayNameInput).toHaveAttribute('placeholder', 'Jane Doe');

      // Verify email input
      const emailInput = page.locator('input#email');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');

      // Verify password input
      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('placeholder', 'At least 8 characters');

      // Verify confirm password input
      const confirmInput = page.locator('input#confirmPassword');
      await expect(confirmInput).toBeVisible();

      // Verify TOS checkbox
      const tosCheckbox = page.locator('input[type="checkbox"]');
      await expect(tosCheckbox).toBeVisible();

      // Verify TOS text contains links
      await expect(page.getByRole('link', { name: /Terms of Service/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Privacy Policy/i })).toBeVisible();

      // Verify create account button
      const createButton = page.getByRole('button', { name: /Create account/i });
      await expect(createButton).toBeVisible();

      // Verify login link
      const loginLink = page.getByRole('link', { name: /Log in/i });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('shows password mismatch validation error', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with mismatched passwords
      await page.locator('input#email').fill('test@example.com');
      await page.locator('input#password').fill('password123');
      await page.locator('input#confirmPassword').fill('different456');
      await page.locator('input[type="checkbox"]').check();

      // Submit form
      await page.getByRole('button', { name: /Create account/i }).click();

      // Verify error message
      const errorMessage = page.locator('text=Passwords do not match');
      await expect(errorMessage).toBeVisible();
    });

    test('shows password length validation error', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with short password
      await page.locator('input#email').fill('test@example.com');
      await page.locator('input#password').fill('short');
      await page.locator('input#confirmPassword').fill('short');
      await page.locator('input[type="checkbox"]').check();

      // Submit form
      await page.getByRole('button', { name: /Create account/i }).click();

      // Verify error message
      const errorMessage = page.locator('text=Password must be at least 8 characters');
      await expect(errorMessage).toBeVisible();
    });

    test('shows TOS agreement validation error', async ({ page }) => {
      await page.goto('/signup');

      // Fill form but leave TOS unchecked
      await page.locator('input#email').fill('test@example.com');
      await page.locator('input#password').fill('password123');
      await page.locator('input#confirmPassword').fill('password123');
      // Do NOT check TOS checkbox

      // Submit form
      await page.getByRole('button', { name: /Create account/i }).click();

      // Verify error message
      const errorMessage = page.locator('text=You must agree to the Terms of Service');
      await expect(errorMessage).toBeVisible();
    });

    test('form validation prevents submission with empty required fields', async ({ page }) => {
      await page.goto('/signup');

      // Click create account without filling anything
      await page.getByRole('button', { name: /Create account/i }).click();

      // Should still be on signup page (HTML5 validation)
      await expect(page).toHaveURL(/\/signup/);
    });
  });

  test.describe('Cross-Page Navigation', () => {
    test('can navigate from login to signup', async ({ page }) => {
      await page.goto('/login');

      const signUpLink = page.getByRole('link', { name: /Sign up/i });
      await signUpLink.click();

      await expect(page).toHaveURL(/\/signup/);
      await expect(page.locator('h1')).toContainText('Create your account');
    });

    test('can navigate from signup to login', async ({ page }) => {
      await page.goto('/signup');

      const loginLink = page.getByRole('link', { name: /Log in/i });
      await loginLink.click();

      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('h1')).toContainText('Welcome back');
    });

    test('forgot password link navigates to reset-password', async ({ page }) => {
      await page.goto('/login');

      const forgotLink = page.getByRole('link', { name: /Forgot password/i });
      await forgotLink.click();

      await expect(page).toHaveURL(/\/auth\/reset-password/);
    });
  });
});
