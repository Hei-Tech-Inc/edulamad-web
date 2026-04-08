/**
 * Same rules as the Axios client: browser + localhost → `/api/backend` (rewrites);
 * SSR → direct `NEXT_PUBLIC_API_URL`; remote production host → full URL.
 */
export function getApiBaseURL(): string {
  const envRaw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const env = envRaw?.replace(/\/$/, '') ?? '';
  const devDefault = 'http://127.0.0.1:3000';

  if (typeof window === 'undefined') {
    return env || devDefault;
  }

  if (!env) {
    return '/api/backend';
  }

  try {
    const { hostname } = new URL(env);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api/backend';
    }
  } catch {
    return '/api/backend';
  }

  return env;
}

/** Human-readable label for docs (may differ from wire base when using the dev proxy). */
export function getApiBaseUrlLabel(): {
  /** What to show as “base URL” in copy */
  display: string;
  /** Extra line for dev proxy */
  detail?: string;
} {
  const envRaw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const env = envRaw?.replace(/\/$/, '') ?? '';

  if (typeof window === 'undefined') {
    return {
      display: env || 'http://127.0.0.1:3000',
      detail: !env ? 'Set NEXT_PUBLIC_API_URL for SSR labels.' : undefined,
    };
  }

  if (!env) {
    return {
      display: '/api/backend',
      detail:
        'Browser calls use this origin path; Next rewrites to your API (API_PROXY_TARGET / NEXT_PUBLIC_API_URL).',
    };
  }

  try {
    const { hostname } = new URL(env);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        display: '/api/backend',
        detail: `Matches NEXT_PUBLIC_API_URL (${env}) via dev proxy.`,
      };
    }
  } catch {
    /* fall through */
  }

  return { display: env };
}
