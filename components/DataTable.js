// components/DataTable.js
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import SkeletonBox from '@/components/ui/skeleton/SkeletonBox'

export default function DataTable({
  data = [],
  columns = [],
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  recordsPerPage = 10,
  loading = false,
  searchable = false,
  filterable = false,
  sortable = false,
  onPageChange,
  emptyMessage = 'No data available',
  /** When set, clicking a row invokes this unless the click target is interactive (button, link, input). */
  onRowClick,
  getRowKey,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [showFilters, setShowFilters] = useState(false)

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchQuery) {
      result = result.filter(row => {
        return columns.some(column => {
          if (column.searchable && row[column.accessor]) {
            return row[column.accessor].toString().toLowerCase().includes(searchQuery.toLowerCase())
          }
          return false
        })
      })
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === bValue) return 0
        if (aValue === null) return 1
        if (bValue === null) return -1

        const comparison = aValue.toString().localeCompare(bValue.toString())
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchQuery, sortConfig, columns])

  if (loading) {
    return (
      <div className="space-y-2.5 p-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`table-skeleton-row-${idx}`}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3"
          >
            <SkeletonBox width="24%" height={12} borderRadius={4} />
            <SkeletonBox width="18%" height={12} borderRadius={4} />
            <SkeletonBox width="14%" height={12} borderRadius={4} />
            <div className="ml-auto">
              <SkeletonBox width={74} height={10} borderRadius={999} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-[#111827]">
      {/* Search and Filter Bar */}
      {(searchable || filterable) && (
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border border-white/10 bg-white/[0.04] py-2 pl-10 pr-3 leading-5 text-slate-100 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/40 sm:text-sm"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium leading-4 text-slate-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/[0.03]">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 ${
                  sortable && column.sortable ? 'cursor-pointer hover:text-slate-200' : ''
                }`}
                onClick={() => sortable && column.sortable && handleSort(column.accessor)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {sortable && column.sortable && sortConfig.key === column.accessor && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-transparent">
          {processedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            processedData.map((row, rowIndex) => {
              const rowKey =
                typeof getRowKey === 'function'
                  ? getRowKey(row, rowIndex)
                  : row?.id != null
                    ? String(row.id)
                    : rowIndex
              const rowClickable = Boolean(onRowClick)
              const handleRowClick = (e) => {
                if (!onRowClick) return
                const t = e.target
                if (t instanceof Element && t.closest('button, a, input, textarea, select, [data-no-row-click]')) {
                  return
                }
                onRowClick(row)
              }
              return (
                <tr
                  key={rowKey}
                  onClick={rowClickable ? handleRowClick : undefined}
                  className={`hover:bg-white/[0.03] ${rowClickable ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="whitespace-nowrap px-6 py-4 text-sm text-slate-100">
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 bg-[#111827] px-4 py-3 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-white/10 bg-white/[0.04] px-2 py-2 text-sm font-medium text-slate-400 hover:bg-white/10"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onPageChange(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 border-orange-500/70 bg-orange-500/15 text-orange-200'
                        : 'border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-white/10 bg-white/[0.04] px-2 py-2 text-sm font-medium text-slate-400 hover:bg-white/10"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
