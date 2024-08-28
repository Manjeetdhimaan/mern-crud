import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    showHttpProgressBar: false
};

const commonUISlice = createSlice({
    name: 'ui-common',
    initialState,
    reducers: {
        toggleProgressBar(state, action) {
            state.showHttpProgressBar = action.payload;
        },
    },
});

export const { toggleProgressBar } = commonUISlice.actions;

export default commonUISlice;
