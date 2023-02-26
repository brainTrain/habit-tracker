// libraries
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
// utils
import { fetchHabitOptions } from '../../firebase/firestore';
import { habitOptionsToEntities } from '../../parsers/habit';
import { HABIT_OPTION_EMPTY } from '../../firebase/models';
// constants
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
    const habitOptions = await fetchHabitOptions(userID);
    const habitOptionsEntities = habitOptionsToEntities(habitOptions);

    return habitOptionsEntities;
  },
);

export const habitOptionsSlice = createSlice({
  name: HABIT_OPTIONS_NAME,
  initialState: {
    ids: [],
    entities: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHabitOptionsRedux.fulfilled, (state, action) => {
      state.entities = action.payload;
      state.ids = Object.keys(action.payload);
    });
  },
});
