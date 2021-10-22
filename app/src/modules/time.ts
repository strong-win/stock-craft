import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TimeState = {
  week: number;
  day: number;
  tick: number;
};

const initialState: TimeState = {
  week: 1,
  day: 0, // 0: weekend, 1~5: Mon~Fri
  tick: 1, // 1~4
};

export const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    updateDate(
      state: TimeState,
      action: PayloadAction<{ week: number; day: number }>
    ) {
      state.week = action.payload.week;
      state.day = action.payload.day;
    },
    updateTime(
      state: TimeState,
      action: PayloadAction<{ week: number; day: number; tick: number }>
    ) {
      state.week = action.payload.week;
      state.day = action.payload.day;
      state.tick = action.payload.tick;
    },
  },
});

export const { updateDate, updateTime } = timeSlice.actions;

export default timeSlice.reducer;
