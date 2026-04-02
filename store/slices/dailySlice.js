import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const LEGACY_MSG =
  'Daily records are managed in Nsuo. This Redux path no longer uses Supabase.'

export const fetchDailyRecords = createAsyncThunk(
  'daily/fetchDailyRecords',
  async () => {
    return []
  },
)

export const createDailyRecord = createAsyncThunk(
  'daily/createDailyRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

export const updateDailyRecord = createAsyncThunk(
  'daily/updateDailyRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

export const deleteDailyRecord = createAsyncThunk(
  'daily/deleteDailyRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

const initialState = {
  dailyRecords: [],
  loading: false,
  error: null,
}

const dailySlice = createSlice({
  name: 'daily',
  initialState,
  reducers: {
    clearDailyError: (state) => {
      state.error = null
    },
    resetDailyState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDailyRecords.fulfilled, (state, action) => {
        state.loading = false
        state.dailyRecords = action.payload
      })
      .addCase(fetchDailyRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createDailyRecord.fulfilled, (state, action) => {
        state.dailyRecords.unshift(action.payload)
      })
      .addCase(updateDailyRecord.fulfilled, (state, action) => {
        const idx = state.dailyRecords.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.dailyRecords[idx] = action.payload
      })
      .addCase(deleteDailyRecord.fulfilled, (state, action) => {
        state.dailyRecords = state.dailyRecords.filter((r) => r.id !== action.payload)
      })
  },
})

export const { clearDailyError, resetDailyState } = dailySlice.actions
export default dailySlice.reducer
