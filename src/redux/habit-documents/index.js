// libraries
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit';
// utils
import { fetchHabits } from '../../firebase/firestore';
import { getHabitData } from '../../parsers/habit';
// constants
const HABIT_DOCUMENTS_NAME = 'habit-documents';

// selectors
export const selectHabitDocumentEntities = (state) =>
  state.habitDocuments.entities;
export const selectHabitDocumentIDs = (state) => state.habitDocuments.ids;

export const fetchHabitDocuments = createAsyncThunk(
  `${HABIT_DOCUMENTS_NAME}/fetch:all`,
  async (userID) => {
    const habitsResponse = await fetchHabits(userID);
    const habitDocuments = [];

    habitsResponse.forEach((doc) => {
      habitDocuments.push(getHabitData(doc));
    });

    return habitDocuments;
  },
);

const habitDocumentsAdapter = createEntityAdapter();

export const habitDocumentsSlice = createSlice({
  name: HABIT_DOCUMENTS_NAME,
  initialState: habitDocumentsAdapter.getInitialState(),
  reducers: {
    habitDocumentsAddOne: habitDocumentsAdapter.addOne,
    habitDocumentsAddMany: habitDocumentsAdapter.addMany,
    habitDocumentsRemoveOne: habitDocumentsAdapter.removeOne,
  },
  extraReducers: {
    [fetchHabitDocuments.fulfilled]: (state, action) => {
      habitDocumentsAdapter.addMany(state, action.payload);
    },
  },
});
