import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { dayChartType } from "./sockets/chart";

export type chartType = {
  corpId: string;
  corpName: string;
  totalChart: number[];
  todayChart: number[];
};

export type stockType = {
  corps: chartType[];
};

const initialState: stockType = {
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
    updateDayChart(state, action: PayloadAction<dayChartType>) {
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
    updateTotalChart(state) {},
    initializeCharts(
      state,
      action: PayloadAction<{ corpId: string; corpName: string }[]>
    ) {
      for (const corp of action.payload) {
        const { corpId, corpName } = corp;
        state.corps.push({ corpId, corpName, totalChart: [], todayChart: [] });
      }
    },
  },
});

export const { updateDayChart, initializeCharts } = stockSlice.actions;

export default stockSlice.reducer;
