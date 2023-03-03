import { configureStore } from '@reduxjs/toolkit';
import { habitDocumentsSlice } from './habit-documents';
import { habitsSlice } from './habits';
import { habitOptionsSlice } from './habit-options';

export const store = configureStore({
  reducer: {
    habitDocuments: habitDocumentsSlice.reducer,
    habits: habitsSlice.reducer,
    habitOptions: habitOptionsSlice.reducer,
  },
});
