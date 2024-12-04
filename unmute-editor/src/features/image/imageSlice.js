import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "image",
  initialState: {
    zoomValue: 1,
    imageRef: null,
    minValue: 1,
    ratio: 1,
    mustCropAsNumber: 0,
    scrollToExtra: 0,
    scrollToActive: 0,
    disableAllExtions: false,
    lastSaved: null,
    orientationChanged: false,
    chooseNewImage: false,
    collageChangeImage: false
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
    setScrolltoActive: (state) => {
      state.scrollToActive = state.scrollToActive + 1;
    },
    setDisableAllActions: (state, action) => {
      state.disableAllExtions = action.payload;
    },
    setLastSaved: (state, action) => {
      state.lastSaved = action.payload;
    },
    setOrientationChanged: (state, action) => {
      state.orientationChanged = action.payload;
    },
    setChooseNewImage: (state, action) => {
      state.chooseNewImage = action.payload;
    },
    setCollageChangeImage: (state, action) => {
      state.collageChangeImage = action.payload;
    }
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
  setScrolltoActive,
  setLastSaved,
  setOrientationChanged,
  setChooseNewImage,
  setCollageChangeImage
} = userSlice.actions;

export default userSlice.reducer;
