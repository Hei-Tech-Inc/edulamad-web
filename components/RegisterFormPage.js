import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Eye, EyeOff, Gift, GraduationCap, Lock, Mail, Sparkles, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import { safePosthogCapture, safePosthogIdentify } from '@/lib/safe-analytics'
import { getMarketingBrandName } from '@/lib/landing-brand'
import AuthSplitLayout from './marketing/AuthSplitLayout'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'

const BRAND = getMarketingBrandName()

/** Matches login: single border + focus ring on shell (see `.auth-input-shell` in globals.css). */
const AUTH_INPUT_SHELL =
  'auth-input-shell group flex h-11 items-center gap-2.5 rounded-xl border border-[var(--border-default)] bg-bg-surface px-3 transition-[border-color,box-shadow] focus-within:border-orange-500/55 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] dark:focus-within:border-orange-400/55 dark:focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.22)] sm:h-12 sm:px-3.5'

const AUTH_INPUT_FIELD =
  'min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none ring-0 disabled:opacity-70'

function getStrength(password) {
  const p = password || ''
  const hasLen = p.length >= 8
  const hasUpper = /[A-Z]/.test(p)
  const hasNum = /[0-9]/.test(p)
  const hasSymbol = /[^A-Za-z0-9]/.test(p)
  if (!hasLen) return { score: 1, label: 'Weak', color: 'bg-red-500' }
  if (hasLen && !(hasNum || hasSymbol)) return { score: 2, label: 'Fair', color: 'bg-amber-500' }
  if ((hasNum || hasSymbol) && !(hasUpper && hasNum && hasSymbol)) {
    return { score: 3, label: 'Good', color: 'bg-yellow-500' }
  }
  return { score: 4, label: 'Strong', color: 'bg-emerald-500' }
}

function formatRegistrationError(regError) {
  if (!regError) return 'Registration failed'
  if (typeof regError === 'string') return regError
  const raw = (regError.message || '').trim()
  const lower = raw.toLowerCase()
  const status = regError.status
  if (
    status === 409 ||
    status === 422 ||
    /already\s+(exists|registered|taken)/i.test(raw) ||
    /email.+(already|in use|exists|registered)/i.test(lower) ||
    /duplicate/i.test(lower) ||
    (lower.includes('already') && lower.includes('email'))
  ) {
    return 'That email is already registered. Sign in with it instead, or use “Forgot password” on the login page if you need to reset access.'
  }
  const lines = [raw || 'Registration failed']
  if (Array.isArray(regError.details) && regError.details.length) {
    for (const d of regError.details) {
      const field = d.field != null ? String(d.field) : 'field'
      const msg = d.message != null ? String(d.message) : ''
      lines.push(`• ${field}: ${msg}`)
    }
  }
  return lines.join('\n')
}

