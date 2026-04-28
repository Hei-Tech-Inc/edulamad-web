'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CourseCatalogForm } from '@/components/admin/CourseCatalogForm';
import { useCreateCourse } from '@/hooks/institutions/useInstitutionMutations';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

function departmentDisplayName(raw: unknown): string | null {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  if (!r) return null;
  const n = r.name ?? r.title ?? r.label;
  return typeof n === 'string' && n.trim() ? n.trim() : null;
}

function NewCourseContent() {
  const router = useRouter();
  const deptId =
    typeof router.query.departmentId === 'string' ? router.query.departmentId.trim() : '';
  const create = useCreateCourse();

  const deptLabelQ = useQuery({
    queryKey: ['institutions', 'department-label', deptId],
    enabled: Boolean(deptId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.departments.detail(deptId),
        { signal },
      );
      return departmentDisplayName(data);
    },
  });

  if (!deptId) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-sm text-white/65">
        <p>
          Choose a department first. Open{' '}
          <Link href="/admin/institutions" className="font-medium text-brand hover:underline">
            Institutions
          </Link>{' '}
          and click a department to start here with the ID filled in, or pick a department on the{' '}
          <Link href="/admin/courses" className="font-medium text-brand hover:underline">
            Courses
          </Link>{' '}
          page and use <span className="font-mono text-xs text-white/80">Create course</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="rounded-xl border border-brand/25 bg-brand/[0.07] px-4 py-3 text-sm">
        <p className="text-[11px] font-semibold tracking-wider text-white/45 uppercase">
          Department
        </p>
        <p className="mt-1 font-medium text-white">
          {deptLabelQ.isLoading ? (
            <span className="text-white/55">Loading…</span>
          ) : (
            (deptLabelQ.data ?? deptId)
          )}
        </p>
        <p className="mt-2 text-xs text-white/50">
          Only the course title and optional code are required below — the department is already set.
        </p>
      </div>

      <CourseCatalogForm
        departmentId={deptId}
        submitLabel="Create course"
        onSubmit={async (payload) => {
          await create.mutateAsync(payload);
          await router.push(
            `/admin/courses?departmentId=${encodeURIComponent(payload.departmentId)}`,
          );
        }}
      />
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="New course">
        <NewCourseContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
