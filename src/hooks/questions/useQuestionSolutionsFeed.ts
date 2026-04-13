import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { AppApiError } from '@/lib/api-error'

export type QuestionSolutionItem = {
  id: string
  text: string
  source: 'official' | 'ta' | 'ai' | 'community'
  upvotes: number
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v
  const rec = asRecord(v)
  if (!rec) return []
  for (const k of ['items', 'data', 'rows', 'results', 'solutions']) {
    const next = rec[k]
    if (Array.isArray(next)) return next
  }
  return []
}

function normalizeSource(v: unknown): QuestionSolutionItem['source'] {
  const s = typeof v === 'string' ? v.toLowerCase() : ''
  if (s.includes('official')) return 'official'
  if (s.includes('ta') || s.includes('teacher')) return 'ta'
  if (s.includes('ai')) return 'ai'
  return 'community'
}

function sourceRank(source: QuestionSolutionItem['source']): number {
  if (source === 'official') return 0
  if (source === 'ta') return 1
  if (source === 'ai') return 2
  return 3
}

function normalizeSolutions(raw: unknown): QuestionSolutionItem[] {
  const out = pickArray(raw).flatMap((row): QuestionSolutionItem[] => {
    const rec = asRecord(row)
    if (!rec) return []
    const id = rec.id ?? rec._id ?? rec.solutionId
    const text =
      rec.text ??
      rec.solutionText ??
      rec.answerText ??
      rec.solution ??
      rec.body ??
      rec.explanation
    if (typeof id !== 'string' || typeof text !== 'string' || !text.trim()) return []
    const upvotesRaw = rec.upvotes ?? rec.upvoteCount ?? rec.votes
    const upvotes = typeof upvotesRaw === 'number' && Number.isFinite(upvotesRaw) ? upvotesRaw : 0
    return [
      {
        id,
        text: text.trim(),
        source: normalizeSource(rec.source ?? rec.kind ?? rec.origin),
        upvotes,
      },
    ]
  })
  return out.sort((a, b) => sourceRank(a.source) - sourceRank(b.source))
}

export function useQuestionSolutionsFeed(questionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['questions', 'solutions-feed', questionId || 'none'],
    enabled: Boolean(questionId && enabled),
    queryFn: async ({ signal }): Promise<QuestionSolutionItem[]> => {
      if (!questionId) return []
      try {
        const { data } = await apiClient.get<unknown>(API.solutions.byQuestion(questionId), {
          signal,
        })
        return normalizeSolutions(data)
      } catch (e) {
        if (e instanceof AppApiError && e.status === 404) {
          const { data } = await apiClient.get<unknown>(API.questions.solutions(questionId), {
            signal,
          })
          return normalizeSolutions(data)
        }
        throw e
      }
    },
    staleTime: 60_000,
  })
}

export function useUpvoteSolution(questionId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (solutionId: string) => {
      try {
        await apiClient.post(API.solutions.vote(solutionId), { vote: 'up' })
      } catch (e) {
        if (e instanceof AppApiError && (e.status === 404 || e.status === 405)) {
          await apiClient.post(API.questions.solutionUpvote(solutionId))
          return solutionId
        }
        throw e
      }
      return solutionId
    },
    onMutate: async (solutionId) => {
      const key = ['questions', 'solutions-feed', questionId || 'none']
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<QuestionSolutionItem[]>(key)
      queryClient.setQueryData<QuestionSolutionItem[]>(key, (current = []) =>
        current.map((row) =>
          row.id === solutionId ? { ...row, upvotes: (row.upvotes || 0) + 1 } : row,
        ),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      const key = ['questions', 'solutions-feed', questionId || 'none']
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['questions', 'solutions-feed', questionId || 'none'],
      })
    },
  })
}

export function useAddQuestionSolution(questionId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (answerText: string) => {
      if (!questionId) throw new Error('Missing question id')
      await apiClient.post(API.questions.solutions(questionId), { answerText })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['questions', 'solutions-feed', questionId || 'none'],
      })
    },
  })
}
