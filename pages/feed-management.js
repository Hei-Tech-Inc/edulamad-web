import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import NsuoModuleStub from '../components/NsuoModuleStub'

export default function FeedManagementPage() {
  return (
    <ProtectedRoute>
      <NsuoModuleStub
        title="Feed management"
        summary="Supplier lists, feed-type catalog, and purchase tracking previously lived in Supabase. There are no matching inventory or supplier routes in the Nsuo OpenAPI bundled with this app."
        details={
          <p>
            Record feeding per pond under daily records in Nsuo (feed type is
            free text). When Nsuo adds feed or inventory APIs, this section can
            be wired again.
          </p>
        }
        backHref="/dashboard"
      />
    </ProtectedRoute>
  )
}
