'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UniversityForm } from '@/components/admin/UniversityForm';
import { CollegeForm } from '@/components/admin/CollegeDepartmentForms';
import { InlineList } from '@/components/admin/entity/InlineList';
import { EntityBanner } from '@/components/admin/entity/EntityBanner';
import { EntityTabs } from '@/components/admin/entity/EntityTabs';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { ConfirmDialog } from '@/components/admin/entity/ConfirmDialog';
import { UniversityStudentsTab } from '@/components/admin/university/UniversityStudentsTab';
import { UniversityAmbassadorsTab } from '@/components/admin/university/UniversityAmbassadorsTab';
import { UniversityPromoCodesTab } from '@/components/admin/university/UniversityPromoCodesTab';
import {
  useDeleteUniversity,
  useUniversityColleges,
  useUniversityDetail,
  useUniversityStats,
  useUpdateUniversity,
} from '@/hooks/admin/entities/useAdminEntities';
import {
  useCreateCollege,
  useUpdateCollege,
} from '@/hooks/institutions/useInstitutionMutations';
import { valueBool, valueCode, valueId, valueName, valueString } from '@/lib/admin/entity-helpers';

function UniversityDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [addCollegeOpen, setAddCollegeOpen] = useState(false);
  const [editCollegeId, setEditCollegeId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const detailQ = useUniversityDetail(id);
  const statsQ = useUniversityStats(id);
  const collegesQ = useUniversityColleges(id);

  const updateU = useUpdateUniversity(id);
  const deleteU = useDeleteUniversity(id);
  const createCollege = useCreateCollege();
  const updateCollege = useUpdateCollege();

  const uni = detailQ.data;
  const colleges = collegesQ.data ?? [];
  const active = valueBool(uni, 'isActive', true);

  const currentCollege = colleges.find((c) => valueId(c) === editCollegeId) ?? null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'colleges', label: 'Colleges', icon: '🏛', count: colleges.length },
    { id: 'courses', label: 'All courses', icon: '📚', count: statsQ.data?.courseCount ?? 0 },
    { id: 'students', label: 'Students', icon: '👤', count: statsQ.data?.studentCount ?? 0 },
    { id: 'ambassadors', label: 'Ambassadors', icon: '🤝', count: 0 },
    { id: 'promo-codes', label: 'Promo codes', icon: '🎫', count: 0 },
    { id: 'questions', label: 'Questions', icon: '📝', count: statsQ.data?.questionCount ?? 0 },
    { id: 'content-gaps', label: 'Gaps', icon: '⚠', count: statsQ.data?.gapCount ?? 0 },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  if (!id) return <p className="text-sm text-danger">Missing university id.</p>;
  if (detailQ.isLoading) return <p className="text-sm text-text-muted">Loading university…</p>;
  if (detailQ.isError || !uni) return <p className="text-sm text-danger">University not found.</p>;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <EntityBanner
        name={valueName(uni) || 'University'}
        subtitle={[
          valueCode(uni),
          valueString(uni, 'location'),
          valueString(uni, 'type'),
        ]
          .filter(Boolean)
          .join(' · ')}
        acronym={valueCode(uni)}
        isActive={active}
        badges={[
          valueString(uni, 'type')
            ? { label: valueString(uni, 'type'), variant: 'default' as const }
            : null,
          valueString(uni, 'location')
            ? { label: valueString(uni, 'location'), variant: 'blue' as const }
            : null,
        ].filter((x): x is { label: string; variant: 'default' | 'blue' } => Boolean(x))}
        stats={[
          { label: 'Colleges', value: statsQ.data?.collegeCount ?? colleges.length },
          { label: 'Departments', value: statsQ.data?.deptCount ?? 0 },
          { label: 'Courses', value: statsQ.data?.courseCount ?? 0 },
          { label: 'Questions', value: statsQ.data?.questionCount ?? 0 },
        ]}
        breadcrumbs={[
          { label: 'Institutions', href: '/admin/institutions' },
          { label: 'Universities', href: '/admin/institutions' },
        ]}
        onEdit={() => setEditOpen(true)}
        onDeactivate={() => setConfirmDeactivate(true)}
        onDelete={() => setConfirmDelete(true)}
        extraActions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void router.push(`/admin/courses/new?universityId=${id}`)}
          >
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

      <Card className="border-brand/20 bg-brand/10 py-3 text-xs text-brand">
        Endpoint status: university details, stats, and colleges are live. Students, ambassadors, promo-codes, and deep analytics auto-fallback to scaffold mode when backend routes are unavailable.
      </Card>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="text-sm font-semibold text-text-primary">Content breakdown</h3>
            <div className="mt-3 flex flex-col gap-3 text-xs text-text-muted">
              <p>Questions with solutions: unavailable in current API contract.</p>
              <p>Questions without solutions: unavailable in current API contract.</p>
              <p>Courses with content: unavailable in current API contract.</p>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary">Students by plan</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm text-text-muted">
              <p>Free / Basic / Pro split is unavailable from bundled endpoints.</p>
              <p>Use this tab when backend stats endpoints are exposed.</p>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'colleges' ? (
        <InlineList
          title="Colleges"
          items={colleges}
          isLoading={collegesQ.isLoading}
          onAdd={() => setAddCollegeOpen(true)}
          addLabel="Add college"
          emptyMessage="No colleges yet"
          search
          renderItem={(college) => (
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{valueName(college)}</p>
                <p className="text-xs text-text-muted">{valueCode(college) || 'No code'}</p>
              </div>
              <Link
                href={`/admin/institutions/colleges/${encodeURIComponent(valueId(college))}`}
                className="text-xs text-brand hover:underline"
              >
                Open →
              </Link>
              <button
                type="button"
                onClick={() => setEditCollegeId(valueId(college))}
                className="text-xs text-text-muted hover:text-brand"
              >
                Edit
              </button>
            </div>
          )}
        />
      ) : null}

      {tab === 'students' ? <UniversityStudentsTab universityId={id} /> : null}

      {tab === 'ambassadors' ? <UniversityAmbassadorsTab universityId={id} /> : null}

      {tab === 'promo-codes' ? (
        <UniversityPromoCodesTab
          universityId={id}
          universityName={valueName(uni) || 'this university'}
        />
      ) : null}

      {tab === 'courses' || tab === 'questions' || tab === 'content-gaps' ? (
        <Card className="text-sm text-text-muted">
          Detailed {tab.replace('-', ' ')} analytics are not in the bundled API contract yet.
        </Card>
      ) : null}

      {tab === 'settings' ? (
        <div className="max-w-2xl">
          <UniversityForm
            initial={{
              name: valueName(uni),
              acronym: valueCode(uni),
              location: valueString(uni, 'location'),
              type: valueString(uni, 'type') === 'private' ? 'private' : 'public',
              websiteUrl: valueString(uni, 'websiteUrl'),
              logoKey: valueString(uni, 'logoKey'),
              isActive: active,
            }}
            submitLabel={updateU.isPending ? 'Saving…' : 'Save settings'}
            onSubmit={async (values) => {
              try {
                await updateU.mutateAsync(values as unknown as Record<string, unknown>);
                await detailQ.refetch();
                setActionMsg({ kind: 'success', text: 'University settings saved.' });
              } catch (e) {
                setActionMsg({
                  kind: 'error',
                  text: e instanceof Error ? e.message : 'Failed to save university settings.',
                });
              }
            }}
          />
        </div>
      ) : null}

      <EditDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit university"
        subtitle={valueName(uni)}
      >
        <UniversityForm
          initial={{
            name: valueName(uni),
            acronym: valueCode(uni),
            location: valueString(uni, 'location'),
            type: valueString(uni, 'type') === 'private' ? 'private' : 'public',
            websiteUrl: valueString(uni, 'websiteUrl'),
            logoKey: valueString(uni, 'logoKey'),
            isActive: active,
          }}
          submitLabel={updateU.isPending ? 'Saving…' : 'Save'}
          onSubmit={async (values) => {
            try {
              await updateU.mutateAsync(values as unknown as Record<string, unknown>);
              setEditOpen(false);
              await detailQ.refetch();
              setActionMsg({ kind: 'success', text: 'University updated.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to update university.',
              });
            }
          }}
        />
      </EditDrawer>

      <EditDrawer
        isOpen={addCollegeOpen}
        onClose={() => setAddCollegeOpen(false)}
        title="Add college"
        subtitle={`Under ${valueName(uni)}`}
      >
        <CollegeForm
          universityId={id}
          submitLabel={createCollege.isPending ? 'Saving…' : 'Create college'}
          onSubmit={async (payload) => {
            try {
              await createCollege.mutateAsync(payload);
              setAddCollegeOpen(false);
              await collegesQ.refetch();
              setActionMsg({ kind: 'success', text: 'College created successfully.' });
            } catch (e) {
              setActionMsg({
                kind: 'error',
                text: e instanceof Error ? e.message : 'Failed to create college.',
              });
            }
          }}
        />
      </EditDrawer>

      <EditDrawer
        isOpen={Boolean(editCollegeId)}
        onClose={() => setEditCollegeId(null)}
        title="Edit college"
      >
        {currentCollege ? (
          <CollegeForm
            universityId={id}
            initial={{
              id: valueId(currentCollege),
              name: valueName(currentCollege),
              code: valueCode(currentCollege),
              isActive: valueBool(currentCollege, 'isActive', true),
            }}
            submitLabel={updateCollege.isPending ? 'Saving…' : 'Save college'}
            onSubmit={async (payload) => {
              if (!editCollegeId) return;
              try {
                await updateCollege.mutateAsync({ id: editCollegeId, payload });
                setEditCollegeId(null);
                await collegesQ.refetch();
                setActionMsg({ kind: 'success', text: 'College updated.' });
              } catch (e) {
                setActionMsg({
                  kind: 'error',
                  text: e instanceof Error ? e.message : 'Failed to update college.',
                });
              }
            }}
          />
        ) : (
          <p className="text-sm text-text-muted">Loading college…</p>
        )}
      </EditDrawer>

      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={async () => {
          try {
            await updateU.mutateAsync({ isActive: !active });
            setConfirmDeactivate(false);
            await detailQ.refetch();
            setActionMsg({
              kind: 'success',
              text: active ? 'University deactivated.' : 'University activated.',
            });
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to change university status.',
            });
          }
        }}
        title={active ? 'Deactivate university' : 'Activate university'}
        message={
          active
            ? `Deactivating ${valueName(uni)} will hide it from student pickers.`
            : `Activating ${valueName(uni)} will make it visible to students again.`
        }
        confirmLabel={active ? 'Deactivate' : 'Activate'}
        variant={active ? 'danger' : 'warning'}
        isLoading={updateU.isPending}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await deleteU.mutateAsync();
            await router.replace('/admin/institutions');
          } catch (e) {
            setActionMsg({
              kind: 'error',
              text: e instanceof Error ? e.message : 'Failed to delete university.',
            });
          }
        }}
        title="Delete university"
        message="Delete endpoint is unavailable in bundled OpenAPI, so this action performs a soft-delete (set inactive)."
        confirmLabel="Deactivate as delete"
        variant="danger"
        isLoading={deleteU.isPending}
      />
    </div>
  );
}

export default function UniversityDetailPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="University detail">
        <UniversityDetailContent />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}
