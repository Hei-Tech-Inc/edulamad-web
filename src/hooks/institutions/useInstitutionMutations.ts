import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

function invalidateInstitutions(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.institutions.all });
}

export function useCreateUniversity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post(API.institutions.universities.list, payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useUpdateUniversity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => apiClient.patch(API.institutions.universities.detail(id), payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useCreateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post(API.institutions.colleges.list, payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useUpdateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => apiClient.patch(API.institutions.colleges.detail(id), payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post(API.institutions.departments.list, payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => apiClient.patch(API.institutions.departments.detail(id), payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post(API.institutions.courses.list, payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => apiClient.patch(API.institutions.courses.detail(id), payload),
    onSuccess: () => invalidateInstitutions(qc),
  });
}
