// pages/users.js (Updated)
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import UserManagement from '../components/UserManagement'

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <Layout title="User management">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
            <Link
              href="/dashboard"
              className="mr-4 inline-flex items-center text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              User Management
            </h1>
          </div>

          <UserManagement />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
