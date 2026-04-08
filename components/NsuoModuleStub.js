import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'

/**
 * Placeholder for legacy Supabase modules with no matching API in this app yet.
 */
export default function NsuoModuleStub({
  title,
  summary,
  details,
  backHref = '/dashboard',
  backLabel = 'Back to dashboard',
}) {
  return (
    <div className="min-h-screen bg-[#050505] font-montserrat text-neutral-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center text-sm text-orange-500 hover:text-orange-400"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {backLabel}
        </Link>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-sm">
          <div className="flex items-start gap-3 border-b border-white/10 px-6 py-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="mt-2 text-neutral-300">{summary}</p>
            </div>
          </div>
          {details && (
            <div className="border-t border-white/10 px-6 py-4 text-sm text-neutral-400">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
