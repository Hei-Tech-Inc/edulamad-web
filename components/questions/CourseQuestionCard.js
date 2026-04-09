import { useCallback, useState } from 'react'
import { ChevronDown, Copy, FileText, Loader2, ExternalLink } from 'lucide-react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

/**
 * @param {object} props
 * @param {{ id: string; questionText: string; year?: string | number; level?: string | number; type?: string; attachmentKey?: string }} props.question
 * @param {number} [props.index]
 */
export default function CourseQuestionCard({ question: q, index }) {
  const [expanded, setExpanded] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [copied, setCopied] = useState(false)

  const openSourcePdf = useCallback(async () => {
    const key = q.attachmentKey
    if (!key) return
    setPdfError('')
    setPdfLoading(true)
    try {
      const path = API.files.signedUrl(encodeURIComponent(key))
      const { data } = await apiClient.get(path)
      const rec = data && typeof data === 'object' ? data : null
      const url =
        rec && typeof rec.url === 'string'
          ? rec.url
          : typeof data === 'string'
            ? data
            : null
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        setPdfError('No URL in response')
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e instanceof Error ? e.message : 'Could not open PDF')
      setPdfError(String(msg))
    } finally {
      setPdfLoading(false)
    }
  }, [q.attachmentKey])

  const copyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(q.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }, [q.id])

  const label = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#141c2e]/90 to-[#0f172a]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition hover:border-orange-500/35 hover:shadow-[0_16px_44px_rgba(251,146,60,0.08)]">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 to-amber-500/60 opacity-90"
        aria-hidden
      />
      <div className="pl-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {label ? (
              <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-orange-500/25 bg-orange-500/10 px-2 text-xs font-bold tabular-nums text-orange-200">
                {label}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {q.type || 'Question'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
              Year {q.year ?? '—'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
              Level {q.level ?? '—'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:border-white/20 hover:text-slate-200"
              title="Copy question id"
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied' : 'ID'}
            </button>
            {q.attachmentKey ? (
              <button
                type="button"
                onClick={() => void openSourcePdf()}
                disabled={pdfLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-500 disabled:opacity-60"
              >
                {pdfLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Source PDF
                <ExternalLink className="h-3 w-3 opacity-80" />
              </button>
            ) : null}
          </div>
        </div>

        <p
          className={`mt-3 text-[15px] leading-relaxed text-slate-100/95 ${expanded ? '' : 'line-clamp-4'}`}
        >
          {q.questionText}
        </p>

        {q.questionText && q.questionText.length > 220 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-300/90 hover:text-orange-200"
          >
            <ChevronDown
              className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`}
            />
            {expanded ? 'Show less' : 'Show full question'}
          </button>
        ) : null}

        {pdfError ? (
          <p className="mt-2 text-xs text-rose-400">{pdfError}</p>
        ) : null}
      </div>
    </article>
  )
}
