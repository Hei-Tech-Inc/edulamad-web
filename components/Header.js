// components/Header.js (Updated)
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Bell, Sun, Moon, Search, X, ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuthStore } from '@/stores/auth.store'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

const TopBar = ({ title }) => {
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
  const [searchText, setSearchText] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const profileDropdownRef = useRef(null)
  const notifDropdownRef = useRef(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

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

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300)
    return () => window.clearTimeout(id)
  }, [searchText])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('app.recent-searches')
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 6))
    } catch {
      /* ignore */
    }
  }, [])

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
  const searchQ = useQuery({
    queryKey: ['header-search', debouncedSearch],
    enabled: searchOpen && debouncedSearch.length > 1,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.questions.list, {
        signal,
        params: { search: debouncedSearch, page: 1, limit: 10 },
      })
      if (Array.isArray(data)) return data
      if (data && typeof data === 'object') {
        if (Array.isArray(data.items)) return data.items
        if (Array.isArray(data.data)) return data.data
      }
      return []
    },
  })

  const saveRecentSearch = (value) => {
    const next = [value, ...recentSearches.filter((s) => s !== value)].slice(0, 6)
    setRecentSearches(next)
    try {
      window.localStorage.setItem('app.recent-searches', JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }
  const canGoBack = router.pathname !== '/dashboard'

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/dashboard')
  }

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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur">
      {process.env.NODE_ENV === 'development' && (
        <div className="break-all px-4 py-1 text-[11px] font-mono bg-orange-50 text-orange-950 border-b border-orange-200/80 dark:bg-orange-950/35 dark:text-orange-100 dark:border-orange-900/50">
          Dev · {process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'} API:{' '}
          {apiDevNote}
        </div>
      )}
      {actAsOrgId && isPlatformSuperAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200 bg-violet-100 px-4 py-2 text-sm text-violet-950 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-100">
          <span>
            <strong className="font-semibold">Institution view:</strong>{' '}
            {actAsOrgLabel || actAsOrgId}
            <span className="ml-2 font-mono text-xs opacity-80">
              (X-Act-As-Org-Id on org APIs)
            </span>
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
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
        {/* Page Title */}
        <div className="flex min-w-0 items-center gap-2">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleGoBack}
              aria-label="Go back"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h1 className="truncate pr-3 text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
            {title}
          </h1>
        </div>

        {/* Right Side: Notification, Theme, User Info with Dropdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-4">
          <button
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-6 h-6" />
          </button>
          {/* Notification Bell */}
          <div className="relative" id="notif-dropdown" ref={notifDropdownRef}>
            <button
              className="relative rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none"
              aria-label="Notifications"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          {/* Theme Switcher */}
          <button
            className="hidden rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none sm:inline-flex"
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-slate-100">
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
                  className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    router.push('/settings/account')
                  }}
                >
                  My Profile
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    router.push('/settings/account')
                  }}
                >
                  Account Settings
                </button>
                <button className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10" onClick={() => setProfileDropdownOpen(false)}>
                  Help
                </button>
                <div className="my-1 border-t border-white/10"></div>
                <button className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-white/10" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {searchOpen ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm">
          <div className="mx-auto mt-10 w-[min(920px,92vw)] rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search questions, courses, topics..."
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-100 focus:border-orange-500/60 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {recentSearches.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSearchText(s)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10">
              {searchQ.isLoading ? (
                <p className="p-4 text-sm text-slate-400">Searching...</p>
              ) : null}
              {!searchQ.isLoading && debouncedSearch.length > 1 && searchQ.data?.length === 0 ? (
                <p className="p-4 text-sm text-slate-400">No results found.</p>
              ) : null}
              <ul className="divide-y divide-white/10">
                {(searchQ.data || []).map((row, idx) => {
                  const id = row.id || row._id || String(idx)
                  const text = row.questionText || row.text || 'Question'
                  const courseCode = row.courseCode || row.course?.code || 'Course'
                  const itemYear = row.year || 'Year'
                  return (
                    <li key={String(id)}>
                      <button
                        type="button"
                        onClick={() => {
                          if (debouncedSearch) saveRecentSearch(debouncedSearch)
                          setSearchOpen(false)
                          router.push(`/questions/${encodeURIComponent(String(id))}`)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/[0.04]"
                      >
                        <p className="line-clamp-2 text-sm text-slate-100">{text}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {courseCode} · {itemYear}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default TopBar