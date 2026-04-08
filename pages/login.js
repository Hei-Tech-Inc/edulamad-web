// pages/login.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MarketingShell from '../components/marketing/MarketingShell'
import posthog from 'posthog-js'
import { getSafeInternalPath } from '@/lib/safe-next-path'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a12]'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const { signInWithEmail, user } = useAuth()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
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
    'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition placeholder:text-slate-500 hover:border-white/[0.14] ' +
    focusRing

  const motionCard = mounted && !reduceMotion

  return (
    <>
      <Head>
        <title>Sign in — {BRAND}</title>
        <meta
          name="description"
          content={`Sign in to ${BRAND} with your email and password.`}
        />
      </Head>
      <MarketingShell maxWidthClass="max-w-xl sm:max-w-2xl" headerMode="auth">
        <div className="relative">
          <div
            className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-orange-500/12 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden
          />

          <Link
            href="/"
            className={`mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white ${focusRing} rounded-lg`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            Back to home
          </Link>

          <motion.div
            initial={motionCard ? { opacity: 0, y: 16 } : false}
            animate={motionCard ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/35 bg-gradient-to-br from-orange-500/25 to-amber-500/15 text-orange-200 shadow-[0_12px_40px_rgba(255,92,0,0.18)]">
                <GraduationCap className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <h1 className="mt-5 font-[Outfit,system-ui,sans-serif] text-3xl font-bold tracking-tight text-white sm:text-[2rem] sm:leading-tight">
                Welcome back
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
                Sign in with the email and password you used when you created your {BRAND}{' '}
                account.
              </p>
              {hasReturnTo ? (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-200/95">
                  <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                  After sign-in you&apos;ll continue where you left off
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/[0.09] bg-[#0a0a0a]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-8">
              {error ? (
                <div
                  className="mb-5 flex gap-3 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-3 text-sm text-red-100"
                  role="alert"
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
                    aria-hidden
                  />
                  <p className="min-w-0 flex-1 whitespace-pre-wrap leading-snug">
                    {error}
                  </p>
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div className="grid gap-5 sm:grid-cols-2">
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
                      className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                    />
                    Keep me signed in
                  </label>
                  <span className="text-slate-600">
                    Forgot password?{' '}
                    <Link href="/forgot-password" className="text-orange-400 hover:text-orange-300">
                      Reset it
                    </Link>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(255,92,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
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

              <div className="mt-8 space-y-3 border-t border-white/[0.07] pt-6 text-center text-sm">
                <p className="text-slate-500">
                  Need an account?{' '}
                  <Link
                    href="/register"
                    className={`font-semibold text-orange-400 transition hover:text-orange-300 ${focusRing} rounded`}
                  >
                    Create account
                  </Link>
                </p>
                <p className="text-slate-500">
                  Invited as a team member?{' '}
                  <Link
                    href="/signup"
                    className={`font-semibold text-orange-400 transition hover:text-orange-300 ${focusRing} rounded`}
                  >
                    Complete signup
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </MarketingShell>
    </>
  )
}
