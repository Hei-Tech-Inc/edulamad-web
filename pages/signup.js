// pages/signup.js — invited team members (/signup)
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MarketingShell from '../components/marketing/MarketingShell'
import {
  safePosthogCapture,
  safePosthogIdentify,
} from '@/lib/safe-analytics'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

const inputClass =
  'mt-1 block w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUpWithEmail, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    router.replace('/dashboard')
  }, [user, router])

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
        <title>Sign up — {BRAND}</title>
        <meta
          name="description"
          content={`Create your ${BRAND} account when you have an invite.`}
        />
      </Head>
      <MarketingShell maxWidthClass="max-w-md" headerMode="auth">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {BRAND} home
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            For people joining with an invite link or code
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-8">
          {error ? (
            <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-200">
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
                  ? 'cursor-not-allowed bg-sky-900/50'
                  : 'bg-sky-700 hover:bg-sky-800'
              }`}
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need your own account first?{' '}
            <Link
              href="/register"
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              Register here
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </MarketingShell>
    </>
  )
}
