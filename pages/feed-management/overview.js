import React from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import NsuoModuleStub from '../../components/NsuoModuleStub'

export default function FeedManagementOverviewPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Feed overview"
        summary="This view aggregated Supabase feed usage. It is not connected to Nsuo data in the current build."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </ProtectedRoute>
  )
}
