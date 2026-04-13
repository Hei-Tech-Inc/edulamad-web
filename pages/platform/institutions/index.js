import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import PlatformInstitutionsPage from '../../../components/platform/PlatformInstitutionsPage'

export default function PlatformInstitutionsRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <PlatformInstitutionsPage />
      </Layout>
    </ProtectedRoute>
  )
}
