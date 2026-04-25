import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { useToast } from '../../components/Toast'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { useCourses } from '@/hooks/institutions/useInstitutionsCatalog'
import { useMyEnrollments, useSetEnrollments } from '@/hooks/enrollments/useEnrollments'

function pickEnrollmentIds(data) {
  if (!data) return []
  if (Array.isArray(data.courseIds)) return data.courseIds.filter(Boolean)
  if (Array.isArray(data)) {
    return data
      .map((row) => row?.courseId || row?._id || row?.id)
      .filter((id) => typeof id === 'string' && id)
  }
  return []
}

function EnrollmentPageInner() {
  const router = useRouter()
  const { showToast } = useToast()
  const profileQ = useStudentProfile()
  const enrollmentsQ = useMyEnrollments()
  const setEnrollmentsM = useSetEnrollments()

  const profile = profileQ.data || null
  const deptId = profile?.deptId || null
  const semester = profile?.semesterData === 2 ? 2 : 1
  const level = Number(profile?.levelData || 300)
  const year = String(new Date().getFullYear())
  const academicYear = `${year}/${Number(year) + 1}`
  const coursesQ = useCourses(deptId, true)

  const initialIds = useMemo(() => pickEnrollmentIds(enrollmentsQ.data), [enrollmentsQ.data])
  const [selected, setSelected] = useState([])

  useEffect(() => {
    setSelected(initialIds)
  }, [initialIds])

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]))
  }

  const save = async () => {
    try {
      await setEnrollmentsM.mutateAsync({
        courseIds: selected,
        academicYear,
        semester,
        level,
      })
      showToast('Notifications updated', 'success')
      router.back()
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Could not save enrollments. Please try again.'
      showToast(msg, 'error')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My courses this semester</h1>
        <p className="text-sm text-slate-600">
          Level {profile?.levelData ?? '—'} · Semester {semester} · {academicYear}
        </p>
        <p className="mt-2 text-xs text-slate-500">Only get notified about courses you&apos;re taking now.</p>
      </div>

      <div className="max-h-[55vh] space-y-2 overflow-auto rounded-xl border border-slate-100 p-2">
        {(coursesQ.data || []).map((course) => {
          const isOn = selected.includes(course.id)
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => toggle(course.id)}
              className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left ${
                isOn
                  ? 'border-orange-300 bg-orange-50 text-orange-900'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <span className="text-sm font-medium">
                {course.code ? `${course.code} · ` : ''}
                {course.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-700">{selected.length} courses selected</p>
        <button
          type="button"
          onClick={() => void save()}
          disabled={setEnrollmentsM.isPending}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {setEnrollmentsM.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </section>
  )
}

export default function EnrollmentPage() {
  return (
    <ProtectedRoute>
      <Layout title="Course Enrollments">
        <EnrollmentPageInner />
      </Layout>
    </ProtectedRoute>
  )
}
