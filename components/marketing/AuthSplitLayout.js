import Link from 'next/link'
import { CheckCircle2, GraduationCap } from 'lucide-react'
import { getMarketingBrandName } from '@/lib/landing-brand'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const BRAND = getMarketingBrandName()

const authFocus =
  'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]'

export default function AuthSplitLayout({
  children,
  title = `Study smarter with ${BRAND}`,
  subtitle = 'Past questions, timed practice, and focused revision built for serious learners.',
  points = [],
  asideEyebrow = 'Built for exam prep',
}) {
  const featurePoints = points.length
    ? points
    : [
        'Comprehensive question bank',
        'Powerful filtering and search',
        'Bookmarks and quiz mode',
        'Daily challenges',
      ]

  return (
    <div className="min-h-dvh bg-bg-base p-1.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-text-primary sm:p-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl border border-[var(--border-default)] bg-bg-surface/80 shadow-[0_30px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-bg-surface/35 dark:shadow-[0_30px_70px_rgba(0,0,0,0.45)] lg:grid lg:h-[min(100dvh,100svh)] lg:min-h-0 lg:max-h-[calc(100dvh-1.25rem)] lg:grid-cols-2 lg:overflow-hidden">
        <section className="flex items-start justify-center p-3 sm:p-8 lg:max-h-full lg:min-h-0 lg:items-center lg:overflow-y-auto lg:border-r lg:border-[var(--border-subtle)] lg:p-12">
          <div className="w-full max-w-md py-2 sm:py-0">
            <div className="mb-4 flex items-center justify-between gap-3 sm:mb-8">
              <Link
                href="/"
                className={`inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition hover:text-teal-700 dark:hover:text-teal-400 ${authFocus}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-400/35 bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-300">
                  <GraduationCap className="h-4 w-4" strokeWidth={2} />
                </span>
                {BRAND}
              </Link>
              <ThemeToggle size="sm" iconOnly />
            </div>
            {children}
          </div>
        </section>

        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-teal-500/[0.12] via-bg-base to-orange-500/[0.1] dark:from-teal-950/45 dark:via-slate-950 dark:to-slate-900 lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:px-12 lg:py-14 xl:px-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 -left-20 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-600/10"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-800 dark:text-teal-300">
              {asideEyebrow}
            </p>
            <h2 className="mt-5 text-balance font-[Outfit,system-ui,sans-serif] text-3xl font-bold leading-tight tracking-tight text-text-primary xl:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-text-secondary">{subtitle}</p>

            <ul className="mt-10 max-w-prose space-y-4">
              {featurePoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed text-text-secondary">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
