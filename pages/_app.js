// pages/_app.js - Simplified without company registration flow

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SettingsProvider } from '../contexts/SettingsContext'
import { DataProvider } from '../contexts/DataContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { AnalyticsProvider } from '../contexts/AnalyticsContext'
import { ToastProvider } from '../components/Toast'
import { Provider } from 'react-redux'
import { store } from '../store'
import { getQueryClient } from '@/lib/query-client'
import { installAbortHandler } from '@/lib/abort-handler'
import { queryKeys } from '@/api/query-keys'
import { getSafeInternalPath } from '@/lib/safe-next-path'
import { isPublicAuthRoute } from '@/lib/public-auth-routes'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import TopLoadingBar from '@/components/ui/loading/TopLoadingBar'
import { loadingBarActions } from '@/stores/loading-bar.store'
import { useAuthStore } from '@/stores/auth.store'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'
import { AppErrorBoundary } from '@/components/providers/AppErrorBoundary'
import { PushPermissionPrompt } from '@/components/notifications/PushPermissionPrompt'
import { OneSignalInit } from '@/components/notifications/OneSignalInit'
import { OAuthSessionSync } from '@/components/auth/OAuthSessionSync'
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
  const queryClient = getQueryClient()
  const { session, ...restPageProps } = pageProps ?? {}

  useEffect(() => {
    return installAbortHandler()
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
    <SessionProvider
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Head>
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
            />
          </Head>
          {loadingBarEnabled ? <TopLoadingBar /> : null}
          <ThemeProvider>
            <SettingsProvider>
              <AuthProvider>
                <OAuthSessionSync />
                <DataProvider>
                  <ToastProvider>
                    <NotificationProvider>
                      <AnalyticsProvider>
                        <AuthWrapper>
                          <AppErrorBoundary>
                            <Component {...restPageProps} />
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
    </SessionProvider>
  )
}

// This component handles authentication redirects
function AuthWrapper({ children }) {
  const { user, initialized, loading } = useAuth()
  const router = useRouter()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  const currentPath = router.pathname
  const onOnboardingRoute = currentPath === '/onboarding'
  const onShareableQuizRoute = currentPath === '/quiz/[id]'
  const onAuthEntryRoute =
    isPublicAuthRoute(currentPath) &&
    currentPath !== '/' &&
    currentPath !== '/developer/api-keys' &&
    currentPath !== '/developer/api-reference'

  const profileGateQ = useQuery({
    queryKey: queryKeys.students.onboardingGate,
    enabled: Boolean(initialized && !loading && user),
    retry: false,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.students.meProfile, { signal })
      return data
    },
  })

  const rawProfile = profileGateQ.data && typeof profileGateQ.data === 'object' ? profileGateQ.data : null
  const asFiniteNumber = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  }
  const levelOk =
    asFiniteNumber(rawProfile?.levelData) !== null ||
    asFiniteNumber(rawProfile?.level) !== null
  const semOk =
    asFiniteNumber(rawProfile?.semesterData) !== null ||
    asFiniteNumber(rawProfile?.semester) !== null
  const profileGateReady = profileGateQ.isSuccess || profileGateQ.isError

  const onboardingComplete = Boolean(
    rawProfile?.universityId &&
      rawProfile?.deptId &&
      rawProfile?.studentCategory &&
      levelOk &&
      semOk,
  )

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!initialized || loading || !hasHydrated) return

    // If not logged in and trying to access protected route, redirect to login
    if (!user && !isPublicAuthRoute(currentPath) && !onShareableQuizRoute) {
      const nextPath =
        typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/dashboard'
      const target = `/login?next=${encodeURIComponent(nextPath)}`
      const here = router.asPath.split('#')[0]
      if (here !== target) {
        router.replace(target)
      }
    }

    if (!user) return
    // Only block on first load — background refetches must not stall login → app redirects.
    if (profileGateQ.isLoading) return

    // Fail-open: if profile gate request fails, keep users in app instead of looping them back to onboarding.
    const shouldEnforceOnboarding = profileGateQ.isSuccess && !onboardingComplete
    if (
      shouldEnforceOnboarding &&
      !onOnboardingRoute &&
      currentPath !== '/verify-email' &&
      currentPath !== '/' &&
      currentPath !== '/pricing'
    ) {
      router.push('/onboarding')
      return
    }

    // If logged in on auth entry pages, redirect to the right app destination.
    if (onAuthEntryRoute) {
      if (!profileGateReady) return
      const nextDest = currentPath === '/login' ? getSafeInternalPath(router.query.next) : null
      const dest =
        profileGateQ.isSuccess && !onboardingComplete ? '/onboarding' : nextDest || '/dashboard'
      const herePath = router.asPath.split('?')[0]
      if (herePath !== dest) {
        router.replace(dest)
      }
    }
  }, [
    user,
    initialized,
    loading,
    hasHydrated,
    currentPath,
    onOnboardingRoute,
    onShareableQuizRoute,
    onboardingComplete,
    onAuthEntryRoute,
    profileGateReady,
    profileGateQ.isSuccess,
    profileGateQ.isError,
    profileGateQ.isLoading,
    router,
    router.query.next,
  ])

  // Loading state
  if (loading || !initialized || !hasHydrated) {
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
  return (
    <>
      <OneSignalInit />
      {children}
      <PushPermissionPrompt enabled={Boolean(user && onboardingComplete && !onOnboardingRoute)} />
    </>
  )
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
