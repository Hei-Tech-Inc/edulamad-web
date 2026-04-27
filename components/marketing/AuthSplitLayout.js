import Link from 'next/link'
import { CheckCircle2, GraduationCap } from 'lucide-react'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

export default function AuthSplitLayout({
  children,
  title = `Study smarter with ${BRAND}`,
  subtitle = 'Past questions, timed practice, and focused revision built for serious learners.',
  points = [],
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
    <div className="min-h-dvh bg-[#05070d] p-1.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl border border-white/10 bg-[#070a12] shadow-[0_30px_70px_rgba(0,0,0,0.45)] lg:grid lg:h-[min(100dvh,100svh)] lg:min-h-0 lg:max-h-[calc(100dvh-1.25rem)] lg:grid-cols-2 lg:overflow-hidden">
        <section className="flex items-start justify-center p-3 sm:p-8 lg:max-h-full lg:min-h-0 lg:items-center lg:overflow-y-auto lg:border-r lg:border-white/10 lg:p-12">
          <div className="w-full max-w-md py-2 sm:py-0">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-200 sm:mb-8"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-300">
                <GraduationCap className="h-4 w-4" />
              </span>
              {BRAND}
            </Link>
            {children}
          </div>
        </section>

        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#090c14] via-[#0f172a] to-[#0b1220] p-10 text-white lg:block">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-400/25 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-md">
            <p className="text-sm font-semibold text-orange-100">Join ambitious learners</p>
            <h2 className="mt-6 text-4xl font-bold leading-tight">{title}</h2>
            <p className="mt-4 text-base text-slate-100/90">{subtitle}</p>

            <div className="mt-10 space-y-4">
              {featurePoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-orange-200" />
                  <p className="text-sm text-slate-100">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
