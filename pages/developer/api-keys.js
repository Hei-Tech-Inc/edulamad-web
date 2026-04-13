import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import DeveloperApiKeysPage from '../../components/DeveloperApiKeysPage'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'

export default function DeveloperApiKeysRoute() {
  const { user, initialized, loading } = useAuth()
  const router = useRouter()
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!initialized || loading || !user) return
    if (!sessionHasAdminTools(sessionUser, accessToken)) {
      void router.replace('/dashboard')
    }
  }, [initialized, loading, user, sessionUser, accessToken, router])

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1020]">
        <div className="w-full max-w-xl px-4">
          <SkeletonProfileHeader />
        </div>
      </div>
    )
  }

  if (!user) {
    return <DeveloperApiKeysPage previewMode />
  }

  if (!sessionHasAdminTools(sessionUser, accessToken)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1020]">
        <div className="w-full max-w-xl px-4">
          <SkeletonProfileHeader />
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <DeveloperApiKeysPage />
    </Layout>
  )
}
