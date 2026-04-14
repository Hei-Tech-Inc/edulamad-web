import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Eye, EyeOff, GraduationCap, Lock, Mail, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import { safePosthogCapture, safePosthogIdentify } from '@/lib/safe-analytics'
import { getMarketingBrandName } from '@/lib/landing-brand'
import AuthSplitLayout from './marketing/AuthSplitLayout'

const BRAND = getMarketingBrandName()

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
        referralCode || undefined,
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
      title={`Start your ${BRAND} journey`}
      subtitle="Create your account to practice smarter with past questions, quizzes, and focused revision."
      points={[
        'Get started in minutes with a free account',
        'Track progress across courses and topics',
        'Access guided practice and revision tools',
        'Build exam confidence with daily consistency',
      ]}
    >
      <div className="rounded-2xl border border-white/10 bg-[#0b101a]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span className="font-semibold">{BRAND}</span>
              </Link>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight">Create your account</h1>
              <p className="mt-1 text-sm text-slate-400">Start with 3 free past questions</p>
            </div>

            {referralCode ? (
              <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
                🎁 You were invited! You&apos;ll get 3 extra questions when you join.
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 whitespace-pre-wrap rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">First name</span>
                  <span className="flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-full w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none" placeholder="First name" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Last name</span>
                  <span className="flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-full w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none" placeholder="Last name" />
                  </span>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
                <span className="flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-full w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none" placeholder="you@example.com" />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Password</span>
                <span className="flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-full w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none" placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="rounded p-1 text-slate-400 hover:bg-white/10" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Password strength</span>
                  <span className="text-slate-300">{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <span key={n} className={`h-1.5 rounded-full ${n <= strength.score ? strength.color : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500">By creating an account you agree to our Terms.</p>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-sweep w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
              <div className="h-px flex-1 bg-white/10" />
              or
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-orange-300 hover:text-orange-200">
                Sign in →
              </Link>
            </p>
      </div>
    </AuthSplitLayout>
  )
}
