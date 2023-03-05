// libraries
import {
  createAction,
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit';
// import { selectHabitDocumentEntities } from '../habit-documents';
// redux
import { selectHabitDocumentEntities } from '../habit-documents';
import { selectHabitOptionsEntities } from '../habit-options';
// utils
import { fetchHabits } from '../../firebase/firestore';
import {
  formatHabitGroups,
  habitsToEntities,
  habitsEntityDocumentsToHabits,
} from '../../parsers/habit';
// constants
const HABITS_NAME = 'habits';

// selectors
export const selectHabitEntities = (state) => state.habits.entities;
export const selectHabitIDs = (state) => state.habits.ids;

export const selectFormattedHabits = createSelector(
  selectHabitEntities,
  selectHabitDocumentEntities,
  selectHabitOptionsEntities,
  (habitEntities, habitDocumentEntities, habitOptionsEntities) => {
    return formatHabitGroups({
      habitEntities,
      habitDocumentEntities,
      habitOptionsEntities,
    });
  },
);

export const selectFormattedHabitByID = createSelector(
  selectFormattedHabits,
  (state, habitID) => habitID,
  (formattedHabits, habitID) => {
    // TODO: might want to use an empty object as a fallback here
    return formattedHabits[habitID] || {};
  },
);

export const createHabits = createAction(
  `${HABITS_NAME}/set:all`,
  (habitDocuments) => {
    const normalizedHabitEntities =
      habitsEntityDocumentsToHabits(habitDocuments);

    return { payload: normalizedHabitEntities };
  },
);

export const fetchHabitsRedux = createAsyncThunk(
  `${HABITS_NAME}/fetch:all`,
  async (userID) => {
    const habitsResponse = await fetchHabits(userID);
    const habitEntities = habitsToEntities(habitsResponse);

    return habitEntities;
  },
);

const habitsAdapter = createEntityAdapter();

export const habitsSlice = createSlice({
  name: HABITS_NAME,
  initialState: habitsAdapter.getInitialState(),
  reducers: {
    habitAddOne: habitsAdapter.addOne,
    habitAddMany: habitsAdapter.addMany,
    habitUpdateOne: habitsAdapter.updateOne,
    habitRemoveOne: habitsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(createHabits, (state, action) => {
      habitsAdapter.addMany(state, action.payload);
    });
  },
});
// adapter actions
export const { habitAddOne, habitAddMany, habitUpdateOne, habitRemoveOne } =
  habitsSlice.actions;
// adapter selectors
export const { selectById: selectHabitById } = habitsAdapter.getSelectors(
  (state) => state.habits,
);
