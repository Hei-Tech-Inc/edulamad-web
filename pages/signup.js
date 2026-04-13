// pages/signup.js — invited team members (/signup)
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import AuthSplitLayout from '../components/marketing/AuthSplitLayout'
import {
  safePosthogCapture,
  safePosthogIdentify,
} from '@/lib/safe-analytics'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

const inputClass =
  'mt-1 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUpWithEmail, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    router.replace('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query
    const raw = q.ref ?? q.referralCode ?? q.referral
    const s = Array.isArray(raw) ? raw[0] : raw
    if (typeof s === 'string' && s.trim()) {
      setReferralCode((prev) => (prev ? prev : s.trim().toUpperCase()))
    }
  }, [router.isReady, router.query])

  if (user) {
    return null
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUpWithEmail(
      email,
      password,
      fullName,
      referralCode.trim() || undefined,
    )

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      safePosthogIdentify(email, { email, name: fullName })
      safePosthogCapture('user_signed_up', {
        method: 'email',
        email,
        name: fullName,
      })
      setLoading(false)
      router.replace('/dashboard')
    }
  }

  return (
    <>
      <Head>
        <title>{`Sign up — ${BRAND}`}</title>
        <meta
          name="description"
          content={`Create your ${BRAND} account when you have an invite.`}
        />
      </Head>
      <AuthSplitLayout
        title={`Build momentum with ${BRAND}`}
        subtitle="Create your account and start focused exam prep with structured learning tools."
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-400">Enter your details below to create your account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b101a]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-500/35 bg-red-950/35 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-300"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="referralCode"
                className="block text-sm font-medium text-slate-300"
              >
                Referral code <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                autoComplete="off"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className={`${inputClass} font-mono`}
                placeholder="e.g. EDU-XXXXX"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full justify-center rounded py-3 text-sm font-semibold text-white transition ${
                loading
                  ? 'cursor-not-allowed bg-orange-300'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Need your own account first?{' '}
            <Link
              href="/register"
              className="font-medium text-orange-700 hover:text-orange-800"
            >
              Register here
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-orange-700 hover:text-orange-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  )
}
