import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, FileText, UserCircle2 } from 'lucide-react'
import { catalogBadge, readinessPercent } from './myCoursesCatalogUtils'

function initials(course) {
  const raw = (course.code || course.name || '?').trim()
  return raw.slice(0, 2).toUpperCase()
}

function enrollmentBadgeCopy(status) {
  if (status === 'in_progress') return { label: 'In progress', tone: 'primary' }
  if (status === 'completed') return { label: 'Completed', tone: 'success' }
  if (status === 'not_started') return { label: 'Start', tone: 'neutral' }
  return null
}

export default function MyCourseCard({
  course,
  stats,
  departmentName,
  instructorName,
  thumbnailUrl,
  enrollmentStatus,
  href,
  statsLoading,
}) {
  const q = stats?.questionCount ?? 0
  const s = stats?.slidesCount ?? 0
  const pct = readinessPercent(q, s)
  const badge = catalogBadge(q, s)
  const resourceLine = `${q} question${q === 1 ? '' : 's'} · ${s} slide deck${s === 1 ? '' : 's'}`
  const enrollBadge = enrollmentBadgeCopy(enrollmentStatus)

  const toneClasses = {
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    primary: 'bg-sky-100 text-sky-800 ring-sky-200/80',
    sky: 'bg-cyan-50 text-cyan-900 ring-cyan-200/70',
    success: 'bg-emerald-50 text-emerald-900 ring-emerald-200/80',
  }

  const subtitle = instructorName || departmentName || 'Your department'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition-shadow hover:shadow-md"
    >
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-[system-ui] text-3xl font-bold tracking-tight text-white/95">
            {initials(course)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-90" />
        {enrollBadge ? (
          <span
            className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${toneClasses[enrollBadge.tone]}`}
          >
            {enrollBadge.label}
          </span>
        ) : (
          <span
            className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${toneClasses[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{resourceLine}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-snug text-slate-900">
          <Link href={href} className="hover:text-orange-700">
            {course.code ? `${course.code} · ` : ''}
            {course.name}
          </Link>
        </h3>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
          <UserCircle2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate">{subtitle}</span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Prep coverage</span>
            {statsLoading ? (
              <span className="h-3 w-10 animate-pulse rounded bg-slate-200" />
            ) : (
              <span className="font-semibold text-slate-800">{pct}%</span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-600 transition-[width] duration-500"
              style={{ width: statsLoading ? '8%' : `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            {statsLoading ? 'Loading materials…' : `Indexed materials in ${departmentName || 'catalog'}`}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            {statsLoading ? '—' : q} questions
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {statsLoading ? '—' : s} slides
          </span>
        </div>
      </div>
    </motion.article>
  )
}
