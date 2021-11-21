import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CorpResponse } from "./sockets/join";

export type CorpState = {
  corpId: string;
  corpName: string;
};

export type ChartState = CorpState & {
  totalChart: number[];
  todayChart: number[];
};

export type StockState = {
  corps: ChartState[];
};

export type DayChartState = {
  [key: string]: number[];
};

const initialState: StockState = {
  corps: [
    // { corpId: "gyu", corpName: "규희전자", totalChart: [], todayChart: [] },
    // { corpId: "kang", corpName: "창구물산", totalChart: [], todayChart: [] },
    // { corpId: "han", corpName: "상일제약", totalChart: [], todayChart: [] },
    // { corpId: "lee", corpName: "호준건설", totalChart: [], todayChart: [] },
  ],
};
export const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    updateDayChart(state, action: PayloadAction<DayChartState>) {
      state.corps.forEach((corp) => {
        corp.totalChart = [...corp.totalChart, ...corp.todayChart];
      });
      for (const corpId in action.payload) {
        state.corps.map((corp) =>
          corp.corpId === corpId
            ? (corp.todayChart = action.payload[corpId])
            : null
        );
      }
    },
    initChart(state, action: PayloadAction<CorpResponse[]>) {
      state.corps = action.payload.map((corp: CorpResponse) => ({
        ...corp,
        todayChart: [],
      }));
    },
  },
});

export const { updateDayChart, initChart } = stockSlice.actions;

export default stockSlice.reducer;
