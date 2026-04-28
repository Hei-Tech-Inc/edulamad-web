'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CourseCatalogForm } from '@/components/admin/CourseCatalogForm';
import { useCreateCourse } from '@/hooks/institutions/useInstitutionMutations';

function NewCourseContent() {
  const router = useRouter();
  const deptId =
    typeof router.query.departmentId === 'string' ? router.query.departmentId : '';
  const create = useCreateCourse();

  if (!deptId) {
    return (
      <p className="text-sm text-text-muted">
        Pass <code className="font-mono">?departmentId=</code> or open from{' '}
        <Link href="/admin/courses" className="text-brand hover:underline">
          Courses
        </Link>{' '}
        after selecting a department.
      </p>
    );
  }

  return (
    <CourseCatalogForm
      departmentId={deptId}
      submitLabel="Create course"
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        await router.push('/admin/courses');
      }}
    />
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
