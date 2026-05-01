import type { AuthUserDto, LoginResponse } from '@/api/types/auth.types';
import API from '@/api/endpoints';

/**
 * Server-only: direct API base URL (no browser `/api/backend` indirection).
 * NextAuth runs in the Node server; it must call the real HTTP API.
 */
function getServerApiBaseUrl(): string {
  const fromEnv =
    process.env.API_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return 'http://127.0.0.1:5003';
}

/**
 * JSON body your backend should accept at `POST /auth/oauth/exchange` (see docs/OAUTH_BACKEND_CONTRACT.md).
 * All fields the backend might need to verify the user and issue your own JWT pair.
 */
export type OAuthExchangeRequestBody = {
  provider: string;
  /** e.g. Google `sub`, GitHub numeric id as string */
  providerAccountId: string;
  /**
   * OIDC `id_token` (Google, etc.) — verify with provider JWKS on the server.
   * GitHub does not send this; use `accessToken` + userinfo instead.
   */
  idToken: string | null;
  /** OAuth 2.0 access token from the provider */
  accessToken: string | null;
  /** Only some providers/flows return this */
  refreshToken: string | null;
  expiresAt: number | null;
  tokenType: string | null;
  scope: string | null;
  profile: {
    /** Normalised subject (Google `sub`, GitHub `id` as string) */
    sub: string;
    email: string | null;
    name: string | null;
    image: string | null;
    emailVerified: boolean | null;
  };
  /** Non-standard: raw profile snapshot for forward compatibility */
  rawProfile: Record<string, unknown>;
};

function buildExchangeBody(
  provider: string,
  account: Record<string, unknown>,
  profile: Record<string, unknown>,
): OAuthExchangeRequestBody {
  const idToken = typeof account.id_token === 'string' ? account.id_token : null;
  const accessToken = typeof account.access_token === 'string' ? account.access_token : null;
  const refreshToken = typeof account.refresh_token === 'string' ? account.refresh_token : null;
  const expiresAt =
    typeof account.expires_at === 'number'
      ? account.expires_at
      : account.expires_at != null
        ? Number(account.expires_at)
        : null;
  const tokenType = typeof account.token_type === 'string' ? account.token_type : null;
  const scope = typeof account.scope === 'string' ? account.scope : null;
  const providerAccountId = String(
    account.providerAccountId ?? profile.sub ?? profile.id ?? '',
  );

  const email =
    typeof profile.email === 'string'
      ? profile.email
      : typeof (profile as { email?: string }).email === 'string'
        ? (profile as { email: string }).email
        : null;
  const name =
    typeof profile.name === 'string'
      ? profile.name
      : typeof (profile as { login?: string }).login === 'string'
        ? (profile as { login: string }).login
        : null;
  const image =
    typeof profile.image === 'string'
      ? profile.image
      : typeof (profile as { picture?: string }).picture === 'string'
        ? (profile as { picture: string }).picture
        : typeof (profile as { avatar_url?: string }).avatar_url === 'string'
          ? (profile as { avatar_url: string }).avatar_url
          : null;

  let emailVerified: boolean | null = null;
  if (typeof profile.email_verified === 'boolean') {
    emailVerified = profile.email_verified;
  } else if (typeof (profile as { email_verified?: boolean }).email_verified === 'boolean') {
    emailVerified = (profile as { email_verified: boolean }).email_verified;
  }

  const sub = String(profile.sub ?? profile.id ?? providerAccountId ?? '');

  return {
    provider,
    providerAccountId,
    idToken,
    accessToken,
    refreshToken,
    expiresAt: Number.isFinite(expiresAt as number) ? (expiresAt as number) : null,
    tokenType,
    scope,
    profile: {
      sub,
      email,
      name,
      image,
      emailVerified,
    },
    rawProfile: profile as Record<string, unknown>,
  };
}

function isLoginResponse(x: unknown): x is LoginResponse {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.accessToken === 'string' &&
    typeof o.refreshToken === 'string' &&
    o.user != null &&
    typeof o.user === 'object'
  );
}

export type OAuthExchangeSuccess = {
  ok: true;
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
};

export type OAuthExchangeFailure = {
  ok: false;
  message: string;
  status?: number;
};

/**
 * Calls your API after OAuth — backend must return the same shape as email/password login.
 */
export async function exchangeOAuthForBackendSession(params: {
  provider: string;
  account: Record<string, unknown>;
  profile: Record<string, unknown>;
}): Promise<OAuthExchangeSuccess | OAuthExchangeFailure> {
  const body = buildExchangeBody(params.provider, params.account, params.profile);
  const url = `${getServerApiBaseUrl()}${API.auth.oauthExchange}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        message: `OAuth exchange returned non-JSON (${res.status})`,
        status: res.status,
      };
    }

    if (!res.ok) {
      const msg =
        json &&
        typeof json === 'object' &&
        typeof (json as { message?: string }).message === 'string'
          ? (json as { message: string }).message
          : `OAuth exchange failed (${res.status})`;
      return { ok: false, message: msg, status: res.status };
    }

    if (!isLoginResponse(json)) {
      return {
        ok: false,
        message: 'OAuth exchange: response missing accessToken, refreshToken, or user',
      };
    }

    return {
      ok: true,
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      user: json.user as AuthUserDto,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'OAuth exchange network error';
    return { ok: false, message: msg };
  }
}
