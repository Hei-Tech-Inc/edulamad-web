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
  const id = rec.id ?? rec._id ?? rec.uuid;
  const name = rec.name ?? rec.title ?? rec.label;
  if (typeof id !== 'string' || typeof name !== 'string') return null;
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

function normalizeEntities(raw: unknown): CatalogEntity[] {
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

export type { CatalogEntity };
