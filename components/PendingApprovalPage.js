// components/PendingApprovalPage.js — legacy Supabase registration lookup removed
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

const PendingApprovalPage = () => {
  const [refId, setRefId] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = new URLSearchParams(window.location.search).get('id')
    setRefId(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 font-montserrat">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-800 flex items-center mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <div className="bg-white shadow rounded-lg p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2 text-center">
            Check your email
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Nsuo confirms new organisations when you complete signup and verify
            your email. If you just registered, open the verification link we
            sent you, then sign in.
          </p>
          {refId && (
            <p className="text-sm text-gray-500 text-center mb-6 font-mono">
              Reference: {refId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Login
              </button>
            </Link>
            <Link href="/register-company">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Register organisation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovalPage
