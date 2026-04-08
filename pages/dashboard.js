import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import Dashboard from '../components/Dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  )
}
