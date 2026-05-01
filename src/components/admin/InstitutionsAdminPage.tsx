'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ChevronRight, Pencil, Building2, Landmark, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useColleges,
  useDepartments,
  useUniversities,
  type CatalogEntity,
} from '@/hooks/institutions/useInstitutionsCatalog';
import { Button } from '@/components/ui/button';

function EntityRow({
  entity,
  selected,
  onSelect,
  editHref,
  openHref,
}: {
  entity: CatalogEntity;
  selected: boolean;
  onSelect: () => void;
  editHref: string;
  openHref: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors',
        selected
          ? 'border-brand/40 bg-brand/10 shadow-sm'
          : 'border-slate-200 bg-white hover:border-brand/25 hover:bg-brand/[0.03]',
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
        <Building2 className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-semibold text-slate-900">{entity.name}</p>
        {entity.code ? (
          <p className="truncate text-xs text-slate-500">{entity.code}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={openHref}
          onClick={(e) => e.stopPropagation()}
          className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Open
        </Link>
        <Link
          href={editHref}
          onClick={(e) => e.stopPropagation()}
          className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 hover:text-brand"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function InstitutionsAdminPage() {
  const router = useRouter();
  const [univId, setUnivId] = useState<string | null>(null);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  const uniQ = useUniversities(true);
  const colQ = useColleges(univId, true);
  const deptQ = useDepartments(collegeId, true);

  const universities = uniQ.data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="gap-2 border-slate-200 bg-white shadow-sm">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <Building2 className="h-4 w-4" />
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">{universities.length}</p>
          <p className="text-xs text-slate-500">Universities</p>
        </Card>
        <Card className="gap-2 border-slate-200 bg-white shadow-sm">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <Landmark className="h-4 w-4" />
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">{colQ.data?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Colleges in selection</p>
        </Card>
        <Card className="gap-2 border-slate-200 bg-white shadow-sm">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <GraduationCap className="h-4 w-4" />
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">{deptQ.data?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Departments in selection</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          Browse from university to department, then open detail pages or create new courses.
        </p>
        <Link href="/admin/institutions/universities/new">
          <Button type="button">Add university</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-3 border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
              Universities
            </p>
            <span className="text-xs text-slate-500">{universities.length}</span>
          </div>
          {uniQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <>
              {universities.map((u) => (
                <EntityRow
                  key={u.id}
                  entity={u}
                  selected={univId === u.id}
                  onSelect={() => {
                    setUnivId(u.id);
                    setCollegeId(null);
                  }}
                  editHref={`/admin/institutions/universities/${encodeURIComponent(u.id)}/edit`}
                  openHref={`/admin/institutions/universities/${encodeURIComponent(u.id)}`}
                />
              ))}
              <Link href="/admin/institutions/universities/new">
                <Card className="border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-600 hover:border-brand/30 hover:text-brand">
                  + Add university
                </Card>
              </Link>
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-3 border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
              Colleges
            </p>
            {univId ? (
              <Link
                href={`/admin/institutions/colleges/new?universityId=${encodeURIComponent(univId)}`}
                className="text-xs font-medium text-brand hover:underline"
              >
                + Add
              </Link>
            ) : null}
          </div>
          {!univId ? (
            <Card className="flex min-h-[12rem] items-center justify-center border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-center text-xs text-slate-500">
                Select a university to see colleges
              </p>
            </Card>
          ) : colQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading colleges…</p>
          ) : (colQ.data?.length ?? 0) === 0 ? (
            <Link
              href={`/admin/institutions/colleges/new?universityId=${encodeURIComponent(univId)}`}
            >
              <Card className="border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-600 hover:border-brand/30">
                + Add first college
              </Card>
            </Link>
          ) : (
            (colQ.data ?? []).map((c) => (
              <EntityRow
                key={c.id}
                entity={c}
                selected={collegeId === c.id}
                onSelect={() => setCollegeId(c.id)}
                editHref={`/admin/institutions/colleges/${encodeURIComponent(c.id)}/edit`}
                openHref={`/admin/institutions/colleges/${encodeURIComponent(c.id)}`}
              />
            ))
          )}
        </Card>

        <Card className="flex flex-col gap-3 border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
              Departments
            </p>
            {collegeId ? (
              <Link
                href={`/admin/institutions/departments/new?collegeId=${encodeURIComponent(collegeId)}`}
                className="text-xs font-medium text-brand hover:underline"
              >
                + Add
              </Link>
            ) : null}
          </div>
          {!collegeId ? (
            <Card className="flex min-h-[12rem] items-center justify-center border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-center text-xs text-slate-500">
                Select a college to see departments
              </p>
            </Card>
          ) : deptQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading departments…</p>
          ) : (deptQ.data?.length ?? 0) === 0 ? (
            <Link
              href={`/admin/institutions/departments/new?collegeId=${encodeURIComponent(collegeId)}`}
            >
              <Card className="border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-600 hover:border-brand/30">
                + Add first department
              </Card>
            </Link>
          ) : (
            (deptQ.data ?? []).map((d) => (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-brand/35 hover:bg-brand/[0.04]"
                onClick={() =>
                  void router.push(
                    `/admin/courses/new?departmentId=${encodeURIComponent(d.id)}`,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void router.push(
                      `/admin/courses/new?departmentId=${encodeURIComponent(d.id)}`,
                    );
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{d.name}</p>
                  {d.code ? (
                    <p className="truncate text-xs text-slate-500">{d.code}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] font-medium text-brand/90">
                    New course
                    <ChevronRight
                      className="-mt-px ml-0.5 inline h-3.5 w-3.5 align-middle opacity-70 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <Link
                    href={`/admin/institutions/departments/${encodeURIComponent(d.id)}`}
                    className="rounded px-1.5 py-1 text-xs text-brand hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open
                  </Link>
                  <Link
                    href={`/admin/courses?departmentId=${encodeURIComponent(d.id)}`}
                    className="rounded px-1.5 py-1 text-xs text-brand hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Browse courses
                  </Link>
                  <Link
                    href={`/admin/institutions/departments/${encodeURIComponent(d.id)}/edit`}
                    className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 hover:text-brand"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Edit department"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
