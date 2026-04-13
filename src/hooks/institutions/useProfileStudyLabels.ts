import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { normalizeEntities, type CatalogEntity } from './useInstitutionsCatalog';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickName(raw: unknown): string | null {
  const r = asRecord(raw);
  if (!r) return null;
  const n = r.name ?? r.title ?? r.label;
  return typeof n === 'string' && n.trim() ? n.trim() : null;
}

function parseDepartmentDetail(raw: unknown): { name: string | null; collegeId: string | null } {
  const r = asRecord(raw);
  if (!r) return { name: null, collegeId: null };
  const name = pickName(raw);
  let collegeId: string | null = null;
  if (typeof r.collegeId === 'string' && r.collegeId.trim()) collegeId = r.collegeId.trim();
  const college = asRecord(r.college);
  if (!collegeId && typeof college?.id === 'string') collegeId = college.id.trim();
  return { name, collegeId };
}

/**
 * Resolve human-readable university, college, and department names for the profile screen.
 * Tries `GET /institutions/departments/:id` first; if that fails, scans departments under each college of the university.
 */
export function useProfileStudyLabels(universityId: string | undefined, deptId: string | undefined) {
  const universityQ = useQuery({
    queryKey: [...queryKeys.institutions.all, 'detail', 'university', universityId ?? ''] as const,
    enabled: Boolean(universityId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.universities.detail(universityId as string),
        { signal },
      );
      return pickName(data);
    },
  });

  const departmentDirectQ = useQuery({
    queryKey: [...queryKeys.institutions.all, 'detail', 'department', deptId ?? ''] as const,
    enabled: Boolean(deptId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.departments.detail(deptId as string),
        { signal },
      );
      return data;
    },
    retry: false,
  });

  const parsedDirect = useMemo(
    () => parseDepartmentDetail(departmentDirectQ.data),
    [departmentDirectQ.data],
  );

  const collegeFromDeptQ = useQuery({
    queryKey: [...queryKeys.institutions.all, 'detail', 'college', parsedDirect.collegeId ?? ''] as const,
    enabled: Boolean(parsedDirect.collegeId && parsedDirect.name),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.colleges.detail(parsedDirect.collegeId as string),
        { signal },
      );
      return pickName(data);
    },
    retry: false,
  });

  const shouldScanColleges =
    Boolean(universityId && deptId) &&
    (departmentDirectQ.isError ||
      (Boolean(parsedDirect.name) && !parsedDirect.collegeId) ||
      (departmentDirectQ.isSuccess && !parsedDirect.name));

  const collegesListQ = useQuery({
    queryKey: queryKeys.institutions.colleges({
      universityId: universityId ?? '',
      activeOnly: true,
    }),
    enabled: shouldScanColleges,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.universities.colleges(universityId as string),
        { params: { activeOnly: true }, signal },
      );
      return normalizeEntities(data);
    },
  });

  const colleges = useMemo(() => collegesListQ.data ?? [], [collegesListQ.data]);

  const departmentScanQ = useQueries({
    queries: colleges.map((col: CatalogEntity) => ({
      queryKey: queryKeys.institutions.departments({ collegeId: col.id, activeOnly: true }),
      queryFn: async (ctx: { signal: AbortSignal }): Promise<CatalogEntity[]> => {
        const { data } = await apiClient.get<unknown>(
          API.institutions.colleges.departments(col.id),
          { params: { activeOnly: true }, signal: ctx.signal },
        );
        return normalizeEntities(data);
      },
      enabled: Boolean(shouldScanColleges && colleges.length > 0),
    })),
  });

  const scanHit = useMemo(() => {
    if (!deptId) return null;
    for (let i = 0; i < departmentScanQ.length; i++) {
      const q = departmentScanQ[i];
      const col = colleges[i];
      const list = q.data;
      if (!list || !col) continue;
      const hit = list.find((d) => d.id === deptId);
      if (hit) return { departmentName: hit.name, collegeName: col.name };
    }
    return null;
  }, [departmentScanQ, colleges, deptId]);

  const departmentName = parsedDirect.name ?? scanHit?.departmentName ?? null;
  const collegeName = collegeFromDeptQ.data ?? scanHit?.collegeName ?? null;

  const labelsLoading =
    universityQ.isPending ||
    (Boolean(deptId) && departmentDirectQ.isPending && !departmentDirectQ.isError) ||
    (Boolean(parsedDirect.collegeId && parsedDirect.name) && collegeFromDeptQ.isPending) ||
    (Boolean(shouldScanColleges) &&
      (collegesListQ.isPending || departmentScanQ.some((q) => q.isPending)));

  return {
    universityName: universityQ.data ?? null,
    collegeName,
    departmentName,
    labelsLoading,
  };
}
