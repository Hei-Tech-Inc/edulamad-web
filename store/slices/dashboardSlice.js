import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const emptyStats = () => ({
  activeCages: [],
  recentRecords: [],
  feedInventory: [],
  statistics: {
    totalFish: 0,
    totalBiomass: 0,
    activeCageCount: 0,
    lowStockFeeds: 0,
  },
})

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    return emptyStats()
  },
)

const initialState = {
  ...emptyStats(),
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetState: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.activeCages = action.payload.activeCages
        state.recentRecords = action.payload.recentRecords
        state.feedInventory = action.payload.feedInventory
        state.statistics = action.payload.statistics
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { clearError, resetState } = dashboardSlice.actions
export default dashboardSlice.reducer
