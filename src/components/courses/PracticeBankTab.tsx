'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, GraduationCap, Library, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmptyState from '@/components/ui/EmptyState';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { usePracticeQuestions } from '@/hooks/practice/usePracticeBank';
import { useCourseTags } from '@/hooks/tags/useTags';
import { PracticeQuestionCard } from '@/components/courses/PracticeQuestionCard';
import { SubmitPracticeQuestionForm } from '@/components/courses/SubmitPracticeQuestionForm';
import { buildQuizHref } from '@/lib/quiz/build-quiz-href';
import { normalizeStudentLevel } from '@/lib/courses/normalize-student-level';
import { useStudentProfile } from '@/hooks/students/useStudentProfile';
import { useMyCoursesInfinite } from '@/hooks/students/useMyCourses';
import type { MyCourseRowDto } from '@/api/types/my-courses.types';

export type PracticeBankTabProps = {
  courseId: string;
  courseName: string;
  /** Past-paper pool size for this course (same basis as “Past papers” tab). */
  officialQuestionCount?: number;
};

function statusLabel(row: MyCourseRowDto): string {
  if (row.enrollmentStatus === 'in_progress') return 'In progress';
  if (row.enrollmentStatus === 'completed') return 'Completed';
  if (row.enrollmentStatus === 'not_started') return 'Active';
  return row.questionCount ? `${row.questionCount} questions` : 'Enrolled';
}

export function PracticeBankTab({
  courseId,
  courseName,
  officialQuestionCount = 0,
}: PracticeBankTabProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const profileQ = useStudentProfile();
  const year = String(new Date().getFullYear());
  const level = normalizeStudentLevel(profileQ.data?.levelData ?? 300);

  const coursesQ = useMyCoursesInfinite({
    year,
    level,
    limit: 24,
    sort: 'last_activity_desc',
    status: 'all',
    content: 'all',
    search: '',
  });

  const otherCourses = useMemo(() => {
    const rows = coursesQ.data?.pages.flatMap((p) => p.data) ?? [];
    const rank = (s: MyCourseRowDto['enrollmentStatus']) =>
      s === 'in_progress' ? 0 : s === 'not_started' ? 1 : s === 'completed' ? 2 : 3;
    return rows
      .filter((r) => r.courseId !== courseId && !r.isDecommissioned)
      .slice()
      .sort((a, b) => rank(a.enrollmentStatus) - rank(b.enrollmentStatus))
      .slice(0, 8);
  }, [coursesQ.data, courseId]);

  const { data: questions, isLoading } = usePracticeQuestions(courseId, {
    status: 'approved',
    tag: selectedTag ?? undefined,
    limit: 20,
    cursor,
  });
  const { data: tags } = useCourseTags(courseId);

  const generateQuizHref = buildQuizHref({
    courseId,
    year,
    level: String(level),
    type: 'all',
    courseName,
    mode: 'quiz',
    count: 20,
    mins: 30,
  });

  const practiceAllHref = buildQuizHref({
    courseId,
    year,
    level: String(level),
    type: 'all',
    courseName,
    mode: 'review',
  });

  useEffect(() => {
    setCursor(undefined);
  }, [selectedTag, courseId]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/90 via-white to-slate-50 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Practice bank</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600">
              Community-submitted questions below. For timed quizzes from your department&apos;s official past-paper pool,
              use <strong className="font-semibold text-slate-800">Past papers</strong> or start here.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSubmitOpen(true)} className="shrink-0">
            + Submit question
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={generateQuizHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Sparkles className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            Start timed quiz (official pool)
          </Link>
          <Link
            href={practiceAllHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <Library className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            Browse all past questions
          </Link>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
          Slides and Midsem/Final shortcuts live under the{' '}
          <strong className="font-semibold text-slate-800">Past papers</strong> tab on this course page.
        </p>

        {officialQuestionCount > 0 ? (
          <p className="mt-3 text-[11px] text-slate-500">
            Official pool for your level:{' '}
            <span className="font-medium text-slate-700">{officialQuestionCount} questions</span> loaded for quiz /
            review.
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-slate-500">
            Question counts depend on your programme year and level — pick filters on the quiz screen if needed.
          </p>
        )}
      </section>

      {!coursesQ.isLoading && otherCourses.length > 0 ? (
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Your other active courses</h3>
            <Link href="/courses" className="text-[11px] font-semibold text-orange-700 hover:text-orange-800">
              All courses
            </Link>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {otherCourses.map((row) => {
              const quizHref = buildQuizHref({
                courseId: row.courseId,
                year,
                level: String(level),
                type: 'all',
                courseName: row.name,
                mode: 'quiz',
                count: 20,
                mins: 30,
              });
              return (
                <div
                  key={row.courseId}
                  className="min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <GraduationCap className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {row.code ? `${row.code} · ` : ''}
                        {row.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-teal-700">{statusLabel(row)}</p>
                      {row.questionCount ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">{row.questionCount} questions available</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={quizHref}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-teal-700 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Start quiz
                    </Link>
                    <Link
                      href={`/courses/${row.courseId}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Course
                      <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : coursesQ.isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" aria-hidden />
      ) : null}

      <div className="flex items-start justify-between border-t border-slate-100 pt-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Community practice questions</h3>
          <p className="mt-0.5 text-xs text-slate-600">
            Peer submissions — vote and discuss. Not the same as the official exam archive above.
          </p>
        </div>
      </div>

      {questions?.mocked ? (
        <Card className="border-amber-200/80 bg-amber-50 text-xs text-amber-950">
          Practice bank endpoint is unavailable in the current backend contract. This view will populate when that route
          is deployed.
        </Card>
      ) : null}

      {tags && tags.length > 0 ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !selectedTag
                ? 'border-orange-200 bg-orange-50 text-orange-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
            type="button"
          >
            All topics
          </button>
          {tags.map((tag: { _id: string; name: string; usageCount?: number }) => (
            <button
              key={tag._id}
              onClick={() => setSelectedTag(selectedTag === tag._id ? null : tag._id)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedTag === tag._id
                  ? 'border-teal-200 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
              type="button"
            >
              {tag.name}
              <span className="ml-1 opacity-60">({tag.usageCount ?? 0})</span>
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : (questions?.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No community questions yet"
          subtitle="Official past-paper quizzes still work — use “Start timed quiz” above. You can also submit a question for classmates below."
          actionLabel="Submit a question"
          onAction={() => setSubmitOpen(true)}
          variant="light"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {(questions?.data ?? []).map((raw) => {
            const q = raw as Record<string, unknown>;
            return (
              <PracticeQuestionCard
                key={String(q._id ?? q.id ?? q.questionText ?? '')}
                question={q as Record<string, never>}
                courseId={courseId}
              />
            );
          })}
        </div>
      )}

      {questions?.nextCursor ? (
        <div className="flex justify-center">
          <Button type="button" variant="ghost" size="sm" onClick={() => setCursor(questions.nextCursor ?? undefined)}>
            Load more
          </Button>
        </div>
      ) : null}

      <EditDrawer
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit practice question"
        subtitle="Curated questions earn XP when approved"
      >
        <SubmitPracticeQuestionForm courseId={courseId} onSuccess={() => setSubmitOpen(false)} />
      </EditDrawer>
    </div>
  );
}
