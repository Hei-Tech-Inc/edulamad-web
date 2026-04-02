// CreateCageForm — creates a farm unit via Nsuo API (POST /farms/:farmId/units)
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import { useFarms } from '@/hooks/farms/useFarms'
import { useUnits } from '@/hooks/farms/useUnits'
import { useUiStore } from '@/stores/ui.store'

const CreateCageForm = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const activeFarmId = useUiStore((s) => s.activeFarmId)
  const setActiveFarmId = useUiStore((s) => s.setActiveFarmId)

  const { data: farmList, isLoading: farmsLoading } = useFarms({ limit: 100 })
  const farmItems = useMemo(() => farmList?.items ?? [], [farmList?.items])

  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [nameError, setNameError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    capacity: '',
    dimensions: '',
    material: '',
    installation_date: '',
    notes: '',
    status: 'empty',
  })

  useEffect(() => {
    if (!farmItems.length) return
    setSelectedFarmId((prev) => {
      if (prev && farmItems.some((f) => f.id === prev)) return prev
      const initial =
        activeFarmId && farmItems.some((f) => f.id === activeFarmId)
          ? activeFarmId
          : farmItems[0].id
      return initial
    })
  }, [farmItems, activeFarmId])

  const farmId = selectedFarmId

  const { data: unitList } = useUnits(farmId || undefined, { limit: 500 })
  const existingNames = useMemo(() => {
    const items = unitList?.items ?? []
    return new Set(items.map((u) => String(u.name).toLowerCase()))
  }, [unitList])

  useEffect(() => {
    setNameError('')
    if (!formData.name) return
    const timer = setTimeout(() => {
      if (existingNames.has(formData.name.trim().toLowerCase())) {
        setNameError(
          'This unit name already exists for the selected farm. Choose another name.',
        )
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [formData.name, existingNames])

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(API.farms.units(farmId), payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all })
      setMessage('Unit created successfully.')
      setFormData({
        name: '',
        location: '',
        size: '',
        capacity: '',
        dimensions: '',
        material: '',
        installation_date: '',
        notes: '',
        status: 'empty',
      })
      setTimeout(() => {
        router.push('/cages')
      }, 1500)
    },
    onError: (e) => {
      setError(e?.message ?? 'Failed to create unit')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const buildPayload = () => {
    let gpsLatitude
    let gpsLongitude
    const loc = formData.location?.trim()
    if (loc) {
      const parts = loc.split(',').map((s) => s.trim())
      if (parts.length === 2) {
        const a = parseFloat(parts[0])
        const b = parseFloat(parts[1])
        if (!Number.isNaN(a) && !Number.isNaN(b)) {
          gpsLatitude = a
          gpsLongitude = b
        }
      }
    }

    const extras = [
      formData.capacity && `Capacity (fish): ${formData.capacity}`,
      formData.dimensions && `Dimensions: ${formData.dimensions}`,
      formData.material && `Material: ${formData.material}`,
    ].filter(Boolean)
    const combinedNotes = [formData.notes?.trim(), ...extras]
      .filter(Boolean)
      .join('\n')

    const payload = {
      name: formData.name.trim(),
      unitType: 'cage',
      areaM2: formData.size ? parseFloat(formData.size) : undefined,
      constructionYear: formData.installation_date
        ? parseInt(formData.installation_date.slice(0, 4), 10)
        : undefined,
      status: formData.status,
      notes: combinedNotes || undefined,
    }
    if (gpsLatitude != null && gpsLongitude != null) {
      payload.gpsLatitude = gpsLatitude
      payload.gpsLongitude = gpsLongitude
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!farmId) {
      setError('Select a farm first.')
      return
    }
    if (!formData.name?.trim()) {
      setError('Unit name is required.')
      return
    }
    if (existingNames.has(formData.name.trim().toLowerCase())) {
      setError('This unit name already exists for the selected farm.')
      return
    }

    setActiveFarmId(farmId)
    createMutation.mutate(buildPayload())
  }

  const submitting = createMutation.isPending

  if (farmsLoading && !farmItems.length) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-600">
        Loading farms…
      </div>
    )
  }

  if (!farmItems.length) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-amber-800 bg-amber-50 rounded-md">
        No farms available. Create a farm in the Nsuo system before adding units.
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-700">Create New Unit (Cage)</h2>
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
          {farmItems.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm <span className="text-red-500">*</span>
              </label>
              <select
                value={farmId ?? ''}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                {farmItems.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name ?? f.id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit / cage name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  nameError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="e.g. Cage 2, Unit A1"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPS (latitude, longitude)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. 5.6037, -0.187"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (m²)
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                step="0.1"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Surface area in square metres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (fish count)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Stored in notes until cycles are linked"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. 5m × 5m"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. HDPE net"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction year
              </label>
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Year is taken from this date for the API.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="empty">Empty</option>
                <option value="maintenance">Maintenance</option>
                <option value="fallow">Fallow</option>
              </select>
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
              disabled={submitting || !!nameError}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                submitting || nameError
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {submitting ? 'Creating…' : 'Create unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCageForm
