// contexts/AuthContext.js — Nsuo API + Zustand (replaces Supabase session)
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiClient, apiClientPublic } from '@/api/client'
import API from '@/api/endpoints'
import {
  mapAuthUserToRequestUser,
  mapMeResponseToRequestUser,
} from '@/api/types/auth.types'
import { toCompatUser } from '@/lib/auth-compat'
import { AppApiError } from '@/lib/api-error'
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
    } catch (e) {
      const message = e instanceof AppApiError ? e.message : 'Login failed'
      return { data: null, error: { message } }
    }
    await hydrateReduxUserAfterSession()
    return { data, error: null }
  }

  const signInWithGoogle = async () => {
    return {
      data: null,
      error: {
        message:
          'Google sign-in is not available for Nsuo yet. Use email and password.',
      },
    }
  }

  const signUpWithEmail = async (email, password, fullName, orgOptions = {}) => {
    try {
      const explicitOrg =
        typeof orgOptions.orgName === 'string' && orgOptions.orgName.trim()
          ? orgOptions.orgName.trim()
          : null
      const orgName =
        explicitOrg || `${String(fullName || 'User').trim()}'s Organisation`
      const body = {
        email,
        password,
        name: fullName,
        orgName,
      }
      if (
        typeof orgOptions.orgSlug === 'string' &&
        orgOptions.orgSlug.trim()
      ) {
        body.orgSlug = orgOptions.orgSlug.trim()
      }
      // Per API (see `contexts/api-docs.json`): register creates org + user; login issues
      // the JWT used by `/auth/me`, `/farms`, etc.
      const { data: regData } = await apiClientPublic.post(API.auth.register, body)
      let loginData
      try {
        const res = await apiClientPublic.post(API.auth.login, {
          email,
          password,
        })
        loginData = res.data
      } catch (loginErr) {
        const hint =
          loginErr instanceof AppApiError
            ? loginErr.message
            : 'Sign-in failed after registration.'
        return {
          data: null,
          error: {
            message: `Your organisation was created, but sign-in failed: ${hint} Try signing in with the same email and password.`,
            details:
              loginErr instanceof AppApiError ? loginErr.details : undefined,
            code: loginErr instanceof AppApiError ? loginErr.code : undefined,
          },
          farmCreateError: null,
        }
      }
      useAuthStore.getState().setTokens(
        loginData.accessToken,
        loginData.refreshToken,
      )
      useAuthStore
        .getState()
        .setUser(
          mapAuthUserToRequestUser(loginData.user, loginData.accessToken),
        )
      if (regData.org && typeof regData.org === 'object') {
        useAuthStore.getState().setOrg(regData.org)
      }
      await hydrateReduxUserAfterSession()

      const farmOpt = orgOptions.createDefaultFarm
      let farmCreateError = null
      const orgStatusRaw =
        regData.org && typeof regData.org === 'object'
          ? String(regData.org.status ?? '')
          : ''
      const orgStatus = orgStatusRaw.toLowerCase()
      const orgBlocksFarmCreate =
        orgStatus === 'pending' ||
        orgStatus === 'pending_approval' ||
        orgStatus === 'suspended'

      if (
        farmOpt !== undefined &&
        farmOpt !== null &&
        farmOpt !== false &&
        orgBlocksFarmCreate
      ) {
        useAuthStore.getState().setOnboardingFarmNotice(
          `Your organisation status is “${orgStatusRaw || 'pending'}”, so the API may not allow creating a farm yet. After your organisation is active, add a farm from farm or cage settings.`,
        )
      } else if (farmOpt !== undefined && farmOpt !== null && farmOpt !== false) {
        const farmName =
          typeof farmOpt === 'string' && farmOpt.trim()
            ? farmOpt.trim()
            : 'Main farm'
        try {
          await apiClient.post(API.farms.create, { name: farmName })
        } catch (farmErr) {
          farmCreateError =
            farmErr instanceof AppApiError
              ? farmErr.message
              : 'Could not create your first farm. You can add one from the app.'
        }
        if (farmCreateError) {
          useAuthStore.getState().setOnboardingFarmNotice(farmCreateError)
        }
      }

      return { data: { ...regData, session: loginData }, error: null, farmCreateError }
    } catch (e) {
      if (e instanceof AppApiError) {
        return {
          data: null,
          error: {
            message: e.message,
            details: e.details,
            code: e.code,
          },
          farmCreateError: null,
        }
      }
      const fallback =
        e instanceof Error && e.message
          ? e.message
          : 'Registration failed. Check your connection and try again.'
      return {
        data: null,
        error: { message: fallback },
        farmCreateError: null,
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
    useAuthStore.getState().clearAuth()
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
