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

export const emitGameRequest = createAction(
  GAME_START_REQUEST,
  (payload: { room: string }) => ({ payload })
);

export function* emitGameRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitGameRequest.type);
    yield apply(socket, socket.emit, [GAME_START_REQUEST, payload]);
  }
}

const createGameResponseChannel = (socket: Socket) => {
  return eventChannel<startResponseType>((emit) => {
    socket.on(GAME_START_RESPONSE, (payload: startResponseType) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receieveGameResponse(socket: Socket) {
  const channel: ReturnType<typeof createGameResponseChannel> = yield call(
    createGameResponseChannel,
    socket
  );
  while (true) {
    const payload: startResponseType = yield take(channel);

    yield put(initializeCharts(payload.corps));
    yield put(initializeAssets(payload.corps));
    yield put(updateStarted(true));

    // To do
    // update player asset and cash
    // update trade container with lock
  }
}
