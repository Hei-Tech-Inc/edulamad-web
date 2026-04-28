'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DepartmentForm } from '@/components/admin/CollegeDepartmentForms';
import { CourseCatalogForm } from '@/components/admin/CourseCatalogForm';
import { InlineList } from '@/components/admin/entity/InlineList';
import { EntityBanner } from '@/components/admin/entity/EntityBanner';
import { EntityTabs } from '@/components/admin/entity/EntityTabs';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { ConfirmDialog } from '@/components/admin/entity/ConfirmDialog';
import {
  useDepartmentCourses,
  useDepartmentDetail,
  useDepartmentStats,
} from '@/hooks/admin/entities/useAdminEntities';
import {
  useCreateCourse,
  useUpdateDepartment,
} from '@/hooks/institutions/useInstitutionMutations';
import { valueBool, valueCode, valueId, valueName, valueString } from '@/lib/admin/entity-helpers';

function DepartmentDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const detailQ = useDepartmentDetail(id);
  const statsQ = useDepartmentStats(id);
  const coursesQ = useDepartmentCourses(id);
  const courses = coursesQ.data ?? [];

  const updateDepartment = useUpdateDepartment();
  const createCourse = useCreateCourse();

  const dept = detailQ.data;
  const active = valueBool(dept, 'isActive', true);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses', count: courses.length },
    { id: 'students', label: 'Students', count: statsQ.data?.studentCount ?? 0 },
    { id: 'questions', label: 'Questions', count: statsQ.data?.questionCount ?? 0 },
    { id: 'content-gaps', label: 'Gaps', count: statsQ.data?.gapCount ?? 0 },
    { id: 'settings', label: 'Settings' },
  ];

  if (!id) return <p className="text-sm text-danger">Missing department id.</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading department…</p>;
  if (detailQ.isError || !dept) return <p className="text-sm text-danger">Department not found.</p>;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <EntityBanner
        name={valueName(dept) || 'Department'}
        subtitle={`${valueString(dept, 'universityName')} › ${valueString(dept, 'collegeName')}`}
        acronym={valueCode(dept)}
        color="#22C55E"
        isActive={active}
        badges={
          valueString(dept, 'hod')
            ? [{ label: `HOD: ${valueString(dept, 'hod')}`, variant: 'default' as const }]
            : undefined
        }
        stats={[
          { label: 'Courses', value: statsQ.data?.courseCount ?? courses.length },
          { label: 'Questions', value: statsQ.data?.questionCount ?? 0 },
          { label: 'Students', value: statsQ.data?.studentCount ?? 0 },
          { label: 'Courses with content', value: statsQ.data?.coursesWithContent ?? 0 },
        ]}
        breadcrumbs={[
          { label: 'Institutions', href: '/admin/institutions' },
          valueString(dept, 'universityId')
            ? { label: valueString(dept, 'universityName') || 'University', href: `/admin/institutions/universities/${encodeURIComponent(valueString(dept, 'universityId'))}` }
            : { label: 'University', href: '/admin/institutions' },
          valueString(dept, 'collegeId')
            ? { label: valueString(dept, 'collegeName') || 'College', href: `/admin/institutions/colleges/${encodeURIComponent(valueString(dept, 'collegeId'))}` }
            : { label: 'College', href: '/admin/institutions' },
        ]}
        onEdit={() => setEditOpen(true)}
        onDeactivate={() => setConfirmDeactivate(true)}
        onDelete={() => setConfirmDelete(true)}
        extraActions={
          <Button size="sm" onClick={() => setAddCourseOpen(true)}>
            + Add course
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

      {tab === 'overview' ? (
        <Card className="text-sm text-text-muted">
          Department overview dashboard is available with current catalog counts only.
        </Card>
      ) : null}

      {tab === 'courses' ? (
        <InlineList
          title="Courses"
          items={courses}
          isLoading={coursesQ.isLoading}
          onAdd={() => setAddCourseOpen(true)}
          addLabel="Add course"
          search
          renderItem={(course) => (
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{valueName(course)}</p>
                <p className="text-xs text-text-muted">{valueCode(course) || 'No code'}</p>
              </div>
              <Link
                href={`/admin/courses/${encodeURIComponent(valueId(course))}`}
                className="text-xs text-brand hover:underline"
              >
                Open →
              </Link>
              <Link
                href={`/admin/courses/${encodeURIComponent(valueId(course))}/edit`}
                className="text-xs text-text-muted hover:text-brand"
              >
                Edit
              </Link>
            </div>
          )}
        />
      ) : null}

      {tab === 'students' || tab === 'questions' || tab === 'content-gaps' ? (
        <Card className="text-sm text-text-muted">
          Detailed {tab.replace('-', ' ')} data is not yet exposed in bundled endpoints.
        </Card>
      ) : null}

      {tab === 'settings' ? (
        <div className="max-w-xl">
          <DepartmentForm
            collegeId={valueString(dept, 'collegeId')}
            initial={{
              id,
              name: valueName(dept),
              code: valueCode(dept),
              isActive: active,
            }}
            submitLabel={updateDepartment.isPending ? 'Saving…' : 'Save settings'}
            onSubmit={async (payload) => {
              try {
                await updateDepartment.mutateAsync({ id, payload });
                await detailQ.refetch();
                setActionMsg({ kind: 'success', text: 'Department settings saved.' });
              } catch (e) {
                setActionMsg({
                  kind: 'error',
                  text: e instanceof Error ? e.message : 'Failed to save department settings.',
                });
              }
            }}
          />
        </div>
      ) : null}

      <EditDrawer isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit department">
        <DepartmentForm
          collegeId={valueString(dept, 'collegeId')}
          initial={{
            id,
            name: valueName(dept),
            code: valueCode(dept),
            isActive: active,
          }}
          submitLabel={updateDepartment.isPending ? 'Saving…' : 'Save'}
          onSubmit={async (payload) => {
            try {
              await updateDepartment.mutateAsync({ id, payload });
              setEditOpen(false);
              await detailQ.refetch();
              setActionMsg({ kind: 'success', text: 'Department updated.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to update department.',
              });
            }
          }}
        />
      </EditDrawer>

      <EditDrawer
        isOpen={addCourseOpen}
        onClose={() => setAddCourseOpen(false)}
        title="Add course"
        subtitle={`Under ${valueName(dept)}`}
      >
        <CourseCatalogForm
          departmentId={id}
          submitLabel={createCourse.isPending ? 'Saving…' : 'Create course'}
          onSubmit={async (payload) => {
            try {
              await createCourse.mutateAsync(payload);
              setAddCourseOpen(false);
              await coursesQ.refetch();
              setActionMsg({ kind: 'success', text: 'Course created successfully.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to create course.',
              });
            }
          }}
        />
      </EditDrawer>

      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={async () => {
          try {
            await updateDepartment.mutateAsync({ id, payload: { isActive: !active } });
            setConfirmDeactivate(false);
            await detailQ.refetch();
            setActionMsg({
              kind: 'success',
              text: active ? 'Department deactivated.' : 'Department activated.',
            });
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to change department status.',
            });
          }
        }}
        title={active ? 'Deactivate department' : 'Activate department'}
        message={
          active
            ? `Deactivating ${valueName(dept)} will hide it from active pickers.`
            : `Activating ${valueName(dept)} will make it visible again.`
        }
        confirmLabel={active ? 'Deactivate' : 'Activate'}
        variant={active ? 'danger' : 'warning'}
        isLoading={updateDepartment.isPending}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await updateDepartment.mutateAsync({ id, payload: { isActive: false } });
            const collegeId = valueString(dept, 'collegeId');
            const fallback = collegeId
              ? `/admin/institutions/colleges/${encodeURIComponent(collegeId)}`
              : '/admin/institutions';
            await router.replace(fallback);
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to delete department.',
            });
          }
        }}
        title="Delete department"
        message="Delete endpoint is unavailable in bundled OpenAPI, so this action performs a soft-delete (set inactive)."
        confirmLabel="Deactivate as delete"
        variant="danger"
        isLoading={updateDepartment.isPending}
      />
    </div>
  );
}

export default function DepartmentDetailPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Department detail">
        <DepartmentDetailContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
