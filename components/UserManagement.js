// components/UserManagement.js — org members via admin API
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Edit, Trash, UserPlus, Mail, Shield, Search, UserRound } from 'lucide-react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '../contexts/AuthContext'
import { getAppName } from '@/lib/app-brand'
import { SkeletonNotificationRow } from '@/components/ui/skeleton'
import {
  extractOrgMembersList,
  mapOrgMembersToRows,
} from '@/lib/admin-org-members'

/** API response shapes differ by deployment — normalize to an array of hits. */
function asArrayFromSearchPayload(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.users)) return data.users
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.results)) return data.results
  if (Array.isArray(data.hits)) return data.hits
  if (Array.isArray(data.documents)) return data.documents
  return []
}

function pickUserIdFromSearchHit(hit) {
  const raw = hit?.id ?? hit?.userId ?? hit?.user_id ?? hit?.user?.id
  if (raw == null) return null
  const s = String(raw).trim()
  return s || null
}

function pickEmailFromSearchHit(hit) {
  const u = hit?.user && typeof hit.user === 'object' ? hit.user : null
  const e = hit?.email ?? u?.email ?? ''
  return String(e).trim()
}

function pickDisplayNameFromSearchHit(hit) {
  const u = hit?.user && typeof hit.user === 'object' ? hit.user : hit
  const parts = [u?.firstName, u?.lastName].filter(Boolean)
  const joined = parts.join(' ').trim()
  const n =
    (typeof u?.name === 'string' && u.name.trim()) ||
    (typeof hit?.name === 'string' && hit.name.trim()) ||
    (typeof hit?.fullName === 'string' && hit.fullName.trim()) ||
    (typeof hit?.full_name === 'string' && hit.full_name.trim()) ||
    joined
  const email = pickEmailFromSearchHit(hit)
  return (n && String(n).trim()) || email || '—'
}

function mapSearchHitsForPicker(data) {
  return asArrayFromSearchPayload(data)
    .map((hit) => {
      const id = pickUserIdFromSearchHit(hit)
      if (!id) return null
      return {
        id,
        email: pickEmailFromSearchHit(hit),
        displayName: pickDisplayNameFromSearchHit(hit),
      }
    })
    .filter(Boolean)
}

/** GET /search/users — OpenAPI: limit (max 100), offset pagination */
const USER_SEARCH_LIMIT = 20

function mergeInviteHitsDedupe(prev, next) {
  const seen = new Set(prev.map((h) => String(h.id)))
  const merged = [...prev]
  for (const h of next) {
    const id = String(h.id)
    if (!seen.has(id)) {
      seen.add(id)
      merged.push(h)
    }
  }
  return merged
}

