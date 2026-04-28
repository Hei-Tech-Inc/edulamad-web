'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseCatalogForm } from '@/components/admin/CourseCatalogForm';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { EntityBanner } from '@/components/admin/entity/EntityBanner';
import { EntityTabs } from '@/components/admin/entity/EntityTabs';
import { InlineList } from '@/components/admin/entity/InlineList';
import { ConfirmDialog } from '@/components/admin/entity/ConfirmDialog';
import { useCourseOfferings, useCreateOffering } from '@/hooks/content/useCourseOfferings';
import { generateAcademicYears } from '@/lib/academic-years';
import { useUpdateCourse } from '@/hooks/institutions/useInstitutionMutations';
import { useCourseDetail, useCourseStats } from '@/hooks/admin/entities/useAdminEntities';
import { valueBool, valueCode, valueId, valueName, valueString } from '@/lib/admin/entity-helpers';

function NewOfferingForm({
  courseId,
  onSuccess,
  onError,
}: {
  courseId: string;
  onSuccess: () => void;
  onError?: (message: string) => void;
}) {
  const years = generateAcademicYears(12);
  const [academicYear, setAcademicYear] = useState(years[0]);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [level, setLevel] = useState<100 | 200 | 300 | 400 | 500>(200);
  const createOffering = useCreateOffering();

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm text-text-secondary">
        Academic year
        <select
          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm"
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
      <label className="text-sm text-text-secondary">
        Semester
        <select
          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm"
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </label>
      <label className="text-sm text-text-secondary">
        Level
        <select
          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 text-sm"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value) as 100 | 200 | 300 | 400 | 500)}
        >
          {[100, 200, 300, 400, 500].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <Button
        disabled={createOffering.isPending}
        onClick={async () => {
          try {
            await createOffering.mutateAsync({ courseId, academicYear, level, semester });
            onSuccess();
          } catch (e) {
            onError?.(e instanceof Error ? e.message : 'Failed to create academic year offering.');
          }
        }}
      >
        {createOffering.isPending ? 'Creating…' : 'Create year'}
      </Button>
    </div>
  );
}

function CourseDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [tab, setTab] = useState('offerings');
  const [editOpen, setEditOpen] = useState(false);
  const [addOfferingOpen, setAddOfferingOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const detailQ = useCourseDetail(id);
  const statsQ = useCourseStats(id);
  const offeringsQ = useCourseOfferings(id || null);
  const updateCourse = useUpdateCourse();

  const course = detailQ.data;
  const active = valueBool(course, 'isActive', true);

  const tabs = [
    { id: 'offerings', label: 'Past papers', count: statsQ.data?.offeringCount ?? 0 },
    { id: 'questions', label: 'Questions', count: statsQ.data?.questionCount ?? 0 },
    { id: 'solutions', label: 'Solutions', count: statsQ.data?.solutionCount ?? 0 },
    { id: 'flashcards', label: 'Flashcards', count: statsQ.data?.flashcardDeckCount ?? 0 },
    { id: 'students', label: 'Enrolled', count: statsQ.data?.enrolledCount ?? 0 },
    { id: 'settings', label: 'Settings' },
  ];

  if (!id) return <p className="text-sm text-danger">Missing course id.</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading course…</p>;
  if (detailQ.isError || !course) return <p className="text-sm text-danger">Course not found.</p>;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <EntityBanner
        name={`${valueCode(course) || 'COURSE'} — ${valueName(course) || 'Untitled'}`}
        subtitle={`${valueString(course, 'universityName')} › ${valueString(course, 'departmentName')}`}
        acronym={(valueCode(course) || valueName(course)).split(' ')[0]}
        color="#8B5CF6"
        isActive={active}
        badges={[
          valueString(course, 'level')
            ? { label: `Level ${valueString(course, 'level')}`, variant: 'default' as const }
            : null,
          valueString(course, 'credits')
            ? { label: `${valueString(course, 'credits')} credits`, variant: 'blue' as const }
            : null,
        ].filter((x): x is { label: string; variant: 'default' | 'blue' } => Boolean(x))}
        stats={[
          { label: 'Offerings', value: statsQ.data?.offeringCount ?? (offeringsQ.data?.length ?? 0) },
          { label: 'Questions', value: statsQ.data?.questionCount ?? 0 },
          { label: 'Solutions', value: statsQ.data?.solutionCount ?? 0 },
          { label: 'Enrolled', value: statsQ.data?.enrolledCount ?? 0 },
        ]}
        breadcrumbs={[
          { label: 'Courses', href: '/admin/courses' },
          valueString(course, 'universityId')
            ? { label: valueString(course, 'universityName') || 'University', href: `/admin/institutions/universities/${encodeURIComponent(valueString(course, 'universityId'))}` }
            : { label: 'University', href: '/admin/institutions' },
          valueString(course, 'deptId')
            ? { label: valueString(course, 'departmentName') || 'Department', href: `/admin/institutions/departments/${encodeURIComponent(valueString(course, 'deptId'))}` }
            : { label: 'Department', href: '/admin/institutions' },
        ]}
        onEdit={() => setEditOpen(true)}
        onDeactivate={() => setConfirmDeactivate(true)}
        onDelete={() => setConfirmDelete(true)}
        extraActions={
          <Button size="sm" onClick={() => setAddOfferingOpen(true)}>
            + Add year
          </Button>
        }
      />

      <EntityTabs tabs={tabs} active={tab} onChange={setTab} />

      {actionMsg ? (
        <Card
          className={`text-sm ${
            actionMsg.kind === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          {actionMsg.text}
        </Card>
      ) : null}

      {tab === 'offerings' ? (
        <InlineList
          title="Offerings"
          items={offeringsQ.data ?? []}
          isLoading={offeringsQ.isLoading}
          onAdd={() => setAddOfferingOpen(true)}
          addLabel="Add year"
          renderItem={(offering) => (
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-3">
              <div>
                <p className="text-sm text-text-primary">
                  {valueString(offering, 'academicYear') || 'Academic year'} · Sem{' '}
                  {valueString(offering, 'semester') || '—'} · L{valueString(offering, 'level') || '—'}
                </p>
                <p className="text-xs text-text-muted">ID: {valueId(offering)}</p>
              </div>
              <Link
                href={`/courses/${encodeURIComponent(id)}/offerings/${encodeURIComponent(valueId(offering))}`}
                className="text-xs text-brand hover:underline"
              >
                Open →
              </Link>
            </div>
          )}
        />
      ) : null}

      {tab === 'questions' || tab === 'solutions' || tab === 'flashcards' || tab === 'students' ? (
        <Card className="text-sm text-text-muted">
          Detailed {tab} management will appear here when dedicated admin endpoints are available.
        </Card>
      ) : null}

      {tab === 'settings' ? (
        <div className="max-w-xl">
          <CourseCatalogForm
            departmentId={valueString(course, 'deptId') || valueString(course, 'departmentId')}
            initial={{
              id,
              name: valueName(course),
              code: valueCode(course),
              isActive: active,
            }}
            submitLabel={updateCourse.isPending ? 'Saving…' : 'Save settings'}
            onSubmit={async (payload) => {
              try {
                await updateCourse.mutateAsync({
                  id,
                  payload: { name: payload.name, code: payload.code, isActive: payload.isActive },
                });
                await detailQ.refetch();
                setActionMsg({ kind: 'success', text: 'Course settings saved.' });
              } catch (e) {
                setActionMsg({
                  kind: 'error',
                  text: e instanceof Error ? e.message : 'Failed to save course settings.',
                });
              }
            }}
          />
        </div>
      ) : null}

      <EditDrawer isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit course" subtitle={valueCode(course)}>
        <CourseCatalogForm
          departmentId={valueString(course, 'deptId') || valueString(course, 'departmentId')}
          initial={{
            id,
            name: valueName(course),
            code: valueCode(course),
            isActive: active,
          }}
          submitLabel={updateCourse.isPending ? 'Saving…' : 'Save'}
          onSubmit={async (payload) => {
            try {
              await updateCourse.mutateAsync({
                id,
                payload: { name: payload.name, code: payload.code, isActive: payload.isActive },
              });
              setEditOpen(false);
              await detailQ.refetch();
              setActionMsg({ kind: 'success', text: 'Course updated.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to update course.',
              });
            }
          }}
        />
      </EditDrawer>

      <EditDrawer
        isOpen={addOfferingOpen}
        onClose={() => setAddOfferingOpen(false)}
        title="Add academic year"
        subtitle={`${valueCode(course)} — ${valueName(course)}`}
      >
        <NewOfferingForm
          courseId={id}
          onSuccess={async () => {
            setAddOfferingOpen(false);
            await offeringsQ.refetch();
            await statsQ.refetch();
            setActionMsg({ kind: 'success', text: 'Academic year offering created.' });
          }}
          onError={(message) => setActionMsg({ kind: 'error', text: message })}
        />
      </EditDrawer>

      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={async () => {
          try {
            await updateCourse.mutateAsync({
              id,
              payload: { isActive: !active },
            });
            setConfirmDeactivate(false);
            await detailQ.refetch();
            setActionMsg({
              kind: 'success',
              text: active ? 'Course deactivated.' : 'Course activated.',
            });
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to change course status.',
            });
          }
        }}
        title={active ? 'Deactivate course' : 'Activate course'}
        message={
          active
            ? `Deactivating ${valueCode(course) || valueName(course)} will hide it from active pickers.`
            : `Activating ${valueCode(course) || valueName(course)} will make it visible again.`
        }
        confirmLabel={active ? 'Deactivate' : 'Activate'}
        variant={active ? 'danger' : 'warning'}
        isLoading={updateCourse.isPending}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await updateCourse.mutateAsync({
              id,
              payload: { isActive: false },
            });
            const deptId = valueString(course, 'deptId') || valueString(course, 'departmentId');
            const fallback = deptId
              ? `/admin/institutions/departments/${encodeURIComponent(deptId)}`
              : '/admin/courses';
            await router.replace(fallback);
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to delete course.',
            });
          }
        }}
        title="Delete course"
        message="Delete endpoint is unavailable in bundled OpenAPI, so this action performs a soft-delete (set inactive)."
        confirmLabel="Deactivate as delete"
        variant="danger"
        isLoading={updateCourse.isPending}
      />
    </div>
  );
}

export default function CourseDetailPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Course detail">
        <CourseDetailContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
