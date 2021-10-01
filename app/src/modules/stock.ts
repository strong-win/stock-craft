import { createSlice } from "@reduxjs/toolkit";

// stock state 는 모든 유저간 공유하는 state

export type corpType = {
  corpName: string;
  price: number;
};

export type stockType = {
  week: number;
  day: number;
  tick: number;
  corps: corpType[];

  // selected coporation
  corpInd: number;
  corpStock: corpType;
};

const initialState: stockType = {
  week: 0,
  day: 0,
  tick: 0,
  corps: [],

  // selected coporation
  corpInd: 0,
  corpStock: { corpName: "", price: 0 },
};

export const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {},
});

export default stockSlice.reducer;
