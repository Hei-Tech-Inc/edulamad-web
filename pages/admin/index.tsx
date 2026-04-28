import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminOverview } from '@/components/admin/AdminOverview';

export default function AdminHomePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Overview">
        <AdminOverview />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