const UserManagement = () => {
  const { user: currentUser } = useAuth()
  const orgId = useAuthStore((s) => s.user?.orgId)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState({
    roleId: '',
  })
  const [inviteQuery, setInviteQuery] = useState('')
  const [searchHits, setSearchHits] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHint, setSearchHint] = useState(null)
  const [searchUnavailable, setSearchUnavailable] = useState(false)
  const [selectedInviteUser, setSelectedInviteUser] = useState(null)
  const [manualUserId, setManualUserId] = useState('')
  const [showUuidFallback, setShowUuidFallback] = useState(false)
  const [inviteSearchNextOffset, setInviteSearchNextOffset] = useState(0)
  const [inviteSearchHasMore, setInviteSearchHasMore] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)

  const fetchUsers = useCallback(async () => {
    if (!orgId) {
      setUsers([])
      setLoading(false)
      setError('No organisation in session. Sign in again.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get(
        API.admin.organizations.members(orgId),
      )
      const list = extractOrgMembersList(data)
      setUsers(mapOrgMembersToRows(list))
    } catch (e) {
      console.error('Error fetching users:', e)
      setError(
        e?.response?.data?.message ||
          e.message ||
          'Could not load members. You may need organisation admin permissions.',
      )
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setPage(0)
  }, [searchQuery])

  useEffect(() => {
    setPage(0)
  }, [pageSize])

  const roles = useMemo(() => {
    const byId = new Map()
    users.forEach((u) => {
      const id = String(u.roleId || '').trim()
      if (!id) return
      const name = String(u.role || '').trim()
      byId.set(id, {
        id,
        name: name && name !== '—' ? name : 'Role',
      })
    })
    return Array.from(byId.values())
  }, [users])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'roleId') {
      setFormData((prev) => ({ ...prev, roleId: value }))
    }
  }

  const resetAddMemberForm = useCallback(() => {
    setInviteQuery('')
    setSearchHits([])
    setSearchHint(null)
    setSearchUnavailable(false)
    setSelectedInviteUser(null)
    setManualUserId('')
    setShowUuidFallback(false)
    setInviteSearchNextOffset(0)
    setInviteSearchHasMore(false)
    setFormData({ roleId: '' })
  }, [])

  const runUserSearch = async (loadMore = false) => {
    const q = inviteQuery.trim()
    setSearchHint(null)
    setSearchUnavailable(false)
    if (q.length < 2) {
      setSearchHint('Type at least 2 letters or part of an email address.')
      return
    }
    const offset = loadMore ? inviteSearchNextOffset : 0
    if (!loadMore) {
      setSearchHits([])
      setInviteSearchNextOffset(0)
      setInviteSearchHasMore(false)
      setSelectedInviteUser(null)
    }
    setSearchLoading(true)
    try {
      const { data } = await apiClient.get(API.search.users, {
        params: { q, limit: USER_SEARCH_LIMIT, offset },
      })
      const rawList = asArrayFromSearchPayload(data)
      const rawCount = rawList.length
      setInviteSearchHasMore(rawCount >= USER_SEARCH_LIMIT)
      setInviteSearchNextOffset(offset + rawCount)

      const mapped = mapSearchHitsForPicker(data)
      const existingIds = new Set(users.map((m) => String(m.id)))
      const next = mapped.filter((h) => !existingIds.has(String(h.id)))
      if (loadMore) {
        setSearchHits((prev) => mergeInviteHitsDedupe(prev, next))
      } else {
        setSearchHits(next)
      }
      if (!loadMore && next.length === 0) {
        setSearchHint('No users found who are not already in this organisation.')
      }
      if (loadMore && next.length === 0 && rawCount >= USER_SEARCH_LIMIT) {
        setSearchHint(
          'More matches exist from the directory; try narrowing your search if everyone shown is already a member.',
        )
      }
    } catch (e) {
      const status = e?.response?.status
      if (status === 503) {
        setSearchUnavailable(true)
        if (!loadMore) setSearchHits([])
        setSearchHint(
          'Directory search is not enabled on this server. Use “User ID” below, or ask your team to enable search.',
        )
        setShowUuidFallback(true)
      } else {
        setSearchHint(
          e?.response?.data?.message ||
            e.message ||
            'Could not search users. Try again or use User ID below.',
        )
      }
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!orgId) return
    const uid = String(selectedInviteUser?.id || manualUserId || '').trim()
    if (!uid) {
      setError(
        'Search for the person by name or email and select them, or enter their user ID under “Advanced”.',
      )
      return
    }
    try {
      await apiClient.post(API.admin.organizations.members(orgId), {
        userId: uid,
        roleId: formData.roleId || undefined,
      })
      setMessage('Member added')
      resetAddMemberForm()
      setShowAddUser(false)
      await fetchUsers()
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          'Failed to add member (user must exist and not already be a member).',
      )
    }
  }

  const updateUserRole = async (userId, newRoleId) => {
    if (!orgId || !newRoleId) return
    try {
      await apiClient.put(
        API.admin.organizations.memberRole(orgId, userId),
        { roleId: newRoleId },
      )
      setMessage('Role updated')
      await fetchUsers()
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Role update failed')
    }
  }

  const deleteUser = async (userId) => {
    if (
      !confirm(
        'Remove this user from the organisation? They can be re-added later.',
      )
    ) {
      return
    }
    if (!orgId) return
    try {
      await apiClient.delete(
        API.admin.organizations.member(orgId, userId),
      )
      setMessage('Member removed')
      await fetchUsers()
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Remove failed')
    }
  }

  const q = searchQuery.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    if (!q) return true
    return (
      user.email?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q) ||
      String(user.id || '')
        .toLowerCase()
        .includes(q)
    )
  })

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const pagedUsers = filteredUsers.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  )

  useEffect(() => {
    if (page >= pageCount) setPage(Math.max(0, pageCount - 1))
  }, [page, pageCount])

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
      {message && (
        <div className="m-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          {message}
        </div>
      )}

      {error && (
        <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && orgId ? (
        <div className="mx-4 mt-4 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-sm text-slate-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-slate-400">
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            Roles & search:
          </strong>{' '}
          Change a member&apos;s access with the <strong>Role</strong> dropdown in each row (
          <kbd className="rounded bg-white px-1 font-mono text-xs shadow-sm dark:bg-neutral-950">
            PUT …/members/:userId/role
          </kbd>
          ). Use the box above the table to filter this list.{' '}
          <strong>Add member</strong> searches existing accounts (
          <kbd className="rounded bg-white px-1 font-mono text-xs shadow-sm dark:bg-neutral-950">
            GET /search/users
          </kbd>{' '}
          (<span className="font-mono text-[0.7rem]">q</span>,{' '}
          <span className="font-mono text-[0.7rem]">limit</span>,{' '}
          <span className="font-mono text-[0.7rem]">offset</span>) — use{' '}
          <strong>Load more results</strong> when the directory returns a full page. Role choices come from roles already present on members until the API exposes a role catalog.
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Organisation members
            {!loading && users.length > 0 ? (
              <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                ({users.length})
              </span>
            ) : null}
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search members by name, email, or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddUser((open) => {
              const next = !open
              if (next) resetAddMemberForm()
              return next
            })
          }}
          className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add member
        </button>
      </div>

      {showAddUser && (
        <div className="border-b border-slate-200/80 bg-slate-50/70 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Add existing user
          </h3>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            They must already have signed up to {getAppName()}. Search by the name or email they used at
            registration, then pick the right person.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="inviteQuery"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Find user
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  type="search"
                  id="inviteQuery"
                  value={inviteQuery}
                  onChange={(e) => setInviteQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void runUserSearch()
                    }
                  }}
                  autoComplete="off"
                  className="block min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                  placeholder="e.g. kwame or kwame@university.edu"
                />
                <button
                  type="button"
                  onClick={() => void runUserSearch()}
                  disabled={searchLoading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900 dark:text-slate-100 dark:hover:bg-neutral-800"
                >
                  <Search className="h-4 w-4" />
                  {searchLoading ? 'Searching…' : 'Search'}
                </button>
              </div>
              {searchHint ? (
                <p
                  className={`mt-2 text-xs ${
                    searchUnavailable
                      ? 'text-amber-700 dark:text-amber-300/90'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {searchHint}
                </p>
              ) : null}
            </div>

            {searchHits.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Select a person
                </p>
                <ul className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-950/80">
                  {searchHits.map((hit) => {
                    const selected = selectedInviteUser?.id === hit.id
                    return (
                      <li key={hit.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInviteUser(hit)
                            setManualUserId('')
                          }}
                          className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? 'bg-orange-50 ring-2 ring-orange-400 ring-offset-1 ring-offset-white dark:bg-orange-950/40 dark:ring-orange-600 dark:ring-offset-neutral-950'
                              : 'hover:bg-slate-50 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                            <UserRound className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-slate-900 dark:text-slate-100">
                              {hit.displayName}
                            </span>
                            <span className="block truncate text-slate-500 dark:text-slate-400">
                              {hit.email || 'No email on record'}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {inviteSearchHasMore ? (
                  <button
                    type="button"
                    onClick={() => void runUserSearch(true)}
                    disabled={searchLoading}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:hover:bg-neutral-800"
                  >
                    {searchLoading ? 'Loading…' : 'Load more results'}
                  </button>
                ) : null}
              </div>
            ) : null}

            {selectedInviteUser ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                <span className="font-medium">Selected:</span>{' '}
                {selectedInviteUser.displayName}
                {selectedInviteUser.email ? (
                  <>
                    {' '}
                    <span className="text-emerald-700/90 dark:text-emerald-300/90">
                      ({selectedInviteUser.email})
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}

            <details
              className="rounded-xl border border-slate-200 bg-white/80 dark:border-neutral-700 dark:bg-neutral-950/50"
              open={showUuidFallback}
              onToggle={(e) => setShowUuidFallback(e.currentTarget.open)}
            >
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Advanced: enter user ID (UUID)
              </summary>
              <div className="border-t border-slate-200 px-4 pb-4 pt-3 dark:border-neutral-700">
                <label
                  htmlFor="manualUserId"
                  className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Only if search is unavailable or support gave you an ID
                </label>
                <input
                  type="text"
                  id="manualUserId"
                  value={manualUserId}
                  onChange={(e) => {
                    setManualUserId(e.target.value)
                    if (e.target.value.trim()) setSelectedInviteUser(null)
                  }}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                  placeholder="123e4567-e89b-12d3-a456-426614174000"
                  autoComplete="off"
                />
              </div>
            </details>

            <div>
              <label
                htmlFor="roleId"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Role
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Shield className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 py-2 pl-10 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                >
                  {roles.length === 0 ? (
                    <option value="">Use server default role</option>
                  ) : (
                    roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.description ? ` — ${r.description}` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Role options come from existing organisation members. Leave empty to use server default role.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddUser(false)
                  resetAddMemberForm()
                }}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Add member
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50 dark:bg-neutral-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-neutral-800 dark:bg-neutral-950/30">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonNotificationRow key={`user-management-skeleton-${i}`} />
                    ))}
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              pagedUsers.map((user) => (
                <tr key={user.memberId || user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                          {user.full_name?.charAt(0) ||
                            user.email?.charAt(0) ||
                            '?'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {user.full_name}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {roles.length > 0 ? (
                      <select
                        className="max-w-[220px] rounded-xl border-slate-200 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100"
                        value={user.roleId || ''}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                      >
                        {!roles.some((r) => r.id === user.roleId) &&
                          user.roleId && (
                            <option value={user.roleId}>{user.role}</option>
                          )}
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-slate-700 dark:text-slate-300">{user.role}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <span title="Change role">
                        <Edit className="h-5 w-5 text-slate-400" />
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        className="text-rose-600 transition hover:text-rose-700"
                        title="Remove from organisation"
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash
                          className={`h-5 w-5 ${
                            user.id === currentUser?.id
                              ? 'opacity-30 cursor-not-allowed'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {users.length === 0
                    ? 'No members returned by the server. Confirm your account has an organisation and admin access to list members.'
                    : 'No members match this search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredUsers.length > 0 && pageCount > 1 ? (
        <div className="flex flex-col gap-3 border-t border-slate-200/80 px-6 py-4 text-sm text-slate-600 dark:border-neutral-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{' '}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {filteredUsers.length === 0
                ? 0
                : safePage * pageSize + 1}
              –
              {Math.min((safePage + 1) * pageSize, filteredUsers.length)}
            </span>{' '}
            of {filteredUsers.length}
            {searchQuery.trim() ? ' (filtered)' : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              <span className="sr-only">Rows per page</span>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                Per page
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) || 25)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:enabled:hover:bg-neutral-800"
            >
              Previous
            </button>
            <span className="tabular-nums text-slate-500 dark:text-slate-400">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:enabled:hover:bg-neutral-800"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UserManagement
