import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  ApiKeyCreated,
  ApiKeySummary,
  CreateApiKeyPayload,
} from '@/api/types/api-keys.types';
import { normalizeApiKeyList } from '@/api/types/api-keys.types';

export function useApiKeysList(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.apiKeys.list(),
    enabled,
    queryFn: async () => {
      const { data: raw } = await apiClient.get<unknown>(API.apiKeys.list);
      return normalizeApiKeyList(raw);
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateApiKeyPayload) => {
      const { data } = await apiClient.post<ApiKeyCreated>(
        API.apiKeys.list,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API.apiKeys.detail(id));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });
}

export function useUpdateApiKeyScopes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      scopes,
    }: {
      id: string;
      scopes: string[];
    }) => {
      const { data } = await apiClient.patch<ApiKeySummary>(
        API.apiKeys.scopes(id),
        { scopes },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });
}
