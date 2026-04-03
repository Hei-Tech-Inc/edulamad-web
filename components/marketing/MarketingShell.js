import Head from 'next/head'
import Link from 'next/link'
import { Fish } from 'lucide-react'

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
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-base font-semibold tracking-tight text-white transition hover:text-sky-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/25 bg-gradient-to-br from-sky-500/20 to-cyan-500/10 text-sky-300 shadow-[0_4px_20px_rgba(14,165,233,0.15)]">
                <Fish className="h-4 w-4" strokeWidth={2} />
              </span>
              Nsuo
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
                    className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
                  >
                    Create organisation
                  </Link>
                </>
              ) : (
                <Link
                  href="/register"
                  className="text-sm font-medium text-slate-400 transition hover:text-white"
                >
                  New organisation?{' '}
                  <span className="text-sky-400 hover:text-sky-300">Register</span>
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
