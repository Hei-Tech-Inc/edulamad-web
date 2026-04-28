import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useTaUploadQueueList } from '@/hooks/admin/useAdminPortalLists';

function TaQueueBody() {
  const query = useTaUploadQueueList();
  return (
    <AdminJsonListPage
      title="TA upload queue"
      subtitle="GET /ta/upload-queue"
      query={query}
      exportBaseName="ta-upload-queue"
    />
  );
}

export default function AdminTaUploadQueuePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="TA upload queue">
        <TaQueueBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
