import { configureStore } from '@reduxjs/toolkit';

import messageSlice from './message/message-slice';
import snackbarSlice from './ui/snackbar/snackbar-slice';

const store = configureStore({
  reducer: { message: messageSlice.reducer, snackbar: snackbarSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;