import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { CHART_REQUEST, CHART_RESPONSE } from "./events";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { updateChart } from "../stock";
import { eventChannel } from "@redux-saga/core";

type chartRequestType = {
  room: string;
  week: number;
  day: number;
};

export type dayChartType = {
  [key: string]: number[];
};

export const emitChartRequest = createAction(
  CHART_REQUEST,
  (payload: chartRequestType) => ({ payload })
);

export function* emitChartRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitChartRequest.type);
    yield apply(socket, socket.emit, [CHART_REQUEST, payload]);
  }
}

const createChartChannel = (socket: Socket) => {
  return eventChannel<dayChartType>((emit) => {
    socket.on(CHART_RESPONSE, (chart: dayChartType) => {
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
    let payload: dayChartType = yield take(channel);
    yield put(updateChart(payload));
  }
}
