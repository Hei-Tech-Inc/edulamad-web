'use client';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { DepartmentForm } from '@/components/admin/CollegeDepartmentForms';
import { useUpdateDepartment } from '@/hooks/institutions/useInstitutionMutations';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

function parseDepartment(raw: unknown) {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const cid = r.collegeId ?? r.college_id;
  return {
    id: String(r._id ?? r.id ?? ''),
    name: typeof r.name === 'string' ? r.name : '',
    code: typeof r.code === 'string' ? r.code : '',
    collegeId: typeof cid === 'string' ? cid : '',
    isActive: r.isActive !== false,
  };
}

function EditDepartmentContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const update = useUpdateDepartment();

  const detailQ = useQuery({
    queryKey: ['institutions', 'department-detail', id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.departments.detail(id),
        { signal },
      );
      return data;
    },
  });

  if (!id) return <p className="text-sm text-danger">Missing id</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading…</p>;
  if (detailQ.isError || detailQ.data == null) {
    return <p className="text-sm text-danger">Could not load department.</p>;
  }

  const parsed = parseDepartment(detailQ.data);

  return (
    <DepartmentForm
      collegeId={parsed.collegeId}
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

export default function EditDepartmentPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Edit department">
        <EditDepartmentContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
