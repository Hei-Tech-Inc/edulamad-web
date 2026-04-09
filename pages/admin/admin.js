// pages/admin/companies.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, ArrowLeft, Edit, Trash, Eye } from 'lucide-react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useAuth } from '../../contexts/AuthContext'
import companyService from '../../lib/companyService'
import { useToast } from '../../components/Toast'

export default function CompaniesPage() {
  return (
    <ProtectedRoute>
      <Layout title="Admin dashboard">
        <CompaniesList />
      </Layout>
    </ProtectedRoute>
  )
}

function CompaniesList() {
  const router = useRouter()
  const { user, hasRole } = useAuth()
  const { showToast } = useToast()

  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState(null)

  // Check if user has super_admin role
  useEffect(() => {
    if (user && !hasRole('super_admin')) {
      router.push('/dashboard')
    }
  }, [user, hasRole, router])

  // Fetch companies
  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      try {
        const { data, error } = await companyService.getAllCompanies()

        if (error) throw error

        setCompanies(data || [])
      } catch (error) {
        console.error('Error fetching companies:', error)
        setError('Failed to load companies')
        showToast('Failed to load companies', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [showToast])

  const handleDeleteCompany = (company) => {
    setCompanyToDelete(company)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return

    try {
      const { error } = await companyService.deleteCompany(companyToDelete.id)

      if (error) throw error

      showToast('Company deleted successfully', 'success')
      setCompanies(companies.filter((c) => c.id !== companyToDelete.id))
      setShowDeleteModal(false)
      setCompanyToDelete(null)
    } catch (error) {
      console.error('Error deleting company:', error)
      showToast('Failed to delete company: ' + error.message, 'error')
    }
  }

  const columns = [
    {
      header: 'Company Name',
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
    delete: (row) => handleDeleteCompany(row),
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
              Company Management
            </h1>
          </div>

          <Link href="/admin/companies/create">
            <button className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </button>
          </Link>
        </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
          <DataTable
            data={companies}
            columns={columns}
            loading={loading}
            pagination={true}
            actions={tableActions}
            searchable={true}
            sortable={true}
            emptyMessage="No companies found."
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
              Are you sure you want to delete {companyToDelete?.name}? This
              action cannot be undone and will remove ALL data associated with
              this company.
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
