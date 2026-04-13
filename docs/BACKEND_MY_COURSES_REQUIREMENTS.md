# Backend requirements: My Courses (student catalog)

This document describes what the **Edulamad web app** needs from the API to power the **My Courses** experience: LMS-style course cards, **advanced filters**, **pagination**, and **lazy loading** without fragile N+1 client fan-out.

**Contract source of truth:** after implementation, routes and DTOs must appear in OpenAPI (`/api-json`) and be pulled into `contexts/api-docs.json` per [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md).

---

## 1. Current state (baseline)

The frontend today can:

| Capability | How it works today | Limitation |
|------------|-------------------|------------|
| List courses for a department | `GET /institutions/departments/{deptId}/courses` (`InstitutionsController_listCourses`), optional `activeOnly` | No student-specific “my enrollments”; no server pagination in spec; no search/sort on this list in the bundled OpenAPI slice. |
| Per-course material counts | Client calls `GET /questions/courses/{courseId}` and `GET /slides/courses/{courseId}` **for every course** (with year/level on questions) | **N+1** (actually 2N) HTTP calls; poor performance for large departments; counts depend on client passing correct `year` / `level`. |
| Course metadata | `GET /institutions/courses/{id}` | No guaranteed `thumbnail_url`, instructor, or marketing fields in the spec the app relies on. |

Anything not listed in OpenAPI must not be invented by the frontend; this document requests **new or extended** endpoints and fields.

---

## 2. Product goals

1. **My Courses list** — paginated, filterable, sortable list rows the signed-in student cares about (at minimum: courses in their department for the active academic context; optionally: explicit enrollments or pinned courses).
2. **One round-trip for list + card metrics** — each row includes enough data to render cards **without** per-course questions/slides requests for basic UI.
3. **Real progress (when available)** — optional fields for enrollment status, completion %, steps, last activity (until these exist, the UI may show **material coverage** only and label it clearly).
4. **Detail page** — optional extended payload for hero, sidebar, curriculum checklist, warnings (e.g. decommissioned course).

---

## 3. Proposed API surface

### 3.1 Primary: student “My Courses” list

**`GET /students/me/courses`** (or **`GET /students/me/course-catalog`** if you prefer naming that avoids confusion with CRUD on `courses`)

- **Auth:** JWT required (`401` if missing/invalid).
- **Purpose:** Return the paginated list of courses for the current student with **aggregated card fields** in a single response.

#### Query parameters (recommended)

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer ≥ 1 | Page index (1-based). Default `1`. |
| `limit` | integer 1–100 | Page size. Default `12` or `24` (product decision). |
| `year` | string | Academic year label the app uses for questions (e.g. `"2025"` — align with `GET /questions/courses/{courseId}` query). |
| `level` | string or number | Student level (e.g. `100`–`400`) — align with questions filtering. |
| `q` / `search` | string | Case-insensitive search on **course code** and **course name** (and optionally instructor name). |
| `status` | enum | Filter by enrollment or prep status — see **§4**. |
| `content` | enum | Optional: `all` \| `has_questions` \| `has_slides` \| `has_both` — filter using **server-side counts** for the given `year`/`level`. |
| `sort` | enum | See **§5**. |

#### Response envelope (200)

```json
{
  "data": [ /* MyCourseRow — see §3.2 */ ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total_count": 87,
    "has_more": true,
    "applied": {
      "year": "2025",
      "level": "300"
    }
  }
}
```

- **`total_count`:** total rows matching filters (not just current page).
- **`has_more`:** `true` if another page exists (`page * limit < total_count`), or omit and let clients derive from `total_count`.

Empty list: `200` with `data: []` and `total_count: 0`.

#### Errors

| Code | When |
|------|------|
| `400` | Invalid `page`/`limit`/`sort`/enum values. |
| `401` | Not authenticated. |
| `403` | Authenticated but student profile incomplete (e.g. no `deptId`) — **optional**; alternatively return `200` + empty list with a client message. |
| `500` | Server error — include `requestId` in body per existing API conventions. |

---

### 3.2 DTO: `MyCourseRow` (each element of `data`)

