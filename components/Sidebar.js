// components/Sidebar.js — Edulamad app shell
// Sidebar links only point at UX routes backed by `contexts/api-docs.json` (or static marketing / API reference).
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Building2,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
  Code2,
  Braces,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  Trophy,
  UserCircle2,
  ShieldCheck,
  ListOrdered,
  Ticket,
  Upload,
  FilePlus2,
  Inbox,
  Layers,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'
import LogoutConfirmationModal from './LogoutConfirmationModal'
import { useToast } from './Toast'
import { useDispatch } from 'react-redux'
import { signOut } from '../store/slices/authSlice'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'

function parseQueryParam(asPath, key) {
  try {
    const qs = asPath.split('?')[1]?.split('#')[0]
    if (!qs) return null
    return new URLSearchParams(qs).get(key)
  } catch {
    return null
  }
}

const Sidebar = ({ collapsed = false, onToggleCollapse }) => {
  const { user } = useAuth()
  const router = useRouter()
  const dispatch = useDispatch()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    learn: true,
    progress: true,
    account: true,
    developer: true,
    admin: true,
  })
  const { showToast } = useToast()

  const handleLogout = async () => {
    try {
      await dispatch(signOut())
      showToast('Logged out successfully', 'success')
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      showToast('Logout failed', 'error')
    } finally {
      setShowLogoutModal(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = sessionHasAdminTools(sessionUser, accessToken)

  const navItemActive = (itemPath) => {
    const pathOnly = itemPath.split(/[?#]/)[0]
    const baseMatch =
      router.pathname === pathOnly ||
      router.pathname.startsWith(`${pathOnly}/`)
    if (!baseMatch) return false

    if (itemPath.includes('?')) {
      const qStr = itemPath.slice(itemPath.indexOf('?') + 1).split('#')[0]
      const want = new URLSearchParams(qStr)
      const curQs = router.asPath.split('?')[1]?.split('#')[0] || ''
      const cur = new URLSearchParams(curQs)
      for (const [k, v] of want.entries()) {
        if (cur.get(k) !== v) return false
      }
      if (itemPath.includes('#')) {
        const wantH = itemPath.split('#')[1]?.split('&')[0] || ''
        const curH = router.asPath.split('#')[1]?.split('&')[0] || ''
        return wantH === curH
      }
      return true
    }

    if (itemPath.includes('#')) {
      const want = itemPath.split('#')[1]
      const cur = router.asPath.split('#')[1]?.split('&')[0] || ''
      return cur === want
    }

    if (pathOnly === '/dashboard') {
      const wantAdmin = parseQueryParam(itemPath, 'admin')
      const curAdmin = parseQueryParam(router.asPath, 'admin')
      if (wantAdmin == null && itemPath.indexOf('?') === -1) {
        return curAdmin == null && !router.asPath.includes('#')
      }
    }

    return true
  }

  const menuItems = useMemo(() => {
    const base = {
      learn: {
        title: 'Learn',
        icon: Compass,
        items: [
          { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { title: 'Onboarding', path: '/onboarding', icon: GraduationCap },
          {
            title: 'Past questions',
            path: '/dashboard#past-questions',
            icon: BookOpen,
          },
          {
            title: 'Quiz mode',
            path: '/quiz/new',
            icon: ListOrdered,
          },
          {
            title: 'Flashcards',
            path: '/flashcards',
            icon: Layers,
          },
        ],
      },
      progress: {
        title: 'Progress',
        icon: Trophy,
        items: [
          {
            title: 'Notifications',
            path: '/dashboard#notifications',
            icon: BellProxyIcon,
          },
        ],
      },
      account: {
        title: 'Account',
        icon: UserCircle2,
        items: [
          {
            title: 'Account settings',
            path: '/settings/account',
            icon: Settings,
          },
          { title: 'Marketing site', path: '/', icon: BookOpen },
        ],
      },
      developer: {
        title: 'Developer',
        icon: Code2,
        items: [
          {
            title: 'API reference',
            path: '/developer/api-reference',
            icon: Braces,
          },
        ],
      },
    }
    if (!isAdmin) {
      return base
    }

    const adminNavItems = [
      {
        title: 'Admin overview',
        path: '/dashboard#admin-panel-tabs',
        icon: LayoutDashboard,
      },
      {
        title: 'Catalog & institutions',
        path: '/dashboard?admin=catalog#admin-catalog',
        icon: Building2,
      },
      {
        title: 'Promo codes (list)',
        path: '/dashboard?admin=catalog#admin-promo-list',
        icon: Ticket,
      },
      {
        title: 'Question upload queue',
        path: '/dashboard?admin=catalog#admin-upload-queue',
        icon: Inbox,
      },
      {
        title: 'Create question',
        path: '/dashboard?admin=create#admin-create-question',
        icon: FilePlus2,
      },
      {
        title: 'Create flashcard',
        path: '/dashboard?admin=create#admin-create-flashcard',
        icon: Sparkles,
      },
      {
        title: 'Create promo code',
        path: '/dashboard?admin=create#admin-create-promo',
        icon: Ticket,
      },
      {
        title: 'Upload question bundle',
        path: '/dashboard?admin=create#admin-upload-bundle',
        icon: Upload,
      },
    ]

    return {
      ...base,
      admin: {
        title: 'Admin',
        icon: ShieldCheck,
        items: adminNavItems,
      },
    }
  }, [isAdmin])

  return (
    <div
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-neutral-800/80 bg-[#06080f] shadow-[12px_0_35px_rgba(2,6,23,0.3)] transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="border-b border-neutral-800/80 p-4">
        <div
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded border border-orange-500/35 bg-orange-500/10 text-orange-400">
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
            </span>
            {!collapsed ? (
              <span className="text-lg font-semibold tracking-tight text-white">
                {APP_NAME}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-y-contain py-4 [scrollbar-gutter:stable]">
        {Object.entries(menuItems).map(([key, section]) => (
          <div key={key} className="mb-3">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleSection(key)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500 transition hover:bg-white/[0.05] hover:text-neutral-100 focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  {React.createElement(section.icon, {
                    className: 'h-4 w-4 shrink-0 text-orange-500/70',
                  })}
                  {section.title}
                </div>
                {expandedSections[key] ? (
                  <ChevronDown className="h-4 w-4 text-neutral-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-600" />
                )}
              </button>
            ) : null}

            {(collapsed || expandedSections[key]) && (
              <ul
                className={`mt-1.5 space-y-1 ${collapsed ? 'px-2' : 'ml-3 border-l border-neutral-800/80 pl-2.5'}`}
              >
                {section.items.map((item) => {
                  if (item.kind === 'hint') {
                    return (
                      <li key={item.key}>
                        {collapsed ? (
                          <span
                            className="flex justify-center py-2 text-neutral-500"
                            title={item.body}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 opacity-50" aria-hidden />
                          </span>
                        ) : (
                          <p className="rounded-md py-2 pl-2.5 pr-2 text-[11px] leading-relaxed text-neutral-500">
                            {item.body}
                          </p>
                        )}
                      </li>
                    )
                  }
                  const active = navItemActive(item.path)
                  return (
                    <li key={`${key}-${item.title}`}>
                      <Link
                        href={item.path}
                        title={collapsed ? item.title : undefined}
                        className={`flex items-center gap-2 rounded-md py-2 pl-2.5 pr-2.5 text-sm transition ${
                          active
                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/0 font-medium text-white'
                            : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                        } ${collapsed ? 'justify-center px-2 py-2' : ''}`}
                      >
                        {React.createElement(item.icon, {
                          className: `h-3.5 w-3.5 shrink-0 ${active ? 'text-orange-400' : 'text-neutral-600'}`,
                        })}
                        {!collapsed ? item.title : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-800/80 bg-[#05070d] p-3">
        <div
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}
        >
          <div
            className={`flex min-w-0 items-center gap-2 ${collapsed ? '' : 'flex-1'}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-700 bg-neutral-950 text-xs font-semibold text-orange-400">
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {user?.email || '—'}
                </p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="shrink-0 rounded p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutConfirmationModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  )
}

function BellProxyIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  )
}

export default Sidebar
