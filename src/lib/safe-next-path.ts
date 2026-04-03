/** Avoid open redirects: only allow same-origin relative paths. */
export function getSafeInternalPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
    if (decoded.includes('://')) return null;
    return decoded;
  } catch {
    return null;
  }
}
