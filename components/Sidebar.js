// components/Sidebar.js — Edulamad app shell
// Sidebar links only point at UX routes backed by `contexts/api-docs.json` (or static marketing / API reference).
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
  Wallet,
  CreditCard,
  FileJson2,
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

const Sidebar = ({
  collapsed = false,
  onToggleCollapse,
  autoHide = true,
  mobileOpen = false,
  onCloseMobile,
}) => {
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
  const [peekExpanded, setPeekExpanded] = useState(false)
  const firstMobileNavLinkRef = useRef(null)
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
  const isMobileOpen = Boolean(mobileOpen)
  const isAutoHidden = collapsed && autoHide
  const isExpanded = !collapsed || peekExpanded
  const showExpandedContent = isMobileOpen || isExpanded

  useEffect(() => {
    if (!isMobileOpen) return
    const id = window.setTimeout(() => {
      firstMobileNavLinkRef.current?.focus?.()
    }, 90)
    return () => window.clearTimeout(id)
  }, [isMobileOpen])

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
          { title: 'Pricing & plans', path: '/pricing', icon: Wallet },
          { title: 'Subscription', path: '/profile/subscription', icon: CreditCard },
          { title: 'Marketing site', path: '/', icon: BookOpen },
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
      {
        title: 'JSON question upload',
        path: '/admin/questions/upload',
        icon: FileJson2,
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
      onMouseEnter={() => {
        if (isAutoHidden) setPeekExpanded(true)
      }}
      onMouseLeave={() => {
        if (isAutoHidden) setPeekExpanded(false)
      }}
      onFocusCapture={() => {
        if (isAutoHidden) setPeekExpanded(true)
      }}
      onBlurCapture={(event) => {
        if (!isAutoHidden) return
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPeekExpanded(false)
        }
      }}
      className={`fixed left-0 top-0 z-50 flex h-dvh w-[min(86vw,20rem)] flex-col border-r border-neutral-800/80 bg-[#06080f] pt-safe shadow-[12px_0_35px_rgba(2,6,23,0.3)] transition-[width,transform,box-shadow] duration-200 ease-out will-change-transform lg:z-40 ${
        isExpanded ? 'lg:w-72 lg:shadow-[16px_0_40px_rgba(2,6,23,0.42)]' : 'lg:w-[4.5rem]'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${
        isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none lg:pointer-events-auto'
      }`}
    >
      <div className="border-b border-neutral-800/80 p-4">
        <div
          className={`flex items-center ${showExpandedContent ? 'justify-between' : 'justify-center'} gap-2`}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded border border-orange-500/35 bg-orange-500/10 text-orange-400">
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
            </span>
            {showExpandedContent ? (
              <span className="whitespace-nowrap text-[1.02rem] font-semibold tracking-[-0.01em] text-slate-50 subpixel-antialiased">
                {APP_NAME}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden rounded-md p-1.5 text-slate-300 transition hover:bg-white/[0.08] hover:text-white lg:inline-flex ${
              showExpandedContent ? '' : 'absolute right-2 top-4'
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-300 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-y-contain px-1 py-4 [scrollbar-gutter:stable]">
        {Object.entries(menuItems).map(([key, section]) => (
          <div key={key} className="mb-3">
            {showExpandedContent ? (
              <button
                type="button"
                onClick={() => toggleSection(key)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-300/95 transition hover:bg-white/[0.06] hover:text-white focus:outline-none"
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

            {(!showExpandedContent || expandedSections[key]) && (
              <ul
                className={`mt-1.5 space-y-1 ${showExpandedContent ? 'ml-3 border-l border-neutral-800/80 pl-2.5' : 'px-2'}`}
              >
                {section.items.map((item, idx) => {
                  if (item.kind === 'hint') {
                    return (
                      <li key={item.key}>
                        {!showExpandedContent ? (
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
                        ref={isMobileOpen && idx === 0 ? firstMobileNavLinkRef : undefined}
                        href={item.path}
                        onClick={onCloseMobile}
                        title={!showExpandedContent ? item.title : undefined}
                          className={`group flex min-h-11 items-center gap-2 rounded-lg py-2.5 pl-2.5 pr-2.5 text-[14px] leading-5 transition ${
                          active
                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/0 font-semibold text-white'
                            : 'text-slate-200/90 hover:bg-white/[0.07] hover:text-white'
                        } ${showExpandedContent ? '' : 'justify-center px-2 py-2'} ${isMobileOpen ? 'focus:outline-none focus:ring-2 focus:ring-orange-500/50' : ''}`}
                      >
                        {React.createElement(item.icon, {
                          className: `h-3.5 w-3.5 shrink-0 ${active ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'}`,
                        })}
                        <span
                          className={`whitespace-nowrap font-medium subpixel-antialiased transition-all duration-200 ${
                            showExpandedContent
                              ? 'max-w-[14rem] translate-x-0 opacity-100'
                              : 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
                          }`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-800/80 bg-[#05070d] p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div
          className={`flex items-center ${showExpandedContent ? 'justify-between' : 'justify-center'} gap-2`}
        >
          <div
            className={`flex min-w-0 items-center gap-2 ${showExpandedContent ? 'flex-1' : ''}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-700 bg-neutral-950 text-xs font-semibold text-orange-400">
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            {showExpandedContent ? (
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-slate-100 subpixel-antialiased">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="truncate text-[11px] font-medium text-slate-300/95">
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
