# Edulamad frontend ↔ API integration

This document aligns the Next.js app with the EDULAMAD API contract. The **source of truth** for routes and DTOs is the OpenAPI JSON served by the API in development.

## Contract and tooling

| Resource | URL |
|----------|-----|
| OpenAPI JSON (machine-readable) | `http://localhost:5003/api-json` (when API runs locally on port 5003) |
| Swagger UI | `http://localhost:5003/api` |

### Refresh the bundled spec in the repo

With the API running:

```bash
npm run openapi:pull
npm run verify:api
npm run build
```

`openapi:pull` writes `contexts/api-docs.json` (and backs up the previous file to `contexts/api-docs.backup.json`). Production deployments should pin a spec from a tagged release or CI artifact; do not assume production serves `/api-json` unless ops enables it.

Path helpers live in `src/api/endpoints.ts`. `npm run verify:api` ensures every path in `contexts/api-docs.json` **plus** optional entries in `contexts/api-path-stubs.json` appears as string literals in that file.

## Base URL and environments

| Environment | Base URL (example) |
|-------------|---------------------|
| Local API (Docker / Nest) | `http://127.0.0.1:5003` |
| Staging / production | Your deployed HTTPS origin |

Routes are root-relative (`/health`, `/students/me/profile`, …). The Next dev server proxies browser calls via `next.config.mjs` rewrites: requests to `/api/backend/*` forward to `API_PROXY_TARGET` or the host inferred from `NEXT_PUBLIC_API_URL`. Set both to your API origin, e.g.:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5003
API_PROXY_TARGET=http://127.0.0.1:5003
```

CORS must allow the frontend origin (e.g. `http://localhost:3000`); the API typically reads `auth.frontendUrl`.

## Authentication

- Header: `Authorization: Bearer <accessToken>`
- Obtain tokens with `POST /auth/login` or `POST /auth/register`
- Refresh: `POST /auth/refresh` with refresh token body (see Swagger DTOs)
- `401`: invalid/expired token — client refreshes or logs out
- `403`: authenticated but role guard denied (admin/TA-only routes)

Axios clients: `src/api/client.ts` (`apiClient`, `apiClientPublic`, refresh handling).

## Standard errors

Errors are usually JSON with `statusCode`, `message`, `timestamp`, `path`, optional `requestId`. Surface `requestId` when reporting backend bugs.

## IDs

Convex-style opaque string IDs — treat as strings, never as integers.

## My Courses (student catalog)

- **Implemented in the web app:** TanStack Query hooks `useMyCoursesInfinite` and `useMyCourseDetail` (`src/hooks/students/`) call `GET /students/me/courses` and `GET /students/me/courses/{courseId}` per OpenAPI.
- Product notes and backend backlog: **[BACKEND_MY_COURSES_REQUIREMENTS.md](./BACKEND_MY_COURSES_REQUIREMENTS.md)**.
- Convex / multi-env data plane: **[CONVEX_DEPLOYMENT_CHECKLIST.md](./CONVEX_DEPLOYMENT_CHECKLIST.md)**.

## Solutions, discussions & content tools

Subscription gates, solution ranking, discussions, bulk import, slide bundles: **[FRONTEND_SOLUTIONS_DISCUSSIONS.md](./FRONTEND_SOLUTIONS_DISCUSSIONS.md)**. Path helpers: `API.solutions.*`, `API.discussions.*`, extended `API.content.*` in `src/api/endpoints.ts`.

## Content and quiz routes (reference)

Typed path helpers:

- `API.content.*` — offerings, assessment upload, interim/final documents, solution key upload, pending review
- `API.quiz.*` — topics, generate, submit

See Swagger `content` and `quiz` tags after pulling a fresh OpenAPI spec.

## Verification commands

```bash
# API up on 5003
curl -s http://127.0.0.1:5003/health
curl -s http://127.0.0.1:5003/api-json -o openapi.json

# Frontend repo
npm run verify:api
npm run test:e2e
npm run e2e:api-smoke
```

### My Courses contract (manual / future automation)

`GET /students/me/courses` requires a **Bearer** token. Smoke it with a real JWT (e.g. from login) and `curl`/Bruno — Playwright is a poor fit for unauthenticated redirect assertions here because `ProtectedRoute` only redirects after client-side `fetchUser()` and persisted Redux can look “logged in” in tests. Prefer an **API integration test** in the backend repo or a logged-in Playwright **storage state** fixture once you have a stable test user.

`e2e:api-smoke` hits `/health` and optionally `/api-json` (fails if the API is down unless `E2E_SKIP_API=1`).

## End-to-end (browser) tests

Playwright tests live in `e2e/`. They assert critical navigation and forms are wired (login/register links, public pages). Run with the Next dev server:

```bash
npm run dev
# other terminal
npx playwright install
npm run test:e2e
```

Optional authenticated flows: set `E2E_EMAIL` and `E2E_PASSWORD` in the environment; tests skip deep auth if unset.

## Recommended practices

- Regenerate or pull OpenAPI when the backend changes; keep `verify:api` green.
- Do not put tokens in query strings.
- Handle `202` queued responses and `503` when background jobs are disabled (upload flows).
- On `429`, back off with jitter.
