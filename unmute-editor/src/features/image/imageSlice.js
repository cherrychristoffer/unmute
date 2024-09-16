import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "image",
  initialState: {
    zoomValue: 0,
    imageRef: null,
    minValue: 0,
    ratio: 0,
  },
  reducers: {
    updateZoomValue: (state, action) => {
      state.zoomValue = action.payload;
    },
    setImageRef: (state, action) => {
      state.imageRef = action.payload;
    },
    setMinValue: (state, action) => {
      state.minValue = action.payload;
    },
    setRatio: (state, action) => {
      state.ratio = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateZoomValue, setImageRef, setRatio, setMinValue } =
  userSlice.actions;

export default userSlice.reducer;
