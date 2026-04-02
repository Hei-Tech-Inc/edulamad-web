import React from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import NsuoModuleStub from '../../components/NsuoModuleStub'

export default function InventoryAnalyticsPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Inventory analytics"
        summary="Legacy analytics queried Supabase inventory transactions. There is no replacement dataset wired from Nsuo here yet."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </ProtectedRoute>
  )
}
