'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { mapAuthUserToRequestUser } from '@/api/types/auth.types'
import { queryKeys } from '@/api/query-keys'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { fetchUser } from '../../../store/slices/authSlice'
import { store } from '../../../store'

/**
 * After OAuth, NextAuth holds your API tokens in its session cookie.
 * Copy them into Zustand so axios + the rest of the app behave like email/password login.
 */
export function OAuthSessionSync() {
  const { data: session, status } = useSession()
  const appliedRef = useRef(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (!session?.accessToken || !session?.backendUser) return

    if (appliedRef.current === session.accessToken) return

    useAuthStore.getState().setOrg(null)
    useAuthStore.getState().setTokens(session.accessToken, session.refreshToken ?? '')
    useAuthStore
      .getState()
      .setUser(mapAuthUserToRequestUser(session.backendUser, session.accessToken))

    appliedRef.current = session.accessToken

    void queryClient.invalidateQueries({ queryKey: queryKeys.students.onboardingGate })
    void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile })
    void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })

    void store.dispatch(fetchUser()).unwrap().catch(() => {})
  }, [session, status])

  return null
}
