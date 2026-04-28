'use client';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CourseCatalogForm } from '@/components/admin/CourseCatalogForm';
import { useUpdateCourse } from '@/hooks/institutions/useInstitutionMutations';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

function parseCourse(raw: unknown) {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const did = r.deptId ?? r.departmentId ?? r.department_id;
  return {
    name: typeof r.name === 'string' ? r.name : '',
    code: typeof r.code === 'string' ? r.code : '',
    deptId: typeof did === 'string' ? did : '',
    isActive: r.isActive !== false,
  };
}

function EditCourseContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const update = useUpdateCourse();

  const detailQ = useQuery({
    queryKey: ['institutions', 'course-detail', id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.courses.detail(id),
        { signal },
      );
      return data;
    },
  });

  if (!id) return <p className="text-sm text-danger">Missing id</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading…</p>;
  if (detailQ.isError || detailQ.data == null) {
    return <p className="text-sm text-danger">Could not load course.</p>;
  }

  const parsed = parseCourse(detailQ.data);
  if (!parsed.deptId) {
    return (
      <p className="text-sm text-danger">
        Course response did not include a department id — cannot edit safely.
      </p>
    );
  }

  return (
    <CourseCatalogForm
      departmentId={parsed.deptId}
      initial={{
        id,
        name: parsed.name,
        code: parsed.code,
        isActive: parsed.isActive,
      }}
      submitLabel="Save changes"
      onSubmit={async (payload) => {
        await update.mutateAsync({
          id,
          payload: {
            name: payload.name,
            ...(payload.code !== undefined && payload.code !== ''
              ? { code: payload.code }
              : {}),
            isActive: payload.isActive,
          },
        });
        await router.push('/admin/courses');
      }}
    />
  );
}

export default function EditCoursePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Edit course">
        <EditCourseContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
