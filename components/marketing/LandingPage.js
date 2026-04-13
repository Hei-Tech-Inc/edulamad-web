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
import { useTheme } from '../../contexts/ThemeContext'
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
  ChevronDown,
  Quote,
  ArrowUp,
  HelpCircle,
  Code2,
  GraduationCap,
  Check,
  Eye,
  EyeOff,
  Orbit,
} from 'lucide-react'

const BRAND = getMarketingBrandName()

const landingFocus =
  'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]'

const faqItems = [
  {
    q: `Who is ${BRAND} for?`,
    a: 'Ghanaian university students who want reliable past questions, marking-style solutions, and exam practice — without hunting PDFs in chat groups or paying for scattered uploads.',
  },
  {
    q: 'Where do questions and answers come from?',
    a: 'A mix of department-supplied papers, crowdsourced uploads we verify, and AI-generated explanations when official solutions do not exist — clearly labeled so you know what you are studying.',
  },
  {
    q: 'How does exam simulation help?',
    a: 'Practice mode surfaces high-probability topics and timed sets so you rehearse under pressure. Analytics highlight weak areas so revision time goes where it matters.',
  },
  {
    q: 'Is this only for one school?',
    a: 'The catalog is organized by university and course. We are building coverage across public and private institutions in Ghana so your program is easier to find over time.',
  },
  {
    q: 'What does it cost students?',
    a: 'We are focused on cost-effective access — fewer loose fees than buying papers per course from multiple sources. Exact pricing lives in-product as we roll out campuses.',
  },
]

const heroTrustSignals = [
  { icon: ShieldCheck, label: 'Verified sources, labeled clearly' },
  { icon: Sparkles, label: 'AI explanations when keys are missing' },
  { icon: LineChart, label: 'Analytics on weak topics' },
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
  'Past papers are scattered across WhatsApp, Drive, and printouts — impossible to search and easy to lose.',
  'Questions often appear without reliable solutions or marking schemes.',
  'Students need exam-style practice, not another folder of untitled PDFs.',
]

const storySolutions = [
  'One catalog: universities, courses, sessions — built for discovery.',
  'Official schemes where available; transparent AI worked steps everywhere else.',
  'Timed practice and simulations that mirror real hall pressure.',
  'Quality improves as departments and trusted reps contribute together.',
  'Analytics show weak topics so revision time goes where marks are lost.',
]

