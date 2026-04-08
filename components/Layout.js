// components/Layout.js — shell for authenticated app routes
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children, title: initialTitle = 'Dashboard' }) => {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)

  const isPlatformShell = router.pathname.startsWith('/platform')
  const isInstitutionConsole = router.pathname === '/platform/tenants'

  useEffect(() => {
    const path = router.pathname
    let newTitle = 'Dashboard'
    if (path.startsWith('/platform')) {
      newTitle = path === '/platform/tenants' ? 'Institutions console' : 'Platform'
    } else if (path === '/dashboard') {
      newTitle = 'Dashboard'
    }
    setTitle(newTitle)
  }, [router.pathname])

  return (
    <div className="bg-slate-50 dark:bg-[#050505]">
      {!isInstitutionConsole ? <Sidebar /> : null}
      <div
        className={`min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 dark:from-[#050505] dark:via-[#050505] dark:to-[#050505] ${isInstitutionConsole ? 'ml-0' : 'ml-64'}`}
      >
        <Header title={title} />
        <main
          className={`mx-auto min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${isInstitutionConsole ? 'max-w-none' : 'max-w-[1520px]'}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
