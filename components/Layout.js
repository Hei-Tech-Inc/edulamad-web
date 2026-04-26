// components/Layout.js — shell for authenticated app routes
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from './Header'
import Sidebar from './Sidebar'
import AppTabBar from './AppTabBar'

const Layout = ({ children, title: initialTitle = 'Dashboard' }) => {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isPlatformShell = router.pathname.startsWith('/platform')
  const isInstitutionConsole = router.pathname === '/platform/institutions'
  const showPrimaryTabs = !isPlatformShell && !isInstitutionConsole

  useEffect(() => {
    const path = router.pathname
    let newTitle = 'Dashboard'
    if (path.startsWith('/platform')) {
      newTitle = path === '/platform/institutions' ? 'Institutions console' : 'Platform'
    } else if (path === '/dashboard') {
      newTitle = 'Dashboard'
    } else if (path.startsWith('/quiz')) {
      newTitle = 'Quiz mode'
    } else if (path.startsWith('/flashcards')) {
      newTitle = 'Flashcards'
    }
    setTitle(newTitle)
  }, [router.pathname])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('app.sidebar.collapsed')
      if (saved === '1') setSidebarCollapsed(true)
      if (saved === '0') setSidebarCollapsed(false)
    } catch {
      /* ignore localStorage issues */
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem('app.sidebar.collapsed', next ? '1' : '0')
      } catch {
        /* ignore localStorage issues */
      }
      return next
    })
  }

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [router.asPath])

  return (
    <div className="bg-[#05070d]">
      {!isInstitutionConsole ? (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          autoHide
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      ) : null}
      {!isInstitutionConsole && mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}
      <div
        className={`min-h-screen bg-gradient-to-b from-[#0a1020] via-[#0b1222] to-[#0a1020] transition-[margin] duration-200 ${
          isInstitutionConsole ? 'ml-0' : sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-72'
        }`}
      >
        <Header title={title} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        {showPrimaryTabs ? <AppTabBar /> : null}
        <main
          className={`settings-light mx-auto min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 text-slate-900 antialiased sm:px-6 lg:px-8 lg:py-8 ${isInstitutionConsole ? 'max-w-none' : 'max-w-[1520px]'}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
