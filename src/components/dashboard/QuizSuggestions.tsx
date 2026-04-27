import Link from 'next/link';
import { useMemo } from 'react';
import { useMyCoursesInfinite } from '@/hooks/students/useMyCourses';
import { useStudentProfile } from '@/hooks/students/useStudentProfile';
import { usePersonalisationStore } from '@/stores/personalisation.store';

function currentYear(): string {
  return String(new Date().getFullYear());
}

export function QuizSuggestions() {
  const profileQ = useStudentProfile();
  const currentSemesterCourseIds = usePersonalisationStore((s) => s.currentSemesterCourseIds);
  const level = (profileQ.data?.levelData as 100 | 200 | 300 | 400 | undefined) ?? 300;
  const coursesQ = useMyCoursesInfinite({
    year: currentYear(),
    level,
    limit: 12,
    sort: 'last_activity_desc',
    status: 'all',
    content: 'all',
    search: '',
  });

  const suggestions = useMemo(() => {
    const rows = coursesQ.data?.pages.flatMap((page) => page.data) ?? [];
    const preferredSet = new Set(currentSemesterCourseIds);
    return rows
      .filter((row) => row.courseId)
      .sort((a, b) => {
        const aPreferred = preferredSet.has(a.courseId);
        const bPreferred = preferredSet.has(b.courseId);
        if (aPreferred === bPreferred) return 0;
        return aPreferred ? -1 : 1;
      })
      .slice(0, 4);
  }, [coursesQ.data, currentSemesterCourseIds]);

  if (coursesQ.isLoading) {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`quiz-suggestion-skeleton-${idx}`} className="h-20 animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }

  if (coursesQ.isError || !suggestions.length) {
    return <p className="mt-3 text-sm text-slate-400">No quiz suggestions yet. Add courses to get recommendations.</p>;
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {suggestions.map((course) => (
        <Link
          key={course.courseId}
          href={`/quiz/new?courseId=${encodeURIComponent(course.courseId)}&year=${encodeURIComponent(currentYear())}&level=${encodeURIComponent(String(level))}`}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:bg-white/[0.08]"
        >
          <p className="text-sm font-semibold text-slate-100">
            {course.code ? `${course.code} — ` : ''}
            {course.name}
          </p>
          <p className="mt-1 text-xs text-slate-400">Start quiz</p>
        </Link>
      ))}
      <Link
        href="/quiz/discover"
        className="inline-flex items-center justify-center rounded-lg border border-orange-400/40 bg-orange-500/10 px-3 py-3 text-xs font-semibold text-orange-200 hover:bg-orange-500/20"
      >
        Explore more quizzes
      </Link>
    </div>
  );
}
