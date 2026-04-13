# Frontend integration — solutions, discussions & content tools

This document matches the **EDULAMAD** API as implemented in the backend: Convex-backed mutations/queries exposed through NestJS. Use it when wiring web or mobile clients to these flows.

**Contract:** Path helpers live in `src/api/endpoints.ts`. After the API publishes OpenAPI, run `npm run openapi:pull && npm run verify:api`. Until then, some routes may be listed in `contexts/api-path-stubs.json`.

---

## Base URL and auth

- **Prefix**: API routes are mounted as documented in your deployment (often `/` or `/api` — check reverse proxy).
- **Headers**: `Authorization: Bearer <access_token>` on every protected route.
- **Roles**: JWT payloads are enriched with Convex `appRole`: `student` | `ta` | `admin` | `ambassador` (used by `@Roles()` guards).

---

## 1. Solution access (subscription gate)

**Who can read solutions and use question discussions?**

| Rule | Details |
|------|---------|
| **Subscription** | Active **Basic** or **Pro** plan (`studentSubscriptions` + `subscriptionPlans.name`). |
| **Promo** | Redeemed code where `promoCodes.unlocksPlan` is `basic` or `pro`. |
| **Not enough** | Question **credits** (free tier / ledger) unlock *past questions* only — **not** solutions. |

**Bypass (staff)**  

`admin` and `ta` users skip the subscription check in Nest (`SolutionAccessGuard`) so CMS and review tools keep working.

**Convex parity**  

`functions/questionAccess:canAccessSolutions` encodes the same business rules for direct Convex clients.

---

## 2. Student / subscriber APIs (JWT + `SolutionAccessGuard`)

These routes return **403** if the user is not Basic/Pro (or equivalent promo) and not admin/ta.

### 2.1 Solutions (preferred)

| Method | Path | Body / params |
|--------|------|----------------|
| `GET` | `/solutions/question/:questionId` | — |
| `GET` | `/solutions/question/:questionId/best` | — |
| `POST` | `/solutions/:solutionId/vote` | `{ "vote": "up" \| "down" }` — repeat same vote to remove; switch flips counts |

- **Ranking** (server-side): verified official → verified TA → NotebookLM → AI → others; ties use upvotes. See backend `convex/functions/solutions.ts` and `questions:getQuestionWithBestSolution`.

**Frontend helpers:** `API.solutions.byQuestion(questionId)`, `API.solutions.bestByQuestion(questionId)`, `API.solutions.vote(solutionId)`.

