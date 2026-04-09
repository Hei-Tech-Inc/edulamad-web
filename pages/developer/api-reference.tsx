import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import OpenApiReference from '../../components/developer/OpenApiReference'
import spec from '../../contexts/api-docs.json'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'

export default function DeveloperApiReferenceRoute() {
  const { user, initialized, loading } = useAuth()

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="w-full max-w-xl px-4">
          <SkeletonProfileHeader />
        </div>
      </div>
    )
  }

  if (!user) {
    return <OpenApiReference bundledSpec={spec} previewMode />
  }

  return (
    <Layout>
      <div className="-mx-4 -my-6 min-h-0 sm:-mx-6 lg:-mx-8 lg:-my-8">
        <OpenApiReference bundledSpec={spec} embedded />
      </div>
    </Layout>
  )
}
