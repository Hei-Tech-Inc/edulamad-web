import { useEffect, Fragment, useRef } from 'react'
import { useRouter } from 'next/router'
import { useData } from '../contexts/DataContext'
import { DataApiBanner } from './DataApiBanner'
import { usesMainSidebarLayout } from '../lib/main-layout-routes'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const redirected = useRef(false)
  const { user, loading, initialized } = useAuth()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const { error: dataError, loading: dataLoading, refreshStudyRows } = useData()
  const layoutShell = usesMainSidebarLayout(router.pathname)
  const standaloneDataError = !layoutShell && dataError ? dataError : ''

  useEffect(() => {
    if (!initialized || loading || !hasHydrated) return
    if (!user && !redirected.current) {
      redirected.current = true
      const nextPath =
        typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/dashboard'
      const q =
        nextPath !== '/login' && nextPath !== '/signup'
          ? `?next=${encodeURIComponent(nextPath)}`
          : ''
      router.replace(`/login${q}`)
    }
  }, [initialized, loading, hasHydrated, user, router])

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
