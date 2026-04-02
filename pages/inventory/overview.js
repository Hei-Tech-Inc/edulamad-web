import React from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import NsuoModuleStub from '../../components/NsuoModuleStub'

export default function InventoryOverviewPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Inventory overview"
        summary="Inventory items and stock positions were tracked in Supabase. Nsuo does not expose equivalent inventory endpoints in the bundled API spec."
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
