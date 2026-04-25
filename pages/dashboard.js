import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import Dashboard from '../components/Dashboard'
import { AbandonedQuizWidget } from '@/components/dashboard/AbandonedQuizWidget'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="mb-4">
          <AbandonedQuizWidget />
        </div>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  )
}
