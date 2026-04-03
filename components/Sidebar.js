// components/Sidebar.js — ops nav, slate shell + sky accent
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  Fish,
  Package,
  Truck,
  Scale,
  AlertTriangle,
  Settings,
  Users,
  BarChart2,
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  ShoppingCart,
  Database,
  LineChart,
  LayoutGrid,
  Target,
  Activity,
  Code2,
  KeyRound,
  Shield,
  Building,
  Globe2,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  Eye,
  Download,
  Clock,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import LogoutConfirmationModal from './LogoutConfirmationModal'
import { useToast } from './Toast'
import { useDispatch } from 'react-redux'
import { signOut } from '../store/slices/authSlice'

const Sidebar = () => {
  const { user } = useAuth()
  const isPlatformSuperAdmin = useAuthStore(
    (s) => s.user?.isPlatformSuperAdmin === true,
  )
  const router = useRouter()
  const dispatch = useDispatch()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    production: true,
    cages: true,
    feed: true,
    inventory: true,
    analytics: true,
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
    production: {
      title: 'Production',
      icon: Fish,
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { title: 'Daily Entry', path: '/daily-entry', icon: Calendar },
        { title: 'Bi-weekly Entry', path: '/biweekly-entry', icon: Scale },
        { title: 'Bi-weekly Records', path: '/biweekly-records', icon: FileText },
        { title: 'Harvest Data', path: '/harvest', icon: Package },
        { title: 'Harvest Sampling', path: '/harvest-sampling', icon: Target },
        {
          title: 'Stocking Management',
          path: '/stocking-management',
          icon: Activity,
        },
        { title: 'New Stocking', path: '/stocking', icon: Plus },
      ],
    },
    cages: {
      title: 'Cage Management',
      icon: LayoutGrid,
      items: [
        { title: 'All Cages', path: '/cages', icon: Database },
        { title: 'Active Cages', path: '/cages/active', icon: Activity },
        { title: 'Maintenance', path: '/cages/maintenance', icon: AlertTriangle },
        { title: 'Harvest Ready', path: '/cages/harvest-ready', icon: Target },
        { title: 'Analytics', path: '/cages/analytics', icon: BarChart2 },
        { title: 'Settings', path: '/cages/settings', icon: Settings },
        { title: 'Create Cage', path: '/create-cage', icon: Plus },
      ],
    },
    feed: {
      title: 'Feed Management',
      icon: Package,
      items: [
        { title: 'Overview', path: '/feed-management', icon: BarChart2 },
        { title: 'Feed Types', path: '/feed-types', icon: Package },
        { title: 'Feed Suppliers', path: '/feed-suppliers', icon: Truck },
        { title: 'Feed Purchases', path: '/feed-purchases', icon: ShoppingCart },
        {
          title: 'Feed Analytics',
          path: '/feed-management/analytics',
          icon: LineChart,
        },
      ],
    },
    inventory: {
      title: 'Inventory',
      icon: Database,
      items: [
        { title: 'Overview', path: '/inventory/overview', icon: BarChart2 },
        { title: 'Stock Levels', path: '/stock-levels', icon: Package },
        { title: 'Alerts', path: '/inventory-alerts', icon: AlertTriangle },
        {
          title: 'Transactions',
          path: '/inventory-transactions',
          icon: FileText,
        },
        { title: 'Analytics', path: '/inventory/analytics', icon: LineChart },
      ],
    },
    analytics: {
      title: 'Reports & Analytics',
      icon: BarChart2,
      items: [
        { title: 'Production Report', path: '/report', icon: FileSpreadsheet },
        { title: 'Export Data', path: '/export', icon: Download },
        { title: 'Audit Logs', path: '/audit-logs', icon: Eye },
      ],
    },
    management: {
      title: 'Management',
      icon: Settings,
      items: [
        { title: 'User Management', path: '/users', icon: Users },
        { title: 'Company Settings', path: '/company-settings', icon: Building },
        { title: 'Approvals', path: '/approvals', icon: CheckCircle },
        { title: 'Pending Approval', path: '/pending-approval', icon: Clock },
        { title: 'Bulk Upload', path: '/bulk-upload', icon: Upload },
      ],
    },
    developer: {
      title: 'Developer',
      icon: Code2,
      items: [
        {
          title: 'API keys',
          path: '/developer/api-keys',
          icon: KeyRound,
        },
      ],
    },
    admin: {
      title: 'Admin',
      icon: Shield,
      items: [
        { title: 'Admin Dashboard', path: '/admin/admin', icon: LayoutDashboard },
        {
          title: 'Company Registrations',
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
              {
                title: 'Tenants',
                path: '/platform/tenants',
                icon: Building,
              },
            ],
          },
        }
      : {}),
  }

  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-slate-700 bg-slate-900 text-sky-400">
            <Fish className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            Nsuo
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-y-contain py-3 [scrollbar-gutter:stable]">
        {Object.entries(menuItems).map(([key, section]) => (
          <div key={key} className="mb-1">
            <button
              type="button"
              onClick={() => toggleSection(key)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 focus:outline-none"
            >
              <div className="flex items-center gap-2">
                {React.createElement(section.icon, {
                  className: 'h-4 w-4 shrink-0 text-slate-500',
                })}
                {section.title}
              </div>
              {expandedSections[key] ? (
                <ChevronDown className="h-4 w-4 text-slate-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-600" />
              )}
            </button>

            {expandedSections[key] && (
              <ul className="mt-0.5 space-y-0.5 border-l border-slate-800 ml-3 pl-2">
                {section.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-2 py-1.5 pl-2 pr-2 text-sm transition ${
                          active
                            ? 'border-l-2 border-sky-500 bg-slate-900 font-medium text-white -ml-0.5 pl-[calc(0.5rem-2px)]'
                            : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                        } `}
                      >
                        {React.createElement(item.icon, {
                          className: `h-3.5 w-3.5 shrink-0 ${active ? 'text-sky-400' : 'text-slate-600'}`,
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

      <div className="border-t border-slate-800 bg-slate-900 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-700 bg-slate-950 text-xs font-semibold text-sky-400">
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
