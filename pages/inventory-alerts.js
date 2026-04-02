import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import NsuoModuleStub from '../components/NsuoModuleStub'

export default function InventoryAlertsPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Inventory alerts"
        summary="Low-stock alerts came from Supabase inventory. They are not active while inventory is not backed by Nsuo in this app."
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
