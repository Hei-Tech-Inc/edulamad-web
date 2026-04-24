import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import {
  getOpenApiSpecCandidateUrls,
  isOpenApiDocument,
  type OpenAPISpec,
} from '@/lib/openapi-spec-url';

async function fetchLiveOpenApiSpec(signal?: AbortSignal): Promise<{
  spec: OpenAPISpec;
  resolvedUrl: string;
}> {
  const candidates = getOpenApiSpecCandidateUrls();
  let lastMessage = 'Could not load OpenAPI JSON from the API';

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        credentials: 'omit',
        cache: 'no-store',
        signal,
      });
      if (!res.ok) {
        lastMessage = `${url} → ${res.status}`;
        continue;
      }
      const data: unknown = await res.json();
      if (!isOpenApiDocument(data)) {
        lastMessage = `${url} → not OpenAPI`;
        continue;
      }
      return { spec: data, resolvedUrl: url };
    } catch (e) {
      lastMessage =
        e instanceof Error ? `${url}: ${e.message}` : `${url}: fetch failed`;
    }
  }

  throw new Error(lastMessage);
}

export function useOpenApiSpec(bundled: OpenAPISpec) {
  const enabled = typeof window !== 'undefined';

  const query = useQuery({
    queryKey: queryKeys.openApi.spec(),
    queryFn: ({ signal }) => fetchLiveOpenApiSpec(signal),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const spec = useMemo(() => {
    if (query.data?.spec) return query.data.spec;
    return bundled;
  }, [query.data?.spec, bundled]);

  const isLive = Boolean(query.data?.spec);
  const source: 'live' | 'bundled' | 'fallback' = isLive
    ? 'live'
    : query.isError
      ? 'fallback'
      : 'bundled';

  return {
    spec,
    source,
    isLive,
    resolvedUrl: query.data?.resolvedUrl ?? null,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
