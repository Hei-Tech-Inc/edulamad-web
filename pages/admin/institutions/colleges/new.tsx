'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CollegeForm } from '@/components/admin/CollegeDepartmentForms';
import { useCreateCollege } from '@/hooks/institutions/useInstitutionMutations';

function NewCollegeContent() {
  const router = useRouter();
  const universityId =
    typeof router.query.universityId === 'string' ? router.query.universityId : '';
  const create = useCreateCollege();

  if (!universityId) {
    return (
      <p className="text-sm text-text-muted">
        Missing <code className="font-mono">universityId</code>.{' '}
        <Link href="/admin/institutions" className="text-brand hover:underline">
          Pick a university
        </Link>{' '}
        and use &quot;Add college&quot;.
      </p>
    );
  }

  return (
    <CollegeForm
      universityId={universityId}
      submitLabel="Create college"
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        await router.push('/admin/institutions');
      }}
    />
  );
}

export default function NewCollegePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="New college">
        <NewCollegeContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
