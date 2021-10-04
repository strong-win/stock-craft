import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type timeType = {
  week: number;
  day: number;
  tick: number;
};

const initialState: timeType = {
  week: 1,
  day: 0,
  tick: 1, // for test
};

export const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    updateTime(state, action: PayloadAction<{ week: number; day: number }>) {
      state.week = action.payload.week;
      state.day = action.payload.day;
    },
    updateTick(state, action: PayloadAction<{ tick: number }>) {
      state.tick = action.payload.tick;
    },
  },
});

export const { updateTime, updateTick } = timeSlice.actions;

export default timeSlice.reducer;
