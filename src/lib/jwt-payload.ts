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

function truthyFlag(v: unknown): boolean {
  return v === true || v === 'true' || v === 1 || v === '1';
}

/** Recognise platform super-admin from common Nest / Auth0 / Keycloak-style JWT shapes. */
export function isPlatformSuperAdminFromAccessToken(
  accessToken: string | null | undefined,
): boolean {
  const payload = parseAccessTokenPayload(accessToken);
  if (!payload) return false;

  if (truthyFlag(payload.isPlatformSuperAdmin)) return true;
  if (truthyFlag(payload.is_platform_super_admin)) return true;
  if (truthyFlag(payload.platformSuperAdmin)) return true;

  const realm = payload.realm_access;
  if (realm && typeof realm === 'object' && 'roles' in realm) {
    const roles = (realm as { roles?: unknown }).roles;
    if (Array.isArray(roles)) {
      const lower = roles
        .filter((x): x is string => typeof x === 'string')
        .map((r) => r.toLowerCase());
      if (
        lower.some(
          (r) =>
            r.includes('platform') && r.includes('super') && r.includes('admin'),
        )
      ) {
        return true;
      }
    }
  }

  const roles = payload.roles;
  if (Array.isArray(roles)) {
    const lower = roles
      .filter((x): x is string => typeof x === 'string')
      .map((r) => r.toLowerCase());
    if (
      lower.some(
        (r) =>
          r === 'platform_super_admin' ||
          r === 'super_admin' ||
          r === 'superadmin' ||
          (r.includes('super') && r.includes('admin') && r.includes('platform')),
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Collect org / RBAC role strings from common JWT layouts (Nest, Spring `ROLE_*`, Keycloak `realm_access`).
 */
export function roleStringsFromAccessToken(
  accessToken: string | null | undefined,
): string[] {
  const payload = parseAccessTokenPayload(accessToken);
  if (!payload) return [];
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === 'string' && v.trim()) out.push(v.trim().toLowerCase());
  };
  for (const key of [
    'role',
    'userRole',
    'user_role',
    'orgRole',
    'org_role',
    'userType',
  ]) {
    push(payload[key]);
  }
  const mergeArr = (v: unknown) => {
    if (!Array.isArray(v)) return;
    for (const x of v) push(x);
  };
  mergeArr(payload.roles);
  mergeArr(payload.authorities);
  const realm = payload.realm_access;
  if (realm && typeof realm === 'object' && 'roles' in realm) {
    mergeArr((realm as { roles?: unknown }).roles);
  }
  const resource = payload.resource_access;
  if (resource && typeof resource === 'object') {
    for (const v of Object.values(resource)) {
      if (v && typeof v === 'object' && 'roles' in v) {
        mergeArr((v as { roles?: unknown }).roles);
      }
    }
  }
  return [...new Set(out)];
}
