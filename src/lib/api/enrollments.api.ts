import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type EnrollmentItem = {
  id: string;
  courseId: string;
  courseName?: string;
  academicYear: string;
  semester: 1 | 2;
  level: number;
};

export type SetEnrollmentsDto = {
  courseIds: string[];
  academicYear: string;
  semester: 1 | 2;
  level: number;
};

type SetEnrollmentsResponse = { enrolled: number };

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
}

function normalizeEnrollment(row: unknown): EnrollmentItem | null {
  if (!row || typeof row !== 'object') return null;
  const rec = row as Record<string, unknown>;
  const id = typeof rec.id === 'string' && rec.id ? rec.id : null;
  const courseId =
    typeof rec.courseId === 'string' && rec.courseId ? rec.courseId : null;
  const academicYear =
    typeof rec.academicYear === 'string' && rec.academicYear ? rec.academicYear : null;
  const semesterValue = Number(rec.semester);
  const semester = semesterValue === 2 ? 2 : semesterValue === 1 ? 1 : null;
  const level = Number(rec.level);
  if (!id || !courseId || !academicYear || !semester || !Number.isFinite(level)) return null;
  const courseName = typeof rec.courseName === 'string' ? rec.courseName : undefined;
  return {
    id,
    courseId,
    courseName,
    academicYear,
    semester,
    level,
  };
}

export const enrollmentsApi = {
  getMyEnrollments: async (signal?: AbortSignal): Promise<EnrollmentItem[]> => {
    const { data } = await apiClient.get<unknown>(API.enrollments.me, { signal });
    return asArray(data).map(normalizeEnrollment).filter(Boolean) as EnrollmentItem[];
  },
  setEnrollments: async (dto: SetEnrollmentsDto): Promise<SetEnrollmentsResponse> => {
    const { data } = await apiClient.post<unknown>(API.enrollments.me, dto);
    const rec = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    return { enrolled: Number(rec.enrolled ?? 0) };
  },
  removeEnrollment: async (courseId: string) => {
    const { data } = await apiClient.delete(API.enrollments.meCourse(courseId));
    return data;
  },
};
