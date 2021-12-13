import { eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { Socket } from "socket.io-client";
import { updateErrorMessage } from "../user";
import { ERROR } from "./events";

type ErrorInterface = {
  message: string;
};

const receiveErrorChannel = (socket: Socket) => {
  return eventChannel<ErrorInterface>((emit) => {
    socket.on(ERROR, (payload: ErrorInterface) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receiveErrorSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveErrorChannel> = yield call(
    receiveErrorChannel,
    socket
  );

  while (true) {
    const payload: ErrorInterface = yield take(channel);
    yield put(updateErrorMessage(payload.message));
  }
}
