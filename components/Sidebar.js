// components/Sidebar.js — Edulamad app shell
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Code2,
  KeyRound,
  Braces,
  Shield,
  Building,
  Globe2,
  Clock,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import LogoutConfirmationModal from './LogoutConfirmationModal'
import { useToast } from './Toast'
import { useDispatch } from 'react-redux'
import { signOut } from '../store/slices/authSlice'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'

const Sidebar = () => {
  const { user } = useAuth()
  const isPlatformSuperAdmin = useAuthStore(
    (s) => s.user?.isPlatformSuperAdmin === true,
  )
  const router = useRouter()
  const dispatch = useDispatch()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    app: true,
    management: true,
    developer: true,
    admin: true,
    platform: true,
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

  const isActive = (path) =>
    router.pathname === path || router.pathname.startsWith(`${path}/`)

  const menuItems = {
    app: {
      title: 'App',
      icon: GraduationCap,
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { title: 'Marketing site', path: '/', icon: BookOpen },
        { title: 'Pending approval', path: '/pending-approval', icon: Clock },
      ],
    },
    management: {
      title: 'Institutions',
      icon: Settings,
      items: [
        { title: 'User management', path: '/users', icon: Users },
        { title: 'Institution settings', path: '/company-settings', icon: Building },
        { title: 'Account settings', path: '/settings/account', icon: Settings },
      ],
    },
    developer: {
      title: 'Developer',
      icon: Code2,
      items: [
        { title: 'API keys', path: '/developer/api-keys', icon: KeyRound },
        { title: 'API reference', path: '/developer/api-reference', icon: Braces },
      ],
    },
    admin: {
          title: 'Admin',
      icon: Shield,
      items: [
        { title: 'Admin dashboard', path: '/admin/admin', icon: LayoutDashboard },
        {
              title: 'Institution registrations',
          path: '/admin/company-registrations',
          icon: Building,
        },
      ],
    },
    ...(isPlatformSuperAdmin
      ? {
          platform: {
            title: 'Platform',
            icon: Globe2,
            items: [
              { title: 'Institutions directory', path: '/platform/tenants', icon: Building },
            ],
          },
        }
      : {}),
  }

  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-800/80 bg-[#06080f] shadow-[12px_0_35px_rgba(2,6,23,0.3)]">
      <div className="border-b border-neutral-800/80 p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-orange-500/35 bg-orange-500/10 text-orange-400">
            <GraduationCap className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            {APP_NAME}
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-y-contain py-3 [scrollbar-gutter:stable]">
        {Object.entries(menuItems).map(([key, section]) => (
          <div key={key} className="mb-1">
            <button
              type="button"
              onClick={() => toggleSection(key)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 focus:outline-none"
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

            {expandedSections[key] && (
              <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-neutral-800/80 pl-2">
                {section.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-2 py-1.5 pl-2 pr-2 text-sm transition ${
                          active
                            ? 'border-l-2 border-orange-500 bg-gradient-to-r from-orange-500/15 to-transparent font-medium text-white -ml-0.5 pl-[calc(0.5rem-2px)]'
                            : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                        } `}
                      >
                        {React.createElement(item.icon, {
                          className: `h-3.5 w-3.5 shrink-0 ${active ? 'text-orange-400' : 'text-neutral-600'}`,
                        })}
                        {item.title}
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-700 bg-neutral-950 text-xs font-semibold text-orange-400">
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-200">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {user?.email || '—'}
              </p>
            </div>
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

export default Sidebar
