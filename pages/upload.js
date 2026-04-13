import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import { sessionHasAdminTools } from '@/lib/session-admin-access'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <Layout title="Upload">
        <UploadContent />
      </Layout>
    </ProtectedRoute>
  )
}

function UploadContent() {
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const canUpload = sessionHasAdminTools(sessionUser, accessToken)

  if (!canUpload) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Upload</h1>
        <p className="mt-2 text-sm text-slate-600">Only TA/admin users can upload content.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Upload content</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use admin creation tools for now while dedicated upload flow is being finalized.
      </p>
      <Link href="/dashboard?admin=create#admin-upload-bundle" className="mt-4 inline-block text-sm font-medium text-orange-700 hover:text-orange-800">
        Go to upload tools
      </Link>
    </section>
  )
}
