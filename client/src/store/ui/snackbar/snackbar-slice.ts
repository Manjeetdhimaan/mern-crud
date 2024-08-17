// snackbarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SnackbarState = {
  message: string | null;
  type: 'success' | 'info' | 'warning' | 'error' | null;
  isOpen: boolean;
  duration: number;
};

const initialState: SnackbarState = {
  message: null,
  type: null,
  isOpen: false,
  duration: 3000,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar(state, action: PayloadAction<{ message: string; type: 'success' | 'info' | 'warning' | 'error'; duration?: number }>) {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.isOpen = true;
      state.duration = action.payload.duration || 5000;
    },
    closeSnackbar(state) {
      state.isOpen = false;
      state.message = null;
      state.type = null;
    },
  },
});

export const { showSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice;
