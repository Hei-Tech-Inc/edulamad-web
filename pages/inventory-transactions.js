import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import NsuoModuleStub from '../components/NsuoModuleStub'

export default function InventoryTransactionsPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Inventory transactions"
        summary="Purchase and usage transactions were stored in Supabase. This screen is disabled until Nsuo provides inventory APIs."
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
