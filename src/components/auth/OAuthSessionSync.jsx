'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { mapAuthUserToRequestUser } from '@/api/types/auth.types'
import { queryKeys } from '@/api/query-keys'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { syncReduxUserFromZustand } from '../../../store/slices/authSlice'
import { store } from '../../../store'

/**
 * After OAuth, NextAuth holds your API tokens in its session cookie.
 * Copy them into Zustand so axios + the rest of the app behave like email/password login.
 *
 * Keeps churn low: no Session refetch storms (see SessionProvider in _app), narrow invalidations,
 * Redux sync without GET /auth/me when Zustand already has the user.
 */
export function OAuthSessionSync() {
  const { data: session, status } = useSession()
  const appliedRef = useRef(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status !== 'authenticated') return
    if (!session?.accessToken || !session?.backendUser) return

    if (appliedRef.current === session.accessToken) return

    useAuthStore.getState().setOrg(null)
    useAuthStore.getState().setTokens(session.accessToken, session.refreshToken ?? '')
    useAuthStore
      .getState()
      .setUser(mapAuthUserToRequestUser(session.backendUser, session.accessToken))

    appliedRef.current = session.accessToken

    // Only the onboarding gate must realign with the new session; avoid invalidating all profile queries.
    void queryClient.invalidateQueries({ queryKey: queryKeys.students.onboardingGate })
    void store.dispatch(syncReduxUserFromZustand()).unwrap().catch(() => {})
  }, [session, status])

  return null
}
