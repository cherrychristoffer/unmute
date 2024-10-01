import { createSlice } from "@reduxjs/toolkit";

export const replaceSlice = createSlice({
    name: "replace",
    initialState: {
        replaceIndex: -1,
        replaceMode: false,
    },
    reducers: {
        setReplaceIndex: (state, action) => {
            state.replaceIndex = action.payload
        },
        setReplaceMode: (state, action) => {
            state.replaceMode = action.payload
        },
    },
});

export const {
    setReplaceIndex,
    setReplaceMode,
} = replaceSlice.actions;

export default replaceSlice.reducer;
