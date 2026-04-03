// components/Header.js (Updated)
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuthStore } from '@/stores/auth.store'

const TopBar = ({ title }) => {
  const { user, signOut } = useAuth()
  const actAsOrgId = useAuthStore((s) => s.actAsOrgId)
  const actAsOrgLabel = useAuthStore((s) => s.actAsOrgLabel)
  const isPlatformSuperAdmin = useAuthStore(
    (s) => s.user?.isPlatformSuperAdmin,
  )
  const setActAsOrg = useAuthStore((s) => s.setActAsOrg)
  const { theme, toggleTheme } = useTheme()
  const fullName = user?.user_metadata?.full_name || user?.email || 'User'
  const role = user?.user_metadata?.role || 'User'
  const email = user?.email || ''
  const avatarLetter = fullName.charAt(0).toUpperCase()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const notifDropdownRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !event.target.closest('#user-profile-dropdown')
      ) {
        setProfileDropdownOpen(false)
      }
      if (
        notifDropdownRef.current &&
        !event.target.closest('#notif-dropdown')
      ) {
        setNotifDropdownOpen(false)
      }
    }
    if (profileDropdownOpen || notifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen, notifDropdownOpen])

  const handleLogout = async () => {
    setProfileDropdownOpen(false)
    await signOut()
  }

  const notifications = []
  const unreadCount = notifications.filter((n) => !n.read).length

  const apiConfigured =
    typeof process.env.NEXT_PUBLIC_API_URL === 'string'
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://localhost:3000'
  let apiDevNote = apiConfigured
  try {
    const { hostname } = new URL(apiConfigured)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      apiDevNote = `browser → /api/backend → ${apiConfigured.replace(/\/$/, '')}`
    }
  } catch {
    /* ignore */
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-1 text-[11px] font-mono bg-amber-50 text-amber-950 border-b border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/60">
          Dev · Nsuo API: {apiDevNote}
        </div>
      )}
      {actAsOrgId && isPlatformSuperAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200 bg-violet-100 px-4 py-2 text-sm text-violet-950 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-100">
          <span>
            <strong className="font-semibold">Tenant view:</strong>{' '}
            {actAsOrgLabel || actAsOrgId}
            <span className="ml-2 font-mono text-xs opacity-80">
              (X-Act-As-Org-Id on tenant APIs)
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-3">
            <Link
              href="/platform/tenants"
              className="font-medium text-violet-800 underline decoration-violet-400 underline-offset-2 hover:text-violet-950 dark:text-violet-200 dark:hover:text-white"
            >
              Tenant console
            </Link>
            <button
              type="button"
              onClick={() => setActAsOrg(null)}
              className="rounded-md border border-violet-300 bg-white px-2.5 py-1 text-xs font-semibold text-violet-900 shadow-sm hover:bg-violet-50 dark:border-violet-700 dark:bg-violet-900 dark:text-violet-100 dark:hover:bg-violet-800"
            >
              Exit tenant view
            </button>
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Page Title */}
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>

        {/* Right Side: Notification, Theme, User Info with Dropdown */}
        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          <div className="relative" id="notif-dropdown" ref={notifDropdownRef}>
            <button
              className="relative rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Notifications"
              onClick={() => setNotifDropdownOpen(open => !open)}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {notifDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-72 rounded border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-2 text-sm ${n.read ? 'text-gray-400' : 'text-gray-800 dark:text-gray-100 font-medium'} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}>
                      {n.text}
                    </div>
                  ))
                )}
                <div className="cursor-pointer border-t border-slate-100 px-4 py-2 text-xs text-sky-700 hover:underline dark:border-slate-800 dark:text-sky-400">
                  Mark all as read
                </div>
              </div>
            )}
          </div>
          {/* Theme Switcher */}
          <button
            className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
          {/* User Info with Dropdown */}
          <div className="relative" id="user-profile-dropdown" ref={profileDropdownRef}>
            <button
              className="flex items-center space-x-3 focus:outline-none"
              onClick={() => setProfileDropdownOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={profileDropdownOpen}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {avatarLetter}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{fullName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{role}</div>
              </div>
              <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{email}</div>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setProfileDropdownOpen(false)}>
                  My Profile
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setProfileDropdownOpen(false)}>
                  Account Settings
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setProfileDropdownOpen(false)}>
                  Help
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar