// components/StockingForm.js
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api'
import { useUiStore } from '@/stores/ui.store'
import { fetchAllStockCyclesForUnit } from '@/lib/unit-cycles-api'
import { buildCreateStockCycleBody } from '@/lib/build-create-stock-cycle-payload'
import posthog from 'posthog-js'

function isAvailableForStocking(unit) {
  const s = (unit.status || '').toLowerCase()
  if (s === 'active' || s === 'ready_to_harvest') return false
  return true
}

const StockingForm = () => {
  const router = useRouter()
  const activeFarmId = useUiStore((s) => s.activeFarmId)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [availableCages, setAvailableCages] = useState([])
  const [allCages, setAllCages] = useState([])
  const [formData, setFormData] = useState({
    cageId: '',
    species: 'tilapia_nile',
    sourceName: '',
    batchNumber: '',
    stockingDate: new Date().toISOString().split('T')[0],
    fishCount: '',
    initialABW: '',
    initialBiomass: '',
    sourceLocation: '',
    sourceCage: '',
    transferSupervisor: '',
    samplingSupervisor: '',
  })

  useEffect(() => {
    let cancelled = false

    async function loadCages() {
      setFetchingData(true)
      setError('')
      try {
        const farmId = activeFarmId || (await resolveFarmIdForRedux())
        if (!farmId) {
          if (!cancelled) {
            setError('No farm selected. Choose a farm or check your access.')
            setAllCages([])
            setAvailableCages([])
          }
          return
        }

        const { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
        const mapped = legacy
          .map((u) => ({ id: u.id, name: u.name, status: u.status }))
          .sort((a, b) => a.name.localeCompare(b.name))

        if (cancelled) return
        setAllCages(mapped)
        setAvailableCages(mapped.filter(isAvailableForStocking))
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Failed to load pond list. Please try again.')
          setAllCages([])
          setAvailableCages([])
        }
      } finally {
        if (!cancelled) setFetchingData(false)
      }
    }

    loadCages()
    return () => {
      cancelled = true
    }
  }, [activeFarmId])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      cageId: '',
      batchNumber: '',
    }))
  }, [activeFarmId])

  useEffect(() => {
    if (formData.fishCount && formData.initialABW) {
      const count = parseFloat(formData.fishCount)
      const abw = parseFloat(formData.initialABW)

      if (!isNaN(count) && !isNaN(abw)) {
        const biomass = (abw / 1000) * count
        setFormData((prev) => ({
          ...prev,
          initialBiomass: biomass.toFixed(2),
        }))
      }
    }
  }, [formData.fishCount, formData.initialABW])

  const handleCageSelect = (cageId) => {
    setFormData((prev) => ({
      ...prev,
      cageId,
      batchNumber: cageId ? prev.batchNumber : '',
    }))
    if (!cageId) return

    const selectedCage = allCages.find((c) => c.id === cageId)
    if (!selectedCage) return

    ;(async () => {
      let countThisYear = 0
      try {
        const cycles = await fetchAllStockCyclesForUnit(cageId)
        const y = new Date().getFullYear()
        countThisYear = cycles.filter((c) => {
          const raw = c.stockingDate ?? c.stocking_date ?? ''
          if (!raw) return false
          return new Date(String(raw)).getFullYear() === y
        }).length
      } catch {
        countThisYear = 0
      }
      const yy = String(new Date().getFullYear()).slice(-2)
      const batchNumber = `${selectedCage.name}/${countThisYear + 1}${yy}`
      setFormData((prev) =>
        prev.cageId === cageId ? { ...prev, batchNumber } : prev,
      )
    })()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const reloadCagesAfterStock = async () => {
    try {
      const farmId = activeFarmId || (await resolveFarmIdForRedux())
      if (!farmId) return
      const { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
      const mapped = legacy
        .map((u) => ({ id: u.id, name: u.name, status: u.status }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setAllCages(mapped)
      setAvailableCages(mapped.filter(isAvailableForStocking))
    } catch {
      /* ignore */
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (
        !formData.cageId ||
        !formData.stockingDate ||
        !formData.fishCount ||
        !formData.initialABW ||
        !formData.initialBiomass
      ) {
        throw new Error('Please fill in all required fields')
      }

      const selected = allCages.find((c) => c.id === formData.cageId)
      if (selected && !isAvailableForStocking(selected)) {
        throw new Error(
          'This pond is already active or harvesting. Pick another unit or close the cycle in Nsuo first.',
        )
      }

      const body = buildCreateStockCycleBody(formData)
      await apiClient.post(API.units.cycles(formData.cageId), body)

      posthog.capture('cage_stocked', {
        cage_id: formData.cageId,
        species: formData.species,
        fish_count: parseFloat(formData.fishCount),
        initial_abw_g: parseFloat(formData.initialABW),
        initial_biomass_kg: parseFloat(formData.initialBiomass),
        stocking_date: formData.stockingDate,
      })
      setMessage('Stock cycle created successfully.')
      setFormData({
        cageId: '',
        species: 'tilapia_nile',
        sourceName: '',
        batchNumber: '',
        stockingDate: new Date().toISOString().split('T')[0],
        fishCount: '',
        initialABW: '',
        initialBiomass: '',
        sourceLocation: '',
        sourceCage: '',
        transferSupervisor: '',
        samplingSupervisor: '',
      })
      await reloadCagesAfterStock()
      setTimeout(() => {
        router.push('/cages')
      }, 2000)
    } catch (err) {
      console.error(err)
      posthog.captureException(err)
      setError(err?.message || 'Failed to create stock cycle.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-700">New pond stock cycle</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pond / cage <span className="text-red-500">*</span>
              </label>
              {fetchingData ? (
                <div className="flex items-center space-x-2 h-10">
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Loading…</span>
                </div>
              ) : (
                <>
                  <select
                    name="cageId"
                    value={formData.cageId}
                    onChange={(e) => handleCageSelect(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    required
                    disabled={availableCages.length === 0}
                  >
                    <option value="">Select a pond</option>
                    {availableCages.map((cage) => (
                      <option key={cage.id} value={cage.id}>
                        {cage.name}{' '}
                        {cage.status ? `(${cage.status})` : ''}
                      </option>
                    ))}
                  </select>
                  {availableCages.length === 0 && !fetchingData && (
                    <p className="mt-1 text-xs text-red-500">
                      No available ponds. Active or harvest-ready units must be
                      cleared in Nsuo before a new cycle.
                    </p>
                  )}
                </>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Units that are not active or ready-to-harvest.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species <span className="text-red-500">*</span>
              </label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              >
                <option value="tilapia_nile">Nile tilapia</option>
                <option value="tilapia_blue">Blue tilapia</option>
                <option value="catfish">Catfish</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier / hatchery name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sourceName"
                value={formData.sourceName}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="e.g. Volta Fish Hatchery"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Suggested from pond name and stock cycles this year; stored in
                cycle notes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stocking date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="stockingDate"
                value={formData.stockingDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fish count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fishCount"
                value={formData.fishCount}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="Number of fish"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial ABW (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="initialABW"
                value={formData.initialABW}
                onChange={handleChange}
                step="0.1"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="Average body weight in grams"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial biomass (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="initialBiomass"
                value={formData.initialBiomass}
                step="0.01"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-50"
                readOnly
                required
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
                name="sourceLocation"
                value={formData.sourceLocation}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="Geographic source"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source cage
              </label>
              <input
                type="text"
                name="sourceCage"
                value={formData.sourceCage}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="Recorded in cycle notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer supervisor
              </label>
              <input
                type="text"
                name="transferSupervisor"
                value={formData.transferSupervisor}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="Recorded in cycle notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sampling supervisor
              </label>
              <input
                type="text"
                name="samplingSupervisor"
                value={formData.samplingSupervisor}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="Recorded in cycle notes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/cages')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
            >
              {loading ? 'Saving…' : 'Create stock cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockingForm
