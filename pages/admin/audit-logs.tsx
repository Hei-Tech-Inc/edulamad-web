import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useAuditLogsList } from '@/hooks/admin/useAdminPortalLists';

function AuditLogsBody() {
  const query = useAuditLogsList();
  return (
    <AdminJsonListPage
      title="Audit logs"
      subtitle="GET /audit-logs"
      query={query}
      exportBaseName="audit-logs"
    />
  );
}

export default function AdminAuditLogsPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Audit logs">
        <AuditLogsBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
