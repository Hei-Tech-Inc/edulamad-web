import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type SetEnrollmentsDto = {
  courseIds: string[];
  academicYear: string;
  semester: 1 | 2;
};

export const enrollmentsApi = {
  getMyEnrollments: async (signal?: AbortSignal) => {
    const { data } = await apiClient.get(API.enrollments.me, { signal });
    return data;
  },
  setEnrollments: async (dto: SetEnrollmentsDto) => {
    const { data } = await apiClient.post(API.enrollments.me, dto);
    return data;
  },
  removeEnrollment: async (courseId: string) => {
    const { data } = await apiClient.delete(API.enrollments.meCourse(courseId));
    return data;
  },
};
