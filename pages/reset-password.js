import { useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock } from 'lucide-react'
import { useResetPassword } from '@/hooks/auth/useAuthRecovery'
import { AppApiError } from '@/lib/api-error'
import { getMarketingBrandName } from '@/lib/landing-brand'
import AuthSplitLayout from '../components/marketing/AuthSplitLayout'

const BRAND = getMarketingBrandName()

function toMessage(err, fallback) {
  if (err instanceof AppApiError) return err.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const resetM = useResetPassword()
  const token = useMemo(
    () => (typeof router.query.token === 'string' ? router.query.token : ''),
    [router.query.token],
  )
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!token) {
      setErr('Missing reset token. Open this page from the email link.')
      return
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.')
      return
    }
    try {
      await resetM.mutateAsync({ token, password })
      setMsg('Password reset successful. You can now sign in.')
    } catch (error) {
      setErr(toMessage(error, 'Could not reset password.'))
    }
  }

  return (
    <>
      <Head>
        <title>{`Reset password — ${BRAND}`}</title>
      </Head>
      <AuthSplitLayout
        title={`Set a new ${BRAND} password`}
        subtitle="Create a secure new password to recover your account and continue learning."
        points={[
          'Use at least 8 characters',
          'Prefer a unique password you have not used elsewhere',
          'Keep your account secure with strong credentials',
          'Sign back in once reset completes',
        ]}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0b101a]/95 p-4 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">
          <Link
            href="/login"
            className="mb-3 inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>

          <div className="mb-4 text-center sm:mb-6">
            <Link href="/" className="hidden items-center gap-2 text-white sm:inline-flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="font-semibold">{BRAND}</span>
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:mt-5 sm:text-3xl">
              Reset password
            </h1>
            <p className="mt-1 text-sm text-slate-400">Choose your new account password.</p>
          </div>

          {msg ? <div className="mb-4 rounded bg-emerald-950/40 p-3 text-sm text-emerald-200">{msg}</div> : null}
          {err ? <div className="mb-4 rounded bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

          <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                New password
              </span>
              <span className="auth-input-shell group flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 transition-[border-color,box-shadow] focus-within:border-orange-400/55 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.22)] sm:h-12 sm:px-3.5">
                <Lock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-white/35 outline-none ring-0"
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
            <button
              type="submit"
              disabled={resetM.isPending}
              className="btn-primary-sweep w-full rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:py-3"
            >
              {resetM.isPending ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        </div>
      </AuthSplitLayout>
    </>
  )
}