Minimum fields for the **card grid** and filters:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course_id` | string | yes | Convex / opaque course id (same as `/institutions/courses/{id}`). |
| `code` | string \| null | yes | Course code (e.g. `"CS101"`). |
| `name` | string | yes | Display title. |
| `department_id` | string | yes* | *If list is department-scoped.* |
| `department_name` | string | recommended | Avoids extra lookup for subtitle. |
| `thumbnail_url` | string \| null | recommended | HTTPS URL; null → client uses placeholder/gradient. |
| `instructor` | object \| null | optional | `{ "name": string, "avatar_url": string \| null }` or provider branding. |
| `question_count` | integer | yes | Count for `year` + `level` (same semantics as listing questions for that course). |
| `slides_count` | integer | yes | Count of slide decks for the course (same semantics as slides list). |
| `enrollment_status` | enum \| null | optional | `not_started` \| `in_progress` \| `completed` — null if product has no enrollments yet. |
| `completion_percentage` | number (0–100) \| null | optional | Real LMS-style progress; null if not tracked. |
| `completed_steps` | integer \| null | optional | |
| `total_steps` | integer \| null | optional | Alternative: `total_lessons` / `completed_lessons`. |
| `last_activity_at` | string (ISO 8601) \| null | optional | For “Last activity on …”. |
| `is_free_sampler` | boolean | optional | Marketing flag for badge. |
| `status_message` | string \| null | optional | Short warning (e.g. “Decommissioned by provider”). |
| `is_decommissioned` | boolean | optional | Drives red alert styling on detail page. |

**Note:** Until `enrollment_*` and progress fields exist, the frontend can derive a **non-LMS** “prep coverage” from `question_count` + `slides_count` only; backend should still return **counts** so the client stops fan-out.

---

### 3.3 Optional: single course for detail / hero

**`GET /students/me/courses/{courseId}`** or reuse **`GET /institutions/courses/{id}`** with **optional** `?year=&level=` and an expanded response when `Accept` or query `include=progress,lessons` is used.

Extended fields for **course overview** (reference UI):

| Field | Type | Description |
|-------|------|-------------|
| `description_short` | string \| null | Hero / card blurb. |
| `description_html` | string \| null | Optional rich text (sanitized server-side). |
| `lessons` | array | `{ "id": string, "title": string, "order": number, "is_completed": boolean }` — only if lesson completion exists. |
| `course_includes` | object | e.g. `{ "lesson_count": number, "instructor_label": string }` for sidebar. |

---

## 4. `status` filter (enrollment)

If `enrollment_status` is implemented:

- Query `status=all` (default), `not_started`, `in_progress`, `completed`.

If not implemented:

- Either omit `status` from OpenAPI until ready, or map `status` to **material-based** proxies (document clearly), e.g. `has_material` vs `no_material` — **not** ideal; prefer real enrollment when possible.

---

## 5. `sort` parameter

Suggested enum (exact strings to be fixed in OpenAPI):

| Value | Behavior |
|-------|----------|
| `title_asc` | `code` + `name` ascending. |
| `title_desc` | Descending. |
| `last_activity_desc` | Requires `last_activity_at`; nulls last. |
| `completion_desc` | Requires `completion_percentage`. |
| `readiness_desc` | `question_count + slides_count` descending (material coverage). |
| `questions_desc` | `question_count` descending. |
| `slides_desc` | `slides_count` descending. |

Default: `title_asc` or `readiness_desc` (product decision).

---

## 6. Performance and indexing

- Implement **`question_count`** and **`slides_count`** with **aggregated queries** or materialized counters — not by loading full question/slide arrays server-side per course in a loop if that is O(n) per row.
- Add DB indexes for: `(dept_id, active)`, `(course_id, year, level)` on questions if applicable, and student → course relationship if enrollments exist.

---

## 7. Relationship to existing routes

| Existing route | After this work |
|----------------|-----------------|
| `GET /institutions/departments/{deptId}/courses` | Can remain for **admin** or **generic catalog**; student app should prefer **`GET /students/me/courses`** for UX + pagination. |
| `GET /questions/courses/{courseId}` | Still used for **question drill-down** and quiz flows; **not** required for initial My Courses card counts if `MyCourseRow` includes counts. |
| `GET /slides/courses/{courseId}` | Same as above for slide viewers. |

---

## 8. OpenAPI / contract checklist (backend)

- [x] Document paths under the `students` tag (`GET /students/me/courses`, `GET /students/me/courses/{courseId}`).
- [x] Export DTOs (`MyCourseRowDto`, `MyCoursesListResponseDto`, `MyCourseDetailResponseDto`, etc.).
- [x] List response includes `meta.page`, `meta.limit`, `meta.totalCount`, `meta.hasMore`, `meta.applied`.
- [ ] After each API change: run in **edulamad-web** — `npm run openapi:pull` then `npm run verify:api` then `npm run build`.
- [x] `src/api/endpoints.ts` includes `API.students.meCourses` and `API.students.meCourse(id)`; hooks: `useMyCoursesInfinite`, `useMyCourseDetail`.

---

## 9. Out of scope (unless product asks)

- Writing enrollments from the web (unless you add `POST /students/me/enrollments`).
- Thumbnail upload pipeline (may be CMS/admin-only).
- Full-text search across PDF content (optional later).

---

## 10. Summary for stakeholders

**Deliver one authenticated, paginated endpoint** that returns **course rows with `question_count`, `slides_count`, and optional progress/thumbnail/instructor**, plus **filtering and sorting** query parameters. That removes **O(N) HTTP fan-out** from the browser and unlocks the My Courses UI at scale.
