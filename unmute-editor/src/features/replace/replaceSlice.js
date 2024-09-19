import { createSlice } from "@reduxjs/toolkit";

export const replaceSlice = createSlice({
    name: "replace",
    initialState: {
        replaceIndex: -1,
        beforeImage: null,
        afterImage: null,
        replaceMode: false,
    },
    reducers: {
        setImages: (state, action) => {
            state.beforeImage = action.payload.beforeImage
            state.afterImage = action.payload.afterImage
        },
        setReplaceIndex: (state, action) => {
            state.replaceIndex = action.payload
            state.beforeImage = null
            state.afterImage = null
        },
        setReplaceMode: (state, action) => {
            state.replaceMode = action.payload
        },
    },
});

export const {
    setImages,
    setReplaceIndex,
    setReplaceMode,
} = replaceSlice.actions;

export default replaceSlice.reducer;
