import Link from 'next/link'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { getMarketingBrandName } from '@/lib/landing-brand'
import { LandingPricingSection } from '@/components/pricing/LandingPricingSection'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LandingFeatureShowcase } from '@/components/landing/LandingFeatureShowcase'
import { LandingInteractiveDemo } from '@/components/landing/LandingInteractiveDemo'
import { LandingTestimonials } from '@/components/landing/LandingTestimonials'
import { LandingWorkspaceGrid } from '@/components/landing/LandingWorkspaceGrid'
import { HeroRotatingEmphasis } from '@/components/landing/HeroRotatingEmphasis'
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  LineChart,
  Shield,
  ShieldCheck,
  Users,
  Library,
  Sparkles,
  ChevronRight,
  Calendar,
  Menu,
  X,
  ArrowUp,
  Code2,
  GraduationCap,
  Check,
  Orbit,
} from 'lucide-react'

const BRAND = getMarketingBrandName()

/** Max 4 in-header links — product-focused, not internal section dump */
const LANDING_NAV = [
  ['#story', 'Why'],
  ['#features', 'Features'],
  ['#pricing', 'Pricing'],
  ['#developers', 'API'],
]

const landingFocus =
  'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]'

const heroTrustSignals = [
  { icon: ShieldCheck, label: 'Every answer labeled: official, community, or AI' },
  { icon: Sparkles, label: 'Step-by-step help when there is no answer key' },
  { icon: LineChart, label: 'See which topics still need work' },
]

const CAMPUS_MARQUEE = [
  'University of Ghana',
  'KNUST',
  'UCC',
  'UDS',
  'UEW',
  'UHAS',
  'UMaT',
  'Ashesi',
  'Academic City',
  'Lancaster Ghana',
  'Central University',
  'Regent',
  'Knutsford',
]

const storyProblems = [
  'Past papers sit in WhatsApp, Drive, and printouts. They are hard to search and easy to lose.',
  'Many questions have no reliable solution or marking scheme.',
  'You need exam-style practice, not more untitled PDFs.',
]

const storySolutions = [
  'One catalog for schools, courses, and sessions—easy to browse.',
  'Official schemes where they exist; AI worked steps elsewhere—always labeled.',
  'Timed practice that feels like the exam room.',
  'Departments and trusted reps upload together so quality grows with the bank.',
  'Stats highlight weak topics so you revise where you lose marks.',
]

function LandingMarquee() {
  const reduceMotion = useReducedMotion()
  const doubled = [...CAMPUS_MARQUEE, ...CAMPUS_MARQUEE]

  if (reduceMotion) {
    return (
      <div className="border-y border-[var(--border-default)] bg-bg-raised/55 py-4 text-center backdrop-blur-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
          Built for Ghanaian universities—we keep adding schools and courses
        </p>
        <p className="sr-only">
          Institutions in our roadmap include: {CAMPUS_MARQUEE.join(', ')}.
        </p>
      </div>
    )
  }

  return (
    <div className="ticker-mask relative border-t border-[var(--border-default)] bg-bg-raised/55 py-3.5 backdrop-blur-md">
      <div
        className="landing-marquee-track landing-marquee-animate"
        aria-hidden
      >
        {doubled.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted"
          >
            <span className="h-1 w-1 rounded-full bg-orange-500/70 shadow-[0_0_10px_rgba(255,92,0,0.6)]" />
            {label}
          </span>
        ))}
      </div>
      <p className="sr-only">
        Universities and colleges represented in our coverage roadmap include:{' '}
        {CAMPUS_MARQUEE.join(', ')}.
      </p>
    </div>
  )
}

/** Bento workspace grid — sizes map to LandingWorkspaceGrid layout */
const moduleCards = [
  {
    label: 'Question bank',
    icon: Library,
    description:
      'Find papers by school, course, and year in seconds—without scrolling endless chats for the right file.',
    size: 'hero',
    tag: 'Catalog',
  },
  {
    label: 'Solutions',
    icon: ClipboardCheck,
    description:
      'Official schemes where they exist; clear AI walkthroughs everywhere else. You always see what is verified.',
    size: 'side',
    tag: 'Answers',
  },
  {
    label: 'Exam mode',
    icon: Calendar,
    description:
      'Timed sets and an exam-style flow—practice under pressure, not only silent reading.',
    size: 'tile',
    tag: 'Practice',
  },
  {
    label: 'Trusted contributions',
    icon: Users,
    description:
      'Departments and course reps upload material; checks help quality as the bank grows.',
    size: 'tile',
    tag: 'Community',
  },
  {
    label: 'AI tutor',
    icon: Sparkles,
    description:
      'Hints and worked steps on your actual past papers—not generic textbook filler.',
    size: 'tile',
    tag: 'Guidance',
  },
  {
    label: 'Progress',
    icon: LineChart,
    description:
      'Weak chapters, streaks, and readiness in one view—know where to revise before it is too late.',
    size: 'full',
    tag: 'Insight',
  },
]

const steps = [
  {
    n: '01',
    title: 'Create your workspace',
    body: 'Sign up and set up your space. Roles and courses match how your institution already works.',
    icon: Sparkles,
  },
  {
    n: '02',
    title: 'Verify and invite',
    body: 'Confirm email, then invite admins and course reps. Everyone shares one question bank.',
    icon: Users,
  },
  {
    n: '03',
    title: 'Add papers',
    body: 'Upload by year and semester—from departments or trusted student batches.',
    icon: Library,
  },
  {
    n: '04',
    title: 'Go live',
    body: 'Students practice and use exam mode; you see activity without chasing files.',
    icon: LineChart,
  },
]