function LandingMarquee() {
  const reduceMotion = useReducedMotion()
  const doubled = [...CAMPUS_MARQUEE, ...CAMPUS_MARQUEE]

  if (reduceMotion) {
    return (
      <div className="border-y border-white/[0.08] bg-black/20 py-4 text-center backdrop-blur-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Built for Ghanaian universities — coverage roadmap in motion
        </p>
        <p className="sr-only">
          Institutions in our roadmap include: {CAMPUS_MARQUEE.join(', ')}.
        </p>
      </div>
    )
  }

  return (
    <div className="ticker-mask relative border-t border-white/[0.08] bg-black/20 py-3.5 backdrop-blur-md">
      <div
        className="landing-marquee-track landing-marquee-animate"
        aria-hidden
      >
        {doubled.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
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

const moduleCards = [
  {
    label: 'Question bank',
    icon: Library,
    description:
      'Papers by school, course, and year. Searchable. No more endless chat scroll.',
  },
  {
    label: 'Solutions',
    icon: ClipboardCheck,
    description:
      'Schemes where they exist. Clearly marked AI walkthroughs where they do not.',
  },
  {
    label: 'Exam mode',
    icon: Calendar,
    description:
      'Timed sets and high-yield focus — rehearse the exam, not just read answers.',
  },
  {
    label: 'Trusted contributions',
    icon: Users,
    description:
      'Departments and reps upload; verification keeps quality high as you scale.',
  },
  {
    label: 'AI tutor',
    icon: Sparkles,
    description:
      'Hints and step-by-step help on the exact wording of your past papers.',
  },
  {
    label: 'Progress',
    icon: LineChart,
    description:
      'See weak chapters, streaks, and where to revise before it is too late.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Create your workspace',
    body: 'Create your account and workspace. Roles, courses, and permissions map to how you already work.',
  },
  {
    n: '02',
    title: 'Verify & invite',
    body: 'Confirm email, then invite admins and course reps. One bank for everyone.',
  },
  {
    n: '03',
    title: 'Add papers',
    body: 'Upload by year and semester — from departments or vetted student batches.',
  },
  {
    n: '04',
    title: 'Go live',
    body: 'Students practice and run exam mode; you see engagement without chasing files.',
  },
]

const highlights = [
  {
    icon: Library,
    title: 'One catalog',
    copy: 'School, programme, level, session — structured so students find papers in seconds.',
    gridClass: 'md:col-span-2 lg:col-span-7',
  },
  {
    icon: LineChart,
    title: 'Data-backed revision',
    copy: 'Tie attempts to syllabus topics. Spend time on what actually loses marks.',
    gridClass: 'lg:col-span-5',
  },
  {
    icon: ClipboardCheck,
    title: 'Transparent quality',
    copy: 'Every answer tagged: official, community, or AI — so trust is explicit.',
    gridClass: 'lg:col-span-6',
  },
  {
    icon: Shield,
    title: 'Built for Ghana',
    copy: 'Semester rhythm, local marking styles, mobile-first — designed for campus reality.',
    gridClass: 'lg:col-span-6',
  },
]

const statStrip = [
  {
    label: 'Focus',
    value: 'GH',
    hint: 'Universities & programmes on the roadmap',
    icon: Building2,
  },
  {
    label: 'Platform',
    value: '1',
    hint: 'Papers, practice, analytics together',
    icon: Library,
  },
  {
    label: 'People',
    value: '∞',
    hint: 'Students & admins, one shared bank',
    icon: Users,
  },
  {
    label: 'Depth',
    value: '24/7',
    hint: 'Practice when the library is closed',
    icon: Orbit,
  },
]

const previewRows = [
  { courseCode: 'FIN 201',  status: '98% ready',   session: '4.5h', pill: 'pill-green'  },
  { courseCode: 'CS 205',   status: 'Review weak',  session: '2.1h', pill: 'pill-amber'  },
  { courseCode: 'MATH 152', status: 'Sim due',      session: '45m',  pill: 'pill-orange' },
]

function SectionHeading({
  eyebrow,
  title,
  description,
  className = '',
  descriptionClassName = '',
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400/90">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-[Outfit,system-ui,sans-serif] text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.15rem] sm:leading-[1.1] lg:text-[2.5rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg ${descriptionClassName}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

function HeroShowcase({ reducedMotion }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg dashboard-card"
    >
      <div className="overflow-hidden rounded-2xl bg-[#0a0a0a]/95 shadow-[0_32px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05]">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/65" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/65" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/65" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{BRAND}</p>
              <p className="text-[10px] text-slate-500">Exam prep · dashboard</p>
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
                className="animated-border-inner animated-border-inner-dim rounded-xl bg-white/[0.03] px-2 py-2.5 text-center"
              >
                <p className="text-lg font-semibold tabular-nums text-white">
                  {cell.v}
                </p>
                <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                  {cell.k}
                </p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Focus courses
            </p>
            <div className="animated-border-inner animated-border-inner-dim overflow-hidden rounded-xl">
              <div className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Course</span>
                <span className="text-right">Status</span>
                <span className="text-right">Time</span>
              </div>
              {previewRows.map((row) => (
                <div
                  key={row.courseCode}
                  className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-white/[0.05] px-3 py-2 text-[11px] last:border-b-0"
                >
                  <span className="font-bold text-slate-200">
                    {row.courseCode}
                  </span>
                  <span className={`text-right ${row.pill}`}>{row.status}</span>
                  <span className="text-right tabular-nums text-slate-400">
                    {row.session}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Overall readiness</span>
              <span className="tabular-nums text-orange-400/90">82%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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
  )
}

function CursorGlowButton({ href, children, className = '' }) {
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false })

  return (
    <Link
      href={href}
      onMouseEnter={() => setGlow((g) => ({ ...g, active: true }))}
      onMouseLeave={() => setGlow((g) => ({ ...g, active: false }))}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setGlow({ x, y, active: true })
      }}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(255,92,0,0.3)] transition duration-200 hover:brightness-110 ${className}`}
      style={{
        backgroundImage: glow.active
          ? `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.98) 0%, rgba(255,231,196,0.95) 28%, rgba(255,177,95,0.9) 52%, rgba(255,122,38,0.88) 78%, rgba(255,108,28,0.82) 100%)`
          : 'linear-gradient(95deg, rgba(255,255,255,0.96) 0%, rgba(255,228,184,0.93) 30%, rgba(255,173,90,0.92) 64%, rgba(255,122,38,0.9) 100%)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            glow.active
              ? `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.7), transparent 42%)`
              : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 45%)',
        }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
        animate={glow.active ? { x: ['-140%', '280%'] } : { x: '-140%' }}
        transition={glow.active ? { duration: 1.1, ease: 'easeOut' } : { duration: 0 }}
      />
      <span className="relative z-[1]">{children}</span>
    </Link>
  )
}

function ClockShowcase({ reducedMotion }) {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#040507] py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,92,0,0.12),transparent_45%),radial-gradient(ellipse_at_70%_80%,rgba(99,102,241,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#05070d]/90 px-6 py-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)] sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute left-0 top-[45%] h-[220px] w-[220px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-orange-500/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-[60%] h-[260px] w-[260px] translate-x-1/4 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-3xl"
            aria-hidden
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative mx-auto h-[290px] w-[290px] sm:h-[380px] sm:w-[380px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/20 to-black/80 shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
          <div className="absolute inset-[8%] rounded-full border border-white/10 bg-black/75 backdrop-blur-md" />
          <div className="absolute inset-[15%] rounded-full border border-orange-400/30 bg-[conic-gradient(from_120deg,rgba(255,110,43,0.95),rgba(255,110,43,0.1),rgba(85,120,255,0.88),rgba(255,110,43,0.95))] opacity-95" />
          <div className="absolute inset-[23%] rounded-full border border-white/10 bg-[#0b0f18]/90" />
          <motion.div
            aria-hidden
            className="absolute inset-[15%] rounded-full border border-orange-300/20"
            animate={
              reducedMotion
                ? undefined
                : { boxShadow: ['0 0 24px rgba(255,120,40,0.15)', '0 0 34px rgba(80,104,255,0.2)', '0 0 24px rgba(255,120,40,0.15)'] }
            }
            transition={
              reducedMotion ? undefined : { duration: 4.5, ease: 'easeInOut', repeat: Infinity }
            }
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const deg = i * 30
            return (
              <span
                key={`tick-${deg}`}
                className="absolute left-1/2 top-1/2 h-[2px] w-[8px] origin-left bg-white/35"
                style={{
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateX(130px)`,
                  opacity: i % 3 === 0 ? 0.75 : 0.4,
                }}
              />
            )
          })}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[34%] w-[2px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-orange-400 to-white shadow-[0_0_20px_rgba(255,129,66,0.75)]"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 14, ease: 'linear', repeat: Infinity }
            }
          />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[26%] w-[1px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-indigo-300/80 to-indigo-100/90 shadow-[0_0_12px_rgba(99,102,241,0.7)]"
            animate={reducedMotion ? undefined : { rotate: -360 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 40, ease: 'linear', repeat: Infinity }
            }
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[18%] w-[1px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-white/70 to-white"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={
              reducedMotion ? undefined : { duration: 2, ease: 'linear', repeat: Infinity }
            }
          />
          <motion.div
            aria-hidden
            className="absolute inset-[25%] rounded-full border border-white/10"
            animate={reducedMotion ? undefined : { scale: [1, 1.015, 1] }}
            transition={reducedMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300/90">
            Design spotlight
          </p>
          <h2 className="mt-3 font-[Outfit,system-ui,sans-serif] text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl">
            Join the
            <br />
            Movement
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            A cinematic interaction block inspired by the style you shared,
            refined with deeper glass layers, dual-hand motion, and a CTA that
            tracks your cursor with a live light sweep.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <CursorGlowButton href="/register">See it in action</CursorGlowButton>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              Join our community
            </Link>
          </div>
        </div>
      </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const { theme } = useTheme()
  const isDarkFaq = theme === 'dark'
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  /** FAQ items can be expanded independently (Pasqo-style Q&A). */
  const [openFaq, setOpenFaq] = useState(() => ({}))

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

  const faqMotionDuration = reduceMotion ? 'duration-0' : 'duration-300'
  const faqMotionEase = reduceMotion ? '' : 'ease-[cubic-bezier(0.22,1,0.36,1)]'

  const heroSectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  })
  const heroOrbY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-x-hidden font-sans text-neutral-100 antialiased"
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
          className="fixed left-4 top-0 z-[100] -translate-y-[120%] rounded-b-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition duration-200 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
        >
          Skip to main content
        </a>
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent"
          aria-hidden
        />

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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/35 bg-gradient-to-br from-orange-500/25 to-amber-500/10 text-orange-200 shadow-[0_8px_24px_rgba(14,165,233,0.18),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition group-hover:border-orange-300/50">
                <GraduationCap className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="font-[Outfit,system-ui,sans-serif] text-xl font-bold tracking-tight">
                {BRAND}
              </span>
            </Link>
            <nav
              className="landing-header-desktop-only hidden items-center gap-7 text-sm font-medium text-slate-400 lg:gap-9 md:flex"
              aria-label="Primary"
            >
              {[
                ['#story', 'Why'],
                ['#modules', 'Modules'],
                ['#product', 'Product'],
                ['#onboarding', 'Onboarding'],
                ['#faq', 'FAQ'],
                ['#platform', 'Platform'],
                ['#developers', 'Developers'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`transition hover:text-white hover:underline hover:decoration-orange-500/80 hover:underline-offset-4 ${landingFocus}`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="landing-header-desktop-ctas hidden items-center gap-2 md:flex sm:gap-3">
              <Link
                href="/login"
                className={`landing-glass-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white sm:px-4 ${landingFocus}`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={`btn-primary-sweep inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-gradient-to-r from-orange-400 to-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_28px_rgba(34,211,238,0.28),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition hover:brightness-110 sm:px-4 ${landingFocus}`}
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <button
              type="button"
              className={`landing-header-mobile-only inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white transition hover:border-orange-400/35 hover:bg-white/[0.1] md:hidden ${landingFocus}`}
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
            data-open={mobileNavOpen ? 'true' : 'false'}
            className={`landing-header-mobile-panel border-t border-white/10 bg-[#050a12]/95 backdrop-blur-xl transition-[opacity,visibility] duration-200 md:hidden ${
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
                ['#story', 'Why'],
                ['#modules', 'Modules'],
                ['#product', 'Product'],
                ['#onboarding', 'Onboarding'],
                ['#faq', 'FAQ'],
                ['#platform', 'Platform'],
                ['#developers', 'Developers'],
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
                  href="/register"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(14,165,233,0.3)] ${landingFocus}`}
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
            ref={heroSectionRef}
            className="hero-grain relative overflow-hidden pb-4 pt-8 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8"
            aria-labelledby="hero-heading"
          >
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
              <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-16">
                <div className="lg:pr-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400/90">
                    Ghana · university exam prep
                  </p>
                  <h1
                    id="hero-heading"
                    className="mt-5 font-[Outfit,system-ui,sans-serif] text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem] lg:leading-[1.02]"
                  >
                    Past papers and practice,{' '}
                    <span className="bg-gradient-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
                      finally in one place.
                    </span>
                  </h1>
                  <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
                    Official schemes when they exist. Clear AI when they do not.
                    Timed sets and weak-topic analytics — built for semester exams,
                    not another folder of PDFs.
                  </p>
                  <ul
                    className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2"
                    role="list"
                    aria-label="Platform highlights"
                  >
                    {heroTrustSignals.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-2 text-sm text-slate-400"
                      >
                        <Icon
                          className="h-4 w-4 shrink-0 text-orange-400"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href="/register"
                      className={`btn-primary-sweep group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_20px_50px_rgba(255,92,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition duration-200 hover:bg-neutral-200 sm:px-7 sm:text-base ${landingFocus}`}
                    >
                      Get started free
                      <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
                    </Link>
                    <Link
                      href="/login"
                      className={`btn-secondary-sweep inline-flex cursor-pointer items-center justify-center rounded-xl border border-orange-500/55 bg-transparent px-6 py-3.5 text-sm font-semibold text-orange-300 transition duration-200 hover:border-orange-400 hover:bg-orange-500/10 sm:px-7 sm:text-base ${landingFocus}`}
                    >
                      Sign in
                    </Link>
                    <a
                      href="#story"
                      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-orange-300/95 underline-offset-4 transition duration-200 hover:text-white hover:underline sm:px-3 ${landingFocus}`}
                    >
                      Why {BRAND}
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                  <p className="mt-6 text-sm text-slate-500">
                    Invited to a team?{' '}
                    <Link
                      href="/signup"
                      className={`font-semibold text-orange-400 transition hover:text-orange-300 hover:underline hover:underline-offset-4 ${landingFocus}`}
                    >
                      Join here
                    </Link>
                  </p>
                </div>

                <div className="flex min-h-[280px] justify-center lg:min-h-[320px] lg:justify-end">
                  {mounted ? (
                    <HeroShowcase reducedMotion={reduceMotion} />
                  ) : (
                    <div
                      className="landing-glass h-[320px] w-full max-w-md animate-pulse rounded-2xl lg:max-w-lg"
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 sm:mt-14">
              <LandingMarquee />
            </div>
          </section>

          {/* Stat strip — single band, no card chrome */}
          <section
            className="border-y border-white/[0.06] bg-white/[0.02]"
            aria-label="Platform at a glance"
          >
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6 lg:divide-x lg:divide-white/[0.08]">
                {statStrip.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={s.label}
                      {...sectionMotion(i * 0.06)}
                      className="flex flex-col items-center text-center lg:px-6 lg:first:pl-0 lg:last:pr-0"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-orange-400/90">
                        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      <p className="mt-4 font-[Outfit,system-ui,sans-serif] text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl">
                        {s.value}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {s.label}
                      </p>
                      <p className="mt-2 max-w-[14rem] text-sm leading-snug text-slate-500">
                        {s.hint}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Problem → solution — single panel */}
          <section
            id="story"
            className="scroll-mt-24 bg-[#050505] py-20 sm:py-24 lg:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div {...sectionMotion(0)} className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400/90">
                  Why we exist
                </p>
                <h2 className="mt-3 font-[Outfit,system-ui,sans-serif] text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                  Exam prep should be one system — not a pile of PDFs.
                </h2>
                <p className="mx-auto mt-4 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
                  {BRAND} brings past questions, solutions, timed practice, and
                  analytics into one workspace — so revision is confident and reps
                  see where courses need support.
                </p>
              </motion.div>

              <motion.div
                {...sectionMotion(0.08)}
                className="mt-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/80 sm:rounded-3xl"
              >
                <div className="grid divide-y divide-white/[0.08] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                  <div className="p-8 sm:p-10 lg:p-12">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08] text-red-400/90">
                        <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-white">
                          The gap today
                        </h3>
                        <p className="text-sm text-slate-500">
                          What breaks before the exam
                        </p>
                      </div>
                    </div>
                    <ul className="mt-8 space-y-5">
                      {storyProblems.map((line) => (
                        <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600"
                            aria-hidden
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 sm:p-10 lg:p-12">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400/95">
                        <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-white">
                          What {BRAND} changes
                        </h3>
                        <p className="text-sm text-slate-500">
                          How we close the loop
                        </p>
                      </div>
                    </div>
                    <ul className="mt-8 space-y-5">
                      {storySolutions.map((line) => (
                        <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                          <Check
                            className="mt-0.5 h-5 w-5 shrink-0 text-orange-400/80"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-white/[0.08] bg-orange-500/[0.04] px-8 py-6 sm:px-10 sm:py-7 lg:px-12">
                  <p className="text-sm font-medium leading-relaxed text-slate-300 sm:text-[0.9375rem]">
                    <span className="font-semibold text-white">
                      Reliable answers, honest labels, exam-shaped practice.
                    </span>{' '}
                    That is the bar — not another folder of scans.
                  </p>
                  <a
                    href="#modules"
                    className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-300 transition hover:text-white ${landingFocus}`}
                  >
                    Explore the workspace
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Capabilities */}
          <section
            id="modules"
            className="scroll-mt-24 border-t border-white/[0.06] bg-[#060606] py-20 sm:py-24 lg:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                <SectionHeading
                  eyebrow={`Inside ${BRAND}`}
                  title="Everything in one workspace"
                  description="Bank, solutions, exam mode, contributions, AI help, and analytics — the stack you were juggling across chats and drives, unified."
                  className="max-w-2xl"
                />
                <a
                  href="#product"
                  className={`inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-orange-400 transition hover:text-orange-300 lg:mb-1 ${landingFocus}`}
                >
                  Product principles
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </a>
              </div>

              <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {moduleCards.map(({ label, icon: Icon, description }, i) => (
                  <motion.li
                    key={label}
                    {...sectionMotion(0.04 + i * 0.04)}
                    className="group flex h-full flex-col rounded-xl border border-white/[0.08] bg-transparent p-5 transition duration-200 hover:border-orange-500/25 hover:bg-white/[0.02] sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-orange-400/90 transition group-hover:border-orange-500/20 group-hover:bg-orange-500/[0.06]">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-[Outfit,system-ui,sans-serif] text-base font-semibold text-white sm:text-lg">
                          {label}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          {/* Product — bento */}
          <section
            id="product"
            className="scroll-mt-24 border-t border-white/[0.06] bg-[#050505] py-20 sm:py-24 lg:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <SectionHeading
                eyebrow="Product"
                title="Discipline before the invigilator walks in"
                description="Know what you have revised — not what you meant to open the night before. Built for courses, year groups, and the keys that never arrived."
                className="max-w-2xl"
              />

              <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
                {highlights.map(({ icon: Icon, title, copy, gridClass }, i) => (
                  <motion.div
                    key={title}
                    {...sectionMotion(0.05 + i * 0.05)}
                    className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c]/90 p-6 transition duration-200 hover:border-orange-500/25 sm:p-8 ${gridClass}`}
                  >
                    <div
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/[0.06] blur-3xl transition duration-300 group-hover:bg-orange-500/[0.1]"
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-orange-400/90">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <h3 className="mt-5 font-[Outfit,system-ui,sans-serif] text-lg font-semibold leading-snug text-white sm:text-xl">
                        {title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 sm:text-[0.9375rem]">
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
            className="border-y border-white/[0.06] bg-[#080808] py-16 sm:py-20"
            aria-label="Why a single exam-prep system matters"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div
                {...sectionMotion(0)}
                className="relative mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/90 p-8 sm:p-10 lg:p-12"
              >
                <Quote
                  className="h-8 w-8 text-orange-500/35 sm:h-9 sm:w-9"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <blockquote className="mt-6 text-pretty font-[Outfit,system-ui,sans-serif] text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl sm:leading-snug">
                  <p>
                    One home for papers, solutions, and practice means students stop
                    betting on whichever file hit the group chat last — and reps see
                    which courses need help before results day.
                  </p>
                </blockquote>
                <p className="mt-6 border-t border-white/[0.06] pt-6 text-sm text-slate-500">
                  For course reps, departments, and students at Ghanaian universities
                </p>
              </motion.div>
            </div>
          </section>

          {/* Onboarding */}
          <section
            id="onboarding"
            className="scroll-mt-24 border-t border-white/[0.06] bg-[#050505] py-20 sm:py-24 lg:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow="Onboarding"
                  title="From signup to your first live set"
                  description="A path faculty or society leads can repeat every intake — clear to delegate, tight enough to scale."
                  className="max-w-xl"
                />
                <Link
                  href="/register"
                  className={`btn-primary-sweep group inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(255,92,0,0.2)] transition duration-200 hover:brightness-110 lg:mb-0.5 ${landingFocus}`}
                >
                  <Users className="h-4 w-4" strokeWidth={2} />
                  Get started
                  <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <ol className="relative mx-auto mt-14 max-w-2xl lg:mx-0 lg:max-w-none">
                {steps.map((s, i) => (
                  <motion.li
                    key={s.n}
                    {...sectionMotion(0.05 + i * 0.05)}
                    className="relative flex gap-5 pb-12 last:pb-0 sm:gap-8"
                  >
                    {i < steps.length - 1 ? (
                      <div
                        className="absolute left-[1.15rem] top-11 hidden h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-orange-500/35 via-white/10 to-transparent sm:block"
                        aria-hidden
                      />
                    ) : null}
                    <div className="relative z-[1] flex shrink-0 flex-col items-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-500/40 bg-[#0a0a0a] font-[Outfit,system-ui,sans-serif] text-xs font-bold text-orange-300 sm:h-10 sm:w-10 sm:text-sm">
                        {s.n}
                      </span>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Step {i + 1}
                      </p>
                      <h3 className="mt-1 font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-white sm:text-xl">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-[0.9375rem]">
                        {s.body}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* FAQ — theme-aware (matches landing orange/slate; light + dark) */}
          <section
            id="faq"
            className={
              isDarkFaq
                ? 'scroll-mt-24 border-t border-white/[0.08] bg-[#070a12] py-16 sm:py-20 lg:py-24'
                : 'scroll-mt-24 border-t border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 py-16 sm:py-20 lg:py-24'
            }
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4 lg:pt-1">
                  <div
                    className={
                      isDarkFaq
                        ? 'mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-400/95'
                        : 'mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700'
                    }
                  >
                    <HelpCircle
                      className={
                        isDarkFaq ? 'h-4 w-4 text-orange-400' : 'h-4 w-4 text-orange-600'
                      }
                      strokeWidth={2}
                      aria-hidden
                    />
                    Help
                  </div>
                  <h2
                    id="faq-heading"
                    className={
                      isDarkFaq
                        ? 'text-balance font-[Outfit,system-ui,sans-serif] text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl'
                        : 'text-balance font-[Outfit,system-ui,sans-serif] text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'
                    }
                  >
                    Questions &amp; answers
                  </h2>
                  <p
                    className={
                      isDarkFaq
                        ? 'mt-3 max-w-sm text-pretty text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]'
                        : 'mt-3 max-w-sm text-pretty text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]'
                    }
                  >
                    Straight answers to what students and course reps ask before
                    they rely on a new prep tool.
                  </p>
                  <div
                    className={
                      isDarkFaq
                        ? 'mt-8 rounded-xl border border-white/[0.1] bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm'
                        : 'mt-8 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm'
                    }
                  >
                    <p
                      className={
                        isDarkFaq
                          ? 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'
                          : 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'
                      }
                    >
                      More on {BRAND}
                    </p>
                    <p
                      className={
                        isDarkFaq
                          ? 'mt-2 text-sm leading-relaxed text-slate-300'
                          : 'mt-2 text-sm leading-relaxed text-slate-600'
                      }
                    >
                      <a
                        href="#platform"
                        className={
                          isDarkFaq
                            ? 'font-medium text-orange-300 underline decoration-orange-400/35 underline-offset-2 transition hover:text-orange-200'
                            : 'font-medium text-orange-700 underline decoration-orange-600/30 underline-offset-2 transition hover:text-orange-800'
                        }
                      >
                        Platform &amp; governance
                      </a>
                      {' · '}
                      <a
                        href="#onboarding"
                        className={
                          isDarkFaq
                            ? 'font-medium text-orange-300 underline decoration-orange-400/35 underline-offset-2 transition hover:text-orange-200'
                            : 'font-medium text-orange-700 underline decoration-orange-600/30 underline-offset-2 transition hover:text-orange-800'
                        }
                      >
                        Onboarding
                      </a>
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div
                    className={
                      isDarkFaq
                        ? 'overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0c1018] shadow-[0_24px_64px_rgba(0,0,0,0.45)] sm:rounded-2xl'
                        : 'overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_40px_rgba(15,23,42,0.06)] sm:rounded-2xl'
                    }
                  >
                    <div
                      className={
                        isDarkFaq
                          ? 'border-b border-white/[0.08] bg-gradient-to-r from-orange-500/[0.06] to-transparent px-5 py-4 sm:px-6 sm:py-5'
                          : 'border-b border-slate-100 bg-gradient-to-r from-orange-50/80 to-transparent px-5 py-4 sm:px-6 sm:py-5'
                      }
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p
                            className={
                              isDarkFaq
                                ? 'font-[Outfit,system-ui,sans-serif] text-lg font-bold text-white sm:text-xl'
                                : 'font-[Outfit,system-ui,sans-serif] text-lg font-bold text-slate-900 sm:text-xl'
                            }
                          >
                            Common questions
                          </p>
                          <p
                            className={
                              isDarkFaq
                                ? 'mt-0.5 text-sm text-slate-500'
                                : 'mt-0.5 text-sm text-slate-500'
                            }
                          >
                            {BRAND} · help · {faqItems.length}{' '}
                            {faqItems.length === 1 ? 'topic' : 'topics'}
                          </p>
                        </div>
                        <span className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(234,88,12,0.35)]">
                          Help center
                        </span>
                      </div>
                    </div>

                    <ul
                      className={
                        isDarkFaq ? 'divide-y divide-white/[0.08]' : 'divide-y divide-slate-100'
                      }
                      role="list"
                    >
                      {faqItems.map(({ q, a }, i) => {
                        const isOpen = Boolean(openFaq[i])
                        const panelId = `faq-panel-${i}`
                        const triggerId = `faq-trigger-${i}`
                        const toggle = () =>
                          setOpenFaq((prev) => ({
                            ...prev,
                            [i]: !prev[i],
                          }))
                        return (
                          <li key={q} className="px-5 py-5 sm:px-6 sm:py-6">
                            <div className="flex gap-3 sm:gap-4">
                              <span
                                className={
                                  isDarkFaq
                                    ? 'shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-slate-600'
                                    : 'shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-slate-400'
                                }
                                aria-hidden
                              >
                                {i + 1}.
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  id={`faq-q-${i}`}
                                  className={
                                    isDarkFaq
                                      ? 'text-[0.9375rem] font-medium leading-snug text-slate-100 sm:text-base'
                                      : 'text-[0.9375rem] font-medium leading-snug text-slate-900 sm:text-base'
                                  }
                                >
                                  {q}
                                </p>
                                <button
                                  type="button"
                                  id={triggerId}
                                  aria-expanded={isOpen}
                                  aria-controls={panelId}
                                  onClick={toggle}
                                  className={
                                    isDarkFaq
                                      ? `mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-slate-200 shadow-sm transition hover:border-orange-500/35 hover:bg-white/[0.1] ${reduceMotion ? '' : 'active:scale-[0.99]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1018]`
                                      : `mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${reduceMotion ? '' : 'active:scale-[0.99]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white`
                                  }
                                >
                                  {isOpen ? (
                                    <EyeOff
                                      className={
                                        isDarkFaq
                                          ? 'h-4 w-4 text-slate-400'
                                          : 'h-4 w-4 text-slate-500'
                                      }
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  ) : (
                                    <Eye
                                      className={
                                        isDarkFaq
                                          ? 'h-4 w-4 text-slate-400'
                                          : 'h-4 w-4 text-slate-500'
                                      }
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  )}
                                  {isOpen ? 'Hide answer' : 'Show answer'}
                                </button>
                                <div
                                  id={panelId}
                                  role="region"
                                  aria-labelledby={`faq-q-${i} ${triggerId}`}
                                  className={`grid overflow-hidden transition-[grid-template-rows] ${faqMotionDuration} ${faqMotionEase} ${
                                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                  }`}
                                >
                                  <div className="min-h-0">
                                    <div
                                      className={
                                        isDarkFaq
                                          ? 'mt-4 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 sm:px-5 sm:py-4'
                                          : 'mt-4 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 sm:px-5 sm:py-4'
                                      }
                                    >
                                      <p
                                        className={
                                          isDarkFaq
                                            ? 'text-[11px] font-semibold uppercase tracking-wider text-slate-500'
                                            : 'text-[11px] font-semibold uppercase tracking-wider text-slate-500'
                                        }
                                      >
                                        Answer
                                      </p>
                                      <p
                                        className={
                                          isDarkFaq
                                            ? 'mt-2 text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]'
                                            : 'mt-2 text-sm leading-relaxed text-slate-700 sm:text-[0.9375rem]'
                                        }
                                      >
                                        {a}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform CTA */}
          <section
            id="platform"
            className="scroll-mt-24 border-t border-white/[0.06] bg-[#050505] py-20 sm:py-24 lg:py-28"
            aria-labelledby="platform-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <motion.div
                {...sectionMotion(0)}
                className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:rounded-3xl"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/[0.08] via-transparent to-amber-500/[0.05]"
                  aria-hidden
                />
                <GraduationCap
                  className="pointer-events-none absolute -bottom-6 -right-2 h-40 w-40 text-orange-400/[0.06] sm:h-52 sm:w-52 lg:right-[6%]"
                  strokeWidth={1}
                  aria-hidden
                />

                <div className="relative grid gap-10 p-8 sm:gap-12 sm:p-10 lg:grid-cols-12 lg:items-stretch lg:gap-0 lg:p-12 xl:p-14">
                  <div className="lg:col-span-7 lg:border-r lg:border-white/[0.08] lg:pr-10 xl:pr-14">
                    <div className="inline-flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-orange-300">
                        <Building2 className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400/90">
                        Platform &amp; governance
                      </p>
                    </div>
                    <h2
                      id="platform-heading"
                      className="mt-5 font-[Outfit,system-ui,sans-serif] text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl"
                    >
                      Governance{' '}
                      <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                        reps and departments trust
                      </span>
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                      When whole year groups hit the same exam window, the system
                      stays stable. Content and permission changes stay attributable
                      — short disputes, confident students.
                    </p>
                    <ul className="mt-8 space-y-4 lg:max-w-lg">
                      {[
                        {
                          icon: ShieldCheck,
                          text: 'Attributable events across courses and question banks',
                        },
                        {
                          icon: ClipboardCheck,
                          text: 'Moderation aligned with how departments already review',
                        },
                        {
                          icon: Building2,
                          text: 'Clear hierarchy for teams, programmes, and courses',
                        },
                      ].map(({ icon: Icon, text }) => (
                        <li
                          key={text}
                          className="flex items-start gap-3 text-sm leading-snug text-slate-400"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-orange-400/90">
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex lg:col-span-5 lg:pl-10 xl:pl-14">
                    <div className="flex w-full flex-col justify-center rounded-2xl border border-white/[0.08] bg-[#080808]/80 p-6 sm:p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Next step
                      </p>
                      <p className="mt-2 font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-white">
                        Get started
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Create an account, then invite reps and admins when your
                        catalog is ready.
                      </p>
                      <div className="mt-6 flex flex-col gap-3">
                        <Link
                          href="/register"
                          className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(255,92,0,0.2)] transition duration-200 hover:brightness-110 sm:text-base ${landingFocus}`}
                        >
                          Create account
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                        <Link
                          href="/login"
                          className={`inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-white/[0.12] bg-transparent px-6 py-3.5 text-sm font-medium text-slate-300 transition duration-200 hover:border-white/20 hover:bg-white/[0.05] sm:text-base ${landingFocus}`}
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
            className="scroll-mt-24 border-t border-white/[0.06] bg-[#060606] py-20 sm:py-24"
            aria-labelledby="developers-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] lg:grid-cols-12 lg:gap-0">
                <div className="border-b border-white/[0.08] p-8 sm:p-10 lg:col-span-7 lg:border-b-0 lg:border-r">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-400/90">
                    <Code2 className="h-4 w-4" aria-hidden />
                    Developers
                  </div>
                  <h2
                    id="developers-heading"
                    className="mt-4 font-[Outfit,system-ui,sans-serif] text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                  >
                    API access for integrations
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
                    Scoped keys, the{' '}
                    <code className="rounded-md border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 text-xs text-orange-200/95 sm:text-sm">
                      X-Api-Key
                    </code>{' '}
                    header, and OpenAPI-aligned docs. Owners and admins create and
                    rotate keys in the app.
                  </p>
                  <p className="mt-4 text-xs leading-relaxed text-slate-600">
                    Open the in-app{' '}
                    <Link
                      href="/developer/api-reference"
                      className={`font-medium text-orange-400 transition hover:text-orange-300 ${landingFocus}`}
                    >
                      API reference
                    </Link>{' '}
                    after you sign in.
                  </p>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-5">
                  <Link
                    href="/login?next=%2Fdeveloper%2Fapi-keys"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(255,92,0,0.18)] transition hover:brightness-110 ${landingFocus}`}
                  >
                    Sign in for API keys
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <p className="mt-4 text-center text-xs text-slate-600 lg:text-left">
                    <span className="text-slate-500">In the app:</span>{' '}
                    <span className="font-medium text-slate-400">
                      Sidebar → Developer → API keys
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <ClockShowcase reducedMotion={reduceMotion} />

          <footer className="border-t border-white/[0.06] bg-[#050505] py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
                <div className="sm:col-span-2 lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/35 bg-gradient-to-br from-orange-500/25 to-amber-500/10 text-orange-200 shadow-[0_8px_24px_rgba(14,165,233,0.18)]">
                      <GraduationCap className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="font-[Outfit,system-ui,sans-serif] text-2xl font-bold tracking-tight text-white">
                      {BRAND}
                    </span>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                    Past questions and exam prep for Ghanaian universities — one
                    workspace from papers to practice.
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Product
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-400">
                    <li>
                      <a
                        href="#story"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Why we exist
                      </a>
                    </li>
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
                        Product principles
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
                    <li>
                      <a
                        href="#developers"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Developers &amp; API
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
                        href="/register"
                        className={`cursor-pointer transition hover:text-white ${landingFocus}`}
                      >
                        Create account
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
                  © {new Date().getFullYear()} {BRAND}. All rights reserved.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <p className="text-xs text-slate-600">
                    Built for Ghanaian university exam prep.
                  </p>
                  <a
                    href="#top"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500/90 transition hover:text-orange-400 ${landingFocus}`}
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
