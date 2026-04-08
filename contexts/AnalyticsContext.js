import React, { createContext, useContext, useState, useCallback } from 'react'

const AnalyticsContext = createContext()

export function AnalyticsProvider({ children }) {
  const [metrics, setMetrics] = useState({
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {},
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateMetrics = useCallback(async (timeRange) => {
    setLoading(true)
    try {
      const calculatedMetrics = {
        studySessions: { count: 0, trend: 'stable' },
        questionsViewed: { count: 0, trend: 'stable' },
      }
      setMetrics((prev) => ({
        ...prev,
        [timeRange]: calculatedMetrics,
      }))
      return calculatedMetrics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generateReport = useCallback(async (type, dateRange) => {
    setLoading(true)
    try {
      return {
        type,
        dateRange,
        generatedAt: new Date(),
        data: {},
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    metrics,
    loading,
    error,
    calculateMetrics,
    generateReport,
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
