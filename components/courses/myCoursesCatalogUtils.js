/** Derived “readiness” from catalog stats (not LMS completion — see docs/backend-my-courses-api.md). */
export function readinessPercent(questionCount, slidesCount) {
  const q = questionCount || 0
  const s = slidesCount || 0
  if (q === 0 && s === 0) return 0
  return Math.min(100, Math.round(45 * Math.min(1, q / 20) + 55 * Math.min(1, s / 10)))
}

export function catalogBadge(questionCount, slidesCount) {
  const q = questionCount || 0
  const s = slidesCount || 0
  if (q === 0 && s === 0) return { label: 'Start exploring', tone: 'neutral' }
  if (q > 0 && s > 0) return { label: 'Full prep', tone: 'success' }
  if (q > 0) return { label: 'Questions ready', tone: 'primary' }
  return { label: 'Slides ready', tone: 'sky' }
}

export function matchesContentFilter(stats, filter) {
  if (filter === 'all') return true
  if (!stats) return true
  const q = stats.questionCount ?? 0
  const s = stats.slidesCount ?? 0
  if (filter === 'questions') return q > 0
  if (filter === 'slides') return s > 0
  if (filter === 'full') return q > 0 && s > 0
  return true
}
