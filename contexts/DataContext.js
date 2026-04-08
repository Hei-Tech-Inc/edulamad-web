import React, { createContext, useContext, useMemo } from 'react'

/**
 * Placeholder data shell for routes that still expect a provider.
 * Product data will load via TanStack Query against Edulamad endpoints.
 */
const DataContext = createContext()

export function DataProvider({ children }) {
  const value = useMemo(
    () => ({
      studyRows: [],
      stockRows: [],
      dailyRows: [],
      checkInRows: [],
      loading: false,
      error: null,
      refreshStudyRows: async () => [],
      refreshStockRows: async () => [],
      refreshDailyRows: async () => [],
      refreshCheckInRows: async () => [],
    }),
    [],
  )

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
