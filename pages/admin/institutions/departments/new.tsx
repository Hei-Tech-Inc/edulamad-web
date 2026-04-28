'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { DepartmentForm } from '@/components/admin/CollegeDepartmentForms';
import { useCreateDepartment } from '@/hooks/institutions/useInstitutionMutations';

function NewDepartmentContent() {
  const router = useRouter();
  const collegeId =
    typeof router.query.collegeId === 'string' ? router.query.collegeId : '';
  const create = useCreateDepartment();

  if (!collegeId) {
    return (
      <p className="text-sm text-text-muted">
        Missing <code className="font-mono">collegeId</code>.{' '}
        <Link href="/admin/institutions" className="text-brand hover:underline">
          Open institutions
        </Link>{' '}
        and add from a college.
      </p>
    );
  }

  return (
    <DepartmentForm
      collegeId={collegeId}
      submitLabel="Create department"
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        await router.push('/admin/institutions');
      }}
    />
  );
}

export default function NewDepartmentPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="New department">
        <NewDepartmentContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
