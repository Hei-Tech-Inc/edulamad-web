import { apiClientPublic } from '@/api/client';
import API from '@/api/endpoints';
import type { CatalogSearchResponse } from '@/api/types/catalog-search.types';

function asObjectArray(v: unknown): Record<string, unknown>[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is Record<string, unknown> => x != null && typeof x === 'object');
}

function pickId(row: Record<string, unknown>): string {
  const raw = row._id ?? row.id;
  return raw != null ? String(raw) : '';
}

function mapSection<T extends { _id: string }>(arr: unknown): T[] {
  return asObjectArray(arr)
    .map((row) => ({ ...(row as object), _id: pickId(row) }) as T)
    .filter((row) => Boolean(row._id));
}

/** Normalizes API JSON to stable section arrays (Convex `_id` strings). */
export function normalizeCatalogSearchResponse(raw: unknown): CatalogSearchResponse {
  const o = raw != null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    questions: mapSection(o.questions),
    courses: mapSection(o.courses),
    universities: mapSection(o.universities),
    flashcardDecks: mapSection(o.flashcardDecks),
    practiceQuestions: mapSection(o.practiceQuestions),
  };
}

export interface FetchCatalogSearchParams {
  q: string;
  limit?: number;
  universityId?: string;
  courseId?: string;
}

/**
 * Public catalog omnibar — uses {@link apiClientPublic} (no `Authorization` header).
 */
export async function fetchCatalogSearch(
  params: FetchCatalogSearchParams,
  signal?: AbortSignal,
): Promise<CatalogSearchResponse> {
  const q = params.q.trim();
  const { data } = await apiClientPublic.get<unknown>(API.search.catalog, {
    params: {
      q,
      limit: params.limit ?? 10,
      ...(params.universityId ? { universityId: params.universityId } : {}),
      ...(params.courseId ? { courseId: params.courseId } : {}),
    },
    signal,
  });
  return normalizeCatalogSearchResponse(data);
}
