import ProtectedRoute from '../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { AdminJsonListPage } from '@/components/admin/AdminJsonListPage';
import { useAdminPromoCodesList } from '@/hooks/admin/useAdminPortalLists';

function PromoCodesBody() {
  const query = useAdminPromoCodesList();
  return (
    <AdminJsonListPage
      title="Promo codes"
      subtitle="Administrative promo codes from GET /admin/promo/codes."
      query={query}
      exportBaseName="admin-promo-codes"
    />
  );
}

export default function AdminPromoCodesPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Promo codes">
        <PromoCodesBody />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
