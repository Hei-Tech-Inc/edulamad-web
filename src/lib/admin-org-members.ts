/**
 * Normalizes GET /admin/organizations/:id/members payloads — backends may return
 * a bare array or an envelope with `items` / `members` / `data`, and member rows may be
 * nested (`user`, `role`) or flat (`email`, `roleName`, …).
 */

export type OrgMemberTableRow = {
  id: string;
  memberId: string;
  email: string;
  full_name: string;
  role: string;
  roleId: string;
  created_at?: string;
  isActive: boolean;
};

function asNonEmptyString(x: unknown): string | null {
  if (x == null) return null;
  const s = String(x).trim();
  return s || null;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

/** Extract member objects from list or common paginated / wrapped shapes. */
export function extractOrgMembersList(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];
  for (const key of [
    'items',
    'members',
    'data',
    'results',
    'rows',
    'records',
  ] as const) {
    const v = raw[key];
    if (Array.isArray(v)) return v;
  }
  return [];
}

/**
 * When the API returns total count with a page of items, surface it for future server-side
 * pagination. Optional — many deployments return only an array.
 */
export function extractOrgMembersTotal(raw: unknown): number | undefined {
  if (raw == null || Array.isArray(raw) || !isRecord(raw)) return undefined;
  for (const key of [
    'total',
    'totalCount',
    'count',
    'total_count',
  ] as const) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v;
  }
  return undefined;
}

function mapOne(m: Record<string, unknown>): OrgMemberTableRow {
  const u = isRecord(m.user) ? m.user : null;
  const r = isRecord(m.role) ? m.role : null;

  const userId =
    asNonEmptyString(m.userId) ??
    asNonEmptyString(m.user_id) ??
    (u ? asNonEmptyString(u.id) ?? asNonEmptyString(u.userId) : null);
  const memberId =
    asNonEmptyString(m.id) ?? asNonEmptyString(m.memberId) ?? userId ?? '';

  const email =
    (u && (asNonEmptyString(u.email) || asNonEmptyString(u.emailAddress))) ||
    asNonEmptyString(m.email) ||
    '';

  const first =
    (u && asNonEmptyString(u.firstName)) || asNonEmptyString(m.firstName) || '';
  const last =
    (u && asNonEmptyString(u.lastName)) || asNonEmptyString(m.lastName) || '';
  const fromParts = [first, last].filter(Boolean).join(' ').trim();

  const full_name =
    (u && asNonEmptyString(u.name)) ||
    asNonEmptyString(m.name) ||
    asNonEmptyString(m.fullName) ||
    asNonEmptyString(m.full_name) ||
    (fromParts || null) ||
    email ||
    '—';

  const roleName =
    (r && asNonEmptyString(r.name)) ||
    (typeof m.role === 'string' ? m.role.trim() : '') ||
    asNonEmptyString(m.roleName) ||
    asNonEmptyString(m.role_name) ||
    '';

  const roleId =
    (r && asNonEmptyString(r.id)) ||
    asNonEmptyString(m.roleId) ||
    asNonEmptyString(m.role_id) ||
    '';

  const id = userId || memberId;
  const joined =
    asNonEmptyString(m.joinedAt) ||
    asNonEmptyString(m.createdAt) ||
    asNonEmptyString(m.joined_at) ||
    asNonEmptyString(m.created_at);

  return {
    id: id || memberId,
    memberId: memberId || id,
    email,
    full_name,
    role: roleName || '—',
    roleId,
    created_at: joined ?? undefined,
    isActive: m.isActive !== false,
  };
}

export function mapAdminOrgMemberToRow(raw: unknown): OrgMemberTableRow | null {
  if (!isRecord(raw)) return null;
  const row = mapOne(raw);
  if (!row.id && !row.memberId) return null;
  return row;
}

export function mapOrgMembersToRows(rawList: unknown[]): OrgMemberTableRow[] {
  const out: OrgMemberTableRow[] = [];
  for (const item of rawList) {
    const row = mapAdminOrgMemberToRow(item);
    if (row) out.push(row);
  }
  return out;
}
