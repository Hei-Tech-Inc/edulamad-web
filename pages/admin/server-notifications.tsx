import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useAdminServerNotificationsList } from '@/hooks/admin/useAdminPortalLists';

function ServerNotificationsBody() {
  const query = useAdminServerNotificationsList();
  return (
    <AdminJsonListPage
      title="Server notifications"
      subtitle="GET /admin/notifications"
      query={query}
      exportBaseName="admin-notifications"
    />
  );
}

export default function AdminServerNotificationsPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Server notifications">
        <ServerNotificationsBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
