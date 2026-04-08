// components/AdminCompanyRegistrationsPage.js — legacy Supabase queue removed
import React from 'react'
import Link from 'next/link'
import { Briefcase, ArrowRight } from 'lucide-react'
import { getAppName } from '@/lib/app-brand'

const AdminCompanyRegistrationsPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
            Account registration
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            {getAppName()} does not use the old &quot;pending company
            registrations&quot; queue. New users register from{' '}
            <strong>Create account</strong> on the public site.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-orange-500/15 p-3">
              <Briefcase className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Admin tools
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Use the admin area to manage tenants and settings if your account
                has the right permissions.
              </p>
              <Link
                href="/admin/admin"
                className="mt-4 inline-flex items-center text-sm font-medium text-orange-600 transition hover:text-orange-700"
              >
                Open company management
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
    </div>
  )
}

export default AdminCompanyRegistrationsPage
