import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import NsuoModuleStub from '../components/NsuoModuleStub'

export default function FeedTypesPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Feed types"
        summary="The legacy feed-type catalog was stored in Supabase. This app does not load or edit that catalog anymore."
        details={
          <p>
            Use descriptive feed names when entering daily records in Nsuo.
          </p>
        }
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
