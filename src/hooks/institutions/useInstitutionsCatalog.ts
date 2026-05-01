import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type CatalogEntity = {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const rec = asRecord(v);
  if (!rec) return [];
  const candidates = ['items', 'data', 'results', 'rows', 'universities', 'colleges', 'departments', 'courses'];
  for (const key of candidates) {
    const next = rec[key];
    if (Array.isArray(next)) return next;
  }
  return [];
}

function toEntity(input: unknown): CatalogEntity | null {
  const rec = asRecord(input);
  if (!rec) return null;
  const idRaw = rec.id ?? rec._id ?? rec.uuid;
  const nameRaw = rec.name ?? rec.title ?? rec.label;
  const id =
    typeof idRaw === 'string'
      ? idRaw
      : typeof idRaw === 'number' && Number.isFinite(idRaw)
        ? String(idRaw)
        : null;
  const name = typeof nameRaw === 'string' ? nameRaw : null;
  if (!id || !name) return null;
  return {
    id,
    name,
    code: typeof rec.code === 'string' ? rec.code : undefined,
    isActive:
      typeof rec.isActive === 'boolean'
        ? rec.isActive
        : typeof rec.active === 'boolean'
          ? rec.active
          : undefined,
  };
}

/** Normalize list payloads from institutions list endpoints (shared with profile label resolution). */
export function normalizeEntities(raw: unknown): CatalogEntity[] {
  return pickArray(raw).map(toEntity).filter((v): v is CatalogEntity => Boolean(v));
}

export function useUniversities(activeOnly: boolean) {
  return useQuery({
    queryKey: queryKeys.institutions.universities({ activeOnly }),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(API.institutions.universities.list, {
        params: activeOnly ? { activeOnly: true } : undefined,
        signal,
      });
      return normalizeEntities(data);
    },
  });
}

export function useColleges(universityId: string | null, activeOnly: boolean) {
  return useQuery({
    queryKey: queryKeys.institutions.colleges({
      universityId: universityId ?? '',
      activeOnly,
    }),
    enabled: Boolean(universityId),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.universities.colleges(universityId as string),
        {
          params: activeOnly ? { activeOnly: true } : undefined,
          signal,
        },
      );
      return normalizeEntities(data);
    },
  });
}

export function useDepartments(collegeId: string | null, activeOnly: boolean) {
  return useQuery({
    queryKey: queryKeys.institutions.departments({
      collegeId: collegeId ?? '',
      activeOnly,
    }),
    enabled: Boolean(collegeId),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.colleges.departments(collegeId as string),
        {
          params: activeOnly ? { activeOnly: true } : undefined,
          signal,
        },
      );
      return normalizeEntities(data);
    },
  });
}

export function useCourses(deptId: string | null, activeOnly: boolean) {
  return useQuery({
    queryKey: queryKeys.institutions.courses({
      deptId: deptId ?? '',
      activeOnly,
    }),
    enabled: Boolean(deptId),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.departments.courses(deptId as string),
        {
          params: activeOnly ? { activeOnly: true } : undefined,
          signal,
        },
      );
      return normalizeEntities(data);
    },
  });
}

function buildSearchParams(activeOnly: boolean, term: string) {
  const q = term.trim();
  return {
    ...(activeOnly ? { activeOnly: true } : {}),
    ...(q ? { q } : {}),
  };
}

export function useUniversitySearch(term: string, activeOnly = true) {
  const debouncedTerm = useDebouncedValue(term, 300);
  return useQuery({
    queryKey: ['institutions', 'universities', 'search', { debouncedTerm, activeOnly }] as const,
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(API.institutions.universities.list, {
        params: buildSearchParams(activeOnly, debouncedTerm),
        signal,
      });
      return normalizeEntities(data);
    },
  });
}

export function useCollegeSearch(
  universityId: string | null,
  term: string,
  activeOnly = true,
) {
  const debouncedTerm = useDebouncedValue(term, 300);
  return useQuery({
    queryKey: [
      'institutions',
      'colleges',
      'search',
      { universityId: universityId ?? '', debouncedTerm, activeOnly },
    ] as const,
    enabled: Boolean(universityId),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.universities.colleges(universityId as string),
        {
          params: buildSearchParams(activeOnly, debouncedTerm),
          signal,
        },
      );
      return normalizeEntities(data);
    },
  });
}

export function useDepartmentSearch(collegeId: string | null, term: string, activeOnly = true) {
  const debouncedTerm = useDebouncedValue(term, 300);
  return useQuery({
    queryKey: [
      'institutions',
      'departments',
      'search',
      { collegeId: collegeId ?? '', debouncedTerm, activeOnly },
    ] as const,
    enabled: Boolean(collegeId),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.colleges.departments(collegeId as string),
        {
          params: buildSearchParams(activeOnly, debouncedTerm),
          signal,
        },
      );
      return normalizeEntities(data);
    },
  });
}

