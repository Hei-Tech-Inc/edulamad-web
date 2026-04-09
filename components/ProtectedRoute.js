import { useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../store/slices/authSlice'
import { useData } from '../contexts/DataContext'
import { DataApiBanner } from './DataApiBanner'
import { usesMainSidebarLayout } from '../lib/main-layout-routes'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.auth)
  const { error: dataError, loading: dataLoading, refreshStudyRows } = useData()
  const layoutShell = usesMainSidebarLayout(router.pathname)
  const standaloneDataError = !layoutShell && dataError ? dataError : ''

  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  useEffect(() => {
    if (!loading && !user) {
      const nextPath =
        typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/dashboard'
      const q =
        nextPath !== '/login' && nextPath !== '/signup'
          ? `?next=${encodeURIComponent(nextPath)}`
          : ''
      router.push(`/login${q}`)
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-xl px-4">
          <SkeletonProfileHeader />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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
