import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useGamificationLeaderboardList } from '@/hooks/admin/useAdminPortalLists';

function LeaderboardBody() {
  const query = useGamificationLeaderboardList();
  return (
    <AdminJsonListPage
      title="Leaderboard"
      subtitle="GET /gamification/leaderboard"
      query={query}
      exportBaseName="gamification-leaderboard"
    />
  );
}

export default function AdminLeaderboardPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Leaderboard">
        <LeaderboardBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
