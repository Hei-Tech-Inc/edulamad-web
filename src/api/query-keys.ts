export const queryKeys = {
  notifications: {
    all: ['notifications'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  students: {
    profile: ['students', 'profile'] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
    list: () => [...queryKeys.apiKeys.all, 'list'] as const,
  },
  admin: {
    orgRoles: (organizationId: string) =>
      ['admin', 'roles', { organizationId }] as const,
    orgMembers: (organizationId: string) =>
      ['admin', 'organizations', organizationId, 'members'] as const,
  },
  platform: {
    all: ['platform'] as const,
    organisations: (filters: Record<string, unknown>) =>
      [...queryKeys.platform.all, 'organisations', filters] as const,
    organisation: (
      orgId: string,
      opts?: { includeDeleted?: boolean },
    ) =>
      [
        ...queryKeys.platform.all,
        'organisation',
        orgId,
        opts?.includeDeleted === true ? 'withDeleted' : 'default',
      ] as const,
  },
  openApi: {
    spec: () => ['openApi', 'spec'] as const,
  },
  institutions: {
    all: ['institutions'] as const,
    universities: (filters: { activeOnly: boolean }) =>
      [...queryKeys.institutions.all, 'universities', filters] as const,
    colleges: (filters: { universityId: string; activeOnly: boolean }) =>
      [...queryKeys.institutions.all, 'colleges', filters] as const,
    departments: (filters: { collegeId: string; activeOnly: boolean }) =>
      [...queryKeys.institutions.all, 'departments', filters] as const,
    courses: (filters: { deptId: string; activeOnly: boolean }) =>
      [...queryKeys.institutions.all, 'courses', filters] as const,
  },
  questions: {
    byCourse: (filters: {
      courseId: string;
      year: string;
      level: string;
      type: string;
    }) => ['questions', 'byCourse', filters] as const,
  },
} as const;
