import { eventChannel } from "@redux-saga/core";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { DayChartState, updateDayChart } from "../stock";
import { TimeState, updateTime } from "../time";
import { PlayerScore, updateScores } from "../user";
import { GAME_SCORE, GAME_TIME_REQUEST, GAME_TIME_RESPONSE } from "./events";

export const sendGameTimeRequest = createAction(
  GAME_TIME_REQUEST,
  (payload: { gameId: string }) => ({ payload })
);

export function* sendGameTimeRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(GAME_TIME_REQUEST);
    yield apply(socket, socket.emit, [GAME_TIME_REQUEST, payload]);
  }
}

const receiveGameTimeResponseChannel = (socket: Socket) => {
  return eventChannel<{ gameId: string }>((emit) => {
    socket.on(GAME_TIME_RESPONSE, (payload: { gameId: string }) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receiveGameTimeResponseSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveGameTimeResponseChannel> = yield call(
    receiveGameTimeResponseChannel,
    socket
  );

  while (true) {
    const payload: { time: TimeState; dayChart: DayChartState } = yield take(
      channel
    );
    yield put(updateTime(payload.time));
    if (payload.dayChart) yield put(updateDayChart(payload.dayChart));
  }
}

const receiveGameScoreChannel = (socket: Socket) => {
  return eventChannel<PlayerScore[]>((emit) => {
    socket.on(GAME_SCORE, (payload: PlayerScore[]) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receiveGameScoreSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveGameScoreChannel> = yield call(
    receiveGameScoreChannel,
    socket
  );

  while (true) {
    const payload: PlayerScore[] = yield take(channel);
    yield put(updateScores(payload));
  }
}
