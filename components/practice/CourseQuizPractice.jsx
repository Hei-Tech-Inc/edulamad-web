import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Bookmark,
  Flag,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Link2,
  Loader2,
  MessageSquare,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import { useCourseQuestions } from '@/hooks/questions/useCourseQuestions'
import { useQuestionSolutions } from '@/hooks/questions/useQuestionSolutions'
import { useQuizSolutionRows } from '@/hooks/questions/useQuizSolutionRows'
import {
  useAddQuestionSolution,
  useQuestionSolutionsFeed,
  useUpvoteSolution,
} from '@/hooks/questions/useQuestionSolutionsFeed'
import { pickQuizSubset } from '@/lib/quiz/seededShuffle'
import { officialAnswerDisplay, resolveMcqCorrectIndex } from '@/lib/quiz/question-solutions'
import {
  loadQuizBookmarks,
  removeQuizBookmark,
  saveQuizBookmark,
} from '@/lib/quiz/bookmarks'
import {
  loadQuizDraft,
  quizDraftStorageKey,
  saveQuizDraft,
} from '@/lib/quiz/quiz-draft-storage'
import {
  fetchFileSignedUrl,
  fetchQuestionSourceDocumentUrl,
} from '@/lib/api/resolve-signed-urls'
import { useToast } from '../Toast'
import { SkeletonQuestionCard } from '@/components/ui/skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

function optionLetter(index) {
  if (index < 0 || index > 25) return String(index + 1)
  return String.fromCharCode(65 + index)
}

function parseQuery(router) {
  const q = router.query
  const s = (k) => {
    const v = q[k]
    if (typeof v === 'string') return v
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
    return ''
  }
  const countRaw = parseInt(s('count'), 10)
  const seedRaw = parseInt(s('seed'), 10)
  const minsRaw = s('mins')
  const minsParsed = minsRaw === '' || minsRaw === undefined ? NaN : parseInt(minsRaw, 10)
  const encodedQuizId = s('id').trim()
  let fromEncoded = null
  if (encodedQuizId) {
    try {
      const parsed = JSON.parse(decodeURIComponent(encodedQuizId))
      if (parsed && typeof parsed === 'object') fromEncoded = parsed
    } catch {
      /* ignore encoded payload parse errors */
    }
  }
  const fromValue = (key, fallback = '') => {
    if (fromEncoded && typeof fromEncoded[key] === 'string') return fromEncoded[key].trim()
    if (fromEncoded && typeof fromEncoded[key] === 'number') return String(fromEncoded[key])
    return fallback
  }
  const modeFromPayload = fromValue('mode')
  const countFromPayload = Number.parseInt(fromValue('count'), 10)
  const seedFromPayload = Number.parseInt(fromValue('seed'), 10)
  const minsFromPayload = Number.parseInt(fromValue('mins'), 10)

  return {
    courseId: s('courseId').trim() || fromValue('courseId'),
    year: s('year').trim() || fromValue('year'),
    level: s('level').trim() || fromValue('level'),
    type: s('type').trim() || fromValue('type') || 'all',
    courseName: s('courseName').trim() || fromValue('courseName'),
    offeringId: s('offeringId').trim() || fromValue('offeringId'),
    sourceLabel: s('sourceLabel').trim() || fromValue('sourceLabel'),
    tagId: s('tagId').trim() || fromValue('tagId'),
    mode: (s('mode') || modeFromPayload) === 'quiz' ? 'quiz' : 'review',
    count: Number.isFinite(countRaw)
      ? countRaw
      : Number.isFinite(countFromPayload)
        ? countFromPayload
        : NaN,
    seed: Number.isFinite(seedRaw)
      ? seedRaw
      : Number.isFinite(seedFromPayload)
        ? seedFromPayload
        : NaN,
    mins: Number.isFinite(minsParsed)
      ? minsParsed
      : Number.isFinite(minsFromPayload)
        ? minsFromPayload
        : 15,
  }
}

function formatCountdown(totalSec) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getGridCellClasses({
  isCurrent,
  answered,
  flagged,
  quizModeSubmitted,
  question,
  solutionRows,
  selectedIndex,
  solutionsLoading,
}) {
  const opts = question.options
  const correctIdx =
    quizModeSubmitted && opts?.length && !solutionsLoading
      ? resolveMcqCorrectIndex(opts, solutionRows)
      : null

  if (correctIdx !== null && opts?.length) {
    const sel = selectedIndex
    if (sel === correctIdx) {
      return isCurrent
        ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-200'
        : 'border-2 border-emerald-500 bg-emerald-100 text-emerald-900'
    }
    if (sel !== undefined && sel !== correctIdx) {
      return isCurrent
        ? 'bg-rose-600 text-white shadow ring-2 ring-rose-200'
        : 'border-2 border-rose-400 bg-rose-100 text-rose-900'
    }
    return isCurrent
      ? 'bg-amber-600 text-white shadow ring-2 ring-amber-100'
      : 'border-2 border-amber-300 bg-amber-50 text-amber-900'
  }

  if (flagged) {
    return isCurrent
      ? 'bg-amber-500 text-white shadow ring-2 ring-amber-100'
      : 'border border-amber-300 bg-amber-50 text-amber-900'
  }
  if (isCurrent) return 'bg-teal-700 text-white shadow'
  if (answered) return 'border border-sky-200 bg-sky-50 text-sky-900'
  return 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300'
}

/** Hides Chrome / some viewers’ PDF toolbars when supported; preserve existing `#` on signed URLs. */
function pdfPreviewIframeSrc(rawUrl) {
  if (!rawUrl) return ''
  try {
    const u = new URL(rawUrl)
    if (u.hash.length > 1) return rawUrl
    u.hash = 'toolbar=0&navpanes=0'
    return u.toString()
  } catch {
    return rawUrl.includes('#') ? rawUrl : `${rawUrl}#toolbar=0&navpanes=0`
  }
}

/** Slim header bar + optional preview deck — preview iframe is sandboxed (no downloads token) + print guard. */
function QuizSourceMaterialBar({ attachmentKey, questionId, questionNum, questionTotal }) {
  const reduceMotion = useReducedMotion()
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const resolveSignedUrl = useCallback(async () => {
    if (attachmentKey) {
      return fetchFileSignedUrl(attachmentKey)
    }
    if (questionId) {
      return fetchQuestionSourceDocumentUrl(questionId)
    }
    return null
  }, [attachmentKey, questionId])

  const openInNewTab = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const url = await resolveSignedUrl()
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      else setError('No file URL returned.')
    } catch (e) {
      const msg =
        e?.response?.data?.message || (e instanceof Error ? e.message : 'Could not open PDF')
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }, [resolveSignedUrl])

  const togglePreview = useCallback(async () => {
    if (showPreview) {
      setShowPreview(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      let url = previewUrl
      if (!url) {
        url = await resolveSignedUrl()
        if (url) setPreviewUrl(url)
      }
      if (url) setShowPreview(true)
      else setError('No file URL returned.')
    } catch (e) {
      const msg =
        e?.response?.data?.message || (e instanceof Error ? e.message : 'Could not load preview')
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }, [showPreview, previewUrl, resolveSignedUrl])

  useEffect(() => {
    setPreviewUrl(null)
    setShowPreview(false)
    setError('')
  }, [attachmentKey, questionId])

  useEffect(() => {
    if (!showPreview) return
    const blockPrintShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', blockPrintShortcut, true)
    return () => window.removeEventListener('keydown', blockPrintShortcut, true)
  }, [showPreview])

  if (!attachmentKey && !questionId) return null

  return (
    <>
      <motion.div
        layout
        key={attachmentKey || questionId}
        initial={reduceMotion ? false : { opacity: 0.85, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 28 }
        }
        className="rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Original paper
            </p>
            {questionNum != null && questionTotal != null ? (
              <p className="mt-0.5 text-xs font-medium text-slate-600">
                For question{' '}
                <span className="tabular-nums text-slate-800">
                  {questionNum} of {questionTotal}
                </span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={() => void openInNewTab()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-55"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              Open PDF
            </button>
            <button
              type="button"
              onClick={() => void togglePreview()}
              disabled={loading}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition disabled:opacity-55 ${
                showPreview
                  ? 'border border-teal-600 bg-teal-700 text-white shadow-sm hover:bg-teal-800'
                  : 'border border-teal-200/90 bg-teal-50/90 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {showPreview ? 'Hide preview' : 'Preview PDF'}
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      </motion.div>

      <AnimatePresence initial={false}>
        {showPreview && previewUrl ? (
          <motion.div
            key="pdf-preview-deck"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/90 px-3 py-2">
              <p className="text-[11px] font-medium text-slate-600">Exam paper preview</p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                In-page preview: download and print are limited where your browser allows. Use{' '}
                <span className="font-medium text-slate-600">Open PDF</span> if you need a full copy.
              </p>
            </div>
            <div className="relative select-none" onContextMenu={(e) => e.preventDefault()}>
              <iframe
                title="Exam PDF preview"
                src={pdfPreviewIframeSrc(previewUrl)}
                className="h-[min(62vh,480px)] w-full bg-neutral-50"
                // Omit allow-downloads (HTML) to discourage saves from this browsing context.
                // allow-scripts + same-origin: required for many built-in PDF renderers.
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function QuestionHint({ questionId, inlineHint, blockRemoteHint }) {
  const [open, setOpen] = useState(false)
  const fetchSolutions = open && !inlineHint && !blockRemoteHint
  const solQ = useQuestionSolutions(questionId, fetchSolutions)

  const body =
    blockRemoteHint && !inlineHint
      ? 'Solution-based hints unlock after you submit the quiz.'
      : inlineHint
        ? inlineHint
        : solQ.isLoading
          ? 'Loading hint…'
          : solQ.data
            ? solQ.data
            : 'No community solution yet. Re-read the prompt, underline key terms, and try eliminating wrong options.'

  return (
    <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-amber-900 dark:text-amber-100"
      >
        <span className="inline-flex items-center gap-2">
          <Lightbulb className="h-4 w-4 shrink-0" aria-hidden />
          Hint
        </span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {open ? (
        <div className="border-t border-amber-200/60 px-4 pb-3 pt-2 text-sm leading-relaxed text-amber-950/90 dark:border-amber-900/50 dark:text-amber-50/90">
          {body}
        </div>
      ) : null}
    </div>
  )
}

export default function CourseQuizPractice() {
  const router = useRouter()
  const { showToast } = useToast()
  const ready = router.isReady
  const q0 = parseQuery(router)
  const {
    courseId,
    year,
    level,
    type,
    courseName,
    offeringId,
    sourceLabel,
    tagId,
    mode,
    count: urlCount,
    seed: urlSeed,
    mins: urlMins,
  } = q0

  const questionsQ = useCourseQuestions({
    courseId: courseId || null,
    year,
    level,
    type,
    tagId: tagId || null,
  })

  const allQuestions = questionsQ.data ?? []
  const poolTotal = allQuestions.length

  const hasQuizParams =
    mode === 'quiz' &&
    Number.isFinite(urlCount) &&
    urlCount > 0 &&
    Number.isFinite(urlSeed)

  const quizSubset = useMemo(() => {
    if (!hasQuizParams || poolTotal === 0) return null
    const c = Math.min(Math.floor(urlCount), poolTotal)
    return pickQuizSubset(allQuestions, c, urlSeed)
  }, [hasQuizParams, poolTotal, allQuestions, urlCount, urlSeed])

  const activeQuestions = useMemo(() => {
    if (mode === 'quiz' && quizSubset) return quizSubset
    return allQuestions
  }, [mode, quizSubset, allQuestions])

  const total = activeQuestions.length
  const isQuizSession = mode === 'quiz' && hasQuizParams
  const activeIdsKey = activeQuestions.map((q) => q.id).join(',')
  const questionIds = useMemo(() => activeQuestions.map((q) => q.id), [activeIdsKey])

  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const { byId: solutionById, isLoading: solutionsLoading } = useQuizSolutionRows(
    questionIds,
    isQuizSession && quizSubmitted,
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [gridOpen, setGridOpen] = useState(true)
  const [mcqAnswers, setMcqAnswers] = useState(() => ({}))
  const [essayDraft, setEssayDraft] = useState(() => ({}))
  const [setupCount, setSetupCount] = useState(10)
  const [setupMins, setSetupMins] = useState(15)
  const [bookmarkTick, setBookmarkTick] = useState(0)
  const [savedOpen, setSavedOpen] = useState(false)
  const [flagged, setFlagged] = useState(() => ({}))
  const [showSolutions, setShowSolutions] = useState(() => ({}))
  const [addingSolution, setAddingSolution] = useState('')
  const [discussionOpen, setDiscussionOpen] = useState(() => ({}))
  const [discussionInput, setDiscussionInput] = useState('')
  const [discussionByQuestion, setDiscussionByQuestion] = useState(() => ({}))
  const [discussionSessionByQuestion, setDiscussionSessionByQuestion] = useState(() => ({}))
  const [aiGenerating, setAiGenerating] = useState(false)
  const [generatedAiByQuestion, setGeneratedAiByQuestion] = useState(() => ({}))
  const [timeLeftSec, setTimeLeftSec] = useState(null)
  const [frozenTimerSec, setFrozenTimerSec] = useState(null)
  const timerUpFired = useRef(false)
  const timeLeftRef = useRef(null)
  const draftReadyRef = useRef(false)

  const bookmarks = useMemo(() => loadQuizBookmarks(), [bookmarkTick])

  useEffect(() => {
    try {
      const rawSessions = window.localStorage.getItem('quiz.discussion.sessions')
      const rawMessages = window.localStorage.getItem('quiz.discussion.messages')
      if (rawSessions) {
        const parsed = JSON.parse(rawSessions)
        if (parsed && typeof parsed === 'object') setDiscussionSessionByQuestion(parsed)
      }
      if (rawMessages) {
        const parsed = JSON.parse(rawMessages)
        if (parsed && typeof parsed === 'object') setDiscussionByQuestion(parsed)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'quiz.discussion.sessions',
        JSON.stringify(discussionSessionByQuestion),
      )
      window.localStorage.setItem(
        'quiz.discussion.messages',
        JSON.stringify(discussionByQuestion),
      )
    } catch {
      /* ignore */
    }
  }, [discussionSessionByQuestion, discussionByQuestion])

  useEffect(() => {
    timeLeftRef.current = timeLeftSec
  }, [timeLeftSec])

  useEffect(() => {
    if (poolTotal > 0) {
      setSetupCount((c) => Math.min(Math.max(1, c || 1), poolTotal))
    }
  }, [poolTotal])

  const timerMinutes = mode === 'quiz' && hasQuizParams ? Math.max(0, urlMins) : 0

  useEffect(() => {
    if (!ready) {
      draftReadyRef.current = false
      return
    }

    draftReadyRef.current = false
    setCurrentIndex(0)
    timerUpFired.current = false

    if (!isQuizSession) {
      setMcqAnswers({})
      setEssayDraft({})
      setQuizSubmitted(false)
      setFrozenTimerSec(null)
      setTimeLeftSec(null)
      draftReadyRef.current = true
      return
    }

    const sk = quizDraftStorageKey({
      courseId,
      year,
      level,
      type,
      count: urlCount,
      seed: urlSeed,
    })
    const d = loadQuizDraft(sk)

    setMcqAnswers(d?.mcqAnswers ?? {})
    setEssayDraft(d?.essayDraft ?? {})
    const restoredSubmitted = d?.submitted === true
    setQuizSubmitted(restoredSubmitted)
    setFrozenTimerSec(
      typeof d?.frozenTimerSec === 'number' && Number.isFinite(d.frozenTimerSec)
        ? d.frozenTimerSec
        : null,
    )

    if (timerMinutes > 0 && !restoredSubmitted) {
      setTimeLeftSec(timerMinutes * 60)
    } else {
      setTimeLeftSec(null)
    }

    draftReadyRef.current = true
  }, [ready, isQuizSession, courseId, year, level, type, urlCount, urlSeed, timerMinutes])

  useEffect(() => {
    if (!ready || !isQuizSession || !draftReadyRef.current) return
    const sk = quizDraftStorageKey({
      courseId,
      year,
      level,
      type,
      count: urlCount,
      seed: urlSeed,
    })
    const id = window.setTimeout(() => {
      saveQuizDraft(sk, {
        mcqAnswers,
        essayDraft,
        submitted: quizSubmitted,
        frozenTimerSec,
      })
    }, 400)
    return () => window.clearTimeout(id)
  }, [
    ready,
    isQuizSession,
    courseId,
    year,
    level,
    type,
    urlCount,
    urlSeed,
    mcqAnswers,
    essayDraft,
    quizSubmitted,
    frozenTimerSec,
  ])

  useEffect(() => {
    if (currentIndex >= total && total > 0) setCurrentIndex(total - 1)
    if (total === 0) setCurrentIndex(0)
  }, [currentIndex, total])

  useEffect(() => {
    if (quizSubmitted) return
    if (timeLeftSec === null || timeLeftSec <= 0) return
    const id = setInterval(() => {
      setTimeLeftSec((s) => (s === null ? null : s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [timeLeftSec, quizSubmitted])

  useEffect(() => {
    if (quizSubmitted) return
    if (timeLeftSec !== 0) return
    if (!isQuizSession || timerMinutes <= 0) return
    if (timerUpFired.current) return
    timerUpFired.current = true
    setFrozenTimerSec(0)
    setTimeLeftSec(null)
    setQuizSubmitted(true)
    showToast("Time's up — quiz auto-submitted with your saved answers. Loading the key…", 'info')
  }, [timeLeftSec, quizSubmitted, isQuizSession, timerMinutes, showToast])

  const submitQuiz = useCallback(() => {
    if (timerMinutes > 0) {
      const t = timeLeftRef.current
      setFrozenTimerSec(typeof t === 'number' ? t : null)
    }
    setTimeLeftSec(null)
    setQuizSubmitted(true)
  }, [timerMinutes])

  const scoreSummary = useMemo(() => {
    if (!quizSubmitted) return null
    let gradable = 0
    let correct = 0
    for (const qu of activeQuestions) {
      const opts = qu.options
      if (!opts?.length) continue
      const rows = solutionById[qu.id] ?? []
      const idx = resolveMcqCorrectIndex(opts, rows)
      if (idx === null) continue
      gradable += 1
      if (mcqAnswers[qu.id] === idx) correct += 1
    }
    return { mcqGradable: gradable, mcqCorrect: correct }
  }, [quizSubmitted, activeQuestions, solutionById, mcqAnswers])

  const answeredCount = useMemo(() => {
    let n = 0
    for (const qu of activeQuestions) {
      const opts = qu.options
      if (opts?.length) {
        if (mcqAnswers[qu.id] !== undefined) n += 1
      } else if ((essayDraft[qu.id] || '').trim().length > 0) {
        n += 1
      }
    }
    return n
  }, [activeQuestions, mcqAnswers, essayDraft])

  const current = activeQuestions[currentIndex]
  const currentSolutionsExpanded = current
    ? mode === 'review'
      ? showSolutions[current.id] !== false
      : Boolean(showSolutions[current.id])
    : false
  const currentAnswered = current
    ? current.options?.length
      ? mcqAnswers[current.id] !== undefined
      : (essayDraft[current.id] || '').trim().length > 0
    : false

  const subscriptionQ = useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.subscriptions.me, { signal })
      return data && typeof data === 'object' ? data : {}
    },
  })
  const plan = String(subscriptionQ.data?.plan || subscriptionQ.data?.tier || '').toLowerCase()
  const hasSolutionAccess =
    plan === 'basic' ||
    plan === 'pro' ||
    subscriptionQ.data?.isPro === true ||
    subscriptionQ.data?.isPaid === true
  const solutionsFeedQ = useQuestionSolutionsFeed(
    current?.id,
    Boolean(current?.id) && hasSolutionAccess,
  )
  const upvoteSolutionM = useUpvoteSolution(current?.id)
  const addSolutionM = useAddQuestionSolution(current?.id)
  const isProUser = Boolean(
    subscriptionQ.data?.plan === 'pro' ||
      subscriptionQ.data?.tier === 'pro' ||
      subscriptionQ.data?.isPro === true,
  )
  const currentSolutionRows = current ? (solutionById[current.id] ?? []) : []
  const currentCorrectIdx =
    current?.options?.length && quizSubmitted && !solutionsLoading
      ? resolveMcqCorrectIndex(current.options, currentSolutionRows)
      : null
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0
  const flaggedCount = useMemo(
    () => Object.values(flagged).filter(Boolean).length,
    [flagged],
  )

  const setMcq = useCallback(
    (questionId, optionIndex) => {
      if (isQuizSession && quizSubmitted) return
      setMcqAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    },
    [isQuizSession, quizSubmitted],
  )

  const setEssay = useCallback(
    (questionId, text) => {
      if (isQuizSession && quizSubmitted) return
      setEssayDraft((prev) => ({ ...prev, [questionId]: text }))
    },
    [isQuizSession, quizSubmitted],
  )

  const isAnsweredAt = useCallback(
    (idx) => {
      const qu = activeQuestions[idx]
      if (!qu) return false
      if (qu.options?.length) return mcqAnswers[qu.id] !== undefined
      return (essayDraft[qu.id] || '').trim().length > 0
    },
    [activeQuestions, mcqAnswers, essayDraft],
  )

  const toggleFlag = useCallback((questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
  }, [])

  const sendDiscussion = useCallback(async () => {
    const q = current
    if (!q || !discussionInput.trim()) return
    const questionId = q.id
    const userMessage = discussionInput.trim()
    setDiscussionInput('')
    setDiscussionByQuestion((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), { role: 'user', text: userMessage }],
    }))
    try {
      const sessionId = discussionSessionByQuestion[questionId]
      const firstMessagePrefix =
        (discussionByQuestion[questionId] || []).length === 0
          ? `I'm looking at this question: ${q.questionText}. `
          : ''
      const { data } = await apiClient.post(API.ai.chat, {
        message: `${firstMessagePrefix}${userMessage}`,
        courseId,
        ...(sessionId ? { sessionId } : {}),
      })
      const reply =
        data?.reply || data?.message || data?.text || data?.output || 'AI response received.'
      const nextSession = data?.sessionId || data?.session?.id || sessionId
      if (nextSession) {
        setDiscussionSessionByQuestion((prev) => ({ ...prev, [questionId]: nextSession }))
      }
      setDiscussionByQuestion((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), { role: 'assistant', text: String(reply) }],
      }))
    } catch (error) {
      setDiscussionByQuestion((prev) => ({
        ...prev,
        [questionId]: [
          ...(prev[questionId] || []),
          {
            role: 'assistant',
            text: error instanceof Error ? error.message : 'Could not send discussion message.',
          },
        ],
      }))
    }
  }, [current, discussionInput, discussionSessionByQuestion, discussionByQuestion, courseId])

  const replaceQuizRoute = useCallback(
    (nextState) => {
      const id = encodeURIComponent(JSON.stringify(nextState))
      router.replace(`/quiz/${id}`)
    },
    [router],
  )

  const startQuiz = useCallback(() => {
    const n = Number(setupCount)
    const c = Math.min(Math.max(1, Number.isFinite(n) ? n : 1), poolTotal)
    const newSeed = Math.floor(Math.random() * 2147483647)
    const nextState = {
      courseId,
      year,
      level,
      type,
      ...(offeringId ? { offeringId } : {}),
      ...(sourceLabel ? { sourceLabel } : {}),
      ...(tagId ? { tagId } : {}),
      ...(courseName ? { courseName } : {}),
      mode: 'quiz',
      count: String(c),
      seed: String(newSeed),
      mins: String(setupMins),
    }
    replaceQuizRoute(nextState)
  }, [
    replaceQuizRoute,
    courseId,
    year,
    level,
    type,
    offeringId,
    sourceLabel,
    tagId,
    courseName,
    setupCount,
    setupMins,
    poolTotal,
  ])

  const setModeReview = useCallback(() => {
    const nextState = {
      courseId,
      year,
      level,
      type,
      ...(offeringId ? { offeringId } : {}),
      ...(sourceLabel ? { sourceLabel } : {}),
      ...(tagId ? { tagId } : {}),
      ...(courseName ? { courseName } : {}),
      mode: 'review',
    }
    replaceQuizRoute(nextState)
  }, [replaceQuizRoute, courseId, year, level, type, offeringId, sourceLabel, courseName, tagId])

  const setModeQuizSetup = useCallback(() => {
    const nextState = {
      courseId,
      year,
      level,
      type,
      ...(offeringId ? { offeringId } : {}),
      ...(sourceLabel ? { sourceLabel } : {}),
      ...(tagId ? { tagId } : {}),
      ...(courseName ? { courseName } : {}),
      mode: 'quiz',
    }
    replaceQuizRoute(nextState)
  }, [replaceQuizRoute, courseId, year, level, type, offeringId, sourceLabel, courseName, tagId])

  const copyShareLink = useCallback(async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      await navigator.clipboard.writeText(url)
      showToast('Link copied. Only signed-in users can open it.', 'success')
    } catch {
      showToast('Could not copy link', 'error')
    }
  }, [showToast])

  const saveForLater = useCallback(() => {
    if (typeof window === 'undefined') return
    const href = window.location.href
    const title =
      (courseName || 'Quiz').trim() ||
      `${year ? `Year ${year}` : ''}${level ? ` · L${level}` : ''}`.trim() || 'Saved quiz'
    saveQuizBookmark({ href, title })
    setBookmarkTick((t) => t + 1)
    showToast('Saved to this device for later.', 'success')
  }, [courseName, year, level, showToast])

  const removeBookmark = useCallback(
    (id) => {
      removeQuizBookmark(id)
      setBookmarkTick((t) => t + 1)
      showToast('Removed from saved', 'info')
    },
    [showToast],
  )

  const displayTitle = courseName || 'Past questions'

  const goToResults = useCallback(() => {
    const questionBreakdown = activeQuestions.map((q, idx) => {
      const selectedIndex = mcqAnswers[q.id]
      const rows = solutionById[q.id] ?? []
      const correctIndex = q.options?.length ? resolveMcqCorrectIndex(q.options, rows) : null
      return {
        id: q.id,
        index: idx + 1,
        text: q.questionText,
        selectedIndex: selectedIndex ?? null,
        selectedText:
          q.options?.length && selectedIndex !== undefined ? q.options[selectedIndex] : essayDraft[q.id] || '',
        correctIndex,
        correctText:
          q.options?.length && correctIndex !== null ? q.options[correctIndex] : officialAnswerDisplay(rows, q.options) || '',
        flagged: Boolean(flagged[q.id]),
      }
    })
    const incorrect = questionBreakdown.filter(
      (q) => q.correctIndex !== null && q.selectedIndex !== null && q.selectedIndex !== q.correctIndex,
    ).length
    const flaggedTotal = questionBreakdown.filter((q) => q.flagged).length
    const payload = {
      total,
      correct: scoreSummary?.mcqCorrect ?? 0,
      incorrect,
      flagged: flaggedTotal,
      courseLabel: displayTitle,
      sessionLabel: `${year ? `Year ${year}` : ''}${level ? ` · Level ${level}` : ''}`,
      questionBreakdown,
    }
    const id = encodeURIComponent(JSON.stringify(payload))
    router.push(`/quiz/${id}/results`)
  }, [
    router,
    total,
    scoreSummary?.mcqCorrect,
    displayTitle,
    year,
    level,
    activeQuestions,
    mcqAnswers,
    solutionById,
    essayDraft,
    flagged,
  ])

  if (!ready) {
    return (
      <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonQuestionCard key={`practice-ready-skeleton-${i}`} />
        ))}
      </div>
    )
  }

  if (!courseId || !year || !level) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Quiz mode</h1>
        <p className="mt-2 text-sm text-slate-600">
          Open quiz mode from the dashboard after you pick a course, year, and level — or add{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">courseId</code>,{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">year</code>, and{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">level</code> to the URL. You must be signed in
          to view questions.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-800"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to dashboard
        </Link>
      </div>
    )
  }

  if (questionsQ.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonQuestionCard key={`practice-questions-skeleton-${i}`} />
        ))}
      </div>
    )
  }

  if (questionsQ.isError) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <ErrorState error="Could not load questions for this set." onRetry={() => void questionsQ.refetch()} />
      </div>
    )
  }

  if (poolTotal === 0) {
    return (
      <div className="mx-auto max-w-lg px-2 py-4 text-center sm:px-4">
        <EmptyState
          title="No questions here yet"
          subtitle="Try different filters or upload question content for this course."
          actionLabel="Back to dashboard"
          onAction={() => void router.push('/dashboard')}
        />
      </div>
    )
  }

  const metaBits = [
    sourceLabel || null,
    year ? `Year ${year}` : null,
    level ? `Level ${level}` : null,
    mode === 'quiz' && hasQuizParams
      ? `${total} quiz questions (of ${poolTotal})`
      : `${poolTotal} questions`,
  ].filter(Boolean)

  const showQuizSetup = mode === 'quiz' && !hasQuizParams
  const breadcrumbItems = [
    { label: 'My Courses', href: '/courses' },
    { label: displayTitle, href: courseId ? `/courses/${courseId}` : '/courses' },
    { label: year ? `${year}/${Number(year) + 1}` : 'Session' },
    { label: mode === 'quiz' ? (sourceLabel ? `Quiz · ${sourceLabel}` : 'Quiz') : 'Review' },
  ]

  if (showQuizSetup) {
    return (
      <div className="-mx-4 -my-6 min-h-[calc(100vh-5rem)] bg-slate-100 px-4 py-8 sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-lg space-y-5">
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quiz mode</h1>
            <p className="mt-1 text-sm text-slate-500">{displayTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{metaBits.join(' · ')}</p>
          </header>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Start a random quiz</h2>
            <p className="mt-1 text-xs text-slate-500">
              We&apos;ll shuffle all {poolTotal} loaded questions and pick a subset. Share the link after you
              start so someone else gets the same set (same seed).
            </p>
            <label className="mt-4 block text-xs font-medium text-slate-600">
              Number of questions (max {poolTotal})
              <input
                type="number"
                min={1}
                max={poolTotal}
                value={setupCount}
                onChange={(e) => setSetupCount(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="mt-4 block text-xs font-medium text-slate-600">
              Time limit
              <select
                value={setupMins}
                onChange={(e) => setSetupMins(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value={0}>No timer</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </label>
            <button
              type="button"
              onClick={startQuiz}
              className="mt-6 w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow hover:bg-teal-800"
            >
              Start quiz
            </button>
          </section>

          <button
            type="button"
            onClick={setModeReview}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Review all {poolTotal} questions in order
          </button>

          <CollapsibleBookmarks
            bookmarks={bookmarks}
            open={savedOpen}
            onToggle={() => setSavedOpen((o) => !o)}
            onRemove={removeBookmark}
          />

          <p className="text-center text-xs text-slate-500">
            <Link href="/dashboard" className="font-medium text-teal-700 underline hover:text-teal-800">
              Back to dashboard
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-5rem)] bg-slate-100 px-4 py-8 sm:-mx-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quiz mode</h1>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {mode === 'quiz' ? 'Random set' : 'Review all'}
              </span>
              {isQuizSession && quizSubmitted ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  Submitted
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-slate-700">{displayTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{metaBits.join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mode === 'review' ? (
                <button
                  type="button"
                  onClick={setModeQuizSetup}
                  className="rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50"
                >
                  Switch to quiz mode
                </button>
              ) : (
                <button
                  type="button"
                  onClick={setModeReview}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Review full list
                </button>
              )}
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                Share link
              </button>
              <button
                type="button"
                onClick={saveForLater}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Bookmark className="h-3.5 w-3.5" aria-hidden />
                Save for later
              </button>
            </div>
            <p className="mt-2 flex items-start gap-1 text-[11px] text-slate-500">
              <Link2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              Sharing sends this URL. Recipients must be signed in to Edulamad to load the same quiz.
            </p>
          </div>
          {mode === 'quiz' && hasQuizParams && timerMinutes > 0 ? (
            <div
              className={`flex flex-col items-end gap-0.5 rounded-xl border px-4 py-3 font-mono text-xl font-bold tabular-nums shadow-sm ${
                (quizSubmitted ? frozenTimerSec : timeLeftSec) != null &&
                (quizSubmitted ? frozenTimerSec : timeLeftSec) <= 60
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-teal-200 bg-teal-50 text-teal-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0 opacity-70" aria-hidden />
                {formatCountdown(
                  quizSubmitted ? (typeof frozenTimerSec === 'number' ? frozenTimerSec : 0) : timeLeftSec ?? 0,
                )}
              </span>
              {quizSubmitted ? (
                <span className="text-center text-[10px] font-sans font-medium uppercase tracking-wide text-slate-500">
                  Timer stopped
                </span>
              ) : null}
            </div>
          ) : null}
        </header>

        {current?.attachmentKey || current?.id ? (
          <QuizSourceMaterialBar
            attachmentKey={current?.attachmentKey}
            questionId={current?.id}
            questionNum={total > 0 ? currentIndex + 1 : null}
            questionTotal={total > 0 ? total : null}
          />
        ) : null}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-800">Progress</span>
            <span className="text-slate-600">
              {answeredCount} of {total} answered
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={answeredCount}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {answeredCount} answered · {flaggedCount} flagged · {Math.max(0, total - answeredCount)} remaining
          </p>
        </section>

        {isQuizSession ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            {quizSubmitted ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Results</p>
                {solutionsLoading ? (
                  <p className="text-sm text-slate-600">Loading official answer key…</p>
                ) : (
                  <>
                    <p className="text-sm text-emerald-900">
                      <span className="font-semibold">Submitted.</span>{' '}
                      {(scoreSummary?.mcqGradable ?? 0) > 0 ? (
                        <>
                          {scoreSummary.mcqCorrect} of {scoreSummary.mcqGradable} multiple-choice correct.
                        </>
                      ) : (
                        <>Compare your responses to the official key below (no auto-graded MCQ matches detected).</>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={goToResults}
                      className="mt-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                    >
                      View results
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  When you&apos;re ready, submit to load the verified TA key, highlight the correct options, and
                  mark any wrong choices.
                </p>
                <button
                  type="button"
                  onClick={submitQuiz}
                  className="shrink-0 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-800"
                >
                  Submit quiz
                </button>
              </div>
            )}
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setGridOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Questions</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {answeredCount}/{total}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-teal-700">
              {gridOpen ? 'Collapse' : 'Expand'}
              {gridOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>

          {gridOpen ? (
            <div className="border-t border-slate-100 px-5 pb-5 pt-2">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {activeQuestions.map((qu, idx) => {
                  const num = idx + 1
                  const isCurrent = idx === currentIndex
                  const answered = isAnsweredAt(idx)
                  const isFlagged = Boolean(flagged[qu.id])
                  const rows = solutionById[qu.id] ?? []
                  const cell = getGridCellClasses({
                    isCurrent,
                    answered,
                    flagged: isFlagged,
                    quizModeSubmitted: isQuizSession && quizSubmitted,
                    question: qu,
                    solutionRows: rows,
                    selectedIndex: mcqAnswers[qu.id],
                    solutionsLoading,
                  })
                  return (
                    <button
                      key={qu.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition ${cell}`}
                    >
                      {num}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                {isQuizSession && quizSubmitted && !solutionsLoading ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                      Correct
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />
                      Wrong
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" />
                      Skipped MCQ
                    </span>
                  </>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-teal-700" />
                  Current
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                  Flagged
                </span>
                {!(isQuizSession && quizSubmitted) ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-sky-200" />
                      Answered
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded border border-slate-300 bg-white" />
                      Unanswered
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        {current ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Question {currentIndex + 1} of {total}
            </p>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => toggleFlag(current.id)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                  flagged[current.id]
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {flagged[current.id] ? 'Flagged' : 'Flag'}
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mt-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Question</p>
                <p className="mt-1 text-base leading-relaxed text-slate-900">{current.questionText}</p>

                {current.options?.length ? (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Options</p>
                    <div
                      className="mt-3 space-y-2"
                      role="radiogroup"
                      aria-label={`Answer choices for question ${currentIndex + 1}`}
                    >
                      {current.options.map((opt, oidx) => {
                        const letter = optionLetter(oidx)
                        const selected = mcqAnswers[current.id] === oidx
                        const showKey = isQuizSession && quizSubmitted && !solutionsLoading
                        const corr = currentCorrectIdx

                        let rowClass =
                          selected
                            ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        let letterClass = selected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-600'

                        if (showKey && corr !== null) {
                          if (oidx === corr) {
                            rowClass = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                            letterClass = 'bg-emerald-700 text-white'
                          } else if (selected) {
                            rowClass = 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'
                            letterClass = 'bg-rose-600 text-white'
                          } else {
                            rowClass = 'border-slate-100 bg-slate-50/90 text-slate-600'
                            letterClass = 'bg-slate-200 text-slate-600'
                          }
                        }

                        return (
                          <button
                            key={`${current.id}-${oidx}`}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={isQuizSession && quizSubmitted}
                            onClick={() => setMcq(current.id, oidx)}
                            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${rowClass}`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${letterClass}`}
                            >
                              {letter}
                            </span>
                            <span className="flex-1 pt-1 text-slate-800">
                              {opt}
                              {showKey && corr !== null && oidx === corr ? (
                                <span className="ml-2 text-xs font-semibold text-emerald-700">Correct</span>
                              ) : null}
                              {showKey && selected && corr !== null && oidx !== corr ? (
                                <span className="ml-2 text-xs font-semibold text-rose-700">Your answer</span>
                              ) : null}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Your answer
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      No multiple-choice options for this item — write a short answer to track progress.
                    </p>
                    <textarea
                      value={essayDraft[current.id] ?? ''}
                      onChange={(e) => setEssay(current.id, e.target.value)}
                      readOnly={isQuizSession && quizSubmitted}
                      rows={4}
                      className="mt-3 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 read-only:bg-slate-50"
                      placeholder="Type your answer or notes…"
                    />
                  </div>
                )}

                {isQuizSession && quizSubmitted ? (
                  solutionsLoading ? (
                    <p className="mt-5 text-sm text-slate-500">Loading official answer…</p>
                  ) : (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                        Official answer (TA / verified)
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950">
                        {officialAnswerDisplay(currentSolutionRows, current.options) || '—'}
                      </p>
                    </div>
                  )
                ) : null}

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Solutions ({(solutionsFeedQ.data || []).length + (generatedAiByQuestion[current.id] ? 1 : 0)})
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setShowSolutions((prev) => ({ ...prev, [current.id]: !prev[current.id] }))
                      }
                      className="text-xs font-medium text-teal-700 hover:text-teal-800"
                    >
                      {currentSolutionsExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {currentSolutionsExpanded && (mode === 'review' || currentAnswered) ? (
                    <div className="mt-3 space-y-2">
                      {(solutionsFeedQ.data || []).map((sol) => (
                        <div key={sol.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {sol.source}
                          </p>
                          <p className="mt-1 text-sm text-slate-800">{sol.text}</p>
                          <button
                            type="button"
                            onClick={() => upvoteSolutionM.mutate(sol.id)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {sol.upvotes} upvotes
                          </button>
                        </div>
                      ))}
                      {generatedAiByQuestion[current.id] ? (
                        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                            AI generated
                          </p>
                          <p className="mt-1 text-sm text-violet-900">
                            {generatedAiByQuestion[current.id]}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <input
                          value={addingSolution}
                          onChange={(e) => setAddingSolution(e.target.value)}
                          placeholder="Add your solution..."
                          className="h-9 min-w-[240px] flex-1 rounded-md border border-slate-300 px-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!addingSolution.trim()) return
                            try {
                              await addSolutionM.mutateAsync(addingSolution.trim())
                              setAddingSolution('')
                            } catch {
                              /* no-op */
                            }
                          }}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          Add your solution
                        </button>
                        <button
                          type="button"
                          disabled={!isProUser || aiGenerating}
                          onClick={async () => {
                            if (!current) return
                            if (!isProUser) {
                              showToast('Upgrade to Pro for AI solutions', 'error')
                              return
                            }
                            setAiGenerating(true)
                            try {
                              const { data } = await apiClient.post(API.ai.complete, {
                                prompt: `Provide a concise solution for this exam question: ${current.questionText}`,
                                questionId: current.id,
                              })
                              const text =
                                data?.text || data?.output || data?.message || 'AI solution generated.'
                              setGeneratedAiByQuestion((prev) => ({
                                ...prev,
                                [current.id]: String(text),
                              }))
                            } catch (error) {
                              if (error?.status === 503) {
                                showToast('AI is temporarily unavailable', 'error')
                              } else {
                                showToast('Could not generate AI solution', 'error')
                              }
                            } finally {
                              setAiGenerating(false)
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {aiGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          Generate AI solution
                        </button>
                      </div>
                    </div>
                  ) : mode === 'quiz' && !currentAnswered ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Solutions are hidden in quiz mode until you answer this question.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setDiscussionOpen((prev) => ({ ...prev, [current.id]: !prev[current.id] }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Discussion
                  </button>
                  {discussionOpen[current.id] ? (
                    <div className="mt-3 rounded-xl border border-slate-200 p-3">
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {(discussionByQuestion[current.id] || []).map((m, idx) => (
                          <div
                            key={`${m.role}-${idx}`}
                            className={`rounded-md px-2.5 py-2 text-sm ${
                              m.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-teal-50 text-teal-900'
                            }`}
                          >
                            {m.text}
                          </div>
                        ))}
                        {(discussionByQuestion[current.id] || []).length === 0 ? (
                          <p className="text-xs text-slate-500">Ask about this question...</p>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={discussionInput}
                          onChange={(e) => setDiscussionInput(e.target.value)}
                          placeholder="Ask about this question..."
                          className="h-9 flex-1 rounded-md border border-slate-300 px-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => void sendDiscussion()}
                          className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Join the conversation about this question...
                    </p>
                  )}
                </div>

                <QuestionHint
                  questionId={current.id}
                  inlineHint={current.hint}
                  blockRemoteHint={isQuizSession && !quizSubmitted}
                />
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex <= 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              {mode === 'quiz' && hasQuizParams ? (
                <button
                  type="button"
                  onClick={setModeQuizSetup}
                  className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-100"
                >
                  New random quiz
                </button>
              ) : null}
              <button
                type="button"
                disabled={currentIndex >= total - 1}
                onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        ) : null}

        <CollapsibleBookmarks
          bookmarks={bookmarks}
          open={savedOpen}
          onToggle={() => setSavedOpen((o) => !o)}
          onRemove={removeBookmark}
        />

        <p className="text-center text-xs text-slate-500">
          <Link href="/dashboard" className="font-medium text-teal-700 underline hover:text-teal-800">
            Back to dashboard
          </Link>
        </p>
      </div>
      {current ? (
        <div className="fixed bottom-4 left-1/2 z-20 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-600">
              Question {currentIndex + 1}/{total}
            </span>
            <button
              type="button"
              onClick={() => toggleFlag(current.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                flagged[current.id]
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              Flag
            </button>
            <button
              type="button"
              disabled={currentIndex >= total - 1 && !(isQuizSession && !quizSubmitted)}
              onClick={() => {
                if (currentIndex === total - 1 && isQuizSession && !quizSubmitted) {
                  submitQuiz()
                  return
                }
                setCurrentIndex((i) => Math.min(total - 1, i + 1))
              }}
              className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              {currentIndex === total - 1 && isQuizSession && !quizSubmitted ? 'Submit quiz' : 'Next'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CollapsibleBookmarks({ bookmarks, open, onToggle, onRemove }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">
          Saved on this device ({bookmarks.length})
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {open ? (
        <ul className="space-y-2 border-t border-slate-100 px-5 pb-4 pt-2">
          {bookmarks.length === 0 ? (
            <li className="text-xs text-slate-500">No saved quizzes yet. Use &quot;Save for later&quot; above.</li>
          ) : (
            bookmarks.map((b) => (
              <li
                key={b.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <Link href={b.href} className="min-w-0 flex-1 text-sm font-medium text-teal-800 hover:underline">
                  {b.title}
                </Link>
                <button
                  type="button"
                  onClick={() => onRemove(b.id)}
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Remove saved quiz"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </section>
  )
}
