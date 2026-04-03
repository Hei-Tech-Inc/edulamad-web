import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import PlatformTenantDirectoryPage from '../../../components/platform/PlatformTenantDirectoryPage'

export default function PlatformOrganisationsIndex() {
  return (
    <ProtectedRoute>
      <Layout>
        <PlatformTenantDirectoryPage />
      </Layout>
    </ProtectedRoute>
  )
}
