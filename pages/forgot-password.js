import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, GraduationCap, Mail } from 'lucide-react'
import { useForgotPassword } from '@/hooks/auth/useAuthRecovery'
import { AppApiError } from '@/lib/api-error'
import { getMarketingBrandName } from '@/lib/landing-brand'
import AuthSplitLayout from '../components/marketing/AuthSplitLayout'

const BRAND = getMarketingBrandName()

function toMessage(err, fallback) {
  if (err instanceof AppApiError) return err.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function ForgotPasswordPage() {
  const forgotM = useForgotPassword()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [err, setErr] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const send = async () => {
    setErr('')
    try {
      const target = email.trim()
      await forgotM.mutateAsync(target)
      setSentTo(target)
      setCooldown(30)
    } catch (error) {
      setErr(toMessage(error, 'Could not request password reset.'))
    }
  }

  return (
    <>
      <Head>
        <title>{`Reset your password — ${BRAND}`}</title>
      </Head>
      <AuthSplitLayout
        title={`Recover your ${BRAND} account`}
        subtitle="Enter your account email and we will send a password reset link."
        points={[
          'Use the same email you used to sign up',
          'Reset link expires for your security',
          'Choose a new password with at least 8 characters',
          'Return to studying in minutes',
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
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter your email and we&apos;ll send a reset link.
            </p>
          </div>

          {!sentTo ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void send()
              }}
              className="space-y-3 sm:space-y-4"
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </span>
                <span className="auth-input-shell group flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 transition-[border-color,box-shadow] focus-within:border-orange-400/55 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.22)] sm:h-12 sm:px-3.5">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-white/35 outline-none ring-0"
                  />
                </span>
              </label>

              {err ? <p className="text-sm text-red-300">{err}</p> : null}

              <button
                type="submit"
                disabled={forgotM.isPending}
                className="btn-primary-sweep w-full rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60 sm:py-3"
              >
                {forgotM.isPending ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-center sm:space-y-4">
              <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Check your email</h2>
              <p className="text-sm text-slate-400">
                If the email exists, we sent a reset link to{' '}
                <span className="font-medium text-slate-200">{sentTo}</span>.
              </p>
              <button
                type="button"
                onClick={() => void send()}
                disabled={cooldown > 0 || forgotM.isPending}
                className="text-sm font-medium text-orange-300 disabled:opacity-60"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't get it? Resend →"}
              </button>
            </div>
          )}
        </div>
      </AuthSplitLayout>
    </>
  )
}
