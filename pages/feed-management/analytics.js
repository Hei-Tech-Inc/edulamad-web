import React from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import NsuoModuleStub from '../../components/NsuoModuleStub'

export default function FeedManagementAnalyticsPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Feed analytics"
        summary="Charts here depended on legacy warehouse and purchase data. Use farm dashboards and export flows that read Nsuo operational APIs instead."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </ProtectedRoute>
  )
}
