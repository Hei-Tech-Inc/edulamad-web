import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const UNAVAILABLE =
  'Feed supplier/type catalog is not connected to Nsuo in this app. Daily records use free-text feed type.'

export const fetchFeedTypes = createAsyncThunk(
  'feed/fetchFeedTypes',
  async () => {
    return []
  },
)

export const createFeedType = createAsyncThunk(
  'feed/createFeedType',
  async () => {
    throw new Error(UNAVAILABLE)
  },
)

export const updateFeedType = createAsyncThunk(
  'feed/updateFeedType',
  async () => {
    throw new Error(UNAVAILABLE)
  },
)

export const deleteFeedType = createAsyncThunk(
  'feed/deleteFeedType',
  async () => {
    throw new Error(UNAVAILABLE)
  },
)

const initialState = {
  feedTypes: [],
  loading: false,
  error: null,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeedError: (state) => {
      state.error = null
    },
    resetFeedState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeedTypes.fulfilled, (state, action) => {
        state.loading = false
        state.feedTypes = action.payload
      })
      .addCase(fetchFeedTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { clearFeedError, resetFeedState } = feedSlice.actions
export default feedSlice.reducer