const highlights = [
  {
    icon: Library,
    title: 'One catalog',
    copy: 'School, programme, level, and session in one structure—students find the right paper fast.',
    gridClass: 'md:col-span-2 lg:col-span-7',
  },
  {
    icon: LineChart,
    title: 'Smarter revision',
    copy: 'Link attempts to syllabus topics. Spend time on what actually loses marks.',
    gridClass: 'lg:col-span-5',
  },
  {
    icon: ClipboardCheck,
    title: 'Clear quality',
    copy: 'Each answer is tagged: official, community, or AI—so you know what you are trusting.',
    gridClass: 'lg:col-span-6',
  },
  {
    icon: Shield,
    title: 'Built for Ghana',
    copy: 'Semester rhythm, local marking styles, and mobile-first design for real campus life.',
    gridClass: 'lg:col-span-6',
  },
]

/** Editorial value props — not live metrics (builds trust vs placeholder numbers). */
const statStrip = [
  {
    label: 'Roadmap',
    value: 'Ghana-first',
    hint: 'We are adding more universities and programmes—the same schools you see in the ticker.',
    icon: Building2,
  },
  {
    label: 'Workspace',
    value: 'Unified',
    hint: 'Papers, schemes, practice, and stats in one app—not scattered across Drive and chats.',
    icon: Library,
  },
  {
    label: 'Collaboration',
    value: 'Cohort-scale',
    hint: 'Course reps, departments, and students share one library everyone can trust.',
    icon: Users,
  },
  {
    label: 'Access',
    value: 'Anytime',
    hint: 'Practice when the library is closed—on your own schedule.',
    icon: Orbit,
  },
]

const previewRows = [
  { courseCode: 'FIN 201',  status: '98% ready',   session: '4.5h', pill: 'pill-green'  },
  { courseCode: 'CS 205',   status: 'Review weak',  session: '2.1h', pill: 'pill-amber'  },
  { courseCode: 'MATH 152', status: 'Sim due',      session: '45m',  pill: 'pill-orange' },
]

