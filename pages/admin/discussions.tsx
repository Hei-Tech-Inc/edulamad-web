import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useDiscussionsRecentList } from '@/hooks/admin/useAdminPortalLists';

function DiscussionsBody() {
  const query = useDiscussionsRecentList();
  return (
    <AdminJsonListPage
      title="Recent discussions"
      subtitle="GET /discussions/recent"
      query={query}
      exportBaseName="discussions-recent"
    />
  );
}

export default function AdminDiscussionsPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Discussions">
        <DiscussionsBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
