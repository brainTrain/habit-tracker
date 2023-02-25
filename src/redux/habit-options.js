// libraries
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// utils
import { fetchHabitOptions } from '../firebase/firestore';
import { formatHabitOptions } from '../parsers/habit';

const HABIT_OPTIONS_NAME = 'habit-options';

export const fetchHabitOptionsRedux = createAsyncThunk(
  `${HABIT_OPTIONS_NAME}/fetchAll`,
  async (userID) => {
    const habitOptionsResponse = await fetchHabitOptions(userID);

    return habitOptionsResponse;
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
      const formattedHabitOptions = formatHabitOptions({
        habitOptionsResponse: action.payload,
      });

      state.entities = formattedHabitOptions;
    });
  },
});
