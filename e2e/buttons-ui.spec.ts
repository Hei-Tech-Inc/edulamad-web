import { expect, test } from '@playwright/test';
import { attachPageErrorCollector } from './helpers/page-errors';

/**
 * E2E UI coverage for native `<button>`, `[data-slot="button"]` (design-system Button),
 * and `[role="button"]` (icon-only / custom controls).
 *
 * Runs against public routes (no API credentials). Protected app surfaces are covered
 * optionally when E2E_EMAIL / E2E_PASSWORD are set.
 *
 * Run UI mode: npm run test:e2e:ui
 * Skip dev server auto-start: PLAYWRIGHT_NO_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/buttons-ui.spec.ts
 */

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/register',
  '/pending-approval',
  '/reset-password',
  '/verify-email',
  '/developer/api-keys',
  '/developer/api-reference',
] as const;

/** These screens use `<a>` CTAs only (MarketingShell) — no native `<button>`. */
const PUBLIC_ROUTES_LINK_ONLY_NO_BUTTON = ['/pending-approval'] as const;

/**
 * Logged-out visitors may see copy + links only (no `<button>` until admin / preview).
 */
const PUBLIC_ROUTES_MAY_HAVE_ZERO_BUTTONS = ['/developer/api-keys'] as const;

/** Design-system + native buttons + ARIA buttons (e.g. some toolbars). */
const BUTTON_SELECTOR = 'button, [data-slot="button"], [role="button"]';

async function gotoPublicPage(page: import('@playwright/test').Page, path: string) {
  const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(res?.ok(), `HTTP for ${path}`).toBeTruthy();
  // Hydration / fonts / client data
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
}

async function gotoAnyStatusPage(page: import('@playwright/test').Page, path: string) {
  const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(res?.status(), `HTTP status for ${path}`).toBeLessThan(500);
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
}

test.describe('Buttons — public pages load without runtime errors', () => {
  for (const path of PUBLIC_ROUTES) {
    test(`page ${path}`, async ({ page }) => {
      const { errors, dispose } = attachPageErrorCollector(page);
      try {
        await gotoPublicPage(page, path);
        expect(errors, `pageerror on ${path}:\n${errors.join('\n')}`).toEqual([]);
      } finally {
        dispose();
      }
    });
  }
});

test.describe('Buttons — at least one focusable control on key marketing/auth screens', () => {
  test('home has button-like controls', async ({ page }) => {
    await gotoPublicPage(page, '/');
    await expect(page.locator('button:visible').first(), 'expected a visible button on /').toBeVisible({
      timeout: 15_000,
    });
  });

  test('login has submit button', async ({ page }) => {
    await gotoPublicPage(page, '/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('unknown path resolves safely for unauthenticated users', async ({
    page,
  }) => {
    const { errors, dispose } = attachPageErrorCollector(page);
    try {
      await gotoAnyStatusPage(page, '/this-route-definitely-does-not-exist-404-test');
      // This app may either redirect to login or render a 404 shell, both are valid.
      const onLogin = /\/login/.test(page.url());
      if (onLogin) {
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      } else {
        await expect(page.locator('body')).toBeVisible();
      }
      expect(errors).toEqual([]);
    } finally {
      dispose();
    }
  });
});

test.describe('Buttons — inventory (visible count) per public route', () => {
  for (const path of PUBLIC_ROUTES) {
    test(`count visible ${BUTTON_SELECTOR} on ${path}`, async ({ page }) => {
      const { errors, dispose } = attachPageErrorCollector(page);
      try {
        await gotoPublicPage(page, path);
        const all = page.locator(BUTTON_SELECTOR);
        const n = await all.count();
        let visible = 0;
        for (let i = 0; i < n; i++) {
          const el = all.nth(i);
          if (await el.isVisible()) visible += 1;
        }
        expect(errors).toEqual([]);
        if ((PUBLIC_ROUTES_LINK_ONLY_NO_BUTTON as readonly string[]).includes(path)) {
          await expect(
            page.getByRole('link', { name: /sign in/i }).first(),
            `expected primary CTA link on ${path}`,
          ).toBeVisible();
        } else if ((PUBLIC_ROUTES_MAY_HAVE_ZERO_BUTTONS as readonly string[]).includes(path)) {
          await expect(page.getByRole('heading', { name: /^developer$/i })).toBeVisible();
        } else {
          expect(visible, `expected ≥1 visible button-like control on ${path}`).toBeGreaterThan(0);
        }
      } finally {
        dispose();
      }
    });
  }
});

test.describe('Landing header — mobile menu button toggles', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('hamburger opens and closes without errors', async ({ page }) => {
    const { errors, dispose } = attachPageErrorCollector(page);
    try {
      await gotoPublicPage(page, '/');
      const menuBtn = page.getByRole('button', { name: /open menu|close menu/i });
      await expect(menuBtn).toBeVisible({ timeout: 15_000 });
      await menuBtn.click();
      await expect(page.getByRole('navigation', { name: /mobile primary/i })).toBeVisible();
      await menuBtn.click();
      expect(errors).toEqual([]);
    } finally {
      dispose();
    }
  });
});

test.describe('Optional — authenticated shell buttons', () => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Set E2E_EMAIL and E2E_PASSWORD to exercise post-login buttons',
  );

  test('after login, dashboard shows at least one button', async ({ page }) => {
    const { errors, dispose } = attachPageErrorCollector(page);
    try {
      await gotoPublicPage(page, '/login');
      await page.getByPlaceholder('you@example.com').fill(process.env.E2E_EMAIL!);
      await page.getByPlaceholder('••••••••').fill(process.env.E2E_PASSWORD!);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 45_000 });
      await gotoPublicPage(page, '/dashboard');
      const visible = page.locator(BUTTON_SELECTOR).filter({ visible: true });
      await expect(visible.first()).toBeVisible({ timeout: 20_000 });
      expect(errors).toEqual([]);
    } finally {
      dispose();
    }
  });
});
