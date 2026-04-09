import type { RequestUser } from '@/api/types/common.types';
import {
  isPlatformSuperAdminFromAccessToken,
  roleStringsFromAccessToken,
} from '@/lib/jwt-payload';
import { permissionsFromAccessToken } from '@/lib/jwt-permissions';

function permissionLooksAdminLike(p: string): boolean {
  const perm = p.toLowerCase();
  return (
    perm.includes('admin') ||
    perm.includes('manage') ||
    perm.includes('institution') ||
    perm.includes('organization') ||
    perm.includes('organisation')
  );
}

/** Explicit org / app roles we treat as dashboard-admin (matches Dashboard / Sidebar behaviour). */
const PRIVILEGED_ROLES = new Set([
  'owner',
  'admin',
  'manager',
  'super_admin',
  'superadmin',
  'org_admin',
  'organisation_admin',
  'organization_admin',
]);

function roleStringsGrantAdmin(roles: readonly string[]): boolean {
  for (const raw of roles) {
    const r = raw.toLowerCase();
    if (PRIVILEGED_ROLES.has(r)) return true;
    const strip = r.replace(/^role_/i, '').replace(/^authority_/i, '');
    if (PRIVILEGED_ROLES.has(strip)) return true;
    if (strip.includes('admin') && (strip.includes('org') || strip.includes('organ')))
      return true;
  }
  return false;
}

/**
 * True when the session should see in-app admin tools (dashboard admin panel, sidebar Admin).
 * Uses persisted user, live JWT roles/permissions (many APIs only put these in the access token),
 * and optional `NEXT_PUBLIC_FORCE_ADMIN_UI=1` for local debugging.
 */
export function sessionHasAdminTools(
  user: RequestUser | null | undefined,
  accessToken: string | null | undefined,
): boolean {
  if (
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_FORCE_ADMIN_UI === '1'
  ) {
    return true;
  }

  if (user?.isPlatformSuperAdmin === true) return true;
  if (isPlatformSuperAdminFromAccessToken(accessToken)) return true;

  const mergedRoles = [
    ...new Set([
      String(user?.role || '')
        .trim()
        .toLowerCase(),
      ...roleStringsFromAccessToken(accessToken),
    ]),
  ].filter(Boolean);
  if (roleStringsGrantAdmin(mergedRoles)) return true;

  const merged = new Set<string>([
    ...(user?.permissions ?? []),
    ...permissionsFromAccessToken(accessToken),
  ]);
  for (const p of merged) {
    if (permissionLooksAdminLike(p)) return true;
  }
  return false;
}