### 2.2 Legacy question routes (still supported)

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/questions/:id/solutions` | Same list as above; gated. |
| `POST` | `/questions/:questionId/solutions` | Create solution (narrow `source` union in controller — extend if you add types server-side). |
| `POST` | `/questions/solutions/:solutionId/upvote` | Legacy idempotent upvote; passes current user id to Convex. Prefer **`POST /solutions/:id/vote`**. |

**Frontend helpers:** `API.questions.solutions(questionId)`, `API.questions.solutionUpvote(solutionId)`.

### 2.3 Question discussions

| Method | Path | Body / query |
|--------|------|--------------|
| `POST` | `/discussions/messages` | `questionId`, `role` (`user` \| `assistant` \| `system`), `content`, optional `tokensUsed`, `model`, `isQuestion` |
| `GET` | `/discussions/threads/:questionId` | — |
| `GET` | `/discussions/context/:questionId` | Rolling window for prompts |
| `DELETE` | `/discussions/threads/:questionId` | Clear thread + session |
| `GET` | `/discussions/recent?limit=` | Default 10, max 50 |

**Frontend helpers:** `API.discussions.messages`, `API.discussions.threads(questionId)`, `API.discussions.context(questionId)`, `API.discussions.recent`.

---

## 3. Admin / TA — content & imports (`JwtAuthGuard` + `@Roles('admin','ta')`)

Use these for uploads, validation, bulk solution import, slide bundles, and assessment text.

### 3.1 Course validation (wizard)

| Method | Path | Body |
|--------|------|------|
| `POST` | `/content/validate-course` | `{ "courseId": "<convex courses id>", "deptId"?: "<departments id>" }` |

Returns Convex `validateCourseExists` or `validateCourseBelongsToDept` payload.

**Frontend:** `API.content.validateCourse`.

### 3.2 Bulk solutions (Notebook LM, spreadsheets, scripts)

| Method | Path | Body |
|--------|------|------|
| `POST` | `/content/solutions/bulk-save` | See **Bulk-save shape** below |

**Response**

```json
{ "saved": 12, "notFound": [3, 7], "total": 14 }
```

- Rows match **`pastQuestions`** by `sourceDocumentId` (the assessment/slide parent) + `questionNumber` + optional `subPart` (same as Convex `by_source_doc_number`).
- `submittedBy` is always the **authenticated user** (passed server-side).

**Frontend:** `API.content.solutionsBulkSave`.

### 3.3 Bulk-save request shape

```json
{
  "sourceDocumentId": "k17abc...",
  "sourceDocumentType": "interim_assessment",
  "source": "notebooklm",
  "isVerified": true,
  "solutions": [
    {
      "questionNumber": 1,
      "subPart": "a",
      "modelAnswer": "...",
      "explanation": "...",
      "keyPoints": ["..."],
      "commonMistakes": ["..."],
      "markings": "rubric text",
      "marks": 10
    }
  ]
}
```

- **`sourceDocumentType`**: `interim_assessment` | `final_exam` | `slide_generated` | `manual` (stored for tracing; matching uses `sourceDocumentId` + question rows).
- **`source`**: `official` | `notebooklm` | `ta` — maps to Convex `solutions.source`. NotebookLM rows use **`forceInsert`** so multiple versions can coexist.

### 3.4 Assessment extracted text (OCR / paste)

| Method | Path | Body |
|--------|------|------|
| `POST` | `/content/assessments/extracted-content` | `{ "documentId", "documentType": "interim_assessment" \| "final_exam", "extractedContent" }` |

Patches Convex `extractedContent` on the document.

**Frontend:** `API.content.assessmentsExtractedContent`.

### 3.5 Slide bundle pipeline

Typical order:

1. `POST /content/slides/bundle` — draft row → `{ "slideId" }`
2. `POST /content/slides/bundle/:slideId/file` — multipart `file` (PDF/PPT/PPTX, max 50MB); uploads to R2, `slides:addSlideFile`, optional `process-slide` job
3. `PATCH /content/slides/bundle/:slideId/extracted-content` — raw text
4. `PATCH /content/slides/bundle/:slideId/summary-inline` — `{ "summary"?, "keyPointsInline"?, "conceptTagsInline"? }`
5. `POST /content/slides/bundle/:slideId/publish` — `{ "isPublished": true }`
6. `GET /content/slides/bundle/:slideId` — `slide` + `slideSummary` (table) + `slideOutputs` (legacy)

**Frontend:** `API.content.slidesBundle`, `API.content.slidesBundleDetail(slideId)`, `API.content.slidesBundleFile(slideId)`, etc.

**Note:** Inline fields on `slides` use the `*Inline` suffix to avoid clashing with the `slideSummaries` table; structured summaries can still use `slides:insertSlideSummary` from workers if needed.

---

## 4. Admin-only — manual single solution

| Method | Path | Role |
|--------|------|------|
| `POST` | `/admin/content/solutions/manual-create` | **admin** only |

Body includes `questionId`, `source` (`official` \| `ta`), answers, and optional **`explanation`**, **`keyPoints`**, **`commonMistakes`**, **`relatedTopics`**, **`workings`**, **`markingScheme`**.

**Frontend:** `API.admin.content.solutionsManualCreate`.

---

## 5. Existing content routes (unchanged behavior)

- `POST /content/offerings` — idempotent offering
- `POST /content/assessments/upload` — multipart assessment upload + queue
- `POST /content/solutions/upload-key` — answer key upload
- `GET /content/courses/:courseId/offerings`
- `GET /content/offerings/:offeringId`
- `GET /content/:documentType/:documentId` — `documentType` = `slide` | `interim` | `final`

---

## 6. HTTP errors

| Status | Meaning |
|--------|---------|
| **401** | Missing or invalid JWT |
| **403** | Valid JWT but **SolutionAccessGuard** rejected (upgrade), or `@Roles` mismatch |
| **404** | Unknown document / slide bundle (`GET /content/slides/bundle/:id`) |

**Client handling:** On **403** from solution/discussion routes, show upgrade / subscription CTA; do not treat as a generic error.

---

## 7. Swagger

In **development** and **qa**, OpenAPI is enabled. Tags include **`solutions`**, **`discussions`**, **`content`**, **`admin`**, **`questions`**.

Refresh the bundled spec: `npm run openapi:pull` from the frontend repo (API must be running or set `OPENAPI_URL`).

---

## 8. Direct Convex (optional)

If the frontend talks to Convex directly (e.g. real-time), mirror the same rules:

- `questionAccess:canAccessSolutions`
- `solutions:*`, `discussions:*`, `slides:*`, `assessments:addAssessmentExtractedContent`

Server-side ranking and vote semantics should match this API so behavior stays consistent.
