import { createSlice } from '@reduxjs/toolkit'

export const inspirationSlice = createSlice({
  name: 'inspiration',
  initialState: {
    inspirations: null,
    inspirationsLoading: false,
  },
  reducers: {
    setInspirationsLoading: (state, action) => {
      state.inspirationsLoading = action.payload
    },
    setInspirations: (state, action) => {
      state.inspirations = action.payload
    },
  },
})

export const { setInspirations, setInspirationsLoading } =
  inspirationSlice.actions

export default inspirationSlice.reducer
