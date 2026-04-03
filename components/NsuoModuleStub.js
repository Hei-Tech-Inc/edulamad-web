import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'

/**
 * Placeholder for legacy Supabase modules with no Nsuo API in this app yet.
 */
export default function NsuoModuleStub({
  title,
  summary,
  details,
  backHref = '/dashboard',
  backLabel = 'Back to dashboard',
}) {
  return (
    <div className="min-h-screen bg-gray-100 font-montserrat">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={backHref}
          className="text-sky-600 hover:text-sky-800 inline-flex items-center text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {backLabel}
        </Link>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="mt-2 text-gray-700">{summary}</p>
            </div>
          </div>
          {details && (
            <div className="px-6 py-4 text-sm text-gray-600 border-t border-gray-100">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
