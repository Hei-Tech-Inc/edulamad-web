'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import {
  useCourseOfferings,
  useCreateOffering,
} from '@/hooks/content/useCourseOfferings';
import { generateAcademicYears } from '@/lib/academic-years';
import {
  currentAcademicYear,
  generateAssessmentLabel,
  getSourceTypeLabel,
  isValidAcademicYear,
} from '@/lib/utils/academic-year';
import { assessmentsApi } from '@/lib/api/assessments.api';
import { AssessmentTypeSelector } from '@/components/admin/AssessmentTypeSelector';
import { AcademicYearInput } from '@/components/admin/AcademicYearInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function offeringLabel(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return 'Offering';
  const o = raw as Record<string, unknown>;
  const ay = o.academicYear ?? o.academicYearLabel;
  const sem = o.semester;
  const lev = o.level;
  const bits: string[] = [];
  if (typeof ay === 'string') bits.push(ay);
  if (typeof sem === 'number') bits.push(`Sem ${sem}`);
  if (typeof lev === 'number') bits.push(`Level ${lev}`);
  return bits.join(' · ') || String(o._id ?? o.id ?? 'Offering');
}

export function CourseOfferingsAdminPage() {
  const router = useRouter();
  const courseId = typeof router.query.id === 'string' ? router.query.id : '';

  const detailQ = useQuery({
    queryKey: ['admin', 'institutions-course-detail', courseId],
    enabled: Boolean(courseId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.institutions.courses.detail(courseId),
        { signal },
      );
      return data;
    },
  });

  const offeringsQ = useCourseOfferings(courseId || null);
  const createM = useCreateOffering();

  const years = generateAcademicYears(12);
  const [academicYear, setAcademicYear] = useState(years[0]);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [level, setLevel] = useState<100 | 200 | 300 | 400 | 500>(200);
  const [openOfferingId, setOpenOfferingId] = useState<string | null>(null);
  const [assessmentType, setAssessmentType] = useState('final_exam');
  const [assessmentNumber, setAssessmentNumber] = useState(1);
  const [customLabel, setCustomLabel] = useState('');
  const [paperYear, setPaperYear] = useState(currentAcademicYear());
  const [paperYearErr, setPaperYearErr] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const [submittingPaper, setSubmittingPaper] = useState(false);

  const courseName =
    detailQ.data &&
    typeof detailQ.data === 'object' &&
    'name' in detailQ.data &&
    typeof (detailQ.data as { name?: unknown }).name === 'string'
      ? (detailQ.data as { name: string }).name
      : '';
  const courseCode =
    detailQ.data &&
    typeof detailQ.data === 'object' &&
    'code' in detailQ.data &&
    typeof (detailQ.data as { code?: unknown }).code === 'string'
      ? (detailQ.data as { code: string }).code
      : '';

  const createOffering = async () => {
    if (!courseId) return;
    await createM.mutateAsync({
      courseId,
      academicYear,
      semester,
      level,
    });
  };

  const addPaper = async (offeringId: string) => {
    if (!isValidAcademicYear(paperYear)) {
      setPaperYearErr('Must be format YYYY/YYYY (e.g. 2024/2025)');
      return;
    }
    setPaperYearErr('');
    setSubmitErr('');
    setSubmittingPaper(true);
    try {
      await assessmentsApi.upload({
        offeringId,
        documentType: assessmentType as
          | 'final_exam'
          | 'interim_assessment'
          | 'class_quiz'
          | 'class_test'
          | 'assignment',
        assessmentType:
          assessmentType === 'interim_assessment' ||
          assessmentType === 'class_quiz' ||
          assessmentType === 'class_test' ||
          assessmentType === 'assignment'
            ? assessmentType
            : undefined,
        assessmentNumber:
          assessmentType === 'final_exam' ? undefined : assessmentNumber,
        customLabel: customLabel || undefined,
        academicYear: paperYear,
      });
      setCustomLabel('');
      setAssessmentNumber(1);
      setAssessmentType('final_exam');
    } catch (e) {
      setSubmitErr(
        e instanceof Error
          ? e.message
          : 'Could not add assessment paper.',
      );
    } finally {
      setSubmittingPaper(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/courses" className="hover:text-slate-900">
          Courses
        </Link>
        <span aria-hidden>›</span>
        <span className="text-slate-900">
          {courseCode || courseId || '…'} {courseName ? `— ${courseName}` : ''}
        </span>
      </nav>

      {detailQ.isLoading ? (
        <p className="text-sm text-slate-500">Loading course…</p>
      ) : detailQ.isError ? (
        <p className="text-sm text-danger">Could not load course.</p>
      ) : null}

      <Card className="space-y-4 border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">New offering</h2>
        <p className="text-xs text-slate-500">
          POST {API.content.offerings} — academic year, semester, and level for this course run.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-slate-600">
            Academic year
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600">
            Semester
            <div className="mt-1 grid grid-cols-2 gap-1">
              {([1, 2] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSemester(s)}
                  className={`h-10 rounded-lg border text-sm font-medium ${
                    semester === s
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>
          <label className="text-xs text-slate-600">
            Level
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
              value={level}
              onChange={(e) =>
                setLevel(Number(e.target.value) as 100 | 200 | 300 | 400 | 500)
              }
            >
              {[100, 200, 300, 400, 500].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button
          type="button"
          disabled={!courseId || createM.isPending}
          onClick={() => void createOffering()}
        >
          {createM.isPending ? 'Creating…' : 'Create offering'}
        </Button>
      </Card>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wider text-slate-600 uppercase">
          Existing offerings
        </h2>
        {offeringsQ.isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (offeringsQ.data?.length ?? 0) === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            No offerings yet for this course.
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {(offeringsQ.data ?? []).map((raw, i) => (
              <li key={String((raw as { _id?: unknown })._id ?? (raw as { id?: unknown }).id ?? i)}>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">{offeringLabel(raw)}</p>
                    <button
                      type="button"
                      className="text-xs text-brand hover:underline"
                      onClick={() =>
                        setOpenOfferingId((prev) =>
                          prev === String((raw as { _id?: unknown })._id ?? (raw as { id?: unknown }).id ?? i)
                            ? null
                            : String((raw as { _id?: unknown })._id ?? (raw as { id?: unknown }).id ?? i),
                        )
                      }
                    >
                      {openOfferingId === String((raw as { _id?: unknown })._id ?? (raw as { id?: unknown }).id ?? i) ? 'Hide details' : 'Manage papers'}
                    </button>
                  </div>
                  {openOfferingId === String((raw as { _id?: unknown })._id ?? (raw as { id?: unknown }).id ?? i) ? (
                    <OfferingCard
                      offering={raw as Record<string, unknown>}
                      onAddPaper={addPaper}
                      submittingPaper={submittingPaper}
                      assessmentType={assessmentType}
                      assessmentNumber={assessmentNumber}
                      customLabel={customLabel}
                      academicYear={paperYear}
                      paperYearError={paperYearErr}
                      submitError={submitErr}
                      setAssessment={(type, num, label) => {
                        setAssessmentType(type);
                        setAssessmentNumber(num);
                        setCustomLabel(label);
                      }}
                      setAcademicYear={setPaperYear}
                    />
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OfferingCard({
  offering,
  onAddPaper,
  submittingPaper,
  assessmentType,
  assessmentNumber,
  customLabel,
  academicYear,
  paperYearError,
  submitError,
  setAssessment,
  setAcademicYear,
}: {
  offering: Record<string, unknown>;
  onAddPaper: (offeringId: string) => Promise<void>;
  submittingPaper: boolean;
  assessmentType: string;
  assessmentNumber: number;
  customLabel: string;
  academicYear: string;
  paperYearError: string;
  submitError: string;
  setAssessment: (type: string, number: number, label: string) => void;
  setAcademicYear: (value: string) => void;
}) {
  const offeringId =
    typeof offering._id === 'string'
      ? offering._id
      : typeof offering.id === 'string'
        ? offering.id
        : '';

  const assessmentsQ = useQuery({
    queryKey: ['offering-assessments', offeringId],
    enabled: Boolean(offeringId),
    queryFn: async ({ signal }) => {
      const { data } = await assessmentsApi.getByOffering(offeringId, signal);
      const arr = Array.isArray((data as { data?: unknown[] })?.data)
        ? (data as { data: unknown[] }).data
        : Array.isArray(data)
          ? data
          : [];
      return { items: arr as Record<string, unknown>[] };
    },
  });

  const grouped = {
    final_exam: [] as Record<string, unknown>[],
    interim_assessment: [] as Record<string, unknown>[],
    class_quiz: [] as Record<string, unknown>[],
    class_test: [] as Record<string, unknown>[],
    assignment: [] as Record<string, unknown>[],
  };
  for (const item of assessmentsQ.data?.items ?? []) {
    const type =
      typeof item.type === 'string'
        ? item.type
        : typeof item.documentType === 'string'
          ? item.documentType
          : 'final_exam';
    if (type in grouped) {
      grouped[type as keyof typeof grouped].push(item);
    }
  }

  const practiceCount = 0;

  return (
    <div className="mt-3 flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      {assessmentsQ.isError ? (
        <p className="text-xs text-danger">
          Failed to load assessments for this offering.
        </p>
      ) : null}

      <AssessmentRow title="Final Exam(s)" items={grouped.final_exam} sourceType="final_exam" />
      <AssessmentRow title="Interim Assessments" items={grouped.interim_assessment} sourceType="interim_assessment" />
      <AssessmentRow title="Class Quizzes" items={grouped.class_quiz} sourceType="class_quiz" />
      <AssessmentRow title="Class Tests" items={grouped.class_test} sourceType="class_test" />
      <AssessmentRow title="Assignments" items={grouped.assignment} sourceType="assignment" />

      <div className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-brand">
        Practice bank questions: {practiceCount} {' '}
        <span className="text-slate-600">(linked in student course Practice tab)</span>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Add paper / assessment
        </p>
        <AssessmentTypeSelector
          value={assessmentType}
          number={assessmentNumber}
          customLabel={customLabel}
          onChange={setAssessment}
        />
        <AcademicYearInput
          value={academicYear}
          onChange={setAcademicYear}
          error={paperYearError}
          useDropdown
        />
        <p className="text-xs text-slate-500">
          This will be labelled:{' '}
          <span className="font-medium text-brand">
            {generateAssessmentLabel(assessmentType, assessmentNumber, customLabel)}
          </span>
        </p>
        {submitError ? <p className="text-xs text-danger">{submitError}</p> : null}
        <Button
          type="button"
          disabled={!offeringId || submittingPaper}
          onClick={() => void onAddPaper(offeringId)}
        >
          {submittingPaper ? 'Adding…' : 'Add assessment'}
        </Button>
      </div>
    </div>
  );
}

function AssessmentRow({
  title,
  items,
  sourceType,
}: {
  title: string;
  items: Record<string, unknown>[];
  sourceType: string;
}) {
  const source = getSourceTypeLabel(sourceType);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">{title}</p>
        <span className="text-xs text-slate-500">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
          No records
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div
              key={`${String(item._id ?? item.id ?? i)}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <p className="text-xs text-slate-900">
                {typeof item.label === 'string' ? item.label : `${source.label} ${i + 1}`}
              </p>
              <span className="text-[10px] text-slate-500">
                {typeof item.academicYear === 'string' ? item.academicYear : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
