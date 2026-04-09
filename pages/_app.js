// pages/_app.js - Simplified without company registration flow

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { QueryClientProvider } from '@tanstack/react-query'
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
import { getSafeInternalPath } from '@/lib/safe-next-path'
import { isPublicAuthRoute } from '@/lib/public-auth-routes'
import TopLoadingBar from '@/components/ui/loading/TopLoadingBar'
import { loadingBarActions } from '@/stores/loading-bar.store'
import { SkeletonProfileHeader } from '@/components/ui/skeleton'
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
                        <Component {...pageProps} />
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

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!initialized || loading) return

    // If not logged in and trying to access protected route, redirect to login
    if (!user && !isPublicAuthRoute(currentPath)) {
      router.push('/login')
    }

    // If logged in on auth entry pages, redirect to app (home `/` stays marketing for everyone)
    if (
      user &&
      isPublicAuthRoute(currentPath) &&
      currentPath !== '/' &&
      currentPath !== '/developer/api-keys' &&
      currentPath !== '/developer/api-reference'
    ) {
      const dest =
        currentPath === '/login'
          ? getSafeInternalPath(router.query.next) || '/dashboard'
          : '/dashboard'
      router.push(dest)
    }
  }, [user, initialized, loading, currentPath, router, router.query.next])

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
