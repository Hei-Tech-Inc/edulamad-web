import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { ArrowLeft, Plus } from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useFarms } from '@/hooks/farms/useFarms'
import { useUnits } from '@/hooks/farms/useUnits'
import { useUiStore } from '@/stores/ui.store'
import { mapUnitsToLegacyCages } from '@/lib/map-unit-to-legacy-cage'

export default function CagesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CagesManagement />
      </Layout>
    </ProtectedRoute>
  )
}

function getStatusColor(status) {
  switch (status) {
    case 'active':
      return '#10B981'
    case 'maintenance':
      return '#F59E0B'
    case 'harvested':
    case 'ready_to_harvest':
      return '#EF4444'
    case 'fallow':
      return '#6B7280'
    case 'empty':
      return '#8B5CF6'
    default:
      return '#6B7280'
  }
}

function CagesManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    statusDistribution: [],
    harvestReadiness: [],
    maintenanceNeeded: [],
    utilizationRate: 0,
  })

  const activeFarmId = useUiStore((s) => s.activeFarmId)
  const setActiveFarmId = useUiStore((s) => s.setActiveFarmId)

  const {
    data: farmList,
    isLoading: farmsLoading,
    isError: farmsIsError,
    error: farmsError,
  } = useFarms({ limit: 100 })

  const farmItems = React.useMemo(
    () => farmList?.items ?? [],
    [farmList?.items],
  )

  useEffect(() => {
    if (farmItems.length > 0 && !activeFarmId) {
      setActiveFarmId(farmItems[0].id)
    }
  }, [farmItems, activeFarmId, setActiveFarmId])

  const {
    data: unitList,
    isLoading: unitsLoading,
    isError: unitsIsError,
    error: unitsError,
  } = useUnits(activeFarmId || undefined, { limit: 100 })

  const unitRows = React.useMemo(() => {
    if (!activeFarmId || !unitList?.items) return []
    return mapUnitsToLegacyCages(unitList.items, activeFarmId)
  }, [unitList, activeFarmId])

  const filteredCages = React.useMemo(() => {
    return unitRows.filter((cage) => {
      const matchesSearch =
        searchQuery === '' ||
        cage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cage.location &&
          String(cage.location).toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'all' || cage.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [unitRows, searchQuery, statusFilter])

  const analytics = React.useMemo(() => {
    if (!unitRows.length) {
      return {
        totalCages: 0,
        activeCages: 0,
        harvestReadyCages: 0,
        maintenanceCages: 0,
      }
    }

    return {
      totalCages: unitRows.length,
      activeCages: unitRows.filter((c) => c.status === 'active').length,
      harvestReadyCages: unitRows.filter((c) => c.status === 'ready_to_harvest')
        .length,
      maintenanceCages: unitRows.filter((c) => c.status === 'maintenance')
        .length,
    }
  }, [unitRows])

  useEffect(() => {
    if (!unitRows.length) {
      setAnalyticsData({
        statusDistribution: [],
        harvestReadiness: [],
        maintenanceNeeded: [],
        utilizationRate: 0,
      })
      return
    }

    const statusCount = unitRows.reduce((acc, cage) => {
      acc[cage.status] = (acc[cage.status] || 0) + 1
      return acc
    }, {})

    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
      value: count,
      color: getStatusColor(status),
    }))

    const harvestData = unitRows.reduce(
      (acc, cage) => {
        if (!cage.stocking_date) return acc

        const stockingDate = new Date(cage.stocking_date)
        const today = new Date()
        const doc = Math.floor((today - stockingDate) / (1000 * 60 * 60 * 24))

        if (doc >= 100) {
          acc.ready++
        } else if (doc >= 80) {
          acc.soon++
        } else {
          acc.growing++
        }
        return acc
      },
      { ready: 0, soon: 0, growing: 0 },
    )

    const harvestReadinessData = [
      { name: 'Ready for Harvest', value: harvestData.ready, color: '#EF4444' },
      { name: 'Harvest Soon', value: harvestData.soon, color: '#F59E0B' },
      { name: 'Growing', value: harvestData.growing, color: '#10B981' },
    ]

    const maintenanceData = unitRows.reduce(
      (acc, cage) => {
        if (cage.status === 'maintenance') {
          acc.maintenance++
        } else if (cage.status === 'active') {
          acc.active++
        } else {
          acc.other++
        }
        return acc
      },
      { maintenance: 0, active: 0, other: 0 },
    )

    const maintenanceDataFormatted = [
      {
        name: 'Needs Maintenance',
        value: maintenanceData.maintenance,
        color: '#F59E0B',
      },
      { name: 'Active', value: maintenanceData.active, color: '#10B981' },
      { name: 'Other', value: maintenanceData.other, color: '#6B7280' },
    ]

    const utilizationRate =
      (unitRows.filter((cage) => cage.status === 'active').length /
        unitRows.length) *
      100

    setAnalyticsData({
      statusDistribution: statusData,
      harvestReadiness: harvestReadinessData,
      maintenanceNeeded: maintenanceDataFormatted,
      utilizationRate,
    })
  }, [unitRows])

  const loading = farmsLoading || (Boolean(activeFarmId) && unitsLoading)

  const loadError =
    farmsIsError || unitsIsError
      ? (farmsError && farmsError.message) ||
        (unitsError && unitsError.message) ||
        'Failed to load farms or units'
      : null

  const columns = [
    {
      header: 'Cage Name',
      accessor: 'name',
      sortable: true,
      searchable: true,
      cell: (row) => (
        <Link
          href={`/cages/${row.id}?farmId=${encodeURIComponent(row.farmId)}`}
          className="text-sky-600 hover:text-sky-900 font-medium"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      sortable: true,
      searchable: true,
    },
    {
      header: 'Size',
      accessor: 'size',
      sortable: true,
      cell: (row) =>
        row.size != null
          ? `${row.size} ${row.sizeUnit === 'm2' ? 'm²' : 'm³'}`
          : '-',
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      filterable: true,
      cell: (row) => {
        const getStatusStyles = () => {
          switch (row.status) {
            case 'active':
              return 'bg-green-100 text-green-800'
            case 'maintenance':
              return 'bg-yellow-100 text-yellow-800'
            case 'harvested':
            case 'ready_to_harvest':
              return 'bg-red-100 text-red-800'
            case 'fallow':
              return 'bg-gray-100 text-gray-800'
            case 'empty':
              return 'bg-purple-100 text-purple-800'
            default:
              return 'bg-gray-100 text-gray-800'
          }
        }

        const label = row.status
          ? row.status.replace(/_/g, ' ')
          : 'Unknown'

        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles()}`}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </span>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading units...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{loadError}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!farmItems.length) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            <p className="mb-4">
              No farms found for your organisation. Create a farm in the Nsuo
              API before adding units.
            </p>
            <Link href="/dashboard">
              <span className="text-sky-600 hover:text-sky-800">
                Back to Dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center flex-wrap gap-2">
              <Link href="/dashboard">
                <button
                  type="button"
                  className="text-sky-600 hover:text-sky-800 flex items-center mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Dashboard
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Unit Management
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {farmItems.length > 1 ? (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Farm</span>
                  <select
                    value={activeFarmId ?? ''}
                    onChange={(e) =>
                      setActiveFarmId(e.target.value || null)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  >
                    {farmItems.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <Link href="/create-cage">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Unit
                </button>
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Units (ponds, cages, tanks) for the selected farm — data from Nsuo
            API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Units</div>
            <div className="mt-2 text-2xl font-semibold text-blue-600">
              {analytics.totalCages}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Active</div>
            <div className="mt-2 text-2xl font-semibold text-green-600">
              {analytics.activeCages}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              Ready for Harvest
            </div>
            <div className="mt-2 text-2xl font-semibold text-red-600">
              {analytics.harvestReadyCages}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Maintenance</div>
            <div className="mt-2 text-2xl font-semibold text-yellow-600">
              {analytics.maintenanceCages}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Unit status distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Harvest readiness (DOC)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.harvestReadiness}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analyticsData.harvestReadiness.map((entry, index) => (
                      <Cell key={`h-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="ready_to_harvest">Ready for Harvest</option>
                <option value="harvested">Harvested</option>
                <option value="fallow">Fallow</option>
                <option value="empty">Empty</option>
              </select>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DOC Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size (area)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min m²"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max m²"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Installation Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <DataTable
            data={filteredCages}
            columns={columns}
            pagination={false}
            loading={false}
            searchable={true}
            filterable={true}
            sortable={true}
            emptyMessage="No units found for this farm."
          />
        </div>
      </div>
    </div>
  )
}
