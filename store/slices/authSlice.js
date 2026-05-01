import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient, apiClientPublic } from '@/api/client'
import API from '@/api/endpoints'
import {
  mapAuthUserToRequestUser,
  mapMeResponseToRequestUser,
} from '@/api/types/auth.types'
import { permissionsFromAccessToken } from '@/lib/jwt-permissions'
import { toCompatUser } from '@/lib/auth-compat'
import { AppApiError } from '@/lib/api-error'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { clearClientSession } from '@/lib/clear-client-session'

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  await useAuthStore.persist.rehydrate()
  const { accessToken, user: existingUser } = useAuthStore.getState()
  if (!accessToken) return null
  if (existingUser) {
    return toCompatUser(existingUser)
  }

  try {
    const { data } = await apiClient.get(API.auth.me)
    const { accessToken: bearer } = useAuthStore.getState()
    let ru = mapMeResponseToRequestUser(data, bearer)
    const fromJwt = permissionsFromAccessToken(bearer)
    if (fromJwt.length) {
      ru = {
        ...ru,
        permissions: Array.from(new Set([...(ru.permissions ?? []), ...fromJwt])),
      }
    }
    useAuthStore.getState().setUser(ru)
    return toCompatUser(ru)
  } catch (e) {
    if (e instanceof AppApiError && e.status === 401) {
      await clearClientSession()
      return null
    }
    // 403 or network: keep tokens; sync Redux from persisted / login user (GET /auth/me may be stricter).
    const ru = useAuthStore.getState().user
    return ru ? toCompatUser(ru) : null
  }
})

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }) => {
    const { data } = await apiClientPublic.post(API.auth.login, {
      email,
      password,
    })
    useAuthStore.getState().setOrg(null)
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
    const ru = mapAuthUserToRequestUser(data.user, data.accessToken)
    useAuthStore.getState().setUser(ru)
    return { user: toCompatUser(ru) }
  },
)

/** When GET /auth/me or Redux hydration fails, align legacy Redux user from Zustand (session already valid). */
export const syncReduxUserFromZustand = createAsyncThunk(
  'auth/syncReduxUserFromZustand',
  async () => {
    const ru = useAuthStore.getState().user
    return ru ? toCompatUser(ru) : null
  },
)

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const refreshToken = useAuthStore.getState().refreshToken
  try {
    if (refreshToken) {
      await apiClient.post(API.auth.logout, { refreshToken })
    }
  } catch {
    // ignore network / server errors; always clear locally
  }
  await clearClientSession()
  void queryClient.clear()
})

const initialState = {
  user: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.error = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(syncReduxUserFromZustand.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.user = action.payload
      })
      .addCase(syncReduxUserFromZustand.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { clearError, resetState } = authSlice.actions
export default authSlice.reducer
