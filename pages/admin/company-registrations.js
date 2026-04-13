// pages/admin/company-registrations.js
import React from 'react'
import AdminCompanyRegistrationsPage from '../../components/AdminCompanyRegistrationsPage'
import Layout from '../../components/Layout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'

export default function AdminRegistrationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = sessionHasAdminTools(sessionUser, accessToken)

  React.useEffect(() => {
    if (loading) return
    if (!user) {
      void router.replace('/login')
      return
    }
    if (!isAdmin) {
      void router.replace('/dashboard')
    }
  }, [user, loading, isAdmin, router])

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Registration info — Admin</title>
        <meta
          name="description"
          content="How account registration works on this deployment"
        />
      </Head>
      <Layout title="Registration">
        <AdminCompanyRegistrationsPage />
      </Layout>
    </>
  )
}
