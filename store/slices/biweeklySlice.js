import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const LEGACY_MSG =
  'Biweekly records are managed in Nsuo. This Redux path no longer uses Supabase.'

export const fetchBiweeklyRecords = createAsyncThunk(
  'biweekly/fetchRecords',
  async () => {
    return []
  },
)

export const createBiweeklyRecord = createAsyncThunk(
  'biweekly/createRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

const initialState = {
  records: [],
  loading: false,
  error: null,
  success: false,
}

const biweeklySlice = createSlice({
  name: 'biweekly',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    resetState: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBiweeklyRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBiweeklyRecords.fulfilled, (state, action) => {
        state.loading = false
        state.records = action.payload
      })
      .addCase(fetchBiweeklyRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createBiweeklyRecord.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createBiweeklyRecord.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(createBiweeklyRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        state.success = false
      })
  },
})

export const { clearError, clearSuccess, resetState } = biweeklySlice.actions
export default biweeklySlice.reducer
