# Convex deployment checklist (backend / data plane)

The **Next.js app in this repo** does not embed Convex; the API team owns Convex functions and schema. Use this checklist so **every environment** the web app targets (local API, staging, production) stays aligned with the repo contract.

## Before promoting an API + web release

1. **Schema indexes** — Ensure production Convex schema includes indexes required for efficient My Courses aggregates, including:
   - **`by_course_year_level`** (or equivalent) on past-question / material tables so `questionCount` for `(courseId, year, level)` does not scan full collections.
   - Any **`studentCourses`** (or enrollment) table indexes used by `GET /students/me/courses` and related functions.

2. **Functions** — Deploy Convex functions that back:
   - Student my-courses list and counts (department scope, filters, sort).
   - Optional enrollment/progress fields when product enables them.

3. **Parity** — After changing Convex, redeploy the Nest (or API) layer that reads Convex and refresh OpenAPI in this repo:
   - `OPENAPI_URL=https://<api>/api-json npm run openapi:pull`
   - `npm run verify:api && npm run build`

4. **Insights** — For large departments, use Convex dashboard **insights** to confirm query costs; add cached counters or aggregates if list latency grows (see product backlog in `docs/BACKEND_MY_COURSES_REQUIREMENTS.md`).

## Related

- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) — OpenAPI pull and env vars.
- [BACKEND_MY_COURSES_REQUIREMENTS.md](./BACKEND_MY_COURSES_REQUIREMENTS.md) — API product requirements.
