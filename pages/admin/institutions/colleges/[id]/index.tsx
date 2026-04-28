'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { Card } from '@/components/ui/card';
import { CollegeForm, DepartmentForm } from '@/components/admin/CollegeDepartmentForms';
import { InlineList } from '@/components/admin/entity/InlineList';
import { EntityBanner } from '@/components/admin/entity/EntityBanner';
import { EntityTabs } from '@/components/admin/entity/EntityTabs';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { ConfirmDialog } from '@/components/admin/entity/ConfirmDialog';
import {
  useCollegeDepartments,
  useCollegeDetail,
  useCollegeStats,
} from '@/hooks/admin/entities/useAdminEntities';
import {
  useCreateDepartment,
  useUpdateCollege,
  useUpdateDepartment,
} from '@/hooks/institutions/useInstitutionMutations';
import { valueBool, valueCode, valueId, valueName, valueString } from '@/lib/admin/entity-helpers';

function CollegeDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const detailQ = useCollegeDetail(id);
  const statsQ = useCollegeStats(id);
  const departmentsQ = useCollegeDepartments(id);
  const departments = departmentsQ.data ?? [];

  const updateCollege = useUpdateCollege();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const college = detailQ.data;
  const active = valueBool(college, 'isActive', true);
  const currentDept = departments.find((d) => valueId(d) === editDeptId) ?? null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'departments', label: 'Departments', count: departments.length },
    { id: 'courses', label: 'Courses', count: statsQ.data?.courseCount ?? 0 },
    { id: 'settings', label: 'Settings' },
  ];

  if (!id) return <p className="text-sm text-danger">Missing college id.</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading college…</p>;
  if (detailQ.isError || !college) return <p className="text-sm text-danger">College not found.</p>;

  const universityId = valueString(college, 'universityId');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <EntityBanner
        name={valueName(college) || 'College'}
        subtitle={`${valueString(college, 'universityName')} › ${valueName(college)}`}
        acronym={valueCode(college)}
        color="#3B82F6"
        isActive={active}
        badges={
          valueString(college, 'dean')
            ? [{ label: `Dean: ${valueString(college, 'dean')}`, variant: 'default' as const }]
            : undefined
        }
        stats={[
          { label: 'Departments', value: statsQ.data?.deptCount ?? departments.length },
          { label: 'Courses', value: statsQ.data?.courseCount ?? 0 },
          { label: 'Questions', value: statsQ.data?.questionCount ?? 0 },
          { label: 'Students', value: statsQ.data?.studentCount ?? 0 },
        ]}
        breadcrumbs={[
          { label: 'Institutions', href: '/admin/institutions' },
          universityId
            ? { label: valueString(college, 'universityName') || 'University', href: `/admin/institutions/universities/${encodeURIComponent(universityId)}` }
            : { label: 'University', href: '/admin/institutions' },
        ]}
        onEdit={() => setEditOpen(true)}
        onDeactivate={() => setConfirmDeactivate(true)}
        onDelete={() => setConfirmDelete(true)}
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
          College overview stats are partially available from bundled endpoints.
        </Card>
      ) : null}

      {tab === 'departments' ? (
        <InlineList
          title="Departments"
          items={departments}
          isLoading={departmentsQ.isLoading}
          onAdd={() => setAddDeptOpen(true)}
          addLabel="Add department"
          search
          renderItem={(dept) => (
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{valueName(dept)}</p>
                <p className="text-xs text-text-muted">{valueCode(dept) || 'No code'}</p>
              </div>
              <Link
                href={`/admin/institutions/departments/${encodeURIComponent(valueId(dept))}`}
                className="text-xs text-brand hover:underline"
              >
                Open →
              </Link>
              <button
                type="button"
                className="text-xs text-text-muted hover:text-brand"
                onClick={() => setEditDeptId(valueId(dept))}
              >
                Edit
              </button>
            </div>
          )}
        />
      ) : null}

      {tab === 'courses' ? (
        <Card className="text-sm text-text-muted">
          Use department detail pages to manage courses in this college.
        </Card>
      ) : null}

      {tab === 'settings' ? (
        <div className="max-w-xl">
          <CollegeForm
            universityId={universityId}
            initial={{
              id,
              name: valueName(college),
              code: valueCode(college),
              isActive: active,
            }}
            submitLabel={updateCollege.isPending ? 'Saving…' : 'Save settings'}
            onSubmit={async (payload) => {
              try {
                await updateCollege.mutateAsync({ id, payload });
                await detailQ.refetch();
                setActionMsg({ kind: 'success', text: 'College settings saved.' });
              } catch (e) {
                setActionMsg({
                  kind: 'error',
                  text: e instanceof Error ? e.message : 'Failed to save college settings.',
                });
              }
            }}
          />
        </div>
      ) : null}

      <EditDrawer isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit college">
        <CollegeForm
          universityId={universityId}
          initial={{
            id,
            name: valueName(college),
            code: valueCode(college),
            isActive: active,
          }}
          submitLabel={updateCollege.isPending ? 'Saving…' : 'Save'}
          onSubmit={async (payload) => {
            try {
              await updateCollege.mutateAsync({ id, payload });
              setEditOpen(false);
              await detailQ.refetch();
              setActionMsg({ kind: 'success', text: 'College updated.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to update college.',
              });
            }
          }}
        />
      </EditDrawer>

      <EditDrawer
        isOpen={addDeptOpen}
        onClose={() => setAddDeptOpen(false)}
        title="Add department"
        subtitle={`Under ${valueName(college)}`}
      >
        <DepartmentForm
          collegeId={id}
          submitLabel={createDepartment.isPending ? 'Saving…' : 'Create department'}
          onSubmit={async (payload) => {
            try {
              await createDepartment.mutateAsync(payload);
              setAddDeptOpen(false);
              await departmentsQ.refetch();
              setActionMsg({ kind: 'success', text: 'Department created successfully.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to create department.',
              });
            }
          }}
        />
      </EditDrawer>

      <EditDrawer isOpen={Boolean(editDeptId)} onClose={() => setEditDeptId(null)} title="Edit department">
        {currentDept ? (
          <DepartmentForm
            collegeId={id}
            initial={{
              id: valueId(currentDept),
              name: valueName(currentDept),
              code: valueCode(currentDept),
              isActive: valueBool(currentDept, 'isActive', true),
            }}
            submitLabel={updateDepartment.isPending ? 'Saving…' : 'Save department'}
            onSubmit={async (payload) => {
              if (!editDeptId) return;
              try {
                await updateDepartment.mutateAsync({ id: editDeptId, payload });
                setEditDeptId(null);
                await departmentsQ.refetch();
                setActionMsg({ kind: 'success', text: 'Department updated.' });
              } catch (e) {
                setActionMsg({
                  kind: 'error',
                  text: e instanceof Error ? e.message : 'Failed to update department.',
                });
              }
            }}
          />
        ) : null}
      </EditDrawer>

      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={async () => {
          try {
            await updateCollege.mutateAsync({ id, payload: { isActive: !active } });
            setConfirmDeactivate(false);
            await detailQ.refetch();
            setActionMsg({
              kind: 'success',
              text: active ? 'College deactivated.' : 'College activated.',
            });
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to change college status.',
            });
          }
        }}
        title={active ? 'Deactivate college' : 'Activate college'}
        message={
          active
            ? `Deactivating ${valueName(college)} will hide it from active pickers.`
            : `Activating ${valueName(college)} will make it visible again.`
        }
        confirmLabel={active ? 'Deactivate' : 'Activate'}
        variant={active ? 'danger' : 'warning'}
        isLoading={updateCollege.isPending}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await updateCollege.mutateAsync({ id, payload: { isActive: false } });
            const fallback = universityId
              ? `/admin/institutions/universities/${encodeURIComponent(universityId)}`
              : '/admin/institutions';
            await router.replace(fallback);
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to delete college.',
            });
          }
        }}
        title="Delete college"
        message="Delete endpoint is unavailable in bundled OpenAPI, so this action performs a soft-delete (set inactive)."
        confirmLabel="Deactivate as delete"
        variant="danger"
        isLoading={updateCollege.isPending}
      />
    </div>
  );
}

export default function CollegeDetailPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="College detail">
        <CollegeDetailContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
