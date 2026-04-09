import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, User, Lock, Eye, EyeOff, ShieldCheck, Sparkles, Quote } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthSplitLayout from './marketing/AuthSplitLayout'
import {
  safePosthogCapture,
  safePosthogCaptureException,
  safePosthogIdentify,
} from '@/lib/safe-analytics'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()
const REGISTER_QUOTES = [
  'Once you stop learning, you start dying.',
  'Learning never exhausts the mind.',
  'Small steps daily. Big results over time.',
  'The expert in anything was once a beginner.',
  'Your future is created by what you do today.',
]

function formatRegistrationError(regError) {
  if (!regError) return 'Registration failed'
  if (typeof regError === 'string') return regError
  const lines = [regError.message || 'Registration failed']
  if (Array.isArray(regError.details) && regError.details.length) {
    for (const d of regError.details) {
      const field = d.field != null ? String(d.field) : 'field'
      const msg = d.message != null ? String(d.message) : ''
      lines.push(`• ${field}: ${msg}`)
    }
  }
  return lines.join('\n')
}

const CompanyRegistrationPage = () => {
  const router = useRouter()
  const { signUpWithEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
  })

  React.useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * REGISTER_QUOTES.length))
  }, [])

  React.useEffect(() => {
    if (!router.isReady) return
    const q = router.query
    const raw = q.ref ?? q.referralCode ?? q.referral
    const s = Array.isArray(raw) ? raw[0] : raw
    if (typeof s === 'string' && s.trim()) {
      setFormData((prev) =>
        prev.referralCode ? prev : { ...prev, referralCode: s.trim().toUpperCase() },
      )
    }
  }, [router.isReady, router.query])

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % REGISTER_QUOTES.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (String(formData.password || '').length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const { error: regError } = await signUpWithEmail(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.referralCode.trim() || undefined,
      )

      if (regError) {
        setError(formatRegistrationError(regError))
        return
      }

      safePosthogIdentify(formData.email.trim(), {
        email: formData.email.trim(),
        name: formData.name.trim(),
      })
      safePosthogCapture('account_registered', {
        email: formData.email.trim(),
        name: formData.name.trim(),
      })
      router.replace('/dashboard')
    } catch (err) {
      safePosthogCaptureException(err)
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a12]'
  const fieldClass = `block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-slate-500 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${focusRing}`
  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600'

  return (
    <AuthSplitLayout
      title={`Start strong with ${BRAND}`}
      subtitle="Create your account and move from confusion to confident exam performance."
    >
      <div className="mb-8">
        <p className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-200">
          <Sparkles className="h-3.5 w-3.5" />
          Account setup
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create an account
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
          Full name, email, and a password (at least 8 characters). After you
          submit, you&apos;ll be signed in and taken to the dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            Fast onboarding
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            Secure account
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            Exam-ready tools
          </span>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
        <div className="flex items-start gap-2">
          <Quote className="mt-0.5 h-4 w-4 text-orange-300" />
          <p className="text-sm font-medium text-orange-100">
            {REGISTER_QUOTES[quoteIndex] || REGISTER_QUOTES[0]}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b101a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="border-b border-white/10 px-6 py-4 sm:px-8">
          <h2 className="font-[Outfit,system-ui,sans-serif] font-medium text-white">
            Your details
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            All fields are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {error ? (
            <div
              className="whitespace-pre-wrap rounded-xl border border-red-500/35 bg-red-950/35 px-4 py-3 text-sm text-red-100"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="reg-name" className={labelClass}>
              Full name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="h-5 w-5" aria-hidden />
              </div>
              <input
                id="reg-name"
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`${fieldClass} pl-10`}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className={labelClass}>
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="h-5 w-5" aria-hidden />
              </div>
              <input
                id="reg-email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`${fieldClass} pl-10`}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-referral" className={labelClass}>
              Referral code <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </div>
              <input
                id="reg-referral"
                type="text"
                name="referralCode"
                autoComplete="off"
                value={formData.referralCode}
                onChange={handleChange}
                className={`${fieldClass} pl-10 font-mono uppercase`}
                placeholder="e.g. EDU-XXXXX"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              If someone shared a link, their code may be filled in automatically.
            </p>
          </div>

          <div>
            <label htmlFor="reg-password" className={labelClass}>
              Password <span className="text-red-400">*</span>
            </label>
            <div className={`flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition ${focusRing} pr-2`}>
              <Lock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="min-w-0 flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                placeholder="At least 8 characters"
                minLength={8}
                required
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
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              Use at least 8 characters for stronger security.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(234,88,12,0.22)] transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className={`font-semibold text-orange-700 transition hover:text-orange-800 ${focusRing} rounded`}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  )
}

export default CompanyRegistrationPage
