import { configureStore } from '@reduxjs/toolkit';
import { habitsSlice } from './habits';
import { habitOptionsSlice } from './habit-options';

export const store = configureStore({
  reducer: {
    habits: habitsSlice.reducer,
    habitOptions: habitOptionsSlice.reducer,
  },
});
