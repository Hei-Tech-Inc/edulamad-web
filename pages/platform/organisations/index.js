import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import PlatformInstitutionDirectoryPage from '../../../components/platform/PlatformInstitutionDirectoryPage'

export default function PlatformOrganisationsIndex() {
  return (
    <ProtectedRoute>
      <Layout>
        <PlatformInstitutionDirectoryPage />
      </Layout>
    </ProtectedRoute>
  )
}
