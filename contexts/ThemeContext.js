import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [systemTheme, setSystemTheme] = useState('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const resolved = savedTheme || 'light'
    setTheme(resolved)
    applyTheme(resolved)
  }, [])

  const updateTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    updateTheme(theme === 'light' ? 'dark' : 'light')
  }

  const useSystemTheme = () => {
    updateTheme(systemTheme)
  }

  const value = {
    theme,
    systemTheme,
    updateTheme,
    toggleTheme,
    useSystemTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
