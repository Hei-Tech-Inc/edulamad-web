import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MarketingShell from './marketing/MarketingShell'
import {
  safePosthogCapture,
  safePosthogCaptureException,
  safePosthogIdentify,
} from '@/lib/safe-analytics'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

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
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a12]'
  const fieldClass = `block w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition hover:border-white/[0.14] focus:border-orange-500/50 focus:outline-none ${focusRing}`
  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'

  return (
    <MarketingShell maxWidthClass="max-w-xl sm:max-w-lg" headerMode="auth">
      <Link
        href="/"
        className={`mb-8 inline-flex items-center text-sm font-medium text-slate-400 transition hover:text-white ${focusRing} rounded-lg`}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to home
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400/90">
          {BRAND}
        </p>
        <h1 className="mt-2 font-[Outfit,system-ui,sans-serif] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
          Full name, email, and a password (at least 8 characters). After you
          submit, you&apos;ll be signed in and taken to the dashboard.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0a0a]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="border-b border-white/[0.08] px-6 py-4 sm:px-8">
          <h2 className="font-[Outfit,system-ui,sans-serif] font-medium text-white">
            Your details
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            All fields below are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {error ? (
            <div
              className="whitespace-pre-wrap rounded-xl border border-red-500/30 bg-red-950/35 px-4 py-3 text-sm text-red-100"
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
            <label htmlFor="reg-password" className={labelClass}>
              Password <span className="text-red-400">*</span>
            </label>
            <div
              className={`flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition placeholder:text-slate-500 hover:border-white/[0.14] ${focusRing} pr-2`}
            >
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(255,92,0,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
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

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className={`font-semibold text-orange-400 transition hover:text-orange-300 ${focusRing} rounded`}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </MarketingShell>
  )
}

export default CompanyRegistrationPage
