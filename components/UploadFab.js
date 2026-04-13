import { useState } from 'react'
import Link from 'next/link'

const UPLOAD_OPTIONS = [
  { key: 'exam', label: 'Past Exam Paper' },
  { key: 'midsem', label: 'Interim Assessment' },
  { key: 'slides', label: 'Lecture Slides' },
  { key: 'solution', label: 'Answer Key / Solution' },
]

export default function UploadFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-700"
      >
        + Upload
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-900">What are you uploading?</h3>
            <ul className="mt-3 space-y-2">
              {UPLOAD_OPTIONS.map((opt) => (
                <li key={opt.key}>
                  <Link
                    href={`/upload?type=${encodeURIComponent(opt.key)}`}
                    className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    {opt.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
