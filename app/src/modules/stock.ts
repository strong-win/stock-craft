import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dayChartType } from "./sockets/chart";

export type chartType = {
  corpId: string;
  corpName: string;
  totalChart: number[];
  todayChart: number[];
};

export type stockType = {
  charts: chartType[];
};

const initialState: stockType = {
  charts: [
    { corpId: "gyu", corpName: "규희전자", totalChart: [], todayChart: [] },
    { corpId: "kang", corpName: "창구물산", totalChart: [], todayChart: [] },
    { corpId: "han", corpName: "상일제약", totalChart: [], todayChart: [] },
    { corpId: "lee", corpName: "호준건설", totalChart: [], todayChart: [] },
  ], // for test
};
export const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    updateChart(state, action: PayloadAction<dayChartType>) {
      for (const corpId in action.payload) {
        state.charts.map((chart, index) =>
          chart.corpId === corpId
            ? (chart.todayChart = action.payload[corpId])
            : null
        );
      }
    },
  },
});

export const { updateChart } = stockSlice.actions;

export default stockSlice.reducer;
