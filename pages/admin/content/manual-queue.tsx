import ProtectedRoute from '../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useAdminManualQueueList } from '@/hooks/admin/useAdminPortalLists';

function ManualQueueBody() {
  const query = useAdminManualQueueList();
  return (
    <AdminJsonListPage
      title="Manual content queue"
      subtitle="GET /admin/content/manual-queue"
      query={query}
      exportBaseName="admin-manual-queue"
    />
  );
}

export default function AdminManualQueuePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Manual queue">
        <ManualQueueBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
