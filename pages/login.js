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
        subtitle="Sign in to continue your practice streak, review difficult topics, and track exam-readiness."
        points={[
          'Practice with past questions by course and level',
          'Keep streaks with focused daily revision',
          'Track weak topics and improve faster',
          'Continue exactly where you left off',
        ]}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0b101a]/95 p-4 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="mb-4 text-center sm:mb-6">
            <Link href="/" className="hidden items-center gap-2 text-white sm:inline-flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="font-semibold">{BRAND}</span>
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:mt-5 sm:text-3xl">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to continue studying</p>
            {hasReturnTo ? (
              <p className="mt-3 text-xs text-orange-300">You will continue where you left off.</p>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </span>
                  <span className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 sm:h-12">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      placeholder="you@example.com"
                      className="h-full w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none disabled:opacity-70"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Password
                  </span>
                  <span className={`flex h-11 items-center gap-2 rounded-lg border bg-white/[0.06] px-3 sm:h-12 ${error ? 'border-red-500' : 'border-white/10'}`}>
                    <Lock className="h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="••••••••"
                      className="h-full w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none disabled:opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="rounded p-1 text-slate-400 hover:bg-white/10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                {error ? (
                  <p className="flex items-center gap-2 text-sm text-red-300" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                ) : null}

                <div className="text-right text-sm">
                  <span className="text-slate-400">Password recovery coming soon</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-sweep w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
          </form>

          <div className="my-3 flex items-center gap-3 text-xs text-slate-500 sm:my-5">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-300">
            <Link href="/register" className="font-semibold text-orange-300 hover:text-orange-200">
              Create a free account →
            </Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  )
}
