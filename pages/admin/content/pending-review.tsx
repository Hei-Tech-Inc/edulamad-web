import ProtectedRoute from '../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useContentPendingReviewList } from '@/hooks/admin/useAdminPortalLists';

function PendingReviewBody() {
  const query = useContentPendingReviewList();
  return (
    <AdminJsonListPage
      title="Questions pending review"
      subtitle="GET /content/questions/pending-review"
      query={query}
      exportBaseName="questions-pending-review"
    />
  );
}

export default function AdminPendingReviewPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Pending review">
        <PendingReviewBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
