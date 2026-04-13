import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { isApiError } from '@/lib/api-error';

export type TaskStatusFilter = 'OPEN' | 'IN_PROGRESS' | 'DONE';

/** Matches OpenAPI `CreateTaskDto` (required: title, description, status). */
export type CreateTaskPayload = {
  title: string;
  description: string;
  status: TaskStatusFilter;
  labels?: { name: string; color?: string }[];
};

export function useTasksList(filters: {
  offset?: number;
  limit?: number;
  search?: string;
  status?: TaskStatusFilter;
  enabled?: boolean;
}) {
  const { offset, limit, search, status, enabled = true } = filters;
  return useQuery({
    queryKey: queryKeys.tasks.list({ offset, limit, search, status }),
    enabled,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.tasks.list, {
        signal,
        params: { offset, limit, search, status },
      });
      return data;
    },
    staleTime: 30_000,
    retry: (count, err) => {
      if (isApiError(err) && err.status === 401) return false;
      return count < 2;
    },
  });
}

export function useTaskDetail(taskId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: taskId ? queryKeys.tasks.detail(taskId) : ['tasks', 'detail', 'none'],
    enabled: Boolean(taskId && enabled),
    queryFn: async ({ signal }) => {
      if (!taskId) throw new Error('Missing task id');
      const { data } = await apiClient.get<unknown>(API.tasks.detail(taskId), { signal });
      return data;
    },
    staleTime: 30_000,
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 401 || err.status === 404)) return false;
      return count < 2;
    },
  });
}

function invalidateTaskQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['tasks'] });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { data } = await apiClient.post<unknown>(API.tasks.list, payload);
      return data;
    },
    onSuccess: () => invalidateTaskQueries(queryClient),
  });
}

/** OpenAPI `UpdateTaskDto` may be sparse; send only fields you change. */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const { data } = await apiClient.patch<unknown>(API.tasks.detail(id), payload);
      return data;
    },
    onSuccess: (_data, { id }) => {
      invalidateTaskQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API.tasks.detail(id));
    },
    onSuccess: () => invalidateTaskQueries(queryClient),
  });
}
