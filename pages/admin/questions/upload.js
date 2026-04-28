import ProtectedRoute from '../../../components/ProtectedRoute'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { AdminJsonQuestionUploadPage } from '@/components/admin/AdminJsonQuestionUploadPage'

export default function AdminJsonQuestionUploadRoute() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="JSON question upload">
        <AdminJsonQuestionUploadPage />
      </AdminPortalShell>
    </ProtectedRoute>
  )
}
