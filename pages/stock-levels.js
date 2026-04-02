import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  RefreshCw,
} from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useToast } from '../components/Toast'

export default function StockLevelsPage() {
  return (
    <ProtectedRoute>
      <StockLevels />
    </ProtectedRoute>
  )
}

function StockLevels() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      showToast(
        'Feed inventory is not exposed in the Nsuo API bundled with this app. Use Nsuo or your feed workflow when it is available.',
        'info',
      )
    } finally {
      setLoading(false)
    }
  }, [showToast])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-800 flex items-center mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Stock Levels</h1>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? '…' : 'Refresh'}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-700">Feed warehouse inventory</h2>
          </div>
          <div className="py-12 px-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-4 text-gray-700 max-w-lg mx-auto">
              This screen used legacy feed-type warehouse stock from Supabase.
              The Nsuo OpenAPI wired to this app does not yet expose feed inventory.
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
              Daily feeding is still recorded per pond under daily records in Nsuo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
