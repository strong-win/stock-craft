import { Socket } from "socket.io-client";
import { eventChannel } from "redux-saga";
import { createAction } from "@reduxjs/toolkit";
import { call, put, take, apply } from "@redux-saga/core/effects";

import { messageType, playerType, updateMessage, updatePlayers } from "../user";
import {
  CHATTING_CLIENT_MESSAGE,
  CHATTING_JOIN,
  CHATTING_ROOM,
  CHATTING_SERVER_MESSAGE,
} from "./events";

const createMessageChannel = (socket: Socket) => {
  return eventChannel<messageType>((emit) => {
    socket.on(CHATTING_SERVER_MESSAGE, (message: messageType) => {
      emit(message);
    });

    return () => {};
  });
};

export function* receieveMessage(socket: Socket) {
  const channel: ReturnType<typeof createMessageChannel> = yield call(
    createMessageChannel,
    socket
  );
  while (true) {
    const payload: messageType = yield take(channel);
    yield put(updateMessage(payload));
  }
}

const createPlayersChannel = (socket: Socket) => {
  return eventChannel<playerType[]>((emit) => {
    socket.on(CHATTING_ROOM, (players: playerType[]) => {
      emit(players);
    });

    return () => {};
  });
};

export function* receivePlayers(socket: Socket) {
  const channel: ReturnType<typeof createPlayersChannel> = yield call(
    createPlayersChannel,
    socket
  );
  while (true) {
    const payload: playerType[] = yield take(channel);
    yield put(updatePlayers(payload));
  }
}

export const emitJoin = createAction(
  CHATTING_JOIN,
  (payload: { name: string; room: string }) => ({ payload })
);

export function* emitJoinSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitJoin.type);
    yield apply(socket, socket.emit, [CHATTING_JOIN, payload]);
  }
}

export const emitMessage = createAction(
  CHATTING_CLIENT_MESSAGE,
  (payload: string) => ({ payload })
);

export function* emitMessageSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitMessage.type);
    yield apply(socket, socket.emit, [CHATTING_CLIENT_MESSAGE, payload]);
  }
}
