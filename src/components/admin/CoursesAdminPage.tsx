'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  useColleges,
  useCourseSearch,
  useDepartments,
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
  const [deptId, setDeptId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = router.query;
    const d = q.departmentId;
    if (typeof d === 'string' && d) setDeptId(d);
  }, [router.query]);

  const uniQ = useUniversities(true);
  const colQ = useColleges(univId, true);
  const deptQ = useDepartments(collegeId, true);
  const coursesQ = useCourseSearch(deptId, search, true);

  const sortedUniv = useMemo(() => {
    const universities = uniQ.data ?? [];
    return [...universities].sort((a, b) => a.name.localeCompare(b.name));
  }, [uniQ.data]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Pick a department, then search courses in that catalog.
        </p>
        {deptId ? (
          <Link
            href={`/admin/courses/new?departmentId=${encodeURIComponent(deptId)}`}
          >
            <Button type="button">Add course</Button>
          </Link>
        ) : (
          <Button type="button" disabled title="Select a department first">
            Add course
          </Button>
        )}
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Filter catalog
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs text-text-secondary">
            University
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm text-text-primary"
              value={univId ?? ''}
              onChange={(e) => {
                const v = e.target.value || null;
                setUnivId(v);
                setCollegeId(null);
                setDeptId(null);
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
          <label className="text-xs text-text-secondary">
            College
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm text-text-primary disabled:opacity-40"
              disabled={!univId}
              value={collegeId ?? ''}
              onChange={(e) => {
                const v = e.target.value || null;
                setCollegeId(v);
                setDeptId(null);
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
          <label className="text-xs text-text-secondary">
            Department
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm text-text-primary disabled:opacity-40"
              disabled={!collegeId}
              value={deptId ?? ''}
              onChange={(e) => setDeptId(e.target.value || null)}
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
        <label className="text-xs text-text-secondary">
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
        <Card className="border-dashed p-8 text-center text-sm text-text-muted">
          Select a department to list courses.
        </Card>
      ) : coursesQ.isLoading ? (
        <p className="text-sm text-text-muted">Loading courses…</p>
      ) : (coursesQ.data?.length ?? 0) === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-text-muted">
          No courses match.{' '}
          <Link href="/admin/courses/new" className="text-brand hover:underline">
            Create one
          </Link>
          .
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
