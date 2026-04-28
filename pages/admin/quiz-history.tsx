import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useQuizHistoryList } from '@/hooks/admin/useAdminPortalLists';

function QuizHistoryBody() {
  const query = useQuizHistoryList();
  return (
    <AdminJsonListPage
      title="Quiz history"
      subtitle="Quiz attempts for the signed-in user (GET /quiz/history). Not a global admin feed unless the API scopes it."
      query={query}
      exportBaseName="quiz-history"
    />
  );
}

export default function AdminQuizHistoryPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Quiz history">
        <QuizHistoryBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
