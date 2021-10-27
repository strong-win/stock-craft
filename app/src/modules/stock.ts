import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    initializeCharts(state, action: PayloadAction<CorpState[]>) {
      state.corps = action.payload.map((corp) => ({
        ...corp,
        totalChart: [],
        todayChart: [],
      }));
    },
  },
});

export const { updateDayChart, initializeCharts } = stockSlice.actions;

export default stockSlice.reducer;
