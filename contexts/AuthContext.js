// contexts/AuthContext.js — Nsuo API + Zustand (replaces Supabase session)
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiClient } from '@/api/client'
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
import { fetchUser, resetState } from '../store/slices/authSlice'

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
        // fetchUser clears session on auth failure
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
    try {
      const { data } = await apiClient.post(API.auth.login, {
        email,
        password,
      })
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
      useAuthStore.getState().setUser(mapAuthUserToRequestUser(data.user))
      await store.dispatch(fetchUser()).unwrap()
      return { data, error: null }
    } catch (e) {
      const message = e instanceof AppApiError ? e.message : 'Login failed'
      return { data: null, error: { message } }
    }
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

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      const orgName = `${String(fullName || 'User').trim()}'s Organisation`
      const { data } = await apiClient.post(API.auth.register, {
        email,
        password,
        name: fullName,
        orgName,
      })
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
      useAuthStore.getState().setUser(mapAuthUserToRequestUser(data.user))
      await store.dispatch(fetchUser()).unwrap()
      return { data, error: null }
    } catch (e) {
      const message =
        e instanceof AppApiError ? e.message : 'Registration failed'
      return { data: null, error: { message } }
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
      const { data } = await apiClient.get(API.auth.me)
      const ru = mapMeResponseToRequestUser(data)
      useAuthStore.getState().setUser(ru)
      await store.dispatch(fetchUser()).unwrap()
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
      await store.dispatch(fetchUser()).unwrap()
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
