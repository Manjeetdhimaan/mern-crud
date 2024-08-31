import { configureStore } from '@reduxjs/toolkit';

import messageSlice from './message/message-slice';
import snackbarSlice from './ui/snackbar/snackbar-slice';
import userSlice from './user/user-slice';
import commonUISlice from './ui/common/common-reducer';

const store = configureStore({
  reducer: { message: messageSlice.reducer, snackbar: snackbarSlice.reducer, user: userSlice.reducer, commonUI: commonUISlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;