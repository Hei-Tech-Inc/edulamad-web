import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import PlatformOrganisationDetailPage from '../../../components/platform/PlatformOrganisationDetailPage'

export default function PlatformOrganisationDetail() {
  return (
    <ProtectedRoute>
      <Layout>
        <PlatformOrganisationDetailPage />
      </Layout>
    </ProtectedRoute>
  )
}
