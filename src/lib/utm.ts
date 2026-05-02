import { safePosthogRegister } from '@/lib/safe-analytics';

const STORAGE_KEY = 'edulamad.utm.first_touch';

/** Standard UTM query keys we persist (first-touch only). */
export const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];

export type UtmFirstTouch = Partial<Record<UtmParamKey, string>> & {
  capturedAt: string;
};

const MAX_LEN = 500;

function sanitizeSegment(raw: string | null): string | undefined {
  if (raw == null) return undefined;
  const t = String(raw).trim();
  if (!t) return undefined;
  return t.length > MAX_LEN ? t.slice(0, MAX_LEN) : t;
}

/** Extract UTM params from a full URL (browser or absolute). */
export function parseUtmFromHref(href: string): Partial<Record<UtmParamKey, string>> {
  try {
    const base =
      typeof window !== 'undefined' && typeof window.location?.origin === 'string'
        ? window.location.origin
        : 'https://placeholder.local';
    const u = new URL(href, base);
    const out: Partial<Record<UtmParamKey, string>> = {};
    for (const k of UTM_PARAM_KEYS) {
      const v = sanitizeSegment(u.searchParams.get(k));
      if (v) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function readStored(): UtmFirstTouch | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.capturedAt !== 'string') return null;
    const next: UtmFirstTouch = { capturedAt: o.capturedAt };
    for (const k of UTM_PARAM_KEYS) {
      const v = o[k];
      if (typeof v === 'string' && v.trim()) next[k] = v.trim().slice(0, MAX_LEN);
    }
    return next;
  } catch {
    return null;
  }
}

function writeStored(data: UtmFirstTouch): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
}

/** Flat props PostHog can filter on (prefix avoids clobbering session utm). */
function toPosthogInitialProps(first: UtmFirstTouch): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of UTM_PARAM_KEYS) {
    const v = first[k];
    if (v) {
      out[`initial_${k}`] = v;
    }
  }
  return out;
}

/**
 * First-touch: save once when the user first lands with any `utm_*` in the URL.
 * Re-applies super-properties from storage on every call so new sessions still get dimensions.
 * Safe if PostHog is disabled or not loaded.
 */
export function applyUtmAttributionFromHref(href: string): void {
  if (typeof window === 'undefined') return;

  const fromUrl = parseUtmFromHref(href);
  const hasUtmInUrl = UTM_PARAM_KEYS.some((k) => fromUrl[k]);

  let stored = readStored();

  if (hasUtmInUrl && !stored) {
    const capturedAt = new Date().toISOString();
    stored = { capturedAt, ...fromUrl };
    writeStored(stored);
  }

  if (stored) {
    const props = toPosthogInitialProps(stored);
    if (Object.keys(props).length > 0) {
      safePosthogRegister(props);
    }
  }
}

/** For optional API payloads (signup metadata). */
export function getStoredUtmFirstTouch(): UtmFirstTouch | null {
  if (typeof window === 'undefined') return null;
  return readStored();
}
