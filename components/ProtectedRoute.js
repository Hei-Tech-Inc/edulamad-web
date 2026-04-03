import { useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../store/slices/authSlice'
import { useData } from '../contexts/DataContext'
import { DataApiBanner } from './DataApiBanner'
import { usesMainSidebarLayout } from '../lib/main-layout-routes'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.auth)
  const { error: dataError, loading: dataLoading, refreshCages } = useData()
  const layoutShell = usesMainSidebarLayout(router.pathname)
  const standaloneDataError = !layoutShell && dataError ? dataError : ''

  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
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
          onRetry={() => void refreshCages()}
        />
      ) : null}
      {children}
    </Fragment>
  )
}
