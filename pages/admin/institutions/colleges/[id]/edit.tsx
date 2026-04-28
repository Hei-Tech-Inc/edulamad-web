'use client';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CollegeForm } from '@/components/admin/CollegeDepartmentForms';
import { useUpdateCollege } from '@/hooks/institutions/useInstitutionMutations';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

function parseCollege(raw: unknown) {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const uid = r.universityId ?? r.university_id;
  return {
    id: String(r._id ?? r.id ?? ''),
    name: typeof r.name === 'string' ? r.name : '',
    code: typeof r.code === 'string' ? r.code : '',
    universityId: typeof uid === 'string' ? uid : '',
    isActive: r.isActive !== false,
  };
}

function EditCollegeContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const update = useUpdateCollege();

  const detailQ = useQuery({
    queryKey: ['institutions', 'college-detail', id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.colleges.detail(id),
        { signal },
      );
      return data;
    },
  });

  if (!id) return <p className="text-sm text-danger">Missing id</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading…</p>;
  if (detailQ.isError || detailQ.data == null) {
    return <p className="text-sm text-danger">Could not load college.</p>;
  }

  const parsed = parseCollege(detailQ.data);
  if (!parsed.universityId) {
    return (
      <p className="text-sm text-danger">
        College response did not include universityId — cannot edit from this screen.
      </p>
    );
  }

  return (
    <CollegeForm
      universityId={parsed.universityId}
      initial={{
        id: parsed.id,
        name: parsed.name,
        code: parsed.code,
        isActive: parsed.isActive,
      }}
      submitLabel="Save changes"
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, payload });
        await router.push('/admin/institutions');
      }}
    />
  );
}

export default function EditCollegePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Edit college">
        <EditCollegeContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
