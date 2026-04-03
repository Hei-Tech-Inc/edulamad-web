import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import PlatformTenantsPage from '../../../components/platform/PlatformTenantsPage'

export default function PlatformTenants() {
  return (
    <ProtectedRoute>
      <Layout>
        <PlatformTenantsPage />
      </Layout>
    </ProtectedRoute>
  )
}
