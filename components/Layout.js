// components/Layout.js (Updated with collapsible sidebar)
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCages } from '../store/slices/cagesSlice'
import Header from './Header'
import Sidebar from './Sidebar'
import { DataApiBanner } from './DataApiBanner'
import { useData } from '../contexts/DataContext'

const Layout = ({
  children,
  title: initialTitle = 'Dashboard',
}) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('')
  const [title, setTitle] = useState(initialTitle)
  const dispatch = useDispatch()
  const { cages, loading, error } = useSelector((state) => state.cages)
  const {
    error: dataError,
    loading: dataLoading,
    refreshCages: refreshDataCages,
  } = useData()

  const isPlatformShell = router.pathname.startsWith('/platform')

  useEffect(() => {
    // Set active tab and title based on current route
    const path = router.pathname
    let newTitle = 'Dashboard'
    if (path.startsWith('/platform')) {
      setActiveTab('platform')
      newTitle = path === '/platform/tenants' ? 'Tenant console' : 'Platform'
    } else if (path === '/dashboard') {
      setActiveTab('dashboard')
      newTitle = 'Dashboard'
    } else if (path.includes('/cages')) {
      setActiveTab('cages')
      newTitle = 'Cage Management'
    } else if (path.includes('/harvest')) {
      setActiveTab('harvest')
      newTitle = 'Harvest Management'
    } else if (path.includes('/feed-management')) {
      setActiveTab('feed')
      newTitle = 'Feed Management'
    } else {
      setActiveTab('')
      newTitle = 'Dashboard'
    }
    setTitle(newTitle)
  }, [router.pathname])

  useEffect(() => {
    if (!isPlatformShell) {
      dispatch(fetchCages())
    }
  }, [dispatch, isPlatformShell])

  if (!isPlatformShell && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  const reduxErr =
    error == null
      ? ''
      : typeof error === 'string'
        ? error
        : error?.message ?? String(error)
  const dataErr = dataError || ''
  const errorMessage = reduxErr || dataErr
  const bannerLoading = loading || dataLoading
  const showDataBanner = Boolean(errorMessage) && !isPlatformShell

  return (
    <div>
      {/* Sidebar is fixed, full height */}
      <Sidebar />
      {/* Main content is offset by sidebar width */}
      <div className="ml-64 min-h-screen bg-slate-100 dark:bg-slate-950">
        {/* Header is sticky at the top */}
        <Header />
        {showDataBanner ? (
          <DataApiBanner
            embedded
            error={errorMessage}
            loading={bannerLoading}
            onRetry={() => {
              dispatch(fetchCages())
              void refreshDataCages()
            }}
          />
        ) : null}
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
