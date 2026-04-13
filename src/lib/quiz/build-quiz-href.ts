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
