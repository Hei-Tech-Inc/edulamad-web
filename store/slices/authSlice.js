import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
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

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  await useAuthStore.persist.rehydrate()
  const { accessToken } = useAuthStore.getState()
  if (!accessToken) return null

  try {
    const { data } = await apiClient.get(API.auth.me)
    const ru = mapMeResponseToRequestUser(data)
    useAuthStore.getState().setUser(ru)
    return toCompatUser(ru)
  } catch (e) {
    // Only drop session on auth rejection — keep tokens if the API is unreachable.
    if (e instanceof AppApiError && (e.status === 401 || e.status === 403)) {
      useAuthStore.getState().clearAuth()
    }
    return null
  }
})

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }) => {
    const { data } = await apiClient.post(API.auth.login, {
      email,
      password,
    })
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
    useAuthStore.getState().setUser(mapAuthUserToRequestUser(data.user))
    return { user: toCompatUser(mapAuthUserToRequestUser(data.user)) }
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
  useAuthStore.getState().clearAuth()
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
  },
})

export const { clearError, resetState } = authSlice.actions
export default authSlice.reducer
