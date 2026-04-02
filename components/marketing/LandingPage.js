import Link from 'next/link'
import Head from 'next/head'
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  LineChart,
  Shield,
  Sparkles,
  Users,
  Waves,
} from 'lucide-react'

const steps = [
  {
    n: '01',
    title: 'Create your organisation',
    body: 'Register as the owner. Your workspace, data model, and permissions are provisioned automatically.',
  },
  {
    n: '02',
    title: 'Confirm & secure access',
    body: 'Verify email, set roles, and keep a clear audit trail from day one — built for regulated, multi-site ops.',
  },
  {
    n: '03',
    title: 'Model production',
    body: 'Add farms, ponds, cages, and cycles. Daily records, weights, and harvests connect into one timeline.',
  },
  {
    n: '04',
    title: 'Run with your team',
    body: 'Invite operators and managers. Everyone works against the same live numbers — not scattered spreadsheets.',
  },
]

const highlights = [
  {
    icon: Waves,
    title: 'Units & water',
    copy: 'Earthen ponds, cages, tanks — track area, status, and operational history per unit.',
  },
  {
    icon: LineChart,
    title: 'Growth & performance',
    copy: 'Daily logs, sampling, FCR, and biomass signals so you decide when to feed, sample, or harvest.',
  },
  {
    icon: ClipboardCheck,
    title: 'Approvals',
    copy: 'Stock cycles and sensitive moves can flow through review — fewer mistakes, clearer accountability.',
  },
  {
    icon: Shield,
    title: 'Enterprise-ready',
    copy: 'Organisations, roles, API access, and audit logs designed for teams that scale beyond one farm.',
  },
]

export default function LandingPage() {
  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="min-h-screen text-slate-100 selection:bg-teal-500/30 selection:text-white"
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          background:
            'radial-gradient(1200px 600px at 10% -10%, rgba(45,212,191,0.12), transparent 50%), radial-gradient(900px 500px at 90% 0%, rgba(96,165,250,0.10), transparent 45%), linear-gradient(180deg, #070b14 0%, #0c1222 35%, #0a1628 100%)',
        }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
            mixBlendMode: 'overlay',
          }}
          aria-hidden
        />

        <header className="relative z-10 border-b border-white/5 bg-[#070b14]/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-[#051016] shadow-lg shadow-teal-900/40">
                <Sparkles className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="font-['Fraunces',serif] text-xl font-semibold">
                Nsuo
              </span>
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
              <a href="#product" className="transition hover:text-white">
                Product
              </a>
              <a href="#onboarding" className="transition hover:text-white">
                Onboarding
              </a>
              <a href="#platform" className="transition hover:text-white">
                Platform
              </a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white sm:px-4"
              >
                Sign in
              </Link>
              <Link
                href="/register-company"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-900/30 transition hover:brightness-105 sm:px-4"
              >
                Create organisation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-teal-200/90">
                <Building2 className="h-3.5 w-3.5" />
                Multi-tenant SaaS for aquaculture
              </p>
              <h1
                className="font-['Fraunces',serif] text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Operate every farm like it&apos;s{' '}
                <span className="bg-gradient-to-r from-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  one disciplined system
                </span>
                .
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                Nsuo brings organisations, sites, production units, and field
                data into a single operations layer — from stocking through
                daily work to harvest and audit.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register-company"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-xl shadow-black/20 transition hover:bg-slate-100"
                >
                  Start company onboarding
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
                >
                  Sign in to your workspace
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Invited as a team member?{' '}
                <Link
                  href="/signup"
                  className="font-medium text-teal-300 underline-offset-2 hover:text-teal-200 hover:underline"
                >
                  Accept invitation or create account
                </Link>
              </p>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-3">
              {[
                { k: 'Organisations', v: 'Isolated tenants & roles' },
                { k: 'Operations', v: 'Units, cycles, approvals' },
                { k: 'Evidence', v: 'Records export & audit trail' },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-teal-200/80">
                    {item.k}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{item.v}</div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="product"
            className="border-t border-white/5 bg-black/20 py-20"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h2
                  className="font-['Fraunces',serif] text-3xl font-semibold text-white sm:text-4xl"
                >
                  Built for production, not slide decks
                </h2>
                <p className="mt-4 text-slate-400">
                  A coherent model for how real aquaculture teams work — daily
                  discipline upstream, reporting and accountability downstream.
                </p>
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map(({ icon: Icon, title, copy }) => (
                  <div
                    key={title}
                    className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 transition hover:border-teal-400/25"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="onboarding" className="py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl">
                  <h2
                    className="font-['Fraunces',serif] text-3xl font-semibold text-white sm:text-4xl"
                  >
                    Company onboarding, explained
                  </h2>
                  <p className="mt-4 text-slate-400">
                    From first signup to first harvest entry — a straight path
                    your team can repeat for every new site.
                  </p>
                </div>
                <Link
                  href="/register-company"
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-teal-400/40 bg-teal-400/10 px-5 py-2.5 text-sm font-semibold text-teal-100 transition hover:bg-teal-400/15 lg:self-auto"
                >
                  <Users className="h-4 w-4" />
                  Begin registration
                </Link>
              </div>
              <ol className="mt-14 grid gap-6 md:grid-cols-2">
                {steps.map((s, i) => (
                  <li
                    key={s.n}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1629]/80 p-8"
                  >
                    <div className="absolute -right-6 -top-6 font-['Fraunces',serif] text-8xl font-semibold text-white/[0.04]">
                      {s.n}
                    </div>
                    <div className="relative">
                      <span className="text-xs font-bold tracking-widest text-teal-300/90">
                        Step {i + 1}
                      </span>
                      <h3 className="mt-2 font-['Fraunces',serif] text-xl font-semibold text-white">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="platform" className="border-t border-white/5 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10 p-10 sm:p-14">
                <h2
                  className="max-w-2xl font-['Fraunces',serif] text-3xl font-semibold text-white sm:text-4xl"
                >
                  Ship operations software your auditors respect
                </h2>
                <p className="mt-4 max-w-2xl text-slate-300">
                  Nsuo is designed as a long-lived system of record — not a
                  demo that falls over at harvest season.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register-company"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Create your organisation
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-base font-medium text-white transition hover:bg-white/5"
                    >
                    Already onboard? Sign in
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <footer className="border-t border-white/5 py-10">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-['Fraunces',serif] text-lg font-semibold text-slate-200">
                  Nsuo
                </span>
                <span className="text-sm">Aquaculture operations</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <Link href="/login" className="hover:text-slate-300">
                  Sign in
                </Link>
                <Link href="/register-company" className="hover:text-slate-300">
                  Register company
                </Link>
                <Link href="/signup" className="hover:text-slate-300">
                  Sign up
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}
