import ProtectedRoute from '../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { InstitutionsAdminPage } from '@/components/admin/InstitutionsAdminPage';

export default function AdminInstitutionsPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Institutions">
        <InstitutionsAdminPage />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