export function useCourseSearch(deptId: string | null, term: string, activeOnly = true) {
  const debouncedTerm = useDebouncedValue(term, 300);
  return useQuery({
    queryKey: ['institutions', 'courses', 'search', { deptId: deptId ?? '', debouncedTerm, activeOnly }] as const,
    enabled: Boolean(deptId),
    queryFn: async ({ signal }): Promise<CatalogEntity[]> => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.departments.courses(deptId as string),
        {
          params: buildSearchParams(activeOnly, debouncedTerm),
          signal,
        },
      );
      return normalizeEntities(data);
    },
  });
}

/** Resolve university → college → department for deep links (?departmentId=). */
export type DepartmentHierarchy = {
  departmentId: string;
  collegeId: string;
  universityId: string;
};

function coerceEntityId(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
}

/** Backend may use camelCase, snake_case, or nested refs for foreign keys. */
function parseCollegeIdFromDepartment(dr: Record<string, unknown>): string | null {
  let raw: unknown = dr.collegeId ?? dr.college_id;
  if (!raw && dr.college && typeof dr.college === 'object') {
    const c = asRecord(dr.college);
    if (c) raw = c.id ?? c._id;
  }
  return coerceEntityId(raw);
}

function parseUniversityIdFromCollege(cr: Record<string, unknown>): string | null {
  let raw: unknown = cr.universityId ?? cr.university_id;
  if (!raw && cr.university && typeof cr.university === 'object') {
    const u = asRecord(cr.university);
    if (u) raw = u.id ?? u._id;
  }
  return coerceEntityId(raw);
}

async function fetchDepartmentHierarchyDirect(
  deptId: string,
  signal?: AbortSignal,
): Promise<DepartmentHierarchy | null> {
  const { data: dept } = await apiClient.get<unknown>(
    API.institutions.departments.detail(deptId),
    { signal },
  );
  const dr = asRecord(dept);
  if (!dr) return null;

  const collegeId = parseCollegeIdFromDepartment(dr);
  if (!collegeId) return null;

  const { data: college } = await apiClient.get<unknown>(
    API.institutions.colleges.detail(collegeId),
    { signal },
  );
  const cr = asRecord(college);
  if (!cr) return null;

  const universityId = parseUniversityIdFromCollege(cr);
  if (!universityId) return null;

  return { departmentId: deptId, collegeId, universityId };
}

/**
 * When GET /departments/:id or nested college detail fails or omits IDs, locate the
 * department under GET universities → colleges → departments (same idea as profile label fallback).
 */
async function fetchDepartmentHierarchyFallback(
  deptId: string,
  signal?: AbortSignal,
): Promise<DepartmentHierarchy | null> {
  const { data } = await apiClient.get<unknown>(API.institutions.universities.list, {
    params: { activeOnly: true },
    signal,
  });
  const universities = normalizeEntities(data);

  type Pair = { universityId: string; collegeId: string };
  const pairs: Pair[] = [];
  await Promise.all(
    universities.map(async (uni) => {
      const { data: colData } = await apiClient.get<unknown>(
        API.institutions.universities.colleges(uni.id),
        { params: { activeOnly: true }, signal },
      );
      const colleges = normalizeEntities(colData);
      for (const col of colleges) {
        pairs.push({ universityId: uni.id, collegeId: col.id });
      }
    }),
  );

  const hits = await Promise.all(
    pairs.map(async ({ universityId, collegeId }) => {
      const { data: deptData } = await apiClient.get<unknown>(
        API.institutions.colleges.departments(collegeId),
        { params: { activeOnly: true }, signal },
      );
      const depts = normalizeEntities(deptData);
      if (depts.some((d) => d.id === deptId)) {
        return { departmentId: deptId, collegeId, universityId } satisfies DepartmentHierarchy;
      }
      return null;
    }),
  );

  return hits.find((h): h is DepartmentHierarchy => h !== null) ?? null;
}

export async function fetchDepartmentHierarchy(
  deptId: string,
  signal?: AbortSignal,
): Promise<DepartmentHierarchy | null> {
  try {
    const direct = await fetchDepartmentHierarchyDirect(deptId, signal);
    if (direct) return direct;
  } catch {
    // Missing department detail, 404, or broken FK chain — try catalog scan.
  }
  try {
    return await fetchDepartmentHierarchyFallback(deptId, signal);
  } catch {
    return null;
  }
}

export function useDepartmentHierarchy(deptId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.institutions.all, 'hierarchy', deptId ?? ''] as const,
    enabled: Boolean(deptId),
    queryFn: async ({ signal }) => fetchDepartmentHierarchy(deptId as string, signal),
  });
}

export type { CatalogEntity };
