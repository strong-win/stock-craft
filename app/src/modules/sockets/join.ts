import { AssetState, updateGameId } from "./../user";
import { channel, eventChannel } from "@redux-saga/core";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { CorpState, initializeCharts } from "../stock";
import {
  PlayerState,
  updateAssets,
  updatePlayerId,
  updatePlayers,
  updateStatus,
} from "../user";
import { JOIN_CONNECTED, JOIN_PLAY, JOIN_PLAYERS, JOIN_READY } from "./events";

export const sendJoinConnected = createAction(
  JOIN_CONNECTED,
  (payload: { name: string; room: string }) => ({ payload })
);

const receiveJoinConnectedChannel = channel<string>();

export function* sendJoinConnectedSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_CONNECTED);
    yield apply(socket, socket.emit, [
      JOIN_CONNECTED,
      payload,
      ({ playerId }) => {
        receiveJoinConnectedChannel.put(playerId);
      },
    ]);
  }
}

export function* receiveJoinConnectedSaga() {
  while (true) {
    const payload: string = yield take(receiveJoinConnectedChannel);
    yield put(updatePlayerId(payload));
    yield put(updateStatus("connected"));
  }
}

const receiveJoinPlayersChannel = (socket: Socket) => {
  return eventChannel<PlayerState[]>((emit) => {
    socket.on(JOIN_PLAYERS, (players: PlayerState[]) => {
      emit(players);
    });

    return () => {};
  });
};

export function* receiveJoinPlayersSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveJoinPlayersChannel> = yield call(
    receiveJoinPlayersChannel,
    socket
  );
  while (true) {
    const payload: PlayerState[] = yield take(channel);
    yield put(updatePlayers(payload));
  }
}

export const sendJoinReady = createAction(
  JOIN_READY,
  (payload: { playerId: string; room: string }) => ({ payload })
);

export function* sendJoinReadySaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_READY);
    yield apply(socket, socket.emit, [JOIN_READY, payload]);
    yield put(updateStatus("ready"));
  }
}

const receiveJoinPlayChannel = (socket: Socket) => {
  return eventChannel<CorpState[]>((emit) => {
    socket.on(JOIN_PLAY, (corps: CorpState[]) => {
      emit(corps);
    });

    return () => {};
  });
};

export function* receiveJoinPlaySaga(socket: Socket) {
  const channel: ReturnType<typeof receiveJoinPlayChannel> = yield call(
    receiveJoinPlayChannel,
    socket
  );
  while (true) {
    const payload: {
      gameId: string;
      corps: CorpState[];
      assets: AssetState[];
    } = yield take(channel);

    yield put(initializeCharts(payload.corps));
    yield put(updateAssets(payload.assets));
    yield put(updateGameId(payload.gameId));
    yield put(updateStatus("play"));
  }
}
