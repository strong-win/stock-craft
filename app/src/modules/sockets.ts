import { Socket } from "socket.io-client";
import { eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { MessageType, PlayerType, updateMessage, updatePlayers } from "./user";

const CHAT_SERVER_MESSAGE = "chat/server_message";
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

export function* chattingSaga(socket: Socket) {
  socket.emit(CHAT_JOIN, { name: "create", room: "channel" });

  const channel: ReturnType<typeof createMessageChannel> = yield call(
    createMessageChannel,
    socket
  );
  while (true) {
    const payload: MessageType = yield take(channel);
    yield put(updateMessage(payload));
  }
}

const createRoomChannel = (socket: Socket) => {
  return eventChannel<PlayerType[]>((emit) => {
    socket.on(CHAT_ROOM, (players: PlayerType[]) => {
      emit(players);
    });

    return () => {};
  });
};

export function* userSaga(socket: Socket) {
  const channel: ReturnType<typeof createRoomChannel> = yield call(
    createRoomChannel,
    socket
  );
  while (true) {
    const payload: PlayerType[] = yield take(channel);
    yield put(updatePlayers(payload));
  }
}
