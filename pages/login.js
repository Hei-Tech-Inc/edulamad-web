// pages/login.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Quote,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthSplitLayout from '../components/marketing/AuthSplitLayout'
import posthog from 'posthog-js'
import { getSafeInternalPath } from '@/lib/safe-next-path'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()
const LEARNING_QUOTES = [
  'Once you stop learning, you start dying.',
  'Learning never exhausts the mind.',
  'Small steps daily. Big results over time.',
  'The expert in anything was once a beginner.',
  'Your future is created by what you do today, not tomorrow.',
  'Do not stop when you are tired. Stop when you are done.',
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a12]'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const { signInWithEmail, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * LEARNING_QUOTES.length))
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LEARNING_QUOTES.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!router.isReady || !user) return
    const dest = getSafeInternalPath(router.query.next) || '/dashboard'
    router.replace(dest)
  }, [router.isReady, user, router.query.next, router])

  if (user) {
    return null
  }

  const hasReturnTo = Boolean(getSafeInternalPath(router.query.next))

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signErr } = await signInWithEmail(email, password)

    if (signErr) {
      setError(signErr.message)
      setLoading(false)
    } else {
      posthog.identify(email, { email })
      posthog.capture('user_logged_in', { method: 'email', email })
      const dest = getSafeInternalPath(router.query.next) || '/dashboard'
      router.replace(dest)
    }
  }

  const inputShell =
    'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition hover:border-white/[0.14] ' +
    focusRing

  return (
    <>
      <Head>
        <title>Sign in — {BRAND}</title>
        <meta
          name="description"
          content={`Sign in to ${BRAND} with your email and password.`}
        />
      </Head>
      <AuthSplitLayout
        title={`Master your exams with ${BRAND}`}
        subtitle="Learn with confidence using structured practice, smarter filtering, and daily progress."
        points={[
          'Course-aligned past question library',
          'Fast filters for year, level, and type',
          'Bookmarking and quiz practice',
          'Daily streaks to stay consistent',
        ]}
      >
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Sign in with the email and password for your {BRAND} account.
          </p>
          {hasReturnTo ? (
            <p className="mt-3 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-200">
              After sign-in you&apos;ll continue where you left off
            </p>
          ) : null}
        </div>

        <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="flex items-start gap-2">
            <Quote className="mt-0.5 h-4 w-4 text-orange-300" />
            <p className="text-sm font-medium text-orange-100">
              {LEARNING_QUOTES[quoteIndex] || LEARNING_QUOTES[0]}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b101a]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
              {error ? (
                <div
                  className="mb-5 flex gap-3 rounded-xl border border-red-500/35 bg-red-950/35 px-3.5 py-3 text-sm text-red-100"
                  role="alert"
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                    aria-hidden
                  />
                  <p className="min-w-0 flex-1 whitespace-pre-wrap leading-snug">
                    {error}
                  </p>
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div className="grid gap-5 sm:grid-cols-1">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      Email
                    </label>
                    <div className={inputShell}>
                      <Mail
                        className="h-4 w-4 shrink-0 text-slate-500"
                        aria-hidden
                      />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      Password
                    </label>
                    <div className={`${inputShell} pr-2`}>
                      <Lock
                        className="h-4 w-4 shrink-0 text-slate-500"
                        aria-hidden
                      />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className={`shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-300 ${focusRing}`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-400">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 bg-white text-orange-600 focus:ring-orange-500/50"
                    />
                    Keep me signed in
                  </label>
                    <span className="text-slate-500">
                    Forgot password?{' '}
                    <Link href="/forgot-password" className="text-orange-700 hover:text-orange-800">
                      Reset it
                    </Link>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.25)] transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" strokeWidth={2.5} />
                      Sign in
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-center text-sm">
                <p className="text-slate-400">
                  Need an account?{' '}
                  <Link
                    href="/register"
                    className={`font-semibold text-orange-700 transition hover:text-orange-800 ${focusRing} rounded`}
                  >
                    Create account
                  </Link>
                </p>
                <p className="text-slate-400">
                  Invited as a team member?{' '}
                  <Link
                    href="/signup"
                    className={`font-semibold text-orange-700 transition hover:text-orange-800 ${focusRing} rounded`}
                  >
                    Complete signup
                  </Link>
                </p>
              </div>
            </div>
      </AuthSplitLayout>
    </>
  )
}
