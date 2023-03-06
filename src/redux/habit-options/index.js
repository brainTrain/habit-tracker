// libraries
import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit';
// utils
import { fetchHabitOptions } from '../../firebase/firestore';
import { habitOptionsToList } from '../../parsers/habit';
// constants
import { HABIT_OPTION_EMPTY } from '../../firebase/models';
const HABIT_OPTIONS_NAME = 'habit-options';

// selectors
export const selectHabitOptionsEntities = (state) =>
  state.habitOptions.entities;
export const selectHabitOptionIDs = (state) => state.habitOptions.ids;

export const selectHabitOptionsByID = createSelector(
  selectHabitOptionsEntities,
  (state, habitID) => habitID,
  (habitOptions, habitID) => {
    return habitOptions[habitID] || HABIT_OPTION_EMPTY;
  },
);

export const fetchHabitOptionsRedux = createAsyncThunk(
  `${HABIT_OPTIONS_NAME}/fetch:all`,
  async (userID) => {
    const habitOptionsResponse = await fetchHabitOptions(userID);
    const newHabitOptions = habitOptionsToList(habitOptionsResponse);

    return newHabitOptions;
  },
);

const habitOptionsAdapter = createEntityAdapter({
  selectId: ({ habitID }) => habitID,
});

export const habitOptionsSlice = createSlice({
  name: HABIT_OPTIONS_NAME,
  initialState: habitOptionsAdapter.getInitialState(),
  reducers: {
    habitOptionsAddOne: habitOptionsAdapter.addOne,
    habitOptionsAddMany: habitOptionsAdapter.addMany,
    habitOptionsRemoveOne: habitOptionsAdapter.removeOne,
    habitOptionsUpdateOne: habitOptionsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchHabitOptionsRedux.fulfilled, (state, action) => {
      habitOptionsAdapter.addMany(state, action.payload);
    });
  },
});
// adapter actions
export const {
  habitOptionsAddOne,
  habitOptionsAddMany,
  habitOptionsUpdateOne,
  habitOptionsRemoveOne,
} = habitOptionsSlice.actions;
// adapter selectors
export const { selectById: selectHabitOptionsById } =
  habitOptionsAdapter.getSelectors((state) => state.habitOptions);
