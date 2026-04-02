import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import NsuoModuleStub from '../components/NsuoModuleStub'

export default function FeedSuppliersPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Feed suppliers"
        summary="Supplier records were kept in Supabase. Nsuo stock-cycle creation already captures a hatchery or source name where required."
        details={
          <p>
            For operational feed purchases, use your organisation&apos;s process
            until Nsuo exposes supplier APIs in this client.
          </p>
        }
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
