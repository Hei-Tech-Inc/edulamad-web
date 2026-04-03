import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

function normalizeList(raw) {
  if (!raw) return { items: [], pagination: null }
  if (Array.isArray(raw)) return { items: raw, pagination: null }
  if (Array.isArray(raw.items)) return raw
  if (raw.data && Array.isArray(raw.data.items)) return raw.data
  return { items: [], pagination: null }
}

function AuditLogsContent() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(API.auditLogs.list, {
        params: { page, limit: 25 },
      })
      const { items: rows, pagination: pg } = normalizeList(data)
      setItems(rows)
      setPagination(pg)
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          'Failed to load audit logs.',
      )
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="min-h-screen bg-gray-100 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard"
            className="text-sky-600 hover:text-sky-800 flex items-center mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 text-red-800 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        When
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        Action
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        User
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        Resource
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No audit entries for this page.
                        </td>
                      </tr>
                    ) : (
                      items.map((row) => (
                        <tr key={row.id || row._id || JSON.stringify(row)}>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleString()
                              : row.timestamp
                              ? new Date(row.timestamp).toLocaleString()
                              : '—'}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs">
                            {row.action || row.event || '—'}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {row.userId ||
                              row.user?.email ||
                              row.actorId ||
                              '—'}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {row.resourceType || row.entity || '—'}
                          </td>
                          <td className="px-4 py-2 text-gray-500 max-w-md truncate">
                            {typeof row.metadata === 'object'
                              ? JSON.stringify(row.metadata)
                              : row.details || row.message || ''}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Page {pagination.page} of {pagination.pages} (
                    {pagination.total} total)
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= (pagination.pages || 1)}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuditLogsPage() {
  return (
    <ProtectedRoute>
      <AuditLogsContent />
    </ProtectedRoute>
  )
}
