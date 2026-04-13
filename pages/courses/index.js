import { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import EntityCombobox from '../../components/forms/EntityCombobox'
import {
  useCollegeSearch,
  useDepartmentSearch,
  useUniversitySearch,
} from '@/hooks/institutions/useInstitutionsCatalog'
import StudentStudyQuickLinks from '../../components/StudentStudyQuickLinks'
import { useStudentProfile, useUpsertStudentProfile } from '@/hooks/students/useStudentProfile'
import MyCoursesCatalog from '../../components/courses/MyCoursesCatalog'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'
import UploadFab from '../../components/UploadFab'

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <Layout title="My Courses">
        <CoursesContent />
      </Layout>
    </ProtectedRoute>
  )
}

function CoursesContent() {
  const profileQ = useStudentProfile()
  const upsertProfileM = useUpsertStudentProfile()
  const [uniSearch, setUniSearch] = useState('')
  const [collegeSearch, setCollegeSearch] = useState('')
  const [deptSearch, setDeptSearch] = useState('')
  const [university, setUniversity] = useState(null)
  const [college, setCollege] = useState(null)
  const [department, setDepartment] = useState(null)
  const [levelData, setLevelData] = useState('300')
  const [saveError, setSaveError] = useState('')
  const [promoDismissed, setPromoDismissed] = useState(false)
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = sessionHasAdminTools(sessionUser, accessToken)
  const isFreeUser = true

  const universitiesQ = useUniversitySearch(uniSearch, true)
  const collegesQ = useCollegeSearch(university?.id || null, collegeSearch, true)
  const departmentsQ = useDepartmentSearch(college?.id || null, deptSearch, true)

  const profile = profileQ.data || null
  const selectedLevel = Number(levelData || profile?.levelData || 300)
  const shouldShowPicker = !profile || !profile.universityId || !profile.deptId || !profile.levelData

  const selectedYear = String(new Date().getFullYear())

  const onSaveDiscovery = async () => {
    setSaveError('')
    if (!profile) {
      setSaveError('Complete onboarding first to save university and department to your profile.')
      return
    }
    if (!university?.id || !department?.id) {
      setSaveError('Pick university, college, and department.')
      return
    }
    try {
      await upsertProfileM.mutateAsync({
        indexNumber: profile.indexNumber,
        studentCategory: profile.studentCategory,
        otherStudentCategory: profile.otherStudentCategory,
        universityId: university.id,
        deptId: department.id,
        levelData: Number(levelData),
        semesterData: profile.semesterData,
      })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save selection.')
    }
  }

  return (
    <div className="space-y-5">
      {isFreeUser && !promoDismissed ? (
        <section className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-700">
              Have a promo code? Enter it to unlock more questions.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/profile/subscription" className="text-sm font-semibold text-orange-700">
                Enter code
              </Link>
              <button
                type="button"
                onClick={() => setPromoDismissed(true)}
                className="text-xs font-semibold text-slate-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <StudentStudyQuickLinks />

      {shouldShowPicker ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Find your courses</h2>
          <p className="mt-1 text-sm text-slate-600">
            Select your university, department, and level to see past papers and practice materials.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <EntityCombobox
              id="courses-university"
              label="University"
              placeholder="Search university"
              value={university}
              search={uniSearch}
              onSearchChange={setUniSearch}
              onSelect={(u) => {
                setUniversity(u)
                setCollege(null)
                setDepartment(null)
              }}
              options={universitiesQ.data || []}
              loading={universitiesQ.isLoading}
            />
            <EntityCombobox
              id="courses-college"
              label="College / faculty"
              placeholder={university?.id ? 'Search college' : 'Pick a university first'}
              value={college}
              search={collegeSearch}
              onSearchChange={setCollegeSearch}
              onSelect={(c) => {
                setCollege(c)
                setDepartment(null)
              }}
              options={collegesQ.data || []}
              loading={collegesQ.isLoading}
            />
            <EntityCombobox
              id="courses-department"
              label="Department"
              placeholder={college?.id ? 'Search department' : 'Pick a college first'}
              value={department}
              search={deptSearch}
              onSearchChange={setDeptSearch}
              onSelect={setDepartment}
              options={departmentsQ.data || []}
              loading={departmentsQ.isLoading}
            />
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">Level</span>
              <select
                value={levelData}
                onChange={(e) => setLevelData(e.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={onSaveDiscovery}
            disabled={upsertProfileM.isPending}
            className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {upsertProfileM.isPending ? 'Saving...' : 'Show my courses'}
          </button>
          {saveError ? <p className="mt-3 text-sm text-rose-700">{saveError}</p> : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">My Courses</h3>
            <p className="text-sm text-slate-600">
              Level {selectedLevel} · {selectedYear}/{Number(selectedYear) + 1}
            </p>
          </div>
          <Link href="/onboarding" className="text-sm font-medium text-orange-700 hover:text-orange-800">
            Change
          </Link>
        </div>

        <div className="mt-4">
          <MyCoursesCatalog
            selectedYear={selectedYear}
            selectedLevel={selectedLevel}
            university={university}
          />
        </div>
      </section>
      {isAdmin ? <UploadFab /> : null}
    </div>
  )
}
