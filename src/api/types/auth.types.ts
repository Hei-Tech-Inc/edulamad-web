import { isPlatformSuperAdminFromAccessToken } from '@/lib/jwt-payload';
import { permissionsFromAccessToken } from '@/lib/jwt-permissions';
import type {
  OrgRole,
  Permission,
  RequestUser,
} from './common.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  orgName: string;
  orgSlug?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

/** Login / register `user` object — fields from OpenAPI examples; extend when `/auth/me` schema is added. */
export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  /** Platform super-admins may omit org until act-as. */
  orgId?: string | null;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  permissions?: Permission[];
  isPlatformSuperAdmin?: boolean;
}

export interface LoginResponse {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
}

/** Organisation snapshot returned by POST /auth/register (login may omit org). */
export interface AuthOrgDto {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
}

export interface RegisterResponse {
  user: AuthUserDto;
  org: AuthOrgDto;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export function mapAuthUserToRequestUser(
  user: AuthUserDto,
  accessToken?: string | null,
): RequestUser {
  const fromApi = user.permissions ?? [];
  const fromJwt = accessToken
    ? permissionsFromAccessToken(accessToken)
    : [];
  const permissions = Array.from(new Set([...fromApi, ...fromJwt]));
  const fromToken =
    accessToken != null && isPlatformSuperAdminFromAccessToken(accessToken);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    orgId: user.orgId ?? null,
    role: user.role as OrgRole,
    permissions,
    isPlatformSuperAdmin:
      user.isPlatformSuperAdmin === true || fromToken,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

/**
 * GET /auth/me — OpenAPI does not publish a full schema; normalize defensively.
 */
export function mapMeResponseToRequestUser(
  data: unknown,
  accessToken?: string | null,
): RequestUser {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid /auth/me response');
  }
  let d = data as Record<string, unknown>;
  const nested = d.user;
  if (nested && typeof nested === 'object') {
    d = nested as Record<string, unknown>;
  }
  const id = d.id;
  if (typeof id !== 'string') {
    throw new Error('Invalid /auth/me response: missing id');
  }
  const roleRaw = typeof d.role === 'string' ? d.role : 'viewer';
  const permsRaw = Array.isArray(d.permissions) ? d.permissions : [];
  const permissions = permsRaw.filter((p): p is Permission => typeof p === 'string');
  const fromApi = d.isPlatformSuperAdmin === true;
  const fromJwt =
    accessToken != null && isPlatformSuperAdminFromAccessToken(accessToken);
  return {
    id,
    email: typeof d.email === 'string' ? d.email : undefined,
    name: typeof d.name === 'string' ? d.name : null,
    orgId: typeof d.orgId === 'string' ? d.orgId : null,
    role: roleRaw as OrgRole,
    permissions,
    isPlatformSuperAdmin: fromApi || fromJwt,
    emailVerified:
      typeof d.emailVerified === 'boolean' ? d.emailVerified : undefined,
    isActive: typeof d.isActive === 'boolean' ? d.isActive : undefined,
    createdAt: typeof d.createdAt === 'string' ? d.createdAt : undefined,
  };
}
