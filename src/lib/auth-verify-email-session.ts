import {
  mapAuthUserToRequestUser,
  type AuthUserDto,
} from '@/api/types/auth.types';
import { useAuthStore } from '@/stores/auth.store';

export type VerifyEmailSessionPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
};

/**
 * Parses POST/GET `/auth/verify-email` bodies when the API returns a full session
 * (see live OpenAPI). Older bundles only returned `{ message }`.
 */
export function parseVerifyEmailSession(
  data: unknown,
): VerifyEmailSessionPayload | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const accessToken =
    typeof d.accessToken === 'string' ? d.accessToken : undefined;
  const refreshToken =
    typeof d.refreshToken === 'string' ? d.refreshToken : undefined;
  const user = d.user;
  if (
    !accessToken ||
    !refreshToken ||
    !user ||
    typeof user !== 'object' ||
    Array.isArray(user)
  ) {
    return null;
  }
  return {
    accessToken,
    refreshToken,
    user: user as AuthUserDto,
  };
}

export function applyVerifyEmailSessionToStore(data: unknown): boolean {
  const session = parseVerifyEmailSession(data);
  if (!session) return false;
  useAuthStore.getState().setTokens(session.accessToken, session.refreshToken);
  useAuthStore
    .getState()
    .setUser(mapAuthUserToRequestUser(session.user, session.accessToken));
  return true;
}
