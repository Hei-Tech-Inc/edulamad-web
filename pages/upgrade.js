import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import UpgradePageContent from '@/components/pricing/UpgradePageContent'

export default function UpgradePage() {
  return (
    <ProtectedRoute>
      <Layout title="Upgrade">
        <UpgradePageContent />
      </Layout>
    </ProtectedRoute>
  )
}
