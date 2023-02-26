// libraries
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
// redux
import { selectHabitOptionsEntities } from '../habit-options';
// utils
import { fetchHabits } from '../../firebase/firestore';
import { formatHabitGroups, habitsToEntities } from '../../parsers/habit';
// constants
const HABITS_NAME = 'habits';

// selectors
export const selectHabitEntities = (state) => state.habits.entities;
export const selectHabitIDs = (state) => state.habits.ids;

export const selectFormattedHabits = createSelector(
  selectHabitEntities,
  selectHabitOptionsEntities,
  (habitEntities, habitOptionsEntities) => {
    return (
      formatHabitGroups({
        habitEntities,
        habitOptionsEntities,
      }) || {}
    );
  },
);

export const fetchHabitsRedux = createAsyncThunk(
  `${HABITS_NAME}/fetch:all`,
  async (userID, habitOptions) => {
    const habitsResponse = await fetchHabits(userID);
    const habitEntities = habitsToEntities(habitsResponse);

    return habitEntities;
  },
);

export const habitsSlice = createSlice({
  name: HABITS_NAME,
  initialState: {
    ids: [],
    entities: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHabitsRedux.fulfilled, (state, action) => {
      state.entities = action.payload;
      state.ids = Object.keys(action.payload);
    });
  },
});
