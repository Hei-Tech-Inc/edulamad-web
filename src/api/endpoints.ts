/**
 * Typed path helpers — align with OpenAPI `paths` (live: `{NEXT_PUBLIC_API_URL}/api-json`, e.g. http://localhost:5003/api-json).
 * Bundled `contexts/api-docs.json` is a fallback when the API is offline. Regenerate or refresh the bundle after backend changes.
 * `NEXT_PUBLIC_API_URL` is the axios base URL (include a global prefix in env if the API uses one).
 *
 * `deploymentExtensions` documents non-OpenAPI paths still referenced by some pages (not the main sidebar).
 */
const API = {
  app: {
    root: '/',
  },
  authRedirect: {
    verifyEmail: '/verify-email',
  },
  metrics: '/metrics',
  /** Qstash / background jobs (internal; rarely called from browser). */
  internal: {
    qstashJobs: '/internal/qstash/jobs',
  },
  users: {
    profile: '/users/profile',
    profilePhoto: '/users/profile/photo',
  },
  admin: {
    stats: '/admin/stats',
    notifications: '/admin/notifications',
    promo: {
      codes: '/admin/promo/codes',
      code: (id: string) => `/admin/promo/codes/${id}`,
      deactivate: (id: string) => `/admin/promo/codes/${id}/deactivate`,
    },
    /** Admin: delete all solutions for a question (see OpenAPI). */
    questionSolutions: (questionId: string) =>
      `/admin/questions/${questionId}/solutions`,
    organizations: {
      list: '/admin/organizations',
      detail: (id: string) => `/admin/organizations/${id}`,
      members: (id: string) => `/admin/organizations/${id}/members`,
      memberRole: (orgId: string, userId: string) =>
        `/admin/organizations/${orgId}/members/${userId}/role`,
      member: (orgId: string, userId: string) =>
        `/admin/organizations/${orgId}/members/${userId}`,
    },
    content: {
      manualQueue: '/admin/content/manual-queue',
      manualQueueExtract: (documentId: string) =>
        `/admin/content/manual-queue/${documentId}/extract`,
      overview: '/admin/content/overview',
      solutionMismatches: '/admin/content/solution-mismatches',
      solutionsManualCreate: '/admin/content/solutions/manual-create',
    },
  },
  promo: {
    redeem: '/promo/redeem',
    myActive: '/promo/my-active',
  },
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    /** POST (Bearer) — same as resend by email but uses JWT; see OpenAPI. */
    resendVerificationMe: '/auth/resend-verification/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    inviteAccept: '/auth/invite/accept',
  },
  organisations: {
    me: '/organisations/me',
    mePermissionsOverrides: '/organisations/me/permissions-overrides',
    meSettings: '/organisations/me/settings',
  },
  apiKeys: {
    list: '/api-keys',
    detail: (id: string) => `/api-keys/${id}`,
    scopes: (id: string) => `/api-keys/${id}/scopes`,
  },
  auditLogs: {
    list: '/audit-logs',
    detail: (id: string) => `/audit-logs/${id}`,
  },
  /** Not in bundled OpenAPI; only use if your deployed API exposes platform routes. */
  platform: {
    organisations: '/platform/organisations',
    organisation: (orgId: string) => `/platform/organisations/${orgId}`,
  },
  health: '/health',
  /**
   * Preferred solution APIs (subscription-gated via `SolutionAccessGuard` on the API).
   * Legacy list: `API.questions.solutions` / `API.questions.solutionUpvote`.
   */
  solutions: {
    byQuestion: (questionId: string) => `/solutions/question/${questionId}`,
    bestByQuestion: (questionId: string) => `/solutions/question/${questionId}/best`,
    vote: (solutionId: string) => `/solutions/${solutionId}/vote`,
  },
  /** Question-scoped AI / chat threads (JWT + solution access rules on the API). */
  discussions: {
    messages: '/discussions/messages',
    threads: (questionId: string) => `/discussions/threads/${questionId}`,
    context: (questionId: string) => `/discussions/context/${questionId}`,
    recent: '/discussions/recent',
  },
  /**
   * Content pipeline (offerings, assessments, documents, TA solution keys).
   * Align with OpenAPI `content` tag when pulled from `/api-json`.
   */
  content: {
    offerings: '/content/offerings',
    assessmentsUpload: '/content/assessments/upload',
    finalDocument: (documentId: string) => `/content/final/${documentId}`,
    interimDocument: (documentId: string) => `/content/interim/${documentId}`,
    solutionsUploadKey: '/content/solutions/upload-key',
    questionsPendingReview: '/content/questions/pending-review',
    courseOfferings: (courseId: string) => `/content/courses/${courseId}/offerings`,
    offering: (offeringId: string) => `/content/offerings/${offeringId}`,
    /** Bulk JSON question import (may not be in older OpenAPI bundles; see api-path-stubs). */
    questionsBulkJsonUpload: '/content/questions/bulk-upload',
    questionsBulkApprove: '/content/questions/bulk-approve',
    questionApprove: (questionId: string) => `/content/questions/${questionId}/approve`,
    questionReject: (questionId: string) => `/content/questions/${questionId}/reject`,
    validateCourse: '/content/validate-course',
    solutionsBulkSave: '/content/solutions/bulk-save',
    assessmentsExtractedContent: '/content/assessments/extracted-content',
    slidesBundle: '/content/slides/bundle',
    slidesBundleDetail: (slideId: string) => `/content/slides/bundle/${slideId}`,
    slidesBundleFile: (slideId: string) => `/content/slides/bundle/${slideId}/file`,
    slidesBundleExtractedContent: (slideId: string) =>
      `/content/slides/bundle/${slideId}/extracted-content`,
    slidesBundleSummaryInline: (slideId: string) =>
      `/content/slides/bundle/${slideId}/summary-inline`,
    slidesBundlePublish: (slideId: string) => `/content/slides/bundle/${slideId}/publish`,
  },
  /** Practice quiz (OpenAPI `quiz` tag). */
  quiz: {
    topics: (courseId: string) => `/quiz/topics/${courseId}`,
    generate: '/quiz/generate',
    history: '/quiz/history',
    submit: (id: string) => `/quiz/${id}/submit`,
    abandoned: '/quiz/abandoned',
    resume: (id: string) => `/quiz/${id}/resume`,
  },
  files: {
    upload: '/files/upload',
    signedUrl: (key: string) => `/files/${key}/signed-url`,
    detail: (key: string) => `/files/${key}`,
  },
  search: {
    users: '/search/users',
    global: '/search/global',
    /** OpenAPI `SearchController_searchTasks` (may return empty in MVP). */
    tasks: '/search/tasks',
  },
  /**
   * User tasks (`TasksController_*` in OpenAPI; module may be retired in some builds).
   */
  tasks: {
    list: '/tasks',
    detail: (id: string) => `/tasks/${id}`,
  },
  institutions: {
    universities: {
      list: '/institutions/universities',
      detail: (id: string) => `/institutions/universities/${id}`,
      colleges: (universityId: string) =>
        `/institutions/universities/${universityId}/colleges`,
    },
    colleges: {
      list: '/institutions/colleges',
      detail: (id: string) => `/institutions/colleges/${id}`,
      departments: (collegeId: string) =>
        `/institutions/colleges/${collegeId}/departments`,
    },
    departments: {
      list: '/institutions/departments',
      detail: (id: string) => `/institutions/departments/${id}`,
      courses: (deptId: string) =>
        `/institutions/departments/${deptId}/courses`,
    },
    courses: {
      list: '/institutions/courses',
      detail: (id: string) => `/institutions/courses/${id}`,
      byCode: (code: string) =>
        `/institutions/courses/by-code/${encodeURIComponent(code)}`,
    },
  },
  students: {
    meProfile: '/students/me/profile',
    meStreak: '/students/me/streak',
    meXp: '/students/me/xp',
    meActivity: '/students/me/activity',
    meActivityStats: '/students/me/activity/stats',
    meReferral: '/students/me/referral',
    meQuestionCredits: '/students/me/question-credits',
    /** Paginated department catalog + material counts (OpenAPI `MyCoursesListResponseDto`). */
    meCourses: '/students/me/courses',
    meCourse: (courseId: string) => `/students/me/courses/${courseId}`,
  },
  questions: {
    list: '/questions',
    create: '/questions',
    uploadQueue: '/questions/upload-queue',
    uploadPreview: (uploadQueueId: string) =>
      `/questions/uploads/${uploadQueueId}/preview`,
    upload: '/questions/upload',
    /** PDF + extracted JSON multipart (backend bundle pipeline). */
    uploadBundle: '/questions/upload-bundle',
    byCourse: (courseId: string) => `/questions/courses/${courseId}`,
    detail: (id: string) => `/questions/${id}`,
    sourceDocument: (id: string) => `/questions/${id}/source-document`,
    verify: (id: string) => `/questions/${id}/verify`,
    solutions: (questionId: string) => `/questions/${questionId}/solutions`,
    solutionUpvote: (solutionId: string) =>
      `/questions/solutions/${solutionId}/upvote`,
  },
  ai: {
    chat: '/ai/chat',
    complete: '/ai/complete',
  },
  slides: {
    byCourse: (courseId: string) => `/slides/courses/${courseId}`,
    detail: (id: string) => `/slides/${id}`,
    outputs: (id: string) => `/slides/${id}/outputs`,
  },
  exams: {
    simulations: '/exams/simulations',
    simulation: (id: string) => `/exams/simulations/${id}`,
    simulationAnswers: (id: string) => `/exams/simulations/${id}/answers`,
    simulationComplete: (id: string) => `/exams/simulations/${id}/complete`,
    simulationAbandon: (id: string) => `/exams/simulations/${id}/abandon`,
  },
  subscriptions: {
    plans: '/subscriptions/plans',
    me: '/subscriptions/me',
    /** JWT — returns Paystack `authorizationUrl` + `reference` (OpenAPI). */
    subscribe: '/subscriptions/subscribe',
    payUploadFee: '/subscriptions/pay/upload-fee',
    paystackWebhook: '/subscriptions/webhooks/paystack',
  },
  payments: {
    /** JWT — confirm after Paystack redirect (`reference` from subscribe response or query string). */
    verify: (reference: string) =>
      `/payments/verify/${encodeURIComponent(reference)}`,
    /** Server-side Paystack callback (raw body; not for browser). */
    webhook: '/payments/webhook',
  },
  gamification: {
    me: '/gamification/me',
    leaderboard: '/gamification/leaderboard',
    /** Public or catalog of badge definitions (OpenAPI). */
    badges: '/gamification/badges',
    badgesMe: '/gamification/badges/me',
    walletMe: '/gamification/wallet/me',
  },
  ta: {
    uploadQueue: '/ta/upload-queue',
    uploadQueueItem: (id: string) => `/ta/upload-queue/${id}`,
  },
  notifications: {
    me: '/notifications/me',
    read: (id: string) => `/notifications/${id}/read`,
    registerDevice: '/notifications/register-device',
    unregisterDevice: '/notifications/unregister-device',
    dailyQuestionToday: '/notifications/daily-question/today',
    answerDailyQuestion: '/notifications/daily-question/answer',
  },
  enrollments: {
    me: '/enrollments/me',
    meCourse: (courseId: string) => `/enrollments/me/${courseId}`,
  },
  tags: {
    byQuestion: (questionId: string) => `/questions/${questionId}/tags`,
    questionTag: (questionId: string, tagId: string) =>
      `/questions/${questionId}/tags/${tagId}`,
    byCourse: (courseId: string) => `/tags/courses/${courseId}`,
    search: '/tags/search',
  },
  analytics: {
    me: '/analytics/me',
  },
  bookmarks: {
    me: '/bookmarks/me',
    list: '/bookmarks',
    detail: (id: string) => `/bookmarks/${id}`,
  },
  /** Legacy single-card CRUD (OpenAPI). Prefer `flashcardDecks` for student study flows. */
  flashcards: {
    me: '/flashcards/me',
    list: '/flashcards',
    detail: (id: string) => `/flashcards/${id}`,
  },
  /** Deck-based flashcards (Edulamad API — see backend integration guide). */
  flashcardDecks: {
    byCourse: (courseId: string) => `/flashcards/courses/${courseId}`,
    deck: (deckId: string) => `/flashcards/decks/${deckId}`,
    due: (deckId: string) => `/flashcards/decks/${deckId}/due`,
    weak: (deckId: string) => `/flashcards/decks/${deckId}/weak`,
    progress: (deckId: string) => `/flashcards/decks/${deckId}/progress`,
    uploadJson: '/flashcards/decks/upload-json',
    create: '/flashcards/decks',
  },
  flashcardSessions: {
    root: '/flashcards/sessions',
    complete: (sessionId: string) => `/flashcards/sessions/${sessionId}/complete`,
  },
  flashcardCards: {
    review: (cardId: string) => `/flashcards/cards/${cardId}/review`,
  },
  mnemonics: {
    byCourse: (courseId: string) => `/mnemonics/courses/${courseId}`,
    root: '/mnemonics',
    upvote: (id: string) => `/mnemonics/${id}/upvote`,
    verify: (id: string) => `/mnemonics/${id}/verify`,
  },
  conceptMaps: {
    byCourse: (courseId: string) => `/concept-maps/courses/${courseId}`,
    topic: (courseId: string, topic: string) =>
      `/concept-maps/courses/${courseId}/topics/${encodeURIComponent(topic)}`,
  },
  examCountdown: {
    byCourse: (courseId: string) => `/exam-countdown/courses/${courseId}`,
  },
  timetables: {
    me: '/timetables/me',
    list: '/timetables',
    detail: (id: string) => `/timetables/${id}`,
  },
} as const;

/** Routes referenced by some legacy pages but absent from bundled `contexts/api-docs.json`. */
export const deploymentExtensions = {
  authInviteAccept: API.auth.inviteAccept,
  organisations: API.organisations,
  apiKeys: API.apiKeys,
  auditLogs: API.auditLogs,
  adminOrganizations: API.admin.organizations,
} as const;

export default API;
