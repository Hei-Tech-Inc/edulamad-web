// components/Header.js (Updated)
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Bell, Sun, Moon, Search, ChevronLeft, PanelLeftOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuthStore } from '@/stores/auth.store'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import AppSearchDialog from './search/AppSearchDialog'

const TopBar = ({ title, onOpenMobileSidebar }) => {
  const { user, signOut } = useAuth()
  const router = useRouter()
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
  const [searchOpen, setSearchOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const notifDropdownRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !event.target.closest('#user-profile-dropdown')
      ) {
        setProfileDropdownOpen(false)
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

  const handleLogout = async () => {
    setProfileDropdownOpen(false)
    await signOut()
    router.push('/login')
  }

  const unreadCountQ = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.notifications.me, {
        signal,
        params: { unread: true, limit: 1 },
      })
      if (data && typeof data === 'object' && data.meta && typeof data.meta.total === 'number') {
        return data.meta.total
      }
      if (Array.isArray(data)) return data.length
      if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items.length
      return 0
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  const unreadCount = unreadCountQ.data || 0
  const canGoBack = router.pathname !== '/dashboard'

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/dashboard')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur pt-safe">
      <AppSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      {actAsOrgId && isPlatformSuperAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200 bg-violet-100 px-4 py-2 text-sm text-violet-950 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-100">
          <span>
            <strong className="font-semibold">Institution view:</strong>{' '}
            {actAsOrgLabel || actAsOrgId}
          </span>
          <span className="flex flex-wrap items-center gap-3">
            <Link
              href="/platform/institutions"
              className="font-medium text-violet-800 underline decoration-violet-400 underline-offset-2 hover:text-violet-950 dark:text-violet-200 dark:hover:text-white"
            >
              Institutions console
            </Link>
            <button
              type="button"
              onClick={() => setActAsOrg(null)}
              className="rounded-md border border-violet-300 bg-white px-2.5 py-1 text-xs font-semibold text-violet-900 shadow-sm hover:bg-violet-50 dark:border-violet-700 dark:bg-violet-900 dark:text-violet-100 dark:hover:bg-violet-800"
            >
              Exit institution view
            </button>
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3.5">
        {/* Page Title */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          {canGoBack ? (
            <button
              type="button"
              onClick={handleGoBack}
              aria-label="Go back"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <h1 className="truncate pr-1 text-sm font-semibold tracking-tight text-slate-100 min-[380px]:text-[15px] sm:pr-3 sm:text-lg">
            {title}
          </h1>
        </div>

        {/* Right Side: Notification, Theme, User Info with Dropdown */}
        <div className="flex items-center space-x-0.5 min-[380px]:space-x-1 sm:space-x-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none sm:rounded-xl sm:p-2"
            aria-label="Search catalog and people"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <kbd className="hidden rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-normal text-slate-500 lg:inline">
              ⌘K
            </kbd>
          </button>
          {/* Notification Bell */}
          <div className="relative" id="notif-dropdown" ref={notifDropdownRef}>
            <button
              type="button"
              className="relative hidden rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none min-[350px]:inline-flex sm:rounded-xl sm:p-2"
              aria-label="Notifications"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
          {/* Theme Switcher */}
          <button
            type="button"
            className="hidden rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none sm:inline-flex"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
          {/* User Info with Dropdown */}
          <div className="relative" id="user-profile-dropdown" ref={profileDropdownRef}>
            <button
              type="button"
              className="flex items-center space-x-3 focus:outline-none"
              onClick={() => setProfileDropdownOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={profileDropdownOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs font-semibold text-slate-100 sm:h-10 sm:w-10 sm:rounded-xl sm:text-sm">
                {avatarLetter}
              </div>
              <div className="hidden sm:block text-right">
                <div className="max-w-[120px] truncate text-sm font-medium text-slate-100">{fullName}</div>
                <div className="text-xs text-slate-400">{role}</div>
              </div>
              <svg className="hidden h-4 w-4 text-gray-400 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#111827] py-1 shadow-[0_18px_45px_rgba(2,6,23,0.45)]">
                <div className="border-b border-white/10 px-4 py-2 text-xs text-slate-400">{email}</div>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    router.push('/settings/account')
                  }}
                >
                  My Profile
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    router.push('/settings/account')
                  }}
                >
                  Account Settings
                </button>
                <button type="button" className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10" onClick={() => setProfileDropdownOpen(false)}>
                  Help
                </button>
                <div className="my-1 border-t border-white/10"></div>
                <button type="button" className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-white/10" onClick={handleLogout}>
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
