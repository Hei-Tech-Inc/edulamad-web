'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  useColleges,
  useCourseSearch,
  useDepartments,
  useDepartmentHierarchy,
  useUniversities,
} from '@/hooks/institutions/useInstitutionsCatalog';
import type { CatalogEntity } from '@/hooks/institutions/useInstitutionsCatalog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CoursesAdminPage() {
  const router = useRouter();
  const [univId, setUnivId] = useState<string | null>(null);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const hydratedHierarchyFor = useRef<string | null>(null);

  const deptParam =
    typeof router.query.departmentId === 'string' && router.query.departmentId.trim()
      ? router.query.departmentId.trim()
      : null;

  const deptId = deptParam;

  const hierarchyQ = useDepartmentHierarchy(deptParam);

  /** deptId is driven by ?departmentId= in the URL (bookmarkable). */
  useEffect(() => {
    if (!deptParam || !hierarchyQ.data) return;
    if (hydratedHierarchyFor.current === deptParam) return;
    const h = hierarchyQ.data;
    setUnivId(h.universityId);
    setCollegeId(h.collegeId);
    hydratedHierarchyFor.current = deptParam;
  }, [deptParam, hierarchyQ.data]);

  function replaceCoursesQuery(next: { departmentId?: string }) {
    void router.replace(
      { pathname: '/admin/courses', query: next.departmentId ? next : {} },
      undefined,
      { shallow: true },
    );
  }

  const uniQ = useUniversities(true);
  const colQ = useColleges(univId, true);
  const deptQ = useDepartments(collegeId, true);
  const coursesQ = useCourseSearch(deptId, search, true);

  const sortedUniv = useMemo(() => {
    const universities = uniQ.data ?? [];
    return [...universities].sort((a, b) => a.name.localeCompare(b.name));
  }, [uniQ.data]);

  const selectedDeptName = useMemo(() => {
    if (!deptId) return null;
    const list = deptQ.data ?? [];
    return list.find((d) => d.id === deptId)?.name ?? null;
  }, [deptId, deptQ.data]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/65">
          Pick a department to list courses. The URL updates with{' '}
          <code className="rounded bg-white/10 px-1 font-mono text-xs">departmentId</code> so you
          can bookmark or share. From{' '}
          <Link href="/admin/institutions" className="text-brand hover:underline">
            Institutions
          </Link>
          , click a department to create a course with that department already chosen.
        </p>
        {deptId ? (
          <Link
            href={`/admin/courses/new?departmentId=${encodeURIComponent(deptId)}`}
          >
            <Button type="button">Create course</Button>
          </Link>
        ) : (
          <Button type="button" disabled title="Select a department first">
            Create course
          </Button>
        )}
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <p className="text-xs font-semibold tracking-wider text-white/45 uppercase">
          Filter catalog
        </p>
        {deptParam && hierarchyQ.isLoading ? (
          <p className="text-sm text-white/55">Loading department context…</p>
        ) : null}
        {deptParam && hierarchyQ.isError ? (
          <p className="text-sm text-danger">
            Could not load hierarchy for this department — pick university and college manually
            below.
          </p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs text-white/55">
            University
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm text-text-primary"
              value={univId ?? ''}
              onChange={(e) => {
                const v = e.target.value || null;
                setUnivId(v);
                setCollegeId(null);
                hydratedHierarchyFor.current = null;
                replaceCoursesQuery({});
              }}
            >
              <option value="">Select…</option>
              {sortedUniv.map((u: CatalogEntity) => (
                <option key={u.id} value={u.id}>
                  {u.code ? `${u.code} — ` : ''}
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/55">
            College
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm text-text-primary disabled:opacity-40"
              disabled={!univId}
              value={collegeId ?? ''}
              onChange={(e) => {
                const v = e.target.value || null;
                setCollegeId(v);
                hydratedHierarchyFor.current = null;
                replaceCoursesQuery({});
              }}
            >
              <option value="">{univId ? 'Select…' : 'Choose university first'}</option>
              {(colQ.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/55">
            Department
            <select
              className={cn(
                'mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm text-text-primary disabled:opacity-40',
                deptId && 'border-brand/30 ring-1 ring-brand/15',
              )}
              disabled={!collegeId}
              value={deptId ?? ''}
              onChange={(e) => {
                const v = e.target.value || null;
                hydratedHierarchyFor.current = null;
                replaceCoursesQuery(v ? { departmentId: v } : {});
              }}
            >
              <option value="">{collegeId ? 'Select…' : 'Choose college first'}</option>
              {(deptQ.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedDeptName ? (
          <p className="text-xs text-brand">
            Selected: <span className="font-medium">{selectedDeptName}</span>
          </p>
        ) : null}
        <label className="text-xs text-white/55">
          Search in department
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Code or title…"
            disabled={!deptId}
          />
        </label>
      </Card>

      {!deptId ? (
        <Card className="border-dashed p-8 text-center text-sm text-white/55">
          Select a department to list courses, or open{' '}
          <Link href="/admin/institutions" className="text-brand hover:underline">
            Institutions
          </Link>{' '}
          and click a department to create a course with that department pre-filled.
        </Card>
      ) : coursesQ.isLoading ? (
        <p className="text-sm text-white/55">Loading courses…</p>
      ) : (coursesQ.data?.length ?? 0) === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-white/55">
          No courses match.{' '}
          <Link
            href={`/admin/courses/new?departmentId=${encodeURIComponent(deptId)}`}
            className="font-medium text-brand hover:underline"
          >
            Create a course
          </Link>{' '}
          for this department.
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {(coursesQ.data ?? []).map((c) => (
            <li key={c.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-brand">{c.code || '—'}</p>
                  <p className="truncate text-sm text-text-primary">{c.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/courses/${encodeURIComponent(c.id)}`}>
                    <Button type="button" variant="outline" size="sm">
                      Student view
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${encodeURIComponent(c.id)}/edit`}>
                    <Button type="button" variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${encodeURIComponent(c.id)}/offerings`}>
                    <Button type="button" size="sm">
                      Offerings
                    </Button>
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
