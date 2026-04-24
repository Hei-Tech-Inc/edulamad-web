import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

export default function ForgotPasswordPage() {
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

              <div className="space-y-4 text-center">
                <h2 className="text-lg font-semibold">Password recovery is coming soon</h2>
                <p className="text-sm text-slate-400">
                  This flow is not available yet. Please contact support if you need account access help.
                </p>
                <Link
                  href="/login"
                  className="btn-primary-sweep inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
