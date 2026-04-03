// components/AdminCompanyRegistrationsPage.js — legacy Supabase queue removed
import React from 'react'
import Link from 'next/link'
import { Briefcase, ArrowRight } from 'lucide-react'

const AdminCompanyRegistrationsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Organisation onboarding
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Nsuo does not use the old &quot;pending company registrations&quot;
            queue. New organisations are created when users complete{' '}
            <strong>signup</strong> (see Register organisation).
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex items-start gap-4">
            <div className="bg-sky-100 rounded-full p-3">
              <Briefcase className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Manage organisations
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Use the admin organisations list to view and deactivate orgs if
                your account has the right permissions.
              </p>
              <Link
                href="/admin/admin"
                className="mt-4 inline-flex items-center text-sky-600 hover:text-sky-800 font-medium text-sm"
              >
                Open company management
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCompanyRegistrationsPage
