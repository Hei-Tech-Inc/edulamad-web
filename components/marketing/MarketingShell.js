import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

/**
 * Public auth / onboarding layout — flat navy, no gradient mesh or glass stacks.
 * @param {'default' | 'auth'} [headerMode] — `auth` hides redundant “Sign in” when already on login.
 */
export default function MarketingShell({
  children,
  maxWidthClass = 'max-w-lg',
  headerMode = 'default',
}) {
  return (
    <>
      <div className="min-h-screen bg-[#050505] text-neutral-100 antialiased">
        <header className="border-b border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-base font-semibold tracking-tight text-white transition hover:text-sky-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/35 bg-orange-500/10 text-orange-300 shadow-[0_4px_20px_rgba(255,92,0,0.18)]">
                <GraduationCap className="h-4 w-4" strokeWidth={2} />
              </span>
              {BRAND}
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {headerMode === 'default' ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg border border-orange-500/50 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-200 transition hover:border-orange-400 hover:bg-orange-500/20"
                  >
                    Create account
                  </Link>
                </>
              ) : (
                <Link
                  href="/register"
                  className="text-sm font-medium text-slate-400 transition hover:text-white"
                >
                  New here?{' '}
                  <span className="text-orange-400 hover:text-orange-300">
                    Create account
                  </span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <div
          className={`relative mx-auto w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8 ${maxWidthClass}`}
        >
          {children}
        </div>
      </div>
    </>
  )
}
