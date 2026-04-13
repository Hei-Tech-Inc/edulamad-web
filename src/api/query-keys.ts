export const queryKeys = {
  notifications: {
    all: ['notifications'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  students: {
    /** Must stay in sync with AuthWrapper onboarding gate in `pages/_app.js`. */
    onboardingGate: ['students', 'me-profile', 'onboarding-gate'] as const,
    profile: ['students', 'profile'] as const,
    referral: ['students', 'referral'] as const,
    questionCredits: ['students', 'question-credits'] as const,
    myCoursesInfinite: (filters: Record<string, unknown>) =>
      ['students', 'my-courses', 'infinite', filters] as const,
    myCourseDetail: (filters: {
      courseId: string;
      year: string;
      level: number;
    }) => ['students', 'my-course', filters] as const,
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
    detail: (questionId: string) => ['questions', 'detail', questionId] as const,
    solutions: (questionId: string) => ['questions', 'solutions', questionId] as const,
    uploadPreview: (uploadQueueId: string) =>
      ['questions', 'upload-preview', uploadQueueId] as const,
    sourceDocument: (questionId: string) =>
      ['questions', 'source-document', questionId] as const,
  },
  tasks: {
    list: (filters: {
      offset?: number;
      limit?: number;
      search?: string;
      status?: string;
    }) => ['tasks', 'list', filters] as const,
    detail: (taskId: string) => ['tasks', 'detail', taskId] as const,
  },
  promo: {
    redeem: ['promo', 'redeem'] as const,
  },
  flashcards: {
    decksByCourse: (courseId: string) =>
      ['flashcards', 'decks', 'course', courseId] as const,
    deck: (deckId: string) => ['flashcards', 'deck', deckId] as const,
    due: (deckId: string) => ['flashcards', 'due', deckId] as const,
    weak: (deckId: string) => ['flashcards', 'weak', deckId] as const,
    progress: (deckId: string) => ['flashcards', 'progress', deckId] as const,
  },
  discussions: {
    thread: (questionId: string) => ['discussions', 'thread', questionId] as const,
    recent: (limit: number) => ['discussions', 'recent', limit] as const,
  },
  mnemonics: {
    course: (courseId: string, topic?: string) =>
      ['mnemonics', 'course', courseId, topic ?? 'all'] as const,
  },
  examCountdown: {
    course: (courseId: string) => ['exam-countdown', courseId] as const,
  },
  gamification: {
    me: ['gamification', 'me'] as const,
  },
} as const;
