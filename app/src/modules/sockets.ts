import { Socket } from "socket.io-client";
import { eventChannel } from "redux-saga";
import { call, put, take, all, apply } from "redux-saga/effects";
import { MessageType, PlayerType, updateMessage, updatePlayers } from "./user";
import connectSocket from "../configs/socket";
import { createAction } from "@reduxjs/toolkit";

const CHAT_SERVER_MESSAGE = "chat/server_message";
const CHAT_CLIENT_MESSAGE = "chat/client_message";
const CHAT_ROOM = "chat/room";
const CHAT_JOIN = "chat/join";

const createMessageChannel = (socket: Socket) => {
  return eventChannel<MessageType>((emit) => {
    socket.on(CHAT_SERVER_MESSAGE, (message: MessageType) => {
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
    const payload: MessageType = yield take(channel);
    yield put(updateMessage(payload));
  }
}

const createPlayersChannel = (socket: Socket) => {
  return eventChannel<PlayerType[]>((emit) => {
    socket.on(CHAT_ROOM, (players: PlayerType[]) => {
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
    const payload: PlayerType[] = yield take(channel);
    yield put(updatePlayers(payload));
  }
}

export const join = createAction(
  CHAT_JOIN,
  (payload: { name: string; room: string }) => ({ payload })
);

export function* joinSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(join.type);
    yield apply(socket, socket.emit, [CHAT_JOIN, payload]);
  }
}

export const emitMessage = createAction(
  CHAT_CLIENT_MESSAGE,
  (payload: string) => ({ payload })
);

export function* emitMessageSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitMessage.type);
    yield apply(socket, socket.emit, [CHAT_CLIENT_MESSAGE, payload]);
  }
}

export function* handleIO() {
  const socket: Socket = yield call(connectSocket);

  yield all([
    receieveMessage(socket),
    receivePlayers(socket),
    joinSaga(socket),
    emitMessageSaga(socket),
  ]);
}
