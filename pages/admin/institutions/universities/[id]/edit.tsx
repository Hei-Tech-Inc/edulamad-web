'use client';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { UniversityForm } from '@/components/admin/UniversityForm';
import { useUpdateUniversity } from '@/hooks/institutions/useInstitutionMutations';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

function parseUniversity(raw: unknown) {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const ac = r.acronym ?? r.code;
  return {
    name: typeof r.name === 'string' ? r.name : '',
    acronym: typeof ac === 'string' ? ac : '',
    location: typeof r.location === 'string' ? r.location : '',
    type: r.type === 'private' ? ('private' as const) : ('public' as const),
    websiteUrl: typeof r.websiteUrl === 'string' ? r.websiteUrl : '',
    logoKey: typeof r.logoKey === 'string' ? r.logoKey : '',
    isActive: r.isActive !== false,
  };
}

function EditUniversityContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const update = useUpdateUniversity();

  const detailQ = useQuery({
    queryKey: ['institutions', 'university-detail', id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.universities.detail(id),
        { signal },
      );
      return data;
    },
  });

  if (!id) return <p className="text-sm text-danger">Missing id</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading…</p>;
  if (detailQ.isError || detailQ.data == null) {
    return <p className="text-sm text-danger">Could not load university.</p>;
  }

  const initial = parseUniversity(detailQ.data);

  return (
    <UniversityForm
      initial={initial}
      submitLabel="Save changes"
      onSubmit={async (v) => {
        const payload: Record<string, unknown> = {
          name: v.name,
          acronym: v.acronym,
          location: v.location,
          type: v.type,
          isActive: v.isActive,
        };
        if (v.websiteUrl.trim()) payload.websiteUrl = v.websiteUrl.trim();
        if (v.logoKey.trim()) payload.logoKey = v.logoKey.trim();
        await update.mutateAsync({ id, payload });
        await router.push('/admin/institutions');
      }}
    />
  );
}

export default function EditUniversityPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Edit university">
        <EditUniversityContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
