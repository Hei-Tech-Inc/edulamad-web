/**
 * Typed path helpers — align with `paths` in `contexts/api-docs.json`.
 * `NEXT_PUBLIC_API_URL` is the axios base URL (include a global prefix in env if the API uses one).
 *
 * Some keys (`admin` org/role routes, `organisations`, `platform`, `apiKeys`, `auditLogs`) are for
 * admin or tenant tooling; confirm against your deployed API if those routes differ.
 */
const API = {
  app: {
    root: '/',
  },
  authRedirect: {
    verifyEmail: '/verify-email',
  },
  metrics: '/metrics',
  users: {
    profile: '/users/profile',
    profilePhoto: '/users/profile/photo',
  },
  admin: {
    stats: '/admin/stats',
    notifications: '/admin/notifications',
    roles: {
      list: '/admin/roles',
      detail: (id: string) => `/admin/roles/${id}`,
      permissions: (id: string) => `/admin/roles/${id}/permissions`,
      permissionsList: '/admin/roles/permissions',
    },
    organizations: {
      list: '/admin/organizations',
      detail: (id: string) => `/admin/organizations/${id}`,
      members: (id: string) => `/admin/organizations/${id}/members`,
      memberRole: (orgId: string, userId: string) =>
        `/admin/organizations/${orgId}/members/${userId}/role`,
      member: (orgId: string, userId: string) =>
        `/admin/organizations/${orgId}/members/${userId}`,
    },
  },
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
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
  platform: {
    organisations: '/platform/organisations',
    organisation: (orgId: string) => `/platform/organisations/${orgId}`,
  },
  health: '/health',
  files: {
    upload: '/files/upload',
    signedUrl: (key: string) => `/files/${key}/signed-url`,
    detail: (key: string) => `/files/${key}`,
  },
  search: {
    tasks: '/search/tasks',
    users: '/search/users',
    global: '/search/global',
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
  },
  questions: {
    list: '/questions',
    uploadQueue: '/questions/upload-queue',
    byCourse: (courseId: string) => `/questions/courses/${courseId}`,
    detail: (id: string) => `/questions/${id}`,
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
    payUploadFee: '/subscriptions/pay/upload-fee',
    paystackWebhook: '/subscriptions/webhooks/paystack',
  },
  gamification: {
    leaderboard: '/gamification/leaderboard',
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
  },
  analytics: {
    me: '/analytics/me',
  },
  bookmarks: {
    me: '/bookmarks/me',
    list: '/bookmarks',
    detail: (id: string) => `/bookmarks/${id}`,
  },
  flashcards: {
    me: '/flashcards/me',
    list: '/flashcards',
    detail: (id: string) => `/flashcards/${id}`,
  },
  timetables: {
    me: '/timetables/me',
    list: '/timetables',
    detail: (id: string) => `/timetables/${id}`,
  },
} as const;

export default API;
