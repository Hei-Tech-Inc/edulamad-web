import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'

// Async thunks — farm-scoped units via Nsuo API (uses UI active farm or first listed farm)
export const fetchCages = createAsyncThunk(
  'cages/fetchCages',
  async ({ page = 1, pageSize = 50 }, { rejectWithValue }) => {
    try {
      const farmId = await resolveFarmIdForRedux()
      if (!farmId) {
        return rejectWithValue(
          'No farms available. Create a farm first, then open Units.',
        )
      }
      const { legacy, total, pages } = await fetchLegacyUnitsForFarm(farmId, {
        page,
        limit: pageSize,
      })
      const totalPages =
        pages > 0 ? pages : Math.max(1, Math.ceil(total / pageSize) || 1)
      return {
        data: legacy,
        totalCount: total,
        totalPages,
      }
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Failed to load units')
    }
  },
)

export const fetchActiveCages = createAsyncThunk(
  'cages/fetchActiveCages',
  async (_, { rejectWithValue }) => {
    try {
      const farmId = await resolveFarmIdForRedux()
      if (!farmId) {
        return rejectWithValue(
          'No active farm. Open the main Units list to select a farm.',
        )
      }
      const { legacy } = await fetchLegacyUnitsForFarm(farmId, {
        limit: 500,
        status: 'active',
      })
      return legacy
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Failed to load active units')
    }
  },
)

export const fetchHarvestReadyCages = createAsyncThunk(
  'cages/fetchHarvestReadyCages',
  async (_, { rejectWithValue }) => {
    try {
      const farmId = await resolveFarmIdForRedux()
      if (!farmId) {
        return rejectWithValue(
          'No active farm. Open the main Units list to select a farm.',
        )
      }
      const { legacy } = await fetchLegacyUnitsForFarm(farmId, {
        limit: 500,
        status: 'harvesting',
      })
      return legacy
    } catch (error) {
      return rejectWithValue(
        error?.message ?? 'Failed to load harvest-ready units',
      )
    }
  },
)

export const fetchMaintenanceCages = createAsyncThunk(
  'cages/fetchMaintenanceCages',
  async (_, { rejectWithValue }) => {
    try {
      const farmId = await resolveFarmIdForRedux()
      if (!farmId) {
        return rejectWithValue(
          'No active farm. Open the main Units list to select a farm.',
        )
      }
      const { legacy } = await fetchLegacyUnitsForFarm(farmId, {
        limit: 500,
        status: 'maintenance',
      })
      return legacy
    } catch (error) {
      return rejectWithValue(
        error?.message ?? 'Failed to load maintenance units',
      )
    }
  },
)

/** @deprecated No Supabase metrics path; use Nsuo APIs. Kept for legacy imports. */
export const updateCageMetrics = createAsyncThunk(
  'cages/updateCageMetrics',
  async (_args, { rejectWithValue }) =>
    rejectWithValue('Metric updates are handled by the Nsuo backend.'),
)

/** @deprecated No Supabase metrics path; use Nsuo APIs. Kept for legacy imports. */
export const calculateGrowthMetrics = createAsyncThunk(
  'cages/calculateGrowthMetrics',
  async (_cageId, { rejectWithValue }) =>
    rejectWithValue('Growth metrics are computed by the Nsuo backend.'),
)

const initialState = {
  cages: [],
  activeCages: [],
  harvestReadyCages: [],
  maintenanceCages: [],
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  loading: false,
  error: null,
  analytics: {
    totalCages: 0,
    activeCages: 0,
    harvestReadyCages: 0,
    maintenanceCages: 0,
    averageGrowthRate: 0,
    averageMortalityRate: 0
  }
}

const cagesSlice = createSlice({
  name: 'cages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all cages
      .addCase(fetchCages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCages.fulfilled, (state, action) => {
        state.loading = false
        state.cages = action.payload.data
        state.totalPages = action.payload.totalPages
        state.totalCount = action.payload.totalCount
        state.analytics.totalCages = action.payload.totalCount
        state.error = null
      })
      .addCase(fetchCages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch active cages
      .addCase(fetchActiveCages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActiveCages.fulfilled, (state, action) => {
        state.loading = false
        state.activeCages = action.payload
        state.analytics.activeCages = action.payload.length
        state.error = null
      })
      .addCase(fetchActiveCages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch harvest ready cages
      .addCase(fetchHarvestReadyCages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHarvestReadyCages.fulfilled, (state, action) => {
        state.loading = false
        state.harvestReadyCages = action.payload
        state.analytics.harvestReadyCages = action.payload.length
        state.error = null
      })
      .addCase(fetchHarvestReadyCages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch maintenance cages
      .addCase(fetchMaintenanceCages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaintenanceCages.fulfilled, (state, action) => {
        state.loading = false
        state.maintenanceCages = action.payload
        state.analytics.maintenanceCages = action.payload.length
        state.error = null
      })
      .addCase(fetchMaintenanceCages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setCurrentPage } = cagesSlice.actions

// Selectors
export const selectCages = (state) => state.cages.cages
export const selectActiveCages = (state) => state.cages.activeCages
export const selectHarvestReadyCages = (state) => state.cages.harvestReadyCages
export const selectMaintenanceCages = (state) => state.cages.maintenanceCages
export const selectCagesLoading = (state) => state.cages.loading
export const selectCagesError = (state) => state.cages.error

// Memoized selector for pagination
export const selectCagesPagination = createSelector(
  [(state) => state.cages.currentPage, 
   (state) => state.cages.totalPages,
   (state) => state.cages.totalCount],
  (currentPage, totalPages, totalCount) => ({
    currentPage,
    totalPages,
    totalCount
  })
)

export const selectCagesAnalytics = (state) => state.cages.analytics

export default cagesSlice.reducer 