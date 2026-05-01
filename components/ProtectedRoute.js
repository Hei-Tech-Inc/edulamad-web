import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { useData } from '../contexts/DataContext'
import { DataApiBanner } from './DataApiBanner'
import { usesMainSidebarLayout } from '../lib/main-layout-routes'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Guards UI until auth + hydration settle. Redirects to /login are handled only by AuthWrapper
 * in `_app.js` to avoid duplicate navigations and login/dashboard oscillation.
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const { user, loading, initialized } = useAuth()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const { error: dataError, loading: dataLoading, refreshStudyRows } = useData()
  const layoutShell = usesMainSidebarLayout(router.pathname)
  const standaloneDataError = !layoutShell && dataError ? dataError : ''

  if (!initialized || loading || !hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-xl px-4">
          <SkeletonProfileHeader />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <Fragment>
      {standaloneDataError ? (
        <DataApiBanner
          error={standaloneDataError}
          loading={dataLoading}
          onRetry={() => void refreshStudyRows()}
        />
      ) : null}
      {children}
    </Fragment>
  )
}
