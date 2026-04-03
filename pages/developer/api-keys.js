import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import DeveloperApiKeysPage from '../../components/DeveloperApiKeysPage'

export default function DeveloperApiKeysRoute() {
  const { user, initialized, loading } = useAuth()

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
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
