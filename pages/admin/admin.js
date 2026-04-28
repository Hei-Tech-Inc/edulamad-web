// pages/admin/admin.js — organisation management (legacy route name)
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, ArrowLeft, Edit, Trash, Eye } from 'lucide-react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import DataTable from '../../components/DataTable'
import { useAuth } from '../../contexts/AuthContext'
import organizationService from '../../lib/organizationService'
import { useToast } from '../../components/Toast'

export default function AdminOrganizationsPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Institution management">
        <OrganizationsList />
      </AdminPortalShell>
    </ProtectedRoute>
  )
}

function OrganizationsList() {
  const router = useRouter()
  const { user, hasRole } = useAuth()
  const { showToast } = useToast()

  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState(null)

  // Check if user has super_admin role
  useEffect(() => {
    if (user && !hasRole('super_admin')) {
      router.push('/dashboard')
    }
  }, [user, hasRole, router])

  useEffect(() => {
    async function fetchOrganizations() {
      setLoading(true)
      try {
        const { data, error } = await organizationService.listOrganizations()

        if (error) throw error

        setOrganizations(data || [])
      } catch (error) {
        console.error('Error fetching organizations:', error)
        setError('Failed to load institutions')
        showToast('Failed to load institutions', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [showToast])

  const handleDeleteOrganization = (row) => {
    setOrgToDelete(row)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!orgToDelete) return

    try {
      const { error } = await organizationService.deleteOrganization(orgToDelete.id)

      if (error) throw error

      showToast('Institution removed successfully', 'success')
      setOrganizations(organizations.filter((c) => c.id !== orgToDelete.id))
      setShowDeleteModal(false)
      setOrgToDelete(null)
    } catch (error) {
      console.error('Error deleting organization:', error)
      showToast('Failed to delete institution: ' + error.message, 'error')
    }
  }

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      searchable: true,
    },
    {
      header: 'Abbreviation',
      accessor: 'abbreviation',
      sortable: true,
    },
    {
      header: 'Contact Email',
      accessor: 'contact_email',
      sortable: true,
    },
    {
      header: 'Contact Phone',
      accessor: 'contact_phone',
    },
    {
      header: 'Created',
      accessor: 'created_at',
      sortable: true,
      cell: (row) => {
        const t = row.created_at ? new Date(row.created_at).getTime() : NaN
        return Number.isFinite(t) ? new Date(t).toLocaleDateString() : '—'
      },
    },
    {
      header: 'Users',
      accessor: 'user_count',
      sortable: true,
      cell: (row) => row.user_count || 0,
    },
  ]

  const tableActions = {
    view: (row) => router.push(`/admin/companies/${row.id}`),
    edit: (row) => router.push(`/admin/companies/${row.id}/edit`),
    delete: (row) => handleDeleteOrganization(row),
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="mr-4 inline-flex items-center text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Institution management
            </h1>
          </div>

          <Link href="/admin/companies/create">
            <button className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add institution
            </button>
          </Link>
        </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
          <DataTable
            data={organizations}
            columns={columns}
            loading={loading}
            pagination={true}
            actions={tableActions}
            searchable={true}
            sortable={true}
            emptyMessage="No institutions found."
          />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-neutral-900">
            <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">
              Confirm Deletion
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to delete {orgToDelete?.name}? This
              action cannot be undone and will remove ALL data associated with
              this institution.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
