import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { eventChannel } from "@redux-saga/core";
import { apply, call, put, take } from "@redux-saga/core/effects";

import { updateDayChart } from "../stock";

import { CHART_REQUEST, CHART_RESPONSE } from "./events";

type chartRequestType = {
  room: string;
  week: number;
  day: number;
};

export type dayChartType = {
  [key: string]: number[];
};

export const chartRequest = createAction(
  CHART_REQUEST,
  (payload: chartRequestType) => ({ payload })
);

export function* chartRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(CHART_REQUEST);
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

export function* chartResponseSaga(socket: Socket) {
  const channel: ReturnType<typeof createChartChannel> = yield call(
    createChartChannel,
    socket
  );
  while (true) {
    let payload: dayChartType = yield take(channel);
    yield put(updateDayChart(payload));
  }
}
