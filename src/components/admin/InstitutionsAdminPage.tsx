'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ChevronRight, Pencil } from 'lucide-react';
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
        'group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors',
        selected
          ? 'border-brand/40 bg-brand/10'
          : 'border-white/[0.08] bg-bg-surface hover:border-white/20',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{entity.name}</p>
        {entity.code ? (
          <p className="truncate text-xs text-text-muted">{entity.code}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          href={openHref}
          onClick={(e) => e.stopPropagation()}
          className="rounded px-1.5 py-1 text-xs text-brand hover:underline"
        >
          Open
        </Link>
        <Link
          href={editHref}
          onClick={(e) => e.stopPropagation()}
          className="rounded p-1 text-text-muted hover:text-brand"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Universities → colleges → departments. Select a row to drill down.
        </p>
        <Link href="/admin/institutions/universities/new">
          <Button type="button">Add university</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              Universities
            </p>
            <span className="text-xs text-text-muted">{universities.length}</span>
          </div>
          {uniQ.isLoading ? (
            <p className="text-sm text-text-muted">Loading…</p>
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
                <Card className="border-dashed border-white/15 p-3 text-center text-xs text-text-muted hover:border-brand/30 hover:text-brand">
                  + Add university
                </Card>
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
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
            <Card className="flex min-h-[12rem] items-center justify-center border-dashed p-4">
              <p className="text-center text-xs text-text-muted">
                Select a university to see colleges
              </p>
            </Card>
          ) : colQ.isLoading ? (
            <p className="text-sm text-text-muted">Loading colleges…</p>
          ) : (colQ.data?.length ?? 0) === 0 ? (
            <Link
              href={`/admin/institutions/colleges/new?universityId=${encodeURIComponent(univId)}`}
            >
              <Card className="border-dashed p-4 text-center text-xs text-text-muted hover:border-brand/30">
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
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
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
            <Card className="flex min-h-[12rem] items-center justify-center border-dashed p-4">
              <p className="text-center text-xs text-text-muted">
                Select a college to see departments
              </p>
            </Card>
          ) : deptQ.isLoading ? (
            <p className="text-sm text-text-muted">Loading departments…</p>
          ) : (deptQ.data?.length ?? 0) === 0 ? (
            <Link
              href={`/admin/institutions/departments/new?collegeId=${encodeURIComponent(collegeId)}`}
            >
              <Card className="border-dashed p-4 text-center text-xs text-text-muted hover:border-brand/30">
                + Add first department
              </Card>
            </Link>
          ) : (
            (deptQ.data ?? []).map((d) => (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                className="group flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-2.5 transition-colors hover:border-brand/35 hover:bg-brand/[0.06]"
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
                  <p className="truncate text-sm font-medium text-text-primary">{d.name}</p>
                  {d.code ? (
                    <p className="truncate text-xs text-text-muted">{d.code}</p>
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
                    className="rounded p-1 text-text-muted hover:text-brand"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Edit department"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
