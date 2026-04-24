import { useMemo, useState } from 'react'
import { MessageCircle, Sparkles, ThumbsUp } from 'lucide-react'
import {
  useAddQuestionSolution,
  useQuestionSolutionsFeed,
  useUpvoteSolution,
} from '@/hooks/questions/useQuestionSolutionsFeed'
import {
  useClearDiscussionThread,
  useDiscussionThread,
  useSendDiscussionMessage,
} from '@/hooks/discussions/useQuestionDiscussions'
import {
  useMnemonicUpvote,
  useMnemonicsForCourse,
  useSubmitMnemonic,
} from '@/hooks/mnemonics/useMnemonics'
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe'
import { isApiError } from '@/lib/api-error'
import { SolutionGate } from '@/components/questions/SolutionGate'

function pickCourseId(raw) {
  if (!raw || typeof raw !== 'object') return ''
  const c = raw.courseId ?? raw.course?.id ?? raw.course_id
  return typeof c === 'string' && c.trim() ? c.trim() : ''
}

function pickTopic(raw) {
  if (!raw || typeof raw !== 'object') return ''
  const t = raw.topic
  return typeof t === 'string' && t.trim() ? t.trim() : ''
}

export default function QuestionDetailTabs({ questionId, question }) {
  const [tab, setTab] = useState('solution')
  const courseId = useMemo(() => pickCourseId(question), [question])
  const topic = useMemo(() => pickTopic(question), [question])
  const { tier } = useSubscriptionWithTier()
  const hasSolutionAccess = tier !== 'free'

  const solutionsQ = useQuestionSolutionsFeed(
    questionId,
    tab === 'solution' && hasSolutionAccess,
  )
  const upvoteM = useUpvoteSolution(questionId)
  const addSolutionM = useAddQuestionSolution(questionId)

  const threadQ = useDiscussionThread(questionId, tab === 'discussion')
  const sendM = useSendDiscussionMessage(questionId)
  const clearM = useClearDiscussionThread(questionId)

  const mnemonicsQ = useMnemonicsForCourse(courseId || undefined, topic || undefined, tab === 'mnemonics')
  const submitMnemonicM = useSubmitMnemonic(courseId || undefined)
  const upvoteMnemonicM = useMnemonicUpvote(courseId || undefined)

  const [draftSolution, setDraftSolution] = useState('')
  const [draftMsg, setDraftMsg] = useState('')
  const [mnForm, setMnForm] = useState({ term: '', mnemonic: '', explanation: '' })

  const solutionErr =
    !hasSolutionAccess ||
    (solutionsQ.isError && isApiError(solutionsQ.error) && solutionsQ.error.status === 403)

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'solution', label: 'Solutions' },
          { id: 'discussion', label: 'Discussion' },
          { id: 'mnemonics', label: 'Mnemonics' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-orange-100 text-orange-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'solution' ? (
        <div className="mt-4 space-y-4">
          {solutionsQ.isLoading ? <p className="text-sm text-slate-500">Loading solutions…</p> : null}
          {solutionErr ? <SolutionGate /> : null}
          {!solutionErr && solutionsQ.data?.length ? (
            <ul className="space-y-3">
              {solutionsQ.data.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-wrap">{s.text}</p>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:border-orange-300"
                      onClick={() => upvoteM.mutate(s.id)}
                      disabled={upvoteM.isPending}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                      {s.upvotes}
                    </button>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{s.source}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {!solutionErr && !solutionsQ.isLoading && !solutionsQ.data?.length ? (
            <p className="text-sm text-slate-600">No solutions yet. Add one below.</p>
          ) : null}

          <form
            className="rounded-xl border border-dashed border-slate-200 p-3"
            onSubmit={(e) => {
              e.preventDefault()
              const t = draftSolution.trim()
              if (!t) return
              void addSolutionM.mutateAsync(t).then(() => setDraftSolution(''))
            }}
          >
            <label className="block text-xs font-semibold text-slate-500">Your answer</label>
            <textarea
              value={draftSolution}
              onChange={(e) => setDraftSolution(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Write a solution or working…"
            />
            <button
              type="submit"
              disabled={addSolutionM.isPending}
              className="mt-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {addSolutionM.isPending ? 'Submitting…' : 'Submit solution'}
            </button>
          </form>
        </div>
      ) : null}

      {tab === 'discussion' ? (
        <div className="mt-4 space-y-3">
          {threadQ.isLoading ? <p className="text-sm text-slate-500">Loading thread…</p> : null}
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
            {threadQ.data?.length ? (
              threadQ.data.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No messages yet. Ask about this question below.</p>
            )}
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              const t = draftMsg.trim()
              if (!t) return
              void sendM.mutateAsync(t).then(() => setDraftMsg(''))
            }}
          >
            <label className="sr-only" htmlFor="discuss-input">
              Message
            </label>
            <input
              id="discuss-input"
              value={draftMsg}
              onChange={(e) => setDraftMsg(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Ask about this question…"
            />
            <button
              type="submit"
              disabled={sendM.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Send
            </button>
          </form>
          <button
            type="button"
            className="text-xs font-semibold text-rose-700 hover:underline"
            onClick={() => void clearM.mutateAsync()}
            disabled={clearM.isPending}
          >
            Clear thread
          </button>
        </div>
      ) : null}

      {tab === 'mnemonics' ? (
        <div className="mt-4 space-y-4">
          {!courseId ? (
            <p className="text-sm text-slate-600">
              Mnemonics are listed per course. This question is not linked to a course id in the API
              response.
            </p>
          ) : null}
          {courseId && mnemonicsQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading mnemonics…</p>
          ) : null}
          {courseId && mnemonicsQ.data?.length ? (
            <ul className="space-y-3">
              {mnemonicsQ.data.map((m) => (
                <li
                  key={m._id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {m.term}
                  </p>
                  <p className="mt-1 text-sm text-slate-900">{m.mnemonic}</p>
                  {m.explanation ? (
                    <p className="mt-2 text-sm text-slate-600">{m.explanation}</p>
                  ) : null}
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-orange-700 hover:underline"
                    onClick={() => upvoteMnemonicM.mutate(m._id)}
                  >
                    Upvote ({m.upvotes})
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {courseId && !mnemonicsQ.isLoading && !mnemonicsQ.data?.length ? (
            <p className="text-sm text-slate-600">No verified mnemonics for this topic yet.</p>
          ) : null}

          {courseId ? (
            <form
              className="rounded-xl border border-dashed border-slate-200 p-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!mnForm.term.trim() || !mnForm.mnemonic.trim()) return
                void submitMnemonicM
                  .mutateAsync({
                    topic: topic || 'General',
                    term: mnForm.term,
                    mnemonic: mnForm.mnemonic,
                    explanation: mnForm.explanation || undefined,
                  })
                  .then(() => setMnForm({ term: '', mnemonic: '', explanation: '' }))
              }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-orange-500" aria-hidden />
                Submit a mnemonic
              </div>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Term"
                value={mnForm.term}
                onChange={(e) => setMnForm((s) => ({ ...s, term: e.target.value }))}
              />
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Mnemonic"
                rows={2}
                value={mnForm.mnemonic}
                onChange={(e) => setMnForm((s) => ({ ...s, mnemonic: e.target.value }))}
              />
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Explanation (optional)"
                rows={2}
                value={mnForm.explanation}
                onChange={(e) => setMnForm((s) => ({ ...s, explanation: e.target.value }))}
              />
              <button
                type="submit"
                disabled={submitMnemonicM.isPending}
                className="mt-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitMnemonicM.isPending ? 'Sending…' : 'Submit'}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
