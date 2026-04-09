import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Truncated monospace ID + one-click copy (for course/college/etc. IDs in admin tables). */
export default function CopyableId({ value, compact = true }) {
  const [copied, setCopied] = useState(false)
  if (!value || typeof value !== 'string') return <span className="text-slate-500">—</span>

  const display =
    compact && value.length > 18
      ? `${value.slice(0, 8)}…${value.slice(-6)}`
      : value.length > 28
        ? `${value.slice(0, 12)}…${value.slice(-8)}`
        : value

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex max-w-[220px] items-center gap-1.5" data-no-row-click>
      <span className="truncate font-mono text-[11px] text-slate-300" title={value}>
        {display}
      </span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 rounded-md border border-white/15 bg-white/[0.06] p-1 text-slate-400 transition hover:border-orange-500/40 hover:text-orange-200"
        title="Copy full ID"
        aria-label="Copy ID"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </div>
  )
}
