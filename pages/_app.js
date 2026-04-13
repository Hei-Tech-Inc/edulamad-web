// pages/_app.js - Simplified without company registration flow

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SettingsProvider } from '../contexts/SettingsContext'
import { DataProvider } from '../contexts/DataContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { AnalyticsProvider } from '../contexts/AnalyticsContext'
import { ToastProvider } from '../components/Toast'
import { Provider } from 'react-redux'
import { store } from '../store'
import { queryClient } from '@/lib/query-client'
import { subscribeAbortUnhandledRejectionSilencer } from '@/lib/abort-error'
import { queryKeys } from '@/api/query-keys'
import { getSafeInternalPath } from '@/lib/safe-next-path'
import { isPublicAuthRoute } from '@/lib/public-auth-routes'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import TopLoadingBar from '@/components/ui/loading/TopLoadingBar'
import { loadingBarActions } from '@/stores/loading-bar.store'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'
import { AppErrorBoundary } from '@/components/providers/AppErrorBoundary'
import '../styles/globals.css'

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false },
)

// This HOC (Higher-Order Component) wraps the entire app
function AppWrapper({ Component, pageProps }) {
  const router = useRouter()
  const loadingBarEnabled = process.env.NEXT_PUBLIC_ENABLE_TOP_LOADING_BAR === '1'

  useEffect(() => {
    return subscribeAbortUnhandledRejectionSilencer()
  }, [])

  useEffect(() => {
    // Dev/runtime stability: stale localhost service workers can serve old chunks
    // and cause odd UI behavior (including unresponsive controlled inputs).
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV !== 'development') return
    if (!('serviceWorker' in navigator)) return
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return

    void navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        void reg.unregister()
      })
    })
  }, [])

  useEffect(() => {
    if (!loadingBarEnabled) return undefined
    const handleStart = () => loadingBarActions.start()
    const handleDone = () => loadingBarActions.done()
    const handleError = () => loadingBarActions.error()
    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleDone)
    router.events.on('routeChangeError', handleError)
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleDone)
      router.events.off('routeChangeError', handleError)
    }
  }, [router.events, loadingBarEnabled])

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {loadingBarEnabled ? <TopLoadingBar /> : null}
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <DataProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <AnalyticsProvider>
                      <AuthWrapper>
                        <AppErrorBoundary>
                          <Component {...pageProps} />
                        </AppErrorBoundary>
                      </AuthWrapper>
                    </AnalyticsProvider>
                  </NotificationProvider>
                </ToastProvider>
              </DataProvider>
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </Provider>
  )
}

// This component handles authentication redirects
function AuthWrapper({ children }) {
  const { user, initialized, loading } = useAuth()
  const router = useRouter()

  const currentPath = router.pathname
  const onOnboardingRoute = currentPath === '/onboarding'
  const onAuthEntryRoute =
    isPublicAuthRoute(currentPath) &&
    currentPath !== '/' &&
    currentPath !== '/developer/api-keys' &&
    currentPath !== '/developer/api-reference'

  const profileGateQ = useQuery({
    queryKey: queryKeys.students.onboardingGate,
    enabled: Boolean(initialized && !loading && user),
    retry: false,
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.students.meProfile, { signal })
      return data
    },
  })

  const rawProfile = profileGateQ.data && typeof profileGateQ.data === 'object' ? profileGateQ.data : null
  const levelOk =
    typeof rawProfile?.levelData === 'number'
      ? Number.isFinite(rawProfile.levelData)
      : typeof rawProfile?.level === 'number' && Number.isFinite(rawProfile.level)
  const semOk =
    typeof rawProfile?.semesterData === 'number'
      ? Number.isFinite(rawProfile.semesterData)
      : typeof rawProfile?.semester === 'number' && Number.isFinite(rawProfile.semester)

  const onboardingComplete = Boolean(
    rawProfile?.universityId &&
      rawProfile?.deptId &&
      rawProfile?.studentCategory &&
      levelOk &&
      semOk,
  )

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!initialized || loading) return

    // If not logged in and trying to access protected route, redirect to login
    if (!user && !isPublicAuthRoute(currentPath)) {
      router.push('/login')
    }

    if (!user) return
    if (profileGateQ.isLoading || profileGateQ.isFetching) return

    if (
      !onboardingComplete &&
      !onOnboardingRoute &&
      currentPath !== '/verify-email' &&
      currentPath !== '/'
    ) {
      router.push('/onboarding')
      return
    }

    // If logged in on auth entry pages, redirect to the right app destination.
    if (onAuthEntryRoute) {
      const nextDest = currentPath === '/login' ? getSafeInternalPath(router.query.next) : null
      const dest = onboardingComplete ? nextDest || '/dashboard' : '/onboarding'
      router.push(dest)
    }
  }, [
    user,
    initialized,
    loading,
    currentPath,
    onOnboardingRoute,
    onboardingComplete,
    onAuthEntryRoute,
    profileGateQ.isLoading,
    profileGateQ.isFetching,
    router,
    router.query.next,
  ])

  // Loading state
  if (loading || !initialized) {
    // Show loading indicator only for protected routes
    if (!isPublicAuthRoute(currentPath)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-xl px-4">
            <SkeletonProfileHeader />
          </div>
        </div>
      )
    }
  }

  // Render children
  return children
}

// Configure static page generation
AppWrapper.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {}

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx)
  }

  return { pageProps }
}

export default AppWrapper
