import { useState } from 'react';
import { UserPlus, RefreshCw } from 'lucide-react';
import { useAdminOrgRoles } from '@/hooks/admin/useAdminOrgRoles';
import { useAdminOrgMembers } from '@/hooks/admin/useAdminOrgMembers';
import { useAddOrgMember } from '@/hooks/admin/useAdminOrgAccessMutations';
import { useToast } from '../Toast';
import { isApiError } from '@/lib/api-error';
import { SkeletonNotificationRow } from '@/components/ui/skeleton';

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = {
  organizationId: string;
  disabled?: boolean;
};

export function TenantAccessPanel({ organizationId, disabled }: Props) {
  const { showToast } = useToast();
  const rolesQ = useAdminOrgRoles(organizationId);
  const membersQ = useAdminOrgMembers(organizationId);
  const addMemberMut = useAddOrgMember();

  const [addOpen, setAddOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRoleId, setMemberRoleId] = useState('');

  const busy = addMemberMut.isPending;
  const idle = !disabled && !busy;

  const onAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = memberUserId.trim();
    if (!uuidRe.test(uid)) {
      showToast('User ID must be a valid UUID', 'error');
      return;
    }
    const rid = memberRoleId.trim();
    try {
      await addMemberMut.mutateAsync({
        orgId: organizationId,
        userId: uid,
        ...(rid && uuidRe.test(rid) ? { roleId: rid } : {}),
      });
      showToast('Member added', 'success');
      setMemberUserId('');
      setMemberRoleId('');
      setAddOpen(false);
    } catch (err) {
      showToast(isApiError(err) ? err.message : 'Add member failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!idle}
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-bold text-violet-900 shadow-sm hover:bg-violet-100 disabled:pointer-events-none disabled:opacity-45 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100 dark:hover:bg-violet-900/60"
        >
          <UserPlus className="h-4 w-4" />
          Add member
        </button>
        <button
          type="button"
          onClick={() => {
            void rolesQ.refetch();
            void membersQ.refetch();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw
            className={`h-4 w-4 ${rolesQ.isFetching || membersQ.isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Organisation roles{' '}
          <span className="font-mono font-normal text-slate-400">
            derived from current members
          </span>
        </h3>
        {rolesQ.isError ? (
          <p className="text-sm text-red-600">
            {rolesQ.error instanceof Error
              ? rolesQ.error.message
              : 'Failed to load roles'}
          </p>
        ) : rolesQ.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonNotificationRow key={`tenant-roles-skeleton-${i}`} />
            ))}
          </div>
        ) : !rolesQ.data?.length ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700">
            No role metadata available from this backend. Add members normally and let the server
            assign default roles.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    Name
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    Description
                  </th>
                  <th className="px-3 py-2 font-mono text-xs font-semibold text-slate-500">
                    id
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rolesQ.data.map((r) => (
                  <tr key={r.id} className="bg-white dark:bg-slate-900/40">
                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                      {String(r.name ?? '—')}
                      {r.isSystem ? (
                        <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          system
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-slate-600 dark:text-slate-400">
                      {String(r.description ?? '—')}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{r.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Members{' '}
          <span className="font-mono font-normal text-slate-400">
            GET /admin/organizations/:id/members
          </span>
        </h3>
        {membersQ.isError ? (
          <p className="text-sm text-red-600">
            {membersQ.error instanceof Error
              ? membersQ.error.message
              : 'Failed to load members'}
          </p>
        ) : membersQ.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonNotificationRow key={`tenant-members-skeleton-${i}`} />
            ))}
          </div>
        ) : !membersQ.data?.length ? (
          <p className="text-sm text-slate-500">No members in admin response yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    User
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    Role
                  </th>
                  <th className="px-3 py-2 font-mono text-xs text-slate-500">userId</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {membersQ.data.map((m) => {
                  const u = m.user && typeof m.user === 'object' ? m.user : null;
                  const ro = m.role && typeof m.role === 'object' ? m.role : null;
                  const email =
                    u && typeof u.email === 'string' ? u.email : null;
                  const uname =
                    u && typeof u.name === 'string' ? u.name : null;
                  const rname =
                    ro && typeof ro.name === 'string' ? ro.name : null;
                  return (
                    <tr key={m.id} className="bg-white dark:bg-slate-900/40">
                      <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                        {email || uname || String(m.userId ?? '—')}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                        {rname || String(m.roleId ?? '—')}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                        {String(m.userId ?? '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {addOpen ? (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[2px]"
            onClick={() => !busy && setAddOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            role="dialog"
          >
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Add organisation member</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              POST /admin/organizations/
              <span className="font-mono">{organizationId.slice(0, 8)}…</span>/members (
              <span className="font-mono">AddMemberDto</span>).
            </p>
            <form onSubmit={onAddMember} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  User ID (UUID) <span className="text-red-500">*</span>
                </label>
                <input
                  value={memberUserId}
                  onChange={(e) => setMemberUserId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Role ID (optional)
                </label>
                <select
                  value={memberRoleId}
                  onChange={(e) => setMemberRoleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">— None —</option>
                  {(rolesQ.data ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name ?? r.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAddOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  Add member
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
