import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import { useUiStore } from '@/stores/ui.store'
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api'
import { normalizeDailyRecordList } from '@/hooks/units/useDailyRecords'
import { fetchLegacyBiweeklyRowsForUnit } from '@/lib/farm-weight-samples-legacy'

const DataContext = createContext()

export function DataProvider({ children }) {
  const activeFarmId = useUiStore((s) => s.activeFarmId)
  const [cages, setCages] = useState([])
  const [stockings, setStockings] = useState([])
  const [dailyRecords, setDailyRecords] = useState([])
  const [biweeklyRecords, setBiweeklyRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshCages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const farmId = activeFarmId || (await resolveFarmIdForRedux())
      if (!farmId) {
        setCages([])
        return []
      }
      const { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
      setCages(legacy)
      return legacy
    } catch (err) {
      const msg = err?.message || String(err)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [activeFarmId])

  useEffect(() => {
    refreshCages()
  }, [activeFarmId, refreshCages])

  /** Stocking batches not yet backed by Nsuo in this app — keep empty for compatibility. */
  const refreshStockings = useCallback(async () => {
    setStockings([])
    return []
  }, [])

  const refreshDailyRecords = useCallback(async (cageId) => {
    if (!cageId) {
      setDailyRecords([])
      return []
    }
    setLoading(true)
    setError(null)
    try {
      const { data: raw } = await apiClient.get(API.units.dailyRecords(cageId), {
        params: { limit: 200 },
      })
      const normalized = normalizeDailyRecordList(raw).map((r) => ({
        ...r,
        cage_id: cageId,
        feed_amount: r.feedQuantityKg,
        feed_type: r.feedType,
        mortality: r.mortalityCount,
      }))
      setDailyRecords(normalized)
      return normalized
    } catch (err) {
      const msg = err?.message || String(err)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshBiweeklyRecords = useCallback(async (cageId) => {
    if (!cageId) {
      setBiweeklyRecords([])
      return []
    }
    setLoading(true)
    setError(null)
    try {
      let unitRef = { id: cageId, name: cageId.slice(0, 8) }
      const farmId = activeFarmId || (await resolveFarmIdForRedux())
      if (farmId) {
        const { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
        const found = legacy.find((c) => c.id === cageId)
        if (found) unitRef = { id: found.id, name: found.name }
      }
      const rows = await fetchLegacyBiweeklyRowsForUnit(unitRef, {
        samplesLimit: 200,
      })
      setBiweeklyRecords(rows)
      return rows
    } catch (err) {
      const msg = err?.message || String(err)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [activeFarmId])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([refreshCages(), refreshStockings()])
    } catch (err) {
      const msg = err?.message || String(err)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshCages, refreshStockings])

  const value = {
    cages,
    stockings,
    dailyRecords,
    biweeklyRecords,
    loading,
    error,
    refreshCages,
    refreshStockings,
    refreshDailyRecords,
    refreshBiweeklyRecords,
    refreshAll,
  }

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
