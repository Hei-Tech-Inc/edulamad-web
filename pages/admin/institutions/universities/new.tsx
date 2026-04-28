'use client';

import { useRouter } from 'next/router';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { UniversityForm } from '@/components/admin/UniversityForm';
import { useCreateUniversity } from '@/hooks/institutions/useInstitutionMutations';

function NewUniversityContent() {
  const router = useRouter();
  const create = useCreateUniversity();

  return (
    <UniversityForm
      submitLabel="Create university"
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
        await create.mutateAsync(payload);
        await router.push('/admin/institutions');
      }}
    />
  );
}

export default function NewUniversityPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="New university">
        <NewUniversityContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
