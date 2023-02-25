// libraries
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// utils
import { fetchHabits } from '../firebase/firestore';
import { formatHabitGroups } from '../parsers/habit';
const HABITS_NAME = 'habits';

export const fetchHabitsRedux = createAsyncThunk(
  `${HABITS_NAME}/fetchAll`,
  async (userID, formattedHabitOptions) => {
    const habitsResponse = await fetchHabits(userID);

    return { habitsResponse, formattedHabitOptions };
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
      const formattedHabits = formatHabitGroups({
        habitsResponse: action.payload.habitsResponse,
        habitOptions: action.payload.formattedHabitOptions,
      });

      state.entities = formattedHabits;
    });
  },
});
