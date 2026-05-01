// contexts/AuthContext.js — Edulamad API + Zustand session
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { signIn as nextAuthSignIn } from 'next-auth/react'
import { clearClientSession } from '@/lib/clear-client-session'
import { apiClient, apiClientPublic } from '@/api/client'
import API from '@/api/endpoints'
import {
  mapAuthUserToRequestUser,
  mapMeResponseToRequestUser,
} from '@/api/types/auth.types'
import { toCompatUser } from '@/lib/auth-compat'
import { AppApiError } from '@/lib/api-error'
import { formatAuthErrorMessage } from '@/lib/format-auth-error'
import { logoutOneSignal } from '@/lib/onesignal'
import { queryKeys } from '@/api/query-keys'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { store } from '../store'
import {
  fetchUser,
  resetState,
  syncReduxUserFromZustand,
} from '../store/slices/authSlice'

async function hydrateReduxUserAfterSession() {
  try {
    await store.dispatch(fetchUser()).unwrap()
  } catch {
    try {
      await store.dispatch(syncReduxUserFromZustand()).unwrap()
    } catch {
      /* Zustand is source of truth for token + user */
    }
  }
}

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const requestUser = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const user = useMemo(() => toCompatUser(requestUser), [requestUser])

  useEffect(() => {
    let alive = true
    ;(async () => {
      await useAuthStore.persist.rehydrate()
      try {
        await store.dispatch(fetchUser()).unwrap()
      } catch {
        try {
          await store.dispatch(syncReduxUserFromZustand()).unwrap()
        } catch {
          /* no persisted session */
        }
      }
      if (alive) {
        setLoading(false)
        setInitialized(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const signInWithEmail = async (email, password) => {
    let data
    try {
      const res = await apiClientPublic.post(API.auth.login, {
        email,
        password,
      })
      data = res.data
      useAuthStore.getState().setOrg(null)
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
      useAuthStore
        .getState()
        .setUser(mapAuthUserToRequestUser(data.user, data.accessToken))
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.onboardingGate })
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile })
    } catch (e) {
      return { data: null, error: { message: formatAuthErrorMessage(e) } }
    }
    await hydrateReduxUserAfterSession()
    return { data, error: null }
  }

  /**
   * OAuth (Google/GitHub) via NextAuth — completes after redirect; tokens sync in OAuthSessionSync.
   * Optional `callbackUrl` defaults to `/dashboard`.
   */
  const signInWithGoogle = async (callbackUrl = '/dashboard') => {
    try {
      await nextAuthSignIn('google', { callbackUrl })
      return { data: null, error: null }
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : 'Google sign-in could not start. Check NEXTAUTH_URL and Google OAuth credentials.'
      return { data: null, error: { message: msg } }
    }
  }

  /** Body matches OpenAPI `RegisterDto`: email, password, name; optional referralCode. */
  const signUpWithEmail = async (email, password, fullName, referralCode) => {
    try {
      const trimmedRef =
        typeof referralCode === 'string' && referralCode.trim() ? referralCode.trim() : undefined
      const { data: regData } = await apiClientPublic.post(API.auth.register, {
        email,
        password,
        name: fullName,
        ...(trimmedRef ? { referralCode: trimmedRef } : {}),
      })

      let accessToken = regData?.accessToken
      let refreshToken = regData?.refreshToken
      let user = regData?.user

      if (
        typeof accessToken !== 'string' ||
        typeof refreshToken !== 'string' ||
        !user ||
        typeof user !== 'object'
      ) {
        try {
          const res = await apiClientPublic.post(API.auth.login, {
            email,
            password,
          })
          accessToken = res.data.accessToken
          refreshToken = res.data.refreshToken
          user = res.data.user
        } catch (loginErr) {
          const hint =
            loginErr instanceof AppApiError
              ? loginErr.message
              : 'Sign-in failed after registration.'
          return {
            data: null,
            error: {
              message: `Your account was created, but we could not start your session: ${hint} Try signing in with the same email and password.`,
              details:
                loginErr instanceof AppApiError ? loginErr.details : undefined,
              code: loginErr instanceof AppApiError ? loginErr.code : undefined,
            },
            setupError: null,
          }
        }
      }

      useAuthStore.getState().setOrg(null)
      useAuthStore
        .getState()
        .setOnboardingNotice('Complete your profile to unlock all features.')
      useAuthStore.getState().setTokens(accessToken, refreshToken)
      useAuthStore
        .getState()
        .setUser(mapAuthUserToRequestUser(user, accessToken))
      if (regData?.org && typeof regData.org === 'object') {
        useAuthStore.getState().setOrg(regData.org)
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.onboardingGate })
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile })
      await hydrateReduxUserAfterSession()

      return { data: { ...regData, session: { accessToken, refreshToken, user } }, error: null, setupError: null }
    } catch (e) {
      if (e instanceof AppApiError) {
        return {
          data: null,
          error: {
            message: e.message,
            details: e.details,
            code: e.code,
            status: e.status,
          },
          setupError: null,
        }
      }
      const fallback =
        e instanceof Error && e.message
          ? e.message
          : 'Registration failed. Check your connection and try again.'
      return {
        data: null,
        error: { message: fallback },
        setupError: null,
      }
    }
  }

  const signOut = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    try {
      if (refreshToken) {
        await apiClient.post(API.auth.logout, { refreshToken })
      }
    } catch {
      // still clear local session
    }
    void logoutOneSignal()
    await clearClientSession()
    store.dispatch(resetState())
    void queryClient.clear()
    return { error: null }
  }

  const updateUserMetadata = async (metadata) => {
    try {
      const body = {}
      if (metadata?.full_name != null) {
        const parts = String(metadata.full_name).trim().split(/\s+/)
        body.firstName = parts[0] || undefined
        body.lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined
      }
      if (Object.keys(body).length > 0) {
        await apiClient.patch(API.users.profile, body)
      }
      try {
        const { data } = await apiClient.get(API.auth.me)
        const ru = mapMeResponseToRequestUser(
          data,
          useAuthStore.getState().accessToken,
        )
        useAuthStore.getState().setUser(ru)
      } catch {
        /* Profile may have saved; /auth/me is best-effort for client state */
      }
      await hydrateReduxUserAfterSession()
      const u = useAuthStore.getState().user
      return { data: toCompatUser(u), error: null }
    } catch (error) {
      console.error('Error updating user metadata:', error)
      return { data: null, error }
    }
  }

  const getUserRole = () => {
    const u = useAuthStore.getState().user
    return u?.role ?? 'user'
  }

  const hasRole = (role) => {
    const r = useAuthStore.getState().user?.role
    if (!r) return false
    if (role === 'super_admin') return r === 'owner'
    if (role === 'admin') return ['owner', 'admin', 'manager'].includes(r)
    if (role === 'user') return true
    return r === role
  }

  const authValue = {
    user,
    loading,
    initialized,
    isPlatformSuperAdmin: Boolean(requestUser?.isPlatformSuperAdmin),
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
    updateUserMetadata,
    getUserRole,
    hasRole,
    hasPermission: (permission) =>
      useAuthStore.getState().hasPermission(permission),
    profile: user,
    refreshUserDetails: async () => {
      await hydrateReduxUserAfterSession()
      return toCompatUser(useAuthStore.getState().user)
    },
  }

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
