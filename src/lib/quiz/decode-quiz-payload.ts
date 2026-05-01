/**
 * Shared helpers for `/quiz/[id]` where `id` is encodeURIComponent(JSON.stringify(payload)).
 */

export type DecodedQuizPayload = Record<string, unknown>

export function decodeQuizPayload(rawId: unknown): DecodedQuizPayload | null {
  const s =
    typeof rawId === 'string' ? rawId : Array.isArray(rawId) && typeof rawId[0] === 'string' ? rawId[0] : ''
  const trimmed = s.trim()
  if (!trimmed) return null
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(trimmed))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as DecodedQuizPayload
    }
  } catch {
    return null
  }
  return null
}

export function pickQuizSharePresentation(payload: DecodedQuizPayload | null): {
  courseName?: string
  year?: string
  level?: string
  sourceLabel?: string
  sharedByName?: string
  questionCount?: number
  timerMins?: number
} {
  if (!payload) return {}
  const str = (k: string) => {
    const v = payload[k]
    if (typeof v === 'string') return v.trim()
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
    return ''
  }
  const countRaw = payload.count
  const minsRaw = payload.mins
  const qc =
    typeof countRaw === 'number'
      ? countRaw
      : typeof countRaw === 'string'
        ? parseInt(countRaw, 10)
        : NaN
  const tm =
    typeof minsRaw === 'number'
      ? minsRaw
      : typeof minsRaw === 'string'
        ? parseInt(minsRaw, 10)
        : NaN
  return {
    courseName: str('courseName') || undefined,
    year: str('year') || undefined,
    level: str('level') || undefined,
    sourceLabel: str('sourceLabel') || undefined,
    sharedByName: str('sharedByName') || undefined,
    questionCount: Number.isFinite(qc) && qc > 0 ? qc : undefined,
    timerMins: Number.isFinite(tm) && tm >= 0 ? tm : undefined,
  }
}