export default function RegisterFormPage() {
  const router = useRouter()
  const { signUpWithEmail } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const referralCode = useMemo(() => {
    const raw = router.query.ref ?? router.query.referralCode ?? router.query.referral
    const v = Array.isArray(raw) ? raw[0] : raw
    return typeof v === 'string' && v.trim() ? v.trim().toUpperCase() : ''
  }, [router.query.ref, router.query.referralCode, router.query.referral])

  const strength = getStrength(password)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      const { error: regError } = await signUpWithEmail(
        email.trim(),
        password,
        fullName,
        (promoCode.trim() || referralCode || '').trim() || undefined,
      )
      if (regError) {
        setError(formatRegistrationError(regError))
        return
      }
      safePosthogIdentify(email.trim(), { email: email.trim(), name: fullName })
      safePosthogCapture('account_registered', { email: email.trim(), name: fullName })
      const ev = useAuthStore.getState().user?.emailVerified
      void router.replace(ev === true ? '/dashboard' : '/verify-email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplitLayout
      asideEyebrow="Start free"
      title={`Build your ${BRAND} workspace`}
      subtitle="Create an account in a minute. Past papers by course and level, timed practice, and simple progress—so you revise what loses marks, not random PDFs."
      points={[
        'Begin with free starter questions—upgrade when you need more',
        'One search across papers by school, course, and year',
        'Timed runs and weak-topic insight—revision follows the marks',
        'Space to grow with course reps and cohorts when you are ready',
      ]}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-bg-raised/95 p-4 text-text-primary shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-bg-raised/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent sm:inset-x-8"
          aria-hidden
        />

        <div className="relative">
          <div className="mb-5 text-center sm:mb-7">
            <Link
              href="/"
              className="hidden items-center justify-center gap-2 text-text-primary sm:inline-flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-400/30 bg-orange-500/10 text-orange-600 dark:text-orange-300">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="font-semibold">{BRAND}</span>
            </Link>

            <div className="mt-3 flex justify-center sm:mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/25 bg-teal-500/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-800 shadow-sm dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300">
                <Sparkles className="h-3.5 w-3.5 opacity-90" aria-hidden />
                Free to start · Starter questions
              </span>
            </div>

            <h1 className="mt-4 font-[Outfit,system-ui,sans-serif] text-2xl font-semibold tracking-tight text-text-primary sm:mt-5 sm:text-3xl">
              Create your account
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-text-secondary sm:text-[0.9375rem]">
              Practice past papers with structure—fewer WhatsApp threads and mystery files.
            </p>
          </div>

          <SocialAuthButtons className="mb-5" />

          <div className="mb-5 flex items-center gap-3 text-xs font-medium text-text-muted">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <span className="shrink-0">or register with email</span>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          {referralCode ? (
            <div className="mb-4 flex gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/[0.09] px-4 py-3 dark:border-emerald-500/25 dark:bg-emerald-950/35">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Gift className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                  You joined with an invite
                </p>
                <p className="mt-0.5 text-sm leading-snug text-emerald-900/90 dark:text-emerald-200/95">
                  Code <span className="font-mono font-semibold tracking-wide">{referralCode}</span>
                  — you&apos;ll get three extra starter questions when you join.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div
              className="mb-4 whitespace-pre-wrap rounded-xl border border-red-500/45 bg-red-500/[0.09] px-4 py-3 text-sm leading-relaxed text-red-800 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                  First name
                </span>
                <span className={AUTH_INPUT_SHELL}>
                  <User className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                  <input
                    name="given-name"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                    className={AUTH_INPUT_FIELD}
                    placeholder="First name"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Last name
                </span>
                <span className={AUTH_INPUT_SHELL}>
                  <User className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                  <input
                    name="family-name"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                    className={AUTH_INPUT_FIELD}
                    placeholder="Last name"
                  />
                </span>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Email
              </span>
              <span className={AUTH_INPUT_SHELL}>
                <Mail className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={AUTH_INPUT_FIELD}
                  placeholder="you@example.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Password
              </span>
              <span className={AUTH_INPUT_SHELL}>
                <Lock className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={AUTH_INPUT_FIELD}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  className="rounded p-1 text-text-muted transition hover:bg-bg-hover disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <div
              className="rounded-xl border border-[var(--border-subtle)] bg-bg-surface/70 px-4 py-3 dark:bg-bg-surface/40"
              aria-live="polite"
            >
              <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-text-muted">Password strength</span>
                <span
                  className={`font-semibold tabular-nums ${
                    strength.score <= 1
                      ? 'text-red-600 dark:text-red-400'
                      : strength.score <= 2
                        ? 'text-amber-700 dark:text-amber-400'
                        : strength.score <= 3
                          ? 'text-yellow-700 dark:text-yellow-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5" role="presentation">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={`h-2 rounded-full transition-colors duration-200 ${
                      n <= strength.score ? strength.color : 'bg-[var(--border-default)] dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                Use 8+ characters. Mix letters, numbers, and symbols for a stronger password.
              </p>
            </div>

            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Promo code{' '}
                  <span className="font-normal normal-case tracking-normal text-text-muted">(optional)</span>
                </span>
                <span className={AUTH_INPUT_SHELL}>
                  <Gift className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={loading}
                    className={`${AUTH_INPUT_FIELD} uppercase`}
                    placeholder="School or ambassador code"
                    autoComplete="off"
                  />
                </span>
              </label>
              <p className="mt-1.5 text-[11px] leading-relaxed text-text-muted">
                Have a code from your school or an ambassador? Enter it here—we&apos;ll apply it at signup.
              </p>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-text-muted sm:text-xs">
              By creating an account you agree to our terms of service and privacy practices.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-sweep w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 font-semibold text-white shadow-[0_8px_28px_rgba(234,88,12,0.25)] transition hover:brightness-[1.03] disabled:opacity-60 dark:from-orange-500 dark:to-amber-500"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-text-muted sm:my-6">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            or
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  )
}
