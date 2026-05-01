import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react'
import posthog from 'posthog-js'
import { useAuth } from '../contexts/AuthContext'
import { getSafeInternalPath } from '@/lib/safe-next-path'
import { getMarketingBrandName } from '@/lib/landing-brand'
import AuthSplitLayout from '../components/marketing/AuthSplitLayout'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'

const BRAND = getMarketingBrandName()
function mapSignInError(message) {
  const msg = String(message || '').toLowerCase()
  if (msg.includes('429')) return 'Too many attempts. Wait a minute before trying again.'
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid')) {
    return 'Invalid email or password'
  }
  return message || 'Could not sign in. Try again.'
}

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    const raw = router.query.email
    const fromQuery = typeof raw === 'string' ? raw.trim() : ''
    if (fromQuery) setEmail(fromQuery)
  }, [router.isReady, router.query.email])

  useEffect(() => {
    if (!router.isReady) return
    const raw = router.query.error
    if (typeof raw !== 'string' || !raw.trim()) return
    const code = raw.trim()
    const human =
      code === 'OAuthSignin' || code === 'OAuthCallback'
        ? 'Social sign-in failed. Confirm POST /auth/oauth/exchange on your API and OAuth env vars (NEXTAUTH_URL, GOOGLE_CLIENT_ID, NEXTAUTH_SECRET).'
        : code === 'Configuration'
          ? 'OAuth is misconfigured. Check NEXTAUTH_SECRET and provider credentials.'
          : code.toLowerCase().includes('exchange') || code.toLowerCase().includes('oauth')
            ? `Social sign-in failed: ${code}`
            : `Sign-in error: ${code}`
    setError(human)
    const { error: _omit, ...rest } = router.query
    void router.replace({ pathname: '/login', query: rest }, undefined, { shallow: true })
  }, [router, router.isReady, router.query.error])

  useEffect(() => {
    if (!router.isReady || !user) return
    const dest = getSafeInternalPath(router.query.next) || '/dashboard'
    void router.replace(dest)
  }, [router, router.isReady, router.query.next, user])

  const hasReturnTo = Boolean(getSafeInternalPath(router.query.next))
  if (user) return null

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: signErr } = await signInWithEmail(email.trim(), password)
    if (signErr) {
      setError(mapSignInError(signErr.message))
      setLoading(false)
      return
    }
    posthog.identify(email.trim(), { email: email.trim() })
    posthog.capture('user_logged_in', { method: 'email', email: email.trim() })
    const dest = getSafeInternalPath(router.query.next) || '/dashboard'
    void router.replace(dest)
  }

  return (
    <>
      <Head>
        <title>{`Sign in — ${BRAND}`}</title>
      </Head>
      <AuthSplitLayout
        title={`Welcome back to ${BRAND}`}
        subtitle="Pick up your streak, review hard topics, and see how ready you are for exams—all in one place."
        points={[
          'Past questions organised by course and level',
          'Short sessions that build a revision streak',
          'Spot weak topics and revise where it counts',
          'Continue right where you stopped',
        ]}
      >
        <div className="rounded-2xl border border-[var(--border-default)] bg-bg-raised/95 p-4 text-text-primary shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="mb-4 text-center sm:mb-6">
            <Link
              href="/"
              className="hidden items-center justify-center gap-2 text-text-primary sm:inline-flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-400/30 bg-orange-500/10 text-orange-600 dark:text-orange-300">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="font-semibold">{BRAND}</span>
            </Link>
            <h1 className="mt-2 font-[Outfit,system-ui,sans-serif] text-2xl font-semibold tracking-tight text-text-primary sm:mt-5 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-text-secondary">Sign in to continue studying</p>
            {hasReturnTo ? (
              <p className="mt-3 text-xs font-medium text-orange-700 dark:text-orange-300">
                You will continue where you left off.
              </p>
            ) : null}
          </div>

          <SocialAuthButtons className="mb-5" />

          <div className="mb-5 flex items-center gap-3 text-xs font-medium text-text-muted">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <span className="shrink-0">or use email</span>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Email
                  </span>
                  <span className="auth-input-shell group flex h-11 items-center gap-2.5 rounded-xl border border-[var(--border-default)] bg-bg-surface px-3 transition-[border-color,box-shadow] focus-within:border-orange-500/55 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] dark:focus-within:border-orange-400/55 dark:focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.22)] sm:h-12 sm:px-3.5">
                    <Mail className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      placeholder="you@example.com"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none ring-0 disabled:opacity-70"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Password
                  </span>
                  <span
                    className={`auth-input-shell group flex h-11 items-center gap-2.5 rounded-xl border bg-bg-surface px-3 transition-[border-color,box-shadow] sm:h-12 sm:px-3.5 ${
                      error
                        ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)] dark:border-red-500'
                        : 'border-[var(--border-default)] focus-within:border-orange-500/55 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] dark:focus-within:border-orange-400/55 dark:focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.22)]'
                    }`}
                  >
                    <Lock className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="••••••••"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none ring-0 disabled:opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="rounded p-1 text-text-muted transition hover:bg-bg-hover"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                {error ? (
                  <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-300" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                ) : null}

                <div className="text-right text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-text-secondary transition hover:text-orange-600 dark:hover:text-orange-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-sweep w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 font-semibold text-white shadow-[0_8px_28px_rgba(234,88,12,0.25)] disabled:opacity-60 dark:from-orange-500 dark:to-amber-500"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
          </form>

          <div className="my-3 flex items-center gap-3 text-xs text-text-muted sm:my-5">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            or
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          <p className="text-center text-sm text-text-secondary">
            <Link
              href="/register"
              className="font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Create a free account →
            </Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  )
}
