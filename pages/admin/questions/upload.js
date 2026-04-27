import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import { AdminJsonQuestionUploadPage } from '@/components/admin/AdminJsonQuestionUploadPage'

export default function AdminJsonQuestionUploadRoute() {
  return (
    <ProtectedRoute>
      <Layout title="JSON question upload">
        <AdminJsonQuestionUploadPage />
      </Layout>
    </ProtectedRoute>
  )
}
