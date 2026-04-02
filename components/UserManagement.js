// components/UserManagement.js — org members via Nsuo admin API
import { useState, useEffect, useCallback } from 'react'
import { Edit, Trash, UserPlus, Mail, Shield } from 'lucide-react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '../contexts/AuthContext'

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
  const [roles, setRoles] = useState([])
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
    ;(async () => {
      try {
        const { data } = await apiClient.get(API.admin.roles.list)
        const list = Array.isArray(data) ? data : []
        setRoles(list)
        setFormData((prev) => ({
          ...prev,
          roleId: prev.roleId || list[0]?.id || '',
        }))
      } catch (e) {
        console.error('Error loading roles', e)
      }
    })()
  }, [])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

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
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      {message && (
        <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-md">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="font-medium text-gray-700">Organisation members</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddUser(!showAddUser)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add member
        </button>
      </div>

      {showAddUser && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Add existing user
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            The user must already exist in Nsuo (e.g. after signup). Paste their
            user ID from admin tools or the API.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User ID (UUID)
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                  placeholder="123e4567-e89b-12d3-a456-426614174000"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="roleId"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
                  >
                    {roles.length === 0 ? (
                      <option value="">Loading roles…</option>
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
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add member
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.memberId || user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-800 font-semibold text-sm">
                          {user.full_name?.charAt(0) ||
                            user.email?.charAt(0) ||
                            '?'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {roles.length > 0 ? (
                      <select
                        className="text-sm border-gray-300 rounded-md max-w-[220px]"
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
                      <span className="text-sm text-gray-700">{user.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3 items-center">
                      <span title="Change role">
                        <Edit className="h-5 w-5 text-gray-400" />
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
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
