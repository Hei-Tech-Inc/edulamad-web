import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import NsuoModuleStub from '../components/NsuoModuleStub'

export default function FeedPurchasesPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Feed purchases"
        summary="Purchase history and ledger features used Supabase tables that are not mirrored in the Nsuo API available to this application."
        details={
          <p>
            Daily feeding and costs can still be captured on pond daily records
            in Nsuo.
          </p>
        }
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
