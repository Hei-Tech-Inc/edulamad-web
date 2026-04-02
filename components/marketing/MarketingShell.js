import Head from 'next/head'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

/**
 * Shared layout for public onboarding / auth surfaces — matches LandingPage aesthetic.
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div
        className="min-h-screen text-slate-100"
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          background:
            'radial-gradient(1000px 500px at 15% -5%, rgba(45,212,191,0.1), transparent 50%), radial-gradient(800px 480px at 95% 10%, rgba(96,165,250,0.08), transparent 45%), linear-gradient(180deg, #070b14 0%, #0c1222 40%, #0a1628 100%)',
        }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
            mixBlendMode: 'overlay',
          }}
          aria-hidden
        />

        <header className="relative z-10 border-b border-white/5 bg-[#070b14]/75 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-[#051016] shadow-lg shadow-teal-900/40">
                <Sparkles className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="font-['Fraunces',serif] text-xl font-semibold">
                Nsuo
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register-company"
                className="rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-900/25 transition hover:brightness-105"
              >
                Create organisation
              </Link>
            </div>
          </div>
        </header>

        <div
          className={`relative z-10 mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 ${maxWidthClass}`}
        >
          {children}
        </div>
      </div>
    </>
  )
}
