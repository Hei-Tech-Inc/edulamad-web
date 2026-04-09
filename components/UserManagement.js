// components/UserManagement.js — org members via admin API
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Edit, Trash, UserPlus, Mail, Shield } from 'lucide-react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '../contexts/AuthContext'
import { getAppName } from '@/lib/app-brand'
import { SkeletonNotificationRow } from '@/components/ui/skeleton'

function mapMemberToRow(m) {
  const u = m.user || {}
  const r = m.role || {}
  return {
    id: m.userId,
    memberId: m.id,
    email: u.email || '',
    full_name: u.name || u.email || '—',
    role: r.name || '—',
    roleId: r.id || m.roleId,
    created_at: m.joinedAt || m.createdAt,
    isActive: m.isActive !== false,
  }
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
    userId: '',
    roleId: '',
  })

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
      const list = Array.isArray(data) ? data : []
      setUsers(list.map(mapMemberToRow))
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

  const roles = useMemo(() => {
    const byId = new Map()
    users.forEach((u) => {
      const id = String(u.roleId || '').trim()
      const name = String(u.role || '').trim()
      if (!id) return
      byId.set(id, {
        id,
        name: name || 'Role',
      })
    })
    return Array.from(byId.values())
  }, [users])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!orgId) return
    const uid = String(formData.userId || '').trim()
    if (!uid) {
      setError('User ID is required')
      return
    }
    try {
      await apiClient.post(API.admin.organizations.members(orgId), {
        userId: uid,
        roleId: formData.roleId || undefined,
      })
      setMessage('Member added')
      setFormData((prev) => ({ ...prev, userId: '' }))
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

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

      <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-neutral-800">
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Organisation members</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddUser(!showAddUser)}
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
            The user must already exist in {getAppName()} (e.g. after signup).
            Paste their user ID from admin tools or the API.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="userId"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  User ID (UUID)
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                  placeholder="123e4567-e89b-12d3-a456-426614174000"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="roleId"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
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
              filteredUsers.map((user) => (
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
                  No members loaded. Check permissions or organisation ID.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
