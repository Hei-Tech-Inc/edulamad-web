// DailyEntryForm — Nsuo POST /units/:unitId/daily-records (requires active stock cycle)
import React, { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import { normalizeDailyRecordList } from '@/hooks/units/useDailyRecords'
import { fetchActiveCycleIdForUnit } from '@/lib/unit-cycles-api'
import posthog from 'posthog-js'

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
      <div className="rounded border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Please select a cage first
        </p>
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

      posthog.capture('daily_entry_submitted', {
        cage_id: cage.id,
        record_date: formData.date,
        feed_amount_kg: parseFloat(formData.feed_amount),
        feed_type: formData.feed_type.trim(),
        mortality_count: parseInt(formData.mortality, 10) || 0,
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
      posthog.captureException(err)
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
      <div className="rounded border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-32 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600 dark:border-slate-700 dark:border-t-sky-500" />
          <p className="ml-3 text-sm text-slate-600 dark:text-slate-400">
            Loading…
          </p>
        </div>
      </div>
    )
  }

  const titleRef = cage.code || cage.id?.slice(0, 8) || cage.id

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Daily data entry — {cage.name}{' '}
          <span className="text-xs font-normal text-slate-500">({titleRef})</span>
        </h2>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Location: {cage.location || 'N/A'} |{' '}
          {!cycleLoading && !activeCycleId && (
            <span className="font-medium text-amber-800 dark:text-amber-400">
              No active cycle — daily records are disabled until a stock cycle
              exists.
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-950"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Feed Amount (kg)
              </label>
              <input
                type="number"
                name="feed_amount"
                value={formData.feed_amount}
                onChange={handleChange}
                step="0.1"
                className="block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-950"
                placeholder="0.0"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Feed type
              </label>
              <input
                type="text"
                name="feed_type"
                value={formData.feed_type}
                onChange={handleChange}
                list="feed-type-suggestions"
                className="block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-950"
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
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Feed Price/kg (GHS)
              </label>
              <input
                type="number"
                name="feed_price"
                value={formData.feed_price}
                onChange={handleChange}
                step="0.01"
                className="block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-950"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Feed Cost (GHS)
              </label>
              <input
                type="text"
                value={feedCost}
                className="block w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Mortality (fish count)
              </label>
              <input
                type="number"
                name="mortality"
                value={formData.mortality}
                onChange={handleChange}
                className="block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-950"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-950"
              placeholder="Optional notes"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || !activeCycleId}
              className={`flex w-full justify-center rounded border border-transparent px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                submitting || !activeCycleId
                  ? 'bg-slate-400 dark:bg-slate-600'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-sky-700 dark:hover:bg-sky-800'
              } `}
            >
              {submitting ? 'Saving...' : 'Save Daily Record'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Recent daily records
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Feed (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Feed type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Mortality
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {record.date}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {displayAmount(record)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {getFeedTypeName(record)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {displayCost(record)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {displayMortality(record)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-slate-500"
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
