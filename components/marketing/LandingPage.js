import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  LineChart,
  Shield,
  ShieldCheck,
  Fish,
  Users,
  Waves,
  Sparkles,
  ChevronRight,
  Calendar,
  Package,
  LayoutGrid,
  Scale,
  ShoppingCart,
  TrendingUp,
  Activity,
  Infinity,
  Menu,
  X,
  ChevronDown,
  Quote,
  ArrowUp,
  HelpCircle,
} from 'lucide-react'

const landingFocus =
  'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a12]'

const faqItems = [
  {
    q: 'Who is Nsuo built for?',
    a: 'Operations and finance teams at aquaculture groups running multiple ponds, cages, or RAS sites — anyone tired of reconciling parallel spreadsheets and chat threads.',
  },
  {
    q: 'How do farms and sites fit in the model?',
    a: 'You create an organisation, then farms, then production units (ponds, cages, tanks). Permissions follow that hierarchy so the field sees what it needs and head office keeps oversight.',
  },
  {
    q: 'What about approvals and audits?',
    a: 'Sensitive moves can require approvers before they hit live production data. The platform keeps an event trail so you can answer who changed what — especially when harvest volume spikes.',
  },
  {
    q: 'Do all users see the same screens?',
    a: 'No. Roles split operators, managers, and admins so daily entry stays lightweight while stocking, harvest, and settings stay controlled.',
  },
  {
    q: 'What is the path after we register?',
    a: 'Provision the organisation, confirm access, model farms and units, then invite your team. The onboarding section above is the same checklist an ops lead can reuse for every new site.',
  },
]

const heroTrustSignals = [
  { icon: ShieldCheck, label: 'Audit trail' },
  { icon: Users, label: 'Roles & approvals' },
  { icon: LineChart, label: 'Cage analytics' },
]

const heroVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.085, delayChildren: 0.04 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
}

const moduleCards = [
  {
    label: 'Daily production entry',
    icon: Calendar,
    description:
      'Feed, mortalities, and field notes on the cadence your crew already follows — not ad-hoc chats.',
  },
  {
    label: 'Bi-weekly records & sampling',
    icon: Scale,
    description:
      'Weights and samples that roll into biomass and FCR so managers see drift before close.',
  },
  {
    label: 'Cage registry & analytics',
    icon: LayoutGrid,
    description:
      'Every unit’s status, volume, and history from stocking through harvest in one registry.',
  },
  {
    label: 'Stocking & harvest',
    icon: Package,
    description:
      'Stocking events, top-ups, and harvest windows tied to the same timeline as your daily data.',
  },
  {
    label: 'Feed, suppliers & purchases',
    icon: ShoppingCart,
    description:
      'Trace feed from supplier to pond or cage without breaking the production model.',
  },
  {
    label: 'Approvals & audit trail',
    icon: ClipboardCheck,
    description:
      'Sensitive moves go through approvers; the log stays clean enough for auditors.',
  },
]

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
    title: 'Ponds, cages & tanks',
    copy: 'Register every production unit — earthen ponds, floating cages, RAS — with status, volumes, and a full history from stocking through harvest.',
    span: 'sm:col-span-2',
  },
  {
    icon: LineChart,
    title: 'Dashboards that match the farm',
    copy: 'Connect daily entry and bi-weekly sampling to biomass, FCR, and cage analytics so managers spot drift before it hits the books.',
    span: '',
  },
  {
    icon: ClipboardCheck,
    title: 'Controlled changes',
    copy: 'Route sensitive stocking and production moves through approvals — aligned with the audit events you already rely on.',
    span: '',
  },
  {
    icon: Shield,
    title: 'Built for multi-site ops',
    copy: 'Organisations, farms, roles, and structured APIs — for groups running many sites, not one fragile spreadsheet.',
    span: 'sm:col-span-2 lg:col-span-1',
  },
]

const statStrip = [
  {
    label: 'Production layers',
    value: '3',
    hint: 'Org → farm → unit',
    icon: Building2,
  },
  {
    label: 'Field + office',
    value: '1',
    hint: 'Shared live model',
    icon: Users,
  },
  {
    label: 'Lifecycle coverage',
    value: '∞',
    hint: 'Stocking through harvest',
    icon: Infinity,
  },
]

const previewNav = [
  { label: 'Dashboard', active: true },
  { label: 'Daily entry', active: false },
  { label: 'Cages', active: false },
  { label: 'Harvest', active: false },
]

const previewRows = [
  { cage: 'V-12', status: 'On feed', fcr: '1.38', tone: 'text-emerald-400/90' },
  { cage: 'V-04', status: 'Sample due', fcr: '1.52', tone: 'text-amber-400/90' },
  { cage: 'L-02', status: 'Harvest window', fcr: '1.41', tone: 'text-sky-400/90' },
]

function SectionHeading({ eyebrow, title, description, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400/90">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-[Outfit,system-ui,sans-serif] text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl sm:leading-[1.1] lg:text-[2.65rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-400 sm:text-xl">
          {description}
        </p>
      ) : null}
    </div>
  )
}

function HeroPreviewCard({ reducedMotion }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0.85, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-sky-500/20 blur-2xl"
      />
      <div className="landing-glass-strong relative overflow-hidden rounded-2xl shadow-2xl shadow-sky-950/30 ring-1 ring-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-cyan-500/[0.05]" aria-hidden />
        <div className="relative flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Fish className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold text-white">
                Nsuo · Volta Farms
              </div>
              <div className="flex items-center gap-1.5 truncate text-[10px] text-slate-500">
                <span className="relative flex h-2 w-2 shrink-0">
                  {!reducedMotion ? (
                    <>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </>
                  ) : (
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500/90" />
                  )}
                </span>
                Production workspace · live
              </div>
            </div>
          </div>
          <Sparkles className="h-4 w-4 shrink-0 text-sky-400/70" />
        </div>

        <div className="relative grid grid-cols-[minmax(0,5.75rem)_1fr] gap-0 border-b border-white/[0.06]">
          <div className="border-r border-white/[0.06] bg-white/[0.03] py-2 pl-2 pr-1 backdrop-blur-md">
            <p className="px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
              Navigate
            </p>
            <div className="space-y-0.5">
              {previewNav.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-md px-1.5 py-1 text-[10px] font-medium leading-tight ${
                    item.active
                      ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/25'
                      : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 p-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cage snapshot
              </p>
              <p className="mt-0.5 text-xs leading-snug text-slate-400">
                Bi-weekly weights roll up to analytics; daily entry keeps the
                timeline honest.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.04] backdrop-blur-md">
              <div className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Unit</span>
                <span className="text-right">State</span>
                <span className="text-right">FCR</span>
              </div>
              {previewRows.map((row, i) => (
                <motion.div
                  key={row.cage}
                  initial={reducedMotion ? false : { opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.4,
                    delay: reducedMotion ? 0 : 0.2 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-white/[0.05] px-2 py-1.5 text-[10px] last:border-b-0"
                >
                  <span className="font-medium text-slate-200">{row.cage}</span>
                  <span className={`text-right ${row.tone}`}>{row.status}</span>
                  <span className="text-right tabular-nums text-slate-300">
                    {row.fcr}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-1.5">
              {[
                { w: '82%', label: 'Biomass vs. target', c: 'from-sky-500 to-cyan-400' },
                {
                  w: '68%',
                  label: 'Feed programme adherence',
                  c: 'from-emerald-500 to-teal-400',
                },
              ].map((row, i) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>{row.label}</span>
                    <span className="text-sky-500/80">●</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={reducedMotion ? false : { width: 0 }}
                      animate={{ width: row.w }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.95,
                        delay: reducedMotion ? 0 : 0.45 + i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${row.c}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      if (mq.matches) {
        document.documentElement.classList.remove('scroll-smooth')
      } else {
        document.documentElement.classList.add('scroll-smooth')
      }
    }
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      document.documentElement.classList.remove('scroll-smooth')
    }
  }, [])

  const cardHoverLift =
    'motion-safe:transition motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_24px_64px_rgba(0,0,0,0.35)]'

  const sectionMotion = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-50px' },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        }

  return (
    <div
      id="top"
      className="min-h-screen overflow-x-hidden bg-[#050a12] font-sans text-slate-100 antialiased"
    >
        <a
          href="#main-content"
          className="fixed left-4 top-0 z-[100] -translate-y-[120%] rounded-b-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition duration-200 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a12]"
        >
          Skip to main content
        </a>
        {/* Atmospheric background */}
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(14,165,233,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.08),transparent_45%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,#050a12_85%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
          <div
            className="landing-glass-strong absolute -left-24 top-[18%] h-56 w-56 rounded-[2.5rem] opacity-[0.35]"
            aria-hidden
          />
          <div
            className="landing-glass absolute right-[-10%] top-[45%] h-72 w-72 rounded-full opacity-30"
            aria-hidden
          />
        </div>

        <header
          className={`landing-glass sticky top-0 z-50 rounded-none border border-x-0 border-t-0 border-b-white/10 transition-[box-shadow,backdrop-filter] duration-300 ${
            headerScrolled
              ? 'shadow-[0_16px_56px_rgba(0,0,0,0.45)] supports-[backdrop-filter]:backdrop-blur-xl'
              : 'shadow-[0_12px_48px_rgba(0,0,0,0.35)]'
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <Link
              href="/"
              className={`group flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-white sm:gap-3 ${landingFocus}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/35 bg-gradient-to-br from-sky-500/25 to-cyan-500/10 text-sky-200 shadow-[0_8px_24px_rgba(14,165,233,0.18),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition group-hover:border-sky-300/50">
                <Fish className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="font-[Outfit,system-ui,sans-serif] text-xl font-bold tracking-tight">
                Nsuo
              </span>
            </Link>
            <nav
              className="hidden items-center gap-7 text-sm font-medium text-slate-400 lg:gap-9 md:flex"
              aria-label="Primary"
            >
              {[
                ['#modules', 'Modules'],
                ['#product', 'Product'],
                ['#onboarding', 'Onboarding'],
                ['#faq', 'FAQ'],
                ['#platform', 'Platform'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`transition hover:text-white hover:underline hover:decoration-sky-500/80 hover:underline-offset-4 ${landingFocus}`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-2 md:flex sm:gap-3">
              <Link
                href="/login"
                className={`landing-glass-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white sm:px-4 ${landingFocus}`}
              >
                Sign in
              </Link>
              <Link
                href="/register-company"
                className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-gradient-to-r from-sky-400 to-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_28px_rgba(34,211,238,0.28),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition hover:brightness-110 sm:px-4 ${landingFocus}`}
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <button
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white transition hover:border-sky-400/35 hover:bg-white/[0.1] md:hidden ${landingFocus}`}
              aria-expanded={mobileNavOpen}
              aria-controls="landing-mobile-nav"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
          <div
            id="landing-mobile-nav"
            className={`border-t border-white/10 bg-[#050a12]/95 backdrop-blur-xl transition-[opacity,visibility] duration-200 md:hidden ${
              mobileNavOpen
                ? 'visible max-h-[min(70vh,520px)] opacity-100'
                : 'pointer-events-none invisible max-h-0 overflow-hidden opacity-0'
            }`}
          >
            <nav
              className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-4 sm:px-6"
              aria-label="Mobile primary"
            >
              {[
                ['#modules', 'Modules'],
                ['#product', 'Product'],
                ['#onboarding', 'Onboarding'],
                ['#faq', 'FAQ'],
                ['#platform', 'Platform'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white ${landingFocus}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
                <Link
                  href="/login"
                  className={`landing-glass-chip flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-medium text-white ${landingFocus}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register-company"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-amber-500 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(14,165,233,0.3)] ${landingFocus}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="scroll-mt-20 outline-none focus:outline-none md:scroll-mt-24"
        >
          {/* Hero */}
          <section
            className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pb-28 sm:pt-14 lg:px-8 lg:pt-20"
            aria-labelledby="hero-heading"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[min(520px,70vh)] w-[min(900px,120%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.14),transparent_68%)] sm:-top-8"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-4 top-24 mx-auto max-w-6xl opacity-[0.4] [mask-image:linear-gradient(180deg,white_20%,transparent_85%)] sm:top-28"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px',
              }}
              aria-hidden
            />

            <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-2">
              <motion.div
                className="lg:pr-2"
                {...(mounted && !reduceMotion
                  ? {
                      variants: heroVariants,
                      initial: 'hidden',
                      animate: 'show',
                    }
                  : {})}
              >
                <div className="landing-glass relative overflow-hidden rounded-3xl p-5 ring-1 ring-white/[0.06] sm:p-7 lg:p-10">
                  <div
                    className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-sky-500/12 blur-3xl"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/[0.08] via-transparent to-cyan-400/[0.05]"
                    aria-hidden
                  />
                  <div className="relative">
                    <motion.div
                      {...(mounted && !reduceMotion
                        ? { variants: heroItem }
                        : {})}
                      className="mb-6 flex flex-wrap items-center gap-2"
                    >
                      <p className="landing-glass-chip inline-flex cursor-default items-center gap-2 rounded-full border-sky-400/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/95">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.85)]"
                          aria-hidden
                        />
                        Aquaculture operations
                      </p>
                      <span className="hidden text-[11px] font-medium text-slate-600 sm:inline">
                        ·
                      </span>
                      <p className="landing-glass-chip inline-flex cursor-default items-center gap-1.5 rounded-full border-white/[0.08] px-3 py-1 text-[11px] font-medium text-slate-400">
                        <Building2
                          className="h-3.5 w-3.5 text-sky-400/80"
                          strokeWidth={2}
                          aria-hidden
                        />
                        Multi-site ready
                      </p>
                    </motion.div>

                    <motion.h1
                      id="hero-heading"
                      {...(mounted && !reduceMotion
                        ? { variants: heroItem }
                        : {})}
                      className="text-balance font-[Outfit,system-ui,sans-serif] text-[2.35rem] font-semibold leading-[1.07] tracking-[-0.03em] text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.35rem] lg:leading-[1.02]"
                    >
                      One workspace for{' '}
                      <span className="bg-gradient-to-r from-sky-100 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                        every site you run
                      </span>
                      <span className="text-slate-600">.</span>
                    </motion.h1>

                    <motion.p
                      {...(mounted && !reduceMotion
                        ? { variants: heroItem }
                        : {})}
                      className="mt-5 max-w-xl text-pretty text-base font-medium leading-relaxed text-slate-400 sm:text-lg sm:leading-snug"
                    >
                      Ponds, cages, and tanks in one model — from daily entry to
                      harvest, with approvals your auditors can follow.
                    </motion.p>

                    <motion.div
                      {...(mounted && !reduceMotion
                        ? { variants: heroItem }
                        : {})}
                      className="mt-7 overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    >
                      <ul
                        className="grid divide-y divide-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
                        role="list"
                        aria-label="Platform highlights"
                      >
                        {heroTrustSignals.map(({ icon: Icon, label }) => (
                          <li
                            key={label}
                            className="flex items-center gap-3 px-4 py-3 sm:flex-col sm:justify-center sm:gap-2 sm:px-3 sm:py-3.5"
                          >
                            <Icon
                              className="h-4 w-4 shrink-0 text-sky-400 sm:h-[1.1rem] sm:w-[1.1rem]"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="text-xs font-semibold leading-tight text-slate-200 sm:text-center sm:text-[0.8125rem]">
                              {label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      {...(mounted && !reduceMotion
                        ? { variants: heroItem }
                        : {})}
                      className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                    >
                      <Link
                        href="/register-company"
                        className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(14,165,233,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition duration-200 hover:brightness-110 hover:shadow-[0_22px_56px_rgba(249,115,22,0.22)] sm:px-7 sm:text-base ${landingFocus}`}
                      >
                        Get started free
                        <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
                      </Link>
                      <Link
                        href="/login"
                        className={`landing-glass inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 text-sm font-medium text-white transition duration-200 hover:border-sky-400/30 hover:bg-white/[0.06] sm:px-7 sm:text-base ${landingFocus}`}
                      >
                        Sign in
                      </Link>
                      <a
                        href="#modules"
                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-sky-300/95 underline-offset-4 transition duration-200 hover:text-white hover:underline sm:px-3 ${landingFocus}`}
                      >
                        Explore the product
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </a>
                    </motion.div>

                    <motion.p
                      {...(mounted && !reduceMotion
                        ? { variants: heroItem }
                        : {})}
                      className="mt-6 text-sm text-slate-500"
                    >
                      Invited to a team?{' '}
                      <Link
                        href="/signup"
                        className={`font-semibold text-sky-400 transition hover:text-sky-300 hover:underline hover:underline-offset-4 ${landingFocus}`}
                      >
                        Join here
                      </Link>
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              <div className="relative flex min-h-[320px] justify-center lg:min-h-[380px] lg:justify-end">
                {mounted && !reduceMotion ? (
                  <>
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute left-0 top-[6%] z-10 hidden max-w-[11.5rem] rounded-xl border border-white/[0.1] bg-[#0a1624]/90 px-3 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md sm:block lg:left-2 lg:top-[10%]"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, -6, 0],
                      }}
                      transition={{
                        opacity: { duration: 0.5, delay: 0.35 },
                        x: { duration: 0.5, delay: 0.35 },
                        y: {
                          duration: 5.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1,
                        },
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                          <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Biomass vs target
                          </p>
                          <p className="text-sm font-semibold text-white">
                            On track this cycle
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute bottom-[12%] right-0 z-10 hidden max-w-[11rem] rounded-xl border border-amber-500/20 bg-[#0a1624]/92 px-3 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md sm:block lg:-right-2 lg:bottom-[18%]"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, 5, 0],
                      }}
                      transition={{
                        opacity: { duration: 0.5, delay: 0.45 },
                        x: { duration: 0.5, delay: 0.45 },
                        y: {
                          duration: 6.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1.2,
                        },
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                          <Activity className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Field signal
                          </p>
                          <p className="text-sm font-semibold text-white">
                            Sampling due · 2 units
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                ) : null}

                <motion.div
                  className="landing-glass relative w-full max-w-md rounded-[1.75rem] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-lg sm:p-4 lg:max-w-lg lg:rounded-[2rem]"
                  initial={false}
                  animate={
                    mounted && !reduceMotion ? { y: [0, -5, 0] } : {}
                  }
                  transition={
                    mounted && !reduceMotion
                      ? {
                          duration: 7,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-tr from-cyan-400/10 via-transparent to-sky-500/12 lg:rounded-[2rem]"
                    aria-hidden
                  />
                  <div className="relative">
                    {mounted ? (
                      <HeroPreviewCard reducedMotion={reduceMotion} />
                    ) : (
                      <div
                        className="landing-glass h-[340px] w-full max-w-md animate-pulse rounded-2xl lg:max-w-lg"
                        aria-hidden
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Stat strip */}
            <div className="mt-20 grid gap-4 sm:grid-cols-3">
              {statStrip.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    {...sectionMotion(i * 0.08)}
                    className={`group landing-glass relative overflow-hidden rounded-2xl p-6 transition duration-200 hover:border-sky-400/28 hover:shadow-[0_16px_48px_rgba(14,165,233,0.14)] ${cardHoverLift}`}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent opacity-0 transition duration-200 group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <div className="font-[Outfit,system-ui,sans-serif] text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                          {s.value}
                        </div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {s.label}
                        </div>
                        <p className="mt-2 text-sm font-medium leading-snug text-slate-500 sm:text-[1.05rem]">
                          {s.hint}
                        </p>
                      </div>
                      <span className="landing-glass-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sky-300">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                    </div>
                    <ChevronRight
                      className="absolute bottom-4 right-4 h-5 w-5 text-slate-700 transition duration-200 group-hover:translate-x-0.5 group-hover:text-sky-400"
                      aria-hidden
                    />
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* What the app covers — module grid */}
          <section
            id="modules"
            className="landing-glass-band scroll-mt-24 border-t border-white/[0.06] py-20 sm:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow="Inside Nsuo"
                  title="Every module your ops team already names in meetings"
                  description="Dashboard, daily data, cages, stocking, harvest, feed, and governance — the same verbs your crew uses on the water, connected instead of scattered across folders."
                />
                <a
                  href="#product"
                  className={`landing-glass-chip inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-semibold text-sky-200 transition duration-200 hover:border-sky-400/35 hover:text-white lg:self-auto ${landingFocus}`}
                >
                  Why this shape
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </a>
              </div>

              <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {moduleCards.map(({ label, icon: Icon, description }, i) => (
                  <motion.li
                    key={label}
                    {...sectionMotion(0.04 + i * 0.05)}
                    className={`landing-glass group relative h-full overflow-hidden rounded-2xl p-6 transition duration-200 hover:border-sky-400/25 ${cardHoverLift}`}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl transition duration-200 group-hover:bg-sky-400/15"
                      aria-hidden
                    />
                    <div className="relative flex flex-col gap-4">
                      <span className="landing-glass-chip inline-flex h-10 w-10 items-center justify-center rounded-xl text-sky-300">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className="font-[Outfit,system-ui,sans-serif] text-lg font-semibold leading-snug text-white">
                          {label}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                          {description}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          {/* Product bento */}
          <section
            id="product"
            className="landing-glass-band scroll-mt-24 border-t border-white/[0.05] py-24 sm:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <SectionHeading
                eyebrow="Product"
                title="Built for ponds, cages, and the people who work them"
                description="Field discipline upstream. Reporting and accountability downstream. The map follows production — not a slide deck."
                className="max-w-3xl"
              />

              <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map(({ icon: Icon, title, copy, span }, i) => (
                  <motion.div
                    key={title}
                    {...sectionMotion(0.05 + i * 0.06)}
                    className={`group landing-glass relative overflow-hidden border border-white/[0.04] p-8 transition duration-200 hover:border-sky-400/35 hover:shadow-[0_20px_56px_rgba(14,165,233,0.16)] ${cardHoverLift} ${span}`}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-sky-400/12 blur-2xl transition duration-200 group-hover:bg-sky-400/22" />
                    <div className="relative">
                      <div className="landing-glass-chip mb-5 inline-flex rounded-xl p-3 text-sky-200">
                        <Icon className="h-6 w-6" strokeWidth={1.6} />
                      </div>
                      <h3 className="font-[Outfit,system-ui,sans-serif] text-xl font-semibold leading-snug text-white">
                        {title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        {copy}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Pull quote */}
          <section
            className="relative border-y border-white/[0.06] py-20 sm:py-24"
            aria-label="Why teams choose a single system"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,rgba(14,165,233,0.06),transparent_65%)]"
              aria-hidden
            />
            <motion.div
              {...sectionMotion(0)}
              className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
            >
              <Quote
                className="mx-auto h-9 w-9 text-sky-400/50 sm:h-10 sm:w-10"
                strokeWidth={1.25}
                aria-hidden
              />
              <blockquote className="mt-8 text-pretty font-[Outfit,system-ui,sans-serif] text-[1.45rem] font-medium leading-snug tracking-tight text-white sm:text-2xl sm:leading-snug lg:text-[1.75rem]">
                <p>
                  One timeline from stocking through harvest — so finance and
                  field stop reconciling which notebook was “the truth” at
                  month-end.
                </p>
              </blockquote>
              <p className="mt-6 text-sm font-medium text-slate-500">
                Built for ops and finance teams running multiple production sites
              </p>
            </motion.div>
          </section>

          {/* Onboarding */}
          <section
            id="onboarding"
            className="landing-glass-band scroll-mt-24 border-t border-white/[0.05] py-24 sm:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow="Onboarding"
                  title="From signup to first harvest entry"
                  description="A repeatable path your ops lead can run for every new site — clear, disciplined, and easy to hand off."
                  className="max-w-xl"
                />
                <Link
                  href="/register-company"
                  className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(14,165,233,0.3)] transition duration-200 hover:brightness-110 lg:self-auto ${landingFocus}`}
                >
                  <Users className="h-4 w-4" strokeWidth={2} />
                  Begin registration
                  <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="relative mt-16">
                <div
                  className="pointer-events-none absolute left-0 right-0 top-[2.25rem] hidden h-px bg-gradient-to-r from-sky-500/35 via-slate-600/40 to-transparent md:block"
                  aria-hidden
                />
                <ol className="relative grid gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-6">
                  {steps.map((s, i) => (
                    <motion.li
                      key={s.n}
                      {...sectionMotion(0.06 + i * 0.05)}
                      className={`landing-glass relative rounded-2xl border-l-2 border-l-sky-500/35 p-7 pl-6 sm:p-8 sm:pl-7 ${cardHoverLift}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/35 bg-sky-500/12 font-[Outfit,system-ui,sans-serif] text-sm font-bold text-sky-300">
                          {s.n}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Step {i + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 font-[Outfit,system-ui,sans-serif] text-[1.2rem] font-semibold leading-snug text-white sm:text-[1.35rem]">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        {s.body}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="scroll-mt-24 border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,16,28,0.5)_0%,#050a12_50%,#050a12_100%)] py-20 sm:py-28"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-4">
                  <div className="landing-glass-chip mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/95">
                    <HelpCircle
                      className="h-3.5 w-3.5 text-sky-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    FAQ
                  </div>
                  <h2
                    id="faq-heading"
                    className="text-balance font-[Outfit,system-ui,sans-serif] text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl"
                  >
                    Answers before you commit
                  </h2>
                  <p className="mt-4 max-w-sm text-pretty text-base font-medium leading-relaxed text-slate-400">
                    Plain-language responses to what cage-and-pond groups ask when
                    they are ready to leave spreadsheet chaos behind.
                  </p>
                  <div className="landing-glass mt-8 rounded-2xl border border-white/[0.08] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      What is next
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Read how Nsuo treats{' '}
                      <a
                        href="#platform"
                        className={`font-semibold text-sky-400 transition hover:text-sky-300 hover:underline hover:underline-offset-4 ${landingFocus}`}
                      >
                        platform, governance, and audit
                      </a>
                      , or scroll to{' '}
                      <a
                        href="#onboarding"
                        className={`font-semibold text-sky-400 transition hover:text-sky-300 hover:underline hover:underline-offset-4 ${landingFocus}`}
                      >
                        onboarding
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="landing-glass-strong overflow-hidden rounded-2xl border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:rounded-3xl">
                    <ul className="divide-y divide-white/[0.08]" role="list">
                      {faqItems.map(({ q, a }, i) => (
                        <li key={q}>
                          <details className="group/faq">
                            <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.04] sm:gap-5 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
                              <span
                                className="mt-0.5 w-8 shrink-0 pt-0.5 font-[Outfit,system-ui,sans-serif] text-xs font-bold tabular-nums text-sky-500/80"
                                aria-hidden
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span className="min-w-0 flex-1 font-[Outfit,system-ui,sans-serif] text-sm font-semibold leading-snug text-white sm:text-base">
                                {q}
                              </span>
                              <ChevronDown
                                className="mt-0.5 h-5 w-5 shrink-0 text-sky-400/80 transition duration-200 group-open/faq:rotate-180"
                                strokeWidth={2}
                                aria-hidden
                              />
                            </summary>
                            <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 pb-4 pl-[4.25rem] pr-4 sm:px-6 sm:pb-5 sm:pl-[4.75rem]">
                              <p className="pt-4 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
                                {a}
                              </p>
                            </div>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform CTA — full-width band, split layout on large screens */}
          <section
            id="platform"
            className="scroll-mt-24 border-t border-white/[0.08] bg-[linear-gradient(180deg,#050a12_0%,rgba(6,14,26,0.96)_38%,#050a12_100%)] pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-28"
            aria-labelledby="platform-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div
                {...sectionMotion(0)}
                className="landing-glass-strong relative overflow-hidden rounded-[1.65rem] shadow-[0_28px_96px_rgba(0,0,0,0.55)] ring-1 ring-sky-500/25 sm:rounded-3xl lg:rounded-[2rem]"
              >
                <Fish
                  className="pointer-events-none absolute -bottom-8 -right-4 h-44 w-44 text-sky-400/[0.09] sm:h-56 sm:w-56 lg:-bottom-10 lg:right-[8%]"
                  strokeWidth={1}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.14] via-slate-950/30 to-cyan-500/[0.09]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_20%_0%,rgba(56,189,248,0.14),transparent_58%)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_95%_85%,rgba(14,165,233,0.08),transparent_50%)]"
                  aria-hidden
                />

                <div className="relative grid gap-12 p-8 sm:gap-14 sm:p-11 lg:grid-cols-12 lg:items-center lg:gap-0 lg:p-14 xl:p-16">
                  <div className="lg:col-span-7 lg:max-w-xl lg:pr-8 xl:max-w-none xl:pr-12">
                    <div className="inline-flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] text-sky-200 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
                        <Building2 className="h-6 w-6" strokeWidth={1.5} />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/90">
                        Platform &amp; governance
                      </p>
                    </div>
                    <h2
                      id="platform-heading"
                      className="mt-6 font-[Outfit,system-ui,sans-serif] text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl sm:leading-[1.1] lg:text-[2.45rem] lg:leading-[1.08]"
                    >
                      A system of record your{' '}
                      <span className="bg-gradient-to-r from-sky-100 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                        auditors respect
                      </span>
                    </h2>
                    <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
                      Stable when volumes spike at harvest. Every meaningful
                      change stays attributable — so reviews stay short and
                      operators stay fast.
                    </p>
                    <ul className="mt-8 grid gap-3 sm:grid-cols-1 sm:gap-3.5 lg:max-w-md">
                      {[
                        {
                          icon: ShieldCheck,
                          text: 'Attributable events across the production model',
                        },
                        {
                          icon: ClipboardCheck,
                          text: 'Approvals aligned with how you already govern',
                        },
                        {
                          icon: Building2,
                          text: 'Org → farm → unit hierarchy out of the box',
                        },
                      ].map(({ icon: Icon, text }) => (
                        <li
                          key={text}
                          className="flex items-start gap-3 text-sm font-medium leading-snug text-slate-300"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-300">
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative lg:col-span-5 lg:border-l lg:border-white/[0.09] lg:pl-10 xl:pl-14">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent lg:hidden" aria-hidden />
                    <div className="landing-glass relative rounded-2xl border border-white/[0.1] p-6 shadow-[0_20px_64px_rgba(0,0,0,0.35)] sm:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Next step
                      </p>
                      <p className="mt-2 font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-white">
                        Start with your organisation
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Register to provision your workspace, then invite
                        operators and managers when your production units are
                        ready.
                      </p>
                      <div className="mt-7 flex flex-col gap-3">
                        <Link
                          href="/register-company"
                          className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-amber-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_48px_rgba(14,165,233,0.35)] transition duration-200 hover:brightness-110 ${landingFocus}`}
                        >
                          Create your organisation
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                        <Link
                          href="/login"
                          className={`landing-glass-chip inline-flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 text-base font-medium text-white transition duration-200 hover:border-white/25 hover:bg-white/[0.08] ${landingFocus}`}
                        >
                          Already onboard? Sign in
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <footer className="landing-glass-band border-t border-white/[0.07] py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
                <div className="sm:col-span-2 lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/35 bg-gradient-to-br from-sky-500/25 to-cyan-500/10 text-sky-200 shadow-[0_8px_24px_rgba(14,165,233,0.18)]">
                      <Fish className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="font-[Outfit,system-ui,sans-serif] text-2xl font-bold tracking-tight text-white">
                      Nsuo
                    </span>
                  </div>
                  <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
                    Production software for cage, pond, and tank aquaculture
                    teams — one workspace from stocking through harvest.
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Product
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-400">
                    <li>
                      <a
                        href="#modules"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Modules
                      </a>
                    </li>
                    <li>
                      <a
                        href="#product"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        How we think about product
                      </a>
                    </li>
                    <li>
                      <a
                        href="#onboarding"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Onboarding
                      </a>
                    </li>
                    <li>
                      <a
                        href="#faq"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a
                        href="#platform"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Platform &amp; audit
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Account
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-400">
                    <li>
                      <Link
                        href="/login"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register-company"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Register company
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Join with invite
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  © {new Date().getFullYear()} Nsuo. All rights reserved.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <p className="text-xs text-slate-600">
                    Built for multi-site aquaculture operators.
                  </p>
                  <a
                    href="#top"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold text-sky-500/90 transition hover:text-sky-400 ${landingFocus}`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Back to top
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
  )
}
