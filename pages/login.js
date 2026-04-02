// pages/login.js
import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MarketingShell from '../components/marketing/MarketingShell'

const inputClass =
  'mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-400/20'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithEmail, signInWithGoogle, user } = useAuth()
  const router = useRouter()

  if (user) {
    router.push('/dashboard')
    return null
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signInWithEmail(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    await signInWithGoogle()
  }

  return (
    <>
      <Head>
        <title>Sign in — Nsuo</title>
      </Head>
      <MarketingShell maxWidthClass="max-w-md">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm font-medium text-teal-300/90 transition hover:text-teal-200"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Nsuo home
      </Link>

      <div className="mb-8 text-center">
        <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-white">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Access your organisation workspace
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/35 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239V12.5H19.5C19.1,16.311 15.7,19 12,19C7.7,19 4.1,15.4 4.1,11.1C4.1,6.8 7.7,3.2 12,3.2C14.2,3.2 16.1,4.1 17.5,5.5L19.14,3.86C17.34,2.06 14.84,1 12,1C6.48,1 2,5.48 2,11C2,16.52 6.48,21 12,21C17.52,21 22,16.52 22,11C22,10.74 21.988,10.483 21.964,10.23L12.545,10.239Z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-slate-900/80 px-2 text-slate-500">
                Or email
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/25 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleEmailLogin}>
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <label className="flex cursor-pointer items-center gap-2 text-slate-400">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-slate-950/50 text-teal-500 focus:ring-teal-400/30"
                />
                Remember me
              </label>
              <span className="text-slate-600">
                Forgot password? Contact your admin.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full justify-center rounded-xl py-3 text-sm font-semibold text-slate-950 transition ${
                loading
                  ? 'cursor-not-allowed bg-teal-400/50'
                  : 'bg-gradient-to-r from-teal-400 to-cyan-500 hover:brightness-105'
              }`}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New organisation?{' '}
            <Link
              href="/register-company"
              className="font-medium text-teal-300 hover:text-teal-200"
            >
              Create organisation
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Team member?{' '}
            <Link
              href="/signup"
              className="font-medium text-teal-300 hover:text-teal-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </MarketingShell>
    </>
  )
}
