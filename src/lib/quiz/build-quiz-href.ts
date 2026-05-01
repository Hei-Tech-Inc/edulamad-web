type QuizHrefPayload = {
  courseId: string
  year: string
  level: string
  type?: string
  courseName?: string
  offeringId?: string
  sourceLabel?: string
  mode?: 'quiz' | 'review'
  count?: number | string
  seed?: number | string
  mins?: number | string
  /** Display name of the user who created/shared the link (optional for backward compatibility). */
  sharedByName?: string
  /** True when the link was produced as a shareable quiz session (optional). */
  shared?: boolean
}

export function buildQuizHref(payload: QuizHrefPayload) {
  const id = encodeURIComponent(
    JSON.stringify({
      ...payload,
      type: payload.type || 'all',
      mode: payload.mode === 'quiz' ? 'quiz' : 'review',
    }),
  )
  return `/quiz/${id}`
}
