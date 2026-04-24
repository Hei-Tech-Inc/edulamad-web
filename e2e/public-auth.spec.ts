import { expect, test } from '@playwright/test';

test.describe('Public auth pages', () => {
  test('home loads without error', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads and Create account navigates to register', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { level: 1, name: /^welcome back$/i }),
    ).toBeVisible();
    const create = page.getByRole('link', { name: /create a free account/i });
    await expect(create).toBeVisible();
    await create.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('body')).toBeVisible();
  });
});
