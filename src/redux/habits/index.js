// libraries
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
// utils
import { fetchHabits } from '../../firebase/firestore';
import { formatHabitGroups } from '../../parsers/habit';
// constants
const HABITS_NAME = 'habits';

// selectors
export const selectHabitEntities = (state) => state.habits.entities;
export const selectHabitIDs = (state) => state.habits.ids;
/*
export const selectFavForecasts = createSelector(
  selectForecasts,
  favIds,
  (forecasts, ids) => {
    return forecasts.filter((forecast) => ids.includes(forecast.id));
  },
);
*/

export const fetchHabitsRedux = createAsyncThunk(
  `${HABITS_NAME}/fetch:all`,
  async (userID, habitOptions) => {
    const habitsResponse = await fetchHabits(userID);

    const formattedHabits = formatHabitGroups({
      habitsResponse,
      habitOptions,
    });

    return formattedHabits;
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
    });
  },
});
