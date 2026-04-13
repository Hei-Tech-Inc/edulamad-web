import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, GraduationCap, Mail } from 'lucide-react'
import { useForgotPassword } from '@/hooks/auth/useAuthRecovery'
import { AppApiError } from '@/lib/api-error'
import { getMarketingBrandName } from '@/lib/landing-brand'

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
      <main className="hero-grain min-h-screen bg-[#0a0a0a] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
          <section className="w-full max-w-[420px]">
            <div className="animated-border-inner rounded-2xl bg-[#111111] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-10">
              <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>

              <div className="mb-5 text-center">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <h1 className="mt-4 text-2xl font-semibold">Reset your password</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {!sentTo ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void send()
                  }}
                  className="space-y-4"
                >
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
                    <span className="flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-full w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none"
                      />
                    </span>
                  </label>
                  {err ? <p className="text-sm text-red-300">{err}</p> : null}
                  <button
                    type="submit"
                    disabled={forgotM.isPending}
                    className="btn-primary-sweep w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {forgotM.isPending ? 'Sending...' : 'Send reset link'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Check your email</h2>
                  <p className="text-sm text-slate-400">
                    We sent a reset link to <span className="font-medium text-slate-200">{sentTo}</span>.
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
          </section>
        </div>
      </main>
    </>
  )
}
