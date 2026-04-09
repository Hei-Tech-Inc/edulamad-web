import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import DeveloperApiKeysPage from '../../components/DeveloperApiKeysPage'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'

export default function DeveloperApiKeysRoute() {
  const { user, initialized, loading } = useAuth()

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

  return (
    <Layout>
      <DeveloperApiKeysPage />
    </Layout>
  )
}
