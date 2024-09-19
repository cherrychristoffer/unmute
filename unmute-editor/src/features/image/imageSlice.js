import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "image",
  initialState: {
    zoomValue: 0,
    imageRef: null,
    minValue: 0,
    ratio: 0,
    mustCropAsNumber: 0,
    scrollToExtra: 0,
    disableAllExtions: false,
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
    setMustCrop: (state) => {
      state.mustCropAsNumber = state.mustCropAsNumber + 1;
    },
    setScrolltoExtra: (state) => {
      state.scrollToExtra = state.scrollToExtra + 1;
    },
    setDisableAllActions: (state, action) => {
      state.disableAllExtions = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateZoomValue,
  setMustCrop,
  setImageRef,
  setRatio,
  setMinValue,
  setScrolltoExtra,
  setDisableAllActions,
} = userSlice.actions;

export default userSlice.reducer;
