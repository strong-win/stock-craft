import {} from "./../user";
import { eventChannel } from "@redux-saga/core";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { DayChartState, updateDayChart } from "../stock";
import { TimeState, updateTime } from "../time";
import {
  AllPlayerScore,
  PlayerScore,
  updateItemsBytime,
  updateScore,
  updateAllScores,
} from "../user";
import {
  GAME_DAY_SCORE,
  GAME_TIME_REQUEST,
  GAME_TIME_RESPONSE,
  GAME_WEEK_SCORE,
} from "./events";

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
    if (payload.time.tick === 0) yield put(updateItemsBytime());
  }
}

const receiveDayScoreChannel = (socket: Socket) => {
  return eventChannel<PlayerScore>((emit) => {
    socket.on(GAME_DAY_SCORE, (payload: PlayerScore) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receiveDayScoreSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveDayScoreChannel> = yield call(
    receiveDayScoreChannel,
    socket
  );

  while (true) {
    const { basic, bonus }: PlayerScore = yield take(channel);
    yield put(updateScore({ basic, bonus }));
  }
}

const receiveWeekScoreChannel = (socket: Socket) => {
  return eventChannel<AllPlayerScore[]>((emit) => {
    socket.on(GAME_WEEK_SCORE, (payload: AllPlayerScore[]) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receiveWeekScoreSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveWeekScoreChannel> = yield call(
    receiveWeekScoreChannel,
    socket
  );

  while (true) {
    const payload: AllPlayerScore[] = yield take(channel);
    yield put(updateAllScores(payload));
  }
}
