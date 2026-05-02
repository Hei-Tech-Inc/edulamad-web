'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { applyUtmAttributionFromHref } from '@/lib/utm';

/**
 * Persists first-touch UTM params and registers them on PostHog as `initial_*` super-properties.
 * Runs on load and after client-side navigations (in case a marketing link uses client routing).
 */
export function UtmCapture() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const run = () => {
      try {
        applyUtmAttributionFromHref(window.location.href);
      } catch {
        /* never block the app */
      }
    };

    run();
    router.events.on('routeChangeComplete', run);
    return () => {
      router.events.off('routeChangeComplete', run);
    };
  }, [router.events]);

  return null;
}