/** Decorative pills around the hero dashboard — reinforce value props (not live data). */
const heroFloatingBadges = [
  {
    Icon: Library,
    label: 'Question bank',
    value: 'Searchable',
    positionClass: 'left-[-0.35rem] top-1 sm:left-[-0.75rem] sm:top-[-0.25rem]',
    floatDuration: 4.8,
    floatDelay: 0,
  },
  {
    Icon: Calendar,
    label: 'Exam mode',
    value: 'Hall timing',
    positionClass: 'right-[-0.25rem] top-[22%] hidden sm:flex sm:right-[-0.65rem]',
    floatDuration: 5.4,
    floatDelay: 0.35,
  },
  {
    Icon: LineChart,
    label: 'Revision radar',
    value: 'Weak topics',
    positionClass: 'bottom-[-0.5rem] left-[12%] sm:bottom-[-0.35rem] sm:left-auto sm:right-[8%]',
    floatDuration: 5.1,
    floatDelay: 0.2,
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
  className = '',
  descriptionClassName = '',
  accent = 'orange',
}) {
  const eyebrowTone =
    accent === 'teal'
      ? 'text-teal-700 dark:text-teal-400'
      : 'text-orange-600 dark:text-orange-400/90'
  return (
    <div className={className}>
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${eyebrowTone}`}>
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-[Outfit,system-ui,sans-serif] text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-[2.15rem] sm:leading-[1.1] lg:text-[2.5rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg ${descriptionClassName}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

function HeroShowcase({ reducedMotion }) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_85%_70%_at_50%_40%,rgba(45,212,191,0.14),transparent_62%),radial-gradient(ellipse_70%_60%_at_80%_80%,rgba(251,146,60,0.1),transparent_55%)] opacity-90 dark:opacity-100 sm:-inset-5"
        aria-hidden
      />
      {heroFloatingBadges.map(
        ({ Icon, label, value, positionClass, floatDuration, floatDelay }, i) => (
          <motion.div
            key={label}
            aria-hidden
            className={`pointer-events-none absolute z-[2] flex items-center gap-2.5 rounded-xl border border-[var(--border-default)] bg-bg-surface/92 px-3 py-2 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18)] backdrop-blur-md dark:bg-bg-surface/88 dark:shadow-[0_14px_44px_-10px_rgba(0,0,0,0.45)] ${positionClass}`}
            initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.94 }}
            animate={
              reducedMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : {
                    opacity: 1,
                    y: [0, -5, 0],
                    scale: 1,
                  }
            }
            transition={
              reducedMotion
                ? { duration: 0.35 }
                : {
                    opacity: { duration: 0.45, delay: 0.35 + i * 0.08 },
                    y: {
                      duration: floatDuration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: floatDelay + 0.45,
                    },
                    scale: { duration: 0.45, delay: 0.35 + i * 0.08 },
                  }
            }
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/25">
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {label}
              </span>
              <span className="block font-[Outfit,system-ui,sans-serif] text-sm font-semibold tabular-nums leading-tight text-text-primary">
                {value}
              </span>
            </span>
          </motion.div>
        ),
      )}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: reducedMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="dashboard-card relative z-[1]"
      >
      <div className="overflow-hidden rounded-2xl bg-bg-surface/95 shadow-[var(--shadow-float)] ring-1 ring-teal-500/15 dark:ring-teal-400/20">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/65" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/65" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/65" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-text-primary">{BRAND}</p>
              <p className="text-[10px] text-text-muted">Exam prep · dashboard</p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400/95">
            <span className="live-dot" aria-hidden />
            Live
          </span>
        </div>
        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: 'Courses', v: '12' },
              { k: 'Readiness', v: '78%' },
              { k: 'This week', v: '4h' },
            ].map((cell) => (
              <div
                key={cell.k}
                className="animated-border-inner animated-border-inner-dim rounded-xl bg-bg-raised/55 px-2 py-2.5 text-center"
              >
                <p className="text-lg font-semibold tabular-nums text-text-primary">
                  {cell.v}
                </p>
                <p className="text-[9px] font-medium uppercase tracking-wider text-text-muted">
                  {cell.k}
                </p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Focus courses
            </p>
            <div className="animated-border-inner animated-border-inner-dim overflow-hidden rounded-xl">
              <div className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-[var(--border-subtle)] bg-bg-raised/80 px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                <span>Course</span>
                <span className="text-right">Status</span>
                <span className="text-right">Time</span>
              </div>
              {previewRows.map((row) => (
                <div
                  key={row.courseCode}
                  className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-[var(--border-subtle)] px-3 py-2 text-[11px] last:border-b-0"
                >
                  <span className="font-bold text-text-secondary">
                    {row.courseCode}
                  </span>
                  <span className={`text-right ${row.pill}`}>{row.status}</span>
                  <span className="text-right tabular-nums text-text-muted">
                    {row.session}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>Overall readiness</span>
              <span className="tabular-nums text-orange-400/90">82%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-raised">
              <motion.div
                initial={reducedMotion ? false : { width: 0 }}
                animate={{ width: '82%' }}
                transition={{
                  duration: reducedMotion ? 0 : 0.85,
                  delay: reducedMotion ? 0 : 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="shimmer-bar h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              />
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
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

  const heroEase = [0.22, 1, 0.36, 1]
  const heroContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  }
  const heroItemVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.52, ease: heroEase },
    },
  }

  const heroSectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  })
  const heroOrbY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-x-hidden bg-bg-base font-sans text-text-primary antialiased"
    >
        <Head>
          <title>{`${BRAND} — Past questions & exam prep for Ghanaian universities`}</title>
          <meta name="application-name" content={BRAND} />
          <meta
            name="description"
            content="Past papers, verified solutions when available, AI explanations when they are not, exam simulations, and revision analytics for Ghanaian university students."
          />
          <meta
            property="og:title"
            content={`${BRAND} — Past questions & exam prep for Ghanaian universities`}
          />
          <meta property="og:site_name" content={BRAND} />
          <meta
            property="og:description"
            content="One workspace for papers, schemes, practice, and weak-topic insights — built for semester exams in Ghana."
          />
        </Head>
        <div
          className="pointer-events-none fixed inset-0 -z-10 edulamad-mesh"
          aria-hidden
        />
        <a
          href="#main-content"
          className="fixed left-4 top-0 z-[100] -translate-y-[120%] rounded-b-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition duration-200 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
        >
          Skip to main content
        </a>
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent"
          aria-hidden
        />

        <header
          className={`landing-glass sticky top-0 z-50 rounded-none border border-x-0 border-t-0 border-b-[var(--border-default)] transition-[box-shadow,backdrop-filter] duration-300 ${
            headerScrolled
              ? 'shadow-[0_16px_56px_rgba(0,0,0,0.45)] supports-[backdrop-filter]:backdrop-blur-xl'
              : 'shadow-[0_12px_48px_rgba(0,0,0,0.35)]'
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <Link
              href="/"
              className={`group flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-text-primary sm:gap-3 ${landingFocus}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/35 bg-gradient-to-br from-orange-500/25 to-amber-500/10 text-orange-600 shadow-[0_8px_24px_rgba(14,165,233,0.18),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition group-hover:border-orange-300/50 dark:text-orange-200">
                <GraduationCap className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="font-[Outfit,system-ui,sans-serif] text-xl font-bold tracking-tight">
                {BRAND}
              </span>
            </Link>
            <nav
              className="landing-header-desktop-only hidden items-center gap-8 text-sm font-medium text-text-secondary lg:gap-10 md:flex"
              aria-label="Primary"
            >
              {LANDING_NAV.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`transition hover:text-text-primary hover:underline hover:decoration-orange-500/80 hover:underline-offset-4 ${landingFocus}`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle size="sm" iconOnly />
              <div className="landing-header-desktop-ctas hidden items-center gap-2 md:flex sm:gap-3">
                <Link
                  href="/login"
                  className={`landing-glass-chip rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:border-[var(--border-emphasis)] hover:bg-bg-hover/70 hover:text-text-primary sm:px-4 ${landingFocus}`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`btn-primary-sweep inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-gradient-to-r from-orange-400 to-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_28px_rgba(34,211,238,0.28),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition hover:brightness-110 sm:px-4 ${landingFocus}`}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <button
                type="button"
                className={`landing-header-mobile-only inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-emphasis)] bg-bg-hover/50 text-text-primary transition hover:border-orange-400/35 hover:bg-bg-hover/65 md:hidden ${landingFocus}`}
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
          </div>
          <div
            id="landing-mobile-nav"
            data-open={mobileNavOpen ? 'true' : 'false'}
            className={`landing-header-mobile-panel border-t border-[var(--border-default)] bg-bg-surface/95 backdrop-blur-xl transition-[opacity,visibility] duration-200 md:hidden ${
              mobileNavOpen
                ? 'visible max-h-[min(70vh,520px)] opacity-100'
                : 'pointer-events-none invisible max-h-0 overflow-hidden opacity-0'
            }`}
          >
            <nav
              className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-4 sm:px-6"
              aria-label="Mobile primary"
            >
              {LANDING_NAV.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-3 text-sm font-medium text-text-secondary transition hover:bg-bg-hover/50 hover:text-text-primary ${landingFocus}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border-default)] pt-4 sm:flex-row">
                <Link
                  href="/login"
                  className={`landing-glass-chip flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-medium text-text-primary ${landingFocus}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(14,165,233,0.3)] ${landingFocus}`}
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
          className="relative scroll-mt-20 outline-none focus:outline-none md:scroll-mt-24"
        >
          {/* Hero — scroll target ref on inner wrapper so useScroll has a clear positioned box */}
          <section
            className="hero-grain relative overflow-x-hidden pb-4 pt-8 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8"
            aria-labelledby="hero-heading"
          >
            <div ref={heroSectionRef} className="relative">
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[-8%] h-[min(520px,70vh)] w-[min(880px,120%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,92,0,0.11),transparent_72%)]"
              aria-hidden
              style={reduceMotion ? undefined : { y: heroOrbY }}
            />
            <div
              className="pointer-events-none absolute -right-[18%] top-[10%] h-[min(380px,50vh)] w-[min(480px,65vw)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.07),transparent_70%)]"
              aria-hidden
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-16">
                <motion.div
                  className="lg:pr-2"
                  initial="hidden"
                  animate="show"
                  variants={heroContainerVariants}
                >
                  <motion.div variants={heroItemVariants}>
                    <span
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm"
                      style={{
                        borderColor: 'var(--border-default)',
                        background: 'var(--bg-surface)',
                        color: 'var(--landing-feature-eyebrow)',
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.65)]"
                        aria-hidden
                      />
                      {'Ghana · past papers & exam practice'}
                    </span>
                  </motion.div>
                  <motion.h1
                    id="hero-heading"
                    variants={heroItemVariants}
                    className="mt-5 text-balance font-[Outfit,system-ui,sans-serif] text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary sm:text-5xl sm:leading-[1.08] lg:text-[3.35rem] lg:leading-[1.1]"
                  >
                    Past papers and practice,{' '}
                    <HeroRotatingEmphasis
                      intervalMs={3400}
                      phrases={[
                        'in one place.',
                        'with real exam timing.',
                        'tied to topics you still miss.',
                        'built for Ghanaian courses.',
                      ]}
                      className="bg-gradient-to-r from-teal-800 via-orange-600 to-amber-500 bg-clip-text text-transparent dark:from-teal-200 dark:via-orange-100 dark:to-amber-300"
                    />
                  </motion.h1>
                  <motion.p
                    variants={heroItemVariants}
                    className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-text-secondary sm:text-lg"
                  >
                    Past papers and marking schemes when we have them. Clear AI help
                    when we do not. Timed practice and simple stats—built for real
                    exams, not another folder of PDFs.
                  </motion.p>
                  <motion.ul
                    variants={heroItemVariants}
                    className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3"
                    role="list"
                    aria-label="Platform highlights"
                  >
                    {heroTrustSignals.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="inline-flex w-full items-center gap-2.5 rounded-full border border-teal-600/15 bg-teal-500/[0.04] px-3.5 py-2.5 text-sm font-medium text-text-secondary shadow-sm backdrop-blur-sm transition hover:border-teal-500/25 hover:bg-teal-500/[0.07] dark:border-teal-500/20 dark:bg-teal-500/[0.06] sm:w-auto"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20">
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        </span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </motion.ul>
                  <motion.div
                    variants={heroItemVariants}
                    className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                  >
                    <Link
                      href="/register"
                      className={`btn-primary-sweep group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_20px_50px_rgba(255,92,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition duration-200 hover:bg-neutral-200 sm:w-auto sm:px-7 sm:text-base ${landingFocus}`}
                    >
                      Get started free
                      <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
                    </Link>
                    <Link
                      href="/login"
                      className={`btn-secondary-sweep inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-orange-600/45 bg-transparent px-6 py-3.5 text-sm font-semibold text-orange-800 transition duration-200 hover:border-orange-500 hover:bg-orange-500/10 dark:border-orange-500/55 dark:text-orange-300 sm:w-auto sm:px-7 sm:text-base ${landingFocus}`}
                    >
                      Sign in
                    </Link>
                    <a
                      href="#story"
                      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-orange-800 underline-offset-4 transition duration-200 hover:text-text-primary hover:underline dark:text-orange-300/95 sm:px-3 ${landingFocus}`}
                    >
                      Why {BRAND}
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </a>
                  </motion.div>
                  <motion.p variants={heroItemVariants} className="mt-6 text-sm text-text-secondary">
                    Invited to a team?{' '}
                    <Link
                      href="/signup"
                      className={`font-semibold text-orange-700 transition hover:text-orange-600 hover:underline hover:underline-offset-4 dark:text-orange-400 dark:hover:text-orange-300 ${landingFocus}`}
                    >
                      Join here
                    </Link>
                  </motion.p>
                </motion.div>

                <div className="flex min-h-[300px] justify-center pb-2 sm:min-h-[320px] lg:min-h-[360px] lg:justify-end lg:pb-0">
                  {mounted ? (
                    <HeroShowcase reducedMotion={reduceMotion} />
                  ) : (
                    <div
                      className="landing-glass h-[280px] w-full max-w-full animate-pulse rounded-2xl sm:max-w-md lg:max-w-lg"
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 sm:mt-14">
              <LandingMarquee />
            </div>
            </div>
          </section>

          {/* Stat strip — editorial ribbon (honest framing, not vanity metrics). */}
          <section
            className="relative scroll-mt-28 overflow-hidden border-y border-[var(--border-subtle)] bg-bg-base"
            aria-label="Platform at a glance"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(45,212,191,0.07),transparent_55%)] dark:opacity-90"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
              <div className="relative overflow-hidden rounded-2xl border border-teal-500/15 bg-gradient-to-b from-bg-surface/75 via-bg-surface/45 to-bg-base/85 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md dark:from-bg-surface/55 dark:via-bg-surface/35 dark:to-bg-base/90 sm:rounded-[1.35rem] sm:py-10 lg:py-12">
                <div
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent sm:inset-x-10"
                  aria-hidden
                />
                <p className="mb-8 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-800/90 dark:text-teal-400/95 sm:mb-10 sm:px-6">
                  Why teams take {BRAND} seriously
                </p>
                <div className="grid grid-cols-2 gap-8 px-3 sm:gap-10 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:divide-x lg:divide-teal-500/10 lg:px-8">
                  {statStrip.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <motion.div
                        key={s.label}
                        {...sectionMotion(i * 0.06)}
                        className="flex flex-col items-center text-center lg:px-6 lg:first:pl-2 lg:last:pr-2"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/25 ring-1 ring-white/15">
                          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                        </span>
                        <p className="mt-4 max-w-[11rem] font-[Outfit,system-ui,sans-serif] text-xl font-bold leading-tight tracking-tight text-text-primary sm:max-w-none sm:text-2xl lg:text-[1.65rem]">
                          {s.value}
                        </p>
                        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          {s.label}
                        </p>
                        <p className="mt-2 max-w-[14rem] text-sm leading-snug text-text-secondary">
                          {s.hint}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Problem → solution — single panel */}
          <section
            id="story"
            className="relative scroll-mt-28 overflow-hidden bg-bg-base py-20 sm:py-24 lg:py-28"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(45,212,191,0.07)_0%,transparent_52%)] dark:bg-[linear-gradient(165deg,rgba(45,212,191,0.11)_0%,transparent_50%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div {...sectionMotion(0)} className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-400">
                  Why we exist
                </p>
                <h2 className="mt-3 font-[Outfit,system-ui,sans-serif] text-3xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-4xl lg:text-[2.35rem]">
                  Exam prep should be one place—not a pile of PDFs.
                </h2>
                <p className="mx-auto mt-4 text-pretty text-base leading-relaxed text-text-secondary sm:text-lg">
                  {BRAND} puts past questions, answers, timed practice, and progress in
                  one workspace. Students revise with confidence; reps see where courses
                  need support.
                </p>
              </motion.div>

              <motion.div
                {...sectionMotion(0.08)}
                className="mt-14 overflow-hidden rounded-3xl border border-[var(--border-default)] bg-bg-surface/90 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:bg-bg-surface/70 dark:shadow-[0_28px_90px_-35px_rgba(0,0,0,0.55)] sm:rounded-[1.75rem]"
              >
                <div className="grid divide-y divide-[var(--border-default)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                  <div className="bg-gradient-to-br from-red-500/[0.04] to-transparent p-8 sm:p-10 lg:p-12">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08] text-red-400/90">
                        <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-text-primary">
                          The gap today
                        </h3>
                        <p className="text-sm text-text-muted">
                          What breaks before the exam
                        </p>
                      </div>
                    </div>
                    <ul className="mt-8 space-y-5">
                      {storyProblems.map((line, idx) => (
                        <motion.li
                          key={line}
                          initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-25px' }}
                          transition={{
                            duration: 0.42,
                            delay: reduceMotion ? 0 : 0.05 * idx,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex gap-3 text-sm leading-relaxed text-text-secondary sm:text-base"
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted"
                            aria-hidden
                          />
                          <span>{line}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/[0.06] to-transparent p-8 sm:p-10 lg:p-12">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/[0.12] text-teal-700 dark:text-teal-300">
                        <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-text-primary">
                          What {BRAND} changes
                        </h3>
                        <p className="text-sm text-text-muted">
                          How we close the loop
                        </p>
                      </div>
                    </div>
                    <ul className="mt-8 space-y-5">
                      {storySolutions.map((line, idx) => (
                        <motion.li
                          key={line}
                          initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-25px' }}
                          transition={{
                            duration: 0.42,
                            delay: reduceMotion ? 0 : 0.05 * idx,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex gap-3 text-sm leading-relaxed text-text-secondary sm:text-base"
                        >
                          <Check
                            className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span>{line}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-[var(--border-default)] bg-gradient-to-r from-teal-500/[0.08] via-transparent to-orange-500/[0.06] px-8 py-6 sm:px-10 sm:py-7 lg:px-12">
                  <p className="text-sm font-medium leading-relaxed text-text-secondary sm:text-[0.9375rem]">
                    <span className="font-semibold text-text-primary">
                      Honest labels on every answer. Practice that feels like the exam.
                    </span>{' '}
                    That is what we ship—not another folder of scans.
                  </p>
                  <a
                    href="#modules"
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full border border-teal-600/20 bg-teal-500/[0.06] px-3 py-1.5 text-sm font-semibold text-teal-800 transition hover:border-teal-500/40 hover:bg-teal-500/10 dark:text-teal-300 dark:hover:text-teal-200 ${landingFocus}`}
                  >
                    Explore the workspace
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          <LandingFeatureShowcase />

          <LandingInteractiveDemo />

          {/* Capabilities — bento workspace */}
          <section
            id="modules"
            className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-subtle)] bg-bg-base py-20 sm:py-24 lg:py-28"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(185deg,rgba(139,92,246,0.07)_0%,transparent_42%)] dark:bg-[linear-gradient(185deg,rgba(139,92,246,0.11)_0%,transparent_48%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[min(460px,52vh)] bg-[radial-gradient(ellipse_75%_55%_at_50%_-8%,rgba(45,212,191,0.11),transparent_68%)] opacity-95 dark:opacity-100"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                <SectionHeading
                  accent="teal"
                  eyebrow={`Inside ${BRAND}`}
                  title="Everything in one workspace"
                  description="Past papers, answers, timed tests, uploads, AI help, and progress—all in one app instead of spread across WhatsApp and Drive."
                  className="max-w-2xl"
                />
                <a
                  href="#product"
                  className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-teal-600/20 bg-teal-500/[0.06] px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition hover:border-teal-500/35 hover:bg-teal-500/10 dark:border-teal-500/25 dark:text-teal-300 dark:hover:bg-teal-500/15 lg:mb-1 ${landingFocus}`}
                >
                  Product principles
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </a>
              </div>

              <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-teal-500/20 bg-gradient-to-b from-teal-500/[0.08] via-bg-base/20 to-transparent px-3 py-7 dark:border-teal-500/25 dark:from-teal-500/[0.1] dark:via-bg-base/25 sm:px-5 sm:py-9 lg:px-8 lg:py-10">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
                  aria-hidden
                />
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-400">
                  Capability map
                </p>
                <p className="mb-6 max-w-xl text-sm text-text-secondary">
                  Each area below is part of the live product today.
                </p>
                <LandingWorkspaceGrid cards={moduleCards} mesh="modules" noOuterMargin />
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl border border-orange-500/35 bg-orange-500/[0.08] px-5 py-2.5 text-sm font-semibold text-orange-900 shadow-sm transition hover:bg-orange-500/[0.14] dark:border-orange-500/30 dark:bg-orange-950/45 dark:text-orange-100"
                  >
                    Register — unlock every module
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Product — bento */}
          <section
            id="product"
            className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-subtle)] bg-bg-base py-20 sm:py-24 lg:py-28"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_0%,rgba(14,165,233,0.08),transparent_50%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <SectionHeading
                accent="teal"
                eyebrow="Product"
                title="Walk in prepared"
                description="Know what you actually studied—not what you planned to open the night before. Built for real courses and busy schedules."
                className="max-w-2xl"
              />

              <div className="relative mt-12 overflow-hidden rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.05] via-bg-surface/35 to-transparent p-3 dark:border-cyan-500/20 dark:from-cyan-500/[0.07] dark:via-bg-surface/25 sm:p-5 lg:p-7">
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/15"
                  aria-hidden
                />
                <p className="relative mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-900 dark:text-cyan-400">
                  Principles — how the product behaves
                </p>
                <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
                {highlights.map(({ icon: Icon, title, copy, gridClass }, i) => (
                  <motion.div
                    key={title}
                    {...sectionMotion(0.05 + i * 0.05)}
                    className={`group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-bg-surface/95 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-[0_20px_50px_-28px_rgba(14,165,233,0.14)] dark:bg-bg-surface/60 sm:p-8 ${gridClass}`}
                  >
                    <div
                      className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-cyan-500/[0.14] to-teal-500/[0.08] blur-3xl transition duration-300 group-hover:from-cyan-500/[0.2]"
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/25 ring-1 ring-white/15">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <h3 className="mt-5 font-[Outfit,system-ui,sans-serif] text-lg font-semibold leading-snug text-text-primary sm:text-xl">
                        {title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary sm:text-[0.9375rem]">
                        {copy}
                      </p>
                    </div>
                  </motion.div>
                ))}
                </div>
                <div className="relative mt-8 flex justify-center">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-5 py-2.5 text-sm font-semibold text-cyan-950 shadow-sm transition hover:bg-cyan-500/[0.11] dark:border-cyan-500/25 dark:bg-cyan-950/35 dark:text-cyan-100"
                  >
                    Register to use these principles on your courses
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <LandingTestimonials />

          {/* Onboarding */}
          <section
            id="onboarding"
            className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-subtle)] bg-bg-base py-20 sm:py-24 lg:py-28"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[min(400px,45vh)] bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(45,212,191,0.08),transparent_55%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  accent="teal"
                  eyebrow="Onboarding"
                  title="From signup to your first practice set"
                  description="Faculty and society leads can follow the same steps every year—easy to hand off, consistent at scale."
                  className="max-w-xl"
                />
                <Link
                  href="/register"
                  className={`btn-primary-sweep group inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_44px_rgba(255,92,0,0.22)] transition duration-200 hover:brightness-110 lg:mb-0.5 ${landingFocus}`}
                >
                  <Users className="h-4 w-4" strokeWidth={2} />
                  Get started
                  <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <ol className="relative mx-auto mt-14 max-w-2xl space-y-5 lg:mx-0 lg:max-w-none lg:space-y-6">
                {steps.map((s, i) => {
                  const StepIcon = s.icon
                  return (
                  <motion.li
                    key={s.n}
                    {...sectionMotion(0.05 + i * 0.05)}
                    className="relative flex gap-4 sm:gap-6"
                  >
                    {i < steps.length - 1 ? (
                      <motion.div
                        className="absolute left-[1.35rem] top-[3.25rem] hidden h-[calc(100%+0.25rem)] w-px origin-top bg-gradient-to-b from-teal-500/60 via-cyan-500/35 to-transparent sm:block"
                        aria-hidden
                        initial={reduceMotion ? false : { scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.55,
                          delay: reduceMotion ? 0 : 0.12 + i * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    ) : null}
                    <div className="relative z-[1] flex shrink-0 flex-col items-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 font-[Outfit,system-ui,sans-serif] text-xs font-bold text-white shadow-lg shadow-teal-600/30 ring-2 ring-bg-base sm:h-12 sm:w-12 sm:text-sm">
                        {s.n}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-[var(--border-default)] bg-bg-surface/90 p-5 shadow-sm backdrop-blur-sm transition hover:border-teal-500/20 dark:bg-bg-surface/50 sm:p-6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/[0.08] text-teal-700 dark:text-teal-400">
                          <StepIcon className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </span>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
                          Step {i + 1}
                        </p>
                      </div>
                      <h3 className="mt-2 font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-text-primary sm:text-xl">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-[0.9375rem]">
                        {s.body}
                      </p>
                    </div>
                  </motion.li>
                  )
                })}
              </ol>
            </div>
          </section>

          <LandingPricingSection />

          {/* Platform CTA */}
          <section
            id="platform"
            className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-subtle)] bg-bg-base py-20 sm:py-24 lg:py-28"
            aria-labelledby="platform-heading"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(45,212,191,0.06)_0%,transparent_45%,rgba(249,115,22,0.05)_100%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div
                {...sectionMotion(0)}
                className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-bg-surface/95 shadow-[0_28px_90px_-35px_rgba(15,23,42,0.14)] backdrop-blur-md dark:bg-bg-surface/80 dark:shadow-[0_32px_100px_-40px_rgba(0,0,0,0.55)]"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500/[0.06] via-transparent to-orange-500/[0.06]"
                  aria-hidden
                />
                <GraduationCap
                  className="pointer-events-none absolute -bottom-6 -right-2 h-40 w-40 text-teal-500/[0.07] sm:h-52 sm:w-52 lg:right-[6%]"
                  strokeWidth={1}
                  aria-hidden
                />

                <div className="relative grid gap-10 p-8 sm:gap-12 sm:p-10 lg:grid-cols-12 lg:items-stretch lg:gap-0 lg:p-12 xl:p-14">
                  <div className="lg:col-span-7 lg:border-r lg:border-[var(--border-default)] lg:pr-10 xl:pr-14">
                    <div className="inline-flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/25">
                        <Building2 className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
                        Schools &amp; teams
                      </p>
                    </div>
                    <h2
                      id="platform-heading"
                      className="mt-5 font-[Outfit,system-ui,sans-serif] text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl"
                    >
                      Built for{' '}
                      <span className="text-orange-800 dark:bg-gradient-to-r dark:from-white dark:via-orange-200 dark:to-orange-400 dark:bg-clip-text dark:text-transparent">
                        departments and course reps
                      </span>
                    </h2>
                    <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-text-secondary sm:text-base">
                      When a whole year group studies at once, the app stays fast.
                      Changes to content and who can edit what are tracked—fewer
                      arguments, calmer students.
                    </p>
                    <ul className="mt-8 space-y-4 lg:max-w-lg">
                      {[
                        {
                          icon: ShieldCheck,
                          text: 'Clear audit trail across courses and question banks',
                        },
                        {
                          icon: ClipboardCheck,
                          text: 'Review flows that match how departments already moderate material',
                        },
                        {
                          icon: Building2,
                          text: 'Simple hierarchy for teams, programmes, and courses',
                        },
                      ].map(({ icon: Icon, text }) => (
                        <li
                          key={text}
                          className="flex items-start gap-3 text-sm leading-snug text-text-secondary"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600/90 to-cyan-600/90 text-white shadow-md shadow-teal-600/20">
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex lg:col-span-5 lg:pl-10 xl:pl-14">
                    <div className="flex w-full flex-col justify-center rounded-2xl border border-teal-500/20 bg-gradient-to-br from-bg-surface to-teal-50/25 p-6 shadow-inner dark:from-bg-surface/90 dark:to-teal-950/25 sm:p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-400/90">
                        Next step
                      </p>
                      <p className="mt-2 font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-text-primary">
                        Get started
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        Create an account, then invite reps and admins when you are
                        ready to share your catalog.
                      </p>
                      <div className="mt-6 flex flex-col gap-3">
                        <Link
                          href="/register"
                          className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_rgba(255,92,0,0.2)] transition duration-200 hover:brightness-110 sm:text-base ${landingFocus}`}
                        >
                          Create account
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                        <Link
                          href="/login"
                          className={`inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--border-default)] bg-transparent px-6 py-3.5 text-sm font-medium text-text-secondary transition duration-200 hover:border-[var(--border-emphasis)] hover:bg-bg-raised/70 sm:text-base ${landingFocus}`}
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

          <section
            id="developers"
            className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-subtle)] bg-bg-base py-20 sm:py-24"
            aria-labelledby="developers-heading"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_80%_20%,rgba(45,212,191,0.08),transparent_55%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid overflow-hidden rounded-3xl border border-[var(--border-default)] bg-bg-surface shadow-[0_24px_80px_-35px_rgba(15,23,42,0.12)] dark:bg-bg-surface/70 dark:shadow-[0_28px_90px_-40px_rgba(0,0,0,0.5)] lg:grid-cols-12 lg:gap-0">
                <div className="relative border-b border-[var(--border-default)] bg-gradient-to-br from-bg-surface via-teal-50/20 to-transparent p-8 dark:from-bg-surface/95 dark:via-teal-950/15 dark:to-transparent sm:p-10 lg:col-span-7 lg:border-b-0 lg:border-r">
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
                    <Code2 className="h-4 w-4" aria-hidden />
                    Developers
                  </div>
                  <h2
                    id="developers-heading"
                    className="mt-5 font-[Outfit,system-ui,sans-serif] text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
                  >
                    API access for integrations
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                    Use scoped API keys with the{' '}
                    <code className="rounded-md border border-teal-500/25 bg-teal-500/[0.08] px-1.5 py-0.5 font-mono text-xs text-teal-800 dark:text-teal-200 sm:text-sm">
                      X-Api-Key
                    </code>{' '}
                    header. Docs follow OpenAPI-style patterns. Owners and admins create
                    and rotate keys in the app.
                  </p>
                  <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border-default)] bg-bg-raised/50 font-mono text-[11px] leading-relaxed dark:bg-black/35">
                    <div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-bg-raised/80 px-3 py-2 dark:bg-black/40">
                      <span className="flex gap-1" aria-hidden>
                        <span className="h-2 w-2 rounded-full bg-red-500/70" />
                        <span className="h-2 w-2 rounded-full bg-amber-500/70" />
                        <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                      </span>
                      <span className="text-[10px] font-medium text-text-muted">example.request</span>
                    </div>
                    <div className="p-3 text-text-muted">
                      <p className="text-teal-600/90 dark:text-teal-400/90">{'// Example'}</p>
                      <p className="mt-1 text-text-secondary">
                        <span className="text-sky-600 dark:text-sky-400">curl</span>
                        <span className="text-text-muted"> -H </span>
                        <span className="text-emerald-600 dark:text-emerald-400">&quot;X-Api-Key: ••••&quot;</span>
                        <span className="text-text-muted"> …</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-text-muted">
                    Open the in-app{' '}
                    <Link
                      href="/developer/api-reference"
                      className={`font-semibold text-teal-700 transition hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 ${landingFocus}`}
                    >
                      API reference
                    </Link>{' '}
                    after you sign in.
                  </p>
                </div>
                <div className="flex flex-col justify-center border-t border-[var(--border-default)] bg-gradient-to-b from-bg-raised/50 to-bg-surface p-8 dark:border-[var(--border-default)] dark:from-neutral-950/40 dark:to-neutral-900/30 sm:p-10 lg:col-span-5 lg:border-t-0 lg:border-l">
                  <Link
                    href="/login?next=%2Fdeveloper%2Fapi-keys"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:brightness-110 ${landingFocus}`}
                  >
                    Sign in for API keys
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <p className="mt-4 text-center text-xs text-text-muted lg:text-left">
                    <span>In the app:</span>{' '}
                    <span className="font-medium text-text-secondary">
                      Sidebar → Developer → API keys
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="relative border-t border-[var(--border-subtle)] bg-gradient-to-b from-bg-base to-[var(--surface-0)] py-16 sm:py-20">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/25 to-transparent"
              aria-hidden
            />
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div
                {...sectionMotion(0)}
                className="relative mb-14 overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.09] via-bg-surface/85 to-orange-500/[0.07] p-8 shadow-[0_20px_60px_-40px_rgba(15,118,110,0.2)] dark:from-teal-500/10 dark:via-bg-surface/50 dark:to-orange-500/10 sm:rounded-3xl sm:p-10"
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-400/15"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-400">
                      Ready when you are
                    </p>
                    <p className="mt-3 font-[Outfit,system-ui,sans-serif] text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
                      One workspace — from past papers to exam-day calm.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                      Join free, run your first timed set, and see weak-topic signals before invigilation — not after
                      results day.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href="/register"
                      className={`btn-primary-sweep inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(255,92,0,0.22)] transition hover:brightness-110 ${landingFocus}`}
                    >
                      Get started free
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href="/pricing"
                      className={`inline-flex items-center justify-center rounded-xl border border-[var(--border-default)] bg-bg-surface/80 px-6 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-sm transition hover:border-teal-500/30 hover:bg-bg-raised ${landingFocus}`}
                    >
                      Compare plans
                    </Link>
                  </div>
                </div>
              </motion.div>

              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
                <div className="sm:col-span-2 lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/25 ring-1 ring-white/15">
                      <GraduationCap className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="font-[Outfit,system-ui,sans-serif] text-2xl font-bold tracking-tight text-text-primary">
                      {BRAND}
                    </span>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
                    Past questions and exam prep for Ghanaian universities — one
                    workspace from papers to practice.
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Product
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-text-secondary">
                    <li>
                      <a
                        href="#story"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Why we exist
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#testimonials"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Testimonials
                      </a>
                    </li>
                    <li>
                      <a
                        href="#pricing"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Plans &amp; pricing
                      </a>
                    </li>
                    <li>
                      <a
                        href="#platform"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Platform &amp; governance
                      </a>
                    </li>
                    <li>
                      <a
                        href="#developers"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        API &amp; developers
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Account
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-text-secondary">
                    <li>
                      <Link
                        href="/login"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Create account
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className={`cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-400 ${landingFocus}`}
                      >
                        Join with invite
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-14 flex flex-col gap-4 border-t border-[var(--border-default)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-muted">
                  © {new Date().getFullYear()} {BRAND}. All rights reserved.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <p className="text-xs text-text-muted">
                    Built for Ghanaian university exam prep.
                  </p>
                  <a
                    href="#top"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 transition hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 ${landingFocus}`}
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
