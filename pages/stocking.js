// pages/stocking.js
import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import StockingForm from '../components/StockingForm'

export default function StockingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Link
              href="/cages"
              className="text-sky-600 hover:text-sky-800 flex items-center mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Cages
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              New Cage Stocking
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Fill in the details below to stock a new cage. Required fields are
              marked with an asterisk (*).
            </p>
          </div>

          <StockingForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
