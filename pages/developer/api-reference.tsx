import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import OpenApiReference from '../../components/developer/OpenApiReference'
import spec from '../../contexts/api-docs.json'

export default function DeveloperApiReferenceRoute() {
  const { user, initialized, loading } = useAuth()

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
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
