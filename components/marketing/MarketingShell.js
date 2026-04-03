import Head from 'next/head'
import Link from 'next/link'
import { Fish } from 'lucide-react'

/**
 * Public auth / onboarding layout — flat navy, no gradient mesh or glass stacks.
 */
export default function MarketingShell({ children, maxWidthClass = 'max-w-lg' }) {
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
        <header className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-base font-semibold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded border border-slate-700 bg-slate-900 text-sky-400">
                <Fish className="h-4 w-4" strokeWidth={2} />
              </span>
              Nsuo
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register-company"
                className="rounded bg-sky-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Create organisation
              </Link>
            </div>
          </div>
        </header>

        <div
          className={`mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 ${maxWidthClass}`}
        >
          {children}
        </div>
      </div>
    </>
  )
}
