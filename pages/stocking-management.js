// pages/stocking-management.js
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  Edit,
  Calendar,
  Plus,
} from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import {
  fetchLegacyStockManagementRowsForFarm,
  patchStockCycleEditableFields,
} from '@/lib/farm-stock-management-rows'
import { useUiStore } from '@/stores/ui.store'

export default function StockingManagementPage() {
  return (
    <ProtectedRoute>
      <StockingManagement />
    </ProtectedRoute>
  )
}

function StockingManagement() {
  const activeFarmId = useUiStore((s) => s.activeFarmId)
  const [stockings, setStockings] = useState([])
  const [filteredStockings, setFilteredStockings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [yearFilter, setYearFilter] = useState('all')
  const [cageFilter, setCageFilter] = useState('all')
  const [sortField, setSortField] = useState('stocking_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [uniqueCages, setUniqueCages] = useState([])
  const [availableYears, setAvailableYears] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStocking, setEditingStocking] = useState(null)
  const [formData, setFormData] = useState({
    stocking_date: '',
    fish_count: '',
    initial_abw: '',
    source_location: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const farmId = activeFarmId || (await resolveFarmIdForRedux())
      if (!farmId) {
        setStockings([])
        setUniqueCages([])
        setAvailableYears([])
        return
      }

      const data = await fetchLegacyStockManagementRowsForFarm(farmId)
      setStockings(data)

      const cages = [...new Map(data.map((s) => [s.cage_id, s.cage?.name]))]
        .map(([id, name]) => ({ id, name: name || 'Unknown' }))
        .sort((a, b) => a.name.localeCompare(b.name))

      setUniqueCages(cages)

      const years = [
        ...new Set(data.map((s) => new Date(s.stocking_date).getFullYear())),
      ].sort((a, b) => b - a)

      setAvailableYears(years)
    } catch (error) {
      console.error('Error fetching stockings:', error)
      setStockings([])
    } finally {
      setLoading(false)
    }
  }, [activeFarmId])

  const filterStockings = useCallback(() => {
    let result = [...stockings]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (stocking) =>
          stocking.batch_number
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          stocking.cage?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          stocking.source_location
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      const year = parseInt(yearFilter)
      result = result.filter(
        (stocking) => new Date(stocking.stocking_date).getFullYear() === year,
      )
    }

    // Apply cage filter
    if (cageFilter !== 'all') {
      result = result.filter((stocking) => stocking.cage_id === cageFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]

      // Handle special case for dates
      if (sortField === 'stocking_date') {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
      }

      // Handle cage name sorting
      if (sortField === 'cage_name') {
        valueA = a.cage?.name || ''
        valueB = b.cage?.name || ''
      }

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

    setFilteredStockings(result)
  }, [
    stockings,
    searchQuery,
    yearFilter,
    cageFilter,
    sortField,
    sortDirection,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    filterStockings()
  }, [filterStockings])

  const handleSort = (field) => {
    const actualField = field === 'cage_name' ? 'cage_name' : field

    if (sortField === actualField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, start with appropriate direction
      setSortField(actualField)
      setSortDirection(field === 'stocking_date' ? 'desc' : 'asc')
    }
  }

  const handleEditStocking = (stocking) => {
    setEditingStocking(stocking)
    const dateStr =
      typeof stocking.stocking_date === 'string' &&
      stocking.stocking_date.length >= 10
        ? stocking.stocking_date.slice(0, 10)
        : String(stocking.stocking_date).split('T')[0] || ''
    setFormData({
      stocking_date: dateStr,
      fish_count: stocking.fish_count,
      initial_abw: stocking.initial_abw,
      source_location: stocking.source_location || '',
      notes: stocking.notes || '',
    })
    setError('')
    setSuccess('')
    setShowEditModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const calculateBiomass = () => {
    if (!formData.fish_count || !formData.initial_abw) return 0

    const count = parseFloat(formData.fish_count)
    const abw = parseFloat(formData.initial_abw)

    if (isNaN(count) || isNaN(abw)) return 0

    // Calculate biomass in kg (ABW in g / 1000 * count)
    return (abw / 1000) * count
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (!editingStocking) return

      await patchStockCycleEditableFields(
        editingStocking.cage_id,
        editingStocking.id,
        {
          sourceLocation: formData.source_location,
          notes: formData.notes,
        },
      )

      setSuccess('Stock cycle details saved')

      // Refresh data after short delay
      setTimeout(() => {
        fetchData()
        setShowEditModal(false)
      }, 1500)
    } catch (error) {
      console.error('Error updating stocking:', error)
      setError(error.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link
                href="/cages"
                className="text-indigo-600 hover:text-indigo-800 flex items-center mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Cages
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Stocking Management
              </h1>
            </div>

            <Link href="/stocking">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Stocking
              </button>
            </Link>
          </div>
          <p className="text-gray-600">
            Stock cycles from Nsuo for each pond (unit). Edit only updates
            source location and notes; counts and dates are managed in Nsuo.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-4 flex flex-col md:flex-row justify-between items-center border-b border-gray-200">
            <div className="w-full md:w-auto mb-4 md:mb-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stockings..."
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                {showFilters && (
                  <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1 p-3 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <select
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="all">All Years</option>
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cage
                        </label>
                        <select
                          value={cageFilter}
                          onChange={(e) => setCageFilter(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="all">All Cages</option>
                          {uniqueCages.map((cage) => (
                            <option key={cage.id} value={cage.id}>
                              {cage.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stocking Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">
                  Loading stocking data...
                </p>
              </div>
            ) : filteredStockings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('batch_number')}
                    >
                      <div className="flex items-center">
                        Batch Number
                        {sortField === 'batch_number' && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 ${
                              sortDirection === 'desc'
                                ? 'transform rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('cage_name')}
                    >
                      <div className="flex items-center">
                        Cage
                        {sortField === 'cage_name' && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 ${
                              sortDirection === 'desc'
                                ? 'transform rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('stocking_date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === 'stocking_date' && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 ${
                              sortDirection === 'desc'
                                ? 'transform rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('fish_count')}
                    >
                      <div className="flex items-center">
                        Fish Count
                        {sortField === 'fish_count' && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 ${
                              sortDirection === 'desc'
                                ? 'transform rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('initial_abw')}
                    >
                      <div className="flex items-center">
                        ABW (g)
                        {sortField === 'initial_abw' && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 ${
                              sortDirection === 'desc'
                                ? 'transform rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('initial_biomass')}
                    >
                      <div className="flex items-center">
                        Biomass (kg)
                        {sortField === 'initial_biomass' && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 ${
                              sortDirection === 'desc'
                                ? 'transform rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStockings.map((stocking) => (
                    <tr key={stocking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-600">
                        {stocking.batch_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stocking.cage?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(stocking.stocking_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stocking.fish_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stocking.initial_abw.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stocking.initial_biomass.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stocking.source_location || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        <button
                          onClick={() => handleEditStocking(stocking)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Stocking"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No stocking records found.</p>
                <Link href="/stocking">
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Stocking
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Stocking Modal */}
      {showEditModal && editingStocking && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowEditModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Edit stock cycle: {editingStocking.batch_number}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Date, fish count, and ABW are read-only. Only source location and
              notes are saved to Nsuo.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stocking Date
                </label>
                <input
                  type="date"
                  name="stocking_date"
                  value={formData.stocking_date}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fish Count
                </label>
                <input
                  type="number"
                  name="fish_count"
                  value={formData.fish_count}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial ABW (g)
                </label>
                <input
                  type="number"
                  name="initial_abw"
                  value={formData.initial_abw}
                  readOnly
                  step="0.1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Biomass (kg)
                </label>
                <input
                  type="text"
                  value={calculateBiomass().toFixed(2)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated: (ABW/1000) × Fish Count
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Location
                </label>
                <input
                  type="text"
                  name="source_location"
                  value={formData.source_location}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Optional notes"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save source and notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
