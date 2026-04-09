import SectionCard from '../atoms/SectionCard'
import { Flame, GraduationCap, Sparkles, UserRound } from 'lucide-react'

const CARD_ICON_BY_LABEL = {
  'Signed in user': UserRound,
  'Student level': GraduationCap,
  'Current streak': Flame,
  'Total XP': Sparkles,
}

const TONE_STYLES = {
  orange: {
    line: 'from-orange-500/70 via-amber-400/60 to-transparent',
    icon: 'border-orange-500/30 bg-orange-500/15 text-orange-200',
    glow: 'bg-orange-500/20',
  },
  sky: {
    line: 'from-sky-500/70 via-cyan-400/60 to-transparent',
    icon: 'border-sky-500/30 bg-sky-500/15 text-sky-200',
    glow: 'bg-sky-500/20',
  },
  violet: {
    line: 'from-violet-500/70 via-indigo-400/60 to-transparent',
    icon: 'border-violet-500/30 bg-violet-500/15 text-violet-200',
    glow: 'bg-violet-500/20',
  },
  emerald: {
    line: 'from-emerald-500/70 via-teal-400/60 to-transparent',
    icon: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
    glow: 'bg-emerald-500/20',
  },
}

export default function StatCard({ label, value, hint, tone = 'orange' }) {
  const Icon = CARD_ICON_BY_LABEL[label] || Sparkles
  const isLoading = value === null || value === undefined
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.orange

  return (
    <SectionCard className="relative overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${toneStyle.line}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${toneStyle.glow}`}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            {label}
          </p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {value}
            </p>
          )}
          {hint ? (
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          ) : null}
          <div className="mt-3 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
          </div>
        </div>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${toneStyle.icon}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </SectionCard>
  )
}
