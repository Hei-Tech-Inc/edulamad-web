import { expect, test } from '@playwright/test';

/**
 * Smoke-test that primary form controls accept input (no full API round-trip).
 * Deep auth + profile flows need a running API and test credentials.
 */
test.describe('Form controls (smoke)', () => {
  test('login form: email and password inputs work', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    await page.getByPlaceholder('••••••••').fill('test-password-123');
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('test@example.com');
  });

  test('register page has interactive fields when present', async ({ page }) => {
    await page.goto('/register');
    const email = page.locator('input[type="email"]').first();
    if (await email.count()) {
      await email.fill('newuser@example.com');
      await expect(email).toHaveValue('newuser@example.com');
    }
  });
});

test.describe('Optional authenticated API smoke', () => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Set E2E_EMAIL and E2E_PASSWORD to run login API test',
  );

  test('login submits and redirects when credentials valid', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder('••••••••').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
  });
});
