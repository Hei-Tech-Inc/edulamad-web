import type { Page } from '@playwright/test';

/**
 * Collects uncaught page errors (e.g. React runtime) during an action.
 */
export function attachPageErrorCollector(page: Page): {
  errors: string[];
  dispose: () => void;
} {
  const errors: string[] = [];
  const onError = (err: Error) => {
    errors.push(err.message);
  };
  page.on('pageerror', onError);
  return {
    errors,
    dispose: () => {
      page.off('pageerror', onError);
    },
  };
}
