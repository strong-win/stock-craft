import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { channel } from "@redux-saga/core";
import { apply, put, take } from "@redux-saga/core/effects";

import { DayChartState, updateDayChart } from "../stock";
import { DAY_END, DAY_START } from "./events";

type DayEndRequest = {
  gameId: string;
  playerId: string;
  week: number;
  day: number;
  item: string[];
};

type DayStartRequest = {
  gameId: string;
  week: number;
  day: number;
};

type DayStartResponse = {
  dayChart: DayChartState;
};

export const sendDayEnd = createAction(DAY_END, (payload: DayEndRequest) => ({
  payload,
}));

export function* sendDayEndSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(DAY_END);
    yield apply(socket, socket.emit, [
      DAY_END,
      payload,
      (payload: DayStartRequest) => {
        sendDayStartChannel.put(payload);
      },
    ]);
  }
}

export const sendDayStart = createAction(
  DAY_START,
  (payload: DayStartRequest) => ({
    payload,
  })
);

export const receiveDayStartChannel = channel<DayStartResponse>();

export function* sendDayStartSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(DAY_START);
    yield apply(socket, socket.emit, [
      DAY_START,
      payload,
      ({ dayChart }) => {
        receiveDayStartChannel.put({ dayChart });
      },
    ]);
  }
}

export function* receiveDayStartSaga() {
  while (true) {
    const payload: DayStartResponse = yield take(receiveDayStartChannel);
    yield put(updateDayChart(payload.dayChart));
  }
}

// temporary channel for sending DayStart after receiving DayEnd
export const sendDayStartChannel = channel<DayStartRequest>();

export function* sendDayStartChannelSaga() {
  while (true) {
    const payload: DayStartRequest = yield take(sendDayStartChannel);
    yield put(sendDayStart(payload));
  }
}
