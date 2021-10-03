import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// stock state 는 모든 유저간 공유하는 state

export type timeType = {
  week: number;
  day: number;
  tick: number;
};

export type corpType = {
  ticker: string;
  corpName: string;
  price: number;
};

export type stockType = {
  week: number;
  day: number;
  tick: number;
  dayTicks: corpType[][];

  // selected coporation
  selectedCorpInd: number;
  selectedCorpStock: corpType;
};

const initialState: stockType = {
  week: 1,
  day: 1,
  tick: 1,
  dayTicks: [],

  // selected coporation
  selectedCorpInd: 0,
  selectedCorpStock: { ticker: "gyu", corpName: "규희전자", price: 100 },
};

export const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    updateChart(
      state,
      action: PayloadAction<{
        week: number;
        day: number;
        dayTicks: corpType[][];
      }>
    ) {
      state.week = action.payload.week;
      state.day = action.payload.day;
      state.dayTicks = action.payload.dayTicks;
    },
  },
});

export const { updateChart } = stockSlice.actions;

export default stockSlice.reducer;
