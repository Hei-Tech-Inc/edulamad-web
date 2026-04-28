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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <Link href="/admin/courses" className="hover:text-text-primary">
          Courses
        </Link>
        <span aria-hidden>›</span>
        <span className="text-text-primary">
          {courseCode || courseId || '…'} {courseName ? `— ${courseName}` : ''}
        </span>
      </nav>

      {detailQ.isLoading ? (
        <p className="text-sm text-text-muted">Loading course…</p>
      ) : detailQ.isError ? (
        <p className="text-sm text-danger">Could not load course.</p>
      ) : null}

      <Card className="space-y-4 p-4">
        <h2 className="text-sm font-semibold text-text-primary">New offering</h2>
        <p className="text-xs text-text-muted">
          POST {API.content.offerings} — academic year, semester, and level for this course run.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-text-secondary">
            Academic year
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm"
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
          <label className="text-xs text-text-secondary">
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
                      : 'border-white/10 bg-bg-surface text-text-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>
          <label className="text-xs text-text-secondary">
            Level
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm"
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
        <h2 className="mb-2 text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Existing offerings
        </h2>
        {offeringsQ.isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (offeringsQ.data?.length ?? 0) === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-text-muted">
            No offerings yet for this course.
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {(offeringsQ.data ?? []).map((raw, i) => (
              <li key={String((raw as { _id?: unknown })._id ?? (raw as { id?: unknown }).id ?? i)}>
                <Card className="p-4">
                  <p className="text-sm font-medium text-text-primary">{offeringLabel(raw)}</p>
                  <pre className="mt-2 max-h-40 overflow-auto text-[11px] text-text-muted">
                    {JSON.stringify(raw, null, 2)}
                  </pre>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
