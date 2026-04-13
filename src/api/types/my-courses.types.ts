/**
 * DTOs for `GET /students/me/courses` and `GET /students/me/courses/{courseId}`.
 * Source: `contexts/api-docs.json` — refresh with `npm run openapi:pull`.
 */

export type MyCourseEnrollmentStatus = 'not_started' | 'in_progress' | 'completed';

export type MyCourseInstructorDto = {
  name: string;
  avatarUrl?: string | null;
};

export type MyCourseRowDto = {
  courseId: string;
  code?: string | null;
  name: string;
  departmentId: string;
  departmentName: string;
  thumbnailUrl?: string | null;
  instructor?: MyCourseInstructorDto | null;
  questionCount: number;
  slidesCount: number;
  enrollmentStatus?: MyCourseEnrollmentStatus | null;
  completionPercentage?: number | null;
  completedSteps?: number | null;
  totalSteps?: number | null;
  lastActivityAt?: string | null;
  isFreeSampler?: boolean;
  statusMessage?: string | null;
  isDecommissioned?: boolean;
};

export type MyCoursesListMetaDto = {
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
  applied: Record<string, unknown>;
  profileIncomplete?: boolean;
};

export type MyCoursesListResponseDto = {
  data: MyCourseRowDto[];
  meta: MyCoursesListMetaDto;
};

export type MyCourseLessonDto = {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
};

export type MyCourseDetailIncludesDto = {
  lessonCount: number;
  instructorLabel: string;
};

export type MyCourseDetailResponseDto = {
  courseId: string;
  code?: string | null;
  name: string;
  departmentId: string;
  departmentName: string;
  descriptionShort?: string | null;
  descriptionHtml?: string | null;
  thumbnailUrl?: string | null;
  instructor?: MyCourseInstructorDto | null;
  questionCount: number;
  slidesCount: number;
  lessons: MyCourseLessonDto[];
  courseIncludes: MyCourseDetailIncludesDto;
  enrollmentStatus?: MyCourseEnrollmentStatus | null;
  completionPercentage?: number | null;
  lastActivityAt?: string | null;
  isDecommissioned?: boolean;
  statusMessage?: string | null;
  applied: Record<string, unknown>;
};

export type MyCoursesListSort =
  | 'title_asc'
  | 'title_desc'
  | 'last_activity_desc'
  | 'completion_desc'
  | 'readiness_desc'
  | 'questions_desc'
  | 'slides_desc';

export type MyCoursesContentFilter =
  | 'all'
  | 'has_questions'
  | 'has_slides'
  | 'has_both';

export type MyCoursesStatusFilter =
  | 'all'
  | 'not_started'
  | 'in_progress'
  | 'completed';
