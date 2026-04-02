import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const LEGACY_MSG =
  'Harvest records are managed in Nsuo. This Redux path no longer uses Supabase.'

export const fetchHarvestRecords = createAsyncThunk(
  'harvest/fetchHarvestRecords',
  async () => {
    return []
  },
)

export const createHarvestRecord = createAsyncThunk(
  'harvest/createHarvestRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

export const updateHarvestRecord = createAsyncThunk(
  'harvest/updateHarvestRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

export const deleteHarvestRecord = createAsyncThunk(
  'harvest/deleteHarvestRecord',
  async () => {
    throw new Error(LEGACY_MSG)
  },
)

const initialState = {
  harvestRecords: [],
  loading: false,
  error: null,
}

const harvestSlice = createSlice({
  name: 'harvest',
  initialState,
  reducers: {
    clearHarvestError: (state) => {
      state.error = null
    },
    resetHarvestState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHarvestRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHarvestRecords.fulfilled, (state, action) => {
        state.loading = false
        state.harvestRecords = action.payload
      })
      .addCase(fetchHarvestRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createHarvestRecord.fulfilled, (state, action) => {
        state.harvestRecords.unshift(action.payload)
      })
      .addCase(updateHarvestRecord.fulfilled, (state, action) => {
        const idx = state.harvestRecords.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.harvestRecords[idx] = action.payload
      })
      .addCase(deleteHarvestRecord.fulfilled, (state, action) => {
        state.harvestRecords = state.harvestRecords.filter((r) => r.id !== action.payload)
      })
  },
})

export const { clearHarvestError, resetHarvestState } = harvestSlice.actions
export default harvestSlice.reducer
