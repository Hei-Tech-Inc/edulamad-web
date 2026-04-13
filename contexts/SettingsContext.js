import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

const DEFAULT_SETTINGS = {
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'GHS',
  notifications: {
    email: true,
    push: true,
    quizReminders: true,
    streakMilestones: true,
    creditBalanceAlerts: true,
  },
  dashboard: {
    defaultTimeRange: '30d',
    showCharts: true,
    showMetrics: true,
    showActivityFeed: true,
  },
}

function normalizeStoredSettings(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS }
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(raw.notifications || {}) },
    dashboard: { ...DEFAULT_SETTINGS.dashboard, ...(raw.dashboard || {}) },
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(normalizeStoredSettings(parsed))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('userSettings', JSON.stringify(updated))
      return updated
    })
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.setItem('userSettings', JSON.stringify(DEFAULT_SETTINGS))
  }

  const value = {
    settings,
    updateSettings,
    resetSettings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
