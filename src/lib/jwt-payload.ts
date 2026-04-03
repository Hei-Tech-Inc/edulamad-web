/** Decode JWT payload (unverified) for client-side claims. */

export function parseAccessTokenPayload(
  accessToken: string | null | undefined,
): Record<string, unknown> | null {
  if (!accessToken || typeof accessToken !== 'string') return null;
  const parts = accessToken.split('.');
  if (parts.length < 2) return null;
  try {
    const segment = parts[1];
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const json = globalThis.atob(base64 + pad);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isPlatformSuperAdminFromAccessToken(
  accessToken: string | null | undefined,
): boolean {
  const payload = parseAccessTokenPayload(accessToken);
  return payload?.isPlatformSuperAdmin === true;
}
