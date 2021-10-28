import { Socket } from "socket.io-client";
import { eventChannel } from "redux-saga";
import { createAction } from "@reduxjs/toolkit";
import { call, put, take, apply } from "@redux-saga/core/effects";

import { MessageState, updateMessage } from "../user";

import { CHATTING_CLIENT_MESSAGE, CHATTING_SERVER_MESSAGE } from "./events";

export const sendChatting = createAction(
  CHATTING_CLIENT_MESSAGE,
  (payload: { playerId: string; message: string }) => ({ payload })
);

export function* sendChattingSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(CHATTING_CLIENT_MESSAGE);
    yield apply(socket, socket.emit, [CHATTING_CLIENT_MESSAGE, payload]);
  }
}

const receiveChattingChannel = (socket: Socket) => {
  return eventChannel<MessageState>((emit) => {
    socket.on(CHATTING_SERVER_MESSAGE, (message: MessageState) => {
      emit(message);
    });

    return () => {};
  });
};

export function* receiveChattingSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveChattingChannel> = yield call(
    receiveChattingChannel,
    socket
  );
  while (true) {
    const payload: MessageState = yield take(channel);
    yield put(updateMessage(payload));
  }
}
