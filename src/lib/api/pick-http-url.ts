/**
 * Best-effort extract first http(s) URL from arbitrary JSON (OpenAPI bodies often omit schemas).
 */
const URL_KEYS = ['url', 'pdfUrl', 'signedUrl', 'sourceUrl', 'href', 'link'] as const;

export function pickFirstHttpUrl(value: unknown, depth = 0): string | null {
  if (depth > 8) return null;
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value;
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const u = pickFirstHttpUrl(item, depth + 1);
      if (u) return u;
    }
    return null;
  }
  const o = value as Record<string, unknown>;
  for (const k of URL_KEYS) {
    const u = pickFirstHttpUrl(o[k], depth + 1);
    if (u) return u;
  }
  for (const v of Object.values(o)) {
    const u = pickFirstHttpUrl(v, depth + 1);
    if (u) return u;
  }
  return null;
}
