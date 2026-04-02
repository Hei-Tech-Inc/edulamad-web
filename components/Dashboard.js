// components/Dashboard.js — units + series from Nsuo API (legacy stockings list stubbed)
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Calculator, Scale, AlertTriangle, Droplets, Plus, 
  TrendingUp, Calendar, DollarSign, Percent, 
  ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Thermometer, Water, Wind, Sun
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  SparkLine
} from 'recharts'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import {
  fetchLegacyUnitsForFarm,
  enrichLegacyUnitsWithSummaries,
} from '@/lib/cages-redux-api'
import { normalizeDailyRecordList } from '@/hooks/units/useDailyRecords'
import BiweeklyForm from './BiweeklyForm'
import HarvestForm from './HarvestForm'
import DailyEntryForm from './DailyEntryForm'
import Pagination from './Pagination'
import DataTable from './DataTable'

function Dashboard({ selectedCage }) {
  const router = useRouter()
  const [cages, setCages] = useState([])
  const [dailyRecords, setDailyRecords] = useState([])
  const [biweeklyRecords, setBiweeklyRecords] = useState([])
  const [recentStockings, setRecentStockings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    totalActiveCages: 0,
    totalBiomass: 0,
    averageFCR: 'N/A',
    mortalityRate: 'N/A',
    totalRecordedLosses: 0,
    avgDailyGrowth: 'N/A',
    daysToHarvest: 'N/A',
    feedCostPerKg: 'N/A',
    survivalRate: 'N/A',
  })
  const [harvestFcrValues, setHarvestFcrValues] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    charts: true,
    stockings: true
  })
  const [timeRange, setTimeRange] = useState('30d') // '7d', '30d', '90d', '1y'
  const [waterQualityData, setWaterQualityData] = useState([])

  // Load units for active farm (same source as Cages / Redux)
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const farmId = await resolveFarmIdForRedux()
        if (!farmId) {
          setCages([])
          setRecentStockings([])
          setWaterQualityData([])
          return
        }
        let { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
        legacy = await enrichLegacyUnitsWithSummaries(farmId, legacy, {
          maxUnits: 30,
          concurrency: 5,
        })
        setCages(legacy)
        setRecentStockings([])

        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 120)
        const from = start.toISOString().slice(0, 10)
        const to = end.toISOString().slice(0, 10)
        try {
          const chartRows = []
          for (let page = 1; ; page++) {
            const { data: raw } = await apiClient.get(
              API.farms.weatherObservations(farmId),
              { params: { from, to, limit: 100, page } },
            )
            const items = Array.isArray(raw) ? raw : raw?.items ?? []
            for (const o of items) {
              const ymd = String(o.observedDate ?? '').slice(0, 10)
              chartRows.push({
                sortKey: ymd,
                date: ymd
                  ? new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                    })
                  : '—',
                rainfall:
                  o.rainfallEstimateMm != null
                    ? Number(o.rainfallEstimateMm)
                    : 0,
                waterLevelIdx:
                  o.waterLevelChange === 'risen'
                    ? 1
                    : o.waterLevelChange === 'fallen'
                    ? -1
                    : 0,
              })
            }
            if (items.length < 100) break
          }
          chartRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
          setWaterQualityData(
            chartRows.map(({ sortKey, ...row }) => row),
          )
        } catch {
          setWaterQualityData([])
        }
      } catch (error) {
        console.error('Error fetching data:', error.message)
        setError(error.message)
        setCages([])
        setWaterQualityData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Per-unit daily + weight samples for charts (cap parallel requests)
  useEffect(() => {
    let cancelled = false

    async function loadSeries() {
      if (!cages.length) {
        setDailyRecords([])
        setBiweeklyRecords([])
        return
      }
      const active = cages
        .filter(
          (c) => c.status === 'active' || c.status === 'ready_to_harvest',
        )
        .slice(0, 25)

      const dailyNested = await Promise.all(
        active.map(async (cage) => {
          try {
            const { data } = await apiClient.get(
              API.units.dailyRecords(cage.id),
              { params: { limit: 150 } },
            )
            return normalizeDailyRecordList(data).map((r) => ({
              cage_id: cage.id,
              date: r.date,
              feed_amount: Number(r.feedQuantityKg ?? 0),
              feed_cost:
                r.feedCostGhs != null ? Number(r.feedCostGhs) : 0,
              mortality: Number(r.mortalityCount ?? 0),
            }))
          } catch {
            return []
          }
        }),
      )

      const weightNested = await Promise.all(
        active.map(async (cage) => {
          try {
            const { data } = await apiClient.get(
              API.units.weightSamples(cage.id),
              { params: { limit: 80 } },
            )
            const rows = Array.isArray(data) ? data : data?.items ?? []
            return rows.map((w) => {
              const raw = w.sampledAt || ''
              const dateStr =
                raw.length >= 10
                  ? raw.slice(0, 10)
                  : raw.split('T')[0] || ''
              return {
                cage_id: cage.id,
                date: dateStr,
                average_body_weight: Number(w.avgWeightG ?? 0),
              }
            })
          } catch {
            return []
          }
        }),
      )

      const harvestFcrNested = await Promise.all(
        active.map(async (cage) => {
          try {
            const { data } = await apiClient.get(API.units.harvests(cage.id), {
              params: { limit: 40, page: 1 },
            })
            const rows = Array.isArray(data) ? data : data?.items ?? []
            return rows
              .map((h) => Number(h.fcr))
              .filter((n) => Number.isFinite(n) && n > 0)
          } catch {
            return []
          }
        }),
      )

      if (cancelled) return
      setDailyRecords(dailyNested.flat())
      setBiweeklyRecords(weightNested.flat())
      setHarvestFcrValues(harvestFcrNested.flat())
    }

    loadSeries()
    return () => {
      cancelled = true
    }
  }, [cages])

  useEffect(() => {
    if (!cages.length) return
    updateDashboardMetrics(cages, recentStockings)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateDashboardMetrics is defined below; deps already cover its closure inputs
  }, [cages, dailyRecords, biweeklyRecords, recentStockings, harvestFcrValues])

  // Optional: narrow series to one unit when parent passes selectedCage (legacy)
  useEffect(() => {
    async function fetchCageSpecificData() {
      if (!selectedCage) return

      try {
        const { data: dailyRaw } = await apiClient.get(
          API.units.dailyRecords(selectedCage),
          { params: { limit: 200 } },
        )
        const dailyData = normalizeDailyRecordList(dailyRaw).map((r) => ({
          cage_id: selectedCage,
          date: r.date,
          feed_amount: Number(r.feedQuantityKg ?? 0),
          feed_cost:
            r.feedCostGhs != null ? Number(r.feedCostGhs) : 0,
          mortality: Number(r.mortalityCount ?? 0),
        }))
        setDailyRecords(dailyData)

        const { data: weightRaw } = await apiClient.get(
          API.units.weightSamples(selectedCage),
          { params: { limit: 100 } },
        )
        const rows = Array.isArray(weightRaw)
          ? weightRaw
          : weightRaw?.items ?? []
        const biweeklyData = rows.map((w) => {
          const raw = w.sampledAt || ''
          const dateStr =
            raw.length >= 10 ? raw.slice(0, 10) : raw.split('T')[0] || ''
          return {
            cage_id: selectedCage,
            date: dateStr,
            average_body_weight: Number(w.avgWeightG ?? 0),
          }
        })
        setBiweeklyRecords(biweeklyData)
      } catch (error) {
        console.error(
          `Error fetching data for cage ${selectedCage}:`,
          error.message,
        )
      }
    }

    fetchCageSpecificData()
  }, [selectedCage])

  // Calculate dashboard metrics
  const updateDashboardMetrics = (cages, stockings) => {
    if (!cages || cages.length === 0) return

    // Calculate total active cages
    const activeCages = cages.filter((cage) => cage.status === 'active')

    // Use most recent stockings for each active cage
    const recentStockingsMap = {}
    activeCages.forEach((cage) => {
      const cageStockings = stockings
        .filter((stocking) => stocking.cage_id === cage.id)
        .sort((a, b) => new Date(b.stocking_date) - new Date(a.stocking_date))

      if (cageStockings.length > 0) {
        recentStockingsMap[cage.id] = cageStockings[0]
      }
    })

    // Total biomass: legacy stockings map, else unit summaries / count × weight
    let totalBiomass = 0
    if (Object.keys(recentStockingsMap).length > 0) {
      Object.values(recentStockingsMap).forEach((stocking) => {
        totalBiomass += stocking.initial_biomass || 0
      })
    } else {
      activeCages.forEach((c) => {
        const fromSummary = Number(c.summaryBiomassKg) || 0
        if (fromSummary > 0) {
          totalBiomass += fromSummary
          return
        }
        const cnt = Number(c.current_count) || 0
        const wG = Number(c.current_weight) || 0
        if (cnt > 0 && wG > 0) totalBiomass += (cnt * wG) / 1000
      })
    }

    const totalLosses = (dailyRecords || []).reduce(
      (s, r) => s + (Number(r.mortality) || 0),
      0,
    )

    setMetrics({
      totalActiveCages: activeCages.length,
      totalBiomass: Math.round(totalBiomass),
      averageFCR: calculateAverageFCR(harvestFcrValues),
      mortalityRate: calculateMortalityRate(cages, dailyRecords),
      totalRecordedLosses: totalLosses,
      avgDailyGrowth: calculateAvgDailyGrowth(cages, dailyRecords, biweeklyRecords),
      daysToHarvest: calculateDaysToHarvest(cages, dailyRecords, biweeklyRecords),
      feedCostPerKg: calculateFeedCostPerKg(cages, dailyRecords, biweeklyRecords),
      survivalRate: calculateSurvivalRate(cages, dailyRecords),
    })
  }

  const calculateAverageFCR = (fcrs) => {
    if (!fcrs || fcrs.length === 0) return 'N/A'
    const mean = fcrs.reduce((a, b) => a + b, 0) / fcrs.length
    return mean.toFixed(2)
  }

  /** % of starting headcount when units expose initial_count; otherwise N/A. */
  const calculateMortalityRate = (cages, dailyRecords) => {
    const active = (cages || []).filter(
      (c) => c.status === 'active' || c.status === 'ready_to_harvest',
    )
    let headcount = 0
    active.forEach((c) => {
      headcount += Number(c.initial_count) || 0
    })
    const mort = (dailyRecords || []).reduce(
      (s, r) => s + (Number(r.mortality) || 0),
      0
    )
    if (headcount <= 0) return 'N/A'
    return ((mort / headcount) * 100).toFixed(1)
  }

  // Helper function to calculate average daily growth
  const calculateAvgDailyGrowth = (cages, dailyRecords, biweeklyRecords) => {
    if (!biweeklyRecords || biweeklyRecords.length < 2) return 'N/A'

    let totalGrowth = 0
    let count = 0

    // Group records by cage
    const cageRecords = {}
    biweeklyRecords.forEach(record => {
      if (!cageRecords[record.cage_id]) {
        cageRecords[record.cage_id] = []
      }
      cageRecords[record.cage_id].push(record)
    })

    // Calculate growth rate for each cage
    Object.values(cageRecords).forEach(records => {
      if (records.length >= 2) {
        // Sort by date
        records.sort((a, b) => new Date(a.date) - new Date(b.date))
        
        // Calculate growth between first and last record
        const firstRecord = records[0]
        const lastRecord = records[records.length - 1]
        const daysDiff = Math.floor((new Date(lastRecord.date) - new Date(firstRecord.date)) / (1000 * 60 * 60 * 24))
        
        if (daysDiff > 0) {
          const growth = lastRecord.average_body_weight - firstRecord.average_body_weight
          const dailyGrowth = growth / daysDiff
          totalGrowth += dailyGrowth
          count++
        }
      }
    })

    return count > 0 ? (totalGrowth / count).toFixed(1) : 'N/A'
  }

  // Helper function to calculate days to harvest
  const calculateDaysToHarvest = (cages, dailyRecords, biweeklyRecords) => {
    if (!biweeklyRecords || biweeklyRecords.length < 2) return 'N/A'

    const targetWeight = 500 // Target harvest weight in grams
    const avgGrowth = parseFloat(calculateAvgDailyGrowth(cages, dailyRecords, biweeklyRecords))
    
    if (avgGrowth === 'N/A' || avgGrowth <= 0) return 'N/A'

    // Get current average weight
    const currentWeight = biweeklyRecords.reduce((sum, record) => sum + record.average_body_weight, 0) / biweeklyRecords.length
    
    const remainingGrowth = targetWeight - currentWeight
    const daysToHarvest = Math.ceil(remainingGrowth / avgGrowth)

    return daysToHarvest > 0 ? daysToHarvest : 'N/A'
  }

  // Helper function to calculate feed cost per kg
  const calculateFeedCostPerKg = (cages, dailyRecords, biweeklyRecords) => {
    if (!dailyRecords || dailyRecords.length === 0) return 'N/A'

    let totalFeedCostGhs = 0
    let totalFeedAmount = 0

    dailyRecords.forEach((record) => {
      const kg = Number(record.feed_amount) || 0
      const cost = Number(record.feed_cost) || 0
      if (kg > 0) {
        totalFeedAmount += kg
      }
      if (cost > 0) {
        totalFeedCostGhs += cost
      }
    })

    if (totalFeedAmount === 0 || totalFeedCostGhs === 0) return 'N/A'

    return (totalFeedCostGhs / totalFeedAmount).toFixed(2)
  }

  // Helper function to calculate survival rate
  const calculateSurvivalRate = (cages, dailyRecords) => {
    if (!cages || cages.length === 0) return 'N/A'

    let totalInitialCount = 0
    let totalMortality = 0

    cages.forEach(cage => {
      if (cage.status === 'active') {
        totalInitialCount += cage.initial_count || 0
        
        // Sum up mortalities from daily records
        const cageMortality = dailyRecords
          .filter(record => record.cage_id === cage.id)
          .reduce((sum, record) => sum + (record.mortality || 0), 0)
        
        totalMortality += cageMortality
      }
    })

    if (totalInitialCount === 0) return 'N/A'

    const survivalRate = ((totalInitialCount - totalMortality) / totalInitialCount) * 100
    return survivalRate.toFixed(1)
  }

  // Process growth data for chart
  const prepareGrowthData = () => {
    if (!biweeklyRecords || biweeklyRecords.length === 0) return []

    // Group data by date and cage
    const groupedByDate = {}
    
    biweeklyRecords.forEach((record) => {
      const date = new Date(record.date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      })

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          // Initialize with null values for all cages
          ...cages.reduce((acc, cage) => {
            acc[cage.name] = null
            return acc
          }, {})
        }
      }

      // Find cage name
      const cage = cages.find((c) => c.id === record.cage_id)
      if (cage) {
        groupedByDate[date][cage.name] = record.average_body_weight
      }
    })

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )
  }

  // Process feed data for chart
  const prepareFeedData = () => {
    if (!dailyRecords || dailyRecords.length === 0) return []

    // Group by date and cage
    const groupedByDate = {}
    
    dailyRecords.forEach((record) => {
      const date = new Date(record.date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      })

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          // Initialize with 0 values for all cages
          ...cages.reduce((acc, cage) => {
            acc[cage.name] = 0
            return acc
          }, {})
        }
      }

      // Find cage name
      const cage = cages.find((c) => c.id === record.cage_id)
      if (cage) {
        groupedByDate[date][cage.name] += record.feed_amount || 0
      }
    })

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )
  }

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const growthData = prepareGrowthData()
  const feedData = prepareFeedData()

  // Stock table column definitions
  const stockingColumns = [
    {
      header: 'Batch Number',
      accessor: 'batch_number',
      sortable: true,
      searchable: true,
      cell: (row) => (
        <span className="font-medium text-indigo-600">{row.batch_number}</span>
      ),
    },
    {
      header: 'Cage',
      accessor: 'cage.name',
      sortable: true,
      searchable: true,
    },
    {
      header: 'Stocking Date',
      accessor: 'stocking_date',
      sortable: true,
      cell: (row) => formatDate(row.stocking_date),
    },
    {
      header: 'DOC',
      accessor: 'stocking_date',
      cell: (value) => {
        const stockingDate = new Date(value)
        const today = new Date()
        const doc = Math.floor((today - stockingDate) / (1000 * 60 * 60 * 24))
        return `${doc} days`
      },
    },
    {
      header: 'Initial Count',
      accessor: 'fish_count',
      cell: (value) => value?.toLocaleString() || 'N/A',
    },
    {
      header: 'Initial ABW (g)',
      accessor: 'initial_abw',
      cell: (value) => value?.toFixed(1) || 'N/A',
    },
    {
      header: 'Initial Biomass (kg)',
      accessor: 'initial_biomass',
      cell: (value) => value?.toFixed(1) || 'N/A',
    },
  ]

  const handleViewStocking = (stocking) => {
    router.push(`/stocking/${stocking.id}`)
  }

  // New function to calculate trend
  const calculateTrend = (current, previous) => {
    if (!previous) return { value: 0, direction: 'neutral' }
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    }
  }

  const prepareMortalityData = () => {
    if (!dailyRecords || dailyRecords.length === 0) {
      return []
    }
    const byKey = {}
    dailyRecords.forEach((record) => {
      const label = new Date(record.date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      })
      if (!byKey[label]) {
        byKey[label] = { date: label, mortality: 0, mortalityRate: 0 }
      }
      byKey[label].mortality += Number(record.mortality) || 0
      const pop = Number(
        cages.find((c) => c.id === record.cage_id)?.initial_count,
      )
      if (pop > 0 && record.mortality) {
        byKey[label].mortalityRate +=
          (Number(record.mortality) / pop) * 100
      }
    })
    return Object.values(byKey).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    )
  }

  const prepareFeedEfficiencyData = () => {
    return []
  }

  // New function to prepare biomass projection
  const prepareBiomassProjection = () => {
    if (!biweeklyRecords || biweeklyRecords.length < 2) {
      return []
    }

    const sorted = [...biweeklyRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    const lastRecord = sorted[sorted.length - 1]
    const growthRaw = calculateAvgDailyGrowth(
      cages,
      dailyRecords,
      biweeklyRecords,
    )
    const growthRate =
      growthRaw === 'N/A' ? NaN : parseFloat(String(growthRaw))
    if (!Number.isFinite(growthRate)) return []

    const projection = []
    let currentDate = new Date()
    let currentBiomass = lastRecord.average_body_weight

    for (let i = 0; i < 30; i++) {
      currentDate.setDate(currentDate.getDate() + 1)
      currentBiomass += growthRate

      projection.push({
        date: new Date(currentDate).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
        }),
        projected: currentBiomass,
        target: 500,
      })
    }
    return projection
  }

  // Initialize data
  const mortalityData = prepareMortalityData()
  const feedEfficiencyData = prepareFeedEfficiencyData()
  const biomassProjection = prepareBiomassProjection()

  // Add function to generate sparkline data
  const generateSparklineData = (value, trend) => {
    const data = []
    const points = 7
    const safe = Number.isFinite(value) ? value : 0
    const baseValue = safe * 0.85
    const range = Math.max(0.001, safe * 0.15)

    for (let i = 0; i < points; i++) {
      data.push({
        value: baseValue + (range * i) / (points - 1 || 1),
      })
    }

    data.push({ value: safe })
    return data
  }

  // Add color mapping
  const colorMap = {
    blue: '#2563eb',
    red: '#dc2626',
    green: '#16a34a',
    yellow: '#ca8a04',
    purple: '#9333ea',
    indigo: '#4f46e5',
    pink: '#db2777',
    teal: '#0d9488'
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {['7d', '30d', '90d', '1y'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === range
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Summary Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Active Cages',
            value: metrics.totalActiveCages || 0,
            icon: Droplets,
            color: 'blue',
            trend: calculateTrend(metrics.totalActiveCages || 0, 5),
            tooltip: 'Number of currently active fish cages',
            unit: 'cages',
            description: 'Total active production units',
            subtext: `${cages.filter(c => c.status === 'active').length} currently stocked`
          },
          {
            title: 'Total Biomass',
            value: metrics.totalBiomass || 0,
            icon: Scale,
            color: 'green',
            trend: calculateTrend(metrics.totalBiomass || 0, 1000),
            tooltip: 'Total biomass of all fish cages',
            unit: 'kg',
            description: 'Current total fish weight',
            subtext: `Target: ${Math.round((metrics.totalBiomass || 0) * 1.2)} kg`
          },
          {
            title: 'Average FCR',
            value: metrics.averageFCR === 'N/A' ? 0 : parseFloat(metrics.averageFCR),
            icon: Calculator,
            color: 'red',
            trend: calculateTrend(metrics.averageFCR === 'N/A' ? 0 : parseFloat(metrics.averageFCR), 1.5),
            tooltip:
              'Mean FCR from recent harvest records (active sample of units)',
            unit: '',
            description: 'Feed efficiency (harvests)',
            subtext:
              metrics.averageFCR === 'N/A'
                ? 'No harvest FCR in range — record harvests with FCR in Nsuo'
                : 'Target: < 1.5',
          },
          {
            title: 'Mortality Rate',
            value: metrics.mortalityRate === 'N/A' ? 0 : parseFloat(metrics.mortalityRate),
            icon: AlertTriangle,
            color: 'yellow',
            trend: calculateTrend(
              metrics.mortalityRate === 'N/A' ? 0 : parseFloat(metrics.mortalityRate),
              2.5,
            ),
            tooltip:
              metrics.mortalityRate === 'N/A'
                ? 'Needs unit headcount (initial_count) on cages for a %; see losses in subtext'
                : 'Approximate cumulative mortality vs recorded starting headcount',
            unit: '%',
            description:
              metrics.mortalityRate === 'N/A'
                ? 'Recorded losses (daily)'
                : 'Cumulative mortality vs headcount',
            subtext:
              metrics.mortalityRate === 'N/A'
                ? `${metrics.totalRecordedLosses || 0} fish in daily records — wire cycle stocking counts for %`
                : 'Target: < 2%',
          },
          {
            title: 'Avg. Daily Growth',
            value: metrics.avgDailyGrowth === 'N/A' ? 0 : parseFloat(metrics.avgDailyGrowth),
            icon: TrendingUp,
            color: 'purple',
            trend: calculateTrend(metrics.avgDailyGrowth === 'N/A' ? 0 : parseFloat(metrics.avgDailyGrowth), 1),
            tooltip: 'Average daily weight gain',
            unit: 'g/day',
            description: 'Daily growth rate',
            subtext: 'Target: > 2g/day'
          },
          {
            title: 'Days to Harvest',
            value: metrics.daysToHarvest === 'N/A' ? 0 : parseFloat(metrics.daysToHarvest),
            icon: Calendar,
            color: 'indigo',
            trend: calculateTrend(metrics.daysToHarvest === 'N/A' ? 0 : parseFloat(metrics.daysToHarvest), 10),
            tooltip: 'Time until fish are ready for harvest',
            unit: 'days',
            description: 'Time to target weight',
            subtext: 'Target: 180 days'
          },
          {
            title: 'Feed Cost/kg',
            value: metrics.feedCostPerKg === 'N/A' ? 0 : parseFloat(metrics.feedCostPerKg),
            icon: DollarSign,
            color: 'pink',
            trend: calculateTrend(metrics.feedCostPerKg === 'N/A' ? 0 : parseFloat(metrics.feedCostPerKg), 0.1),
            tooltip: 'Cost of feed per kilogram of fish',
            unit: '₵',
            description: 'Feed cost efficiency',
            subtext: 'Budget: ₵1.50/kg'
          },
          {
            title: 'Survival Rate',
            value: metrics.survivalRate === 'N/A' ? 0 : parseFloat(metrics.survivalRate),
            icon: Percent,
            color: 'teal',
            trend: calculateTrend(metrics.survivalRate === 'N/A' ? 0 : parseFloat(metrics.survivalRate), 50),
            tooltip: 'Percentage of fish that survive',
            unit: '%',
            description: 'Overall survival rate',
            subtext: 'Target: > 95%'
          },
        ].map((metric, index) => {
          const sparklineData = generateSparklineData(
            parseFloat(metric.value) || 0,
            metric.trend
          )
          
          return (
            <div
              key={index}
              className={`bg-${metric.color}-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-${metric.color}-100`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100 mr-3`}>
                      <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {metric.unit === '₵' ? metric.unit : ''}{metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                          {metric.unit !== '₵' ? ` ${metric.unit}` : ''}
                        </p>
                        {metric.trend && metric.trend.value > 0 && (
                          <span className={`ml-2 text-sm flex items-center ${
                            metric.trend.direction === 'up' ? 'text-green-600' : 
                            metric.trend.direction === 'down' ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {metric.trend.direction === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                             metric.trend.direction === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : 
                             ''}
                            {metric.trend.value}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mini sparkline chart */}
                <div className="h-10 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={colorMap[metric.color]}
                        strokeWidth={2}
                        dot={false}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Description and subtext */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">{metric.subtext}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Performance Analytics</h2>
          <button
            onClick={() => setExpandedSections(prev => ({...prev, charts: !prev.charts}))}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.charts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Performance Chart */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Growth Performance</h3>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={growthData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Weight (g)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} g`, 'Weight']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      {cages.filter(cage => cage.status === 'active').map((cage, index) => {
                        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
                        return (
                          <Line
                            key={cage.id}
                            type="monotone"
                            dataKey={cage.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        )
                      })}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No growth data available
                  </div>
                )}
              </div>
            </div>

            {/* Feed Consumption Chart */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Feed Consumption</h3>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : feedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={feedData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Feed Amount (kg)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} kg`, 'Feed Amount']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      {cages.filter(cage => cage.status === 'active').map((cage, index) => {
                        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
                        return (
                          <Bar
                            key={cage.id}
                            dataKey={cage.name}
                            fill={colors[index % colors.length]}
                            stackId="feed"
                          />
                        )
                      })}
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No feed data available
                  </div>
                )}
              </div>
            </div>

            {/* Mortality Trend Chart */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Mortality Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mortalityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="mortality"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="mortalityRate"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feed Efficiency Chart */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Feed Efficiency (FCR)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={feedEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="fcr"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Biomass Projection Chart */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Biomass Projection</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={biomassProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weather observations (farm-level, Nsuo API) */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Farm weather observations
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Rainfall (mm) and water-level trend (+1 risen, 0 stable, −1
                fallen) from the last ~120 days.
              </p>
              <div className="h-64">
                {waterQualityData.length === 0 ? (
                  <p className="text-sm text-gray-500 flex items-center justify-center h-full">
                    No weather observations in range — record them in Nsuo for
                    this farm.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={waterQualityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#2563eb"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#16a34a"
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        name="Rainfall (mm)"
                        type="monotone"
                        dataKey="rainfall"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        name="Water level Δ"
                        type="monotone"
                        dataKey="waterLevelIdx"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={false}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Stockings Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-medium text-gray-700">Recent Stockings</h2>
          <div className="flex items-center space-x-4">
            <Link href="/stocking-management">
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                View All Stockings
              </button>
            </Link>
            <button
              onClick={() => setExpandedSections(prev => ({...prev, stockings: !prev.stockings}))}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.stockings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {expandedSections.stockings && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cage
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stocking Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    DOC
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Initial Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Initial ABW (g)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Initial Biomass (kg)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cages.map((cage) => {
                  const anchor = cage.stocking_date || cage.installation_date
                  const today = new Date()
                  const doc = anchor
                    ? Math.floor(
                        (today - new Date(anchor)) / (1000 * 60 * 60 * 24),
                      )
                    : null

                  return (
                    <tr key={cage.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cage.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {anchor
                          ? new Date(anchor).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc != null ? `${doc} days` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cage.initial_count?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cage.initial_abw != null
                          ? Number(cage.initial_abw).toFixed(1)
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cage.initial_biomass != null
                          ? Number(cage.initial_biomass).toFixed(1)
                          : 'N/A'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/create-cage">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Cage
          </button>
        </Link>

        <Link href="/stocking">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Stocking
          </button>
        </Link>

        <Link href="/biweekly-records">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Scale className="w-4 h-4 mr-2" />
            View Bi-weekly Records
          </button>
        </Link>

        <Link href="/feed-types">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Manage Feed Types
          </button>
        </Link>

        <Link href="/feed-suppliers">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Manage Feed Suppliers
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard