import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { CHART_REQUEST, CHART_RESPONSE } from "./events";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { corpType, updateChart } from "../stock";
import { eventChannel } from "@redux-saga/core";

type chartRequestType = {
  room: string;
  week: number;
  day: number;
};

type chartResponseType = {
  week: number;
  day: number;
  dayTicks: corpType[][];
};

export const emitChart = createAction(
  CHART_REQUEST,
  (payload: chartRequestType) => ({ payload })
);

export function* emitChartSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitChart.type);
    yield apply(socket, socket.emit, [CHART_REQUEST, payload]);
  }
}

const createChartChannel = (socket: Socket) => {
  return eventChannel<chartResponseType>((emit) => {
    socket.on(CHART_RESPONSE, (chart: chartResponseType) => {
      emit(chart);
    });

    return () => {};
  });
};

export function* receiveChart(socket: Socket) {
  const channel: ReturnType<typeof createChartChannel> = yield call(
    createChartChannel,
    socket
  );
  while (true) {
    const payload: chartResponseType = yield take(channel);
    yield put(updateChart(payload));
  }
}
