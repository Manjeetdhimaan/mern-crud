import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    showHttpProgressBar: false,
    modelIsOpen: false
};

const commonUISlice = createSlice({
    name: 'ui-common',
    initialState,
    reducers: {
        toggleProgressBar(state, action) {
            state.showHttpProgressBar = action.payload;
        },

        setModelIsOpen(state, action) {
            state.modelIsOpen = action.payload;
          },
      
    },
});

export const commonUIActions = commonUISlice.actions;

export default commonUISlice;
