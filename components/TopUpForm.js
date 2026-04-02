// components/TopUpForm.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AlertCircle } from 'lucide-react'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import { useUiStore } from '@/stores/ui.store'
import {
  fetchActiveStockCyclesForTopUp,
  parseCycleSelectValue,
  fetchStockCycleDetail,
  mapCycleToSelectedStockingDisplay,
  appendTopUpNoteToCycle,
  buildTopUpNoteBlock,
} from '@/lib/farm-topup-api'
import { useToast } from './Toast'

const TopUpForm = ({ onComplete }) => {
  const router = useRouter()
  const { showToast } = useToast()
  const activeFarmId = useUiStore((s) => s.activeFarmId)

  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [activeStockings, setActiveStockings] = useState([])
  const [error, setError] = useState('')
  const [selectedStocking, setSelectedStocking] = useState(null)
  const [formData, setFormData] = useState({
    stocking_id: '',
    topup_date: new Date().toISOString().split('T')[0],
    fish_count: '',
    abw: '',
    source_location: '',
    transfer_supervisor: '',
    notes: '',
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setFetchingData(true)
      setError('')
      try {
        const farmId = activeFarmId || (await resolveFarmIdForRedux())
        if (!farmId) {
          if (!cancelled) {
            setError('No farm selected. Choose a farm or check your access.')
            setActiveStockings([])
          }
          return
        }
        const options = await fetchActiveStockCyclesForTopUp(farmId)
        if (!cancelled) setActiveStockings(options)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Failed to load active stock cycles.')
          showToast('Failed to load active stock cycles.', 'error')
          setActiveStockings([])
        }
      } finally {
        if (!cancelled) setFetchingData(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [activeFarmId, showToast])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      stocking_id: '',
    }))
    setSelectedStocking(null)
  }, [activeFarmId])

  useEffect(() => {
    let cancelled = false

    async function loadDetail() {
      const parsed = parseCycleSelectValue(formData.stocking_id)
      if (!parsed) {
        setSelectedStocking(null)
        return
      }
      try {
        const raw = await fetchStockCycleDetail(parsed.unitId, parsed.cycleId)
        if (cancelled) return
        setSelectedStocking(mapCycleToSelectedStockingDisplay(raw))
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setSelectedStocking(null)
          setError('Failed to load cycle details')
          showToast('Failed to load cycle details', 'error')
        }
      }
    }

    if (formData.stocking_id) loadDetail()
    else setSelectedStocking(null)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.stocking_id])

  const calculateBiomass = () => {
    if (!formData.fish_count || !formData.abw) return 0

    const count = parseFloat(formData.fish_count)
    const abw = parseFloat(formData.abw)

    if (isNaN(count) || isNaN(abw)) return 0

    return (abw / 1000) * count
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const parsed = parseCycleSelectValue(formData.stocking_id)
      if (!parsed) {
        throw new Error('Please select a stock cycle to top up')
      }

      if (!formData.fish_count || parseInt(formData.fish_count, 10) <= 0) {
        throw new Error('Please enter a valid fish count')
      }

      if (!formData.abw || parseFloat(formData.abw) <= 0) {
        throw new Error('Please enter a valid average body weight')
      }

      const biomassKg = calculateBiomass()
      const block = buildTopUpNoteBlock({
        topup_date: formData.topup_date,
        fish_count: formData.fish_count,
        abw: formData.abw,
        biomassKg,
        source_location: formData.source_location,
        transfer_supervisor: formData.transfer_supervisor,
        notes: formData.notes,
      })

      await appendTopUpNoteToCycle(parsed.unitId, parsed.cycleId, block, {
        sourceLocation: formData.source_location,
      })

      showToast(
        'Top-up recorded on the stock cycle notes in Nsuo.',
        'success',
      )

      setFormData({
        stocking_id: '',
        topup_date: new Date().toISOString().split('T')[0],
        fish_count: '',
        abw: '',
        source_location: '',
        transfer_supervisor: '',
        notes: '',
      })
      setSelectedStocking(null)

      if (onComplete) {
        onComplete({ unitId: parsed.unitId, cycleId: parsed.cycleId })
      } else {
        router.push('/stocking-management')
      }
    } catch (err) {
      console.error(err)
      const msg = err?.message || 'Failed to record top-up.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-700">Top-up (stock cycle notes)</h2>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active stock cycle <span className="text-red-500">*</span>
            </label>
            {fetchingData ? (
              <div className="flex items-center space-x-2 h-10">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading…</span>
              </div>
            ) : (
              <>
                <select
                  name="stocking_id"
                  value={formData.stocking_id}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  disabled={activeStockings.length === 0}
                >
                  <option value="">Select a cycle</option>
                  {activeStockings.map((row) => (
                    <option key={row.value} value={row.value}>
                      {row.batch_number} — {row.cage.name} —{' '}
                      {row.stocking_date
                        ? new Date(row.stocking_date).toLocaleDateString()
                        : '—'}
                    </option>
                  ))}
                </select>
                {activeStockings.length === 0 && !fetchingData && (
                  <p className="mt-1 text-xs text-red-500">
                    No active stock cycles. Start or approve a cycle in Nsuo
                    first.
                  </p>
                )}
              </>
            )}
          </div>

          {selectedStocking && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Cycle snapshot (initial stocking)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Initial count:</span>{' '}
                  {Number(selectedStocking.fish_count).toLocaleString()} fish
                </div>
                <div>
                  <span className="font-medium">Initial ABW:</span>{' '}
                  {Number(selectedStocking.initial_abw).toFixed(1)} g
                </div>
                <div>
                  <span className="font-medium">Initial biomass:</span>{' '}
                  {Number(selectedStocking.initial_biomass).toFixed(1)} kg
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top-up date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="topup_date"
                value={formData.topup_date}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fish count to add <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fish_count"
                value={formData.fish_count}
                onChange={handleChange}
                min="1"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Number of fish to add"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average body weight (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="abw"
                value={formData.abw}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ABW in grams"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biomass to add (kg)
              </label>
              <input
                type="text"
                value={calculateBiomass().toFixed(2)}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                (ABW / 1000) × fish count
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source location
              </label>
              <input
                type="text"
                name="source_location"
                value={formData.source_location}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Optional — also updates cycle source location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer supervisor
              </label>
              <input
                type="text"
                name="transfer_supervisor"
                value={formData.transfer_supervisor}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Recorded in notes only"
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
              placeholder="Appended to the stock cycle notes together with the top-up block"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/stocking-management')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingData}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || fetchingData
                  ? 'bg-orange-400'
                  : 'bg-orange-600 hover:bg-orange-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              {loading ? 'Saving…' : 'Append top-up to cycle'}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Nsuo has no separate top-up API in this client. The server stores a
            dated block on the cycle&apos;s notes (and may overwrite cycle
            source location if you fill it). Confirm with your team whether
            inventory figures are updated elsewhere.
          </p>
        </form>
      </div>
    </div>
  )
}

export default TopUpForm
