import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { GAME_START_REQUEST, GAME_START_RESPONSE } from "./events";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { eventChannel } from "@redux-saga/core";
import { initializeCharts } from "../stock";
import { initializeAssets, updateStarted } from "../user";

type startResponseType = {
  corps: { corpId: string; corpName: string }[];
};

export const gameStartRequest = createAction(
  GAME_START_REQUEST,
  (payload: { room: string }) => ({ payload })
);

export function* gameStartRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(GAME_START_REQUEST);
    yield apply(socket, socket.emit, [GAME_START_REQUEST, payload]);
  }
}

const createGameStartResponseChannel = (socket: Socket) => {
  return eventChannel<startResponseType>((emit) => {
    socket.on(GAME_START_RESPONSE, (payload: startResponseType) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* gameStartResponseSaga(socket: Socket) {
  const channel: ReturnType<typeof createGameStartResponseChannel> = yield call(
    createGameStartResponseChannel,
    socket
  );
  while (true) {
    const payload: startResponseType = yield take(channel);

    yield put(initializeCharts(payload.corps));
    yield put(initializeAssets(payload.corps));
    yield put(updateStarted(true));
  }
}
