# OAuth / social login — backend contract

The Next.js app uses **NextAuth.js** (OAuth with Google and optionally GitHub). After the user authenticates with the provider, the **NextAuth API route** (`pages/api/auth/[...nextauth].ts`) calls **your API** to exchange provider tokens for **your** JWT access + refresh tokens and `user` object — same shape as email/password login.

## Endpoint

| Method | Path | Caller |
|--------|------|--------|
| `POST` | `/auth/oauth/exchange` | Next.js server only (`src/lib/oauth-backend-exchange.ts`) |

Configure the server-side API base URL with `NEXT_PUBLIC_API_URL` or override server calls with `API_SERVER_URL` (see `.env.example`).

## Request body (`OAuthExchangeRequestBody`)

Typed in `src/lib/oauth-backend-exchange.ts`. Example (Google):

```json
{
  "provider": "google",
  "providerAccountId": "107691503549062151130321",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "accessToken": "ya29.a0AfH6SMB...",
  "refreshToken": null,
  "expiresAt": 1735689600,
  "tokenType": "Bearer",
  "scope": "openid email profile https://www.googleapis.com/auth/userinfo.profile",
  "profile": {
    "sub": "107691503549062151130321",
    "email": "student@gmail.com",
    "name": "Ama Mensah",
    "image": "https://lh3.googleusercontent.com/a/...",
    "emailVerified": true
  },
  "rawProfile": {
    "iss": "https://accounts.google.com",
    "sub": "107691503549062151130321",
    "email": "student@gmail.com",
    "email_verified": true,
    "name": "Ama Mensah",
    "picture": "https://lh3.googleusercontent.com/a/...",
    "given_name": "Ama",
    "family_name": "Mensah"
  }
}
```

### Field notes

| Field | Purpose |
|-------|---------|
| `provider` | `"google"` \| `"github"` \| future providers |
| `providerAccountId` | Stable provider user id (Google `sub`, GitHub numeric id as string) |
| `idToken` | **OIDC ID token** (Google). Verify signature + `aud`, `iss`, `exp` with provider JWKS. |
| `accessToken` | OAuth access token — use if `idToken` absent (e.g. GitHub: call user API or verify token) |
| `refreshToken` | Rare on first login; optional |
| `expiresAt` | Unix seconds when `accessToken` expires (may be null) |
| `profile` | Normalised subset your backend can trust **after** verification |
| `rawProfile` | Full NextAuth profile object for forward compatibility |

GitHub often has **`idToken: null`** — verify via GitHub’s access token (user endpoint or token introspection) before trusting email.

## Successful response

Same as `POST /auth/login`:

```json
{
  "user": {
    "id": "uuid",
    "email": "student@gmail.com",
    "name": "Ama Mensah",
    "orgId": null,
    "role": "viewer",
    "emailVerified": true,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "permissions": [],
    "isPlatformSuperAdmin": false
  },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "opaque-or-jwt-refresh"
}
```

## Suggested user model additions (backend)

Persist identities so one user can link multiple providers later:

| Column / field | Type | Notes |
|----------------|------|--------|
| `provider` | string | `google`, `github`, … |
| `provider_account_id` | string | Unique **per provider** (composite unique with `provider`) |
| `email` | string | Denormalised from verified provider email |
| `email_verified_at` | timestamp | Optional |
| `avatar_url` | string | Optional |
| `raw_profile_snapshot` | jsonb | Optional audit/debug |

Link to your existing `users` row by verified email or by `(provider, provider_account_id)`.

## Errors

Return `4xx` / `5xx` with JSON `{ "message": "human readable" }` — the NextAuth route surfaces `message` to the client when exchange fails.

## Frontend wiring

1. User clicks **Continue with Google** → NextAuth OAuth flow.
2. NextAuth `jwt` callback runs → `exchangeOAuthForBackendSession()` → `POST /auth/oauth/exchange`.
3. Tokens + `user` stored in NextAuth JWT session; `OAuthSessionSync` copies them into Zustand (same as password login).
4. User lands on `callbackUrl` (default `/dashboard`).

Required env vars: see `.env.example` (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, optional GitHub).
