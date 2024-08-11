import { configureStore } from '@reduxjs/toolkit';

import messageSlice from './message-slice';

const store = configureStore({
  reducer: { message: messageSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;