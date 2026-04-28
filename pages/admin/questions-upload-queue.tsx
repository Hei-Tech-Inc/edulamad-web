import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useQuestionsUploadQueueList } from '@/hooks/admin/useAdminPortalLists';

function QuestionsQueueBody() {
  const query = useQuestionsUploadQueueList();
  return (
    <AdminJsonListPage
      title="Questions upload queue"
      subtitle="GET /questions/upload-queue"
      query={query}
      exportBaseName="questions-upload-queue"
    />
  );
}

export default function AdminQuestionsUploadQueuePage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Questions upload queue">
        <QuestionsQueueBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
