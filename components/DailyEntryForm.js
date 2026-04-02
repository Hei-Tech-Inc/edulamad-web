// DailyEntryForm — Nsuo POST /units/:unitId/daily-records (requires active stock cycle)
import React, { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import { normalizeDailyRecordList } from '@/hooks/units/useDailyRecords'
import { fetchActiveCycleIdForUnit } from '@/lib/unit-cycles-api'

const FEED_TYPE_SUGGESTIONS = [
  'floating pellet 2mm',
  'floating pellet 3mm',
  'floating pellet 4mm',
  'sinking pellet',
  'crumble starter',
]

const DailyEntryForm = ({ cage }) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    feed_amount: '',
    feed_type: '',
    feed_price: '1.50',
    mortality: '0',
    notes: '',
  })
  const [recentRecords, setRecentRecords] = useState([])
  const [activeCycleId, setActiveCycleId] = useState(null)
  const [cycleLoading, setCycleLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const reloadRecent = useCallback(async () => {
    if (!cage?.id) return
    const { data: raw } = await apiClient.get(API.units.dailyRecords(cage.id), {
      params: { limit: 10 },
    })
    const rows = normalizeDailyRecordList(raw)
    setRecentRecords(rows)
    return rows
  }, [cage?.id])

  useEffect(() => {
    if (!cage?.id) {
      setLoading(false)
      setCycleLoading(false)
      setActiveCycleId(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setCycleLoading(true)
    setError('')
    setMessage('')
    setFormData({
      date: new Date().toISOString().split('T')[0],
      feed_amount: '',
      feed_type: '',
      feed_price: '1.50',
      mortality: '0',
      notes: '',
    })

    async function load() {
      try {
        const cycleId = await fetchActiveCycleIdForUnit(cage.id)
        if (cancelled) return
        setActiveCycleId(cycleId)

        const rows = await reloadRecent()
        if (cancelled) return

        if (rows?.length > 0) {
          const last = rows[0]
          const lastType = last.feedType || last.feed_type || ''
          const lastCost =
            last.feedCostGhs != null && last.feedQuantityKg > 0
              ? (
                  Number(last.feedCostGhs) / Number(last.feedQuantityKg)
                ).toFixed(2)
              : '1.50'
          setFormData((prev) => ({
            ...prev,
            feed_price: lastCost,
            feed_type: lastType || prev.feed_type,
          }))
        } else if (FEED_TYPE_SUGGESTIONS.length > 0) {
          setFormData((prev) => ({
            ...prev,
            feed_type: FEED_TYPE_SUGGESTIONS[0],
          }))
        }
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load unit data: ' + (e?.message || String(e)))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setCycleLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [cage?.id, reloadRecent])

  if (!cage) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <p className="text-center text-gray-600">Please select a cage first</p>
      </div>
    )
  }

  const stockingAnchor = cage.stocking_date || cage.installation_date

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'date' && stockingAnchor) {
        const selectedDate = new Date(value)
        const anchor = new Date(stockingAnchor)
        if (selectedDate < anchor) {
          setError(
            `Cannot enter data before reference date (${stockingAnchor}).`,
          )
          return prev
        }
        setError('')
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (!activeCycleId) {
        throw new Error(
          'No active stock cycle for this unit. Start a cycle in Nsuo before daily records.',
        )
      }
      if (!formData.feed_amount || parseFloat(formData.feed_amount) <= 0) {
        throw new Error('Please enter a valid feed amount')
      }
      if (!formData.feed_price || parseFloat(formData.feed_price) <= 0) {
        throw new Error('Please enter a valid feed price per kg')
      }
      if (!formData.feed_type?.trim()) {
        throw new Error('Please enter a feed type (e.g. pellet size)')
      }

      if (stockingAnchor) {
        const selectedDate = new Date(formData.date)
        if (selectedDate < new Date(stockingAnchor)) {
          throw new Error(
            `Cannot enter data before reference date (${stockingAnchor}).`,
          )
        }
      }

      const rowsForDay = await apiClient
        .get(API.units.dailyRecords(cage.id), {
          params: { from: formData.date, to: formData.date, limit: 20 },
        })
        .then((r) => normalizeDailyRecordList(r.data))
      if (rowsForDay.length > 0) {
        throw new Error(
          'A record already exists for this date. Pick another date or update via Nsuo.',
        )
      }

      const calculatedFeedCost = calculateFeedCost()
      await apiClient.post(API.units.dailyRecords(cage.id), {
        date: formData.date,
        feedType: formData.feed_type.trim(),
        feedQuantityKg: parseFloat(formData.feed_amount),
        cycleId: activeCycleId,
        feedCostGhs: parseFloat(calculatedFeedCost),
        mortalityCount: parseInt(formData.mortality, 10) || 0,
        notes: formData.notes?.trim() || undefined,
        source: 'web',
      })

      setMessage('Record saved successfully!')
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyRecords.all })
      await reloadRecent()

      setFormData({
        date: formData.date,
        feed_amount: '',
        feed_type: formData.feed_type,
        feed_price: formData.feed_price,
        mortality: '0',
        notes: '',
      })
    } catch (err) {
      console.error('Error saving record:', err)
      setError(err?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateFeedCost = () => {
    if (!formData.feed_amount || !formData.feed_price) return 0
    const amount = parseFloat(formData.feed_amount)
    const price = parseFloat(formData.feed_price)
    return (amount * price).toFixed(2)
  }

  const feedCost = calculateFeedCost()

  const getFeedTypeName = (record) => {
    if (record.feed_types?.name) return record.feed_types.name
    return record.feedType || record.feed_type || '—'
  }

  const displayCost = (record) => {
    const c = record.feed_cost ?? record.feedCostGhs
    if (c == null) return '—'
    return `GHS ${Number(c).toFixed(2)}`
  }

  const displayAmount = (record) =>
    record.feed_amount ?? record.feedQuantityKg ?? '—'

  const displayMortality = (record) =>
    record.mortality ?? record.mortalityCount ?? '—'

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const titleRef = cage.code || cage.id?.slice(0, 8) || cage.id

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-700">
          Daily Data Entry — {cage.name}{' '}
          <span className="text-xs text-gray-500">({titleRef})</span>
        </h2>
        <div className="text-xs text-gray-500">
          Location: {cage.location || 'N/A'} |{' '}
          {!cycleLoading && !activeCycleId && (
            <span className="text-amber-700 font-medium">
              No active cycle — daily records are disabled until a stock cycle
              exists.
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 text-red-800 p-4 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-50 text-green-800 p-4 rounded-md">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Amount (kg)
              </label>
              <input
                type="number"
                name="feed_amount"
                value={formData.feed_amount}
                onChange={handleChange}
                step="0.1"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed type
              </label>
              <input
                type="text"
                name="feed_type"
                value={formData.feed_type}
                onChange={handleChange}
                list="feed-type-suggestions"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. floating pellet 2mm"
                required
              />
              <datalist id="feed-type-suggestions">
                {FEED_TYPE_SUGGESTIONS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Price/kg (GHS)
              </label>
              <input
                type="number"
                name="feed_price"
                value={formData.feed_price}
                onChange={handleChange}
                step="0.01"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Cost (GHS)
              </label>
              <input
                type="text"
                value={feedCost}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none sm:text-sm"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mortality (fish count)
              </label>
              <input
                type="number"
                name="mortality"
                value={formData.mortality}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="0"
                required
              />
            </div>
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
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || !activeCycleId}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                submitting || !activeCycleId
                  ? 'bg-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {submitting ? 'Saving...' : 'Save Daily Record'}
            </button>
          </div>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Recent Daily Records
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feed (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feed type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mortality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {displayAmount(record)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFeedTypeName(record)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {displayCost(record)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {displayMortality(record)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recent records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DailyEntryForm
