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
import '../styles/globals.css'

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false },
)

// This HOC (Higher-Order Component) wraps the entire app
function AppWrapper({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
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

    // If logged in on marketing/auth entry pages, redirect (not Developer preview — that works signed in too)
    if (
      user &&
      isPublicAuthRoute(currentPath) &&
      currentPath !== '/developer/api-keys'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
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
