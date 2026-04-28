import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

export function useUniversityDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'university', id],
    queryFn: ({ signal }) => adminApi.universityDetail(id, signal),
    enabled: Boolean(id),
  });
}

export function useUniversityStats(id: string) {
  return useQuery({
    queryKey: ['admin', 'university', id, 'stats'],
    queryFn: ({ signal }) => adminApi.universityStats(id, signal),
    enabled: Boolean(id),
  });
}

export function useCollegeDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'college', id],
    queryFn: ({ signal }) => adminApi.collegeDetail(id, signal),
    enabled: Boolean(id),
  });
}

export function useCollegeStats(id: string) {
  return useQuery({
    queryKey: ['admin', 'college', id, 'stats'],
    queryFn: ({ signal }) => adminApi.collegeStats(id, signal),
    enabled: Boolean(id),
  });
}

export function useDepartmentDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'department', id],
    queryFn: ({ signal }) => adminApi.departmentDetail(id, signal),
    enabled: Boolean(id),
  });
}

export function useDepartmentStats(id: string) {
  return useQuery({
    queryKey: ['admin', 'department', id, 'stats'],
    queryFn: ({ signal }) => adminApi.departmentStats(id, signal),
    enabled: Boolean(id),
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'course', id],
    queryFn: ({ signal }) => adminApi.courseDetail(id, signal),
    enabled: Boolean(id),
  });
}

export function useCourseStats(id: string) {
  return useQuery({
    queryKey: ['admin', 'course', id, 'stats'],
    queryFn: ({ signal }) => adminApi.courseStats(id, signal),
    enabled: Boolean(id),
  });
}

export function useContentGaps(universityId?: string) {
  return useQuery({
    queryKey: ['admin', 'content-gaps', universityId ?? 'all'],
    queryFn: ({ signal }) => adminApi.contentGaps(universityId, signal),
    staleTime: 5 * 60_000,
  });
}

export function useUniversityColleges(universityId: string) {
  return useQuery({
    queryKey: ['admin', 'university', universityId, 'colleges'],
    queryFn: ({ signal }) => adminApi.listUniversityColleges(universityId, signal),
    enabled: Boolean(universityId),
  });
}

export function useCollegeDepartments(collegeId: string) {
  return useQuery({
    queryKey: ['admin', 'college', collegeId, 'departments'],
    queryFn: ({ signal }) => adminApi.listCollegeDepartments(collegeId, signal),
    enabled: Boolean(collegeId),
  });
}

export function useDepartmentCourses(deptId: string) {
  return useQuery({
    queryKey: ['admin', 'department', deptId, 'courses'],
    queryFn: ({ signal }) => adminApi.listDepartmentCourses(deptId, signal),
    enabled: Boolean(deptId),
  });
}

export function useUpdateUniversity(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.patch(API.institutions.universities.detail(id), data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'university', id] });
      void qc.invalidateQueries({ queryKey: queryKeys.institutions.all });
    },
  });
}

export function useToggleUniversityActive(id: string, initial = true) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.patch(API.institutions.universities.detail(id), { isActive: !initial }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'university', id] });
      void qc.invalidateQueries({ queryKey: queryKeys.institutions.all });
    },
  });
}

export function useDeleteUniversity(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      // Use soft-delete semantics because dedicated delete endpoint is absent in bundled OpenAPI.
      apiClient.patch(API.institutions.universities.detail(id), { isActive: false }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.institutions.all });
    },
  });
}
