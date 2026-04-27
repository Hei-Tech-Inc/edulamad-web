// Next.js `instrumentation.ts` — see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/** RSC / middleware / Server Component request errors (Next 15+). */
export const onRequestError = Sentry.captureRequestError;
