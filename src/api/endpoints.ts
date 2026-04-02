/**
 * Typed path helpers — must match OpenAPI `paths` in `contexts/api-docs.json`.
 * All paths are relative to `NEXT_PUBLIC_API_URL` (includes `/api/v1` if configured that way).
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
  tasks: {
    list: '/tasks',
    detail: (id: string) => `/tasks/${id}`,
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
  farms: {
    list: '/farms',
    create: '/farms',
    detail: (id: string) => `/farms/${id}`,
    summary: (id: string) => `/farms/${id}/summary`,
    units: (farmId: string) => `/farms/${farmId}/units`,
    unit: (farmId: string, id: string) => `/farms/${farmId}/units/${id}`,
    unitSummary: (farmId: string, id: string) =>
      `/farms/${farmId}/units/${id}/summary`,
    weatherObservations: (farmId: string) =>
      `/farms/${farmId}/weather-observations`,
    weatherObservation: (farmId: string, id: string) =>
      `/farms/${farmId}/weather-observations/${id}`,
  },
  units: {
    cycles: (unitId: string) => `/units/${unitId}/cycles`,
    cycle: (unitId: string, id: string) => `/units/${unitId}/cycles/${id}`,
    cycleApprove: (unitId: string, id: string) =>
      `/units/${unitId}/cycles/${id}/approve`,
    cycleTerminate: (unitId: string, id: string) =>
      `/units/${unitId}/cycles/${id}/terminate`,
    cycleGrowth: (unitId: string, id: string) =>
      `/units/${unitId}/cycles/${id}/growth`,
    dailyRecords: (unitId: string) => `/units/${unitId}/daily-records`,
    dailyRecordsBulk: (unitId: string) =>
      `/units/${unitId}/daily-records/bulk`,
    dailyRecord: (unitId: string, id: string) =>
      `/units/${unitId}/daily-records/${id}`,
    dailyRecordVerify: (unitId: string, id: string) =>
      `/units/${unitId}/daily-records/${id}/verify`,
    weightSamples: (unitId: string) => `/units/${unitId}/weight-samples`,
    weightSample: (unitId: string, id: string) =>
      `/units/${unitId}/weight-samples/${id}`,
    weightSampleApprove: (unitId: string, id: string) =>
      `/units/${unitId}/weight-samples/${id}/approve`,
    feedingLogs: (unitId: string) => `/units/${unitId}/feeding-logs`,
    feedingLog: (unitId: string, id: string) =>
      `/units/${unitId}/feeding-logs/${id}`,
    diseaseEvents: (unitId: string) => `/units/${unitId}/disease-events`,
    diseaseEvent: (unitId: string, id: string) =>
      `/units/${unitId}/disease-events/${id}`,
    harvests: (unitId: string) => `/units/${unitId}/harvests`,
    harvest: (unitId: string, id: string) =>
      `/units/${unitId}/harvests/${id}`,
    harvestApprove: (unitId: string, id: string) =>
      `/units/${unitId}/harvests/${id}/approve`,
  },
} as const;

export default API;
