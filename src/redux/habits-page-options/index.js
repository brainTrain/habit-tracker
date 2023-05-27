// libraries
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// utils
// import { fetchHabitPageOptions } from '../../firebase/firestore';
// constants
const HABIT_PAGE_OPTIONS_NAME = 'habit-page-options';
export const SORT_TYPE = {
  DATE: 'DATE',
  LATEST: 'LATEST',
  CUSTOM: 'CUSTOM',
};

export const SORT_TYPE_LABEL = {
  [SORT_TYPE.DATE]: 'Date',
  [SORT_TYPE.LATEST]: 'Latest document created',
  [SORT_TYPE.CUSTOM]: 'Custom',
};

// selectors
export const selectHabitPageOptionsEntities = (state) =>
  state.habitPageOptions.entities;

export const fetchHabitPageOptions = createAsyncThunk(
  `${HABIT_PAGE_OPTIONS_NAME}/fetch:all`,
  async (userID) => {
    const response = await fetchHabitPageOptions(userID);

    return response;
  },
);

export const habitPageOptionsSlice = createSlice({
  name: HABIT_PAGE_OPTIONS_NAME,
  initialState: {
    sort: {
      type: '',
      order: [],
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHabitPageOptions.fulfilled, (state, action) => {});
  },
});
