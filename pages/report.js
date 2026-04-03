// pages/reports.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, BarChart, Download, Printer } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api'
import { useUiStore } from '@/stores/ui.store'
import { buildFarmReport } from '@/lib/farm-report-summary'

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  )
}

function Reports() {
  const activeFarmId = useUiStore((s) => s.activeFarmId)
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('production')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [cages, setCages] = useState([])
  const [selectedCages, setSelectedCages] = useState([])
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setSelectedCages([])
  }, [activeFarmId])

  // Fetch units for the active farm (refetch when user switches farm)
  useEffect(() => {
    let cancelled = false

    async function fetchCages() {
      try {
        const farmId = activeFarmId || (await resolveFarmIdForRedux())
        if (cancelled) return
        if (!farmId) {
          throw new Error(
            'No farm selected. Choose a farm in the app or ensure you have farm access.',
          )
        }
        const { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
        if (cancelled) return
        const sorted = [...legacy].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        )
        setCages(
          sorted.map((u) => ({ id: u.id, name: u.name, status: u.status })),
        )
        setError(null)
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching cages:', err.message)
        setError(err.message)
        setCages([])
      }
    }

    fetchCages()
    return () => {
      cancelled = true
    }
  }, [activeFarmId])

  const handleCageToggle = (cageId) => {
    if (selectedCages.includes(cageId)) {
      setSelectedCages(selectedCages.filter((id) => id !== cageId))
    } else {
      setSelectedCages([...selectedCages, cageId])
    }
  }

  const handleSelectAllCages = () => {
    if (selectedCages.length === cages.length) {
      setSelectedCages([])
    } else {
      setSelectedCages(cages.map((cage) => cage.id))
    }
  }

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    })
  }

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    setReportData(null)

    try {
      if (selectedCages.length === 0) {
        throw new Error('Please select at least one cage')
      }

      if (!dateRange.startDate || !dateRange.endDate) {
        throw new Error('Please select a date range')
      }

      await resolveFarmIdForRedux()

      const unitNameById = Object.fromEntries(
        cages.map((c) => [c.id, c.name]),
      )

      const payload = await buildFarmReport({
        unitIds: selectedCages,
        unitNameById,
        dateRange,
        reportType,
      })
      setReportData(payload)
    } catch (error) {
      console.error('Error generating report:', error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!reportData) return

    const jsonString = JSON.stringify(reportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType}-report-${
      new Date().toISOString().split('T')[0]
    }.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-700">Report Options</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  >
                    <option value="production">Production Summary</option>
                    <option value="feed">Feed Usage</option>
                    <option value="growth">Growth Performance</option>
                    <option value="mortality">Mortality Analysis</option>
                    <option value="financial">Financial Summary</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateRangeChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateRangeChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Cage Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Cages
                  </label>
                  <div className="mt-1 bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={
                          selectedCages.length === cages.length &&
                          cages.length > 0
                        }
                        onChange={handleSelectAllCages}
                        className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="select-all"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Select All
                      </label>
                    </div>
                    <div className="space-y-2">
                      {cages.map((cage) => (
                        <div key={cage.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`cage-${cage.id}`}
                            checked={selectedCages.includes(cage.id)}
                            onChange={() => handleCageToggle(cage.id)}
                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`cage-${cage.id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {cage.name}
                            {cage.status !== 'active' && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({cage.status})
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                      {cages.length === 0 && (
                        <p className="text-sm text-gray-500">No cages found</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div>
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading
                        ? 'bg-sky-400'
                        : 'bg-sky-600 hover:bg-sky-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium text-gray-700">Report Preview</h2>

                {reportData && (
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadReport}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      title="Download Report"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={printReport}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      title="Print Report"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {!reportData ? (
                  <div className="h-96 flex flex-col items-center justify-center text-gray-500">
                    <FileText className="h-12 w-12 mb-4" />
                    <p className="text-lg">
                      Generate a report to see a preview
                    </p>
                    <p className="text-sm mt-2">
                      Select report type, date range, and cages, then click
                      &quot;Generate Report&quot;
                    </p>
                  </div>
                ) : (
                  <div id="report-content" className="space-y-6">
                    {/* Report Header */}
                    <div className="text-center pb-6 border-b border-gray-200">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {reportType === 'production' &&
                          'Production Summary Report'}
                        {reportType === 'feed' && 'Feed Usage Report'}
                        {reportType === 'growth' && 'Growth Performance Report'}
                        {reportType === 'mortality' &&
                          'Mortality Analysis Report'}
                        {reportType === 'financial' &&
                          'Financial Summary Report'}
                      </h1>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(dateRange.startDate).toLocaleDateString()} to{' '}
                        {new Date(dateRange.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Generated:{' '}
                        {new Date(reportData.generatedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Report Content - customize based on report type */}
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600">
                        Figures are aggregated from Nsuo daily records, weight
                        samples, and harvests in the selected date range.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">
                            Total feed (daily records)
                          </p>
                          <p className="text-3xl font-semibold text-blue-600 mt-2">
                            {reportData.data.totalFeedKg.toFixed(1)} kg
                          </p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">
                            Total mortality
                          </p>
                          <p className="text-3xl font-semibold text-rose-600 mt-2">
                            {reportData.data.totalMortality}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">
                            Mean FCR (harvests)
                          </p>
                          <p className="text-3xl font-semibold text-green-600 mt-2">
                            {reportData.data.meanFcr != null
                              ? reportData.data.meanFcr.toFixed(2)
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {reportType === 'feed' && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                          <p className="text-sm font-medium text-amber-900">
                            Feed focus: total{' '}
                            <strong>
                              {reportData.data.totalFeedKg.toFixed(1)} kg
                            </strong>{' '}
                            recorded across{' '}
                            <strong>{reportData.data.dailyRecordCount}</strong>{' '}
                            daily rows.
                          </p>
                        </div>
                      )}

                      {reportType === 'growth' && (
                        <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 text-sm text-sky-950">
                          <p>
                            Weight samples:{' '}
                            <strong>{reportData.data.weightSampleCount}</strong>.
                            ABW min / max:{' '}
                            <strong>
                              {reportData.data.sampleAbwMinG != null
                                ? reportData.data.sampleAbwMinG.toFixed(1)
                                : '—'}
                            </strong>{' '}
                            /{' '}
                            <strong>
                              {reportData.data.sampleAbwMaxG != null
                                ? reportData.data.sampleAbwMaxG.toFixed(1)
                                : '—'}
                            </strong>{' '}
                            g · Range:{' '}
                            <strong>
                              {reportData.data.abwRangeG != null
                                ? reportData.data.abwRangeG.toFixed(1)
                                : '—'}
                            </strong>{' '}
                            g
                          </p>
                        </div>
                      )}

                      {reportType === 'mortality' && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-900">
                          Mortality total:{' '}
                          <strong>{reportData.data.totalMortality}</strong> fish
                          (sum of{' '}
                          <code className="text-xs">mortalityCount</code> on
                          daily records).
                        </div>
                      )}

                      {reportType === 'financial' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800">
                          Feed cost (GHS) from daily records:{' '}
                          <strong>
                            {reportData.data.totalFeedCostGhs.toFixed(2)}
                          </strong>
                          . Harvest weight total:{' '}
                          <strong>
                            {reportData.data.totalHarvestWeightKg.toFixed(1)} kg
                          </strong>
                          .
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Summary metrics
                        </h3>
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-gray-600">
                                Metric
                              </th>
                              <th className="px-4 py-2 text-left text-gray-600">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-2">Daily record rows</td>
                              <td className="px-4 py-2">
                                {reportData.data.dailyRecordCount}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Weight samples</td>
                              <td className="px-4 py-2">
                                {reportData.data.weightSampleCount}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Harvest events</td>
                              <td className="px-4 py-2">
                                {reportData.data.harvestCount}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">
                                Harvest weight total (kg)
                              </td>
                              <td className="px-4 py-2">
                                {reportData.data.totalHarvestWeightKg.toFixed(
                                  2,
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          By unit
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left">Unit</th>
                                <th className="px-3 py-2 text-right">Feed kg</th>
                                <th className="px-3 py-2 text-right">
                                  Mortality
                                </th>
                                <th className="px-3 py-2 text-right">Daily</th>
                                <th className="px-3 py-2 text-right">Samples</th>
                                <th className="px-3 py-2 text-right">
                                  Harvests
                                </th>
                                <th className="px-3 py-2 text-right">
                                  Hv. kg
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {reportData.byUnit.map((u) => (
                                <tr key={u.unitId}>
                                  <td className="px-3 py-2 font-medium text-gray-900">
                                    {u.unitName}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {u.feedKg.toFixed(1)}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {u.mortality}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {u.dailyRows}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {u.samples}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {u.harvests}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {u.harvestWeightKg.toFixed(1)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
