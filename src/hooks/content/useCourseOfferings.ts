import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

function pickArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    for (const k of ['items', 'data', 'results', 'offerings']) {
      const v = o[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export function useCourseOfferings(courseId: string | null) {
  return useQuery({
    queryKey: ['content', 'course-offerings', courseId ?? ''],
    enabled: Boolean(courseId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.content.courseOfferings(courseId as string),
        { signal },
      );
      return pickArray(data);
    },
    staleTime: 30_000,
  });
}

export interface CreateOfferingPayload {
  courseId: string;
  academicYear: string;
  level: 100 | 200 | 300 | 400 | 500;
  semester: 1 | 2;
}

export function useCreateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferingPayload) =>
      apiClient.post(API.content.offerings, payload),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({
        queryKey: ['content', 'course-offerings', v.courseId],
      });
    },
  });
}
